import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const tools = [
  {
    type: "function",
    function: {
      name: "get_books",
      description: "Search or list books from the library database. Can filter by category or search term.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Book category to filter by, e.g. CSE, ECE, EEE, Mechanical, Civil, Stories, 'Science & Humanities', 'SSC Book Bank'" },
          search: { type: "string", description: "Search term to match against title, author, or ISBN" },
          limit: { type: "number", description: "Max number of books to return (default 10)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_book_details",
      description: "Get detailed information about a specific book by title or partial title match.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The book title or partial title to look up" },
        },
        required: ["title"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_book_links",
      description: "Generate shopping links (Amazon, Flipkart) for a book by title and author.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Book title" },
          author: { type: "string", description: "Book author" },
        },
        required: ["title"],
      },
    },
  },
];

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  const sb = getSupabaseAdmin();

  if (name === "get_books") {
    let query = sb.from("books").select("title, author, category, available_copies, total_copies, year, edition, publisher, isbn").order("title").limit((args.limit as number) || 10);
    if (args.category) query = query.eq("category", args.category as string);
    if (args.search) query = query.or(`title.ilike.%${args.search}%,author.ilike.%${args.search}%,isbn.ilike.%${args.search}%`);
    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    if (!data?.length) return JSON.stringify({ message: "No books found matching your criteria." });
    return JSON.stringify(data);
  }

  if (name === "get_book_details") {
    const { data, error } = await sb.from("books").select("*").ilike("title", `%${args.title}%`).limit(1).maybeSingle();
    if (error) return JSON.stringify({ error: error.message });
    if (!data) return JSON.stringify({ message: `No book found matching "${args.title}".` });
    return JSON.stringify(data);
  }

  if (name === "get_book_links") {
    const q = encodeURIComponent(`${args.title} ${args.author || ""}`);
    return JSON.stringify({
      amazon: `https://www.amazon.in/s?k=${q}`,
      flipkart: `https://www.flipkart.com/search?q=${q}`,
    });
  }

  return JSON.stringify({ error: "Unknown tool" });
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemMessage = {
      role: "system",
      content: `You are LibraAI, an intelligent library assistant for a college library management system (RGUKT Ongole). You help students and faculty with:

1. **Book Search & Details** – Search the library database, show availability, details.
2. **Book Recommendations** – Suggest books based on interests, courses, or reading history.
3. **Shopping Links** – Generate Amazon/Flipkart links for books using get_book_links.
4. **Library Information** – Borrowing policies, due dates, penalties, hours, procedures.
5. **Research Help** – Guide users on finding academic resources.
6. **Creative Content** – Write summaries, stories, explanations on any topic.
7. **General Q&A** – Answer any question helpfully.

IMPORTANT RULES:
- When users ask to show/find/search books, ALWAYS use the get_books tool.
- When users ask about a specific book, use get_book_details.
- When users want to buy/purchase a book, use get_book_links.
- Format book results in a clear table or list with title, author, availability.
- Keep responses friendly, concise, and use markdown formatting.
- Available categories: CSE, ECE, EEE, Mechanical, Civil, Science & Humanities, SSC Book Bank, Stories.`,
    };

    let conversationMessages = [systemMessage, ...messages];

    // First AI call (may request tool calls)
    let response = await callAI(LOVABLE_API_KEY, conversationMessages, true);

    if (!response.ok) {
      return handleAIError(response);
    }

    // Read the full response to check for tool calls
    const aiResult = await response.json();
    const choice = aiResult.choices?.[0];

    if (choice?.finish_reason === "tool_calls" && choice?.message?.tool_calls?.length) {
      // Handle tool calls
      conversationMessages.push(choice.message);

      for (const tc of choice.message.tool_calls) {
        const args = JSON.parse(tc.function.arguments);
        const result = await handleToolCall(tc.function.name, args);
        conversationMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }

      // Second AI call with tool results, streaming
      response = await callAI(LOVABLE_API_KEY, conversationMessages, false, true);
      if (!response.ok) return handleAIError(response);

      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tool calls — stream directly. Re-call with streaming.
    response = await callAI(LOVABLE_API_KEY, conversationMessages, true, true);
    if (!response.ok) return handleAIError(response);

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function callAI(apiKey: string, messages: unknown[], withTools: boolean, stream = false) {
  const body: Record<string, unknown> = {
    model: "google/gemini-3-flash-preview",
    messages,
    stream,
  };
  if (withTools) body.tools = tools;

  return fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function handleAIError(response: Response) {
  if (response.status === 429) {
    return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (response.status === 402) {
    return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ error: "AI service unavailable" }), {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

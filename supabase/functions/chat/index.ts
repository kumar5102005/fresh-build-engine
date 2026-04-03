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

const SYSTEM_PROMPT = `You are LibraAI, an intelligent library assistant for a college library management system (RGUKT Ongole). You help students and faculty with:

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
- Available categories: CSE, ECE, EEE, Mechanical, Civil, Science & Humanities, SSC Book Bank, Stories.`;

// Convert OpenAI-style messages to Gemini format
function toGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

// Convert tools to Gemini format
function toGeminiTools() {
  return [{
    function_declarations: tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  }];
}

// Fallback: use Lovable AI gateway (OpenAI-compatible)
async function callLovableGateway(messages: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  const openaiTools = tools.map((t) => ({
    type: "function" as const,
    function: t.function,
  }));

  const apiMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages,
  ];

  const resp = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash",
      messages: apiMessages,
      tools: openaiTools,
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Lovable gateway error:", resp.status, errText);
    throw new Error("AI service error");
  }

  const data = await resp.json();
  const choice = data.choices?.[0];
  const msg = choice?.message;

  // Handle tool calls
  if (msg?.tool_calls?.length) {
    const toolResults = [];
    for (const tc of msg.tool_calls) {
      const args = JSON.parse(tc.function.arguments || "{}");
      const result = await handleToolCall(tc.function.name, args);
      toolResults.push({
        role: "tool",
        tool_call_id: tc.id,
        content: result,
      });
    }

    const secondResp = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [...apiMessages, msg, ...toolResults],
        tools: openaiTools,
      }),
    });

    if (!secondResp.ok) {
      const errText = await secondResp.text();
      console.error("Lovable gateway second call error:", secondResp.status, errText);
      throw new Error("AI service error");
    }

    const secondData = await secondResp.json();
    return secondData.choices?.[0]?.message?.content || "I couldn't generate a response.";
  }

  return msg?.content || "I couldn't generate a response.";
}

async function callGemini(messages: Array<{ role: string; content: string }>, geminiKey: string): Promise<string> {
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
  const contents = toGeminiContents(messages);

  const firstResp = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      tools: toGeminiTools(),
    }),
  });

  if (!firstResp.ok) {
    const errText = await firstResp.text();
    console.error("Gemini error:", firstResp.status, errText);
    throw new Error(firstResp.status === 429 ? "GEMINI_QUOTA" : "AI service error");
  }

  const firstResult = await firstResp.json();
  const parts = firstResult.candidates?.[0]?.content?.parts || [];
  const functionCalls = parts.filter((p: any) => p.functionCall);

  if (functionCalls.length > 0) {
    const functionResponses = [];
    for (const fc of functionCalls) {
      const result = await handleToolCall(fc.functionCall.name, fc.functionCall.args || {});
      functionResponses.push({
        functionResponse: {
          name: fc.functionCall.name,
          response: JSON.parse(result),
        },
      });
    }

    const secondResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [...contents, { role: "model", parts }, { role: "user", parts: functionResponses }],
        tools: toGeminiTools(),
      }),
    });

    if (!secondResp.ok) {
      const errText = await secondResp.text();
      console.error("Gemini second call error:", secondResp.status, errText);
      throw new Error(secondResp.status === 429 ? "GEMINI_QUOTA" : "AI service error");
    }

    const secondResult = await secondResp.json();
    return secondResult.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
  }

  return parts.find((p: any) => p.text)?.text || "I couldn't generate a response.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!GEMINI_KEY && !LOVABLE_KEY) throw new Error("No AI API key configured");

    let text: string;

    if (GEMINI_KEY) {
      try {
        text = await callGemini(messages, GEMINI_KEY);
      } catch (e) {
        // Fallback to Lovable gateway on quota errors
        if (e instanceof Error && e.message === "GEMINI_QUOTA" && LOVABLE_KEY) {
          console.log("Gemini quota exceeded, falling back to Lovable AI gateway");
          text = await callLovableGateway(messages, LOVABLE_KEY);
        } else {
          throw e;
        }
      }
    } else {
      text = await callLovableGateway(messages, LOVABLE_KEY!);
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

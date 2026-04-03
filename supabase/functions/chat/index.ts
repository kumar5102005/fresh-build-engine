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
  {
    type: "function",
    function: {
      name: "get_latest_news",
      description: "Fetch latest news headlines. Can filter by source like The Hindu, Indian Express, Eenadu, Sakshi, Times of India, or get general top headlines.",
      parameters: {
        type: "object",
        properties: {
          source: { type: "string", description: "News source name like 'The Hindu', 'Indian Express', 'Eenadu', 'Sakshi', 'Times of India'. Leave empty for top headlines." },
          query: { type: "string", description: "Optional search query for specific news topics" },
        },
        required: [],
      },
    },
  },
];

function getSupabaseAdmin() {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key);
}

// RSS feed URLs for Indian newspapers
const RSS_FEEDS: Record<string, string> = {
  "the hindu": "https://www.thehindu.com/news/national/feeder/default.rss",
  "indian express": "https://indianexpress.com/feed/",
  "times of india": "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
  "eenadu": "https://www.eenadu.net/feeds/rss.xml",
  "sakshi": "https://www.sakshi.com/rss/telangana",
};

async function fetchRSSNews(source?: string, query?: string): Promise<string> {
  // Try RSS feeds
  const feedUrl = source ? RSS_FEEDS[source.toLowerCase()] : null;
  const urls = feedUrl ? [feedUrl] : Object.values(RSS_FEEDS).slice(0, 2);

  const allItems: Array<{ title: string; link: string; source: string }> = [];

  for (const url of urls) {
    try {
      const resp = await fetch(url, {
        headers: { "User-Agent": "LibraAI/1.0" },
      });
      if (!resp.ok) continue;
      const xml = await resp.text();

      // Simple XML parsing for RSS items
      const items = xml.match(/<item[^>]*>[\s\S]*?<\/item>/gi) || [];
      const sourceName = Object.entries(RSS_FEEDS).find(([, v]) => v === url)?.[0] || "News";

      for (const item of items.slice(0, 5)) {
        const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/i);
        const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/link>/i);
        if (titleMatch?.[1]) {
          allItems.push({
            title: titleMatch[1].trim(),
            link: linkMatch?.[1]?.trim() || "",
            source: sourceName,
          });
        }
      }
    } catch (e) {
      console.error(`RSS fetch error for ${url}:`, e);
    }
  }

  if (allItems.length === 0) {
    return JSON.stringify({
      message: "Could not fetch live news at the moment. Here are some popular Indian news sources you can visit:",
      sources: [
        { name: "The Hindu", url: "https://www.thehindu.com" },
        { name: "Indian Express", url: "https://indianexpress.com" },
        { name: "Times of India", url: "https://timesofindia.indiatimes.com" },
        { name: "Eenadu", url: "https://www.eenadu.net" },
        { name: "Sakshi", url: "https://www.sakshi.com" },
      ],
    });
  }

  // Filter by query if provided
  let filtered = allItems;
  if (query) {
    const q = query.toLowerCase();
    filtered = allItems.filter((item) => item.title.toLowerCase().includes(q));
    if (filtered.length === 0) filtered = allItems.slice(0, 8);
  }

  return JSON.stringify({ headlines: filtered.slice(0, 10) });
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

  if (name === "get_latest_news") {
    return await fetchRSSNews(args.source as string | undefined, args.query as string | undefined);
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
7. **Latest News** – Fetch and display latest news headlines from Indian newspapers using get_latest_news.
8. **General Q&A** – Answer any question helpfully.

IMPORTANT FORMATTING RULES:
- When users ask to show/find/search books, ALWAYS use the get_books tool.
- When users ask about a specific book, use get_book_details.
- When users want to buy/purchase a book, use get_book_links.
- When users ask about news/headlines/newspapers, use get_latest_news.
- Format book results as a clean markdown table with columns: Title, Author, Available, Total.
- For news, format each headline as: **Title** with a [Read more](link) link.
- Always structure responses with clear sections using headings (##, ###).
- Use bullet points for lists, not long paragraphs.
- Highlight important info in **bold**.
- Keep responses concise, well-spaced, and easy to scan.
- For purchase links, display them as clickable markdown links.
- Available book categories: CSE, ECE, EEE, Mechanical, Civil, Science & Humanities, SSC Book Bank, Stories.`;

// Convert OpenAI-style messages to Gemini format
function toGeminiContents(messages: Array<{ role: string; content: string }>) {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function toGeminiTools() {
  return [{
    function_declarations: tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    })),
  }];
}

async function callLovableGateway(messages: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  const openaiTools = tools.map((t) => ({ type: "function" as const, function: t.function }));
  const apiMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: apiMessages, tools: openaiTools }),
  });

  if (!resp.ok) {
    console.error("Lovable gateway error:", resp.status, await resp.text());
    throw new Error("AI service error");
  }

  const data = await resp.json();
  const msg = data.choices?.[0]?.message;

  if (msg?.tool_calls?.length) {
    const toolResults = [];
    for (const tc of msg.tool_calls) {
      const result = await handleToolCall(tc.function.name, JSON.parse(tc.function.arguments || "{}"));
      toolResults.push({ role: "tool", tool_call_id: tc.id, content: result });
    }

    const secondResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [...apiMessages, msg, ...toolResults], tools: openaiTools }),
    });

    if (!secondResp.ok) throw new Error("AI service error");
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
    body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents, tools: toGeminiTools() }),
  });

  if (!firstResp.ok) {
    console.error("Gemini error:", firstResp.status, await firstResp.text());
    throw new Error(firstResp.status === 429 ? "GEMINI_QUOTA" : "AI service error");
  }

  const firstResult = await firstResp.json();
  const parts = firstResult.candidates?.[0]?.content?.parts || [];
  const functionCalls = parts.filter((p: any) => p.functionCall);

  if (functionCalls.length > 0) {
    const functionResponses = [];
    for (const fc of functionCalls) {
      const result = await handleToolCall(fc.functionCall.name, fc.functionCall.args || {});
      functionResponses.push({ functionResponse: { name: fc.functionCall.name, response: JSON.parse(result) } });
    }

    const secondResp = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system_instruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [...contents, { role: "model", parts }, { role: "user", parts: functionResponses }], tools: toGeminiTools() }),
    });

    if (!secondResp.ok) throw new Error(secondResp.status === 429 ? "GEMINI_QUOTA" : "AI service error");
    const secondResult = await secondResp.json();
    return secondResult.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response.";
  }

  return parts.find((p: any) => p.text)?.text || "I couldn't generate a response.";
}

async function callOpenAI(messages: Array<{ role: string; content: string }>, apiKey: string): Promise<string> {
  const openaiTools = tools.map((t) => ({ type: "function" as const, function: t.function }));
  const apiMessages = [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "gpt-4o-mini", messages: apiMessages, tools: openaiTools, max_tokens: 2048 }),
  });

  if (!resp.ok) {
    console.error("OpenAI error:", resp.status, await resp.text());
    if (resp.status === 429) throw new Error("OPENAI_QUOTA");
    throw new Error("OPENAI_ERROR");
  }

  const data = await resp.json();
  const msg = data.choices?.[0]?.message;

  if (msg?.tool_calls?.length) {
    const toolResults = [];
    for (const tc of msg.tool_calls) {
      const result = await handleToolCall(tc.function.name, JSON.parse(tc.function.arguments || "{}"));
      toolResults.push({ role: "tool", tool_call_id: tc.id, content: result });
    }

    const secondResp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "gpt-4o-mini", messages: [...apiMessages, msg, ...toolResults], tools: openaiTools, max_tokens: 2048 }),
    });

    if (!secondResp.ok) {
      if (secondResp.status === 429) throw new Error("OPENAI_QUOTA");
      throw new Error("OPENAI_ERROR");
    }
    const secondData = await secondResp.json();
    return secondData.choices?.[0]?.message?.content || "I couldn't generate a response.";
  }

  return msg?.content || "I couldn't generate a response.";
}

async function generateTextResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
  const OPENAI_KEY = Deno.env.get("OPENAI_API_KEY");
  const GEMINI_KEY = Deno.env.get("GOOGLE_GEMINI_API_KEY");
  const LOVABLE_KEY = Deno.env.get("LOVABLE_API_KEY");

  if (!OPENAI_KEY && !GEMINI_KEY && !LOVABLE_KEY) throw new Error("NO_AI_KEY");

  if (OPENAI_KEY) {
    try { return await callOpenAI(messages, OPENAI_KEY); }
    catch (e) { console.error("OpenAI unavailable:", e); if (!GEMINI_KEY && !LOVABLE_KEY) throw e; }
  }
  if (GEMINI_KEY) {
    try { return await callGemini(messages, GEMINI_KEY); }
    catch (e) { console.error("Gemini unavailable:", e); if (!LOVABLE_KEY) throw e; }
  }
  if (LOVABLE_KEY) return await callLovableGateway(messages, LOVABLE_KEY);
  throw new Error("AI service error");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const text = await generateTextResponse(messages);
    return new Response(JSON.stringify({ text }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("chat error:", e);
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    const isQuotaError = errorMessage === "OPENAI_QUOTA" || errorMessage === "GEMINI_QUOTA";
    const status = isQuotaError ? 429 : 500;
    const error = errorMessage === "NO_AI_KEY" ? "No AI API key configured" : isQuotaError ? "AI provider quota exceeded" : "AI service error";
    return new Response(JSON.stringify({ error }), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

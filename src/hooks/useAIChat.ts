import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export function useAIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    if (user) loadSessions();
  }, [user]);

  const loadSessions = useCallback(async () => {
    if (!user) return;
    setSessionsLoading(true);
    const { data } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setSessions((data as ChatSession[]) || []);
    setSessionsLoading(false);
  }, [user]);

  const loadSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    setActiveSessionId(sessionId);
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    setMessages(
      (data || []).map((m: any) => ({
        id: m.id,
        role: m.role as "user" | "assistant",
        content: m.content,
        timestamp: new Date(m.created_at),
      }))
    );
  }, [user]);

  const createSession = useCallback(async (firstMessage: string): Promise<string | null> => {
    if (!user) return null;
    const title = firstMessage.slice(0, 60) || "New Chat";
    const { data, error } = await supabase
      .from("chat_sessions")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (error || !data) return null;
    const session = data as ChatSession;
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    return session.id;
  }, [user]);

  const persistMessage = useCallback(async (sessionId: string, role: string, content: string) => {
    if (!user) return;
    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
    });
    // Update session updated_at
    await supabase.from("chat_sessions").update({ updated_at: new Date().toISOString() }).eq("id", sessionId);
  }, [user]);

  const sendMessage = useCallback(async (input: string) => {
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Create session if none active
    let sessionId = activeSessionId;
    if (!sessionId && user) {
      sessionId = await createSession(input);
    }

    // Persist user message
    if (sessionId) {
      await persistMessage(sessionId, "user", input);
    }

    try {
      const apiMessages = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      let text = "Sorry, something went wrong. Please try again.";
      if (resp.ok) {
        const data = await resp.json();
        text = data.text || "Sorry, I couldn't generate a response.";
      } else {
        const err = await resp.json().catch(() => ({ error: "Failed to connect" }));
        text = err.error || text;
      }

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: text,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);

      if (sessionId) {
        await persistMessage(sessionId, "assistant", text);
      }
    } catch (e) {
      console.error("Chat error:", e);
      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Sorry, I couldn't connect to the AI service. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
      if (sessionId) {
        await persistMessage(sessionId, "assistant", errorMsg.content);
      }
    }

    setIsLoading(false);
  }, [messages, activeSessionId, user, createSession, persistMessage]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setActiveSessionId(null);
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setActiveSessionId(null);
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    if (!user) return;
    await supabase.from("chat_sessions").delete().eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setMessages([]);
      setActiveSessionId(null);
    }
  }, [user, activeSessionId]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearChat,
    sessions,
    sessionsLoading,
    activeSessionId,
    loadSession,
    startNewChat,
    deleteSession,
    loadSessions,
  };
}

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Bot, User, Sparkles, Trash2, Mic, MicOff, Plus, History, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useAIChat, type ChatMessage } from "@/hooks/useAIChat";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const quickPrompts = [
  "📚 Show all CSE books",
  "🔍 Search for AI books",
  "📖 Borrowing policies?",
  "✍️ Summarize Data Structures",
  "🛒 Buy 'Artificial Intelligence'",
  "📰 Today's latest news",
];

export function AIChatPanel() {
  const {
    messages, isLoading, sendMessage, clearChat,
    sessions, activeSessionId, loadSession, startNewChat, deleteSession,
  } = useAIChat();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    sendMessage(trimmed);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      setInput((prev) => prev + event.results[0][0].transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  // History sidebar
  if (showHistory) {
    return (
      <div className="flex flex-col h-full bg-background/30">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card/80">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Chat History</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowHistory(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center mt-8">No chat history yet</p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors group",
                  activeSessionId === s.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted/60"
                )}
                onClick={() => { loadSession(s.id); setShowHistory(false); }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{format(new Date(s.updated_at), "MMM d, h:mm a")}</p>
                </div>
                <Button
                  variant="ghost" size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
        <div className="p-3 border-t border-border/60">
          <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={() => { startNewChat(); setShowHistory(false); }}>
            <Plus className="h-3.5 w-3.5" /> New Chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background/30">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-md">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">LibraAI Assistant</h3>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <p className="text-[11px] text-muted-foreground">Online • AI-powered help</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setShowHistory(true)} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <History className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => { startNewChat(); }} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <Plus className="h-4 w-4" />
          </Button>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-8 w-8 text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center space-y-5">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg"
            >
              <Bot className="h-8 w-8 text-primary-foreground" />
            </motion.div>
            <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}>
              <h3 className="text-lg font-bold text-foreground">Hi! I'm LibraAI 🤖</h3>
              <p className="text-sm text-muted-foreground mt-1.5 max-w-xs leading-relaxed">
                Search books, get recommendations, buy links, latest news, and more.
              </p>
            </motion.div>
            <motion.div
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-2 w-full max-w-sm"
            >
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left text-xs px-3 py-2.5 rounded-xl border border-border/60 bg-card/60 hover:bg-accent hover:text-accent-foreground hover:border-primary/30 transition-all duration-200 hover:shadow-sm"
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <MessageBubble message={msg} />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-2.5 pt-2">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs"><Bot className="h-3.5 w-3.5" /></AvatarFallback>
            </Avatar>
            <div className="bg-muted/80 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:0ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:150ms]" />
                  <span className="h-2 w-2 rounded-full bg-primary/50 animate-bounce [animation-delay:300ms]" />
                </div>
                <span className="text-xs text-muted-foreground ml-1">LibraAI is typing…</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/60 bg-card/80 backdrop-blur-sm">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask about books, news, or anything…"
            disabled={isLoading}
            className="flex-1 min-h-[40px] max-h-[120px] resize-none py-2.5 rounded-xl border-border/60 bg-background/60 focus:bg-background transition-colors"
            rows={1}
          />
          <div className="flex gap-1">
            {"webkitSpeechRecognition" in window || "SpeechRecognition" in window ? (
              <Button type="button" size="icon" variant={isListening ? "destructive" : "outline"} onClick={toggleVoice} className="shrink-0 h-10 w-10 rounded-xl">
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            ) : null}
            <Button type="submit" size="icon" disabled={!input.trim() || isLoading} className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-md">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─── Message Bubble ─── */
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={cn("flex items-start gap-2.5 mb-3", isUser && "flex-row-reverse")}>
      <Avatar className="h-7 w-7 shrink-0 mt-0.5">
        <AvatarFallback className={cn("text-xs", isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
          {isUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted/80 text-foreground rounded-tl-sm border border-border/30"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none break-words
            [&_p]:my-1.5 [&_p]:leading-relaxed
            [&_ul]:my-2 [&_ul]:pl-4 [&_ul]:space-y-1
            [&_ol]:my-2 [&_ol]:pl-4 [&_ol]:space-y-1
            [&_li]:leading-relaxed
            [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium
            [&_h1]:text-base [&_h1]:font-bold [&_h1]:mt-3 [&_h1]:mb-2
            [&_h2]:text-sm [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5
            [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1
            [&_code]:bg-background/60 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-md [&_code]:text-xs [&_code]:font-mono
            [&_pre]:bg-background/60 [&_pre]:p-3 [&_pre]:rounded-xl [&_pre]:overflow-x-auto [&_pre]:my-2
            [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
            [&_strong]:font-bold [&_strong]:text-foreground
            [&_hr]:my-3 [&_hr]:border-border/50
          ">
            <div className="overflow-x-auto [&_table]:w-full [&_table]:border-collapse [&_table]:text-xs [&_table]:my-3 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:border [&_table]:border-border/50 [&_thead]:bg-muted/60 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:border-b [&_th]:border-border [&_th]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-border/30 [&_tr:last-child_td]:border-b-0 [&_tr:hover_td]:bg-accent/20">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ href, children, ...props }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 font-medium hover:text-primary/80 transition-colors" {...props}>
                      {children}
                    </a>
                  ),
                  table: ({ children, ...props }) => (
                    <div className="overflow-x-auto rounded-lg border border-border/50 my-3">
                      <table className="w-full border-collapse text-xs" {...props}>{children}</table>
                    </div>
                  ),
                  thead: ({ children, ...props }) => (
                    <thead className="bg-muted/60" {...props}>{children}</thead>
                  ),
                  th: ({ children, ...props }) => (
                    <th className="px-3 py-2 text-left font-semibold border-b border-border whitespace-nowrap text-foreground" {...props}>{children}</th>
                  ),
                  td: ({ children, ...props }) => (
                    <td className="px-3 py-2 border-b border-border/30" {...props}>{children}</td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

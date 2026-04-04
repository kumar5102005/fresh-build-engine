import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChatPanel } from "./AIChatPanel";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

const MIN_W = 340;
const MIN_H = 400;
const MAX_W = 700;
const MAX_H = 800;

export function AIChatFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const panelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 400, h: 560 });
  const resizing = useRef<{ edge: string; startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Outside click to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (panelRef.current && !panelRef.current.contains(target) && !target.closest("[data-chat-fab]")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Resize drag logic
  const onResizeStart = useCallback((edge: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    resizing.current = { edge, startX: e.clientX, startY: e.clientY, startW: size.w, startH: size.h };

    const onMove = (ev: MouseEvent) => {
      if (!resizing.current) return;
      const { edge, startX, startY, startW, startH } = resizing.current;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      let newW = startW;
      let newH = startH;
      if (edge.includes("l")) newW = Math.max(MIN_W, Math.min(MAX_W, startW - dx));
      if (edge.includes("t")) newH = Math.max(MIN_H, Math.min(MAX_H, startH - dy));
      setSize({ w: newW, h: newH });
    };
    const onUp = () => {
      resizing.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [size]);

  return (
    <>
      {/* Chat panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed z-50 rounded-2xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-300",
          isMobile
            ? "bottom-0 right-0 left-0 top-0 rounded-none"
            : "bottom-20 right-4",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
        style={isMobile ? undefined : { width: size.w, height: size.h }}
      >
        {/* Resize handles (desktop only) */}
        {!isMobile && isOpen && (
          <>
            <div className="absolute top-0 left-0 w-3 h-full cursor-ew-resize z-10" onMouseDown={(e) => onResizeStart("l", e)} />
            <div className="absolute top-0 left-0 h-3 w-full cursor-ns-resize z-10" onMouseDown={(e) => onResizeStart("t", e)} />
            <div className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-20" onMouseDown={(e) => onResizeStart("tl", e)} />
          </>
        )}
        <AIChatPanel />
      </div>

      {/* FAB */}
      <Button
        data-chat-fab
        onClick={() => setIsOpen(!isOpen)}
        size="icon"
        className={cn(
          "fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg gradient-primary hover:opacity-90 transition-all",
          isOpen && "rotate-90"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </Button>
    </>
  );
}

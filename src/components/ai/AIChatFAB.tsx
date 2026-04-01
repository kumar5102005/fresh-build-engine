import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIChatPanel } from "./AIChatPanel";
import { cn } from "@/lib/utils";

export function AIChatFAB() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-20 right-4 z-50 w-[380px] h-[520px] rounded-2xl border border-border bg-background shadow-2xl overflow-hidden transition-all duration-300",
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        )}
      >
        <AIChatPanel />
      </div>

      {/* FAB */}
      <Button
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

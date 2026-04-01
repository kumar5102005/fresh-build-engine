import { Sparkles, BookOpen, Brain, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { AIRecommendations } from "@/components/ai/AIRecommendations";

const features = [
  {
    icon: MessageSquare,
    title: "Smart Chat",
    description: "Ask questions about books, policies, and get instant help",
  },
  {
    icon: BookOpen,
    title: "Book Discovery",
    description: "Get personalized recommendations based on your interests",
  },
  {
    icon: Brain,
    title: "Research Aid",
    description: "Find academic resources and reference materials faster",
  },
];

const AIAssistant = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">AI Assistant</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Your intelligent library companion — powered by AI
          </p>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/50 bg-card/50">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{f.title}</p>
                  <p className="text-xs text-muted-foreground">{f.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat */}
          <Card className="border-border/50 overflow-hidden lg:row-span-2">
            <div className="h-[560px]">
              <AIChatPanel />
            </div>
          </Card>

          {/* Recommendations */}
          <AIRecommendations />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;

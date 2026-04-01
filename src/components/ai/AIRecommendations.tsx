import { useEffect, useState } from "react";
import { Sparkles, BookOpen, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookRecommendations, type BookRecommendation } from "@/hooks/useBookRecommendations";

const categories = ["All", "CSE", "ECE", "EEE", "MECH", "CIVIL", "Science & Humanities", "SSC Book Bank", "Stories"];

export function AIRecommendations() {
  const { recommendations, isLoading, getRecommendations } = useBookRecommendations();
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    getRecommendations(undefined, selectedCategory === "All" ? undefined : selectedCategory);
  }, []);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    getRecommendations(undefined, cat === "All" ? undefined : cat);
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">AI Recommendations</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => getRecommendations(undefined, selectedCategory === "All" ? undefined : selectedCategory)}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => handleCategoryChange(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg border border-border/50 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((rec, i) => (
              <RecommendationCard key={i} recommendation={rec} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Click Refresh to get AI-powered recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecommendationCard({ recommendation }: { recommendation: BookRecommendation }) {
  return (
    <div className="group p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all space-y-1.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground line-clamp-1">{recommendation.title}</p>
          <p className="text-xs text-muted-foreground">{recommendation.author}</p>
        </div>
        <Badge variant="outline" className="text-[10px] shrink-0">
          {recommendation.matchScore}%
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2">{recommendation.reason}</p>
      <Badge variant="secondary" className="text-[10px]">
        {recommendation.category}
      </Badge>
    </div>
  );
}

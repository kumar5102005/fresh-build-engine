import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BookRecommendation = {
  title: string;
  author: string;
  category: string;
  reason: string;
  matchScore: number;
};

export function useBookRecommendations() {
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getRecommendations = useCallback(async (query?: string, category?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("recommend-books", {
        body: { query, category },
      });

      if (error) throw error;
      setRecommendations(data?.recommendations || []);
    } catch (e) {
      console.error("Recommendation error:", e);
      setRecommendations([]);
    }
    setIsLoading(false);
  }, []);

  return { recommendations, isLoading, getRecommendations };
}

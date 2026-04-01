import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useBooks(category?: string, search?: string) {
  return useQuery({
    queryKey: ["books", category, search],
    queryFn: async () => {
      let query = supabase.from("books").select("*").order("title");
      if (category && category !== "All") {
        query = query.eq("category", category);
      }
      if (search) {
        query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useBook(id: string) {
  return useQuery({
    queryKey: ["book", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useBookReviews(bookId: string) {
  return useQuery({
    queryKey: ["book-reviews", bookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_reviews")
        .select("*, profiles(full_name)")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!bookId,
  });
}

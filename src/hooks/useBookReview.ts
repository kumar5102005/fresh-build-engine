import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useCreateReview() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, rating, comment }: { bookId: string; rating: number; comment: string }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if user has borrowed this book (approved status)
      const { data: borrows } = await supabase
        .from("borrow_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .eq("status", "approved")
        .limit(1);

      // Also check returned borrows
      const { data: returnedBorrows } = await supabase
        .from("borrow_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .eq("status", "returned")
        .limit(1);

      if ((!borrows || borrows.length === 0) && (!returnedBorrows || returnedBorrows.length === 0)) {
        throw new Error("You can only review books you have borrowed");
      }

      const { error } = await supabase.from("book_reviews").insert({
        user_id: user.id,
        book_id: bookId,
        rating,
        comment: comment || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["book-reviews", vars.bookId] });
      toast.success("Review submitted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCanReview(bookId: string) {
  const { user } = useAuth();
  return {
    checkCanReview: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("borrow_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .in("status", ["approved", "returned"])
        .limit(1);
      return (data?.length ?? 0) > 0;
    },
  };
}

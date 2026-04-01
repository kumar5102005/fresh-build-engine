import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useShelf() {
  const { user } = useAuth();

  const shelfQuery = useQuery({
    queryKey: ["shelf", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shelf_items")
        .select("*, books(*)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const queryClient = useQueryClient();

  const addToShelf = useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase
        .from("shelf_items")
        .insert({ user_id: user!.id, book_id: bookId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelf"] });
      toast.success("Added to shelf");
    },
    onError: (e: any) => {
      if (e.code === "23505") toast.info("Already on your shelf");
      else toast.error("Failed to add to shelf");
    },
  });

  const removeFromShelf = useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await supabase
        .from("shelf_items")
        .delete()
        .eq("user_id", user!.id)
        .eq("book_id", bookId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shelf"] });
      toast.success("Removed from shelf");
    },
    onError: () => toast.error("Failed to remove"),
  });

  return { ...shelfQuery, addToShelf, removeFromShelf };
}

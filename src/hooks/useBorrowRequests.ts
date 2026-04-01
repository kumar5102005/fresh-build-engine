import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useMyBorrowRequests() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-borrow-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrow_requests")
        .select("*, books(title, author)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllBorrowRequests() {
  return useQuery({
    queryKey: ["all-borrow-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("borrow_requests")
        .select("*, books(title, author), profiles(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBorrowRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, type = "borrow" as const }: { bookId: string; type?: "borrow" | "return" }) => {
      const dueDate = type === "borrow"
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : undefined;
      const { error } = await supabase.from("borrow_requests").insert({
        user_id: user!.id,
        book_id: bookId,
        type,
        due_date: dueDate,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["all-borrow-requests"] });
      toast.success("Request submitted successfully");
    },
    onError: () => toast.error("Failed to submit request"),
  });
}

export function useUpdateBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" | "returned" }) => {
      const updates: any = { status };
      if (status === "returned") updates.returned_date = new Date().toISOString();
      const { error } = await supabase.from("borrow_requests").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-borrow-requests"] });
      toast.success("Request updated");
    },
    onError: () => toast.error("Failed to update request"),
  });
}

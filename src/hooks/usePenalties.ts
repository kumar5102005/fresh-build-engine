import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useMyPenalties() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["my-penalties", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("penalties")
        .select("*, books(title, author)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

export function useAllPenalties() {
  return useQuery({
    queryKey: ["all-penalties"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("penalties")
        .select("*, books(title, author), profiles(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdatePenalty() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "paid" | "waived" }) => {
      const { error } = await supabase.from("penalties").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-penalties"] });
      queryClient.invalidateQueries({ queryKey: ["my-penalties"] });
      toast.success("Penalty updated");
    },
    onError: () => toast.error("Failed to update penalty"),
  });
}

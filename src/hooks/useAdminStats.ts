import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [booksRes, usersRes, requestsRes, penaltiesRes] = await Promise.all([
        supabase.from("books").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("borrow_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("penalties").select("id", { count: "exact", head: true }).eq("status", "unpaid"),
      ]);
      return {
        totalBooks: booksRes.count ?? 0,
        totalUsers: usersRes.count ?? 0,
        pendingRequests: requestsRes.count ?? 0,
        activePenalties: penaltiesRes.count ?? 0,
      };
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*, user_roles(role)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

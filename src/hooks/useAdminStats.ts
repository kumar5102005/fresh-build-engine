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
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;
      if (!profiles?.length) return [];

      const profileIds = profiles.map((profile) => profile.id);
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", profileIds);

      if (rolesError) throw rolesError;

      const rolesByUserId = new Map<string, Array<{ role: string }>>();
      for (const roleEntry of roles || []) {
        const existingRoles = rolesByUserId.get(roleEntry.user_id) || [];
        existingRoles.push({ role: roleEntry.role });
        rolesByUserId.set(roleEntry.user_id, existingRoles);
      }

      return profiles.map((profile) => ({
        ...profile,
        user_roles: rolesByUserId.get(profile.id) || [],
      }));
    },
  });
}

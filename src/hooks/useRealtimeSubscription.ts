import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useRealtimeSubscription() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("realtime-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "borrow_requests", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["my-borrow-requests"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "borrow_requests" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["all-borrow-requests"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "books" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["books"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "penalties", filter: `user_id=eq.${user.id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["penalties"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
}

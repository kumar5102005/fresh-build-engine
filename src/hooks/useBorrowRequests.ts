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
      const { data: requests, error: requestsError } = await supabase
        .from("borrow_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (requestsError) throw requestsError;
      if (!requests?.length) return [];

      const bookIds = [...new Set(requests.map((request) => request.book_id))];
      const userIds = [...new Set(requests.map((request) => request.user_id))];

      const [{ data: books, error: booksError }, { data: profiles, error: profilesError }] = await Promise.all([
        supabase.from("books").select("id, title, author").in("id", bookIds),
        supabase.from("profiles").select("id, full_name").in("id", userIds),
      ]);

      if (booksError) throw booksError;
      if (profilesError) throw profilesError;

      const booksById = new Map((books || []).map((book) => [book.id, book]));
      const profilesById = new Map(
        (profiles || []).map((profile) => [profile.id, { full_name: profile.full_name }])
      );

      return requests.map((request) => ({
        ...request,
        books: booksById.get(request.book_id) || null,
        profiles: profilesById.get(request.user_id) || null,
      }));
    },
  });
}

export function useCreateBorrowRequest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookId, type = "borrow" as const }: { bookId: string; type?: "borrow" | "return" }) => {
      if (!user) throw new Error("Not authenticated");

      // Enforce max_books setting
      if (type === "borrow") {
        // Fetch system settings for max books
        const { data: settings } = await supabase
          .from("system_settings")
          .select("key, value")
          .in("key", ["max_books_student", "max_books_faculty"]);

        const settingsMap: Record<string, string> = {};
        (settings || []).forEach((s: any) => { settingsMap[s.key] = s.value; });

        const maxBooks = parseInt(settingsMap.max_books_student || "5") || 5;

        // Count currently borrowed books (approved status, not yet returned)
        const { count, error: countError } = await supabase
          .from("borrow_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", "borrow")
          .eq("status", "approved");

        if (countError) throw countError;

        if ((count ?? 0) >= maxBooks) {
          throw new Error(`You have reached the maximum limit of ${maxBooks} borrowed books. Please return a book before borrowing another.`);
        }

        // Also check pending requests
        const { count: pendingCount } = await supabase
          .from("borrow_requests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("type", "borrow")
          .eq("status", "pending");

        if (((count ?? 0) + (pendingCount ?? 0)) >= maxBooks) {
          throw new Error(`You have ${count ?? 0} borrowed and ${pendingCount ?? 0} pending requests. Maximum allowed: ${maxBooks}.`);
        }
      }

      // Fetch borrow duration from settings
      const { data: durationSetting } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", "borrow_duration_days")
        .single();

      const borrowDays = parseInt(durationSetting?.value || "30") || 30;

      const dueDate = type === "borrow"
        ? new Date(Date.now() + borrowDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined;

      const { error } = await supabase.from("borrow_requests").insert({
        user_id: user.id,
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
    onError: (error: any) => toast.error(error.message || "Failed to submit request"),
  });
}

export function useUpdateBorrowRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, bookTitle, userId }: { id: string; status: "approved" | "rejected" | "returned"; bookTitle?: string; userId?: string }) => {
      const updates: any = { status };
      if (status === "returned") updates.returned_date = new Date().toISOString();
      const { error } = await supabase.from("borrow_requests").update(updates).eq("id", id);
      if (error) throw error;

      // Create notification for the user
      if (userId && bookTitle) {
        let title = "";
        let message = "";
        let type = "info";

        if (status === "approved") {
          title = "Borrow Request Approved";
          message = `Your borrow request for "${bookTitle}" has been approved. You can now collect the book from the library.`;
          type = "approval";
        } else if (status === "rejected") {
          title = "Borrow Request Rejected";
          message = `Your borrow request for "${bookTitle}" has been rejected. Please contact the library for more details.`;
          type = "overdue";
        } else if (status === "returned") {
          title = "Book Returned Successfully";
          message = `"${bookTitle}" has been marked as returned. Thank you!`;
          type = "approval";
        }

        if (title) {
          await supabase.from("notifications").insert({
            user_id: userId,
            title,
            message,
            type,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["my-borrow-requests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Request updated");
    },
    onError: () => toast.error("Failed to update request"),
  });
}

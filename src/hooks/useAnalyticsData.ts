import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, addDays } from "date-fns";

export function useAnalyticsData() {
  return useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [borrowRes, penaltyRes, booksRes, usersRes] = await Promise.all([
        supabase.from("borrow_requests").select("created_at, type, status, returned_date"),
        supabase.from("penalties").select("created_at, amount, status"),
        supabase.from("books").select("category, department"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const borrows = borrowRes.data || [];
      const penalties = penaltyRes.data || [];
      const books = booksRes.data || [];
      const totalUsers = usersRes.count ?? 0;

      // Monthly borrow/return trends (last 6 months)
      const now = new Date();
      const monthlyBorrows = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const monthLabel = format(monthDate, "MMM");

        const borrowCount = borrows.filter(
          (b) => b.type === "borrow" && new Date(b.created_at) >= start && new Date(b.created_at) <= end
        ).length;
        const returnCount = borrows.filter(
          (b) =>
            (b.type === "return" || b.status === "returned") &&
            new Date(b.created_at) >= start &&
            new Date(b.created_at) <= end
        ).length;

        monthlyBorrows.push({ month: monthLabel, borrows: borrowCount, returns: returnCount });
      }

      // Department distribution from books
      const deptMap: Record<string, number> = {};
      books.forEach((b) => {
        const dept = b.department || "Other";
        deptMap[dept] = (deptMap[dept] || 0) + 1;
      });
      const departmentData = Object.entries(deptMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      // Daily borrows this week
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const dailyActive = [];
      const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      for (let i = 0; i < 7; i++) {
        const day = addDays(weekStart, i);
        const dayEnd = addDays(day, 1);
        const count = borrows.filter(
          (b) => new Date(b.created_at) >= day && new Date(b.created_at) < dayEnd
        ).length;
        dailyActive.push({ day: dayNames[i], users: count });
      }

      // Penalty trend (last 6 months)
      const penaltyTrend = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);
        const monthLabel = format(monthDate, "MMM");

        const total = penalties
          .filter((p) => new Date(p.created_at) >= start && new Date(p.created_at) <= end)
          .reduce((sum, p) => sum + Number(p.amount), 0);

        penaltyTrend.push({ month: monthLabel, penalties: total });
      }

      // KPIs
      const totalBorrows = borrows.filter((b) => b.type === "borrow").length;
      const totalReturned = borrows.filter((b) => b.status === "returned").length;
      const totalBorrowed = borrows.filter((b) => b.status === "approved").length;
      const returnRate = totalBorrows > 0 ? Math.round((totalReturned / totalBorrows) * 100) : 0;
      const avgDailyBorrows = totalBorrows > 0 ? Math.round(totalBorrows / 30) : 0;
      const penaltyCollection = penalties
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount), 0);
      const topDept = departmentData.length > 0 ? departmentData[0].name : "—";

      return {
        monthlyBorrows,
        departmentData,
        dailyActive,
        penaltyTrend,
        kpis: {
          avgDailyBorrows,
          topDept,
          returnRate: `${returnRate}%`,
          penaltyCollection: `₹${penaltyCollection.toLocaleString()}`,
          totalUsers,
          totalBooks: books.length,
          totalBorrowed,
          totalReturned,
        },
      };
    },
  });
}

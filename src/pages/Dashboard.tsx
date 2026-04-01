import { BookOpen, Clock, AlertTriangle, Search, Library, MessageSquare, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBorrowRequests } from "@/hooks/useBorrowRequests";
import { useMyPenalties } from "@/hooks/usePenalties";
import { useShelf } from "@/hooks/useShelf";
import { formatDistanceToNow } from "date-fns";

const quickActions = [
  { label: "Search Books", icon: Search, href: "/books", variant: "default" as const },
  { label: "My Shelf", icon: Library, href: "/my-shelf", variant: "outline" as const },
  { label: "AI Assistant", icon: MessageSquare, href: "/ai-assistant", variant: "outline" as const },
];

const Dashboard = () => {
  const { profile } = useAuth();
  const { data: requests = [], isLoading: reqLoading } = useMyBorrowRequests();
  const { data: penalties = [], isLoading: penLoading } = useMyPenalties();
  const { data: shelfItems = [], isLoading: shelfLoading } = useShelf();

  const currentBorrows = requests.filter((r: any) => r.status === "approved" && !r.returned_date);
  const dueSoon = currentBorrows.filter((r: any) => {
    if (!r.due_date) return false;
    const days = Math.ceil((new Date(r.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days <= 7 && days > 0;
  });
  const totalUnpaid = penalties.filter((p: any) => p.status === "unpaid").reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const isLoading = reqLoading || penLoading || shelfLoading;

  const stats = [
    { label: "Books Borrowed", value: String(currentBorrows.length), icon: BookOpen, color: "text-primary bg-primary/10" },
    { label: "Due Soon", value: String(dueSoon.length), icon: Clock, color: "text-warning bg-warning/10" },
    { label: "Penalties", value: `₹${totalUnpaid}`, icon: AlertTriangle, color: "text-destructive bg-destructive/10" },
    { label: "On Shelf", value: String(shelfItems.length), icon: Library, color: "text-accent bg-accent/10" },
  ];

  // Build recent activity from requests
  const recentActivity = requests.slice(0, 5).map((r: any) => ({
    action: r.status === "approved" && !r.returned_date ? "Borrowed" : r.status === "returned" || r.returned_date ? "Returned" : r.status === "pending" ? "Requested" : r.status === "rejected" ? "Rejected" : r.type,
    book: r.books?.title || "Unknown",
    date: formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
    status: r.status === "approved" && !r.returned_date ? "active" : r.status,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Welcome back, <span className="text-primary">{profile?.full_name || "Student"}</span>
          </h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your library account.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} shrink-0`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button key={action.label} variant={action.variant} asChild>
              <Link to={action.href}><action.icon className="h-4 w-4 mr-2" />{action.label}</Link>
            </Button>
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex h-2 w-2 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{item.action}</span> — <span className="text-primary">{item.book}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{item.date}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      item.status === "active" ? "bg-accent/10 text-accent" :
                      item.status === "pending" ? "bg-warning/10 text-warning" :
                      item.status === "returned" ? "bg-muted text-muted-foreground" :
                      "bg-primary/10 text-primary"
                    }`}>{item.status}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

import { BookOpen, Users, ClipboardList, AlertCircle, TrendingUp, ArrowUpRight, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/layout/AdminLayout";
import { Link } from "react-router-dom";
import { useAdminStats } from "@/hooks/useAdminStats";
import { useAllBorrowRequests } from "@/hooks/useBorrowRequests";
import { formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const { data: stats, isLoading } = useAdminStats();
  const { data: requests = [] } = useAllBorrowRequests();

  const recentRequests = requests.slice(0, 5);

  const statCards = [
    { label: "Total Books", value: stats?.totalBooks ?? "—", icon: BookOpen, color: "text-primary bg-primary/10" },
    { label: "Active Users", value: stats?.totalUsers ?? "—", icon: Users, color: "text-accent bg-accent/10" },
    { label: "Pending Requests", value: stats?.pendingRequests ?? "—", icon: ClipboardList, color: "text-warning bg-warning/10" },
    { label: "Active Penalties", value: stats?.activePenalties ?? "—", icon: AlertCircle, color: "text-destructive bg-destructive/10" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">System overview and management.</p>
          </div>
          <Button asChild><Link to="/admin/requests">View All Requests <ArrowUpRight className="h-4 w-4 ml-1" /></Link></Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} shrink-0`}><stat.icon className="h-5 w-5" /></div>
                </div>
                <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Requests</CardTitle>
            <Button variant="ghost" size="sm" asChild><Link to="/admin/requests">View all</Link></Button>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No requests yet.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((req: any) => (
                  <div key={req.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                      {(req.profiles?.full_name || "U").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{req.profiles?.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground truncate">{req.books?.title} · {req.type}</p>
                    </div>
                    <span className="text-xs text-muted-foreground hidden sm:block">{formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}</span>
                    <Badge variant={req.status === "pending" ? "secondary" : req.status === "approved" ? "default" : "destructive"} className="text-xs capitalize">{req.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;

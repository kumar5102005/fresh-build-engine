import { Bell, CheckCircle, Clock, AlertTriangle, Trash2, Check, Filter, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useNotifications } from "@/hooks/useNotifications";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof Bell> = { approval: CheckCircle, due: Clock, overdue: AlertTriangle, info: Bell };
const typeColors: Record<string, string> = { approval: "text-accent bg-accent/10", due: "text-warning bg-warning/10", overdue: "text-destructive bg-destructive/10", info: "text-primary bg-primary/10" };

const Notifications = () => {
  const { data: notifications = [], isLoading, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [filter, setFilter] = useState("all");

  const filtered = notifications.filter((n: any) => {
    if (filter === "unread") return !n.read;
    if (filter === "important") return n.type === "overdue" || n.type === "due";
    return true;
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  if (isLoading) {
    return <DashboardLayout><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }

  if (notifications.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4"><Bell className="h-8 w-8 text-muted-foreground" /></div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No notifications</h2>
          <p className="text-muted-foreground text-sm max-w-md">You're all caught up!</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}</p>
          </div>
          <div className="flex gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px]"><Filter className="h-4 w-4 mr-1" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="important">Important</SelectItem>
              </SelectContent>
            </Select>
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()}><Check className="h-4 w-4 mr-1" /> Mark all read</Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => clearAll.mutate()} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" /> Clear all
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map((notif: any) => {
            const Icon = typeIcons[notif.type] || Bell;
            const color = typeColors[notif.type] || "text-primary bg-primary/10";
            return (
              <Card key={notif.id} className={`border-border/50 transition-all cursor-pointer hover:shadow-sm ${!notif.read ? "bg-primary/[0.02] border-l-2 border-l-primary" : ""}`} onClick={() => markAsRead.mutate(notif.id)}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg shrink-0 ${color}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!notif.read ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{notif.title}</p>
                      {!notif.read && <div className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;

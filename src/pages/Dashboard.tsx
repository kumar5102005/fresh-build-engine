import { BookOpen, Clock, AlertTriangle, Search, Library, Loader2, TrendingUp, ArrowUpRight, Sparkles, BookMarked } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useMyBorrowRequests } from "@/hooks/useBorrowRequests";
import { useMyPenalties } from "@/hooks/usePenalties";
import { useShelf } from "@/hooks/useShelf";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const weeklyData = [
  { day: "Mon", borrows: 12, returns: 8 },
  { day: "Tue", borrows: 19, returns: 14 },
  { day: "Wed", borrows: 15, returns: 11 },
  { day: "Thu", borrows: 22, returns: 18 },
  { day: "Fri", borrows: 28, returns: 20 },
  { day: "Sat", borrows: 10, returns: 7 },
  { day: "Sun", borrows: 5, returns: 3 },
];

const aiRecommendations = [
  { title: "Clean Code", author: "Robert C. Martin", rating: 4.8, tag: "Trending" },
  { title: "Design Patterns", author: "Gang of Four", rating: 4.6, tag: "Popular" },
  { title: "The Pragmatic Programmer", author: "Hunt & Thomas", rating: 4.9, tag: "Top Rated" },
];

const quickActions = [
  { label: "Search Books", icon: Search, href: "/books", color: "bg-primary/10 text-primary hover:bg-primary/20" },
  { label: "My Shelf", icon: Library, href: "/my-shelf", color: "bg-accent/10 text-accent hover:bg-accent/20" },
  { label: "AI Assistant", icon: Sparkles, href: "/ai-assistant", color: "bg-warning/10 text-warning hover:bg-warning/20" },
  { label: "My Books", icon: BookMarked, href: "/my-books", color: "bg-info/10 text-info-foreground hover:bg-info/20" },
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
    { label: "Books Borrowed", value: String(currentBorrows.length), icon: BookOpen, color: "bg-primary/10 text-primary", gradient: "from-primary/20 to-primary/5" },
    { label: "Due Soon", value: String(dueSoon.length), icon: Clock, color: "bg-warning/10 text-warning", gradient: "from-warning/20 to-warning/5" },
    { label: "Penalties", value: `₹${totalUnpaid}`, icon: AlertTriangle, color: "bg-destructive/10 text-destructive", gradient: "from-destructive/20 to-destructive/5" },
    { label: "On Shelf", value: String(shelfItems.length), icon: Library, color: "bg-accent/10 text-accent", gradient: "from-accent/20 to-accent/5" },
  ];

  const recentActivity = requests.slice(0, 5).map((r: any) => ({
    action: r.status === "approved" && !r.returned_date ? "Borrowed" : r.status === "returned" || r.returned_date ? "Returned" : r.status === "pending" ? "Requested" : r.status === "rejected" ? "Rejected" : r.type,
    book: r.books?.title || "Unknown",
    date: formatDistanceToNow(new Date(r.created_at), { addSuffix: true }),
    status: r.status === "approved" && !r.returned_date ? "active" : r.status,
  }));

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                Welcome back, <span className="text-primary">{profile?.full_name || "Student"}</span> 👋
              </h1>
              <p className="text-muted-foreground mt-1">Here's your library overview for today.</p>
            </div>
            <Button asChild className="gradient-primary text-primary-foreground rounded-xl shadow-lg hover:shadow-xl transition-shadow w-fit">
              <Link to="/books"><Search className="h-4 w-4 mr-2" />Browse Library</Link>
            </Button>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div key={stat.label} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}>
              <Card className="glass-card border-0 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50`} />
                <CardContent className="p-5 relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} shrink-0`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-muted-foreground/40" />
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">{isLoading ? "—" : stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.href}
                className={`flex items-center gap-3 p-4 rounded-2xl ${action.color} transition-all duration-200 group`}
              >
                <action.icon className="h-5 w-5 shrink-0" />
                <span className="text-sm font-medium">{action.label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Analytics */}
          <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="lg:col-span-2">
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-display">Weekly Activity</CardTitle>
                  <Badge variant="secondary" className="text-xs">This Week</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="borrows" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Borrows" />
                      <Bar dataKey="returns" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} name="Returns" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Recommendations */}
          <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp}>
            <Card className="glass-card border-0 h-full">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <CardTitle className="text-lg font-display">AI Picks</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiRecommendations.map((book) => (
                  <div key={book.title} className="flex items-start gap-3 p-3 rounded-xl bg-surface/50 hover:bg-surface transition-colors group cursor-pointer">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 text-xs font-bold">
                      {book.title.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{book.title}</p>
                      <p className="text-xs text-muted-foreground">{book.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-warning font-medium">★ {book.rating}</span>
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-primary/30 text-primary">{book.tag}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/5 rounded-xl" asChild>
                  <Link to="/ai-assistant">View All Recommendations</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp}>
          <Card className="glass-card border-0">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-display">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary" asChild>
                <Link to="/my-books">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No recent activity yet.</p>
                  <Button variant="link" size="sm" asChild className="mt-2"><Link to="/books">Browse books to get started</Link></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentActivity.map((item: any, i: number) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface/50 transition-colors">
                      <div className="flex h-2 w-2 rounded-full bg-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{item.action}</span> — <span className="text-primary">{item.book}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{item.date}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize rounded-full ${
                          item.status === "active" ? "border-accent/30 text-accent bg-accent/5" :
                          item.status === "pending" ? "border-warning/30 text-warning bg-warning/5" :
                          "border-muted text-muted-foreground"
                        }`}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

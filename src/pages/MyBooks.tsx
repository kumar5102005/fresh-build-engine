import { BookOpen, Clock, AlertTriangle, RotateCcw, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useMyBorrowRequests } from "@/hooks/useBorrowRequests";
import { format, differenceInDays } from "date-fns";

const MyBooks = () => {
  const { data: requests = [], isLoading } = useMyBorrowRequests();

  const currentBooks = requests.filter((r: any) => r.status === "approved" && !r.returned_date);
  const historyBooks = requests.filter((r: any) => r.status === "returned" || r.returned_date);
  const pendingBooks = requests.filter((r: any) => r.status === "pending");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Books</h1>
          <p className="text-muted-foreground mt-1">Track your current borrows and borrowing history.</p>
        </div>

        <Tabs defaultValue="current">
          <TabsList>
            <TabsTrigger value="current">Current ({currentBooks.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBooks.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyBooks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 mt-4">
            {currentBooks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No active borrows.</div>
            ) : currentBooks.map((req: any) => {
              const daysLeft = req.due_date ? differenceInDays(new Date(req.due_date), new Date()) : 0;
              return (
                <Card key={req.id} className="border-border/50">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="h-14 w-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-md flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4 text-primary/30" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground text-sm">{req.books?.title}</h3>
                      <p className="text-xs text-muted-foreground">{req.books?.author}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-muted-foreground">Borrowed: {format(new Date(req.created_at), "MMM d, yyyy")}</span>
                        {req.due_date && <span className="text-xs text-muted-foreground">Due: {format(new Date(req.due_date), "MMM d, yyyy")}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {daysLeft > 0 ? (
                        <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                          <Clock className="h-3 w-3 mr-1" />{daysLeft} days left
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                          <AlertTriangle className="h-3 w-3 mr-1" />Overdue
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="pending" className="space-y-4 mt-4">
            {pendingBooks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No pending requests.</div>
            ) : pendingBooks.map((req: any) => (
              <Card key={req.id} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-14 w-10 bg-gradient-to-br from-primary/10 to-accent/10 rounded-md flex items-center justify-center shrink-0">
                    <BookOpen className="h-4 w-4 text-primary/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">{req.books?.title}</h3>
                    <p className="text-xs text-muted-foreground">{req.books?.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">Requested: {format(new Date(req.created_at), "MMM d, yyyy")}</p>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <Card className="border-border/50">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Book</TableHead>
                    <TableHead className="hidden sm:table-cell">Borrowed</TableHead>
                    <TableHead className="hidden sm:table-cell">Returned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyBooks.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No history yet.</TableCell></TableRow>
                  ) : historyBooks.map((req: any) => (
                    <TableRow key={req.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-foreground">{req.books?.title}</p>
                          <p className="text-xs text-muted-foreground">{req.books?.author}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{req.returned_date ? format(new Date(req.returned_date), "MMM d, yyyy") : "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          <CheckCircle className="h-3 w-3 mr-1" /> Returned
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default MyBooks;

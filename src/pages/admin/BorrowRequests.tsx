import { useState } from "react";
import { Search, Check, X, Eye, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAllBorrowRequests, useUpdateBorrowRequest } from "@/hooks/useBorrowRequests";
import { format } from "date-fns";

const BorrowRequests = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("pending");
  const { data: requests = [], isLoading } = useAllBorrowRequests();
  const updateRequest = useUpdateBorrowRequest();

  const filtered = requests.filter((r: any) => {
    const matchSearch = (r.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) || (r.books?.title || "").toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "all" || r.status === tab;
    return matchSearch && matchTab;
  });

  const pendingCount = requests.filter((r: any) => r.status === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Borrow Requests</h1>
          <p className="text-muted-foreground mt-1">Process and manage book borrow/return requests.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Pending", value: pendingCount, color: "text-warning" },
            { label: "Approved", value: requests.filter((r: any) => r.status === "approved").length },
            { label: "Rejected", value: requests.filter((r: any) => r.status === "rejected").length },
            { label: "Total", value: requests.length },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4">
                <p className={`text-2xl font-bold ${s.color || "text-foreground"}`}>{isLoading ? "—" : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search requests..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <TabsContent value={tab} className="mt-4">
            <Card className="border-border/50">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead className="hidden md:table-cell">Book</TableHead>
                        <TableHead className="hidden sm:table-cell">Type</TableHead>
                        <TableHead className="hidden lg:table-cell">Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((req: any) => (
                        <TableRow key={req.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                                {(req.profiles?.full_name || "U").charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{req.profiles?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground md:hidden">{req.books?.title}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-sm text-foreground">{req.books?.title}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge variant={req.type === "borrow" ? "default" : "secondary"} className="text-xs capitalize">{req.type}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{format(new Date(req.created_at), "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge variant={req.status === "pending" ? "secondary" : req.status === "approved" ? "default" : "destructive"} className="text-xs capitalize">{req.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {req.status === "pending" ? (
                              <div className="flex justify-end gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-accent hover:text-accent" onClick={() => updateRequest.mutate({ id: req.id, status: "approved" })}><Check className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => updateRequest.mutate({ id: req.id, status: "rejected" })}><X className="h-4 w-4" /></Button>
                              </div>
                            ) : (
                              <Button size="icon" variant="ghost" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {filtered.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No requests found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default BorrowRequests;

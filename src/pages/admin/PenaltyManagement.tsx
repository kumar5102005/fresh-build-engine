import { useState } from "react";
import { Search, AlertCircle, IndianRupee, CheckCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAllPenalties, useUpdatePenalty } from "@/hooks/usePenalties";

const PenaltyManagement = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: penalties = [], isLoading } = useAllPenalties();
  const updatePenalty = useUpdatePenalty();

  const filtered = penalties.filter((p: any) => {
    const matchSearch = (p.profiles?.full_name || "").toLowerCase().includes(search.toLowerCase()) || (p.books?.title || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalUnpaid = penalties.filter((p: any) => p.status === "unpaid").reduce((sum: number, p: any) => sum + Number(p.amount), 0);
  const activeCount = penalties.filter((p: any) => p.status === "unpaid").length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Penalty Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage overdue penalties.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Unpaid", value: `₹${totalUnpaid}`, icon: IndianRupee, color: "text-destructive bg-destructive/10" },
            { label: "Active Penalties", value: activeCount, icon: AlertCircle, color: "text-warning bg-warning/10" },
            { label: "Total Paid", value: penalties.filter((p: any) => p.status === "paid").length, icon: CheckCircle, color: "text-accent bg-accent/10" },
            { label: "Waived", value: penalties.filter((p: any) => p.status === "waived").length, icon: Clock, color: "text-muted-foreground bg-muted" },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} shrink-0`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by user or book..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="waived">Waived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

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
                    <TableHead className="hidden lg:table-cell">Days Overdue</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((penalty: any) => (
                    <TableRow key={penalty.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold shrink-0">
                            {(penalty.profiles?.full_name || "U").charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{penalty.profiles?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground md:hidden">{penalty.books?.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-foreground">{penalty.books?.title}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className={`text-sm font-medium ${penalty.days_overdue > 14 ? "text-destructive" : "text-warning"}`}>{penalty.days_overdue} days</span>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-foreground">₹{Number(penalty.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={penalty.status === "unpaid" ? "destructive" : penalty.status === "paid" ? "default" : "secondary"} className="text-xs capitalize">{penalty.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {penalty.status === "unpaid" && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => updatePenalty.mutate({ id: penalty.id, status: "paid" })}>Mark Paid</Button>
                            <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => updatePenalty.mutate({ id: penalty.id, status: "waived" })}>Waive</Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No penalties found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default PenaltyManagement;

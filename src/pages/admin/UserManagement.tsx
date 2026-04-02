import { useState } from "react";
import { Search, Loader2, Trash2, BookOpen, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import AdminLayout from "@/components/layout/AdminLayout";
import { useAdminUsers } from "@/hooks/useAdminStats";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format } from "date-fns";

const UserManagement = () => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const { data: users = [], isLoading } = useAdminUsers();
  const queryClient = useQueryClient();
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userBorrows, setUserBorrows] = useState<any[]>([]);
  const [loadingBorrows, setLoadingBorrows] = useState(false);
  const [deleteDialogUser, setDeleteDialogUser] = useState<any>(null);

  const filtered = users.filter((u: any) => {
    const matchSearch = (u.full_name || "").toLowerCase().includes(search.toLowerCase()) || (u.college_id || "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || (u.user_roles || []).some((r: any) => r.role === roleFilter);
    return matchSearch && matchRole;
  });

  const loadUserBorrows = async (userId: string) => {
    if (expandedUser === userId) { setExpandedUser(null); return; }
    setExpandedUser(userId);
    setLoadingBorrows(true);
    const { data: requests } = await supabase
      .from("borrow_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (requests?.length) {
      const bookIds = [...new Set(requests.map((r) => r.book_id))];
      const { data: books } = await supabase.from("books").select("id, title").in("id", bookIds);
      const booksMap = new Map((books || []).map((b) => [b.id, b.title]));
      setUserBorrows(requests.map((r) => ({ ...r, book_title: booksMap.get(r.book_id) || "Unknown" })));
    } else {
      setUserBorrows([]);
    }
    setLoadingBorrows(false);
  };

  const handleMarkReturned = async (requestId: string) => {
    const { error } = await supabase.from("borrow_requests").update({
      status: "returned" as any,
      returned_date: new Date().toISOString(),
    }).eq("id", requestId);
    if (error) { toast.error("Failed to mark as returned"); return; }
    toast.success("Book marked as returned");
    if (expandedUser) loadUserBorrows(expandedUser);
    queryClient.invalidateQueries({ queryKey: ["all-borrow-requests"] });
  };

  const handleDeleteUser = async (userId: string) => {
    // Delete roles, profile (cascade will handle borrow_requests etc.)
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) { toast.error("Failed to delete user"); return; }
    toast.success("User removed");
    setDeleteDialogUser(null);
    queryClient.invalidateQueries({ queryKey: ["admin-users"] });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage library users and roles.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: users.length },
            { label: "Admins", value: users.filter((u: any) => (u.user_roles || []).some((r: any) => r.role === "admin")).length },
            { label: "Regular Users", value: users.filter((u: any) => (u.user_roles || []).every((r: any) => r.role === "user")).length },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-foreground">{isLoading ? "—" : s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[140px]"><SelectValue placeholder="Role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
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
                    <TableHead className="hidden md:table-cell">Role</TableHead>
                    <TableHead className="hidden lg:table-cell">College ID</TableHead>
                    <TableHead className="hidden sm:table-cell">Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((user: any) => {
                    const roles = (user.user_roles || []).map((r: any) => r.role);
                    const isExpanded = expandedUser === user.id;
                    return (
                      <>
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0 overflow-hidden">
                                {user.avatar_url ? (
                                  <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  (user.full_name || "U").charAt(0)
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{user.full_name || "Unnamed"}</p>
                                <p className="text-xs text-muted-foreground">{user.college_id || "—"}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {roles.map((role: string) => (
                              <Badge key={role} variant={role === "admin" ? "default" : "secondary"} className="text-xs capitalize mr-1">{role}</Badge>
                            ))}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{user.college_id || "—"}</TableCell>
                          <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">{user.phone || "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => loadUserBorrows(user.id)} title="View borrowed books">
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteDialogUser(user)} title="Delete user">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow key={`${user.id}-borrows`}>
                            <TableCell colSpan={5} className="bg-muted/30 p-4">
                              {loadingBorrows ? (
                                <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                              ) : userBorrows.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center">No borrow records found.</p>
                              ) : (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium text-foreground mb-2">Borrowed Books</p>
                                  {userBorrows.map((b) => (
                                    <div key={b.id} className="flex items-center justify-between p-2 rounded border border-border bg-background">
                                      <div>
                                        <p className="text-sm font-medium text-foreground">{b.book_title}</p>
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                          <span>Borrowed: {format(new Date(b.created_at), "MMM d, yyyy")}</span>
                                          {b.due_date && <span>Due: {format(new Date(b.due_date), "MMM d, yyyy")}</span>}
                                          {b.returned_date && <span>Returned: {format(new Date(b.returned_date), "MMM d, yyyy")}</span>}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Badge variant={b.status === "approved" ? "default" : b.status === "returned" ? "secondary" : "outline"} className="text-xs capitalize">{b.status}</Badge>
                                        {b.status === "approved" && (
                                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleMarkReturned(b.id)}>
                                            <RotateCcw className="h-3 w-3 mr-1" /> Mark Returned
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!deleteDialogUser} onOpenChange={(v) => !v && setDeleteDialogUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove <strong>{deleteDialogUser?.full_name || "this user"}</strong>? This will delete their profile and role data.
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogUser(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteDialogUser && handleDeleteUser(deleteDialogUser.id)}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;

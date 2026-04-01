import { useState, useRef } from "react";
import { Search, Plus, MoreHorizontal, Trash2, BookOpen, Loader2, Upload, Image } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/layout/AdminLayout";
import { useBooks } from "@/hooks/useBooks";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const BookInventory = () => {
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const { data: books = [], isLoading } = useBooks();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [newBook, setNewBook] = useState({ title: "", author: "", isbn: "", copies: "1", department: "", category: "CSE", description: "" });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = books.filter((b: any) => {
    const matchSearch = b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()) || (b.isbn || "").includes(search);
    const matchDept = deptFilter === "all" || b.department === deptFilter;
    return matchSearch && matchDept;
  });

  const getStatus = (b: any) => {
    if (b.available_copies === 0) return "unavailable";
    if (b.available_copies <= 1) return "low";
    return "available";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCover = async (bookId: string): Promise<string | null> => {
    if (!coverFile) return null;
    const ext = coverFile.name.split(".").pop();
    const path = `${bookId}.${ext}`;
    const { error } = await supabase.storage.from("book-covers").upload(path, coverFile, { upsert: true });
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddBook = async () => {
    setUploading(true);
    const copies = parseInt(newBook.copies) || 1;
    const bookId = crypto.randomUUID();

    let coverUrl: string | null = null;
    if (coverFile) {
      coverUrl = await uploadCover(bookId);
    }

    const { error } = await supabase.from("books").insert({
      id: bookId,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn || null,
      department: newBook.department || null,
      category: newBook.category,
      description: newBook.description || null,
      total_copies: copies,
      available_copies: copies,
      cover_url: coverUrl,
    });
    if (error) { toast.error("Failed to add book"); setUploading(false); return; }
    toast.success("Book added");
    setOpen(false);
    setNewBook({ title: "", author: "", isbn: "", copies: "1", department: "", category: "CSE", description: "" });
    setCoverFile(null);
    setCoverPreview(null);
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (error) { toast.error("Failed to delete"); return; }
    // Also delete cover from storage
    await supabase.storage.from("book-covers").remove([`${id}.jpg`, `${id}.png`, `${id}.webp`, `${id}.jpeg`]);
    toast.success("Book deleted");
    queryClient.invalidateQueries({ queryKey: ["books"] });
  };

  const totalBooks = books.length;
  const availableBooks = books.filter((b: any) => b.available_copies > 0).length;
  const checkedOut = books.reduce((s: number, b: any) => s + (b.total_copies - b.available_copies), 0);
  const lowStock = books.filter((b: any) => b.available_copies <= 1 && b.available_copies > 0).length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Book Inventory</h1>
            <p className="text-muted-foreground mt-1">Manage the library book collection.</p>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCoverFile(null); setCoverPreview(null); } }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" /> Add Book</Button></DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                {/* Cover upload */}
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-24 w-18 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {coverPreview ? (
                        <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-2">
                          <Image className="h-6 w-6 text-muted-foreground mx-auto" />
                          <span className="text-[10px] text-muted-foreground">Upload</span>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {coverFile && (
                      <div className="text-xs text-muted-foreground">
                        <p>{coverFile.name}</p>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs mt-1" onClick={() => { setCoverFile(null); setCoverPreview(null); }}>Remove</Button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2"><Label>Title</Label><Input value={newBook.title} onChange={(e) => setNewBook({ ...newBook, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>Author</Label><Input value={newBook.author} onChange={(e) => setNewBook({ ...newBook, author: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>ISBN</Label><Input value={newBook.isbn} onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Copies</Label><Input type="number" value={newBook.copies} onChange={(e) => setNewBook({ ...newBook, copies: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={newBook.department} onValueChange={(v) => setNewBook({ ...newBook, department: v })}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {["CSE", "ECE", "MECH", "Math", "Physics"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={newBook.category} onValueChange={(v) => setNewBook({ ...newBook, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Computer Science", "Engineering", "Mathematics", "Science"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddBook} disabled={!newBook.title || !newBook.author || uploading}>
                  {uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Adding...</> : "Add Book"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Books", value: totalBooks },
            { label: "Available", value: availableBooks },
            { label: "Checked Out", value: checkedOut },
            { label: "Low Stock", value: lowStock },
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
                <Input placeholder="Search by title, author, or ISBN..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-full sm:w-[150px]"><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Depts</SelectItem>
                  {["CSE", "ECE", "MECH", "Math", "Physics"].map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
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
                    <TableHead>Book</TableHead>
                    <TableHead className="hidden md:table-cell">ISBN</TableHead>
                    <TableHead className="hidden lg:table-cell">Dept</TableHead>
                    <TableHead className="hidden sm:table-cell">Copies</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((book: any) => {
                    const status = getStatus(book);
                    return (
                      <TableRow key={book.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 overflow-hidden">
                              {book.cover_url ? (
                                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{book.title}</p>
                              <p className="text-xs text-muted-foreground">{book.author}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">{book.isbn || "—"}</TableCell>
                        <TableCell className="hidden lg:table-cell"><Badge variant="secondary" className="text-xs">{book.department || "—"}</Badge></TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">{book.available_copies}/{book.total_copies}</TableCell>
                        <TableCell>
                          <Badge variant={status === "available" ? "default" : status === "low" ? "secondary" : "destructive"} className="text-xs capitalize">
                            {status === "low" ? "Low Stock" : status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(book.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No books found.</TableCell></TableRow>
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

export default BookInventory;

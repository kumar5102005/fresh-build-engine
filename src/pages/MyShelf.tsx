import { useState } from "react";
import { BookOpen, Trash2, CheckSquare, Square, Send, Library, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useShelf } from "@/hooks/useShelf";
import { useCreateBorrowRequest } from "@/hooks/useBorrowRequests";
import { formatDistanceToNow } from "date-fns";

const MyShelf = () => {
  const { data: shelfItems = [], isLoading, removeFromShelf } = useShelf();
  const createBorrow = useCreateBorrowRequest();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === shelfItems.length) setSelected(new Set());
    else setSelected(new Set(shelfItems.map((item: any) => item.book_id)));
  };

  const removeSelected = () => {
    selected.forEach((bookId) => removeFromShelf.mutate(bookId));
    setSelected(new Set());
  };

  const requestBooks = () => {
    const bookIds = selected.size > 0 ? Array.from(selected) : shelfItems.map((item: any) => item.book_id);
    bookIds.forEach((bookId) => createBorrow.mutate({ bookId }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (shelfItems.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mb-4">
            <Library className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Your shelf is empty</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-6">Browse our collection and add books to your shelf before requesting to borrow them.</p>
          <Button asChild><a href="/books">Browse Books</a></Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">My Shelf</h1>
            <p className="text-muted-foreground mt-1">{shelfItems.length} books on your shelf</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selected.size === shelfItems.length ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
              {selected.size === shelfItems.length ? "Deselect All" : "Select All"}
            </Button>
            {selected.size > 0 && (
              <Button variant="destructive" size="sm" onClick={removeSelected}>
                <Trash2 className="h-4 w-4 mr-1" /> Remove ({selected.size})
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shelfItems.map((item: any) => (
            <Card key={item.id} className={`border-border/50 transition-all ${selected.has(item.book_id) ? "ring-2 ring-primary border-primary/30" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox checked={selected.has(item.book_id)} onCheckedChange={() => toggleSelect(item.book_id)} className="mt-1" />
                  <div className="h-16 w-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-md flex items-center justify-center shrink-0">
                    <BookOpen className="h-5 w-5 text-primary/30" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm line-clamp-1">{item.books?.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.books?.author}</p>
                    <p className="text-xs text-muted-foreground mt-1">Added {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeFromShelf.mutate(item.book_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Ready to borrow?</p>
              <p className="text-sm text-muted-foreground">Submit a request for {selected.size > 0 ? `${selected.size} selected` : "all"} books on your shelf.</p>
            </div>
            <Button className="shrink-0" onClick={requestBooks} disabled={createBorrow.isPending}>
              <Send className="h-4 w-4 mr-2" />
              Request {selected.size > 0 ? `Selected (${selected.size})` : `All (${shelfItems.length})`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MyShelf;

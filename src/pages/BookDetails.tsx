import { useParams, Link } from "react-router-dom";
import { BookOpen, Heart, ArrowLeft, Star, Loader2, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBook, useBookReviews } from "@/hooks/useBooks";
import { useShelf } from "@/hooks/useShelf";
import { useCreateBorrowRequest } from "@/hooks/useBorrowRequests";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id!);
  const { data: reviews = [] } = useBookReviews(id!);
  const { addToShelf } = useShelf();
  const createBorrow = useCreateBorrowRequest();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!book) {
    return (
      <DashboardLayout>
        <div className="text-center py-20 text-muted-foreground">Book not found.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/books"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
              <BookOpen className="h-20 w-20 text-primary/20" />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-5">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">{book.title}</h1>
                  <p className="text-lg text-muted-foreground mt-1">{book.author}</p>
                </div>
                <Button variant="ghost" size="icon" className="shrink-0" onClick={() => addToShelf.mutate(book.id)}>
                  <Heart className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mt-3">
                <Badge variant="outline" className={book.available_copies > 0 ? "bg-accent/10 text-accent border-accent/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                  {book.available_copies > 0 ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </div>

            {book.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{book.description}</p>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Publisher", value: book.publisher || "—" },
                { label: "Year", value: book.year ? String(book.year) : "—" },
                { label: "Edition", value: book.edition || "—" },
                { label: "Pages", value: book.pages ? String(book.pages) : "—" },
                { label: "ISBN", value: book.isbn || "—" },
                { label: "Language", value: book.language || "—" },
                { label: "Category", value: book.category },
                { label: "Copies", value: `${book.available_copies}/${book.total_copies}` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => addToShelf.mutate(book.id)} disabled={addToShelf.isPending}>
                <Library className="h-4 w-4 mr-2" /> Add to Shelf
              </Button>
              <Button variant="outline" onClick={() => createBorrow.mutate({ bookId: book.id })} disabled={createBorrow.isPending || book.available_copies === 0}>
                Request to Borrow
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Reviews ({reviews.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              reviews.map((review: any, i: number) => (
                <div key={review.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {Array.from({ length: review.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-foreground">{review.profiles?.full_name || "Anonymous"}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                  {i < reviews.length - 1 && <Separator className="mt-3" />}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default BookDetails;

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { BookOpen, Heart, ArrowLeft, Star, Loader2, Library } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBook, useBookReviews } from "@/hooks/useBooks";
import { useShelf } from "@/hooks/useShelf";
import { useCreateBorrowRequest } from "@/hooks/useBorrowRequests";
import { useCreateReview } from "@/hooks/useBookReview";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: book, isLoading } = useBook(id!);
  const { data: reviews = [] } = useBookReviews(id!);
  const { addToShelf } = useShelf();
  const createBorrow = useCreateBorrowRequest();
  const createReview = useCreateReview();
  const { user } = useAuth();

  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!user || !id) return;
    const check = async () => {
      const { data } = await supabase
        .from("borrow_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", id)
        .in("status", ["approved", "returned"])
        .limit(1);
      setCanReview((data?.length ?? 0) > 0);
    };
    check();
  }, [user, id]);

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

  const handleSubmitReview = () => {
    createReview.mutate(
      { bookId: book.id, rating, comment },
      {
        onSuccess: () => {
          setShowReviewForm(false);
          setComment("");
          setRating(5);
        },
      }
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/books"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Browse</Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center overflow-hidden">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="h-20 w-20 text-primary/20" />
              )}
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Reviews ({reviews.length})</CardTitle>
              {canReview && !showReviewForm && (
                <Button size="sm" onClick={() => setShowReviewForm(true)}>Write Review</Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {showReviewForm && (
              <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} onClick={() => setRating(s)} className="focus:outline-none">
                      <Star className={`h-5 w-5 ${s <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <Label>Comment</Label>
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts about this book..." />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSubmitReview} disabled={createReview.isPending}>
                    {createReview.isPending ? "Submitting..." : "Submit Review"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
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
                    <span className="text-sm font-medium text-foreground">{review.reviewer_name}</span>
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

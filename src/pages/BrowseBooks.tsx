import { useState } from "react";
import { Search, Grid3X3, List, BookOpen, Loader2, Filter, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useBooks } from "@/hooks/useBooks";

const categories = ["All", "CSE", "ECE", "EEE", "MECH", "CIVIL", "Science & Humanities", "SSC Book Bank", "Stories"];
const languages = ["All", "English", "Hindi", "Tamil", "Telugu"];

const BrowseBooks = () => {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("title");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: books = [], isLoading } = useBooks(selectedCategory, search);

  const filtered = books.filter((b) => {
    if (showAvailableOnly && b.available_copies === 0) return false;
    if (selectedLanguage !== "All" && b.language !== selectedLanguage) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "author") return a.author.localeCompare(b.author);
    if (sortBy === "date") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "year") return (b.year || 0) - (a.year || 0);
    if (sortBy === "availability") return b.available_copies - a.available_copies;
    return a.title.localeCompare(b.title);
  });

  const activeFilterCount = [showAvailableOnly, selectedLanguage !== "All"].filter(Boolean).length;

  const clearFilters = () => {
    setShowAvailableOnly(false);
    setSelectedLanguage("All");
    setSelectedCategory("All");
    setSearch("");
    setSortBy("title");
  };

  const getBookCoverUrl = (book: any) => {
    if (book.cover_url) return book.cover_url;
    return null;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Browse Books</h1>
          <p className="text-muted-foreground mt-1">Discover your next great read from our collection.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by title, author, or ISBN..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Sort by" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="author">Author</SelectItem>
              <SelectItem value="date">Date Added</SelectItem>
              <SelectItem value="year">Year</SelectItem>
              <SelectItem value="availability">Availability</SelectItem>
            </SelectContent>
          </Select>
          <Button variant={filtersOpen ? "secondary" : "outline"} onClick={() => setFiltersOpen(!filtersOpen)} className="relative">
            <Filter className="h-4 w-4 mr-2" /> Filters
            {activeFilterCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">{activeFilterCount}</Badge>
            )}
          </Button>
          <div className="flex gap-1 border border-input rounded-md p-0.5">
            <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("grid")}><Grid3X3 className="h-4 w-4" /></Button>
            <Button variant={view === "list" ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("list")}><List className="h-4 w-4" /></Button>
          </div>
        </div>

        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <CollapsibleContent>
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch id="available-only" checked={showAvailableOnly} onCheckedChange={setShowAvailableOnly} />
                    <Label htmlFor="available-only" className="text-sm">Available only</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm text-muted-foreground">Language:</Label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-[130px] h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {languages.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  {activeFilterCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                      <X className="h-3 w-3 mr-1" /> Clear all
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)} className="rounded-full">{cat}</Button>
          ))}
        </div>

        <div className="text-sm text-muted-foreground">{sorted.length} book{sorted.length !== 1 ? "s" : ""} found</div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">No books found matching your criteria.</div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map((book) => {
              const coverUrl = getBookCoverUrl(book);
              return (
                <Link key={book.id} to={`/books/${book.id}`}>
                  <Card className="h-full border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 group cursor-pointer">
                    <CardContent className="p-0">
                      <div className="aspect-[3/4] bg-gradient-to-br from-primary/10 to-accent/10 rounded-t-lg flex items-center justify-center relative overflow-hidden">
                        {coverUrl ? (
                          <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-12 w-12 text-primary/30" />
                        )}
                        <Badge className={`absolute top-3 right-3 ${book.available_copies > 0 ? "bg-accent/10 text-accent border-accent/20" : "bg-destructive/10 text-destructive border-destructive/20"}`} variant="outline">
                          {book.available_copies > 0 ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{book.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{book.author}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-muted-foreground">{book.category}</span>
                          <span className="text-xs text-muted-foreground">{book.available_copies}/{book.total_copies} copies</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {sorted.map((book) => {
              const coverUrl = getBookCoverUrl(book);
              return (
                <Link key={book.id} to={`/books/${book.id}`}>
                  <Card className="border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="h-16 w-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-md flex items-center justify-center shrink-0 overflow-hidden">
                        {coverUrl ? (
                          <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="h-5 w-5 text-primary/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground text-sm">{book.title}</h3>
                        <p className="text-xs text-muted-foreground">{book.author} {book.year ? `(${book.year})` : ""}</p>
                      </div>
                      <Badge className={`shrink-0 ${book.available_copies > 0 ? "bg-accent/10 text-accent border-accent/20" : "bg-destructive/10 text-destructive border-destructive/20"}`} variant="outline">
                        {book.available_copies > 0 ? "Available" : "Unavailable"}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0">{book.available_copies}/{book.total_copies}</span>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BrowseBooks;

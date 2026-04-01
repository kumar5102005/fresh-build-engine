
-- Books table
CREATE TABLE public.books (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  author text NOT NULL,
  isbn text,
  category text NOT NULL DEFAULT 'General',
  department text,
  description text,
  publisher text,
  year integer,
  edition text,
  pages integer,
  language text DEFAULT 'English',
  total_copies integer NOT NULL DEFAULT 1,
  available_copies integer NOT NULL DEFAULT 1,
  cover_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Shelf items (user wishlist/shelf)
CREATE TABLE public.shelf_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Borrow requests
CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'returned');
CREATE TYPE public.request_type AS ENUM ('borrow', 'return');

CREATE TABLE public.borrow_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  type request_type NOT NULL DEFAULT 'borrow',
  status request_status NOT NULL DEFAULT 'pending',
  due_date timestamptz,
  returned_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Penalties
CREATE TYPE public.penalty_status AS ENUM ('unpaid', 'paid', 'waived');

CREATE TABLE public.penalties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  borrow_request_id uuid REFERENCES public.borrow_requests(id) ON DELETE SET NULL,
  days_overdue integer NOT NULL DEFAULT 0,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  status penalty_status NOT NULL DEFAULT 'unpaid',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Book reviews
CREATE TABLE public.book_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON public.books FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_borrow_requests_updated_at BEFORE UPDATE ON public.borrow_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_penalties_updated_at BEFORE UPDATE ON public.penalties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS Policies

-- Books: everyone authenticated can read, admins can manage
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view books" ON public.books FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can insert books" ON public.books FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update books" ON public.books FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete books" ON public.books FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Shelf items: users manage own
ALTER TABLE public.shelf_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own shelf" ON public.shelf_items FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can add to shelf" ON public.shelf_items FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can remove from shelf" ON public.shelf_items FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Borrow requests: users see own, admins see all
ALTER TABLE public.borrow_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own requests" ON public.borrow_requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all requests" ON public.borrow_requests FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create requests" ON public.borrow_requests FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can update requests" ON public.borrow_requests FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Penalties: users see own, admins manage all
ALTER TABLE public.penalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own penalties" ON public.penalties FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can view all penalties" ON public.penalties FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage penalties" ON public.penalties FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Notifications: users manage own
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Book reviews: anyone can read, users manage own
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.book_reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create reviews" ON public.book_reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own reviews" ON public.book_reviews FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own reviews" ON public.book_reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

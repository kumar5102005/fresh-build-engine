
CREATE OR REPLACE FUNCTION public.handle_borrow_request_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When request is approved, decrement available_copies
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    UPDATE public.books
    SET available_copies = GREATEST(available_copies - 1, 0)
    WHERE id = NEW.book_id;
  END IF;

  -- When request is returned, increment available_copies
  IF NEW.status = 'returned' AND OLD.status = 'approved' THEN
    UPDATE public.books
    SET available_copies = LEAST(available_copies + 1, total_copies)
    WHERE id = NEW.book_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_borrow_request_status_change
  BEFORE UPDATE ON public.borrow_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_borrow_request_status_change();

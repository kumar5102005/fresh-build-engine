
-- Delete all existing book records (and related data)
DELETE FROM book_reviews;
DELETE FROM shelf_items;
DELETE FROM borrow_requests;
DELETE FROM penalties;
DELETE FROM books;

-- Drop department column
ALTER TABLE public.books DROP COLUMN IF EXISTS department;

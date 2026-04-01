
-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('book-covers', 'book-covers', true);

-- Allow authenticated users to view book covers
CREATE POLICY "Anyone can view book covers"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'book-covers');

-- Allow admins to upload book covers
CREATE POLICY "Admins can upload book covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-covers'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update book covers
CREATE POLICY "Admins can update book covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-covers'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete book covers
CREATE POLICY "Admins can delete book covers"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-covers'
  AND public.has_role(auth.uid(), 'admin')
);

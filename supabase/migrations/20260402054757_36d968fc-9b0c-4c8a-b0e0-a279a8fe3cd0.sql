
-- Create system_settings table for admin settings persistence
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read settings
CREATE POLICY "Authenticated users can read settings" ON public.system_settings
  FOR SELECT TO authenticated USING (true);

-- Only admins can modify settings
CREATE POLICY "Admins can manage settings" ON public.system_settings
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.system_settings (key, value) VALUES
  ('max_books_student', '5'),
  ('max_books_faculty', '10'),
  ('borrow_duration_days', '14'),
  ('max_renewals', '2'),
  ('penalty_per_day', '10'),
  ('max_penalty', '500'),
  ('auto_suspend_on_penalty', 'true'),
  ('due_date_reminders', 'true'),
  ('reminder_days_before', '3'),
  ('overdue_notifications', 'true');

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can upload avatar" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can update own avatar" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'avatars');

CREATE POLICY "Users can delete own avatar" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'avatars');

-- Add trigger for updated_at on system_settings
CREATE TRIGGER update_system_settings_updated_at
  BEFORE UPDATE ON public.system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Add admin can delete profiles policy
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Add admin can delete user_roles policy  
CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

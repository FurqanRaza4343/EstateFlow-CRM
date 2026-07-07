-- Profiles (linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'Sales Agent' CHECK (role IN ('Admin / Business Owner', 'Sales Manager', 'Sales Agent', 'Field Executive', 'Social Media Manager')),
  avatar_seed TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile and others in same agency
CREATE POLICY "profiles_read_same_agency" ON profiles
  FOR SELECT TO authenticated
  USING (
    agency_id IN (
      SELECT p.agency_id FROM profiles p WHERE p.user_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Insert on signup (trigger-based)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, agency_id, name, email)
  VALUES (
    NEW.id,
    (SELECT id FROM public.agencies ORDER BY created_at ASC LIMIT 1),
    COALESCE(NEW.profile->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

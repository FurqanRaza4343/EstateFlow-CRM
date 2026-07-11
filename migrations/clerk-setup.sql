-- Create requesting_user_id() function for Clerk JWT
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT nullif(auth.jwt() ->> 'sub', '')::text
$$;

-- Update get_user_agency_id to use requesting_user_id
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS UUID
LANGUAGE sql STABLE
SECURITY DEFINER
AS $$
  SELECT agency_id FROM profiles WHERE user_id = requesting_user_id() LIMIT 1;
$$;

-- Alter user_id columns from UUID to TEXT for Clerk compatibility
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE attendance ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE notifications ALTER COLUMN user_id TYPE TEXT;

-- Update RLS policies to use requesting_user_id() instead of auth.uid()
DROP POLICY IF EXISTS profiles_read_same_agency ON profiles;

CREATE POLICY profiles_read_same_agency ON profiles
  FOR SELECT TO authenticated
  USING (agency_id = public.get_user_agency_id() OR user_id = requesting_user_id());

DROP POLICY IF EXISTS profiles_update_own ON profiles;

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE TO authenticated
  USING (user_id = requesting_user_id())
  WITH CHECK (user_id = requesting_user_id());

DROP POLICY IF EXISTS profiles_insert_own ON profiles;

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = requesting_user_id());

-- Update all other table policies to use requesting_user_id in subqueries
-- (the subquery is: SELECT agency_id FROM profiles WHERE user_id = requesting_user_id())
-- These already work via get_user_agency_id() function

-- Fix for User Profile access and RLS issues
BEGIN;

-- 1. Ensure RLS is enabled on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 2. Create proper Supabase RLS policies for the users table
DROP POLICY IF EXISTS "Users can see their own profile" ON users;
CREATE POLICY "Users can see their own profile" ON users 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can see all profiles" ON users;
CREATE POLICY "Admins can see all profiles" ON users 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('ministry_admin', 'super_admin')
    )
  );

-- 3. Also grant necessary permissions if they were lost
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon; -- Allow searching by email during login process if needed, or stick to authenticated

COMMIT;

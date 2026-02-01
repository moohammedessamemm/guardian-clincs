-- FIX RLS INFINITE RECURSION

-- 1. Drop the problematic recursive policies
DROP POLICY IF EXISTS "Staff and Doctors can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- 2. Create a secure function to check roles without triggering RLS lopp
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS public.user_role
LANGUAGE sql
SECURITY DEFINER -- Bypasses RLS
SET search_path = public
STABLE
AS $$
    SELECT role FROM profiles WHERE id = user_id;
$$;

-- 3. Re-create policies using the secure function
-- Admin/Staff/Doctor can view ALL profiles
CREATE POLICY "Staff and Doctors view all" ON profiles
    FOR SELECT USING (
        auth.uid() = id -- Can always see yourself
        OR 
        public.get_user_role(auth.uid()) IN ('admin', 'staff', 'doctor') -- Check role safely
    );

-- Admins can update everyone
CREATE POLICY "Admins update all" ON profiles
    FOR UPDATE USING (
        public.get_user_role(auth.uid()) = 'admin'
    );

-- Verify it works
SELECT count(*) FROM profiles;

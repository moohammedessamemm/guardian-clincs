-- Allow users to update their own profile (Required for Registration to save Gender/Phone)
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';

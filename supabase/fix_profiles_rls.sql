-- Fix for "Dr. Unknown" issue in Medical Records
-- Problem: Patients (and others) can currently ONLY view their own profile due to RLS.
-- This prevents the "join" query on appointments/records from fetching the doctor's name.

-- Solution: Allow authenticated users to view profiles of Doctors and Staff.
-- This lets patients see the name of the doctor they are visiting.

CREATE POLICY "Allow authenticated users to view doctors and staff" ON profiles
    FOR SELECT USING (
        role IN ('doctor', 'staff', 'admin')
    );

-- Alternatively, if we want to be more restrictive, we could try to join against appointments,
-- but that gets complex (circular dependencies sometimes). 
-- Allowing public visibility of "Doctors" is standard for a clinic app.

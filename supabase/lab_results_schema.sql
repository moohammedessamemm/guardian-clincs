-- Lab Results Table and Storage Setup
-- Run this after the main schema.sql

-- -----------------------------------------------------------------------------
-- LAB RESULTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    test_name TEXT NOT NULL,
    test_date DATE NOT NULL,
    file_url TEXT NOT NULL, -- URL to file in Supabase Storage
    file_type TEXT NOT NULL, -- 'pdf' or 'image'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DO $$ BEGIN
    DROP POLICY IF EXISTS "Patients view own lab results" ON lab_results;
    DROP POLICY IF EXISTS "Doctors and staff view all lab results" ON lab_results;
    DROP POLICY IF EXISTS "Doctors can create lab results" ON lab_results;
    DROP POLICY IF EXISTS "Doctors can update own lab results" ON lab_results;
END $$;

-- Patients can view their own lab results
CREATE POLICY "Patients view own lab results" ON lab_results
    FOR SELECT USING (auth.uid() = patient_id);

-- Doctors and staff can view all lab results
CREATE POLICY "Doctors and staff view all lab results" ON lab_results
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
    );

-- Doctors can create lab results
CREATE POLICY "Doctors can create lab results" ON lab_results
    FOR INSERT WITH CHECK (
        auth.uid() = doctor_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
    );

-- Doctors can update their own lab results
CREATE POLICY "Doctors can update own lab results" ON lab_results
    FOR UPDATE USING (
        auth.uid() = doctor_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
    );

-- -----------------------------------------------------------------------------
-- PRESCRIPTION RLS POLICIES (Missing from main schema)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    DROP POLICY IF EXISTS "Patients view own prescriptions" ON prescriptions;
    DROP POLICY IF EXISTS "Doctors view all prescriptions" ON prescriptions;
    DROP POLICY IF EXISTS "Doctors create prescriptions" ON prescriptions;
END $$;

-- Patients can view their own prescriptions
CREATE POLICY "Patients view own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = patient_id);

-- Doctors can view all prescriptions
CREATE POLICY "Doctors view all prescriptions" ON prescriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
    );

-- Doctors can create prescriptions
CREATE POLICY "Doctors create prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        auth.uid() = doctor_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
    );

-- Enable RLS on prescriptions if not already enabled
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- STORAGE BUCKET SETUP
-- -----------------------------------------------------------------------------
-- Note: This needs to be run in Supabase Dashboard SQL Editor or via API
-- Create storage bucket for lab results
INSERT INTO storage.buckets (id, name, public)
VALUES ('lab-results', 'lab-results', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for lab results bucket
DO $$ BEGIN
    DROP POLICY IF EXISTS "Authenticated users can upload lab results" ON storage.objects;
    DROP POLICY IF EXISTS "Users can view their own lab results" ON storage.objects;
    DROP POLICY IF EXISTS "Doctors can view all lab results" ON storage.objects;
END $$;

-- Doctors can upload files
CREATE POLICY "Authenticated users can upload lab results"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'lab-results' AND
    auth.role() = 'authenticated' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
);

-- Patients can view their own files
CREATE POLICY "Users can view their own lab results"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'lab-results' AND
    auth.role() = 'authenticated'
);

-- Doctors can view all files
CREATE POLICY "Doctors can view all lab results"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'lab-results' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
);

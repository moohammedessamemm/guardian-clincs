-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. ENUMS & TYPES (Idempotent)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'staff', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- -----------------------------------------------------------------------------
-- 2. PROFILES (Extends auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role user_role DEFAULT 'patient'::user_role NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger to handle new user signup automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'patient'::user_role -- Hardcode default for stability, or CAST carefully
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop trigger first to ensure clean creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 3. APPOINTMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    doctor_id UUID REFERENCES profiles(id), -- Nullable initially if not assigned
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status appointment_status DEFAULT 'pending'::appointment_status,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. MEDICAL RECORDS (SOAP Notes)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    visit_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    soap_note JSONB DEFAULT '{}'::JSONB, -- { subjective: "", objective: "", assessment: "", plan: "" }
    diagnosis TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. PRESCRIPTIONS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES profiles(id) NOT NULL,
    doctor_id UUID REFERENCES profiles(id) NOT NULL,
    medications JSONB NOT NULL, -- Array of objects: { name, dosage, frequency, duration }
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. KNOWLEDGE BASE (AI Helper)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS knowledge_base (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    tags TEXT[],
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. AUDIT LOGS
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. SECURITY (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper to drop policy if exists (Postgres < 14 doesn't support IF EXISTS on policies neatly without DO block)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Staff and Doctors can view all profiles" ON profiles;
    DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
    
    DROP POLICY IF EXISTS "Patients view own appointments" ON appointments;
    DROP POLICY IF EXISTS "Staff and Doctors view all appointments" ON appointments;
    DROP POLICY IF EXISTS "Patients can book appointments" ON appointments;
    DROP POLICY IF EXISTS "Staff/Doctor manage appointments" ON appointments;
    
    DROP POLICY IF EXISTS "Patients view own records" ON medical_records;
    DROP POLICY IF EXISTS "Doctors view all records" ON medical_records;
    DROP POLICY IF EXISTS "Doctors create records" ON medical_records;
    
    DROP POLICY IF EXISTS "Everyone can read KB" ON knowledge_base;
END $$;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Staff and Doctors can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
    );

CREATE POLICY "Admins can update profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Appointment Policies
CREATE POLICY "Patients view own appointments" ON appointments
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Staff and Doctors view all appointments" ON appointments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
    );

CREATE POLICY "Patients can book appointments" ON appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Staff/Doctor manage appointments" ON appointments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
    );

-- Medical Records Policies
CREATE POLICY "Patients view own records" ON medical_records
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors view all records" ON medical_records
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'admin'))
    );

CREATE POLICY "Doctors create records" ON medical_records
    FOR INSERT WITH CHECK (
        auth.uid() = doctor_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
    );

-- Knowledge Base Policies
CREATE POLICY "Everyone can read KB" ON knowledge_base
    FOR SELECT USING (true);

-- Prescription Policies (Added during audit fix)
CREATE POLICY "Patients view own prescriptions" ON prescriptions
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors view all prescriptions" ON prescriptions
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('doctor', 'staff', 'admin'))
    );

CREATE POLICY "Doctors create prescriptions" ON prescriptions
    FOR INSERT WITH CHECK (
        auth.uid() = doctor_id AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'doctor')
    );

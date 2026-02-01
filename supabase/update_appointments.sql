-- Add new columns to appointments table for detailed intake
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS symptoms TEXT,
ADD COLUMN IF NOT EXISTS symptom_duration TEXT,
ADD COLUMN IF NOT EXISTS chronic_conditions TEXT,
ADD COLUMN IF NOT EXISTS past_surgeries TEXT;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'appointments';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// We use the service_role key here to safely count patient profiles 
// without needing an active, authenticated user session that satisfies RLS.
// This count is safe for public exposure.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient');
      
    if (error) {
      console.error('Error fetching public stats:', error);
      return NextResponse.json({ patientCount: 7540 }, { status: 500 });
    }
    
    const BASE_PATIENT_COUNT = 7540;
    const totalPatients = (count || 0) + BASE_PATIENT_COUNT;
    
    return NextResponse.json({ patientCount: totalPatients });
  } catch (error) {
    return NextResponse.json({ patientCount: 7540 }, { status: 500 });
  }
}

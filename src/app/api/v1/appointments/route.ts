import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // RLS will filter results automatically based on the user's role
    const { data, error } = await supabase
        .from('appointments')
        .select('*, doctor:profiles!doctor_id(*), patient:profiles!patient_id(*)')
        .order('start_time', { ascending: true })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const json = await request.json()
        const { doctor_id, start_time, end_time, reason } = json

        // Basic validation
        if (!start_time || !end_time) {
            return NextResponse.json({ error: 'Start and End time are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('appointments')
            .insert({
                patient_id: user.id, // Enforce patient is current user (or RLS will check)
                doctor_id,
                start_time,
                end_time,
                reason,
                status: 'pending'
            })
            .select()
            .single()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Log activity
        const { logActivity } = await import('@/lib/logger')
        await logActivity('APPOINTMENT_CREATED', { appointment_id: data.id })

        return NextResponse.json(data)
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }
}

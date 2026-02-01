import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardRoot() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    // Default to patient if no role found
    const role = profile?.role || 'patient'

    switch (role) {
        case 'admin':
            redirect('/admin')
        case 'doctor':
            redirect('/doctor')
        case 'staff':
            redirect('/staff')
        case 'patient':
        default:
            redirect('/patient')
    }
}

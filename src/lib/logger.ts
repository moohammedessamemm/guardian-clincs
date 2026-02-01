import { createClient } from '@/lib/supabase/server'

export async function logActivity(action: string, details: Record<string, unknown> = {}) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            await supabase.from('activity_logs').insert({
                user_id: user.id,
                action,
                details,
                ip_address: 'unknown' // In Next.js middleware we can get this
            })
        }
    } catch (err) {
        console.error('Failed to log activity:', err)
    }
}

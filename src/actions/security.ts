'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getUserSessions(userId: string) {
    try {
        const supabase = createAdminClient()

        // Admin check: ensure the caller is an admin
        const callerClient = await createClient()
        const { data: { user: caller } } = await callerClient.auth.getUser()

        if (!caller) return { error: 'Unauthorized' }

        // Check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', caller.id)
            .single()

        if (profile?.role !== 'admin') {
            return { error: 'Unauthorized: Admins only' }
        }

        // Now fetch sessions for the target user
        const { data: sessions, error } = await supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', userId)
            .order('last_active_at', { ascending: false })

        if (error) return { error: error.message }

        return { sessions }
    } catch (error: any) {
        console.error('Server Action Error:', error)
        return { error: 'Internal Server Error: ' + (error.message || String(error)) }
    }
}

export async function revokeSession(sessionId: string, userId: string) {
    try {
        const supabase = createAdminClient()

        // Verify Admin (Caller)
        const callerClient = await createClient()
        const { data: { user: caller } } = await callerClient.auth.getUser()
        if (!caller) return { error: 'Unauthorized' }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', caller.id)
            .single()

        if (profile?.role !== 'admin') {
            return { error: 'Unauthorized' }
        }

        // 1. Mark as revoked in DB
        const { error: dbError } = await supabase
            .from('user_sessions')
            .update({ is_revoked: true })
            .eq('session_id', sessionId) // Supabase Auth Session ID

        if (dbError) return { error: dbError.message }

        // 2. Kill it in Supabase Auth
        // The SDK v2 doesn't expose `deleteSession(id)` reliably in all versions.
        // We use `signOut(userId)` which invalidates all refresh tokens for the user.
        // This is a secure "Global Sign Out" fallback.
        const { error: authError } = await supabase.auth.admin.signOut(userId)

        if (authError) {
            // Log the error but don't fail the action to the UI.
            // The DB update (Step 1) is sufficient because our Middleware checks `user_sessions.is_revoked`.
            // If that flag is true, the middleware forces logout anyway.
            console.warn('Supabase Admin signOut failed (non-critical):', authError)
        }

        revalidatePath(`/admin/users/${userId}`)
        return { success: true }
    } catch (error: any) {
        console.error('Revoke Action Error:', error)
        return { error: 'Internal Server Error: ' + (error.message || String(error)) }
    }
}

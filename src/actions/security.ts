'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getUserSessions(userId: string) {
    const supabase = createAdminClient()

    // Admin check: ensure the caller is an admin
    // Note: We need to verify the *caller's* role, not just trust the function call.
    // However, since this calls a DB table with RLS "Admins view all", the DB will enforce it 
    // IF we used a user-scoped client.
    // But here we use AdminClient to fetch, so we MUST manually check the caller's role first.

    // We can't easily get the caller's session in a Server Action called by AdminClient.
    // So we should use the standard client to get the caller, verify admin, THEN proceed.

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
}

export async function revokeSession(sessionId: string, userId: string) {
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
        console.error('Failed to delete Supabase session:', authError)
        return { error: 'Database updated, but Auth session revocation failed.' }
    }

    revalidatePath(`/admin/users/${userId}`)
    return { success: true }
}

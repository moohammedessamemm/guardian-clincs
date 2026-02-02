'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function updateUserPassword(userId: string, newPassword: string) {
    try {
        // 1. Verify caller is admin
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Unauthorized: No active session' }
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return { error: 'Unauthorized: Admin access required' }
        }

        // 2. Update password using admin client (Service Role)
        const supabaseAdmin = createAdminClient()
        const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            password: newPassword
        })

        if (error) {
            console.error('Supabase admin update error:', error)
            return { error: error.message }
        }

        revalidatePath('/admin/users')
        return { success: true }

    } catch (err: any) {
        console.error('Unexpected error in updateUserPassword:', err)
        return { error: err.message || 'An unexpected error occurred' }
    }
}

export async function deleteUser(userId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Unauthorized: No active session' }
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            return { error: 'Unauthorized: Admin access required' }
        }

        const supabaseAdmin = createAdminClient()

        // 1. Clean up related data (Manual Cascade)
        // We use Promise.all where possible, but some might need sequential deletion if they have dependencies
        // Prescriptions depend on Medical Records, so we delete prescriptions first (though table cascade might exist there, manual is safer)

        await Promise.all([
            supabaseAdmin.from('notifications').delete().eq('user_id', userId),
            supabaseAdmin.from('activity_logs').delete().eq('user_id', userId),
            supabaseAdmin.from('knowledge_base').delete().eq('created_by', userId),
            // For medical/appointment data, check both patient_id and doctor_id
            supabaseAdmin.from('prescriptions').delete().or(`patient_id.eq.${userId},doctor_id.eq.${userId}`),
            supabaseAdmin.from('lab_results').delete().or(`patient_id.eq.${userId},doctor_id.eq.${userId}`),
        ])

        // Medical Records referenced by prescriptions (deleted above)
        await supabaseAdmin.from('medical_records').delete().or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)

        // Appointments
        await supabaseAdmin.from('appointments').delete().or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)


        // 2. Delete from Auth (this usually cascades to profiles if set up correctly via trigger/FK)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) {
            console.error('Supabase admin delete user error:', authError)
            return { error: authError.message }
        }

        // 3. Explicitly try to delete from profiles just in case cascade isn't on
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            // Ignore error if it's already gone
            if (!profileError.message.includes('Foreign key violation')) {
                console.warn('Profile deletion warning (might have been cascaded already):', profileError)
            }
        }

        revalidatePath('/admin/users')
        return { success: true }

    } catch (err: any) {
        console.error('Unexpected error in deleteUser:', err)
        return { error: err.message || 'An unexpected error occurred' }
    }
}

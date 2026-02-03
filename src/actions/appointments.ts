'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function completeAppointment(appointmentId: string) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { error: 'Unauthorized: No active session' }
        }

        // Verify the appointment belongs to this doctor
        const { data: appointment, error: fetchError } = await supabase
            .from('appointments')
            .select('doctor_id')
            .eq('id', appointmentId)
            .single()

        if (fetchError || !appointment) {
            return { error: 'Appointment not found' }
        }

        if (appointment.doctor_id !== user.id) {
            return { error: 'Unauthorized: You can only complete your own appointments' }
        }

        // Update status
        const { error: updateError } = await supabase
            .from('appointments')
            .update({ status: 'completed' })
            .eq('id', appointmentId)

        if (updateError) {
            console.error('Error completing appointment:', updateError)
            return { error: 'Failed to complete appointment' }
        }

        revalidatePath('/doctor/appointments')
        return { success: true }

    } catch (error: any) {
        console.error('Unexpected error in completeAppointment:', error)
        return { error: error.message || 'An unexpected error occurred' }
    }
}

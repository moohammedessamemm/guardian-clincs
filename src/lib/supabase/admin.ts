
import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
        throw new Error('Supabase URL is missing (NEXT_PUBLIC_SUPABASE_URL). Check your .env file.')
    }

    if (!serviceRoleKey) {
        throw new Error('Supabase Service Role Key is missing (SUPABASE_SERVICE_ROLE_KEY). Check your .env file.')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

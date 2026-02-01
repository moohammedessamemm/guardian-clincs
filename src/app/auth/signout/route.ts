import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
    const supabase = await createClient()

    // Check if we have a session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (user) {
        await supabase.auth.signOut()
    }

    return redirect('/login')
}

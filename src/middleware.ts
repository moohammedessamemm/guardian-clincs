import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function middleware(request: NextRequest) {
    try {
        // 1. Run the existing Supabase session update / auth check
        let response = await updateSession(request)

        // 2. SESSION TRACKING LOGIC (Fail-safe)
        // We do this AFTER updateSession ensures headers/cookies are set.
        // We re-instantiate a lightweight client to read the session for logging purposes.
        // Note: updateSession returns a response, but we might want to peek at the session found.
        // However, reading it again might contain overhead. Use the cookies.

        // Actually, best practice: Let's extract the session info directly if possible
        // or just trust that if we have a session cookie, we log it.
        // A simpler approach: use the client created inside updateSession. 
        // But `updateSession` implementation in `src/lib/supabase/middleware.ts` is opaque here.
        // Let's modify `src/lib/supabase/middleware.ts` instead? 
        // NO, the user requested to modify THIS file or integrate with it.
        // Modifying `src/lib/supabase/middleware.ts` is actually cleaner because it already has the `user` object.

        return response
    } catch (error) {
        console.error('CRITICAL MIDDLEWARE ERROR:', error)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

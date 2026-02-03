import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export default async function middleware(request: NextRequest) {
    try {
        // Attempt to run the Supabase session update / auth check
        return await updateSession(request)
    } catch (error) {
        // CATASTROPHIC FAILURE CATCHER
        // If imports fail, network fails, or anything explodes:
        // Log it to server console, but DO NOT CRASH the client.
        // Return a normal response so the user still sees the site.
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

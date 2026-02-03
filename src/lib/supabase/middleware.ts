import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Middleware warning: Supabase environment variables are missing. Skipping session update.')
            return response
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set({ name, value, ...options }))
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        // --- SESSION TRACKING START ---
        if (user) {
            try {
                // Optimization: Track last update to avoid DB slamming
                const lastUpdateCookie = request.cookies.get('guardian_last_activity')
                const now = Date.now()
                // FIX: Reduced throttle to 0 to force instant updates for "Revoked" -> "Active" state recovery.
                // Was: 5 * 60 * 1000 (5 minutes)
                const throttleTime = 0

                if (!lastUpdateCookie || (now - Number(lastUpdateCookie.value) > throttleTime)) {
                    // Update DB
                    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1'
                    const ua = request.headers.get('user-agent') || 'Unknown'

                    // Simple device parsing (can be refined with library, but basic is safer for edge)
                    // We will do full parsing on the client-side or backend display
                    const deviceInfo = {
                        userAgent: ua,
                        ip: ip
                    }

                    // Get session ID (from access token JWT structure if possible, but getUser doesn't return raw session ID easily in all versions)
                    // We can use the user ID + UA hash as a proxy, or better, query `data.session` if we used getSession.
                    // Switch getUser() to getSession() to get the Session ID?
                    // getUser() is safer for auth. getSession() is faster but less secure?
                    // getUser() verifies token.

                    // Let's use getSession() just for the ID if we really need it? 
                    // No, stick to getUser. We'll use the accessToken from cookies to extract 'sub' or session ID?
                    // Actually, Supabase sessions are distinct rows. 
                    // Let's assume we can key off User ID + IP + UA for "logical session". 
                    // Or insert a new row if null.

                    // RE-EVALUATION: To get the true session ID, we need `getSession`.
                    // But `getUser` is what validates.
                    const { data: { session } } = await supabase.auth.getSession()

                    if (session) {
                        // FORCE LOGOUT CHECK
                        // We must check if the session is revoked in the DB.
                        const { data: dbSession } = await supabase
                            .from('user_sessions')
                            .select('is_revoked, last_active_at')
                            .eq('session_id', user.id)
                            .single()

                        if (dbSession?.is_revoked) {
                            const lastSignIn = new Date(user.last_sign_in_at || 0).getTime()
                            const lastActive = new Date(dbSession.last_active_at).getTime()

                            // If the sign-in is older than or equal to the last activity (with 2s buffer),
                            // it means this is the SAME session that was revoked.
                            // If it were a NEW login, lastSignIn would be > lastActive.
                            if (lastSignIn <= lastActive + 2000) {
                                console.log('Enforcing Revocation: Force Logout')
                                await supabase.auth.signOut()
                                return NextResponse.redirect(new URL('/login', request.url))
                            }
                        }

                        // Use RPC for atomic, secure updates that bypass RLS complexity
                        // This corresponds to the `track_session_activity` SQL function.
                        await supabase.rpc('track_session_activity', {
                            p_session_id: user.id,
                            p_user_id: user.id,
                            p_ip: typeof ip === 'string' ? ip.split(',')[0] : ip,
                            p_ua: ua,
                            p_device_info: deviceInfo
                        })

                        // Update cookie for throttling
                        response.cookies.set('guardian_last_activity', String(now), { httpOnly: true, sameSite: 'lax' })
                    }
                }
            } catch (err) {
                // Non-blocking logging error
                console.error('Session tracking error (non-fatal):', err)
            }
        }
        // --- SESSION TRACKING END ---

        const path = request.nextUrl.pathname

        // Define protected prefixes
        const isProtectedRoute =
            path.startsWith('/admin') ||
            path.startsWith('/patient') ||
            (path.startsWith('/doctor') && !path.startsWith('/doctors')) ||
            path.startsWith('/staff')

        // 1. Redirect unauthenticated users trying to access protected routes
        if (!user && isProtectedRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', path)
            return NextResponse.redirect(url)
        }

        // 2. Enforce Role-Based Access Control (RBAC)
        if (user && isProtectedRoute) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            const role = profile?.role

            if (path.startsWith('/admin') && role !== 'admin') {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

            if (path.startsWith('/patient') && role !== 'patient' && role !== 'admin') {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

            if (path.startsWith('/doctor') && role !== 'doctor' && role !== 'admin') {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }

            if (path.startsWith('/staff') && role !== 'staff' && role !== 'admin') {
                return NextResponse.redirect(new URL('/unauthorized', request.url))
            }
        }

        return response

    } catch (e) {
        // If anything fails (network, supabase, etc), we allow the request to proceed
        // to avoid a white screen (fail open). The client-side will handle auth checks.
        console.error('Middleware error:', e)
        return response
    }
}

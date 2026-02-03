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

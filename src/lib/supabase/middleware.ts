import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
        // Fetch user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        // Enforce strict rules
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

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new Response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return response
}

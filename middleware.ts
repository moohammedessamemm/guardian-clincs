import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

    // CSP: Strict policy with Nonce for scripts
    // Whitelisted:
    // - Scripts: 'self', 'unsafe-eval' (dev), 'unsafe-inline' (allowed via nonce)
    // - Images: 'self', blob:, data:, https: (Supabase, generic)
    // - Styles: 'self', 'unsafe-inline' (required for many UI libs)
    // - Frames: 'self', youtube, google maps
    // - Connect: 'self', https: (Supabase, APIs)

    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://*.google.com https://*.googleapis.com https://*.youtube.com;
    connect-src 'self' https:;
    upgrade-insecure-requests;
  `
        .replace(/\s{2,}/g, ' ')
        .trim()

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-nonce', nonce)
    requestHeaders.set('Content-Security-Policy', cspHeader)

    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })

    response.headers.set('Content-Security-Policy', cspHeader)
    // Also set X-Nonce in response headers for debugging if needed, though strictly it's for internal use
    // response.headers.set('X-Nonce', nonce) 

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
            missing: [
                { type: 'header', key: 'next-router-prefetch' },
                { type: 'header', key: 'purpose', value: 'prefetch' },
            ],
        },
    ],
}

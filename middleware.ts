import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
    // 1. Update Session (Rotates Supabase Tokens)
    const response = await updateSession(request)

    // 2. Generate Nonce for CSP
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

    // 3. Define CSP Policy
    // CSP: Strict policy with Nonce for scripts
    // Whitelisted:
    // - Scripts: 'self', 'unsafe-eval' (dev), 'unsafe-inline' (allowed via nonce)
    // - Images: 'self', blob:, data:, https: (Supabase, generic)
    // - Styles: 'self', 'unsafe-inline' (required for many UI libs)
    // - Frames: 'self', youtube, google maps
    // - Connect: 'self', https: (Supabase, APIs)
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com 'nonce-${nonce}';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    frame-src 'self' https://*.google.com https://*.googleapis.com https://*.youtube.com https://challenges.cloudflare.com;
    connect-src 'self' https:;
    upgrade-insecure-requests;
  `
        .replace(/\s{2,}/g, ' ')
        .trim()

    // 4. Set Headers on the Response
    // We modify the response returned by updateSession to ensure we keep the Auth Cookies
    response.headers.set('Content-Security-Policy', cspHeader)
    response.headers.set('x-nonce', nonce)

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

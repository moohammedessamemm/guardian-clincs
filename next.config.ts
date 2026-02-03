import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content-Security-Policy is now handled in middleware.ts with nonces
          // {
          //   key: 'Content-Security-Policy',
          //   value: "...",
          // },
          {
            key: 'Access-Control-Allow-Origin',
            // Restrict to same origin by default (or specific domain if needed).
            // Setting it to the production URL or 'null' prevents wildcard access.
            // Since Next.js API routes default to same-origin, we can often omit this or set it explicitly to the main domain.
            // For strictness, let's use the env var or fallback to same-origin via 'self' equivalent (which isn't a valid header value, so we use a specific domain or omit).
            // However, to fix the reported '*', allowing specific origin is key.
            value: process.env.NEXT_PUBLIC_APP_URL || 'https://guardian-clincs.vercel.app',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-Requested-With, Content-Type, Authorization',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

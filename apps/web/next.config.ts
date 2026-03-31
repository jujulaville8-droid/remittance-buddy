import type { NextConfig } from 'next'

const securityHeaders = [
  // Prevent clickjacking
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // Prevent MIME type sniffing
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Control referrer info in cross-origin requests
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Disable potentially sensitive browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(self)',
  },
  // Force HTTPS for 1 year (only effective over HTTPS)
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  // Basic CSP — tightened per feature as the app grows
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Clerk, Stripe, Stripe.js, Wise, Persona hosted assets
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.remittancebuddy.app https://js.stripe.com https://withpersona.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://img.clerk.com",
      "font-src 'self'",
      "connect-src 'self' https://*.clerk.accounts.dev https://api.stripe.com https://api.wise.com https://withpersona.com https://sdk.vercel.ai",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://withpersona.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  turbopack: {},
  experimental: {
    // Enable partial prerendering (evolving — track for cache components)
    ppr: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
    ],
  },
}

export default nextConfig

import { withSentryConfig } from '@sentry/nextjs'
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
      // Supabase (auth + realtime), Stripe.js, Wise, Persona, Google Fonts, Vercel AI
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://withpersona.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https://cdn.prod.website-files.com",
      "font-src 'self' data: https://cdn.prod.website-files.com https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.wise.com https://withpersona.com https://sdk.vercel.ai",
      "frame-src https://js.stripe.com https://hooks.stripe.com https://withpersona.com",
      "media-src 'self'",
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
  typescript: {
    // Drizzle ORM version mismatch across monorepo causes false type errors
    // CI type-check already runs separately — safe to skip here
    ignoreBuildErrors: true,
  },
  turbopack: {},
  experimental: {
    // Enable partial prerendering (evolving — track for cache components)
    ppr: false,
  },
  images: {
    remotePatterns: [],
  },
}

export default withSentryConfig(nextConfig, {
  // Suppress source map upload logs during build
  silent: true,
  // Upload source maps for better stack traces
  widenClientFileUpload: true,
  // Automatically tree-shake Sentry logger in production
  disableLogger: true,
})

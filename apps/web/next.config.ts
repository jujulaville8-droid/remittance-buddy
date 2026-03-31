import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
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

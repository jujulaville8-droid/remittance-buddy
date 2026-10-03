import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { GeistMono } from 'geist/font/mono'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import MigrationBridge from '@/components/MigrationBridge'
import InstallPrompt from '@/components/InstallPrompt'
import AskPal from '@/components/AskPal'
import './globals.css'

// Use the repository's existing self-hosted fonts so builds do not depend on Google Fonts.
const inter = localFont({
  src: '../../../extension/src/assets/fonts/PlusJakartaSans-Variable.woff2',
  weight: '400 700',
  variable: '--font-sans',
  display: 'swap',
})
const instrumentSerif = localFont({
  src: '../../../extension/src/assets/fonts/DMSerifDisplay-Regular.woff2',
  weight: '400',
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'My Remittance Pal',
    template: '%s | My Remittance Pal',
  },
  description:
    'Compare reference transfer amounts and fees for the Philippines. Check source timestamps and confirm the final offer with your provider.',
  manifest: '/manifest.webmanifest',
  applicationName: 'My Remittance Pal',
  appleWebApp: {
    capable: true,
    title: 'My Remittance Pal',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1220' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <body>
        <MigrationBridge />
        {children}
        <AskPal />
        <InstallPrompt />
        <Analytics />
        <SpeedInsights />
        <Script id="sw-register" strategy="afterInteractive">
          {`if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js').catch(() => {}) }`}
        </Script>
      </body>
    </html>
  )
}

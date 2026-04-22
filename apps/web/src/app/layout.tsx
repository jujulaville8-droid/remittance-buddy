import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { GeistMono } from 'geist/font/mono'
import { Inter, Instrument_Serif } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import MigrationBridge from '@/components/MigrationBridge'
import InstallPrompt from '@/components/InstallPrompt'
import './globals.css'

// Type system (Wise-inspired for the tool, editorial serif kept for hero):
// - Inter for body + UI + numbers (tall x-height, excellent tabular digits,
//   same font Wise uses across their whole product)
// - Instrument Serif kept for display italics on the landing and the
//   /compare greeting (the one editorial moment inside the tool)
// - Geist Mono still used for receipt-style code
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Remittance Buddy',
    template: '%s | Remittance Buddy',
  },
  description: 'AI-powered international money transfers',
  manifest: '/manifest.webmanifest',
  applicationName: 'Remittance Buddy',
  appleWebApp: {
    capable: true,
    title: 'Remit Buddy',
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

import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Compare rates — Remittance Buddy',
  description:
    'Live comparison across every major remittance provider. See the winning route, the exact math, and send with one click.',
}

export default function CompareLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      {children}
      <Footer />
    </main>
  )
}

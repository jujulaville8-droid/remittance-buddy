import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Send money home to the Philippines — Remittance Buddy',
  description:
    'Live rate comparison for Filipino OFWs. Find the best route for sending money to the Philippines via GCash, Maya, bank, or cash pickup — every major provider compared in real time.',
  keywords: [
    'send money to Philippines',
    'remittance Philippines',
    'GCash remittance',
    'OFW remittance',
    'best remittance provider Philippines',
    'Wise vs Remitly Philippines',
  ],
  openGraph: {
    title: 'Send money home to the Philippines — Remittance Buddy',
    description:
      'Live rate comparison for Filipino OFWs. We compare every major provider and tell you which route lands the most pesos for your family.',
    locale: 'en_PH',
  },
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

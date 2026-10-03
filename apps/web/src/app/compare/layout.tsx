import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Compare remittance options to the Philippines — My Remittance Pal',
  description:
    'Compare available remittance options to the Philippines. Review recipient amounts, fees, and data sources, then confirm the final quote with the provider.',
  keywords: [
    'send money to Philippines',
    'remittance Philippines',
    'GCash remittance',
    'OFW remittance',
    'best remittance provider Philippines',
    'Wise vs Remitly Philippines',
  ],
  openGraph: {
    title: 'Compare remittance options to the Philippines — My Remittance Pal',
    description:
      'Review available remittance options, fees, and quote sources for sending to the Philippines. No account needed to compare.',
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

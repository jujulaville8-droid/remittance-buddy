import type { Metadata } from 'next'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Dashboard — My Remittance Pal',
  description: 'Your recipients, transfers, alerts, and family groups in one place.',
}

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <div className="pt-28 pb-20">{children}</div>
      <Footer />
    </main>
  )
}

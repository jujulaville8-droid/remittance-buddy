import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare remittance rates — My Remittance Pal',
  description:
    'Live rate comparison for Filipino OFWs. Find the best route for sending money to the Philippines via GCash, Maya, bank, or cash pickup.',
}

export default function CompareLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return <main className="min-h-screen bg-background text-foreground">{children}</main>
}

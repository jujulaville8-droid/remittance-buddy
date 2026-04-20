import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home — My Remittance Pal',
  description: 'Your recipients, alerts, and recent sends in one place.',
}

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return <main className="min-h-screen bg-background text-foreground">{children}</main>
}

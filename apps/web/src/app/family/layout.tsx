import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'

export default function FamilyLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <div className="pt-24 pb-16">
        <div className="container max-w-4xl">
          <div className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              ← Back to home
            </Link>
          </div>
          {children}
        </div>
      </div>
    </main>
  )
}

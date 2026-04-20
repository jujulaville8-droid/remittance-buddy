import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Remittance Pal — Compare remittance rates',
  description: 'Compare remittance providers in real time. Built for the Filipino diaspora.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-5 pt-10 pb-20">
        <div className="w-full max-w-sm text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            <span aria-label="Philippines">🇵🇭</span>
            <span>For the Filipino diaspora</span>
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground leading-[1.05]">
            Send money home.
          </h1>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Compare every major remittance provider in real time — Wise, Remitly, WorldRemit, Xoom and more.
          </p>

          <Link
            href="/compare?from=USD&amount=500&payout=gcash"
            className="mt-8 inline-flex items-center justify-center gap-2 w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold active:scale-[0.99]"
          >
            Compare rates
            <ArrowUpRight className="h-4 w-4" />
          </Link>

          <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
            <span>100% free</span>
            <span aria-hidden>·</span>
            <span>No signup required</span>
          </div>
        </div>
      </div>
    </main>
  )
}

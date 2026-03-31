import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Remittance Buddy — Send Money to the Philippines',
  description:
    'AI-powered international money transfers. Send money to the Philippines with the best rates, no app download needed. Fast, transparent, and secure.',
  openGraph: {
    title: 'Remittance Buddy — Send Money to the Philippines',
    description:
      'AI-powered international money transfers to the Philippines. Best rates, no app download needed.',
    type: 'website',
    siteName: 'Remittance Buddy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remittance Buddy — Send Money to the Philippines',
    description:
      'AI-powered international money transfers to the Philippines. Best rates, no app download needed.',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-semibold tracking-tight">Remittance Buddy</span>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
            Serving Filipinos abroad
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Send money home.<br />
            <span className="text-muted-foreground">The smart way.</span>
          </h1>
          <p className="mx-auto max-w-xl text-lg text-muted-foreground">
            AI-powered transfers to the Philippines with the best rates available. No app to download — just chat, get a quote, and send.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full rounded-md px-8 py-3 text-sm font-medium transition-colors sm:w-auto"
            >
              Start sending for free
            </Link>
            <Link
              href="/sign-in"
              className="border border-border hover:bg-accent w-full rounded-md px-8 py-3 text-sm font-medium transition-colors sm:w-auto"
            >
              Sign in
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">No hidden fees. No app download. No hassle.</p>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight">
            Why Remittance Buddy?
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                💸
              </div>
              <h3 className="font-semibold">Best rates guaranteed</h3>
              <p className="text-sm text-muted-foreground">
                We compare across providers in real time to get you the best PHP exchange rate every single time.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                🤖
              </div>
              <h3 className="font-semibold">AI-powered, human-friendly</h3>
              <p className="text-sm text-muted-foreground">
                Chat in plain English (or Filipino). Our AI guides you through every step — no confusing forms.
              </p>
            </div>
            <div className="space-y-3 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">
                📱
              </div>
              <h3 className="font-semibold">No app needed</h3>
              <p className="text-sm text-muted-foreground">
                Works right in your browser. Send from your phone, tablet, or laptop — wherever you are.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/40 bg-muted/30 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight">
            How it works
          </h2>
          <div className="space-y-8">
            {[
              {
                step: '1',
                title: 'Chat with our AI',
                description: 'Tell us how much you want to send and where. Our AI handles the rest — no jargon, no paperwork.',
              },
              {
                step: '2',
                title: 'Get an instant quote',
                description: "See the exact rate and total fee upfront. No surprises. Accept only when you're happy.",
              },
              {
                step: '3',
                title: 'Your family receives the money',
                description: 'We send directly to Philippine banks. Fast, tracked, and fully insured.',
              },
            ].map(({ step, title, description }) => (
              <div key={step} className="flex gap-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {step}
                </div>
                <div className="space-y-1 pt-1">
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/sign-up"
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex rounded-md px-8 py-3 text-sm font-medium transition-colors"
            >
              Send your first transfer
            </Link>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t border-border/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-2xl font-semibold tracking-tight">
            Safe, secure, and regulated
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🔒', label: 'Bank-grade encryption', desc: '256-bit SSL on every transfer' },
              { icon: '🏦', label: 'Regulated & licensed', desc: 'Fully compliant money service business' },
              { icon: '✅', label: 'KYC verified', desc: 'Identity-verified accounts only' },
              { icon: '🛡️', label: 'Transfer insurance', desc: 'Every transfer is tracked and insured' },
            ].map(({ icon, label, desc }) => (
              <div key={label} className="rounded-lg border border-border bg-card p-5 space-y-2">
                <div className="text-2xl">{icon}</div>
                <p className="text-sm font-semibold">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-border/40 bg-primary px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl space-y-4">
          <h2 className="text-2xl font-bold text-primary-foreground">
            Ready to send money home?
          </h2>
          <p className="text-primary-foreground/70 text-sm">
            Join thousands of Filipinos abroad who trust Remittance Buddy for fast, affordable transfers.
          </p>
          <Link
            href="/sign-up"
            className="bg-background text-foreground hover:bg-background/90 inline-flex rounded-md px-8 py-3 text-sm font-medium transition-colors"
          >
            Create a free account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <span className="text-sm font-semibold">Remittance Buddy</span>
            <nav className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
              <Link href="/sign-up" className="hover:text-foreground transition-colors">Get started</Link>
              <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Support</span>
            </nav>
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Remittance Buddy. All rights reserved. Money transfers are subject to regulatory requirements.
          </p>
        </div>
      </footer>
    </div>
  )
}

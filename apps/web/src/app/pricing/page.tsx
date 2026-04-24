import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'
import { UpgradeButton } from './upgrade-button'

export const metadata: Metadata = {
  title: 'Pricing — My Remittance Pal',
  description:
    'Free forever for basic sends. Buddy Plus unlocks unlimited transfers, rate alerts, family hub, and priority support for $1.99/month.',
}

const FREE_FEATURES = [
  'Compare every major provider in real time',
  'Recipient book (up to 3 saved)',
  'Up to 3 rate alerts',
  'One family group',
  'Standard support',
] as const

const PLUS_FEATURES = [
  'Everything in Free',
  '**Unlimited** saved recipients',
  '**Unlimited** rate alerts · priority email delivery',
  'Unlimited family groups with shared goals',
  'Weekly savings digest — see what you avoided',
  '20-second rate refresh (vs 60s)',
  'Early access to new corridors',
  'Transfer history CSV export',
  'Ad-free everywhere',
  'Priority support · same-day response',
] as const

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <section className="pt-32 pb-20">
        <div className="container max-w-4xl">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-level-1 mb-5">
              <Sparkles className="h-3 w-3 text-coral" />
              Simple pricing, no surprises
            </div>
            <h1 className="font-display text-5xl lg:text-7xl leading-[0.95] tracking-tight text-foreground mb-5">
              Free forever.
              <br />
              <span className="text-coral">Plus for power users.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Every Buddy user gets the comparison engine and best-price guarantee for free. Upgrade
              to Plus when you want unlimited sends, family features, and savings alerts.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Free plan */}
            <div className="rounded-3xl border border-border bg-card p-8 flex flex-col">
              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Free
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl text-foreground">$0</span>
                  <span className="text-sm text-muted-foreground">forever</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  For occasional senders. All the transparency, none of the commitment.
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/send/recipient?amount=500&payout=gcash"
                className="flex items-center justify-center w-full h-11 rounded-full border border-border bg-background text-foreground text-sm font-semibold hover:bg-muted transition-colors"
              >
                Start sending free
              </Link>
            </div>

            {/* Plus plan */}
            <div className="relative rounded-3xl border-2 border-coral bg-gradient-to-br from-coral/5 via-card to-card p-8 flex flex-col shadow-glow-coral">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <div className="inline-flex items-center gap-1 rounded-full bg-coral text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                  <Sparkles className="h-2.5 w-2.5" />
                  Most popular
                </div>
              </div>

              <div className="mb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-coral mb-2">
                  Buddy Plus
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-5xl text-foreground">$1.99</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  ₱99/month equivalent · Cancel anytime
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  For senders with family depending on you. Unlimited sends, family hub, and rate
                  alerts pay for themselves in one transfer.
                </p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {PLUS_FEATURES.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground">
                    <Check className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                    <span dangerouslySetInnerHTML={{ __html: feature.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') }} />
                  </li>
                ))}
              </ul>

              <UpgradeButton />
            </div>
          </div>

          {/* Trust + FAQ nudge */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 rounded-2xl border border-border bg-card px-6 py-4 text-xs text-muted-foreground">
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-foreground">
                  Free trial
                </div>
                7 days, no card required
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-foreground">
                  Cancel anytime
                </div>
                One click, no questions
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <div className="text-[10px] uppercase tracking-wider font-bold text-foreground">
                  Refund guarantee
                </div>
                First 30 days full refund
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

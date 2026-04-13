'use client'

import { ArrowRight, CheckCircle2, Sparkles, Star, TrendingUp, Zap } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { DrawableUnderline } from './DrawableUnderline'
import { useHeroMotion } from './useHeroMotion'
import { useMagneticTilt } from './useMagneticTilt'
import { useParallax } from './useParallax'

const USD_TO_PHP = 57.42
const QUICK_AMOUNTS = [100, 200, 500, 1000] as const

interface Provider {
  readonly name: string
  readonly fee: number
  readonly rate: number
  readonly speed: string
  readonly badge?: 'best' | 'fastest' | 'cheapest'
}

const PROVIDERS: readonly Provider[] = [
  { name: 'Remittance Buddy pick', fee: 0, rate: USD_TO_PHP, speed: '2 min', badge: 'best' },
  { name: 'Wise', fee: 3.69, rate: USD_TO_PHP * 0.996, speed: '15 min' },
  { name: 'Remitly', fee: 3.99, rate: USD_TO_PHP * 0.994, speed: '30 min' },
  { name: 'Western Union', fee: 5.0, rate: USD_TO_PHP * 0.988, speed: '2 hours' },
]

export function Hero() {
  const [amount, setAmount] = useState<number>(500)

  const quotes = useMemo(() => {
    return PROVIDERS.map((p) => ({
      ...p,
      receive: Math.round((amount - p.fee) * p.rate),
    })) as ReadonlyArray<Provider & { readonly receive: number }>
  }, [amount])

  const best = quotes[0]!
  const worst = quotes.reduce((acc, q) => (q.receive < acc.receive ? q : acc), best)
  const savings = Math.max(0, best.receive - worst.receive)
  const savingsUsd = (savings / USD_TO_PHP).toFixed(2)

  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-32 sm:pb-24 lg:pt-40 lg:pb-32">
      {/* Ambient breathing background */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-40 mask-fade-b" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-coral/20 via-coral/10 to-transparent blur-3xl motion-breathe" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-teal/10 blur-3xl motion-breathe-delayed" />
      </div>

      <div className="container">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div className="max-w-2xl animate-fade-up min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-level-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              Live rates · Updated every 60 seconds
            </div>

            <h1 className="mt-5 font-display text-[2.75rem] leading-[1] sm:text-6xl lg:text-7xl sm:leading-[0.95] tracking-tight text-foreground">
              Send money home.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-coral">Get the most back.</span>
                <DrawableUnderline />
              </span>
            </h1>

            <p className="mt-5 sm:mt-6 text-base sm:text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              Remittance Buddy is a decision engine for international transfers. We compare every provider, do the math out loud, and tell you{' '}
              <span className="text-foreground font-semibold">which one actually wins</span> — for your corridor, your amount, your recipient.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#compare"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-coral px-6 text-base font-semibold text-white shadow-glow-coral hover:shadow-level-4 transition-all active:scale-[0.98]"
              >
                Compare rates now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-card px-5 text-base font-medium text-foreground hover:bg-muted transition-colors"
              >
                How it works
              </Link>
            </div>

            <TrustRow />
          </div>

          {/* Interactive compare widget */}
          <div id="compare" className="relative animate-fade-up min-w-0" style={{ animationDelay: '120ms' }}>
            <CompareWidget
              amount={amount}
              setAmount={setAmount}
              quotes={quotes}
              savings={savings}
              savingsUsd={savingsUsd}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function TrustRow() {
  return (
    <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {['bg-coral', 'bg-teal', 'bg-gold', 'bg-coral'].map((c, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-full ${c} border-2 border-background motion-heartbeat`}
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
        <span>
          <span className="font-semibold text-foreground">12,847</span> transfers compared this week
        </span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
        ))}
        <span className="ml-1">4.9 / 5</span>
      </div>
    </div>
  )
}

interface CompareWidgetProps {
  readonly amount: number
  readonly setAmount: (n: number) => void
  readonly quotes: ReadonlyArray<Provider & { readonly receive: number }>
  readonly savings: number
  readonly savingsUsd: string
}

function CompareWidget({ amount, setAmount, quotes, savings, savingsUsd }: CompareWidgetProps) {
  const best = quotes[0]!
  const rate = best.rate.toFixed(4)
  const arrivalLabel = best.speed
  const motion = useHeroMotion({ target: best.receive })
  const parallaxRef = useParallax({ speed: 0.92, maxOffset: 60 })
  const tiltRef = useMagneticTilt({ maxDeg: 3 })

  return (
    <div ref={parallaxRef} className="relative">
      {/* Ambient glow */}
      <div aria-hidden className="absolute -inset-4 bg-gradient-to-br from-coral/20 via-transparent to-teal/20 blur-2xl rounded-[2rem]" />

      {/* Floating "losing" back card for depth */}
      <div
        aria-hidden
        className="absolute right-0 top-8 w-[82%] h-[92%] rounded-[2rem] bg-card/60 backdrop-blur-sm border border-border shadow-level-2 rotate-6 translate-x-6 -z-0 hidden sm:block"
      >
        <div className="p-6 space-y-3">
          <div className="h-3 w-24 rounded-full bg-muted" />
          <div className="h-6 w-40 rounded-full bg-muted" />
          <div className="mt-6 h-20 w-full rounded-xl bg-muted/60" />
        </div>
      </div>

      {/* Winning artifact (with magnetic tilt on desktop) */}
      <div ref={tiltRef} className="relative rounded-[2rem] bg-card border border-border shadow-level-4 overflow-hidden z-10 transition-transform">
        {/* Receipt header — dark charcoal bar with transaction ID */}
        <div className="bg-foreground text-background px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-coral" />
            <span className="text-xs font-bold uppercase tracking-widest">Our Top Pick</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-background/60">#TRX-8824A</span>
            <div className="flex items-center gap-1 text-[10px] font-semibold text-teal uppercase tracking-wider tabular-nums">
              <span className="h-1.5 w-1.5 rounded-full bg-teal animate-pulse" /> Live · {motion.secondsAgo}s
            </div>
          </div>
        </div>

        {/* Amount input */}
        <div className="px-6 pt-6 pb-4">
          <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            You send
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-2xl border border-border bg-background px-4 h-16 focus-within:border-coral focus-within:ring-2 focus-within:ring-coral/20 transition-all">
            <span className="font-mono text-xl text-muted-foreground">$</span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
              className="flex-1 bg-transparent font-display text-3xl text-foreground outline-none tabular-nums"
              aria-label="Amount to send in USD"
            />
            <span className="text-sm font-medium text-muted-foreground">USD</span>
          </div>
          <div className="mt-2 flex gap-1.5">
            {QUICK_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => setAmount(amt)}
                className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                  amount === amt
                    ? 'bg-coral text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Dotted route divider with provider pill */}
        <div className="relative px-6 py-2 flex items-center">
          <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 border-t-2 border-dotted border-border" />
          <div className="relative mx-auto inline-flex items-center gap-2 rounded-full bg-card border border-border px-3 py-1.5 shadow-level-1">
            <Sparkles className="h-3 w-3 text-coral" />
            <span className="text-xs font-bold text-foreground">via {best.name.replace(' pick', '')}</span>
          </div>
        </div>

        {/* Hero recipient amount */}
        <div className="px-6 pt-3 pb-5">
          <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Recipient gets via GCash
          </div>
          <div
            className={`mt-0.5 flex items-baseline gap-1 text-coral transition-[filter,transform] duration-300 ${
              motion.isFlashing ? 'blur-[0.5px] scale-[1.005]' : ''
            }`}
          >
            <span className="font-display text-2xl leading-none">₱</span>
            <span className="font-display text-5xl leading-none tabular-nums tracking-tight">
              {motion.displayedAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Math breakdown */}
        <div className="mx-6 mb-4 rounded-2xl border border-border bg-background/60 p-4 space-y-2.5">
          <MathRow label="Exchange rate" value={<span className="font-mono">1 USD = {rate} PHP</span>} />
          <MathRow label="Fees" value={<span className="font-mono">${best.fee.toFixed(2)}</span>} />
          <MathRow
            label="Est. arrival"
            value={
              <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                <Zap className="h-3 w-3 text-gold fill-gold" /> {arrivalLabel}
              </span>
            }
          />
        </div>

        {/* Clearest winner callout */}
        {savings > 0 && (
          <div className="mx-6 mb-4 rounded-2xl bg-teal/10 border border-teal/30 p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-teal text-white grid place-items-center shrink-0">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold text-teal leading-tight">Clearest Winner</div>
              <div className="text-xs text-teal/80 mt-0.5 leading-snug">
                Your recipient nets{' '}
                <span className="font-extrabold">+₱{savings.toLocaleString()}</span> vs. the worst option today{' '}
                <span className="text-teal/60">(${savingsUsd} saved)</span>
              </div>
            </div>
          </div>
        )}

        {/* Alternatives */}
        <div className="px-6 pb-5 space-y-2">
          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
            Also ranked
          </div>
          {quotes.slice(1).map((q) => (
            <div
              key={q.name}
              className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5"
            >
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{q.name}</div>
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <span className="font-mono">${q.fee.toFixed(2)}</span>
                  <span>·</span>
                  <span>{q.speed}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-foreground tabular-nums">
                  ₱{q.receive.toLocaleString()}
                </div>
                <div className="text-[10px] text-muted-foreground tabular-nums">
                  −₱{(best.receive - q.receive).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="px-6 pb-6">
          <Link
            href="/sign-up"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-all active:scale-[0.98]"
          >
            Lock this rate <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            No account needed to compare · We earn a small affiliate fee, never from you
          </p>
        </div>
      </div>
    </div>
  )
}

function MathRow({ label, value }: { readonly label: string; readonly value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-semibold">{value}</span>
    </div>
  )
}

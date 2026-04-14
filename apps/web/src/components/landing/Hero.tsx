'use client'

import { ArrowRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useHeroMotion } from './useHeroMotion'
import { useLiveQuotes, type LiveQuote } from './useLiveQuotes'

const USD_TO_PHP_FALLBACK = 57.42
const QUICK_AMOUNTS = [100, 200, 500, 1000] as const

interface Provider {
  readonly name: string
  readonly fee: number
  readonly rate: number
  readonly speed: string
  readonly receive: number
  readonly isWinner?: boolean
}

function buildFallbackProviders(amount: number): readonly Provider[] {
  return [
    {
      name: 'Remitly',
      fee: 0,
      rate: USD_TO_PHP_FALLBACK,
      speed: '2 min',
      receive: Math.round(amount * USD_TO_PHP_FALLBACK),
      isWinner: true,
    },
    {
      name: 'Wise',
      fee: 3.69,
      rate: USD_TO_PHP_FALLBACK * 0.996,
      speed: '15 min',
      receive: Math.round((amount - 3.69) * USD_TO_PHP_FALLBACK * 0.996),
    },
    {
      name: 'Xoom',
      fee: 0,
      rate: USD_TO_PHP_FALLBACK * 0.986,
      speed: '30 min',
      receive: Math.round(amount * USD_TO_PHP_FALLBACK * 0.986),
    },
    {
      name: 'Western Union',
      fee: 5.0,
      rate: USD_TO_PHP_FALLBACK * 0.988,
      speed: '2 hours',
      receive: Math.round((amount - 5.0) * USD_TO_PHP_FALLBACK * 0.988),
    },
  ]
}

function liveQuoteToProvider(q: LiveQuote, isWinner: boolean): Provider {
  return {
    name: q.provider,
    fee: q.fee,
    rate: q.exchangeRate,
    speed: q.deliveryTime,
    receive: Math.round(q.targetAmount),
    isWinner,
  }
}

export function Hero() {
  const [amount, setAmount] = useState<number>(500)

  const { quotes: liveQuotes, loading, error } = useLiveQuotes({
    corridor: 'US-PH',
    sourceCurrency: 'USD',
    targetCurrency: 'PHP',
    sourceAmount: amount,
    payoutMethod: 'gcash',
  })

  const quotes = useMemo<readonly Provider[]>(() => {
    if (liveQuotes.length > 0) {
      return liveQuotes.map((q, i) => liveQuoteToProvider(q, i === 0))
    }
    return buildFallbackProviders(amount)
  }, [liveQuotes, amount])

  const best = quotes[0]!
  const worst = quotes.reduce((acc, q) => (q.receive < acc.receive ? q : acc), best)
  const savings = Math.max(0, best.receive - worst.receive)
  const savingsUsd = (savings / USD_TO_PHP_FALLBACK).toFixed(2)
  const isLive = liveQuotes.length > 0 && !error

  return (
    <section className="relative pt-36 pb-28 sm:pt-44 sm:pb-32 lg:pt-52">
      <div className="container">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-16 lg:gap-20 items-center">
          {/* Copy */}
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-px w-6 bg-foreground/30" />
              Live rates for 11 corridors
            </div>

            <h1 className="mt-8 font-display text-[3.25rem] leading-[0.95] sm:text-[4.5rem] lg:text-[5.5rem] lg:leading-[0.9] tracking-tight text-foreground text-balance">
              The clearest way to send money{' '}
              <span className="italic text-coral">home.</span>
            </h1>

            <p className="mt-8 text-lg text-muted-foreground max-w-xl leading-relaxed">
              We compare every provider in real time and tell you which route saves your family
              the most — in plain language, with the math shown.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="#compare"
                className="group inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-8 text-base font-medium text-background transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Compare rates
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#how"
                className="inline-flex h-14 items-center rounded-full border border-border bg-transparent px-8 text-base font-medium text-foreground transition-colors hover:border-foreground/40"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-14 grid grid-cols-3 max-w-md gap-8">
              <Metric value="$23" label="Avg saved per send" />
              <Metric value="60s" label="Rate refresh" />
              <Metric value="0.5%" label="Flat Buddy fee" />
            </div>
          </div>

          {/* Quote widget */}
          <div id="compare" className="relative">
            <CompareWidget
              amount={amount}
              setAmount={setAmount}
              quotes={quotes}
              savings={savings}
              savingsUsd={savingsUsd}
              isLive={isLive}
              loading={loading}
              best={best}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Metric({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div>
      <div className="font-display text-3xl text-foreground leading-none">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  )
}

interface CompareWidgetProps {
  readonly amount: number
  readonly setAmount: (n: number) => void
  readonly quotes: readonly Provider[]
  readonly savings: number
  readonly savingsUsd: string
  readonly isLive: boolean
  readonly loading: boolean
  readonly best: Provider
}

function CompareWidget({
  amount,
  setAmount,
  quotes,
  savings,
  savingsUsd,
  isLive,
  loading,
  best,
}: CompareWidgetProps) {
  const motion = useHeroMotion({ target: best.receive })

  return (
    <div className="relative">
      {/* Floating "You save" pill */}
      {savings > 0 && (
        <div className="absolute -right-3 top-12 z-20 flex items-center gap-3 rounded-full border border-border bg-card px-5 py-3 shadow-level-3">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-teal/10 text-teal">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              You save
            </div>
            <div className="font-display text-lg leading-none text-foreground mt-0.5">
              ${savingsUsd}
            </div>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="relative rounded-[2rem] bg-card border border-border shadow-level-3 overflow-hidden">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-border px-8 pt-8 pb-6">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Sending
            </div>
            <div className="mt-2 font-display text-2xl leading-none text-foreground">
              ${amount.toLocaleString()} USD → PHP
            </div>
          </div>
          <div
            className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider tabular-nums ${isLive ? 'text-teal' : 'text-muted-foreground'}`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isLive ? 'bg-teal' : loading ? 'bg-gold' : 'bg-muted-foreground'
              }`}
            />
            {isLive ? `Updated ${motion.secondsAgo}s ago` : loading ? 'Fetching…' : 'Demo'}
          </div>
        </div>

        {/* Amount input */}
        <div className="px-8 pt-6">
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 h-16 focus-within:border-foreground/40 transition-colors">
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
                className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-colors ${
                  amount === amt
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:bg-border'
                }`}
              >
                ${amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Provider table header */}
        <div className="mt-8 grid grid-cols-[1.5fr_auto_auto] gap-6 px-8 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          <div>Provider</div>
          <div className="text-right">Fee</div>
          <div className="text-right">Recipient gets</div>
        </div>

        {/* Provider rows */}
        <div className="px-6 pb-6 space-y-1.5">
          {quotes.slice(0, 4).map((q) => (
            <ProviderRow key={q.name} quote={q} isWinner={Boolean(q.isWinner)} />
          ))}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-border bg-background/60 px-8 py-5 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Best-price guarantee · Rate locked 30 min
          </div>
          <Link
            href={`/send/recipient?amount=${amount}&corridor=US-PH&payout=gcash`}
            className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2.5 text-xs font-semibold text-background transition-all hover:-translate-y-0.5"
          >
            Send via {best.name.split(' ')[0]}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}

function ProviderRow({
  quote,
  isWinner,
}: {
  readonly quote: Provider
  readonly isWinner: boolean
}) {
  return (
    <div
      className={`grid grid-cols-[1.5fr_auto_auto] gap-6 items-center rounded-2xl px-3 py-3 transition-colors ${
        isWinner ? 'bg-coral/5 border border-coral/30' : 'border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${
            isWinner ? 'bg-coral text-white' : 'bg-muted text-muted-foreground'
          }`}
        >
          {quote.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground truncate">{quote.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            {quote.speed}
            {isWinner ? ' · Buddy’s pick' : ''}
          </div>
        </div>
      </div>
      <div className="text-right text-sm font-mono text-muted-foreground tabular-nums">
        ${quote.fee.toFixed(2)}
      </div>
      <div className="text-right">
        <div
          className={`text-sm font-bold tabular-nums ${isWinner ? 'text-coral' : 'text-foreground'}`}
        >
          ₱{quote.receive.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

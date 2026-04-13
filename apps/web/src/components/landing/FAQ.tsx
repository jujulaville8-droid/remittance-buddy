'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'Is Remittance Buddy free?',
    a: "Yes, completely free for senders. We earn a small affiliate fee from providers when you choose to send through them. We get paid the same regardless of who wins — so we have no incentive to rank one service over another unfairly.",
  },
  {
    q: 'How do you get the rates?',
    a: 'We pull live rates directly from each provider\'s public API or quote endpoint, refreshing every 60 seconds. We show the mid-market rate, the provider\'s offered rate, and the implied FX spread so you can see every cost — nothing is hidden or estimated.',
  },
  {
    q: "Why do you focus on the Philippines?",
    a: "Because the US → Philippines corridor has unique characteristics — GCash as the #1 delivery method, bank routing rules that change by province, and amounts typically between $100 and $1,000. Generic comparison sites rank providers using global averages and get it wrong. We tuned for this corridor first.",
  },
  {
    q: 'Do I need to create an account?',
    a: "No. You can compare rates and get a recommendation without signing up for anything. If you want to save preferences, track your sends, or get rate alerts, an optional free account unlocks those — but the core tool works without it.",
  },
  {
    q: 'Which providers do you cover?',
    a: 'Wise, Remitly, Western Union, Xoom, MoneyGram, WorldRemit, Ria, Revolut, Zelle, PayPal, Sendwave, Payoneer, and more. We add new ones constantly. If you want one we don\'t cover, tell us — we prioritize by demand.',
  },
  {
    q: 'How is this different from Monito or CompareRemit?',
    a: "They're tables. We're a decision engine. They hand you a spreadsheet and tell you to figure it out — we rank the options for your exact amount and corridor, pick a winner, and explain why it won in one sentence. You leave knowing what to do.",
  },
] as const

export function FAQ() {
  return (
    <section id="faq" className="relative py-24 lg:py-32 border-t border-border/60">
      <div className="container">
        <div className="grid lg:grid-cols-[1fr_1.3fr] gap-12 lg:gap-16">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
              Questions
            </div>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl leading-tight text-foreground">
              Everything you wanted to know.
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Still have questions? We&apos;re easy to reach — and we actually answer.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 text-sm text-foreground">
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
              <span className="text-muted-foreground">Usually reply within a few hours</span>
            </div>
          </div>

          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <FAQItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

interface FAQItemProps {
  readonly q: string
  readonly a: string
  readonly defaultOpen?: boolean
}

function FAQItem({ q, a, defaultOpen }: FAQItemProps) {
  const [open, setOpen] = useState(!!defaultOpen)
  return (
    <div
      className={cn(
        'rounded-2xl border bg-card transition-all duration-300',
        open ? 'border-coral/40 shadow-level-2' : 'border-border hover:border-border/80',
      )}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left p-5 gap-4"
      >
        <span className="font-semibold text-foreground text-base lg:text-lg">{q}</span>
        <ChevronDown
          className={cn(
            'h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-300',
            open && 'rotate-180 text-coral',
          )}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm lg:text-[15px] text-muted-foreground leading-relaxed">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    q: 'Is Remittance Buddy free?',
    a: 'Yes, completely free to compare. We charge a flat 0.5% platform fee only when you choose to send through our rail — and we show it on screen before you confirm. If you pick an affiliate provider instead, we earn a referral fee from them, not from you.',
  },
  {
    q: 'How do you get the rates?',
    a: 'We pull live rates directly from each provider’s public quote endpoint, refreshing every 60 seconds. We show the mid-market rate, the provider’s offered rate, and the implied FX spread so you can see every cost — nothing is hidden or estimated.',
  },
  {
    q: 'Why do you focus on the Philippines?',
    a: 'Because the US → Philippines corridor has unique characteristics — GCash as the #1 delivery method, bank routing rules that change by province, and amounts typically between $100 and $1,000. Generic comparison sites rank providers using global averages and get it wrong. We tuned for this corridor first.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'No. You can compare rates and get a recommendation without signing up for anything. If you want to save recipients, track your sends, or set rate alerts, a free account unlocks those — but the core tool works without it.',
  },
  {
    q: 'Which providers do you cover?',
    a: 'Wise, Remitly, Western Union, Xoom, MoneyGram, WorldRemit, Ria, Revolut, Zelle, PayPal, Sendwave, Payoneer and more. We add new ones constantly. If you want one we don’t cover, tell us — we prioritise by demand.',
  },
] as const

export function FAQ() {
  return (
    <section id="faq" className="relative py-28 lg:py-36">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
            Questions
          </div>
          <h2 className="mt-5 font-display text-4xl lg:text-[3.5rem] leading-[1.05] text-foreground text-balance">
            Frequently asked questions.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Still curious? We&apos;re easy to reach — and we usually reply within a few hours.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} defaultOpen={i === 0} />
          ))}
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
        'rounded-2xl border bg-card transition-colors duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
        open ? 'border-foreground/15' : 'border-border hover:border-foreground/15',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center justify-between w-full text-left p-6 lg:p-7 gap-6 cursor-pointer"
      >
        <span className="font-display text-lg lg:text-xl text-foreground leading-snug">{q}</span>
        <span
          className={cn(
            'grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            open ? 'border-coral bg-coral text-white rotate-45' : 'border-border text-foreground',
          )}
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>
      <div
        className={cn(
          'grid transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <p className="px-6 lg:px-7 pb-7 text-base text-muted-foreground leading-relaxed max-w-2xl">
            {a}
          </p>
        </div>
      </div>
    </div>
  )
}

import { ArrowRight, Calculator, Sparkles, Send } from 'lucide-react'

const STEPS = [
  {
    n: '01',
    icon: Calculator,
    title: 'Tell us the amount',
    body: 'Enter how much you want to send and where. We support US → Philippines first, with more corridors rolling out.',
  },
  {
    n: '02',
    icon: Sparkles,
    title: 'We do the math, out loud',
    body: 'Every provider. Every fee. Every hidden FX markup. No tables to squint at — a clear recommendation with the why behind it.',
  },
  {
    n: '03',
    icon: Send,
    title: 'Send through the winner',
    body: "One tap takes you to the provider that wins for your situation. We're free for you — partners pay us a small referral fee.",
  },
] as const

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 lg:py-32 border-t border-border/60">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
            How it works
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl leading-tight text-foreground">
            Three steps. Zero financial jargon.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Most comparison sites dump a spreadsheet on you and leave. We don&apos;t. Remittance Buddy ranks every option for your exact amount and corridor, then tells you which one wins and why.
          </p>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div
                key={step.n}
                className="group relative rounded-3xl border border-border bg-card p-8 hover:shadow-level-3 hover:-translate-y-1 hover:border-coral/30 transition-all duration-500 overflow-hidden"
              >
                <div
                  aria-hidden
                  className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br from-coral/15 to-transparent opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-700"
                />
                <div className="relative flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-coral/10 grid place-items-center text-coral group-hover:scale-110 group-hover:rotate-[-6deg] transition-transform duration-500">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-4xl text-border group-hover:text-coral/50 transition-colors duration-500">
                    {step.n}
                  </span>
                </div>
                <h3 className="relative mt-6 font-display text-2xl text-foreground leading-snug">
                  {step.title}
                </h3>
                <p className="relative mt-3 text-sm text-muted-foreground leading-relaxed">
                  {step.body}
                </p>
                {i < STEPS.length - 1 && (
                  <ArrowRight
                    aria-hidden
                    className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 h-5 w-5 text-border"
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

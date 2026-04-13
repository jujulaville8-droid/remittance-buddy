import { Eye, Brain, Globe2, Chrome, Lock, HeartHandshake } from 'lucide-react'

const FEATURES = [
  {
    icon: Eye,
    title: 'Transparent math',
    body: 'Every fee, every FX spread, every hidden markup — shown on screen. Nothing buried in fine print.',
  },
  {
    icon: Brain,
    title: 'AI that actually decides',
    body: 'We rank providers for your exact amount, corridor, and delivery method. One winner, explained in plain language.',
  },
  {
    icon: Globe2,
    title: 'Corridor-native',
    body: 'Optimized for US → Philippines. GCash, Maya, bank deposit, cash pickup — we know which route wins and why.',
  },
  {
    icon: Chrome,
    title: 'Chrome extension',
    body: "Visiting Wise or Remitly? Our extension tells you instantly if there's a better option — without leaving the page.",
  },
  {
    icon: Lock,
    title: 'Your data stays yours',
    body: 'We never sell your info, never spam you, never ask for bank details. Just compare and go.',
  },
  {
    icon: HeartHandshake,
    title: 'Free for you, forever',
    body: 'Partners pay us a small referral fee when you use their service. You pay us nothing — ever.',
  },
] as const

export function Features() {
  return (
    <section id="why" className="relative py-24 lg:py-32 bg-card/40 border-y border-border/60">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
            Why Remittance Buddy
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl leading-tight text-foreground">
            Trust over cleverness.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            Money transfer comparison is a noisy space. Most tools show you a wall of numbers and hope you figure it out. We take a different approach — make the choice for you, but show the work so you can trust it.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="group relative rounded-2xl border border-border bg-card p-7 hover:border-coral/40 hover:shadow-level-2 hover:-translate-y-0.5 transition-all duration-500 overflow-hidden"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-coral/0 to-transparent group-hover:via-coral/60 transition-all duration-700"
                />
                <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-coral/15 to-coral/5 grid place-items-center text-coral mb-4 group-hover:from-coral/25 group-hover:to-coral/10 group-hover:scale-105 transition-all duration-500">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative font-display text-xl text-foreground leading-snug">{f.title}</h3>
                <p className="relative mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

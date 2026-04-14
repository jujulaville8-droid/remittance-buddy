import { Eye, Globe2, ShieldCheck } from 'lucide-react'
import { Reveal } from './Reveal'

/**
 * "Values" section — three-column card grid with icons.
 * Sits between the Features row list and the Numbers callout, and mirrors
 * the three-column value-prop pattern common on polished fintech landings.
 */

const VALUES = [
  {
    icon: Eye,
    title: 'Transparency',
    body: 'Every fee, every FX spread, every margin — visible on screen before you confirm. No fine print, no surprises when the transfer lands.',
  },
  {
    icon: Globe2,
    title: 'Corridor-first',
    body: 'We go deep on the routes our users actually use. GCash rules, provincial banks, regional e-wallets — ranked by how they actually behave.',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    body: 'Your data never gets sold, your email never gets shared. We earn our keep from the transfer itself, not from repackaging who you are.',
  },
] as const

export function HowItWorks() {
  return (
    <section id="how" className="relative py-28 lg:py-36">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
            What we stand for
          </div>
          <h2 className="mt-5 font-display text-4xl lg:text-[3.5rem] leading-[1.05] text-foreground text-balance">
            Make your send, well-sent.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            Three principles that shape every ranking and every recommendation we make.
          </p>
        </div>

        <Reveal stagger staggerStep={100} offset={28} className="mt-20 grid md:grid-cols-3 gap-6">
          {VALUES.map((value) => {
            const Icon = value.icon
            return (
              <div
                key={value.title}
                className="group relative rounded-[1.75rem] border border-border bg-card p-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-foreground/15"
              >
                <div className="grid h-12 w-12 place-items-center rounded-full border border-border bg-background text-foreground transition-colors duration-700 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </div>
                <h3 className="mt-12 font-display text-[1.75rem] leading-[1.1] text-foreground text-balance">
                  {value.title}
                </h3>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{value.body}</p>
              </div>
            )
          })}
        </Reveal>
      </div>
    </section>
  )
}

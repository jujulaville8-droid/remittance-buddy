import { ArrowUpRight } from 'lucide-react'
import { Reveal } from './Reveal'

interface Feature {
  readonly metric: string
  readonly title: string
  readonly body: string
}

const FEATURES: readonly Feature[] = [
  {
    metric: '60s',
    title: 'Live rates, zero lag',
    body: 'We hit every provider’s public quote endpoint on a rolling 60-second cache. The rate you see is the rate you get, down to the second we fetched it.',
  },
  {
    metric: '0.5%',
    title: 'Honest platform fee',
    body: 'One flat 0.5% service fee. No hidden FX markup, no mystery spread. We deconstruct “free” transfers to show you exactly where the money goes.',
  },
  {
    metric: '11',
    title: 'Corridors, globally',
    body: 'US, UK, Singapore, UAE, Saudi, Canada, Australia — every major sender market to the Philippines. Mexico and Nigeria roll out next quarter.',
  },
  {
    metric: '24 / 7',
    title: 'Rate alerts that wait for you',
    body: 'Tell us your target rate and we’ll watch the mid-market every 5 minutes. When it hits, we email — once, not endlessly. Six-hour cooldown built in.',
  },
  {
    metric: '$50',
    title: 'Best-price guarantee',
    body: 'Find this exact transfer cheaper anywhere else today and we cover the difference as Buddy credit, up to $50. One rule: same corridor, same amount, same hour.',
  },
]

export function Features() {
  return (
    <section id="why" className="relative py-28 lg:py-36">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20 max-w-5xl">
          <div className="max-w-xl">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
              Platform features
            </div>
            <h2 className="mt-5 font-display text-4xl lg:text-5xl leading-[1.05] text-foreground text-balance">
              Every provider, one clean view.
            </h2>
          </div>
          <p className="max-w-sm text-muted-foreground leading-relaxed">
            We make the choice for you — but we always show the work so you can trust it.
          </p>
        </div>
      </div>

      <Reveal stagger staggerStep={90} offset={24} className="border-y border-border">
        {FEATURES.map((feature, i) => (
          <FeatureRow key={feature.title} feature={feature} index={i} />
        ))}
      </Reveal>
    </section>
  )
}

function FeatureRow({ feature, index }: { readonly feature: Feature; readonly index: number }) {
  return (
    <div className="group relative overflow-hidden border-b border-border last:border-b-0 cursor-pointer transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-card">
      {/* Accent sweep bar on hover — grows from left */}
      <span
        aria-hidden
        className="absolute left-0 top-0 h-full w-1 origin-top scale-y-0 bg-coral transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-y-100"
      />

      <div className="container py-14 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto] lg:gap-16">
          {/* Index number */}
          <div className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {String(index + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
          </div>

          {/* Title + reveal-on-hover description */}
          <div className="min-w-0">
            <h3 className="font-display text-4xl lg:text-[3.5rem] leading-[1] text-foreground tracking-tight transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-1">
              {feature.title}
            </h3>
            <p className="mt-5 max-w-xl text-muted-foreground leading-relaxed lg:max-h-0 lg:opacity-0 lg:-translate-y-2 lg:transition-all lg:duration-700 lg:ease-[cubic-bezier(0.22,1,0.36,1)] lg:overflow-hidden lg:group-hover:max-h-40 lg:group-hover:opacity-100 lg:group-hover:translate-y-0">
              {feature.body}
            </p>
          </div>

          {/* Metric + chevron */}
          <div className="flex items-center gap-6 lg:gap-10 shrink-0">
            <div className="font-display text-5xl lg:text-7xl leading-none tabular-nums text-foreground transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-coral">
              {feature.metric}
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-full border border-border text-foreground transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-coral group-hover:bg-coral group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-[-12deg]">
              <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

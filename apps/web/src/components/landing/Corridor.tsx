import { Smartphone, Building2, Banknote, MapPin, Check } from 'lucide-react'

const DELIVERY_METHODS = [
  { icon: Smartphone, label: 'GCash', desc: '2-minute delivery · 92% of recipients' },
  { icon: Building2, label: 'Bank deposit', desc: 'BPI, BDO, Metrobank · same day' },
  { icon: Banknote, label: 'Cash pickup', desc: 'Cebuana, MLhuillier · 15,000 locations' },
  { icon: MapPin, label: 'Door delivery', desc: 'Select provinces · next day' },
] as const

const HIGHLIGHTS = [
  'Real GCash quotes — not estimates',
  'Provincial bank routing rules baked in',
  'Philippine peso formatted the way locals read it',
  'Remittance amounts your recipient actually uses',
] as const

export function Corridor() {
  return (
    <section id="corridor" className="relative py-28 lg:py-36">
      <div className="container">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-16 lg:gap-24 items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
              Corridor spotlight · US → PH
            </div>
            <h2 className="mt-5 font-display text-4xl lg:text-[3.5rem] leading-[1.05] text-foreground text-balance">
              Built corridor-first for the Philippines.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-lg">
              Every corridor is different. Fees, rails, and FX markups change dramatically by
              destination. We went deep on US → Philippines first — because GCash is the #1
              delivery method, and nobody else ranks for it.
            </p>

            <ul className="mt-10 space-y-4">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <span className="mt-1 grid h-4 w-4 place-items-center rounded-full bg-foreground text-background shrink-0">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[2rem] border border-border bg-card p-8 lg:p-10">
            <div className="flex items-center justify-between mb-8">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Delivery methods
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-teal">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                All live
              </div>
            </div>

            <div className="space-y-1">
              {DELIVERY_METHODS.map((m) => {
                const Icon = m.icon
                return (
                  <div
                    key={m.label}
                    className="group flex items-center gap-4 rounded-2xl border border-transparent p-4 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-border hover:bg-background hover:-translate-y-px"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-border bg-background text-foreground transition-colors duration-500 group-hover:border-coral group-hover:bg-coral group-hover:text-white">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground text-sm">{m.label}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{m.desc}</div>
                    </div>
                    <Check className="h-4 w-4 text-teal shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                )
              })}
            </div>

            <div className="mt-8 flex items-center justify-between rounded-2xl border border-border bg-background px-5 py-4">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Next corridor
                </div>
                <div className="mt-1 font-display text-base text-foreground">US → Mexico</div>
              </div>
              <div className="text-xs font-semibold text-teal">Q2 rollout</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

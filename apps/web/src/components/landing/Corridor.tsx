import { Smartphone, Building2, Banknote, MapPin, Check } from 'lucide-react'

const DELIVERY_METHODS = [
  { icon: Smartphone, label: 'GCash', desc: '2-min delivery · 92% of recipients' },
  { icon: Building2, label: 'Bank deposit', desc: 'BPI, BDO, Metrobank · same day' },
  { icon: Banknote, label: 'Cash pickup', desc: 'Cebuana, MLhuillier · 15,000 locations' },
  { icon: MapPin, label: 'Door delivery', desc: 'Select provinces · next day' },
] as const

const STATS = [
  { value: '57.42', unit: 'PHP / USD', label: 'Mid-market rate today' },
  { value: '$0.00', unit: '', label: 'Starting fee on best pick' },
  { value: '2 min', unit: '', label: 'Fastest to GCash' },
  { value: '24', unit: '', label: 'Providers compared' },
] as const

export function Corridor() {
  return (
    <section id="corridor" className="relative py-24 lg:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-coral">
              <span>🇺🇸 → 🇵🇭</span>
              <span>Corridor spotlight</span>
            </div>
            <h2 className="mt-3 font-display text-4xl lg:text-5xl leading-tight text-foreground">
              Built for sending home to the Philippines.
            </h2>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Every corridor is different. Fees, rails, and FX markups change dramatically by destination. We went deep on US → Philippines first — because GCash is the #1 delivery method, and nobody else ranks for it.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                'Real GCash quotes — not estimates',
                'Provincial bank routing rules baked in',
                'Philippine peso formatted the way locals read it',
                'Remittance amounts your recipient actually uses',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-teal/15 grid place-items-center shrink-0">
                    <Check className="h-3 w-3 text-teal" />
                  </span>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="font-display text-3xl text-foreground leading-none">
                    {s.value}
                    {s.unit && <span className="text-sm text-muted-foreground ml-1">{s.unit}</span>}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground uppercase tracking-wider">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery methods card */}
          <div className="relative">
            <div aria-hidden className="absolute -inset-8 bg-gradient-to-br from-teal/10 via-transparent to-coral/10 blur-3xl rounded-full" />
            <div className="relative rounded-3xl border border-border bg-card shadow-level-3 p-8">
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Delivery methods we rank
              </div>
              <div className="space-y-3">
                {DELIVERY_METHODS.map((m) => {
                  const Icon = m.icon
                  return (
                    <div
                      key={m.label}
                      className="flex items-center gap-4 rounded-2xl border border-border bg-background/60 p-4 hover:border-coral/40 hover:bg-background transition-colors"
                    >
                      <div className="w-11 h-11 rounded-xl bg-coral/10 grid place-items-center text-coral shrink-0">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-foreground">{m.label}</div>
                        <div className="text-xs text-muted-foreground truncate">{m.desc}</div>
                      </div>
                      <Check className="h-4 w-4 text-teal shrink-0" />
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-gradient-to-br from-coral/5 to-teal/5 border border-border p-4 text-center">
                <div className="text-xs text-muted-foreground">Next corridor</div>
                <div className="mt-0.5 font-display text-lg text-foreground">
                  🇺🇸 → 🇲🇽 Mexico · coming Q2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

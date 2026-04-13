const STATS = [
  { value: '$2.4M', label: 'Saved for senders this year', tone: 'coral' },
  { value: '24', label: 'Providers continuously compared', tone: 'teal' },
  { value: '60s', label: 'How often rates refresh', tone: 'gold' },
  { value: '4.9★', label: 'Average rating from users', tone: 'coral' },
] as const

const TONE_CLASS: Record<string, string> = {
  coral: 'from-coral/15 to-coral/5 text-coral',
  teal: 'from-teal/15 to-teal/5 text-teal',
  gold: 'from-gold/15 to-gold/5 text-gold',
}

export function Stats() {
  return (
    <section className="relative py-16 lg:py-20 border-b border-border/60">
      <div className="container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px rounded-3xl overflow-hidden bg-border">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="relative bg-background p-6 sm:p-8 lg:p-10 flex flex-col items-start gap-2 group hover:bg-card transition-colors"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${TONE_CLASS[s.tone]} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
              />
              <div className="relative font-display text-4xl sm:text-5xl lg:text-6xl text-foreground leading-none tracking-tight">
                {s.value}
              </div>
              <div className="relative text-xs sm:text-sm text-muted-foreground leading-snug">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

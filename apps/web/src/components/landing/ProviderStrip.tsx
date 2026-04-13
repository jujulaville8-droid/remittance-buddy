const PROVIDERS = [
  'Wise',
  'Remitly',
  'Western Union',
  'Xoom',
  'MoneyGram',
  'WorldRemit',
  'Ria',
  'Revolut',
  'Zelle',
  'PayPal',
  'Sendwave',
  'Payoneer',
] as const

export function ProviderStrip() {
  const loop = [...PROVIDERS, ...PROVIDERS]
  return (
    <section aria-label="Providers we compare" className="relative py-12 border-y border-border/60 bg-card/30 overflow-hidden">
      <div className="container mb-6">
        <div className="flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
          <span className="h-px w-10 bg-border" />
          We compare every major provider — so you don&apos;t have to
          <span className="h-px w-10 bg-border" />
        </div>
      </div>

      <div
        className="relative flex overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="flex shrink-0 items-center gap-10 px-5 animate-marquee">
          {loop.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="font-display text-2xl lg:text-3xl text-foreground/40 hover:text-foreground transition-colors whitespace-nowrap select-none"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

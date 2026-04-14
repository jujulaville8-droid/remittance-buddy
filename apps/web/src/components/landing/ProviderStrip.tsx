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
    <section
      aria-label="Providers we compare"
      className="relative py-20 lg:py-24 overflow-hidden"
    >
      <div className="container mb-10">
        <div className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          We rank every major money-transfer provider, every 60 seconds
        </div>
      </div>

      <div
        className="group relative flex overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent, black 12%, black 88%, transparent)',
        }}
      >
        <div className="flex shrink-0 items-center gap-16 lg:gap-20 px-8 animate-marquee group-hover:[animation-play-state:paused]">
          {loop.map((name, i) => (
            <div
              key={`${name}-${i}`}
              className="font-display text-3xl lg:text-[2.5rem] leading-none text-foreground/25 hover:text-foreground transition-colors duration-500 whitespace-nowrap select-none"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

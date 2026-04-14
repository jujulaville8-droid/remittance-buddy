/**
 * "Numbers" section — two headline metrics presented as a full-width dark
 * band with oversized serif figures. Creates a visual contrast moment
 * between the Values grid and the FAQ list.
 */
export function Stats() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background px-10 py-20 lg:px-20 lg:py-28">
          <div className="max-w-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal/80">
              By the numbers
            </div>
            <h2 className="mt-6 font-display text-4xl lg:text-5xl leading-[1.05] text-balance">
              Building the savings engine for the diaspora.
            </h2>
          </div>

          <div className="relative mt-20 grid md:grid-cols-2 gap-16 md:gap-24">
            <NumberBlock
              value="$2.4M"
              label="Saved for senders in the past twelve months"
              caption="Average household remits $420 / month — every cent matters."
            />
            <NumberBlock
              value="12,847"
              label="Live comparisons run this week alone"
              caption="Rates refreshed every 60 seconds across every corridor."
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function NumberBlock({
  value,
  label,
  caption,
}: {
  readonly value: string
  readonly label: string
  readonly caption: string
}) {
  return (
    <div>
      <div className="font-display text-6xl lg:text-[6rem] leading-[0.9] text-background">
        {value}
      </div>
      <div className="mt-6 h-px w-16 bg-background/20" />
      <p className="mt-6 text-lg text-background/75 leading-snug max-w-sm">{label}</p>
      <p className="mt-3 text-sm text-background/50 leading-relaxed max-w-sm">{caption}</p>
    </div>
  )
}

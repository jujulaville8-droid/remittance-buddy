import { Star } from 'lucide-react'

/**
 * Thin social-proof strip sitting between Hero and ProviderStrip.
 * Mirrors the common "rating + avatar stack + metric" pattern: a 5-star
 * rating, an overlapping avatar cluster, and two compact metrics.
 */
export function SocialProof() {
  return (
    <section className="relative py-12 lg:py-16">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-10 lg:gap-16">
          {/* Avatar stack + rating */}
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {AVATAR_COLORS.map((c, i) => (
                <div
                  key={i}
                  className={`h-10 w-10 rounded-full border-2 border-background ${c}`}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">4.9 / 5</span> from 1,240 senders
              </div>
            </div>
          </div>

          <Divider />

          <Metric value="12,847" label="Transfers compared this week" />

          <Divider />

          <Metric value="$2.4M" label="Saved for senders this year" highlight />
        </div>
      </div>
    </section>
  )
}

const AVATAR_COLORS = [
  'bg-coral',
  'bg-teal',
  'bg-gold',
  'bg-[hsl(260,50%,60%)]',
  'bg-[hsl(180,50%,40%)]',
] as const

function Metric({
  value,
  label,
  highlight = false,
}: {
  readonly value: string
  readonly label: string
  readonly highlight?: boolean
}) {
  return (
    <div className="text-center sm:text-left">
      <div
        className={`font-display text-2xl lg:text-3xl leading-none tabular-nums ${
          highlight ? 'text-coral' : 'text-foreground'
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

function Divider() {
  return <div className="hidden sm:block h-10 w-px bg-border" />
}

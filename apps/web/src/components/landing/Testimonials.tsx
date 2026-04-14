export function Testimonials() {
  return (
    <section className="relative py-32 lg:py-40">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
            Senders like you
          </div>

          <blockquote className="mt-10 font-display text-3xl sm:text-4xl lg:text-[3.25rem] leading-[1.15] text-foreground text-balance">
            <span className="text-coral">“</span>I used to open four different apps every month
            to see who had the best rate to send back to Manila. Now Buddy just tells me the
            answer. It paid for itself on the first transfer.<span className="text-coral">”</span>
          </blockquote>

          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-foreground text-background font-display text-lg">
              M
            </div>
            <div className="text-left">
              <div className="font-semibold text-foreground text-sm">Mark A.</div>
              <div className="text-xs text-muted-foreground">
                Nurse in New Jersey · Sending to Cebu
              </div>
            </div>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border">
            <MiniStat value="12,847" label="Transfers compared this week" />
            <MiniStat value="$2.4M" label="Saved for senders this year" />
            <MiniStat value="4.9 / 5" label="Average user rating" />
            <MiniStat value="24" label="Providers continuously ranked" />
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniStat({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl text-foreground leading-none">{value}</div>
      <div className="mt-2 text-[11px] text-muted-foreground uppercase tracking-wider text-balance">
        {label}
      </div>
    </div>
  )
}

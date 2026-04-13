import { Quote, Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    body: "I've been sending to my mom in Cebu every month for six years. Remittance Buddy caught that I was leaving ₱840 on the table at my usual provider. Literally paid for a week of groceries back home.",
    author: 'Mark A.',
    role: 'Nurse · New Jersey',
    amount: '$500 / mo',
  },
  {
    body: "The thing I love is it explains why. Not just 'this one is cheaper' — it shows me the FX spread, the fee, the speed. I actually trust the recommendation now.",
    author: 'Jasmine L.',
    role: 'Software Engineer · Seattle',
    amount: '$1,200 / mo',
  },
  {
    body: 'Tried it on a whim and saved $12 on a $300 transfer. Used a provider I had never heard of but would have never found without this tool. The GCash delivery was instant.',
    author: 'Rico M.',
    role: 'Construction · Los Angeles',
    amount: '$300 / mo',
  },
] as const

export function Testimonials() {
  return (
    <section className="relative py-24 lg:py-32 bg-card/40 border-y border-border/60 overflow-hidden">
      <div className="container">
        <div className="max-w-2xl">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral">
            Senders like you
          </div>
          <h2 className="mt-3 font-display text-4xl lg:text-5xl leading-tight text-foreground">
            People saving real money, every month.
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <figure
              key={t.author}
              className="group relative rounded-3xl border border-border bg-card p-7 flex flex-col hover:shadow-level-3 hover:-translate-y-1 hover:border-coral/30 transition-all duration-500 overflow-hidden"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div
                aria-hidden
                className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-coral/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
              />
              <Quote className="relative h-8 w-8 text-coral/25 group-hover:text-coral/50 mb-3 transition-colors duration-500" />
              <blockquote className="text-foreground leading-relaxed text-[15px] flex-1">
                {t.body}
              </blockquote>
              <figcaption className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-foreground text-sm">{t.author}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-0.5 justify-end">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="h-3 w-3 fill-gold text-gold" />
                    ))}
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.amount}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

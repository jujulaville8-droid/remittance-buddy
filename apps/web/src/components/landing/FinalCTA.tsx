import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-foreground text-background px-10 py-20 lg:px-20 lg:py-28">
          <div className="relative grid lg:grid-cols-[1.3fr_1fr] items-end gap-12">
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal/80">
                Start sending smarter
              </div>
              <h2 className="mt-6 font-display text-5xl lg:text-[4rem] leading-[0.95] text-balance">
                Stop losing money to hidden exchange margins.
              </h2>
              <p className="mt-7 text-lg text-background/65 max-w-xl leading-relaxed">
                Free to compare. No account needed. Join senders using data to beat the system and
                send more home every month.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/send/recipient"
                  className="group inline-flex h-14 items-center gap-2 rounded-full bg-background px-8 text-base font-medium text-foreground transition-transform hover:-translate-y-0.5"
                >
                  Start a transfer
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="#compare"
                  className="inline-flex h-14 items-center rounded-full border border-background/25 bg-background/5 px-8 text-base font-medium text-background transition-colors hover:bg-background/10"
                >
                  Compare rates first
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex items-end justify-end">
              <div className="text-right">
                <div className="font-display text-[5rem] leading-none text-background">$23</div>
                <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-background/50">
                  Average saved per transfer
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

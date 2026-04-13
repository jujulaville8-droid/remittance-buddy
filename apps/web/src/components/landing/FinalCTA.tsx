import Link from 'next/link'
import { ArrowRight, Chrome } from 'lucide-react'

export function FinalCTA() {
  return (
    <section className="relative py-24 lg:py-32">
      <div className="container">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-foreground to-[hsl(20_10%_16%)] p-10 lg:p-16 text-background">
          <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.08]" />
          <div
            aria-hidden
            className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-coral/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-teal/20 blur-3xl"
          />

          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 backdrop-blur px-3 py-1.5 text-xs font-medium text-background/90">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-teal" />
              </span>
              Free forever · No signup to compare
            </div>

            <h2 className="mt-5 font-display text-4xl lg:text-6xl leading-[1.05] tracking-tight">
              Stop guessing.
              <br />
              Start sending smarter.
            </h2>
            <p className="mt-5 text-lg lg:text-xl text-background/70 max-w-xl leading-relaxed">
              One comparison. One winner. One tap to send through it. That&apos;s the whole product.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="#compare"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-coral px-6 text-base font-semibold text-white shadow-glow-coral hover:brightness-110 transition-all active:scale-[0.98]"
              >
                Compare rates now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-background/25 bg-background/5 backdrop-blur px-5 text-base font-medium text-background hover:bg-background/15 transition-colors"
              >
                <Chrome className="h-4 w-4" />
                Install the extension
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

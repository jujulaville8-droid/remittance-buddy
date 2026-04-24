import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#compare', label: 'Compare rates' },
      { href: '#how', label: 'How it works' },
      { href: '/alerts', label: 'Rate alerts' },
      { href: '/family', label: 'Family hub' },
      { href: '#', label: 'Chrome extension' },
    ],
  },
  {
    title: 'Corridors',
    links: [
      { href: '#corridor', label: 'US → Philippines' },
      { href: '#', label: 'UK → Philippines' },
      { href: '#', label: 'Singapore → Philippines' },
      { href: '#', label: 'UAE → Philippines' },
      { href: '#', label: 'Request a corridor' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#', label: 'About' },
      { href: '/pricing', label: 'Pricing' },
      { href: '#', label: 'Blog' },
      { href: '#', label: 'Press kit' },
      { href: '#', label: 'Contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '#', label: 'Disclosures' },
      { href: '#', label: 'Affiliate policy' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card">
      <div className="container py-20 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icon.png" alt="" aria-hidden className="h-9 w-auto" />
              <span className="text-lg font-extrabold tracking-tight text-foreground">
                My Remittance <span className="text-blue-600">Pal</span>
              </span>
            </Link>
            <p className="mt-6 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Building financial transparency for the global diaspora. Every cent counts when it
              is going home.
            </p>
            <p className="mt-8 text-xs text-muted-foreground/80 max-w-sm leading-relaxed">
              My Remittance Pal is a comparison tool, not a money transmitter. We earn affiliate
              fees from partners when you send through them. This never affects our rankings.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-12">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground mb-5">
                  {col.title}
                </div>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>© {new Date().getFullYear()} My Remittance Pal Technologies Inc.</div>
          <div className="flex items-center gap-6">
            <span>Made for the diaspora</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>USD · PHP · GBP · AED · SGD</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

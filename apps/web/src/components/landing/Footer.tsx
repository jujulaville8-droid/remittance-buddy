import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '#compare', label: 'Compare rates' },
      { href: '#how', label: 'How it works' },
      { href: '#corridor', label: 'Philippines corridor' },
      { href: '#', label: 'Chrome extension' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#', label: 'About' },
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
    <footer className="relative border-t border-border bg-background">
      <div className="container py-16 lg:py-20">
        <div className="grid lg:grid-cols-[1.5fr_2fr] gap-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-coral to-[hsl(14,75%,62%)] grid place-items-center shadow-glow-coral">
                <span className="font-display text-background text-lg leading-none">R</span>
              </div>
              <span className="font-display text-lg leading-none tracking-tight text-foreground">
                Remittance Buddy
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
              A decision engine for international money transfers. Transparent math. No jargon. We tell you which option actually wins.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              Remittance Buddy is a comparison tool, not a money transmitter. We earn affiliate fees from partners when you send through them. This never affects our rankings.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
                  {col.title}
                </div>
                <ul className="space-y-2.5">
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

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Remittance Buddy. All rights reserved.
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-4">
            <span>🇺🇸 → 🇵🇭 Made for senders</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>Rates by partner APIs</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

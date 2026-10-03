import Link from 'next/link'

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { href: '/compare', label: 'Compare options' },
      { href: '/#how', label: 'How it works' },
      { href: '/extension', label: 'Extension preview' },
    ],
  },
  {
    title: 'Corridors',
    links: [
      { href: '/compare?corridor=US-PH', label: 'US → Philippines' },
      { href: '/compare?corridor=UK-PH', label: 'UK → Philippines' },
      { href: '/compare?corridor=SG-PH', label: 'Singapore → Philippines' },
      { href: '/compare?corridor=AE-PH', label: 'UAE → Philippines' },
    ],
  },
  {
    title: 'Learn more',
    links: [
      { href: '/#faq', label: 'FAQ' },
      { href: '/#corridors', label: 'Sending corridors' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/extension-privacy', label: 'Extension privacy' },
    ],
  },
] as const

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card">
      <div className="container py-20 lg:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_2.6fr]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <span className="text-xl font-extrabold tracking-tight text-foreground">
                My Remittance <span className="text-blue-500">Pal</span>
              </span>
            </Link>
            <p className="mt-6 text-sm text-muted-foreground max-w-sm leading-relaxed">
              Building financial transparency for the global diaspora. Every cent counts when it
              is going home.
            </p>
            <p className="mt-8 text-xs text-muted-foreground/80 max-w-sm leading-relaxed">
              Comparison results use reference data; source collection times vary. Check the source and
              timing, then confirm the final quote and terms with your chosen provider.
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
          <div>© {new Date().getFullYear()} My Remittance Pal</div>
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

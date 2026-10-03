import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Chrome extension preview',
  description:
    'My Remittance Pal Chrome extension is in testing. Use the web comparison while the extension is reviewed.',
}
export default function ExtensionPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Nav />
      <section className="container max-w-3xl pb-24 pt-40">
        <p className="text-sm font-semibold text-blue-700">
          Chrome extension · preview under review
        </p>
        <h1 className="font-display mt-5 text-5xl leading-tight">Compare from your browser.</h1>
        <p className="text-muted-foreground mt-6 text-lg">
          A new popup and side panel bring the Philippines comparison into Chrome. The package has
          been built, but installation and browser interaction checks are still pending.
        </p>
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-semibold">Not yet available in the Chrome Web Store</h2>
          <p className="mt-3 text-sm leading-relaxed">
            No public installation link is offered until those checks are complete. You can use the
            web comparison without installing anything or creating an account.
          </p>
        </div>
        <Link
          href="/compare"
          className="mt-8 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-semibold text-white"
        >
          Compare on the web →
        </Link>
        <div className="text-muted-foreground mt-12 space-y-4 text-sm leading-relaxed">
          <p>
            The preview compares reference recipient amounts, shows included fees and source
            collection times, and remembers your selected corridor and payout preference.
          </p>
          <p>
            Reference amounts are not guaranteed offers. Funding methods and source collection times
            may differ. Payout availability must be confirmed with the provider.
          </p>
          <p>
            Pal does not process transfers. Current provider links are ordinary links, with no
            approved affiliate relationship claimed.
          </p>
          <p>
            <Link href="/extension-privacy" className="underline">
              Extension privacy and permissions
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  )
}

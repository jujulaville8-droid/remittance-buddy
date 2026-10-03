import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = { title: 'Extension Privacy Policy — My Remittance Pal' }
export default function ExtensionPrivacyPage() {
  return (
    <main className="bg-background text-foreground min-h-screen">
      <Nav />
      <article className="container max-w-3xl pb-24 pt-40">
        <p className="text-coral text-sm">Chrome extension · comparison mode v0.3.0</p>
        <h1 className="font-display mt-5 text-5xl">Extension privacy</h1>
        <p className="text-muted-foreground mt-6 text-sm">Last updated: 3 October 2026</p>
        <div className="mt-10 space-y-8 text-base leading-relaxed">
          <section>
            <h2 className="mb-3 text-2xl">What the extension does</h2>
            <p>
              The popup and side panel compare reference transfer amounts for the Philippines. They
              do not initiate transfers, take payments, ask for banking credentials, or require an
              account. Final offers and payout availability must be checked with the provider.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-2xl">Quote requests</h2>
            <p>
              When you request a comparison, the extension sends the amount, source and destination
              currencies, selected corridor and preferred payout method to our API at
              remitance-buddy.vercel.app. Our server requests comparison data from Wise. Hosting
              infrastructure receives ordinary connection information such as your IP address. The
              server uses Sentry for errors; reports may include request metadata, corridor and
              amount. We do not claim that a network request is anonymous or that server logs cannot
              contain this information.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-2xl">Local preferences</h2>
            <p>
              Your default corridor, payout preference and interface preference are stored in
              Chrome’s local extension storage. The amount is also kept in temporary browser-session storage so the popup and panel can use the same comparison. The current comparison mode does not collect or
              upload click histories, chat messages or authentication information. Earlier versions
              may have stored account sessions or click history; upgrading does not erase that older
              local data. You can remove the extension and its stored data through Chrome.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-2xl">Provider links</h2>
            <p>
              Choosing a provider opens its website, where that provider’s privacy policy applies.
              Current links are ordinary provider links. No approved affiliate relationship or
              commission is claimed. Any future tracking or affiliate behavior requires updated
              disclosure before release.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-2xl">Permissions</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Storage: remember your preferences on this device</li>
              <li>Side panel: show the expanded comparison</li>
              <li>Access to remitance-buddy.vercel.app: retrieve comparison results</li>
            </ul>
            <p className="mt-3">
              The extension does not request browsing history, page content, access to all websites,
              background alarms or notifications. The legacy account/chat code is not included in
              the current comparison entry points.
            </p>
          </section>
          <section>
            <h2 className="mb-3 text-2xl">Questions and changes</h2>
            <p>
              For product questions, use the{' '}
              <a
                className="underline"
                href="https://github.com/jujulaville8-droid/remittance-buddy/issues"
              >
                project issue tracker
              </a>
              . Do not post personal or financial details in public issues. Changes to the
              extension’s behavior will be reflected here before the corresponding release.
            </p>
          </section>
        </div>
        <Link className="mt-12 inline-block underline" href="/compare">
          Back to comparison
        </Link>
      </article>
      <Footer />
    </main>
  )
}

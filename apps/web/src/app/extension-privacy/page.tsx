import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

export const metadata: Metadata = {
  title: 'Extension Privacy Policy — Remittance Buddy',
  description:
    'Privacy policy for the Remittance Buddy Chrome extension. What we collect, what we don’t, and where your data lives.',
}

export default function ExtensionPrivacyPage() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <article className="pt-40 pb-24">
        <div className="container max-w-3xl">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
            Chrome Extension
          </div>
          <h1 className="mt-5 font-display text-5xl lg:text-[3.5rem] leading-[1.05] text-foreground">
            Privacy Policy
          </h1>
          <p className="mt-6 text-sm text-muted-foreground">Last updated: 14 April 2026</p>

          <div className="mt-12 space-y-10 text-[15px] leading-relaxed text-foreground/90">
            <Section title="What this policy covers">
              This policy describes the data practices for the{' '}
              <strong>Remittance Buddy</strong> Chrome extension. The extension compares live
              remittance rates from public provider quote endpoints and displays the results to
              you. It is a comparison tool only — it does not move money, store payment details,
              or collect identifiable information about you.
            </Section>

            <Section title="What we collect">
              <p className="mb-3">The extension collects nothing about you personally.</p>
              <p className="mb-3">
                When you open the popup or side panel, the extension sends a request to our
                public rate-comparison API with the following non-identifying parameters:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Amount you want to send (e.g. 500)</li>
                <li>Source and target currencies (e.g. USD, PHP)</li>
                <li>Your selected corridor (e.g. US→PH)</li>
                <li>Your preferred payout method (GCash, bank, cash pickup, etc.)</li>
              </ul>
              <p className="mt-4">
                These parameters are used to fetch quotes and are not linked to any user
                identifier, account, email, IP-based profile, or cookie.
              </p>
            </Section>

            <Section title="What we store on your device">
              <p className="mb-3">
                The extension uses <code>chrome.storage.local</code> to save your preferences so
                they persist across sessions. Stored locally only:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Default corridor and payout method</li>
                <li>Optional API base URL override</li>
                <li>Onboarding-completed flag</li>
              </ul>
              <p className="mt-4">
                None of this data leaves your device. Clearing your browser storage or
                uninstalling the extension removes it entirely.
              </p>
            </Section>

            <Section title="What we do not collect">
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Names, emails, phone numbers, or contact information</li>
                <li>Bank accounts, card numbers, or other payment details</li>
                <li>Browsing history or page content from sites you visit</li>
                <li>IP-based location or device fingerprints</li>
                <li>Third-party tracking or advertising identifiers</li>
              </ul>
            </Section>

            <Section title="Third parties">
              <p className="mb-3">
                Rate data is fetched from each provider’s public quote endpoint (Wise, Remitly,
                Xoom, MoneyGram, Western Union and others) via our server. No third-party
                analytics, advertising, or tracking SDK is bundled with the extension.
              </p>
              <p>
                Server-side we use Sentry for crash reporting on the comparison API. Sentry
                receives stack traces and request metadata for failed requests — not quote
                parameters and not any user identifier.
              </p>
            </Section>

            <Section title="Permissions we request">
              <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                <li>
                  <strong>storage</strong> — save your preferences on your device
                </li>
                <li>
                  <strong>sidePanel</strong> — open the comparison side panel when you click the
                  extension icon
                </li>
                <li>
                  <strong>alarms</strong> — schedule the quote refresh timer
                </li>
                <li>
                  <strong>notifications</strong> — (future) notify you when a rate alert
                  triggers
                </li>
              </ul>
              <p className="mt-4">
                The extension does not request access to your browsing history, open tabs, or
                content on any third-party website.
              </p>
            </Section>

            <Section title="Children’s privacy">
              The extension is not directed at children under 13 and does not knowingly collect
              data from them.
            </Section>

            <Section title="Changes to this policy">
              If we change the data practices of the extension, we will update this page and
              bump the <code>Last updated</code> date. Material changes will also be noted in
              the next extension release’s changelog.
            </Section>

            <Section title="Contact">
              Questions? Email{' '}
              <a className="text-coral underline" href="mailto:privacy@remittancebuddy.com">
                privacy@remittancebuddy.com
              </a>{' '}
              or open an issue on our GitHub repository.
            </Section>
          </div>

          <div className="mt-16 pt-8 border-t border-border">
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </article>
      <Footer />
    </main>
  )
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <section>
      <h2 className="font-display text-2xl text-foreground mb-4">{title}</h2>
      <div className="text-foreground/80">{children}</div>
    </section>
  )
}

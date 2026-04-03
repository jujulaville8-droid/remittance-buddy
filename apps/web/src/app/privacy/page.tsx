import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Remittance Buddy privacy policy — how we collect, use, and protect your data.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = 'April 2, 2026'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/40 px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight hover:opacity-80 transition-opacity">
            Remittance Buddy
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section title="1. Who We Are">
            <p>
              Remittance Buddy (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the Remittance Buddy
              website and Chrome browser extension. Our mission is to help people sending money internationally
              find the best rates and lowest fees.
            </p>
          </Section>

          <Section title="2. What We Collect">
            <p>We collect the following information when you use our services:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-foreground">Account information</strong> — email address, name, and
                authentication credentials when you create an account.
              </li>
              <li>
                <strong className="text-foreground">Transfer preferences</strong> — corridors (e.g., USD to PHP),
                preferred amounts, payout methods, and provider preferences you save.
              </li>
              <li>
                <strong className="text-foreground">Chat messages</strong> — conversations with our AI assistant
                to provide personalized recommendations. We do not share chat content with third parties.
              </li>
              <li>
                <strong className="text-foreground">Usage data</strong> — pages visited, features used, provider
                comparisons made, and clicks on provider links. Collected via Vercel Analytics (privacy-friendly,
                no cookies).
              </li>
              <li>
                <strong className="text-foreground">Extension storage</strong> — the Chrome extension stores your
                authentication token and click analytics locally on your device.
              </li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Data">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Provide personalized remittance rate comparisons and recommendations.</li>
              <li>Remember your preferences to make repeat transfers faster.</li>
              <li>Improve our scoring engine and AI assistant based on aggregated, anonymized usage patterns.</li>
              <li>Send rate alerts and notifications you opt into.</li>
              <li>Prevent fraud and comply with financial regulations (KYC/AML).</li>
            </ul>
          </Section>

          <Section title="4. Third-Party Services">
            <p>We use the following third-party services that may process your data:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-foreground">Supabase</strong> — authentication and database hosting.
                Data stored in the US.
              </li>
              <li>
                <strong className="text-foreground">Vercel</strong> — application hosting and analytics.
                Privacy-friendly analytics with no cross-site tracking.
              </li>
              <li>
                <strong className="text-foreground">Anthropic (Claude)</strong> — powers our AI chat assistant.
                Chat messages are sent to Anthropic for processing. Anthropic does not use your data to train models.
              </li>
              <li>
                <strong className="text-foreground">Stripe</strong> — payment processing for transfers.
                We never store your full card details.
              </li>
              <li>
                <strong className="text-foreground">Remittance providers</strong> — when you click a provider link
                (e.g., Wise, Remitly), you leave our service and are subject to that provider&apos;s privacy policy.
              </li>
            </ul>
          </Section>

          <Section title="5. Affiliate Links">
            <p>
              Remittance Buddy earns commissions when you sign up with a provider through our links. This does not
              affect the rates you receive or the order of our recommendations. Our scoring engine ranks providers
              based on fees, exchange rates, speed, and trust — not affiliate payouts. We clearly disclose when links
              are affiliate links.
            </p>
          </Section>

          <Section title="6. Data Storage and Security">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Account data is encrypted at rest and in transit (TLS 1.3).</li>
              <li>Authentication tokens are stored securely using Supabase Auth with short-lived sessions.</li>
              <li>The Chrome extension stores data locally on your device using Chrome&apos;s storage API.</li>
              <li>We do not sell your personal data to third parties.</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>You can:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-foreground">Access</strong> your data by viewing your account settings.
              </li>
              <li>
                <strong className="text-foreground">Delete</strong> your account and all associated data by
                contacting us.
              </li>
              <li>
                <strong className="text-foreground">Export</strong> your transfer history.
              </li>
              <li>
                <strong className="text-foreground">Opt out</strong> of notifications and rate alerts at any time.
              </li>
            </ul>
          </Section>

          <Section title="8. Chrome Extension Permissions">
            <p>The Remittance Buddy Chrome extension requests the following permissions:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-foreground">sidePanel</strong> — to display the AI chat assistant in
                Chrome&apos;s side panel.
              </li>
              <li>
                <strong className="text-foreground">storage</strong> — to save your preferences and
                authentication locally.
              </li>
              <li>
                <strong className="text-foreground">alarms</strong> — to schedule rate alert checks.
              </li>
              <li>
                <strong className="text-foreground">notifications</strong> — to notify you of rate changes you
                opted into.
              </li>
            </ul>
            <p className="mt-2">
              The extension only communicates with our own API servers. It does not read, modify, or access your
              browsing activity on other websites.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              Remittance Buddy is not intended for use by anyone under 18. We do not knowingly collect data from
              minors.
            </p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>
              We may update this policy from time to time. We will notify you of significant changes via email or
              an in-app notice. Continued use of our services after changes constitutes acceptance.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about this policy? Contact us at{' '}
              <a href="mailto:privacy@remittancebuddy.com" className="text-foreground underline underline-offset-2">
                privacy@remittancebuddy.com
              </a>
            </p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-border/40 px-6 py-8">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Remittance Buddy. All rights reserved.
        </p>
      </footer>
    </div>
  )
}

function Section({ title, children }: { readonly title: string; readonly children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  )
}

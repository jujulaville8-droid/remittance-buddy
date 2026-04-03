import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Remittance Buddy terms of service — rules and conditions for using our platform.',
}

export default function TermsOfServicePage() {
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
        <h1 className="text-3xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using the Remittance Buddy website, Chrome extension, or any associated
              services (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;).
              If you do not agree, do not use the Service.
            </p>
          </Section>

          <Section title="2. Description of Service">
            <p>
              Remittance Buddy is a comparison and recommendation platform that helps users find the
              best rates for sending money internationally. We are <strong className="text-foreground">not</strong> a
              money transmitter, bank, or financial institution. We do not hold, transfer, or process funds.
            </p>
            <p className="mt-2">
              When you click a provider link, you leave our platform and interact directly with the
              remittance provider (e.g., Wise, Remitly, Western Union). Your transaction is governed
              by that provider&apos;s terms and conditions.
            </p>
          </Section>

          <Section title="3. Eligibility">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You must comply with all applicable laws in your jurisdiction, including anti-money laundering regulations.</li>
              <li>You must provide accurate information when creating an account.</li>
            </ul>
          </Section>

          <Section title="4. User Accounts">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must not share your account with others or create multiple accounts.</li>
              <li>Notify us immediately if you suspect unauthorized access to your account.</li>
              <li>We may suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </Section>

          <Section title="5. Rate Information and Accuracy">
            <p>
              We make reasonable efforts to display accurate and up-to-date exchange rates and fee
              information. However:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                <strong className="text-foreground">Rates are indicative.</strong> The actual rate you
                receive is determined by the remittance provider at the time of your transaction.
              </li>
              <li>
                <strong className="text-foreground">Rates change frequently.</strong> Exchange rates
                fluctuate and the rates shown may not reflect the most current values.
              </li>
              <li>
                <strong className="text-foreground">We are not liable</strong> for differences between
                displayed rates and actual rates offered by providers.
              </li>
              <li>
                Our recommendations are based on publicly available data and may not account for all
                fees, promotions, or conditions.
              </li>
            </ul>
          </Section>

          <Section title="6. Affiliate Disclosure">
            <p>
              Remittance Buddy earns commissions when you sign up with or use a remittance provider
              through our links. This is our primary revenue source. We disclose this clearly:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Affiliate commissions <strong className="text-foreground">do not</strong> affect your rates or fees.</li>
              <li>Our scoring engine ranks providers by fees, exchange rates, speed, and trust — not by affiliate payouts.</li>
              <li>Not all listed providers are affiliate partners.</li>
            </ul>
          </Section>

          <Section title="7. AI Assistant">
            <p>
              Our AI assistant provides general information about remittance options. It does
              not provide financial, legal, or tax advice. You should consult a qualified professional
              for advice specific to your situation. The AI may occasionally produce inaccurate or
              incomplete information.
            </p>
          </Section>

          <Section title="8. Prohibited Uses">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>Use the Service for money laundering, fraud, or other illegal activities.</li>
              <li>Scrape, crawl, or extract data from the Service for commercial purposes.</li>
              <li>Attempt to bypass security measures or access unauthorized areas.</li>
              <li>Impersonate another person or misrepresent your identity.</li>
              <li>Interfere with or disrupt the Service or its infrastructure.</li>
              <li>Use the Service to transmit malware, spam, or harmful content.</li>
            </ul>
          </Section>

          <Section title="9. Intellectual Property">
            <p>
              All content, trademarks, and intellectual property on the Service belong to Remittance
              Buddy or its licensors. You may not reproduce, distribute, or create derivative works
              from our content without prior written permission.
            </p>
          </Section>

          <Section title="10. Limitation of Liability">
            <p>
              To the maximum extent permitted by law:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 mt-2">
              <li>
                The Service is provided &quot;as is&quot; and &quot;as available&quot; without
                warranties of any kind.
              </li>
              <li>
                We are not liable for any losses arising from your use of third-party remittance
                providers, including failed transfers, incorrect amounts, or delays.
              </li>
              <li>
                Our total liability to you for any claim related to the Service shall not exceed $100.
              </li>
              <li>
                We are not responsible for decisions you make based on our comparisons or AI
                recommendations.
              </li>
            </ul>
          </Section>

          <Section title="11. Indemnification">
            <p>
              You agree to indemnify and hold harmless Remittance Buddy, its officers, directors,
              employees, and agents from any claims, damages, losses, or expenses arising from your
              use of the Service or violation of these Terms.
            </p>
          </Section>

          <Section title="12. Termination">
            <p>
              We may suspend or terminate your access to the Service at any time, with or without
              cause. You may delete your account at any time by contacting us. Upon termination,
              your right to use the Service ceases immediately.
            </p>
          </Section>

          <Section title="13. Changes to Terms">
            <p>
              We may update these Terms from time to time. We will notify you of material changes
              via email or an in-app notice. Continued use of the Service after changes constitutes
              acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="14. Governing Law">
            <p>
              These Terms are governed by the laws of the State of California, United States,
              without regard to conflict of law principles. Any disputes shall be resolved in the
              courts of San Francisco County, California.
            </p>
          </Section>

          <Section title="15. Contact">
            <p>
              Questions about these Terms? Contact us at{' '}
              <a href="mailto:legal@remittancebuddy.com" className="text-foreground underline underline-offset-2">
                legal@remittancebuddy.com
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

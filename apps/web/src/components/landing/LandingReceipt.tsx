'use client'

import Link from 'next/link'
import { ArrowRight, FileText, ListChecks, PanelRight } from 'lucide-react'
import { Nav } from './Nav'
import { Footer } from './Footer'
import { ComparisonCanvas } from './ComparisonCanvas'
import styles from './ClearCanvas.module.css'

export default function LandingReceipt() {
  return (
    <div>
      <Nav />
      <main id="comparison-content" className={styles.canvas} tabIndex={-1}>
        <ComparisonCanvas />
        <div className={styles.container}>
          <section className={styles.featureGrid} aria-label="A clearer comparison">
            <article className={styles.feature}>
              <FileText size={27} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h2>See the fees</h2>
                <p>Compare the included fee and exchange rate, side by side.</p>
              </div>
            </article>
            <article className={styles.feature}>
              <ListChecks size={27} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h2>Check payout methods</h2>
                <p>Choose your preference, then confirm availability with the provider.</p>
              </div>
            </article>
            <article className={styles.feature}>
              <PanelRight size={27} strokeWidth={1.7} aria-hidden="true" />
              <div>
                <h2>Compare while you browse</h2>
                <p>A companion Chrome extension is in preview.</p>
                <Link href="/extension">
                  Explore the preview <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </article>
          </section>
          <section id="how" className={styles.explainer} aria-labelledby="how-heading">
            <div>
              <h2 id="how-heading" className={styles.sectionHeading}>
                A little clarity,
                <br />
                before you send.
              </h2>
              <p>
                See what sits behind a recipient amount. You stay in control of which provider to
                check and whether to send.
              </p>
            </div>
            <ol className={styles.steps}>
              <li>
                <span className={styles.stepNumber}>1</span>
                <div>
                  <h3>Set your total budget</h3>
                  <p>
                    Choose where you are sending from, how much you want to spend and your preferred
                    payout method.
                  </p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber}>2</span>
                <div>
                  <h3>Read the whole comparison</h3>
                  <p>
                    Review PHP received, the included fee, exchange rate and the original source
                    collection time.
                  </p>
                </div>
              </li>
              <li>
                <span className={styles.stepNumber}>3</span>
                <div>
                  <h3>Confirm with the provider</h3>
                  <p>
                    Check the final price, eligibility, funding options and payout availability on
                    the provider’s website.
                  </p>
                </div>
              </li>
            </ol>
          </section>
          <section id="faq" className={styles.faq} aria-labelledby="faq-heading">
            <h2 id="faq-heading" className={styles.sectionHeading}>
              A few things to know
            </h2>
            <details>
              <summary>Are these live provider quotes?</summary>
              <p>
                The comparison uses reference data, which can be older than the time you opened this
                page. Every result shows its source and collection time when available. Only a
                result explicitly labeled Provider API quote comes from a provider API. Confirm the
                final offer directly with the provider.
              </p>
            </details>
            <details>
              <summary>Is the fee included in my budget?</summary>
              <p>
                Yes. The displayed source fee is included in your total send budget. Other charges,
                funding methods, promotions and the provider’s final exchange rate may change the
                amount your recipient receives.
              </p>
            </details>
            <details>
              <summary>Does my preferred payout mean it is available?</summary>
              <p>
                No. Payout availability is unverified in these reference comparisons. Your selection
                is a preference, not confirmation that bank deposit, GCash, Maya or cash pickup is
                supported for a particular offer.
              </p>
            </details>
            <details>
              <summary>Can I send money through My Remittance Pal?</summary>
              <p>
                My Remittance Pal is a comparison tool and does not handle your money. You complete
                any transfer directly with your chosen provider. No account is required to compare
                here.
              </p>
            </details>
            <details>
              <summary>Do provider links affect the order?</summary>
              <p>
                Results are ordered by reference PHP received for the same budget unless you choose
                another sort. The links are ordinary provider links, with no approved paid
                partnership claimed. This is not a complete market comparison.
              </p>
            </details>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

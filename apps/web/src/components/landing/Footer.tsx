import Link from 'next/link'
import styles from './ClearCanvas.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerIntro}>
            <Link href="/" className={styles.footerBrand}>
              My Remittance Pal
            </Link>
            <p>More clarity when you send to the Philippines.</p>
            <p>
              Reference comparisons only. Confirm the final quote and terms with your chosen
              provider.
            </p>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>
              <li>
                <Link href="/compare">Compare options</Link>
              </li>
              <li>
                <Link href="/compare?corridor=US-PH">US → Philippines</Link>
              </li>
              <li>
                <Link href="/compare?corridor=CA-PH">Canada → Philippines</Link>
              </li>
              <li>
                <Link href="/extension">Chrome extension preview</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2>Useful details</h2>
            <ul>
              <li>
                <Link href="/#how">How it works</Link>
              </li>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/extension-privacy">Extension privacy</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© {new Date().getFullYear()} My Remittance Pal</span>
          <span>Compare here. Confirm with your provider.</span>
        </div>
      </div>
    </footer>
  )
}

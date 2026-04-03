import type { Metadata } from 'next'
import Link from 'next/link'
import './landing.css'
import ScrollAnimations from '@/components/landing/ScrollAnimations'

export const metadata: Metadata = {
  title: 'Remittance Buddy — Send Money to the Philippines',
  description:
    'AI-powered international money transfers. Send money to the Philippines with the best rates, no app download needed. Fast, transparent, and secure.',
  openGraph: {
    title: 'Remittance Buddy — Send Money to the Philippines',
    description:
      'AI-powered international money transfers to the Philippines. Best rates, no app download needed.',
    type: 'website',
    siteName: 'Remittance Buddy',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Remittance Buddy — Send Money to the Philippines',
    description:
      'AI-powered international money transfers to the Philippines. Best rates, no app download needed.',
  },
}

export default function HomePage() {
  return (
    <ScrollAnimations>
      <div className="page-wrapper">
        {/* ─── NAV ─── */}
        <nav className="nav">
          <div className="page-padding cc-nav">
            <div className="container cc-nav">
              <div className="nav-inner">
                <div className="nav-left-wrapper">
                  <Link href="/" className="nav-logo" aria-label="Remittance Buddy Home">
                    <span
                      style={{
                        fontSize: '18px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em',
                        fontFamily: 'var(--font-heading), serif',
                      }}
                    >
                      Remittance Buddy
                    </span>
                  </Link>
                  <div
                    className="nav-textlink-innerwrapper"
                    style={{ gap: '24px', display: 'flex', alignItems: 'center' }}
                  >
                    <a href="#features" className="nav-textlink">
                      Features
                    </a>
                    <a href="#how-it-works" className="nav-textlink">
                      How it works
                    </a>
                  </div>
                </div>
                <div className="nav-right">
                  <Link href="/sign-in" className="nav-textlink margin">
                    Sign in
                  </Link>
                  <Link href="/sign-up" className="cta cc-nav">
                    Get started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* ─── MAIN ─── */}
        <main className="main">
          {/* ─── HERO SCROLL SECTION ─── */}
          <div className="hero-scroll-wrap">
            <div className="video-trigger" />
            <div className="hero-scroll-triger" />
            <div className="hands-trigger" />

            <header className="home-hero">
              <div className="container">
                <div className="page-padding">
                  <div className="home-hero-inner">
                    <div className="home-hero-heading-wrap">
                      <h1 className="home-hero-heading">
                        <span className="heading-line-1">Send money home.</span>{' '}
                        <span className="heading-line-2" style={{ color: 'var(--red)' }}>
                          The smart way.
                        </span>
                      </h1>
                      <p
                        style={{
                          marginTop: '1.5rem',
                          fontSize: '1.25rem',
                          lineHeight: 1.5,
                          color: 'var(--text-secondary)',
                          maxWidth: '32rem',
                        }}
                      >
                        AI-powered transfers to the Philippines with the best rates. Compare Wise,
                        Remitly, Western Union &amp; more in one click.
                      </p>
                    </div>
                    <div className="home-hero-countries-wrap">
                      <div className="hero-countries-inner">
                        <div className="countries-title-wrap">
                          <div>Trusted by Filipinos&nbsp;</div>
                          <div className="countries-title-switcher">
                            <div className="countries-title-switch cc-in">worldwide</div>
                            <div className="countries-title-switch cc-from">
                              in US, Canada, UK &amp; more
                            </div>
                          </div>
                        </div>
                        <div className="countries-banner-wrap">
                          <div
                            className="countries-banner"
                            style={{
                              display: 'inline-block',
                              fontSize: '2rem',
                              letterSpacing: '0.5rem',
                            }}
                          >
                            🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭 🇵🇭
                          </div>
                          <div className="countries-overlay" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </header>

            {/* ─── FEATURES ─── */}
            <div id="features" className="features-scroll-wrap visible">
              <div className="features-section">
                <div className="container">
                  <div className="page-padding">
                    <div className="features-wrap">
                      <div className="features-list">
                        {/* Feature 1 */}
                        <div className="features-item-wrap">
                          <div className="features-item">
                            <div className="feature-title-wrap">
                              <h2 className="feature-title">Compare rates instantly</h2>
                            </div>
                            <div className="feature-learn-more">Learn more</div>
                            <div className="feature-scroll-link" />
                          </div>
                        </div>
                        {/* Feature 2 */}
                        <div className="features-item-wrap">
                          <div className="features-item">
                            <div className="feature-title-wrap">
                              <h2 className="feature-title">AI chat assistant</h2>
                            </div>
                            <div className="feature-learn-more">Learn more</div>
                            <div className="feature-scroll-link" />
                          </div>
                        </div>
                        {/* Feature 3 */}
                        <div className="features-item-wrap">
                          <div className="features-item">
                            <div className="feature-title-wrap">
                              <h2 className="feature-title">GCash &amp; cash pickup</h2>
                            </div>
                            <div className="feature-learn-more">Learn more</div>
                            <div className="feature-scroll-link" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── STICKY HAND / PHONE MOCKUP ─── */}
            <div className="sticky-hand-wrap">
              <div className="mockup-wrap">
                <div className="mockup-anim-initial">
                  <div className="mockup-anim-target">
                    <div className="mockup-anim-scroll">
                      <div className="screen-wrap">
                        <div className="screen-initial">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/landing/images/66e46fca14ca4f992f4aa028_login-profile.jpg"
                            width={750}
                            height={660}
                            alt="User profile icon"
                            className="login-profile"
                          />
                          <div className="login-title">Maria Santos</div>
                          <div className="login-btn">Compare Rates</div>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/landing/images/6908ec939cf0db6a6b3324ad_AccountMain.jpg"
                          width={1125}
                          height={2436}
                          alt="App screen showing rate comparison results"
                          className="screen-home"
                        />
                        <div className="screen-features">
                          {/* Screen 1: Compare rates */}
                          <div className="screen-features-item" style={{ display: 'none' }}>
                            <video
                              width="100%"
                              height="100%"
                              autoPlay
                              muted
                              playsInline
                              loop
                            >
                              <source
                                src="/landing/videos/receive-usd.mp4"
                                type="video/mp4"
                              />
                            </video>
                          </div>
                          {/* Screen 2: AI chat */}
                          <div className="screen-features-item" style={{ display: 'none' }}>
                            <video
                              width="100%"
                              height="100%"
                              autoPlay
                              muted
                              playsInline
                              loop
                            >
                              <source
                                src="/landing/videos/send-money-home.mp4"
                                type="video/mp4"
                              />
                            </video>
                          </div>
                          {/* Screen 3: GCash */}
                          <div className="screen-features-item" style={{ display: 'none' }}>
                            <video
                              width="100%"
                              height="100%"
                              autoPlay
                              muted
                              playsInline
                              loop
                            >
                              <source src="/landing/videos/Invest.mp4" type="video/mp4" />
                            </video>
                          </div>
                        </div>
                      </div>
                      <div className="hands-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src="/landing/images/66dec5457616b5f6b52ea7a0_nsave-hand-1.webp"
                          fetchPriority="high"
                          alt="Hand holding phone"
                          className="hand cc-initial"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── PRICING SCROLL SECTION ─── */}
          <div id="how-it-works" className="pricing-scroll-wrap">
            <div className="pricing-scroll-sticky">
              <div className="container">
                <div className="page-padding">
                  <div className="pricing-scroll-inner">
                    <div className="pricing-zoom-wrap">
                      <div className="pricing-zoom-target">
                        <div className="pricing-scroll-number">
                          <span className="pricing-header-currency">$</span>15.00
                        </div>
                        <div className="pricing-scroll-label">Average savings per transfer</div>
                      </div>
                    </div>
                    <div className="pricing-header">
                      <h2 className="home-section-heading">
                        <span className="pricing-header-line-1">Stop overpaying. </span>
                        <span className="pricing-header-line-2">Start comparing.</span>
                      </h2>
                      <Link href="/sign-up" className="cta">
                        Compare rates now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── CARDS SLIDER ─── */}
          <div className="home-section-cards">
            <div className="slider-cards w-slider">
              <div className="w-slider-mask">
                {/* Card 1: Get Started */}
                <div className="cards-slide w-slide">
                  <Link href="/sign-up" className="card-link">
                    <div className="cards-inner-wrapper">
                      <div className="cards-caption">Get started</div>
                      <h3 className="cards-title">
                        Compare rates in 30 seconds — no signup needed
                      </h3>
                    </div>
                  </Link>
                </div>
                {/* Card 2: Mission */}
                <div className="cards-slide w-slide">
                  <Link href="#" id="card-globe" className="card-link _2">
                    <div className="cards-inner-wrapper">
                      <div className="cards-caption">Our mission</div>
                      <h3 className="cards-title shorter">
                        Help immigrants keep more of their money
                      </h3>
                    </div>
                  </Link>
                </div>
                {/* Card 3: Extension */}
                <div className="cards-slide w-slide">
                  <Link href="#" className="card-link _3">
                    <div className="cards-inner-wrapper">
                      <div className="cards-caption">Chrome extension</div>
                      <h3 className="cards-title">
                        Install our Chrome extension for instant comparisons
                      </h3>
                    </div>
                  </Link>
                </div>
              </div>
              {/* Arrows (visible on tablet) */}
              <div
                className="w-slider-arrow-left"
                role="button"
                tabIndex={0}
                aria-label="previous slide"
              >
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                  &#8249;
                </span>
              </div>
              <div
                className="w-slider-arrow-right"
                role="button"
                tabIndex={0}
                aria-label="next slide"
              >
                <span style={{ color: 'white', fontSize: '20px', fontWeight: 600 }}>
                  &#8250;
                </span>
              </div>
              {/* Dots */}
              <div className="w-slider-nav w-round">
                <div
                  className="w-slider-dot"
                  role="button"
                  tabIndex={0}
                  aria-label="Show slide 1 of 3"
                >
                  1
                </div>
                <div
                  className="w-slider-dot"
                  role="button"
                  tabIndex={0}
                  aria-label="Show slide 2 of 3"
                >
                  2
                </div>
                <div
                  className="w-slider-dot"
                  role="button"
                  tabIndex={0}
                  aria-label="Show slide 3 of 3"
                >
                  3
                </div>
              </div>
            </div>
          </div>

          {/* ─── CARD SECTION (sticky with hand) ─── */}
          <div className="footer-sticky-wrap">
            <div className="footer-sticky-spacing" />
            <div className="footer-sticky-inner">
              <div className="card-scroll-wrap">
                <div className="card-scroll-trigger" />
                <div className="card-sticky-wrap">
                  <div className="container">
                    <div className="page-padding">
                      <div className="card-sticky-inner">
                        <div className="card-hand-wrap">
                          <div className="card-header">
                            <h2 className="home-section-heading cc-card">
                              Compare rates. Send smarter.
                            </h2>
                            <a href="#" className="cta">
                              Install Chrome Extension
                            </a>
                          </div>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/landing/images/66ec3cc89e0cb29c05701494_hand-holding-card.webp"
                            width={1869}
                            height={2217}
                            alt="Hand holding phone with rate comparison"
                            className="card-hand-img"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ─── FOOTER TOP ─── */}
              <div className="footer-top">
                <div className="page-padding">
                  <div className="footer-top-inner">
                    <div className="footer-menu">
                      <div className="footer-menu-cell">
                        <h3 className="footer-menu-title">Product</h3>
                        <Link href="/sign-up" className="footer-link">
                          Compare Rates
                        </Link>
                        <a href="#" className="footer-link">
                          Chrome Extension
                        </a>
                      </div>
                      <div className="footer-menu-cell">
                        <h3 className="footer-menu-title">Company</h3>
                        <Link href="/privacy" className="footer-link">
                          Privacy Policy
                        </Link>
                        <Link href="/terms" className="footer-link">
                          Terms of Service
                        </Link>
                        <a
                          href="mailto:support@remittancebuddy.com"
                          className="footer-link"
                        >
                          Support
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* ─── FOOTER BOTTOM ─── */}
        <footer className="footer">
          <div className="footer-bottom">
            <div className="page-padding">
              <div className="footer-bottom-top">
                <div>
                  <em>&copy; 2026 Remittance Buddy. All rights reserved.</em>
                </div>
              </div>
              <div className="disclaimer-text">
                Remittance Buddy is a comparison service. We do not hold or transfer funds. All
                transfers are processed by the providers listed.
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ScrollAnimations>
  )
}

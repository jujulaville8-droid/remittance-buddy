'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import styles from './ClearCanvas.module.css'

const NAV_LINKS = [
  { href: '/compare', label: 'Compare' },
  { href: '/#how', label: 'How it works' },
  { href: '/extension', label: 'Chrome extension' },
  { href: '/#faq', label: 'Help' },
] as const

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (!menuOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header className={styles.navigation}>
      <div className={`${styles.container} ${styles.navInner}`}>
        <Link href="/" className={styles.brand} onClick={() => setMenuOpen(false)}>
          <Image src="/brand/icon.png" width={38} height={38} alt="" aria-hidden="true" />
          <span className={styles.brandName}>My Remittance Pal</span>
        </Link>
        <nav className={styles.navLinks} aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <button
          ref={toggleRef}
          type="button"
          className={styles.menuButton}
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className={`${styles.container} ${styles.mobileNav}`}
          aria-label="Mobile navigation"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}

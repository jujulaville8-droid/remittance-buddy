'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/compare', label: 'Compare' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/alerts', label: 'Alerts' },
  { href: '/family', label: 'Family' },
] as const

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled || menuOpen
            ? 'backdrop-blur-md bg-background/85 border-b border-border/60'
            : 'bg-transparent',
        )}
      >
        <div className="container flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group"
            onClick={() => setMenuOpen(false)}
          >
            <Logo />
            <span className="font-display text-xl leading-none tracking-tight text-foreground">
              My Remittance Pal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative text-sm font-medium text-foreground/75 hover:text-foreground transition-colors after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-right after:scale-x-0 after:bg-foreground after:transition-transform after:duration-300 hover:after:origin-left hover:after:scale-x-100"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-5">
            <Link
              href="/sign-in"
              className="hidden sm:inline-flex text-sm font-medium text-foreground/80 hover:text-coral transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/compare"
              className="hidden sm:inline-flex items-center rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-glow-coral hover:shadow-none hover:-translate-y-0.5 transition-all active:scale-95"
              onClick={() => setMenuOpen(false)}
            >
              Open the tool
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground active:scale-95 transition-all"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}

interface MobileMenuProps {
  readonly open: boolean
  readonly onClose: () => void
}

function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-40 md:hidden transition-opacity duration-300',
        open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-background/95 backdrop-blur-xl"
        onClick={onClose}
      />
      <div
        className={cn(
          'absolute inset-x-0 top-16 bottom-0 flex flex-col px-6 pt-6 pb-10 transition-transform duration-300 ease-out',
          open ? 'translate-y-0' : '-translate-y-4',
        )}
      >
        <nav className="flex flex-col">
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={onClose}
              className="font-display text-4xl py-4 border-b border-border text-foreground hover:text-coral transition-colors"
              style={{
                transitionDelay: open ? `${i * 40}ms` : '0ms',
              }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-3">
          <Link
            href="#compare"
            onClick={onClose}
            className="flex items-center justify-center h-14 rounded-full bg-coral text-white text-base font-semibold shadow-glow-coral active:scale-[0.98] transition-all"
          >
            Compare rates now
          </Link>
          <Link
            href="/sign-in"
            onClick={onClose}
            className="flex items-center justify-center h-14 rounded-full border border-border bg-card text-foreground text-base font-semibold"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

function Logo() {
  return (
    <div className="relative w-9 h-9 rounded-full bg-foreground grid place-items-center overflow-hidden">
      <span className="relative font-display text-background text-base leading-none">R</span>
    </div>
  )
}

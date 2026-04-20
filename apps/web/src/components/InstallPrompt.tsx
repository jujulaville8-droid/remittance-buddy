'use client'

import { useEffect, useState } from 'react'
import { X, Share, Plus } from 'lucide-react'

/**
 * Mobile-only install helper. Detects:
 *   - iOS Safari → shows "Tap Share → Add to Home Screen" guide
 *   - Android Chrome → fires the native BeforeInstallPrompt
 *
 * Hidden when:
 *   - already running in standalone / PWA mode
 *   - user dismissed it (localStorage flag)
 *   - not on mobile
 *
 * Mount once near the top of any layout you want to surface on.
 */

const DISMISSED_KEY = 'rb_install_dismissed_at'
const DISMISSED_COOLDOWN_MS = 1000 * 60 * 60 * 24 * 7 // 7 days

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: readonly string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
  prompt(): Promise<void>
}

export default function InstallPrompt() {
  const [mode, setMode] = useState<'hidden' | 'ios' | 'android'>('hidden')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Already installed / running in standalone?
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return

    // Previously dismissed?
    try {
      const at = Number(localStorage.getItem(DISMISSED_KEY) ?? '0')
      if (at && Date.now() - at < DISMISSED_COOLDOWN_MS) return
    } catch {
      /* ignore */
    }

    const ua = navigator.userAgent
    const isMobile = /iPhone|iPad|iPod|Android/i.test(ua)
    if (!isMobile) return

    const isIOS = /iPhone|iPad|iPod/i.test(ua) && !/CriOS|FxiOS/i.test(ua) // Safari only
    if (isIOS) {
      // Delay so it doesn't fight the initial page paint
      const t = setTimeout(() => setMode('ios'), 2500)
      return () => clearTimeout(t)
    }

    const onBeforeInstall = (ev: Event) => {
      ev.preventDefault()
      setDeferredPrompt(ev as BeforeInstallPromptEvent)
      setMode('android')
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
    setMode('hidden')
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'dismissed') dismiss()
    setDeferredPrompt(null)
    setMode('hidden')
  }

  if (mode === 'hidden') return null

  const base =
    'fixed inset-x-3 bottom-3 z-[60] rounded-2xl border border-coral/30 bg-card/95 backdrop-blur-sm shadow-level-3 p-4 flex items-start gap-3 sm:hidden'

  if (mode === 'ios') {
    return (
      <div className={base} role="dialog" aria-label="Install app">
        <div className="mt-0.5 w-9 h-9 rounded-xl bg-coral/15 text-coral grid place-items-center flex-shrink-0">
          <Plus className="h-4 w-4" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0 pr-6">
          <div className="text-sm font-semibold text-foreground">Install My Remittance Pal</div>
          <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-1">
            <span>Tap</span>
            <Share className="h-3.5 w-3.5 inline -mt-0.5" strokeWidth={1.8} />
            <span>then</span>
            <span className="font-medium text-foreground">Add to Home Screen</span>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={base} role="dialog" aria-label="Install app">
      <div className="mt-0.5 w-9 h-9 rounded-xl bg-coral/15 text-coral grid place-items-center flex-shrink-0">
        <Plus className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0 pr-6">
        <div className="text-sm font-semibold text-foreground">Install My Remittance Pal</div>
        <div className="mt-1 text-xs text-muted-foreground">
          Add to your home screen for fast access and offline-capable rate checks.
        </div>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={install}
            className="inline-flex items-center gap-1 rounded-full bg-coral px-3 py-1.5 text-xs font-semibold text-white hover:bg-coral-hover transition-colors"
          >
            Install app
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Not now
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

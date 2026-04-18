'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * PWARedirect — when an installed-app user lands on `/` (the landing
 * page), route them straight to `/compare` (the tool). The landing is
 * a marketing surface for first-time web visitors; app users already
 * converted and want the product.
 *
 * Detection:
 *   - `display-mode: standalone` media query → true in PWA on Android,
 *     iOS Safari, and Capacitor's WKWebView
 *   - `navigator.standalone` → iOS Safari PWA legacy flag
 *   - `localStorage.rb_app_mode` → set on first visit via
 *     `?source=pwa` or `?source=app` so subsequent navigations back
 *     to `/` still redirect, even if the query string was lost
 */
export default function PWARedirect() {
  const router = useRouter()

  useEffect(() => {
    // Record app-mode on first entry so later navigation sticks
    const params = new URLSearchParams(window.location.search)
    const source = params.get('source')
    if (source === 'pwa' || source === 'app') {
      try {
        localStorage.setItem('rb_app_mode', source)
      } catch {
        // Safari private browsing can block storage — redirect still
        // works via media query / navigator.standalone
      }
    }

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      (() => {
        try {
          return localStorage.getItem('rb_app_mode') !== null
        } catch {
          return false
        }
      })()

    if (isStandalone) {
      router.replace('/compare')
    }
  }, [router])

  return null
}

'use client'

import { useEffect, useState } from 'react'
import {
  isNativePlatform,
  registerForPush,
  subscribeConnectivity,
} from '@/lib/native'

/**
 * Native-side initialization. Mounts once in the root layout.
 *
 * Responsibilities:
 *  - Register the device for push notifications (rate alerts, transfer status)
 *  - Show a lightweight offline banner when the WebView loses connectivity
 *
 * Deliberately does NOT gate the UI with biometric auth — that belongs behind
 * an explicit user opt-in in Settings, not on cold boot.
 */
export default function NativeShell() {
  const [online, setOnline] = useState(true)

  useEffect(() => {
    if (!isNativePlatform()) return

    void (async () => {
      const token = await registerForPush()
      if (!token) return
      try {
        await fetch('/api/push/register', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token, platform: 'ios' }),
        })
      } catch {
        /* server endpoint may not exist yet — safe no-op */
      }
    })()
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeConnectivity(setOnline)
    return unsubscribe
  }, [])

  if (online) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: 'calc(env(safe-area-inset-bottom, 0) + 72px)',
        left: 12,
        right: 12,
        zIndex: 60,
        padding: '10px 14px',
        borderRadius: 12,
        background: '#14110D',
        color: '#F5F0E6',
        fontSize: 14,
        textAlign: 'center',
        boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
      }}
    >
      You’re offline. Your last-loaded data is still viewable; new actions
      will retry when you’re back online.
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { buddyPlusStore } from '@/lib/local-db'

export function UpgradeButton() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    setActive(buddyPlusStore.get().active)
  }, [])

  async function handleUpgrade() {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'buddy-plus-monthly' }),
      })
      if (!res.ok) {
        throw new Error(`Billing API returned ${res.status}`)
      }
      const data = (await res.json()) as { url: string; sessionId: string }
      if (data.sessionId) {
        buddyPlusStore.set({
          active: false,
          checkoutSessionId: data.sessionId,
          subscriptionId: null,
          periodEnd: null,
        })
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout')
      setSubmitting(false)
    }
  }

  if (active) {
    return (
      <div className="flex items-center justify-center gap-2 w-full h-11 rounded-full bg-teal text-white font-semibold">
        <Sparkles className="h-4 w-4" /> You're on Plus
      </div>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={handleUpgrade}
        disabled={submitting}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-full bg-coral text-white font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 shadow-glow-coral"
      >
        <Sparkles className="h-4 w-4" />
        {submitting ? 'Opening checkout…' : 'Start 7-day free trial'}
      </button>
      {error && (
        <p className="mt-2 text-xs text-destructive text-center">{error}</p>
      )}
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { buddyPlusStore } from '@/lib/local-db'
import { Nav } from '@/components/landing/Nav'
import { Footer } from '@/components/landing/Footer'

type State =
  | { status: 'loading' }
  | { status: 'success' }
  | { status: 'pending' }
  | { status: 'error'; message: string }

export default function PricingSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    if (!sessionId) {
      setState({ status: 'error', message: 'Missing session ID' })
      return
    }

    fetch(`/api/billing/verify-session?session_id=${encodeURIComponent(sessionId)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`Verify returned ${res.status}`)
        return res.json() as Promise<{
          active: boolean
          subscriptionId: string | null
          periodEnd: string | null
          status: string
        }>
      })
      .then((data) => {
        if (data.active && data.subscriptionId && data.periodEnd) {
          buddyPlusStore.activate(data.subscriptionId, data.periodEnd)
          setState({ status: 'success' })
        } else if (data.status === 'trialing' && data.subscriptionId && data.periodEnd) {
          buddyPlusStore.activate(data.subscriptionId, data.periodEnd)
          setState({ status: 'success' })
        } else {
          setState({ status: 'pending' })
        }
      })
      .catch((err: Error) => {
        setState({ status: 'error', message: err.message })
      })
  }, [sessionId])

  return (
    <main className="relative min-h-screen bg-background text-foreground">
      <Nav />
      <section className="pt-40 pb-20">
        <div className="container max-w-xl text-center">
          {state.status === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full border-4 border-coral border-t-transparent animate-spin mx-auto mb-6" />
              <h1 className="font-display text-3xl text-foreground mb-2">Confirming your upgrade…</h1>
              <p className="text-muted-foreground">Talking to Stripe. This takes a few seconds.</p>
            </>
          )}

          {state.status === 'success' && (
            <>
              <div className="w-20 h-20 rounded-full bg-teal text-white grid place-items-center mx-auto mb-6 shadow-lg">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-coral/10 text-coral px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="h-3 w-3" />
                Welcome to Buddy Plus
              </div>
              <h1 className="font-display text-5xl leading-tight text-foreground mb-3">
                You're in.
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Your 7-day free trial just started. You now have unlimited sends, rate alerts, the
                family hub, and priority routing. Cancel anytime, no questions.
              </p>
              <div className="grid gap-3 max-w-sm mx-auto">
                <Link
                  href="/send/recipient?amount=500&payout=gcash"
                  className="flex items-center justify-center gap-2 w-full h-12 rounded-full bg-coral text-white font-semibold hover:brightness-110 transition-all shadow-glow-coral"
                >
                  Send your first transfer
                </Link>
                <Link
                  href="/"
                  className="flex items-center justify-center w-full h-12 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  Back to home
                </Link>
              </div>
            </>
          )}

          {state.status === 'pending' && (
            <>
              <h1 className="font-display text-4xl text-foreground mb-3">Payment pending</h1>
              <p className="text-muted-foreground mb-8">
                Your subscription is being processed. We'll email you when it's active. You can
                continue using Free Buddy in the meantime.
              </p>
              <Link
                href="/"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors"
              >
                Back to home
              </Link>
            </>
          )}

          {state.status === 'error' && (
            <>
              <h1 className="font-display text-4xl text-foreground mb-3">Something went wrong</h1>
              <p className="text-muted-foreground mb-2">{state.message}</p>
              <p className="text-xs text-muted-foreground mb-8">
                No charges have been made. You can try again from the pricing page.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-coral text-white font-semibold hover:brightness-110 transition-all"
              >
                Back to pricing
              </Link>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

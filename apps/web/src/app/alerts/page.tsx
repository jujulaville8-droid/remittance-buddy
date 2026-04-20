'use client'

import { useState } from 'react'
import type { LocalRateAlert } from '@/lib/local-db'
import { useRateAlerts } from '@/lib/hooks/useRateAlerts'

const CORRIDORS = [
  { corridor: 'US-PH', source: 'USD', target: 'PHP', label: 'USD → PHP' },
  { corridor: 'UK-PH', source: 'GBP', target: 'PHP', label: 'GBP → PHP' },
  { corridor: 'SG-PH', source: 'SGD', target: 'PHP', label: 'SGD → PHP' },
  { corridor: 'AE-PH', source: 'AED', target: 'PHP', label: 'AED → PHP' },
  { corridor: 'SA-PH', source: 'SAR', target: 'PHP', label: 'SAR → PHP' },
] as const

type PayoutMethod = 'gcash' | 'maya' | 'bank' | 'cash_pickup'

interface FormState {
  email: string
  corridor: string
  targetRate: string
  payoutMethod: PayoutMethod
}

const INITIAL_FORM: FormState = {
  email: '',
  corridor: 'US-PH',
  targetRate: '',
  payoutMethod: 'gcash',
}

export default function RateAlertsPage() {
  const { alerts, create: createAlert, remove: removeAlert } = useRateAlerts()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)

    const targetRate = Number(form.targetRate)
    if (!form.email.trim() || !Number.isFinite(targetRate) || targetRate <= 0) {
      setMessage({ type: 'error', text: 'Add a valid email and target rate.' })
      return
    }

    const corridor = CORRIDORS.find((c) => c.corridor === form.corridor)
    if (!corridor) return

    setSubmitting(true)
    try {
      await createAlert({
        email: form.email.trim(),
        corridor: corridor.corridor,
        sourceCurrency: corridor.source,
        targetCurrency: corridor.target,
        targetRate,
        payoutMethod: form.payoutMethod,
      })
      setForm({ ...INITIAL_FORM, email: form.email })
      setMessage({ type: 'ok', text: "Alert created — we'll email you when the rate hits." })
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to create alert',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(alert: LocalRateAlert) {
    await removeAlert(alert.id)
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
          Rate Alerts
        </div>
        <h1 className="font-display text-4xl sm:text-5xl">Send when the rate is right.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Tell us the exchange rate you want — we watch the mid-market every 5 minutes and email
          you the moment it hits. No spam, six-hour cooldown between nudges.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
            />
          </Field>
          <Field label="Corridor">
            <select
              value={form.corridor}
              onChange={(e) => setForm({ ...form, corridor: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
            >
              {CORRIDORS.map((c) => (
                <option key={c.corridor} value={c.corridor}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Target rate (1 source = X target)">
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.targetRate}
              onChange={(e) => setForm({ ...form, targetRate: e.target.value })}
              placeholder="58.00"
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
            />
          </Field>
          <Field label="Payout method">
            <select
              value={form.payoutMethod}
              onChange={(e) =>
                setForm({ ...form, payoutMethod: e.target.value as PayoutMethod })
              }
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
            >
              <option value="gcash">GCash</option>
              <option value="maya">Maya</option>
              <option value="bank">Bank transfer</option>
              <option value="cash_pickup">Cash pickup</option>
            </select>
          </Field>
        </div>

        {message ? (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'ok' ? 'bg-teal/10 text-teal' : 'bg-coral/10 text-coral'
            }`}
          >
            {message.text}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02] disabled:opacity-60"
        >
          {submitting ? 'Creating…' : 'Create alert'}
        </button>
      </form>

      {alerts.length > 0 ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl">Your alerts</h2>
          <ul className="space-y-3">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="space-y-1">
                  <div className="font-semibold">
                    {alert.sourceCurrency} → {alert.targetCurrency} at{' '}
                    <span className="text-coral">{alert.targetRate.toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {alert.payoutMethod} · {alert.email} · created{' '}
                    {new Date(alert.createdAt).toLocaleDateString()}
                    {alert.lastTriggeredAt
                      ? ` · last hit ${new Date(alert.lastTriggeredAt).toLocaleDateString()}`
                      : ''}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(alert)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-coral hover:text-coral"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function Field({ label, children }: { readonly label: string; readonly children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}

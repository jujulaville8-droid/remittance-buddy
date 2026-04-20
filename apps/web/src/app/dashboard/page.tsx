'use client'

import Link from 'next/link'
import { ArrowUpRight, Bell, Send, Users } from 'lucide-react'
import type { LocalRateAlert, LocalRecipient } from '@/lib/local-db'
import { useRecipients } from '@/lib/hooks/useRecipients'
import { useTransfers } from '@/lib/hooks/useTransfers'
import { useRateAlerts } from '@/lib/hooks/useRateAlerts'

export default function DashboardPage() {
  const { recipients } = useRecipients()
  const { transfers } = useTransfers()
  const { alerts } = useRateAlerts()

  const totalSent = transfers.reduce((sum, t) => sum + t.sourceAmount, 0)
  const activeAlerts = alerts.filter((a) => a.active).length

  return (
    <main className="min-h-screen">
      <div className="container max-w-lg pt-4 pb-6 space-y-4">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">Home</h1>
            <span className="text-sm leading-none" aria-label="Philippines">🇵🇭</span>
          </div>
        </header>

        <SendCTA />

        <StatsRow totalSent={totalSent} recipientCount={recipients.length} activeAlerts={activeAlerts} />

        <QuickGrid recipientsCount={recipients.length} alertsCount={activeAlerts} />

        {recipients.length > 0 ? <SavedRecipients recipients={recipients} /> : null}
        {activeAlerts > 0 ? <ActiveAlerts alerts={alerts} /> : null}
      </div>
    </main>
  )
}

function SendCTA() {
  return (
    <Link
      href="/compare?from=USD&amount=500&payout=gcash"
      className="flex items-center justify-between gap-3 rounded-2xl bg-foreground text-background px-4 py-3.5 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-8 w-8 place-items-center rounded-full bg-background/15">
          <Send className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold leading-tight">Send money home</div>
          <div className="text-[11px] opacity-70 leading-tight">Compare providers live</div>
        </div>
      </div>
      <ArrowUpRight className="h-4 w-4" />
    </Link>
  )
}

function StatsRow({
  totalSent,
  recipientCount,
  activeAlerts,
}: {
  readonly totalSent: number
  readonly recipientCount: number
  readonly activeAlerts: number
}) {
  const items = [
    { label: 'Sent', value: `$${totalSent.toLocaleString()}` },
    { label: 'Recipients', value: recipientCount.toString() },
    { label: 'Alerts', value: activeAlerts.toString() },
  ]
  return (
    <section className="grid grid-cols-3 gap-px rounded-2xl overflow-hidden bg-border">
      {items.map((item) => (
        <div key={item.label} className="bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </div>
          <div className="mt-1 text-lg font-semibold text-foreground tabular-nums leading-tight">
            {item.value}
          </div>
        </div>
      ))}
    </section>
  )
}

function QuickGrid({
  recipientsCount,
  alertsCount,
}: {
  readonly recipientsCount: number
  readonly alertsCount: number
}) {
  const tiles = [
    { href: '/recipients', icon: Users, label: 'Recipients', count: recipientsCount },
    { href: '/alerts', icon: Bell, label: 'Rate alerts', count: alertsCount },
    { href: '/family', icon: Users, label: 'Family hub', count: null },
    { href: '/leaderboard', icon: ArrowUpRight, label: 'Leaderboard', count: null },
  ]
  return (
    <section className="grid grid-cols-2 gap-2">
      {tiles.map((t) => {
        const Icon = t.icon
        return (
          <Link
            key={t.label}
            href={t.href}
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3 py-3 active:scale-[0.99]"
          >
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-foreground">
              <Icon className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground truncate">{t.label}</div>
              {t.count != null ? (
                <div className="text-[11px] text-muted-foreground">{t.count}</div>
              ) : null}
            </div>
          </Link>
        )
      })}
    </section>
  )
}

function SavedRecipients({ recipients }: { readonly recipients: readonly LocalRecipient[] }) {
  const recent = recipients.slice(0, 3)
  return (
    <section>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Recipients
        </div>
        <Link href="/recipients" className="text-[11px] font-semibold text-foreground">
          Manage
        </Link>
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
        {recent.map((r) => {
          const initials = r.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
          return (
            <div key={r.id} className="flex items-center gap-2.5 px-3 py-2.5">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-foreground text-[11px] font-bold">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{r.fullName}</div>
                <div className="text-[11px] text-muted-foreground">
                  {r.payoutMethod} · {r.sendCount} sends
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ActiveAlerts({ alerts }: { readonly alerts: readonly LocalRateAlert[] }) {
  const active = alerts.filter((a) => a.active).slice(0, 3)
  return (
    <section>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Rate alerts
        </div>
        <Link href="/alerts" className="text-[11px] font-semibold text-foreground">
          Manage
        </Link>
      </div>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
        {active.map((a) => (
          <div key={a.id} className="flex items-center justify-between px-3 py-2.5">
            <div>
              <div className="text-sm font-semibold text-foreground">
                {a.sourceCurrency} → {a.targetCurrency}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Target {a.targetRate.toFixed(2)} · {a.payoutMethod}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

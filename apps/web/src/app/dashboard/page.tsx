'use client'

import Link from 'next/link'
import { ArrowUpRight, Bell, Plus, Send, Users } from 'lucide-react'
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
      <div className="container max-w-lg pt-5 pb-24 space-y-5">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-foreground">Home</h1>
            <span className="text-base leading-none" aria-label="Philippines">🇵🇭</span>
          </div>
        </header>

        <SendCTA />

        <StatsRow totalSent={totalSent} recipientCount={recipients.length} activeAlerts={activeAlerts} />

        <SavedRecipients recipients={recipients} />

        <ActiveAlerts alerts={alerts} />
      </div>
    </main>
  )
}

function SendCTA() {
  return (
    <Link
      href="/compare?from=USD&amount=500&payout=gcash"
      className="flex items-center justify-between gap-3 rounded-2xl bg-foreground text-background px-5 py-4 active:scale-[0.99]"
    >
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-background/15">
          <Send className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">Send money home</div>
          <div className="text-[11px] opacity-70">Compare providers in real time</div>
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
        <div key={item.label} className="bg-card p-4">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {item.label}
          </div>
          <div className="mt-2 text-xl font-semibold text-foreground tabular-nums leading-none">
            {item.value}
          </div>
        </div>
      ))}
    </section>
  )
}

function SavedRecipients({ recipients }: { readonly recipients: readonly LocalRecipient[] }) {
  const recent = recipients.slice(0, 4)
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Recipients
        </div>
        <Link href="/recipients" className="text-[11px] font-semibold text-foreground">
          Manage
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyCard
          icon={Plus}
          title="No recipients saved"
          cta={{ href: '/recipients', label: 'Add recipient' }}
        />
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
          {recent.map((r) => {
            const initials = r.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2)
            return (
              <div key={r.id} className="flex items-center gap-3 px-4 py-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted text-foreground text-xs font-bold">
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
      )}
    </section>
  )
}

function ActiveAlerts({ alerts }: { readonly alerts: readonly LocalRateAlert[] }) {
  const active = alerts.filter((a) => a.active).slice(0, 3)
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Rate alerts
        </div>
        <Link href="/alerts" className="text-[11px] font-semibold text-foreground">
          Manage
        </Link>
      </div>

      {active.length === 0 ? (
        <EmptyCard
          icon={Bell}
          title="No active alerts"
          cta={{ href: '/alerts', label: 'Create alert' }}
        />
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border bg-card overflow-hidden">
          {active.map((a) => (
            <div key={a.id} className="flex items-center justify-between px-4 py-3">
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
      )}
    </section>
  )
}

function EmptyCard({
  icon: Icon,
  title,
  cta,
}: {
  readonly icon: typeof Users
  readonly title: string
  readonly cta: { readonly href: string; readonly label: string }
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
      <div className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" strokeWidth={1.8} />
      </div>
      <div className="mt-3 text-sm font-semibold text-foreground">{title}</div>
      <Link
        href={cta.href}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-foreground"
      >
        {cta.label}
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

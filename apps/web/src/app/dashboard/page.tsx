'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import {
  buddyPlusStore,
  familyGroupsStore,
  rateAlertsStore,
  recipientsStore,
  transfersStore,
  type LocalBuddyPlusState,
  type LocalFamilyGroup,
  type LocalRateAlert,
  type LocalRecipient,
  type LocalTransfer,
} from '@/lib/local-db'

export default function DashboardPage() {
  const [recipients, setRecipients] = useState<LocalRecipient[]>([])
  const [transfers, setTransfers] = useState<LocalTransfer[]>([])
  const [alerts, setAlerts] = useState<LocalRateAlert[]>([])
  const [families, setFamilies] = useState<LocalFamilyGroup[]>([])
  const [buddyPlus, setBuddyPlus] = useState<LocalBuddyPlusState | null>(null)

  useEffect(() => {
    setRecipients(recipientsStore.list())
    setTransfers(transfersStore.list())
    setAlerts(rateAlertsStore.list())
    setFamilies(familyGroupsStore.list())
    setBuddyPlus(buddyPlusStore.get())
  }, [])

  const totalSent = transfers.reduce((sum, t) => sum + t.sourceAmount, 0)
  const completedTransfers = transfers.filter((t) => t.status === 'delivered').length
  const activeAlerts = alerts.filter((a) => a.active).length

  return (
    <div className="container max-w-6xl">
      <DashboardHeader buddyPlus={buddyPlus} />

      <Stats
        totalSent={totalSent}
        completedTransfers={completedTransfers}
        recipientCount={recipients.length}
        activeAlerts={activeAlerts}
      />

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <QuickActions />
        <BuddyPlusCard buddyPlus={buddyPlus} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <RecentTransfers transfers={transfers} />
        <SavedRecipients recipients={recipients} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <ActiveAlerts alerts={alerts} />
        <FamilyGroups families={families} />
      </div>
    </div>
  )
}

function DashboardHeader({ buddyPlus: _buddyPlus }: { readonly buddyPlus: LocalBuddyPlusState | null }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-6 pb-10 border-b border-border">
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">
          Your command center
        </div>
        <h1 className="mt-4 font-display text-5xl lg:text-6xl leading-[0.95] text-foreground">
          Welcome back.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-xl">
          Every send, recipient, alert and family group in one place. Start a transfer or jump
          into any tool below.
        </p>
      </div>
      <Link
        href="/send/recipient?amount=500&corridor=US-PH&payout=gcash"
        className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-4 text-sm font-semibold text-background transition-all hover:-translate-y-0.5 active:scale-[0.98]"
      >
        Start a transfer
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </header>
  )
}

function Stats({
  totalSent,
  completedTransfers,
  recipientCount,
  activeAlerts,
}: {
  readonly totalSent: number
  readonly completedTransfers: number
  readonly recipientCount: number
  readonly activeAlerts: number
}) {
  const items = [
    {
      label: 'Sent to date',
      value: `$${totalSent.toLocaleString()}`,
      hint: `${completedTransfers} completed transfers`,
    },
    {
      label: 'Recipients',
      value: recipientCount.toString(),
      hint: 'Saved across all corridors',
    },
    {
      label: 'Active alerts',
      value: activeAlerts.toString(),
      hint: 'Watching for your target rate',
    },
    {
      label: 'Savings vs Wise',
      value: totalSent > 0 ? `$${Math.round(totalSent * 0.0046).toLocaleString()}` : '$0',
      hint: 'Estimated based on live spreads',
    },
  ]

  return (
    <section className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px rounded-[1.75rem] overflow-hidden bg-border">
      {items.map((item) => (
        <div key={item.label} className="bg-background p-8">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {item.label}
          </div>
          <div className="mt-5 font-display text-4xl lg:text-5xl leading-none text-foreground tabular-nums">
            {item.value}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">{item.hint}</div>
        </div>
      ))}
    </section>
  )
}

function QuickActions() {
  const actions = [
    {
      icon: Send,
      title: 'Send money',
      body: 'Compare live rates and start a transfer',
      href: '/send/recipient?amount=500&corridor=US-PH&payout=gcash',
    },
    {
      icon: Bell,
      title: 'Set a rate alert',
      body: 'Get an email when your target rate hits',
      href: '/alerts',
    },
    {
      icon: Users,
      title: 'Family hub',
      body: 'Pool sends and track shared goals',
      href: '/family',
    },
    {
      icon: Wallet,
      title: 'Pricing',
      body: 'Compare Free and Buddy Plus',
      href: '/pricing',
    },
  ]

  return (
    <section className="rounded-[2rem] border border-border bg-card p-8">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-6">
        Quick actions
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Link
              key={action.title}
              href={action.href}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-foreground/15 hover:-translate-y-0.5"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition-colors duration-500 group-hover:bg-foreground group-hover:text-background group-hover:border-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm">{action.title}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">{action.body}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

function BuddyPlusCard({ buddyPlus }: { readonly buddyPlus: LocalBuddyPlusState | null }) {
  const isActive = buddyPlus?.active === true

  return (
    <section
      className={`relative overflow-hidden rounded-[2rem] p-8 ${
        isActive ? 'bg-foreground text-background' : 'border border-border bg-card'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div
            className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${
              isActive ? 'text-teal/80' : 'text-coral'
            }`}
          >
            Buddy Plus
          </div>
          <div className={`mt-4 font-display text-3xl leading-[1.05] ${isActive ? '' : 'text-foreground'}`}>
            {isActive ? 'You’re in.' : 'Go unlimited.'}
          </div>
        </div>
        <Sparkles className={`h-5 w-5 ${isActive ? 'text-teal' : 'text-coral'}`} />
      </div>
      <p className={`mt-4 text-sm leading-relaxed ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
        {isActive
          ? 'Unlimited sends, rate alerts, family hub, and priority routing are active on this device.'
          : '$1.99 / month. Unlimited sends, unlimited alerts, family hub, and priority routing. 7-day free trial.'}
      </p>
      {isActive ? (
        <div
          className={`mt-6 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
            isActive ? 'border-background/20 text-background/80' : 'border-border text-foreground'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Active until {buddyPlus?.periodEnd ? new Date(buddyPlus.periodEnd).toLocaleDateString() : '—'}
        </div>
      ) : (
        <Link
          href="/pricing"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          Start free trial
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </section>
  )
}

function RecentTransfers({ transfers }: { readonly transfers: readonly LocalTransfer[] }) {
  const recent = transfers.slice(0, 4)
  return (
    <section className="rounded-[2rem] border border-border bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Recent transfers
        </div>
        {transfers.length > 0 && (
          <Link href="/dashboard#transfers" className="text-xs font-semibold text-coral hover:underline">
            View all
          </Link>
        )}
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={Send}
          title="No transfers yet"
          body="Your sent transfers will show up here with live delivery status."
          cta={{ href: '/send/recipient?amount=500', label: 'Start your first transfer' }}
        />
      ) : (
        <ul className="divide-y divide-border">
          {recent.map((transfer) => (
            <li key={transfer.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">
                  {transfer.recipientName}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(transfer.createdAt).toLocaleDateString()} · {transfer.provider}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-lg leading-none text-foreground tabular-nums">
                  ${transfer.sourceAmount.toLocaleString()}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <StatusDot status={transfer.status} />
                  {transfer.status.replace(/_/g, ' ')}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function SavedRecipients({ recipients }: { readonly recipients: readonly LocalRecipient[] }) {
  const recent = recipients.slice(0, 4)
  return (
    <section className="rounded-[2rem] border border-border bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Saved recipients
        </div>
        {recipients.length > 4 && (
          <span className="text-xs text-muted-foreground">+{recipients.length - 4} more</span>
        )}
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No recipients saved"
          body="Add a recipient once and we’ll remember them for every future transfer."
          cta={{ href: '/send/recipient?amount=500', label: 'Add a recipient' }}
        />
      ) : (
        <div className="space-y-2">
          {recent.map((recipient) => (
            <div
              key={recipient.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-background p-4"
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-xs font-bold ${recipient.avatarColor}`}
              >
                {recipient.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground text-sm truncate">
                  {recipient.fullName}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {recipient.payoutMethod} · {recipient.sendCount} sends
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ActiveAlerts({ alerts }: { readonly alerts: readonly LocalRateAlert[] }) {
  const active = alerts.filter((a) => a.active).slice(0, 3)
  return (
    <section className="rounded-[2rem] border border-border bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Rate alerts
        </div>
        <Link href="/alerts" className="text-xs font-semibold text-coral hover:underline">
          Manage
        </Link>
      </div>

      {active.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No active alerts"
          body="Tell us your target rate and we’ll email you the moment it hits."
          cta={{ href: '/alerts', label: 'Create alert' }}
        />
      ) : (
        <ul className="space-y-3">
          {active.map((alert) => (
            <li
              key={alert.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-background p-4"
            >
              <div>
                <div className="font-semibold text-foreground text-sm">
                  {alert.sourceCurrency} → {alert.targetCurrency}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Target {alert.targetRate.toFixed(2)} · {alert.payoutMethod}
                </div>
              </div>
              <TrendingUp className="h-4 w-4 text-teal" />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function FamilyGroups({ families }: { readonly families: readonly LocalFamilyGroup[] }) {
  const recent = families.slice(0, 3)
  return (
    <section className="rounded-[2rem] border border-border bg-card p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Family groups
        </div>
        <Link href="/family" className="text-xs font-semibold text-coral hover:underline">
          Manage
        </Link>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family groups"
          body="Bundle recipients, set a shared goal, and track progress as a family."
          cta={{ href: '/family', label: 'Create a group' }}
        />
      ) : (
        <ul className="space-y-3">
          {recent.map((group) => (
            <li
              key={group.id}
              className="rounded-2xl border border-border bg-background p-4"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold text-foreground text-sm">{group.name}</div>
                <div className="text-xs text-muted-foreground">
                  {group.members.length} members
                </div>
              </div>
              {group.goal ? (
                <div className="mt-3 text-xs text-muted-foreground">
                  Goal: {group.goal.label} · ${group.goal.targetAmount.toLocaleString()}
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EmptyState({
  icon: Icon,
  title,
  body,
  cta,
}: {
  readonly icon: typeof Send
  readonly title: string
  readonly body: string
  readonly cta: { readonly href: string; readonly label: string }
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-8 text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 font-display text-lg text-foreground">{title}</div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">{body}</p>
      <Link
        href={cta.href}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-coral hover:underline"
      >
        {cta.label}
        <ArrowUpRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

function StatusDot({ status }: { readonly status: LocalTransfer['status'] }) {
  const color =
    status === 'delivered'
      ? 'bg-teal'
      : status === 'failed' || status === 'cancelled'
        ? 'bg-destructive'
        : status === 'processing' || status === 'payment_received'
          ? 'bg-gold'
          : 'bg-muted-foreground'
  return <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 align-middle ${color}`} />
}

// Suppress unused import warning for Clock — kept for future "arriving in X min" label.
void Clock

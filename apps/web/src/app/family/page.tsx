'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'
import {
  familyGroupsStore,
  recipientsStore,
  transfersStore,
  type LocalFamilyGroup,
  type LocalRecipient,
  type LocalTransfer,
} from '@/lib/local-db'

interface NewGroupDraft {
  name: string
  goalLabel: string
  goalTarget: string
  recipientIds: string[]
}

const EMPTY_DRAFT: NewGroupDraft = {
  name: '',
  goalLabel: '',
  goalTarget: '',
  recipientIds: [],
}

export default function FamilyHubPage() {
  const [groups, setGroups] = useState<LocalFamilyGroup[]>([])
  const [recipients, setRecipients] = useState<LocalRecipient[]>([])
  const [transfers, setTransfers] = useState<LocalTransfer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [draft, setDraft] = useState<NewGroupDraft>(EMPTY_DRAFT)

  useEffect(() => {
    setGroups(familyGroupsStore.list())
    setRecipients(recipientsStore.list())
    setTransfers(transfersStore.list())
  }, [])

  const hasGroups = groups.length > 0
  const hasRecipients = recipients.length > 0

  function toggleRecipient(id: string) {
    setDraft((prev) => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(id)
        ? prev.recipientIds.filter((r) => r !== id)
        : [...prev.recipientIds, id],
    }))
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.name.trim()) return
    const targetAmount = Number(draft.goalTarget) || 0
    const created = familyGroupsStore.create({
      name: draft.name.trim(),
      members: [{ id: 'owner', name: 'You', role: 'owner' }],
      goal:
        draft.goalLabel.trim() && targetAmount > 0
          ? { label: draft.goalLabel.trim(), targetAmount, currency: 'USD' }
          : null,
      recipientIds: draft.recipientIds,
    })
    setGroups([created, ...groups])
    setDraft(EMPTY_DRAFT)
    setShowForm(false)
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-coral">Family Hub</div>
        <h1 className="font-sans font-semibold tracking-tight text-4xl sm:text-5xl leading-[1.05]">Send as a family, save as one.</h1>
        <p className="max-w-2xl text-muted-foreground">
          Create a family group, pool recipients, set a shared savings goal, and watch progress as
          each of you sends money home. Everything stays on this device until your account is
          ready to sync.
        </p>
      </header>

      {!hasGroups && !showForm ? (
        <EmptyState onStart={() => setShowForm(true)} hasRecipients={hasRecipients} />
      ) : null}

      {showForm ? (
        <NewGroupForm
          draft={draft}
          setDraft={setDraft}
          recipients={recipients}
          toggleRecipient={toggleRecipient}
          onCancel={() => {
            setShowForm(false)
            setDraft(EMPTY_DRAFT)
          }}
          onSubmit={handleCreate}
        />
      ) : null}

      {hasGroups ? (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-sans font-semibold tracking-tight text-2xl">Your groups</h2>
            {!showForm ? (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              >
                + New group
              </button>
            ) : null}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {groups.map((group) => (
              <FamilyGroupCard
                key={group.id}
                group={group}
                recipients={recipients}
                transfers={transfers}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function EmptyState({
  onStart,
  hasRecipients,
}: {
  readonly onStart: () => void
  readonly hasRecipients: boolean
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/10 text-coral">
        <Users className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <h2 className="font-sans font-semibold tracking-tight text-2xl">No family groups yet</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasRecipients
          ? 'Bundle your existing recipients into a group and track savings toward a shared goal.'
          : 'Add a recipient first, then create a group to pool everyone together.'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onStart}
          className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Create your first group
        </button>
        {!hasRecipients ? (
          <Link
            href="/send/recipient"
            className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            Add a recipient
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function NewGroupForm({
  draft,
  setDraft,
  recipients,
  toggleRecipient,
  onCancel,
  onSubmit,
}: {
  readonly draft: NewGroupDraft
  readonly setDraft: React.Dispatch<React.SetStateAction<NewGroupDraft>>
  readonly recipients: readonly LocalRecipient[]
  readonly toggleRecipient: (id: string) => void
  readonly onCancel: () => void
  readonly onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Group name
        </label>
        <input
          type="text"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="The Reyes family"
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
          autoFocus
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Shared goal (optional)
          </label>
          <input
            type="text"
            value={draft.goalLabel}
            onChange={(e) => setDraft({ ...draft, goalLabel: e.target.value })}
            placeholder="Roof repairs"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Target (USD)
          </label>
          <input
            type="number"
            min="0"
            value={draft.goalTarget}
            onChange={(e) => setDraft({ ...draft, goalTarget: e.target.value })}
            placeholder="2500"
            className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm outline-none focus:border-coral"
          />
        </div>
      </div>

      {recipients.length > 0 ? (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Recipients in this group
          </label>
          <div className="flex flex-wrap gap-2">
            {recipients.map((r) => {
              const selected = draft.recipientIds.includes(r.id)
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => toggleRecipient(r.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                    selected
                      ? 'border-coral bg-coral/10 text-coral'
                      : 'border-border bg-background hover:bg-muted'
                  }`}
                >
                  {r.fullName}
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <p className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
          No recipients yet — you can add them later and attach them to this group.
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.02]"
        >
          Create group
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

function FamilyGroupCard({
  group,
  recipients,
  transfers,
}: {
  readonly group: LocalFamilyGroup
  readonly recipients: readonly LocalRecipient[]
  readonly transfers: readonly LocalTransfer[]
}) {
  const members = group.members
  const groupRecipients = useMemo(
    () => recipients.filter((r) => group.recipientIds.includes(r.id)),
    [recipients, group.recipientIds],
  )

  const stats = useMemo(() => {
    const groupTransfers = transfers.filter((t) => group.recipientIds.includes(t.recipientId))
    const totalSent = groupTransfers.reduce((sum, t) => sum + t.sourceAmount, 0)
    const totalSaved = groupTransfers.reduce((sum, t) => {
      // Savings vs baseline: approx Wise retail + 0.55%, here we approximate as buddy fee gap.
      const baseline = t.sourceAmount * 0.042
      return sum + Math.max(0, baseline - (t.providerFee + t.buddyFee))
    }, 0)
    return { totalSent, totalSaved, sendCount: groupTransfers.length }
  }, [transfers, group.recipientIds])

  const goalProgress =
    group.goal && group.goal.targetAmount > 0
      ? Math.min(100, (stats.totalSent / group.goal.targetAmount) * 100)
      : null

  return (
    <article className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="space-y-1">
        <h3 className="font-sans font-semibold tracking-tight text-xl">{group.name}</h3>
        <p className="text-xs text-muted-foreground">
          {members.length} {members.length === 1 ? 'member' : 'members'} ·{' '}
          {groupRecipients.length} {groupRecipients.length === 1 ? 'recipient' : 'recipients'}
        </p>
      </div>

      {group.goal ? (
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {group.goal.label}
            </div>
            <div className="text-sm font-semibold">
              ${stats.totalSent.toFixed(0)}{' '}
              <span className="text-muted-foreground">
                / ${group.goal.targetAmount.toFixed(0)}
              </span>
            </div>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-coral transition-all"
              style={{ width: `${goalProgress ?? 0}%` }}
            />
          </div>
        </div>
      ) : null}

      <dl className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Sends</dt>
          <dd className="font-sans font-semibold tabular-nums text-lg">{stats.sendCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Sent</dt>
          <dd className="font-sans font-semibold tabular-nums text-lg">${stats.totalSent.toFixed(0)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Saved</dt>
          <dd className="font-sans font-semibold tabular-nums text-lg text-teal">${stats.totalSaved.toFixed(0)}</dd>
        </div>
      </dl>

      {groupRecipients.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {groupRecipients.map((r) => (
            <span
              key={r.id}
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${r.avatarColor}`}
            >
              {r.fullName.split(' ')[0]}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Recipient } from '@remit/db'

type BankAccount = { type: string; details: Record<string, string> }

type FormState = {
  name: string
  nickname: string
  country: string
  accountType: string
  accountDetails: string
  isDefault: boolean
}

const EMPTY_FORM: FormState = {
  name: '',
  nickname: '',
  country: '',
  accountType: '',
  accountDetails: '',
  isDefault: false,
}

function formatBankAccount(bankAccount: unknown): string {
  const ba = bankAccount as BankAccount
  if (!ba || typeof ba !== 'object') return '—'
  const type = ba.type ?? ''
  const details = Object.entries(ba.details ?? {})
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ')
  return details ? `${type} · ${details}` : type
}

export function RecipientsClient({ initialRecipients }: { initialRecipients: Recipient[] }) {
  const router = useRouter()
  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function openAdd() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowForm(true)
  }

  function openEdit(r: Recipient) {
    const ba = r.bankAccount as BankAccount
    setEditingId(r.id)
    setForm({
      name: r.name,
      nickname: r.nickname ?? '',
      country: r.country,
      accountType: ba?.type ?? '',
      accountDetails: Object.entries(ba?.details ?? {})
        .map(([k, v]) => `${k}=${v}`)
        .join('\n'),
      isDefault: r.isDefault,
    })
    setError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(EMPTY_FORM)
    setError(null)
  }

  function parseAccountDetails(raw: string): Record<string, string> {
    const result: Record<string, string> = {}
    for (const line of raw.split('\n')) {
      const idx = line.indexOf('=')
      if (idx > 0) {
        const key = line.slice(0, idx).trim()
        const value = line.slice(idx + 1).trim()
        if (key) result[key] = value
      }
    }
    return result
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      name: form.name.trim(),
      nickname: form.nickname.trim() || undefined,
      country: form.country.trim().toUpperCase(),
      bankAccount: {
        type: form.accountType.trim(),
        details: parseAccountDetails(form.accountDetails),
      },
      isDefault: form.isDefault,
    }

    try {
      let res: Response
      if (editingId) {
        res = await fetch(`/api/recipients/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      } else {
        res = await fetch('/api/recipients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Something went wrong')
        return
      }

      router.refresh()
      closeForm()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recipient? This cannot be undone.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/recipients/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setRecipients((prev) => prev.filter((r) => r.id !== id))
        router.refresh()
      }
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSetDefault(id: string) {
    await fetch(`/api/recipients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDefault: true }),
    })
    router.refresh()
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Saved recipients</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {recipients.length === 0
              ? 'No recipients saved yet.'
              : `${recipients.length} recipient${recipients.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium"
        >
          + Add recipient
        </button>
      </div>

      {/* Recipient list */}
      <div className="mt-6">
        {recipients.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-sm text-muted-foreground">
              Save a recipient to reuse their details on future transfers.
            </p>
            <button
              onClick={openAdd}
              className="mt-3 text-xs font-medium text-primary hover:underline"
            >
              Add your first recipient →
            </button>
          </div>
        ) : (
          <div className="divide-y rounded-lg border">
            {recipients.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{r.name}</p>
                    {r.nickname && (
                      <span className="text-xs text-muted-foreground">"{r.nickname}"</span>
                    )}
                    {r.isDefault && (
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 text-xs font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.country} · {formatBankAccount(r.bankAccount)}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4 shrink-0">
                  {!r.isDefault && (
                    <button
                      onClick={() => handleSetDefault(r.id)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Set default
                    </button>
                  )}
                  <button
                    onClick={() => openEdit(r)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    {deletingId === r.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
            <h2 className="text-base font-semibold">
              {editingId ? 'Edit recipient' : 'Add recipient'}
            </h2>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Full name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  placeholder="e.g. Maria Santos"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Nickname <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  placeholder='e.g. "Mom" or "Business account"'
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Country <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value.toUpperCase() }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  placeholder="e.g. PH"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Account type <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.accountType}
                  onChange={(e) => setForm((f) => ({ ...f, accountType: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm"
                  placeholder="e.g. philippines, iban, sort_code, aba"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Account details <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  value={form.accountDetails}
                  onChange={(e) => setForm((f) => ({ ...f, accountDetails: e.target.value }))}
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm font-mono"
                  rows={3}
                  placeholder={'accountNumber=1234567890\nbankCode=BPIPH'}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  One field per line: <code>key=value</code>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={form.isDefault}
                  onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  className="h-4 w-4 rounded border"
                />
                <label htmlFor="isDefault" className="text-sm">
                  Set as default recipient
                </label>
              </div>

              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {error}
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm font-medium disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editingId ? 'Save changes' : 'Add recipient'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-md border px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

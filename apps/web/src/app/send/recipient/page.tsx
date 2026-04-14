'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { Check, Plus, User } from 'lucide-react'
import {
  recipientsStore,
  activeTransferStore,
  type LocalRecipient,
} from '@/lib/local-db'

export default function RecipientPage() {
  return (
    <Suspense fallback={null}>
      <RecipientPageInner />
    </Suspense>
  )
}

function RecipientPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const amount = Number(searchParams.get('amount') ?? 500)
  const corridor = searchParams.get('corridor') ?? 'US-PH'
  const payout = (searchParams.get('payout') ?? 'gcash') as LocalRecipient['payoutMethod']

  const [recipients, setRecipients] = useState<LocalRecipient[]>([])
  const [mode, setMode] = useState<'select' | 'new'>('select')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    gcashNumber: '',
    bankAccountNumber: '',
    bankCode: '',
  })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const list = recipientsStore.list()
    setRecipients(list)
    if (list.length === 0) setMode('new')
  }, [])

  function handleContinue() {
    setError(null)

    let recipientId: string | null = selectedId
    if (mode === 'new') {
      if (!formData.fullName.trim()) {
        setError('Please enter the recipient name')
        return
      }
      if (payout === 'gcash' && !formData.gcashNumber.trim()) {
        setError('Please enter the GCash mobile number')
        return
      }
      if (payout === 'bank' && !formData.bankAccountNumber.trim()) {
        setError('Please enter the bank account number')
        return
      }

      const created = recipientsStore.create({
        fullName: formData.fullName.trim(),
        relationship: formData.relationship.trim() || null,
        country: 'PH',
        payoutMethod: payout,
        gcashNumber: payout === 'gcash' ? formData.gcashNumber.trim() : undefined,
        bankCode: payout === 'bank' ? formData.bankCode.trim() : undefined,
        bankAccountNumber: payout === 'bank' ? formData.bankAccountNumber.trim() : undefined,
      })
      recipientId = created.id
    }

    if (!recipientId) {
      setError('Please select or add a recipient')
      return
    }

    // Save draft — confirm page will fetch the live quote and finalize
    activeTransferStore.set({
      recipientId,
      sourceAmount: amount,
      sourceCurrency: 'USD',
      targetCurrency: 'PHP',
      payoutMethod: payout,
      quote: null,
    })

    router.push(`/send/confirm?amount=${amount}&corridor=${corridor}&payout=${payout}`)
  }

  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-coral mb-2">Step 1 of 3</div>
      <h1 className="font-display text-4xl lg:text-5xl leading-tight text-foreground mb-2">
        Who are you sending to?
      </h1>
      <p className="text-muted-foreground mb-8">
        Sending{' '}
        <span className="font-semibold text-foreground tabular-nums">${amount}</span> to the
        Philippines via {payout === 'gcash' ? 'GCash' : payout}.
      </p>

      {/* Saved recipients */}
      {recipients.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Saved recipients
            </div>
            <button
              type="button"
              onClick={() => {
                setMode('new')
                setSelectedId(null)
              }}
              className="text-xs font-semibold text-coral hover:underline"
            >
              + New recipient
            </button>
          </div>
          <div className="grid gap-2">
            {recipients.map((r) => {
              const selected = mode === 'select' && selectedId === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setMode('select')
                    setSelectedId(r.id)
                  }}
                  className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-all ${
                    selected
                      ? 'border-coral bg-coral/5 shadow-level-1'
                      : 'border-border bg-card hover:border-foreground/30'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl grid place-items-center shrink-0 ${r.avatarColor}`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground">
                      {r.fullName}
                      {r.relationship && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          · {r.relationship}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {r.payoutMethod === 'gcash'
                        ? `GCash · ${r.gcashNumber}`
                        : r.payoutMethod === 'bank'
                          ? `Bank · ${r.bankCode} · ${r.bankAccountNumber}`
                          : r.payoutMethod}
                      {r.sendCount > 0 && <> · {r.sendCount} sends</>}
                    </div>
                  </div>
                  {selected && <Check className="h-5 w-5 text-coral shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* New recipient form */}
      {mode === 'new' && (
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-coral/10 grid place-items-center">
              <Plus className="h-4 w-4 text-coral" />
            </div>
            <div className="font-semibold text-foreground">New recipient</div>
          </div>

          <div className="space-y-4">
            <Field label="Full name">
              <input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Maria Santos"
                className="w-full rounded-lg border border-border bg-background px-3 h-11 text-sm text-foreground outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all"
              />
            </Field>

            <Field label="Relationship" optional>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 h-11 text-sm text-foreground outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all"
              >
                <option value="">Select…</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Cousin">Cousin</option>
                <option value="Friend">Friend</option>
                <option value="Other">Other</option>
              </select>
            </Field>

            {payout === 'gcash' && (
              <Field label="GCash mobile number">
                <input
                  value={formData.gcashNumber}
                  onChange={(e) => setFormData({ ...formData, gcashNumber: e.target.value })}
                  placeholder="+63 917 123 4567"
                  className="w-full rounded-lg border border-border bg-background px-3 h-11 text-sm text-foreground outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all"
                />
              </Field>
            )}

            {payout === 'bank' && (
              <>
                <Field label="Bank">
                  <select
                    value={formData.bankCode}
                    onChange={(e) => setFormData({ ...formData, bankCode: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 h-11 text-sm text-foreground outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all"
                  >
                    <option value="">Select a Philippine bank…</option>
                    <option value="BPI">BPI — Bank of the Philippine Islands</option>
                    <option value="BDO">BDO — Banco de Oro</option>
                    <option value="Metrobank">Metrobank</option>
                    <option value="LandBank">LandBank</option>
                    <option value="PNB">PNB — Philippine National Bank</option>
                    <option value="UnionBank">UnionBank</option>
                    <option value="RCBC">RCBC</option>
                    <option value="Security Bank">Security Bank</option>
                  </select>
                </Field>
                <Field label="Account number">
                  <input
                    value={formData.bankAccountNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, bankAccountNumber: e.target.value })
                    }
                    placeholder="0000 0000 0000"
                    className="w-full rounded-lg border border-border bg-background px-3 h-11 text-sm text-foreground outline-none focus:border-coral focus:ring-2 focus:ring-coral/20 transition-all font-mono"
                  />
                </Field>
              </>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm px-4 py-3">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleContinue}
        className="w-full h-12 rounded-full bg-coral text-white font-semibold hover:brightness-110 transition-all active:scale-[0.98] shadow-glow-coral"
      >
        Continue to review →
      </button>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Recipient info is stored locally on this device. We migrate to the cloud when you create an
        account.
      </p>
    </div>
  )
}

function Field({
  label,
  optional,
  children,
}: {
  readonly label: string
  readonly optional?: boolean
  readonly children: React.ReactNode
}) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-semibold text-foreground">
        {label}
        {optional && <span className="ml-1 text-muted-foreground font-normal">· optional</span>}
      </label>
      {children}
    </div>
  )
}

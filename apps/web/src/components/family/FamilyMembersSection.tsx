'use client'

import { useRef, useState } from 'react'
import { Camera, Plus, Trash2, X } from 'lucide-react'
import type { LocalRecipient } from '@/lib/local-db'
import { useRecipients, type RecipientInput } from '@/lib/hooks/useRecipients'
import { resizeImageToDataUrl } from '@/lib/image-resize'

interface EditingState {
  readonly mode: 'new' | 'edit'
  readonly id?: string
  readonly fullName: string
  readonly nickname: string
  readonly relationship: string
  readonly birthday: string
  readonly notes: string
  readonly photoDataUrl?: string
}

const EMPTY_DRAFT: EditingState = {
  mode: 'new',
  fullName: '',
  nickname: '',
  relationship: '',
  birthday: '',
  notes: '',
}

export function FamilyMembersSection() {
  const { recipients, loading, create, update, remove } = useRecipients()
  const [editing, setEditing] = useState<EditingState | null>(null)

  return (
    <section className="rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-card">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-foreground">
            Your family
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the people you send money to. Photos stay on this device until you sync your
            account.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing({ ...EMPTY_DRAFT })}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add member
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : recipients.length === 0 ? (
          <EmptyState onAdd={() => setEditing({ ...EMPTY_DRAFT })} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {recipients.map((r) => (
              <MemberCard
                key={r.id}
                member={r}
                onClick={() =>
                  setEditing({
                    mode: 'edit',
                    id: r.id,
                    fullName: r.fullName,
                    nickname: r.nickname ?? '',
                    relationship: r.relationship ?? '',
                    birthday: r.birthday ?? '',
                    notes: r.notes ?? '',
                    photoDataUrl: r.photoDataUrl,
                  })
                }
              />
            ))}
          </div>
        )}
      </div>

      {editing && (
        <MemberModal
          state={editing}
          onClose={() => setEditing(null)}
          onSave={async (patch) => {
            if (editing.mode === 'edit' && editing.id) {
              await update(editing.id, patch)
            } else {
              await create({
                ...patch,
                country: 'ph',
                relationship: patch.relationship ?? null,
              } as RecipientInput)
            }
            setEditing(null)
          }}
          onDelete={
            editing.mode === 'edit' && editing.id
              ? async () => {
                  await remove(editing.id!)
                  setEditing(null)
                }
              : undefined
          }
        />
      )}
    </section>
  )
}

function EmptyState({ onAdd }: { readonly onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-10 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-white border border-slate-200 grid place-items-center shadow-sm">
        <Camera className="h-6 w-6 text-slate-500" />
      </div>
      <div className="mt-4 text-base font-semibold text-foreground">No family members yet</div>
      <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
        Start with Mom or your closest recipient — add a photo, nickname, and birthday so every
        send feels personal.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-5 inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add your first member
      </button>
    </div>
  )
}

function MemberCard({
  member,
  onClick,
}: {
  readonly member: LocalRecipient
  readonly onClick: () => void
}) {
  const initials = getInitials(member.nickname || member.fullName)
  const display = member.nickname || member.fullName
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-card-lg"
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
        {member.photoDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoDataUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span
            className={`absolute inset-0 grid place-items-center text-3xl font-extrabold ${member.avatarColor}`}
            aria-hidden
          >
            {initials}
          </span>
        )}
      </div>
      <div className="mt-3 min-w-0">
        <div className="truncate text-sm font-bold text-slate-900">{display}</div>
        <div className="truncate text-[12px] text-slate-500">
          {member.relationship || 'Family'}
          {member.birthday ? ` · ${formatBirthdayShort(member.birthday)}` : ''}
        </div>
      </div>
    </button>
  )
}

function MemberModal({
  state,
  onClose,
  onSave,
  onDelete,
}: {
  readonly state: EditingState
  readonly onClose: () => void
  readonly onSave: (patch: Partial<RecipientInput> & { photoDataUrl?: string; nickname?: string; birthday?: string; notes?: string }) => Promise<void>
  readonly onDelete?: () => Promise<void>
}) {
  const [draft, setDraft] = useState<EditingState>(state)
  const [submitting, setSubmitting] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoError(null)
    try {
      const dataUrl = await resizeImageToDataUrl(file, { maxDim: 240, quality: 0.75 })
      setDraft((p) => ({ ...p, photoDataUrl: dataUrl }))
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not read image')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.fullName.trim()) return
    setSubmitting(true)
    try {
      await onSave({
        fullName: draft.fullName.trim(),
        nickname: draft.nickname.trim() || undefined,
        relationship: draft.relationship.trim() || null,
        birthday: draft.birthday.trim() || undefined,
        notes: draft.notes.trim() || undefined,
        photoDataUrl: draft.photoDataUrl,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="relative w-full max-w-md rounded-2xl bg-white shadow-card-lg p-6"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid place-items-center w-8 h-8 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 className="text-lg font-bold text-slate-900">
          {state.mode === 'new' ? 'Add family member' : 'Edit profile'}
        </h3>

        <div className="mt-5 flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-100 ring-2 ring-white shadow-sm shrink-0">
            {draft.photoDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={draft.photoDataUrl}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="absolute inset-0 grid place-items-center text-slate-400">
                <Camera className="h-7 w-7" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-slate-300"
            >
              <Camera className="h-3.5 w-3.5" />
              {draft.photoDataUrl ? 'Change photo' : 'Upload photo'}
            </button>
            {draft.photoDataUrl && (
              <button
                type="button"
                onClick={() => setDraft((p) => ({ ...p, photoDataUrl: undefined }))}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                Remove
              </button>
            )}
          </div>
        </div>
        {photoError && <p className="mt-2 text-xs text-rose-600">{photoError}</p>}

        <div className="mt-5 space-y-4">
          <Field label="Full name" required>
            <input
              autoFocus
              type="text"
              value={draft.fullName}
              onChange={(e) => setDraft((p) => ({ ...p, fullName: e.target.value }))}
              className={inputCls}
              placeholder="Maria Santos"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nickname">
              <input
                type="text"
                value={draft.nickname}
                onChange={(e) => setDraft((p) => ({ ...p, nickname: e.target.value }))}
                className={inputCls}
                placeholder="Mom"
              />
            </Field>
            <Field label="Relationship">
              <input
                type="text"
                value={draft.relationship}
                onChange={(e) => setDraft((p) => ({ ...p, relationship: e.target.value }))}
                className={inputCls}
                placeholder="Mother"
              />
            </Field>
          </div>
          <Field label="Birthday">
            <input
              type="date"
              value={draft.birthday}
              onChange={(e) => setDraft((p) => ({ ...p, birthday: e.target.value }))}
              className={inputCls}
            />
          </Field>
          <Field label="Notes">
            <textarea
              rows={2}
              value={draft.notes}
              onChange={(e) => setDraft((p) => ({ ...p, notes: e.target.value }))}
              className={`${inputCls} h-auto`}
              placeholder="Medication schedule, allergies, how they like to be reminded…"
            />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-between gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Remove this profile? This also removes their send history on this device.')) return
                await onDelete()
              }}
              className="inline-flex items-center gap-1.5 h-10 px-3 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center h-10 px-4 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !draft.fullName.trim()}
              className="inline-flex items-center h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  readonly label: string
  readonly required?: boolean
  readonly children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}

const inputCls =
  'block w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all'

function getInitials(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

function formatBirthdayShort(iso: string): string {
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

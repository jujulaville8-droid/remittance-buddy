'use client'

import { useState } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { useSessionUser } from '@/lib/hooks/useSessionUser'
import { createClient } from '@/lib/supabase/client'

/**
 * Inline card that appears on the dashboard when the signed-in user has no
 * display name set on their Supabase auth metadata. Used to rescue the
 * profile circle and greetings from defaulting to their email local-part.
 */
export function DisplayNamePrompt() {
  const { user, refresh } = useSessionUser()
  const existing = (user?.user_metadata?.full_name as string | undefined) ?? ''
  const [name, setName] = useState(existing)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Nothing to prompt if we already have a name or the user is guest
  if (!user || existing.trim().length > 0) return null

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSaving(true)
    setError(null)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.updateUser({
        data: { full_name: trimmed },
      })
      if (err) throw err
      setSaved(true)
      // Pull the fresh session so the nav avatar picks up the new initials
      await refresh?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mb-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-white p-5 lg:p-6 shadow-sm">
      <div className="flex items-start gap-3 flex-wrap">
        <span className="grid place-items-center w-9 h-9 rounded-lg bg-blue-600 text-white shrink-0">
          <Sparkles className="h-4 w-4" />
        </span>
        <div className="flex-1 min-w-[260px]">
          <div className="text-sm font-bold text-slate-900">
            Let&rsquo;s personalise things
          </div>
          <p className="mt-1 text-[13px] text-slate-600 leading-relaxed">
            Pal will use this to greet you, address your family, and sign receipts. You can
            change it anytime.
          </p>
          <form onSubmit={handleSave} className="mt-3 flex items-center gap-2 flex-wrap">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Julian Laville"
              className="flex-1 min-w-[180px] h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
            />
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving…' : saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : (
                'Save name'
              )}
            </button>
          </form>
          {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
        </div>
      </div>
    </div>
  )
}

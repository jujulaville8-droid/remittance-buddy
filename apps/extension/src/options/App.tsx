import { useEffect, useState } from 'react'
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_PREFS,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '../lib/constants'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const CORRIDORS = [
  { value: 'US-PH' as const, label: 'United States → Philippines' },
  { value: 'UK-PH' as const, label: 'United Kingdom → Philippines' },
  { value: 'SG-PH' as const, label: 'Singapore → Philippines' },
  { value: 'AE-PH' as const, label: 'UAE → Philippines' },
  { value: 'SA-PH' as const, label: 'Saudi Arabia → Philippines' },
]

const PAYOUT_METHODS = [
  { value: 'gcash' as const, label: 'GCash' },
  { value: 'maya' as const, label: 'Maya' },
  { value: 'bank' as const, label: 'Bank deposit' },
  { value: 'cash_pickup' as const, label: 'Cash pickup' },
]

export function OptionsApp() {
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS)
  const [apiOverride, setApiOverride] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => {
    loadPreferences().then((p) => {
      setPrefs(p)
      setApiOverride(p.apiBaseUrl ?? '')
      setLoaded(true)
    })
  }, [])

  async function handleSave() {
    setSaveState('saving')
    try {
      await savePreferences({
        apiBaseUrl: apiOverride.trim() || null,
        defaultCorridor: prefs.defaultCorridor,
        defaultPayout: prefs.defaultPayout,
      })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch {
      setSaveState('error')
    }
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(210,40%,98%)] text-[hsl(220,30%,12%)] font-sans">
      <div className="max-w-2xl mx-auto px-8 py-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-full bg-[hsl(220,30%,12%)] grid place-items-center text-white font-serif text-base">
              R
            </div>
            <span className="font-serif text-xl tracking-tight">Remittance Buddy</span>
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] mb-3">Settings</h1>
          <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
            Configure your default corridor and payout method. Changes apply immediately to the
            popup and side panel.
          </p>
        </header>

        <section className="space-y-8">
          <Field label="Default corridor" hint="Where you most often send money.">
            <select
              value={prefs.defaultCorridor}
              onChange={(e) =>
                setPrefs({ ...prefs, defaultCorridor: e.target.value as UserPreferences['defaultCorridor'] })
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
            >
              {CORRIDORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Preferred payout method" hint="How your recipient receives the money.">
            <select
              value={prefs.defaultPayout}
              onChange={(e) =>
                setPrefs({ ...prefs, defaultPayout: e.target.value as UserPreferences['defaultPayout'] })
              }
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/30"
            >
              {PAYOUT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="pt-6 border-t border-black/10">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500 mb-4">
              Advanced
            </div>
            <Field
              label="API base URL override"
              hint={`Leave blank to use the default (${DEFAULT_API_BASE_URL}).`}
            >
              <input
                type="url"
                placeholder={DEFAULT_API_BASE_URL}
                value={apiOverride}
                onChange={(e) => setApiOverride(e.target.value)}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-mono outline-none focus:border-black/30"
              />
            </Field>
          </div>

          <div className="pt-8 flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="inline-flex items-center rounded-full bg-[hsl(218,85%,55%)] px-7 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saveState === 'saving' ? 'Saving…' : 'Save settings'}
            </button>
            {saveState === 'saved' && (
              <span className="text-sm text-[hsl(174,84%,32%)] font-medium">Saved ✓</span>
            )}
            {saveState === 'error' && (
              <span className="text-sm text-red-600 font-medium">Something went wrong</span>
            )}
          </div>
        </section>

        <footer className="mt-16 pt-8 border-t border-black/10 text-xs text-neutral-500">
          Remittance Buddy never stores your personal data on our servers. All preferences live
          in chrome.storage.local on this device only.
        </footer>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  readonly label: string
  readonly hint?: string
  readonly children: React.ReactNode
}) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600 mb-2">
        {label}
      </div>
      {children}
      {hint ? <div className="mt-2 text-xs text-neutral-500">{hint}</div> : null}
    </label>
  )
}

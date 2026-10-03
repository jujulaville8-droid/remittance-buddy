import { useEffect, useState } from 'react'
import {
  DEFAULT_PREFS,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '../lib/constants'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

const CORRIDORS = [
  { value: 'CA-PH' as const, label: 'Canada → Philippines' },
  { value: 'AU-PH' as const, label: 'Australia → Philippines' },
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
  const [loaded, setLoaded] = useState(false)
  const [saveState, setSaveState] = useState<SaveState>('idle')

  useEffect(() => {
    loadPreferences().then((p) => {
      setPrefs(p)
      setLoaded(true)
    })
  }, [])

  async function handleSave() {
    setSaveState('saving')
    try {
      await savePreferences({
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
      <div className="flex min-h-screen items-center justify-center text-sm text-neutral-500">
        Loading…
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(210,40%,98%)] font-sans text-[hsl(220,30%,12%)]">
      <div className="mx-auto max-w-2xl px-8 py-16">
        <header className="mb-12">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[hsl(220,30%,12%)] font-serif text-base text-white">
              R
            </div>
            <span className="font-serif text-xl tracking-tight">My Remittance Pal</span>
          </div>
          <h1 className="mb-3 font-serif text-4xl leading-[1.05]">Settings</h1>
          <p className="max-w-md text-sm leading-relaxed text-neutral-500">
            Configure your default corridor and payout method. Saved preferences are used when you
            next open the popup or side panel. Payout availability must be confirmed with the
            provider.
          </p>
        </header>

        <section className="space-y-8">
          <Field label="Default corridor" hint="Where you most often send money.">
            <select
              value={prefs.defaultCorridor}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  defaultCorridor: e.target.value as UserPreferences['defaultCorridor'],
                })
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
                setPrefs({
                  ...prefs,
                  defaultPayout: e.target.value as UserPreferences['defaultPayout'],
                })
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

          <div className="flex items-center gap-4 pt-8">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveState === 'saving'}
              className="inline-flex items-center rounded-full bg-[hsl(218,85%,55%)] px-7 py-3 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saveState === 'saving' ? 'Saving…' : 'Save settings'}
            </button>
            {saveState === 'saved' && (
              <span className="text-sm font-medium text-[hsl(174,84%,32%)]">Saved ✓</span>
            )}
            {saveState === 'error' && (
              <span className="text-sm font-medium text-red-600">Something went wrong</span>
            )}
          </div>
        </section>

        <footer className="mt-16 border-t border-black/10 pt-8 text-xs text-neutral-500">
          Preferences are stored on this device. Quote requests send the amount, currencies and
          selected preferences to our comparison API. See the extension privacy policy for details.
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
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-600">
        {label}
      </div>
      {children}
      {hint ? <div className="mt-2 text-xs text-neutral-500">{hint}</div> : null}
    </label>
  )
}

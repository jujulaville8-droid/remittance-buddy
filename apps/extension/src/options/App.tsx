import { useEffect, useState } from 'react'
import { ArrowLeftRight, Info } from 'lucide-react'
import '../styles/comparison.css'
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
      <main className="comparison-settings comparison-settings-loading" role="status">
        Loading settings…
      </main>
    )
  }

  return (
    <main className="comparison-settings">
      <div className="comparison-settings-content">
        <header className="comparison-settings-header">
          <div className="comparison-brand">
            <ArrowLeftRight className="comparison-brand-icon" size={24} aria-hidden="true" />
            <span>My Remittance Pal</span>
          </div>
          <h1>Settings</h1>
          <p className="comparison-muted">
            Choose your usual route and payout preference. Saved settings are used when you next
            open the popup or side panel.
          </p>
        </header>

        <form
          className="comparison-settings-form comparison-surface"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSave()
          }}
        >
          <Field
            id="default-corridor"
            label="Default corridor"
            hint="Where you most often send money."
          >
            <select
              id="default-corridor"
              name="corridor"
              aria-describedby="default-corridor-hint"
              value={prefs.defaultCorridor}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  defaultCorridor: e.target.value as UserPreferences['defaultCorridor'],
                })
              }
            >
              {CORRIDORS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="default-payout"
            label="Payout preference"
            hint="Confirm payout availability with the provider."
          >
            <select
              id="default-payout"
              name="payout"
              aria-describedby="default-payout-hint"
              value={prefs.defaultPayout}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  defaultPayout: e.target.value as UserPreferences['defaultPayout'],
                })
              }
            >
              {PAYOUT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>

          <button type="submit" disabled={saveState === 'saving'} className="comparison-primary">
            {saveState === 'saving' ? 'Saving…' : 'Save settings'}
          </button>
          <p role="status" aria-live="polite" className="comparison-save-status">
            {saveState === 'saved' && 'Settings saved'}
            {saveState === 'error' && 'Could not save settings. Please try again.'}
          </p>
        </form>

        <footer className="comparison-footer">
          <p className="comparison-provider-note">
            <Info size={16} aria-hidden="true" />
            <span>
              Preferences are stored on this device. Quote requests send the amount, currencies and
              selected preferences to our comparison API. See the extension privacy policy for
              details.
            </span>
          </p>
        </footer>
      </div>
    </main>
  )
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  readonly id: string
  readonly label: string
  readonly hint: string
  readonly children: React.ReactNode
}) {
  return (
    <div className="comparison-field">
      <label htmlFor={id}>{label}</label>
      {children}
      <p id={`${id}-hint`} className="comparison-muted">
        {hint}
      </p>
    </div>
  )
}

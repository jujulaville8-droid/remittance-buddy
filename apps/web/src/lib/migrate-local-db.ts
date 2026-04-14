/**
 * localStorage → Postgres migration.
 *
 * During the V1 build phase Neon is paused and all durable data lives in
 * localStorage (see `lib/local-db.ts`). When the user's first authenticated
 * session runs after the DB is unpaused, call `migrateLocalDbToServer()` to
 * push their recipients, transfers, affiliate clicks, family groups, and
 * rate alerts to the server in one idempotent batch.
 *
 * Design notes:
 * - Fire-and-forget from the client via POST /api/migrate. The server
 *   upserts into Postgres, returning a manifest of what was accepted.
 * - Each client-generated UUID becomes the Postgres primary key, so repeated
 *   runs are no-ops (ON CONFLICT DO NOTHING on the server side).
 * - On success we mark the local payload as migrated (`migratedAt`) but do
 *   NOT delete it — keeping it around lets the user work offline and lets
 *   us investigate mismatches if the server report disagrees with local.
 */

import {
  LOCAL_DB_KEYS,
  recipientsStore,
  transfersStore,
  affiliateClicksStore,
  familyGroupsStore,
  rateAlertsStore,
  type LocalRecipient,
  type LocalTransfer,
  type LocalAffiliateClick,
  type LocalFamilyGroup,
  type LocalRateAlert,
} from './local-db'

const MIGRATION_KEY = `${LOCAL_DB_KEYS.user}:migration`

export interface MigrationPayload {
  readonly recipients: readonly LocalRecipient[]
  readonly transfers: readonly LocalTransfer[]
  readonly affiliateClicks: readonly LocalAffiliateClick[]
  readonly familyGroups: readonly LocalFamilyGroup[]
  readonly rateAlerts: readonly LocalRateAlert[]
  readonly clientVersion: string
  readonly generatedAt: string
}

export interface MigrationReport {
  readonly ok: boolean
  readonly migratedAt: string
  readonly counts: {
    readonly recipients: number
    readonly transfers: number
    readonly affiliateClicks: number
    readonly familyGroups: number
    readonly rateAlerts: number
  }
  readonly errors: readonly string[]
}

interface MigrationState {
  readonly lastAttemptAt: string | null
  readonly lastSuccessAt: string | null
  readonly lastReport: MigrationReport | null
}

function readState(): MigrationState {
  if (typeof window === 'undefined') {
    return { lastAttemptAt: null, lastSuccessAt: null, lastReport: null }
  }
  try {
    const raw = window.localStorage.getItem(MIGRATION_KEY)
    if (!raw) return { lastAttemptAt: null, lastSuccessAt: null, lastReport: null }
    return JSON.parse(raw) as MigrationState
  } catch {
    return { lastAttemptAt: null, lastSuccessAt: null, lastReport: null }
  }
}

function writeState(state: MigrationState): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(MIGRATION_KEY, JSON.stringify(state))
  } catch {
    // ignore — localStorage may be full or blocked
  }
}

export function buildMigrationPayload(): MigrationPayload {
  return {
    recipients: recipientsStore.list(),
    transfers: transfersStore.list(),
    affiliateClicks: affiliateClicksStore.list(),
    familyGroups: familyGroupsStore.list(),
    rateAlerts: rateAlertsStore.list(),
    clientVersion: 'v1',
    generatedAt: new Date().toISOString(),
  }
}

export function hasLocalDataToMigrate(): boolean {
  const p = buildMigrationPayload()
  return (
    p.recipients.length > 0 ||
    p.transfers.length > 0 ||
    p.affiliateClicks.length > 0 ||
    p.familyGroups.length > 0 ||
    p.rateAlerts.length > 0
  )
}

export function getMigrationState(): MigrationState {
  return readState()
}

/**
 * POSTs the local payload to /api/migrate. Returns the server's report on
 * success, or throws on network/validation failure. Marks migration complete
 * in localStorage on success so we don't re-run every page load.
 *
 * Idempotent: the server uses client UUIDs as primary keys and skips
 * conflicts, so multiple calls with overlapping data are safe.
 */
export async function migrateLocalDbToServer(): Promise<MigrationReport> {
  const state = readState()
  const attemptAt = new Date().toISOString()

  if (!hasLocalDataToMigrate()) {
    const report: MigrationReport = {
      ok: true,
      migratedAt: attemptAt,
      counts: {
        recipients: 0,
        transfers: 0,
        affiliateClicks: 0,
        familyGroups: 0,
        rateAlerts: 0,
      },
      errors: [],
    }
    writeState({ ...state, lastAttemptAt: attemptAt, lastSuccessAt: attemptAt, lastReport: report })
    return report
  }

  const payload = buildMigrationPayload()

  let res: Response
  try {
    res = await fetch('/api/migrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    writeState({ ...state, lastAttemptAt: attemptAt })
    throw new Error(`Migration network error: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (!res.ok) {
    writeState({ ...state, lastAttemptAt: attemptAt })
    const text = await res.text().catch(() => '')
    throw new Error(`Migration failed (${res.status}): ${text}`)
  }

  const report = (await res.json()) as MigrationReport
  writeState({
    lastAttemptAt: attemptAt,
    lastSuccessAt: report.ok ? attemptAt : state.lastSuccessAt,
    lastReport: report,
  })
  return report
}

/**
 * Convenience: run migration if it hasn't succeeded before. Safe to call
 * from any authenticated page's effect — it no-ops after the first success.
 */
export async function ensureMigrated(): Promise<MigrationReport | null> {
  const state = readState()
  if (state.lastSuccessAt) return state.lastReport
  if (!hasLocalDataToMigrate()) return null
  try {
    return await migrateLocalDbToServer()
  } catch (err) {
    console.warn('[migrate-local-db] deferred:', err)
    return null
  }
}

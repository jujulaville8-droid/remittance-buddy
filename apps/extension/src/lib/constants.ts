/** A single reviewed production endpoint. Overrides are intentionally disabled. */
export const DEFAULT_API_BASE_URL = 'https://remitance-buddy.vercel.app'
export const API_BASE_URL =
  typeof __REMIT_API_ORIGIN__ === 'string' ? __REMIT_API_ORIGIN__ : DEFAULT_API_BASE_URL

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'remit_auth_token',
  REFRESH_TOKEN: 'remit_refresh_token',
  USER_PROFILE: 'remit_user_profile',
  ONBOARDING_COMPLETE: 'remit_onboarding_complete',
  API_BASE_URL_OVERRIDE: 'remit_api_base_url',
  DEFAULT_CORRIDOR: 'remit_default_corridor',
  DEFAULT_PAYOUT: 'remit_default_payout',
} as const

export interface UserPreferences {
  readonly apiBaseUrl: string | null
  readonly defaultCorridor: 'US-PH' | 'UK-PH' | 'SG-PH' | 'AE-PH' | 'SA-PH' | 'CA-PH' | 'AU-PH'
  readonly defaultPayout: 'gcash' | 'maya' | 'bank' | 'cash_pickup'
  readonly defaultAmount: number
}

export const DEFAULT_PREFS: UserPreferences = {
  apiBaseUrl: null,
  defaultCorridor: 'US-PH',
  defaultPayout: 'bank',
  defaultAmount: 500,
}

/**
 * Load user prefs from chrome.storage.local.
 * Falls back to DEFAULT_PREFS when chrome.storage is unavailable.
 */
export async function loadPreferences(): Promise<UserPreferences> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return DEFAULT_PREFS
  try {
    const raw = await chrome.storage.local.get([
      STORAGE_KEYS.DEFAULT_CORRIDOR,
      STORAGE_KEYS.DEFAULT_PAYOUT,
    ])
    return {
      apiBaseUrl: null,
      defaultCorridor:
        (raw[STORAGE_KEYS.DEFAULT_CORRIDOR] as UserPreferences['defaultCorridor'] | undefined) ??
        DEFAULT_PREFS.defaultCorridor,
      defaultPayout:
        (raw[STORAGE_KEYS.DEFAULT_PAYOUT] as UserPreferences['defaultPayout'] | undefined) ??
        DEFAULT_PREFS.defaultPayout,
      defaultAmount: DEFAULT_PREFS.defaultAmount,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export async function savePreferences(prefs: Partial<UserPreferences>): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return
  const payload: Record<string, unknown> = {}
  if (prefs.defaultCorridor) payload[STORAGE_KEYS.DEFAULT_CORRIDOR] = prefs.defaultCorridor
  if (prefs.defaultPayout) payload[STORAGE_KEYS.DEFAULT_PAYOUT] = prefs.defaultPayout
  await chrome.storage.local.set(payload)
}

/**
 * Resolve the single approved public API endpoint. Legacy overrides are ignored.
 * Network code should call this instead of reading API_BASE_URL directly.
 */
export async function resolveApiBaseUrl(): Promise<string> {
  return API_BASE_URL
}

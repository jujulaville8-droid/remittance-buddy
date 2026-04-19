/**
 * Type-safe localStorage persistence layer.
 *
 * During the V1 build phase, Neon Postgres is paused for cost. This module
 * provides a drop-in replacement that stores the same shapes the Drizzle
 * schemas expect, so migration on unpause is a straightforward read → upsert
 * loop (see `lib/migrate-local-db.ts`).
 *
 * Keys are versioned (v1:*) so we can evolve schemas without clobbering.
 */

export const LOCAL_DB_VERSION = 'v1'

export const LOCAL_DB_KEYS = {
  recipients: `${LOCAL_DB_VERSION}:recipients`,
  transfers: `${LOCAL_DB_VERSION}:transfers`,
  activeTransfer: `${LOCAL_DB_VERSION}:active_transfer`,
  affiliateClicks: `${LOCAL_DB_VERSION}:affiliate_clicks`,
  familyGroups: `${LOCAL_DB_VERSION}:family_groups`,
  rateAlerts: `${LOCAL_DB_VERSION}:rate_alerts`,
  user: `${LOCAL_DB_VERSION}:user`,
  buddyPlus: `${LOCAL_DB_VERSION}:buddy_plus`,
} as const

// ────────────────────────────────────────────────────────────
// Shapes (mirror Drizzle schemas in packages/db/src/schema/)
// ────────────────────────────────────────────────────────────

export interface LocalRecipient {
  readonly id: string // uuid generated client-side
  readonly fullName: string
  readonly relationship: string | null
  readonly country: string // ISO 3166-1 alpha-2
  readonly payoutMethod: 'gcash' | 'maya' | 'bank' | 'cash_pickup'
  readonly gcashNumber?: string
  readonly mayaNumber?: string
  readonly bankCode?: string
  readonly bankAccountNumber?: string
  readonly avatarColor: string // tailwind class name for visual distinction
  readonly createdAt: string // ISO timestamp
  readonly lastUsedAt: string | null
  readonly sendCount: number
}

export type LocalTransferStatus =
  | 'quote'
  | 'awaiting_payment'
  | 'payment_received'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'cancelled'

export interface LocalTransfer {
  readonly id: string
  readonly recipientId: string
  readonly recipientName: string
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly targetAmount: number
  readonly targetCurrency: string
  readonly exchangeRate: number
  readonly providerFee: number
  readonly buddyFee: number
  readonly totalCost: number
  readonly provider: string // which rail we route through
  readonly providerSlug: string
  readonly status: LocalTransferStatus
  readonly statusHistory: ReadonlyArray<{ status: LocalTransferStatus; at: string }>
  readonly createdAt: string
  readonly updatedAt: string
  readonly deliveredAt: string | null
}

export interface LocalAffiliateClick {
  readonly id: string
  readonly provider: string
  readonly amount: number
  readonly affiliateUrl: string
  readonly context: 'popup' | 'hero' | 'compare' | 'sidepanel'
  readonly clickedAt: string
  readonly synced: boolean // flipped to true after DB migration
}

export interface LocalFamilyGroup {
  readonly id: string
  readonly name: string
  readonly members: ReadonlyArray<{ id: string; name: string; role: 'owner' | 'member' }>
  readonly goal: { readonly label: string; readonly targetAmount: number; readonly currency: string } | null
  readonly recipientIds: readonly string[]
  readonly createdAt: string
}

export interface LocalRateAlert {
  readonly id: string
  readonly email: string
  readonly corridor: string // e.g. "US-PH"
  readonly sourceCurrency: string
  readonly targetCurrency: string
  readonly targetRate: number // trigger when live rate >= this
  readonly payoutMethod: 'gcash' | 'maya' | 'bank' | 'cash_pickup'
  readonly active: boolean
  readonly createdAt: string
  readonly lastTriggeredAt: string | null
}

export interface LocalBuddyPlusState {
  readonly active: boolean
  readonly checkoutSessionId: string | null
  readonly subscriptionId: string | null
  readonly periodEnd: string | null
}

// ────────────────────────────────────────────────────────────
// Generic store helpers
// ────────────────────────────────────────────────────────────

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.warn(`[local-db] write failed for ${key}:`, err)
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function nowIso(): string {
  return new Date().toISOString()
}

// ────────────────────────────────────────────────────────────
// Recipients
// ────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'bg-coral/15 text-coral',
  'bg-teal/15 text-teal',
  'bg-gold/15 text-gold',
  'bg-[hsl(260,50%,60%)]/15 text-[hsl(260,50%,60%)]',
  'bg-[hsl(180,50%,40%)]/15 text-[hsl(180,50%,40%)]',
] as const

export const recipientsStore = {
  list(): LocalRecipient[] {
    return read<LocalRecipient[]>(LOCAL_DB_KEYS.recipients, [])
  },

  get(id: string): LocalRecipient | null {
    return this.list().find((r) => r.id === id) ?? null
  },

  create(input: Omit<LocalRecipient, 'id' | 'createdAt' | 'lastUsedAt' | 'sendCount' | 'avatarColor'>): LocalRecipient {
    const existing = this.list()
    const avatarColor = AVATAR_COLORS[existing.length % AVATAR_COLORS.length]!
    const recipient: LocalRecipient = {
      ...input,
      id: uuid(),
      createdAt: nowIso(),
      lastUsedAt: null,
      sendCount: 0,
      avatarColor,
    }
    write(LOCAL_DB_KEYS.recipients, [recipient, ...existing])
    return recipient
  },

  update(id: string, patch: Partial<LocalRecipient>): LocalRecipient | null {
    const existing = this.list()
    const idx = existing.findIndex((r) => r.id === id)
    if (idx === -1) return null
    const updated = { ...existing[idx], ...patch } as LocalRecipient
    existing[idx] = updated
    write(LOCAL_DB_KEYS.recipients, existing)
    return updated
  },

  remove(id: string): void {
    write(
      LOCAL_DB_KEYS.recipients,
      this.list().filter((r) => r.id !== id),
    )
  },

  markUsed(id: string): void {
    const r = this.get(id)
    if (!r) return
    this.update(id, { lastUsedAt: nowIso(), sendCount: r.sendCount + 1 })
  },
}

// ────────────────────────────────────────────────────────────
// Transfers
// ────────────────────────────────────────────────────────────

export const transfersStore = {
  list(): LocalTransfer[] {
    return read<LocalTransfer[]>(LOCAL_DB_KEYS.transfers, [])
  },

  get(id: string): LocalTransfer | null {
    return this.list().find((t) => t.id === id) ?? null
  },

  create(input: Omit<LocalTransfer, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory' | 'deliveredAt'>): LocalTransfer {
    const now = nowIso()
    const transfer: LocalTransfer = {
      ...input,
      id: uuid(),
      createdAt: now,
      updatedAt: now,
      statusHistory: [{ status: input.status, at: now }],
      deliveredAt: input.status === 'delivered' ? now : null,
    }
    write(LOCAL_DB_KEYS.transfers, [transfer, ...this.list()])
    return transfer
  },

  updateStatus(id: string, status: LocalTransferStatus): LocalTransfer | null {
    const existing = this.list()
    const idx = existing.findIndex((t) => t.id === id)
    if (idx === -1) return null
    const now = nowIso()
    const prev = existing[idx]!
    const updated: LocalTransfer = {
      ...prev,
      status,
      updatedAt: now,
      statusHistory: [...prev.statusHistory, { status, at: now }],
      deliveredAt: status === 'delivered' ? now : prev.deliveredAt,
    }
    existing[idx] = updated
    write(LOCAL_DB_KEYS.transfers, existing)
    return updated
  },
}

// ────────────────────────────────────────────────────────────
// Active transfer (draft state between pages in the send flow)
// ────────────────────────────────────────────────────────────

export interface ActiveTransferDraft {
  readonly recipientId: string | null
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly targetCurrency: string
  readonly payoutMethod: 'gcash' | 'maya' | 'bank' | 'cash_pickup'
  readonly quote: {
    readonly provider: string
    readonly providerSlug: string
    readonly targetAmount: number
    readonly exchangeRate: number
    readonly providerFee: number
    readonly buddyFee: number
    readonly totalCost: number
    readonly deliveryTime: string
    readonly lockedUntil: string // ISO
  } | null
}

export const activeTransferStore = {
  get(): ActiveTransferDraft | null {
    return read<ActiveTransferDraft | null>(LOCAL_DB_KEYS.activeTransfer, null)
  },

  set(draft: ActiveTransferDraft): void {
    write(LOCAL_DB_KEYS.activeTransfer, draft)
  },

  clear(): void {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(LOCAL_DB_KEYS.activeTransfer)
  },
}

// ────────────────────────────────────────────────────────────
// Affiliate click log
// ────────────────────────────────────────────────────────────

export const affiliateClicksStore = {
  list(): LocalAffiliateClick[] {
    return read<LocalAffiliateClick[]>(LOCAL_DB_KEYS.affiliateClicks, [])
  },

  log(input: Omit<LocalAffiliateClick, 'id' | 'clickedAt' | 'synced'>): LocalAffiliateClick {
    const click: LocalAffiliateClick = {
      ...input,
      id: uuid(),
      clickedAt: nowIso(),
      synced: false,
    }
    const list = this.list()
    list.unshift(click)
    // Keep last 500 clicks to avoid unbounded storage
    write(LOCAL_DB_KEYS.affiliateClicks, list.slice(0, 500))
    return click
  },

  stats(): Record<string, number> {
    const stats: Record<string, number> = {}
    for (const click of this.list()) {
      stats[click.provider] = (stats[click.provider] ?? 0) + 1
    }
    return stats
  },
}

// ────────────────────────────────────────────────────────────
// Family groups
// ────────────────────────────────────────────────────────────

export const familyGroupsStore = {
  list(): LocalFamilyGroup[] {
    return read<LocalFamilyGroup[]>(LOCAL_DB_KEYS.familyGroups, [])
  },

  get(id: string): LocalFamilyGroup | null {
    return this.list().find((g) => g.id === id) ?? null
  },

  create(input: Omit<LocalFamilyGroup, 'id' | 'createdAt'>): LocalFamilyGroup {
    const group: LocalFamilyGroup = { ...input, id: uuid(), createdAt: nowIso() }
    write(LOCAL_DB_KEYS.familyGroups, [group, ...this.list()])
    return group
  },

  remove(id: string): void {
    write(
      LOCAL_DB_KEYS.familyGroups,
      this.list().filter((g) => g.id !== id),
    )
  },
}

// ────────────────────────────────────────────────────────────
// Rate alerts
// ────────────────────────────────────────────────────────────

export const rateAlertsStore = {
  list(): LocalRateAlert[] {
    return read<LocalRateAlert[]>(LOCAL_DB_KEYS.rateAlerts, [])
  },

  create(
    input: Omit<LocalRateAlert, 'id' | 'createdAt' | 'lastTriggeredAt' | 'active'>,
  ): LocalRateAlert {
    const alert: LocalRateAlert = {
      ...input,
      id: uuid(),
      createdAt: nowIso(),
      lastTriggeredAt: null,
      active: true,
    }
    write(LOCAL_DB_KEYS.rateAlerts, [alert, ...this.list()])
    return alert
  },

  setActive(id: string, active: boolean): void {
    const list = this.list()
    const idx = list.findIndex((a) => a.id === id)
    if (idx === -1) return
    list[idx] = { ...list[idx]!, active }
    write(LOCAL_DB_KEYS.rateAlerts, list)
  },

  remove(id: string): void {
    write(
      LOCAL_DB_KEYS.rateAlerts,
      this.list().filter((a) => a.id !== id),
    )
  },
}

// ────────────────────────────────────────────────────────────
// Buddy Plus subscription state
// ────────────────────────────────────────────────────────────

export const buddyPlusStore = {
  get(): LocalBuddyPlusState {
    return read<LocalBuddyPlusState>(LOCAL_DB_KEYS.buddyPlus, {
      active: false,
      checkoutSessionId: null,
      subscriptionId: null,
      periodEnd: null,
    })
  },

  set(state: LocalBuddyPlusState): void {
    write(LOCAL_DB_KEYS.buddyPlus, state)
  },

  activate(subscriptionId: string, periodEnd: string): void {
    this.set({
      active: true,
      checkoutSessionId: null,
      subscriptionId,
      periodEnd,
    })
  },

  cancel(): void {
    this.set({
      active: false,
      checkoutSessionId: null,
      subscriptionId: null,
      periodEnd: null,
    })
  },
}

// ────────────────────────────────────────────────────────────
// Export a namespace for convenient imports
// ────────────────────────────────────────────────────────────

export const localDb = {
  recipients: recipientsStore,
  transfers: transfersStore,
  activeTransfer: activeTransferStore,
  affiliateClicks: affiliateClicksStore,
  familyGroups: familyGroupsStore,
  rateAlerts: rateAlertsStore,
  buddyPlus: buddyPlusStore,
}

/**
 * Buddy Plus gating.
 *
 * Free tier caps are enforced at the hook / DB helper layer, so any
 * callsite that wraps a create() automatically honours them. When a
 * free-tier user tries to exceed a limit, we throw a PlanLimitError
 * — consumers catch it and surface an "Upgrade to Plus" CTA.
 */

export const FREE_LIMITS = {
  recipients: 3,
  rateAlerts: 3,
  familyGroups: 1,
} as const

export type PlanFeature = keyof typeof FREE_LIMITS

const FEATURE_LABELS: Record<PlanFeature, string> = {
  recipients: 'recipient',
  rateAlerts: 'rate alert',
  familyGroups: 'family group',
}

export class PlanLimitError extends Error {
  readonly feature: PlanFeature
  readonly limit: number

  constructor(feature: PlanFeature) {
    const limit = FREE_LIMITS[feature]
    const label = FEATURE_LABELS[feature]
    super(
      `You've hit the free-plan limit of ${limit} ${label}${limit === 1 ? '' : 's'}. Upgrade to Buddy Plus for unlimited.`,
    )
    this.feature = feature
    this.limit = limit
    this.name = 'PlanLimitError'
  }
}

export function isPlanLimitError(err: unknown): err is PlanLimitError {
  return err instanceof PlanLimitError || (err as { name?: string })?.name === 'PlanLimitError'
}

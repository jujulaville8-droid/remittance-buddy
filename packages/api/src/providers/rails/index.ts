export type * from './types'
export { NiumProvider } from './nium'
export { CurrencycloudProvider } from './currencycloud'
export { ThunesProvider } from './thunes'

import type { RailsProvider, RailsProviderConfig } from './types'
import { NiumProvider } from './nium'
import { CurrencycloudProvider } from './currencycloud'
import { ThunesProvider } from './thunes'

/**
 * Factory — returns a fresh rails provider instance based on env config.
 * In V1 there's no real credential, so all stubs run in "stub mode" returning
 * placeholder responses. V2 swaps real keys in via env vars.
 */
export function createRailsProvider(
  slug: 'nium' | 'currencycloud' | 'thunes',
  config: RailsProviderConfig,
): RailsProvider {
  switch (slug) {
    case 'nium':
      return new NiumProvider(config)
    case 'currencycloud':
      return new CurrencycloudProvider(config)
    case 'thunes':
      return new ThunesProvider(config)
  }
}

/**
 * Multi-rail router: picks the best rails provider for a given corridor.
 * V2 will extend this with volume-based routing and negotiated rate comparison.
 */
export function pickRailForCorridor(senderCountry: string): 'nium' | 'currencycloud' | 'thunes' {
  // V1: prefer NIUM for PH corridors (best GCash integration),
  // Thunes for MENA/African corridors, Currencycloud as fallback.
  if (['AE', 'SA', 'NG', 'KE', 'EG', 'MA'].includes(senderCountry)) return 'thunes'
  if (['US', 'GB', 'SG', 'CA', 'AU'].includes(senderCountry)) return 'nium'
  return 'currencycloud'
}

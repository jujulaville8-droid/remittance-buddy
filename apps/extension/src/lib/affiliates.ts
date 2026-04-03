/**
 * Centralized affiliate link infrastructure.
 *
 * Once approved on affiliate networks (Impact, CJ Affiliate, Wise Direct),
 * replace the `url` values with your tracked affiliate links.
 * The `network` and `status` fields help track which are live vs pending.
 */

export type AffiliateNetwork = 'impact' | 'cj' | 'wise-direct' | 'none';
export type AffiliateStatus = 'pending' | 'active' | 'unavailable';

interface AffiliateProvider {
  readonly provider: string;
  readonly network: AffiliateNetwork;
  readonly status: AffiliateStatus;
  readonly url: string;
  readonly fallbackUrl: string;
}

const PROVIDERS: readonly AffiliateProvider[] = [
  {
    provider: 'Remitly',
    network: 'impact',
    status: 'pending',
    url: '', // Replace with Impact tracked link once approved
    fallbackUrl: 'https://www.remitly.com/us/en/philippines',
  },
  {
    provider: 'Wise',
    network: 'wise-direct',
    status: 'pending',
    url: '', // Replace with Wise affiliate link (wise.com/partnerships/affiliates)
    fallbackUrl: 'https://wise.com/us/send-money/send-money-to-philippines',
  },
  {
    provider: 'Xoom',
    network: 'cj',
    status: 'pending',
    url: '', // Replace with CJ Affiliate tracked link
    fallbackUrl: 'https://www.xoom.com/philippines/send-money',
  },
  {
    provider: 'Western Union',
    network: 'cj',
    status: 'pending',
    url: '', // Replace with CJ/Awin tracked link
    fallbackUrl: 'https://www.westernunion.com/us/en/send-money-to-philippines.html',
  },
  {
    provider: 'MoneyGram',
    network: 'cj',
    status: 'pending',
    url: '', // Replace with CJ Affiliate tracked link
    fallbackUrl: 'https://www.moneygram.com/mgo/us/en/send/philippines',
  },
  {
    provider: 'WorldRemit',
    network: 'impact',
    status: 'pending',
    url: '', // Replace with Impact tracked link once approved
    fallbackUrl: 'https://www.worldremit.com/en/philippines',
  },
  {
    provider: 'Pangea',
    network: 'none',
    status: 'unavailable',
    url: '',
    fallbackUrl: 'https://www.pangeamoneytransfer.com',
  },
];

const providerMap = new Map(
  PROVIDERS.map((p) => [p.provider, p])
);

/**
 * Get the affiliate URL for a provider.
 * Returns the tracked affiliate link if active, otherwise the fallback landing page.
 */
export function getAffiliateUrl(provider: string): string {
  const entry = providerMap.get(provider);
  if (!entry) return '#';
  return (entry.status === 'active' && entry.url) ? entry.url : entry.fallbackUrl;
}

/**
 * Track an affiliate click. Call this when a user clicks a provider CTA.
 * Stores click data locally for analytics.
 */
export async function trackAffiliateClick(provider: string, context: 'popup' | 'chat' | 'comparison') {
  const entry = providerMap.get(provider);
  if (!entry) return;

  const click = {
    provider,
    network: entry.network,
    status: entry.status,
    context,
    timestamp: Date.now(),
  };

  try {
    const stored = await chrome.storage.local.get('affiliate_clicks');
    const clicks: unknown[] = stored.affiliate_clicks ?? [];
    clicks.push(click);
    // Keep last 500 clicks to avoid unbounded storage
    const trimmed = clicks.slice(-500);
    await chrome.storage.local.set({ affiliate_clicks: trimmed });
  } catch {
    // Storage unavailable (e.g., in dev/test outside extension context)
  }
}

/**
 * Get click analytics summary.
 */
export async function getClickStats(): Promise<Record<string, number>> {
  try {
    const stored = await chrome.storage.local.get('affiliate_clicks');
    const clicks: Array<{ provider: string }> = stored.affiliate_clicks ?? [];
    const stats: Record<string, number> = {};
    for (const click of clicks) {
      stats[click.provider] = (stats[click.provider] ?? 0) + 1;
    }
    return stats;
  } catch {
    return {};
  }
}

/**
 * Get all provider affiliate info (for admin/debug views).
 */
export function getProviderInfo(): readonly AffiliateProvider[] {
  return PROVIDERS;
}

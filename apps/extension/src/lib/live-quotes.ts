/**
 * Extension client for the /api/quotes endpoint.
 *
 * Calls the same endpoint the landing page uses, normalizes the response into
 * the shape the existing scoring engine expects, so the popup and sidepanel
 * get the same real data as the web app.
 */

import { API_BASE_URL } from './constants';
import type { ProviderQuote, ScoringResult } from './scoring-engine';
import { scoreProviders } from './scoring-engine';

interface LiveQuoteAPI {
  readonly provider: string;
  readonly providerSlug: string;
  readonly sourceAmount: number;
  readonly sourceCurrency: string;
  readonly targetAmount: number;
  readonly targetCurrency: string;
  readonly exchangeRate: number;
  readonly midMarketRate: number;
  readonly fee: number;
  readonly totalCost: number;
  readonly spread: number;
  readonly deliveryTime: string;
  readonly deliveryMinutes: number;
  readonly supportsGcash: boolean;
  readonly supportsMaya: boolean;
  readonly supportsBank: boolean;
  readonly supportsCashPickup: boolean;
  readonly trustScore: number;
  readonly affiliateUrl: string;
  readonly fetchedAt: string;
  readonly source: 'live-api' | 'scraped' | 'cached' | 'fallback';
}

interface QuoteResponse {
  readonly quotes: readonly LiveQuoteAPI[];
  readonly errors: readonly { provider: string; error: string }[];
  readonly fetchedAt: string;
  readonly durationMs: number;
  readonly cached?: boolean;
}

export interface LiveQuoteResult {
  readonly result: ScoringResult;
  readonly fetchedAt: Date;
  readonly cached: boolean;
  readonly errors: readonly { provider: string; error: string }[];
  readonly fromFallback: boolean;
}

export interface FetchQuotesArgs {
  readonly sourceAmount: number;
  readonly sourceCurrency?: string;
  readonly targetCurrency?: string;
  readonly corridor?: 'US-PH' | 'UK-PH' | 'SG-PH' | 'AE-PH' | 'SA-PH';
  readonly payoutMethod?: 'gcash' | 'maya' | 'bank' | 'cash_pickup';
  readonly signal?: AbortSignal;
}

const DEFAULTS = {
  corridor: 'US-PH' as const,
  sourceCurrency: 'USD',
  targetCurrency: 'PHP',
  payoutMethod: 'gcash' as const,
};

/**
 * Fetch live quotes from the web API and run them through the local scoring engine.
 * Falls back to the local hardcoded scoring engine if the API is unreachable
 * (for example if the extension is loaded while the dev server is down).
 */
export async function fetchLiveQuotes(args: FetchQuotesArgs): Promise<LiveQuoteResult> {
  const {
    sourceAmount,
    corridor = DEFAULTS.corridor,
    sourceCurrency = DEFAULTS.sourceCurrency,
    targetCurrency = DEFAULTS.targetCurrency,
    payoutMethod = DEFAULTS.payoutMethod,
    signal,
  } = args;

  const params = new URLSearchParams({
    corridor,
    sourceCurrency,
    targetCurrency,
    sourceAmount: sourceAmount.toString(),
    payoutMethod,
  });
  const url = `${API_BASE_URL}/api/quotes?${params.toString()}`;

  try {
    const res = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Quote API returned ${res.status}`);
    }
    const data = (await res.json()) as QuoteResponse;
    if (!data.quotes || data.quotes.length === 0) {
      throw new Error('No quotes returned from API');
    }

    // Normalize LiveQuoteAPI → ProviderQuote (scoring engine input format)
    const providerQuotes: ProviderQuote[] = data.quotes.map((q) => ({
      provider: q.provider,
      sendAmount: q.sourceAmount,
      receiveAmount: Math.round(q.targetAmount),
      exchangeRate: q.exchangeRate,
      fee: q.fee,
      totalCost: q.totalCost,
      deliveryTime: q.deliveryTime,
      gcash: q.supportsGcash,
      cashPickup: q.supportsCashPickup,
      trustScore: q.trustScore,
    }));

    const result = scoreProvidersFromLive(providerQuotes);

    return {
      result,
      fetchedAt: new Date(data.fetchedAt),
      cached: Boolean(data.cached),
      errors: data.errors ?? [],
      fromFallback: false,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw err;
    }
    // Graceful fallback: call the local scoring engine with hardcoded rates
    console.warn('[live-quotes] Falling back to local scoring engine:', err);
    const result = scoreProviders(sourceAmount);
    return {
      result,
      fetchedAt: new Date(),
      cached: false,
      errors: [],
      fromFallback: true,
    };
  }
}

/**
 * Run the existing scoring-engine ranking logic against an externally-provided
 * list of provider quotes. Mirrors the local `scoreProviders` but accepts
 * raw quotes instead of generating from hardcoded PROVIDER_DATA.
 */
function scoreProvidersFromLive(quotes: readonly ProviderQuote[]): ScoringResult {
  if (quotes.length === 0) {
    throw new Error('scoreProvidersFromLive requires at least one quote');
  }

  const worstTotalCost = Math.max(...quotes.map((q) => q.totalCost));
  const worstReceiveAmount = Math.min(...quotes.map((q) => q.receiveAmount));

  // Sort by receiveAmount desc (best recipient amount first)
  const ranked = [...quotes].sort((a, b) => b.receiveAmount - a.receiveAmount);

  const bestOverall = ranked[0]!;
  const cheapest = [...quotes].sort((a, b) => a.totalCost - b.totalCost)[0]!;
  const fastest = [...quotes].sort((a, b) => {
    const am = /minute/i.test(a.deliveryTime) ? 5 : /hour/i.test(a.deliveryTime) ? 60 : 1440;
    const bm = /minute/i.test(b.deliveryTime) ? 5 : /hour/i.test(b.deliveryTime) ? 60 : 1440;
    return am - bm;
  })[0]!;
  const mostReceived = ranked[0]!;
  const mostTrusted = [...quotes].sort((a, b) => b.trustScore - a.trustScore)[0]!;
  const cashPickupQuotes = quotes.filter((q) => q.cashPickup);
  const bestCashPickup = cashPickupQuotes.length > 0
    ? [...cashPickupQuotes].sort((a, b) => b.receiveAmount - a.receiveAmount)[0]!
    : null;

  const scoredRanked = ranked.map((q) => {
    const savingsVsWorst = worstTotalCost - q.totalCost;
    const extraPesosVsWorst = q.receiveAmount - worstReceiveAmount;
    const badges: string[] = [];
    if (q === bestOverall) badges.push('best-overall');
    if (q === cheapest) badges.push('cheapest');
    if (q === fastest) badges.push('fastest');
    if (q === mostReceived) badges.push('most-pesos');
    if (q === mostTrusted) badges.push('most-trusted');

    // Weighted score matching the original scoring-engine logic
    const costScore = worstTotalCost === 0 ? 50 : 50 * (1 - q.totalCost / worstTotalCost);
    const receiveScore = worstReceiveAmount === 0 ? 30 : 30 * (q.receiveAmount / (worstReceiveAmount || 1));
    const trustScoreWeighted = (q.trustScore / 10) * 20;
    const overallScore = Math.round(costScore + receiveScore + trustScoreWeighted);

    const explanation = buildExplanation(q, badges, extraPesosVsWorst);

    return {
      ...q,
      overallScore,
      badges,
      explanation,
      savingsVsWorst,
      extraPesosVsWorst,
    };
  });

  return {
    ranked: scoredRanked,
    bestOverall: scoredRanked[0]!,
    cheapest: scoredRanked.find((q) => q.badges.includes('cheapest'))!,
    fastest: scoredRanked.find((q) => q.badges.includes('fastest'))!,
    mostReceived: scoredRanked.find((q) => q.badges.includes('most-pesos'))!,
    bestCashPickup: bestCashPickup
      ? scoredRanked.find((q) => q.provider === bestCashPickup.provider) ?? null
      : null,
    mostTrusted: scoredRanked.find((q) => q.badges.includes('most-trusted'))!,
    worstTotalCost,
    worstReceiveAmount,
  };
}

function buildExplanation(q: ProviderQuote, badges: readonly string[], extraPesos: number): string {
  if (badges.includes('best-overall')) {
    return `Best balance of price and delivery. Your family gets +₱${Math.round(extraPesos).toLocaleString()} more than the most expensive option.`;
  }
  if (badges.includes('cheapest')) {
    return `Lowest total cost at $${q.totalCost.toFixed(2)}.`;
  }
  if (badges.includes('fastest')) {
    return `Fastest delivery (${q.deliveryTime}). Ideal when time matters.`;
  }
  if (badges.includes('most-pesos')) {
    return `Delivers the most pesos: ₱${q.receiveAmount.toLocaleString()}.`;
  }
  if (badges.includes('most-trusted')) {
    return `Strongest trust rating (${q.trustScore}/10) based on licensing and customer history.`;
  }
  return `₱${q.receiveAmount.toLocaleString()} delivered · ${q.deliveryTime}.`;
}

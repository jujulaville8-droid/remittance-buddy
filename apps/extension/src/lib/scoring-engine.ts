/**
 * Scoring engine — ranks providers by weighted factors and assigns category winners.
 * This is the core decision engine, not a spreadsheet.
 */

export interface ProviderQuote {
  readonly provider: string;
  readonly sendAmount: number;
  readonly receiveAmount: number;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly totalCost: number;
  readonly deliveryTime: string;
  readonly gcash: boolean;
  readonly cashPickup: boolean;
  readonly trustScore: number; // 1-10
}

export interface ScoredQuote extends ProviderQuote {
  readonly overallScore: number;
  readonly badges: readonly string[];
  readonly explanation: string;
  readonly savingsVsWorst: number;
  readonly extraPesosVsWorst: number;
}

export interface UserPreferences {
  readonly priority: 'cheapest' | 'fastest' | 'most-received' | 'cash-pickup' | 'trusted';
}

export interface ScoringResult {
  readonly ranked: readonly ScoredQuote[];
  readonly bestOverall: ScoredQuote;
  readonly cheapest: ScoredQuote;
  readonly fastest: ScoredQuote;
  readonly mostReceived: ScoredQuote;
  readonly bestCashPickup: ScoredQuote | null;
  readonly mostTrusted: ScoredQuote;
  readonly worstTotalCost: number;
  readonly worstReceiveAmount: number;
}

// Provider data — will be replaced with live API data later
const PROVIDER_DATA = [
  { provider: 'Remitly', rate: 57.98, fee: 1.99, speed: 'Minutes', speedMinutes: 5, gcash: true, cashPickup: true, trust: 9 },
  { provider: 'Wise', rate: 58.33, fee: 4.14, speed: '1-2 days', speedMinutes: 1440, gcash: false, cashPickup: false, trust: 10 },
  { provider: 'Xoom', rate: 57.57, fee: 0, speed: 'Hours', speedMinutes: 120, gcash: true, cashPickup: true, trust: 8 },
  { provider: 'Western Union', rate: 56.99, fee: 5.00, speed: 'Minutes', speedMinutes: 5, gcash: true, cashPickup: true, trust: 9 },
  { provider: 'MoneyGram', rate: 57.28, fee: 4.99, speed: 'Minutes', speedMinutes: 5, gcash: true, cashPickup: true, trust: 8 },
  { provider: 'WorldRemit', rate: 57.75, fee: 2.99, speed: 'Minutes', speedMinutes: 5, gcash: true, cashPickup: false, trust: 7 },
  { provider: 'Pangea', rate: 57.87, fee: 3.95, speed: 'Same day', speedMinutes: 480, gcash: true, cashPickup: false, trust: 6 },
] as const;

function getSpeedMinutes(provider: string): number {
  return PROVIDER_DATA.find(p => p.provider === provider)?.speedMinutes ?? 1440;
}

function hasCashPickup(provider: string): boolean {
  return PROVIDER_DATA.find(p => p.provider === provider)?.cashPickup ?? false;
}

export function scoreProviders(
  amount: number,
  preferences?: UserPreferences,
): ScoringResult {
  // Generate quotes
  const quotes: ProviderQuote[] = PROVIDER_DATA.map(p => ({
    provider: p.provider,
    sendAmount: amount,
    receiveAmount: Math.round(amount * p.rate),
    exchangeRate: p.rate,
    fee: p.fee,
    totalCost: amount + p.fee,
    deliveryTime: p.speed,
    gcash: p.gcash,
    cashPickup: p.cashPickup,
    trustScore: p.trust,
  }));

  // Find extremes for savings calculation
  const worstTotalCost = Math.max(...quotes.map(q => q.totalCost));
  const worstReceiveAmount = Math.min(...quotes.map(q => q.receiveAmount));
  const bestReceiveAmount = Math.max(...quotes.map(q => q.receiveAmount));
  // Score each provider
  const scored: ScoredQuote[] = quotes.map(q => {
    const speedMins = getSpeedMinutes(q.provider);

    // Normalize scores 0-100
    const costScore = ((worstTotalCost - q.totalCost) / (worstTotalCost - Math.min(...quotes.map(x => x.totalCost)))) * 100 || 0;
    const receiveScore = ((q.receiveAmount - worstReceiveAmount) / (bestReceiveAmount - worstReceiveAmount)) * 100 || 0;
    const speedScore = speedMins <= 10 ? 100 : speedMins <= 120 ? 70 : speedMins <= 480 ? 40 : 10;
    const trustNorm = q.trustScore * 10;
    const gcashBonus = q.gcash ? 15 : 0;

    // Weighted overall score
    const weights = preferences?.priority === 'cheapest' ? { cost: 0.5, receive: 0.2, speed: 0.1, trust: 0.1, gcash: 0.1 }
      : preferences?.priority === 'fastest' ? { cost: 0.1, receive: 0.1, speed: 0.5, trust: 0.1, gcash: 0.2 }
      : preferences?.priority === 'most-received' ? { cost: 0.15, receive: 0.5, speed: 0.1, trust: 0.1, gcash: 0.15 }
      : preferences?.priority === 'cash-pickup' ? { cost: 0.2, receive: 0.15, speed: 0.3, trust: 0.15, gcash: 0.2 }
      : preferences?.priority === 'trusted' ? { cost: 0.15, receive: 0.15, speed: 0.1, trust: 0.5, gcash: 0.1 }
      : { cost: 0.3, receive: 0.25, speed: 0.2, trust: 0.15, gcash: 0.1 }; // default balanced

    const overallScore = (
      costScore * weights.cost +
      receiveScore * weights.receive +
      speedScore * weights.speed +
      trustNorm * weights.trust +
      gcashBonus * weights.gcash
    );

    // Badges
    const badges: string[] = [];

    // Savings calculations
    const savingsVsWorst = worstTotalCost - q.totalCost;
    const extraPesosVsWorst = q.receiveAmount - worstReceiveAmount;

    return {
      ...q,
      overallScore,
      badges,
      explanation: '', // filled below
      savingsVsWorst,
      extraPesosVsWorst,
    };
  });

  // Sort by overall score
  const ranked = [...scored].sort((a, b) => b.overallScore - a.overallScore);

  // Find category winners
  const cheapest = [...scored].sort((a, b) => a.totalCost - b.totalCost)[0]!;
  const fastest = [...scored].sort((a, b) => getSpeedMinutes(a.provider) - getSpeedMinutes(b.provider))[0]!;
  const mostReceived = [...scored].sort((a, b) => b.receiveAmount - a.receiveAmount)[0]!;
  const mostTrusted = [...scored].sort((a, b) => b.trustScore - a.trustScore)[0]!;
  const cashPickupOptions = scored.filter(q => hasCashPickup(q.provider));
  const bestCashPickup = cashPickupOptions.length > 0
    ? [...cashPickupOptions].sort((a, b) => a.totalCost - b.totalCost)[0]!
    : null;
  const bestOverall = ranked[0]!;

  // Assign badges and explanations
  const withBadges = ranked.map(q => {
    const badges: string[] = [];
    const explanations: string[] = [];

    if (q.provider === bestOverall.provider) {
      badges.push('best-overall');
      explanations.push('Best balance of price, speed, and reliability');
    }
    if (q.provider === cheapest.provider) {
      badges.push('cheapest');
      explanations.push(`Lowest total cost ($${q.totalCost.toFixed(2)})`);
    }
    if (q.provider === mostReceived.provider) {
      badges.push('most-received');
      explanations.push(`Your recipient gets the most pesos (₱${q.receiveAmount.toLocaleString()})`);
    }
    if (q.provider === fastest.provider && getSpeedMinutes(q.provider) <= 10) {
      badges.push('fastest');
      explanations.push('Arrives in minutes');
    }
    if (bestCashPickup && q.provider === bestCashPickup.provider) {
      badges.push('best-cash-pickup');
    }
    if (q.provider === mostTrusted.provider) {
      badges.push('most-trusted');
    }

    // Build explanation
    let explanation = '';
    if (explanations.length > 0) {
      explanation = explanations.join('. ') + '.';
    } else {
      // Explain tradeoff
      const costDiff = q.totalCost - cheapest.totalCost;
      const pesoDiff = mostReceived.receiveAmount - q.receiveAmount;
      if (costDiff > 0 && pesoDiff > 0) {
        explanation = `$${costDiff.toFixed(2)} more than cheapest. Recipient gets ₱${pesoDiff.toLocaleString()} fewer pesos than best rate.`;
      } else if (costDiff > 0) {
        explanation = `$${costDiff.toFixed(2)} more than cheapest option, but good exchange rate.`;
      } else {
        explanation = `Good value. ${q.gcash ? 'Supports GCash.' : 'Bank deposit only.'}`;
      }
    }

    return { ...q, badges, explanation };
  });

  return {
    ranked: withBadges,
    bestOverall: withBadges.find(q => q.badges.includes('best-overall'))!,
    cheapest: withBadges.find(q => q.badges.includes('cheapest'))!,
    fastest: withBadges.find(q => q.badges.includes('fastest'))!,
    mostReceived: withBadges.find(q => q.badges.includes('most-received'))!,
    bestCashPickup: withBadges.find(q => q.badges.includes('best-cash-pickup')) ?? null,
    mostTrusted: withBadges.find(q => q.badges.includes('most-trusted'))!,
    worstTotalCost,
    worstReceiveAmount,
  };
}

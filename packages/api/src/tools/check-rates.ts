import { tool } from 'ai';
import { z } from 'zod';
import type { RateQuote } from '../providers/types';

// Mid-market rate baseline (will be replaced with live API data in Phase 2)
const MOCK_MID_MARKET_RATE = 58.45;

// Provider-specific rate markups and fees based on actual provider research
const PROVIDER_CONFIGS = [
  {
    provider: 'Remitly',
    rateMarkup: 0.008,       // ~0.8% below mid-market
    baseFee: 1.99,
    deliveryTime: 'Minutes (GCash, Maya)',
    paymentMethods: ['bank', 'card'] as const,
    gcashDirect: true,
    affiliateBase: 'https://www.remitly.com/us/en/philippines',
  },
  {
    provider: 'Wise',
    rateMarkup: 0.002,       // ~0.2% below mid-market (best rate)
    baseFee: 4.14,
    deliveryTime: '1-2 business days',
    paymentMethods: ['bank', 'card'] as const,
    gcashDirect: false,
    affiliateBase: 'https://wise.com/us/send-money/send-money-to-philippines',
  },
  {
    provider: 'Western Union',
    rateMarkup: 0.025,       // ~2.5% below mid-market
    baseFee: 5.00,
    deliveryTime: 'Minutes (cash pickup, GCash)',
    paymentMethods: ['bank', 'card', 'cash'] as const,
    gcashDirect: true,
    affiliateBase: 'https://www.westernunion.com/us/en/send-money-to-philippines.html',
  },
  {
    provider: 'MoneyGram',
    rateMarkup: 0.02,        // ~2% below mid-market
    baseFee: 4.99,
    deliveryTime: 'Minutes (cash pickup, GCash)',
    paymentMethods: ['bank', 'card', 'cash'] as const,
    gcashDirect: true,
    affiliateBase: 'https://www.moneygram.com/mgo/us/en/send/philippines',
  },
  {
    provider: 'Xoom',
    rateMarkup: 0.015,       // ~1.5% below mid-market
    baseFee: 0,
    deliveryTime: 'Hours (GCash), 1-4 days (bank)',
    paymentMethods: ['bank', 'card'] as const,
    gcashDirect: true,
    affiliateBase: 'https://www.xoom.com/philippines/send-money',
  },
  {
    provider: 'WorldRemit',
    rateMarkup: 0.012,       // ~1.2% below mid-market
    baseFee: 2.99,
    deliveryTime: 'Minutes (GCash, Maya)',
    paymentMethods: ['bank', 'card'] as const,
    gcashDirect: true,
    affiliateBase: 'https://www.worldremit.com/en/philippines',
  },
  {
    provider: 'Pangea',
    rateMarkup: 0.01,        // ~1% below mid-market
    baseFee: 3.95,
    deliveryTime: 'Same day (GCash)',
    paymentMethods: ['bank', 'card'] as const,
    gcashDirect: true,
    affiliateBase: 'https://www.pangeamoneytransfer.com',
  },
] as const;

export const checkRatesTool = tool({
  description: 'Compare exchange rates and fees across remittance providers for a given corridor and amount. Shows all major providers including GCash delivery support.',
  inputSchema: z.object({
    sendCurrency: z.string().length(3).describe('ISO 4217 currency code to send from (e.g. USD)'),
    receiveCurrency: z.string().length(3).describe('ISO 4217 currency code to receive (e.g. PHP)'),
    amount: z.number().positive().describe('Amount to send in sendCurrency'),
    paymentMethod: z.enum(['bank', 'card', 'cash']).optional().describe('Preferred payment method'),
    gcashOnly: z.boolean().optional().describe('If true, only show providers that support direct GCash deposit'),
  }),
  execute: async ({ sendCurrency, receiveCurrency, amount, gcashOnly }) => {
    // TODO: Replace with live API calls in Phase 2
    // Wise API is available now; others need partnerships or scraping

    const quotes: RateQuote[] = PROVIDER_CONFIGS
      .filter((config) => !gcashOnly || config.gcashDirect)
      .map((config) => {
        const exchangeRate = MOCK_MID_MARKET_RATE * (1 - config.rateMarkup);
        const receiveAmount = amount * exchangeRate;
        const fee = config.baseFee;
        const totalCost = amount + fee;

        return {
          provider: config.provider,
          sendAmount: amount,
          sendCurrency,
          receiveAmount,
          receiveCurrency,
          exchangeRate,
          fee,
          totalCost,
          deliveryTime: config.deliveryTime,
          paymentMethods: [...config.paymentMethods],
          affiliateUrl: config.affiliateBase,
        };
      });

    // Sort by total cost (cheapest first = best deal)
    const sorted = [...quotes].sort((a, b) => a.totalCost - b.totalCost);

    // Find fastest (providers with "Minutes" in delivery time)
    const fastest = [...quotes].sort((a) =>
      a.deliveryTime.toLowerCase().startsWith('minutes') ? -1 : 1
    )[0];

    return {
      quotes: sorted,
      cheapest: sorted[0]?.provider ?? '',
      fastest: fastest?.provider ?? '',
    };
  },
});

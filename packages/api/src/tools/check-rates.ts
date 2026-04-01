import { tool } from 'ai';
import { z } from 'zod';
import type { RateQuote } from '../providers/types';

export const checkRatesTool = tool({
  description: 'Compare exchange rates and fees across remittance providers for a given corridor and amount',
  inputSchema: z.object({
    sendCurrency: z.string().length(3).describe('ISO 4217 currency code to send from (e.g. USD)'),
    receiveCurrency: z.string().length(3).describe('ISO 4217 currency code to receive (e.g. PHP)'),
    amount: z.number().positive().describe('Amount to send in sendCurrency'),
    paymentMethod: z.enum(['bank', 'card', 'cash']).optional().describe('Preferred payment method'),
  }),
  execute: async ({ sendCurrency, receiveCurrency, amount }) => {
    // TODO: Wire to real provider APIs in Phase 2
    const mockQuotes: RateQuote[] = [
      {
        provider: 'Wise',
        sendAmount: amount,
        sendCurrency,
        receiveAmount: amount * 58.32,
        receiveCurrency,
        exchangeRate: 58.32,
        fee: 4.50,
        totalCost: amount + 4.50,
        deliveryTime: 'Instant',
        paymentMethods: ['bank', 'card'],
        affiliateUrl: `https://wise.com/send?amount=${amount}&source=${sendCurrency}&target=${receiveCurrency}`,
      },
      {
        provider: 'Remitly',
        sendAmount: amount,
        sendCurrency,
        receiveAmount: amount * 57.98,
        receiveCurrency,
        exchangeRate: 57.98,
        fee: 3.99,
        totalCost: amount + 3.99,
        deliveryTime: '1-2 hours',
        paymentMethods: ['bank', 'card'],
        affiliateUrl: `https://remitly.com/send?amount=${amount}`,
      },
      {
        provider: 'Western Union',
        sendAmount: amount,
        sendCurrency,
        receiveAmount: amount * 56.80,
        receiveCurrency,
        exchangeRate: 56.80,
        fee: 7.99,
        totalCost: amount + 7.99,
        deliveryTime: 'Minutes (cash pickup)',
        paymentMethods: ['bank', 'card', 'cash'],
        affiliateUrl: `https://westernunion.com/send?amount=${amount}`,
      },
    ];

    const sorted = [...mockQuotes].sort((a, b) => a.totalCost - b.totalCost);
    const fastest = [...mockQuotes].sort((a) =>
      a.deliveryTime.includes('Instant') ? -1 : 1
    )[0];

    return {
      quotes: sorted,
      cheapest: sorted[0]?.provider ?? '',
      fastest: fastest?.provider ?? '',
    };
  },
});

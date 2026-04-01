import { tool } from 'ai';
import { z } from 'zod';

export const getCorridorInfoTool = tool({
  description: 'Get requirements and restrictions for sending money between two countries',
  inputSchema: z.object({
    sendCountry: z.string().length(2).describe('ISO 3166-1 alpha-2 send country'),
    receiveCountry: z.string().length(2).describe('ISO 3166-1 alpha-2 receive country'),
  }),
  execute: async ({ sendCountry, receiveCountry }) => {
    return {
      sendCountry,
      receiveCountry,
      providers: ['Wise', 'Remitly', 'Western Union'],
      maxAmountUsd: 50000,
      documentsRequired: sendCountry === 'US'
        ? ['Government-issued ID', 'Proof of address (for transfers > $3,000)']
        : ['Government-issued ID'],
      restrictions: [],
      notes: `Standard corridor. Most major providers support ${sendCountry} → ${receiveCountry}.`,
    };
  },
});

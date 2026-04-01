import { tool } from 'ai';
import { z } from 'zod';

export const getRecipientsTool = tool({
  description: 'List saved recipients for the current user, optionally filtered by country',
  inputSchema: z.object({
    country: z.string().optional().describe('ISO country code to filter by'),
  }),
  // execute is injected at route level with DB access
});

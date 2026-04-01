import { tool } from 'ai';
import { z } from 'zod';

export const getTransferHistoryTool = tool({
  description: 'Get recent transfer history for the current user',
  inputSchema: z.object({
    limit: z.number().min(1).max(20).optional().default(5).describe('Number of transfers to return'),
    status: z.enum(['quote', 'pending', 'processing', 'completed', 'failed', 'cancelled']).optional(),
  }),
  // execute is injected at route level with DB access
});

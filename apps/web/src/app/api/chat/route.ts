import { auth } from '@clerk/nextjs/server'
import { streamText, convertToModelMessages } from 'ai'
import type { UIMessage } from 'ai'

export const maxDuration = 30

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: 'anthropic/claude-sonnet-4.6',
    system: `You are the Remittance Buddy AI assistant.
Help users with international money transfers — answer questions about fees, exchange rates, transfer status, and KYC requirements.
Be concise, friendly, and accurate. Never make up exchange rates or fees.`,
    messages: convertToModelMessages(messages),
  })

  return result.toUIMessageStreamResponse()
}

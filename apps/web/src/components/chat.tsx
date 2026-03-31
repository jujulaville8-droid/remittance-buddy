'use client'

import { useChat } from '@ai-sdk/react'
import { isTextUIPart, isToolUIPart, getToolName, DefaultChatTransport } from 'ai'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import type { UIMessage, UIMessagePart, UITools, UIDataTypes } from 'ai'

// ─── Tool call display ───────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  check_kyc_status: 'Checking verification status',
  get_transfer_history: 'Loading transfer history',
  get_quote: 'Getting live exchange rate',
  initiate_transfer: 'Creating transfer',
  check_transfer_status: 'Checking transfer status',
}

// Type for initiate_transfer tool output
interface InitiateTransferOutput {
  success: boolean
  transferId?: string
  paymentUrl?: string
  summary?: {
    from: string
    to: string
    fee: string
    total: string
    recipient: string
    country: string
  }
  error?: string
  message?: string
}

// Type for get_quote tool output
interface GetQuoteOutput {
  success: boolean
  sourceCurrency?: string
  sourceAmount?: number
  targetCurrency?: string
  targetAmount?: number
  fxRate?: number
  feeFormatted?: string
  totalToPayFormatted?: string
  error?: string
  message?: string
}

function ToolCallBubble({ part }: { part: UIMessagePart<UIDataTypes, UITools> }) {
  if (!isToolUIPart(part)) return null

  const name = getToolName(part)
  const state = part.state
  const label = TOOL_LABELS[name] ?? name

  // Show spinner while streaming/calling
  if (state === 'input-streaming' || state === 'input-available') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
        {label}…
      </div>
    )
  }

  // Show pay button when initiate_transfer completes successfully
  if (state === 'output-available' && name === 'initiate_transfer') {
    const output = (part as { output?: InitiateTransferOutput }).output
    if (output?.success && output.paymentUrl && output.summary) {
      const { summary, paymentUrl } = output
      return (
        <div className="rounded-xl border bg-card p-4 text-sm shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">✓</span>
            <span className="font-medium">Transfer ready</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <span className="text-muted-foreground">Sending</span>
            <span className="font-medium">{summary.from}</span>
            <span className="text-muted-foreground">Recipient gets</span>
            <span className="font-medium">{summary.to}</span>
            <span className="text-muted-foreground">Fee</span>
            <span className="font-medium">{summary.fee}</span>
            <span className="text-muted-foreground">Total charged</span>
            <span className="font-medium">{summary.total}</span>
            <span className="text-muted-foreground">Recipient</span>
            <span className="font-medium">{summary.recipient}</span>
          </div>
          <a
            href={paymentUrl}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Pay now →
          </a>
        </div>
      )
    }
    // Show error state
    if (output && !output.success) {
      return (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {output.message ?? 'Transfer could not be created. Please try again.'}
        </div>
      )
    }
  }

  // Show quote summary when get_quote completes
  if (state === 'output-available' && name === 'get_quote') {
    const output = (part as { output?: GetQuoteOutput }).output
    if (output?.success && output.sourceAmount !== undefined) {
      return (
        <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="text-green-500">↗</span> Live rate
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-muted-foreground">
            <span>Sending</span>
            <span className="text-foreground font-medium">
              {output.sourceCurrency} {output.sourceAmount?.toFixed(2)}
            </span>
            <span>Recipient gets</span>
            <span className="text-foreground font-medium">
              {output.targetAmount?.toFixed(2)} {output.targetCurrency}
            </span>
            <span>Rate</span>
            <span className="text-foreground font-medium">1 {output.sourceCurrency} = {Number(output.fxRate).toFixed(4)} {output.targetCurrency}</span>
            <span>Fee</span>
            <span className="text-foreground font-medium">{output.feeFormatted}</span>
            <span>Total to pay</span>
            <span className="text-foreground font-medium">{output.totalToPayFormatted}</span>
          </div>
        </div>
      )
    }
  }

  return null
}

// ─── Message renderer ────────────────────────────────────────────────────────

function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === 'user'
  const parts = message.parts ?? []

  return (
    <Message from={message.role as UIMessage['role']}>
      <MessageContent>
        {parts.map((part, i) => {
          if (isTextUIPart(part)) {
            if (!part.text.trim()) return null
            if (isUser) {
              return (
                <span key={i} className="whitespace-pre-wrap text-sm">
                  {part.text}
                </span>
              )
            }
            return <MessageResponse key={i}>{part.text}</MessageResponse>
          }
          if (isToolUIPart(part)) {
            return <ToolCallBubble key={i} part={part} />
          }
          return null
        })}
      </MessageContent>
    </Message>
  )
}

// ─── Typing indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-muted px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Main chat component ─────────────────────────────────────────────────────

const WELCOME_MESSAGE: UIMessage = {
  id: 'welcome',
  role: 'assistant',
  parts: [
    {
      type: 'text',
      text: "Hi! I'm your Remittance Buddy assistant. I'm here to help you get set up so you can start sending money home. What can I help you with today?",
    },
  ],
}

export function OnboardingChat() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
    messages: [WELCOME_MESSAGE],
  })

  const isStreaming = status === 'streaming' || status === 'submitted'
  const lastMessage = messages[messages.length - 1]
  const showTyping = isStreaming && lastMessage?.role === 'user'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  function submit() {
    const text = input.trim()
    if (!text || isStreaming) return
    sendMessage({ text })
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.currentTarget.value)
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {showTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-background px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              placeholder="Type a message…"
              onKeyDown={handleKeyDown}
              onChange={handleTextareaChange}
              disabled={isStreaming}
              className={cn(
                'flex-1 resize-none rounded-xl border bg-muted px-4 py-3 text-sm',
                'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                'max-h-40 min-h-[44px] transition-colors',
                isStreaming && 'cursor-not-allowed opacity-50',
              )}
            />
            <button
              type="button"
              onClick={submit}
              disabled={isStreaming || !input.trim()}
              aria-label="Send message"
              className={cn(
                'flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl',
                'bg-primary text-primary-foreground transition-opacity hover:opacity-90',
                (isStreaming || !input.trim()) && 'cursor-not-allowed opacity-50',
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

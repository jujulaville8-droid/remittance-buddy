'use client'

import { useChat } from '@ai-sdk/react'
import { isTextUIPart, isToolUIPart, getToolName } from 'ai'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'
import type { UIMessage, UIMessagePart, UITools, UIDataTypes } from 'ai'

// ─── Tool call display ───────────────────────────────────────────────────────

const TOOL_LABELS: Record<string, string> = {
  check_kyc_status: 'Checking verification status',
  get_transfer_history: 'Loading transfer history',
  initiate_transfer: 'Preparing transfer',
}

function ToolCallBubble({ part }: { part: UIMessagePart<UIDataTypes, UITools> }) {
  if (!isToolUIPart(part)) return null

  const name = getToolName(part)
  const state = part.state
  const label = TOOL_LABELS[name] ?? name

  if (state === 'input-streaming' || state === 'input-available') {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
        {label}…
      </div>
    )
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

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant' as const,
  content:
    "Hi! I'm your Remittance Buddy assistant. I'm here to help you get set up so you can start sending money home. What can I help you with today?",
}

export function OnboardingChat() {
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: '/api/chat',
    initialMessages: [WELCOME_MESSAGE],
  })

  const isStreaming = status === 'streaming' || status === 'submitted'
  const lastMessage = messages[messages.length - 1]
  const showTyping = isStreaming && lastMessage?.role === 'user'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    handleInputChange(e)
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }

  return (
    <div className="flex h-full flex-col">
      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {(messages as unknown as UIMessage[]).map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          {showTyping && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="border-t bg-background px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              name="message"
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
              type="submit"
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
          </form>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  )
}

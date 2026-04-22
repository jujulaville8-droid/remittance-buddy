'use client'

import { useChat } from '@ai-sdk/react'
import {
  DefaultChatTransport,
  isTextUIPart,
  isToolUIPart,
  getToolName,
} from 'ai'
import type { UIMessage, UIMessagePart, UITools, UIDataTypes } from 'ai'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { MessageCircle, X, Send, Sparkles } from 'lucide-react'
import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message'

/**
 * Floating "Ask Pal" launcher — sits bottom-right of every page, opens a
 * side panel with a contextual AI chat. The chat API is told what page
 * the user is on so suggestions and tool-use stay relevant.
 */

const PAGE_LABELS: Record<string, string> = {
  '/': 'Landing',
  '/compare': 'Compare',
  '/dashboard': 'Dashboard',
  '/family': 'Family',
  '/alerts': 'Rate alerts',
  '/pricing': 'Buddy Plus',
  '/sign-in': 'Sign in',
  '/sign-up': 'Sign up',
}

function labelForPath(pathname: string): string {
  if (PAGE_LABELS[pathname]) return PAGE_LABELS[pathname]
  // Match by prefix for deep paths like /dashboard/kyc
  const hit = Object.entries(PAGE_LABELS).find(([k]) => k !== '/' && pathname.startsWith(k))
  return hit?.[1] ?? 'Pal'
}

function suggestedPromptsFor(pathname: string): readonly string[] {
  if (pathname === '/') {
    return [
      "What's the cheapest way to send $500 to GCash?",
      'How does Pal make money?',
      'Which corridors do you cover?',
    ]
  }
  if (pathname.startsWith('/compare')) {
    return [
      'Which provider is best for cash pickup?',
      "What's the fastest option for $1,000?",
      'Why is Remitly cheaper than Western Union?',
    ]
  }
  if (pathname.startsWith('/family')) {
    return [
      'How do family groups work?',
      'Can we split a send for tuition?',
      'What does sharing a recipient mean?',
    ]
  }
  if (pathname.startsWith('/alerts')) {
    return [
      "What's a good target rate for USD → PHP?",
      'How often do rates move 1%?',
      'Should I wait or send now?',
    ]
  }
  if (pathname.startsWith('/pricing')) {
    return [
      "What's the difference between Free and Plus?",
      'Is it worth upgrading if I send monthly?',
      'Can I cancel anytime?',
    ]
  }
  return ['How does Pal work?', 'Which providers do you compare?', 'Is Pal really free?']
}

export default function AskPal() {
  return (
    <Suspense fallback={null}>
      <AskPalInner />
    </Suspense>
  )
}

function AskPalInner() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchString = searchParams.toString()
  const search = searchString ? `?${searchString}` : ''

  // Reset chat when the user navigates to a new route so context stays fresh.
  const resetKey = `${pathname}${search}`

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Don't show the launcher on the auth pages — too busy there.
  if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) return null

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close Ask Pal' : 'Open Ask Pal'}
        className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 h-14 pl-4 pr-5 rounded-full bg-blue-600 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all"
      >
        {open ? (
          <>
            <X className="h-5 w-5" /> Close
          </>
        ) : (
          <>
            <span className="relative">
              <Sparkles className="h-5 w-5" />
              <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            Ask Pal
          </>
        )}
      </button>

      {/* Panel */}
      {open && (
        <AskPalPanel
          key={resetKey}
          pathname={pathname}
          search={search}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function AskPalPanel({
  pathname,
  search,
  onClose,
}: {
  readonly pathname: string
  readonly search: string
  readonly onClose: () => void
}) {
  const label = labelForPath(pathname)
  const suggestions = useMemo(() => suggestedPromptsFor(pathname), [pathname])

  const welcome: UIMessage = useMemo(
    () => ({
      id: 'welcome',
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text:
            pathname === '/'
              ? "Hi, I'm Pal. Ask me the cheapest way to send home, which providers we compare, or how the tool works."
              : pathname.startsWith('/compare')
                ? "I see you're comparing rates. Tell me an amount or a preference (GCash, cash pickup, fastest) and I'll pick the winner."
                : pathname.startsWith('/family')
                  ? "Welcome to Family. I can walk you through group setup, shared recipients, or pooling a big send."
                  : pathname.startsWith('/alerts')
                    ? "Setting up a rate alert? I can help you pick a sensible target for your corridor."
                    : pathname.startsWith('/pricing')
                      ? "Deciding between Free and Plus? Tell me how often you send and I'll help you choose."
                      : "Hi, I'm Pal. I know where you are on the site — ask me anything.",
        },
      ],
    }),
    [pathname],
  )

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          pageContext: {
            pathname,
            search,
            label,
          },
        },
      }),
    [pathname, search, label],
  )

  const { messages, sendMessage, status, error } = useChat({
    transport,
    messages: [welcome],
  })

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [input, setInput] = useState('')
  const isStreaming = status === 'streaming' || status === 'submitted'
  const lastMessage = messages[messages.length - 1]
  const showTyping = isStreaming && lastMessage?.role === 'user'
  const unauthed = error?.message?.toLowerCase().includes('unauthorized')

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  function submit(text: string) {
    const t = text.trim()
    if (!t || isStreaming) return
    sendMessage({ text: t })
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.currentTarget.value)
    const el = e.currentTarget
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }

  return (
    <div
      className="fixed inset-0 z-[55] pointer-events-none flex items-end justify-end sm:p-5"
      aria-modal="true"
      role="dialog"
    >
      {/* Tap-away scrim on mobile */}
      <button
        type="button"
        aria-label="Close Ask Pal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/30 sm:bg-transparent pointer-events-auto"
      />

      <div
        className="relative pointer-events-auto w-full sm:w-[420px] h-[100svh] sm:h-[min(640px,calc(100svh-40px))] bg-white sm:rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden"
        style={{ animation: 'fade-up 0.25s cubic-bezier(0.22,1,0.36,1) both' }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-2.5">
            <span className="relative grid place-items-center w-9 h-9 rounded-lg bg-blue-600 text-white">
              <Sparkles className="h-4 w-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white" />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-bold text-slate-900">Ask Pal</div>
              <div className="text-[11px] text-slate-500">
                Context: <span className="font-semibold text-slate-700">{label}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid place-items-center w-8 h-8 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 bg-gradient-to-b from-blue-50/50 to-white">
          <div className="space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {showTyping && <TypingIndicator />}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* Suggested prompts (only before first user turn) */}
        {messages.length <= 1 && !isStreaming && !unauthed && (
          <div className="px-4 pb-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 bg-white">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="text-xs rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        {unauthed ? (
          <div className="px-4 py-5 border-t border-slate-100 bg-white text-center">
            <p className="text-sm text-slate-600">
              Sign in to chat with Pal.
            </p>
            <Link
              href={`/sign-in?next=${encodeURIComponent(pathname + search)}`}
              className="mt-3 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                placeholder="Ask anything about this page…"
                onKeyDown={handleKeyDown}
                onChange={handleTextareaChange}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 max-h-36 min-h-[42px] transition-all disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => submit(input)}
                disabled={isStreaming || !input.trim()}
                aria-label="Send"
                className="grid place-items-center h-[42px] w-[42px] rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">
              Pal is a comparison engine — it won&rsquo;t send money, just finds the cheapest route.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   Chat message + tool bubble primitives (scoped to AskPal)
--------------------------------------------------------------------------- */

const TOOL_LABELS: Record<string, string> = {
  compareProviders: 'Comparing providers',
}

function ToolCallBubble({ part }: { part: UIMessagePart<UIDataTypes, UITools> }) {
  if (!isToolUIPart(part)) return null
  const name = getToolName(part)
  const state = part.state
  const label = TOOL_LABELS[name] ?? name

  if (state === 'input-streaming' || state === 'input-available') {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 border border-blue-100 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        {label}…
      </div>
    )
  }

  if (state === 'output-available' && name === 'compareProviders') {
    const output = part.output as {
      recommended?: { provider: string; receiveAmount: number; sendAmount: number; speed: string }
      savings?: { extraPesos: number }
      error?: string
    } | undefined
    if (output?.error) {
      return (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {output.error}
        </div>
      )
    }
    if (output?.recommended) {
      return (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Best for ${output.recommended.sendAmount}
          </div>
          <div className="mt-1 text-sm font-bold text-slate-900">
            {output.recommended.provider} · ₱
            {output.recommended.receiveAmount.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-600">{output.recommended.speed}</div>
          {output.savings && output.savings.extraPesos > 0 && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
              +₱{output.savings.extraPesos.toLocaleString()} vs worst
            </div>
          )}
        </div>
      )
    }
  }
  return null
}

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

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

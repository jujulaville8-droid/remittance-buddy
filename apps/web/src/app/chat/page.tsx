'use client'

import { useChat } from '@ai-sdk/react'
import { useState, useRef, useEffect } from 'react'
import { Send, User, MessageCircle } from 'lucide-react'

const STARTER_QUESTIONS = [
  'Which provider has the best rate for USD to GCash?',
  'How do fees compare between Remitly and Wise?',
  'What is Family Hub?',
  'Can I get a rate alert for SGD to Philippines?',
]

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat()
  const [input, setInput] = useState('')
  const [headerHidden, setHeaderHidden] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const y = el.scrollTop
      const dy = y - lastScrollY.current
      if (Math.abs(dy) < 4) return
      if (dy > 0 && y > 40) setHeaderHidden(true)
      else if (dy < 0) setHeaderHidden(false)
      lastScrollY.current = y
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || status === 'streaming' || status === 'submitted') return
    sendMessage({ text })
    setInput('')
  }

  function handleStarter(question: string) {
    if (status === 'streaming' || status === 'submitted') return
    sendMessage({ text: question })
  }

  const isEmpty = messages.length === 0

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <header
        className={`sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-md transition-transform duration-200 ${
          headerHidden ? '-translate-y-full' : 'translate-y-0'
        }`}
      >
        <div className="container max-w-2xl flex items-center gap-2.5 py-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-coral/10 text-coral">
            <MessageCircle className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold text-foreground">Pal support</div>
            <div className="text-[10px] text-muted-foreground">Ask about sending money home</div>
          </div>
        </div>
      </header>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom))' }}
      >
        <div className="container max-w-2xl py-4 space-y-3">
          {isEmpty ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Compare providers, explain fees, payouts like GCash/Maya/bank/cash pickup. Try one of these:
              </p>
              <div className="grid gap-1.5">
                {STARTER_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleStarter(q)}
                    className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-[13px] text-foreground transition-colors hover:border-foreground/30 active:scale-[0.99]"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}

          {(status === 'submitted' || status === 'streaming') && messages[messages.length - 1]?.role !== 'assistant' ? (
            <div className="flex gap-2 items-center text-[11px] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-coral" />
              <span>Typing…</span>
            </div>
          ) : null}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed inset-x-0 z-20 border-t border-border bg-background"
        style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
        <div className="container max-w-2xl flex items-center gap-2 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about rates, fees, providers…"
            className="flex-1 min-w-0 rounded-full border border-border bg-card px-3.5 py-2.5 text-[13px] text-foreground outline-none focus:border-foreground/40"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-coral text-white transition-transform active:scale-95 disabled:opacity-40"
            aria-label="Send"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </main>
  )
}

function MessageBubble({ message }: { readonly message: { role: string; parts: readonly { type: string; text?: string }[] } }) {
  const isUser = message.role === 'user'
  const text = message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('')

  return (
    <div className={`flex gap-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser ? (
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-coral/10 text-coral">
          <MessageCircle className="h-3 w-3" strokeWidth={2} />
        </div>
      ) : null}
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-[13px] leading-snug whitespace-pre-wrap ${
          isUser
            ? 'bg-foreground text-background rounded-br-md'
            : 'bg-card text-foreground border border-border rounded-bl-md'
        }`}
      >
        {text || <span className="opacity-60">…</span>}
      </div>
      {isUser ? (
        <div className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
          <User className="h-3 w-3" strokeWidth={2} />
        </div>
      ) : null}
    </div>
  )
}

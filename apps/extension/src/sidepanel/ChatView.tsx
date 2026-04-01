import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, LogOut, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LoadingDots } from '../components/LoadingDots';
import { LanguageToggle } from '../components/LanguageToggle';
import logo from '../assets/logo.png';
import { useI18n } from '../lib/i18n';
import { API_BASE_URL } from '../lib/constants';
import { getAccessToken, signOut } from '../lib/auth';

export function ChatView({ onSignOut }: { readonly onSignOut: () => void }) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/api/chat`,
      headers: async (): Promise<Record<string, string>> => {
        const token = await getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function handleSubmit() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setInputValue('');
    sendMessage({ text });
  }

  function handleSuggestion(text: string) {
    if (isLoading) return;
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Remittance Buddy" className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-[hsl(var(--foreground))] tracking-tight" style={{ fontFamily: "'Varela Round', sans-serif" }}>{t('appName')}</h1>
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-[hsl(var(--teal))]" />
              <span className="text-[9px] text-[hsl(var(--teal))] font-medium">Rates updated just now</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <button
            onClick={async () => { await signOut(); onSignOut(); }}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-8 animate-fade-up">
            <img src={logo} alt="" className="w-14 h-14 mx-auto mb-3 opacity-80" />
            <p className="text-lg font-bold text-[hsl(var(--foreground))] mb-1" style={{ fontFamily: "'Varela Round', sans-serif" }}>{t('chatWelcome')}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-[250px] mx-auto leading-relaxed mb-5">
              {t('chatSubtext')}
            </p>

            {/* Quick actions — these auto-send on click */}
            <div className="space-y-2 max-w-[280px] mx-auto">
              {[
                { text: t('suggestion1'), desc: 'Get instant rate comparison' },
                { text: t('suggestion2'), desc: 'See which provider wins' },
                { text: t('suggestion3'), desc: 'View your transfer history' },
              ].map((item) => (
                <button
                  key={item.text}
                  onClick={() => handleSuggestion(item.text)}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl bg-white border border-[hsl(var(--border))] text-left shadow-sm hover:shadow-md hover:border-[hsl(var(--coral))]/30 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-[hsl(var(--coral-light))] flex items-center justify-center shrink-0">
                    <Send className="h-3.5 w-3.5 text-[hsl(var(--coral))]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]">{item.text}</div>
                    <div className="text-[9px] text-[hsl(var(--muted-foreground))]">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && messages.at(-1)?.role !== 'assistant' && <LoadingDots />}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[hsl(var(--border))] p-3">
        <div className="flex gap-2">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={t('chatPlaceholder')}
            className="flex-1 resize-none rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3.5 py-2.5 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--coral))] focus-visible:border-transparent focus-visible:bg-white min-h-[40px] max-h-[120px] transition-all duration-200"
            rows={1}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !inputValue.trim()} size="sm" className="rounded-full w-9 h-9 p-0 shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { readonly message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-up`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
          isUser
            ? 'bg-[hsl(var(--coral))] text-white rounded-br-md shadow-sm shadow-[hsla(var(--coral),0.2)]'
            : 'bg-white border border-[hsl(var(--border))] shadow-sm rounded-bl-md'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return <p key={i} className="whitespace-pre-wrap leading-relaxed">{part.text}</p>;
          }
          return null;
        })}
      </div>
    </div>
  );
}

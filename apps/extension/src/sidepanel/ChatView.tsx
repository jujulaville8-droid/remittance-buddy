import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { SendHorizontal, LogOut, Clock, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { LoadingDots } from '../components/LoadingDots';
import { ProviderComparisonCard, type ComparisonData } from '../components/ProviderComparisonCard';
import { LanguageToggle } from '../components/LanguageToggle';
import logo from '../assets/logo.png';
import { useI18n } from '../lib/i18n';
import { API_BASE_URL } from '../lib/constants';
import { getAccessToken, signOut } from '../lib/auth';

export function ChatView({ onSignOut }: { readonly onSignOut: () => void }) {
  const { t } = useI18n();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [chatError, setChatError] = useState<string | null>(null);
  const prevMessageCount = useRef(0);

  const { messages, status, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE_URL}/api/chat`,
      headers: async (): Promise<Record<string, string>> => {
        const token = await getAccessToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    onError: (error) => {
      setChatError(error.message || 'Something went wrong. Please try again.');
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    // Only auto-scroll when new messages are added, not on every update
    if (messages.length > prevMessageCount.current) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
    prevMessageCount.current = messages.length;
  }, [messages.length]);

  function handleSubmit() {
    const text = inputValue.trim();
    if (!text || isLoading) return;
    setChatError(null);
    setInputValue('');
    sendMessage({ text });
  }

  function handleSuggestion(text: string) {
    if (isLoading) return;
    setChatError(null);
    sendMessage({ text });
  }

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[hsl(var(--card))] shadow-level-1">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Remittance Buddy" className="w-10 h-10 shrink-0" />
          <div>
            <h1 className="text-sm font-bold font-display text-[hsl(var(--foreground))] tracking-tight">{t('appName')}</h1>
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-[hsl(var(--teal))]" />
              <span className="text-[9px] text-[hsl(var(--teal))] font-medium">{t('ratesUpdated')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <LanguageToggle />
          <button
            onClick={async () => { await signOut(); onSignOut(); }}
            className="p-1.5 rounded-lg text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] transition-colors"
            aria-label={t('signOut')}
            title={t('signOut')}
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {chatError && (
          <div className="flex items-center gap-2 bg-[hsl(var(--coral-light))] border border-red-200 rounded-xl px-3 py-2" role="alert">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
            <p className="text-xs text-red-700 flex-1">{chatError}</p>
            <button onClick={() => setChatError(null)} className="text-xs text-red-500 font-medium hover:underline shrink-0">Dismiss</button>
          </div>
        )}
        {messages.length === 0 && (
          <div className="text-center mt-8 animate-fade-up">
            <img src={logo} alt="" className="w-14 h-14 mx-auto mb-3 opacity-80" />
            <p className="text-lg font-bold font-display text-[hsl(var(--foreground))] mb-1">{t('chatWelcome')}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-[250px] mx-auto leading-relaxed mb-5">
              {t('chatSubtext')}
            </p>

            {/* Quick actions — these auto-send on click */}
            <div className="space-y-2 max-w-[280px] mx-auto">
              {[
                { text: t('suggestion1'), desc: t('getInstantComparison') },
                { text: t('suggestion2'), desc: t('seeWhichWins') },
                { text: t('suggestion3'), desc: t('viewTransferHistory') },
              ].map((item) => (
                <button
                  key={item.text}
                  onClick={() => handleSuggestion(item.text)}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl bg-[hsl(var(--card))] text-left shadow-level-1 hover:shadow-level-2 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-[hsl(var(--coral-light))] flex items-center justify-center shrink-0">
                    <MessageCircle className="h-3.5 w-3.5 text-[hsl(var(--coral))]" />
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
      <div className="bg-[hsl(var(--card))] border-t border-[hsl(var(--border))] p-3">
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
            aria-label={t('chatPlaceholder')}
            placeholder={t('chatPlaceholder')}
            className="flex-1 resize-none rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-3.5 py-2.5 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--coral))] focus-visible:border-transparent focus-visible:bg-[hsl(var(--card))] min-h-[40px] max-h-[120px] transition-all duration-200"
            rows={1}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !inputValue.trim()} size="lg" className="rounded-full w-12 h-12 p-0 shrink-0">
            <SendHorizontal className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { readonly message: UIMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-2 animate-fade-up`}>
      {message.parts.map((part, i) => {
        if (part.type === 'text') {
          return (
            <div
              key={i}
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm ${
                isUser
                  ? 'bg-[hsl(var(--coral))] text-white rounded-br-sm shadow-sm shadow-[hsla(var(--coral),0.2)]'
                  : 'bg-[hsl(var(--card))] shadow-level-1 rounded-bl-sm'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{part.text}</p>
            </div>
          );
        }
        // Handle tool parts — check all possible type patterns
        const toolPart = part as Record<string, unknown>;
        const isCompareProviders =
          (part.type === 'dynamic-tool' && toolPart.toolName === 'compareProviders') ||
          part.type === 'tool-compareProviders' ||
          (typeof part.type === 'string' && part.type.startsWith('tool-') && toolPart.toolName === 'compareProviders');

        if (isCompareProviders) {
          if (toolPart.state === 'output-available' && toolPart.output) {
            return <ProviderComparisonCard key={i} data={toolPart.output as ComparisonData} />;
          }
          if (toolPart.state === 'output-error') {
            return null;
          }
          // Loading state
          return (
            <div key={i} className="flex items-center gap-2 bg-[hsl(var(--card))] rounded-xl px-3 py-2 shadow-level-1">
              <Loader2 className="h-3.5 w-3.5 text-[hsl(var(--coral))] animate-spin" />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">Comparing providers...</span>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { RateCard } from '../components/RateCard';
import { LoadingDots } from '../components/LoadingDots';
import { LanguageToggle } from '../components/LanguageToggle';
import { GlobeHeart, SparklesBurst } from '../components/Doodles';
import logo from '../assets/logo.png';
import { useI18n } from '../lib/i18n';
import { API_BASE_URL } from '../lib/constants';
import { getAccessToken } from '../lib/auth';

export function ChatView() {
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

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="relative flex items-center justify-between px-4 py-3 bg-white border-b border-[hsl(var(--border))]">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Remittance Buddy" className="w-8 h-8 shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-[hsl(var(--foreground))] tracking-tight" style={{ fontFamily: "'Varela Round', sans-serif" }}>{t('appName')}</h1>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{t('chatTagline')}</p>
          </div>
        </div>
        <LanguageToggle />
        <SparklesBurst className="absolute top-2 right-20 w-3 h-3 text-[hsl(var(--gold))] opacity-40" />
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-10 animate-fade-up">
            <div className="relative inline-block">
              <GlobeHeart className="w-20 h-20 text-[hsl(var(--coral))] mx-auto mb-3" />
              <SparklesBurst className="absolute -top-2 -right-3 w-5 h-5 text-[hsl(var(--gold))]" />
            </div>
            <p className="text-lg font-bold text-[hsl(var(--foreground))] mb-1">{t('chatWelcome')}</p>
            <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-[250px] mx-auto leading-relaxed">
              {t('chatSubtext')}
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-5">
              {[t('suggestion1'), t('suggestion2'), t('suggestion3')].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => { setInputValue(suggestion); }}
                  className="text-xs px-3.5 py-2 rounded-2xl bg-white border border-[hsl(var(--border))] text-[hsl(var(--foreground))] font-medium shadow-sm hover:shadow-md hover:border-[hsl(var(--coral))]/40 transition-all duration-200"
                >
                  {suggestion}
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
  const { t } = useI18n();
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
          if (part.type === 'dynamic-tool' && part.toolName === 'checkRates') {
            if (part.state === 'output-available') {
              const result = part.output as {
                quotes: Array<{
                  provider: string;
                  receiveAmount: number;
                  receiveCurrency: string;
                  exchangeRate: number;
                  fee: number;
                  deliveryTime: string;
                  affiliateUrl: string;
                }>;
                cheapest: string;
                fastest: string;
              };
              return (
                <div key={i} className="space-y-2 mt-2">
                  {result.quotes.map((quote) => (
                    <RateCard
                      key={quote.provider}
                      {...quote}
                      isCheapest={quote.provider === result.cheapest}
                      isFastest={quote.provider === result.fastest}
                    />
                  ))}
                </div>
              );
            }
            return <LoadingDots key={i} />;
          }
          if (part.type === 'dynamic-tool') {
            if (part.state === 'input-streaming' || part.state === 'input-available') {
              return (
                <div key={i} className="text-xs text-[hsl(var(--muted-foreground))] italic py-1">
                  {t('lookingUp')} {part.toolName.replace(/([A-Z])/g, ' $1').toLowerCase()}...
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    </div>
  );
}

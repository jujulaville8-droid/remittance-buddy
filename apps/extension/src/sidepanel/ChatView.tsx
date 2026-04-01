import { useRef, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { RateCard } from '../components/RateCard';
import { LoadingDots } from '../components/LoadingDots';
import { API_BASE_URL } from '../lib/constants';
import { getAccessToken } from '../lib/auth';

export function ChatView() {
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
    <div className="flex flex-col h-screen">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[hsl(var(--border))]">
        <h1 className="text-sm font-semibold">Remittance Buddy</h1>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-[hsl(var(--muted-foreground))] mt-8">
            <p className="text-lg font-medium mb-2">Hey! Where are you sending money?</p>
            <p className="text-sm">I'll find you the best rate across all providers.</p>
          </div>
        )}
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && messages.at(-1)?.role !== 'assistant' && <LoadingDots />}
      </div>

      <div className="border-t border-[hsl(var(--border))] p-3">
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
            placeholder="Send $500 to the Philippines..."
            className="flex-1 resize-none rounded-lg border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] min-h-[40px] max-h-[120px]"
            rows={1}
          />
          <Button onClick={handleSubmit} disabled={isLoading || !inputValue.trim()} size="sm">
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
          isUser
            ? 'bg-[hsl(var(--accent))] text-white'
            : 'bg-[hsl(var(--muted))]'
        }`}
      >
        {message.parts.map((part, i) => {
          if (part.type === 'text') {
            return <p key={i} className="whitespace-pre-wrap">{part.text}</p>;
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
                <div key={i} className="text-xs text-[hsl(var(--muted-foreground))] italic">
                  Looking up {part.toolName.replace(/([A-Z])/g, ' $1').toLowerCase()}...
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

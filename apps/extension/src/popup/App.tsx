import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CurrencySelect } from '../components/CurrencySelect';
import { RateCard } from '../components/RateCard';
import { TransferItem } from '../components/TransferItem';
import { LanguageToggle } from '../components/LanguageToggle';
import { PaperAirplane, WavyLine } from '../components/Doodles';
import { useI18n } from '../lib/i18n';

interface Quote {
  readonly provider: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly deliveryTime: string;
  readonly affiliateUrl: string;
}

export function App() {
  const { t } = useI18n();
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('PHP');
  const [amount, setAmount] = useState('500');
  const [quotes, setQuotes] = useState<readonly Quote[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    try {
      const amt = Number(amount);
      setQuotes([
        {
          provider: 'Remitly',
          receiveAmount: amt * 57.98,
          receiveCurrency,
          exchangeRate: 57.98,
          fee: 1.99,
          deliveryTime: 'Minutes (GCash)',
          affiliateUrl: 'https://www.remitly.com/us/en/philippines',
        },
        {
          provider: 'Wise',
          receiveAmount: amt * 58.33,
          receiveCurrency,
          exchangeRate: 58.33,
          fee: 4.14,
          deliveryTime: '1-2 business days',
          affiliateUrl: 'https://wise.com/us/send-money/send-money-to-philippines',
        },
        {
          provider: 'Xoom',
          receiveAmount: amt * 57.57,
          receiveCurrency,
          exchangeRate: 57.57,
          fee: 0,
          deliveryTime: 'Hours (GCash)',
          affiliateUrl: 'https://www.xoom.com/philippines/send-money',
        },
        {
          provider: 'Western Union',
          receiveAmount: amt * 56.99,
          receiveCurrency,
          exchangeRate: 56.99,
          fee: 5.00,
          deliveryTime: 'Minutes (GCash, cash)',
          affiliateUrl: 'https://www.westernunion.com/us/en/send-money-to-philippines.html',
        },
        {
          provider: 'MoneyGram',
          receiveAmount: amt * 57.28,
          receiveCurrency,
          exchangeRate: 57.28,
          fee: 4.99,
          deliveryTime: 'Minutes (GCash, cash)',
          affiliateUrl: 'https://www.moneygram.com/mgo/us/en/send/philippines',
        },
        {
          provider: 'WorldRemit',
          receiveAmount: amt * 57.75,
          receiveCurrency,
          exchangeRate: 57.75,
          fee: 2.99,
          deliveryTime: 'Minutes (GCash, Maya)',
          affiliateUrl: 'https://www.worldremit.com/en/philippines',
        },
        {
          provider: 'Pangea',
          receiveAmount: amt * 57.87,
          receiveCurrency,
          exchangeRate: 57.87,
          fee: 3.95,
          deliveryTime: 'Same day (GCash)',
          affiliateUrl: 'https://www.pangeamoneytransfer.com',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openSidePanel() {
    chrome.windows.getCurrent((window) => {
      if (window.id) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', windowId: window.id });
      }
    });
  }

  const hasQuotes = quotes.length > 0;

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-2">
        <div className="flex items-center gap-2">
          <PaperAirplane className="w-8 h-8 text-[hsl(var(--accent))] shrink-0 -rotate-12" />
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--foreground))]">{t('appName')}</h1>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">{t('tagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Rate Check Card */}
        <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[hsl(var(--border))] mb-3">
          <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2.5">{t('compareRates')}</h2>
          <div className="space-y-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <CurrencySelect label={t('youSend')} value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value)} />
              </div>
              <div className="flex items-center justify-center w-8 h-10 rounded-full bg-[hsl(var(--muted))]">
                <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
              </div>
              <div className="flex-1">
                <CurrencySelect label={t('theyReceive')} value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-[hsl(var(--muted-foreground))]">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('amount')}
                  min="1"
                  className="pl-7"
                />
              </div>
              <Button onClick={handleCheck} disabled={loading || !amount}>
                {loading ? '...' : t('compare')}
              </Button>
            </div>
            <div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={amount || '500'}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[hsl(var(--accent))] bg-[hsl(var(--border))]"
              />
              <div className="flex justify-between text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5 px-0.5">
                <span>$50</span>
                <span>$500</span>
                <span>$1,000</span>
                <span>$2,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Show quotes OR recent transfers — not both */}
        {hasQuotes ? (
          <div className="space-y-2 mb-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">{t('results')}</h2>
              <button
                onClick={() => setQuotes([])}
                className="text-xs text-[hsl(var(--accent))] hover:underline"
              >
                {t('clear')}
              </button>
            </div>
            {quotes.map((quote) => (
              <RateCard
                key={quote.provider}
                {...quote}
                isCheapest={quote.provider === quotes.at(0)?.provider}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-3 shadow-sm border border-[hsl(var(--border))] mb-3">
            <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1.5 px-1">{t('recent')}</h2>
            <TransferItem amount={200} currency="USD" receiveCurrency="PHP" status="completed" date="Mar 28" />
            <TransferItem amount={500} currency="USD" receiveCurrency="INR" status="pending" date="Mar 30" />
          </div>
        )}

        {/* Chat CTA */}
        <WavyLine className="w-full text-[hsl(var(--accent))] mb-2" />
        <Button variant="secondary" onClick={openSidePanel} className="w-full gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
          {t('chatWithAi')}
        </Button>
      </div>
    </div>
  );
}

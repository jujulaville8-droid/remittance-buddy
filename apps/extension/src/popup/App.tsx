import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CurrencySelect } from '../components/CurrencySelect';
import { RateCard } from '../components/RateCard';
import { TransferItem } from '../components/TransferItem';
import { LanguageToggle } from '../components/LanguageToggle';
import airplanePerson from '../assets/airplane-person.jpg';
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
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo placeholder — replace with actual logo */}
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--coral))] flex items-center justify-center shrink-0 shadow-sm shadow-[hsla(var(--coral),0.25)]">
              <span className="text-white font-bold text-sm" style={{ fontFamily: 'Fredoka, sans-serif' }}>RB</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[hsl(var(--foreground))] leading-tight">{t('appName')}</h1>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{t('tagline')}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Rate Check Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-[hsl(var(--border))] mb-3 animate-fade-up">
          <h2 className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-3">{t('compareRates')}</h2>
          <div className="space-y-2.5">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <CurrencySelect label={t('youSend')} value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value)} />
              </div>
              <div className="flex items-center justify-center w-8 h-10 rounded-full bg-[hsl(var(--coral-light))]">
                <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--coral))]" />
              </div>
              <div className="flex-1">
                <CurrencySelect label={t('theyReceive')} value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[hsl(var(--coral))]">$</span>
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
            {/* Slider */}
            <div>
              <input
                type="range"
                min="50"
                max="2000"
                step="50"
                value={amount || '500'}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-1.5 rounded-full cursor-pointer"
              />
              <div className="flex justify-between text-[9px] font-medium text-[hsl(var(--muted-foreground))] mt-0.5 px-0.5">
                <span>$50</span>
                <span>$500</span>
                <span>$1,000</span>
                <span>$2,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes or Recent */}
        {hasQuotes ? (
          <div className="mb-3">
            <div className="flex items-center justify-between px-1 mb-2">
              <h2 className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">{t('results')}</h2>
              <button
                onClick={() => setQuotes([])}
                className="text-[11px] font-semibold text-[hsl(var(--coral))] hover:underline"
              >
                {t('clear')}
              </button>
            </div>
            <div className="space-y-2 stagger-children">
              {quotes.map((quote) => (
                <RateCard
                  key={quote.provider}
                  {...quote}
                  isCheapest={quote.provider === quotes.at(0)?.provider}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-[hsl(var(--border))] mb-3 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1 px-1">{t('recent')}</h2>
            <TransferItem amount={200} currency="USD" receiveCurrency="PHP" status="completed" date="Mar 28" />
            <TransferItem amount={500} currency="USD" receiveCurrency="INR" status="pending" date="Mar 30" />
          </div>
        )}

        {/* Chat CTA overlapping illustration */}
        <div className="relative">
          <img src={airplanePerson} alt="" className="w-full h-auto opacity-40" />
          <div className="absolute top-2 left-0 right-0 flex justify-center">
            <Button variant="secondary" onClick={openSidePanel} className="gap-2 px-6 shadow-lg bg-white/95 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[hsl(var(--coral))]" />
              {t('chatWithAi')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ArrowRight, Sparkles, TrendingDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CurrencySelect } from '../components/CurrencySelect';
import { RateCard } from '../components/RateCard';
import { TransferItem } from '../components/TransferItem';
import { LanguageToggle } from '../components/LanguageToggle';
import airplanePerson from '../assets/airplane-person.jpg';
import philippinesMap from '../assets/philippines-map.webp';
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

const QUICK_AMOUNTS = [100, 200, 500, 1000] as const;

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
          deliveryTime: '1-2 days',
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
          deliveryTime: 'Minutes (GCash)',
          affiliateUrl: 'https://www.westernunion.com/us/en/send-money-to-philippines.html',
        },
        {
          provider: 'MoneyGram',
          receiveAmount: amt * 57.28,
          receiveCurrency,
          exchangeRate: 57.28,
          fee: 4.99,
          deliveryTime: 'Minutes (GCash)',
          affiliateUrl: 'https://www.moneygram.com/mgo/us/en/send/philippines',
        },
        {
          provider: 'WorldRemit',
          receiveAmount: amt * 57.75,
          receiveCurrency,
          exchangeRate: 57.75,
          fee: 2.99,
          deliveryTime: 'Minutes (GCash)',
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

  // Calculate savings: cheapest total cost vs most expensive
  const sortedByTotalCost = hasQuotes
    ? [...quotes].sort((a, b) => (a.fee + Number(amount)) - (b.fee + Number(amount)))
    : [];
  const cheapestFee = sortedByTotalCost[0]?.fee ?? 0;
  const expensiveFee = sortedByTotalCost.at(-1)?.fee ?? 0;
  const savingsAmount = expensiveFee - cheapestFee;

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--background))]">
      {/* Header */}
      <div className="relative px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--coral))] flex items-center justify-center shrink-0 shadow-sm shadow-[hsla(var(--coral),0.25)]">
              <span className="text-white font-bold text-sm" style={{ fontFamily: "'Varela Round', sans-serif" }}>RB</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-[hsl(var(--foreground))] leading-tight tracking-tight" style={{ fontFamily: "'Varela Round', sans-serif" }}>{t('appName')}</h1>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{t('tagline')}</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Social proof */}
        <div className="flex items-center justify-center gap-1.5 mb-2.5">
          <div className="flex -space-x-1.5">
            {['bg-blue-400', 'bg-teal-400', 'bg-amber-400', 'bg-pink-400'].map((color, i) => (
              <div key={i} className={`w-5 h-5 rounded-full ${color} border-2 border-[hsl(var(--background))]`} />
            ))}
          </div>
          <span className="text-[10px] text-[hsl(var(--muted-foreground))] font-medium">
            12,847 {t('peopleCompared')}
          </span>
        </div>

        {/* Rate Check Card */}
        <div className="relative bg-white rounded-3xl p-4 shadow-sm border border-[hsl(var(--border))] mb-3 animate-fade-up overflow-hidden">
          <img src={philippinesMap} alt="" className="absolute top-1 right-0 w-28 h-auto opacity-[0.07] pointer-events-none" />
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

            {/* Amount input + quick presets */}
            <div>
              <div className="flex gap-2 mb-2">
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
              {/* Quick amount buttons */}
              <div className="flex gap-1.5">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className={`flex-1 h-7 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      amount === String(amt)
                        ? 'bg-[hsl(var(--coral))] text-white shadow-sm'
                        : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--border))]'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
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
            {/* Savings banner */}
            {savingsAmount > 0 && (
              <div className="flex items-center gap-2 bg-[hsl(var(--teal-light))] rounded-2xl px-3.5 py-2.5 mb-2 animate-fade-up">
                <div className="p-1.5 rounded-full bg-[hsl(var(--teal))]/20">
                  <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--teal))]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[hsl(var(--teal))]">
                    {t('youSave')} ${savingsAmount.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-[hsl(var(--muted-foreground))]">
                    {t('vsExpensive')}
                  </div>
                </div>
              </div>
            )}

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
              {quotes.map((quote, i) => (
                <RateCard
                  key={quote.provider}
                  {...quote}
                  isCheapest={i === 0}
                  savingsAmount={i === 0 ? savingsAmount : undefined}
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

        {/* Chat CTA */}
        <Button variant="secondary" onClick={openSidePanel} className="w-full gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--coral))]" />
          {t('chatWithAi')}
        </Button>

        {/* Airplane illustration */}
        <img src={airplanePerson} alt="" className="w-full h-auto opacity-30 mt-1" />
      </div>
    </div>
  );
}

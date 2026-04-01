import { useState } from 'react';
import { ArrowRight, Sparkles, TrendingDown, Zap, Star, Shield, ChevronDown, ChevronUp, Smartphone } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CurrencySelect } from '../components/CurrencySelect';
import { TransferItem } from '../components/TransferItem';
import { ProviderLogo } from '../components/ProviderLogo';
import { LanguageToggle } from '../components/LanguageToggle';
import philippinesMap from '../assets/philippines-map.webp';
import logo from '../assets/logo.png';
import { useI18n } from '../lib/i18n';
import { scoreProviders, type ScoringResult, type ScoredQuote } from '../lib/scoring-engine';

const QUICK_AMOUNTS = [100, 200, 500, 1000] as const;

export function App() {
  const { t } = useI18n();
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('PHP');
  const [amount, setAmount] = useState('500');
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleCheck() {
    setLoading(true);
    const scored = scoreProviders(Number(amount));
    setResult(scored);
    setShowAll(false);
    setLoading(false);
  }

  function openSidePanel() {
    chrome.windows.getCurrent((window) => {
      if (window.id) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', windowId: window.id });
      }
    });
  }

  const hasResults = result !== null;

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--background))] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Remittance Buddy" className="w-16 h-16 shrink-0 -my-2" />
          <div>
            <h1 className="text-base font-bold text-[hsl(var(--foreground))] leading-tight" style={{ fontFamily: "'Varela Round', sans-serif" }}>{t('appName')}</h1>
            <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{t('tagline')}</p>
          </div>
        </div>
        <LanguageToggle />
      </div>

      {/* Social proof */}
      <div className="flex items-center justify-center gap-1.5 px-4 pb-2">
        <div className="flex -space-x-1.5">
          {['bg-blue-400', 'bg-teal-400', 'bg-amber-400', 'bg-pink-400'].map((color, i) => (
            <div key={i} className={`w-4 h-4 rounded-full ${color} border-2 border-[hsl(var(--background))]`} />
          ))}
        </div>
        <span className="text-[9px] text-[hsl(var(--muted-foreground))] font-medium">
          12,847 {t('peopleCompared')}
        </span>
      </div>

      {/* Content */}
      <div className="px-4 pb-4 space-y-3">
        {/* Rate Check Card */}
        <div className="relative bg-white rounded-3xl p-4 shadow-sm border border-[hsl(var(--border))] overflow-hidden">
          <img src={philippinesMap} alt="" className="absolute top-1 right-0 w-24 h-auto opacity-[0.07] pointer-events-none" />
          <h2 className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-2.5">{t('compareRates')}</h2>
          <div className="space-y-2">
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <CurrencySelect label={t('youSend')} value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value)} />
              </div>
              <div className="flex items-center justify-center w-7 h-9 rounded-full bg-[hsl(var(--coral-light))]">
                <ArrowRight className="h-3 w-3 text-[hsl(var(--coral))]" />
              </div>
              <div className="flex-1">
                <CurrencySelect label={t('theyReceive')} value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[hsl(var(--coral))]">$</span>
                <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('amount')} min="1" className="pl-7 h-9" />
              </div>
              <Button onClick={handleCheck} disabled={loading || !amount} size="sm" className="h-9 px-4">
                {loading ? '...' : t('compare')}
              </Button>
            </div>
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
        </div>

        {/* Results — Decision Engine */}
        {hasResults ? (
          <div className="space-y-2">
            {/* Savings banner */}
            {result.bestOverall.savingsVsWorst > 0 && (
              <div className="flex items-center gap-2 bg-[hsl(var(--teal-light))] rounded-2xl px-3 py-2">
                <TrendingDown className="h-3.5 w-3.5 text-[hsl(var(--teal))] shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-[hsl(var(--teal))]">{t('youSave')} ${result.bestOverall.savingsVsWorst.toFixed(2)}</span>
                  <span className="text-[hsl(var(--muted-foreground))]"> {t('vsExpensive')}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between px-1">
              <h2 className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest">{t('results')}</h2>
              <button onClick={() => setResult(null)} className="text-[11px] font-semibold text-[hsl(var(--coral))] hover:underline">{t('clear')}</button>
            </div>

            {/* Our Pick — Best Overall (hero card) */}
            <RecommendationCard
              quote={result.bestOverall}
              label="Our pick"
              labelColor="bg-[hsl(var(--coral))]"
              icon={<Star className="h-3 w-3" />}
              highlighted
            />

            {/* Ask AI nudge */}
            <button
              onClick={openSidePanel}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 text-[11px] text-[hsl(var(--coral))] font-medium hover:underline"
            >
              <Sparkles className="h-3 w-3" />
              Not sure? Ask AI to help you decide
            </button>

            {/* Category winners (compact, deduplicated) */}
            <CategoryWinners result={result} cheapestLabel={t('cheapest')} fastestLabel={t('fastest')} />

            {/* Show all toggle */}
            <button
              onClick={() => setShowAll(!showAll)}
              className="flex items-center justify-center gap-1 w-full py-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            >
              {showAll ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showAll ? 'Show less' : `Show all ${result.ranked.length} providers`}
            </button>

            {/* All providers (collapsed by default) */}
            {showAll && (
              <>
                <div className="space-y-1.5 stagger-children">
                  {result.ranked.map((q) => (
                    <CompactRow key={q.provider} quote={q} />
                  ))}
                </div>
                {/* AI nudge after seeing all options */}
                <button
                  onClick={openSidePanel}
                  className="flex items-center gap-2 w-full bg-[hsl(var(--coral-light))] rounded-2xl px-3 py-2.5 mt-2 hover:shadow-sm transition-all text-left"
                >
                  <Sparkles className="h-4 w-4 text-[hsl(var(--coral))] shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-[hsl(var(--foreground))]">Still deciding?</div>
                    <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Tell our AI what matters most - speed, price, or GCash</div>
                  </div>
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="relative bg-white rounded-3xl p-3 shadow-sm border border-[hsl(var(--border))] overflow-hidden">
              <img src={philippinesMap} alt="" className="absolute inset-0 w-full h-full object-contain opacity-[0.15] pointer-events-none" />
              <div className="relative">
                <h2 className="text-[10px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1 px-1">{t('recent')}</h2>
                <TransferItem amount={200} currency="USD" receiveCurrency="PHP" status="completed" date="Mar 28" />
                <TransferItem amount={500} currency="USD" receiveCurrency="INR" status="pending" date="Mar 30" />
              </div>
            </div>

            {/* AI suggestion on empty state */}
            <button
              onClick={openSidePanel}
              className="flex items-center gap-2.5 w-full bg-white rounded-2xl px-3.5 py-3 border border-[hsl(var(--border))] shadow-sm hover:shadow-md transition-all text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--coral-light))] flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-[hsl(var(--coral))]" />
              </div>
              <div>
                <div className="text-xs font-semibold text-[hsl(var(--foreground))]">Need help choosing?</div>
                <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Ask AI to find the best rate for you</div>
              </div>
            </button>
          </>
        )}

        {/* Chat CTA */}
        <Button variant="secondary" onClick={openSidePanel} className="w-full gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--coral))]" />
          {t('chatWithAi')}
        </Button>
      </div>
    </div>
  );
}

/** Category winners grid — deduplicated so no provider appears twice */
function CategoryWinners({ result, cheapestLabel, fastestLabel }: {
  readonly result: ScoringResult;
  readonly cheapestLabel: string;
  readonly fastestLabel: string;
}) {
  const shown = new Set([result.bestOverall.provider]);
  const cards: { quote: ScoredQuote; label: string; icon: React.ReactNode; color: string }[] = [];

  if (!shown.has(result.cheapest.provider)) {
    cards.push({ quote: result.cheapest, label: cheapestLabel, icon: <TrendingDown className="h-3 w-3 text-[hsl(var(--teal))]" />, color: 'text-[hsl(var(--teal))]' });
    shown.add(result.cheapest.provider);
  }
  if (!shown.has(result.mostReceived.provider)) {
    cards.push({ quote: result.mostReceived, label: 'Most pesos', icon: <span className="text-[10px]">₱</span>, color: 'text-[hsl(var(--coral))]' });
    shown.add(result.mostReceived.provider);
  }
  if (!shown.has(result.fastest.provider)) {
    cards.push({ quote: result.fastest, label: fastestLabel, icon: <Zap className="h-3 w-3 text-[hsl(var(--gold))]" />, color: 'text-[hsl(var(--gold))]' });
    shown.add(result.fastest.provider);
  }
  if (!shown.has(result.mostTrusted.provider)) {
    cards.push({ quote: result.mostTrusted, label: 'Most trusted', icon: <Shield className="h-3 w-3 text-[hsl(var(--lavender))]" />, color: 'text-[hsl(var(--lavender))]' });
    shown.add(result.mostTrusted.provider);
  }

  if (cards.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {cards.map((c) => (
        <CategoryMini key={c.quote.provider} quote={c.quote} label={c.label} icon={c.icon} color={c.color} />
      ))}
    </div>
  );
}

/** Hero recommendation card — the main pick */
function RecommendationCard({ quote, label, labelColor, icon, highlighted }: {
  readonly quote: ScoredQuote;
  readonly label: string;
  readonly labelColor: string;
  readonly icon: React.ReactNode;
  readonly highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-3.5 border-2 transition-all ${
      highlighted
        ? 'bg-[hsl(var(--coral-light))] border-[hsl(var(--coral))]/30 shadow-md shadow-[hsla(var(--coral),0.08)]'
        : 'bg-white border-[hsl(var(--border))]'
    }`}>
      {/* Badge */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ProviderLogo provider={quote.provider} />
          <span className="font-bold text-[hsl(var(--foreground))]">{quote.provider}</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] ${labelColor} text-white px-2.5 py-0.5 rounded-full font-semibold`}>
          {icon} {label}
        </span>
      </div>

      {/* Hero number — what recipient gets */}
      <div className="mb-1.5">
        <div className="text-[9px] font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{quote.gcash ? 'Recipient gets via GCash' : 'Recipient gets'}</div>
        <div className="text-2xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: "'Varela Round', sans-serif" }}>
          ₱{quote.receiveAmount.toLocaleString()}
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))] mb-2">
        <span>Fee: ${quote.fee.toFixed(2)}</span>
        <span>{quote.deliveryTime}</span>
        {quote.gcash && (
          <span className="inline-flex items-center gap-0.5 text-blue-600">
            <Smartphone className="h-2.5 w-2.5" /> GCash
          </span>
        )}
      </div>

      {/* Why this won */}
      <div className="text-[11px] text-[hsl(var(--foreground))]/70 bg-white/60 rounded-xl px-2.5 py-1.5 mb-2.5 leading-relaxed">
        {quote.explanation}
      </div>

      {/* CTA */}
      <a
        href={getAffiliateUrl(quote.provider)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 w-full h-9 rounded-2xl bg-[hsl(var(--coral))] text-white text-sm font-semibold shadow-sm shadow-[hsla(var(--coral),0.25)] hover:shadow-md hover:brightness-105 transition-all duration-200 active:scale-[0.97]"
      >
        Send with {quote.provider}
      </a>
    </div>
  );
}

/** Compact category winner card */
function CategoryMini({ quote, label, icon, color }: {
  readonly quote: ScoredQuote;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly color: string;
}) {
  return (
    <a
      href={getAffiliateUrl(quote.provider)}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-2xl p-2.5 border border-[hsl(var(--border))] hover:shadow-md transition-all block"
    >
      <div className="flex items-center gap-1 mb-1">
        {icon}
        <span className={`text-[9px] font-bold uppercase tracking-wider ${color}`}>{label}</span>
      </div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <ProviderLogo provider={quote.provider} size="sm" />
        <span className="text-xs font-bold text-[hsl(var(--foreground))]">{quote.provider}</span>
      </div>
      <div className="text-sm font-bold text-[hsl(var(--foreground))]">₱{quote.receiveAmount.toLocaleString()}</div>
      <div className="text-[9px] text-[hsl(var(--muted-foreground))]">
        ${quote.fee.toFixed(2)} fee · {quote.deliveryTime}
      </div>
    </a>
  );
}

/** Compact row for "show all" view */
function CompactRow({ quote }: { readonly quote: ScoredQuote }) {
  return (
    <a
      href={getAffiliateUrl(quote.provider)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-[hsl(var(--border))] hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-2">
        <ProviderLogo provider={quote.provider} size="sm" />
        <div>
          <div className="text-xs font-bold text-[hsl(var(--foreground))]">{quote.provider}</div>
          <div className="text-[9px] text-[hsl(var(--muted-foreground))]">
            ${quote.fee.toFixed(2)} · {quote.deliveryTime}
            {quote.gcash && ' · GCash'}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-bold text-[hsl(var(--foreground))]">₱{quote.receiveAmount.toLocaleString()}</div>
        {quote.badges.length > 0 && (
          <div className="text-[8px] text-[hsl(var(--coral))] font-semibold">{quote.badges[0]?.replace('-', ' ')}</div>
        )}
      </div>
    </a>
  );
}

const AFFILIATE_URLS: Record<string, string> = {
  'Remitly': 'https://www.remitly.com/us/en/philippines',
  'Wise': 'https://wise.com/us/send-money/send-money-to-philippines',
  'Xoom': 'https://www.xoom.com/philippines/send-money',
  'Western Union': 'https://www.westernunion.com/us/en/send-money-to-philippines.html',
  'MoneyGram': 'https://www.moneygram.com/mgo/us/en/send/philippines',
  'WorldRemit': 'https://www.worldremit.com/en/philippines',
  'Pangea': 'https://www.pangeamoneytransfer.com',
};

function getAffiliateUrl(provider: string): string {
  return AFFILIATE_URLS[provider] ?? '#';
}

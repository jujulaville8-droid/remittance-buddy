import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BadgeCheck, ChevronDown, Receipt, TrendingUp, Zap } from 'lucide-react';
import { LanguageToggle } from '../components/LanguageToggle';
import { useI18n } from '../lib/i18n';
import { scoreProviders, type ScoredQuote, type ScoringResult } from '../lib/scoring-engine';
import { fetchLiveQuotes } from '../lib/live-quotes';
import { getAffiliateUrl, trackAffiliateClick } from '../lib/affiliates';

const QUICK_AMOUNTS = [100, 200, 500, 1000] as const;

export function App() {
  const { t } = useI18n();
  const [amount, setAmount] = useState<number>(500);
  const lastUpdated = useLastUpdated();
  const [result, setResult] = useState<ScoringResult | null>(() => scoreProviders(500));
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  // Debounced live quote fetching. Falls back to local scoring engine if API is down.
  useEffect(() => {
    if (!amount || amount < 1) {
      setResult(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetchLiveQuotes({ sourceAmount: amount, signal: controller.signal });
        setResult(res.result);
        setIsLive(!res.fromFallback);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setResult(scoreProviders(amount));
          setIsLive(false);
        }
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [amount]);

  function openSidePanel() {
    chrome.windows.getCurrent((window) => {
      if (window.id) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', windowId: window.id });
      }
    });
  }

  const best = result?.bestOverall;
  const alternatives = result ? result.ranked.slice(1, 4) : [];
  const savings = best?.extraPesosVsWorst ?? 0;

  return (
    <div className="flex flex-col h-full w-full bg-[hsl(var(--background))] text-[hsl(var(--foreground))] font-sans select-none">
      <Header />
      <ReceiptDivider />

      <InputSection
        amount={amount}
        setAmount={setAmount}
        lastUpdated={lastUpdated}
        isLive={isLive}
        loading={loading}
      />
      <ReceiptDivider />

      {best ? (
        <>
          <HeroResult quote={best} savings={savings} />
          <PrimaryCTA quote={best} onClick={() => trackAffiliateClick(best.provider, 'popup')} sendWithLabel={t('sendWith')} />
          <ReceiptDivider />
          <Alternatives alternatives={alternatives} bestReceive={best.receiveAmount} />
        </>
      ) : (
        <EmptyState />
      )}

      <Footer onClick={openSidePanel} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Header
// ────────────────────────────────────────────────────────────
function Header() {
  return (
    <header className="flex items-center justify-between px-5 h-[52px] shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-[hsl(var(--coral))] text-white flex items-center justify-center font-bold text-[13px] leading-none">
          R
        </div>
        <h1 className="font-bold text-[14px] tracking-tight">Remittance Buddy</h1>
      </div>
      <LanguageToggle />
    </header>
  );
}

// ────────────────────────────────────────────────────────────
// Input section
// ────────────────────────────────────────────────────────────
interface InputSectionProps {
  readonly amount: number;
  readonly setAmount: (n: number) => void;
  readonly lastUpdated: number;
  readonly isLive: boolean;
  readonly loading: boolean;
}

function InputSection({ amount, setAmount, lastUpdated, isLive, loading }: InputSectionProps) {
  return (
    <section className="px-5 pt-4 pb-5 shrink-0 flex flex-col">
      {/* Corridor + live indicator */}
      <div className="flex items-center justify-between w-full mb-1">
        <button
          type="button"
          className="group flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md hover:bg-black/5 active:bg-black/10 transition-colors"
          aria-label="Change corridor"
        >
          <span className="flex items-center gap-1 text-[12px] font-semibold tracking-wide text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] uppercase transition-colors">
            🇺🇸 <ArrowRight className="h-2.5 w-2.5" /> 🇵🇭 GCASH
          </span>
          <ChevronDown className="h-2.5 w-2.5 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--foreground))] group-hover:translate-y-px transition-all" />
        </button>
        <div
          className={`flex items-center gap-1 ${
            isLive
              ? 'text-[hsl(var(--teal))]'
              : loading
                ? 'text-[hsl(var(--gold))]'
                : 'text-[hsl(var(--muted-foreground))]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isLive
                ? 'bg-[hsl(var(--teal))] animate-pulse'
                : loading
                  ? 'bg-[hsl(var(--gold))] animate-pulse'
                  : 'bg-[hsl(var(--muted-foreground))]'
            }`}
          />
          <span className="text-[10px] font-mono font-medium tabular-nums">
            {isLive
              ? `Live rates · ${formatAgo(lastUpdated)}`
              : loading
                ? 'Fetching…'
                : 'Demo rates'}
          </span>
        </div>
      </div>

      {/* Big borderless input */}
      <label className="relative flex items-baseline mt-1 cursor-text group focus-within:scale-[1.01] transition-transform duration-200 origin-left">
        <span className="text-[hsl(var(--muted-foreground))] group-focus-within:text-[hsl(var(--coral))] text-[28px] font-medium -translate-y-[2px] tracking-tight mr-1 select-none transition-colors duration-200">
          $
        </span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={amount || ''}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
          className="w-[160px] bg-transparent border-0 outline-none p-0 m-0 text-[48px] font-bold text-[hsl(var(--foreground))] tracking-tighter tabular-nums caret-[hsl(var(--coral))] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          aria-label="Amount to send in USD"
        />
        <span
          aria-hidden
          className="absolute -bottom-1 left-0 h-[2px] w-0 group-focus-within:w-[calc(100%-12px)] bg-[hsl(var(--coral))]/40 rounded-full transition-[width] duration-300 ease-out"
        />
      </label>

      {/* Chips */}
      <div className="flex gap-2 mt-3">
        {QUICK_AMOUNTS.map((amt) => {
          const active = amount === amt;
          return (
            <button
              key={amt}
              type="button"
              onClick={() => setAmount(amt)}
              className={`h-7 px-3 rounded-full border text-[12px] font-mono font-medium transition-all duration-200 active:scale-95 ${
                active
                  ? 'bg-[hsl(var(--coral))] border-[hsl(var(--coral))] text-white shadow-[0_2px_8px_rgba(229,97,63,0.25)]'
                  : 'bg-white/50 border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--foreground))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              ${amt >= 1000 ? `${amt / 1000}K` : amt}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Hero result — the one answer
// ────────────────────────────────────────────────────────────
interface HeroResultProps {
  readonly quote: ScoredQuote;
  readonly savings: number;
}

function HeroResult({ quote, savings }: HeroResultProps) {
  return (
    <section className="flex-grow flex flex-col justify-center px-5 relative min-h-[180px] animate-fade-up">
      <BadgeCheck
        aria-hidden
        className="absolute top-0 right-5 h-5 w-5 text-[hsl(var(--teal))] fill-[hsl(var(--teal-light))] animate-[pulse_2.5s_ease-in-out_infinite]"
      />

      <div className="mb-1 text-[11px] font-bold tracking-widest text-[hsl(var(--coral))] uppercase">
        Top Recommendation
      </div>

      {/* Huge peso amount — animates on change via key */}
      <AnimatedAmount value={quote.receiveAmount} />

      {/* Provider inline */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[14px] font-bold text-[hsl(var(--foreground))]">{quote.provider}</span>
        <span className="text-[13px] text-[hsl(var(--muted-foreground))]">
          → {quote.gcash ? 'GCash' : 'Bank'}
        </span>
      </div>

      {/* Fact chips */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <FactChip icon={<Receipt className="h-3 w-3 text-[hsl(var(--muted-foreground))]" />}>
          Fee: ${quote.fee.toFixed(2)}
        </FactChip>
        <FactChip icon={<Zap className="h-3 w-3 text-[hsl(var(--gold))] fill-[hsl(var(--gold))]" />}>
          {quote.deliveryTime}
        </FactChip>
        {savings > 0 && (
          <FactChip
            icon={<TrendingUp className="h-3 w-3 text-[hsl(var(--teal))]" />}
            tone="teal"
          >
            +₱{Math.round(savings).toLocaleString()} vs worst
          </FactChip>
        )}
      </div>
    </section>
  );
}

function AnimatedAmount({ value }: { readonly value: number }) {
  const [displayed, setDisplayed] = useState(value);
  const [flashing, setFlashing] = useState(false);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    prev.current = value;
    setFlashing(true);
    const start = displayed;
    const delta = value - start;
    const duration = 260;
    const startedAt = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayed(Math.round(start + delta * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setTimeout(() => setFlashing(false), 120);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div
      className={`font-display text-[56px] leading-[0.95] tracking-tight text-[hsl(var(--coral))] mb-2 tabular-nums transition-[filter,transform] duration-200 ${
        flashing ? 'blur-[0.5px] scale-[1.01]' : ''
      }`}
    >
      ₱{displayed.toLocaleString()}
    </div>
  );
}

function FactChip({
  icon,
  children,
  tone = 'neutral',
}: {
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
  readonly tone?: 'neutral' | 'teal';
}) {
  const toneClass =
    tone === 'teal'
      ? 'bg-[hsl(var(--teal-light))] border-[hsl(var(--teal))]/20 text-[hsl(var(--teal))]'
      : 'bg-white/60 border-[hsl(var(--border))] text-[hsl(var(--foreground))]';
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${toneClass}`}>
      {icon}
      <span className="font-mono text-[11px] font-medium">{children}</span>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Primary CTA
// ────────────────────────────────────────────────────────────
interface PrimaryCTAProps {
  readonly quote: ScoredQuote;
  readonly onClick: () => void;
  readonly sendWithLabel: string;
}

function PrimaryCTA({ quote, onClick, sendWithLabel }: PrimaryCTAProps) {
  return (
    <section className="px-5 pb-5 shrink-0">
      <a
        href={getAffiliateUrl(quote.provider)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="group relative w-full h-[52px] bg-[hsl(var(--coral))] text-white rounded-xl flex items-center justify-between px-5 font-bold text-[15px] shadow-[0px_4px_14px_rgba(229,97,63,0.3)] hover:shadow-[0px_6px_20px_rgba(229,97,63,0.4)] hover:brightness-[1.03] active:scale-[0.98] transition-all duration-200 overflow-hidden"
      >
        {/* Shine sweep on hover */}
        <span
          aria-hidden
          className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] -translate-x-full group-hover:translate-x-[500%] transition-transform duration-700 ease-out pointer-events-none"
        />
        <span className="relative">
          {sendWithLabel} {quote.provider}
        </span>
        <ArrowRight className="relative h-4 w-4 group-hover:translate-x-0.5 transition-transform duration-200" />
      </a>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Alternatives
// ────────────────────────────────────────────────────────────
interface AlternativesProps {
  readonly alternatives: readonly ScoredQuote[];
  readonly bestReceive: number;
}

function Alternatives({ alternatives, bestReceive }: AlternativesProps) {
  if (alternatives.length === 0) return null;
  return (
    <section className="px-5 py-4 shrink-0 bg-[hsl(var(--muted))]/40">
      <div className="mb-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          Also Ranked
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        {alternatives.map((q, i) => {
          const delta = q.receiveAmount - bestReceive;
          return (
            <a
              key={q.provider}
              href={getAffiliateUrl(q.provider)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick(q.provider, 'popup')}
              className="flex items-center justify-between py-1.5 px-2 -mx-2 rounded hover:bg-black/[0.04] hover:translate-x-0.5 transition-all duration-200 animate-fade-up"
              style={{ animationDelay: `${60 + i * 60}ms` }}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="font-semibold text-[13px] text-[hsl(var(--foreground))] truncate">
                  {q.provider}
                </span>
                {q.gcash && (
                  <span className="text-[9px] bg-[hsl(var(--border))] px-1 rounded font-medium text-[hsl(var(--muted-foreground))]">
                    GCash
                  </span>
                )}
              </div>
              <span className="font-mono text-[13px] text-[hsl(var(--foreground))] text-right tabular-nums w-20">
                ₱{q.receiveAmount.toLocaleString()}
              </span>
              <span className="font-mono text-[11px] font-medium text-[hsl(var(--coral))] text-right tabular-nums w-14">
                {delta === 0 ? '—' : `−₱${Math.abs(delta).toLocaleString()}`}
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Empty state (amount <= 0)
// ────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <section className="flex-grow flex flex-col items-center justify-center px-5 text-center">
      <div className="text-[hsl(var(--muted-foreground))] text-sm">
        Enter an amount to see the winner
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────
// Footer — opens sidepanel
// ────────────────────────────────────────────────────────────
function Footer({ onClick }: { readonly onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group h-8 shrink-0 flex items-center justify-center bg-[hsl(var(--foreground))] text-[hsl(var(--background))] w-full hover:bg-[hsl(var(--foreground))]/90 transition-colors"
    >
      <span className="text-[11px] font-medium flex items-center gap-1.5">
        Why this won
        <ArrowRight className="h-2.5 w-2.5 group-hover:translate-x-0.5 transition-transform duration-200" />
      </span>
    </button>
  );
}

// ────────────────────────────────────────────────────────────
// Hooks & helpers
// ────────────────────────────────────────────────────────────
function useLastUpdated(): number {
  const mountedAt = useRef(Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, Math.floor((now - mountedAt.current) / 1000));
}

function formatAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ────────────────────────────────────────────────────────────
// Receipt divider
// ────────────────────────────────────────────────────────────
function ReceiptDivider() {
  return (
    <div
      aria-hidden
      className="h-px w-full opacity-25"
      style={{
        backgroundImage:
          'linear-gradient(to right, hsl(var(--muted-foreground)) 33%, transparent 0%)',
        backgroundPosition: 'bottom',
        backgroundSize: '6px 1px',
        backgroundRepeat: 'repeat-x',
      }}
    />
  );
}

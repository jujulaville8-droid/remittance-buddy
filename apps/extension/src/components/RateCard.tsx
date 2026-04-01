import { ExternalLink, Zap, TrendingDown } from 'lucide-react';
import { ProviderLogo } from './ProviderLogo';
import { useI18n } from '../lib/i18n';

interface RateCardProps {
  readonly provider: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly deliveryTime: string;
  readonly affiliateUrl: string;
  readonly isCheapest?: boolean;
  readonly isFastest?: boolean;
}

export function RateCard({
  provider,
  receiveAmount,
  receiveCurrency,
  exchangeRate,
  fee,
  deliveryTime,
  affiliateUrl,
  isCheapest,
  isFastest,
}: RateCardProps) {
  const { t } = useI18n();

  return (
    <div className={clsx(
      'rounded-2xl p-3.5 transition-all duration-200 hover:shadow-md',
      isCheapest
        ? 'bg-[hsl(var(--teal-light))] border-2 border-[hsl(var(--teal))]/30 shadow-sm shadow-[hsla(var(--teal),0.1)]'
        : 'bg-white border border-[hsl(var(--border))] shadow-sm'
    )}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ProviderLogo provider={provider} />
          <span className="font-bold text-[hsl(var(--foreground))]">{provider}</span>
        </div>
        <div className="flex gap-1">
          {isCheapest && (
            <span className="inline-flex items-center gap-0.5 text-[10px] bg-[hsl(var(--teal))] text-white px-2 py-0.5 rounded-full font-semibold">
              <TrendingDown className="h-2.5 w-2.5" /> {t('cheapest')}
            </span>
          )}
          {isFastest && (
            <span className="inline-flex items-center gap-0.5 text-[10px] bg-[hsl(var(--gold))] text-[hsl(var(--foreground))] px-2 py-0.5 rounded-full font-semibold">
              <Zap className="h-2.5 w-2.5" /> {t('fastest')}
            </span>
          )}
        </div>
      </div>
      <div className="text-xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: 'Fredoka, sans-serif' }}>
        {receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{receiveCurrency}</span>
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        <span>{t('rate')}: {exchangeRate} &middot; {t('fee')}: ${fee.toFixed(2)}</span>
        <span>{deliveryTime}</span>
      </div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex items-center justify-center gap-1.5 w-full h-9 rounded-2xl bg-[hsl(var(--coral))] text-white text-sm font-semibold shadow-sm shadow-[hsla(var(--coral),0.25)] hover:shadow-md hover:shadow-[hsla(var(--coral),0.35)] hover:brightness-105 transition-all duration-200 active:scale-[0.97]"
      >
        {t('sendWith')} {provider} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

function clsx(...args: (string | Record<string, boolean> | undefined | false)[]): string {
  return args
    .filter(Boolean)
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (typeof arg === 'object') {
        return Object.entries(arg as Record<string, boolean>)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(' ');
      }
      return '';
    })
    .join(' ');
}

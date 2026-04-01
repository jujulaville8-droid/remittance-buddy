import { ExternalLink, Zap, TrendingDown, Smartphone } from 'lucide-react';
import { ProviderLogo } from './ProviderLogo';
import { useI18n } from '../lib/i18n';

const GCASH_PROVIDERS = new Set(['Remitly', 'Western Union', 'MoneyGram', 'Xoom', 'WorldRemit', 'Pangea', 'Kabayan Remit']);

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
  readonly savingsAmount?: number;
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
  savingsAmount,
}: RateCardProps) {
  const { t } = useI18n();
  const hasGcash = GCASH_PROVIDERS.has(provider);

  const cardClass = isCheapest
    ? 'bg-[hsl(var(--teal-light))] border-2 border-[hsl(var(--teal))]/30 shadow-sm shadow-[hsla(var(--teal),0.1)]'
    : 'bg-white border border-[hsl(var(--border))] shadow-sm';

  return (
    <div className={`rounded-2xl p-3.5 transition-all duration-200 hover:shadow-md ${cardClass}`}>
      {/* Provider header */}
      <div className="flex items-center justify-between mb-1.5">
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

      {/* Receive amount — the hero number */}
      <div className="mb-1">
        <div className="text-[10px] font-medium text-[hsl(var(--muted-foreground))] uppercase tracking-wider">{t('theyGet')}</div>
        <div className="text-xl font-bold text-[hsl(var(--foreground))]" style={{ fontFamily: "'Varela Round', sans-serif" }}>
          {receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{receiveCurrency}</span>
        </div>
      </div>

      {/* Details row */}
      <div className="flex items-center justify-between text-xs text-[hsl(var(--muted-foreground))]">
        <span>{t('rate')}: {exchangeRate} &middot; {t('fee')}: ${fee.toFixed(2)}</span>
        <span>{deliveryTime}</span>
      </div>

      {/* GCash + Savings row */}
      <div className="flex items-center gap-2 mt-1.5">
        {hasGcash && (
          <span className="inline-flex items-center gap-0.5 text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
            <Smartphone className="h-2.5 w-2.5" /> {t('gcash')}
          </span>
        )}
        {isCheapest && savingsAmount !== undefined && savingsAmount > 0 && (
          <span className="text-[10px] font-semibold text-[hsl(var(--teal))]">
            {t('youSave')} ${savingsAmount.toFixed(2)} {t('vsExpensive')}
          </span>
        )}
      </div>

      {/* CTA */}
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

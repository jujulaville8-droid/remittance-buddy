import { ExternalLink, Zap, TrendingDown } from 'lucide-react';

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
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-3.5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-[hsl(var(--foreground))]">{provider}</span>
        <div className="flex gap-1">
          {isCheapest && (
            <span className="inline-flex items-center gap-0.5 text-xs bg-[hsl(var(--success-light))] text-[hsl(var(--success))] px-2 py-0.5 rounded-full font-medium">
              <TrendingDown className="h-3 w-3" /> Pinakamura
            </span>
          )}
          {isFastest && (
            <span className="inline-flex items-center gap-0.5 text-xs bg-[hsl(var(--accent-light))] text-[hsl(var(--accent))] px-2 py-0.5 rounded-full font-medium">
              <Zap className="h-3 w-3" /> Pinakamabilis
            </span>
          )}
        </div>
      </div>
      <div className="text-xl font-bold text-[hsl(var(--foreground))]">
        {receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {receiveCurrency}
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        <span>Rate: {exchangeRate} &middot; Fee: ${fee.toFixed(2)}</span>
        <span>{deliveryTime}</span>
      </div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2.5 flex items-center justify-center gap-1.5 w-full h-9 rounded-full bg-[hsl(var(--accent))] text-white text-sm font-semibold hover:brightness-110 hover:shadow-md transition-all duration-200 active:scale-[0.97]"
      >
        Ipadala sa {provider} <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

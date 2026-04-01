import { ExternalLink } from 'lucide-react';

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
    <div className="rounded-lg border border-[hsl(var(--border))] p-3 hover:border-[hsl(var(--accent))]/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{provider}</span>
        <div className="flex gap-1">
          {isCheapest && (
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">Cheapest</span>
          )}
          {isFastest && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Fastest</span>
          )}
        </div>
      </div>
      <div className="text-lg font-mono font-semibold">
        {receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {receiveCurrency}
      </div>
      <div className="flex items-center justify-between mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        <span>Rate: {exchangeRate} | Fee: ${fee.toFixed(2)}</span>
        <span>{deliveryTime}</span>
      </div>
      <a
        href={affiliateUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1 w-full h-8 rounded-md bg-[hsl(var(--accent))] text-white text-sm font-medium hover:bg-[hsl(var(--accent))]/90 transition-colors"
      >
        Send with {provider} <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

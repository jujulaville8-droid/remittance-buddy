import { TrendingDown, Star, Smartphone, MapPin } from 'lucide-react';
import { ProviderLogo } from './ProviderLogo';
import { getAffiliateUrl, trackAffiliateClick } from '../lib/affiliates';

interface ProviderResult {
  readonly provider: string;
  readonly receiveAmount: number;
  readonly fee: number;
  readonly speed: string;
  readonly gcash: boolean;
  readonly cashPickup: boolean;
  readonly trust: number;
  readonly sendAmount: number;
  readonly reason?: string;
}

export interface ComparisonData {
  readonly recommended: ProviderResult | null;
  readonly alternatives: readonly ProviderResult[];
  readonly savings: { readonly feeSaved: number; readonly extraPesos: number } | null;
}


export function ProviderComparisonCard({ data }: { readonly data: ComparisonData }) {
  const { recommended, alternatives, savings } = data;

  if (!recommended) return null;

  return (
    <div className="space-y-2 w-full max-w-[320px]">
      {/* Savings banner */}
      {savings && savings.extraPesos > 0 && (
        <div className="flex items-center gap-2 bg-[hsl(var(--teal-light))] rounded-xl px-2.5 py-1.5">
          <TrendingDown className="h-3 w-3 text-[hsl(var(--teal))] shrink-0" />
          <span className="text-[10px] font-semibold text-[hsl(var(--teal))]">
            Recipient gets ₱{savings.extraPesos.toLocaleString()} more with our pick
          </span>
        </div>
      )}

      {/* Recommended — hero card */}
      <a
        href={getAffiliateUrl(recommended.provider)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackAffiliateClick(recommended.provider, 'chat')}
        className="block rounded-lg p-3 bg-gradient-to-br from-[hsl(var(--coral-light))] to-[hsl(var(--card))] border-2 border-[hsl(var(--coral))]/30 shadow-level-3 hover:shadow-level-3 transition-all"
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <ProviderLogo provider={recommended.provider} size="sm" />
            <span className="text-xs font-bold text-[hsl(var(--foreground))]">{recommended.provider}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[9px] bg-[hsl(var(--gold))] text-[hsl(var(--foreground))] px-2 py-0.5 rounded-full font-semibold">
            <Star className="h-2.5 w-2.5" /> Best pick
          </span>
        </div>
        <div className="text-lg font-display font-bold text-[hsl(var(--foreground))] mb-1">
          ₱{recommended.receiveAmount.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
          <span>${recommended.fee.toFixed(2)} fee</span>
          <span>{recommended.speed}</span>
          {recommended.gcash && (
            <span className="inline-flex items-center gap-0.5 text-blue-600">
              <Smartphone className="h-2.5 w-2.5" /> GCash
            </span>
          )}
          {recommended.cashPickup && (
            <span className="inline-flex items-center gap-0.5">
              <MapPin className="h-2.5 w-2.5" /> Pickup
            </span>
          )}
        </div>
      </a>

      {/* Alternatives — compact cards */}
      {alternatives.length > 0 && (
        <div className="space-y-1.5">
          <div className="text-[9px] font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wider px-1">
            Alternatives
          </div>
          {alternatives.map((alt) => (
            <a
              key={alt.provider}
              href={getAffiliateUrl(alt.provider)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateClick(alt.provider, 'chat')}
              className="flex items-center justify-between bg-[hsl(var(--card))] rounded-lg px-2.5 py-2 border border-[hsl(var(--border))] shadow-level-1 hover:shadow-level-2 transition-all"
            >
              <div className="flex items-center gap-2">
                <ProviderLogo provider={alt.provider} size="sm" />
                <div>
                  <div className="text-[11px] font-bold text-[hsl(var(--foreground))]">{alt.provider}</div>
                  <div className="flex items-center gap-1.5 text-[9px] text-[hsl(var(--muted-foreground))]">
                    <span>${alt.fee.toFixed(2)}</span>
                    <span>{alt.speed}</span>
                    {alt.gcash && <Smartphone className="h-2.5 w-2.5 text-blue-500" />}
                  </div>
                </div>
              </div>
              <div className="text-sm font-bold text-[hsl(var(--foreground))]">
                ₱{alt.receiveAmount.toLocaleString()}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

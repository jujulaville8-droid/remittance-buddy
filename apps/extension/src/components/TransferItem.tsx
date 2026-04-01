import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useI18n, type TranslationKey } from '../lib/i18n';

interface TransferItemProps {
  readonly amount: number;
  readonly currency: string;
  readonly receiveCurrency: string;
  readonly status: string;
  readonly date: string;
}

const STATUS_CONFIG: Record<string, { icon: typeof CheckCircle; color: string; bg: string; labelKey: TranslationKey }> = {
  completed:  { icon: CheckCircle, color: 'text-[hsl(var(--success))]',     bg: 'bg-[hsl(var(--success-light))]', labelKey: 'statusDone' },
  pending:    { icon: Clock,       color: 'text-[hsl(var(--warning))]',     bg: 'bg-[hsl(var(--warning-light))]', labelKey: 'statusPending' },
  processing: { icon: Clock,       color: 'text-[hsl(var(--accent))]',      bg: 'bg-[hsl(var(--accent-light))]',  labelKey: 'statusProcessing' },
  failed:     { icon: XCircle,     color: 'text-[hsl(var(--destructive))]', bg: 'bg-red-50',                      labelKey: 'statusFailed' },
};

export function TransferItem({ amount, currency, receiveCurrency, status, date }: TransferItemProps) {
  const { t } = useI18n();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['pending']!;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-[hsl(var(--muted))] transition-colors">
      <div className="flex items-center gap-2.5">
        <div className={`p-1.5 rounded-full ${config.bg}`}>
          <Icon className={`h-3.5 w-3.5 ${config.color}`} />
        </div>
        <div>
          <div className="text-sm font-semibold text-[hsl(var(--foreground))]">
            ${amount.toLocaleString()} {currency} &rarr; {receiveCurrency}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">{date}</div>
        </div>
      </div>
      <span className={`text-xs font-medium ${config.color}`}>{t(config.labelKey)}</span>
    </div>
  );
}

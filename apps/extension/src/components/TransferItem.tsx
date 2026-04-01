import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface TransferItemProps {
  readonly amount: number;
  readonly currency: string;
  readonly receiveCurrency: string;
  readonly status: string;
  readonly date: string;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success-light))]', label: 'Done' },
  pending: { icon: Clock, color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning-light))]', label: 'Pending' },
  processing: { icon: Clock, color: 'text-[hsl(var(--accent))]', bg: 'bg-[hsl(var(--accent-light))]', label: 'Processing' },
  failed: { icon: XCircle, color: 'text-[hsl(var(--destructive))]', bg: 'bg-red-50', label: 'Failed' },
} as const;

export function TransferItem({ amount, currency, receiveCurrency, status, date }: TransferItemProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
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
      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}

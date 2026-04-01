import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface TransferItemProps {
  readonly amount: number;
  readonly currency: string;
  readonly receiveCurrency: string;
  readonly status: string;
  readonly date: string;
}

const STATUS_CONFIG = {
  completed: { icon: CheckCircle, color: 'text-green-400', label: 'Done' },
  pending: { icon: Clock, color: 'text-yellow-400', label: 'Pending' },
  processing: { icon: Clock, color: 'text-blue-400', label: 'Processing' },
  failed: { icon: XCircle, color: 'text-red-400', label: 'Failed' },
} as const;

export function TransferItem({ amount, currency, receiveCurrency, status, date }: TransferItemProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <div>
          <div className="text-sm font-medium">
            ${amount.toLocaleString()} {currency} → {receiveCurrency}
          </div>
          <div className="text-xs text-[hsl(var(--muted-foreground))]">{date}</div>
        </div>
      </div>
      <span className={`text-xs ${config.color}`}>{config.label}</span>
    </div>
  );
}

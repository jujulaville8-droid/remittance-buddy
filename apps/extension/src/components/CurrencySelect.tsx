import { type SelectHTMLAttributes } from 'react';
import { clsx } from 'clsx';

const COMMON_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', flag: '\u{1F1FA}\u{1F1F8}' },
  { code: 'EUR', name: 'Euro', flag: '\u{1F1EA}\u{1F1FA}' },
  { code: 'GBP', name: 'British Pound', flag: '\u{1F1EC}\u{1F1E7}' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '\u{1F1E8}\u{1F1E6}' },
  { code: 'AUD', name: 'Australian Dollar', flag: '\u{1F1E6}\u{1F1FA}' },
  { code: 'PHP', name: 'Philippine Peso', flag: '\u{1F1F5}\u{1F1ED}' },
  { code: 'INR', name: 'Indian Rupee', flag: '\u{1F1EE}\u{1F1F3}' },
  { code: 'MXN', name: 'Mexican Peso', flag: '\u{1F1F2}\u{1F1FD}' },
  { code: 'NGN', name: 'Nigerian Naira', flag: '\u{1F1F3}\u{1F1EC}' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '\u{1F1F5}\u{1F1F0}' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '\u{1F1E7}\u{1F1E9}' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '\u{1F1FB}\u{1F1F3}' },
  { code: 'BRL', name: 'Brazilian Real', flag: '\u{1F1E7}\u{1F1F7}' },
  { code: 'KES', name: 'Kenyan Shilling', flag: '\u{1F1F0}\u{1F1EA}' },
  { code: 'GHS', name: 'Ghanaian Cedi', flag: '\u{1F1EC}\u{1F1ED}' },
] as const;

interface CurrencySelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  readonly label: string;
}

export function CurrencySelect({ label, className, ...props }: CurrencySelectProps) {
  return (
    <div>
      <label className="text-xs font-medium text-[hsl(var(--muted-foreground))] mb-1 block">{label}</label>
      <select
        className={clsx(
          'w-full h-10 rounded-xl border border-[hsl(var(--border))] bg-white px-3 text-sm',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--accent))] focus-visible:border-transparent',
          'transition-all duration-200',
          className
        )}
        {...props}
      >
        {COMMON_CURRENCIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.flag} {c.code} — {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}

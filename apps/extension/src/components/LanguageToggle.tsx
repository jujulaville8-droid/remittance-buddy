import { useI18n } from '../lib/i18n';
import { Languages } from 'lucide-react';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  const switchLabel = locale === 'en' ? 'Switch to Tagalog' : 'Switch to English';

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'tl' : 'en')}
      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--card))] transition-colors"
      aria-label={switchLabel}
      title={switchLabel}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="font-medium">{locale === 'en' ? 'TL' : 'EN'}</span>
    </button>
  );
}

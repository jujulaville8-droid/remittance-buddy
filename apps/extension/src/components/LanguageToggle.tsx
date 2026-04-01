import { useI18n } from '../lib/i18n';

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <button
      onClick={() => setLocale(locale === 'en' ? 'tl' : 'en')}
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[hsl(var(--muted))] hover:bg-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--foreground))] transition-colors"
      title={locale === 'en' ? 'Switch to Tagalog' : 'Switch to English'}
    >
      <span className="text-sm">{locale === 'en' ? 'PH' : 'EN'}</span>
      <span className="text-[hsl(var(--muted-foreground))]">
        {locale === 'en' ? 'Tagalog' : 'English'}
      </span>
    </button>
  );
}

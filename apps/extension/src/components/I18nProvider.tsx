import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { I18nContext, translations, type Locale, type TranslationKey } from '../lib/i18n';
import { getLocalValue, setLocalValue } from '../lib/storage';

const LOCALE_STORAGE_KEY = 'remit_locale';

export function I18nProvider({ children }: { readonly children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tl');

  useEffect(() => {
    getLocalValue<Locale>(LOCALE_STORAGE_KEY).then((saved) => {
      if (saved === 'en' || saved === 'tl') {
        setLocaleState(saved);
      }
    });
  }, []);

  function setLocale(newLocale: Locale) {
    setLocaleState(newLocale);
    setLocalValue(LOCALE_STORAGE_KEY, newLocale);
  }

  const value = useMemo(() => ({
    locale,
    t: (key: TranslationKey) => translations[locale][key],
    setLocale,
  }), [locale]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

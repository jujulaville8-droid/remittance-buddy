import { createContext, useContext } from 'react';

export type Locale = 'en' | 'tl';

export const translations = {
  en: {
    // Popup
    appName: 'Remittance Buddy',
    tagline: 'Find the lowest remittance rate',
    compareRates: 'Compare Rates',
    youSend: 'You send',
    theyReceive: 'They receive',
    compare: 'Compare',
    results: 'Results',
    clear: 'Clear',
    recent: 'Recent',
    chatWithAi: 'Chat with AI assistant',
    amount: 'Amount',

    // Rate card
    cheapest: 'Best price',
    fastest: 'Fastest',
    sendWith: 'Send with',
    rate: 'Rate',
    fee: 'Fee',

    // Transfer status
    statusDone: 'Done',
    statusPending: 'Pending',
    statusProcessing: 'Processing',
    statusFailed: 'Failed',

    // Side panel chat
    chatTagline: 'Your money transfer assistant',
    chatWelcome: 'Hey! Where are you sending money?',
    chatSubtext: "I'll find you the best rate across all providers.",
    chatPlaceholder: 'Send $500 to the Philippines...',
    suggestion1: 'Send $500 to Philippines',
    suggestion2: 'Compare USD to PHP',
    suggestion3: 'Check my transfers',
    lookingUp: 'Looking up',

    // Onboarding
    onboardingDescription: 'The easiest way to compare rates and send money home. We find the best deal for you.',
    onboardingFeature1: 'Compare Wise, Remitly, WU & more',
    onboardingFeature2: 'Find the cheapest & fastest option',
    onboardingFeature3: 'Free to use, always',
    getStarted: 'Get started',
    noFees: 'No fees. We earn a small commission from providers.',

    // Language
    language: 'English',
  },
  tl: {
    // Popup
    appName: 'Remittance Buddy',
    tagline: 'Hanapin ang pinakamababang padala rate',
    compareRates: 'Ikumpara ang Rates',
    youSend: 'Ipapadala mo',
    theyReceive: 'Matatanggap nila',
    compare: 'Ikumpara',
    results: 'Mga Resulta',
    clear: 'Burahin',
    recent: 'Kamakailang Padala',
    chatWithAi: 'Kausapin ang AI assistant',
    amount: 'Halaga',

    // Rate card
    cheapest: 'Pinakamura',
    fastest: 'Pinakamabilis',
    sendWith: 'Ipadala sa',
    rate: 'Rate',
    fee: 'Bayad',

    // Transfer status
    statusDone: 'Tapos na',
    statusPending: 'Hinihintay',
    statusProcessing: 'Ipinapadala',
    statusFailed: 'Hindi naipadala',

    // Side panel chat
    chatTagline: 'Ang iyong padala assistant',
    chatWelcome: 'Saan mo gustong magpadala?',
    chatSubtext: 'Hahanapin ko ang pinakamababang rate para sa iyo.',
    chatPlaceholder: 'Magpadala ng $500 sa Pilipinas...',
    suggestion1: 'Magpadala ng $500 sa Pilipinas',
    suggestion2: 'Ikumpara USD sa PHP',
    suggestion3: 'Tingnan ang mga padala ko',
    lookingUp: 'Hinahanap ang',

    // Onboarding
    onboardingDescription: 'Ang pinakamadaling paraan para ikumpara ang rates at magpadala ng pera sa Pilipinas.',
    onboardingFeature1: 'Ikumpara ang Wise, Remitly, WU at iba pa',
    onboardingFeature2: 'Hanapin ang pinakamura at pinakamabilis',
    onboardingFeature3: 'Libre gamitin, palagi',
    getStarted: 'Magsimula',
    noFees: 'Walang bayad. Kumikita kami ng maliit na komisyon mula sa mga provider.',

    // Language
    language: 'Tagalog',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export interface I18nContextValue {
  readonly locale: Locale;
  readonly t: (key: TranslationKey) => string;
  readonly setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: 'tl',
  t: (key) => translations.tl[key],
  setLocale: () => {},
});

export function useI18n(): I18nContextValue {
  return useContext(I18nContext);
}

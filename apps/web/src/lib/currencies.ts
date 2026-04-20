export interface Currency {
  readonly code: string
  readonly name: string
  readonly flag: string
  readonly symbol: string
}

// 42 currencies covering major OFW corridors + common world currencies.
// Target is always PHP for V1; source is dynamic.
export const CURRENCIES: readonly Currency[] = [
  { code: 'USD', name: 'US Dollar', flag: '🇺🇸', symbol: '$' },
  { code: 'EUR', name: 'Euro', flag: '🇪🇺', symbol: '€' },
  { code: 'GBP', name: 'British Pound', flag: '🇬🇧', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', flag: '🇨🇭', symbol: 'Fr' },
  { code: 'SGD', name: 'Singapore Dollar', flag: '🇸🇬', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', flag: '🇭🇰', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', flag: '🇳🇿', symbol: 'NZ$' },
  { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪', symbol: 'د.إ' },
  { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦', symbol: '﷼' },
  { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦', symbol: '﷼' },
  { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼', symbol: 'د.ك' },
  { code: 'BHD', name: 'Bahraini Dinar', flag: '🇧🇭', symbol: 'د.ب' },
  { code: 'OMR', name: 'Omani Rial', flag: '🇴🇲', symbol: '﷼' },
  { code: 'ILS', name: 'Israeli Shekel', flag: '🇮🇱', symbol: '₪' },
  { code: 'KRW', name: 'South Korean Won', flag: '🇰🇷', symbol: '₩' },
  { code: 'TWD', name: 'Taiwan Dollar', flag: '🇹🇼', symbol: 'NT$' },
  { code: 'CNY', name: 'Chinese Yuan', flag: '🇨🇳', symbol: '¥' },
  { code: 'MYR', name: 'Malaysian Ringgit', flag: '🇲🇾', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', flag: '🇮🇩', symbol: 'Rp' },
  { code: 'THB', name: 'Thai Baht', flag: '🇹🇭', symbol: '฿' },
  { code: 'VND', name: 'Vietnamese Dong', flag: '🇻🇳', symbol: '₫' },
  { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', symbol: '₹' },
  { code: 'PKR', name: 'Pakistani Rupee', flag: '🇵🇰', symbol: '₨' },
  { code: 'BDT', name: 'Bangladeshi Taka', flag: '🇧🇩', symbol: '৳' },
  { code: 'SEK', name: 'Swedish Krona', flag: '🇸🇪', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', flag: '🇳🇴', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', flag: '🇩🇰', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', flag: '🇵🇱', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', flag: '🇨🇿', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', flag: '🇭🇺', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', flag: '🇷🇴', symbol: 'lei' },
  { code: 'TRY', name: 'Turkish Lira', flag: '🇹🇷', symbol: '₺' },
  { code: 'ZAR', name: 'South African Rand', flag: '🇿🇦', symbol: 'R' },
  { code: 'BRL', name: 'Brazilian Real', flag: '🇧🇷', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', flag: '🇲🇽', symbol: 'Mex$' },
  { code: 'ARS', name: 'Argentine Peso', flag: '🇦🇷', symbol: '$' },
  { code: 'CLP', name: 'Chilean Peso', flag: '🇨🇱', symbol: '$' },
  { code: 'COP', name: 'Colombian Peso', flag: '🇨🇴', symbol: '$' },
  { code: 'PHP', name: 'Philippine Peso', flag: '🇵🇭', symbol: '₱' },
] as const

// Highest-volume OFW source corridors, shown first in picker.
export const POPULAR_SOURCE_CODES = [
  'USD', 'SGD', 'AED', 'SAR', 'HKD', 'GBP', 'AUD', 'JPY', 'CAD', 'EUR',
] as const

export function getCurrency(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!
}

export function getPopularCurrencies(): readonly Currency[] {
  return POPULAR_SOURCE_CODES
    .map((code) => CURRENCIES.find((c) => c.code === code))
    .filter((c): c is Currency => c !== undefined)
}

export const PHP = getCurrency('PHP')

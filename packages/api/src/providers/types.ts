export interface RateQuote {
  readonly provider: string;
  readonly sendAmount: number;
  readonly sendCurrency: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly totalCost: number;
  readonly deliveryTime: string;
  readonly paymentMethods: readonly string[];
  readonly affiliateUrl: string;
}

export interface ProviderConfig {
  readonly name: string;
  readonly slug: string;
  readonly apiBaseUrl: string;
  readonly supportedCorridors: readonly string[];
}

export interface CorridorInfo {
  readonly sendCountry: string;
  readonly receiveCountry: string;
  readonly providers: readonly string[];
  readonly maxAmountUsd: number;
  readonly documentsRequired: readonly string[];
  readonly restrictions: readonly string[];
}

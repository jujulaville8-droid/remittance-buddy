export { checkRatesTool, getRecipientsTool, getTransferHistoryTool, getCorridorInfoTool } from './tools';
export { buildSystemPrompt } from './system-prompt';
export type { RateQuote, ProviderConfig, CorridorInfo } from './providers/types';

// Rails execution layer — stubs for V1, real implementations arrive in V2
export {
  NiumProvider,
  CurrencycloudProvider,
  ThunesProvider,
  createRailsProvider,
  pickRailForCorridor,
} from './providers/rails';
export type {
  RailsProvider,
  RailsProviderConfig,
  RailsQuoteRequest,
  RailsQuote,
  BeneficiaryInput,
  Beneficiary,
  BeneficiaryStatus,
  CollectionRequest,
  Collection,
  CollectionStatus,
  TransferRequest,
  TransferDraft,
  TransferStatusResult,
  TransferStatus,
  WebhookEvent,
  PayoutMethod as RailsPayoutMethod,
} from './providers/rails';

// Live rates module (V1: public quote aggregation)
export {
  fetchAllQuotes,
  fetchQuotesForBatch,
  getCachedQuotes,
  setCachedQuotes,
  invalidateQuotes,
  buildKey,
  CACHE_TTL_SECONDS,
  getMidMarketRate,
  calculateSpread,
  ALL_FETCHERS,
} from './rates';
export type {
  Corridor,
  PayoutMethod,
  QuoteRequest,
  LiveQuote,
  QuoteFetcher,
  QuoteFetchError,
  QuoteBatchResult,
  CacheClient,
} from './rates';

/**
 * Thunes — V2/V3 backup rail, strongest in emerging market corridors.
 * STUB for interface compatibility. Real client ships in V2.
 */

import type {
  Beneficiary,
  BeneficiaryInput,
  BeneficiaryStatus,
  Collection,
  CollectionRequest,
  CollectionStatus,
  RailsProvider,
  RailsProviderConfig,
  RailsQuote,
  RailsQuoteRequest,
  TransferDraft,
  TransferRequest,
  TransferStatusResult,
  WebhookEvent,
} from './types'

export class ThunesProvider implements RailsProvider {
  readonly name = 'Thunes'
  readonly slug = 'thunes'
  readonly supportedCountries = [
    'US', 'GB', 'EU', 'SG', 'AU', 'HK', 'JP', 'AE', 'SA',
    'PH', 'BD', 'PK', 'IN', 'ID', 'VN', 'NP', 'LK', 'KE', 'NG', 'EG', 'MA',
  ] as const
  readonly supportedPayoutMethods = ['gcash', 'maya', 'bank', 'cash_pickup'] as const

  constructor(private readonly config: RailsProviderConfig) {}

  async quote(input: RailsQuoteRequest): Promise<RailsQuote> {
    const midRate = input.sourceCurrency === 'USD' && input.destinationCurrency === 'PHP' ? 57.42 : 1
    const providerRate = midRate * 0.995
    return {
      providerName: 'Thunes',
      providerQuoteId: `thunes_stub_${Date.now()}`,
      sourceAmount: input.sourceAmount,
      destinationAmount: input.sourceAmount * providerRate - 0.75,
      midRate,
      providerRate,
      providerFee: 0.75,
      estimatedDeliveryMinutes: 5,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    }
  }

  async createBeneficiary(input: BeneficiaryInput): Promise<Beneficiary> {
    return {
      providerName: 'Thunes',
      providerBeneficiaryId: `thunes_ben_stub_${Date.now()}`,
      fullName: input.fullName,
      country: input.country,
      payoutMethod: input.payoutMethod,
      verified: false,
    }
  }

  async getBeneficiaryStatus(beneficiaryId: string): Promise<BeneficiaryStatus> {
    return { beneficiaryId, status: 'verified' }
  }

  async createCollection(input: CollectionRequest): Promise<Collection> {
    return {
      providerName: 'Thunes',
      providerCollectionId: `thunes_col_stub_${Date.now()}`,
      status: 'awaiting_authorization',
      authorizationUrl: `${this.config.baseUrl}/stub-authorization?idem=${input.idempotencyKey}`,
    }
  }

  async getCollectionStatus(collectionId: string): Promise<CollectionStatus> {
    return { collectionId, status: 'cleared', clearedAt: new Date() }
  }

  async createTransfer(_input: TransferRequest): Promise<TransferDraft> {
    return {
      providerName: 'Thunes',
      providerTransferId: `thunes_tx_stub_${Date.now()}`,
      status: 'processing',
    }
  }

  async getTransferStatus(transferId: string): Promise<TransferStatusResult> {
    return { transferId, status: 'delivered', deliveredAt: new Date() }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    return Boolean(signature) && Boolean(payload)
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    return {
      type: 'transfer.status',
      providerId: 'thunes',
      payload: JSON.parse(payload) as Record<string, unknown>,
      receivedAt: new Date(),
    }
  }
}

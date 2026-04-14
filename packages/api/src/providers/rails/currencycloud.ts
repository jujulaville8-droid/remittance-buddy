/**
 * Currencycloud (Visa-owned) — V2 backup rail.
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

export class CurrencycloudProvider implements RailsProvider {
  readonly name = 'Currencycloud'
  readonly slug = 'currencycloud'
  readonly supportedCountries = [
    'US', 'GB', 'EU', 'AU', 'CA', 'SG', 'HK', 'JP',
    'PH', 'IN', 'MY', 'TH',
  ] as const
  readonly supportedPayoutMethods = ['gcash', 'bank', 'cash_pickup'] as const

  constructor(private readonly config: RailsProviderConfig) {}

  async quote(input: RailsQuoteRequest): Promise<RailsQuote> {
    const midRate = input.sourceCurrency === 'USD' && input.destinationCurrency === 'PHP' ? 57.42 : 1
    const providerRate = midRate * 0.9952
    return {
      providerName: 'Currencycloud',
      providerQuoteId: `cc_stub_${Date.now()}`,
      sourceAmount: input.sourceAmount,
      destinationAmount: input.sourceAmount * providerRate - 0.7,
      midRate,
      providerRate,
      providerFee: 0.7,
      estimatedDeliveryMinutes: 10,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    }
  }

  async createBeneficiary(input: BeneficiaryInput): Promise<Beneficiary> {
    return {
      providerName: 'Currencycloud',
      providerBeneficiaryId: `cc_ben_stub_${Date.now()}`,
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
      providerName: 'Currencycloud',
      providerCollectionId: `cc_col_stub_${Date.now()}`,
      status: 'awaiting_authorization',
      authorizationUrl: `${this.config.baseUrl}/stub-authorization?idem=${input.idempotencyKey}`,
    }
  }

  async getCollectionStatus(collectionId: string): Promise<CollectionStatus> {
    return { collectionId, status: 'cleared', clearedAt: new Date() }
  }

  async createTransfer(_input: TransferRequest): Promise<TransferDraft> {
    return {
      providerName: 'Currencycloud',
      providerTransferId: `cc_tx_stub_${Date.now()}`,
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
      providerId: 'currencycloud',
      payload: JSON.parse(payload) as Record<string, unknown>,
      receivedAt: new Date(),
    }
  }
}

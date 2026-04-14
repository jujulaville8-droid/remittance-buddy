/**
 * NIUM rails provider — V2 primary rail for Remittance Buddy.
 *
 * This is a STUB. The actual NIUM API client will be built once sandbox
 * credentials arrive (projected week 1-2 of V2). The shape of every method
 * is in place so the transfer orchestration layer can be built against the
 * interface, with this stub returning placeholder responses during dev.
 *
 * NIUM docs: https://docs.nium.com/
 * API endpoints follow the pattern: POST /v1/transactions/quotes
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

export class NiumProvider implements RailsProvider {
  readonly name = 'NIUM'
  readonly slug = 'nium'
  readonly supportedCountries = [
    'US', 'GB', 'EU', 'SG', 'AU', 'CA', 'HK', 'JP', // senders
    'PH', 'IN', 'ID', 'VN', 'TH', 'MY', 'BD', 'PK', // recipients
  ] as const
  readonly supportedPayoutMethods = ['gcash', 'maya', 'bank', 'cash_pickup'] as const

  constructor(private readonly config: RailsProviderConfig) {}

  async quote(input: RailsQuoteRequest): Promise<RailsQuote> {
    this.requireSandboxOrProduction()
    // STUB: returns a synthetic quote for interface compatibility.
    // V2 replaces with: POST /v1/transactions/quotes
    const midRate = input.sourceCurrency === 'USD' && input.destinationCurrency === 'PHP' ? 57.42 : 1
    const providerRate = midRate * 0.9955 // NIUM tier-1 spread ~0.45%
    return {
      providerName: 'NIUM',
      providerQuoteId: `nium_stub_${Date.now()}`,
      sourceAmount: input.sourceAmount,
      destinationAmount: input.sourceAmount * providerRate - 0.6,
      midRate,
      providerRate,
      providerFee: 0.6, // $0.25 Pay-In + $0.35 Pay-Out
      estimatedDeliveryMinutes: 2,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    }
  }

  async createBeneficiary(input: BeneficiaryInput): Promise<Beneficiary> {
    // V2: POST /v1/beneficiaries
    return {
      providerName: 'NIUM',
      providerBeneficiaryId: `nium_ben_stub_${Date.now()}`,
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
    // V2: POST /v1/pay-in/collections
    return {
      providerName: 'NIUM',
      providerCollectionId: `nium_col_stub_${Date.now()}`,
      status: 'awaiting_authorization',
      authorizationUrl: `${this.config.baseUrl}/stub-authorization?idem=${input.idempotencyKey}`,
    }
  }

  async getCollectionStatus(collectionId: string): Promise<CollectionStatus> {
    return { collectionId, status: 'cleared', clearedAt: new Date() }
  }

  async createTransfer(_input: TransferRequest): Promise<TransferDraft> {
    // V2: POST /v1/transactions
    return {
      providerName: 'NIUM',
      providerTransferId: `nium_tx_stub_${Date.now()}`,
      status: 'processing',
      estimatedDeliveryAt: new Date(Date.now() + 2 * 60 * 1000),
    }
  }

  async getTransferStatus(transferId: string): Promise<TransferStatusResult> {
    return { transferId, status: 'delivered', deliveredAt: new Date() }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // V2: HMAC-SHA256 with config.webhookSecret
    return Boolean(signature) && Boolean(payload)
  }

  parseWebhookEvent(payload: string): WebhookEvent {
    const parsed = JSON.parse(payload) as { event_type: string; resource_id: string; data: Record<string, unknown> }
    return {
      type: 'transfer.status',
      providerId: parsed.resource_id ?? 'unknown',
      payload: parsed.data ?? {},
      receivedAt: new Date(),
    }
  }

  private requireSandboxOrProduction(): void {
    if (!this.config.apiKey) {
      throw new Error('NIUM: apiKey not configured. Set NIUM_API_KEY env var.')
    }
  }
}

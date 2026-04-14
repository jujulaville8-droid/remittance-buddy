/**
 * RailsProvider — the common interface every execution rail implements
 * (NIUM, Currencycloud, Thunes, Wise Platform, Bridge.xyz + Coins.ph).
 *
 * The rate-fetching layer in packages/api/src/rates/ is separate — those are
 * read-only quote fetchers for the comparison engine. This interface defines
 * the WRITE side: moving real money through a partner rail.
 *
 * V1 ships stubs only. V2 wires NIUM as the first real implementation once
 * sandbox credentials arrive. V3 adds Wise Platform and Bridge.xyz.
 */

// ────────────────────────────────────────────────────────────
// Common shapes
// ────────────────────────────────────────────────────────────

export type PayoutMethod = 'gcash' | 'maya' | 'bank' | 'cash_pickup'

export type TransferStatus =
  | 'draft'
  | 'awaiting_funding'
  | 'funded'
  | 'processing'
  | 'delivered'
  | 'failed'
  | 'cancelled'
  | 'refunded'

export interface RailsQuoteRequest {
  readonly senderCountry: string
  readonly sourceCurrency: string
  readonly sourceAmount: number
  readonly recipientCountry: string
  readonly destinationCurrency: string
  readonly payoutMethod: PayoutMethod
}

export interface RailsQuote {
  readonly providerName: string
  readonly providerQuoteId: string
  readonly sourceAmount: number
  readonly destinationAmount: number
  readonly midRate: number
  readonly providerRate: number
  readonly providerFee: number // in source currency
  readonly estimatedDeliveryMinutes: number
  readonly expiresAt: Date
}

export interface BeneficiaryInput {
  readonly fullName: string
  readonly country: string
  readonly payoutMethod: PayoutMethod
  readonly gcashNumber?: string
  readonly mayaNumber?: string
  readonly bankCode?: string
  readonly bankAccountNumber?: string
}

export interface Beneficiary {
  readonly providerName: string
  readonly providerBeneficiaryId: string
  readonly fullName: string
  readonly country: string
  readonly payoutMethod: PayoutMethod
  readonly verified: boolean
  readonly verifiedAt?: Date
}

export interface BeneficiaryStatus {
  readonly beneficiaryId: string
  readonly status: 'pending' | 'verified' | 'rejected'
  readonly reason?: string
}

export interface CollectionRequest {
  readonly quoteId: string
  readonly senderUserId: string
  readonly sourceAmount: number
  readonly sourceCurrency: string
  readonly fundingMethod: 'ach' | 'card' | 'sepa' | 'faster_payments' | 'wire'
  readonly idempotencyKey: string
  readonly returnUrl?: string
}

export interface Collection {
  readonly providerName: string
  readonly providerCollectionId: string
  readonly status: 'awaiting_authorization' | 'pending' | 'cleared' | 'failed' | 'returned'
  readonly authorizationUrl?: string
}

export interface CollectionStatus {
  readonly collectionId: string
  readonly status: Collection['status']
  readonly clearedAt?: Date
  readonly failureReason?: string
}

export interface TransferRequest {
  readonly quoteId: string
  readonly senderUserId: string
  readonly beneficiaryId: string
  readonly collectionId: string
  readonly idempotencyKey: string
}

export interface TransferDraft {
  readonly providerName: string
  readonly providerTransferId: string
  readonly status: TransferStatus
  readonly estimatedDeliveryAt?: Date
}

export interface TransferStatusResult {
  readonly transferId: string
  readonly status: TransferStatus
  readonly deliveredAt?: Date
  readonly failureReason?: string
  readonly providerReceiptUrl?: string
}

export interface WebhookEvent {
  readonly type:
    | 'transfer.status'
    | 'collection.status'
    | 'beneficiary.status'
    | 'compliance.flag'
  readonly providerId: string
  readonly payload: Record<string, unknown>
  readonly receivedAt: Date
}

// ────────────────────────────────────────────────────────────
// The interface every rails provider implements
// ────────────────────────────────────────────────────────────

export interface RailsProvider {
  readonly name: string
  readonly slug: string
  readonly supportedCountries: readonly string[]
  readonly supportedPayoutMethods: readonly PayoutMethod[]

  // Quote
  quote(input: RailsQuoteRequest): Promise<RailsQuote>

  // Beneficiaries
  createBeneficiary(input: BeneficiaryInput): Promise<Beneficiary>
  getBeneficiaryStatus(beneficiaryId: string): Promise<BeneficiaryStatus>

  // Pay-In (collect from sender)
  createCollection(input: CollectionRequest): Promise<Collection>
  getCollectionStatus(collectionId: string): Promise<CollectionStatus>

  // Pay-Out (send to recipient)
  createTransfer(input: TransferRequest): Promise<TransferDraft>
  getTransferStatus(transferId: string): Promise<TransferStatusResult>

  // Webhooks
  verifyWebhookSignature(payload: string, signature: string): boolean
  parseWebhookEvent(payload: string): WebhookEvent
}

// Provider configuration for a given deployment
export interface RailsProviderConfig {
  readonly apiKey: string
  readonly clientHashId?: string
  readonly baseUrl: string
  readonly webhookSecret: string
  readonly environment: 'sandbox' | 'production'
}

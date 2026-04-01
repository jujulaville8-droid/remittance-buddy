# Provider Research: Philippines Remittance Corridor

**Last Updated:** 2026-03-31
**Primary Corridor:** USD → PHP

---

## Tier 1 — Must Include (High Volume, High Relevance)

### Remitly
- **GCash Direct:** Yes (best integration)
- **Fees:** $0-3.99 (Express via debit often $0-1.99)
- **Speed:** Minutes (Express), 3-5 days (Economy)
- **Delivery:** Bank, cash pickup (Cebuana, M Lhuillier), GCash, Maya
- **API:** No public API. Affiliate/referral program.
- **Notes:** #1 digital player for US→PH. Heavily marketed to Filipinos.

### Western Union
- **GCash Direct:** Yes
- **Fees:** $5-10+, exchange markup 1-3%
- **Speed:** Minutes (cash pickup), 1-2 days (bank)
- **Delivery:** Cash pickup (50K+ PH locations), bank, GCash
- **API:** Partner API only (requires business agreement). Agent affiliate.
- **Notes:** Legacy leader. Unmatched brand recognition. Preferred by older generation.

### Wise (formerly TransferWire)
- **GCash Direct:** No (bank deposit only)
- **Fees:** $1.50-3.50 flat + mid-market rate (no markup). ~0.5-1% total.
- **Speed:** 1-2 business days
- **Delivery:** Bank deposit only
- **API:** Yes — public API with live quotes. Affiliate program.
- **Notes:** Cheapest for bank deposits. Only provider with open API for rate comparison. Popular with tech-savvy younger diaspora.

### MoneyGram
- **GCash Direct:** Yes
- **Fees:** $2-10, exchange markup 1-2%
- **Speed:** Minutes (cash pickup), 1-3 days (bank)
- **Delivery:** Cash pickup (SM, 7-Eleven, Cebuana, M Lhuillier), bank, GCash
- **API:** Partner API (requires business agreement). Agent affiliate.
- **Notes:** Strong PH presence. #2 traditional player behind WU.

### Xoom (PayPal)
- **GCash Direct:** Yes
- **Fees:** $0-4.99 (bank-funded often free), exchange markup 1-2%
- **Speed:** Minutes-hours (cash), 1-4 days (bank)
- **Delivery:** Bank, cash pickup (Cebuana, M Lhuillier, SM, BDO), GCash, door-to-door (LBC)
- **API:** No public API. PayPal affiliate may cover Xoom.
- **Notes:** Leverages PayPal ecosystem. Many Filipino-Americans already have PayPal.

### WorldRemit
- **GCash Direct:** Yes
- **Fees:** $1-4, exchange markup 0.5-1.5%
- **Speed:** Minutes (mobile wallet), 1-3 days (bank)
- **Delivery:** Bank, cash pickup, GCash, Maya
- **API:** No public API. Affiliate program available.
- **Notes:** Stronger in UK/EU→PH corridor. Growing in US→PH.

### Pangea Money Transfer
- **GCash Direct:** Yes
- **Fees:** $0-3.95, competitive rates
- **Speed:** Same day to 1-3 days
- **Delivery:** Bank, cash pickup, GCash
- **API:** No public API. Referral program.
- **Notes:** Targets US immigrant communities broadly. Growing PH presence.

---

## Tier 2 — Filipino-Specific Providers

### LBC Express
- **GCash Direct:** No
- **Fees:** $5-7, exchange markup ~1%
- **Speed:** Same day (cash), 1-3 days (door-to-door)
- **Delivery:** Cash pickup (LBC branches), door-to-door delivery, bank
- **API:** No
- **Notes:** Household name in PH. Unique door-to-door delivery. Physical US locations in Filipino neighborhoods (LA, SF, NYC, Vegas, Honolulu).

### Kabayan Remit
- **GCash Direct:** Yes
- **Fees:** $0-2 (promotional), competitive rates
- **Speed:** Same day to 1-2 days
- **Delivery:** Bank, cash pickup, GCash
- **API:** No
- **Notes:** Targets Filipino OFWs specifically. Niche but loyal base.

### iRemit
- **GCash Direct:** Indirect
- **Fees:** $3-5, exchange markup ~0.5-1%
- **Speed:** Same day to 1-2 days
- **Delivery:** Bank, cash pickup, door-to-door
- **API:** No
- **Notes:** Established PH remittance brand. Popular in Middle East, HK, Singapore corridors.

---

## Tier 3 — Bank-Based

### BDO Remit (Banco de Oro)
- **Fees:** $0-5 via partner corridors
- **Speed:** Same day to 2 days
- **Delivery:** Direct to BDO account, BDO branch pickup
- **Notes:** Largest PH bank. Popular for BDO account holders.

### BPI Direct
- **Fees:** $0-5 via partner corridors
- **Speed:** Same day to 2 days
- **Delivery:** Direct to BPI account, BPI branch pickup
- **Notes:** One of the oldest/most trusted PH banks.

### PNB Remittance
- **Fees:** $5-8
- **Speed:** Same day to 2 days
- **Delivery:** PNB account, cash pickup
- **Notes:** Physical US branches in Filipino population centers.

### US Bank Wires (Chase, BofA, Wells Fargo)
- **Fees:** $25-50 + intermediary fees ($15-25) + poor exchange rate
- **Speed:** 2-5 business days
- **Delivery:** Bank deposit only
- **Notes:** Most expensive option. Only for very large transfers.

---

## Tier 4 — Crypto-Based

### Coins.ph
- **Users:** 18M
- **Fees:** 0-1%
- **Speed:** Minutes (crypto), 1-2 days (bank cash-out)
- **Delivery:** Coins.ph wallet, bank, cash pickup. Can transfer to GCash via InstaPay.
- **API:** Yes (public)
- **Notes:** Best crypto-to-PHP bridge. Owned by Binance.

### Binance P2P
- **Fees:** 0% trading fee, spread varies
- **Speed:** Minutes
- **Delivery:** Via P2P sellers (GCash, bank, Maya)
- **Notes:** Requires crypto literacy. Growing but niche (<5% of remittance volume).

---

## Mobile Wallets (Payout Side — Not Senders)

| Wallet | Users | Role |
|--------|-------|------|
| **GCash** | 90M+ | THE dominant wallet. #1 delivery method. Must-support. |
| **Maya/PayMaya** | 50M+ | #2 wallet. Smart Padala (60K+ agents) for rural areas. |
| **Coins.ph** | 18M | Crypto bridge + peso wallet. |

---

## Cash Pickup Networks (Payout Partners)

| Network | Branches | Coverage |
|---------|----------|----------|
| **Cebuana Lhuillier** | 6,000+ | Nationwide, #1 padala network |
| **M Lhuillier** | 3,000+ | Strong in Visayas & Mindanao |
| **SM Malls** | 80+ | Metro Manila & major cities |
| **7-Eleven** | 3,000+ | Urban areas |
| **LBC** | 1,500+ | Nationwide + door-to-door |

---

## GCash Support Summary

**Supports GCash Direct:**
Remitly, Western Union, MoneyGram, Xoom, WorldRemit, Pangea, Kabayan Remit

**Does NOT support GCash Direct:**
Wise, OFX, LBC, iRemit, US bank wires

---

## API & Data Access Summary

| Provider | Public API | Affiliate | Rate Data Access |
|----------|:---------:|:---------:|-----------------|
| **Wise** | Yes | Yes | Live quotes via API |
| **Coins.ph** | Yes | Yes | Crypto/PHP rates via API |
| All others | No | Varies | Need partnerships or manual data |

---

## Market Context

- Philippines = 4th largest remittance recipient globally ($38-40B/year)
- US = 40% of total PH remittances (~$15-16B/year)
- Digital remittance growing 15-20% annually
- GCash has fundamentally shifted delivery preference from cash pickup to wallet
- As aggregator, no money transmission license required

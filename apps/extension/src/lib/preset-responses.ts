/**
 * Preset responses for common queries — no AI call needed.
 * Returns null if the query needs AI processing.
 */

const RATE_DATA = [
  { provider: 'Remitly', rate: 57.98, fee: 1.99, speed: 'Minutes', gcash: true },
  { provider: 'Wise', rate: 58.33, fee: 4.14, speed: '1-2 days', gcash: false },
  { provider: 'Xoom', rate: 57.57, fee: 0, speed: 'Hours', gcash: true },
  { provider: 'Western Union', rate: 56.99, fee: 5.00, speed: 'Minutes', gcash: true },
  { provider: 'MoneyGram', rate: 57.28, fee: 4.99, speed: 'Minutes', gcash: true },
  { provider: 'WorldRemit', rate: 57.75, fee: 2.99, speed: 'Minutes', gcash: true },
  { provider: 'Pangea', rate: 57.87, fee: 3.95, speed: 'Same day', gcash: true },
] as const;

const FAQ: Record<string, string> = {
  gcash: `GCash is the #1 e-wallet in the Philippines with 90M+ users. These providers support direct GCash deposit:\n\n• Remitly — Minutes, $1.99 fee\n• Xoom — Hours, FREE\n• Western Union — Minutes, $5.00 fee\n• MoneyGram — Minutes, $4.99 fee\n• WorldRemit — Minutes, $2.99 fee\n• Pangea — Same day, $3.95 fee\n\nWise does NOT support GCash (bank deposit only).`,

  documents: `To send money to the Philippines, you typically need:\n\n• Government-issued ID (driver's license, passport, or state ID)\n• For transfers over $3,000: proof of address may be required\n• First-time senders: may need to verify identity (takes 1-2 minutes)\n\nNo documents needed from the recipient — they just need a GCash account, bank account, or access to a cash pickup location.`,

  limits: `Transfer limits vary by provider:\n\n• Remitly — up to $2,999/transaction, $10,000/month\n• Wise — up to $1,000,000/transfer\n• Western Union — up to $5,000/transaction online\n• MoneyGram — up to $10,000/transaction\n• Xoom — up to $10,000/transaction\n\nLimits may increase after identity verification.`,

  cheapest: `The cheapest option depends on the amount, but generally:\n\n• For small amounts ($50-200): Xoom (zero fees)\n• For medium amounts ($200-1000): Remitly ($1.99) or Xoom (free)\n• For large amounts ($1000+): Wise (best exchange rate despite higher fee)\n\nXoom has zero fees but a slightly lower exchange rate. Wise has the best exchange rate but a $4.14 fee. For most people sending $200-500, Remitly or Xoom is the best deal.`,

  fastest: `Fastest options for sending to the Philippines:\n\n• Remitly Express — Minutes to GCash/Maya\n• Western Union — Minutes to GCash or cash pickup\n• MoneyGram — Minutes to GCash or cash pickup\n• WorldRemit — Minutes to GCash/Maya\n\nWise is the slowest at 1-2 business days (bank deposit only).`,

  cashpickup: `For cash pickup in the Philippines, your recipient can collect money at:\n\n• Cebuana Lhuillier — 6,000+ branches nationwide\n• M Lhuillier — 3,000+ branches (strong in Visayas & Mindanao)\n• SM Malls — 80+ locations\n• 7-Eleven — 3,000+ stores\n• LBC — 1,500+ branches\n\nProviders with cash pickup: Western Union, MoneyGram, Xoom, Remitly.`,

  maya: `Maya (formerly PayMaya) is the #2 e-wallet in the Philippines with 50M+ users. It also runs the Smart Padala network with 60,000+ agents (sari-sari stores) for cash pickup in rural areas.\n\nProviders that support Maya:\n• Remitly\n• WorldRemit\n• Xoom`,

  safe: `Yes, all providers we compare are licensed and regulated:\n\n• All are registered with FinCEN (US financial crimes enforcement)\n• All hold state money transmitter licenses\n• Your money is protected by consumer protection laws (Regulation E)\n• OFW remittances to the Philippines are tax-exempt under Philippine law\n\nWe only compare legitimate, licensed providers — never informal channels.`,

  hello: `Hey! I'm your Remittance Buddy. I help you find the cheapest and fastest way to send money to the Philippines.\n\nYou can ask me things like:\n• "Compare rates for $500"\n• "Which provider supports GCash?"\n• "What documents do I need?"\n• "What's the fastest way to send?"\n\nOr just tell me how much you want to send!`,

  hi: `Hey! I'm your Remittance Buddy. I help you find the cheapest and fastest way to send money to the Philippines.\n\nYou can ask me things like:\n• "Compare rates for $500"\n• "Which provider supports GCash?"\n• "What documents do I need?"\n• "What's the fastest way to send?"\n\nOr just tell me how much you want to send!`,
};

// Patterns to match user messages
const AMOUNT_PATTERN = /\$?\s*(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\s*(?:usd|dollars?|bucks)?/i;
const PHP_KEYWORDS = /phil|php|peso|pinas|pilipinas|manila|cebu|davao/i;
const GCASH_KEYWORDS = /gcash|g-cash|g cash/i;
const DOC_KEYWORDS = /document|id|require|need.*send|what.*need|passport|license/i;
const LIMIT_KEYWORDS = /limit|maximum|max|how much can/i;
const CHEAP_KEYWORDS = /cheap|best.*deal|lowest|save|murang|mura/i;
const FAST_KEYWORDS = /fast|quick|instant|urgent|rush|mabilis/i;
const CASH_KEYWORDS = /cash.*pick|pickup|padala|cebuana|lhuillier|collect/i;
const MAYA_KEYWORDS = /maya|paymaya|smart.*padala/i;
const SAFE_KEYWORDS = /safe|legit|trust|scam|legal|secure/i;
const GREETING_KEYWORDS = /^(hi|hello|hey|kumusta|musta|good\s*(morning|afternoon|evening))[\s!.?]*$/i;

function formatRateComparison(amount: number): string | null {
  const sorted = [...RATE_DATA]
    .map(p => ({
      ...p,
      receive: Math.round(amount * p.rate),
      totalCost: amount + p.fee,
    }))
    .sort((a, b) => a.totalCost - b.totalCost);

  const cheapest = sorted[0];
  const expensive = sorted[sorted.length - 1];
  if (!cheapest || !expensive) return null;
  const savings = (expensive.totalCost - cheapest.totalCost).toFixed(2);

  let response = `Here are the rates for sending $${amount.toLocaleString()} to the Philippines:\n\n`;

  for (const p of sorted) {
    const badge = p === cheapest ? ' ⭐ BEST DEAL' : '';
    const gcashTag = p.gcash ? ' (GCash)' : '';
    response += `• ${p.provider} — ₱${p.receive.toLocaleString()} | Fee: $${p.fee.toFixed(2)} | ${p.speed}${gcashTag}${badge}\n`;
  }

  response += `\nBest deal: ${cheapest.provider} — your recipient gets ₱${cheapest.receive.toLocaleString()} and you save $${savings} vs ${expensive.provider}.`;

  if (cheapest.gcash) {
    response += `\n\n${cheapest.provider} supports GCash, so the money arrives in minutes!`;
  }

  return response;
}

export function getPresetResponse(message: string): string | null {
  const text = message.trim().toLowerCase();

  // Greetings
  if (GREETING_KEYWORDS.test(text)) {
    return FAQ.hello ?? null;
  }

  // Rate comparison — detect amount + Philippines context
  const amountMatch = text.match(AMOUNT_PATTERN);
  if (amountMatch?.[1] && PHP_KEYWORDS.test(text)) {
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (amount > 0 && amount <= 100000) {
      return formatRateComparison(amount);
    }
  }

  // Just an amount with no country — assume Philippines
  if (amountMatch?.[1] && !text.includes('india') && !text.includes('mexico') && !text.includes('nigeria')) {
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    if (amount > 0 && amount <= 100000) {
      return formatRateComparison(amount);
    }
  }

  // FAQ matching
  if (GCASH_KEYWORDS.test(text)) return FAQ.gcash ?? null;
  if (DOC_KEYWORDS.test(text)) return FAQ.documents ?? null;
  if (LIMIT_KEYWORDS.test(text)) return FAQ.limits ?? null;
  if (CASH_KEYWORDS.test(text)) return FAQ.cashpickup ?? null;
  if (MAYA_KEYWORDS.test(text)) return FAQ.maya ?? null;
  if (SAFE_KEYWORDS.test(text)) return FAQ.safe ?? null;
  if (FAST_KEYWORDS.test(text)) return FAQ.fastest ?? null;
  if (CHEAP_KEYWORDS.test(text)) return FAQ.cheapest ?? null;

  // No preset match — needs AI
  return null;
}

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { CurrencySelect } from '../components/CurrencySelect';
import { RateCard } from '../components/RateCard';
import { TransferItem } from '../components/TransferItem';

interface Quote {
  readonly provider: string;
  readonly receiveAmount: number;
  readonly receiveCurrency: string;
  readonly exchangeRate: number;
  readonly fee: number;
  readonly deliveryTime: string;
  readonly affiliateUrl: string;
}

export function App() {
  const [sendCurrency, setSendCurrency] = useState('USD');
  const [receiveCurrency, setReceiveCurrency] = useState('PHP');
  const [amount, setAmount] = useState('500');
  const [quotes, setQuotes] = useState<readonly Quote[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleCheck() {
    setLoading(true);
    try {
      setQuotes([
        {
          provider: 'Wise',
          receiveAmount: Number(amount) * 58.32,
          receiveCurrency,
          exchangeRate: 58.32,
          fee: 4.50,
          deliveryTime: 'Instant',
          affiliateUrl: '#',
        },
        {
          provider: 'Remitly',
          receiveAmount: Number(amount) * 57.98,
          receiveCurrency,
          exchangeRate: 57.98,
          fee: 3.99,
          deliveryTime: '1-2 hours',
          affiliateUrl: '#',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function openSidePanel() {
    chrome.windows.getCurrent((window) => {
      if (window.id) {
        chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', windowId: window.id });
      }
    });
  }

  return (
    <div className="flex flex-col p-4 bg-[hsl(var(--background))] overflow-y-auto" style={{ maxHeight: '520px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h1 className="text-base font-bold text-[hsl(var(--foreground))]">Remittance Buddy</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Find the best rate in seconds</p>
        </div>
      </div>

      {/* Rate Check Card */}
      <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-[hsl(var(--border))] mb-3">
        <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-2.5">Compare Rates</h2>
        <div className="space-y-2">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <CurrencySelect label="You send" value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value)} />
            </div>
            <div className="flex items-center justify-center w-8 h-10 rounded-full bg-[hsl(var(--muted))]">
              <ArrowRight className="h-3.5 w-3.5 text-[hsl(var(--muted-foreground))]" />
            </div>
            <div className="flex-1">
              <CurrencySelect label="They receive" value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              min="1"
            />
            <Button onClick={handleCheck} disabled={loading || !amount}>
              {loading ? '...' : 'Compare'}
            </Button>
          </div>
        </div>
      </div>

      {/* Quotes */}
      {quotes.length > 0 && (
        <div className="space-y-2 mb-3 max-h-[200px] overflow-y-auto">
          {quotes.map((quote) => (
            <RateCard
              key={quote.provider}
              {...quote}
              isCheapest={quote.provider === quotes.at(0)?.provider}
            />
          ))}
        </div>
      )}

      {/* Recent Transfers */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-[hsl(var(--border))] mb-3">
        <h2 className="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-wide mb-1.5 px-1">Recent</h2>
        <TransferItem amount={200} currency="USD" receiveCurrency="PHP" status="completed" date="Mar 28" />
        <TransferItem amount={500} currency="USD" receiveCurrency="INR" status="pending" date="Mar 30" />
      </div>

      {/* Chat CTA */}
      <Button variant="secondary" onClick={openSidePanel} className="w-full gap-2">
        <Sparkles className="h-4 w-4 text-[hsl(var(--accent))]" />
        Chat with AI assistant
      </Button>
    </div>
  );
}

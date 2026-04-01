import { useState } from 'react';
import { ArrowRight, MessageSquare } from 'lucide-react';
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
    <div className="flex flex-col h-full p-4">
      <h2 className="text-sm font-semibold mb-3">Quick Rate Check</h2>
      <div className="space-y-2 mb-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <CurrencySelect label="Send" value={sendCurrency} onChange={(e) => setSendCurrency(e.target.value)} />
          </div>
          <ArrowRight className="h-4 w-4 mb-2.5 text-[hsl(var(--muted-foreground))] shrink-0" />
          <div className="flex-1">
            <CurrencySelect label="Receive" value={receiveCurrency} onChange={(e) => setReceiveCurrency(e.target.value)} />
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

      {quotes.length > 0 && (
        <div className="space-y-2 mb-4 max-h-[200px] overflow-y-auto">
          {quotes.map((quote) => (
            <RateCard
              key={quote.provider}
              {...quote}
              isCheapest={quote.provider === quotes.at(0)?.provider}
            />
          ))}
        </div>
      )}

      <div className="border-t border-[hsl(var(--border))] my-3" />

      <h2 className="text-sm font-semibold mb-2">Recent Transfers</h2>
      <div className="flex-1 overflow-y-auto">
        <TransferItem amount={200} currency="USD" receiveCurrency="PHP" status="completed" date="Mar 28" />
        <TransferItem amount={500} currency="USD" receiveCurrency="INR" status="pending" date="Mar 30" />
      </div>

      <Button variant="secondary" onClick={openSidePanel} className="w-full mt-3">
        <MessageSquare className="h-4 w-4 mr-2" />
        Open AI Chat
      </Button>
    </div>
  );
}

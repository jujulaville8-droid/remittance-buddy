import { Button } from '../components/ui/button';
import { getOAuthUrl } from '../lib/auth';
import { Heart, Globe, Zap } from 'lucide-react';

export function OnboardingView() {
  function handleSignIn() {
    chrome.tabs.create({ url: getOAuthUrl() });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center bg-[hsl(var(--background))]">
      <div className="text-5xl mb-5">💸</div>
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">Remittance Buddy</h1>
      <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8 max-w-[280px] leading-relaxed">
        The easiest way to compare rates and send money home. We find the best deal for you.
      </p>

      <div className="w-full max-w-[280px] space-y-3 mb-8">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-full bg-[hsl(var(--accent-light))]">
            <Globe className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">Compare Wise, Remitly, WU & more</span>
        </div>
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-full bg-[hsl(var(--success-light))]">
            <Zap className="h-4 w-4 text-[hsl(var(--success))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">Find the cheapest & fastest option</span>
        </div>
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-full bg-[hsl(var(--warning-light))]">
            <Heart className="h-4 w-4 text-[hsl(var(--warning))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">Free to use, always</span>
        </div>
      </div>

      <Button onClick={handleSignIn} size="lg" className="w-full max-w-[280px]">
        Get started
      </Button>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
        No fees. We earn a small commission from providers.
      </p>
    </div>
  );
}

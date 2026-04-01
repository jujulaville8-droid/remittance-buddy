import { Button } from '../components/ui/button';
import { getOAuthUrl } from '../lib/auth';

export function OnboardingView() {
  function handleSignIn() {
    chrome.tabs.create({ url: getOAuthUrl() });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center">
      <div className="text-4xl mb-4">💸</div>
      <h1 className="text-xl font-semibold mb-2">Remittance Buddy</h1>
      <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6 max-w-[280px]">
        Compare rates across Wise, Remitly, Western Union and more. Find the cheapest way to send money home.
      </p>
      <Button onClick={handleSignIn} size="lg" className="w-full max-w-[280px]">
        Sign in to get started
      </Button>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
        Free to use. We earn a small commission from providers.
      </p>
    </div>
  );
}

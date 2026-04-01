import { Button } from '../components/ui/button';
import { LanguageToggle } from '../components/LanguageToggle';
import { getOAuthUrl } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { Heart, Globe, Zap } from 'lucide-react';

export function OnboardingView() {
  const { t } = useI18n();

  function handleSignIn() {
    chrome.tabs.create({ url: getOAuthUrl() });
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen px-6 text-center bg-[hsl(var(--background))]">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      <div className="w-16 h-16 rounded-full bg-[hsl(var(--accent))] flex items-center justify-center mb-5">
        <Globe className="h-8 w-8 text-white" />
      </div>
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-2">{t('appName')}</h1>
      <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8 max-w-[280px] leading-relaxed">
        {t('onboardingDescription')}
      </p>

      <div className="w-full max-w-[280px] space-y-3 mb-8">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-full bg-[hsl(var(--accent-light))]">
            <Globe className="h-4 w-4 text-[hsl(var(--accent))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{t('onboardingFeature1')}</span>
        </div>
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-full bg-[hsl(var(--success-light))]">
            <Zap className="h-4 w-4 text-[hsl(var(--success))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{t('onboardingFeature2')}</span>
        </div>
        <div className="flex items-center gap-3 text-left">
          <div className="p-2 rounded-full bg-[hsl(var(--warning-light))]">
            <Heart className="h-4 w-4 text-[hsl(var(--warning))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{t('onboardingFeature3')}</span>
        </div>
      </div>

      <Button onClick={handleSignIn} size="lg" className="w-full max-w-[280px]">
        {t('getStarted')}
      </Button>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3">
        {t('noFees')}
      </p>
    </div>
  );
}

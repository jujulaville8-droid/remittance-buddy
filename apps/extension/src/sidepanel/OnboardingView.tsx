import { Button } from '../components/ui/button';
import { LanguageToggle } from '../components/LanguageToggle';
import { getOAuthUrl } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { Heart, Globe, Zap } from 'lucide-react';
import { PaperAirplane, SparklesBurst, WavyLine } from '../components/Doodles';

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

      <div className="relative mb-5">
        <PaperAirplane className="w-20 h-20 text-[hsl(var(--accent))] -rotate-12" />
        <SparklesBurst className="w-6 h-6 text-[hsl(var(--warning))] absolute -top-1 -right-2" />
      </div>
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1">{t('appName')}</h1>
      <WavyLine className="w-32 text-[hsl(var(--accent))] mb-2" />
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

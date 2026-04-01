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
    <div className="relative flex flex-col items-center justify-center h-screen px-6 text-center bg-[hsl(var(--background))] overflow-hidden">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>

      {/* Decorative background doodles */}
      <SparklesBurst className="absolute top-12 left-6 w-6 h-6 text-[hsl(var(--gold))] opacity-30" />
      <SparklesBurst className="absolute bottom-20 right-8 w-5 h-5 text-[hsl(var(--teal))] opacity-20" />

      <div className="relative mb-3 animate-fade-up">
        <PaperAirplane className="w-52 h-32 text-[hsl(var(--coral))]" />
      </div>

      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1 animate-fade-up" style={{ animationDelay: '80ms' }}>{t('appName')}</h1>
      <WavyLine className="w-28 text-[hsl(var(--coral))] mb-3 animate-fade-up" style={{ animationDelay: '120ms' }} />
      <p className="text-[hsl(var(--muted-foreground))] text-sm mb-8 max-w-[280px] leading-relaxed animate-fade-up" style={{ animationDelay: '160ms' }}>
        {t('onboardingDescription')}
      </p>

      <div className="w-full max-w-[280px] space-y-3 mb-8 stagger-children">
        <div className="flex items-center gap-3 text-left bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border border-[hsl(var(--border))]">
          <div className="p-2 rounded-xl bg-[hsl(var(--coral-light))]">
            <Globe className="h-4 w-4 text-[hsl(var(--coral))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{t('onboardingFeature1')}</span>
        </div>
        <div className="flex items-center gap-3 text-left bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border border-[hsl(var(--border))]">
          <div className="p-2 rounded-xl bg-[hsl(var(--teal-light))]">
            <Zap className="h-4 w-4 text-[hsl(var(--teal))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{t('onboardingFeature2')}</span>
        </div>
        <div className="flex items-center gap-3 text-left bg-white rounded-2xl px-3.5 py-2.5 shadow-sm border border-[hsl(var(--border))]">
          <div className="p-2 rounded-xl bg-[hsl(var(--gold-light))]">
            <Heart className="h-4 w-4 text-[hsl(var(--gold))]" />
          </div>
          <span className="text-sm text-[hsl(var(--foreground))]">{t('onboardingFeature3')}</span>
        </div>
      </div>

      <Button onClick={handleSignIn} size="lg" className="w-full max-w-[280px] animate-fade-up" style={{ animationDelay: '400ms' }}>
        {t('getStarted')}
      </Button>
      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-3 animate-fade-up" style={{ animationDelay: '450ms' }}>
        {t('noFees')}
      </p>
    </div>
  );
}

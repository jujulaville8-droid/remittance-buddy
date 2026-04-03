import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { signIn, signUp } from '../lib/auth';
import { useI18n } from '../lib/i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import { ProviderLogo } from '../components/ProviderLogo';
import logo from '../assets/logo.png';

const PROVIDER_NAMES = ['Remitly', 'Wise', 'Western Union', 'Xoom', 'MoneyGram'] as const;

export function OnboardingView({ onAuth }: { readonly onAuth: () => void }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password, fullName || undefined);
      }
      onAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-[hsl(var(--background))]">
      {/* Top bar */}
      <div className="flex justify-end px-4 pt-3">
        <LanguageToggle />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <img src={logo} alt="Remittance Buddy" className="w-16 h-16 mb-3 animate-fade-up" />
        <h1 className="text-xl font-bold font-display text-[hsl(var(--foreground))] mb-1 animate-fade-up" style={{ animationDelay: '60ms' }}>{t('appName')}</h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-5 max-w-[280px] leading-relaxed animate-fade-up" style={{ animationDelay: '120ms' }}>
          {t('onboardingDescription')}
        </p>

        {/* Provider logos — trust signal */}
        <div className="flex items-center gap-2 mb-6 animate-fade-up" style={{ animationDelay: '160ms' }}>
          <span className="text-[9px] text-[hsl(var(--muted-foreground))] font-medium mr-1">{t('weCompare')}</span>
          {PROVIDER_NAMES.map((name) => (
            <ProviderLogo key={name} provider={name} size="sm" />
          ))}
          <span className="text-[9px] text-[hsl(var(--muted-foreground))]">{t('plusMore')}</span>
        </div>

        {/* Auth form */}
        <div className="w-full max-w-[280px] space-y-2.5 animate-fade-up" style={{ animationDelay: '200ms' }}>
          {mode === 'signup' && (
            <Input
              type="text"
              placeholder={t('fullName')}
              aria-label={t('fullName')}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          )}
          <Input
            type="email"
            placeholder={t('emailPlaceholder')}
            aria-label={t('emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder={t('passwordPlaceholder')}
            aria-label={t('passwordPlaceholder')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          />

          {error && (
            <p className="text-xs text-red-500 text-left" role="alert">{error}</p>
          )}

          <Button onClick={handleSubmit} disabled={loading || !email || !password} size="lg" className="w-full">
            {loading ? '...' : mode === 'signin' ? t('signIn') : t('createAccount')}
          </Button>

          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
            className="text-xs text-[hsl(var(--coral))] hover:underline"
          >
            {mode === 'signin' ? t('noAccount') : t('hasAccount')}
          </button>
        </div>

        {/* Trust footer */}
        <div className="mt-5 animate-fade-up" style={{ animationDelay: '250ms' }}>
          <div className="flex items-center justify-center gap-1 mb-1">
            <div className="flex -space-x-1">
              {['bg-blue-400', 'bg-teal-400', 'bg-amber-400'].map((c, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-full ${c} border-2 border-[hsl(var(--background))]`} />
              ))}
            </div>
            <span className="text-[9px] text-[hsl(var(--muted-foreground))]">{t('usersThisMonth')}</span>
          </div>
          <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{t('noFees')}</p>
        </div>
      </div>
    </div>
  );
}

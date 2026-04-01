import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { signIn, signUp } from '../lib/auth';
import { useI18n } from '../lib/i18n';
// Icons available for future feature list

import { SparklesBurst, WavyLine } from '../components/Doodles';
import logo from '../assets/logo.png';

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
    <div className="relative flex flex-col items-center justify-center h-screen px-6 text-center bg-[hsl(var(--background))] overflow-hidden">
      {/* Decorative */}
      <SparklesBurst className="absolute top-12 left-6 w-6 h-6 text-[hsl(var(--gold))] opacity-30" />
      <SparklesBurst className="absolute bottom-20 right-8 w-5 h-5 text-[hsl(var(--teal))] opacity-20" />

      <img src={logo} alt="Remittance Buddy" className="w-20 h-20 mb-3 animate-fade-up" />
      <h1 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-1 animate-fade-up" style={{ animationDelay: '80ms' }}>{t('appName')}</h1>
      <WavyLine className="w-28 text-[hsl(var(--coral))] mb-3 animate-fade-up" style={{ animationDelay: '120ms' }} />
      <p className="text-[hsl(var(--muted-foreground))] text-sm mb-6 max-w-[280px] leading-relaxed animate-fade-up" style={{ animationDelay: '160ms' }}>
        {t('onboardingDescription')}
      </p>

      {/* Auth form */}
      <div className="w-full max-w-[280px] space-y-3 animate-fade-up" style={{ animationDelay: '200ms' }}>
        {mode === 'signup' && (
          <Input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
        />

        {error && (
          <p className="text-xs text-red-500 text-left">{error}</p>
        )}

        <Button onClick={handleSubmit} disabled={loading || !email || !password} size="lg" className="w-full">
          {loading ? '...' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
          className="text-xs text-[hsl(var(--coral))] hover:underline"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-4">
        {t('noFees')}
      </p>
    </div>
  );
}

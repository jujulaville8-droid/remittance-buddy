import { useState, useEffect, useCallback } from 'react';
import { ChatView } from './ChatView';
import { OnboardingView } from './OnboardingView';
import { isAuthenticated } from '../lib/auth';

export function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  const checkAuth = useCallback(() => {
    isAuthenticated().then(setAuthed);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))]">
        <div className="h-6 w-6 border-2 border-[hsl(var(--coral))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return authed ? <ChatView onSignOut={checkAuth} /> : <OnboardingView onAuth={checkAuth} />;
}

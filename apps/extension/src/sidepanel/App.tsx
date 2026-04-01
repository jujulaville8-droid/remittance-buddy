import { useState, useEffect } from 'react';
import { ChatView } from './ChatView';
import { OnboardingView } from './OnboardingView';
import { isAuthenticated } from '../lib/auth';

export function App() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    isAuthenticated().then(setAuthed);

    const listener = (message: { type: string }) => {
      if (message.type === 'AUTH_STATE_CHANGED') {
        isAuthenticated().then(setAuthed);
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (authed === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-[hsl(var(--background))]">
        <div className="h-6 w-6 border-2 border-[hsl(var(--coral))] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return authed ? <ChatView /> : <OnboardingView />;
}

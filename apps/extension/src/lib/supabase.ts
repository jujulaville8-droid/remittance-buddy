import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://jrthcnggvzbzidmzepqc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpydGhjbmdndnpiemlkbXplcHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMjA3NjksImV4cCI6MjA5MDU5Njc2OX0.VONdxeWI0GtxE-U39XnLAAJsdb5PqiHIVOYKviqXgD4';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'remit-buddy-auth',
    storage: {
      getItem: async (key: string) => {
        const result = await chrome.storage.local.get(key);
        return result[key] ?? null;
      },
      setItem: async (key: string, value: string) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key: string) => {
        await chrome.storage.local.remove(key);
      },
    },
  },
});

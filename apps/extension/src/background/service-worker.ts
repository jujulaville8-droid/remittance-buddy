import { isAuthenticated, getAccessToken } from '../lib/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://remittancebuddy.com';

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'OPEN_SIDE_PANEL') {
    chrome.sidePanel.open({ windowId: message.windowId }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'CHECK_AUTH') {
    isAuthenticated().then((authenticated) => {
      sendResponse({ authenticated });
    });
    return true;
  }
});

chrome.alarms.create('refresh-rates', { periodInMinutes: 30 });
chrome.alarms.create('sync-affiliate-clicks', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'refresh-rates') {
    refreshCachedRates();
  }
  if (alarm.name === 'sync-affiliate-clicks') {
    syncAffiliateClicks();
  }
});

/**
 * Fetch the latest rates for the user's default corridor and cache them.
 * The popup reads from chrome.storage.local on open so it starts with fresh data.
 */
async function refreshCachedRates() {
  try {
    const authed = await isAuthenticated();
    if (!authed) return;

    // Read the user's last-used amount, default to $500
    const stored = await chrome.storage.local.get(['lastAmount', 'cachedRates']);
    const amount = stored.lastAmount ?? 500;

    const token = await getAccessToken();
    if (!token) return;

    const res = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [
          {
            id: `rate-refresh-${Date.now()}`,
            role: 'user',
            content: `Compare rates for $${amount}`,
          },
        ],
      }),
    });

    if (res.ok) {
      await chrome.storage.local.set({
        cachedRatesUpdatedAt: Date.now(),
      });
    }
  } catch {
    // Silent failure — rates will refresh on next popup open
  }
}

/**
 * Sync locally stored affiliate clicks to the server for analytics.
 */
async function syncAffiliateClicks() {
  try {
    const stored = await chrome.storage.local.get('affiliate_clicks');
    const clicks: Array<{
      provider: string;
      network?: string;
      context: string;
      timestamp: number;
    }> = stored.affiliate_clicks ?? [];

    if (clicks.length === 0) return;

    const token = await getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const payload = clicks.map((c) => ({
      provider: c.provider,
      network: c.network,
      context: c.context as 'popup' | 'chat' | 'comparison',
      corridor: 'USD-PHP',
    }));

    const res = await fetch(`${API_BASE}/api/affiliate/track`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ clicks: payload }),
    });

    if (res.ok) {
      // Clear synced clicks
      await chrome.storage.local.set({ affiliate_clicks: [] });
    }
  } catch {
    // Will retry on next alarm
  }
}

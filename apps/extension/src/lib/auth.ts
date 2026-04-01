import { API_BASE_URL, STORAGE_KEYS } from './constants';
import { getSessionValue, setSessionValue, getLocalValue, setLocalValue, clearAuth } from './storage';

interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

interface UserProfile {
  readonly id: string;
  readonly email: string;
  readonly fullName: string | null;
}

export async function getAccessToken(): Promise<string | null> {
  const token = await getSessionValue<string>(STORAGE_KEYS.AUTH_TOKEN);
  if (token) return token;

  const refreshToken = await getLocalValue<string>(STORAGE_KEYS.REFRESH_TOKEN);
  if (!refreshToken) return null;

  try {
    const refreshed = await refreshAccessToken(refreshToken);
    await setSessionValue(STORAGE_KEYS.AUTH_TOKEN, refreshed.accessToken);
    await setLocalValue(STORAGE_KEYS.REFRESH_TOKEN, refreshed.refreshToken);
    return refreshed.accessToken;
  } catch {
    await clearAuth();
    return null;
  }
}

export async function handleAuthCallback(tokens: AuthTokens, profile: UserProfile): Promise<void> {
  await setSessionValue(STORAGE_KEYS.AUTH_TOKEN, tokens.accessToken);
  await setLocalValue(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
  await setLocalValue(STORAGE_KEYS.USER_PROFILE, profile);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return token !== null;
}

export async function getUserProfile(): Promise<UserProfile | null> {
  return getLocalValue<UserProfile>(STORAGE_KEYS.USER_PROFILE);
}

async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) throw new Error('Token refresh failed');
  return response.json() as Promise<AuthTokens>;
}

export function getOAuthUrl(): string {
  const redirectUrl = chrome.identity.getRedirectURL('callback');
  return `${API_BASE_URL}/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}&source=extension`;
}

export { clearAuth };

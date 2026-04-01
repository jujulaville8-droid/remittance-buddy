import { STORAGE_KEYS } from './constants';

export async function getSessionValue<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.session.get(key);
  return (result[key] as T) ?? null;
}

export async function setSessionValue<T>(key: string, value: T): Promise<void> {
  await chrome.storage.session.set({ [key]: value });
}

export async function getLocalValue<T>(key: string): Promise<T | null> {
  const result = await chrome.storage.local.get(key);
  return (result[key] as T) ?? null;
}

export async function setLocalValue<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function clearAuth(): Promise<void> {
  await chrome.storage.session.remove(STORAGE_KEYS.AUTH_TOKEN);
  await chrome.storage.local.remove(STORAGE_KEYS.REFRESH_TOKEN);
  await chrome.storage.local.remove(STORAGE_KEYS.USER_PROFILE);
}

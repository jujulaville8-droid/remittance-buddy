import { API_BASE_URL } from './constants';
import { getAccessToken } from './auth';

interface ApiOptions {
  readonly method?: string;
  readonly body?: unknown;
  readonly headers?: Record<string, string>;
}

export async function apiClient<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const token = await getAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((error as { message: string }).message);
  }

  return response.json() as Promise<T>;
}

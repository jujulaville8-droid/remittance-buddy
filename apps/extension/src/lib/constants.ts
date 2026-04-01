export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'remit_auth_token',
  REFRESH_TOKEN: 'remit_refresh_token',
  USER_PROFILE: 'remit_user_profile',
  ONBOARDING_COMPLETE: 'remit_onboarding_complete',
} as const;

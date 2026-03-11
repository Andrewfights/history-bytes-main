/**
 * API Key Storage Utility
 * Securely stores user API keys in localStorage
 */

const API_KEYS_STORAGE_KEY = 'hb_api_keys';

export interface StoredApiKeys {
  gemini?: string;
  elevenlabs?: string;
  openai?: string;
}

/**
 * Get all stored API keys
 */
export function getStoredApiKeys(): StoredApiKeys {
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load API keys:', error);
  }
  return {};
}

/**
 * Save an API key
 */
export function saveApiKey(service: keyof StoredApiKeys, key: string): void {
  try {
    const current = getStoredApiKeys();
    const updated = { ...current, [service]: key };
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

/**
 * Remove an API key
 */
export function removeApiKey(service: keyof StoredApiKeys): void {
  try {
    const current = getStoredApiKeys();
    delete current[service];
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(current));
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
}

/**
 * Get a specific API key (user-provided or fallback to env var)
 */
export function getApiKey(service: keyof StoredApiKeys): string | undefined {
  const stored = getStoredApiKeys();

  // User-provided key takes priority
  if (stored[service]) {
    return stored[service];
  }

  // Fallback to environment variables
  switch (service) {
    case 'gemini':
      return import.meta.env.VITE_GEMINI_API_KEY;
    case 'elevenlabs':
      return import.meta.env.VITE_ELEVENLABS_API_KEY;
    case 'openai':
      return import.meta.env.VITE_OPENAI_API_KEY;
    default:
      return undefined;
  }
}

/**
 * Check if a service has an API key configured (user or env)
 */
export function hasApiKey(service: keyof StoredApiKeys): boolean {
  return !!getApiKey(service);
}

/**
 * Check if using user-provided key vs env var
 */
export function isUsingUserKey(service: keyof StoredApiKeys): boolean {
  const stored = getStoredApiKeys();
  return !!stored[service];
}

/**
 * Mask an API key for display (show first 4 and last 4 chars)
 */
export function maskApiKey(key: string): string {
  if (key.length <= 8) {
    return '••••••••';
  }
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

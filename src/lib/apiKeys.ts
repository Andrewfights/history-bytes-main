/**
 * API Key Storage Utility
 * Stores user API keys in both localStorage (for quick access) and Firestore (for persistence)
 */

import { saveUserApiKey, getUserApiKeys, type StoredApiKeys as FirestoreStoredApiKeys } from './firestore';
import { isFirebaseConfigured, auth } from './firebase';

const API_KEYS_STORAGE_KEY = 'hb_api_keys';
const AUTH_STORAGE_KEY = 'hb:auth';

export interface StoredApiKeys {
  gemini?: string;
  elevenlabs?: string;
  openai?: string;
}

/**
 * Get current user ID from Firebase auth or localStorage
 */
function getCurrentUserId(): string | null {
  try {
    // First try Firebase auth
    if (isFirebaseConfigured() && auth?.currentUser) {
      return auth.currentUser.uid;
    }
    // Fall back to localStorage auth state
    const authStr = localStorage.getItem(AUTH_STORAGE_KEY);
    if (authStr) {
      const authState = JSON.parse(authStr);
      return authState?.userId || null;
    }
  } catch {
    // Ignore errors
  }
  return null;
}

/**
 * Get all stored API keys from localStorage
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
 * Save an API key to both localStorage and Firestore
 */
export async function saveApiKey(service: keyof StoredApiKeys, key: string): Promise<void> {
  try {
    // Save to localStorage for quick access
    const current = getStoredApiKeys();
    const updated = { ...current, [service]: key };
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(updated));

    // Save to Firestore for persistence across devices/sessions
    const userId = getCurrentUserId();
    if (userId) {
      await saveUserApiKey(userId, service, key);
      console.log(`[API Keys] Saved ${service} key to Firestore`);
    }
  } catch (error) {
    console.error('Failed to save API key:', error);
  }
}

/**
 * Remove an API key from both localStorage and Firestore
 */
export async function removeApiKey(service: keyof StoredApiKeys): Promise<void> {
  try {
    // Remove from localStorage
    const current = getStoredApiKeys();
    delete current[service];
    localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(current));

    // Remove from Firestore
    const userId = getCurrentUserId();
    if (userId) {
      await saveUserApiKey(userId, service, null);
      console.log(`[API Keys] Removed ${service} key from Firestore`);
    }
  } catch (error) {
    console.error('Failed to remove API key:', error);
  }
}

/**
 * Sync API keys from Firestore to localStorage (call on login)
 */
export async function syncApiKeysFromFirestore(userId: string): Promise<void> {
  try {
    const firestoreKeys = await getUserApiKeys(userId);
    if (firestoreKeys) {
      // Merge Firestore keys into localStorage (Firestore takes priority)
      const localKeys = getStoredApiKeys();
      const merged = { ...localKeys, ...firestoreKeys };
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(merged));
      console.log('[API Keys] Synced keys from Firestore');
    }
  } catch (error) {
    console.error('Failed to sync API keys from Firestore:', error);
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

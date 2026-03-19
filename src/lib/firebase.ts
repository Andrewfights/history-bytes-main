/**
 * Firebase Configuration and Initialization
 * Provides Firebase Auth, Firestore, and Storage services
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.apiKey !== 'undefined' &&
    firebaseConfig.projectId !== 'undefined' &&
    !firebaseConfig.apiKey.includes('your-') &&
    !firebaseConfig.apiKey.includes('placeholder')
  );
}

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
export const auth = getAuth(app);

// Initialize Firestore with persistent cache and multi-tab support
// This replaces the deprecated enableIndexedDbPersistence() method
export const db = (() => {
  if (getApps().length > 0) {
    try {
      // Try to get existing Firestore instance first
      return getFirestore(app);
    } catch {
      // If not initialized yet, initialize with settings
    }
  }

  if (isFirebaseConfigured()) {
    try {
      return initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager()
        })
      });
    } catch (err) {
      // Firestore may already be initialized, get existing instance
      console.warn('[Firebase] Using existing Firestore instance');
      return getFirestore(app);
    }
  }

  return getFirestore(app);
})();

export const storage = getStorage(app);

// Connect to emulators in development (if configured)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    console.log('[Firebase] Connected to emulators');
  } catch (err) {
    // Emulators may already be connected
    console.warn('[Firebase] Emulator connection failed:', err);
  }
}

// Log configuration status
if (isFirebaseConfigured()) {
  console.log('[Firebase] Initialized with project:', firebaseConfig.projectId);
} else {
  console.log('[Firebase] Not configured - running in local-only mode');
}

export default app;

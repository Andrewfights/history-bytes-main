/**
 * Firebase Configuration and Initialization
 * Provides Firebase Auth, Firestore, and Storage services
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
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
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
if (isFirebaseConfigured()) {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('[Firebase] Offline persistence unavailable: multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.warn('[Firebase] Offline persistence unavailable: browser not supported');
    }
  });
}

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

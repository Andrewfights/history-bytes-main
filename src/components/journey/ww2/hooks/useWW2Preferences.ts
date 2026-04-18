/**
 * useWW2Preferences - Hook to persist WW2 host selection across sessions
 * Now syncs with Firestore when user is logged in
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { UserWW2Preferences } from '@/types';

const WW2_PREFERENCES_KEY = 'hb_ww2_preferences';
const FIRESTORE_COLLECTION = 'userProgress';

const DEFAULT_PREFERENCES: UserWW2Preferences = {
  selectedHostId: null,
  lastVisitDate: '',
  hasSeenIntro: false,
  hasSeenWelcomeVideo: false,
};

export function useWW2Preferences() {
  const { user, isConfigured: isAuthConfigured } = useAuth();
  const [preferences, setPreferences] = useState<UserWW2Preferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasLoadedFromFirestore = useRef(false);

  // Load preferences on mount and when user changes
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);

      try {
        // First, load from localStorage (always available)
        let localPrefs = DEFAULT_PREFERENCES;
        const stored = localStorage.getItem(WW2_PREFERENCES_KEY);
        if (stored) {
          localPrefs = JSON.parse(stored) as UserWW2Preferences;
        }

        // If user is logged in and Firebase is configured, try to load from Firestore
        if (user && isFirebaseConfigured() && !hasLoadedFromFirestore.current) {
          try {
            const docRef = doc(db, FIRESTORE_COLLECTION, user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const firestoreData = docSnap.data();
              const firestorePrefs = firestoreData.ww2Preferences as UserWW2Preferences | undefined;

              if (firestorePrefs) {
                // Merge: prefer Firestore data if it has a more recent lastVisitDate
                const firestoreDate = firestorePrefs.lastVisitDate ? new Date(firestorePrefs.lastVisitDate).getTime() : 0;
                const localDate = localPrefs.lastVisitDate ? new Date(localPrefs.lastVisitDate).getTime() : 0;

                if (firestoreDate >= localDate) {
                  localPrefs = firestorePrefs;
                  // Update localStorage with Firestore data
                  localStorage.setItem(WW2_PREFERENCES_KEY, JSON.stringify(firestorePrefs));
                  console.log('[WW2Preferences] Loaded from Firestore');
                } else {
                  // Local is newer, sync to Firestore
                  await syncToFirestore(user.uid, localPrefs);
                  console.log('[WW2Preferences] Synced local to Firestore');
                }
                hasLoadedFromFirestore.current = true;
              }
            } else if (localPrefs.selectedHostId) {
              // No Firestore data but we have local data - sync it
              await syncToFirestore(user.uid, localPrefs);
              hasLoadedFromFirestore.current = true;
              console.log('[WW2Preferences] Initial sync to Firestore');
            }
          } catch (firestoreError) {
            console.warn('[WW2Preferences] Firestore load failed, using localStorage:', firestoreError);
          }
        }

        setPreferences(localPrefs);
      } catch (error) {
        console.error('[WW2Preferences] Failed to load preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  // Reset Firestore load flag when user changes
  useEffect(() => {
    hasLoadedFromFirestore.current = false;
  }, [user?.uid]);

  // Sync to Firestore helper
  const syncToFirestore = async (userId: string, prefs: UserWW2Preferences) => {
    if (!isFirebaseConfigured()) return;

    try {
      const docRef = doc(db, FIRESTORE_COLLECTION, userId);
      await setDoc(docRef, {
        ww2Preferences: prefs,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    } catch (error) {
      console.error('[WW2Preferences] Firestore sync failed:', error);
    }
  };

  // Save preferences to localStorage and Firestore
  const savePreferences = useCallback(async (newPrefs: Partial<UserWW2Preferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);

    // Always save to localStorage
    try {
      localStorage.setItem(WW2_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('[WW2Preferences] localStorage save failed:', error);
    }

    // If user is logged in, also save to Firestore
    if (user && isFirebaseConfigured()) {
      setIsSyncing(true);
      try {
        await syncToFirestore(user.uid, updated);
        console.log('[WW2Preferences] Saved to Firestore');
      } catch (error) {
        console.error('[WW2Preferences] Firestore save failed:', error);
      } finally {
        setIsSyncing(false);
      }
    }
  }, [preferences, user]);

  // Select a host
  const selectHost = useCallback((hostId: string) => {
    savePreferences({
      selectedHostId: hostId,
      lastVisitDate: new Date().toISOString(),
      hasSeenIntro: true,
    });
  }, [savePreferences]);

  // Mark intro as seen
  const markIntroSeen = useCallback(() => {
    savePreferences({ hasSeenIntro: true });
  }, [savePreferences]);

  // Mark welcome video as seen
  const markWelcomeVideoSeen = useCallback(() => {
    savePreferences({ hasSeenWelcomeVideo: true });
  }, [savePreferences]);

  // Update last visit date
  const updateLastVisit = useCallback(() => {
    savePreferences({ lastVisitDate: new Date().toISOString() });
  }, [savePreferences]);

  // Clear host selection (to change guide)
  const clearHostSelection = useCallback(() => {
    savePreferences({ selectedHostId: null });
  }, [savePreferences]);

  // Check if this is a returning user (visited within last 30 days)
  const isReturningUser = useCallback(() => {
    if (!preferences.lastVisitDate || !preferences.selectedHostId) return false;
    const lastVisit = new Date(preferences.lastVisitDate);
    const now = new Date();
    const daysSinceLastVisit = Math.floor((now.getTime() - lastVisit.getTime()) / (1000 * 60 * 60 * 24));
    return daysSinceLastVisit < 30;
  }, [preferences]);

  return {
    preferences,
    isLoading,
    isSyncing,
    hasSelectedHost: !!preferences.selectedHostId,
    selectedHostId: preferences.selectedHostId,
    hasSeenIntro: preferences.hasSeenIntro,
    hasSeenWelcomeVideo: preferences.hasSeenWelcomeVideo,
    isReturningUser: isReturningUser(),
    selectHost,
    markIntroSeen,
    markWelcomeVideoSeen,
    updateLastVisit,
    clearHostSelection,
  };
}

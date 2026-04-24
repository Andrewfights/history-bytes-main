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
        // Check if this is a fresh demo session (flag set by AppContext.signIn)
        const isDemoFreshSession = localStorage.getItem('hb_demo_fresh_session') === 'true';

        // First, load from localStorage (always available)
        let localPrefs = DEFAULT_PREFERENCES;
        const stored = localStorage.getItem(WW2_PREFERENCES_KEY);
        if (stored) {
          localPrefs = JSON.parse(stored) as UserWW2Preferences;
        }

        // If this is a fresh demo session, clear the flag and use localStorage only
        // This prevents race conditions where Firestore hasn't been reset yet
        if (isDemoFreshSession) {
          localStorage.removeItem('hb_demo_fresh_session');
          console.log('[WW2Preferences] Fresh demo session - using localStorage, skipping Firestore');
          setPreferences(localPrefs);
          setIsLoading(false);
          hasLoadedFromFirestore.current = true; // Mark as "loaded" to prevent future Firestore fetch
          return;
        }

        // For authenticated users, Firestore is the source of truth
        // This ensures cross-device sync works correctly
        if (user && isFirebaseConfigured() && !hasLoadedFromFirestore.current) {
          try {
            const docRef = doc(db, FIRESTORE_COLLECTION, user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const firestoreData = docSnap.data();
              const firestorePrefs = firestoreData.ww2Preferences as UserWW2Preferences | undefined;

              if (firestorePrefs && firestorePrefs.selectedHostId) {
                // Firestore has host data - use it (source of truth for auth'd users)
                localPrefs = {
                  ...DEFAULT_PREFERENCES,
                  ...firestorePrefs,
                };
                // Update localStorage to match Firestore
                localStorage.setItem(WW2_PREFERENCES_KEY, JSON.stringify(localPrefs));
                console.log('[WW2Preferences] Loaded from Firestore (source of truth):', localPrefs.selectedHostId);
              } else if (localPrefs.selectedHostId) {
                // Firestore exists but no host - sync local to Firestore
                await syncToFirestore(user.uid, localPrefs);
                console.log('[WW2Preferences] Synced local host to Firestore');
              }
              hasLoadedFromFirestore.current = true;
            } else if (localPrefs.selectedHostId) {
              // No Firestore doc but we have local data - create it
              await syncToFirestore(user.uid, localPrefs);
              hasLoadedFromFirestore.current = true;
              console.log('[WW2Preferences] Initial sync to Firestore');
            } else {
              // No data anywhere - mark as loaded
              hasLoadedFromFirestore.current = true;
              console.log('[WW2Preferences] No host data found');
            }
          } catch (firestoreError) {
            console.warn('[WW2Preferences] Firestore load failed, using localStorage:', firestoreError);
            hasLoadedFromFirestore.current = true; // Don't block on error
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

  // Reset entire campaign (for "Start from Beginning" feature)
  const resetCampaign = useCallback(() => {
    savePreferences({
      selectedHostId: null,
      hasSeenWelcomeVideo: false,
      hasSeenIntro: false,
      lastVisitDate: '',
    });
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
    resetCampaign,
  };
}

/**
 * useWW2Preferences - Hook to persist WW2 host selection across sessions
 */

import { useState, useEffect, useCallback } from 'react';
import { UserWW2Preferences } from '@/types';

const WW2_PREFERENCES_KEY = 'hb_ww2_preferences';

const DEFAULT_PREFERENCES: UserWW2Preferences = {
  selectedHostId: null,
  lastVisitDate: '',
  hasSeenIntro: false,
};

export function useWW2Preferences() {
  const [preferences, setPreferences] = useState<UserWW2Preferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WW2_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserWW2Preferences;
        setPreferences(parsed);
      }
    } catch (error) {
      console.error('Failed to load WW2 preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPrefs: Partial<UserWW2Preferences>) => {
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    try {
      localStorage.setItem(WW2_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save WW2 preferences:', error);
    }
  }, [preferences]);

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
    hasSelectedHost: !!preferences.selectedHostId,
    selectedHostId: preferences.selectedHostId,
    hasSeenIntro: preferences.hasSeenIntro,
    isReturningUser: isReturningUser(),
    selectHost,
    markIntroSeen,
    updateLastVisit,
    clearHostSelection,
  };
}

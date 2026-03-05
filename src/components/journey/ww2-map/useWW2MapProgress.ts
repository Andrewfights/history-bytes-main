/**
 * Custom hook for WW2 Map progress management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  WW2MapProgress,
  loadWW2MapProgressAsync,
  saveWW2MapProgress,
  completeCountry as completeCountryStorage,
  setCurrentCountry as setCurrentCountryStorage,
  DEFAULT_WW2_MAP_PROGRESS,
} from '@/lib/ww2MapStorage';
import { getUnlockedCountries, isCountryLocked } from '@/data/ww2Countries';

export function useWW2MapProgress() {
  const [progress, setProgress] = useState<WW2MapProgress>(DEFAULT_WW2_MAP_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    const loadProgress = async () => {
      const data = await loadWW2MapProgressAsync();
      setProgress(data);
      setIsLoading(false);
    };
    loadProgress();

    // Listen for storage updates
    const handleStorageUpdate = () => {
      loadProgress();
    };
    window.addEventListener('ww2MapStorageUpdate', handleStorageUpdate);

    return () => {
      window.removeEventListener('ww2MapStorageUpdate', handleStorageUpdate);
    };
  }, []);

  // Complete a country
  const completeCountry = useCallback(async (countryId: string, xpEarned: number) => {
    const updated = await completeCountryStorage(countryId, xpEarned);
    setProgress(updated);
    return updated;
  }, []);

  // Set current country (in progress)
  const setCurrentCountry = useCallback(async (countryId: string | null) => {
    const updated = await setCurrentCountryStorage(countryId);
    setProgress(updated);
    return updated;
  }, []);

  // Check if a country is completed
  const isCountryCompleted = useCallback((countryId: string) => {
    return progress.completedCountries.includes(countryId);
  }, [progress.completedCountries]);

  // Check if a country is locked
  const isLocked = useCallback((countryId: string) => {
    return isCountryLocked(countryId, progress.completedCountries);
  }, [progress.completedCountries]);

  // Get progress status for a country
  const getCountryStatus = useCallback((countryId: string): 'locked' | 'available' | 'in-progress' | 'complete' => {
    if (progress.completedCountries.includes(countryId)) return 'complete';
    if (progress.currentCountry === countryId) return 'in-progress';
    if (isCountryLocked(countryId, progress.completedCountries)) return 'locked';
    return 'available';
  }, [progress.completedCountries, progress.currentCountry]);

  return {
    progress,
    isLoading,
    completeCountry,
    setCurrentCountry,
    isCountryCompleted,
    isLocked,
    getCountryStatus,
  };
}

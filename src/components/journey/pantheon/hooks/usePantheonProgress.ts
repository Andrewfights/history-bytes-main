/**
 * usePantheonProgress - Track and manage Pantheon souvenir progress
 *
 * Handles souvenir unlocking, tier upgrades based on exam performance,
 * and persistence to localStorage.
 */

import { useState, useEffect, useCallback } from 'react';
import type { SouvenirTier, SouvenirProgress, PantheonProgress } from '@/types';
import {
  loadPantheonProgress,
  savePantheonProgress,
  type PersistedPantheonProgress,
} from '@/lib/storage';
import {
  getSouvenirById,
  getSouvenirByWorldId,
  calculateTierFromExamScore,
  isUpgrade,
  getTierRank,
  PANTHEON_WORLDS,
} from '@/data/pantheonSouvenirs';
import type { ArenaRecognition } from '@/data/arenaQuestions';

export interface UsePantheonProgressReturn {
  // State
  progress: PantheonProgress;
  isLoading: boolean;

  // Getters
  getSouvenirTier: (souvenirId: string) => SouvenirTier | null;
  getSouvenirProgress: (souvenirId: string) => SouvenirProgress | null;
  hasSouvenir: (souvenirId: string) => boolean;
  getTotalSouvenirs: () => number;
  getHighestTier: () => SouvenirTier | null;

  // Actions
  unlockSouvenir: (souvenirId: string) => void;
  upgradeSouvenir: (souvenirId: string, newTier: SouvenirTier) => boolean;
  recordExamScore: (worldId: string, score: number, total: number) => SouvenirTier | null;
  recordArenaScore: (worldId: string, arenaTier: ArenaRecognition) => SouvenirTier | null;

  // Visit tracking
  markVisited: () => void;
}

export function usePantheonProgress(): UsePantheonProgressReturn {
  const [progress, setProgress] = useState<PantheonProgress>({
    souvenirs: {},
    lastVisited: undefined,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from storage on mount
  useEffect(() => {
    const stored = loadPantheonProgress();
    if (stored) {
      // Convert persisted format to runtime format
      const runtimeProgress: PantheonProgress = {
        souvenirs: {},
        lastVisited: stored.lastVisited,
      };

      for (const [id, persisted] of Object.entries(stored.souvenirs)) {
        runtimeProgress.souvenirs[id] = {
          souvenirId: persisted.souvenirId,
          currentTier: persisted.currentTier,
          unlockedAt: persisted.unlockedAt,
          upgradedAt: persisted.upgradedAt,
          examScores: persisted.examScores,
        };
      }

      setProgress(runtimeProgress);
    }
    setIsLoading(false);
  }, []);

  // Save progress whenever it changes
  const saveProgress = useCallback((newProgress: PantheonProgress) => {
    setProgress(newProgress);

    // Convert to persisted format
    const persisted: PersistedPantheonProgress = {
      souvenirs: {},
      lastVisited: newProgress.lastVisited,
    };

    for (const [id, souvenirProgress] of Object.entries(newProgress.souvenirs)) {
      persisted.souvenirs[id] = {
        souvenirId: souvenirProgress.souvenirId,
        currentTier: souvenirProgress.currentTier,
        unlockedAt: souvenirProgress.unlockedAt,
        upgradedAt: souvenirProgress.upgradedAt,
        examScores: souvenirProgress.examScores,
      };
    }

    savePantheonProgress(persisted);
  }, []);

  // Get tier for a specific souvenir
  const getSouvenirTier = useCallback((souvenirId: string): SouvenirTier | null => {
    const souvenirProgress = progress.souvenirs[souvenirId];
    return souvenirProgress?.currentTier || null;
  }, [progress.souvenirs]);

  // Get full progress for a souvenir
  const getSouvenirProgress = useCallback((souvenirId: string): SouvenirProgress | null => {
    return progress.souvenirs[souvenirId] || null;
  }, [progress.souvenirs]);

  // Check if user has unlocked a souvenir
  const hasSouvenir = useCallback((souvenirId: string): boolean => {
    return souvenirId in progress.souvenirs;
  }, [progress.souvenirs]);

  // Get total unlocked souvenirs count
  const getTotalSouvenirs = useCallback((): number => {
    return Object.keys(progress.souvenirs).length;
  }, [progress.souvenirs]);

  // Get highest tier achieved across all souvenirs
  const getHighestTier = useCallback((): SouvenirTier | null => {
    const tiers = Object.values(progress.souvenirs).map(s => s.currentTier);
    if (tiers.length === 0) return null;

    let highest: SouvenirTier = 'gray';
    for (const tier of tiers) {
      if (getTierRank(tier) > getTierRank(highest)) {
        highest = tier;
      }
    }
    return highest;
  }, [progress.souvenirs]);

  // Unlock a new souvenir (gray tier)
  const unlockSouvenir = useCallback((souvenirId: string) => {
    // Check if already unlocked
    if (progress.souvenirs[souvenirId]) {
      return;
    }

    // Verify souvenir exists
    const souvenir = getSouvenirById(souvenirId);
    if (!souvenir) {
      console.warn(`[Pantheon] Unknown souvenir: ${souvenirId}`);
      return;
    }

    const newProgress: PantheonProgress = {
      ...progress,
      souvenirs: {
        ...progress.souvenirs,
        [souvenirId]: {
          souvenirId,
          currentTier: 'gray',
          unlockedAt: new Date().toISOString(),
          examScores: [],
        },
      },
    };

    saveProgress(newProgress);
    console.log(`[Pantheon] Unlocked souvenir: ${souvenir.name}`);
  }, [progress, saveProgress]);

  // Upgrade souvenir to a higher tier
  const upgradeSouvenir = useCallback((souvenirId: string, newTier: SouvenirTier): boolean => {
    const currentProgress = progress.souvenirs[souvenirId];

    // Must already have the souvenir
    if (!currentProgress) {
      console.warn(`[Pantheon] Cannot upgrade - souvenir not unlocked: ${souvenirId}`);
      return false;
    }

    // Only upgrade if new tier is higher
    if (!isUpgrade(currentProgress.currentTier, newTier)) {
      return false;
    }

    const newProgress: PantheonProgress = {
      ...progress,
      souvenirs: {
        ...progress.souvenirs,
        [souvenirId]: {
          ...currentProgress,
          currentTier: newTier,
          upgradedAt: new Date().toISOString(),
        },
      },
    };

    saveProgress(newProgress);
    console.log(`[Pantheon] Upgraded ${souvenirId} to ${newTier}`);
    return true;
  }, [progress, saveProgress]);

  // Record an exam score and potentially upgrade souvenir
  const recordExamScore = useCallback((worldId: string, score: number, total: number): SouvenirTier | null => {
    // Find the souvenir for this world
    const souvenir = getSouvenirByWorldId(worldId);
    if (!souvenir) {
      console.warn(`[Pantheon] No souvenir for world: ${worldId}`);
      return null;
    }

    // Calculate the tier based on exam score
    const earnedTier = calculateTierFromExamScore(score, total);
    const percentage = Math.round((score / total) * 100);

    // Get current progress or create new
    let currentProgress = progress.souvenirs[souvenir.id];

    if (!currentProgress) {
      // First time - unlock the souvenir
      currentProgress = {
        souvenirId: souvenir.id,
        currentTier: 'gray',
        unlockedAt: new Date().toISOString(),
        examScores: [],
      };
    }

    // Add score to history
    const newExamScores = [...currentProgress.examScores, percentage];

    // Determine if this is an upgrade
    const shouldUpgrade = isUpgrade(currentProgress.currentTier, earnedTier);

    const newProgress: PantheonProgress = {
      ...progress,
      souvenirs: {
        ...progress.souvenirs,
        [souvenir.id]: {
          ...currentProgress,
          currentTier: shouldUpgrade ? earnedTier : currentProgress.currentTier,
          upgradedAt: shouldUpgrade ? new Date().toISOString() : currentProgress.upgradedAt,
          examScores: newExamScores,
        },
      },
    };

    saveProgress(newProgress);

    if (shouldUpgrade) {
      console.log(`[Pantheon] Exam score ${score}/${total} (${percentage}%) - Upgraded to ${earnedTier}!`);
      return earnedTier;
    } else {
      console.log(`[Pantheon] Exam score ${score}/${total} (${percentage}%) - Tier unchanged (${currentProgress.currentTier})`);
      return null;
    }
  }, [progress, saveProgress]);

  // Map Arena recognition to souvenir tier
  const arenaToSouvenirTier = (arenaTier: ArenaRecognition): SouvenirTier => {
    switch (arenaTier) {
      case 'masters':
        return 'bronze';
      case 'phd':
        return 'silver';
      case 'rhodes_scholar':
        return 'gold';
      default:
        return 'gray';
    }
  };

  // Record Arena achievement and upgrade souvenir accordingly
  const recordArenaScore = useCallback((worldId: string, arenaTier: ArenaRecognition): SouvenirTier | null => {
    // Find the souvenir for this world
    const souvenir = getSouvenirByWorldId(worldId);
    if (!souvenir) {
      console.warn(`[Pantheon] No souvenir for world: ${worldId}`);
      return null;
    }

    // Map Arena tier to souvenir tier
    const earnedTier = arenaToSouvenirTier(arenaTier);

    // Get current progress or create new
    let currentProgress = progress.souvenirs[souvenir.id];

    if (!currentProgress) {
      // First time - unlock the souvenir
      currentProgress = {
        souvenirId: souvenir.id,
        currentTier: 'gray',
        unlockedAt: new Date().toISOString(),
        examScores: [],
      };
    }

    // Determine if this is an upgrade
    const shouldUpgrade = isUpgrade(currentProgress.currentTier, earnedTier);

    const newProgress: PantheonProgress = {
      ...progress,
      souvenirs: {
        ...progress.souvenirs,
        [souvenir.id]: {
          ...currentProgress,
          currentTier: shouldUpgrade ? earnedTier : currentProgress.currentTier,
          upgradedAt: shouldUpgrade ? new Date().toISOString() : currentProgress.upgradedAt,
        },
      },
    };

    saveProgress(newProgress);

    if (shouldUpgrade) {
      console.log(`[Pantheon] Arena ${arenaTier} - Upgraded souvenir to ${earnedTier}!`);
      return earnedTier;
    } else {
      console.log(`[Pantheon] Arena ${arenaTier} - Souvenir tier unchanged (${currentProgress.currentTier})`);
      return null;
    }
  }, [progress, saveProgress]);

  // Mark the Pantheon as visited
  const markVisited = useCallback(() => {
    const newProgress: PantheonProgress = {
      ...progress,
      lastVisited: new Date().toISOString(),
    };
    saveProgress(newProgress);
  }, [progress, saveProgress]);

  return {
    progress,
    isLoading,
    getSouvenirTier,
    getSouvenirProgress,
    hasSouvenir,
    getTotalSouvenirs,
    getHighestTier,
    unlockSouvenir,
    upgradeSouvenir,
    recordExamScore,
    recordArenaScore,
    markVisited,
  };
}

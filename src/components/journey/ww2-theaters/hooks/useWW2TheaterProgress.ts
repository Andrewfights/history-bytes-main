/**
 * useWW2TheaterProgress - Track progress through WW2 theater battles
 * Integrates with Pearl Harbor progress to check completion
 */

import { useState, useEffect, useCallback } from 'react';
import { WW2TheaterProgress, BattleStatus, WW2Theater } from '@/types';
import { getBattleById, getBattlesByTheater, isBattleUnlocked } from '@/data/ww2Battles';
import { PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';

const PROGRESS_KEY = 'hb_ww2_theater_progress';
const PEARL_HARBOR_PROGRESS_KEY = 'hb_pearl_harbor_progress';

const DEFAULT_PROGRESS: WW2TheaterProgress = {
  completedBattles: [],
  currentBattle: null,
  unlockedBattles: ['pearl-harbor'], // Pearl Harbor always starts unlocked
  totalXP: 0,
  lastVisited: null,
};

export function useWW2TheaterProgress() {
  const [progress, setProgress] = useState<WW2TheaterProgress>(DEFAULT_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WW2TheaterProgress;
        // Ensure Pearl Harbor is always in unlocked list
        if (!parsed.unlockedBattles.includes('pearl-harbor')) {
          parsed.unlockedBattles.push('pearl-harbor');
        }
        setProgress(parsed);
      }
    } catch (error) {
      console.error('Failed to load WW2 theater progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((newProgress: WW2TheaterProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save WW2 theater progress:', error);
    }
  }, []);

  // Check if Pearl Harbor is complete by reading its progress
  const isPearlHarborComplete = useCallback((): boolean => {
    try {
      const stored = localStorage.getItem(PEARL_HARBOR_PROGRESS_KEY);
      if (!stored) return false;

      const phProgress = JSON.parse(stored);
      const completedLessons = (phProgress.completedActivities || []).filter(
        (id: string) => id.startsWith('ph-beat-')
      );

      // Need all lessons completed
      return completedLessons.length >= PEARL_HARBOR_LESSONS.length;
    } catch (error) {
      console.error('Failed to check Pearl Harbor progress:', error);
      return false;
    }
  }, []);

  // Get battle status based on progress
  const getBattleStatus = useCallback(
    (battleId: string): BattleStatus => {
      const battle = getBattleById(battleId);
      if (!battle) return 'locked';

      // Check if completed
      if (progress.completedBattles.includes(battleId)) {
        return 'completed';
      }

      // Check if currently in progress
      if (progress.currentBattle === battleId) {
        return 'in-progress';
      }

      // Check if unlocked
      // Pearl Harbor is always available
      if (battle.isFirstStop) {
        return 'available';
      }

      // For other battles, check unlock requirements
      // If requirement is Pearl Harbor, also check actual Pearl Harbor progress
      if (battle.unlockRequirement === 'pearl-harbor') {
        const phComplete =
          progress.completedBattles.includes('pearl-harbor') ||
          isPearlHarborComplete();
        if (phComplete) {
          return 'available';
        }
      }

      // Check if unlock requirement battle is completed
      if (isBattleUnlocked(battleId, progress.completedBattles)) {
        return 'available';
      }

      return 'locked';
    },
    [progress, isPearlHarborComplete]
  );

  // Check if battle is completed
  const isBattleCompleted = useCallback(
    (battleId: string): boolean => {
      // Special case: Pearl Harbor completion comes from its own progress
      if (battleId === 'pearl-harbor') {
        return progress.completedBattles.includes(battleId) || isPearlHarborComplete();
      }
      return progress.completedBattles.includes(battleId);
    },
    [progress.completedBattles, isPearlHarborComplete]
  );

  // Start a battle (mark as in-progress)
  const startBattle = useCallback(
    (battleId: string) => {
      const newProgress: WW2TheaterProgress = {
        ...progress,
        currentBattle: battleId,
        lastVisited: new Date().toISOString(),
      };
      saveProgress(newProgress);
    },
    [progress, saveProgress]
  );

  // Complete a battle
  const completeBattle = useCallback(
    (battleId: string, xpEarned: number = 0) => {
      const battle = getBattleById(battleId);
      if (!battle) return;

      // Already completed?
      if (progress.completedBattles.includes(battleId)) return;

      const newCompletedBattles = [...progress.completedBattles, battleId];

      // Unlock next battles in sequence
      const newUnlockedBattles = [...progress.unlockedBattles];
      const theaterBattles = getBattlesByTheater(battle.theater);
      const currentIndex = theaterBattles.findIndex((b) => b.id === battleId);

      // Unlock next battle in same theater
      if (currentIndex < theaterBattles.length - 1) {
        const nextBattle = theaterBattles[currentIndex + 1];
        if (!newUnlockedBattles.includes(nextBattle.id)) {
          newUnlockedBattles.push(nextBattle.id);
        }
      }

      // If Pearl Harbor is completed, unlock first battle in both theaters
      if (battleId === 'pearl-harbor') {
        // Unlock Barbarossa (first European battle after Pearl Harbor)
        if (!newUnlockedBattles.includes('barbarossa')) {
          newUnlockedBattles.push('barbarossa');
        }
        // Unlock Midway (next Pacific battle)
        if (!newUnlockedBattles.includes('midway')) {
          newUnlockedBattles.push('midway');
        }
      }

      const totalXP = progress.totalXP + (xpEarned || battle.xpReward);

      const newProgress: WW2TheaterProgress = {
        ...progress,
        completedBattles: newCompletedBattles,
        unlockedBattles: newUnlockedBattles,
        currentBattle: null,
        totalXP,
        lastVisited: new Date().toISOString(),
      };

      saveProgress(newProgress);
    },
    [progress, saveProgress]
  );

  // Sync Pearl Harbor completion status
  // Call this when returning to theater selection to update state
  const syncPearlHarborCompletion = useCallback(() => {
    if (isPearlHarborComplete() && !progress.completedBattles.includes('pearl-harbor')) {
      completeBattle('pearl-harbor');
    }
  }, [isPearlHarborComplete, progress.completedBattles, completeBattle]);

  // Get progress stats for a theater
  const getTheaterProgress = useCallback(
    (theater: WW2Theater): { completed: number; total: number } => {
      const battles = getBattlesByTheater(theater);
      const completed = battles.filter((b) =>
        progress.completedBattles.includes(b.id)
      ).length;

      return { completed, total: battles.length };
    },
    [progress.completedBattles]
  );

  // Get overall progress across both theaters
  const getOverallProgress = useCallback((): {
    completed: number;
    total: number;
    percentage: number;
  } => {
    const pacific = getTheaterProgress('pacific');
    const european = getTheaterProgress('european');
    const completed = pacific.completed + european.completed;
    const total = pacific.total + european.total;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [getTheaterProgress]);

  return {
    progress,
    isLoading,
    getBattleStatus,
    isBattleCompleted,
    isPearlHarborComplete,
    startBattle,
    completeBattle,
    syncPearlHarborCompletion,
    getTheaterProgress,
    getOverallProgress,
    totalXP: progress.totalXP,
    completedBattles: progress.completedBattles,
  };
}

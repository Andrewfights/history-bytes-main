/**
 * usePearlHarborProgress - Track progress through Pearl Harbor module
 * Now includes checkpoint saves for mid-lesson resume
 */

import { useState, useEffect, useCallback } from 'react';
import { PearlHarborProgress, PearlHarborMasteryBuckets } from '@/types';
import { INITIAL_MASTERY_BUCKETS, getActivityById } from '@/data/pearlHarborData';
import { getLessonById, PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';

const PROGRESS_KEY = 'hb_pearl_harbor_progress';
const CHECKPOINT_KEY = 'hb_pearl_harbor_checkpoint';

// Checkpoint data for resuming mid-lesson
export interface LessonCheckpoint {
  lessonId: string;
  screen: string; // Current screen name (e.g., 'intro', 'radar', 'decision', 'quiz')
  screenIndex: number; // Numeric index for ordered screens
  timestamp: number;
  // Lesson-specific state
  state: {
    // Legacy lesson state
    detectedBlips?: string[];
    selectedAnswers?: Record<number, number>;
    quizScore?: number;
    currentTestimony?: number;
    viewedTestimonies?: string[];
    taggedFacts?: string[];
    headlineWords?: string[];
    identifiedShips?: string[];
    visitedLocations?: string[];
    earnedXP?: number;
    skippedScreens?: string[];

    // New 10-beat curriculum state
    viewedHotspots?: string[];
    challengeScore?: number;
    finalScore?: number;
    selectedDecision?: string;
    currentEventIndex?: number;
    stationsListened?: string[];
    quizAnswers?: Record<string, number | null>;
    score?: number;
  };
}

const DEFAULT_PROGRESS: PearlHarborProgress = {
  completedActivities: [],
  unlockedLessons: [], // Lessons that have been started/skipped
  masteryBuckets: INITIAL_MASTERY_BUCKETS,
  currentStreak: 0,
  lastPlayDate: null,
  totalXP: 0,
  hasBattleshipRowBadge: false,
};

export function usePearlHarborProgress() {
  const [progress, setProgress] = useState<PearlHarborProgress>(DEFAULT_PROGRESS);
  const [checkpoint, setCheckpoint] = useState<LessonCheckpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress and checkpoint on mount
  useEffect(() => {
    try {
      // Load main progress
      const stored = localStorage.getItem(PROGRESS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PearlHarborProgress;
        // Ensure masteryBuckets has all required fields
        const mergedBuckets: PearlHarborMasteryBuckets = {
          quizzes: { ...INITIAL_MASTERY_BUCKETS.quizzes, ...parsed.masteryBuckets?.quizzes },
          stories: { ...INITIAL_MASTERY_BUCKETS.stories, ...parsed.masteryBuckets?.stories },
          maps: { ...INITIAL_MASTERY_BUCKETS.maps, ...parsed.masteryBuckets?.maps },
        };
        // Ensure unlockedLessons exists (for backwards compatibility)
        const unlockedLessons = parsed.unlockedLessons || [];
        setProgress({ ...parsed, masteryBuckets: mergedBuckets, unlockedLessons });
      }

      // Load checkpoint if exists
      const storedCheckpoint = localStorage.getItem(CHECKPOINT_KEY);
      if (storedCheckpoint) {
        const parsedCheckpoint = JSON.parse(storedCheckpoint) as LessonCheckpoint;
        // Only restore checkpoints less than 24 hours old
        const isRecent = Date.now() - parsedCheckpoint.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent) {
          setCheckpoint(parsedCheckpoint);
        } else {
          // Clear stale checkpoint
          localStorage.removeItem(CHECKPOINT_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load Pearl Harbor progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save progress
  const saveProgress = useCallback((newProgress: PearlHarborProgress) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
    } catch (error) {
      console.error('Failed to save Pearl Harbor progress:', error);
    }
  }, []);

  // Save a checkpoint (mid-lesson state)
  // Supports both object form and individual args for backwards compatibility
  const saveCheckpoint = useCallback((
    lessonIdOrCheckpoint: string | Omit<LessonCheckpoint, 'timestamp'> & { timestamp?: number },
    screen?: string,
    screenIndex?: number,
    state: LessonCheckpoint['state'] = {}
  ) => {
    let newCheckpoint: LessonCheckpoint;

    if (typeof lessonIdOrCheckpoint === 'object') {
      // Object form: saveCheckpoint({ lessonId, screen, screenIndex, state })
      newCheckpoint = {
        ...lessonIdOrCheckpoint,
        timestamp: lessonIdOrCheckpoint.timestamp || Date.now(),
      };
    } else {
      // Individual args form: saveCheckpoint(lessonId, screen, screenIndex, state)
      newCheckpoint = {
        lessonId: lessonIdOrCheckpoint,
        screen: screen!,
        screenIndex: screenIndex!,
        timestamp: Date.now(),
        state,
      };
    }

    setCheckpoint(newCheckpoint);
    try {
      localStorage.setItem(CHECKPOINT_KEY, JSON.stringify(newCheckpoint));
    } catch (error) {
      console.error('Failed to save checkpoint:', error);
    }
  }, []);

  // Clear checkpoint (when lesson completes or user explicitly exits)
  const clearCheckpoint = useCallback(() => {
    setCheckpoint(null);
    try {
      localStorage.removeItem(CHECKPOINT_KEY);
      console.log('[Checkpoint] Cleared');
    } catch (error) {
      console.error('Failed to clear checkpoint:', error);
    }
  }, []);

  // Get current checkpoint (used by beats)
  const getCheckpoint = useCallback((): LessonCheckpoint | null => {
    return checkpoint;
  }, [checkpoint]);

  // Get checkpoint for a specific lesson (returns null if no checkpoint or different lesson)
  const getCheckpointForLesson = useCallback((lessonId: string): LessonCheckpoint | null => {
    if (checkpoint && checkpoint.lessonId === lessonId) {
      return checkpoint;
    }
    return null;
  }, [checkpoint]);

  // Check if there's a resumable checkpoint
  const hasResumableCheckpoint = useCallback((lessonId?: string): boolean => {
    if (!checkpoint) return false;
    if (lessonId) {
      return checkpoint.lessonId === lessonId;
    }
    return true;
  }, [checkpoint]);

  // Complete an activity or lesson
  const completeActivity = useCallback((activityId: string) => {
    // Check if it's a lesson (new 7-lesson system) or activity (old 15-activity system)
    const lesson = getLessonById(activityId);
    const activity = getActivityById(activityId);

    // Get XP reward from either lesson or activity
    const xpReward = lesson?.xpReward || activity?.xpReward;
    if (!xpReward) return;

    setProgress(prev => {
      // Already completed?
      if (prev.completedActivities.includes(activityId)) {
        return prev;
      }

      const newCompletedActivities = [...prev.completedActivities, activityId];
      // Also mark as unlocked when completed
      const newUnlockedLessons = prev.unlockedLessons.includes(activityId)
        ? prev.unlockedLessons
        : [...prev.unlockedLessons, activityId];

      // Update mastery bucket (only for old activities, not lessons)
      const newBuckets = { ...prev.masteryBuckets };
      if (activity) {
        const bucket = activity.bucket;
        const bucketData = newBuckets[bucket];

        if (!bucketData.completedItems.includes(activityId)) {
          bucketData.completedItems = [...bucketData.completedItems, activityId];
          bucketData.progress = Math.round((bucketData.completedItems.length / bucketData.items.length) * 100);
        }
      }

      // Update streak
      const today = new Date().toDateString();
      const lastPlay = prev.lastPlayDate ? new Date(prev.lastPlayDate).toDateString() : null;
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      let newStreak = prev.currentStreak;
      if (lastPlay === today) {
        // Same day, no change
      } else if (lastPlay === yesterday) {
        // Consecutive day
        newStreak += 1;
      } else {
        // Streak broken or first play
        newStreak = 1;
      }

      // Calculate XP with streak bonus
      const streakBonus = Math.min(newStreak * 10, 50); // Max 50% bonus
      const xpWithBonus = Math.round(xpReward * (1 + streakBonus / 100));
      const newTotalXP = prev.totalXP + xpWithBonus;

      // Check for completion badge
      // For lessons: all beats complete (ph-beat-1 through ph-beat-11)
      const completedBeats = newCompletedActivities.filter(id => id.startsWith('ph-beat-')).length;
      const hasBadge = completedBeats >= PEARL_HARBOR_LESSONS.length;

      const newProgress: PearlHarborProgress = {
        ...prev,
        completedActivities: newCompletedActivities,
        unlockedLessons: newUnlockedLessons,
        masteryBuckets: newBuckets,
        currentStreak: newStreak,
        lastPlayDate: new Date().toISOString(),
        totalXP: newTotalXP,
        hasBattleshipRowBadge: hasBadge,
      };

      // Save asynchronously
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      } catch (e) {
        console.error('Failed to save progress:', e);
      }

      return newProgress;
    });
  }, []);

  // Unlock a lesson without completing it (for skipping)
  // This allows the user to proceed to the next lesson
  const unlockLesson = useCallback((lessonId: string) => {
    setProgress(prev => {
      // Already unlocked?
      if (prev.unlockedLessons.includes(lessonId)) {
        return prev;
      }

      const newUnlockedLessons = [...prev.unlockedLessons, lessonId];

      const newProgress: PearlHarborProgress = {
        ...prev,
        unlockedLessons: newUnlockedLessons,
        lastPlayDate: new Date().toISOString(),
      };

      // Save
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(newProgress));
      } catch (e) {
        console.error('Failed to save progress:', e);
      }

      return newProgress;
    });
  }, []);

  // Check if activity is completed (fully finished)
  const isActivityCompleted = useCallback((activityId: string) => {
    return progress.completedActivities.includes(activityId);
  }, [progress.completedActivities]);

  // Check if lesson is unlocked (started/skipped, can proceed to next)
  const isLessonUnlocked = useCallback((lessonId: string) => {
    return progress.unlockedLessons.includes(lessonId) || progress.completedActivities.includes(lessonId);
  }, [progress.unlockedLessons, progress.completedActivities]);

  // Get overall progress percentage (based on completed beats)
  const getOverallProgress = useCallback(() => {
    const completedBeats = progress.completedActivities.filter(id => id.startsWith('ph-beat-')).length;
    return Math.round((completedBeats / PEARL_HARBOR_LESSONS.length) * 100);
  }, [progress.completedActivities]);

  // Get streak bonus percentage
  const getStreakBonus = useCallback(() => {
    return Math.min(progress.currentStreak * 10, 50);
  }, [progress.currentStreak]);

  return {
    progress,
    isLoading,
    completeActivity,
    unlockLesson,
    isActivityCompleted,
    isLessonUnlocked,
    getOverallProgress,
    getStreakBonus,
    masteryBuckets: progress.masteryBuckets,
    currentStreak: progress.currentStreak,
    totalXP: progress.totalXP,
    unlockedLessons: progress.unlockedLessons,
    hasBattleshipRowBadge: progress.hasBattleshipRowBadge,
    // Checkpoint functions
    checkpoint,
    saveCheckpoint,
    clearCheckpoint,
    getCheckpoint,
    getCheckpointForLesson,
    hasResumableCheckpoint,
  };
}

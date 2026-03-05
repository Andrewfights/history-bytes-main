import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { arcs, getArcById } from '@/data/journeyData';
import { getRank, getRankInfo, RANK_DATA } from '@/types';
import {
  MilestoneContent,
  getChapterCelebration,
  getArcCelebration,
  getRankCelebration,
  getStreakCelebration,
  perfectScoreCelebration,
  firstCrownCelebration,
} from '@/data/celebrationData';

export interface PendingMilestone {
  milestone: MilestoneContent;
  newRankIcon?: string;
}

export function useMilestoneTracker() {
  const {
    user,
    completedJourneyNodes,
    nodeMastery,
    crownedCount,
  } = useApp();

  const [pendingMilestone, setPendingMilestone] = useState<PendingMilestone | null>(null);

  /**
   * Check for chapter completion
   * Returns celebration if all nodes in the chapter are now complete
   */
  const checkChapterComplete = useCallback((
    chapterId: string,
    completedNodes: string[]
  ): MilestoneContent | null => {
    // Find the chapter
    for (const arc of arcs) {
      const chapter = arc.chapters.find(c => c.id === chapterId);
      if (chapter) {
        // Check if all nodes in chapter are completed
        const allComplete = chapter.nodes.every(node =>
          completedNodes.includes(node.id)
        );

        if (allComplete) {
          return getChapterCelebration(chapterId);
        }
      }
    }
    return null;
  }, []);

  /**
   * Check for arc completion
   * Returns celebration if all chapters in the arc are complete
   */
  const checkArcComplete = useCallback((
    arcId: string,
    completedNodes: string[]
  ): MilestoneContent | null => {
    const arc = getArcById(arcId);
    if (!arc) return null;

    // Check if all nodes in all chapters are completed
    const allNodesComplete = arc.chapters.every(chapter =>
      chapter.nodes.every(node => completedNodes.includes(node.id))
    );

    if (allNodesComplete) {
      return getArcCelebration(arcId);
    }
    return null;
  }, []);

  /**
   * Check for rank up
   * Returns celebration if XP crosses a new rank threshold
   */
  const checkRankUp = useCallback((
    prevXp: number,
    newXp: number
  ): { milestone: MilestoneContent; newRankIcon: string } | null => {
    const prevRank = getRank(prevXp);
    const newRank = getRank(newXp);

    if (prevRank !== newRank) {
      const rankInfo = getRankInfo(newXp);
      return {
        milestone: getRankCelebration(newRank),
        newRankIcon: rankInfo.icon,
      };
    }
    return null;
  }, []);

  /**
   * Check for streak milestone
   * Returns celebration if streak reaches a milestone number
   */
  const checkStreakMilestone = useCallback((
    newStreak: number
  ): MilestoneContent | null => {
    return getStreakCelebration(newStreak);
  }, []);

  /**
   * Check for first crown achievement
   */
  const checkFirstCrown = useCallback((
    prevCrownedCount: number,
    newCrownedCount: number
  ): MilestoneContent | null => {
    if (prevCrownedCount === 0 && newCrownedCount === 1) {
      return firstCrownCelebration;
    }
    return null;
  }, []);

  /**
   * Check for perfect score
   */
  const checkPerfectScore = useCallback((
    isPerfect: boolean
  ): MilestoneContent | null => {
    if (isPerfect) {
      return perfectScoreCelebration;
    }
    return null;
  }, []);

  /**
   * Main function to check all milestones after node completion
   * Returns the most significant milestone to celebrate
   */
  const checkAllMilestones = useCallback(({
    completedNodeId,
    chapterId,
    arcId,
    prevXp,
    newXp,
    prevStreak,
    newStreak,
    prevCrownedCount,
    newCrownedCount,
    isPerfectScore = false,
    completedNodes,
  }: {
    completedNodeId: string;
    chapterId: string;
    arcId: string;
    prevXp: number;
    newXp: number;
    prevStreak?: number;
    newStreak?: number;
    prevCrownedCount?: number;
    newCrownedCount?: number;
    isPerfectScore?: boolean;
    completedNodes: string[];
  }): PendingMilestone | null => {
    // Priority order (highest first):
    // 1. Arc complete
    // 2. Rank up
    // 3. Chapter complete
    // 4. Streak milestone
    // 5. First crown
    // 6. Perfect score

    // Check arc completion
    const arcMilestone = checkArcComplete(arcId, completedNodes);
    if (arcMilestone) {
      return { milestone: arcMilestone };
    }

    // Check rank up
    const rankUp = checkRankUp(prevXp, newXp);
    if (rankUp) {
      return { milestone: rankUp.milestone, newRankIcon: rankUp.newRankIcon };
    }

    // Check chapter completion
    const chapterMilestone = checkChapterComplete(chapterId, completedNodes);
    if (chapterMilestone) {
      return { milestone: chapterMilestone };
    }

    // Check streak milestone
    if (prevStreak !== undefined && newStreak !== undefined) {
      const streakMilestone = checkStreakMilestone(newStreak);
      if (streakMilestone && newStreak > prevStreak) {
        return { milestone: streakMilestone };
      }
    }

    // Check first crown
    if (prevCrownedCount !== undefined && newCrownedCount !== undefined) {
      const crownMilestone = checkFirstCrown(prevCrownedCount, newCrownedCount);
      if (crownMilestone) {
        return { milestone: crownMilestone };
      }
    }

    // Check perfect score
    if (isPerfectScore) {
      const perfectMilestone = checkPerfectScore(true);
      if (perfectMilestone) {
        return { milestone: perfectMilestone };
      }
    }

    return null;
  }, [checkArcComplete, checkChapterComplete, checkFirstCrown, checkPerfectScore, checkRankUp, checkStreakMilestone]);

  /**
   * Trigger a milestone celebration
   */
  const triggerMilestone = useCallback((milestone: PendingMilestone) => {
    setPendingMilestone(milestone);
  }, []);

  /**
   * Clear the current milestone
   */
  const clearMilestone = useCallback(() => {
    setPendingMilestone(null);
  }, []);

  return {
    pendingMilestone,
    checkAllMilestones,
    triggerMilestone,
    clearMilestone,
    // Individual checkers if needed
    checkChapterComplete,
    checkArcComplete,
    checkRankUp,
    checkStreakMilestone,
    checkFirstCrown,
    checkPerfectScore,
  };
}

export default useMilestoneTracker;

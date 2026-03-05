import { useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { badges, getBadgeById } from '@/data/badgeData';
import { arcs } from '@/data/journeyData';
import { Badge, BadgeCheckContext, BadgeUnlockCondition, EarnedBadge } from '@/types/badges';
import { getRank } from '@/types';

// All node types in the app
const ALL_NODE_TYPES = ['two-truths', 'found-tape', 'headlines', 'quiz-mix', 'decision', 'boss'];

export function useBadgeTracker() {
  const {
    earnedBadges,
    addEarnedBadge,
    completedJourneyNodes,
    nodeMastery,
    crownedCount,
    perfectScoreCount,
    bossNodesDefeated,
    playedNodeTypes,
    arcadeGamesPlayed,
    totalQuizAttempts,
    totalCorrectAnswers,
    totalQuestions,
    user,
  } = useApp();

  // Calculate completed chapters and arcs
  const { completedChaptersCount, completedArcsCount, completedArcIds } = useMemo(() => {
    const completedChapters = new Set<string>();
    const completedArcs: string[] = [];

    arcs.forEach(arc => {
      let allChaptersComplete = true;

      arc.chapters.forEach(chapter => {
        const chapterNodeIds = chapter.nodes.map(n => n.id);
        const allNodesComplete = chapterNodeIds.every(nodeId =>
          completedJourneyNodes.includes(nodeId)
        );

        if (allNodesComplete && chapterNodeIds.length > 0) {
          completedChapters.add(chapter.id);
        } else {
          allChaptersComplete = false;
        }
      });

      if (allChaptersComplete && arc.chapters.length > 0) {
        completedArcs.push(arc.id);
      }
    });

    return {
      completedChaptersCount: completedChapters.size,
      completedArcsCount: completedArcs.length,
      completedArcIds: completedArcs,
    };
  }, [completedJourneyNodes]);

  // Build the check context
  const buildCheckContext = useCallback((): BadgeCheckContext => {
    const accuracy = totalQuestions > 0
      ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
      : 0;

    return {
      completedChaptersCount,
      completedArcsCount,
      completedArcIds,
      crownedCount,
      perfectScoreCount,
      currentStreak: user.streak,
      totalXp: user.xp,
      currentRank: getRank(user.xp),
      arcadeGamesPlayed,
      playedNodeTypes,
      bossNodesDefeated,
      totalQuizAttempts,
      totalCorrectAnswers,
      totalQuestions,
    };
  }, [
    completedChaptersCount,
    completedArcsCount,
    completedArcIds,
    crownedCount,
    perfectScoreCount,
    user.streak,
    user.xp,
    arcadeGamesPlayed,
    playedNodeTypes,
    bossNodesDefeated,
    totalQuizAttempts,
    totalCorrectAnswers,
    totalQuestions,
  ]);

  // Check if a specific condition is met
  const checkCondition = useCallback((
    condition: BadgeUnlockCondition,
    context: BadgeCheckContext
  ): boolean => {
    switch (condition.type) {
      case 'first_chapter':
        return context.completedChaptersCount >= 1;

      case 'first_arc':
        return context.completedArcsCount >= 1;

      case 'chapters_completed':
        return context.completedChaptersCount >= condition.count;

      case 'arcs_completed':
        return context.completedArcsCount >= condition.count;

      case 'perfect_score':
        return context.perfectScoreCount >= 1;

      case 'perfect_scores':
        return context.perfectScoreCount >= condition.count;

      case 'accuracy_threshold':
        if (context.totalQuizAttempts < condition.minAttempts) return false;
        const accuracy = context.totalQuestions > 0
          ? (context.totalCorrectAnswers / context.totalQuestions) * 100
          : 0;
        return accuracy >= condition.percentage;

      case 'streak_days':
        return context.currentStreak >= condition.days;

      case 'crowned_nodes':
        return context.crownedCount >= condition.count;

      case 'era_completed':
        return context.completedArcIds.includes(condition.arcId);

      case 'total_xp':
        return context.totalXp >= condition.amount;

      case 'rank_achieved':
        return context.currentRank === condition.rank;

      case 'arcade_games_played':
        return context.arcadeGamesPlayed >= condition.count;

      case 'all_node_types_played':
        return ALL_NODE_TYPES.every(type => context.playedNodeTypes.includes(type));

      case 'boss_nodes_defeated':
        return context.bossNodesDefeated >= condition.count;

      default:
        return false;
    }
  }, []);

  // Check all badges and return newly unlocked ones
  const checkForNewBadges = useCallback((): Badge[] => {
    const earnedBadgeIds = new Set(earnedBadges.map(eb => eb.badgeId));
    const context = buildCheckContext();
    const newlyUnlocked: Badge[] = [];

    for (const badge of badges) {
      if (earnedBadgeIds.has(badge.id)) continue;
      if (checkCondition(badge.unlockCondition, context)) {
        newlyUnlocked.push(badge);
      }
    }

    return newlyUnlocked;
  }, [earnedBadges, buildCheckContext, checkCondition]);

  // Process and award new badges, returns the first one for celebration
  const processNewBadges = useCallback((): Badge | null => {
    const newBadges = checkForNewBadges();

    if (newBadges.length > 0) {
      // Award all new badges
      newBadges.forEach(badge => {
        addEarnedBadge({
          badgeId: badge.id,
          earnedAt: new Date().toISOString(),
          isNew: true,
        });
      });

      // Return the first badge for celebration
      return newBadges[0];
    }

    return null;
  }, [checkForNewBadges, addEarnedBadge]);

  // Get progress toward a specific badge
  const getBadgeProgress = useCallback((badge: Badge): { current: number; target: number } | null => {
    const context = buildCheckContext();
    const condition = badge.unlockCondition;

    switch (condition.type) {
      case 'chapters_completed':
        return { current: context.completedChaptersCount, target: condition.count };

      case 'arcs_completed':
        return { current: context.completedArcsCount, target: condition.count };

      case 'perfect_scores':
        return { current: context.perfectScoreCount, target: condition.count };

      case 'streak_days':
        return { current: context.currentStreak, target: condition.days };

      case 'crowned_nodes':
        return { current: context.crownedCount, target: condition.count };

      case 'arcade_games_played':
        return { current: context.arcadeGamesPlayed, target: condition.count };

      case 'boss_nodes_defeated':
        return { current: context.bossNodesDefeated, target: condition.count };

      case 'accuracy_threshold':
        return { current: context.totalQuizAttempts, target: condition.minAttempts };

      default:
        return null;
    }
  }, [buildCheckContext]);

  // Check if a badge is earned
  const isBadgeEarned = useCallback((badgeId: string): boolean => {
    return earnedBadges.some(eb => eb.badgeId === badgeId);
  }, [earnedBadges]);

  // Get earned badge data
  const getEarnedBadgeData = useCallback((badgeId: string): EarnedBadge | undefined => {
    return earnedBadges.find(eb => eb.badgeId === badgeId);
  }, [earnedBadges]);

  // Get count of new (unseen) badges
  const newBadgeCount = useMemo(() => {
    return earnedBadges.filter(eb => eb.isNew).length;
  }, [earnedBadges]);

  return {
    checkForNewBadges,
    processNewBadges,
    getBadgeProgress,
    isBadgeEarned,
    getEarnedBadgeData,
    newBadgeCount,
    earnedBadges,
    buildCheckContext,
  };
}

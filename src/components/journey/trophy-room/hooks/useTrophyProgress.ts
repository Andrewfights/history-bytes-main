/**
 * useTrophyProgress - Track completion progress across all eras
 */

import { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { arcs } from '@/data/journeyData';
import { Arc } from '@/types';

export interface EraProgress {
  arc: Arc;
  isCompleted: boolean;
  chaptersCompleted: number;
  totalChapters: number;
  nodesCompleted: number;
  totalNodes: number;
  xpEarned: number;
  progressPercentage: number;
}

export interface TrophyStats {
  totalEras: number;
  completedEras: number;
  totalXPEarned: number;
  totalXPPossible: number;
  overallProgress: number;
}

export function useTrophyProgress() {
  const { isJourneyNodeCompleted, completedJourneyNodes } = useApp();

  // Calculate progress for each era
  const eraProgress = useMemo((): EraProgress[] => {
    return arcs.map((arc) => {
      let nodesCompleted = 0;
      let totalNodes = 0;
      let chaptersCompleted = 0;

      arc.chapters.forEach((chapter) => {
        const chapterNodes = chapter.nodes || [];
        totalNodes += chapterNodes.length;

        const completedInChapter = chapterNodes.filter((node) =>
          isJourneyNodeCompleted(node.id)
        ).length;
        nodesCompleted += completedInChapter;

        // Chapter is complete if all nodes are complete
        if (chapterNodes.length > 0 && completedInChapter === chapterNodes.length) {
          chaptersCompleted++;
        }
      });

      const isCompleted = totalNodes > 0 && nodesCompleted === totalNodes;
      const progressPercentage = totalNodes > 0 ? Math.round((nodesCompleted / totalNodes) * 100) : 0;
      const xpEarned = isCompleted ? arc.totalXP : Math.round(arc.totalXP * (progressPercentage / 100));

      return {
        arc,
        isCompleted,
        chaptersCompleted,
        totalChapters: arc.chapters.length,
        nodesCompleted,
        totalNodes,
        xpEarned,
        progressPercentage,
      };
    });
  }, [arcs, isJourneyNodeCompleted, completedJourneyNodes]);

  // Calculate overall stats
  const trophyStats = useMemo((): TrophyStats => {
    const completedEras = eraProgress.filter((e) => e.isCompleted).length;
    const totalXPEarned = eraProgress.reduce((sum, e) => sum + e.xpEarned, 0);
    const totalXPPossible = arcs.reduce((sum, arc) => sum + arc.totalXP, 0);
    const overallProgress = arcs.length > 0 ? Math.round((completedEras / arcs.length) * 100) : 0;

    return {
      totalEras: arcs.length,
      completedEras,
      totalXPEarned,
      totalXPPossible,
      overallProgress,
    };
  }, [eraProgress]);

  // Get progress for a specific era
  const getEraProgress = (arcId: string): EraProgress | undefined => {
    return eraProgress.find((e) => e.arc.id === arcId);
  };

  // Check if a specific era is completed
  const isEraCompleted = (arcId: string): boolean => {
    const progress = getEraProgress(arcId);
    return progress?.isCompleted ?? false;
  };

  return {
    eraProgress,
    trophyStats,
    getEraProgress,
    isEraCompleted,
  };
}

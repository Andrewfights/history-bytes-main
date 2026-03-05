// Random selection utilities for "I'm Feeling Lucky" feature
import { arcs } from '@/data/journeyData';
import { Arc, JourneyChapter, JourneyNode, JourneyNodeType } from '@/types';

export interface RandomResult {
  arc: Arc;
  chapter: JourneyChapter;
  node: JourneyNode;
}

interface RandomOptions {
  excludeCompleted?: string[];
  preferredTypes?: JourneyNodeType[];
  excludeBoss?: boolean;
}

/**
 * Get a random playable node from all available arcs
 */
export function getRandomPlayableNode(options: RandomOptions = {}): RandomResult | null {
  const { excludeCompleted = [], preferredTypes, excludeBoss = false } = options;

  // Gather all nodes with their arc/chapter context
  const allNodes: RandomResult[] = [];

  for (const arc of arcs) {
    for (const chapter of arc.chapters) {
      for (const node of chapter.nodes) {
        // Skip completed nodes if specified
        if (excludeCompleted.includes(node.id)) continue;

        // Skip boss nodes if specified
        if (excludeBoss && node.type === 'boss') continue;

        // Filter by preferred types if specified
        if (preferredTypes && preferredTypes.length > 0) {
          if (!preferredTypes.includes(node.type)) continue;
        }

        allNodes.push({ arc, chapter, node });
      }
    }
  }

  if (allNodes.length === 0) {
    // If no nodes match criteria, return any random node
    return getRandomNodeFallback();
  }

  // Weight selection (boss nodes are rarer)
  const weightedNodes = allNodes.flatMap((item) => {
    const weight = item.node.type === 'boss' ? 1 : 3;
    return Array(weight).fill(item);
  });

  const randomIndex = Math.floor(Math.random() * weightedNodes.length);
  return weightedNodes[randomIndex];
}

/**
 * Fallback: get any random node without filters
 */
function getRandomNodeFallback(): RandomResult | null {
  const allNodes: RandomResult[] = [];

  for (const arc of arcs) {
    for (const chapter of arc.chapters) {
      for (const node of chapter.nodes) {
        allNodes.push({ arc, chapter, node });
      }
    }
  }

  if (allNodes.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * allNodes.length);
  return allNodes[randomIndex];
}

/**
 * Get a random arc
 */
export function getRandomArc(): Arc | null {
  if (arcs.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * arcs.length);
  return arcs[randomIndex];
}

/**
 * Get total count of all nodes
 */
export function getTotalNodeCount(): number {
  return arcs.reduce((total, arc) =>
    total + arc.chapters.reduce((chTotal, ch) => chTotal + ch.nodes.length, 0), 0
  );
}

/**
 * Get count of unplayed nodes
 */
export function getUnplayedNodeCount(completedNodes: string[]): number {
  let count = 0;
  for (const arc of arcs) {
    for (const chapter of arc.chapters) {
      for (const node of chapter.nodes) {
        if (!completedNodes.includes(node.id)) {
          count++;
        }
      }
    }
  }
  return count;
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random items from array
 */
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

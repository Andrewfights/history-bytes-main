import { Badge, BadgeCategory, BadgeRarity } from '@/types/badges';

export const badges: Badge[] = [
  // ============================================
  // PROGRESS BADGES (6)
  // ============================================
  {
    id: 'first-steps',
    name: 'First Steps',
    description: 'Complete your first chapter',
    icon: '👣',
    category: 'progress',
    rarity: 'common',
    unlockCondition: { type: 'chapters_completed', count: 1 },
    xpBonus: 25,
  },
  {
    id: 'era-explorer',
    name: 'Era Explorer',
    description: 'Complete your first arc',
    icon: '🗺️',
    category: 'progress',
    rarity: 'uncommon',
    unlockCondition: { type: 'arcs_completed', count: 1 },
    xpBonus: 100,
  },
  {
    id: 'chapter-collector',
    name: 'Chapter Collector',
    description: 'Complete 10 chapters',
    icon: '📖',
    category: 'progress',
    rarity: 'uncommon',
    unlockCondition: { type: 'chapters_completed', count: 10 },
    xpBonus: 75,
  },
  {
    id: 'chapter-master',
    name: 'Chapter Master',
    description: 'Complete 25 chapters',
    icon: '📚',
    category: 'progress',
    rarity: 'rare',
    unlockCondition: { type: 'chapters_completed', count: 25 },
    xpBonus: 150,
  },
  {
    id: 'arc-conqueror',
    name: 'Arc Conqueror',
    description: 'Complete 3 full arcs',
    icon: '⚔️',
    category: 'progress',
    rarity: 'rare',
    unlockCondition: { type: 'arcs_completed', count: 3 },
    xpBonus: 200,
  },
  {
    id: 'history-scholar',
    name: 'History Scholar',
    description: 'Complete 5 full arcs',
    icon: '🎓',
    category: 'progress',
    rarity: 'epic',
    unlockCondition: { type: 'arcs_completed', count: 5 },
    xpBonus: 500,
  },

  // ============================================
  // PERFORMANCE BADGES (6)
  // ============================================
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Get your first perfect score',
    icon: '💯',
    category: 'performance',
    rarity: 'common',
    unlockCondition: { type: 'perfect_score' },
    xpBonus: 25,
  },
  {
    id: 'flawless-five',
    name: 'Flawless Five',
    description: 'Get 5 perfect scores',
    icon: '⭐',
    category: 'performance',
    rarity: 'uncommon',
    unlockCondition: { type: 'perfect_scores', count: 5 },
    xpBonus: 75,
  },
  {
    id: 'accuracy-ace',
    name: 'Accuracy Ace',
    description: 'Maintain 90%+ accuracy over 20 quizzes',
    icon: '🎯',
    category: 'performance',
    rarity: 'rare',
    unlockCondition: { type: 'accuracy_threshold', percentage: 90, minAttempts: 20 },
    xpBonus: 150,
  },
  {
    id: 'sharp-shooter',
    name: 'Sharp Shooter',
    description: 'Maintain 95%+ accuracy over 50 quizzes',
    icon: '🔫',
    category: 'performance',
    rarity: 'epic',
    unlockCondition: { type: 'accuracy_threshold', percentage: 95, minAttempts: 50 },
    xpBonus: 300,
  },
  {
    id: 'boss-slayer',
    name: 'Boss Slayer',
    description: 'Defeat your first boss node',
    icon: '🐉',
    category: 'performance',
    rarity: 'uncommon',
    unlockCondition: { type: 'boss_nodes_defeated', count: 1 },
    xpBonus: 50,
  },
  {
    id: 'boss-hunter',
    name: 'Boss Hunter',
    description: 'Defeat 5 boss nodes',
    icon: '🏹',
    category: 'performance',
    rarity: 'rare',
    unlockCondition: { type: 'boss_nodes_defeated', count: 5 },
    xpBonus: 150,
  },

  // ============================================
  // ENGAGEMENT BADGES (7)
  // ============================================
  {
    id: 'streak-starter',
    name: 'Streak Starter',
    description: 'Reach a 3-day streak',
    icon: '🔥',
    category: 'engagement',
    rarity: 'common',
    unlockCondition: { type: 'streak_days', days: 3 },
    xpBonus: 25,
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    description: 'Reach a 7-day streak',
    icon: '⚡',
    category: 'engagement',
    rarity: 'uncommon',
    unlockCondition: { type: 'streak_days', days: 7 },
    xpBonus: 75,
  },
  {
    id: 'fortnight-fighter',
    name: 'Fortnight Fighter',
    description: 'Reach a 14-day streak',
    icon: '💪',
    category: 'engagement',
    rarity: 'rare',
    unlockCondition: { type: 'streak_days', days: 14 },
    xpBonus: 150,
  },
  {
    id: 'monthly-master',
    name: 'Monthly Master',
    description: 'Reach a 30-day streak',
    icon: '🌟',
    category: 'engagement',
    rarity: 'epic',
    unlockCondition: { type: 'streak_days', days: 30 },
    xpBonus: 300,
  },
  {
    id: 'century-champion',
    name: 'Century Champion',
    description: 'Reach a 100-day streak',
    icon: '🏆',
    category: 'engagement',
    rarity: 'legendary',
    unlockCondition: { type: 'streak_days', days: 100 },
    xpBonus: 1000,
  },
  {
    id: 'arcade-fan',
    name: 'Arcade Fan',
    description: 'Play 10 arcade games',
    icon: '🕹️',
    category: 'engagement',
    rarity: 'common',
    unlockCondition: { type: 'arcade_games_played', count: 10 },
    xpBonus: 25,
  },
  {
    id: 'variety-seeker',
    name: 'Variety Seeker',
    description: 'Play all node types at least once',
    icon: '🎭',
    category: 'engagement',
    rarity: 'uncommon',
    unlockCondition: { type: 'all_node_types_played' },
    xpBonus: 50,
  },

  // ============================================
  // MASTERY BADGES (6)
  // ============================================
  {
    id: 'first-crown',
    name: 'First Crown',
    description: 'Crown your first node with a perfect score',
    icon: '👑',
    category: 'mastery',
    rarity: 'common',
    unlockCondition: { type: 'crowned_nodes', count: 1 },
    xpBonus: 25,
  },
  {
    id: 'crown-collector',
    name: 'Crown Collector',
    description: 'Crown 10 nodes',
    icon: '💎',
    category: 'mastery',
    rarity: 'uncommon',
    unlockCondition: { type: 'crowned_nodes', count: 10 },
    xpBonus: 100,
  },
  {
    id: 'crown-king',
    name: 'Crown King',
    description: 'Crown 25 nodes',
    icon: '🏰',
    category: 'mastery',
    rarity: 'rare',
    unlockCondition: { type: 'crowned_nodes', count: 25 },
    xpBonus: 250,
  },
  {
    id: 'revolutionary',
    name: 'Revolutionary',
    description: 'Complete the French Revolution arc',
    icon: '🇫🇷',
    category: 'mastery',
    rarity: 'rare',
    unlockCondition: { type: 'era_completed', arcId: 'french-revolution' },
    xpBonus: 200,
  },
  {
    id: 'war-historian',
    name: 'War Historian',
    description: 'Complete the World War II arc',
    icon: '🪖',
    category: 'mastery',
    rarity: 'rare',
    unlockCondition: { type: 'era_completed', arcId: 'world-war-2' },
    xpBonus: 200,
  },
  {
    id: 'rhodes-achiever',
    name: 'Rhodes Achiever',
    description: 'Reach the Rhodes Scholar rank',
    icon: '🎖️',
    category: 'mastery',
    rarity: 'legendary',
    unlockCondition: { type: 'rank_achieved', rank: 'Rhodes Scholar' },
    xpBonus: 1000,
  },

  // ============================================
  // PEARL HARBOR FINAL EXAM BADGES (3)
  // ============================================
  {
    id: 'pearl-harbor-scholar',
    name: 'Pearl Harbor Scholar',
    description: 'Score 15/15 on the Pearl Harbor Final Exam',
    icon: '🏅',
    category: 'mastery',
    rarity: 'legendary',
    unlockCondition: { type: 'exam_score', examId: 'pearl-harbor', minScore: 15 },
    xpBonus: 150,
  },
  {
    id: 'pearl-harbor-expert',
    name: 'Pearl Harbor Expert',
    description: 'Score 12+ on the Pearl Harbor Final Exam',
    icon: '🎖️',
    category: 'mastery',
    rarity: 'epic',
    unlockCondition: { type: 'exam_score', examId: 'pearl-harbor', minScore: 12 },
    xpBonus: 100,
  },
  {
    id: 'pearl-harbor-historian',
    name: 'Pearl Harbor Historian',
    description: 'Score 9+ on the Pearl Harbor Final Exam',
    icon: '📜',
    category: 'mastery',
    rarity: 'rare',
    unlockCondition: { type: 'exam_score', examId: 'pearl-harbor', minScore: 9 },
    xpBonus: 50,
  },
];

// Helper functions
export function getBadgeById(id: string): Badge | undefined {
  return badges.find(b => b.id === id);
}

export function getBadgesByCategory(category: BadgeCategory): Badge[] {
  return badges.filter(b => b.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): Badge[] {
  return badges.filter(b => b.rarity === rarity);
}

export function getTotalBadgeCount(): number {
  return badges.length;
}

export function getBadgeCountByCategory(): Record<BadgeCategory, number> {
  return {
    progress: badges.filter(b => b.category === 'progress').length,
    performance: badges.filter(b => b.category === 'performance').length,
    engagement: badges.filter(b => b.category === 'engagement').length,
    mastery: badges.filter(b => b.category === 'mastery').length,
  };
}

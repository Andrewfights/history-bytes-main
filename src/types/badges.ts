// Badge System Types

export type BadgeCategory = 'progress' | 'performance' | 'engagement' | 'mastery';
export type BadgeRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type BadgeUnlockCondition =
  | { type: 'first_chapter' }
  | { type: 'first_arc' }
  | { type: 'chapters_completed'; count: number }
  | { type: 'arcs_completed'; count: number }
  | { type: 'perfect_score' }
  | { type: 'perfect_scores'; count: number }
  | { type: 'accuracy_threshold'; percentage: number; minAttempts: number }
  | { type: 'streak_days'; days: number }
  | { type: 'crowned_nodes'; count: number }
  | { type: 'era_completed'; arcId: string }
  | { type: 'total_xp'; amount: number }
  | { type: 'rank_achieved'; rank: string }
  | { type: 'arcade_games_played'; count: number }
  | { type: 'all_node_types_played' }
  | { type: 'boss_nodes_defeated'; count: number };

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  rarity: BadgeRarity;
  unlockCondition: BadgeUnlockCondition;
  xpBonus?: number;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
  isNew: boolean;
}

// Context for checking badge conditions
export interface BadgeCheckContext {
  completedChaptersCount: number;
  completedArcsCount: number;
  completedArcIds: string[];
  crownedCount: number;
  perfectScoreCount: number;
  currentStreak: number;
  totalXp: number;
  currentRank: string;
  arcadeGamesPlayed: number;
  playedNodeTypes: string[];
  bossNodesDefeated: number;
  totalQuizAttempts: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

// Rarity display config
export const RARITY_CONFIG: Record<BadgeRarity, { color: string; bgColor: string; label: string }> = {
  common: { color: 'text-slate-400', bgColor: 'bg-slate-500/20', label: 'Common' },
  uncommon: { color: 'text-green-400', bgColor: 'bg-green-500/20', label: 'Uncommon' },
  rare: { color: 'text-blue-400', bgColor: 'bg-blue-500/20', label: 'Rare' },
  epic: { color: 'text-purple-400', bgColor: 'bg-purple-500/20', label: 'Epic' },
  legendary: { color: 'text-amber-400', bgColor: 'bg-amber-500/20', label: 'Legendary' },
};

// Category display config
export const CATEGORY_CONFIG: Record<BadgeCategory, { icon: string; label: string; color: string }> = {
  progress: { icon: '📈', label: 'Progress', color: 'text-emerald-400' },
  performance: { icon: '🎯', label: 'Performance', color: 'text-cyan-400' },
  engagement: { icon: '🔥', label: 'Engagement', color: 'text-orange-400' },
  mastery: { icon: '👑', label: 'Mastery', color: 'text-amber-400' },
};

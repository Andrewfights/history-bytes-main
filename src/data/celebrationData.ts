// Celebration content for milestone achievements
import { Rank, RANK_DATA } from '@/types';

export type MilestoneType = 'chapter' | 'arc' | 'rank' | 'streak' | 'crown' | 'perfect';

export interface MilestoneContent {
  type: MilestoneType;
  title: string;
  subtitle?: string;
  message: string;
  emoji: string;
  xpBonus?: number;
}

// Chapter completion celebrations
export const chapterCelebrations: Record<string, MilestoneContent> = {
  // WWII Arc - Chapter 1
  'ww2-road-to-war': {
    type: 'chapter',
    title: 'Chapter Complete!',
    subtitle: 'Road to War Mastered',
    message: 'Outstanding work! You now understand how the world marched toward conflict.',
    emoji: '📜',
  },
  // WWII Arc - Chapter 2
  'ww2-blitzkrieg': {
    type: 'chapter',
    title: 'Chapter Complete!',
    subtitle: 'Blitzkrieg Mastered',
    message: 'Lightning warfare tactics are now part of your historical arsenal!',
    emoji: '⚡',
  },
  // WWII Arc - Chapter 3
  'ww2-turning-tides': {
    type: 'chapter',
    title: 'Chapter Complete!',
    subtitle: 'Turning Tides Mastered',
    message: 'You witnessed the pivotal moments that changed the course of history.',
    emoji: '🌊',
  },
  // Default for unmapped chapters
  default: {
    type: 'chapter',
    title: 'Chapter Complete!',
    subtitle: 'Knowledge Unlocked',
    message: 'Another chapter of history added to your expertise!',
    emoji: '📚',
  },
};

// Arc completion celebrations
export const arcCelebrations: Record<string, MilestoneContent> = {
  'arc-ww2': {
    type: 'arc',
    title: 'Arc Complete!',
    subtitle: 'World War II Expert',
    message: 'You have mastered the defining conflict of the 20th century. The lessons of history are yours to carry forward.',
    emoji: '🏆',
    xpBonus: 500,
  },
  'arc-ancient-rome': {
    type: 'arc',
    title: 'Arc Complete!',
    subtitle: 'Roman Scholar',
    message: 'From Republic to Empire, you have conquered Roman history!',
    emoji: '🏛️',
    xpBonus: 500,
  },
  'arc-french-revolution': {
    type: 'arc',
    title: 'Arc Complete!',
    subtitle: 'Revolutionary',
    message: 'Liberté, égalité, fraternité! You understand the birth of modern democracy.',
    emoji: '⚔️',
    xpBonus: 500,
  },
  default: {
    type: 'arc',
    title: 'Arc Complete!',
    subtitle: 'Era Mastered',
    message: 'An entire era of history is now part of your knowledge!',
    emoji: '🎖️',
    xpBonus: 500,
  },
};

// Rank up celebrations
export const rankCelebrations: Record<Rank, MilestoneContent> = {
  'Time Tourist': {
    type: 'rank',
    title: 'Welcome, Traveler!',
    subtitle: 'Time Tourist',
    message: 'Your journey through history begins now!',
    emoji: '🎫',
  },
  'Archive Apprentice': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Archive Apprentice',
    message: 'The archives await your curious mind.',
    emoji: '📚',
  },
  'Fact Finder': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Fact Finder',
    message: 'Your detective skills are sharpening!',
    emoji: '🔍',
  },
  'Chronicle Cadet': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Chronicle Cadet',
    message: 'The scrolls recognize your dedication.',
    emoji: '📜',
  },
  'Era Explorer': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Era Explorer',
    message: 'Time and space are your playground!',
    emoji: '🧭',
  },
  'Timeline Tracker': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Timeline Tracker',
    message: 'Past, present, future — all connect through you.',
    emoji: '⏳',
  },
  'Historical Detective': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Historical Detective',
    message: 'No mystery of the past can escape your investigation!',
    emoji: '🕵️',
  },
  'Myth Breaker': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Myth Breaker',
    message: 'You separate fact from fiction with precision.',
    emoji: '💡',
  },
  'Primary Source Specialist': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Primary Source Specialist',
    message: 'Original documents reveal their secrets to you.',
    emoji: '📰',
  },
  'Master of Eras': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Master of Eras',
    message: 'Centuries bow to your expertise!',
    emoji: '🏛️',
  },
  'Archive Architect': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Archive Architect',
    message: 'You build bridges between ages.',
    emoji: '🗂️',
  },
  'Cultural Cartographer': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Cultural Cartographer',
    message: 'The map of humanity is yours to chart!',
    emoji: '🗺️',
  },
  'Historian': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Historian',
    message: 'A true scholar of the ages! Your knowledge commands respect.',
    emoji: '🎓',
  },
  'Distinguished Historian': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Distinguished Historian',
    message: 'Your expertise is recognized across the academy!',
    emoji: '⭐',
  },
  'Grand Historian': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Grand Historian',
    message: 'Few have reached such heights of historical mastery!',
    emoji: '👑',
  },
  'Legendary Historian': {
    type: 'rank',
    title: 'Rank Up!',
    subtitle: 'Legendary Historian',
    message: 'Your name will echo through time itself!',
    emoji: '🏆',
  },
  'Rhodes Scholar': {
    type: 'rank',
    title: 'Ultimate Achievement!',
    subtitle: 'Rhodes Scholar',
    message: 'The pinnacle of historical excellence. You are a true master!',
    emoji: '🎖️',
  },
};

// Streak milestone celebrations
export const streakCelebrations: Record<number, MilestoneContent> = {
  3: {
    type: 'streak',
    title: '3-Day Streak!',
    subtitle: 'Getting Started',
    message: "You're on fire! Keep the momentum going!",
    emoji: '🔥',
    xpBonus: 25,
  },
  7: {
    type: 'streak',
    title: 'Week Warrior!',
    subtitle: '7-Day Streak',
    message: 'A full week of learning history! Impressive dedication.',
    emoji: '⚡',
    xpBonus: 50,
  },
  14: {
    type: 'streak',
    title: 'Two-Week Champion!',
    subtitle: '14-Day Streak',
    message: 'Two weeks strong! History is becoming second nature.',
    emoji: '💪',
    xpBonus: 100,
  },
  30: {
    type: 'streak',
    title: 'Monthly Master!',
    subtitle: '30-Day Streak',
    message: 'A full month of daily history! You are unstoppable!',
    emoji: '🌟',
    xpBonus: 200,
  },
  60: {
    type: 'streak',
    title: 'Dedicated Scholar!',
    subtitle: '60-Day Streak',
    message: 'Two months of pure dedication. The ancients would be proud!',
    emoji: '🏅',
    xpBonus: 300,
  },
  100: {
    type: 'streak',
    title: 'Century Achiever!',
    subtitle: '100-Day Streak',
    message: '100 days! You have achieved legendary status!',
    emoji: '💯',
    xpBonus: 500,
  },
  365: {
    type: 'streak',
    title: 'Year of History!',
    subtitle: '365-Day Streak',
    message: 'A full year of daily learning! You are a true historian!',
    emoji: '🎊',
    xpBonus: 1000,
  },
};

// Perfect score celebration
export const perfectScoreCelebration: MilestoneContent = {
  type: 'perfect',
  title: 'Perfect Score!',
  subtitle: 'Flawless Victory',
  message: 'Not a single mistake! Your knowledge is impeccable.',
  emoji: '💎',
  xpBonus: 25,
};

// First crown celebration
export const firstCrownCelebration: MilestoneContent = {
  type: 'crown',
  title: 'First Crown!',
  subtitle: 'Mastery Achieved',
  message: 'You have crowned your first node! Many more await.',
  emoji: '👑',
  xpBonus: 50,
};

// Helper functions
export function getChapterCelebration(chapterId: string): MilestoneContent {
  return chapterCelebrations[chapterId] || chapterCelebrations.default;
}

export function getArcCelebration(arcId: string): MilestoneContent {
  return arcCelebrations[arcId] || arcCelebrations.default;
}

export function getRankCelebration(rank: Rank): MilestoneContent {
  return rankCelebrations[rank];
}

export function getStreakCelebration(streak: number): MilestoneContent | null {
  // Check for exact milestone match
  if (streakCelebrations[streak]) {
    return streakCelebrations[streak];
  }
  return null;
}

export function getStreakMilestones(): number[] {
  return Object.keys(streakCelebrations).map(Number).sort((a, b) => a - b);
}

export function getNextStreakMilestone(currentStreak: number): number | null {
  const milestones = getStreakMilestones();
  return milestones.find(m => m > currentStreak) || null;
}

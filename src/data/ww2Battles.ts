/**
 * WW2 Theater Battle Data
 * Defines all 10 battles across Pacific and European theaters
 */

import { WW2Battle, WW2Theater } from '@/types';

export const WW2_BATTLES: WW2Battle[] = [
  // ===============================
  // PACIFIC THEATER (5 battles)
  // ===============================
  {
    id: 'pearl-harbor',
    theater: 'pacific',
    name: 'Pearl Harbor',
    subtitle: 'December 7, 1941',
    imageUrl: '/assets/ww2-battles/pearl-harbor.png',
    order: 1,
    globalOrder: 1,
    lessonCount: 7,
    xpReward: 350,
    description: 'The attack that brought America into the war',
    unlockRequirement: null,
    isFirstStop: true,
  },
  {
    id: 'midway',
    theater: 'pacific',
    name: 'Midway',
    subtitle: 'June 4-7, 1942',
    imageUrl: '/assets/ww2-battles/midway.png',
    order: 2,
    globalOrder: 2,
    lessonCount: 5,
    xpReward: 275,
    description: 'The turning point in the Pacific',
    unlockRequirement: 'pearl-harbor',
  },
  {
    id: 'guadalcanal',
    theater: 'pacific',
    name: 'Guadalcanal',
    subtitle: 'August 1942 - February 1943',
    imageUrl: '/assets/ww2-battles/guadalcanal.png',
    order: 3,
    globalOrder: 3,
    lessonCount: 5,
    xpReward: 275,
    description: "America's first major offensive",
    unlockRequirement: 'midway',
  },
  {
    id: 'leyte-gulf',
    theater: 'pacific',
    name: 'Leyte Gulf',
    subtitle: 'October 23-26, 1944',
    imageUrl: '/assets/ww2-battles/leyte-gulf.png',
    order: 4,
    globalOrder: 4,
    lessonCount: 5,
    xpReward: 275,
    description: 'The largest naval battle in history',
    unlockRequirement: 'guadalcanal',
  },
  {
    id: 'okinawa',
    theater: 'pacific',
    name: 'Okinawa',
    subtitle: 'April 1 - June 22, 1945',
    imageUrl: '/assets/ww2-battles/okinawa.jpg',
    order: 5,
    globalOrder: 5,
    lessonCount: 5,
    xpReward: 300,
    description: 'The bloodiest battle of the Pacific',
    unlockRequirement: 'leyte-gulf',
  },

  // ===============================
  // EUROPEAN THEATER (5 battles)
  // ===============================
  {
    id: 'barbarossa',
    theater: 'european',
    name: 'Barbarossa',
    subtitle: 'June - December 1941',
    imageUrl: '/assets/ww2-battles/barbarossa.jpg',
    order: 1,
    globalOrder: 6,
    lessonCount: 5,
    xpReward: 275,
    description: 'Germany invades the Soviet Union',
    unlockRequirement: 'pearl-harbor',
  },
  {
    id: 'stalingrad',
    theater: 'european',
    name: 'Stalingrad',
    subtitle: 'August 1942 - February 1943',
    imageUrl: '/assets/ww2-battles/stalingrad.jpg',
    order: 2,
    globalOrder: 7,
    lessonCount: 6,
    xpReward: 325,
    description: 'The turning point on the Eastern Front',
    unlockRequirement: 'barbarossa',
  },
  {
    id: 'd-day',
    theater: 'european',
    name: 'D-Day',
    subtitle: 'June 6, 1944',
    imageUrl: '/assets/ww2-battles/d-day.png',
    order: 3,
    globalOrder: 8,
    lessonCount: 7,
    xpReward: 375,
    description: 'The invasion of Normandy',
    unlockRequirement: 'stalingrad',
  },
  {
    id: 'bulge',
    theater: 'european',
    name: 'Bulge',
    subtitle: 'December 1944 - January 1945',
    imageUrl: '/assets/ww2-battles/bulge.png',
    order: 4,
    globalOrder: 9,
    lessonCount: 5,
    xpReward: 275,
    description: "Germany's last major offensive",
    unlockRequirement: 'd-day',
  },
  {
    id: 'berlin',
    theater: 'european',
    name: 'Berlin',
    subtitle: 'April 16 - May 2, 1945',
    imageUrl: '/assets/ww2-battles/berlin.png',
    order: 5,
    globalOrder: 10,
    lessonCount: 5,
    xpReward: 300,
    description: 'The fall of the Third Reich',
    unlockRequirement: 'bulge',
  },
];

// Helper functions

export function getBattleById(id: string): WW2Battle | undefined {
  return WW2_BATTLES.find((battle) => battle.id === id);
}

export function getBattlesByTheater(theater: WW2Theater): WW2Battle[] {
  return WW2_BATTLES.filter((battle) => battle.theater === theater).sort(
    (a, b) => a.order - b.order
  );
}

export function getNextBattle(currentId: string): WW2Battle | undefined {
  const current = getBattleById(currentId);
  if (!current) return undefined;

  // Find next battle in same theater
  const theaterBattles = getBattlesByTheater(current.theater);
  const nextInTheater = theaterBattles.find(
    (b) => b.order === current.order + 1
  );
  if (nextInTheater) return nextInTheater;

  return undefined;
}

export function isBattleUnlocked(
  battleId: string,
  completedBattles: string[]
): boolean {
  const battle = getBattleById(battleId);
  if (!battle) return false;

  // Pearl Harbor is always unlocked (first stop)
  if (battle.isFirstStop) return true;

  // Check if unlock requirement is met
  if (battle.unlockRequirement) {
    return completedBattles.includes(battle.unlockRequirement);
  }

  return true;
}

export function getTheaterStats(
  theater: WW2Theater,
  completedBattles: string[]
): { completed: number; total: number; totalXP: number } {
  const battles = getBattlesByTheater(theater);
  const completed = battles.filter((b) =>
    completedBattles.includes(b.id)
  ).length;
  const totalXP = battles.reduce((sum, b) => sum + b.xpReward, 0);

  return { completed, total: battles.length, totalXP };
}

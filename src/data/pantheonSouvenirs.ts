/**
 * Pantheon Souvenir Room - World-level trophy system
 *
 * Each historical world has one signature souvenir that upgrades through
 * 4 material tiers based on Arena/exam performance.
 */

import type { Souvenir, PantheonWorld, SouvenirTier } from '@/types';

// ---- Souvenir Definitions ----

export const PANTHEON_SOUVENIRS: Souvenir[] = [
  {
    id: 'ww2-m1-helmet',
    worldId: 'ww2',
    name: 'M1 Combat Helmet',
    description: 'The iconic "steel pot" worn by every American GI across every theater of World War II. This helmet protected soldiers from Normandy to Okinawa.',
    significance: 'Symbol of the American soldier — every theater, every battle, every sacrifice.',
    images: {
      gray: '/assets/pantheon/ww2-helmet-gray.png',
      bronze: '/assets/pantheon/ww2-helmet-bronze.png',
      silver: '/assets/pantheon/ww2-helmet-silver.png',
      gold: '/assets/pantheon/ww2-helmet-gold.png',
    },
  },
  // Future souvenirs (coming soon)
  {
    id: 'rev-war-bayonet',
    worldId: 'revolutionary-war',
    name: 'Revolutionary Bayonet',
    description: 'Emblem of the citizen-soldier who fought for independence with close-quarters determination.',
    significance: 'The blade that helped forge a nation.',
    images: {
      gray: '/assets/pantheon/rev-war-bayonet-gray.png',
      bronze: '/assets/pantheon/rev-war-bayonet-bronze.png',
      silver: '/assets/pantheon/rev-war-bayonet-silver.png',
      gold: '/assets/pantheon/rev-war-bayonet-gold.png',
    },
  },
  {
    id: 'egypt-ankh',
    worldId: 'ancient-egypt',
    name: 'Ankh',
    description: 'The ancient Egyptian symbol of life, carried by pharaohs and gods alike.',
    significance: 'Symbol of life and the eternal legacy of the Nile civilization.',
    images: {
      gray: '/assets/pantheon/egypt-ankh-gray.png',
      bronze: '/assets/pantheon/egypt-ankh-bronze.png',
      silver: '/assets/pantheon/egypt-ankh-silver.png',
      gold: '/assets/pantheon/egypt-ankh-gold.png',
    },
  },
  {
    id: 'viking-helmet',
    worldId: 'viking-age',
    name: 'Viking Helmet',
    description: 'The spectacle-guard helmet of Norse warriors who explored and conquered distant shores.',
    significance: 'Exploration, seafaring, and Norse resilience.',
    images: {
      gray: '/assets/pantheon/viking-helmet-gray.png',
      bronze: '/assets/pantheon/viking-helmet-bronze.png',
      silver: '/assets/pantheon/viking-helmet-silver.png',
      gold: '/assets/pantheon/viking-helmet-gold.png',
    },
  },
  {
    id: 'exploration-compass',
    worldId: 'age-of-exploration',
    name: "Navigator's Compass",
    description: 'The instrument that guided explorers across uncharted oceans to discover new worlds.',
    significance: 'Discovery, wayfinding, and charting the unknown.',
    images: {
      gray: '/assets/pantheon/exploration-compass-gray.png',
      bronze: '/assets/pantheon/exploration-compass-bronze.png',
      silver: '/assets/pantheon/exploration-compass-silver.png',
      gold: '/assets/pantheon/exploration-compass-gold.png',
    },
  },
];

// ---- World Definitions ----

export const PANTHEON_WORLDS: PantheonWorld[] = [
  {
    id: 'ww2',
    name: 'World War II',
    souvenirId: 'ww2-m1-helmet',
    order: 1,
    isAvailable: true,
  },
  {
    id: 'revolutionary-war',
    name: 'Revolutionary War',
    souvenirId: 'rev-war-bayonet',
    order: 2,
    isAvailable: false, // Coming soon
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    souvenirId: 'egypt-ankh',
    order: 3,
    isAvailable: false,
  },
  {
    id: 'viking-age',
    name: 'Viking Age',
    souvenirId: 'viking-helmet',
    order: 4,
    isAvailable: false,
  },
  {
    id: 'age-of-exploration',
    name: 'Age of Exploration',
    souvenirId: 'exploration-compass',
    order: 5,
    isAvailable: false,
  },
];

// ---- Helper Functions ----

export function getSouvenirById(id: string): Souvenir | undefined {
  return PANTHEON_SOUVENIRS.find(s => s.id === id);
}

export function getSouvenirByWorldId(worldId: string): Souvenir | undefined {
  return PANTHEON_SOUVENIRS.find(s => s.worldId === worldId);
}

export function getWorldById(id: string): PantheonWorld | undefined {
  return PANTHEON_WORLDS.find(w => w.id === id);
}

export function getAvailableWorlds(): PantheonWorld[] {
  return PANTHEON_WORLDS.filter(w => w.isAvailable);
}

/**
 * Calculate souvenir tier based on exam scores.
 * Maps Pearl Harbor exam scoring to souvenir tiers:
 * - Perfect (15/15, 100%) → Gold (Rhodes Scholar)
 * - Expert (12-14/15, 80-93%) → Silver (PhD)
 * - Historian (9-11/15, 60-73%) → Bronze (Master's)
 * - Below → Gray (Completion)
 */
export function calculateTierFromExamScore(score: number, total: number): SouvenirTier {
  const percentage = (score / total) * 100;

  if (percentage >= 100) return 'gold';    // Perfect score
  if (percentage >= 80) return 'silver';   // Expert level
  if (percentage >= 60) return 'bronze';   // Historian level
  return 'gray';                           // Completion
}

/**
 * Calculate best tier from multiple exam attempts.
 * Takes the highest tier achieved across all attempts.
 */
export function calculateBestTier(examScores: { score: number; total: number }[]): SouvenirTier {
  if (examScores.length === 0) return 'gray';

  const tiers: SouvenirTier[] = examScores.map(({ score, total }) =>
    calculateTierFromExamScore(score, total)
  );

  // Return highest tier achieved
  if (tiers.includes('gold')) return 'gold';
  if (tiers.includes('silver')) return 'silver';
  if (tiers.includes('bronze')) return 'bronze';
  return 'gray';
}

/**
 * Get tier rank for comparison (higher is better)
 */
export function getTierRank(tier: SouvenirTier): number {
  const ranks: Record<SouvenirTier, number> = {
    gray: 1,
    bronze: 2,
    silver: 3,
    gold: 4,
  };
  return ranks[tier];
}

/**
 * Check if new tier is an upgrade from current tier
 */
export function isUpgrade(currentTier: SouvenirTier, newTier: SouvenirTier): boolean {
  return getTierRank(newTier) > getTierRank(currentTier);
}

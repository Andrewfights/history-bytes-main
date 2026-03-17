/**
 * Pantheon Souvenir Room - World-level trophy system
 *
 * Each historical world has one signature souvenir that upgrades through
 * 4 material tiers based on Arena/exam performance.
 *
 * Souvenir images can be customized via admin and are stored in Firebase.
 */

import type { Souvenir, PantheonWorld, SouvenirTier } from '@/types';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getPantheonSouvenirs as getFirestoreSouvenirs,
  getPantheonSouvenirImages as getFirestoreImages,
  subscribeToPantheonSouvenirs,
  subscribeToPantheonSouvenirImages,
  type FirestorePantheonSouvenir,
  type FirestorePantheonSouvenirImages,
} from '@/lib/firestore';

// ---- Firebase Cache for Admin-Customized Souvenirs ----

interface SouvenirImageCache {
  [souvenirId: string]: {
    gray?: string;
    bronze?: string;
    silver?: string;
    gold?: string;
  };
}

interface SouvenirDataCache {
  [souvenirId: string]: {
    name: string;
    description: string;
    significance: string;
  };
}

let souvenirImageCache: SouvenirImageCache = {};
let souvenirDataCache: SouvenirDataCache = {};
let cacheInitialized = false;

/**
 * Initialize Pantheon cache from Firebase
 * Call this on app startup to load admin-customized souvenir data
 */
export async function initPantheonCache(): Promise<void> {
  if (!isFirebaseConfigured()) {
    cacheInitialized = true;
    return;
  }

  try {
    const [souvenirs, images] = await Promise.all([
      getFirestoreSouvenirs(),
      getFirestoreImages(),
    ]);

    // Cache souvenir data
    for (const s of souvenirs) {
      souvenirDataCache[s.id] = {
        name: s.name,
        description: s.description,
        significance: s.significance,
      };
    }

    // Cache images
    for (const img of images) {
      souvenirImageCache[img.id] = {
        gray: img.gray,
        bronze: img.bronze,
        silver: img.silver,
        gold: img.gold,
      };
    }

    console.log('[Pantheon] Cache initialized from Firebase:', {
      souvenirs: Object.keys(souvenirDataCache).length,
      images: Object.keys(souvenirImageCache).length,
    });

    cacheInitialized = true;
  } catch (error) {
    console.error('[Pantheon] Failed to initialize cache:', error);
    cacheInitialized = true;
  }
}

/**
 * Subscribe to Firebase updates for Pantheon data
 * Returns unsubscribe function
 */
export function subscribeToPantheonUpdates(): () => void {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  const unsubSouvenirs = subscribeToPantheonSouvenirs((souvenirs) => {
    souvenirDataCache = {};
    for (const s of souvenirs) {
      souvenirDataCache[s.id] = {
        name: s.name,
        description: s.description,
        significance: s.significance,
      };
    }
    console.log('[Pantheon] Souvenirs updated from Firebase');
  });

  const unsubImages = subscribeToPantheonSouvenirImages((images) => {
    souvenirImageCache = {};
    for (const img of images) {
      souvenirImageCache[img.id] = {
        gray: img.gray,
        bronze: img.bronze,
        silver: img.silver,
        gold: img.gold,
      };
    }
    console.log('[Pantheon] Images updated from Firebase');
  });

  return () => {
    unsubSouvenirs();
    unsubImages();
  };
}

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
  {
    id: 'american-revolution-bayonet',
    worldId: 'american-revolution',
    name: 'Revolutionary Bayonet',
    description: 'Emblem of the citizen-soldier who fought for independence with close-quarters determination.',
    significance: 'The blade that helped forge a nation.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'ancient-rome-gladius',
    worldId: 'ancient-rome',
    name: 'Roman Gladius',
    description: 'The short sword that built an empire, carried by legionaries from Britain to Persia.',
    significance: 'Roman military might and the expansion of civilization.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'civil-war-kepi',
    worldId: 'civil-war',
    name: 'Union Kepi',
    description: 'The distinctive cap worn by Union soldiers, symbolizing the fight to preserve the nation.',
    significance: 'Unity, sacrifice, and the end of slavery.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'egypt-ankh',
    worldId: 'ancient-egypt',
    name: 'Ankh',
    description: 'The ancient Egyptian symbol of life, carried by pharaohs and gods alike.',
    significance: 'Symbol of life and the eternal legacy of the Nile civilization.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'ancient-greece-helmet',
    worldId: 'ancient-greece',
    name: 'Corinthian Helmet',
    description: 'The bronze helmet worn by Greek hoplites, from Thermopylae to Marathon.',
    significance: 'Democracy, philosophy, and the birth of Western civilization.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'medieval-sword',
    worldId: 'medieval',
    name: 'Crusader Sword',
    description: 'The longsword of medieval knights, blessed and carried to the Holy Land.',
    significance: 'Chivalry, faith, and the feudal order.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'renaissance-compass',
    worldId: 'renaissance',
    name: "Da Vinci's Compass",
    description: 'The mathematical compass used by Renaissance masters to unlock the secrets of art and science.',
    significance: 'The rebirth of knowledge and human potential.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'french-revolution-cockade',
    worldId: 'french-revolution',
    name: 'Tricolor Cockade',
    description: 'The revolutionary rosette worn by citizens who stormed the Bastille.',
    significance: 'Liberty, equality, fraternity.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'industrial-gear',
    worldId: 'industrial-revolution',
    name: 'Steam Engine Gear',
    description: 'The iron gear that powered the machines transforming the world.',
    significance: 'Innovation, industry, and the modern age.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'exploration-compass',
    worldId: 'exploration',
    name: "Navigator's Compass",
    description: 'The instrument that guided explorers across uncharted oceans to discover new worlds.',
    significance: 'Discovery, wayfinding, and charting the unknown.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'viking-helmet',
    worldId: 'vikings',
    name: 'Viking Helmet',
    description: 'The spectacle-guard helmet of Norse warriors who explored and conquered distant shores.',
    significance: 'Exploration, seafaring, and Norse resilience.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'ww1-trench-helmet',
    worldId: 'ww1',
    name: 'Brodie Helmet',
    description: 'The steel helmet that protected soldiers in the trenches of the Western Front.',
    significance: 'Endurance, sacrifice, and the tragedy of modern warfare.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'cold-war-badge',
    worldId: 'cold-war',
    name: 'CIA Star Badge',
    description: 'The intelligence service badge worn during decades of covert operations.',
    significance: 'Espionage, ideology, and the balance of power.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
  {
    id: 'mesopotamia-tablet',
    worldId: 'mesopotamia',
    name: 'Cuneiform Tablet',
    description: 'Clay tablet inscribed with the first written language of humanity.',
    significance: 'The dawn of writing, law, and civilization.',
    images: {
      gray: '/assets/pantheon/placeholder.png',
      bronze: '/assets/pantheon/placeholder.png',
      silver: '/assets/pantheon/placeholder.png',
      gold: '/assets/pantheon/placeholder.png',
    },
  },
];

// ---- World Definitions ----
// Matches IDs with HISTORICAL_ERAS in historicalEras.ts

export const PANTHEON_WORLDS: PantheonWorld[] = [
  {
    id: 'ww2',
    name: 'World War II',
    souvenirId: 'ww2-m1-helmet',
    order: 1,
    isAvailable: true,
  },
  {
    id: 'american-revolution',
    name: 'American Revolution',
    souvenirId: 'american-revolution-bayonet',
    order: 2,
    isAvailable: false,
  },
  {
    id: 'ancient-rome',
    name: 'Ancient Rome',
    souvenirId: 'ancient-rome-gladius',
    order: 3,
    isAvailable: false,
  },
  {
    id: 'civil-war',
    name: 'American Civil War',
    souvenirId: 'civil-war-kepi',
    order: 4,
    isAvailable: false,
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    souvenirId: 'egypt-ankh',
    order: 5,
    isAvailable: false,
  },
  {
    id: 'ancient-greece',
    name: 'Ancient Greece',
    souvenirId: 'ancient-greece-helmet',
    order: 6,
    isAvailable: false,
  },
  {
    id: 'medieval',
    name: 'Medieval Europe',
    souvenirId: 'medieval-sword',
    order: 7,
    isAvailable: false,
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    souvenirId: 'renaissance-compass',
    order: 8,
    isAvailable: false,
  },
  {
    id: 'french-revolution',
    name: 'French Revolution',
    souvenirId: 'french-revolution-cockade',
    order: 9,
    isAvailable: false,
  },
  {
    id: 'industrial-revolution',
    name: 'Industrial Revolution',
    souvenirId: 'industrial-gear',
    order: 10,
    isAvailable: false,
  },
  {
    id: 'exploration',
    name: 'Age of Exploration',
    souvenirId: 'exploration-compass',
    order: 11,
    isAvailable: false,
  },
  {
    id: 'vikings',
    name: 'Vikings',
    souvenirId: 'viking-helmet',
    order: 12,
    isAvailable: false,
  },
  {
    id: 'ww1',
    name: 'World War I',
    souvenirId: 'ww1-trench-helmet',
    order: 13,
    isAvailable: false,
  },
  {
    id: 'cold-war',
    name: 'Cold War',
    souvenirId: 'cold-war-badge',
    order: 14,
    isAvailable: false,
  },
  {
    id: 'mesopotamia',
    name: 'Ancient Mesopotamia',
    souvenirId: 'mesopotamia-tablet',
    order: 15,
    isAvailable: false,
  },
];

// ---- Helper Functions ----

/**
 * Get souvenir by ID, merging Firebase customizations with static defaults
 */
export function getSouvenirById(id: string): Souvenir | undefined {
  const staticSouvenir = PANTHEON_SOUVENIRS.find(s => s.id === id);
  if (!staticSouvenir) return undefined;

  // Merge with Firebase cached data
  const cachedData = souvenirDataCache[id];
  const cachedImages = souvenirImageCache[id];

  return {
    ...staticSouvenir,
    // Override with Firebase data if available
    name: cachedData?.name || staticSouvenir.name,
    description: cachedData?.description || staticSouvenir.description,
    significance: cachedData?.significance || staticSouvenir.significance,
    images: {
      gray: cachedImages?.gray || staticSouvenir.images.gray,
      bronze: cachedImages?.bronze || staticSouvenir.images.bronze,
      silver: cachedImages?.silver || staticSouvenir.images.silver,
      gold: cachedImages?.gold || staticSouvenir.images.gold,
    },
  };
}

/**
 * Get souvenir by world ID, merging Firebase customizations with static defaults
 */
export function getSouvenirByWorldId(worldId: string): Souvenir | undefined {
  const staticSouvenir = PANTHEON_SOUVENIRS.find(s => s.worldId === worldId);
  if (!staticSouvenir) return undefined;

  // Use getSouvenirById to get merged data
  return getSouvenirById(staticSouvenir.id);
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

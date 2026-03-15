/**
 * Journey Migration Utilities
 * Seeds Firestore/localStorage with static journey data (Pearl Harbor, Ghost Army)
 */

import { isFirebaseConfigured } from './firebase';
import {
  FirestoreJourney,
  FirestoreJourneyBeat,
  saveJourney,
  saveJourneyBeat,
  getJourneys,
} from './firestore';

// Storage keys for localStorage fallback
const STORAGE_KEYS = {
  JOURNEYS: 'hb_admin_journeys',
  JOURNEY_BEATS: 'hb_admin_journey_beats',
};

// LocalStorage helpers for migration
function saveJourneyToLocal(journey: FirestoreJourney): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
    const journeys: FirestoreJourney[] = stored ? JSON.parse(stored) : [];
    const existing = journeys.findIndex(j => j.id === journey.id);
    if (existing >= 0) {
      journeys[existing] = journey;
    } else {
      journeys.push(journey);
    }
    localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(journeys));
    return true;
  } catch (err) {
    console.error('[Migration] localStorage save error:', err);
    return false;
  }
}

function saveBeatToLocal(beat: FirestoreJourneyBeat): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOURNEY_BEATS);
    const beats: FirestoreJourneyBeat[] = stored ? JSON.parse(stored) : [];
    const existing = beats.findIndex(b => b.id === beat.id);
    if (existing >= 0) {
      beats[existing] = beat;
    } else {
      beats.push(beat);
    }
    localStorage.setItem(STORAGE_KEYS.JOURNEY_BEATS, JSON.stringify(beats));
    return true;
  } catch (err) {
    console.error('[Migration] localStorage beat save error:', err);
    return false;
  }
}

function getJourneysFromLocal(): FirestoreJourney[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Smart save function that uses Firebase if available, falls back to localStorage
async function smartSaveJourney(journey: FirestoreJourney): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const success = await saveJourney(journey);
    if (success) return true;
  }
  // Fallback to localStorage
  return saveJourneyToLocal(journey);
}

async function smartSaveBeat(beat: FirestoreJourneyBeat): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const success = await saveJourneyBeat(beat);
    if (success) return true;
  }
  // Fallback to localStorage
  return saveBeatToLocal(beat);
}

async function smartGetJourneys(): Promise<FirestoreJourney[]> {
  if (isFirebaseConfigured()) {
    try {
      return await getJourneys();
    } catch {
      // Fall through to localStorage
    }
  }
  return getJourneysFromLocal();
}
import { PEARL_HARBOR_LESSONS, TOTAL_XP as PH_TOTAL_XP } from '@/data/pearlHarborLessons';
import { WW2_BATTLES } from '@/data/ww2Battles';

// Map Pearl Harbor beat types to template IDs
const beatTypeToTemplateId: Record<string, string> = {
  'road-to-war': 'interactive-map', // Uses interactive map + timed challenge
  'radar-blip': 'branching-decision',
  'tora-tora-tora': 'interactive-map',
  'voices-harbor': 'primary-source',
  'breaking-news': 'drag-drop-order', // Uses audio + drag-and-drop
  'nagumo-dilemma': 'branching-decision',
  'fact-or-myth': 'fact-or-myth',
  'day-of-infamy': 'primary-source',
  'arsenal-democracy': 'timed-challenge',
  'mastery-run': 'timed-challenge',
  'final-exam': 'tiered-exam',
};

// Pearl Harbor Journey Definition
export const PEARL_HARBOR_JOURNEY: FirestoreJourney = {
  id: 'pearl-harbor',
  title: 'Pearl Harbor',
  subtitle: 'December 7, 1941',
  description:
    'Experience the day that changed history. Learn about the attack on Pearl Harbor through immersive lessons, primary sources, and interactive challenges.',
  icon: '⚓',
  coverImage: '/assets/ww2-battles/pearl-harbor-cover.jpg',
  totalXP: PH_TOTAL_XP,
  estimatedDuration: '60-90 min',
  status: 'published',
  beatIds: PEARL_HARBOR_LESSONS.map((lesson) => lesson.id),
};

// Convert Pearl Harbor lessons to journey beats
export const PEARL_HARBOR_BEATS: FirestoreJourneyBeat[] = PEARL_HARBOR_LESSONS.map((lesson) => ({
  id: lesson.id,
  journeyId: 'pearl-harbor',
  number: lesson.number,
  title: lesson.title,
  subtitle: lesson.subtitle,
  templateId: beatTypeToTemplateId[lesson.type] || 'timed-challenge',
  icon: lesson.icon,
  xpReward: lesson.xpReward,
  description: lesson.description,
  estimatedDuration: lesson.duration,
  config: {
    // Default config - can be customized in admin
    formats: lesson.formats,
    narrativeArc: lesson.narrativeArc,
    screens: lesson.screens,
    beatType: lesson.type, // Preserve original beat type for player routing
  },
  mediaAssets: {},
  hostConfig: { mode: 'pip' },
}));

// Ghost Army Journey Definition
export const GHOST_ARMY_JOURNEY: FirestoreJourney = {
  id: 'ghost-army',
  title: 'Ghost Army',
  subtitle: "WWII's Masters of Deception",
  description:
    'Discover the secret unit that fooled the Nazis with rubber tanks, sound effects, and theatrical performances. Learn the art of tactical deception.',
  icon: '👻',
  coverImage: '/assets/ghost-army/cover.jpg',
  totalXP: 215,
  estimatedDuration: '30-40 min',
  status: 'published',
  beatIds: [
    'ga-node-1',
    'ga-node-2',
    'ga-node-3',
    'ga-node-4',
    'ga-node-5',
    'ga-node-6',
  ],
};

// Ghost Army Beats (based on existing node types)
export const GHOST_ARMY_BEATS: FirestoreJourneyBeat[] = [
  {
    id: 'ga-node-1',
    journeyId: 'ghost-army',
    number: 1,
    title: 'The Secret Unit',
    subtitle: 'Meet the Ghost Army',
    templateId: 'watch-narration',
    icon: '🎭',
    xpReward: 30,
    description: 'Discover how a ragtag group of artists became military deception experts',
    estimatedDuration: '5 min',
    config: { beatType: 'watch-narration' },
    mediaAssets: {},
    hostConfig: { mode: 'pip' },
  },
  {
    id: 'ga-node-2',
    journeyId: 'ghost-army',
    number: 2,
    title: 'Operation Viersen',
    subtitle: 'Timeline Challenge',
    templateId: 'timeline-learn',
    icon: '📅',
    xpReward: 35,
    description: 'Put the key events of Operation Viersen in order',
    estimatedDuration: '5 min',
    config: { beatType: 'timeline-learn' },
    mediaAssets: {},
    hostConfig: { mode: 'pip' },
  },
  {
    id: 'ga-node-3',
    journeyId: 'ghost-army',
    number: 3,
    title: 'Tools of Deception',
    subtitle: 'Artifact Detective',
    templateId: 'artifact-detective',
    icon: '🔍',
    xpReward: 40,
    description: 'Examine the rubber tanks, sonic equipment, and more',
    estimatedDuration: '6 min',
    config: { beatType: 'artifact-detective' },
    mediaAssets: {},
    hostConfig: { mode: 'pip' },
  },
  {
    id: 'ga-node-4',
    journeyId: 'ghost-army',
    number: 4,
    title: 'Tactical Deception',
    subtitle: 'Boss Challenge',
    templateId: 'tactical-boss',
    icon: '🎯',
    xpReward: 50,
    description: 'Plan your own deception operation',
    estimatedDuration: '8 min',
    config: { beatType: 'tactical-boss' },
    mediaAssets: {},
    hostConfig: { mode: 'pip' },
  },
  {
    id: 'ga-node-5',
    journeyId: 'ghost-army',
    number: 5,
    title: 'Behind the Scenes',
    subtitle: 'Video Trivia',
    templateId: 'video-trivia',
    icon: '🎬',
    xpReward: 30,
    description: 'Watch clips and answer questions about Ghost Army tactics',
    estimatedDuration: '5 min',
    config: { beatType: 'video-trivia' },
    mediaAssets: {},
    hostConfig: { mode: 'pip' },
  },
  {
    id: 'ga-node-6',
    journeyId: 'ghost-army',
    number: 6,
    title: 'Legacy of Deception',
    subtitle: 'Mission Complete',
    templateId: 'resolution',
    icon: '🏆',
    xpReward: 30,
    description: 'See how the Ghost Army changed military strategy forever',
    estimatedDuration: '4 min',
    config: { beatType: 'resolution' },
    mediaAssets: {},
    hostConfig: { mode: 'pip' },
  },
];

// WW2 Battle icons
const battleIcons: Record<string, string> = {
  'pearl-harbor': '⚓',
  'midway': '🛩️',
  'guadalcanal': '🌴',
  'leyte-gulf': '⚔️',
  'okinawa': '🏝️',
  'barbarossa': '❄️',
  'stalingrad': '🔥',
  'd-day': '🏖️',
  'bulge': '🌲',
  'berlin': '🏛️',
};

// Convert WW2 battles to journeys (except Pearl Harbor which has full content)
export const WW2_BATTLE_JOURNEYS: FirestoreJourney[] = WW2_BATTLES
  .filter(battle => battle.id !== 'pearl-harbor') // Pearl Harbor is handled separately
  .map(battle => ({
    id: `ww2-${battle.id}`,
    title: battle.name,
    subtitle: battle.subtitle,
    description: battle.description,
    icon: battleIcons[battle.id] || '⚔️',
    coverImage: battle.imageUrl,
    totalXP: battle.xpReward,
    estimatedDuration: `${battle.lessonCount * 5}-${battle.lessonCount * 8} min`,
    status: 'draft' as const, // Draft since no content yet
    beatIds: [],
  }));

/**
 * Migrate Pearl Harbor journey to Firestore/localStorage
 * Only runs if the journey doesn't already exist
 */
export async function migratePearlHarbor(): Promise<boolean> {
  try {
    // Check if journey already exists
    const existingJourneys = await smartGetJourneys();
    if (existingJourneys.some((j) => j.id === 'pearl-harbor')) {
      console.log('[Migration] Pearl Harbor journey already exists, skipping');
      return true;
    }

    // Save the journey
    const journeySaved = await smartSaveJourney(PEARL_HARBOR_JOURNEY);
    if (!journeySaved) {
      console.error('[Migration] Failed to save Pearl Harbor journey');
      return false;
    }

    // Save all beats
    for (const beat of PEARL_HARBOR_BEATS) {
      const beatSaved = await smartSaveBeat(beat);
      if (!beatSaved) {
        console.error(`[Migration] Failed to save beat: ${beat.id}`);
        return false;
      }
    }

    console.log('[Migration] Pearl Harbor journey migrated successfully');
    return true;
  } catch (error) {
    console.error('[Migration] Error migrating Pearl Harbor:', error);
    return false;
  }
}

/**
 * Migrate Ghost Army journey to Firestore/localStorage
 * Only runs if the journey doesn't already exist
 */
export async function migrateGhostArmy(): Promise<boolean> {
  try {
    // Check if journey already exists
    const existingJourneys = await smartGetJourneys();
    if (existingJourneys.some((j) => j.id === 'ghost-army')) {
      console.log('[Migration] Ghost Army journey already exists, skipping');
      return true;
    }

    // Save the journey
    const journeySaved = await smartSaveJourney(GHOST_ARMY_JOURNEY);
    if (!journeySaved) {
      console.error('[Migration] Failed to save Ghost Army journey');
      return false;
    }

    // Save all beats
    for (const beat of GHOST_ARMY_BEATS) {
      const beatSaved = await smartSaveBeat(beat);
      if (!beatSaved) {
        console.error(`[Migration] Failed to save beat: ${beat.id}`);
        return false;
      }
    }

    console.log('[Migration] Ghost Army journey migrated successfully');
    return true;
  } catch (error) {
    console.error('[Migration] Error migrating Ghost Army:', error);
    return false;
  }
}

/**
 * Migrate WW2 battles as draft journeys
 * Only runs if the journeys don't already exist
 */
export async function migrateWW2Battles(): Promise<boolean> {
  try {
    const existingJourneys = await smartGetJourneys();
    let successCount = 0;

    for (const journey of WW2_BATTLE_JOURNEYS) {
      if (existingJourneys.some((j) => j.id === journey.id)) {
        console.log(`[Migration] ${journey.title} already exists, skipping`);
        successCount++;
        continue;
      }

      const journeySaved = await smartSaveJourney(journey);
      if (journeySaved) {
        console.log(`[Migration] ${journey.title} created as draft`);
        successCount++;
      } else {
        console.error(`[Migration] Failed to save ${journey.title}`);
      }
    }

    console.log(`[Migration] WW2 battles migrated: ${successCount}/${WW2_BATTLE_JOURNEYS.length}`);
    return successCount === WW2_BATTLE_JOURNEYS.length;
  } catch (error) {
    console.error('[Migration] Error migrating WW2 battles:', error);
    return false;
  }
}

/**
 * Run all migrations
 */
export async function runAllMigrations(): Promise<boolean> {
  console.log('[Migration] Starting journey migrations...');

  const phResult = await migratePearlHarbor();
  const gaResult = await migrateGhostArmy();
  const ww2Result = await migrateWW2Battles();

  if (phResult && gaResult && ww2Result) {
    console.log('[Migration] All migrations completed successfully');
    return true;
  } else {
    console.error('[Migration] Some migrations failed');
    return false;
  }
}

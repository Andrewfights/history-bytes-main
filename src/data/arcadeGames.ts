/**
 * Arcade Games - Data definitions for all mini-games
 * Includes categories, default images, and helper functions
 *
 * Thumbnails are stored in Firestore with localStorage cache
 */

import {
  loadGameThumbnails as dbLoadGameThumbnails,
  saveGameThumbnailUrl as dbSaveGameThumbnail,
  type GameThumbnailData,
} from '@/lib/database';

export type GameCategory = 'word' | 'timeline' | 'geography' | 'trivia' | 'visual';

export interface ArcadeGame {
  id: string;
  title: string;
  description: string;
  type: string;
  icon: string;
  xpReward: number;
  category: GameCategory;
  defaultImageUrl?: string;
  accentColor: string;
}

// localStorage key for admin thumbnails (used as cache)
export const GAME_THUMBNAILS_KEY = 'hb_arcade_game_thumbnails';

// In-memory cache for thumbnails
let thumbnailsCache: Record<string, string> = {};
let thumbnailsCacheInitialized = false;

// Map frontend game types to admin game types for thumbnails
export const gameTypeToThumbnailKey: Record<string, string> = {
  'anachronism': 'anachronism',
  'connections': 'connections',
  'map-mystery': 'map-mystery',
  'artifact': 'artifact',
  'cause-effect': 'cause-effect',
  'geoguessr-where': 'geoguessr',
  'geoguessr-when': 'geoguessr',
  'geoguessr-what': 'geoguessr',
};

export const ARCADE_GAMES: ArcadeGame[] = [
  {
    id: 'g1',
    title: 'History Wordle',
    description: 'Guess the history word in 6 tries.',
    type: 'wordle',
    icon: '🔤',
    xpReward: 40,
    category: 'word',
    accentColor: '#22c55e', // green
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Rosetta_Stone.JPG/800px-Rosetta_Stone.JPG',
  },
  {
    id: 'g2',
    title: 'Chrono Order',
    description: 'Arrange 4 events in chronological order.',
    type: 'chrono',
    icon: '⏳',
    xpReward: 25,
    category: 'timeline',
    accentColor: '#f59e0b', // amber
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Wooden_hourglass_3.jpg/800px-Wooden_hourglass_3.jpg',
  },
  {
    id: 'g3',
    title: 'Who Am I?',
    description: '3 clues, 4 choices. Identify the figure.',
    type: 'who-am-i',
    icon: '🎭',
    xpReward: 35,
    category: 'trivia',
    accentColor: '#8b5cf6', // purple
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg/800px-Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
  },
  {
    id: 'g4',
    title: 'Two Truths & a Lie',
    description: 'Spot the fake fact among the real ones.',
    type: 'two-truths',
    icon: '2+1',
    xpReward: 25,
    category: 'trivia',
    accentColor: '#ec4899', // pink
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Declaration_of_Independence_%281819%29%2C_by_John_Trumbull.jpg/800px-Declaration_of_Independence_%281819%29%2C_by_John_Trumbull.jpg',
  },
  {
    id: 'g5',
    title: 'Quote or Fake',
    description: 'Real historical quote or AI fabrication?',
    type: 'quote-or-fake',
    icon: '💬',
    xpReward: 20,
    category: 'trivia',
    accentColor: '#06b6d4', // cyan
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Feather_pen.JPG/800px-Feather_pen.JPG',
  },
  {
    id: 'g6',
    title: 'Guess the Year',
    description: 'Drag the slider to pinpoint when it happened.',
    type: 'guess-year',
    icon: '🕰️',
    xpReward: 50,
    category: 'timeline',
    accentColor: '#d97706', // amber-600
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/800px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
  },
  {
    id: 'g7',
    title: 'Spot the Anachronism',
    description: "Find what doesn't belong in history.",
    type: 'anachronism',
    icon: '🔍',
    xpReward: 30,
    category: 'visual',
    accentColor: '#ef4444', // red
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Bayeux_Tapestry_scene57_Harold_death.jpg/800px-Bayeux_Tapestry_scene57_Harold_death.jpg',
  },
  {
    id: 'g8',
    title: 'Historical Connections',
    description: 'Group 16 items into 4 categories.',
    type: 'connections',
    icon: '🔗',
    xpReward: 45,
    category: 'trivia',
    accentColor: '#3b82f6', // blue
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Encyclopedie_de_D%27Alembert_et_Diderot_-_Premiere_Page_-_ENC_1-NA5.jpg/800px-Encyclopedie_de_D%27Alembert_et_Diderot_-_Premiere_Page_-_ENC_1-NA5.jpg',
  },
  {
    id: 'g9',
    title: 'Map Mysteries',
    description: 'Identify empires by their territory.',
    type: 'map-mystery',
    icon: '🗺️',
    xpReward: 35,
    category: 'geography',
    accentColor: '#14b8a6', // teal
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Waldseemuller_map_2.jpg/800px-Waldseemuller_map_2.jpg',
  },
  {
    id: 'g10',
    title: 'Artifact Detective',
    description: 'Uncover the history behind artifacts.',
    type: 'artifact',
    icon: '🏺',
    xpReward: 30,
    category: 'visual',
    accentColor: '#a16207', // yellow-700
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Dying_Lion%2C_Assyrian%2C_North_Palace_of_Ashurbanipal%2C_Nineveh_%28Mosul%2C_Iraq%29%2C_c._645_BC%2C_gypsum_alabaster_-_Brooklyn_Museum_-_Brooklyn%2C_NY_-_DSC08492.JPG/800px-Dying_Lion%2C_Assyrian%2C_North_Palace_of_Ashurbanipal%2C_Nineveh_%28Mosul%2C_Iraq%29%2C_c._645_BC%2C_gypsum_alabaster_-_Brooklyn_Museum_-_Brooklyn%2C_NY_-_DSC08492.JPG',
  },
  {
    id: 'g11',
    title: 'Cause & Effect',
    description: 'Connect historical events to outcomes.',
    type: 'cause-effect',
    icon: '⚡',
    xpReward: 35,
    category: 'timeline',
    accentColor: '#eab308', // yellow
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Storming_of_the_Bastille.jpg/800px-Storming_of_the_Bastille.jpg',
  },
  {
    id: 'g12',
    title: 'Where in History?',
    description: 'Identify locations from historical scenes.',
    type: 'geoguessr-where',
    icon: '📍',
    xpReward: 50,
    category: 'geography',
    accentColor: '#dc2626', // red-600
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg/800px-Pieter_Bruegel_the_Elder_-_The_Tower_of_Babel_%28Vienna%29_-_Google_Art_Project_-_edited.jpg',
  },
  {
    id: 'g13',
    title: 'When in History?',
    description: 'Guess the year from historical images.',
    type: 'geoguessr-when',
    icon: '📅',
    xpReward: 50,
    category: 'timeline',
    accentColor: '#7c3aed', // violet
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Solvay_conference_1927.jpg/800px-Solvay_conference_1927.jpg',
  },
  {
    id: 'g14',
    title: 'What Happened Here?',
    description: 'Name the event from the scene.',
    type: 'geoguessr-what',
    icon: '🌍',
    xpReward: 50,
    category: 'geography',
    accentColor: '#059669', // emerald-600
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Raising_the_Flag_on_Iwo_Jima%2C_larger_-_edit1.jpg/800px-Raising_the_Flag_on_Iwo_Jima%2C_larger_-_edit1.jpg',
  },
];

// XP cap per day (plays that award XP)
export const XP_CAP_PLAYS = 3;

/**
 * Get a game by its ID
 */
export function getGameById(id: string): ArcadeGame | undefined {
  return ARCADE_GAMES.find(game => game.id === id);
}

/**
 * Get a game by its type
 */
export function getGameByType(type: string): ArcadeGame | undefined {
  return ARCADE_GAMES.find(game => game.type === type);
}

/**
 * Get games by category
 */
export function getGamesByCategory(category: GameCategory): ArcadeGame[] {
  return ARCADE_GAMES.filter(game => game.category === category);
}

/**
 * Get the daily featured game ID (deterministic rotation)
 */
export function getDailyFeaturedId(): string {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return ARCADE_GAMES[dayOfYear % ARCADE_GAMES.length].id;
}

/**
 * Get the daily featured game
 */
export function getDailyFeaturedGame(): ArcadeGame {
  const id = getDailyFeaturedId();
  return ARCADE_GAMES.find(game => game.id === id)!;
}

/**
 * Initialize thumbnails cache from Firestore (call on app start)
 */
export async function initGameThumbnailsCache(): Promise<void> {
  try {
    const thumbnails = await dbLoadGameThumbnails();
    thumbnailsCache = thumbnails;
    thumbnailsCacheInitialized = true;
    // Update localStorage cache
    localStorage.setItem(GAME_THUMBNAILS_KEY, JSON.stringify(thumbnails));
    console.log('[arcadeGames] Loaded', Object.keys(thumbnails).length, 'game thumbnails from Firestore');
  } catch (error) {
    console.error('[arcadeGames] Failed to load from Firestore:', error);
    // Fall back to localStorage
    try {
      const stored = localStorage.getItem(GAME_THUMBNAILS_KEY);
      if (stored) {
        thumbnailsCache = JSON.parse(stored);
      }
    } catch {
      thumbnailsCache = {};
    }
    thumbnailsCacheInitialized = true;
  }
}

/**
 * Load game thumbnails (synchronous, uses cache)
 */
export function loadGameThumbnails(): Record<string, string> {
  if (thumbnailsCacheInitialized) {
    return { ...thumbnailsCache };
  }

  // Fall back to localStorage if cache not initialized
  try {
    const stored = localStorage.getItem(GAME_THUMBNAILS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Load game thumbnails async (fresh from Firestore)
 */
export async function loadGameThumbnailsAsync(): Promise<Record<string, string>> {
  try {
    const thumbnails = await dbLoadGameThumbnails();
    thumbnailsCache = thumbnails;
    thumbnailsCacheInitialized = true;
    localStorage.setItem(GAME_THUMBNAILS_KEY, JSON.stringify(thumbnails));
    return thumbnails;
  } catch (error) {
    console.error('[arcadeGames] Failed to load from Firestore:', error);
    return loadGameThumbnails();
  }
}

/**
 * Save a game thumbnail (saves to Firestore with localStorage cache)
 */
export function saveGameThumbnail(gameType: string, imageUrl: string): void {
  // Update cache immediately
  thumbnailsCache[gameType] = imageUrl;

  // Update localStorage cache
  try {
    localStorage.setItem(GAME_THUMBNAILS_KEY, JSON.stringify(thumbnailsCache));
  } catch (error) {
    console.error('[arcadeGames] Failed to update localStorage:', error);
  }

  // Save to Firestore (async)
  dbSaveGameThumbnail(gameType, imageUrl).then(success => {
    if (success) {
      console.log('[arcadeGames] Saved game thumbnail to Firestore:', gameType);
    } else {
      console.warn('[arcadeGames] Failed to save to Firestore, using localStorage only');
    }
  }).catch(error => {
    console.error('[arcadeGames] Firestore save error:', error);
  });
}

/**
 * Get the effective image URL for a game (checks for admin overrides)
 */
export function getGameImageUrl(game: ArcadeGame, thumbnails: Record<string, string>): string | undefined {
  const thumbnailKey = gameTypeToThumbnailKey[game.type];
  const adminThumbnail = thumbnailKey ? thumbnails[thumbnailKey] : undefined;

  if (adminThumbnail && (adminThumbnail.startsWith('http') || adminThumbnail.startsWith('data:'))) {
    return adminThumbnail;
  }

  return game.defaultImageUrl;
}

/**
 * Get popular games (top 6 by XP reward for carousel)
 */
export function getPopularGames(): ArcadeGame[] {
  return [...ARCADE_GAMES]
    .sort((a, b) => b.xpReward - a.xpReward)
    .slice(0, 6);
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: GameCategory): string {
  const names: Record<GameCategory, string> = {
    word: 'Word Games',
    timeline: 'Timeline',
    geography: 'Geography',
    trivia: 'Trivia',
    visual: 'Visual',
  };
  return names[category];
}

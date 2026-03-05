/**
 * WW2 Map Storage - IndexedDB storage for map progress
 */

export interface WW2MapProgress {
  completedCountries: string[];
  currentCountry: string | null;
  unlockedCountries: string[];
  totalXP: number;
  lastVisited: string;
}

const DB_NAME = 'history_bytes_media';
const DB_VERSION = 3; // Bumped to ensure ww2_map_data store exists
const STORE_NAME = 'ww2_map_data';

// Initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create ww2_map_data store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('[IndexedDB] Created ww2_map_data store');
      }

      // Ensure other stores exist
      if (!db.objectStoreNames.contains('ghost_army_media')) {
        db.createObjectStore('ghost_army_media', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('trivia_data')) {
        db.createObjectStore('trivia_data', { keyPath: 'id' });
      }
    };
  });
}

// Save to IndexedDB
async function saveToIndexedDB(id: string, data: WW2MapProgress): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, data });

      request.onsuccess = () => {
        console.log(`[IndexedDB] Saved WW2 map progress successfully`);
        window.dispatchEvent(new CustomEvent('ww2MapStorageUpdate', { detail: { id } }));
        resolve(true);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Save failed:', request.error);
        resolve(false);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error:', error);
    return false;
  }
}

// Load from IndexedDB
async function loadFromIndexedDB(id: string): Promise<WW2MapProgress | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };

      request.onerror = () => {
        console.error('[IndexedDB] Load failed:', request.error);
        resolve(null);
      };

      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error('[IndexedDB] Error:', error);
    return null;
  }
}

// Default progress with starting unlocked countries
export const DEFAULT_WW2_MAP_PROGRESS: WW2MapProgress = {
  completedCountries: [],
  currentCountry: null,
  unlockedCountries: ['usa', 'uk', 'germany'], // Starting countries
  totalXP: 0,
  lastVisited: new Date().toISOString(),
};

// Cache for synchronous access
let progressCache: WW2MapProgress | null = null;
let cacheInitialized = false;

// Initialize cache
export async function initWW2MapCache(): Promise<void> {
  const data = await loadFromIndexedDB('ww2_map_progress');
  progressCache = data || DEFAULT_WW2_MAP_PROGRESS;
  cacheInitialized = true;
  console.log('[WW2MapStorage] Cache initialized:', {
    completedCount: progressCache.completedCountries.length,
    unlockedCount: progressCache.unlockedCountries.length,
  });
}

// Load progress (async)
export async function loadWW2MapProgressAsync(): Promise<WW2MapProgress> {
  if (!cacheInitialized) {
    await initWW2MapCache();
  }
  return progressCache || DEFAULT_WW2_MAP_PROGRESS;
}

// Load progress (sync)
export function loadWW2MapProgress(): WW2MapProgress {
  if (!cacheInitialized) {
    initWW2MapCache().catch(console.error);
    return DEFAULT_WW2_MAP_PROGRESS;
  }
  return progressCache || DEFAULT_WW2_MAP_PROGRESS;
}

// Save progress (async)
export async function saveWW2MapProgressAsync(progress: WW2MapProgress): Promise<boolean> {
  progressCache = progress;
  return saveToIndexedDB('ww2_map_progress', progress);
}

// Save progress (sync)
export function saveWW2MapProgress(progress: WW2MapProgress): boolean {
  progressCache = progress;
  saveToIndexedDB('ww2_map_progress', progress).catch(console.error);
  return true;
}

// Mark a country as complete
export async function completeCountry(
  countryId: string,
  xpEarned: number
): Promise<WW2MapProgress> {
  const progress = await loadWW2MapProgressAsync();

  // Don't double-complete
  if (progress.completedCountries.includes(countryId)) {
    return progress;
  }

  const updatedProgress: WW2MapProgress = {
    ...progress,
    completedCountries: [...progress.completedCountries, countryId],
    currentCountry: null,
    totalXP: progress.totalXP + xpEarned,
    lastVisited: new Date().toISOString(),
  };

  // Update unlocked countries based on new completions
  // Import helper from ww2Countries to avoid circular dependency
  const { getUnlockedCountries } = await import('../data/ww2Countries');
  updatedProgress.unlockedCountries = getUnlockedCountries(updatedProgress.completedCountries);

  await saveWW2MapProgressAsync(updatedProgress);
  return updatedProgress;
}

// Set current country (in progress)
export async function setCurrentCountry(countryId: string | null): Promise<WW2MapProgress> {
  const progress = await loadWW2MapProgressAsync();

  const updatedProgress: WW2MapProgress = {
    ...progress,
    currentCountry: countryId,
    lastVisited: new Date().toISOString(),
  };

  await saveWW2MapProgressAsync(updatedProgress);
  return updatedProgress;
}

// Reset all progress
export async function resetWW2MapProgress(): Promise<WW2MapProgress> {
  const newProgress = { ...DEFAULT_WW2_MAP_PROGRESS };
  newProgress.lastVisited = new Date().toISOString();
  await saveWW2MapProgressAsync(newProgress);
  return newProgress;
}

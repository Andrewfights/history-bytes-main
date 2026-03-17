/**
 * Trivia Storage - Firebase/IndexedDB storage for video-driven trivia
 * Uses Firestore for metadata and subscriptions, IndexedDB for offline cache
 */

import { isFirebaseConfigured } from './firebase';
import {
  getTriviaSets as getFirestoreTriviaSets,
  saveTriviaSet as saveFirestoreTriviaSet,
  deleteTriviaSet as deleteFirestoreTriviaSet,
  subscribeToTriviaSets,
  type FirestoreTriviaSet,
} from './firestore';

// Trivia question structure
export interface TriviaAnswer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface TriviaQuestion {
  id: string;
  // Question video
  questionVideoUrl?: string;
  questionVideoThumbnail?: string;
  // When to show answers: 'end' = when video ends, number = seconds into video
  answerTrigger: 'end' | number;
  // Question text (shown below video)
  questionText: string;
  // Answer options
  answers: TriviaAnswer[];
  // Response videos
  correctVideoUrl?: string;
  correctMessage: string;
  wrongVideoUrl?: string;
  wrongMessage: string;
  // XP reward
  xpReward: number;
}

export interface TriviaSet {
  id: string;
  title: string;
  description: string;
  storyId: string; // e.g., 'ghost-army'
  questions: TriviaQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface TriviaConfig {
  sets: Record<string, TriviaSet>;
  lastUpdated: string;
}

const DB_NAME = 'history_bytes_media';
const DB_VERSION = 3;
const STORE_NAME = 'trivia_data';

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
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        console.log('[IndexedDB] Created trivia_data store');
      }
      // Also ensure ghost_army_media store exists
      if (!db.objectStoreNames.contains('ghost_army_media')) {
        db.createObjectStore('ghost_army_media', { keyPath: 'id' });
      }
      // Also ensure ww2_map_data store exists
      if (!db.objectStoreNames.contains('ww2_map_data')) {
        db.createObjectStore('ww2_map_data', { keyPath: 'id' });
        console.log('[IndexedDB] Created ww2_map_data store');
      }
    };
  });
}

// Save to IndexedDB
async function saveToIndexedDB(id: string, data: TriviaConfig): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ id, data });

      request.onsuccess = () => {
        console.log(`[IndexedDB] Saved trivia ${id} successfully`);
        // Dispatch event for listeners
        window.dispatchEvent(new CustomEvent('triviaStorageUpdate', { detail: { id } }));
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
async function loadFromIndexedDB(id: string): Promise<TriviaConfig | null> {
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

// Default config
const DEFAULT_TRIVIA_CONFIG: TriviaConfig = {
  sets: {},
  lastUpdated: new Date().toISOString(),
};

// Cache for synchronous access
let triviaCache: TriviaConfig | null = null;
let cacheInitialized = false;

// Convert Firestore trivia set to local format
function firestoreToLocalTriviaSet(fs: FirestoreTriviaSet): TriviaSet {
  return {
    id: fs.id,
    title: fs.title,
    description: fs.description || '',
    storyId: fs.category || 'ghost-army',
    questions: fs.questions.map(q => ({
      id: q.id,
      questionText: q.question,
      questionVideoUrl: q.videoUrl,
      answerTrigger: 'end' as const,
      answers: q.options.map((opt, i) => ({
        id: `${q.id}-opt-${i}`,
        text: opt,
        isCorrect: i === q.correctIndex,
      })),
      correctMessage: 'Correct!',
      wrongMessage: q.explanation || 'Not quite!',
      correctVideoUrl: undefined,
      wrongVideoUrl: undefined,
      xpReward: 10,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Convert local trivia set to Firestore format
function localToFirestoreTriviaSet(local: TriviaSet, index: number): FirestoreTriviaSet {
  return {
    id: local.id,
    title: local.title,
    description: local.description,
    category: local.storyId,
    questions: local.questions.map(q => {
      const correctIndex = q.answers.findIndex(a => a.isCorrect);
      return {
        id: q.id,
        question: q.questionText,
        options: q.answers.map(a => a.text),
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
        explanation: q.wrongMessage,
        videoUrl: q.questionVideoUrl,
        imageUrl: undefined,
      };
    }),
    displayOrder: index,
  };
}

// Initialize cache from Firebase or IndexedDB
export async function initTriviaCache(): Promise<void> {
  // Try to load from Firebase first
  if (isFirebaseConfigured()) {
    try {
      const firebaseSets = await getFirestoreTriviaSets();
      if (firebaseSets.length > 0) {
        triviaCache = {
          sets: {},
          lastUpdated: new Date().toISOString(),
        };
        firebaseSets.forEach(fs => {
          const localSet = firestoreToLocalTriviaSet(fs);
          triviaCache!.sets[localSet.id] = localSet;
        });
        // Save to IndexedDB for offline access
        await saveToIndexedDB('trivia_config', triviaCache);
        cacheInitialized = true;
        console.log('[TriviaStorage] Cache initialized from Firebase:', {
          setCount: Object.keys(triviaCache.sets).length,
        });
        return;
      }
    } catch (err) {
      console.error('[TriviaStorage] Failed to load from Firebase:', err);
    }
  }

  // Fallback to IndexedDB
  const data = await loadFromIndexedDB('trivia_config');
  triviaCache = data || DEFAULT_TRIVIA_CONFIG;
  cacheInitialized = true;
  console.log('[TriviaStorage] Cache initialized from IndexedDB:', {
    setCount: Object.keys(triviaCache.sets).length,
  });
}

// Subscribe to Firebase updates
export function subscribeToTriviaUpdates(callback: (sets: TriviaSet[]) => void): () => void {
  if (!isFirebaseConfigured()) {
    return () => {};
  }

  return subscribeToTriviaSets((firebaseSets) => {
    triviaCache = {
      sets: {},
      lastUpdated: new Date().toISOString(),
    };
    firebaseSets.forEach(fs => {
      const localSet = firestoreToLocalTriviaSet(fs);
      triviaCache!.sets[localSet.id] = localSet;
    });
    // Update IndexedDB cache
    saveToIndexedDB('trivia_config', triviaCache).catch(console.error);
    callback(Object.values(triviaCache.sets));
  });
}

// Load trivia config
export async function loadTriviaConfigAsync(): Promise<TriviaConfig> {
  if (!cacheInitialized) {
    await initTriviaCache();
  }
  return triviaCache || DEFAULT_TRIVIA_CONFIG;
}

export function loadTriviaConfig(): TriviaConfig {
  if (!cacheInitialized) {
    initTriviaCache().catch(console.error);
    return DEFAULT_TRIVIA_CONFIG;
  }
  return triviaCache || DEFAULT_TRIVIA_CONFIG;
}

// Save trivia config
export async function saveTriviaConfigAsync(config: TriviaConfig): Promise<boolean> {
  triviaCache = config;
  return saveToIndexedDB('trivia_config', config);
}

export function saveTriviaConfig(config: TriviaConfig): boolean {
  triviaCache = config;
  saveToIndexedDB('trivia_config', config).catch(console.error);
  return true;
}

// Get trivia set by ID
export function getTriviaSet(setId: string): TriviaSet | null {
  const config = loadTriviaConfig();
  return config.sets[setId] || null;
}

// Get trivia sets for a story
export function getTriviaSetsForStory(storyId: string): TriviaSet[] {
  const config = loadTriviaConfig();
  return Object.values(config.sets).filter(set => set.storyId === storyId);
}

// Load all trivia sets (async)
export async function loadAllTriviaSets(): Promise<TriviaSet[]> {
  const config = await loadTriviaConfigAsync();
  return Object.values(config.sets);
}

// Save trivia set (to both IndexedDB and Firebase)
export function saveTriviaSet(set: TriviaSet): boolean {
  const config = loadTriviaConfig();
  config.sets[set.id] = set;
  config.lastUpdated = new Date().toISOString();

  // Save to Firebase if configured
  if (isFirebaseConfigured()) {
    const setIndex = Object.keys(config.sets).indexOf(set.id);
    const firestoreSet = localToFirestoreTriviaSet(set, setIndex);
    saveFirestoreTriviaSet(firestoreSet).catch(err => {
      console.error('[TriviaStorage] Failed to save to Firebase:', err);
    });
  }

  return saveTriviaConfig(config);
}

// Async version for explicit Firebase save
export async function saveTriviaSetAsync(set: TriviaSet): Promise<boolean> {
  const config = loadTriviaConfig();
  config.sets[set.id] = set;
  config.lastUpdated = new Date().toISOString();

  // Save to IndexedDB
  const localSuccess = saveTriviaConfig(config);

  // Save to Firebase if configured
  if (isFirebaseConfigured()) {
    const setIndex = Object.keys(config.sets).indexOf(set.id);
    const firestoreSet = localToFirestoreTriviaSet(set, setIndex);
    try {
      await saveFirestoreTriviaSet(firestoreSet);
      console.log('[TriviaStorage] Saved to Firebase');
    } catch (err) {
      console.error('[TriviaStorage] Failed to save to Firebase:', err);
      return false;
    }
  }

  return localSuccess;
}

// Delete trivia set (from both IndexedDB and Firebase)
export function deleteTriviaSet(setId: string): boolean {
  const config = loadTriviaConfig();
  delete config.sets[setId];
  config.lastUpdated = new Date().toISOString();

  // Delete from Firebase if configured
  if (isFirebaseConfigured()) {
    deleteFirestoreTriviaSet(setId).catch(err => {
      console.error('[TriviaStorage] Failed to delete from Firebase:', err);
    });
  }

  return saveTriviaConfig(config);
}

// Async version for explicit Firebase delete
export async function deleteTriviaSetAsync(setId: string): Promise<boolean> {
  const config = loadTriviaConfig();
  delete config.sets[setId];
  config.lastUpdated = new Date().toISOString();

  // Delete from IndexedDB
  const localSuccess = saveTriviaConfig(config);

  // Delete from Firebase if configured
  if (isFirebaseConfigured()) {
    try {
      await deleteFirestoreTriviaSet(setId);
      console.log('[TriviaStorage] Deleted from Firebase');
    } catch (err) {
      console.error('[TriviaStorage] Failed to delete from Firebase:', err);
      return false;
    }
  }

  return localSuccess;
}

// Create new trivia question
export function createEmptyQuestion(): TriviaQuestion {
  return {
    id: `q-${Date.now()}`,
    answerTrigger: 'end',
    questionText: '',
    answers: [
      { id: `a-${Date.now()}-1`, text: '', isCorrect: true },
      { id: `a-${Date.now()}-2`, text: '', isCorrect: false },
      { id: `a-${Date.now()}-3`, text: '', isCorrect: false },
      { id: `a-${Date.now()}-4`, text: '', isCorrect: false },
    ],
    correctMessage: 'Correct!',
    wrongMessage: 'Not quite!',
    xpReward: 10,
  };
}

// Create new trivia set
export function createEmptyTriviaSet(storyId: string): TriviaSet {
  return {
    id: `trivia-${Date.now()}`,
    title: 'New Trivia Set',
    description: '',
    storyId,
    questions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// Convert file to base64
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

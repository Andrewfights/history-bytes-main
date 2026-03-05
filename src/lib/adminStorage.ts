/**
 * Admin Storage Helper
 * Provides localStorage persistence for admin panel data
 * Used as fallback when Supabase is not configured
 */

const STORAGE_PREFIX = 'hb_admin_';

// Storage keys
export const STORAGE_KEYS = {
  GUIDES: `${STORAGE_PREFIX}guides`,
  COURSES: `${STORAGE_PREFIX}courses`,
  UNITS: `${STORAGE_PREFIX}units`,
  LESSONS: `${STORAGE_PREFIX}lessons`,
  LESSON_CONTENT: `${STORAGE_PREFIX}lesson_content`,
  MEDIA_GALLERY: `${STORAGE_PREFIX}media_gallery`,
  TIMELINE_CLIPS: `${STORAGE_PREFIX}timeline_clips`,
  MUSIC_LIBRARY: `${STORAGE_PREFIX}music_library`,
  ARCADE_DATA: `${STORAGE_PREFIX}arcade_data`,
  JOURNEY_ARCS: `${STORAGE_PREFIX}journey_arcs`,
  GHOST_ARMY_MEDIA: `${STORAGE_PREFIX}ghost_army_media`,
  PEARL_HARBOR_MEDIA: `${STORAGE_PREFIX}pearl_harbor_media`,
} as const;

// Custom event for notifying about storage updates
const STORAGE_UPDATE_EVENT = 'adminStorageUpdate';

function notifyStorageUpdate(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_UPDATE_EVENT, { detail: { key } }));
  }
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const test = '__storage_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Save data to localStorage
 */
export function saveToStorage<T>(key: string, data: T): boolean {
  if (!isLocalStorageAvailable()) {
    console.error('localStorage is not available');
    return false;
  }
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(key, serialized);
    // Notify listeners about the update
    notifyStorageUpdate(key);
    console.log(`[AdminStorage] Saved to ${key} (${(serialized.length / 1024).toFixed(1)}KB)`);
    return true;
  } catch (error) {
    if (error instanceof DOMException && (
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      console.error('localStorage quota exceeded. Try removing some media.');
    } else {
      console.error('Failed to save to localStorage:', error);
    }
    return false;
  }
}

/**
 * Load data from localStorage
 */
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored) as T;
    }
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
  }
  return defaultValue;
}

/**
 * Remove data from localStorage
 */
export function removeFromStorage(key: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to remove from localStorage:', error);
    return false;
  }
}

/**
 * Clear all admin storage
 */
export function clearAdminStorage(): void {
  if (!isLocalStorageAvailable()) return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// ============ Type-safe storage helpers ============

import type { Course, Unit, Lesson, SpiritGuide } from '@/types';
import type { DbSpiritGuide, LessonContent } from './database';

// Guides
export function saveGuides(guides: DbSpiritGuide[]): boolean {
  return saveToStorage(STORAGE_KEYS.GUIDES, guides);
}

export function loadStoredGuides(): DbSpiritGuide[] | null {
  const data = loadFromStorage<DbSpiritGuide[] | null>(STORAGE_KEYS.GUIDES, null);
  return data;
}

// Courses
export function saveCourses(courses: Course[]): boolean {
  return saveToStorage(STORAGE_KEYS.COURSES, courses);
}

export function loadStoredCourses(): Course[] | null {
  return loadFromStorage<Course[] | null>(STORAGE_KEYS.COURSES, null);
}

// Units
export function saveUnits(units: Unit[]): boolean {
  return saveToStorage(STORAGE_KEYS.UNITS, units);
}

export function loadStoredUnits(): Unit[] | null {
  return loadFromStorage<Unit[] | null>(STORAGE_KEYS.UNITS, null);
}

// Lessons
export function saveLessons(lessons: Lesson[]): boolean {
  return saveToStorage(STORAGE_KEYS.LESSONS, lessons);
}

export function loadStoredLessons(): Lesson[] | null {
  return loadFromStorage<Lesson[] | null>(STORAGE_KEYS.LESSONS, null);
}

// Lesson Content
export function saveLessonContentLocal(lessonId: string, content: LessonContent[]): boolean {
  const allContent = loadFromStorage<Record<string, LessonContent[]>>(STORAGE_KEYS.LESSON_CONTENT, {});
  allContent[lessonId] = content;
  return saveToStorage(STORAGE_KEYS.LESSON_CONTENT, allContent);
}

export function loadStoredLessonContent(lessonId: string): LessonContent[] | null {
  const allContent = loadFromStorage<Record<string, LessonContent[]>>(STORAGE_KEYS.LESSON_CONTENT, {});
  return allContent[lessonId] || null;
}

// Media Gallery (generated images)
export interface StoredMedia {
  id: string;
  prompt: string;
  type: 'image' | 'video';
  aspectRatio: string;
  dataUrl: string;
  createdAt: string;
}

export function saveMediaGallery(media: StoredMedia[]): boolean {
  // Limit stored media to prevent localStorage overflow
  const limitedMedia = media.slice(0, 50);
  return saveToStorage(STORAGE_KEYS.MEDIA_GALLERY, limitedMedia);
}

export function loadStoredMediaGallery(): StoredMedia[] {
  return loadFromStorage<StoredMedia[]>(STORAGE_KEYS.MEDIA_GALLERY, []);
}

export function addToMediaGallery(media: StoredMedia): boolean {
  const existing = loadStoredMediaGallery();
  const updated = [media, ...existing].slice(0, 50); // Keep max 50
  return saveMediaGallery(updated);
}

// Timeline Clips
export interface StoredTimelineClip {
  id: string;
  name: string;
  type: 'image' | 'video';
  duration: number;
  thumbnail: string;
  src: string;
  trimStart?: number;
  trimEnd?: number;
}

export function saveTimelineClips(clips: StoredTimelineClip[]): boolean {
  return saveToStorage(STORAGE_KEYS.TIMELINE_CLIPS, clips);
}

export function loadStoredTimelineClips(): StoredTimelineClip[] {
  return loadFromStorage<StoredTimelineClip[]>(STORAGE_KEYS.TIMELINE_CLIPS, []);
}

// Arcade Data
export interface StoredArcadeData {
  anachronismScenes: unknown[];
  connectionsPuzzles: unknown[];
  mapMysteries: unknown[];
  artifactCases: unknown[];
  causeEffectPairs: unknown[];
}

export function saveArcadeData(data: StoredArcadeData): boolean {
  return saveToStorage(STORAGE_KEYS.ARCADE_DATA, data);
}

export function loadStoredArcadeData(): StoredArcadeData | null {
  return loadFromStorage<StoredArcadeData | null>(STORAGE_KEYS.ARCADE_DATA, null);
}

// Journey Arcs
export function saveJourneyArcs(arcs: unknown[]): boolean {
  return saveToStorage(STORAGE_KEYS.JOURNEY_ARCS, arcs);
}

export function loadStoredJourneyArcs(): unknown[] | null {
  return loadFromStorage<unknown[] | null>(STORAGE_KEYS.JOURNEY_ARCS, null);
}

// Music Library (generated and uploaded music)
export interface StoredMusic {
  id: string;
  title: string;
  prompt: string;
  audioUrl: string;          // Base64 data URL or URL
  duration: number;          // Seconds
  genre?: string;
  era?: string;
  mood?: string;
  assignedTo?: {             // What this music is assigned to
    type: 'module' | 'game' | 'lesson' | 'course';
    id: string;
    name: string;
  }[];
  playMode?: 'once' | 'loop';
  createdAt: string;
  source: 'generated' | 'uploaded';
}

export function saveMusicLibrary(music: StoredMusic[]): boolean {
  // Limit stored music to prevent localStorage overflow
  const limitedMusic = music.slice(0, 30);
  return saveToStorage(STORAGE_KEYS.MUSIC_LIBRARY, limitedMusic);
}

export function loadStoredMusicLibrary(): StoredMusic[] {
  return loadFromStorage<StoredMusic[]>(STORAGE_KEYS.MUSIC_LIBRARY, []);
}

export function addToMusicLibrary(music: StoredMusic): boolean {
  const existing = loadStoredMusicLibrary();
  const updated = [music, ...existing].slice(0, 30); // Keep max 30
  return saveMusicLibrary(updated);
}

export function updateMusicAssignment(
  musicId: string,
  assignedTo: StoredMusic['assignedTo'],
  playMode: 'once' | 'loop'
): boolean {
  const existing = loadStoredMusicLibrary();
  const updated = existing.map(m =>
    m.id === musicId ? { ...m, assignedTo, playMode } : m
  );
  return saveMusicLibrary(updated);
}

export function removeMusicFromLibrary(musicId: string): boolean {
  const existing = loadStoredMusicLibrary();
  const updated = existing.filter(m => m.id !== musicId);
  return saveMusicLibrary(updated);
}

// ============ Auto-save debounce helper ============

const saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Debounced save - waits for user to stop typing before saving
 */
export function debouncedSave<T>(
  key: string,
  data: T,
  delay: number = 500
): void {
  if (saveTimers[key]) {
    clearTimeout(saveTimers[key]);
  }
  saveTimers[key] = setTimeout(() => {
    saveToStorage(key, data);
  }, delay);
}

/**
 * Check if there's unsaved admin data
 */
export function hasStoredAdminData(): boolean {
  if (!isLocalStorageAvailable()) return false;
  return Object.values(STORAGE_KEYS).some(key => {
    const data = localStorage.getItem(key);
    return data !== null;
  });
}

/**
 * Get storage usage info
 */
export function getStorageInfo(): { used: string; available: string } {
  if (!isLocalStorageAvailable()) {
    return { used: '0 MB', available: '~5 MB (browser limit)' };
  }
  let used = 0;
  Object.values(STORAGE_KEYS).forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      used += data.length * 2; // UTF-16 = 2 bytes per char
    }
  });

  const usedMB = (used / (1024 * 1024)).toFixed(2);
  return {
    used: `${usedMB} MB`,
    available: '~5 MB (browser limit)',
  };
}

// ============ IndexedDB for Large Media Files ============

export interface GhostArmyNodeMedia {
  nodeId: string;
  videoUrl?: string;           // Primary video (or intro video for watch nodes)
  videoUrl2?: string;          // Secondary video (narration video for watch nodes)
  videoThumbnail?: string;     // Thumbnail image
  backgroundImage?: string;    // Background/hero image
  additionalImages?: string[]; // Extra images for the node
}

export interface GhostArmyMediaConfig {
  nodes: Record<string, GhostArmyNodeMedia>;
  lastUpdated: string;
}

// Course Media Storage
export interface CourseMediaConfig {
  thumbnails: Record<string, string>; // courseId -> thumbnail data URL
  lastUpdated: string;
}

// Arcade Media Storage
export interface ArcadeMediaConfig {
  images: Record<string, string>;      // itemId -> image data URL
  lastUpdated: string;
}

// Lesson Media Storage
export interface LessonMediaConfig {
  media: Record<string, Record<string, string>>; // lessonId -> contentId -> media URL
  lastUpdated: string;
}

// Journey Media Storage
export interface JourneyMediaConfig {
  images: Record<string, string>;      // nodeId -> image data URL
  lastUpdated: string;
}

const DEFAULT_GHOST_ARMY_MEDIA: GhostArmyMediaConfig = {
  nodes: {},
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_COURSE_MEDIA: CourseMediaConfig = {
  thumbnails: {},
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_ARCADE_MEDIA: ArcadeMediaConfig = {
  images: {},
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_LESSON_MEDIA: LessonMediaConfig = {
  media: {},
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_JOURNEY_MEDIA: JourneyMediaConfig = {
  images: {},
  lastUpdated: new Date().toISOString(),
};

const DB_NAME = 'history_bytes_media';
const DB_VERSION = 4; // Version 4: added pearl_harbor_media store
const STORE_NAMES = {
  GHOST_ARMY: 'ghost_army_media',
  PEARL_HARBOR: 'pearl_harbor_media',
  COURSES: 'course_media',
  ARCADE: 'arcade_media',
  LESSONS: 'lesson_media',
  JOURNEYS: 'journey_media',
  TRIVIA: 'trivia_data',
  WW2_MAP: 'ww2_map_data',
} as const;

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
      // Create all required stores
      Object.values(STORE_NAMES).forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
          console.log(`[IndexedDB] Created ${storeName} store`);
        }
      });
    };
  });
}

// Generic save to IndexedDB with store name
async function saveToIndexedDBGeneric<T>(storeName: string, id: string, data: T, notifyKey?: string): Promise<boolean> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put({ id, data });

      request.onsuccess = () => {
        console.log(`[IndexedDB] Saved ${id} to ${storeName} successfully`);
        if (notifyKey) notifyStorageUpdate(notifyKey);
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

// Generic load from IndexedDB with store name
async function loadFromIndexedDBGeneric<T>(storeName: string, id: string): Promise<T | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
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

// Legacy wrappers for Ghost Army
async function saveToIndexedDB(id: string, data: GhostArmyMediaConfig): Promise<boolean> {
  return saveToIndexedDBGeneric(STORE_NAMES.GHOST_ARMY, id, data, STORAGE_KEYS.GHOST_ARMY_MEDIA);
}

async function loadFromIndexedDB(id: string): Promise<GhostArmyMediaConfig | null> {
  return loadFromIndexedDBGeneric<GhostArmyMediaConfig>(STORE_NAMES.GHOST_ARMY, id);
}

// In-memory cache for synchronous access
let ghostArmyMediaCache: GhostArmyMediaConfig | null = null;
let cacheInitialized = false;

// Initialize cache from IndexedDB (call this on app start)
export async function initGhostArmyMediaCache(): Promise<void> {
  const data = await loadFromIndexedDB('ghost_army_config');
  ghostArmyMediaCache = data || DEFAULT_GHOST_ARMY_MEDIA;
  cacheInitialized = true;
  console.log('[AdminStorage] Ghost Army media cache initialized:', {
    nodeCount: Object.keys(ghostArmyMediaCache.nodes).length,
    nodes: Object.keys(ghostArmyMediaCache.nodes),
  });
}

export async function saveGhostArmyMediaAsync(config: GhostArmyMediaConfig): Promise<boolean> {
  ghostArmyMediaCache = config;
  return saveToIndexedDB('ghost_army_config', config);
}

// Synchronous version that uses cache (for backward compatibility)
export function saveGhostArmyMedia(config: GhostArmyMediaConfig): boolean {
  ghostArmyMediaCache = config;
  // Fire and forget the async save
  saveToIndexedDB('ghost_army_config', config).catch(console.error);
  return true;
}

export function loadGhostArmyMedia(): GhostArmyMediaConfig {
  if (!cacheInitialized) {
    // Return default and trigger async initialization
    initGhostArmyMediaCache().catch(console.error);
    return DEFAULT_GHOST_ARMY_MEDIA;
  }
  const config = ghostArmyMediaCache || DEFAULT_GHOST_ARMY_MEDIA;
  console.log('[AdminStorage] Loaded Ghost Army media from cache:', {
    nodeCount: Object.keys(config.nodes).length,
    nodes: Object.keys(config.nodes),
    lastUpdated: config.lastUpdated
  });
  return config;
}

export async function loadGhostArmyMediaAsync(): Promise<GhostArmyMediaConfig> {
  if (!cacheInitialized) {
    await initGhostArmyMediaCache();
  }
  return ghostArmyMediaCache || DEFAULT_GHOST_ARMY_MEDIA;
}

export function updateGhostArmyNodeMedia(
  nodeId: string,
  media: Partial<GhostArmyNodeMedia>
): boolean {
  console.log(`[AdminStorage] Updating node ${nodeId} with:`, Object.keys(media));
  const config = loadGhostArmyMedia();
  config.nodes[nodeId] = {
    ...config.nodes[nodeId],
    nodeId,
    ...media,
  };
  config.lastUpdated = new Date().toISOString();
  const success = saveGhostArmyMedia(config);
  console.log(`[AdminStorage] Save ${success ? 'succeeded' : 'FAILED'} for node ${nodeId}`);
  return success;
}

export function getGhostArmyNodeMedia(nodeId: string): GhostArmyNodeMedia | null {
  const config = loadGhostArmyMedia();
  return config.nodes[nodeId] || null;
}

// ============ Pearl Harbor Media (IndexedDB) ============

export interface PearlHarborNodeMedia {
  nodeId: string;
  videoUrl?: string;           // Primary video (or intro video for watch nodes)
  videoUrl2?: string;          // Secondary video (narration video for watch nodes)
  videoThumbnail?: string;     // Thumbnail image
  backgroundImage?: string;    // Background/hero image
  additionalImages?: string[]; // Extra images for the node
}

export interface PearlHarborMediaConfig {
  nodes: Record<string, PearlHarborNodeMedia>;
  lastUpdated: string;
}

const DEFAULT_PEARL_HARBOR_MEDIA: PearlHarborMediaConfig = {
  nodes: {},
  lastUpdated: new Date().toISOString(),
};

let pearlHarborMediaCache: PearlHarborMediaConfig | null = null;
let pearlHarborCacheInitialized = false;

export async function initPearlHarborMediaCache(): Promise<void> {
  const data = await loadFromIndexedDBGeneric<PearlHarborMediaConfig>(STORE_NAMES.PEARL_HARBOR, 'pearl_harbor_config');
  pearlHarborMediaCache = data || DEFAULT_PEARL_HARBOR_MEDIA;
  pearlHarborCacheInitialized = true;
  console.log('[AdminStorage] Pearl Harbor media cache initialized:', {
    nodeCount: Object.keys(pearlHarborMediaCache.nodes).length,
    nodes: Object.keys(pearlHarborMediaCache.nodes),
  });
}

export async function savePearlHarborMediaAsync(config: PearlHarborMediaConfig): Promise<boolean> {
  pearlHarborMediaCache = config;
  return saveToIndexedDBGeneric(STORE_NAMES.PEARL_HARBOR, 'pearl_harbor_config', config, STORAGE_KEYS.PEARL_HARBOR_MEDIA);
}

export function savePearlHarborMedia(config: PearlHarborMediaConfig): boolean {
  pearlHarborMediaCache = config;
  saveToIndexedDBGeneric(STORE_NAMES.PEARL_HARBOR, 'pearl_harbor_config', config, STORAGE_KEYS.PEARL_HARBOR_MEDIA).catch(console.error);
  return true;
}

export function loadPearlHarborMedia(): PearlHarborMediaConfig {
  if (!pearlHarborCacheInitialized) {
    initPearlHarborMediaCache().catch(console.error);
    return DEFAULT_PEARL_HARBOR_MEDIA;
  }
  const config = pearlHarborMediaCache || DEFAULT_PEARL_HARBOR_MEDIA;
  console.log('[AdminStorage] Loaded Pearl Harbor media from cache:', {
    nodeCount: Object.keys(config.nodes).length,
    nodes: Object.keys(config.nodes),
    lastUpdated: config.lastUpdated
  });
  return config;
}

export async function loadPearlHarborMediaAsync(): Promise<PearlHarborMediaConfig> {
  if (!pearlHarborCacheInitialized) {
    await initPearlHarborMediaCache();
  }
  return pearlHarborMediaCache || DEFAULT_PEARL_HARBOR_MEDIA;
}

export function updatePearlHarborNodeMedia(
  nodeId: string,
  media: Partial<PearlHarborNodeMedia>
): boolean {
  console.log(`[AdminStorage] Updating Pearl Harbor node ${nodeId} with:`, Object.keys(media));
  const config = loadPearlHarborMedia();
  config.nodes[nodeId] = {
    ...config.nodes[nodeId],
    nodeId,
    ...media,
  };
  config.lastUpdated = new Date().toISOString();
  const success = savePearlHarborMedia(config);
  console.log(`[AdminStorage] Save ${success ? 'succeeded' : 'FAILED'} for Pearl Harbor node ${nodeId}`);
  return success;
}

export function getPearlHarborNodeMedia(nodeId: string): PearlHarborNodeMedia | null {
  const config = loadPearlHarborMedia();
  return config.nodes[nodeId] || null;
}

// Convert file to base64 data URL
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Get IndexedDB storage estimate
export async function getIndexedDBStorageInfo(): Promise<{ used: string; available: string }> {
  if (navigator.storage && navigator.storage.estimate) {
    const estimate = await navigator.storage.estimate();
    const usedMB = ((estimate.usage || 0) / (1024 * 1024)).toFixed(1);
    const availableMB = ((estimate.quota || 0) / (1024 * 1024)).toFixed(0);
    return {
      used: `${usedMB} MB`,
      available: `${availableMB} MB`,
    };
  }
  return { used: 'Unknown', available: 'Unknown' };
}

// ============ Course Media (IndexedDB) ============

let courseMediaCache: CourseMediaConfig | null = null;
let courseMediaCacheInit = false;

export async function initCourseMediaCache(): Promise<void> {
  const data = await loadFromIndexedDBGeneric<CourseMediaConfig>(STORE_NAMES.COURSES, 'course_media_config');
  courseMediaCache = data || DEFAULT_COURSE_MEDIA;
  courseMediaCacheInit = true;
  console.log('[AdminStorage] Course media cache initialized:', Object.keys(courseMediaCache.thumbnails).length, 'thumbnails');
}

export async function saveCourseMediaAsync(config: CourseMediaConfig): Promise<boolean> {
  courseMediaCache = config;
  return saveToIndexedDBGeneric(STORE_NAMES.COURSES, 'course_media_config', config, STORAGE_KEYS.COURSES);
}

export function saveCourseMedia(config: CourseMediaConfig): boolean {
  courseMediaCache = config;
  saveToIndexedDBGeneric(STORE_NAMES.COURSES, 'course_media_config', config, STORAGE_KEYS.COURSES).catch(console.error);
  return true;
}

export function loadCourseMedia(): CourseMediaConfig {
  if (!courseMediaCacheInit) {
    initCourseMediaCache().catch(console.error);
    return DEFAULT_COURSE_MEDIA;
  }
  return courseMediaCache || DEFAULT_COURSE_MEDIA;
}

export async function loadCourseMediaAsync(): Promise<CourseMediaConfig> {
  if (!courseMediaCacheInit) {
    await initCourseMediaCache();
  }
  return courseMediaCache || DEFAULT_COURSE_MEDIA;
}

export function setCourseThumbnail(courseId: string, thumbnailUrl: string): boolean {
  const config = loadCourseMedia();
  config.thumbnails[courseId] = thumbnailUrl;
  config.lastUpdated = new Date().toISOString();
  return saveCourseMedia(config);
}

export function getCourseThumbnail(courseId: string): string | null {
  const config = loadCourseMedia();
  return config.thumbnails[courseId] || null;
}

// ============ Arcade Media (IndexedDB) ============

let arcadeMediaCache: ArcadeMediaConfig | null = null;
let arcadeMediaCacheInit = false;

export async function initArcadeMediaCache(): Promise<void> {
  const data = await loadFromIndexedDBGeneric<ArcadeMediaConfig>(STORE_NAMES.ARCADE, 'arcade_media_config');
  arcadeMediaCache = data || DEFAULT_ARCADE_MEDIA;
  arcadeMediaCacheInit = true;
  console.log('[AdminStorage] Arcade media cache initialized:', Object.keys(arcadeMediaCache.images).length, 'images');
}

export async function saveArcadeMediaAsync(config: ArcadeMediaConfig): Promise<boolean> {
  arcadeMediaCache = config;
  return saveToIndexedDBGeneric(STORE_NAMES.ARCADE, 'arcade_media_config', config, STORAGE_KEYS.ARCADE_DATA);
}

export function saveArcadeMedia(config: ArcadeMediaConfig): boolean {
  arcadeMediaCache = config;
  saveToIndexedDBGeneric(STORE_NAMES.ARCADE, 'arcade_media_config', config, STORAGE_KEYS.ARCADE_DATA).catch(console.error);
  return true;
}

export function loadArcadeMedia(): ArcadeMediaConfig {
  if (!arcadeMediaCacheInit) {
    initArcadeMediaCache().catch(console.error);
    return DEFAULT_ARCADE_MEDIA;
  }
  return arcadeMediaCache || DEFAULT_ARCADE_MEDIA;
}

export async function loadArcadeMediaAsync(): Promise<ArcadeMediaConfig> {
  if (!arcadeMediaCacheInit) {
    await initArcadeMediaCache();
  }
  return arcadeMediaCache || DEFAULT_ARCADE_MEDIA;
}

export function setArcadeImage(itemId: string, imageUrl: string): boolean {
  const config = loadArcadeMedia();
  config.images[itemId] = imageUrl;
  config.lastUpdated = new Date().toISOString();
  return saveArcadeMedia(config);
}

export function getArcadeImage(itemId: string): string | null {
  const config = loadArcadeMedia();
  return config.images[itemId] || null;
}

// ============ Lesson Media (IndexedDB) ============

let lessonMediaCache: LessonMediaConfig | null = null;
let lessonMediaCacheInit = false;

export async function initLessonMediaCache(): Promise<void> {
  const data = await loadFromIndexedDBGeneric<LessonMediaConfig>(STORE_NAMES.LESSONS, 'lesson_media_config');
  lessonMediaCache = data || DEFAULT_LESSON_MEDIA;
  lessonMediaCacheInit = true;
  console.log('[AdminStorage] Lesson media cache initialized:', Object.keys(lessonMediaCache.media).length, 'lessons with media');
}

export async function saveLessonMediaAsync(config: LessonMediaConfig): Promise<boolean> {
  lessonMediaCache = config;
  return saveToIndexedDBGeneric(STORE_NAMES.LESSONS, 'lesson_media_config', config, STORAGE_KEYS.LESSON_CONTENT);
}

export function saveLessonMedia(config: LessonMediaConfig): boolean {
  lessonMediaCache = config;
  saveToIndexedDBGeneric(STORE_NAMES.LESSONS, 'lesson_media_config', config, STORAGE_KEYS.LESSON_CONTENT).catch(console.error);
  return true;
}

export function loadLessonMedia(): LessonMediaConfig {
  if (!lessonMediaCacheInit) {
    initLessonMediaCache().catch(console.error);
    return DEFAULT_LESSON_MEDIA;
  }
  return lessonMediaCache || DEFAULT_LESSON_MEDIA;
}

export async function loadLessonMediaAsync(): Promise<LessonMediaConfig> {
  if (!lessonMediaCacheInit) {
    await initLessonMediaCache();
  }
  return lessonMediaCache || DEFAULT_LESSON_MEDIA;
}

export function setLessonContentMedia(lessonId: string, contentId: string, mediaUrl: string): boolean {
  const config = loadLessonMedia();
  if (!config.media[lessonId]) {
    config.media[lessonId] = {};
  }
  config.media[lessonId][contentId] = mediaUrl;
  config.lastUpdated = new Date().toISOString();
  return saveLessonMedia(config);
}

export function getLessonContentMedia(lessonId: string, contentId: string): string | null {
  const config = loadLessonMedia();
  return config.media[lessonId]?.[contentId] || null;
}

// ============ Journey Media (IndexedDB) ============

let journeyMediaCache: JourneyMediaConfig | null = null;
let journeyMediaCacheInit = false;

export async function initJourneyMediaCache(): Promise<void> {
  const data = await loadFromIndexedDBGeneric<JourneyMediaConfig>(STORE_NAMES.JOURNEYS, 'journey_media_config');
  journeyMediaCache = data || DEFAULT_JOURNEY_MEDIA;
  journeyMediaCacheInit = true;
  console.log('[AdminStorage] Journey media cache initialized:', Object.keys(journeyMediaCache.images).length, 'images');
}

export async function saveJourneyMediaAsync(config: JourneyMediaConfig): Promise<boolean> {
  journeyMediaCache = config;
  return saveToIndexedDBGeneric(STORE_NAMES.JOURNEYS, 'journey_media_config', config, STORAGE_KEYS.JOURNEY_ARCS);
}

export function saveJourneyMedia(config: JourneyMediaConfig): boolean {
  journeyMediaCache = config;
  saveToIndexedDBGeneric(STORE_NAMES.JOURNEYS, 'journey_media_config', config, STORAGE_KEYS.JOURNEY_ARCS).catch(console.error);
  return true;
}

export function loadJourneyMedia(): JourneyMediaConfig {
  if (!journeyMediaCacheInit) {
    initJourneyMediaCache().catch(console.error);
    return DEFAULT_JOURNEY_MEDIA;
  }
  return journeyMediaCache || DEFAULT_JOURNEY_MEDIA;
}

export async function loadJourneyMediaAsync(): Promise<JourneyMediaConfig> {
  if (!journeyMediaCacheInit) {
    await initJourneyMediaCache();
  }
  return journeyMediaCache || DEFAULT_JOURNEY_MEDIA;
}

export function setJourneyImage(nodeId: string, imageUrl: string): boolean {
  const config = loadJourneyMedia();
  config.images[nodeId] = imageUrl;
  config.lastUpdated = new Date().toISOString();
  return saveJourneyMedia(config);
}

export function getJourneyImage(nodeId: string): string | null {
  const config = loadJourneyMedia();
  return config.images[nodeId] || null;
}

// ============ Initialize All Caches ============

export async function initAllMediaCaches(): Promise<void> {
  await Promise.all([
    initGhostArmyMediaCache(),
    initPearlHarborMediaCache(),
    initCourseMediaCache(),
    initArcadeMediaCache(),
    initLessonMediaCache(),
    initJourneyMediaCache(),
  ]);
  console.log('[AdminStorage] All media caches initialized');
}

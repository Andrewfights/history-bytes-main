// localStorage persistence utilities for History Bytes
// With Firebase/Firestore integration for authenticated users

import { isFirebaseConfigured, auth } from './firebase';
import {
  getUserProfile as firestoreGetUserProfile,
  saveUserProfile as firestoreSaveUserProfile,
  getJourneyProgress as firestoreGetJourneyProgress,
  saveJourneyProgress as firestoreSaveJourneyProgress,
  getCourseProgress as firestoreGetCourseProgress,
  saveCourseProgress as firestoreSaveCourseProgress,
  getUserBadges,
  saveBadge,
  getArcadeRecord,
  saveArcadeRecord,
} from './firestore';

const STORAGE_PREFIX = 'history-bytes';

export const STORAGE_KEYS = {
  USER_PROFILE: `${STORAGE_PREFIX}:user`,
  JOURNEY_PROGRESS: `${STORAGE_PREFIX}:journey`,
  COURSE_PROGRESS: `${STORAGE_PREFIX}:courses`,
  ARCADE_RECORDS: `${STORAGE_PREFIX}:arcade`,
  APP_META: `${STORAGE_PREFIX}:meta`,
  ONBOARDED: `${STORAGE_PREFIX}:onboarded`,
  SELECTED_GUIDE: `${STORAGE_PREFIX}:selected-guide`,
  AUTH: `${STORAGE_PREFIX}:auth`,
  BADGES: `${STORAGE_PREFIX}:badges`,
  TOOLTIPS: `${STORAGE_PREFIX}:tooltips`,
  STUDY_NOTES: `${STORAGE_PREFIX}:study-notes`,
  FUNNEL_STATE: `${STORAGE_PREFIX}:funnel-state`,
  // WW2 specific preferences (uses different prefix for legacy reasons)
  WW2_PREFERENCES: 'hb_ww2_preferences',
  WW2_THEATER_PROGRESS: 'hb_ww2_theater_progress',
  PEARL_HARBOR_PROGRESS: 'hb_pearl_harbor_progress',
  PEARL_HARBOR_CHECKPOINT: 'hb_pearl_harbor_checkpoint',
  // Pantheon Souvenir Room
  PANTHEON_PROGRESS: 'hb_pantheon_progress',
} as const;

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  email: string | null;
}

export interface PersistedUserProfile {
  id: string;
  displayName: string;
  anonLeaderboard: boolean;
  xp: number;
  streak: number;
  lastActiveDate: string;
  selectedGuideId?: string;
  isOnboarded?: boolean;
}

export interface PersistedJourneyProgress {
  completedNodes: string[];
  nodeMastery: Record<string, string>;
  recentArcIds: string[];
  journeyViewState: {
    view: 'landing' | 'arc' | 'node';
    arcId: string | null;
    chapterId: string | null;
    nodeId: string | null;
    chapterIndex: number;
  } | null;
  viewedChapterIntros: string[];
}

export interface PersistedCourseProgress {
  completedLessons: string[];
}

export interface PersistedArcadeRecords {
  playRecords: Record<string, {
    playsToday: number;
    xpEarned: number;
    lastPlayDate: string;
  }>;
}

export interface PersistedAppMeta {
  version: string;
  firstVisit: string;
  lastVisit: string;
  isReturningUser: boolean;
}

export interface PersistedBadges {
  earnedBadges: Array<{
    badgeId: string;
    earnedAt: string;
    isNew: boolean;
  }>;
  perfectScoreCount: number;
  bossNodesDefeated: number;
  playedNodeTypes: string[];
  arcadeGamesPlayed: number;
  totalQuizAttempts: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
}

export interface PersistedTooltips {
  seenTooltips: string[];
}

export interface StudyNote {
  id: string;
  question: string;
  correctAnswer: string;
  userAnswer: string;
  explanation: string;
  imageUrl?: string;
  nodeTitle: string;
  nodeType: string;
  timestamp: number;
}

export interface PersistedStudyNotes {
  notes: StudyNote[];
}

// Funnel state for WW2 demo experience
export interface GhostArmyProgress {
  started: boolean;
  completed: boolean;
  lastTimestamp: number;  // For resume (legacy)
  interactionsCompleted: string[];  // Legacy
  // Multi-node story tracking
  currentNodeIndex?: number;
  nodesCompleted?: string[];
  totalXP?: number;
  totalCorrect?: number;
  totalQuestions?: number;
}

export interface FunnelState {
  mode: 'exploration' | 'funnel-ww2';
  ww2: {
    hasViewedIntro: boolean;
    ghostArmyProgress: GhostArmyProgress;
    unlockedStories: string[];  // Unlocked after Ghost Army completion
  };
}

// Pantheon Souvenir Room persistence
export interface PersistedSouvenirProgress {
  souvenirId: string;
  currentTier: 'gray' | 'bronze' | 'silver' | 'gold';
  unlockedAt: string;       // ISO date
  upgradedAt?: string;      // ISO date
  examScores: number[];     // Historical exam scores (percentage 0-100)
}

export interface PersistedPantheonProgress {
  souvenirs: Record<string, PersistedSouvenirProgress>;
  lastVisited?: string;
}

function isStorageAvailable(): boolean {
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

export function saveToStorage<T>(key: string, value: T): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to save to localStorage: ${key}`, error);
  }
}

export function loadFromStorage<T>(key: string): T | null {
  if (!isStorageAvailable()) return null;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.warn(`Failed to load from localStorage: ${key}`, error);
    return null;
  }
}

export function removeFromStorage(key: string): void {
  if (!isStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove from localStorage: ${key}`, error);
  }
}

export function clearAllStorage(): void {
  if (!isStorageAvailable()) return;
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Calculate streak based on last active date
export function calculateStreak(lastActiveDate: string, currentStreak: number): number {
  const today = new Date().toISOString().split('T')[0];
  const lastActive = lastActiveDate.split('T')[0];

  if (lastActive === today) {
    // Already active today, maintain streak
    return currentStreak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (lastActive === yesterdayStr) {
    // Active yesterday, increment streak
    return currentStreak + 1;
  }

  // Streak broken, reset to 1
  return 1;
}

// Check if user has completed onboarding
export function hasCompletedOnboarding(): boolean {
  return loadFromStorage<boolean>(STORAGE_KEYS.ONBOARDED) === true;
}

export function setOnboardingComplete(): void {
  saveToStorage(STORAGE_KEYS.ONBOARDED, true);
}

// Get selected spirit guide ID
export function getSelectedGuideId(): string | null {
  return loadFromStorage<string>(STORAGE_KEYS.SELECTED_GUIDE);
}

export function setSelectedGuideId(guideId: string): void {
  saveToStorage(STORAGE_KEYS.SELECTED_GUIDE, guideId);
}

// Authentication helpers
export function getAuthState(): AuthState | null {
  return loadFromStorage<AuthState>(STORAGE_KEYS.AUTH);
}

export function setAuthState(auth: AuthState): void {
  saveToStorage(STORAGE_KEYS.AUTH, auth);
}

export function clearAuthState(): void {
  removeFromStorage(STORAGE_KEYS.AUTH);
}

// ============ Firebase User Data Sync ============

// Get current user ID from Firebase auth or localStorage
function getCurrentUserId(): string | null {
  if (isFirebaseConfigured() && auth?.currentUser) {
    return auth.currentUser.uid;
  }
  // Fall back to localStorage auth
  const authState = getAuthState();
  return authState?.userId || null;
}

// ============ User Profile ============

export async function loadUserProfile(): Promise<PersistedUserProfile | null> {
  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      const data = await firestoreGetUserProfile(userId);

      if (data) {
        const profile: PersistedUserProfile = {
          id: userId,
          displayName: data.displayName || '',
          anonLeaderboard: data.anonLeaderboard,
          xp: data.xp,
          streak: data.streak,
          lastActiveDate: data.lastActiveDate?.toDate?.()?.toISOString() || new Date().toISOString(),
          selectedGuideId: data.selectedGuideId || undefined,
          isOnboarded: data.isOnboarded,
        };
        // Cache in localStorage
        saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);
        return profile;
      }
    } catch (err) {
      console.error('Firestore loadUserProfile error:', err);
    }
  }

  return loadFromStorage<PersistedUserProfile>(STORAGE_KEYS.USER_PROFILE);
}

export async function saveUserProfile(profile: PersistedUserProfile): Promise<boolean> {
  // Always save to localStorage
  saveToStorage(STORAGE_KEYS.USER_PROFILE, profile);

  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      await firestoreSaveUserProfile(userId, {
        displayName: profile.displayName || '',
        xp: profile.xp,
        streak: profile.streak,
        selectedGuideId: profile.selectedGuideId || null,
        isOnboarded: profile.isOnboarded || false,
        anonLeaderboard: profile.anonLeaderboard,
      });
      return true;
    } catch (err) {
      console.error('Firestore saveUserProfile error:', err);
    }
  }

  return true;
}

// ============ Journey Progress ============

export async function loadJourneyProgress(): Promise<PersistedJourneyProgress | null> {
  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      const data = await firestoreGetJourneyProgress(userId);

      if (data) {
        const progress: PersistedJourneyProgress = {
          completedNodes: data.completedNodes || [],
          nodeMastery: data.nodeMastery || {},
          recentArcIds: data.recentArcIds || [],
          journeyViewState: data.journeyViewState as PersistedJourneyProgress['journeyViewState'],
          viewedChapterIntros: data.viewedChapterIntros || [],
        };
        // Cache in localStorage
        saveToStorage(STORAGE_KEYS.JOURNEY_PROGRESS, progress);
        return progress;
      }
    } catch (err) {
      console.error('Firestore loadJourneyProgress error:', err);
    }
  }

  return loadFromStorage<PersistedJourneyProgress>(STORAGE_KEYS.JOURNEY_PROGRESS);
}

export async function saveJourneyProgress(progress: PersistedJourneyProgress): Promise<boolean> {
  // Always save to localStorage
  saveToStorage(STORAGE_KEYS.JOURNEY_PROGRESS, progress);

  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      await firestoreSaveJourneyProgress(userId, {
        completedNodes: progress.completedNodes,
        nodeMastery: progress.nodeMastery,
        recentArcIds: progress.recentArcIds,
        journeyViewState: progress.journeyViewState,
        viewedChapterIntros: progress.viewedChapterIntros,
      });
      return true;
    } catch (err) {
      console.error('Firestore saveJourneyProgress error:', err);
    }
  }

  return true;
}

// ============ Course Progress ============

export async function loadCourseProgress(): Promise<PersistedCourseProgress | null> {
  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      const data = await firestoreGetCourseProgress(userId);

      if (data) {
        const progress: PersistedCourseProgress = {
          completedLessons: data.completedLessons || [],
        };
        // Cache in localStorage
        saveToStorage(STORAGE_KEYS.COURSE_PROGRESS, progress);
        return progress;
      }
    } catch (err) {
      console.error('Firestore loadCourseProgress error:', err);
    }
  }

  return loadFromStorage<PersistedCourseProgress>(STORAGE_KEYS.COURSE_PROGRESS);
}

export async function saveCourseProgress(progress: PersistedCourseProgress): Promise<boolean> {
  // Always save to localStorage
  saveToStorage(STORAGE_KEYS.COURSE_PROGRESS, progress);

  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      await firestoreSaveCourseProgress(userId, {
        completedLessons: progress.completedLessons,
      });
      return true;
    } catch (err) {
      console.error('Firestore saveCourseProgress error:', err);
    }
  }

  return true;
}

// ============ User Badges ============

export async function loadUserBadges(): Promise<PersistedBadges | null> {
  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      const data = await getUserBadges(userId);

      if (data && data.length > 0) {
        const earnedBadges = data.map(row => ({
          badgeId: row.badgeId,
          earnedAt: row.earnedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          isNew: row.isNew,
        }));

        // Load the stats from localStorage (these are computed client-side)
        const localBadges = loadFromStorage<PersistedBadges>(STORAGE_KEYS.BADGES);
        const badges: PersistedBadges = {
          earnedBadges,
          perfectScoreCount: localBadges?.perfectScoreCount || 0,
          bossNodesDefeated: localBadges?.bossNodesDefeated || 0,
          playedNodeTypes: localBadges?.playedNodeTypes || [],
          arcadeGamesPlayed: localBadges?.arcadeGamesPlayed || 0,
          totalQuizAttempts: localBadges?.totalQuizAttempts || 0,
          totalCorrectAnswers: localBadges?.totalCorrectAnswers || 0,
          totalQuestions: localBadges?.totalQuestions || 0,
        };
        // Cache in localStorage
        saveToStorage(STORAGE_KEYS.BADGES, badges);
        return badges;
      }
    } catch (err) {
      console.error('Firestore loadUserBadges error:', err);
    }
  }

  return loadFromStorage<PersistedBadges>(STORAGE_KEYS.BADGES);
}

export async function saveUserBadges(badges: PersistedBadges): Promise<boolean> {
  // Always save to localStorage
  saveToStorage(STORAGE_KEYS.BADGES, badges);

  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      // Save each badge to Firestore
      for (const badge of badges.earnedBadges) {
        await saveBadge(userId, {
          badgeId: badge.badgeId,
          isNew: badge.isNew,
        });
      }
      return true;
    } catch (err) {
      console.error('Firestore saveUserBadges error:', err);
    }
  }

  return true;
}

// ============ Arcade Records ============

export async function loadArcadeRecords(): Promise<PersistedArcadeRecords | null> {
  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      // Load all arcade records for this user
      // Note: We'd need to track which games the user has played
      // For now, load from localStorage and sync
      const localRecords = loadFromStorage<PersistedArcadeRecords>(STORAGE_KEYS.ARCADE_RECORDS);

      if (localRecords) {
        const playRecords: PersistedArcadeRecords['playRecords'] = {};

        for (const gameId of Object.keys(localRecords.playRecords)) {
          const record = await getArcadeRecord(userId, gameId);
          if (record) {
            playRecords[gameId] = {
              playsToday: record.playsToday,
              xpEarned: record.xpEarned,
              lastPlayDate: record.lastPlayDate || '',
            };
          } else {
            // Keep local record if not in Firestore
            playRecords[gameId] = localRecords.playRecords[gameId];
          }
        }

        const records: PersistedArcadeRecords = { playRecords };
        saveToStorage(STORAGE_KEYS.ARCADE_RECORDS, records);
        return records;
      }
    } catch (err) {
      console.error('Firestore loadArcadeRecords error:', err);
    }
  }

  return loadFromStorage<PersistedArcadeRecords>(STORAGE_KEYS.ARCADE_RECORDS);
}

export async function saveArcadeRecords(records: PersistedArcadeRecords): Promise<boolean> {
  // Always save to localStorage
  saveToStorage(STORAGE_KEYS.ARCADE_RECORDS, records);

  const userId = getCurrentUserId();

  if (isFirebaseConfigured() && userId) {
    try {
      for (const [gameId, record] of Object.entries(records.playRecords)) {
        await saveArcadeRecord({
          userId,
          gameId,
          playsToday: record.playsToday,
          xpEarned: record.xpEarned,
          lastPlayDate: record.lastPlayDate,
        });
      }
      return true;
    } catch (err) {
      console.error('Firestore saveArcadeRecords error:', err);
    }
  }

  return true;
}

// ============ Sync All User Data ============

export async function syncUserDataFromSupabase(): Promise<void> {
  // Legacy function name kept for compatibility
  await syncUserDataFromFirebase();
}

export async function syncUserDataFromFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    // Load all data from Firestore in parallel
    await Promise.all([
      loadUserProfile(),
      loadJourneyProgress(),
      loadCourseProgress(),
      loadUserBadges(),
      loadArcadeRecords(),
    ]);
    console.log('User data synced from Firestore');
  } catch (err) {
    console.error('Failed to sync user data from Firestore:', err);
  }
}

export async function syncUserDataToSupabase(): Promise<void> {
  // Legacy function name kept for compatibility
  await syncUserDataToFirebase();
}

export async function syncUserDataToFirebase(): Promise<void> {
  if (!isFirebaseConfigured()) return;

  const userId = getCurrentUserId();
  if (!userId) return;

  try {
    // Load from localStorage and save to Firestore
    const profile = loadFromStorage<PersistedUserProfile>(STORAGE_KEYS.USER_PROFILE);
    const journey = loadFromStorage<PersistedJourneyProgress>(STORAGE_KEYS.JOURNEY_PROGRESS);
    const courses = loadFromStorage<PersistedCourseProgress>(STORAGE_KEYS.COURSE_PROGRESS);
    const badges = loadFromStorage<PersistedBadges>(STORAGE_KEYS.BADGES);
    const arcade = loadFromStorage<PersistedArcadeRecords>(STORAGE_KEYS.ARCADE_RECORDS);

    await Promise.all([
      profile ? saveUserProfile(profile) : Promise.resolve(true),
      journey ? saveJourneyProgress(journey) : Promise.resolve(true),
      courses ? saveCourseProgress(courses) : Promise.resolve(true),
      badges ? saveUserBadges(badges) : Promise.resolve(true),
      arcade ? saveArcadeRecords(arcade) : Promise.resolve(true),
    ]);
    console.log('User data synced to Firestore');
  } catch (err) {
    console.error('Failed to sync user data to Firestore:', err);
  }
}

// ============ Pantheon Souvenir Room ============

const DEFAULT_PANTHEON_PROGRESS: PersistedPantheonProgress = {
  souvenirs: {},
  lastVisited: undefined,
};

export function loadPantheonProgress(): PersistedPantheonProgress {
  const stored = loadFromStorage<PersistedPantheonProgress>(STORAGE_KEYS.PANTHEON_PROGRESS);
  return stored || DEFAULT_PANTHEON_PROGRESS;
}

export function savePantheonProgress(progress: PersistedPantheonProgress): void {
  saveToStorage(STORAGE_KEYS.PANTHEON_PROGRESS, progress);
}

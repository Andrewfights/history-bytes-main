/**
 * Firestore Service Layer
 * Provides typed CRUD operations for all collections
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  QueryConstraint,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

// ============ Type Definitions ============

export interface FirestoreUserProfile {
  displayName: string;
  email: string;
  xp: number;
  streak: number;
  lastActiveDate: Timestamp;
  selectedGuideId: string | null;
  isOnboarded: boolean;
  anonLeaderboard: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirestoreJourneyProgress {
  completedNodes: string[];
  nodeMastery: Record<string, string>;
  recentArcIds: string[];
  journeyViewState: Record<string, unknown> | null;
  viewedChapterIntros: string[];
  updatedAt: Timestamp;
}

export interface FirestoreCourseProgress {
  completedLessons: string[];
  updatedAt: Timestamp;
}

export interface FirestoreBadge {
  badgeId: string;
  earnedAt: Timestamp;
  isNew: boolean;
}

export interface FirestoreArcadeRecord {
  userId: string;
  gameId: string;
  playsToday: number;
  xpEarned: number;
  lastPlayDate: string;
}

export interface FirestoreSpiritGuide {
  id: string;
  name: string;
  title: string;
  era: string;
  specialty: string;
  avatar: string;
  imageUrl?: string;
  introVideoUrl?: string;
  welcomeVideoUrl?: string;
  celebrationVideoUrl?: string;
  introQuote: string;
  welcomeMessage: string;
  personality: string;
  primaryColor: string;
  secondaryColor?: string;
  catchphrases: string[];
  knowledgeBase?: string;
  firstMessage?: string;
  elevenLabsVoiceId?: string;
  voiceStability?: number;
  voiceSimilarity?: number;
  voiceStyle?: number;
  displayOrder: number;
  stylePrompt?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreWW2Host {
  id: string;
  name: string;
  title: string;
  era: string;
  specialty: string;
  avatar: string;
  imageUrl?: string;
  introVideoUrl?: string;
  welcomeVideoUrl?: string;
  primaryColor: string;
  voiceStyle: string;
  description: string;
  displayOrder: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreCourse {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor: string;
  displayOrder: number;
  isFeatured: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreUnit {
  id: string;
  courseId: string;
  title: string;
  description: string;
  displayOrder: number;
  createdAt?: Timestamp;
}

export interface FirestoreLesson {
  id: string;
  unitId: string;
  title: string;
  durationMinutes: number;
  xpReward: number;
  displayOrder: number;
  createdAt?: Timestamp;
}

export interface FirestoreLessonContent {
  id: string;
  lessonId: string;
  contentType: 'card' | 'quiz' | 'video' | 'image' | 'story';
  title: string;
  body: string;
  mediaUrl?: string;
  mediaAutoplay?: boolean;
  mediaLoop?: boolean;
  mediaMuted?: boolean;
  displayOrder: number;
  metadata?: Record<string, unknown>;
  createdAt?: Timestamp;
}

// ============ Journey Management Types ============

export type JourneyStatus = 'draft' | 'published' | 'archived';
export type ModuleCategory = 'quiz' | 'interactive' | 'narrative' | 'challenge' | 'assessment';
export type HostMode = 'pip' | 'voice-only' | 'none';

export interface FirestoreJourney {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  coverImage?: string;
  totalXP: number;
  estimatedDuration: string;
  status: JourneyStatus;
  beatIds: string[]; // Ordered list of beat IDs
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreJourneyBeat {
  id: string;
  journeyId: string;
  number: number;
  title: string;
  subtitle: string;
  templateId: string; // References module template
  icon: string;
  xpReward: number;
  description: string;
  estimatedDuration: string;
  config: Record<string, unknown>; // Template-specific configuration
  mediaAssets: {
    backgroundImage?: string;
    videoUrl?: string;
    audioUrl?: string;
    additionalImages?: string[];
  };
  hostConfig: {
    hostId?: string;
    mode: HostMode;
    dialogues?: Record<string, string>;
  };
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreModuleTemplate {
  id: string;
  name: string;
  description: string;
  category: ModuleCategory;
  icon: string;
  configSchema: Record<string, unknown>; // JSON Schema for validation
  defaultConfig: Record<string, unknown>;
  componentPath: string; // React component to render
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// ============ Generic Helpers ============

async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (err) {
    console.error(`[Firestore] Error getting ${collectionName}/${docId}:`, err);
    return null;
  }
}

async function getCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const q = query(collection(db, collectionName), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
  } catch (err) {
    console.error(`[Firestore] Error getting ${collectionName}:`, err);
    return [];
  }
}

async function setDocument<T extends Record<string, unknown>>(
  collectionName: string,
  docId: string,
  data: T,
  merge = true
): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge });
    return true;
  } catch (err) {
    console.error(`[Firestore] Error setting ${collectionName}/${docId}:`, err);
    return false;
  }
}

async function deleteDocument(collectionName: string, docId: string): Promise<boolean> {
  if (!isFirebaseConfigured()) return false;

  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`[Firestore] Error deleting ${collectionName}/${docId}:`, err);
    return false;
  }
}

function subscribeToCollection<T>(
  collectionName: string,
  callback: (items: T[]) => void,
  ...constraints: QueryConstraint[]
): Unsubscribe {
  if (!isFirebaseConfigured()) return () => {};

  const q = query(collection(db, collectionName), ...constraints);
  return onSnapshot(q, (snapshot) => {
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    callback(items);
  }, (err) => {
    console.error(`[Firestore] Subscription error for ${collectionName}:`, err);
  });
}

// ============ User Profile Operations ============

export async function getUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
  return getDocument<FirestoreUserProfile>('users', userId);
}

export async function saveUserProfile(
  userId: string,
  profile: Partial<FirestoreUserProfile>
): Promise<boolean> {
  return setDocument('users', userId, profile);
}

// ============ Journey Progress Operations ============

export async function getJourneyProgress(userId: string): Promise<FirestoreJourneyProgress | null> {
  return getDocument<FirestoreJourneyProgress>('journeyProgress', userId);
}

export async function saveJourneyProgress(
  userId: string,
  progress: Partial<FirestoreJourneyProgress>
): Promise<boolean> {
  return setDocument('journeyProgress', userId, progress);
}

// ============ Course Progress Operations ============

export async function getCourseProgress(userId: string): Promise<FirestoreCourseProgress | null> {
  return getDocument<FirestoreCourseProgress>('courseProgress', userId);
}

export async function saveCourseProgress(
  userId: string,
  progress: Partial<FirestoreCourseProgress>
): Promise<boolean> {
  return setDocument('courseProgress', userId, progress);
}

// ============ Badge Operations ============

export async function getUserBadges(userId: string): Promise<FirestoreBadge[]> {
  return getCollection<FirestoreBadge>('userBadges', where('userId', '==', userId));
}

export async function saveBadge(userId: string, badge: Omit<FirestoreBadge, 'earnedAt'>): Promise<boolean> {
  const docId = `${userId}_${badge.badgeId}`;
  return setDocument('userBadges', docId, {
    ...badge,
    userId,
    earnedAt: serverTimestamp(),
  });
}

// ============ Arcade Record Operations ============

export async function getArcadeRecord(userId: string, gameId: string): Promise<FirestoreArcadeRecord | null> {
  const docId = `${userId}_${gameId}`;
  return getDocument<FirestoreArcadeRecord>('arcadeRecords', docId);
}

export async function saveArcadeRecord(record: FirestoreArcadeRecord): Promise<boolean> {
  const docId = `${record.userId}_${record.gameId}`;
  return setDocument('arcadeRecords', docId, record);
}

// ============ Spirit Guide Operations ============

export async function getSpiritGuides(): Promise<FirestoreSpiritGuide[]> {
  return getCollection<FirestoreSpiritGuide>('spiritGuides', orderBy('displayOrder'));
}

export async function getSpiritGuide(guideId: string): Promise<FirestoreSpiritGuide | null> {
  return getDocument<FirestoreSpiritGuide>('spiritGuides', guideId);
}

export async function saveSpiritGuide(guide: FirestoreSpiritGuide): Promise<boolean> {
  return setDocument('spiritGuides', guide.id, guide);
}

export async function deleteSpiritGuide(guideId: string): Promise<boolean> {
  return deleteDocument('spiritGuides', guideId);
}

export function subscribeToSpiritGuides(callback: (guides: FirestoreSpiritGuide[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreSpiritGuide>('spiritGuides', callback, orderBy('displayOrder'));
}

// ============ Course Operations ============

export async function getCourses(): Promise<FirestoreCourse[]> {
  return getCollection<FirestoreCourse>('courses', orderBy('displayOrder'));
}

export async function getCourse(courseId: string): Promise<FirestoreCourse | null> {
  return getDocument<FirestoreCourse>('courses', courseId);
}

export async function saveCourse(course: FirestoreCourse): Promise<boolean> {
  return setDocument('courses', course.id, course);
}

export async function deleteCourse(courseId: string): Promise<boolean> {
  return deleteDocument('courses', courseId);
}

export function subscribeToCourses(callback: (courses: FirestoreCourse[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreCourse>('courses', callback, orderBy('displayOrder'));
}

// ============ Unit Operations ============

export async function getUnits(courseId?: string): Promise<FirestoreUnit[]> {
  if (courseId) {
    return getCollection<FirestoreUnit>('units', where('courseId', '==', courseId), orderBy('displayOrder'));
  }
  return getCollection<FirestoreUnit>('units', orderBy('displayOrder'));
}

export async function getUnit(unitId: string): Promise<FirestoreUnit | null> {
  return getDocument<FirestoreUnit>('units', unitId);
}

export async function saveUnit(unit: FirestoreUnit): Promise<boolean> {
  return setDocument('units', unit.id, unit);
}

export async function deleteUnit(unitId: string): Promise<boolean> {
  return deleteDocument('units', unitId);
}

export function subscribeToUnits(callback: (units: FirestoreUnit[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreUnit>('units', callback, orderBy('displayOrder'));
}

// ============ Lesson Operations ============

export async function getLessons(unitId?: string): Promise<FirestoreLesson[]> {
  if (unitId) {
    return getCollection<FirestoreLesson>('lessons', where('unitId', '==', unitId), orderBy('displayOrder'));
  }
  return getCollection<FirestoreLesson>('lessons', orderBy('displayOrder'));
}

export async function getLesson(lessonId: string): Promise<FirestoreLesson | null> {
  return getDocument<FirestoreLesson>('lessons', lessonId);
}

export async function saveLesson(lesson: FirestoreLesson): Promise<boolean> {
  return setDocument('lessons', lesson.id, lesson);
}

export async function deleteLesson(lessonId: string): Promise<boolean> {
  return deleteDocument('lessons', lessonId);
}

export function subscribeToLessons(callback: (lessons: FirestoreLesson[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreLesson>('lessons', callback, orderBy('displayOrder'));
}

// ============ Lesson Content Operations ============

export async function getLessonContent(lessonId: string): Promise<FirestoreLessonContent[]> {
  return getCollection<FirestoreLessonContent>(
    'lessonContent',
    where('lessonId', '==', lessonId),
    orderBy('displayOrder')
  );
}

export async function saveLessonContent(content: FirestoreLessonContent): Promise<boolean> {
  return setDocument('lessonContent', content.id, content);
}

export async function deleteLessonContent(contentId: string): Promise<boolean> {
  return deleteDocument('lessonContent', contentId);
}

// ============ Batch Operations ============

export async function batchSaveDocuments<T extends Record<string, unknown>>(
  collectionName: string,
  documents: Array<{ id: string; data: T }>
): Promise<boolean> {
  if (!isFirebaseConfigured()) {
    console.warn('[Firestore] batchSaveDocuments: Firebase not configured');
    return false;
  }

  console.log(`[Firestore] batchSaveDocuments: Saving ${documents.length} docs to ${collectionName}`);

  try {
    const batch = writeBatch(db);

    for (const { id, data } of documents) {
      const docRef = doc(db, collectionName, id);
      batch.set(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
    }

    console.log(`[Firestore] batchSaveDocuments: Committing batch...`);
    await batch.commit();
    console.log(`[Firestore] batchSaveDocuments: ✅ Batch committed successfully to ${collectionName}`);
    return true;
  } catch (err: unknown) {
    const error = err as { code?: string; message?: string };
    console.error(`[Firestore] ❌ Batch save error for ${collectionName}:`, err);

    // Check for common Firebase errors
    if (error.code === 'permission-denied') {
      console.error(`[Firestore] 🔒 PERMISSION DENIED - Check Firestore security rules!`);
      console.error(`[Firestore] Rules should allow write access to '${collectionName}' collection`);
    } else if (error.code === 'unauthenticated') {
      console.error(`[Firestore] 🔑 UNAUTHENTICATED - User must be signed in to write`);
    } else if (error.code === 'unavailable') {
      console.error(`[Firestore] 📡 UNAVAILABLE - Network or Firestore service issue`);
    }

    return false;
  }
}

// ============ Journey Operations ============

export async function getJourneys(): Promise<FirestoreJourney[]> {
  return getCollection<FirestoreJourney>('journeys', orderBy('createdAt', 'desc'));
}

export async function getJourney(journeyId: string): Promise<FirestoreJourney | null> {
  return getDocument<FirestoreJourney>('journeys', journeyId);
}

export async function saveJourney(journey: FirestoreJourney): Promise<boolean> {
  const data = {
    ...journey,
    createdAt: journey.createdAt || serverTimestamp(),
  };
  return setDocument('journeys', journey.id, data);
}

export async function deleteJourney(journeyId: string): Promise<boolean> {
  return deleteDocument('journeys', journeyId);
}

export function subscribeToJourneys(callback: (journeys: FirestoreJourney[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreJourney>('journeys', callback, orderBy('createdAt', 'desc'));
}

// ============ Journey Beat Operations ============

export async function getJourneyBeats(journeyId?: string): Promise<FirestoreJourneyBeat[]> {
  if (journeyId) {
    return getCollection<FirestoreJourneyBeat>(
      'journeyBeats',
      where('journeyId', '==', journeyId),
      orderBy('number')
    );
  }
  return getCollection<FirestoreJourneyBeat>('journeyBeats', orderBy('number'));
}

export async function getJourneyBeat(beatId: string): Promise<FirestoreJourneyBeat | null> {
  return getDocument<FirestoreJourneyBeat>('journeyBeats', beatId);
}

export async function saveJourneyBeat(beat: FirestoreJourneyBeat): Promise<boolean> {
  const data = {
    ...beat,
    createdAt: beat.createdAt || serverTimestamp(),
  };
  return setDocument('journeyBeats', beat.id, data);
}

export async function deleteJourneyBeat(beatId: string): Promise<boolean> {
  return deleteDocument('journeyBeats', beatId);
}

export function subscribeToJourneyBeats(
  journeyId: string,
  callback: (beats: FirestoreJourneyBeat[]) => void
): Unsubscribe {
  return subscribeToCollection<FirestoreJourneyBeat>(
    'journeyBeats',
    callback,
    where('journeyId', '==', journeyId),
    orderBy('number')
  );
}

// ============ Module Template Operations ============

export async function getModuleTemplates(): Promise<FirestoreModuleTemplate[]> {
  return getCollection<FirestoreModuleTemplate>('moduleTemplates', orderBy('name'));
}

export async function getModuleTemplate(templateId: string): Promise<FirestoreModuleTemplate | null> {
  return getDocument<FirestoreModuleTemplate>('moduleTemplates', templateId);
}

export async function saveModuleTemplate(template: FirestoreModuleTemplate): Promise<boolean> {
  const data = {
    ...template,
    createdAt: template.createdAt || serverTimestamp(),
  };
  return setDocument('moduleTemplates', template.id, data);
}

export function subscribeToModuleTemplates(
  callback: (templates: FirestoreModuleTemplate[]) => void
): Unsubscribe {
  return subscribeToCollection<FirestoreModuleTemplate>('moduleTemplates', callback, orderBy('name'));
}

// ============ WW2 Host Operations ============

export async function getWW2Hosts(): Promise<FirestoreWW2Host[]> {
  return getCollection<FirestoreWW2Host>('ww2Hosts', orderBy('displayOrder'));
}

export async function getWW2Host(hostId: string): Promise<FirestoreWW2Host | null> {
  return getDocument<FirestoreWW2Host>('ww2Hosts', hostId);
}

export async function saveWW2Host(host: FirestoreWW2Host): Promise<boolean> {
  const data = {
    ...host,
    createdAt: host.createdAt || serverTimestamp(),
  };
  return setDocument('ww2Hosts', host.id, data);
}

export async function saveAllWW2Hosts(hosts: FirestoreWW2Host[]): Promise<boolean> {
  const documents = hosts.map((host, index) => ({
    id: host.id,
    data: {
      ...host,
      displayOrder: index,
      createdAt: host.createdAt || serverTimestamp(),
    },
  }));
  return batchSaveDocuments('ww2Hosts', documents);
}

export async function deleteWW2Host(hostId: string): Promise<boolean> {
  return deleteDocument('ww2Hosts', hostId);
}

export function subscribeToWW2Hosts(callback: (hosts: FirestoreWW2Host[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreWW2Host>('ww2Hosts', callback, orderBy('displayOrder'));
}

// ============ Admin Content Types ============

export interface FirestoreEraTileOverride {
  id: string;           // Era ID
  imageUrl: string;     // Override image URL
  isActive: boolean;    // Whether override is active
  updatedAt?: Timestamp;
}

export interface FirestoreGameThumbnail {
  id: string;           // Game type (e.g., 'anachronism', 'connections')
  imageUrl: string;     // Thumbnail URL
  updatedAt?: Timestamp;
}

export interface FirestoreArcadeItem {
  id: string;
  gameType: string;     // 'anachronism' | 'connections' | 'cause-effect' | 'artifact' | 'map'
  title?: string;
  data: Record<string, unknown>; // Game-specific data
  imageUrl?: string;
  displayOrder: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreTriviaSet {
  id: string;
  title: string;
  description?: string;
  category?: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    videoUrl?: string;
    imageUrl?: string;
  }>;
  displayOrder: number;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface FirestoreVoiceSettings {
  id: string;           // 'global' or guide ID
  voiceId: string;
  stability: number;
  similarity: number;
  style: number;
  updatedAt?: Timestamp;
}

export interface FirestorePearlHarborMedia {
  id: string;           // Node ID
  videoUrl?: string;
  videoUrl2?: string;
  videoThumbnail?: string;
  backgroundImage?: string;
  additionalImages?: string[];
  updatedAt?: Timestamp;
}

export interface FirestoreGhostArmyMedia {
  id: string;           // Node ID
  videoUrl?: string;
  videoUrl2?: string;
  videoThumbnail?: string;
  backgroundImage?: string;
  additionalImages?: string[];
  updatedAt?: Timestamp;
}

// ============ Era Tile Override Operations ============

export async function getEraTileOverrides(): Promise<FirestoreEraTileOverride[]> {
  return getCollection<FirestoreEraTileOverride>('eraTileOverrides');
}

export async function getEraTileOverride(eraId: string): Promise<FirestoreEraTileOverride | null> {
  return getDocument<FirestoreEraTileOverride>('eraTileOverrides', eraId);
}

export async function saveEraTileOverride(override: FirestoreEraTileOverride): Promise<boolean> {
  return setDocument('eraTileOverrides', override.id, override);
}

export async function deleteEraTileOverride(eraId: string): Promise<boolean> {
  return deleteDocument('eraTileOverrides', eraId);
}

export function subscribeToEraTileOverrides(callback: (overrides: FirestoreEraTileOverride[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreEraTileOverride>('eraTileOverrides', callback);
}

// ============ Game Thumbnail Operations ============

export async function getGameThumbnails(): Promise<FirestoreGameThumbnail[]> {
  return getCollection<FirestoreGameThumbnail>('gameThumbnails');
}

export async function saveGameThumbnail(thumbnail: FirestoreGameThumbnail): Promise<boolean> {
  return setDocument('gameThumbnails', thumbnail.id, thumbnail);
}

export async function deleteGameThumbnail(gameType: string): Promise<boolean> {
  return deleteDocument('gameThumbnails', gameType);
}

export function subscribeToGameThumbnails(callback: (thumbnails: FirestoreGameThumbnail[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreGameThumbnail>('gameThumbnails', callback);
}

// ============ Arcade Item Operations ============

export async function getArcadeItems(gameType?: string): Promise<FirestoreArcadeItem[]> {
  if (gameType) {
    return getCollection<FirestoreArcadeItem>('arcadeItems', where('gameType', '==', gameType), orderBy('displayOrder'));
  }
  return getCollection<FirestoreArcadeItem>('arcadeItems', orderBy('displayOrder'));
}

export async function getArcadeItem(itemId: string): Promise<FirestoreArcadeItem | null> {
  return getDocument<FirestoreArcadeItem>('arcadeItems', itemId);
}

export async function saveArcadeItem(item: FirestoreArcadeItem): Promise<boolean> {
  const data = {
    ...item,
    createdAt: item.createdAt || serverTimestamp(),
  };
  return setDocument('arcadeItems', item.id, data);
}

export async function deleteArcadeItem(itemId: string): Promise<boolean> {
  return deleteDocument('arcadeItems', itemId);
}

export function subscribeToArcadeItems(gameType: string, callback: (items: FirestoreArcadeItem[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreArcadeItem>(
    'arcadeItems',
    callback,
    where('gameType', '==', gameType),
    orderBy('displayOrder')
  );
}

// ============ Trivia Set Operations ============

export async function getTriviaSets(): Promise<FirestoreTriviaSet[]> {
  return getCollection<FirestoreTriviaSet>('triviaSets', orderBy('displayOrder'));
}

export async function getTriviaSet(setId: string): Promise<FirestoreTriviaSet | null> {
  return getDocument<FirestoreTriviaSet>('triviaSets', setId);
}

export async function saveTriviaSet(triviaSet: FirestoreTriviaSet): Promise<boolean> {
  const data = {
    ...triviaSet,
    createdAt: triviaSet.createdAt || serverTimestamp(),
  };
  return setDocument('triviaSets', triviaSet.id, data);
}

export async function deleteTriviaSet(setId: string): Promise<boolean> {
  return deleteDocument('triviaSets', setId);
}

export function subscribeToTriviaSets(callback: (sets: FirestoreTriviaSet[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreTriviaSet>('triviaSets', callback, orderBy('displayOrder'));
}

// ============ Voice Settings Operations ============

export async function getVoiceSettings(): Promise<FirestoreVoiceSettings[]> {
  return getCollection<FirestoreVoiceSettings>('voiceSettings');
}

export async function getVoiceSetting(id: string): Promise<FirestoreVoiceSettings | null> {
  return getDocument<FirestoreVoiceSettings>('voiceSettings', id);
}

export async function saveVoiceSetting(settings: FirestoreVoiceSettings): Promise<boolean> {
  return setDocument('voiceSettings', settings.id, settings);
}

export function subscribeToVoiceSettings(callback: (settings: FirestoreVoiceSettings[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreVoiceSettings>('voiceSettings', callback);
}

// ============ Pearl Harbor Media Operations ============

export async function getPearlHarborMediaItems(): Promise<FirestorePearlHarborMedia[]> {
  return getCollection<FirestorePearlHarborMedia>('pearlHarborMedia');
}

export async function getPearlHarborMediaItem(nodeId: string): Promise<FirestorePearlHarborMedia | null> {
  return getDocument<FirestorePearlHarborMedia>('pearlHarborMedia', nodeId);
}

export async function savePearlHarborMediaItem(media: FirestorePearlHarborMedia): Promise<boolean> {
  return setDocument('pearlHarborMedia', media.id, media);
}

export async function deletePearlHarborMediaItem(nodeId: string): Promise<boolean> {
  return deleteDocument('pearlHarborMedia', nodeId);
}

export function subscribeToPearlHarborMedia(callback: (items: FirestorePearlHarborMedia[]) => void): Unsubscribe {
  return subscribeToCollection<FirestorePearlHarborMedia>('pearlHarborMedia', callback);
}

// ============ Ghost Army Media Operations ============

export async function getGhostArmyMediaItems(): Promise<FirestoreGhostArmyMedia[]> {
  return getCollection<FirestoreGhostArmyMedia>('ghostArmyMedia');
}

export async function getGhostArmyMediaItem(nodeId: string): Promise<FirestoreGhostArmyMedia | null> {
  return getDocument<FirestoreGhostArmyMedia>('ghostArmyMedia', nodeId);
}

export async function saveGhostArmyMediaItem(media: FirestoreGhostArmyMedia): Promise<boolean> {
  return setDocument('ghostArmyMedia', media.id, media);
}

export async function deleteGhostArmyMediaItem(nodeId: string): Promise<boolean> {
  return deleteDocument('ghostArmyMedia', nodeId);
}

export function subscribeToGhostArmyMedia(callback: (items: FirestoreGhostArmyMedia[]) => void): Unsubscribe {
  return subscribeToCollection<FirestoreGhostArmyMedia>('ghostArmyMedia', callback);
}

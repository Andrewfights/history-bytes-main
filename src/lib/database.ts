/**
 * Database operations (Firebase Firestore + Local Storage Fallback)
 * Primary storage is Firestore, with localStorage as offline cache
 */

import { isFirebaseConfigured } from './firebase';
import {
  getSpiritGuides,
  getSpiritGuide,
  saveSpiritGuide as firestoreSaveSpiritGuide,
  deleteSpiritGuide as firestoreDeleteSpiritGuide,
  getCourses,
  getCourse,
  saveCourse as firestoreSaveCourse,
  deleteCourse as firestoreDeleteCourse,
  getUnits,
  getUnit,
  saveUnit as firestoreSaveUnit,
  deleteUnit as firestoreDeleteUnit,
  getLessons,
  getLesson,
  saveLesson as firestoreSaveLesson,
  deleteLesson as firestoreDeleteLesson,
  getLessonContent as firestoreGetLessonContent,
  saveLessonContent as firestoreSaveLessonContent,
  deleteLessonContent as firestoreDeleteLessonContent,
  batchSaveDocuments,
  type FirestoreSpiritGuide,
  type FirestoreCourse,
  type FirestoreUnit,
  type FirestoreLesson,
  type FirestoreLessonContent,
} from './firestore';
import {
  saveGuides,
  loadStoredGuides,
  saveCourses,
  loadStoredCourses,
  saveUnits,
  loadStoredUnits,
  saveLessons,
  loadStoredLessons,
  saveLessonContentLocal,
  loadStoredLessonContent,
  loadFromStorage,
  saveToStorage,
} from './adminStorage';
import type { SpiritGuide, Course, Unit, Lesson } from '@/types';

// Extended Guide type with database fields
export interface DbSpiritGuide extends SpiritGuide {
  knowledgeBase?: string;
  firstMessage?: string;
  elevenLabsVoiceId?: string;
  voiceStability?: number;
  voiceSimilarity?: number;
  voiceStyle?: number;
  displayOrder: number;
  stylePrompt?: string;
}

export interface CharacterReference {
  id: string;
  guideId: string;
  imageUrl: string;
  promptUsed?: string;
  styleNotes?: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface DbCourse {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructor?: string;
  displayOrder: number;
  isFeatured?: boolean;
  createdAt?: string;
}

export interface DbUnit {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  displayOrder: number;
  createdAt?: string;
}

export interface DbLesson {
  id: string;
  unitId: string;
  title: string;
  durationMinutes?: number;
  xpReward?: number;
  displayOrder: number;
  createdAt?: string;
}

export interface LessonContent {
  id: string;
  lessonId: string;
  contentType: 'card' | 'quiz' | 'video' | 'image' | 'story';
  title?: string;
  body?: string;
  mediaUrl?: string;
  mediaAutoplay?: boolean;
  mediaLoop?: boolean;
  mediaMuted?: boolean;
  displayOrder: number;
  metadata?: QuizMetadata | Record<string, unknown>;
  createdAt?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'order-events' | 'fill-blank';
  prompt: string;
  choices?: string[];
  correctAnswer: string | number;
  explanation?: string;
}

export interface QuizMetadata {
  questions: QuizQuestion[];
}

// Storage key for character references (still localStorage for now)
const CHAR_REFS_KEY = 'hb_admin_character_refs';

// Helper to convert Firestore guide to DbSpiritGuide
function firestoreToDbGuide(guide: FirestoreSpiritGuide): DbSpiritGuide {
  return {
    id: guide.id,
    name: guide.name,
    title: guide.title || '',
    era: guide.era || '',
    specialty: guide.specialty || '',
    avatar: guide.avatar || '',
    imageUrl: guide.imageUrl,
    introVideoUrl: guide.introVideoUrl,
    welcomeVideoUrl: guide.welcomeVideoUrl,
    celebrationVideoUrl: guide.celebrationVideoUrl,
    introQuote: guide.introQuote || '',
    welcomeMessage: guide.welcomeMessage || '',
    personality: guide.personality || '',
    primaryColor: guide.primaryColor || 'amber',
    secondaryColor: guide.secondaryColor,
    catchphrases: guide.catchphrases || [],
    knowledgeBase: guide.knowledgeBase,
    firstMessage: guide.firstMessage,
    elevenLabsVoiceId: guide.elevenLabsVoiceId,
    voiceStability: guide.voiceStability,
    voiceSimilarity: guide.voiceSimilarity,
    voiceStyle: guide.voiceStyle,
    displayOrder: guide.displayOrder || 0,
    stylePrompt: guide.stylePrompt,
  };
}

// Helper to convert DbSpiritGuide to Firestore format
function dbGuideToFirestore(guide: DbSpiritGuide): FirestoreSpiritGuide {
  return {
    id: guide.id,
    name: guide.name,
    title: guide.title || '',
    era: guide.era || '',
    specialty: guide.specialty || '',
    avatar: guide.avatar || '',
    imageUrl: guide.imageUrl,
    introVideoUrl: guide.introVideoUrl,
    welcomeVideoUrl: guide.welcomeVideoUrl,
    celebrationVideoUrl: guide.celebrationVideoUrl,
    introQuote: guide.introQuote || '',
    welcomeMessage: guide.welcomeMessage || '',
    personality: guide.personality || '',
    primaryColor: guide.primaryColor || 'amber',
    secondaryColor: guide.secondaryColor,
    catchphrases: guide.catchphrases || [],
    knowledgeBase: guide.knowledgeBase,
    firstMessage: guide.firstMessage,
    elevenLabsVoiceId: guide.elevenLabsVoiceId,
    voiceStability: guide.voiceStability,
    voiceSimilarity: guide.voiceSimilarity,
    voiceStyle: guide.voiceStyle,
    displayOrder: guide.displayOrder || 0,
    stylePrompt: guide.stylePrompt,
  };
}

// ============ Spirit Guides ============

export async function loadGuides(): Promise<DbSpiritGuide[]> {
  if (isFirebaseConfigured()) {
    try {
      const guides = await getSpiritGuides();
      const dbGuides = guides.map(firestoreToDbGuide);
      // Cache in localStorage
      saveGuides(dbGuides);
      return dbGuides;
    } catch (err) {
      console.error('[loadGuides] Firestore error:', err);
      // Fall back to localStorage
    }
  }
  return loadStoredGuides() || [];
}

export async function saveGuide(guide: DbSpiritGuide): Promise<boolean> {
  // Always try Firestore first
  if (isFirebaseConfigured()) {
    try {
      console.log('[saveGuide] Attempting Firestore save for:', guide.id);
      const firestoreGuide = dbGuideToFirestore(guide);
      const success = await firestoreSaveSpiritGuide(firestoreGuide);

      if (success) {
        console.log('[saveGuide] Firestore save successful');
        // Update localStorage cache
        const existing = loadStoredGuides() || [];
        const index = existing.findIndex(g => g.id === guide.id);
        if (index >= 0) {
          existing[index] = guide;
        } else {
          existing.push(guide);
        }
        saveGuides(existing);
        return true;
      }
    } catch (err) {
      console.error('[saveGuide] Firestore error, falling back to localStorage:', err);
    }
  } else {
    console.log('[saveGuide] Firebase not configured, using localStorage');
  }

  // Fall back to localStorage
  const existing = loadStoredGuides() || [];
  const index = existing.findIndex(g => g.id === guide.id);
  if (index >= 0) {
    existing[index] = guide;
  } else {
    existing.push(guide);
  }
  saveGuides(existing);
  return false; // Return false to indicate localStorage was used
}

export async function reorderGuides(guideIds: string[]): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const existing = loadStoredGuides() || [];
      const updates = guideIds.map((id, index) => {
        const guide = existing.find(g => g.id === id);
        if (guide) {
          return { id, data: { displayOrder: index } };
        }
        return null;
      }).filter(Boolean) as Array<{ id: string; data: { displayOrder: number } }>;

      await batchSaveDocuments('spiritGuides', updates);

      // Update localStorage cache
      const reordered = guideIds.map((id, index) => {
        const guide = existing.find(g => g.id === id);
        if (guide) return { ...guide, displayOrder: index };
        return null;
      }).filter(Boolean) as DbSpiritGuide[];
      saveGuides(reordered);
      return true;
    } catch (err) {
      console.error('[reorderGuides] Firestore error:', err);
    }
  }

  const existing = loadStoredGuides() || [];
  const reordered = guideIds.map((id, index) => {
    const guide = existing.find(g => g.id === id);
    if (guide) return { ...guide, displayOrder: index };
    return null;
  }).filter(Boolean) as DbSpiritGuide[];
  return saveGuides(reordered);
}

export async function deleteGuide(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const success = await firestoreDeleteSpiritGuide(id);
      if (success) {
        // Update localStorage cache
        const existing = loadStoredGuides() || [];
        const filtered = existing.filter(g => g.id !== id);
        saveGuides(filtered);
        return true;
      }
    } catch (err) {
      console.error('[deleteGuide] Firestore error:', err);
    }
  }

  const existing = loadStoredGuides() || [];
  const filtered = existing.filter(g => g.id !== id);
  return saveGuides(filtered);
}

// ============ Character References (still localStorage) ============

function getCharacterRefs(): CharacterReference[] {
  return loadFromStorage<CharacterReference[]>(CHAR_REFS_KEY, []);
}

function saveCharacterRefs(refs: CharacterReference[]): boolean {
  return saveToStorage(CHAR_REFS_KEY, refs);
}

export async function loadCharacterReferences(guideId?: string): Promise<CharacterReference[]> {
  const refs = getCharacterRefs();
  if (guideId) {
    return refs.filter(r => r.guideId === guideId);
  }
  return refs;
}

export async function saveCharacterReference(ref: Omit<CharacterReference, 'createdAt'>): Promise<boolean> {
  const existing = getCharacterRefs();
  const newRef: CharacterReference = {
    ...ref,
    createdAt: new Date().toISOString(),
  };
  const index = existing.findIndex(r => r.id === ref.id);
  if (index >= 0) {
    existing[index] = newRef;
  } else {
    existing.push(newRef);
  }
  return saveCharacterRefs(existing);
}

export async function deleteCharacterReference(id: string): Promise<boolean> {
  const existing = getCharacterRefs();
  const filtered = existing.filter(r => r.id !== id);
  return saveCharacterRefs(filtered);
}

// ============ Courses ============

function firestoreToDbCourse(course: FirestoreCourse): DbCourse {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    thumbnailUrl: course.thumbnailUrl,
    difficulty: course.difficulty || 'beginner',
    instructor: course.instructor,
    displayOrder: course.displayOrder || 0,
    isFeatured: course.isFeatured,
    createdAt: course.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function loadCourses(): Promise<DbCourse[]> {
  if (isFirebaseConfigured()) {
    try {
      const courses = await getCourses();
      return courses.map(firestoreToDbCourse);
    } catch (err) {
      console.error('[loadCourses] Firestore error:', err);
    }
  }

  // Fall back to localStorage
  const courses = loadStoredCourses();
  if (!courses) return [];
  return courses.map((c, i) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    thumbnailUrl: c.thumbnailUrl,
    difficulty: c.difficulty,
    instructor: c.instructorId,
    displayOrder: i,
    createdAt: new Date().toISOString(),
  }));
}

export async function saveCourse(course: DbCourse): Promise<boolean> {
  // Helper to save to localStorage
  const saveToLocal = () => {
    const existing = loadStoredCourses() || [];
    const converted: Course = {
      id: course.id,
      title: course.title,
      slug: course.id,
      description: course.description || '',
      thumbnailUrl: course.thumbnailUrl,
      heroImageUrl: course.thumbnailUrl,
      category: 'general',
      difficulty: course.difficulty,
      totalDurationMinutes: 0,
      rating: 0,
      ratingsCount: 0,
      enrolledCount: 0,
      instructorId: course.instructor || '',
      instructor: course.instructor || '',
      unitsCount: 0,
      lessonsCount: 0,
      learningOutcomes: [],
      chronoOrder: course.displayOrder,
      isFeatured: course.isFeatured,
    };
    const index = existing.findIndex(c => c.id === course.id);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...converted };
    } else {
      existing.push(converted);
    }
    saveCourses(existing);
    console.log('[saveCourse] Saved to localStorage');
  };

  // Try Firestore first
  if (isFirebaseConfigured()) {
    try {
      console.log('[saveCourse] Attempting Firestore save for:', course.id);
      const success = await firestoreSaveCourse({
        id: course.id,
        title: course.title,
        description: course.description || '',
        thumbnailUrl: course.thumbnailUrl,
        difficulty: course.difficulty,
        instructor: course.instructor || '',
        displayOrder: course.displayOrder,
        isFeatured: course.isFeatured || false,
      });

      if (success) {
        console.log('[saveCourse] Firestore save successful');
        saveToLocal();
        return true;
      }
    } catch (err) {
      console.error('[saveCourse] Firestore failed, using localStorage:', err);
    }
  } else {
    console.log('[saveCourse] Firebase not configured, using localStorage');
  }

  // Fall back to localStorage
  saveToLocal();
  return false;
}

export async function deleteCourse(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const success = await firestoreDeleteCourse(id);
      if (success) return true;
    } catch (err) {
      console.error('[deleteCourse] Firestore error:', err);
    }
  }

  const existing = loadStoredCourses() || [];
  const filtered = existing.filter(c => c.id !== id);
  return saveCourses(filtered);
}

// ============ Units ============

function firestoreToDbUnit(unit: FirestoreUnit): DbUnit {
  return {
    id: unit.id,
    courseId: unit.courseId || '',
    title: unit.title,
    description: unit.description,
    displayOrder: unit.displayOrder || 0,
    createdAt: unit.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function loadUnits(courseId?: string): Promise<DbUnit[]> {
  if (isFirebaseConfigured()) {
    try {
      const units = await getUnits(courseId);
      return units.map(firestoreToDbUnit);
    } catch (err) {
      console.error('[loadUnits] Firestore error:', err);
    }
  }

  // Fall back to localStorage
  const units = loadStoredUnits();
  if (!units) return [];
  const mapped = units.map((u, i) => ({
    id: u.id,
    courseId: u.courseId,
    title: u.title,
    description: u.description,
    displayOrder: u.order || i,
    createdAt: new Date().toISOString(),
  }));
  if (courseId) {
    return mapped.filter(u => u.courseId === courseId);
  }
  return mapped;
}

export async function saveUnit(unit: DbUnit): Promise<boolean> {
  // Helper to save to localStorage
  const saveToLocal = () => {
    const existing = loadStoredUnits() || [];
    const converted: Unit = {
      id: unit.id,
      courseId: unit.courseId,
      order: unit.displayOrder,
      title: unit.title,
      description: unit.description,
      lessonsCount: 0,
      totalDurationMinutes: 0,
    };
    const index = existing.findIndex(u => u.id === unit.id);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...converted };
    } else {
      existing.push(converted);
    }
    saveUnits(existing);
    console.log('[saveUnit] Saved to localStorage');
  };

  // Try Firestore first
  if (isFirebaseConfigured()) {
    try {
      console.log('[saveUnit] Attempting Firestore save for:', unit.id);
      const success = await firestoreSaveUnit({
        id: unit.id,
        courseId: unit.courseId,
        title: unit.title,
        description: unit.description || '',
        displayOrder: unit.displayOrder,
      });

      if (success) {
        console.log('[saveUnit] Firestore save successful');
        saveToLocal();
        return true;
      }
    } catch (err) {
      console.error('[saveUnit] Firestore failed, using localStorage:', err);
    }
  } else {
    console.log('[saveUnit] Firebase not configured, using localStorage');
  }

  // Fall back to localStorage
  saveToLocal();
  return false;
}

export async function deleteUnit(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const success = await firestoreDeleteUnit(id);
      if (success) return true;
    } catch (err) {
      console.error('[deleteUnit] Firestore error:', err);
    }
  }

  const existing = loadStoredUnits() || [];
  const filtered = existing.filter(u => u.id !== id);
  return saveUnits(filtered);
}

// ============ Lessons ============

function firestoreToDbLesson(lesson: FirestoreLesson): DbLesson {
  return {
    id: lesson.id,
    unitId: lesson.unitId || '',
    title: lesson.title,
    durationMinutes: lesson.durationMinutes,
    xpReward: lesson.xpReward,
    displayOrder: lesson.displayOrder || 0,
    createdAt: lesson.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function loadLessons(unitId?: string): Promise<DbLesson[]> {
  if (isFirebaseConfigured()) {
    try {
      const lessons = await getLessons(unitId);
      return lessons.map(firestoreToDbLesson);
    } catch (err) {
      console.error('[loadLessons] Firestore error:', err);
    }
  }

  // Fall back to localStorage
  const lessons = loadStoredLessons();
  if (!lessons) return [];
  const mapped = lessons.map((l, i) => ({
    id: l.id,
    unitId: l.unitId,
    title: l.title,
    durationMinutes: l.durationMinutes,
    xpReward: l.xpReward,
    displayOrder: l.order || i,
    createdAt: new Date().toISOString(),
  }));
  if (unitId) {
    return mapped.filter(l => l.unitId === unitId);
  }
  return mapped;
}

export async function saveLesson(lesson: DbLesson): Promise<boolean> {
  // Helper to save to localStorage
  const saveToLocal = () => {
    const existing = loadStoredLessons() || [];
    const converted: Lesson = {
      id: lesson.id,
      unitId: lesson.unitId,
      order: lesson.displayOrder,
      title: lesson.title,
      durationMinutes: lesson.durationMinutes || 10,
      cardsCount: 0,
      questionsCount: 0,
      xpReward: lesson.xpReward || 25,
    };
    const index = existing.findIndex(l => l.id === lesson.id);
    if (index >= 0) {
      existing[index] = { ...existing[index], ...converted };
    } else {
      existing.push(converted);
    }
    saveLessons(existing);
    console.log('[saveLesson] Saved to localStorage');
  };

  // Try Firestore first
  if (isFirebaseConfigured()) {
    try {
      console.log('[saveLesson] Attempting Firestore save for:', lesson.id);
      const success = await firestoreSaveLesson({
        id: lesson.id,
        unitId: lesson.unitId,
        title: lesson.title,
        durationMinutes: lesson.durationMinutes || 10,
        xpReward: lesson.xpReward || 10,
        displayOrder: lesson.displayOrder,
      });

      if (success) {
        console.log('[saveLesson] Firestore save successful');
        saveToLocal();
        return true;
      }
    } catch (err) {
      console.error('[saveLesson] Firestore failed, using localStorage:', err);
    }
  } else {
    console.log('[saveLesson] Firebase not configured, using localStorage');
  }

  // Fall back to localStorage
  saveToLocal();
  return false;
}

export async function deleteLesson(id: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const success = await firestoreDeleteLesson(id);
      if (success) return true;
    } catch (err) {
      console.error('[deleteLesson] Firestore error:', err);
    }
  }

  const existing = loadStoredLessons() || [];
  const filtered = existing.filter(l => l.id !== id);
  return saveLessons(filtered);
}

// ============ Lesson Content ============

function firestoreToLessonContent(content: FirestoreLessonContent): LessonContent {
  return {
    id: content.id,
    lessonId: content.lessonId || '',
    contentType: content.contentType as LessonContent['contentType'],
    title: content.title,
    body: content.body,
    mediaUrl: content.mediaUrl,
    mediaAutoplay: content.mediaAutoplay,
    mediaLoop: content.mediaLoop,
    mediaMuted: content.mediaMuted,
    displayOrder: content.displayOrder || 0,
    metadata: content.metadata as LessonContent['metadata'],
    createdAt: content.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

export async function loadLessonContent(lessonId: string): Promise<LessonContent[]> {
  if (isFirebaseConfigured()) {
    try {
      const content = await firestoreGetLessonContent(lessonId);
      return content.map(firestoreToLessonContent);
    } catch (err) {
      console.error('[loadLessonContent] Firestore error:', err);
    }
  }

  return loadStoredLessonContent(lessonId) || [];
}

export async function saveLessonContent(content: LessonContent): Promise<boolean> {
  // Helper to save to localStorage
  const saveToLocal = () => {
    const existing = loadStoredLessonContent(content.lessonId) || [];
    const index = existing.findIndex(c => c.id === content.id);
    if (index >= 0) {
      existing[index] = content;
    } else {
      existing.push(content);
    }
    saveLessonContentLocal(content.lessonId, existing);
    console.log('[saveLessonContent] Saved to localStorage');
  };

  // Try Firestore first
  if (isFirebaseConfigured()) {
    try {
      console.log('[saveLessonContent] Attempting Firestore save for:', content.id);
      const success = await firestoreSaveLessonContent({
        id: content.id,
        lessonId: content.lessonId,
        contentType: content.contentType,
        title: content.title || '',
        body: content.body || '',
        mediaUrl: content.mediaUrl,
        mediaAutoplay: content.mediaAutoplay,
        mediaLoop: content.mediaLoop,
        mediaMuted: content.mediaMuted,
        displayOrder: content.displayOrder,
        metadata: content.metadata,
      });

      if (success) {
        console.log('[saveLessonContent] Firestore save successful');
        saveToLocal();
        return true;
      }
    } catch (err) {
      console.error('[saveLessonContent] Firestore failed, using localStorage:', err);
    }
  } else {
    console.log('[saveLessonContent] Firebase not configured, using localStorage');
  }

  // Fall back to localStorage
  saveToLocal();
  return false;
}

export async function deleteLessonContent(id: string, lessonId?: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const success = await firestoreDeleteLessonContent(id);
      if (success) return true;
    } catch (err) {
      console.error('[deleteLessonContent] Firestore error:', err);
    }
  }

  // For localStorage, we need the lessonId
  if (lessonId) {
    const existing = loadStoredLessonContent(lessonId) || [];
    const filtered = existing.filter(c => c.id !== id);
    return saveLessonContentLocal(lessonId, filtered);
  }
  return true;
}

export async function reorderLessonContent(lessonId: string, contentIds: string[]): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      const updates = contentIds.map((id, index) => ({
        id,
        data: { displayOrder: index },
      }));
      await batchSaveDocuments('lessonContent', updates);
      return true;
    } catch (err) {
      console.error('[reorderLessonContent] Firestore error:', err);
    }
  }

  const existing = loadStoredLessonContent(lessonId) || [];
  const reordered = contentIds.map((id, index) => {
    const content = existing.find(c => c.id === id);
    if (content) {
      return { ...content, displayOrder: index };
    }
    return null;
  }).filter(Boolean) as LessonContent[];
  return saveLessonContentLocal(lessonId, reordered);
}

// ============ Initialization / Seeding ============

export async function seedGuidesFromData(guides: SpiritGuide[]): Promise<boolean> {
  const dbGuides: DbSpiritGuide[] = guides.map((guide, index) => ({
    ...guide,
    displayOrder: index,
    knowledgeBase: '',
    firstMessage: guide.welcomeMessage,
    stylePrompt: '',
  }));

  if (isFirebaseConfigured()) {
    try {
      const updates = dbGuides.map(guide => ({
        id: guide.id,
        data: dbGuideToFirestore(guide),
      }));
      await batchSaveDocuments('spiritGuides', updates);
      saveGuides(dbGuides);
      return true;
    } catch (err) {
      console.error('[seedGuidesFromData] Firestore error:', err);
    }
  }

  return saveGuides(dbGuides);
}

// Check if database is ready
export async function checkDatabaseReady(): Promise<boolean> {
  if (isFirebaseConfigured()) {
    try {
      // Try to query spiritGuides collection
      const guides = await getSpiritGuides();
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

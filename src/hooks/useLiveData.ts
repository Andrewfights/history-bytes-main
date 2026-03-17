/**
 * Live Data Hooks
 * Provides frontend access to admin-edited data with real-time updates
 * Uses Firestore real-time listeners for instant updates
 * Falls back to localStorage/default data when Firebase unavailable
 */

import { useState, useEffect, useCallback } from 'react';
import {
  loadStoredGuides,
  loadStoredCourses,
  loadStoredUnits,
  loadStoredLessons,
  loadStoredLessonContent,
  loadStoredArcadeData,
  STORAGE_KEYS,
} from '@/lib/adminStorage';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  subscribeToSpiritGuides,
  subscribeToCourses,
  subscribeToUnits,
  subscribeToLessons,
} from '@/lib/firestore';
import {
  loadGuides,
  loadCourses,
  loadUnits,
  loadLessons,
  loadLessonContent,
} from '@/lib/database';
import type { DbSpiritGuide, LessonContent } from '@/lib/database';
import type { Course, Unit, Lesson, SpiritGuide } from '@/types';

// Default data imports
import { getAllSpiritGuides, spiritGuides as defaultGuides } from '@/data/spiritGuidesData';
import { courses as defaultCourses, units as defaultUnits, lessons as defaultLessons } from '@/data/courseData';
import {
  anachronismScenes as defaultAnachronismScenes,
  connectionsPuzzles as defaultConnectionsPuzzles,
  mapMysteries as defaultMapMysteries,
  artifactCases as defaultArtifactCases,
  causeEffectPairs as defaultCauseEffectPairs,
} from '@/data/arcadeData';

// ============ Storage Event Listener ============

type StorageCallback = () => void;
const storageListeners: Map<string, Set<StorageCallback>> = new Map();

// Listen for storage changes (works across tabs too)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key && storageListeners.has(event.key)) {
      storageListeners.get(event.key)?.forEach(callback => callback());
    }
  });
}

// Custom event for same-tab updates
const STORAGE_UPDATE_EVENT = 'adminStorageUpdate';

export function notifyStorageUpdate(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_UPDATE_EVENT, { detail: { key } }));
  }
}

function subscribeToStorage(key: string, callback: StorageCallback): () => void {
  if (typeof window === 'undefined') {
    return () => {}; // No-op for SSR
  }

  if (!storageListeners.has(key)) {
    storageListeners.set(key, new Set());
  }
  storageListeners.get(key)!.add(callback);

  // Also listen for custom events (same tab)
  const customHandler = (event: Event) => {
    const detail = (event as CustomEvent).detail;
    if (detail?.key === key) {
      callback();
    }
  };
  window.addEventListener(STORAGE_UPDATE_EVENT, customHandler);

  return () => {
    storageListeners.get(key)?.delete(callback);
    window.removeEventListener(STORAGE_UPDATE_EVENT, customHandler);
  };
}

// ============ Spirit Guides Hook ============

export function useLiveGuides(): DbSpiritGuide[] {
  const [guides, setGuides] = useState<DbSpiritGuide[]>(() => {
    // Start with localStorage cache for instant display
    const stored = loadStoredGuides();
    if (stored && stored.length > 0) {
      return stored;
    }
    // Convert default guides to DbSpiritGuide format
    return getAllSpiritGuides().map((g, i) => ({
      ...g,
      displayOrder: i,
      knowledgeBase: '',
      firstMessage: g.welcomeMessage,
      stylePrompt: '',
    }));
  });

  useEffect(() => {
    // Fetch fresh data from Firestore
    const fetchFromFirestore = async () => {
      try {
        const data = await loadGuides();
        if (data && data.length > 0) {
          setGuides(data);
        }
      } catch (err) {
        console.error('Failed to fetch guides:', err);
      }
    };

    // Initial fetch
    if (isFirebaseConfigured()) {
      fetchFromFirestore();
    }

    // Subscribe to real-time changes from Firestore
    let unsubscribeFirestore: (() => void) | null = null;

    if (isFirebaseConfigured()) {
      unsubscribeFirestore = subscribeToSpiritGuides((firestoreGuides) => {
        if (firestoreGuides && firestoreGuides.length > 0) {
          // Convert Firestore guides to DbSpiritGuide format
          const converted: DbSpiritGuide[] = firestoreGuides.map(g => ({
            id: g.id,
            name: g.name,
            title: g.title,
            era: g.era,
            specialty: g.specialty,
            avatar: g.avatar,
            imageUrl: g.imageUrl,
            introVideoUrl: g.introVideoUrl,
            welcomeVideoUrl: g.welcomeVideoUrl,
            celebrationVideoUrl: g.celebrationVideoUrl,
            introQuote: g.introQuote,
            welcomeMessage: g.welcomeMessage,
            personality: g.personality,
            primaryColor: g.primaryColor,
            secondaryColor: g.secondaryColor,
            catchphrases: g.catchphrases,
            knowledgeBase: g.knowledgeBase || '',
            firstMessage: g.firstMessage || g.welcomeMessage,
            elevenLabsVoiceId: g.elevenLabsVoiceId,
            voiceStability: g.voiceStability,
            voiceSimilarity: g.voiceSimilarity,
            voiceStyle: g.voiceStyle,
            displayOrder: g.displayOrder,
            stylePrompt: g.stylePrompt || '',
          }));
          setGuides(converted);
        }
      });
    }

    // Also listen for localStorage changes (fallback for non-Firebase)
    const unsubscribeStorage = subscribeToStorage(STORAGE_KEYS.GUIDES, () => {
      const stored = loadStoredGuides();
      if (stored && stored.length > 0) {
        setGuides(stored);
      }
    });

    return () => {
      unsubscribeFirestore?.();
      unsubscribeStorage();
    };
  }, []);

  return guides;
}

// Get a single guide by ID
export function useLiveGuide(id: string): DbSpiritGuide | undefined {
  const guides = useLiveGuides();
  return guides.find(g => g.id === id);
}

// Get guides sorted by display order
export function useSortedGuides(): DbSpiritGuide[] {
  const guides = useLiveGuides();
  return [...guides].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
}

// ============ Courses Hook ============

export function useLiveCourses(): Course[] {
  const [courses, setCourses] = useState<Course[]>(() => {
    const stored = loadStoredCourses();
    return stored && stored.length > 0 ? stored : [...defaultCourses];
  });

  useEffect(() => {
    // Fetch fresh data from Firestore and convert to Course type
    const fetchFromFirestore = async () => {
      try {
        const data = await loadCourses();
        if (data && data.length > 0) {
          // Convert DbCourse to Course
          const converted: Course[] = data.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.id,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl,
            heroImageUrl: c.thumbnailUrl,
            category: 'general',
            difficulty: c.difficulty,
            totalDurationMinutes: 0,
            rating: 0,
            ratingsCount: 0,
            enrolledCount: 0,
            instructorId: c.instructor || '',
            unitsCount: 0,
            lessonsCount: 0,
            learningOutcomes: [],
            chronoOrder: c.displayOrder,
            isFeatured: c.isFeatured,
          }));
          setCourses(converted);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };

    // Initial fetch
    if (isFirebaseConfigured()) {
      fetchFromFirestore();
    }

    // Subscribe to real-time changes
    let unsubscribeFirestore: (() => void) | null = null;

    if (isFirebaseConfigured()) {
      unsubscribeFirestore = subscribeToCourses((firestoreCourses) => {
        if (firestoreCourses && firestoreCourses.length > 0) {
          const converted: Course[] = firestoreCourses.map(c => ({
            id: c.id,
            title: c.title,
            slug: c.id,
            description: c.description || '',
            thumbnailUrl: c.thumbnailUrl,
            heroImageUrl: c.thumbnailUrl,
            category: 'general',
            difficulty: c.difficulty,
            totalDurationMinutes: 0,
            rating: 0,
            ratingsCount: 0,
            enrolledCount: 0,
            instructorId: c.instructor || '',
            unitsCount: 0,
            lessonsCount: 0,
            learningOutcomes: [],
            chronoOrder: c.displayOrder,
            isFeatured: c.isFeatured,
          }));
          setCourses(converted);
        }
      });
    }

    // Also listen for localStorage changes (fallback)
    const unsubscribeStorage = subscribeToStorage(STORAGE_KEYS.COURSES, () => {
      const stored = loadStoredCourses();
      if (stored && stored.length > 0) {
        setCourses(stored);
      }
    });

    return () => {
      unsubscribeFirestore?.();
      unsubscribeStorage();
    };
  }, []);

  return courses;
}

// ============ Units Hook ============

export function useLiveUnits(courseId?: string): Unit[] {
  const [units, setUnits] = useState<Unit[]>(() => {
    const stored = loadStoredUnits();
    const data = stored && stored.length > 0 ? stored : [...defaultUnits];
    return courseId ? data.filter(u => u.courseId === courseId) : data;
  });

  useEffect(() => {
    // Fetch fresh data from Firestore
    const fetchFromFirestore = async () => {
      try {
        const data = await loadUnits(courseId);
        if (data) {
          // Convert DbUnit to Unit
          const converted: Unit[] = data.map(u => ({
            id: u.id,
            courseId: u.courseId,
            order: u.displayOrder,
            title: u.title,
            description: u.description,
            lessonsCount: 0,
            totalDurationMinutes: 0,
          }));
          setUnits(converted);
        }
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };

    // Initial fetch
    if (isFirebaseConfigured()) {
      fetchFromFirestore();
    }

    // Subscribe to real-time changes
    let unsubscribeFirestore: (() => void) | null = null;

    if (isFirebaseConfigured()) {
      unsubscribeFirestore = subscribeToUnits((firestoreUnits) => {
        if (firestoreUnits) {
          const filtered = courseId
            ? firestoreUnits.filter(u => u.courseId === courseId)
            : firestoreUnits;
          const converted: Unit[] = filtered.map(u => ({
            id: u.id,
            courseId: u.courseId,
            order: u.displayOrder,
            title: u.title,
            description: u.description,
            lessonsCount: 0,
            totalDurationMinutes: 0,
          }));
          setUnits(converted);
        }
      });
    }

    // Also listen for localStorage changes (fallback)
    const unsubscribeStorage = subscribeToStorage(STORAGE_KEYS.UNITS, () => {
      const stored = loadStoredUnits();
      const data = stored && stored.length > 0 ? stored : [...defaultUnits];
      setUnits(courseId ? data.filter(u => u.courseId === courseId) : data);
    });

    return () => {
      unsubscribeFirestore?.();
      unsubscribeStorage();
    };
  }, [courseId]);

  return units;
}

// ============ Lessons Hook ============

export function useLiveLessons(unitId?: string): Lesson[] {
  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const stored = loadStoredLessons();
    const data = stored && stored.length > 0 ? stored : [...defaultLessons];
    return unitId ? data.filter(l => l.unitId === unitId) : data;
  });

  useEffect(() => {
    // Fetch fresh data from Firestore
    const fetchFromFirestore = async () => {
      try {
        const data = await loadLessons(unitId);
        if (data) {
          // Convert DbLesson to Lesson
          const converted: Lesson[] = data.map(l => ({
            id: l.id,
            unitId: l.unitId,
            order: l.displayOrder,
            title: l.title,
            durationMinutes: l.durationMinutes || 10,
            cardsCount: 0,
            questionsCount: 0,
            xpReward: l.xpReward || 25,
          }));
          setLessons(converted);
        }
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
      }
    };

    // Initial fetch
    if (isFirebaseConfigured()) {
      fetchFromFirestore();
    }

    // Subscribe to real-time changes
    let unsubscribeFirestore: (() => void) | null = null;

    if (isFirebaseConfigured()) {
      unsubscribeFirestore = subscribeToLessons((firestoreLessons) => {
        if (firestoreLessons) {
          const filtered = unitId
            ? firestoreLessons.filter(l => l.unitId === unitId)
            : firestoreLessons;
          const converted: Lesson[] = filtered.map(l => ({
            id: l.id,
            unitId: l.unitId,
            order: l.displayOrder,
            title: l.title,
            durationMinutes: l.durationMinutes || 10,
            cardsCount: 0,
            questionsCount: 0,
            xpReward: l.xpReward || 25,
          }));
          setLessons(converted);
        }
      });
    }

    // Also listen for localStorage changes (fallback)
    const unsubscribeStorage = subscribeToStorage(STORAGE_KEYS.LESSONS, () => {
      const stored = loadStoredLessons();
      const data = stored && stored.length > 0 ? stored : [...defaultLessons];
      setLessons(unitId ? data.filter(l => l.unitId === unitId) : data);
    });

    return () => {
      unsubscribeFirestore?.();
      unsubscribeStorage();
    };
  }, [unitId]);

  return lessons;
}

// ============ Lesson Content Hook ============

export function useLiveLessonContent(lessonId: string): LessonContent[] {
  const [content, setContent] = useState<LessonContent[]>(() => {
    return loadStoredLessonContent(lessonId) || [];
  });

  useEffect(() => {
    // Fetch fresh data from Firestore
    const fetchFromFirestore = async () => {
      try {
        const data = await loadLessonContent(lessonId);
        if (data) {
          setContent(data);
        }
      } catch (err) {
        console.error('Failed to fetch lesson content:', err);
      }
    };

    // Initial fetch
    if (isFirebaseConfigured()) {
      fetchFromFirestore();
    }

    // Note: For lesson content, we don't set up a real-time subscription
    // since it's less frequently changed and would require a filtered listener
    // The admin panel can trigger a refetch when content is saved

    // Also listen for localStorage changes (fallback)
    const unsubscribeStorage = subscribeToStorage(STORAGE_KEYS.LESSON_CONTENT, () => {
      const stored = loadStoredLessonContent(lessonId);
      setContent(stored || []);
    });

    return () => {
      unsubscribeStorage();
    };
  }, [lessonId]);

  return content;
}

// ============ Arcade Data Hooks ============

export function useLiveAnachronismScenes() {
  const [data, setData] = useState(() => {
    const stored = loadStoredArcadeData();
    return (stored?.anachronismScenes as typeof defaultAnachronismScenes) || defaultAnachronismScenes;
  });

  useEffect(() => {
    const refresh = () => {
      const stored = loadStoredArcadeData();
      setData((stored?.anachronismScenes as typeof defaultAnachronismScenes) || defaultAnachronismScenes);
    };
    return subscribeToStorage(STORAGE_KEYS.ARCADE_DATA, refresh);
  }, []);

  return data;
}

export function useLiveConnectionsPuzzles() {
  const [data, setData] = useState(() => {
    const stored = loadStoredArcadeData();
    return (stored?.connectionsPuzzles as typeof defaultConnectionsPuzzles) || defaultConnectionsPuzzles;
  });

  useEffect(() => {
    const refresh = () => {
      const stored = loadStoredArcadeData();
      setData((stored?.connectionsPuzzles as typeof defaultConnectionsPuzzles) || defaultConnectionsPuzzles);
    };
    return subscribeToStorage(STORAGE_KEYS.ARCADE_DATA, refresh);
  }, []);

  return data;
}

export function useLiveMapMysteries() {
  const [data, setData] = useState(() => {
    const stored = loadStoredArcadeData();
    return (stored?.mapMysteries as typeof defaultMapMysteries) || defaultMapMysteries;
  });

  useEffect(() => {
    const refresh = () => {
      const stored = loadStoredArcadeData();
      setData((stored?.mapMysteries as typeof defaultMapMysteries) || defaultMapMysteries);
    };
    return subscribeToStorage(STORAGE_KEYS.ARCADE_DATA, refresh);
  }, []);

  return data;
}

export function useLiveArtifactCases() {
  const [data, setData] = useState(() => {
    const stored = loadStoredArcadeData();
    return (stored?.artifactCases as typeof defaultArtifactCases) || defaultArtifactCases;
  });

  useEffect(() => {
    const refresh = () => {
      const stored = loadStoredArcadeData();
      setData((stored?.artifactCases as typeof defaultArtifactCases) || defaultArtifactCases);
    };
    return subscribeToStorage(STORAGE_KEYS.ARCADE_DATA, refresh);
  }, []);

  return data;
}

export function useLiveCauseEffectPairs() {
  const [data, setData] = useState(() => {
    const stored = loadStoredArcadeData();
    return (stored?.causeEffectPairs as typeof defaultCauseEffectPairs) || defaultCauseEffectPairs;
  });

  useEffect(() => {
    const refresh = () => {
      const stored = loadStoredArcadeData();
      setData((stored?.causeEffectPairs as typeof defaultCauseEffectPairs) || defaultCauseEffectPairs);
    };
    return subscribeToStorage(STORAGE_KEYS.ARCADE_DATA, refresh);
  }, []);

  return data;
}

// ============ Course Helper Hooks ============

// Get a single course by ID
export function useLiveCourseById(courseId: string): Course | undefined {
  const courses = useLiveCourses();
  return courses.find(c => c.id === courseId);
}

// Get featured course
export function useLiveFeaturedCourse(): Course | undefined {
  const courses = useLiveCourses();
  return courses.find(c => c.isFeatured);
}

// Get units for a course (sorted by order)
export function useLiveUnitsByCourseId(courseId: string): Unit[] {
  const units = useLiveUnits();
  return units
    .filter(u => u.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

// Get lessons for a unit (sorted by order)
export function useLiveLessonsByUnitId(unitId: string): Lesson[] {
  const lessons = useLiveLessons();
  return lessons
    .filter(l => l.unitId === unitId)
    .sort((a, b) => a.order - b.order);
}

// Combined hook for course data with all relationships
export function useLiveCourseData() {
  const courses = useLiveCourses();
  const units = useLiveUnits();
  const lessons = useLiveLessons();

  const getCourseById = useCallback((id: string) => {
    return courses.find(c => c.id === id);
  }, [courses]);

  const getUnitsByCourseId = useCallback((courseId: string) => {
    return units
      .filter(u => u.courseId === courseId)
      .sort((a, b) => a.order - b.order);
  }, [units]);

  const getLessonsByUnitId = useCallback((unitId: string) => {
    return lessons
      .filter(l => l.unitId === unitId)
      .sort((a, b) => a.order - b.order);
  }, [lessons]);

  const getFeaturedCourse = useCallback(() => {
    return courses.find(c => c.isFeatured);
  }, [courses]);

  return {
    courses,
    units,
    lessons,
    getCourseById,
    getUnitsByCourseId,
    getLessonsByUnitId,
    getFeaturedCourse,
  };
}

// ============ Utility: Trigger refresh from admin ============

export function triggerDataRefresh(key: keyof typeof STORAGE_KEYS) {
  notifyStorageUpdate(STORAGE_KEYS[key]);
}

// ============ Era Tile Overrides Hook ============

import {
  subscribeToEraTileOverrides,
  subscribeToGameThumbnails,
  subscribeToPearlHarborMedia,
  subscribeToGhostArmyMedia,
} from '@/lib/firestore';
import {
  loadEraTileOverrides,
  loadGameThumbnails,
  loadPearlHarborMediaData,
  loadGhostArmyMediaData,
  type EraTileOverride,
  type PearlHarborMediaData,
  type GhostArmyMediaData,
} from '@/lib/database';
import {
  getEraTileOverrides,
  initEraTileOverridesCache,
  type EraTileOverrides,
} from '@/data/historicalEras';
import {
  loadGameThumbnails as loadLocalGameThumbnails,
  initGameThumbnailsCache,
} from '@/data/arcadeGames';

export function useLiveEraTileOverrides(): EraTileOverrides {
  const [overrides, setOverrides] = useState<EraTileOverrides>(() => {
    return getEraTileOverrides();
  });

  useEffect(() => {
    // Initialize from Firestore
    const init = async () => {
      try {
        await initEraTileOverridesCache();
        setOverrides(getEraTileOverrides());
      } catch (error) {
        console.error('Failed to init era tile overrides:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubscribe = subscribeToEraTileOverrides((firestoreOverrides) => {
        const result: EraTileOverrides = {};
        firestoreOverrides.forEach(o => {
          if (o.isActive) {
            result[o.id] = { imageUrl: o.imageUrl };
          }
        });
        setOverrides(result);
      });

      return () => unsubscribe();
    }
  }, []);

  return overrides;
}

// ============ Game Thumbnails Hook ============

export function useLiveGameThumbnails(): Record<string, string> {
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(() => {
    return loadLocalGameThumbnails();
  });

  useEffect(() => {
    // Initialize from Firestore
    const init = async () => {
      try {
        await initGameThumbnailsCache();
        const fresh = await loadGameThumbnails();
        setThumbnails(fresh);
      } catch (error) {
        console.error('Failed to init game thumbnails:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubscribe = subscribeToGameThumbnails((firestoreThumbnails) => {
        const result: Record<string, string> = {};
        firestoreThumbnails.forEach(t => {
          result[t.id] = t.imageUrl;
        });
        setThumbnails(result);
      });

      return () => unsubscribe();
    }
  }, []);

  return thumbnails;
}

// ============ Pearl Harbor Media Hook ============

export function useLivePearlHarborMedia(): Record<string, PearlHarborMediaData> {
  const [media, setMedia] = useState<Record<string, PearlHarborMediaData>>({});

  useEffect(() => {
    // Load from Firestore on mount
    const init = async () => {
      try {
        const data = await loadPearlHarborMediaData();
        setMedia(data);
      } catch (error) {
        console.error('Failed to load Pearl Harbor media:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubscribe = subscribeToPearlHarborMedia((items) => {
        const result: Record<string, PearlHarborMediaData> = {};
        items.forEach(item => {
          result[item.id] = {
            id: item.id,
            videoUrl: item.videoUrl,
            videoUrl2: item.videoUrl2,
            videoThumbnail: item.videoThumbnail,
            backgroundImage: item.backgroundImage,
            additionalImages: item.additionalImages,
          };
        });
        setMedia(result);
      });

      return () => unsubscribe();
    }
  }, []);

  return media;
}

// ============ Ghost Army Media Hook ============

export function useLiveGhostArmyMedia(): Record<string, GhostArmyMediaData> {
  const [media, setMedia] = useState<Record<string, GhostArmyMediaData>>({});

  useEffect(() => {
    // Load from Firestore on mount
    const init = async () => {
      try {
        const data = await loadGhostArmyMediaData();
        setMedia(data);
      } catch (error) {
        console.error('Failed to load Ghost Army media:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubscribe = subscribeToGhostArmyMedia((items) => {
        const result: Record<string, GhostArmyMediaData> = {};
        items.forEach(item => {
          result[item.id] = {
            id: item.id,
            videoUrl: item.videoUrl,
            videoUrl2: item.videoUrl2,
            videoThumbnail: item.videoThumbnail,
            backgroundImage: item.backgroundImage,
            additionalImages: item.additionalImages,
          };
        });
        setMedia(result);
      });

      return () => unsubscribe();
    }
  }, []);

  return media;
}

// ============ Pantheon Souvenirs Hook ============

import {
  initPantheonCache,
  subscribeToPantheonUpdates,
  getSouvenirById as getSouvenirByIdWithCache,
} from '@/data/pantheonSouvenirs';
import type { Souvenir } from '@/types';

export function useLivePantheonSouvenirs(): {
  isReady: boolean;
  getSouvenirById: (id: string) => Souvenir | undefined;
} {
  const [isReady, setIsReady] = useState(false);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    // Initialize from Firestore
    const init = async () => {
      try {
        await initPantheonCache();
        setIsReady(true);
      } catch (error) {
        console.error('Failed to init Pantheon cache:', error);
        setIsReady(true); // Still set ready so defaults work
      }
    };

    init();

    // Subscribe to real-time changes
    if (isFirebaseConfigured()) {
      const unsubscribe = subscribeToPantheonUpdates();
      // Force component updates when data changes
      const interval = setInterval(() => {
        forceUpdate(n => n + 1);
      }, 1000);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, []);

  return {
    isReady,
    getSouvenirById: getSouvenirByIdWithCache,
  };
}

// ============ Interactive Maps Hook ============

import {
  getInteractiveMaps,
  subscribeToInteractiveMaps,
  type FirestoreInteractiveMap,
} from '@/lib/firestore';

export function useLiveInteractiveMaps(): FirestoreInteractiveMap[] {
  const [maps, setMaps] = useState<FirestoreInteractiveMap[]>([]);

  useEffect(() => {
    // Load from Firestore on mount
    const init = async () => {
      try {
        const data = await getInteractiveMaps();
        setMaps(data);
      } catch (error) {
        console.error('Failed to load interactive maps:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubscribe = subscribeToInteractiveMaps((items) => {
        setMaps(items);
      });

      return () => unsubscribe();
    }
  }, []);

  return maps;
}

// ============ Journey Arcs Hook ============

import {
  getJourneyArcs,
  subscribeToJourneyArcs,
  getJourneyThumbnails,
  subscribeToJourneyThumbnails,
  type FirestoreJourneyArc,
  type FirestoreJourneyThumbnail,
} from '@/lib/firestore';

export function useLiveJourneyArcs(): {
  arcs: FirestoreJourneyArc[];
  thumbnails: Record<string, string>;
} {
  const [arcs, setArcs] = useState<FirestoreJourneyArc[]>([]);
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({});

  useEffect(() => {
    // Load from Firestore on mount
    const init = async () => {
      try {
        const [arcsData, thumbsData] = await Promise.all([
          getJourneyArcs(),
          getJourneyThumbnails(),
        ]);
        setArcs(arcsData);
        const thumbMap: Record<string, string> = {};
        thumbsData.forEach(t => { thumbMap[t.id] = t.imageUrl; });
        setThumbnails(thumbMap);
      } catch (error) {
        console.error('Failed to load journey arcs:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubArcs = subscribeToJourneyArcs((items) => {
        setArcs(items);
      });

      const unsubThumbs = subscribeToJourneyThumbnails((items) => {
        const thumbMap: Record<string, string> = {};
        items.forEach(t => { thumbMap[t.id] = t.imageUrl; });
        setThumbnails(thumbMap);
      });

      return () => {
        unsubArcs();
        unsubThumbs();
      };
    }
  }, []);

  return { arcs, thumbnails };
}

// ============ Arcade Game Content Hook ============

import {
  getAllArcadeGameContent,
  subscribeToArcadeGameContent,
  type FirestoreArcadeGameContent,
} from '@/lib/firestore';

export function useLiveArcadeContent(): Record<string, any[]> {
  const [content, setContent] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Load from Firestore on mount
    const init = async () => {
      try {
        const allContent = await getAllArcadeGameContent();
        const result: Record<string, any[]> = {};
        allContent.forEach(c => {
          result[c.gameType] = c.items;
        });
        setContent(result);
      } catch (error) {
        console.error('Failed to load arcade content:', error);
      }
    };

    if (isFirebaseConfigured()) {
      init();

      // Subscribe to real-time changes
      const unsubscribe = subscribeToArcadeGameContent((allContent) => {
        const result: Record<string, any[]> = {};
        allContent.forEach(c => {
          result[c.gameType] = c.items;
        });
        setContent(result);
      });

      return () => unsubscribe();
    }
  }, []);

  return content;
}

// ============ Trivia Sets Hook ============

import {
  initTriviaCache,
  subscribeToTriviaUpdates,
  loadTriviaConfigAsync,
} from '@/lib/triviaStorage';
import type { TriviaSet } from '@/lib/triviaStorage';

export function useLiveTriviaSets(): TriviaSet[] {
  const [sets, setSets] = useState<TriviaSet[]>([]);

  useEffect(() => {
    // Load from cache on mount
    const init = async () => {
      try {
        await initTriviaCache();
        const config = await loadTriviaConfigAsync();
        setSets(Object.values(config.sets));
      } catch (error) {
        console.error('Failed to load trivia sets:', error);
      }
    };

    init();

    // Subscribe to real-time changes
    const unsubscribe = subscribeToTriviaUpdates((updatedSets) => {
      setSets(updatedSets);
    });

    return () => unsubscribe();
  }, []);

  return sets;
}

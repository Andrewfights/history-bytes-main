import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { TabType, User, MasteryState, ArcadePlayRecord, CourseProgress, getRank, Rank, Course, Unit, Lesson } from '@/types';
import { mockUser } from '@/data/mockData';
import { courses as defaultCourses, units as defaultUnits, lessons as defaultLessons } from '@/data/courseData';
import { loadStoredCourses, loadStoredUnits, loadStoredLessons, STORAGE_KEYS as ADMIN_STORAGE_KEYS } from '@/lib/adminStorage';
import { isFirebaseConfigured } from '@/lib/firebase';
import { subscribeToCourses, subscribeToUnits, subscribeToLessons } from '@/lib/firestore';
import { loadCourses, loadUnits, loadLessons } from '@/lib/database';
import {
  STORAGE_KEYS,
  saveToStorage,
  loadFromStorage,
  calculateStreak,
  hasCompletedOnboarding,
  setOnboardingComplete,
  getSelectedGuideId,
  setSelectedGuideId as saveSelectedGuideId,
  getAuthState,
  setAuthState,
  clearAuthState,
  clearAllStorage,
  PersistedUserProfile,
  PersistedJourneyProgress,
  PersistedCourseProgress,
  PersistedArcadeRecords,
  PersistedAppMeta,
  PersistedBadges,
  PersistedTooltips,
  PersistedStudyNotes,
  StudyNote,
  AuthState,
  FunnelState,
  GhostArmyProgress,
} from '@/lib/storage';
import { initEraTileOverridesCache } from '@/data/historicalEras';
import { initPantheonCache, subscribeToPantheonUpdates } from '@/data/pantheonSouvenirs';
import { initGameThumbnailsCache } from '@/data/arcadeGames';
import { initTriviaCache, subscribeToTriviaUpdates } from '@/lib/triviaStorage';
import {
  subscribeToEraTileOverrides,
  subscribeToGameThumbnails,
  subscribeToInteractiveMaps,
  subscribeToJourneyArcs,
  subscribeToArcadeGameContent,
} from '@/lib/firestore';
import { EarnedBadge } from '@/types/badges';

export interface JourneyViewState {
  view: 'landing' | 'arc' | 'node';
  arcId: string | null;
  chapterId: string | null;
  nodeId: string | null;
  chapterIndex: number;
}

export interface PendingLuckyNode {
  arcId: string;
  chapterId: string;
  nodeId: string;
  chapterIndex: number;
}

interface AppContextType {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  user: User;
  updateUser: (updates: Partial<User>) => void;
  addXP: (amount: number) => void;
  incrementStreak: () => void;
  // Rank
  getRank: (xp: number) => Rank;
  // Node Mastery
  nodeMastery: Record<string, MasteryState>;
  setNodeMastery: (nodeId: string, state: MasteryState) => void;
  getNodeMastery: (nodeId: string) => MasteryState;
  crownedCount: number;
  // Arcade XP caps
  arcadePlayRecords: Record<string, ArcadePlayRecord>;
  recordArcadePlay: (gameId: string, xpEarned: number) => void;
  getArcadePlaysToday: (gameId: string) => number;
  // Journey progress
  completedJourneyNodes: string[];
  markJourneyNodeComplete: (nodeId: string) => void;
  isJourneyNodeCompleted: (nodeId: string) => boolean;
  // Recent arcs and view state persistence
  recentArcIds: string[];
  trackArcVisit: (arcId: string) => void;
  journeyViewState: JourneyViewState | null;
  saveJourneyViewState: (state: JourneyViewState | null) => void;
  // Course progress (Learn tab)
  completedLessons: Set<string>;
  markLessonComplete: (lessonId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  courseProgress: Map<string, CourseProgress>;
  // Onboarding
  isOnboarded: boolean;
  completeOnboarding: () => void;
  selectedGuideId: string | null;
  setSelectedGuide: (guideId: string) => void;
  // Chapter intro videos
  viewedChapterIntros: string[];
  markChapterIntroViewed: (chapterId: string) => void;
  hasViewedChapterIntro: (chapterId: string) => boolean;
  // Lucky node navigation
  pendingLuckyNode: PendingLuckyNode | null;
  setPendingLuckyNode: (node: PendingLuckyNode | null) => void;
  // Pearl Harbor journey entry
  pendingPearlHarbor: boolean;
  setPendingPearlHarbor: (pending: boolean) => void;
  // Hydration state
  isHydrated: boolean;
  // Authentication
  isAuthenticated: boolean;
  userEmail: string | null;
  signIn: (userId: string, email: string, isNewUser: boolean) => void;
  signOut: () => void;
  // Badge system
  earnedBadges: EarnedBadge[];
  addEarnedBadge: (badge: EarnedBadge) => void;
  markBadgeSeen: (badgeId: string) => void;
  perfectScoreCount: number;
  incrementPerfectScore: () => void;
  bossNodesDefeated: number;
  incrementBossDefeated: () => void;
  playedNodeTypes: string[];
  addPlayedNodeType: (nodeType: string) => void;
  arcadeGamesPlayed: number;
  incrementArcadeGamesPlayed: () => void;
  totalQuizAttempts: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  recordQuizResult: (correct: number, total: number) => void;
  // First-time tooltips
  seenTooltips: string[];
  hasSeenTooltip: (tooltipId: string) => boolean;
  markTooltipSeen: (tooltipId: string) => void;
  // Study notes (for wrong answers)
  studyNotes: StudyNote[];
  addStudyNote: (note: Omit<StudyNote, 'id' | 'timestamp'>) => void;
  removeStudyNote: (noteId: string) => void;
  clearStudyNotes: () => void;
  // Funnel state (WW2 demo)
  funnelState: FunnelState;
  isFunnelMode: boolean;
  markWW2IntroViewed: () => void;
  updateGhostArmyProgress: (progress: Partial<GhostArmyProgress>) => void;
  completeGhostArmy: () => void;
  resetFunnelState: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const today = () => new Date().toISOString().split('T')[0];

export function AppProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [user, setUser] = useState<User>(mockUser);
  const [nodeMastery, setNodeMasteryState] = useState<Record<string, MasteryState>>({});
  const [arcadePlayRecords, setArcadePlayRecords] = useState<Record<string, ArcadePlayRecord>>({});
  const [completedJourneyNodes, setCompletedJourneyNodes] = useState<string[]>([]);
  const [recentArcIds, setRecentArcIds] = useState<string[]>([]);
  const [journeyViewState, setJourneyViewState] = useState<JourneyViewState | null>(null);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  // Onboarding state
  const [isOnboarded, setIsOnboarded] = useState<boolean>(false);
  const [selectedGuideId, setSelectedGuideIdState] = useState<string | null>(null);
  const [viewedChapterIntros, setViewedChapterIntros] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  // Lucky node navigation
  const [pendingLuckyNode, setPendingLuckyNode] = useState<PendingLuckyNode | null>(null);
  // Pearl Harbor journey entry
  const [pendingPearlHarbor, setPendingPearlHarbor] = useState<boolean>(false);

  // Badge system state
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [perfectScoreCount, setPerfectScoreCount] = useState(0);
  const [bossNodesDefeated, setBossNodesDefeated] = useState(0);
  const [playedNodeTypes, setPlayedNodeTypes] = useState<string[]>([]);
  const [arcadeGamesPlayed, setArcadeGamesPlayed] = useState(0);
  const [totalQuizAttempts, setTotalQuizAttempts] = useState(0);
  const [totalCorrectAnswers, setTotalCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // First-time tooltips state
  const [seenTooltips, setSeenTooltips] = useState<string[]>([]);
  // Study notes state (for wrong answers)
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  // Funnel state (WW2 demo experience)
  const defaultFunnelState: FunnelState = {
    mode: 'funnel-ww2',
    ww2: {
      hasViewedIntro: false,
      ghostArmyProgress: {
        started: false,
        completed: false,
        lastTimestamp: 0,
        interactionsCompleted: [],
      },
      unlockedStories: [],
    },
  };
  const [funnelState, setFunnelState] = useState<FunnelState>(defaultFunnelState);

  // Live course data (with admin edits)
  const [liveCourses, setLiveCourses] = useState<Course[]>(() => {
    const stored = loadStoredCourses();
    return stored && stored.length > 0 ? stored : defaultCourses;
  });
  const [liveUnits, setLiveUnits] = useState<Unit[]>(() => {
    const stored = loadStoredUnits();
    return stored && stored.length > 0 ? stored : defaultUnits;
  });
  const [liveLessons, setLiveLessons] = useState<Lesson[]>(() => {
    const stored = loadStoredLessons();
    return stored && stored.length > 0 ? stored : defaultLessons;
  });

  // Helper functions for live course data
  const getUnitsByCourseId = useCallback((courseId: string): Unit[] => {
    return liveUnits.filter(u => u.courseId === courseId).sort((a, b) => a.order - b.order);
  }, [liveUnits]);

  const getLessonsByUnitId = useCallback((unitId: string): Lesson[] => {
    return liveLessons.filter(l => l.unitId === unitId).sort((a, b) => a.order - b.order);
  }, [liveLessons]);

  // Listen for admin storage updates and Firestore real-time changes
  useEffect(() => {
    // Fetch from Firestore and update state
    const fetchCoursesFromFirestore = async () => {
      try {
        const data = await loadCourses();
        if (data && data.length > 0) {
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
          setLiveCourses(converted);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };

    const fetchUnitsFromFirestore = async () => {
      try {
        const data = await loadUnits();
        if (data) {
          const converted: Unit[] = data.map(u => ({
            id: u.id,
            courseId: u.courseId,
            order: u.displayOrder,
            title: u.title,
            description: u.description,
            lessonsCount: 0,
            totalDurationMinutes: 0,
          }));
          setLiveUnits(converted);
        }
      } catch (err) {
        console.error('Failed to fetch units:', err);
      }
    };

    const fetchLessonsFromFirestore = async () => {
      try {
        const data = await loadLessons();
        if (data) {
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
          setLiveLessons(converted);
        }
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
      }
    };

    // Initial fetch from Firestore
    if (isFirebaseConfigured()) {
      fetchCoursesFromFirestore();
      fetchUnitsFromFirestore();
      fetchLessonsFromFirestore();
    }

    // Subscribe to Firestore real-time changes
    let unsubscribeCourses: (() => void) | null = null;
    let unsubscribeUnits: (() => void) | null = null;
    let unsubscribeLessons: (() => void) | null = null;
    let unsubscribeEraTiles: (() => void) | null = null;
    let unsubscribePantheon: (() => void) | null = null;
    let unsubscribeGameThumbnails: (() => void) | null = null;
    let unsubscribeTrivia: (() => void) | null = null;

    if (isFirebaseConfigured()) {
      // Initialize caches for admin-controlled content
      initEraTileOverridesCache().catch(err => console.error('Failed to init era tile cache:', err));
      initPantheonCache().catch(err => console.error('Failed to init pantheon cache:', err));
      initGameThumbnailsCache().catch(err => console.error('Failed to init game thumbnails cache:', err));
      initTriviaCache().catch(err => console.error('Failed to init trivia cache:', err));

      // Subscribe to era tile updates (so images update in real-time)
      unsubscribeEraTiles = subscribeToEraTileOverrides(() => {
        // Re-initialize cache when era tiles change
        initEraTileOverridesCache().catch(err => console.error('Era tile cache update failed:', err));
      });

      // Subscribe to pantheon updates
      unsubscribePantheon = subscribeToPantheonUpdates();

      // Subscribe to game thumbnails updates (so arcade images update in real-time)
      unsubscribeGameThumbnails = subscribeToGameThumbnails(() => {
        initGameThumbnailsCache().catch(err => console.error('Game thumbnails cache update failed:', err));
      });

      // Subscribe to trivia updates
      unsubscribeTrivia = subscribeToTriviaUpdates(() => {
        console.log('[AppContext] Trivia sets updated');
      });
      unsubscribeCourses = subscribeToCourses((firestoreCourses) => {
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
          setLiveCourses(converted);
        }
      });

      unsubscribeUnits = subscribeToUnits((firestoreUnits) => {
        if (firestoreUnits) {
          const converted: Unit[] = firestoreUnits.map(u => ({
            id: u.id,
            courseId: u.courseId,
            order: u.displayOrder,
            title: u.title,
            description: u.description,
            lessonsCount: 0,
            totalDurationMinutes: 0,
          }));
          setLiveUnits(converted);
        }
      });

      unsubscribeLessons = subscribeToLessons((firestoreLessons) => {
        if (firestoreLessons) {
          const converted: Lesson[] = firestoreLessons.map(l => ({
            id: l.id,
            unitId: l.unitId,
            order: l.displayOrder,
            title: l.title,
            durationMinutes: l.durationMinutes || 10,
            cardsCount: 0,
            questionsCount: 0,
            xpReward: l.xpReward || 25,
          }));
          setLiveLessons(converted);
        }
      });
    }

    // Also listen for localStorage updates (fallback)
    const handleStorageUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (detail?.key === ADMIN_STORAGE_KEYS.COURSES) {
        const stored = loadStoredCourses();
        if (stored && stored.length > 0) setLiveCourses(stored);
      }
      if (detail?.key === ADMIN_STORAGE_KEYS.UNITS) {
        const stored = loadStoredUnits();
        if (stored && stored.length > 0) setLiveUnits(stored);
      }
      if (detail?.key === ADMIN_STORAGE_KEYS.LESSONS) {
        const stored = loadStoredLessons();
        if (stored && stored.length > 0) setLiveLessons(stored);
      }
    };

    window.addEventListener('adminStorageUpdate', handleStorageUpdate);

    return () => {
      window.removeEventListener('adminStorageUpdate', handleStorageUpdate);
      unsubscribeCourses?.();
      unsubscribeUnits?.();
      unsubscribeLessons?.();
      unsubscribeEraTiles?.();
      unsubscribePantheon?.();
      unsubscribeGameThumbnails?.();
      unsubscribeTrivia?.();
    };
  }, []);

  // Load persisted state on mount
  useEffect(() => {
    const loadPersistedState = () => {
      // Check authentication status
      const authState = getAuthState();
      if (authState?.isAuthenticated) {
        setIsAuthenticated(true);
        setUserEmail(authState.email);
      }

      // Check onboarding status
      const onboarded = hasCompletedOnboarding();
      setIsOnboarded(onboarded);

      // Load selected guide
      const guideId = getSelectedGuideId();
      setSelectedGuideIdState(guideId);

      // Load user profile
      const savedUser = loadFromStorage<PersistedUserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (savedUser) {
        const updatedStreak = calculateStreak(savedUser.lastActiveDate, savedUser.streak);
        setUser({
          ...mockUser,
          ...savedUser,
          streak: updatedStreak,
          lastActiveDate: new Date().toISOString().split('T')[0],
        });
      }

      // Load journey progress
      const savedJourney = loadFromStorage<PersistedJourneyProgress>(STORAGE_KEYS.JOURNEY_PROGRESS);
      if (savedJourney) {
        setCompletedJourneyNodes(savedJourney.completedNodes || []);
        setNodeMasteryState(savedJourney.nodeMastery as Record<string, MasteryState> || {});
        setRecentArcIds(savedJourney.recentArcIds || []);
        setJourneyViewState(savedJourney.journeyViewState || null);
        setViewedChapterIntros(savedJourney.viewedChapterIntros || []);
      }

      // Load course progress
      const savedCourses = loadFromStorage<PersistedCourseProgress>(STORAGE_KEYS.COURSE_PROGRESS);
      if (savedCourses) {
        setCompletedLessons(new Set(savedCourses.completedLessons || []));
      }

      // Load arcade records
      const savedArcade = loadFromStorage<PersistedArcadeRecords>(STORAGE_KEYS.ARCADE_RECORDS);
      if (savedArcade) {
        setArcadePlayRecords(savedArcade.playRecords || {});
      }

      // Load badge data
      const savedBadges = loadFromStorage<PersistedBadges>(STORAGE_KEYS.BADGES);
      if (savedBadges) {
        setEarnedBadges(savedBadges.earnedBadges || []);
        setPerfectScoreCount(savedBadges.perfectScoreCount || 0);
        setBossNodesDefeated(savedBadges.bossNodesDefeated || 0);
        setPlayedNodeTypes(savedBadges.playedNodeTypes || []);
        setArcadeGamesPlayed(savedBadges.arcadeGamesPlayed || 0);
        setTotalQuizAttempts(savedBadges.totalQuizAttempts || 0);
        setTotalCorrectAnswers(savedBadges.totalCorrectAnswers || 0);
        setTotalQuestions(savedBadges.totalQuestions || 0);
      }

      // Load tooltips data
      const savedTooltips = loadFromStorage<PersistedTooltips>(STORAGE_KEYS.TOOLTIPS);
      if (savedTooltips) {
        setSeenTooltips(savedTooltips.seenTooltips || []);
      }

      // Load study notes
      const savedStudyNotes = loadFromStorage<PersistedStudyNotes>(STORAGE_KEYS.STUDY_NOTES);
      if (savedStudyNotes) {
        setStudyNotes(savedStudyNotes.notes || []);
      }

      // Load funnel state
      const savedFunnelState = loadFromStorage<FunnelState>(STORAGE_KEYS.FUNNEL_STATE);
      if (savedFunnelState) {
        setFunnelState(savedFunnelState);
      }

      // Update app meta
      const now = new Date().toISOString();
      const meta = loadFromStorage<PersistedAppMeta>(STORAGE_KEYS.APP_META);
      saveToStorage<PersistedAppMeta>(STORAGE_KEYS.APP_META, {
        version: '1.0.0',
        firstVisit: meta?.firstVisit || now,
        lastVisit: now,
        isReturningUser: !!meta,
      });

      setIsHydrated(true);
    };

    loadPersistedState();
  }, []);

  // Persist user profile on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedUserProfile>(STORAGE_KEYS.USER_PROFILE, {
      id: user.id,
      displayName: user.displayName,
      anonLeaderboard: user.anonLeaderboard,
      xp: user.xp,
      streak: user.streak,
      lastActiveDate: user.lastActiveDate,
    });
  }, [user, isHydrated]);

  // Persist journey progress on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedJourneyProgress>(STORAGE_KEYS.JOURNEY_PROGRESS, {
      completedNodes: completedJourneyNodes,
      nodeMastery: nodeMastery,
      recentArcIds: recentArcIds,
      journeyViewState: journeyViewState,
      viewedChapterIntros: viewedChapterIntros,
    });
  }, [completedJourneyNodes, nodeMastery, recentArcIds, journeyViewState, viewedChapterIntros, isHydrated]);

  // Persist course progress on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedCourseProgress>(STORAGE_KEYS.COURSE_PROGRESS, {
      completedLessons: Array.from(completedLessons),
    });
  }, [completedLessons, isHydrated]);

  // Persist arcade records on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedArcadeRecords>(STORAGE_KEYS.ARCADE_RECORDS, {
      playRecords: arcadePlayRecords,
    });
  }, [arcadePlayRecords, isHydrated]);

  // Persist badge data on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedBadges>(STORAGE_KEYS.BADGES, {
      earnedBadges,
      perfectScoreCount,
      bossNodesDefeated,
      playedNodeTypes,
      arcadeGamesPlayed,
      totalQuizAttempts,
      totalCorrectAnswers,
      totalQuestions,
    });
  }, [earnedBadges, perfectScoreCount, bossNodesDefeated, playedNodeTypes, arcadeGamesPlayed, totalQuizAttempts, totalCorrectAnswers, totalQuestions, isHydrated]);

  // Persist tooltips on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedTooltips>(STORAGE_KEYS.TOOLTIPS, {
      seenTooltips,
    });
  }, [seenTooltips, isHydrated]);

  // Persist study notes on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<PersistedStudyNotes>(STORAGE_KEYS.STUDY_NOTES, {
      notes: studyNotes,
    });
  }, [studyNotes, isHydrated]);

  // Persist funnel state on changes
  useEffect(() => {
    if (!isHydrated) return;
    saveToStorage<FunnelState>(STORAGE_KEYS.FUNNEL_STATE, funnelState);
  }, [funnelState, isHydrated]);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const addXP = (amount: number) => {
    setUser(prev => ({ ...prev, xp: prev.xp + amount }));
  };

  const incrementStreak = () => {
    setUser(prev => ({ ...prev, streak: prev.streak + 1 }));
  };

  const setNodeMastery = (nodeId: string, state: MasteryState) => {
    setNodeMasteryState(prev => ({ ...prev, [nodeId]: state }));
  };

  const getNodeMastery = (nodeId: string): MasteryState => {
    return nodeMastery[nodeId] ?? 'unplayed';
  };

  const crownedCount = Object.values(nodeMastery).filter(m => m === 'crowned').length;

  const recordArcadePlay = (gameId: string, xpEarned: number) => {
    setArcadePlayRecords(prev => {
      const existing = prev[gameId];
      const isToday = existing?.lastPlayDate === today();
      return {
        ...prev,
        [gameId]: {
          playsToday: isToday ? existing.playsToday + 1 : 1,
          xpEarned: isToday ? existing.xpEarned + xpEarned : xpEarned,
          lastPlayDate: today(),
        },
      };
    });
  };

  const getArcadePlaysToday = (gameId: string): number => {
    const record = arcadePlayRecords[gameId];
    if (!record || record.lastPlayDate !== today()) return 0;
    return record.playsToday;
  };

  const markJourneyNodeComplete = (nodeId: string) => {
    setCompletedJourneyNodes(prev => {
      if (prev.includes(nodeId)) return prev;
      return [...prev, nodeId];
    });
  };

  const isJourneyNodeCompleted = (nodeId: string): boolean => {
    return completedJourneyNodes.includes(nodeId);
  };

  const trackArcVisit = (arcId: string) => {
    setRecentArcIds(prev => {
      const filtered = prev.filter(id => id !== arcId);
      return [arcId, ...filtered].slice(0, 5); // Keep last 5 recent arcs
    });
  };

  const saveJourneyViewState = (state: JourneyViewState | null) => {
    setJourneyViewState(state);
  };

  // Onboarding functions
  const completeOnboarding = () => {
    setOnboardingComplete();
    setIsOnboarded(true);
  };

  const setSelectedGuide = (guideId: string) => {
    saveSelectedGuideId(guideId);
    setSelectedGuideIdState(guideId);
  };

  // Chapter intro tracking
  const markChapterIntroViewed = (chapterId: string) => {
    setViewedChapterIntros(prev => {
      if (prev.includes(chapterId)) return prev;
      return [...prev, chapterId];
    });
  };

  const hasViewedChapterIntro = (chapterId: string): boolean => {
    return viewedChapterIntros.includes(chapterId);
  };

  // Authentication functions
  const signIn = (userId: string, email: string, isNewUser: boolean) => {
    setAuthState({
      isAuthenticated: true,
      userId,
      email,
    });
    setIsAuthenticated(true);
    setUserEmail(email);

    if (isNewUser) {
      // Clear all localStorage for new users
      clearAllStorage();

      // Reset to blank state with new user ID
      setUser({
        ...mockUser,
        id: userId,
        xp: 0,
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
      });

      // Reset all progress data to empty
      setCompletedJourneyNodes([]);
      setNodeMasteryState({});
      setRecentArcIds([]);
      setJourneyViewState(null);
      setCompletedLessons(new Set());
      setArcadePlayRecords({});
      setViewedChapterIntros([]);
      setSelectedGuideIdState(null);
      // Reset badge state
      setEarnedBadges([]);
      setPerfectScoreCount(0);
      setBossNodesDefeated(0);
      setPlayedNodeTypes([]);
      setArcadeGamesPlayed(0);
      setTotalQuizAttempts(0);
      setTotalCorrectAnswers(0);
      setTotalQuestions(0);
      // Reset tooltips and study notes
      setSeenTooltips([]);
      setStudyNotes([]);
      // Reset funnel state (WW2 demo)
      setFunnelState(defaultFunnelState);

      // Reset to home tab
      setActiveTab('home');

      // Ensure onboarding shows
      setIsOnboarded(false);
    } else {
      // Existing user - just update the user ID
      setUser(prev => ({
        ...prev,
        id: userId,
      }));
    }
  };

  const signOut = () => {
    clearAuthState();
    clearAllStorage();
    setIsAuthenticated(false);
    setUserEmail(null);
    setIsOnboarded(false);
    setSelectedGuideIdState(null);
    setUser(mockUser);
    setCompletedJourneyNodes([]);
    setNodeMasteryState({});
    setRecentArcIds([]);
    setJourneyViewState(null);
    setCompletedLessons(new Set());
    setArcadePlayRecords({});
    setViewedChapterIntros([]);
    // Reset badge state
    setEarnedBadges([]);
    setPerfectScoreCount(0);
    setBossNodesDefeated(0);
    setPlayedNodeTypes([]);
    setArcadeGamesPlayed(0);
    setTotalQuizAttempts(0);
    setTotalCorrectAnswers(0);
    setTotalQuestions(0);
    // Reset tooltips and study notes
    setSeenTooltips([]);
    setStudyNotes([]);
    // Reset funnel state
    setFunnelState(defaultFunnelState);
  };

  // Badge functions
  const addEarnedBadge = (badge: EarnedBadge) => {
    setEarnedBadges(prev => {
      if (prev.some(b => b.badgeId === badge.badgeId)) return prev;
      return [...prev, badge];
    });
  };

  const markBadgeSeen = (badgeId: string) => {
    setEarnedBadges(prev =>
      prev.map(b => b.badgeId === badgeId ? { ...b, isNew: false } : b)
    );
  };

  const incrementPerfectScore = () => {
    setPerfectScoreCount(prev => prev + 1);
  };

  const incrementBossDefeated = () => {
    setBossNodesDefeated(prev => prev + 1);
  };

  const addPlayedNodeType = (nodeType: string) => {
    setPlayedNodeTypes(prev => {
      if (prev.includes(nodeType)) return prev;
      return [...prev, nodeType];
    });
  };

  const incrementArcadeGamesPlayed = () => {
    setArcadeGamesPlayed(prev => prev + 1);
  };

  const recordQuizResult = (correct: number, total: number) => {
    setTotalQuizAttempts(prev => prev + 1);
    setTotalCorrectAnswers(prev => prev + correct);
    setTotalQuestions(prev => prev + total);
  };

  // First-time tooltip functions
  const hasSeenTooltip = (tooltipId: string): boolean => {
    return seenTooltips.includes(tooltipId);
  };

  const markTooltipSeen = (tooltipId: string) => {
    setSeenTooltips(prev => {
      if (prev.includes(tooltipId)) return prev;
      return [...prev, tooltipId];
    });
  };

  // Study notes functions
  const addStudyNote = (note: Omit<StudyNote, 'id' | 'timestamp'>) => {
    const newNote: StudyNote = {
      ...note,
      id: `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setStudyNotes(prev => [newNote, ...prev]); // Add to front
  };

  const removeStudyNote = (noteId: string) => {
    setStudyNotes(prev => prev.filter(n => n.id !== noteId));
  };

  const clearStudyNotes = () => {
    setStudyNotes([]);
  };

  // Funnel state functions
  const isFunnelMode = funnelState.mode === 'funnel-ww2';

  const markWW2IntroViewed = () => {
    setFunnelState(prev => ({
      ...prev,
      ww2: {
        ...prev.ww2,
        hasViewedIntro: true,
      },
    }));
  };

  const updateGhostArmyProgress = (progress: Partial<GhostArmyProgress>) => {
    setFunnelState(prev => ({
      ...prev,
      ww2: {
        ...prev.ww2,
        ghostArmyProgress: {
          ...prev.ww2.ghostArmyProgress,
          ...progress,
        },
      },
    }));
  };

  const completeGhostArmy = () => {
    setFunnelState(prev => ({
      ...prev,
      ww2: {
        ...prev.ww2,
        ghostArmyProgress: {
          ...prev.ww2.ghostArmyProgress,
          completed: true,
        },
        unlockedStories: ['ww2-operation-fortitude', 'ww2-battle-bulge', 'ww2-d-day-deception'],
      },
    }));
  };

  const resetFunnelState = () => {
    setFunnelState(defaultFunnelState);
  };

  // Course progress tracking
  const markLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => {
      const newSet = new Set(prev);
      newSet.add(lessonId);
      return newSet;
    });
  };

  const isLessonCompleted = (lessonId: string): boolean => {
    return completedLessons.has(lessonId);
  };

  // Compute course progress from completed lessons (using live data)
  const courseProgress = useMemo(() => {
    const progressMap = new Map<string, CourseProgress>();

    liveCourses.forEach(course => {
      const courseUnits = getUnitsByCourseId(course.id);
      const courseLessons = courseUnits.flatMap(u => getLessonsByUnitId(u.id));
      const completedCount = courseLessons.filter(l => completedLessons.has(l.id)).length;
      const totalLessons = courseLessons.length;

      if (totalLessons > 0) {
        const percentComplete = Math.round((completedCount / totalLessons) * 100);

        // Find current position (first uncompleted lesson)
        let currentUnitId: string | undefined;
        let currentLessonId: string | undefined;

        for (const unit of courseUnits) {
          const unitLessons = getLessonsByUnitId(unit.id);
          for (const lesson of unitLessons) {
            if (!completedLessons.has(lesson.id)) {
              currentUnitId = unit.id;
              currentLessonId = lesson.id;
              break;
            }
          }
          if (currentLessonId) break;
        }

        progressMap.set(course.id, {
          courseId: course.id,
          unitsCompleted: courseUnits.filter(u => {
            const unitLessons = getLessonsByUnitId(u.id);
            return unitLessons.every(l => completedLessons.has(l.id));
          }).length,
          lessonsCompleted: completedCount,
          totalLessons,
          currentUnitId,
          currentLessonId,
          lastAccessedAt: new Date().toISOString(),
          percentComplete,
        });
      }
    });

    return progressMap;
  }, [completedLessons, liveCourses, getUnitsByCourseId, getLessonsByUnitId]);

  return (
    <AppContext.Provider value={{
      activeTab,
      setActiveTab,
      user,
      updateUser,
      addXP,
      incrementStreak,
      getRank,
      nodeMastery,
      setNodeMastery,
      getNodeMastery,
      crownedCount,
      arcadePlayRecords,
      recordArcadePlay,
      getArcadePlaysToday,
      completedJourneyNodes,
      markJourneyNodeComplete,
      isJourneyNodeCompleted,
      recentArcIds,
      trackArcVisit,
      journeyViewState,
      saveJourneyViewState,
      completedLessons,
      markLessonComplete,
      isLessonCompleted,
      courseProgress,
      isOnboarded,
      completeOnboarding,
      selectedGuideId,
      setSelectedGuide,
      viewedChapterIntros,
      markChapterIntroViewed,
      hasViewedChapterIntro,
      pendingLuckyNode,
      setPendingLuckyNode,
      pendingPearlHarbor,
      setPendingPearlHarbor,
      isHydrated,
      isAuthenticated,
      userEmail,
      signIn,
      signOut,
      // Badge system
      earnedBadges,
      addEarnedBadge,
      markBadgeSeen,
      perfectScoreCount,
      incrementPerfectScore,
      bossNodesDefeated,
      incrementBossDefeated,
      playedNodeTypes,
      addPlayedNodeType,
      arcadeGamesPlayed,
      incrementArcadeGamesPlayed,
      totalQuizAttempts,
      totalCorrectAnswers,
      totalQuestions,
      recordQuizResult,
      // First-time tooltips
      seenTooltips,
      hasSeenTooltip,
      markTooltipSeen,
      // Study notes
      studyNotes,
      addStudyNote,
      removeStudyNote,
      clearStudyNotes,
      // Funnel state (WW2 demo)
      funnelState,
      isFunnelMode,
      markWW2IntroViewed,
      updateGhostArmyProgress,
      completeGhostArmy,
      resetFunnelState,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

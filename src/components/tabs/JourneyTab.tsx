import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trophy, Flame, TrendingUp, Clock, Globe, Map, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { arcs, getArcById } from '@/data/journeyData';
import { getEraImageUrl } from '@/data/historicalEras';
import { subscribeToJourneyUIAssets, FirestoreJourneyUIAssets, subscribeToWW2ModuleAssets, FirestoreWW2ModuleAssets } from '@/lib/firestore';
import { CinematicVideoPlayer } from '@/components/journey/CinematicVideoPlayer';
import { useAudioContext } from '@/context/AudioContext';

// Load journey thumbnails from localStorage (synced with admin)
const JOURNEY_THUMBNAILS_KEY = 'hb_journey_thumbnails';
function loadJourneyThumbnails(): Record<string, string> {
  try {
    const stored = localStorage.getItem(JOURNEY_THUMBNAILS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

// Map arc IDs to era IDs for getting era images
const arcToEraMapping: Record<string, string> = {
  'world-war-2': 'ww2',
  'french-revolution': 'french-revolution',
  'ancient-rome': 'ancient-rome',
  'ancient-egypt': 'ancient-egypt',
  'cold-war': 'cold-war',
  'medieval-europe': 'medieval',
  'renaissance': 'renaissance',
  'world-war-1': 'ww1',
  'american-revolution': 'american-revolution',
  'civil-war': 'civil-war',
  'ancient-greece': 'ancient-greece',
  'industrial-revolution': 'industrial-revolution',
  'exploration': 'exploration',
  'vikings': 'vikings',
  'mesopotamia': 'mesopotamia',
};

// Get the image URL for an arc (uses era tile images)
function getArcImageUrl(arcId: string, journeyThumbnails: Record<string, string>): string | null {
  // First check if there's a custom journey thumbnail
  const customThumbnail = journeyThumbnails[arcId];
  if (customThumbnail && (customThumbnail.startsWith('http') || customThumbnail.startsWith('data:'))) {
    return customThumbnail;
  }

  // Otherwise use era tile image
  const eraId = arcToEraMapping[arcId];
  if (eraId) {
    return getEraImageUrl(eraId);
  }

  return null;
}
import { getHostById } from '@/data/hostsData';
import { Arc } from '@/types';
import { JourneyMap } from '@/components/journey/JourneyMap';
import { NodePlayer } from '@/components/journey/NodePlayer';
import { getRankInfo, getNextRankXP, RANK_DATA } from '@/types';
import { DiceButton } from '@/components/shared/DiceButton';
import { LuckyResultModal } from '@/components/shared/LuckyResultModal';
import { RandomResult } from '@/lib/randomizer';
import { WW2Intro } from '@/components/journey/WW2Intro';
import { GhostArmyTitleCard } from '@/components/journey/GhostArmyTitleCard';
import { GhostArmyStoryPlayer } from '@/components/journey/ghost-army';
import { FunnelCompletion } from '@/components/journey/FunnelCompletion';
import { WW2WorldMap } from '@/components/journey/ww2-map';
import {
  WW2HostSelection,
  WW2HostGreeting,
  WW2PathSelection,
  useWW2Preferences,
} from '@/components/journey/ww2';
import { PearlHarborModule, PearlHarborJourneyMap, PearlHarborLessonPlayer } from '@/components/journey/pearl-harbor';
import { usePearlHarborProgress } from '@/components/journey/pearl-harbor/hooks/usePearlHarborProgress';
import { getLessonById, PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';
import { WW2TheaterSelection } from '@/components/journey/ww2-theaters';
import { TrophyRoom } from '@/components/journey/trophy-room';
import { PantheonRoom } from '@/components/journey/pantheon';
import { getWW2HostById } from '@/data/ww2Hosts';
import { Play, Target } from 'lucide-react';

type JourneyView = 'landing' | 'arc' | 'node' | 'world-map' | 'ww2-entry' | 'ww2-theaters' | 'pearl-harbor' | 'pearl-harbor-journey' | 'pearl-harbor-lesson' | 'trophy-room' | 'pantheon';

export function JourneyTab() {
  const {
    user,
    completedJourneyNodes,
    recentArcIds,
    trackArcVisit,
    journeyViewState,
    saveJourneyViewState,
    pendingLuckyNode,
    setPendingLuckyNode,
    pendingPearlHarbor,
    setPendingPearlHarbor,
    pendingTrophyRoom,
    setPendingTrophyRoom,
    isFunnelMode,
    funnelState,
    markWW2IntroViewed,
    completeGhostArmy,
    totalQuizAttempts,
    totalCorrectAnswers,
    totalQuestions,
    bossNodesDefeated,
  } = useApp();
  const [view, setView] = useState<JourneyView>('landing');
  const [selectedArcId, setSelectedArcId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [journeyThumbnails, setJourneyThumbnails] = useState<Record<string, string>>({});
  const [journeyUIAssets, setJourneyUIAssets] = useState<FirestoreJourneyUIAssets | null>(null);
  const [ww2ModuleAssets, setWw2ModuleAssets] = useState<FirestoreWW2ModuleAssets | null>(null);

  // Track previous view for context-aware back navigation
  const [previousView, setPreviousView] = useState<JourneyView>('landing');
  // Track origin view for trophy room -> arc navigation
  const [arcOriginView, setArcOriginView] = useState<JourneyView>('landing');

  // Cinematic video state
  const [showCinematicVideo, setShowCinematicVideo] = useState(false);
  const [cinematicVideoUrl, setCinematicVideoUrl] = useState<string | null>(null);

  // Audio context for background music
  const { playModuleMusic, stopModuleMusic } = useAudioContext();

  // Pearl Harbor progress for resume functionality
  const {
    checkpoint: pearlHarborCheckpoint,
    hasResumableCheckpoint,
    getOverallProgress: getPearlHarborProgress,
    progress: pearlHarborProgress,
  } = usePearlHarborProgress();

  const selectedArc = selectedArcId ? getArcById(selectedArcId) : null;

  // Load thumbnails on mount
  useEffect(() => {
    setJourneyThumbnails(loadJourneyThumbnails());

    // Listen for storage changes (when admin updates thumbnails from different tab)
    const handleStorageChange = () => {
      setJourneyThumbnails(loadJourneyThumbnails());
    };

    // Listen for custom event (when admin updates thumbnails in same tab)
    const handleThumbnailsUpdated = (event: CustomEvent<Record<string, string>>) => {
      setJourneyThumbnails(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('journey-thumbnails-updated', handleThumbnailsUpdated as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('journey-thumbnails-updated', handleThumbnailsUpdated as EventListener);
    };
  }, []);

  // Subscribe to Firebase Journey UI Assets
  useEffect(() => {
    const unsubscribe = subscribeToJourneyUIAssets((assets) => {
      setJourneyUIAssets(assets);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to WW2 Module Assets (for theater media config)
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setWw2ModuleAssets(assets);
    });
    return () => unsubscribe();
  }, []);

  // Lucky dice state
  const [luckyResult, setLuckyResult] = useState<RandomResult | null>(null);
  const [showLuckyModal, setShowLuckyModal] = useState(false);
  const [isRerolling, setIsRerolling] = useState(false);

  // Funnel flow state
  const [showWW2Intro, setShowWW2Intro] = useState(false);
  const [showTitleCard, setShowTitleCard] = useState(false);
  const [showGhostArmyPlayer, setShowGhostArmyPlayer] = useState(false);
  const [showFunnelCompletion, setShowFunnelCompletion] = useState(false);
  const [completionStats, setCompletionStats] = useState<{ xp: number; correct: number; total: number } | null>(null);

  // WW2 Arc ID constant
  const WW2_ARC_ID = 'world-war-2';

  // WW2 Host Selection System
  const {
    hasSelectedHost,
    selectedHostId,
    isReturningUser,
    hasSeenWelcomeVideo,
    isLoading: isPreferencesLoading,
    selectHost,
    clearHostSelection,
    updateLastVisit,
    markWelcomeVideoSeen,
  } = useWW2Preferences();
  const [showWW2HostSelection, setShowWW2HostSelection] = useState(false);
  const [showWW2HostGreeting, setShowWW2HostGreeting] = useState(false);
  const [showWW2PathSelection, setShowWW2PathSelection] = useState(false);
  const [showWW2WelcomeVideo, setShowWW2WelcomeVideo] = useState(false);
  const [welcomeVideoEnded, setWelcomeVideoEnded] = useState(false);
  const [pendingHostId, setPendingHostId] = useState<string | null>(null);

  // Note: Auto-resume of Ghost Army disabled - user should explicitly select it

  const handleLuckyResult = (result: RandomResult) => {
    setLuckyResult(result);
    setShowLuckyModal(true);
  };

  const handleReroll = () => {
    setIsRerolling(true);
    setShowLuckyModal(false);
    setTimeout(() => setIsRerolling(false), 100);
  };

  const handleStartLuckyChallenge = () => {
    if (luckyResult) {
      // Find the chapter index
      const chapterIndex = luckyResult.arc.chapters.findIndex(c => c.id === luckyResult.chapter.id);

      setSelectedArcId(luckyResult.arc.id);
      setCurrentChapterIndex(chapterIndex >= 0 ? chapterIndex : 0);
      setSelectedChapterId(luckyResult.chapter.id);
      setSelectedNodeId(luckyResult.node.id);
      setView('node');
      setShowLuckyModal(false);

      trackArcVisit(luckyResult.arc.id);

      // Save view state
      saveJourneyViewState({
        view: 'node',
        arcId: luckyResult.arc.id,
        chapterId: luckyResult.chapter.id,
        nodeId: luckyResult.node.id,
        chapterIndex: chapterIndex >= 0 ? chapterIndex : 0,
      });
    }
  };

  // Check for pending lucky node (from HomeTab navigation)
  useEffect(() => {
    if (pendingLuckyNode) {
      setSelectedArcId(pendingLuckyNode.arcId);
      setCurrentChapterIndex(pendingLuckyNode.chapterIndex);
      setSelectedChapterId(pendingLuckyNode.chapterId);
      setSelectedNodeId(pendingLuckyNode.nodeId);
      setView('node');

      trackArcVisit(pendingLuckyNode.arcId);

      // Save view state
      saveJourneyViewState({
        view: 'node',
        arcId: pendingLuckyNode.arcId,
        chapterId: pendingLuckyNode.chapterId,
        nodeId: pendingLuckyNode.nodeId,
        chapterIndex: pendingLuckyNode.chapterIndex,
      });

      // Clear the pending node
      setPendingLuckyNode(null);
    }
  }, [pendingLuckyNode]);

  // Check for pending Pearl Harbor entry (from HomeTab JourneyCard)
  useEffect(() => {
    // Wait for preferences to load before processing
    if (isPreferencesLoading || !pendingPearlHarbor) return;

    // If user has selected a host, go directly to the Pearl Harbor journey
    if (hasSelectedHost && selectedHostId) {
      updateLastVisit();
      trackArcVisit(WW2_ARC_ID);
      setSelectedArcId(WW2_ARC_ID);
      setView('pearl-harbor-journey');
    } else {
      // No host selected - show host selection
      setShowWW2HostSelection(true);
    }
    // Clear flag AFTER navigation is set to avoid race condition
    setPendingPearlHarbor(false);
  }, [pendingPearlHarbor, hasSelectedHost, selectedHostId, isPreferencesLoading]);

  // Check for pending Trophy Room entry (from ProfileTab)
  useEffect(() => {
    if (pendingTrophyRoom) {
      setView('trophy-room');
      setPendingTrophyRoom(false);
    }
  }, [pendingTrophyRoom]);

  // Restore view state on mount
  useEffect(() => {
    if (journeyViewState && !pendingLuckyNode) {
      setView(journeyViewState.view);
      setSelectedArcId(journeyViewState.arcId);
      setSelectedChapterId(journeyViewState.chapterId);
      setSelectedNodeId(journeyViewState.nodeId);
      setCurrentChapterIndex(journeyViewState.chapterIndex);
    }
  }, []); // Only on mount

  const handleSelectArc = (arcId: string) => {
    // Special handling for WW2 arc - show host selection flow
    if (arcId === WW2_ARC_ID) {
      handleEnterWW2();
      return;
    }

    // Go directly to arc view - no forced intro or funnel
    trackArcVisit(arcId); // Track as recent
    setSelectedArcId(arcId);
    setCurrentChapterIndex(0);
    setArcOriginView('landing');
    setView('arc');

    // Save view state
    saveJourneyViewState({
      view: 'arc',
      arcId,
      chapterId: null,
      nodeId: null,
      chapterIndex: 0,
    });
  };

  // WW2 Entry Flow Handlers
  const handleEnterWW2 = () => {
    // Wait for preferences to load before deciding
    if (isPreferencesLoading) {
      // Will re-trigger when loading completes
      return;
    }

    if (hasSelectedHost && selectedHostId) {
      // User has selected a host - go directly to theaters
      updateLastVisit();
      trackArcVisit(WW2_ARC_ID);
      setSelectedArcId(WW2_ARC_ID);
      setView('ww2-theaters');
    } else {
      // No host selected - show host selection
      setShowWW2HostSelection(true);
    }
  };

  const handleWW2HostSelected = (hostId: string) => {
    selectHost(hostId);
    setShowWW2HostSelection(false);

    // Check if host has a welcome video AND user hasn't seen it yet
    const host = getWW2HostById(hostId);
    if (host?.welcomeVideoUrl && !hasSeenWelcomeVideo) {
      // Show welcome video first (only once ever)
      setPendingHostId(hostId);
      setShowWW2WelcomeVideo(true);
    } else {
      // No welcome video or already seen - go directly to theater selection
      trackArcVisit(WW2_ARC_ID);
      setSelectedArcId(WW2_ARC_ID);
      setView('ww2-theaters');
    }
  };

  const handleWW2WelcomeVideoEnd = () => {
    setShowWW2WelcomeVideo(false);
    setPendingHostId(null);

    // Mark welcome video as seen so it never plays again
    markWelcomeVideoSeen();

    // After welcome video, go to theater selection (not directly to Pearl Harbor)
    console.log('[WW2] Welcome video ended, going to theater selection');
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setView('ww2-theaters');
  };

  const handleCinematicComplete = () => {
    setShowCinematicVideo(false);
    setCinematicVideoUrl(null);
    enterPearlHarborJourney();
  };

  const enterPearlHarborJourney = () => {
    // Start background music if configured
    const musicUrl = ww2ModuleAssets?.theaterMedia?.['pearl-harbor']?.backgroundMusicUrl;
    const musicVolume = ww2ModuleAssets?.theaterMedia?.['pearl-harbor']?.backgroundMusicVolume ?? 0.1;
    if (musicUrl) {
      playModuleMusic('pearl-harbor', musicUrl, musicVolume);
    }

    // Navigate to Pearl Harbor journey
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setView('pearl-harbor-journey');
  };

  const handleWW2GreetingContinue = () => {
    updateLastVisit();
    setShowWW2HostGreeting(false);
    // Go to theater selection
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setView('ww2-theaters');
  };

  const handleWW2ChangeGuide = () => {
    clearHostSelection();
    setShowWW2HostGreeting(false);
    setShowWW2HostSelection(true);
  };

  // Handler for changing guide from theater selection
  const handleChangeGuideFromTheaters = () => {
    clearHostSelection();
    // This will trigger the guard that shows WW2HostSelection
    // when view is 'ww2-theaters' but no host is selected
  };

  const handleWW2SelectMap = () => {
    setShowWW2PathSelection(false);
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setPreviousView('ww2-theaters');
    setView('world-map');
  };

  const handleWW2SelectPearlHarbor = () => {
    setShowWW2PathSelection(false);
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setView('pearl-harbor');
  };

  const handleBackFromPearlHarbor = () => {
    stopModuleMusic(); // Stop background music when leaving
    setView('landing');
    setSelectedArcId(null);
  };

  // Handler to go back from theater selection
  const handleBackFromTheaterSelection = () => {
    setView('landing');
    setSelectedArcId(null);
  };

  // Handler to go to Pearl Harbor from theater selection
  const handleTheaterSelectPearlHarbor = () => {
    // Check for cinematic video before entering Pearl Harbor
    const theaterMedia = ww2ModuleAssets?.theaterMedia?.['pearl-harbor'];
    const cinematicUrl = theaterMedia?.cinematicVideoUrl;

    console.log('[PearlHarbor] Theater select - theaterMedia:', theaterMedia);
    console.log('[PearlHarbor] cinematicVideoUrl:', cinematicUrl);

    // Only show cinematic if user hasn't started Pearl Harbor yet
    const hasStartedPearlHarbor = pearlHarborProgress.completedActivities.length > 0 ||
      pearlHarborProgress.unlockedLessons.length > 0;

    if (cinematicUrl && !hasStartedPearlHarbor) {
      console.log('[PearlHarbor] Playing cinematic video (first time user)...');
      setCinematicVideoUrl(cinematicUrl);
      setShowCinematicVideo(true);
    } else {
      console.log('[PearlHarbor] Skipping cinematic (returning user or not configured), entering journey directly');
      enterPearlHarborJourney();
    }
  };

  // Handle selecting a Pearl Harbor lesson
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const handleSelectPearlHarborLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setView('pearl-harbor-lesson');
  };

  const handleBackFromPearlHarborLesson = () => {
    setSelectedLessonId(null);
    setView('pearl-harbor-journey');
  };

  const handlePearlHarborLessonComplete = () => {
    setSelectedLessonId(null);
    setView('pearl-harbor-journey');
  };

  // Handle resuming a Pearl Harbor lesson from checkpoint
  const handleResumePearlHarborLesson = () => {
    if (pearlHarborCheckpoint) {
      // Ensure we have a host selected first
      if (!hasSelectedHost || !selectedHostId) {
        setShowWW2HostSelection(true);
        return;
      }
      trackArcVisit(WW2_ARC_ID);
      setSelectedArcId(WW2_ARC_ID);
      setSelectedLessonId(pearlHarborCheckpoint.lessonId);
      setView('pearl-harbor-lesson');
    }
  };

  // Handle opening world map from Pearl Harbor journey
  const handleOpenWorldMapFromPearlHarbor = () => {
    setPreviousView('pearl-harbor-journey');
    setView('world-map');
  };

  const handleWW2PathBack = () => {
    setShowWW2PathSelection(false);
  };

  // Handle WW2 intro completion
  const handleWW2IntroBegin = () => {
    markWW2IntroViewed();
    setShowWW2Intro(false);
    setShowTitleCard(true);
  };

  // Handle title card completion - go to Ghost Army player
  const handleTitleCardComplete = () => {
    setShowTitleCard(false);
    setShowGhostArmyPlayer(true);
  };

  // Handle Ghost Army completion
  const handleGhostArmyComplete = (xp: number, stats: { correct: number; total: number }) => {
    completeGhostArmy();
    setShowGhostArmyPlayer(false);
    setCompletionStats({ xp, ...stats });
    setShowFunnelCompletion(true);
  };

  // Handle Ghost Army exit
  const handleGhostArmyExit = () => {
    setShowGhostArmyPlayer(false);
  };

  // Handle explore more after completion
  const handleExploreMore = () => {
    setShowFunnelCompletion(false);
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setCurrentChapterIndex(0);
    setView('arc');

    // Save view state
    saveJourneyViewState({
      view: 'arc',
      arcId: WW2_ARC_ID,
      chapterId: null,
      nodeId: null,
      chapterIndex: 0,
    });
  };

  const handleChapterChange = (index: number) => {
    setCurrentChapterIndex(index);
    // Update saved state
    if (selectedArcId) {
      saveJourneyViewState({
        view: 'arc',
        arcId: selectedArcId,
        chapterId: null,
        nodeId: null,
        chapterIndex: index,
      });
    }
  };

  const handleStartNode = (nodeId: string) => {
    if (!selectedArc) return;
    const chapter = selectedArc.chapters[currentChapterIndex];
    setSelectedChapterId(chapter.id);
    setSelectedNodeId(nodeId);
    setView('node');

    // Save view state
    saveJourneyViewState({
      view: 'node',
      arcId: selectedArc.id,
      chapterId: chapter.id,
      nodeId,
      chapterIndex: currentChapterIndex,
    });
  };

  const handleBackToLanding = () => {
    // Check if we came from trophy room and should go back there
    if (arcOriginView === 'trophy-room') {
      setView('trophy-room');
      setArcOriginView('landing'); // Reset for next time
    } else {
      setView('landing');
    }
    setSelectedArcId(null);
    setSelectedChapterId(null);
    setSelectedNodeId(null);
    saveJourneyViewState(null); // Clear saved state
  };

  const handleBackToArc = () => {
    setView('arc');
    setSelectedChapterId(null);
    setSelectedNodeId(null);
    // Update saved state
    if (selectedArcId) {
      saveJourneyViewState({
        view: 'arc',
        arcId: selectedArcId,
        chapterId: null,
        nodeId: null,
        chapterIndex: currentChapterIndex,
      });
    }
  };

  const handleNodeComplete = () => {
    // Go back to arc overview after completing a node
    handleBackToArc();
  };

  // Handle opening the WW2 World Map
  const handleOpenWorldMap = () => {
    setPreviousView('ww2-theaters');
    setView('world-map');
  };

  // Handle selecting a country from the world map
  const handleSelectCountry = (countryId: string) => {
    // For now, just log the selection - can be extended to launch country-specific modules
    console.log('Selected country:', countryId);
    // TODO: Connect to country-specific learning modules
  };

  // Handle back from world map - returns to where user came from
  const handleBackFromWorldMap = () => {
    setView(previousView);
  };

  // Render WW2 Intro if showing
  if (showWW2Intro) {
    return <WW2Intro onBegin={handleWW2IntroBegin} />;
  }

  // Render Title Card if showing
  if (showTitleCard) {
    return <GhostArmyTitleCard onComplete={handleTitleCardComplete} />;
  }

  // Render Ghost Army Story Player if showing
  if (showGhostArmyPlayer) {
    return (
      <GhostArmyStoryPlayer
        onComplete={handleGhostArmyComplete}
        onExit={handleGhostArmyExit}
      />
    );
  }

  // Render Funnel Completion if showing
  if (showFunnelCompletion && completionStats) {
    return (
      <FunnelCompletion
        xpEarned={completionStats.xp}
        stats={{ correct: completionStats.correct, total: completionStats.total }}
        onExploreMore={handleExploreMore}
      />
    );
  }

  // Render WW2 Host Selection if showing
  if (showWW2HostSelection) {
    return <WW2HostSelection onSelectHost={handleWW2HostSelected} onClose={() => setShowWW2HostSelection(false)} />;
  }

  // Render WW2 Welcome Video after host selection
  // Video plays and automatically proceeds to theater selection when finished
  if (showWW2WelcomeVideo && pendingHostId) {
    const host = getWW2HostById(pendingHostId);
    if (host?.welcomeVideoUrl) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4"
        >
          <video
            src={host.welcomeVideoUrl}
            autoPlay
            playsInline
            onEnded={() => {
              // Auto-proceed to theater selection when video ends
              setWelcomeVideoEnded(false);
              handleWW2WelcomeVideoEnd();
            }}
            className="max-w-full max-h-full w-auto h-auto"
          />
        </motion.div>
      );
    }
  }

  // Render Cinematic Video if showing
  if (showCinematicVideo && cinematicVideoUrl) {
    return (
      <CinematicVideoPlayer
        videoUrl={cinematicVideoUrl}
        onComplete={handleCinematicComplete}
        onSkip={handleCinematicComplete}
        showSkipButton={true}
        skipButtonDelay={3000}
      />
    );
  }

  // Render WW2 Host Greeting if showing
  if (showWW2HostGreeting && selectedHostId) {
    const host = getWW2HostById(selectedHostId);
    if (host) {
      return (
        <WW2HostGreeting
          host={host}
          onContinue={handleWW2GreetingContinue}
          onChangeGuide={handleWW2ChangeGuide}
        />
      );
    }
  }

  // Render WW2 Path Selection if showing
  if (showWW2PathSelection && selectedHostId) {
    const host = getWW2HostById(selectedHostId);
    if (host) {
      return (
        <WW2PathSelection
          host={host}
          onSelectMap={handleWW2SelectMap}
          onSelectPearlHarbor={handleWW2SelectPearlHarbor}
          onBack={handleWW2PathBack}
        />
      );
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="px-4 py-6"
          >
            {/* Page Header */}
            <div className="mb-6">
              {/* Kicker */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6 h-[1px] bg-ha-red" />
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-ha-red uppercase">
                  War Room • Active
                </span>
              </div>
              {/* Title */}
              <h1 className="font-display text-[28px] sm:text-[36px] font-bold text-off-white uppercase tracking-tight leading-none mb-2">
                The <span className="text-gold-2">Campaign.</span>
              </h1>
              {/* Subtitle */}
              <p className="text-off-white/60 text-[13px] sm:text-sm leading-relaxed">
                Choose your era. Master the history. Earn your place in the Pantheon.
              </p>
            </div>

            {/* Continue Where You Left Off - Shows when there's a resumable checkpoint */}
            {hasResumableCheckpoint() && pearlHarborCheckpoint && (
              <div className="mb-4">
                <button
                  onClick={handleResumePearlHarborLesson}
                  className="w-full relative p-3 sm:p-4 rounded-xl bg-ink-lift border border-success/30 hover:border-success/50 transition-all group text-left overflow-hidden"
                >
                  {/* Left accent bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-success rounded-l-xl" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-success/20 border border-success/30 flex items-center justify-center">
                      <Play size={20} className="text-success sm:w-6 sm:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-success font-medium mb-0.5">
                        Continue Where You Left Off
                      </p>
                      <h3 className="font-serif font-bold text-sm sm:text-base text-off-white truncate">
                        {getLessonById(pearlHarborCheckpoint.lessonId)?.title || 'Pearl Harbor Lesson'}
                      </h3>
                      <p className="font-mono text-[10px] sm:text-xs text-off-white/50">
                        In progress
                      </p>
                    </div>
                    <ArrowRight size={18} className="text-success group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
                  </div>
                </button>
              </div>
            )}

            {/* WW2/PEARL HARBOR HERO - Featured Card */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={() => {
                  // Wait for preferences to load
                  if (isPreferencesLoading) return;

                  trackArcVisit(WW2_ARC_ID);
                  setSelectedArcId(WW2_ARC_ID);
                  if (hasSelectedHost && selectedHostId) {
                    updateLastVisit();
                    setView('ww2-theaters');
                  } else {
                    setShowWW2HostSelection(true);
                  }
                }}
                className="w-full relative overflow-hidden rounded-xl border border-gold-2/20 text-left group min-h-[190px] sm:min-h-[240px]"
                style={{
                  background: `
                    radial-gradient(ellipse at 65% 35%, rgba(200,60,20,0.3) 0%, transparent 50%),
                    radial-gradient(ellipse at 30% 70%, rgba(100,60,30,0.3) 0%, transparent 55%),
                    linear-gradient(180deg, #2a1810 0%, #0a0604 60%, #050302 100%)
                  `
                }}
              >
                {/* Top gold accent bar */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-dp via-gold-br to-gold-dp z-10" />

                {/* Ship silhouette effect */}
                <div className="absolute right-[5%] bottom-[22%] w-[60%] h-[35%] opacity-50 z-[1]">
                  <div className="absolute bottom-0 left-[8%] right-[10%] h-[42%] bg-gradient-to-b from-[rgba(30,20,14,0.95)] to-[rgba(10,5,2,0.98)] rounded-sm" />
                </div>

                {/* Fire effect */}
                <div
                  className="absolute bottom-[45%] right-[30%] w-[6%] h-[10%] z-[3] blur-[3px] animate-pulse"
                  style={{ background: 'radial-gradient(ellipse, rgba(246,100,30,0.85), rgba(205,60,20,0.3) 50%, transparent)' }}
                />

                {/* Scrim overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-[rgba(5,3,2,0.4)] via-[rgba(5,3,2,0.6)] to-[rgba(5,3,2,0.95)] z-[4]" />

                {/* Grain texture */}
                <div className="absolute inset-0 opacity-35 mix-blend-overlay pointer-events-none z-[5]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='nmf'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.3 0 0 0 0 0.1 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23nmf)'/%3E%3C/svg%3E")` }}
                />

                <div className="relative z-10 p-4 sm:p-6 flex flex-col min-h-[190px] sm:min-h-[240px]">
                  {/* Featured badge */}
                  <div className="inline-flex items-center gap-1.5 self-start px-2 py-1 mb-3 border border-gold-2 rounded-sm bg-[rgba(20,14,8,0.55)] backdrop-blur-sm">
                    <span className="text-gold-2 text-[6px]">◆</span>
                    <span className="font-mono text-gold-2 text-[7.5px] sm:text-[9px] font-bold uppercase tracking-[0.28em]">Featured</span>
                  </div>

                  <h2 className="font-serif italic text-2xl sm:text-[44px] font-bold text-off-white leading-[0.95] tracking-[-0.018em] mb-1.5 sm:mb-2 drop-shadow-[0_3px_16px_rgba(0,0,0,0.8)]">
                    Pearl Harbor
                  </h2>
                  <p className="text-off-white/70 text-[11.5px] sm:text-sm leading-[1.35] mb-auto max-w-[280px] sm:max-w-[540px] drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                    December 7, 1941 — Experience the day that changed history
                  </p>

                  {/* Progress section */}
                  <div className="mt-4 sm:mt-6">
                    {/* Progress labels */}
                    <div className="flex justify-between items-center font-mono text-[8px] sm:text-[10px] tracking-[0.18em] text-off-white/50 uppercase font-semibold mb-1.5 sm:mb-2">
                      <span>{pearlHarborProgress.completedActivities.filter(id => id.startsWith('ph-beat-')).length} of {PEARL_HARBOR_LESSONS.length} lessons</span>
                      <span className="text-gold-2 font-bold text-[10px] sm:text-xs">{getPearlHarborProgress()}%</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-[3px] bg-off-white/15 rounded-sm overflow-visible mb-3 sm:mb-4">
                      <div
                        className="h-full bg-gradient-to-r from-gold-dp to-gold-br rounded-sm relative transition-all duration-500"
                        style={{ width: `${Math.max(getPearlHarborProgress(), 3)}%` }}
                      >
                        <div className="absolute right-[-3px] top-1/2 -translate-y-1/2 w-[7px] h-[7px] bg-gold-br rounded-full shadow-[0_0_10px_var(--gold)]" />
                      </div>
                    </div>

                    {/* Footer with meta + continue */}
                    <div className="flex justify-between items-center pt-2 sm:pt-3 border-t border-dashed border-off-white/10 gap-2 flex-wrap">
                      <div className="flex items-center gap-2 sm:gap-3 font-mono text-[8px] sm:text-[10px] tracking-[0.14em] text-off-white/50 uppercase font-semibold">
                        <span><span className="text-gold-2 font-bold">7</span> Lessons</span>
                        <span className="text-off-white/30">·</span>
                        <span><span className="text-gold-2 font-bold">~45</span> Min</span>
                        <span className="text-off-white/30">·</span>
                        <span><span className="text-gold-2 font-bold">+280</span> XP</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-display text-[10px] sm:text-xs tracking-[0.18em] text-gold-2 uppercase font-bold group-hover:gap-3 transition-all">
                        {getPearlHarborProgress() > 0 ? 'Continue' : 'Begin'}
                        <svg viewBox="0 0 24 24" className="w-[11px] h-[11px] sm:w-[14px] sm:h-[14px]" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14M13 6l6 6-6 6"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Progress Overview Section */}
            <ProgressOverview
              user={user}
              completedNodesCount={completedJourneyNodes.length}
              rankBadgeImages={journeyUIAssets?.rankBadgeImages}
              totalQuizAttempts={totalQuizAttempts}
              totalCorrectAnswers={totalCorrectAnswers}
              totalQuestions={totalQuestions}
              bossNodesDefeated={bossNodesDefeated}
            />

            {/* Trophy Room / Pantheon Row */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setView('trophy-room')}
              className="w-full mb-6 py-3 px-3.5 sm:py-3.5 sm:px-4 rounded-xl bg-card border border-gold-2/20 hover:bg-[#1C1C1C] hover:border-gold-2/30 transition-all group flex items-center gap-2.5 sm:gap-3.5"
            >
              {/* Circular gold icon */}
              <div
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-gold-2/30 flex-shrink-0 relative flex items-center justify-center"
                style={{ background: 'radial-gradient(circle at 30% 30%, rgba(230,171,42,0.35), rgba(40,28,16,0.9) 75%)' }}
              >
                {/* Inner gold sphere */}
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                  style={{ background: 'radial-gradient(circle at 35% 30%, var(--gold-br), var(--gold-dp) 60%)' }}
                />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="font-serif italic font-bold text-sm sm:text-[17px] text-off-white leading-none mb-0.5">The Pantheon</h3>
                <p className="font-mono text-[7px] sm:text-[8.5px] tracking-[0.26em] text-off-white/50 uppercase font-semibold">Your Souvenir Collection</p>
              </div>
              <div className="text-gold-2 flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 6l6 6-6 6"/>
                </svg>
              </div>
            </motion.button>

            {/* Trophy Room Button - Hidden, keeping Pantheon instead */}
            {/*
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setView('trophy-room')}
              className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all group relative overflow-hidden"
            >
              {journeyUIAssets?.trophyRoomImage && (
                <div className="absolute inset-0">
                  <img src={journeyUIAssets.trophyRoomImage} alt="" className="w-full h-full object-cover opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/70" />
                </div>
              )}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center overflow-hidden">
                    {journeyUIAssets?.trophyRoomIcon ? (
                      <img src={journeyUIAssets.trophyRoomIcon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Trophy size={20} className="text-amber-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">Trophy Room</h3>
                    <p className="text-xs text-white/60">View your era achievements</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>
            */}

            {/* Feeling Lucky Card - Hidden in funnel mode */}
            {!isFunnelMode && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <DiceButton
                    variant="card"
                    size="md"
                    onResult={handleLuckyResult}
                  />
                </motion.div>

                {/* Lucky Result Modal */}
                <LuckyResultModal
                  isOpen={showLuckyModal}
                  result={luckyResult}
                  onStartChallenge={handleStartLuckyChallenge}
                  onReroll={handleReroll}
                  onClose={() => setShowLuckyModal(false)}
                  isRerolling={isRerolling}
                />
              </>
            )}

            {/* Recently Played Section - Hidden in funnel mode */}
            {!isFunnelMode && recentArcIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="mb-3 relative pb-1.5">
                  <h2 className="font-serif italic font-bold text-xl sm:text-[28px] text-off-white leading-none tracking-[-0.015em]">
                    Recently <em className="text-gold-2">Played</em>
                  </h2>
                  <div className="absolute bottom-0 left-0 w-9 sm:w-12 h-[2px] bg-ha-red" />
                </div>
                <div className="flex flex-col gap-2 sm:gap-2.5">
                  {recentArcIds.map((arcId, index) => {
                    const arc = getArcById(arcId);
                    if (!arc) return null;
                    return (
                      <motion.div
                        key={arcId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ArcCard
                          arc={arc}
                          thumbnailUrl={getArcImageUrl(arcId, journeyThumbnails)}
                          onSelect={() => handleSelectArc(arcId)}
                          isRecent
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* All Eras */}
            <div>
              <div className="mb-3 relative pb-1.5">
                <h2 className="font-serif italic font-bold text-xl sm:text-[28px] text-off-white leading-none tracking-[-0.015em]">
                  All <em className="text-gold-2">Eras</em>
                </h2>
                <div className="absolute bottom-0 left-0 w-9 sm:w-12 h-[2px] bg-ha-red" />
              </div>
              <div className="flex flex-col gap-2 sm:gap-2.5">
                {arcs
                  .filter(arc => !recentArcIds.includes(arc.id))
                  .map((arc, index) => {
                    // All eras are now available - highlight WW2 as featured
                    const isWW2Featured = arc.id === WW2_ARC_ID;

                    return (
                      <motion.div
                        key={arc.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <ArcCard
                          arc={arc}
                          thumbnailUrl={getArcImageUrl(arc.id, journeyThumbnails)}
                          onSelect={() => handleSelectArc(arc.id)}
                          isHighlighted={isWW2Featured}
                        />
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}

        {view === 'arc' && selectedArc && (
          <motion.div
            key="arc"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-[calc(100vh-4rem)] relative"
          >
            <JourneyMap
              arc={selectedArc}
              currentChapterIndex={currentChapterIndex}
              onChapterChange={handleChapterChange}
              onSelectNode={handleStartNode}
              onBack={handleBackToLanding}
            />
            {/* WW2 World Map Button - only show for WW2 arc */}
            {selectedArc.id === WW2_ARC_ID && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleOpenWorldMap}
                className="fixed bottom-24 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-hc-red to-hc-red-dark text-white font-bold shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-shadow"
              >
                <Globe size={20} />
                <span>Explore Map</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {view === 'node' && selectedArc && selectedChapterId && selectedNodeId && (
          <motion.div
            key="node"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <NodePlayer
              arcId={selectedArc.id}
              chapterId={selectedChapterId}
              nodeId={selectedNodeId}
              onBack={handleBackToArc}
              onComplete={handleNodeComplete}
            />
          </motion.div>
        )}

        {view === 'world-map' && (
          <motion.div
            key="world-map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <WW2WorldMap
              onSelectCountry={handleSelectCountry}
              onBack={handleBackFromWorldMap}
            />
          </motion.div>
        )}

        {/* WW2 Theater Selection */}
        {view === 'ww2-theaters' && selectedHostId && (
          <motion.div
            key="ww2-theaters"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <WW2TheaterSelection
              host={getWW2HostById(selectedHostId)!}
              onBack={handleBackFromTheaterSelection}
              onSelectPearlHarbor={handleTheaterSelectPearlHarbor}
              onSelectWorldMap={handleOpenWorldMap}
              onChangeGuide={handleChangeGuideFromTheaters}
            />
          </motion.div>
        )}

        {/* Guard: If ww2-theaters or pearl-harbor views but no host, show host selection */}
        {(view === 'ww2-theaters' || view === 'pearl-harbor' || view === 'pearl-harbor-journey' || view === 'pearl-harbor-lesson') && !selectedHostId && (
          <WW2HostSelection onSelectHost={handleWW2HostSelected} onClose={() => setView('landing')} />
        )}

        {view === 'pearl-harbor' && selectedHostId && (
          <motion.div
            key="pearl-harbor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <PearlHarborModule
              host={getWW2HostById(selectedHostId)!}
              onBack={handleBackFromPearlHarbor}
            />
          </motion.div>
        )}

        {view === 'pearl-harbor-journey' && selectedHostId && (
          <motion.div
            key="pearl-harbor-journey"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <PearlHarborJourneyMap
              host={getWW2HostById(selectedHostId)!}
              onSelectLesson={handleSelectPearlHarborLesson}
              onOpenWorldMap={handleOpenWorldMapFromPearlHarbor}
              onBack={handleBackFromPearlHarbor}
            />
          </motion.div>
        )}

        {view === 'pearl-harbor-lesson' && selectedHostId && selectedLessonId && (
          <motion.div
            key="pearl-harbor-lesson"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen"
          >
            <PearlHarborLessonPlayer
              lessonId={selectedLessonId}
              host={getWW2HostById(selectedHostId)!}
              onComplete={handlePearlHarborLessonComplete}
              onBack={handleBackFromPearlHarborLesson}
            />
          </motion.div>
        )}

        {/* Trophy Room */}
        {view === 'trophy-room' && (
          <TrophyRoom
            onBack={() => setView('landing')}
            onSelectEra={(arcId) => {
              setSelectedArcId(arcId);
              setArcOriginView('trophy-room');
              setView('arc');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Arc Card Component
interface ArcCardProps {
  arc: Arc;
  onSelect: () => void;
  isContinue?: boolean;
  isRecent?: boolean;
  isHighlighted?: boolean;
  thumbnailUrl?: string | null;
}

function ArcCard({ arc, onSelect, isContinue, isRecent, isHighlighted, thumbnailUrl }: ArcCardProps) {
  const [imageError, setImageError] = useState(false);
  const hasValidThumbnail = !imageError && thumbnailUrl && (
    thumbnailUrl.startsWith('http://') ||
    thumbnailUrl.startsWith('https://') ||
    thumbnailUrl.startsWith('data:')
  );
  const host = getHostById(arc.hostId);
  const totalChapters = arc.chapters.length;
  const hasContent = totalChapters > 0;
  const isLocked = !hasContent;

  // Era-specific background gradients for circular thumbnails
  const eraBackgrounds: Record<string, string> = {
    'world-war-2': 'radial-gradient(ellipse at 50% 40%, rgba(200,60,20,0.3) 0%, transparent 60%), linear-gradient(135deg, #2a1410 0%, #0a0604 100%)',
    'french-revolution': 'radial-gradient(ellipse at 50% 40%, rgba(180,30,30,0.45) 0%, transparent 60%), linear-gradient(135deg, #2a1008 0%, #080402 100%)',
    'ancient-rome': 'radial-gradient(ellipse at 50% 40%, rgba(205,14,20,0.3) 0%, transparent 60%), linear-gradient(135deg, #2a1410 0%, #0a0604 100%)',
    'civil-war': 'radial-gradient(ellipse at 50% 40%, rgba(100,50,30,0.5) 0%, transparent 60%), linear-gradient(135deg, #1a1008 0%, #050302 100%)',
    'mesopotamia': 'radial-gradient(ellipse at 50% 40%, rgba(205,120,40,0.4) 0%, transparent 60%), linear-gradient(135deg, #2a1810 0%, #0a0604 100%)',
    'ancient-egypt': 'radial-gradient(ellipse at 50% 40%, rgba(230,171,42,0.4) 0%, transparent 60%), linear-gradient(135deg, #2a1a08 0%, #0a0604 100%)',
    'medieval-europe': 'radial-gradient(ellipse at 50% 40%, rgba(70,70,100,0.4) 0%, transparent 60%), linear-gradient(135deg, #15151c 0%, #050508 100%)',
    'ancient-greece': 'radial-gradient(ellipse at 50% 40%, rgba(220,190,140,0.3) 0%, transparent 60%), linear-gradient(135deg, #1a1808 0%, #050302 100%)',
    'cold-war': 'radial-gradient(ellipse at 50% 40%, rgba(60,80,120,0.4) 0%, transparent 60%), linear-gradient(135deg, #12141a 0%, #050608 100%)',
    'renaissance': 'radial-gradient(ellipse at 50% 40%, rgba(160,120,80,0.35) 0%, transparent 60%), linear-gradient(135deg, #1a1510 0%, #080604 100%)',
    'world-war-1': 'radial-gradient(ellipse at 50% 40%, rgba(120,90,60,0.4) 0%, transparent 60%), linear-gradient(135deg, #1a1410 0%, #080604 100%)',
    'american-revolution': 'radial-gradient(ellipse at 50% 40%, rgba(140,80,50,0.4) 0%, transparent 60%), linear-gradient(135deg, #1a1208 0%, #080502 100%)',
    'industrial-revolution': 'radial-gradient(ellipse at 50% 40%, rgba(100,100,100,0.4) 0%, transparent 60%), linear-gradient(135deg, #181818 0%, #080808 100%)',
    'exploration': 'radial-gradient(ellipse at 50% 40%, rgba(60,100,140,0.35) 0%, transparent 60%), linear-gradient(135deg, #101820 0%, #040608 100%)',
    'vikings': 'radial-gradient(ellipse at 50% 40%, rgba(100,120,140,0.35) 0%, transparent 60%), linear-gradient(135deg, #141820 0%, #060810 100%)',
  };

  const defaultBackground = 'radial-gradient(ellipse at 50% 40%, rgba(230,171,42,0.25) 0%, transparent 60%), linear-gradient(135deg, #1a1608 0%, #080604 100%)';

  return (
    <motion.button
      onClick={isLocked ? undefined : onSelect}
      disabled={isLocked}
      className={`w-full text-left py-3 px-3.5 sm:py-3.5 sm:px-4 rounded-xl border transition-all group min-h-[70px] sm:min-h-[80px] ${
        isLocked
          ? 'bg-card/50 border-gold-2/10 cursor-not-allowed opacity-55'
          : 'bg-card border-gold-2/20 hover:bg-[#1C1C1C] hover:border-gold-2/30'
      }`}
      whileHover={isLocked ? {} : { scale: 1.005 }}
      whileTap={isLocked ? {} : { scale: 0.995 }}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Circular Era Thumbnail */}
        <div
          className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full flex-shrink-0 relative overflow-hidden border border-gold-2/30 ${isLocked ? 'opacity-50' : ''}`}
          style={{ background: eraBackgrounds[arc.id] || defaultBackground }}
        >
          {hasValidThumbnail && (
            <img
              src={thumbnailUrl}
              alt={arc.title}
              className={`w-full h-full object-cover ${isLocked ? 'grayscale' : ''}`}
              onError={() => setImageError(true)}
            />
          )}
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,transparent_55%,rgba(0,0,0,0.55)_100%)] pointer-events-none" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className={`font-serif italic font-bold text-sm sm:text-[19px] leading-[1.1] tracking-[-0.005em] truncate ${isLocked ? 'text-off-white/40' : 'text-off-white'}`}>
            {arc.title}
          </h3>
          <p className={`text-[10.5px] sm:text-[12.5px] leading-[1.35] line-clamp-1 ${isLocked ? 'text-off-white/30' : 'text-off-white/70'}`}>
            {arc.description}
          </p>
          <div className={`flex items-center gap-1.5 sm:gap-2 mt-0.5 font-mono text-[7.5px] sm:text-[9px] tracking-[0.18em] uppercase font-bold ${isLocked ? 'text-off-white/30' : 'text-gold-dp'}`}>
            {host && (
              <>
                <svg viewBox="0 0 24 24" className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px]" fill="currentColor">
                  <circle cx="12" cy="8" r="4"/>
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span>{host.name}</span>
                <span className="text-off-white/30">·</span>
              </>
            )}
            {isLocked ? (
              <span className="text-gold-2/50 font-semibold">Coming Soon</span>
            ) : (
              <span className="text-off-white/50 font-semibold">
                {`${totalChapters} Chapter${totalChapters !== 1 ? 's' : ''}`}
              </span>
            )}
          </div>
        </div>

        {/* Circular Arrow Button */}
        {isLocked ? (
          <span className="text-off-white/30 text-base">🔒</span>
        ) : (
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gold-2/10 border border-gold-2/30 flex items-center justify-center flex-shrink-0 transition-all group-hover:bg-gold-2 group-hover:border-gold-2">
            <svg viewBox="0 0 24 24" className="w-[9px] h-[9px] sm:w-[11px] sm:h-[11px] text-gold-2 group-hover:text-void" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6"/>
            </svg>
          </div>
        )}
      </div>
    </motion.button>
  );
}

// Progress Overview Component
interface ProgressOverviewProps {
  user: { xp: number; streak: number };
  completedNodesCount: number;
  rankBadgeImages?: Record<string, string>;
  totalQuizAttempts: number;
  totalCorrectAnswers: number;
  totalQuestions: number;
  bossNodesDefeated: number;
}

const tierColors: Record<string, string> = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-300 to-cyan-500',
  diamond: 'from-blue-400 to-purple-500',
  legendary: 'from-amber-400 via-amber-200 to-amber-400',
};

function ProgressOverview({
  user,
  completedNodesCount,
  rankBadgeImages,
  totalQuizAttempts,
  totalCorrectAnswers,
  totalQuestions,
  bossNodesDefeated,
}: ProgressOverviewProps) {
  const rankInfo = getRankInfo(user.xp);
  const nextRank = getNextRankXP(user.xp);
  const progressToNext = nextRank.next
    ? ((user.xp - nextRank.current) / (nextRank.threshold - nextRank.current)) * 100
    : 100;
  const xpToNext = nextRank.next ? nextRank.threshold - user.xp : 0;

  // Count arcs with content available
  const arcsWithContent = arcs.filter(arc => arc.chapters.length > 0).length;

  // Calculate quiz accuracy
  const quizAccuracy = totalQuestions > 0
    ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
    : 0;

  // Get custom rank badge image if available
  const customRankBadge = rankBadgeImages?.[rankInfo.tier];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Section Header - "Your Campaign" with streak */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pt-4">
        <div className="flex-1">
          <h1 className="font-display text-lg sm:text-xl font-bold text-off-white uppercase tracking-[0.05em] relative inline-block">
            Your Campaign
            <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-ha-red" />
          </h1>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-ink-lift border border-gold-2/15">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gold-2">
            <path d="M12 2s1 3 3 5 3 4 3 7a6 6 0 1 1-12 0c0-2 1-4 2-5s2-3 2-5 1-2 2-2z"/>
          </svg>
          <span className="font-mono text-xs font-bold text-gold-2">{user.streak}</span>
        </div>
      </div>

      {/* Rank Card - matches design */}
      <div className="relative bg-ink-lift border border-gold-2/15 p-3 mb-1 overflow-hidden">
        {/* Left gold accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />

        <div className="flex items-center gap-2.5 ml-1">
          {/* Rank Badge - circular with gradient */}
          <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tierColors[rankInfo.tier]} flex items-center justify-center overflow-hidden flex-shrink-0`}>
            {customRankBadge ? (
              <img src={customRankBadge} alt={rankInfo.rank} className="w-full h-full object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="#1a1008" strokeWidth="1.8" className="w-4 h-4">
                <path d="M4 19V5l4 3 4-4 4 4 4-3v14z"/>
                <circle cx="12" cy="12" r="1.5" fill="#1a1008"/>
              </svg>
            )}
          </div>

          {/* Rank Info */}
          <div className="flex-1">
            <div className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.2em] text-off-white/50 font-semibold mb-0.5">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5 text-gold-2">
                <path d="M5 16L3 6l5 3 4-6 4 6 5-3-2 10z"/>
              </svg>
              Current Rank
            </div>
            <h2 className="font-display text-base font-bold text-gold-2 uppercase tracking-[0.01em] leading-none">{rankInfo.rank}</h2>
            <p className="font-mono text-[9px] text-off-white/50 mt-0.5 tracking-[0.1em]">{user.xp.toLocaleString()} XP</p>
          </div>
        </div>
      </div>

      {/* Rank Progress Bar - separate card below */}
      <div className="bg-ink-lift border border-gold-2/15 border-t-0 p-2.5 px-3.5 mb-4">
        <div className="flex justify-between font-mono text-[9px] text-off-white/50 mb-1.5 tracking-[0.1em] uppercase">
          <span>Progress to {nextRank.next || 'Max Rank'}</span>
          <span className="text-off-white/70">{nextRank.next ? `${xpToNext.toLocaleString()} XP to go` : 'Achieved!'}</span>
        </div>
        <div className="h-[3px] bg-off-white/[0.08] overflow-hidden">
          <motion.div
            className="h-full bg-gold-2"
            initial={{ width: 0 }}
            animate={{ width: `${progressToNext}%` }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>
      </div>

      {/* Stats Grid - 4 columns matching design */}
      <div className="grid grid-cols-4 gap-1.5">
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-gold-2">
              <path d="M7 4h10l1 5a6 6 0 0 1-12 0zM9 20h6M10 14v6M14 14v6"/>
            </svg>
          }
          value={arcsWithContent}
          label="Eras"
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-success">
              <path d="M4 18L10 12L14 16L20 6M15 6h5v5"/>
            </svg>
          }
          value={completedNodesCount}
          label="Nodes"
          iconColor="g"
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-gold-2">
              <circle cx="12" cy="12" r="9"/>
              <circle cx="12" cy="12" r="5"/>
              <circle cx="12" cy="12" r="1" fill="currentColor"/>
            </svg>
          }
          value={totalQuestions > 0 ? `${quizAccuracy}%` : '—'}
          label="Accu."
        />
        <StatCard
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-ha-red">
              <path d="M12 2s1 3 3 5 3 4 3 7a6 6 0 1 1-12 0c0-2 1-4 2-5s2-3 2-5 1-2 2-2z"/>
            </svg>
          }
          value={user.streak}
          label="Streak"
          iconColor="r"
        />
      </div>

      {/* Quiz Performance Card - Only show if user has answered questions */}
      {totalQuestions > 0 && (
        <div className="mt-4 p-3 sm:p-4 bg-ink-lift border border-off-white/[0.06]">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-gold-2" />
            <h3 className="font-display font-bold text-sm text-off-white uppercase tracking-[0.05em]">Quiz Performance</h3>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="font-display text-xl font-bold text-gold-2">{quizAccuracy}%</div>
              <div className="font-mono text-[8px] text-off-white/50 uppercase tracking-[0.15em] font-semibold">Accuracy</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-off-white">{totalCorrectAnswers}/{totalQuestions}</div>
              <div className="font-mono text-[8px] text-off-white/50 uppercase tracking-[0.15em] font-semibold">Correct</div>
            </div>
            <div>
              <div className="font-display text-xl font-bold text-gold-2">{totalQuizAttempts}</div>
              <div className="font-mono text-[8px] text-off-white/50 uppercase tracking-[0.15em] font-semibold">Quizzes</div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatCard({ icon, value, label, iconColor }: { icon: React.ReactNode; value: string | number; label: string; iconColor?: 'g' | 'r' }) {
  return (
    <div className="bg-ink-lift border border-gold-2/15 py-2.5 px-1.5 text-center relative">
      <div className="flex justify-center mb-1.5">{icon}</div>
      <div className="font-display font-bold text-xl text-off-white leading-none">{value}</div>
      <div className="font-mono text-[8px] text-off-white/50 uppercase tracking-[0.15em] font-semibold mt-1">{label}</div>
    </div>
  );
}

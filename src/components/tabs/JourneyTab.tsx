import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Trophy, Flame, TrendingUp, Clock, Globe, Map, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { arcs, getArcById } from '@/data/journeyData';

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
import { WW2TheaterSelection } from '@/components/journey/ww2-theaters';
import { TrophyRoom } from '@/components/journey/trophy-room';
import { PantheonRoom } from '@/components/journey/pantheon';
import { getWW2HostById } from '@/data/ww2Hosts';

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
    isFunnelMode,
    funnelState,
    markWW2IntroViewed,
    completeGhostArmy,
  } = useApp();
  const [view, setView] = useState<JourneyView>('landing');
  const [selectedArcId, setSelectedArcId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [journeyThumbnails, setJourneyThumbnails] = useState<Record<string, string>>({});

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
    selectHost,
    clearHostSelection,
    updateLastVisit,
  } = useWW2Preferences();
  const [showWW2HostSelection, setShowWW2HostSelection] = useState(false);
  const [showWW2HostGreeting, setShowWW2HostGreeting] = useState(false);
  const [showWW2PathSelection, setShowWW2PathSelection] = useState(false);
  const [showWW2WelcomeVideo, setShowWW2WelcomeVideo] = useState(false);
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
    if (pendingPearlHarbor) {
      // If user has selected a host, go to theater selection
      if (hasSelectedHost && selectedHostId) {
        updateLastVisit();
        trackArcVisit(WW2_ARC_ID);
        setSelectedArcId(WW2_ARC_ID);
        setView('ww2-theaters');
      } else {
        // New user - show host selection
        setShowWW2HostSelection(true);
      }
      // Clear flag AFTER navigation is set to avoid race condition
      setPendingPearlHarbor(false);
    }
  }, [pendingPearlHarbor, hasSelectedHost, selectedHostId]);

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
    if (hasSelectedHost && isReturningUser) {
      // Returning user with saved host - show greeting
      setShowWW2HostGreeting(true);
    } else if (hasSelectedHost) {
      // Has host but not returning - go to path selection
      updateLastVisit();
      setShowWW2PathSelection(true);
    } else {
      // New user - show host selection
      setShowWW2HostSelection(true);
    }
  };

  const handleWW2HostSelected = (hostId: string) => {
    selectHost(hostId);
    setShowWW2HostSelection(false);

    // Check if host has a welcome video
    const host = getWW2HostById(hostId);
    if (host?.welcomeVideoUrl) {
      // Show welcome video first
      setPendingHostId(hostId);
      setShowWW2WelcomeVideo(true);
    } else {
      // No welcome video, go directly to theater selection
      trackArcVisit(WW2_ARC_ID);
      setSelectedArcId(WW2_ARC_ID);
      setView('ww2-theaters');
    }
  };

  const handleWW2WelcomeVideoEnd = () => {
    setShowWW2WelcomeVideo(false);
    setPendingHostId(null);
    // Now go to theater selection
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setView('ww2-theaters');
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
    setView('world-map');
  };

  const handleWW2SelectPearlHarbor = () => {
    setShowWW2PathSelection(false);
    trackArcVisit(WW2_ARC_ID);
    setSelectedArcId(WW2_ARC_ID);
    setView('pearl-harbor');
  };

  const handleBackFromPearlHarbor = () => {
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
    setView('pearl-harbor-journey');
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

  // Handle opening world map from Pearl Harbor journey
  const handleOpenWorldMapFromPearlHarbor = () => {
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
    setView('landing');
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
    setView('world-map');
  };

  // Handle selecting a country from the world map
  const handleSelectCountry = (countryId: string) => {
    // For now, just log the selection - can be extended to launch country-specific modules
    console.log('Selected country:', countryId);
    // TODO: Connect to country-specific learning modules
  };

  // Handle back from world map
  const handleBackFromWorldMap = () => {
    // Return to theater selection
    setView('ww2-theaters');
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
    return <WW2HostSelection onSelectHost={handleWW2HostSelected} />;
  }

  // Render WW2 Welcome Video after host selection
  if (showWW2WelcomeVideo && pendingHostId) {
    const host = getWW2HostById(pendingHostId);
    if (host?.welcomeVideoUrl) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        >
          <video
            src={host.welcomeVideoUrl}
            autoPlay
            playsInline
            onEnded={handleWW2WelcomeVideoEnd}
            className="w-full h-full object-contain"
          />
          {/* Skip button */}
          <button
            onClick={handleWW2WelcomeVideoEnd}
            className="absolute bottom-8 right-8 px-6 py-3 rounded-full bg-white/20 backdrop-blur-sm text-white font-medium hover:bg-white/30 transition-colors"
          >
            Skip
          </button>
        </motion.div>
      );
    }
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
            {/* WW2/PEARL HARBOR HERO - Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <button
                onClick={() => {
                  trackArcVisit(WW2_ARC_ID);
                  setSelectedArcId(WW2_ARC_ID);
                  if (hasSelectedHost && selectedHostId) {
                    setView('ww2-theaters');
                  } else {
                    setShowWW2HostSelection(true);
                  }
                }}
                className="w-full relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-900/80 via-red-900/60 to-slate-900 border border-amber-500/30 p-4 sm:p-5 text-left group"
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl sm:text-3xl">🪖</span>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-400">Featured Journey</span>
                  </div>

                  <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white mb-1">
                    Pearl Harbor
                  </h2>
                  <p className="text-white/70 text-xs sm:text-sm mb-3 sm:mb-4">
                    December 7, 1941 — Experience the day that changed history
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-white/60">
                      <span>7 Lessons</span>
                      <span>•</span>
                      <span>~45 min</span>
                      <span>•</span>
                      <span className="text-amber-400">+280 XP</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 font-bold text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
                      Start Journey
                      <ArrowRight size={14} className="sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>
              </button>
            </motion.div>

            {/* Progress Overview Section */}
            <ProgressOverview user={user} completedNodesCount={completedJourneyNodes.length} />

            {/* Pantheon - Souvenir Collection */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setView('pantheon')}
              className="w-full mb-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/60 border border-white/10 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-slate-700/50 flex items-center justify-center text-xl sm:text-2xl">
                    🪖
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-sm sm:text-base text-white">The Pantheon</h3>
                    <p className="text-[10px] sm:text-xs text-white/60">Your souvenir collection</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-white/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all sm:w-5 sm:h-5" />
              </div>
            </motion.button>

            {/* Trophy Room Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setView('trophy-room')}
              className="w-full mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border border-amber-500/20 hover:border-amber-500/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Trophy size={20} className="text-amber-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white">Trophy Room</h3>
                    <p className="text-xs text-white/60">View your era achievements</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.button>

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
                <div className="mb-4">
                  <h2 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
                    <Clock size={12} />
                    Recently Played
                  </h2>
                  <div className="mt-2 w-12 h-[3px] bg-hc-red rounded-full" />
                </div>
                <div className="space-y-3">
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
                          thumbnailUrl={journeyThumbnails[arcId]}
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
              <div className="mb-4">
                <h2 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  All Eras
                </h2>
                <div className="mt-2 w-12 h-[3px] bg-hc-red rounded-full" />
              </div>
              <div className="space-y-3">
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
                          thumbnailUrl={journeyThumbnails[arc.id]}
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
                className="fixed bottom-24 right-4 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
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
          <WW2HostSelection onSelectHost={handleWW2HostSelected} />
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

        {/* Trophy Room View */}
        {view === 'trophy-room' && (
          <TrophyRoom
            onBack={() => setView('landing')}
            onSelectEra={(arcId) => {
              setSelectedArcId(arcId);
              setView('arc');
            }}
          />
        )}

        {/* Pantheon - Souvenir Collection */}
        {view === 'pantheon' && (
          <PantheonRoom onBack={() => setView('landing')} />
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
  thumbnailUrl?: string;
}

function ArcCard({ arc, onSelect, isContinue, isRecent, isHighlighted, thumbnailUrl }: ArcCardProps) {
  const hasValidThumbnail = thumbnailUrl && (
    thumbnailUrl.startsWith('http://') ||
    thumbnailUrl.startsWith('https://') ||
    thumbnailUrl.startsWith('data:')
  );
  const host = getHostById(arc.hostId);
  const totalChapters = arc.chapters.length;
  const hasContent = totalChapters > 0;

  // All eras are now unlocked and fully visible
  return (
    <motion.button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all ${
        isHighlighted
          ? 'bg-gold-primary/10 border-gold-primary/40 hover:bg-gold-primary/20 hover:border-gold-primary/60 shadow-lg shadow-gold-primary/20'
          : isRecent
          ? 'bg-gold-primary/5 border-gold-primary/20 hover:bg-gold-primary/10 hover:border-gold-primary/40'
          : isContinue
          ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
          : 'bg-card border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10'
      }`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden ${
          isHighlighted ? 'bg-gold-primary/30' : 'bg-primary/20'
        }`}>
          {hasValidThumbnail ? (
            <img src={thumbnailUrl} alt={arc.title} className="w-full h-full object-cover" />
          ) : (
            <Map size={28} className="text-primary/50" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-editorial font-bold text-lg truncate">{arc.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{arc.description}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {host && (
              <span className="flex items-center gap-1">
                <span>{host.avatar}</span>
                <span>{host.name}</span>
              </span>
            )}
            <span>
              {hasContent ? `${totalChapters} chapter${totalChapters !== 1 ? 's' : ''}` : 'Coming Soon'}
            </span>
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight size={20} className={`shrink-0 ${isHighlighted ? 'text-gold-primary' : 'text-muted-foreground'}`} />
      </div>

      {/* Progress bar for recent/continue */}
      {(isContinue || isRecent) && hasContent && (
        <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${isRecent ? 'bg-gradient-to-r from-gold-primary to-gold-highlight' : 'bg-primary'}`}
            initial={{ width: 0 }}
            animate={{ width: '33%' }}
            transition={{ delay: 0.2, duration: 0.5 }}
          />
        </div>
      )}
    </motion.button>
  );
}

// Progress Overview Component
interface ProgressOverviewProps {
  user: { xp: number; streak: number };
  completedNodesCount: number;
}

const tierColors: Record<string, string> = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-slate-300 to-slate-500',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-300 to-cyan-500',
  diamond: 'from-blue-400 to-purple-500',
  legendary: 'from-amber-400 via-amber-200 to-amber-400',
};

function ProgressOverview({ user, completedNodesCount }: ProgressOverviewProps) {
  const rankInfo = getRankInfo(user.xp);
  const nextRank = getNextRankXP(user.xp);
  const progressToNext = nextRank.next
    ? ((user.xp - nextRank.current) / (nextRank.threshold - nextRank.current)) * 100
    : 100;
  const xpToNext = nextRank.next ? nextRank.threshold - user.xp : 0;

  // Count arcs with content available
  const arcsWithContent = arcs.filter(arc => arc.chapters.length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h1 className="font-editorial text-xl sm:text-2xl font-bold">Your Journey</h1>
          <div className="mt-1 w-12 sm:w-16 h-[3px] bg-hc-red rounded-full" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-orange-500">
          <Flame size={16} className="fill-orange-500 sm:w-[18px] sm:h-[18px]" />
          <span className="font-bold text-sm sm:text-base">{user.streak}</span>
        </div>
      </div>

      {/* Rank Card */}
      <div className="p-3 sm:p-4 rounded-2xl bg-card border border-border mb-4">
        <div className="flex items-center gap-3 sm:gap-4 mb-3">
          {/* Rank Badge */}
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${tierColors[rankInfo.tier]} flex items-center justify-center`}>
            <span className="text-2xl sm:text-3xl">{rankInfo.icon}</span>
          </div>

          {/* Rank Info */}
          <div className="flex-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground mb-0.5">
              Current Rank
            </p>
            <h2 className="font-editorial text-lg sm:text-xl font-bold">{rankInfo.rank}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{user.xp.toLocaleString()} XP</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        {nextRank.next && (
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to {nextRank.next}</span>
              <span>{xpToNext.toLocaleString()} XP to go</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${tierColors[rankInfo.tier]} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
          </div>
        )}
        {!nextRank.next && (
          <div className="text-center py-2">
            <span className="text-sm text-primary font-medium">Max Rank Achieved!</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-2">
        <StatCard icon={<Trophy size={16} className="text-amber-500" />} value={arcsWithContent} label="Eras" />
        <StatCard icon={<TrendingUp size={16} className="text-green-500" />} value={completedNodesCount} label="Nodes" />
        <StatCard icon="👑" value="85%" label="Boss" />
        <StatCard icon={<Flame size={16} className="text-orange-500" />} value={user.streak} label="Days" />
      </div>
    </motion.div>
  );
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
  return (
    <div className="p-3 rounded-xl bg-card border border-border text-center">
      <div className="flex justify-center mb-1">{icon}</div>
      <div className="font-bold text-lg">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

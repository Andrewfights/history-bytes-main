/**
 * Beat 1: Why Pearl Harbor? The Road to War
 * Format: Interactive Map + Timed Challenge
 * XP: 45 | Duration: 4-5 min
 *
 * Narrative: Establishes WHY Pearl Harbor happened - American isolationism,
 * Japan's resource crisis, and diplomatic escalation.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Map, Clock, Sparkles } from 'lucide-react';
import { WW2Host } from '@/types';
import { InteractiveMap, MapHotspot, TimedChallenge, TimedQuestion, PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { subscribeToWW2ModuleAssets, type WW2BeatHotspotConfig, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { BEAT_1_DEFAULT_IMAGE } from '@/data/pearlHarborDefaults';
import { playXPSound } from '@/lib/xpAudioManager';

type Screen = 'pre-video' | 'intro' | 'map-explore' | 'timed-challenge' | 'reveal' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'map-explore', 'timed-challenge', 'reveal', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-1',
  xpReward: 45,
};

// Map hotspots data from PRD
const MAP_HOTSPOTS: MapHotspot[] = [
  {
    id: 'isolationism',
    x: 25,
    y: 40,
    label: 'American Isolationism',
    icon: '🇺🇸',
    pulseColor: 'rgb(59, 130, 246)',
    content: (
      <div className="space-y-3">
        <p><strong>88%</strong> of Americans opposed declaring war in January 1940.</p>
        <p>The <strong>America First Committee</strong> had over 800,000 members advocating for neutrality.</p>
        <p>The <strong>Neutrality Acts</strong> (1935-37) restricted arms sales to warring nations.</p>
        <p className="text-amber-400 text-xs mt-2">
          "The United States must be kept out of foreign wars at all costs."
        </p>
      </div>
    ),
  },
  {
    id: 'japan-resources',
    x: 75,
    y: 35,
    label: "Japan's Resource Crisis",
    icon: '🇯🇵',
    pulseColor: 'rgb(239, 68, 68)',
    content: (
      <div className="space-y-3">
        <p>Japan consumed <strong>32+ million barrels</strong> of oil annually but produced only 3 million domestically.</p>
        <p><strong>Over 80%</strong> of Japan's oil came from the United States.</p>
        <p><strong>74.1%</strong> of Japan's scrap iron imports came from the U.S.</p>
        <p className="text-amber-400 text-xs mt-2">
          Without American resources, Japan's military machine would grind to a halt.
        </p>
      </div>
    ),
  },
  {
    id: 'diplomatic-escalation',
    x: 50,
    y: 70,
    label: 'Diplomatic Escalation',
    icon: '⚡',
    pulseColor: 'rgb(251, 191, 36)',
    content: (
      <div className="space-y-3">
        <p><strong>July 26, 1941:</strong> U.S. freezes Japanese assets</p>
        <p><strong>August 1, 1941:</strong> Oil embargo begins</p>
        <p><strong>November 26, 1941:</strong> Hull Note demands complete withdrawal from China</p>
        <p><strong>December 1, 1941:</strong> Imperial Conference approves war</p>
        <p className="text-amber-400 text-xs mt-2">
          Admiral Yamamoto warned Japan could "run wild for six months" but would lose a prolonged war.
        </p>
      </div>
    ),
  },
];

// Timed challenge questions from PRD
const TIMED_QUESTIONS: TimedQuestion[] = [
  {
    id: 'q1',
    question: 'What percentage of Japan\'s oil came from the United States?',
    options: ['About 40%', 'About 60%', 'Over 80%', 'Nearly 100%'],
    correctIndex: 2,
    explanation: 'Japan depended on the U.S. for over 80% of its oil supply, making the 1941 oil embargo devastating.',
    category: 'Resources',
  },
  {
    id: 'q2',
    question: 'In January 1940, what percentage of Americans opposed declaring war?',
    options: ['52%', '68%', '78%', '88%'],
    correctIndex: 3,
    explanation: '88% of Americans opposed war in early 1940, showing the strength of isolationist sentiment.',
    category: 'Isolationism',
  },
  {
    id: 'q3',
    question: 'How many members did the America First Committee have?',
    options: ['100,000', '400,000', '800,000+', '2 million'],
    correctIndex: 2,
    explanation: 'The America First Committee had over 800,000 members. It disbanded 4 days after Pearl Harbor.',
    category: 'Isolationism',
  },
  {
    id: 'q4',
    question: 'What did the Hull Note (November 26, 1941) demand?',
    options: [
      'A peace treaty with China',
      'Complete Japanese withdrawal from China',
      'Limits on the Japanese Navy',
      'Return of Pacific islands'
    ],
    correctIndex: 1,
    explanation: 'The Hull Note demanded complete Japanese withdrawal from China and Indochina, which Japan viewed as an ultimatum.',
    category: 'Diplomacy',
  },
  {
    id: 'q5',
    question: 'When did the U.S. freeze Japanese assets?',
    options: ['January 1941', 'July 26, 1941', 'November 1941', 'December 1, 1941'],
    correctIndex: 1,
    explanation: 'The asset freeze on July 26, 1941, followed by the oil embargo, was a turning point toward war.',
    category: 'Diplomacy',
  },
];

interface RoadToWarBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function RoadToWarBeat({ host, onComplete, onSkip, onBack, isPreview = false }: RoadToWarBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [viewedHotspots, setViewedHotspots] = useState<Set<string>>(new Set());
  const [challengeScore, setChallengeScore] = useState(0);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());
  const [customHotspotConfig, setCustomHotspotConfig] = useState<WW2BeatHotspotConfig | null>(null);
  const [beatMediaImage, setBeatMediaImage] = useState<string | null>(null);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Subscribe to Firestore for custom hotspot config, beat media, and pre-module video
  useEffect(() => {
    console.log('[RoadToWarBeat] Setting up Firestore subscription for:', LESSON_DATA.id);
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      console.log('[RoadToWarBeat] Received assets:', assets);

      // Check for custom hotspot config
      if (assets?.customHotspots?.[LESSON_DATA.id]) {
        console.log('[RoadToWarBeat] Found custom hotspots:', assets.customHotspots[LESSON_DATA.id]);
        setCustomHotspotConfig(assets.customHotspots[LESSON_DATA.id]);
      }

      // Also check for beat media (uploaded in Media Assets section)
      const beatMedia = assets?.beatMedia?.[LESSON_DATA.id];
      if (beatMedia) {
        console.log('[RoadToWarBeat] Found beat media:', beatMedia);
        // Get the first available image from beatMedia
        const imageUrl = Object.values(beatMedia)[0];
        if (imageUrl) {
          setBeatMediaImage(imageUrl);
        }
      }

      // Check for pre-module video config
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      console.log('[RoadToWarBeat] Pre-module video check:', {
        lessonId: LESSON_DATA.id,
        allPreModuleVideos: assets?.preModuleVideos,
        thisLessonVideo: preModuleVideo,
        enabled: preModuleVideo?.enabled,
        videoUrl: preModuleVideo?.videoUrl,
      });
      if (preModuleVideo?.enabled) {
        console.log('[RoadToWarBeat] Found pre-module video:', preModuleVideo);
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        console.log('[RoadToWarBeat] No pre-module video - enabled:', preModuleVideo?.enabled);
        setPreModuleVideoConfig(null);
      }

      // Check for post-module video config
      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        console.log('[RoadToWarBeat] Found post-module video:', postModuleVideo);
        setPostModuleVideoConfig(postModuleVideo);
      } else {
        setPostModuleVideoConfig(null);
      }

      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // Set initial screen based on pre-module video availability (only on first load)
  useEffect(() => {
    if (hasLoadedConfig && screen === 'intro') {
      const checkpoint = getCheckpoint();
      // Only show pre-video if there's no checkpoint for THIS lesson (or isPreview) and video is configured
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  // Restore checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.viewedHotspots) {
          setViewedHotspots(new Set(checkpoint.state.viewedHotspots));
        }
        if (checkpoint.state?.challengeScore !== undefined) {
          setChallengeScore(checkpoint.state.challengeScore);
        }
      }
    }
  }, []);

  // Save checkpoint on screen change - only after config is loaded to avoid race condition
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {
          viewedHotspots: Array.from(viewedHotspots),
          challengeScore,
        },
      });
    }
  }, [screen, viewedHotspots, challengeScore, saveCheckpoint]);

  const nextScreen = useCallback((wasSkipped = false) => {
    if (wasSkipped) {
      setSkippedScreens((prev) => new Set([...prev, screen]));
    }
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextScreenIndex = currentIndex + 1;
      // Skip post-video if not configured
      if (SCREENS[nextScreenIndex] === 'post-video' && !postModuleVideoConfig?.enabled) {
        nextScreenIndex++;
      }
      if (nextScreenIndex < SCREENS.length) {
        setScreen(SCREENS[nextScreenIndex]);
      } else {
        clearCheckpoint();
        const earnedXP = skippedScreens.size === 0 ? LESSON_DATA.xpReward : 0;
        onComplete(earnedXP);
      }
    } else {
      clearCheckpoint();
      const earnedXP = skippedScreens.size === 0 ? LESSON_DATA.xpReward : 0;
      onComplete(earnedXP);
    }
  }, [screen, skippedScreens, clearCheckpoint, onComplete, postModuleVideoConfig]);

  const handleHotspotView = (id: string) => {
    setViewedHotspots((prev) => new Set([...prev, id]));
  };

  const handleAllHotspotsViewed = () => {
    // All hotspots viewed, can proceed
  };

  const handleChallengeComplete = (score: number, total: number) => {
    setChallengeScore(score);
    nextScreen();
  };

  // Convert custom hotspots from Firestore to MapHotspot format
  const customMapHotspots: MapHotspot[] = customHotspotConfig?.hotspots?.map((h) => ({
    id: h.id,
    x: h.x,
    y: h.y,
    label: h.label,
    icon: '📍', // Default icon for custom hotspots
    pulseColor: 'rgb(251, 191, 36)', // Amber color
    content: (
      <div className="space-y-3">
        {h.description && <p>{h.description}</p>}
        {h.revealFact && (
          <p className="text-amber-400 text-xs mt-2">{h.revealFact}</p>
        )}
        {!h.description && !h.revealFact && (
          <p className="text-white/60 italic">No description added</p>
        )}
      </div>
    ),
  })) || [];

  // Use custom hotspots if available and has at least one, otherwise use defaults
  const activeHotspots = customMapHotspots.length > 0 ? customMapHotspots : MAP_HOTSPOTS;

  const allHotspotsViewed = viewedHotspots.size >= activeHotspots.length;

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Why Pearl Harbor?</h1>
          <p className="text-white/50 text-xs">Beat 1 of 10</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-xl">
          🎖️
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Why Pearl Harbor?"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO SCREEN */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col items-center text-center min-h-full">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
                  >
                    <Map size={40} className="text-amber-400" />
                  </motion.div>

                  <h2 className="text-2xl font-bold text-white mb-4">
                    The Road to War
                  </h2>

                  <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                    Pearl Harbor wasn't a random act of aggression. It was the culmination of decades of geopolitical tension between two nations on a collision course.
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10">
                    <p className="text-white/80 text-sm italic">
                      "In January 1940, 88% of Americans opposed war. By December 8, 1941, 97% approved it. What changed everything?"
                    </p>
                  </div>

                  {/* Spacer for scroll padding */}
                  <div className="h-8 flex-shrink-0" />
                </div>
              </div>

              {/* Fixed bottom CTA */}
              <div className="flex-shrink-0 p-6 pt-4 bg-gradient-to-t from-void via-void/95 to-transparent space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Explore the Map
                </button>
                <button
                  onClick={() => {
                    nextScreen(true);
                    onSkip();
                  }}
                  className="w-full py-3 text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* MAP EXPLORE SCREEN */}
          {screen === 'map-explore' && (
            <motion.div
              key="map-explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-4"
            >
              <div className="mb-4 text-center">
                <h2 className="text-lg font-bold text-white mb-1">
                  Explore the Converging Paths
                </h2>
                <p className="text-white/60 text-sm">
                  Tap each hotspot to understand why war became inevitable
                </p>
              </div>

              <div className="flex-1">
                <InteractiveMap
                  mapImage={customHotspotConfig?.imageUrl || beatMediaImage || BEAT_1_DEFAULT_IMAGE}
                  hotspots={activeHotspots}
                  viewedHotspots={viewedHotspots}
                  onHotspotView={handleHotspotView}
                  onAllHotspotsViewed={handleAllHotspotsViewed}
                />
              </div>

              <div className="mt-4" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  disabled={!allHotspotsViewed}
                  className={`w-full py-4 font-bold rounded-xl transition-colors ${
                    allHotspotsViewed
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
                >
                  {allHotspotsViewed ? 'Continue to Challenge' : `Explore ${activeHotspots.length - viewedHotspots.size} more`}
                </button>
              </div>
            </motion.div>
          )}

          {/* TIMED CHALLENGE SCREEN */}
          {screen === 'timed-challenge' && (
            <motion.div
              key="timed-challenge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <TimedChallenge
                questions={TIMED_QUESTIONS}
                timeLimit={60}
                onComplete={handleChallengeComplete}
                showStreak
                showProgress
              />
            </motion.div>
          )}

          {/* REVEAL SCREEN */}
          {screen === 'reveal' && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6"
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-8 shadow-lg shadow-amber-500/30"
                >
                  <Sparkles size={56} className="text-white" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-6 text-center">
                  The Transformation
                </h2>

                <div className="bg-gradient-to-r from-red-500/10 via-white/5 to-blue-500/10 rounded-2xl p-6 border border-white/10 max-w-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-center">
                      <p className="text-red-400 text-3xl font-bold">88%</p>
                      <p className="text-white/50 text-xs">Opposed War</p>
                      <p className="text-white/30 text-xs">January 1940</p>
                    </div>
                    <ArrowRight className="text-amber-400" size={32} />
                    <div className="text-center">
                      <p className="text-green-400 text-3xl font-bold">97%</p>
                      <p className="text-white/50 text-xs">Approved War</p>
                      <p className="text-white/30 text-xs">December 8, 1941</p>
                    </div>
                  </div>

                  <p className="text-white/70 text-center text-sm">
                    In less than two years, American public opinion underwent the most dramatic shift in history.
                  </p>
                </div>

                <p className="text-amber-400 text-center mt-6 font-medium">
                  What changed everything? Let's find out...
                </p>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Complete Beat 1
                </button>
              </div>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Why Pearl Harbor? The Road to War"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION SCREEN */}
          {screen === 'completion' && (
            <XPCompletionScreen
              beatNumber={1}
              beatTitle="Why Pearl Harbor?"
              xpEarned={skippedScreens.size === 0 ? LESSON_DATA.xpReward : 0}
              host={host}
              onContinue={() => nextScreen()}
              nextBeatPreview="The Radar Blip - Step into the shoes of Private Lockard"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Empty War Chest Beat - America's Unpreparedness for War
 * Beat 7 in the Master Script
 *
 * Covers:
 * - America's shocking lack of military preparedness in 1941
 * - Side-by-side comparisons: US vs Germany/Japan
 * - The Louisiana Maneuvers training operation
 * - How leaders like Eisenhower and Patton emerged
 *
 * XP: 50 | Duration: 5-6 min
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Sparkles, ChevronRight, AlertTriangle, Target, Users, Zap } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import {
  subscribeToWW2ModuleAssets,
  type PreModuleVideoConfig,
  type PostModuleVideoConfig,
} from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'pre-video' | 'intro' | 'comparison' | 'maneuvers' | 'leaders' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'comparison', 'maneuvers', 'leaders', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-7',
  xpReward: 50,
};

// Comparison data: US vs Axis powers
const COMPARISON_STATS = [
  {
    category: 'Modern Tanks',
    us: { value: '17', label: 'United States' },
    axis: { value: '3,000', label: 'Germany' },
    icon: '🛡️',
    description: 'America had only 17 modern tanks compared to Germany\'s 3,000.',
  },
  {
    category: 'Combat Aircraft',
    us: { value: 'Older models', label: 'United States' },
    axis: { value: 'A6M Zero', label: 'Japan' },
    icon: '✈️',
    description: 'Japan fielded modern, battle-tested fighters with superior range and maneuverability.',
  },
  {
    category: 'Rifles',
    us: { value: '1.5M', label: 'for 2M soldiers' },
    axis: { value: '18M', label: 'for 7M troops' },
    icon: '🔫',
    description: 'The US Army had just 1.5 million rifles for nearly 2 million soldiers.',
  },
  {
    category: 'Ammunition',
    us: { value: '<1 month', label: 'supply' },
    axis: { value: 'Stockpiled', label: 'reserves' },
    icon: '💥',
    description: 'America didn\'t have enough bullets to last a single month of combat.',
  },
];

// Louisiana Maneuvers facts
const MANEUVERS_FACTS = [
  {
    title: '400,000 Troops',
    description: 'The largest military training exercise in American history at the time.',
    icon: '👥',
  },
  {
    title: 'Mock Weapons',
    description: 'Some units improvised with trucks labeled "TANK" due to equipment shortages.',
    icon: '🚛',
  },
  {
    title: 'Exposed Weaknesses',
    description: 'Unreliable radios, broken supply lines, and severe equipment shortages.',
    icon: '⚠️',
  },
  {
    title: 'Future Leaders',
    description: 'Proving ground for Dwight D. Eisenhower and George S. Patton.',
    icon: '⭐',
  },
];

interface EmptyWarChestBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function EmptyWarChestBeat({ host, onComplete, onSkip, onBack, isPreview = false }: EmptyWarChestBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [viewedStats, setViewedStats] = useState<Set<number>>(new Set());
  const [viewedFacts, setViewedFacts] = useState<Set<number>>(new Set());
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Restore checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.viewedStats) {
          setViewedStats(new Set(checkpoint.state.viewedStats));
        }
        if (checkpoint.state?.viewedFacts) {
          setViewedFacts(new Set(checkpoint.state.viewedFacts));
        }
      }
    }
  }, []);

  // Save checkpoint on screen change
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {
          viewedStats: Array.from(viewedStats),
          viewedFacts: Array.from(viewedFacts),
        },
      });
    }
  }, [hasLoadedConfig, screen, viewedStats, viewedFacts, saveCheckpoint]);

  // Subscribe to Firestore for pre/post module videos
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }

      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        setPostModuleVideoConfig(postModuleVideo);
      } else {
        setPostModuleVideoConfig(null);
      }

      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // Set initial screen based on pre-module video availability
  useEffect(() => {
    if (hasLoadedConfig && screen === 'intro') {
      const checkpoint = getCheckpoint();
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  const nextScreen = useCallback(() => {
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
        onComplete(skipped ? 0 : LESSON_DATA.xpReward);
      }
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig]);

  const handleSkip = () => {
    setSkipped(true);
    onSkip();
  };

  const handleViewStat = (index: number) => {
    setViewedStats(prev => new Set(prev).add(index));
  };

  const handleViewFact = (index: number) => {
    setViewedFacts(prev => new Set(prev).add(index));
  };

  const allStatsViewed = viewedStats.size >= COMPARISON_STATS.length;
  const allFactsViewed = viewedFacts.size >= MANEUVERS_FACTS.length;

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">An Empty War Chest</h1>
          <p className="text-white/50 text-xs">America's Unpreparedness</p>
        </div>
        <button
          onClick={handleSkip}
          className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
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
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="An Empty War Chest"
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
              className="flex flex-col h-full p-6"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
                >
                  <AlertTriangle size={40} className="text-red-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  A Nation Unprepared
                </h2>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/70 text-sm leading-relaxed">
                    When U.S. military leadership took a look under the hood after Pearl Harbor, they panicked. In almost every way imaginable, the country was <span className="text-red-400 font-semibold">not prepared</span> for the kind of war being waged across the pond.
                  </p>
                </div>

                <p className="text-white/50 text-sm max-w-xs">
                  Discover just how far behind America was — and what they did about it.
                </p>
              </div>

              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={nextScreen}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  See the Numbers
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* COMPARISON SCREEN - US vs Axis */}
          {screen === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white text-center">US vs. Axis Powers</h2>
                <p className="text-white/50 text-xs text-center mt-1">Tap each category to reveal the gap</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {COMPARISON_STATS.map((stat, index) => {
                    const isViewed = viewedStats.has(index);
                    return (
                      <motion.button
                        key={stat.category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleViewStat(index)}
                        className={`w-full text-left rounded-xl overflow-hidden transition-all ${
                          isViewed ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-center gap-3 p-4">
                          <span className="text-2xl">{stat.icon}</span>
                          <span className="font-bold text-white flex-1">{stat.category}</span>
                          {isViewed && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-green-400 text-xs"
                            >
                              ✓
                            </motion.span>
                          )}
                        </div>

                        {/* Comparison (shown when viewed) */}
                        <AnimatePresence>
                          {isViewed && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-white/10"
                            >
                              <div className="grid grid-cols-2 gap-2 p-4">
                                {/* US Side */}
                                <div className="bg-blue-500/20 rounded-lg p-3 text-center border border-blue-500/30">
                                  <p className="text-blue-400 text-xs font-medium mb-1">USA</p>
                                  <p className="text-white font-bold text-lg">{stat.us.value}</p>
                                  <p className="text-white/50 text-xs">{stat.us.label}</p>
                                </div>
                                {/* Axis Side */}
                                <div className="bg-red-500/20 rounded-lg p-3 text-center border border-red-500/30">
                                  <p className="text-red-400 text-xs font-medium mb-1">AXIS</p>
                                  <p className="text-white font-bold text-lg">{stat.axis.value}</p>
                                  <p className="text-white/50 text-xs">{stat.axis.label}</p>
                                </div>
                              </div>
                              <p className="text-white/60 text-sm px-4 pb-4">{stat.description}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Continue button */}
              <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/50 text-sm">Progress</span>
                  <span className="text-amber-400 text-sm font-medium">{viewedStats.size}/{COMPARISON_STATS.length}</span>
                </div>
                <button
                  onClick={nextScreen}
                  disabled={!allStatsViewed}
                  className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    allStatsViewed
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  {allStatsViewed ? (
                    <>
                      Continue
                      <ChevronRight size={20} />
                    </>
                  ) : (
                    `View all ${COMPARISON_STATS.length} categories`
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* LOUISIANA MANEUVERS SCREEN */}
          {screen === 'maneuvers' && (
            <motion.div
              key="maneuvers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-bold text-white text-center">The Louisiana Maneuvers</h2>
                <p className="text-white/50 text-xs text-center mt-1">America's desperate attempt to prepare</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {/* Intro card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl p-4 border border-amber-500/30 mb-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                      <Target size={20} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-1">Training for Modern War</h3>
                      <p className="text-white/70 text-sm">
                        The Army launched a massive training operation across Louisiana and East Texas to simulate the fast-moving, mechanized combat unfolding in Europe.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Facts grid */}
                <div className="grid grid-cols-2 gap-3">
                  {MANEUVERS_FACTS.map((fact, index) => {
                    const isViewed = viewedFacts.has(index);
                    return (
                      <motion.button
                        key={fact.title}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleViewFact(index)}
                        className={`text-left p-4 rounded-xl transition-all ${
                          isViewed
                            ? 'bg-green-500/20 border border-green-500/30'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl mb-2 block">{fact.icon}</span>
                        <h4 className={`font-bold text-sm mb-1 ${isViewed ? 'text-green-400' : 'text-white'}`}>
                          {fact.title}
                        </h4>
                        {isViewed && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-white/60 text-xs"
                          >
                            {fact.description}
                          </motion.p>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Key takeaway */}
                {allFactsViewed && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 bg-white/5 rounded-xl p-4 border border-white/10"
                  >
                    <p className="text-white/70 text-sm italic">
                      "The take-away was clear: America still had a long way to go before it was ready to fight a modern, global war. And not a lot of time."
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Continue button */}
              <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/50 text-sm">Discovered</span>
                  <span className="text-amber-400 text-sm font-medium">{viewedFacts.size}/{MANEUVERS_FACTS.length}</span>
                </div>
                <button
                  onClick={nextScreen}
                  disabled={!allFactsViewed}
                  className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    allFactsViewed
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  {allFactsViewed ? (
                    <>
                      Continue
                      <ChevronRight size={20} />
                    </>
                  ) : (
                    `Tap all ${MANEUVERS_FACTS.length} facts`
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* LEADERS SCREEN */}
          {screen === 'leaders' && (
            <motion.div
              key="leaders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
                >
                  <Users size={40} className="text-amber-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  A Proving Ground
                </h2>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/70 text-sm leading-relaxed mb-4">
                    While the exercises exposed America's weaknesses, they also became a proving ground for future leaders who would help turn the tide of war.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                      <span className="text-2xl mb-1 block">⭐</span>
                      <p className="text-amber-400 font-bold text-sm">Dwight D. Eisenhower</p>
                      <p className="text-white/50 text-xs">Future Supreme Commander</p>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                      <span className="text-2xl mb-1 block">⭐</span>
                      <p className="text-amber-400 font-bold text-sm">George S. Patton</p>
                      <p className="text-white/50 text-xs">Legendary Tank Commander</p>
                    </div>
                  </div>
                </div>

                <p className="text-white/50 text-sm max-w-xs">
                  From these humble beginnings, America would build the most powerful military force in history.
                </p>
              </div>

              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={nextScreen}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="An Empty War Chest"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION SCREEN */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6 items-center justify-center"
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-6"
              >
                🎖️
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">Lesson Complete!</h2>
              <p className="text-white/60 mb-6">An Empty War Chest</p>

              {/* Summary */}
              <div className="bg-white/5 rounded-2xl p-4 mb-6 border border-white/10 max-w-sm">
                <h3 className="font-bold text-white mb-2">Key Takeaways:</h3>
                <ul className="text-white/70 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-red-400">•</span>
                    America was drastically unprepared for modern warfare in 1941
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    The Louisiana Maneuvers exposed critical weaknesses
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">•</span>
                    Future leaders emerged from this proving ground
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">
                  +{skipped ? 0 : LESSON_DATA.xpReward} XP
                </span>
              </div>

              <p className="text-white/50 text-sm text-center max-w-sm mb-6">
                Next: Arsenal of Democracy — See how America transformed into a production powerhouse
              </p>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={nextScreen}
                  className="w-full max-w-sm py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default EmptyWarChestBeat;

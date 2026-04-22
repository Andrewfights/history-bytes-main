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
              className="flex flex-col h-full relative overflow-hidden"
            >
              {/* Red atmospheric background */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 50% 40%, rgba(205,14,20,0.12) 0%, transparent 55%),
                    radial-gradient(ellipse at 30% 80%, rgba(60,30,20,0.2) 0%, transparent 55%),
                    linear-gradient(180deg, #140604 0%, #080302 50%, #020100 100%)
                  `
                }}
              />

              {/* Grain overlay */}
              <div className="absolute inset-0 z-[5] opacity-35 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='ng'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0 0.15 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ng)'/%3E%3C/svg%3E")`
                }}
              />

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto relative z-10">
                <div className="flex flex-col items-center text-center px-6 py-8 min-h-full">
                  {/* Kick label */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 mb-4"
                  >
                    <div className="w-6 h-px bg-ha-red" />
                    <span className="font-mono text-[10px] tracking-[0.4em] text-ha-red font-bold uppercase">
                      ◆ Scene · December 8, 1941
                    </span>
                    <div className="w-6 h-px bg-ha-red" />
                  </motion.div>

                  {/* War Dept Alert Seal */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="relative w-[88px] h-[88px] mb-5"
                  >
                    {/* Outer ring */}
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'radial-gradient(circle at 50% 35%, #e82020, #8a0a0e 45%, #5a0205)',
                        border: '2px solid #B2641F',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.6), 0 0 30px rgba(205,14,20,0.4)'
                      }}
                    />
                    {/* Inner dashed border */}
                    <div
                      className="absolute inset-[6px] rounded-full flex items-center justify-center"
                      style={{ border: '1px dashed rgba(230,171,42,0.5)' }}
                    >
                      <div className="text-center leading-tight">
                        <span
                          className="block font-playfair italic text-[26px] font-bold leading-none mb-0.5"
                          style={{ color: '#F6E355' }}
                        >
                          1941
                        </span>
                        <span className="font-oswald text-[9px] tracking-[0.2em] text-[#F5ECD2] font-bold uppercase"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          War Dept.
                        </span>
                      </div>
                    </div>
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-playfair italic text-[42px] sm:text-[54px] font-bold text-off-white leading-[0.95] tracking-tight mb-4"
                    style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
                  >
                    A nation <em className="text-gold">unprepared.</em>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="font-cormorant italic text-lg text-off-white/70 max-w-[520px] leading-relaxed mb-5"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                  >
                    When U.S. military leadership took a hard look the morning after, they panicked. In almost every measurable way, the country was behind.
                  </motion.p>

                  {/* Statement card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="relative w-full max-w-[540px] rounded p-5 mb-5"
                    style={{
                      background: 'rgba(20,6,4,0.7)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(205,14,20,0.25)'
                    }}
                  >
                    {/* Red top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-ha-red" />

                    <div className="flex items-center gap-2 mb-2.5 font-mono text-[9px] tracking-[0.3em] text-ha-red uppercase font-bold">
                      <span>⚠</span>
                      Internal War Department Memo
                    </div>

                    <p className="font-cormorant italic text-[18px] sm:text-[20px] text-off-white leading-relaxed">
                      Our standing army ranks{' '}
                      <span className="text-ha-red font-bold italic underline underline-offset-4" style={{ textDecorationColor: 'rgba(205,14,20,0.5)', textDecorationThickness: '1.5px' }}>
                        nineteenth in the world
                      </span>
                      {' '}— behind Portugal, Switzerland, and the Netherlands. Our frontline fighter, the P-40, is already obsolete. Our Pacific carrier force is{' '}
                      <span className="text-ha-red font-bold italic underline underline-offset-4" style={{ textDecorationColor: 'rgba(205,14,20,0.5)', textDecorationThickness: '1.5px' }}>
                        three.
                      </span>
                    </p>
                  </motion.div>

                  {/* 4-column comparative stats */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="relative w-full max-w-[600px] rounded overflow-hidden mb-4"
                    style={{
                      background: 'rgba(20,10,6,0.65)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(230,171,42,0.15)'
                    }}
                  >
                    {/* Red gradient top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8A0A0E] via-ha-red to-[#8A0A0E]" />

                    <div className="grid grid-cols-4">
                      {[
                        { label: 'Army Rank', comp: 'US vs. World', us: '19th', them: '', note: 'behind Portugal' },
                        { label: 'Active Troops', comp: 'US vs. Germany', us: '1.4M', them: '7.2M', note: '1-to-5 deficit' },
                        { label: 'Tanks', comp: 'US vs. Germany', us: '300', them: '3,500', note: '11x behind' },
                        { label: 'Carriers · Pacific', comp: 'US vs. Japan', us: '3', them: '10', note: 'out-numbered 3-to-1' },
                      ].map((stat, i) => (
                        <div key={i} className="py-3 px-2.5 text-center flex flex-col gap-0.5 border-r border-off-white/[0.08] last:border-r-0">
                          <span className="font-mono text-[7.5px] tracking-[0.28em] text-off-white/50 uppercase font-semibold mb-1">{stat.label}</span>
                          <span className="font-mono text-[8.5px] text-gold font-bold tracking-[0.12em] uppercase mb-1">{stat.comp}</span>
                          <div className="font-playfair italic text-[18px] sm:text-[22px] font-bold leading-none flex justify-center items-baseline gap-1.5">
                            <span className="text-ha-red">{stat.us}</span>
                            {stat.them && (
                              <>
                                <span className="text-[10px] text-off-white/50 font-mono font-semibold tracking-[0.14em] not-italic">vs</span>
                                <span className="text-gold">{stat.them}</span>
                              </>
                            )}
                          </div>
                          <span className="font-cormorant italic text-[10.5px] text-off-white/50 leading-tight mt-0.5">{stat.note}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Spacer for scroll */}
                  <div className="h-8 flex-shrink-0" />
                </div>
              </div>

              {/* Bottom CTA - Fixed at bottom */}
              <div className="relative z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-[#080302] via-[#080302]/95 to-transparent backdrop-blur-sm border-t border-off-white/[0.06] flex-shrink-0">
                <div className="flex flex-col items-center gap-3.5 max-w-sm mx-auto">
                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    onClick={nextScreen}
                    className="relative w-full py-4 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[13px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3"
                  >
                    {/* Corner brackets */}
                    <span className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px] border-l-[1.5px] border-t-[1.5px] border-gold" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px] border-r-[1.5px] border-b-[1.5px] border-gold" />
                    See the Numbers
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </motion.button>
                </div>
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

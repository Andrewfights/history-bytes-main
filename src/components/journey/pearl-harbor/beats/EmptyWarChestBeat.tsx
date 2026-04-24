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
import { ArrowLeft, X, Sparkles, ChevronRight, ChevronDown, AlertTriangle, Target, Users, Zap, Check } from 'lucide-react';
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

// Comparison data: US vs Axis powers with bar fill percentages
const COMPARISON_STATS = [
  {
    category: 'Modern Tanks',
    us: { value: '17', label: 'United States', fillPercent: 1 },
    axis: { value: '3,000', label: 'Germany', fillPercent: 100 },
    insight: 'America fielded just 17 modern tanks. Germany had 3,000 — a 176× gap.',
    summaryLabel: '17 vs 3,000',
  },
  {
    category: 'Combat Aircraft',
    us: { value: 'P-40', label: 'United States', fillPercent: 30 },
    axis: { value: 'A6M Zero', label: 'Japan', fillPercent: 85 },
    insight: 'The P-40 was already obsolete. Japan\'s Zero outclassed every Allied fighter in the Pacific.',
    summaryLabel: 'P-40 vs A6M',
  },
  {
    category: 'Rifles · Infantry Arms',
    us: { value: '1.5M', label: 'for 2M troops', fillPercent: 20 },
    axis: { value: '18M', label: 'for 7M troops', fillPercent: 90 },
    insight: 'The US had 1.5 million rifles for 2 million soldiers. Many trained with broomsticks.',
    summaryLabel: 'M1903 era',
  },
  {
    category: 'Ammunition Reserves',
    us: { value: 'Weeks', label: 'of supply', fillPercent: 8 },
    axis: { value: 'Years', label: 'stockpiled', fillPercent: 95 },
    insight: 'America didn\'t have enough ammunition to sustain even weeks of combat.',
    summaryLabel: 'Weeks, not years',
  },
];

// Louisiana Maneuvers facts - stat cards with types
const MANEUVERS_FACTS = [
  {
    tag: 'Scale',
    value: '400,000',
    label: 'Troops Deployed',
    description: 'Largest exercise in US history at the time.',
    type: 'default', // gold accent
  },
  {
    tag: 'Shortage',
    value: '"TANK"',
    label: 'Painted on Trucks',
    description: 'Units improvised for the real thing.',
    type: 'default',
  },
  {
    tag: 'Findings',
    value: 'Exposed',
    label: 'Weak Supply Lines',
    description: 'Broken radios, shortages at every level.',
    type: 'warning', // red accent
  },
  {
    tag: 'Emergence',
    value: 'Eisenhower',
    label: '· Patton Rise',
    description: 'Future leaders proven in the field.',
    type: 'strength', // green accent
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
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
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
    // Toggle accordion - if clicking same category, close it; otherwise open clicked one
    setActiveCategory(prev => prev === index ? null : index);
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

          {/* COMPARISON SCREEN - US vs Axis Balance Sheet */}
          {screen === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-[#0A0A0A]"
            >
              {/* Balance sheet header */}
              <div className="text-center py-4 px-4">
                <div className="font-mono text-[8.5px] tracking-[0.35em] text-ha-red font-semibold uppercase mb-1.5">
                  ◆ 1941 Comparative Strength
                </div>
                <div className="relative inline-block">
                  <h2 className="font-oswald text-[19px] font-bold text-off-white uppercase tracking-tight">
                    US vs. Axis Powers
                  </h2>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[26px] h-0.5 bg-ha-red" />
                </div>
                <p className="font-sans text-[11px] text-off-white/50 mt-3 italic">
                  Tap each category to uncover the gap.
                </p>
              </div>

              {/* Category accordion list */}
              <div className="flex-1 overflow-y-auto px-3.5 pb-3">
                <div className="flex flex-col gap-[7px]">
                  {COMPARISON_STATS.map((stat, index) => {
                    const isViewed = viewedStats.has(index);
                    const isActive = activeCategory === index;

                    return (
                      <motion.div
                        key={stat.category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="relative overflow-hidden"
                        style={{
                          background: '#141414',
                          border: `1px solid ${isActive ? '#E6AB2A' : isViewed ? 'rgba(230,171,42,0.3)' : 'rgba(230,171,42,0.15)'}`,
                        }}
                      >
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors"
                          style={{
                            background: isActive ? '#E6AB2A' : isViewed ? '#3DD67A' : 'transparent'
                          }}
                        />

                        {/* Header row */}
                        <button
                          onClick={() => handleViewStat(index)}
                          className="w-full flex items-center gap-2.5 py-[11px] px-3 pl-4"
                        >
                          {/* Icon placeholder */}
                          <div
                            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                            style={{ color: isActive ? '#E6AB2A' : isViewed ? '#3DD67A' : 'rgba(242,238,230,0.7)' }}
                          >
                            {index === 0 && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M4 10h16v6H4zM7 16v3m10-3v3M8 10V7a4 4 0 018 0v3"/>
                              </svg>
                            )}
                            {index === 1 && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M2 12l10-9 10 9-4 2v6H6v-6z"/>
                              </svg>
                            )}
                            {index === 2 && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M4 18h16M6 14l4-8 4 6 4-4v10"/>
                              </svg>
                            )}
                            {index === 3 && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <path d="M12 2L2 12l10 10 10-10zM12 7v5M12 16h.01"/>
                              </svg>
                            )}
                          </div>

                          {/* Title */}
                          <span className="flex-1 font-oswald text-[13px] font-bold text-off-white uppercase tracking-wide text-left">
                            {stat.category}
                          </span>

                          {/* Status */}
                          <div className="flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.15em] uppercase font-semibold flex-shrink-0">
                            {!isViewed && (
                              <span className="text-gold-2">Tap</span>
                            )}
                            {isViewed && !isActive && (
                              <span className="text-[#3DD67A] flex items-center gap-1">
                                <Check size={10} />
                                {stat.summaryLabel}
                              </span>
                            )}
                            {isActive && (
                              <span className="text-[#3DD67A] flex items-center gap-1">
                                <Check size={10} />
                                Seen
                              </span>
                            )}
                          </div>

                          {/* Chevron */}
                          <ChevronDown
                            size={12}
                            className={`flex-shrink-0 transition-transform ${isActive ? 'rotate-180 text-gold-2' : 'text-off-white/30'}`}
                          />
                        </button>

                        {/* Expanded body */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div
                                className="px-3.5 pb-3.5 pt-1"
                                style={{
                                  borderTop: '1px solid rgba(242,238,230,0.08)',
                                  background: '#0A0A0A'
                                }}
                              >
                                {/* Bar pair */}
                                <div className="flex flex-col gap-[7px] my-3">
                                  {/* US Bar */}
                                  <div
                                    className="relative h-[34px] overflow-hidden"
                                    style={{
                                      background: 'linear-gradient(90deg, #1a2838, rgba(74,107,138,0.15))',
                                      border: '1px solid rgba(74,107,138,0.45)',
                                    }}
                                  >
                                    {/* Left accent */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#4A6B8A]" />
                                    {/* Fill */}
                                    <div
                                      className="absolute top-0 bottom-0 left-0 opacity-50"
                                      style={{
                                        width: `${stat.us.fillPercent}%`,
                                        background: 'linear-gradient(90deg, rgba(74,107,138,0.9), rgba(74,107,138,0.3))',
                                      }}
                                    />
                                    {/* Label */}
                                    <div className="absolute inset-0 flex items-center px-2.5 pointer-events-none">
                                      <div className="flex flex-col items-start">
                                        <span className="font-mono text-[7.5px] tracking-[0.2em] font-semibold uppercase text-[#8CB0D0]">
                                          ◇ United States
                                        </span>
                                        <span className="font-oswald text-[16px] font-bold text-[#BFD5E8] leading-none">
                                          {stat.us.value}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Axis Bar */}
                                  <div
                                    className="relative h-[34px] overflow-hidden"
                                    style={{
                                      background: 'linear-gradient(90deg, #2a0a08, rgba(138,42,30,0.15))',
                                      border: '1px solid rgba(138,42,30,0.5)',
                                    }}
                                  >
                                    {/* Left accent */}
                                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#8A2A1E]" />
                                    {/* Fill */}
                                    <div
                                      className="absolute top-0 bottom-0 right-0 opacity-50"
                                      style={{
                                        width: `${stat.axis.fillPercent}%`,
                                        background: 'linear-gradient(-90deg, rgba(138,42,30,0.9), rgba(138,42,30,0.3))',
                                      }}
                                    />
                                    {/* Label */}
                                    <div className="absolute inset-0 flex items-center justify-end px-2.5 pointer-events-none">
                                      <div className="flex flex-col items-end">
                                        <span className="font-mono text-[7.5px] tracking-[0.2em] font-semibold uppercase text-[#D09890]">
                                          {stat.axis.label} ◇
                                        </span>
                                        <span className="font-oswald text-[16px] font-bold text-[#E8BFB5] leading-none">
                                          {stat.axis.value}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Insight */}
                                <div
                                  className="font-sans text-[10.5px] text-off-white/70 leading-relaxed p-2.5 italic"
                                  style={{
                                    background: 'rgba(0,0,0,0.3)',
                                    borderLeft: '2px solid #B2641F',
                                  }}
                                >
                                  {stat.insight}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer with progress and CTA */}
              <div className="px-4 pt-2.5 pb-4 border-t border-off-white/[0.08]" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                {/* Progress row */}
                <div className="flex justify-between font-mono text-[8.5px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mb-2">
                  <span>Discovered</span>
                  <span className="text-gold-2">{viewedStats.size} / {COMPARISON_STATS.length}</span>
                </div>
                {/* Progress bar */}
                <div className="h-0.5 bg-off-white/[0.08] overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-gold-2"
                    initial={{ width: 0 }}
                    animate={{ width: `${(viewedStats.size / COMPARISON_STATS.length) * 100}%` }}
                  />
                </div>
                {/* CTA Button */}
                {allStatsViewed ? (
                  <button
                    onClick={nextScreen}
                    className="relative w-full py-3.5 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[12px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2"
                  >
                    {/* Corner brackets */}
                    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
                    Continue The Brief
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 font-oswald text-[12px] font-bold uppercase tracking-[0.12em] text-off-white/30"
                    style={{ background: '#141414', border: '1px solid rgba(230,171,42,0.15)' }}
                  >
                    Reveal All Four Gaps
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* LOUISIANA MANEUVERS - Field Report Screen */}
          {screen === 'maneuvers' && (
            <motion.div
              key="maneuvers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-[#0A0A0A]"
            >
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-3">
                {/* Report header */}
                <div className="text-center mb-3.5">
                  <div className="font-mono text-[8.5px] tracking-[0.4em] text-ha-red font-semibold uppercase mb-1.5">
                    ◆ Summer 1941 · Field Report
                  </div>
                  <div className="relative inline-block">
                    <h2 className="font-oswald text-[19px] font-bold text-off-white uppercase tracking-tight">
                      The Louisiana Maneuvers
                    </h2>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[26px] h-0.5 bg-ha-red" />
                  </div>
                  <p className="font-sans text-[11px] text-off-white/50 mt-3 italic">
                    America's desperate attempt to prepare
                  </p>
                </div>

                {/* Operation banner */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative flex gap-2.5 p-3 pl-3.5 mb-3"
                  style={{
                    background: '#1F1810',
                    border: '1px solid rgba(178,100,31,0.4)',
                  }}
                >
                  {/* Gold left bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />
                  {/* Icon */}
                  <div
                    className="w-[26px] h-[26px] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(230,171,42,0.15)',
                      border: '1px solid #B2641F',
                    }}
                  >
                    <Target size={13} className="text-gold-2" />
                  </div>
                  {/* Body */}
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-[8px] tracking-[0.25em] text-gold-2 font-semibold uppercase mb-0.5">
                      Operation
                    </div>
                    <div className="font-oswald text-[14px] font-bold text-off-white uppercase tracking-tight leading-none mb-1.5">
                      Training For Modern War
                    </div>
                    <p className="font-sans text-[10.5px] text-off-white/70 leading-relaxed">
                      The Army launched a massive exercise across Louisiana and East Texas to simulate the fast-moving, mechanized combat unfolding across Europe.
                    </p>
                  </div>
                </motion.div>

                {/* Stat cards grid */}
                <div className="grid grid-cols-2 gap-[7px] mb-3">
                  {MANEUVERS_FACTS.map((fact, index) => {
                    const isViewed = viewedFacts.has(index);
                    const accentColor = fact.type === 'warning' ? '#CD0E14' : fact.type === 'strength' ? '#3DD67A' : '#E6AB2A';

                    return (
                      <motion.button
                        key={fact.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.08 }}
                        onClick={() => handleViewFact(index)}
                        className="relative text-left p-2.5 min-h-[82px] overflow-hidden"
                        style={{
                          background: '#141414',
                          border: `1px solid ${isViewed ? accentColor + '50' : 'rgba(230,171,42,0.15)'}`,
                        }}
                      >
                        {/* Left accent bar */}
                        <div
                          className="absolute left-0 top-0 bottom-0 w-0.5"
                          style={{ background: accentColor }}
                        />

                        {/* Top row: icon + tag */}
                        <div className="flex justify-between items-start mb-1.5">
                          <div style={{ color: accentColor }}>
                            {fact.type === 'default' && index === 0 && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <circle cx="9" cy="7" r="3"/><circle cx="17" cy="9" r="2.5"/>
                                <path d="M3 19c0-3 3-5 6-5s6 2 6 5M15 19c0-2 2-4 4-4s4 1.5 4 4"/>
                              </svg>
                            )}
                            {fact.type === 'default' && index === 1 && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                <rect x="2" y="9" width="15" height="8" rx="1"/>
                                <path d="M17 11h3l2 3v3h-5M7 20a2 2 0 100-4 2 2 0 000 4zM18 20a2 2 0 100-4 2 2 0 000 4z"/>
                              </svg>
                            )}
                            {fact.type === 'warning' && (
                              <AlertTriangle size={16} />
                            )}
                            {fact.type === 'strength' && (
                              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3 7 7 .5-5.5 5 2 7-6.5-4-6.5 4 2-7-5.5-5 7-.5z"/>
                              </svg>
                            )}
                          </div>
                          <span
                            className="font-mono text-[7px] tracking-[0.15em] text-off-white/35 uppercase font-semibold py-0.5 px-1.5"
                            style={{ border: '1px solid rgba(230,171,42,0.15)' }}
                          >
                            {fact.tag}
                          </span>
                        </div>

                        {/* Value */}
                        <div
                          className="font-oswald text-[16px] font-bold leading-none uppercase tracking-tight mb-0.5"
                          style={{ color: accentColor }}
                        >
                          {fact.value}
                        </div>

                        {/* Label */}
                        <div className="font-oswald text-[10px] font-semibold text-off-white uppercase tracking-wide leading-tight mb-0.5">
                          {fact.label}
                        </div>

                        {/* Description (always shown) */}
                        <AnimatePresence>
                          {isViewed && (
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="font-sans text-[9.5px] text-off-white/50 leading-snug"
                            >
                              {fact.description}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Quote */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: allFactsViewed ? 1 : 0.4, y: 0 }}
                  className="relative p-3 pl-3.5 font-sans text-[11px] text-off-white/70 leading-relaxed italic"
                  style={{
                    background: 'rgba(205,14,20,0.06)',
                    border: '1px solid rgba(205,14,20,0.2)',
                  }}
                >
                  {/* Red left bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-ha-red" />
                  {/* Quote mark */}
                  <span
                    className="absolute -top-1 left-2.5 bg-[#0A0A0A] px-1.5 font-oswald text-[16px] text-ha-red font-bold not-italic"
                  >
                    "
                  </span>
                  The take-away was clear: America still had a long way to go before it was ready to fight a modern, global war. And not a lot of time.
                </motion.div>
              </div>

              {/* Footer with progress and CTA */}
              <div className="px-4 pt-2.5 pb-4 border-t border-off-white/[0.08]" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                {/* Progress row */}
                <div className="flex justify-between font-mono text-[8.5px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mb-2 px-0.5">
                  <span>Pages Surveyed</span>
                  <span className="text-[#3DD67A]">{viewedFacts.size} / {MANEUVERS_FACTS.length}</span>
                </div>
                {/* CTA Button */}
                {allFactsViewed ? (
                  <button
                    onClick={nextScreen}
                    className="relative w-full py-3.5 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[12px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2"
                  >
                    {/* Corner brackets */}
                    <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
                    Continue To The Payoff
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3.5 font-oswald text-[12px] font-bold uppercase tracking-[0.12em] text-off-white/30"
                    style={{ background: '#141414', border: '1px solid rgba(230,171,42,0.15)' }}
                  >
                    Tap All Four Cards
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* LEADERS SCREEN - A Proving Ground */}
          {screen === 'leaders' && (
            <motion.div
              key="leaders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-[#0A0A0A]"
            >
              <div className="flex-1 overflow-y-auto px-[18px] pt-5 pb-3 text-center">
                {/* Star icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative w-[50px] h-[50px] rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{
                    background: 'rgba(230,171,42,0.12)',
                    border: '1.5px solid #B2641F',
                  }}
                >
                  {/* Dashed outer ring */}
                  <div
                    className="absolute -inset-1 rounded-full"
                    style={{ border: '0.5px dashed rgba(230,171,42,0.3)' }}
                  />
                  <Users size={20} className="text-gold-2" />
                </motion.div>

                {/* Kick label */}
                <div className="font-mono text-[8px] tracking-[0.35em] text-gold-2 font-semibold uppercase mb-1.5">
                  ◆ The Payoff · Leadership
                </div>

                {/* Title */}
                <h2 className="font-playfair italic text-[22px] font-bold text-off-white uppercase tracking-tight leading-none mb-1">
                  A <em className="text-gold-2">Proving</em> Ground
                </h2>
                <div className="w-8 h-0.5 bg-ha-red mx-auto mt-2.5 mb-3.5" />

                {/* Intro text */}
                <p className="font-sans text-[11.5px] text-off-white/70 leading-relaxed italic mb-4 max-w-[260px] mx-auto">
                  While the exercises exposed America's weaknesses, they also became a proving ground for future leaders who would turn the tide of the war.
                </p>

                {/* Commander cards */}
                <div className="flex gap-[9px] mb-4">
                  {/* Eisenhower */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex-1 relative py-3.5 px-2 text-center overflow-hidden"
                    style={{
                      background: '#141414',
                      border: '1px solid rgba(230,171,42,0.15)',
                    }}
                  >
                    {/* Left gold bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />
                    {/* Top gold gradient line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px opacity-50"
                      style={{ background: 'linear-gradient(90deg, transparent, #E6AB2A, transparent)' }}
                    />

                    {/* Rank stars */}
                    <div className="flex justify-center gap-[3px] mb-2">
                      {[...Array(4)].map((_, i) => (
                        <svg key={i} className="w-2.5 h-2.5 text-[#F6E355]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3 7 7 .5-5.5 5 2 7-6.5-4-6.5 4 2-7-5.5-5 7-.5z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Portrait */}
                    <div
                      className="relative w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(circle at 35% 30%, rgba(246,227,85,0.3), transparent 60%), linear-gradient(135deg, #4a3820, #1a1008)',
                        border: '2px solid #B2641F',
                      }}
                    >
                      {/* Dashed outer ring */}
                      <div
                        className="absolute -inset-[3px] rounded-full"
                        style={{ border: '0.5px dashed rgba(230,171,42,0.35)' }}
                      />
                      <span className="font-oswald text-[14px] text-[#F6E355] font-bold tracking-wide">
                        DE
                      </span>
                    </div>

                    {/* Name */}
                    <div className="font-oswald text-[11.5px] text-gold-2 font-bold uppercase tracking-tight leading-tight mb-0.5">
                      Dwight D.<br/>Eisenhower
                    </div>
                    {/* Role */}
                    <div className="font-mono text-[7.5px] text-off-white/50 tracking-[0.15em] uppercase leading-snug">
                      Future Supreme<br/>Commander
                    </div>
                  </motion.div>

                  {/* Patton */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex-1 relative py-3.5 px-2 text-center overflow-hidden"
                    style={{
                      background: '#141414',
                      border: '1px solid rgba(230,171,42,0.15)',
                    }}
                  >
                    {/* Left gold bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />
                    {/* Top gold gradient line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-px opacity-50"
                      style={{ background: 'linear-gradient(90deg, transparent, #E6AB2A, transparent)' }}
                    />

                    {/* Rank stars */}
                    <div className="flex justify-center gap-[3px] mb-2">
                      {[...Array(4)].map((_, i) => (
                        <svg key={i} className="w-2.5 h-2.5 text-[#F6E355]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l3 7 7 .5-5.5 5 2 7-6.5-4-6.5 4 2-7-5.5-5 7-.5z"/>
                        </svg>
                      ))}
                    </div>

                    {/* Portrait */}
                    <div
                      className="relative w-11 h-11 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{
                        background: 'radial-gradient(circle at 35% 30%, rgba(246,227,85,0.3), transparent 60%), linear-gradient(135deg, #4a3820, #1a1008)',
                        border: '2px solid #B2641F',
                      }}
                    >
                      {/* Dashed outer ring */}
                      <div
                        className="absolute -inset-[3px] rounded-full"
                        style={{ border: '0.5px dashed rgba(230,171,42,0.35)' }}
                      />
                      <span className="font-oswald text-[14px] text-[#F6E355] font-bold tracking-wide">
                        GP
                      </span>
                    </div>

                    {/* Name */}
                    <div className="font-oswald text-[11.5px] text-gold-2 font-bold uppercase tracking-tight leading-tight mb-0.5">
                      George S.<br/>Patton
                    </div>
                    {/* Role */}
                    <div className="font-mono text-[7.5px] text-off-white/50 tracking-[0.15em] uppercase leading-snug">
                      Legendary<br/>Tank Commander
                    </div>
                  </motion.div>
                </div>

                {/* Closer text */}
                <div
                  className="font-sans text-[11px] text-off-white/70 leading-relaxed italic pt-3.5 max-w-[270px] mx-auto"
                  style={{ borderTop: '1px solid rgba(242,238,230,0.08)' }}
                >
                  From these humble beginnings, America would build the{' '}
                  <strong className="text-gold-2 font-bold not-italic">most powerful military force in history.</strong>
                </div>
              </div>

              {/* CTA Button */}
              <div className="px-4 pb-4 pt-2" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                <button
                  onClick={nextScreen}
                  className="relative w-full py-3.5 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[12px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2"
                >
                  {/* Corner brackets */}
                  <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
                  Finish The Lesson
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
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

          {/* COMPLETION SCREEN - Lesson Complete */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full text-center relative overflow-hidden"
              style={{
                background: `
                  radial-gradient(ellipse at 50% 20%, rgba(230,171,42,0.12), transparent 55%),
                  radial-gradient(ellipse at 50% 70%, rgba(205,14,20,0.04), transparent 60%),
                  #0A0A0A
                `
              }}
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
              }}
            >
              {/* Diagonal stripe pattern overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(45deg, transparent 0, transparent 40px, rgba(230,171,42,0.02) 40px, rgba(230,171,42,0.02) 41px)',
                }}
              />

              <div className="flex-1 overflow-y-auto px-[18px] pt-5 pb-3 relative z-10">
                {/* Medal */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="relative w-[72px] h-[72px] mx-auto mt-2 mb-3.5"
                >
                  {/* Ribbon - red/white/blue stripes with V shape */}
                  <div
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-[34px] h-[18px] z-10"
                    style={{
                      background: 'linear-gradient(90deg, #CD0E14 0%, #CD0E14 33%, #F2EEE6 33%, #F2EEE6 66%, #2A4868 66%, #2A4868 100%)',
                      clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
                    }}
                  />
                  {/* Star */}
                  <div
                    className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[56px] h-[56px]"
                    style={{
                      background: 'radial-gradient(circle at 35% 30%, #F6E355, #B2641F)',
                      clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                      filter: 'drop-shadow(0 0 8px rgba(230,171,42,0.4))',
                    }}
                  />
                </motion.div>

                {/* Kick label */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-mono text-[8.5px] tracking-[0.4em] text-gold-2 font-semibold uppercase mb-1.5"
                >
                  ◆ Lesson Complete
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-playfair italic text-[24px] font-bold text-off-white uppercase tracking-tight leading-none mb-1"
                >
                  An Empty <em className="text-gold-2">War Chest</em>
                </motion.h2>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-sans text-[11px] text-off-white/50 italic mb-4"
                >
                  Dispatch filed. Move out, soldier.
                </motion.p>

                {/* Takeaways card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="relative text-left p-3.5 mb-3.5"
                  style={{
                    background: '#141414',
                    border: '1px solid rgba(230,171,42,0.15)',
                  }}
                >
                  {/* Left gold bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />

                  {/* Header */}
                  <div className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.25em] text-gold-2 font-semibold uppercase mb-2.5">
                    <svg className="w-[9px] h-[9px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h5"/>
                    </svg>
                    Key Takeaways
                  </div>

                  {/* Items */}
                  <div className="space-y-0">
                    {[
                      'America was drastically unprepared for modern warfare in 1941.',
                      'The Louisiana Maneuvers exposed critical weaknesses.',
                      'Future leaders like Eisenhower & Patton emerged from this proving ground.',
                    ].map((takeaway, i) => (
                      <div
                        key={i}
                        className="flex gap-2 items-start py-1.5"
                        style={{ borderTop: i > 0 ? '1px solid rgba(242,238,230,0.08)' : 'none' }}
                      >
                        <span className="font-mono text-[9px] text-gold-2 font-bold tracking-wide flex-shrink-0 mt-0.5">
                          0{i + 1}
                        </span>
                        <span className="font-sans text-[10.5px] text-off-white/70 leading-snug">
                          {takeaway}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* XP award row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="relative flex items-center justify-center gap-2.5 py-3 px-3.5 mb-3"
                  style={{
                    background: '#1F1810',
                    border: '1px solid rgba(178,100,31,0.4)',
                  }}
                >
                  {/* Inner dashed border */}
                  <div
                    className="absolute inset-0.5 pointer-events-none"
                    style={{ border: '0.5px dashed rgba(178,100,31,0.3)' }}
                  />
                  {/* Star icon */}
                  <svg className="w-5 h-5 text-[#F6E355] relative z-10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2 6 6 .5-4.5 4 1.5 6-5-3-5 3 1.5-6L4 8.5 10 8z"/>
                  </svg>
                  {/* Value */}
                  <span className="font-oswald text-[18px] text-[#F6E355] font-bold tracking-wide relative z-10">
                    +{skipped ? 0 : LESSON_DATA.xpReward} XP
                  </span>
                  {/* Label */}
                  <span className="font-mono text-[9px] text-off-white/70 tracking-[0.2em] uppercase font-semibold relative z-10">
                    Awarded
                  </span>
                </motion.div>

                {/* Next up */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="font-mono text-[9px] text-off-white/50 tracking-[0.15em] uppercase leading-relaxed"
                >
                  Next up · <strong className="text-gold-2 font-semibold">Arsenal of Democracy</strong><br/>
                  See how America transformed into a production powerhouse.
                </motion.p>
              </div>

              {/* CTA Button */}
              <div className="relative z-10 px-4 pb-4 pt-2" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                <button
                  onClick={nextScreen}
                  className="relative w-full py-3.5 text-[#1a1008] font-oswald text-[12px] font-bold uppercase tracking-[0.15em] transition-colors flex items-center justify-center gap-2"
                  style={{ background: '#E6AB2A' }}
                >
                  {/* Red corner brackets */}
                  <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-ha-red" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-ha-red" />
                  Continue Campaign
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
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

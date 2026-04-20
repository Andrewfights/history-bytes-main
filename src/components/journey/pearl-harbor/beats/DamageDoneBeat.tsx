/**
 * Beat 4: Damage Done - The Full Impact
 * Format: Interactive Timeline Scrubber + Animated Map + Cost Summary
 * XP: 55 | Duration: 5-7 min
 *
 * Narrative: Explore the attack minute-by-minute through an interactive
 * timeline scrubber, then see the full cost in casualties and damage.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';

type Screen = 'pre-video' | 'intro' | 'timeline-map' | 'cost-summary' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'timeline-map', 'cost-summary', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-3',
  xpReward: 55,
};

// 12 beats for the timeline scrubber
interface TimelineBeat {
  time: string;
  label: string;
  wave: 'None' | 'First' | 'Second';
  status: 'Peace' | 'Alert' | 'Active' | 'Lull' | 'Aftermath';
  hit: number; // Ships hit at this point
  waves: ('approach' | 'torpedo' | 'dive')[]; // Attack types active
}

const TIMELINE_BEATS: TimelineBeat[] = [
  { time: "07:15", label: "Dawn patrol", wave: "None", status: "Peace", hit: 0, waves: [] },
  { time: "07:33", label: "Radar contact · Opana", wave: "None", status: "Alert", hit: 0, waves: [] },
  { time: "07:48", label: "First wave arrives", wave: "First", status: "Active", hit: 0, waves: ["approach"] },
  { time: "07:55", label: "Torpedo runs begin", wave: "First", status: "Active", hit: 3, waves: ["torpedo"] },
  { time: "08:00", label: "Dive bombers strike", wave: "First", status: "Active", hit: 5, waves: ["torpedo", "dive"] },
  { time: "08:06", label: "Arizona explodes", wave: "First", status: "Active", hit: 6, waves: ["dive"] },
  { time: "08:17", label: "Oklahoma capsizes", wave: "First", status: "Active", hit: 7, waves: ["dive"] },
  { time: "08:40", label: "First wave retires", wave: "First", status: "Lull", hit: 7, waves: [] },
  { time: "08:50", label: "Second wave arrives", wave: "Second", status: "Active", hit: 7, waves: ["approach"] },
  { time: "09:00", label: "Nevada beached", wave: "Second", status: "Active", hit: 8, waves: ["dive"] },
  { time: "09:30", label: "Second wave peaks", wave: "Second", status: "Active", hit: 8, waves: ["dive"] },
  { time: "09:45", label: "Attack concludes", wave: "None", status: "Aftermath", hit: 8, waves: [] }
];

// Ships on Battleship Row with their positions and hit timing
interface Ship {
  name: string;
  x: number;
  y: number;
  hitBeat: number; // Beat index when ship is hit
  destroyed?: boolean; // Ships that were completely destroyed
}

const SHIPS: Ship[] = [
  { name: "Nevada", x: 208, y: 55, hitBeat: 9 },
  { name: "Vestal", x: 209, y: 62, hitBeat: 5 },
  { name: "Arizona", x: 210, y: 69, hitBeat: 5, destroyed: true },
  { name: "W.Virginia", x: 211, y: 76, hitBeat: 3 },
  { name: "Tennessee", x: 212, y: 83, hitBeat: 4 },
  { name: "Oklahoma", x: 213, y: 90, hitBeat: 3, destroyed: true },
  { name: "Maryland", x: 214, y: 97, hitBeat: 4 },
  { name: "California", x: 215, y: 104, hitBeat: 4 }
];

// Beat icons for the timeline (indices that have special icons)
const BEAT_ICONS: Record<number, 'dot' | 'radar' | 'plane' | 'explosion'> = {
  0: 'dot',      // Dawn patrol
  1: 'radar',    // Radar contact
  2: 'plane',    // First wave arrives
  5: 'explosion', // Arizona explodes
  8: 'plane',    // Second wave arrives
  11: 'dot'      // Attack concludes
};

const COST_STATISTICS = {
  american: {
    killed: 2403,
    wounded: 1178,
    shipsSunk: 4,
    shipsDamaged: 17,
    aircraftDestroyed: 188,
    aircraftDamaged: 159,
  },
  japanese: {
    killed: 64,
    aircraft: 29,
    submarines: 5,
  },
};

interface DamageDoneBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function DamageDoneBeat({ host, onComplete, onSkip, onBack, isPreview = false }: DamageDoneBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentBeat, setCurrentBeat] = useState(2); // Start at "First wave arrives"
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const scrubberRef = useRef<HTMLDivElement>(null);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Subscribe to Firestore for pre/post-module video configs
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

  // Load checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.currentBeat !== undefined) {
          setCurrentBeat(checkpoint.state.currentBeat);
        }
      }
    }
  }, []);

  // Save checkpoint on screen/state change - only after config is loaded to avoid race condition
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {
          currentBeat,
        },
      });
    }
  }, [hasLoadedConfig, screen, currentBeat, saveCheckpoint]);

  // Auto-play timeline
  useEffect(() => {
    if (isAutoPlaying && currentBeat < TIMELINE_BEATS.length - 1) {
      playTimerRef.current = setTimeout(() => {
        setCurrentBeat(prev => Math.min(prev + 1, TIMELINE_BEATS.length - 1));
      }, 900); // Advance every 900ms
      return () => {
        if (playTimerRef.current) clearTimeout(playTimerRef.current);
      };
    } else if (currentBeat >= TIMELINE_BEATS.length - 1) {
      setIsAutoPlaying(false);
    }
  }, [isAutoPlaying, currentBeat]);

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

  // Convert scrubber position to beat index
  const posToBeat = useCallback((clientX: number) => {
    if (!scrubberRef.current) return currentBeat;
    const rect = scrubberRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.round(pct * (TIMELINE_BEATS.length - 1));
  }, [currentBeat]);

  const fadeHint = useCallback(() => {
    if (!hasInteracted) setHasInteracted(true);
  }, [hasInteracted]);

  const handleScrubStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    fadeHint();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setCurrentBeat(posToBeat(clientX));
    setIsAutoPlaying(false);
  }, [posToBeat, fadeHint]);

  const handleScrubMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    setCurrentBeat(posToBeat(clientX));
  }, [isDragging, posToBeat]);

  const handleScrubEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Drag event listeners for smooth scrubbing
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handleScrubMove);
    window.addEventListener('mouseup', handleScrubEnd);
    window.addEventListener('touchmove', handleScrubMove, { passive: false });
    window.addEventListener('touchend', handleScrubEnd);

    return () => {
      window.removeEventListener('mousemove', handleScrubMove);
      window.removeEventListener('mouseup', handleScrubEnd);
      window.removeEventListener('touchmove', handleScrubMove);
      window.removeEventListener('touchend', handleScrubEnd);
    };
  }, [isDragging, handleScrubMove, handleScrubEnd]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'timeline-map') return;
      if (e.key === 'ArrowLeft') {
        fadeHint();
        setCurrentBeat(prev => Math.max(0, prev - 1));
      }
      if (e.key === 'ArrowRight') {
        fadeHint();
        setCurrentBeat(prev => Math.min(TIMELINE_BEATS.length - 1, prev + 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, fadeHint]);

  // Handle auto-play toggle
  const toggleAutoPlay = useCallback(() => {
    fadeHint();
    setIsAutoPlaying(prev => {
      if (!prev && currentBeat >= TIMELINE_BEATS.length - 1) {
        setCurrentBeat(0);
      }
      return !prev;
    });
  }, [fadeHint, currentBeat]);

  // Handle reset
  const handleReset = useCallback(() => {
    setIsAutoPlaying(false);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    setCurrentBeat(0);
  }, []);

  // Get current beat data
  const beat = TIMELINE_BEATS[currentBeat];

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Damage Done</h1>
          <p className="text-white/50 text-xs">Beat 4 of 12</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img src={host.imageUrl || '/assets/hosts/default.png'} alt={host.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-amber-500" animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Damage Done"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">💥</motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">The Full Impact</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  In just 110 minutes, the attack on Pearl Harbor would change history forever. Explore the timeline minute by minute and see the devastating toll.
                </p>
                <div className="bg-red-500/10 rounded-xl p-4 max-w-sm border border-red-500/30">
                  <div className="flex items-center gap-2 text-red-300 mb-2">
                    <Clock size={18} />
                    <span className="font-bold">7:48 AM - 9:45 AM</span>
                  </div>
                  <p className="text-white/60 text-sm">
                    December 7, 1941 - A date which will live in infamy
                  </p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Explore the Timeline
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* TIMELINE-MAP - New scrubber design */}
          {screen === 'timeline-map' && (
            <motion.div key="timeline-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              {/* Header with beat counter and time */}
              <div className="px-4 py-3 text-center border-b border-white/10">
                <div className="text-[11px] tracking-[0.28em] text-slate-400 uppercase font-serif">
                  Damage done · <span>Beat {currentBeat + 1} of 12</span>
                </div>
                <div className="text-[28px] font-medium text-amber-50 mt-0.5 leading-none tracking-tight font-serif">
                  {beat.time}
                </div>
                <div className="text-xs text-amber-500 mt-1.5 tracking-[0.08em] uppercase">
                  {beat.label}
                </div>
              </div>

              {/* SVG Harbor Map */}
              <div className="mx-3.5 my-1.5 bg-slate-950/80 rounded-xl border border-white/5 p-2">
                <svg viewBox="0 0 320 160" className="w-full block" role="img">
                  <title>Battleship Row during the attack</title>

                  {/* Ocean background */}
                  <rect width="320" height="160" fill="#0F1F3A"/>

                  {/* Land masses */}
                  <path d="M 0,100 L 50,95 L 75,70 L 110,78 L 120,95 L 100,115 L 60,130 L 20,135 L 0,130 Z" fill="#2a3a2a" opacity="0.5"/>
                  <path d="M 260,20 L 240,30 L 230,55 L 245,85 L 280,95 L 320,90 L 320,20 Z" fill="#2a3a2a" opacity="0.5"/>
                  <path d="M 150,125 L 200,130 L 250,135 L 320,140 L 320,160 L 120,160 L 135,145 Z" fill="#2a3a2a" opacity="0.5"/>

                  {/* Ford Island */}
                  <ellipse cx="165" cy="80" rx="40" ry="14" fill="#3d5a3d" stroke="#5a7a5a" strokeWidth="0.5"/>
                  <text x="165" y="83" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" fill="#a8c0a8" fontStyle="italic">Ford Island</text>

                  {/* Ships on Battleship Row */}
                  {SHIPS.map((ship) => {
                    const isHit = currentBeat >= ship.hitBeat;
                    const isSunk = ship.destroyed && currentBeat >= ship.hitBeat + 2;
                    const fill = isSunk ? '#3a2020' : isHit ? '#C03030' : '#8a9cb0';
                    const opacity = isSunk ? 0.5 : 1;

                    return (
                      <g key={ship.name}>
                        <rect
                          x={ship.x}
                          y={ship.y}
                          width="11"
                          height="4"
                          rx="1"
                          fill={fill}
                          opacity={opacity}
                          transform={`rotate(-8 ${ship.x + 5} ${ship.y + 2})`}
                        />
                        {isHit && !isSunk && (
                          <circle cx={ship.x + 8} cy={ship.y + 2} r="3.5" fill="#F4B740" opacity="0.5">
                            <animate attributeName="opacity" values="0.3;0.7;0.3" dur="1.2s" repeatCount="indefinite"/>
                          </circle>
                        )}
                      </g>
                    );
                  })}

                  {/* Smoke from hit ships */}
                  {SHIPS.filter(s => currentBeat >= s.hitBeat).map((ship) => {
                    const age = currentBeat - ship.hitBeat;
                    const plumeSize = Math.min(2 + age * 0.8, 5);
                    return (
                      <g key={`smoke-${ship.name}`}>
                        <circle cx={ship.x + 6} cy={ship.y - 3 - age} r={plumeSize} fill="#4a4a4a" opacity="0.4"/>
                        <circle cx={ship.x + 8} cy={ship.y - 7 - age * 1.5} r={plumeSize * 0.8} fill="#3a3a3a" opacity="0.3"/>
                      </g>
                    );
                  })}

                  {/* Attack wave animations */}
                  {beat.waves.includes('approach') && (
                    <g stroke="#F4B740" strokeWidth="1" fill="none" strokeDasharray="3,3" opacity="0.7">
                      <path d="M 305 10 Q 260 40 220 70">
                        <animate attributeName="stroke-dashoffset" from="0" to="-12" dur="0.8s" repeatCount="indefinite"/>
                      </path>
                    </g>
                  )}
                  {beat.waves.includes('torpedo') && (
                    <g stroke="#F4B740" strokeWidth="1.2" fill="none" opacity="0.8">
                      <path d="M 260 70 L 225 78" strokeDasharray="2,2">
                        <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="0.5s" repeatCount="indefinite"/>
                      </path>
                      <path d="M 260 85 L 225 92" strokeDasharray="2,2">
                        <animate attributeName="stroke-dashoffset" from="0" to="-8" dur="0.6s" repeatCount="indefinite"/>
                      </path>
                    </g>
                  )}
                  {beat.waves.includes('dive') && (
                    <g stroke="#C03030" strokeWidth="1" fill="none" opacity="0.7">
                      <path d="M 220 20 L 215 65" strokeDasharray="3,2"/>
                      <path d="M 235 25 L 220 75" strokeDasharray="3,2"/>
                    </g>
                  )}

                  {/* Compass */}
                  <g transform="translate(15, 140)">
                    <text x="0" y="0" fontFamily="system-ui, sans-serif" fontSize="8" fill="#7a8ca5" letterSpacing="0.1em">N</text>
                    <path d="M 3 -3 L 3 -12 M 0 -9 L 3 -13 L 6 -9" stroke="#7a8ca5" strokeWidth="0.8" fill="none"/>
                  </g>
                </svg>
              </div>

              {/* Stats Section */}
              <div className="px-4 py-3 grid grid-cols-3 gap-2.5">
                <div>
                  <div className="text-xl font-medium text-amber-50 leading-none font-serif">
                    <span>{beat.hit}</span> <span className="text-[11px] text-slate-500">/ 8</span>
                  </div>
                  <div className="text-[11px] text-slate-400 tracking-[0.08em] uppercase mt-1">Ships hit</div>
                </div>
                <div>
                  <div className="text-xl font-medium text-amber-50 leading-none font-serif">{beat.wave}</div>
                  <div className="text-[11px] text-slate-400 tracking-[0.08em] uppercase mt-1">Wave</div>
                </div>
                <div>
                  <div className={`text-xl font-medium leading-none font-serif ${
                    beat.status === 'Active' ? 'text-red-500' :
                    beat.status === 'Lull' ? 'text-amber-500' :
                    beat.status === 'Aftermath' ? 'text-slate-400' : 'text-amber-50'
                  }`}>{beat.status}</div>
                  <div className="text-[11px] text-slate-400 tracking-[0.08em] uppercase mt-1">Status</div>
                </div>
              </div>

              {/* Scrubber Section */}
              <div className="px-5 pt-3.5 pb-1.5 border-t border-white/10 relative">
                {/* Preview bubble */}
                <motion.div
                  className="absolute top-0 px-2.5 py-1.5 bg-amber-500 text-slate-900 rounded-md text-[11px] font-medium whitespace-nowrap pointer-events-none z-10"
                  style={{
                    left: `${(currentBeat / (TIMELINE_BEATS.length - 1)) * 100}%`,
                    transform: 'translateX(-50%)'
                  }}
                >
                  {beat.time} · {beat.label}
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45 w-2 h-2 bg-amber-500" />
                </motion.div>

                <div className="h-5" /> {/* Spacer for bubble */}

                {/* Beat icons row */}
                <div className="relative h-6 flex justify-between items-center mb-1 px-0.5">
                  {TIMELINE_BEATS.map((_, i) => {
                    const iconType = BEAT_ICONS[i];
                    return (
                      <div key={i} className="w-3.5 h-3.5 flex items-center justify-center">
                        {iconType === 'dot' && (
                          <div className="w-1 h-1 rounded-full bg-slate-500" />
                        )}
                        {iconType === 'radar' && (
                          <svg width="11" height="11" viewBox="0 0 16 16">
                            <circle cx="8" cy="8" r="5" fill="none" stroke="#7a8ca5" strokeWidth="1"/>
                            <circle cx="8" cy="8" r="2" fill="#7a8ca5"/>
                          </svg>
                        )}
                        {iconType === 'plane' && (
                          <svg width="12" height="12" viewBox="0 0 24 24">
                            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#F4B740"/>
                          </svg>
                        )}
                        {iconType === 'explosion' && (
                          <svg width="12" height="12" viewBox="0 0 24 24">
                            <path d="M12 2 l2 6 l6 0 l-5 4 l2 6 l-5 -4 l-5 4 l2 -6 l-5 -4 l6 0 z" fill="#C03030"/>
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Scrubber rail */}
                <div
                  ref={scrubberRef}
                  onMouseDown={handleScrubStart}
                  onTouchStart={handleScrubStart}
                  className="relative h-9 cursor-grab select-none touch-none"
                  style={{ userSelect: 'none' }}
                >
                  {/* Track background with gradient showing attack intensity */}
                  <div
                    className="absolute top-3.5 left-0 right-0 h-2 rounded-full opacity-40"
                    style={{ background: 'linear-gradient(to right, #2a3a55 0%, #2a3a55 18%, #8a6a1a 28%, #C03030 45%, #C03030 60%, #8a6a1a 75%, #2a3a55 92%, #2a3a55 100%)' }}
                  />

                  {/* Played portion */}
                  <motion.div
                    className="absolute top-3.5 left-0 h-2 rounded-full"
                    style={{
                      width: `${(currentBeat / (TIMELINE_BEATS.length - 1)) * 100}%`,
                      background: 'linear-gradient(to right, #F4B740 0%, #F4B740 75%, #ff9a3c 100%)',
                      boxShadow: '0 0 12px rgba(244,183,64,0.4)'
                    }}
                  />

                  {/* Beat notches */}
                  <div className="absolute top-3.5 left-0 right-0 h-2 flex justify-between px-0.5">
                    {TIMELINE_BEATS.map((_, i) => (
                      <div
                        key={i}
                        className={`w-px h-2 ${i <= currentBeat ? 'bg-white/45' : 'bg-white/20'}`}
                      />
                    ))}
                  </div>

                  {/* Draggable thumb */}
                  <motion.div
                    className={`absolute top-0.5 w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-500 flex items-center justify-center shadow-lg ${isDragging ? 'cursor-grabbing scale-110' : 'cursor-grab'}`}
                    style={{
                      left: `calc(${(currentBeat / (TIMELINE_BEATS.length - 1)) * 100}% - 16px)`,
                      boxShadow: isDragging
                        ? '0 4px 16px rgba(0,0,0,0.6), 0 0 0 6px rgba(244,183,64,0.2)'
                        : '0 2px 8px rgba(0,0,0,0.4)'
                    }}
                    animate={!isDragging && !hasInteracted ? {
                      boxShadow: [
                        '0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(244,183,64,0.5)',
                        '0 2px 8px rgba(0,0,0,0.4), 0 0 0 8px rgba(244,183,64,0)',
                        '0 2px 8px rgba(0,0,0,0.4), 0 0 0 0 rgba(244,183,64,0.5)'
                      ]
                    } : {}}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-slate-900 rounded-sm" />
                      <div className="w-0.5 h-3 bg-slate-900 rounded-sm" />
                      <div className="w-0.5 h-3 bg-slate-900 rounded-sm" />
                    </div>
                  </motion.div>
                </div>

                {/* Time labels */}
                <div className="flex justify-between mt-1 px-0.5 font-mono text-[11px] text-slate-400">
                  <span>7:15</span>
                  <span className="pl-[28%]">7:55</span>
                  <span>8:17</span>
                  <span>9:00</span>
                  <span>9:45</span>
                </div>

                {/* Hint row */}
                <div
                  className={`flex justify-between items-center mt-2.5 text-[11px] text-slate-400 transition-opacity duration-500 ${hasInteracted ? 'opacity-35' : 'opacity-100'}`}
                >
                  <span className="flex items-center gap-1.5">
                    <motion.span
                      animate={!hasInteracted ? { x: [0, 8, 0] } : {}}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      👆
                    </motion.span>
                    <span>Drag to scrub through the attack</span>
                  </span>
                  <span className="font-mono text-[10px] opacity-70">← → keys</span>
                </div>
              </div>

              {/* Control buttons */}
              <div className="px-4 py-2 flex gap-2">
                <button
                  onClick={toggleAutoPlay}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 text-amber-500 transition-colors hover:bg-amber-500/25"
                >
                  {isAutoPlaying ? (
                    <>
                      <span className="w-2 h-2.5 border-l-[3px] border-r-[3px] border-amber-500" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <span className="w-0 h-0 border-l-[7px] border-l-amber-500 border-y-[5px] border-y-transparent" />
                      <span>Auto-play</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-2.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-300 transition-colors hover:bg-white/10"
                >
                  ↺ Reset
                </button>
              </div>

              {/* Continue button */}
              <div className="px-4 pb-4 mt-auto" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <button
                  onClick={nextScreen}
                  disabled={currentBeat < 8}
                  className={`w-full py-4 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 ${
                    currentBeat >= 8
                      ? 'bg-amber-500 hover:bg-amber-400 text-black'
                      : 'bg-white/10 text-white/30'
                  }`}
                >
                  {currentBeat < 8 ? 'Scrub through the attack to continue' : (
                    <>See the Full Cost <ChevronRight size={18} /></>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* COST SUMMARY */}
          {screen === 'cost-summary' && (
            <motion.div key="cost-summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6"
                >
                  <motion.div
                    className="absolute w-20 h-20 rounded-full bg-red-500/10"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <span className="text-4xl">🕯️</span>
                </motion.div>

                <motion.h2
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  The Cost of December 7
                </motion.h2>

                <motion.p
                  className="text-white/60 text-center mb-6 max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  In 110 minutes, the attack devastated the U.S. Pacific Fleet
                </motion.p>

                {/* American losses */}
                <motion.div
                  className="w-full max-w-sm bg-white/5 rounded-2xl p-5 border border-white/10 mb-4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-white font-bold mb-4 text-center">American Losses</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <motion.p
                        className="text-3xl font-bold text-red-400"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring' }}
                      >
                        {COST_STATISTICS.american.killed.toLocaleString()}
                      </motion.p>
                      <p className="text-white/50 text-sm">Killed</p>
                    </div>
                    <div className="text-center">
                      <motion.p
                        className="text-3xl font-bold text-amber-400"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring' }}
                      >
                        {COST_STATISTICS.american.wounded.toLocaleString()}
                      </motion.p>
                      <p className="text-white/50 text-sm">Wounded</p>
                    </div>
                    <div className="text-center">
                      <motion.p
                        className="text-2xl font-bold text-white"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: 'spring' }}
                      >
                        {COST_STATISTICS.american.shipsSunk + COST_STATISTICS.american.shipsDamaged}
                      </motion.p>
                      <p className="text-white/50 text-sm">Ships Lost/Damaged</p>
                    </div>
                    <div className="text-center">
                      <motion.p
                        className="text-2xl font-bold text-white"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring' }}
                      >
                        {COST_STATISTICS.american.aircraftDestroyed}
                      </motion.p>
                      <p className="text-white/50 text-sm">Aircraft Destroyed</p>
                    </div>
                  </div>
                </motion.div>

                {/* Japanese losses */}
                <motion.div
                  className="w-full max-w-sm bg-white/5 rounded-xl p-4 border border-white/10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                >
                  <h3 className="text-white/70 font-bold mb-2 text-sm text-center">Japanese Losses</h3>
                  <div className="flex justify-center gap-6 text-center">
                    <div>
                      <p className="text-lg font-bold text-white/80">{COST_STATISTICS.japanese.killed}</p>
                      <p className="text-white/40 text-xs">Killed</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white/80">{COST_STATISTICS.japanese.aircraft}</p>
                      <p className="text-white/40 text-xs">Aircraft</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white/80">{COST_STATISTICS.japanese.submarines}</p>
                      <p className="text-white/40 text-xs">Submarines</p>
                    </div>
                  </div>
                </motion.div>

                <motion.p
                  className="text-white/40 text-sm text-center mt-4 max-w-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Nearly half of all American deaths occurred on the USS Arizona alone.
                </motion.p>
              </div>

              <button
                onClick={nextScreen}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                style={{ marginBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Damage Done - The Full Impact"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6"
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">💥</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 4 Complete!</h2>
                <p className="text-white/60 mb-6">Damage Done - The Full Impact</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Voices from the Harbor - Hear from those who lived through it
                </p>
              </div>
              <button
                onClick={nextScreen}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                style={{ marginBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
              >
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

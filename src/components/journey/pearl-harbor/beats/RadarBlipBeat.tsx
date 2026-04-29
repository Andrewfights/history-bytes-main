/**
 * Beat 2: The Radar Blip - 7:02 AM
 * Format: Branching Decision with CRT Radar Display
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Step into Private Lockard's shoes at Opana Point
 * when he detected the incoming Japanese attack on radar.
 *
 * Two-state design: Quiet scanning → Massive contact alert
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Award, AlertTriangle, Volume2, VolumeX } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useScreenHistory } from '../hooks/useScreenHistory';
import { PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';

// CRT Radar color constants
const PHOS = '#4AFF9E';
const PHOS_DIM = '#2A9E5E';
const PHOS_DK = '#1A5E38';
const PHOS_GLOW = 'rgba(74,255,158,0.6)';
const ALERT = '#FF3838';
const ALERT_DIM = '#8A1A1A';
const CRT_BG = '#051008';
const CRT_RING = '#1A4028';

// Blip type for live animation
interface Blip {
  id: number;
  angle: number;
  radius: number;
  size: 'xs' | 'sm' | 'md' | 'lg';
}

// Helper to get blip size class based on radius
function getBlipSize(radius: number): 'xs' | 'sm' | 'md' | 'lg' {
  if (radius < 15) return 'lg';
  if (radius < 28) return 'md';
  if (radius < 38) return 'sm';
  return 'xs';
}

// Helper to convert polar to XY percentage
function polarToXY(angle: number, radius: number): { x: number; y: number } {
  const rad = (angle - 90) * Math.PI / 180;
  return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
}

type Screen = 'pre-video' | 'intro' | 'radar-setup' | 'blip-appears' | 'decision' | 'outcome' | 'legacy' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'radar-setup', 'blip-appears', 'decision', 'outcome', 'legacy', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-2',
  xpReward: 50,
};

type DecisionOption = 'report-normal' | 'escalate' | 'dismiss';

const DECISION_OPTIONS = [
  {
    id: 'report-normal' as const,
    label: 'Report Through Channels',
    description: 'Call the Information Center and report the blip to whoever is on duty.',
    icon: '📞',
  },
  {
    id: 'escalate' as const,
    label: 'Escalate to Command',
    description: 'This is too big to ignore. Try to reach someone higher up immediately.',
    icon: '⚠️',
  },
  {
    id: 'dismiss' as const,
    label: 'Dismiss as Routine',
    description: 'Probably just a flock of birds or equipment malfunction. Log it and move on.',
    icon: '📋',
  },
];

const OUTCOMES: Record<DecisionOption, { title: string; content: string; isHistorical: boolean }> = {
  'report-normal': {
    title: 'What Actually Happened',
    content: `You called the Information Center at Fort Shafter. Lieutenant Kermit Tyler, a pilot with minimal training on his second day at the center, answered.

"Don't worry about it," he said.

Tyler assumed the blip was a flight of B-17 bombers expected from California. He didn't know the radar could track planes 137 miles away. He didn't raise an alarm.

53 minutes of warning. Zero response.`,
    isHistorical: true,
  },
  'escalate': {
    title: 'A Different Path',
    content: `If Lockard had bypassed normal channels and reached a senior officer directly, history might have been different.

With 53 minutes warning, anti-aircraft crews could have been alerted. Planes could have been scrambled. Ships could have prepared for attack.

But the chain of command existed for a reason, and a 19-year-old private couldn't know that this Sunday would be different from any other.`,
    isHistorical: false,
  },
  'dismiss': {
    title: 'Ignored Warning',
    content: `Dismissing the largest radar contact in history would have been a catastrophic error in judgment.

But consider: Lockard had never seen anything like this. The equipment was new and often unreliable. And who would believe that Japan would attack on a peaceful Sunday morning?

The real tragedy is that even when reported, the warning was dismissed anyway.`,
    isHistorical: false,
  },
};

interface RadarBlipBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function RadarBlipBeat({ host, onComplete, onSkip, onBack, isPreview = false }: RadarBlipBeatProps) {
  // Use screen history hook for proper back navigation
  const {
    screen,
    isFirstScreen,
    goToScreen,
    goBack: goToPrevScreen,
    resetHistory,
  } = useScreenHistory<Screen>({
    initialScreen: 'intro',
    screens: SCREENS,
    onExit: onBack,
  });

  const [selectedDecision, setSelectedDecision] = useState<DecisionOption | null>(null);
  const [radarPulse, setRadarPulse] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  // Live blip state for alert screen
  const [liveBlips, setLiveBlips] = useState<Blip[]>([]);
  const blipIdRef = useRef(0);
  const [blipCount, setBlipCount] = useState(0);
  const [estimatedRange, setEstimatedRange] = useState(137);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Pre-generate blip positions for the massive attack (20 blips)
  // Using fixed seed-like approach for consistent positions
  const attackBlips = useMemo(() => {
    const blips = [];
    // Create 20 blips in a cluster pattern in the northern sector
    for (let i = 0; i < 20; i++) {
      // Use deterministic positions based on index for consistency
      const angle = (i / 20) * Math.PI * 0.8 - Math.PI * 0.4; // Spread across ~144 degrees
      const distance = 25 + (i % 5) * 5; // Vary distance from center
      const top = 20 + Math.sin(angle + i * 0.3) * 12 + (i % 3) * 4;
      const left = 50 + Math.cos(angle + i * 0.3) * 15 + (i % 4) * 3;
      blips.push({
        id: i,
        top: Math.max(8, Math.min(40, top)), // Keep in upper portion
        left: Math.max(25, Math.min(75, left)), // Keep centered
        size: 6 + (i % 4) * 2, // 6-12px size - much more visible
        delay: (i * 0.1) % 0.8,
        duration: 1.0 + (i % 3) * 0.3,
      });
    }
    return blips;
  }, []);

  // Subscribe to Firestore for pre/post-module video configs
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        console.log('[RadarBlipBeat] Found pre-module video:', preModuleVideo);
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }

      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        console.log('[RadarBlipBeat] Found post-module video:', postModuleVideo);
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
      // Show pre-video if: (in preview mode OR no checkpoint for THIS lesson) AND video is configured
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        resetHistory('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview, resetHistory]);

  // Radar animation
  useEffect(() => {
    if (screen === 'radar-setup' || screen === 'blip-appears') {
      const interval = setInterval(() => {
        setRadarPulse((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Live blip management for alert screen
  useEffect(() => {
    if (screen !== 'blip-appears') {
      setLiveBlips([]);
      blipIdRef.current = 0;
      return;
    }

    // Seed initial blips
    const initialBlips: Blip[] = [
      { id: blipIdRef.current++, angle: 355, radius: 44, size: 'xs' },
      { id: blipIdRef.current++, angle: 2, radius: 45, size: 'xs' },
      { id: blipIdRef.current++, angle: 350, radius: 42, size: 'xs' },
      { id: blipIdRef.current++, angle: 8, radius: 46, size: 'xs' },
      { id: blipIdRef.current++, angle: 358, radius: 40, size: 'xs' },
      { id: blipIdRef.current++, angle: 5, radius: 43, size: 'xs' }
    ].map(b => ({ ...b, size: getBlipSize(b.radius) }));
    setLiveBlips(initialBlips);

    // Spawn new blips periodically
    const spawnInterval = setInterval(() => {
      const numToSpawn = 2 + Math.floor(Math.random() * 3);
      const newBlips: Blip[] = [];
      for (let i = 0; i < numToSpawn; i++) {
        const angleBase = 340 + Math.random() * 40;
        const angle = angleBase >= 360 ? angleBase - 360 : angleBase;
        const radius = 42 + Math.random() * 6;
        newBlips.push({
          id: blipIdRef.current++,
          angle,
          radius,
          size: getBlipSize(radius)
        });
      }
      setLiveBlips(prev => [...prev, ...newBlips]);
    }, 2500 + Math.random() * 1500);

    // Drift blips inward every sweep cycle
    const driftInterval = setInterval(() => {
      setLiveBlips(prev => {
        const updated = prev.map(b => {
          const newRadius = Math.max(0, b.radius - (2.5 + Math.random() * 1.5));
          return { ...b, radius: newRadius, size: getBlipSize(newRadius) };
        }).filter(b => b.radius > 4);
        return updated;
      });
    }, 5000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(driftInterval);
    };
  }, [screen]);

  // Update blip count and range
  useEffect(() => {
    setBlipCount(liveBlips.length);
    if (liveBlips.length > 0) {
      const minRadius = Math.min(...liveBlips.map(b => b.radius));
      const miles = Math.max(5, Math.round((minRadius / 50) * 250 / 5) * 5);
      setEstimatedRange(miles);
    }
  }, [liveBlips]);

  // Restore checkpoint
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        resetHistory(savedScreen);
        if (checkpoint.state?.selectedDecision) {
          setSelectedDecision(checkpoint.state.selectedDecision);
        }
      }
    }
  }, [resetHistory]);

  // Save checkpoint - only after config is loaded to avoid race condition
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { selectedDecision },
      });
    }
  }, [hasLoadedConfig, screen, selectedDecision, saveCheckpoint]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextScreenIndex = currentIndex + 1;
      // Skip post-video if not configured
      if (SCREENS[nextScreenIndex] === 'post-video' && !postModuleVideoConfig?.enabled) {
        nextScreenIndex++;
      }
      if (nextScreenIndex < SCREENS.length) {
        goToScreen(SCREENS[nextScreenIndex]);
      } else {
        clearCheckpoint();
        onComplete(skipped ? 0 : LESSON_DATA.xpReward);
      }
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig, goToScreen]);

  const handleDecision = (decision: DecisionOption) => {
    setSelectedDecision(decision);
    nextScreen();
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={goToPrevScreen} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          {isFirstScreen ? <X size={24} /> : <ChevronLeft size={24} />}
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">The Radar Blip</h1>
          <p className="text-white/50 text-xs">Beat 2 of 10</p>
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
              beatTitle="The Radar Blip"
              onComplete={() => goToScreen('intro')}
            />
          )}

          {/* INTRO - New Design */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative">
              {/* Atmospheric Background */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-[#050a08] via-[#030806] to-[#020302]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(30,100,60,0.12)_0%,transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_70%,rgba(60,100,140,0.1)_0%,transparent_50%)]" />
                {/* Grain overlay */}
                <div className="absolute inset-0 opacity-30 mix-blend-overlay" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.3 0 0 0 0 0.5 0 0 0 0 0.4 0 0 0 0.25 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
                }} />
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto relative z-10">
                <div className="flex flex-col items-center text-center px-6 py-8 min-h-full">
                {/* Kick label */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 mb-4"
                >
                  <div className="w-6 h-px bg-success" />
                  <span className="font-mono text-[10px] tracking-[0.4em] text-success font-bold uppercase">
                    ◆ Scene · December 7, 1941
                  </span>
                  <div className="w-6 h-px bg-success" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-serif text-5xl md:text-6xl font-bold text-off-white leading-[0.95] tracking-[-0.018em] mb-3"
                >
                  The <em className="text-success">radar blip.</em>
                </motion.h1>

                {/* Meta info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="font-serif italic text-base text-off-white/70 mb-8"
                >
                  Opana Point, Hawaii · <span className="text-gold-2 font-semibold">07:02 local</span> · Private Joseph Lockard, 19
                </motion.div>

                {/* Radar Visual */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative w-40 h-40 mb-8"
                >
                  {/* Radar rings */}
                  <div className="absolute inset-0 rounded-full border border-success/20" />
                  <div className="absolute inset-5 rounded-full border border-success/20" />
                  <div className="absolute inset-10 rounded-full border border-success/20" />
                  <div className="absolute inset-[60px] rounded-full border border-success/20" />
                  {/* Cross lines */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-success/15 -translate-y-1/2" />
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-success/15 -translate-x-1/2" />
                  {/* Sweep line */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left"
                    style={{ background: 'linear-gradient(90deg, rgba(61,214,122,0.8), transparent)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Sweep glow */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-1/2 h-20 origin-left -translate-y-1/2"
                    style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(61,214,122,0.22), transparent 70%)' }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Blip */}
                  <motion.div
                    className="absolute top-[24%] right-[18%] w-2 h-2 rounded-full bg-success z-10"
                    style={{ boxShadow: '0 0 14px 4px rgba(61,214,122,0.7)' }}
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  {/* Pulse ring */}
                  <motion.div
                    className="absolute top-[24%] right-[18%] w-2 h-2 rounded-full border border-success"
                    animate={{ scale: [0.3, 1.1], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  {/* Center label */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="font-serif italic text-xl text-off-white tracking-[-0.01em]">07:02</div>
                    <div className="font-mono text-[7px] tracking-[0.3em] text-success font-bold uppercase">Bearing 137</div>
                  </div>
                </motion.div>

                {/* Scene text */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-body text-sm text-off-white/70 leading-relaxed max-w-sm mb-6"
                >
                  You are <strong className="text-gold-2 font-semibold">Private Joseph Lockard</strong>. The truck to pick you up from your experimental radar station is late. You keep the screen running for practice. Then you see something you have never seen before.
                </motion.p>

                {/* Testimony card - parchment style */}
                <motion.div
                  initial={{ opacity: 0, y: 10, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: -0.4 }}
                  transition={{ delay: 0.4 }}
                  className="relative max-w-md p-5 rounded-sm shadow-2xl"
                  style={{
                    background: '#F5ECD2',
                    color: '#1a1008',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)'
                  }}
                >
                  <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, rgba(106,58,18,0.25), transparent)' }} />
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: '#8A5A1A' }}>◆</span>
                    <span className="font-mono text-[8.5px] tracking-[0.28em] uppercase font-bold" style={{ color: 'rgba(26,16,8,0.5)' }}>
                      From the oral history · 1977
                    </span>
                  </div>
                  <p className="font-serif italic text-lg leading-relaxed" style={{ color: '#1a1008' }}>
                    <span className="font-serif text-3xl leading-none align-[-8px] mr-0.5" style={{ color: '#8A5A1A' }}>"</span>
                    We had been told to shut down at 7:00, but the truck to pick us up was late. I decided to keep the radar running for practice. That's when I saw the biggest blip I had ever seen.
                    <span className="font-serif text-3xl leading-none align-[-18px] ml-0.5" style={{ color: '#8A5A1A' }}>"</span>
                  </p>
                  <div className="font-serif italic text-xs text-right mt-2" style={{ color: 'rgba(26,16,8,0.55)' }}>
                    — Pvt. Joseph Lockard, Opana Point, 1941
                  </div>
                </motion.div>

                  {/* Spacer for scroll padding */}
                  <div className="h-8 flex-shrink-0" />
                </div>
              </div>

              {/* Bottom CTA - Fixed at bottom */}
              <div className="relative z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-void via-void/95 to-transparent backdrop-blur-sm border-t border-off-white/[0.06] flex-shrink-0" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={nextScreen}
                  className="relative w-full py-4 bg-ha-red hover:bg-ha-red/90 text-off-white font-display text-sm font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3"
                >
                  {/* Corner brackets */}
                  <div className="absolute top-[-1px] left-[-1px] w-3 h-3 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
                  <div className="absolute bottom-[-1px] right-[-1px] w-3 h-3 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
                  Continue to the Report
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                    <path d="M5 12h14M13 6l6 6-6 6"/>
                  </svg>
                </motion.button>
                <button
                  onClick={() => { setSkipped(true); onSkip(); }}
                  className="w-full mt-3 py-2 font-mono text-[10px] tracking-[0.28em] text-off-white/35 hover:text-off-white/50 uppercase transition-colors"
                >
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* RADAR SETUP - State 1: Quiet */}
          {screen === 'radar-setup' && (
            <motion.div key="radar-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              {/* Station Header */}
              <div className="pt-4 pb-2 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3.5 h-px" style={{ background: PHOS_DK }} />
                  <span className="font-mono text-[8px] tracking-[0.38em] uppercase font-bold" style={{ color: PHOS_DIM }}>
                    ◆ Signal Corps · U.S. Army
                  </span>
                  <div className="w-3.5 h-px" style={{ background: PHOS_DK }} />
                </div>
                <h3 className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] mb-0.5" style={{ color: PHOS, textShadow: `0 0 8px ${PHOS_GLOW}` }}>
                  Opana Point Radar
                </h3>
                <p className="font-mono text-[8px] tracking-[0.26em] text-off-white/35 uppercase font-semibold">
                  SCR-270-B · Scanning
                </p>
              </div>

              {/* CRT Housing */}
              <div className="flex justify-center px-4 py-2">
                <div
                  className="relative w-[280px] max-w-full aspect-square p-3.5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 20%, #3a2a1a 0%, #1a120a 40%, #0a0604 100%)',
                    boxShadow: `inset 0 0 0 1px rgba(230,171,42,0.25), inset 0 0 30px rgba(0,0,0,0.9), 0 0 0 3px #0a0604, 0 0 0 5px rgba(230,171,42,0.15), 0 0 60px ${PHOS_GLOW}, 0 20px 50px rgba(0,0,0,0.7)`,
                    animation: 'crtFlicker 3s infinite'
                  }}
                >
                  {/* Brass screws */}
                  {[
                    { top: '-3px', left: '14px' },
                    { top: '-3px', right: '14px' },
                    { bottom: '-3px', left: '14px' },
                    { bottom: '-3px', right: '14px' }
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-2.5 h-2.5 rounded-full z-10"
                      style={{
                        ...pos,
                        background: 'radial-gradient(circle at 35% 30%, #6a4a2a, #2a1a0a)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), 0 1px 1px rgba(230,171,42,0.15)'
                      }}
                    >
                      <div className="absolute inset-[3px] rounded-full" style={{ background: 'linear-gradient(45deg, transparent 45%, #4a3018 45%, #4a3018 55%, transparent 55%)' }} />
                    </div>
                  ))}

                  {/* CRT Screen */}
                  <div
                    className="relative w-full h-full rounded-full overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 40% 35%, rgba(74,255,158,0.04) 0%, rgba(26,64,40,0.2) 30%, rgba(5,16,8,0.95) 70%, #030906 100%)`,
                      boxShadow: `inset 0 0 40px rgba(0,0,0,0.9), inset 0 0 80px rgba(74,255,158,0.05), 0 0 0 1px rgba(74,255,158,0.15)`
                    }}
                  >
                    {/* Grid SVG */}
                    <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 200 200">
                      <g stroke={CRT_RING} strokeWidth="0.4" fill="none" opacity="0.7">
                        <line x1="100" y1="0" x2="100" y2="200" />
                        <line x1="0" y1="100" x2="200" y2="100" />
                        <line x1="13.4" y1="50" x2="186.6" y2="150" />
                        <line x1="50" y1="13.4" x2="150" y2="186.6" />
                        <line x1="50" y1="186.6" x2="150" y2="13.4" />
                        <line x1="13.4" y1="150" x2="186.6" y2="50" />
                      </g>
                      <g fill={PHOS_DIM} fontFamily="monospace" fontSize="5" fontWeight="700" textAnchor="middle" opacity="0.8">
                        <text x="100" y="8">N</text>
                        <text x="100" y="198">S</text>
                        <text x="5" y="102">W</text>
                        <text x="195" y="102">E</text>
                      </g>
                    </svg>

                    {/* Concentric rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] rounded-full border" style={{ borderColor: CRT_RING }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full border opacity-70" style={{ borderColor: CRT_RING }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full border opacity-50" style={{ borderColor: CRT_RING }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border-[1.5px] opacity-80" style={{ borderColor: PHOS_DK }} />

                    {/* Cross lines */}
                    <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={{ background: CRT_RING }} />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: CRT_RING }} />

                    {/* Labels */}
                    <div className="absolute top-[8%] left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.28em] uppercase font-bold" style={{ color: PHOS_DIM, textShadow: `0 0 4px ${PHOS_GLOW}` }}>
                      250 MI
                    </div>
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.28em] uppercase font-bold" style={{ color: PHOS_DIM, textShadow: `0 0 4px ${PHOS_GLOW}` }}>
                      OPANA
                    </div>

                    {/* Sweep beam */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-1/2 h-1/2 origin-top-left"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-[1.5px]"
                        style={{
                          background: `linear-gradient(90deg, ${PHOS} 0%, rgba(74,255,158,0.5) 30%, rgba(74,255,158,0.15) 70%, transparent 100%)`,
                          boxShadow: `0 0 6px ${PHOS_GLOW}, 0 0 12px rgba(74,255,158,0.3)`
                        }}
                      />
                      <div
                        className="absolute top-0 left-0 w-full h-full origin-top-left"
                        style={{ background: `conic-gradient(from 0deg at 0 0, rgba(74,255,158,0.15) 0deg, rgba(74,255,158,0.05) 20deg, transparent 45deg)` }}
                      />
                    </motion.div>

                    {/* Center dot */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10"
                      style={{ background: PHOS, boxShadow: `0 0 8px ${PHOS_GLOW}, 0 0 16px rgba(74,255,158,0.4)` }}
                    />

                    {/* Scanlines overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply"
                      style={{ background: 'repeating-linear-gradient(180deg, transparent 0, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 3px)' }}
                    />

                    {/* Glare */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 35%), radial-gradient(ellipse at 70% 85%, rgba(255,255,255,0.03) 0%, transparent 30%)' }}
                    />

                    {/* Vignette */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{ background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)' }}
                    />
                  </div>
                </div>
              </div>

              {/* State body */}
              <div className="flex-1 flex flex-col gap-3 px-5 pt-2">
                {/* Status indicator */}
                <div
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded"
                  style={{ background: 'rgba(74,255,158,0.05)', border: '1px solid rgba(74,255,158,0.18)' }}
                >
                  <motion.div
                    className="w-[7px] h-[7px] rounded-full"
                    style={{ background: PHOS, boxShadow: `0 0 6px ${PHOS_GLOW}` }}
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="font-mono text-[8.5px] tracking-[0.28em] uppercase font-bold" style={{ color: PHOS, textShadow: `0 0 4px rgba(74,255,158,0.3)` }}>
                    System Normal · Scanning
                  </span>
                </div>

                {/* Narrator */}
                <p className="font-serif italic text-sm text-off-white/70 text-center leading-relaxed px-1">
                  The SCR-270 was experimental technology. Most officers didn't trust it. You've been trained for only a few months.
                </p>

                {/* Tech card */}
                <div
                  className="rounded-md p-3 flex flex-col gap-1"
                  style={{ background: 'rgba(20,14,8,0.6)', border: '1px solid rgba(230,171,42,0.15)' }}
                >
                  {[
                    { label: 'Time', value: '7:02 AM HST' },
                    { label: 'Status', value: 'Shutdown passed' },
                    { label: 'Visibility', value: 'Clear morning' }
                  ].map((row, i) => (
                    <div key={i} className="flex items-center justify-between font-mono text-[9px] tracking-[0.16em] uppercase">
                      <span className="text-gold-2 font-bold">{row.label}</span>
                      <span className="text-off-white font-semibold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="px-5 pb-4 pt-3" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                <button
                  onClick={nextScreen}
                  className="relative w-full py-4 bg-gold-2 hover:bg-gold-1 text-void font-display text-[13px] font-bold tracking-[0.2em] uppercase rounded-full transition-colors"
                  style={{ boxShadow: '0 4px 14px rgba(230,171,42,0.25), inset 0 -2px 4px rgba(0,0,0,0.15)' }}
                >
                  {/* Corner decorations */}
                  <div className="absolute inset-1 pointer-events-none">
                    <div className="absolute top-0 left-5 w-2.5 h-2.5 border-l-[1.5px] border-t-[1.5px] border-black/30" />
                    <div className="absolute bottom-0 right-5 w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-black/30" />
                  </div>
                  Keep Watching
                </button>
              </div>
            </motion.div>
          )}

          {/* BLIP APPEARS - State 2: Alert */}
          {screen === 'blip-appears' && (
            <motion.div key="blip-appears" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full">
              {/* Station Header - Alert State */}
              <div className="pt-4 pb-2 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="w-3.5 h-px" style={{ background: ALERT_DIM }} />
                  <motion.span
                    className="font-mono text-[8px] tracking-[0.38em] uppercase font-bold"
                    style={{ color: ALERT }}
                    animate={{ opacity: [1, 0.35, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    ◆ Alert · Bearing Due North
                  </motion.span>
                  <div className="w-3.5 h-px" style={{ background: ALERT_DIM }} />
                </div>
                <motion.h3
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.22em] mb-0.5"
                  style={{ color: ALERT, textShadow: '0 0 8px rgba(255,56,56,0.5)' }}
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  Contact Detected
                </motion.h3>
                <p className="font-mono text-[8px] tracking-[0.26em] text-off-white/35 uppercase font-semibold">
                  SCR-270-B · Tracking
                </p>
              </div>

              {/* CRT Housing - Alert State */}
              <div className="flex justify-center px-4 py-2">
                <div
                  className="relative w-[280px] max-w-full aspect-square p-3.5 rounded-full"
                  style={{
                    background: 'radial-gradient(circle at 30% 20%, #3a2a1a 0%, #1a120a 40%, #0a0604 100%)',
                    boxShadow: `inset 0 0 0 1px rgba(255,56,56,0.25), inset 0 0 30px rgba(0,0,0,0.9), 0 0 0 3px #0a0604, 0 0 0 5px rgba(205,14,20,0.2), 0 0 60px rgba(255,56,56,0.12), 0 20px 50px rgba(0,0,0,0.7)`
                  }}
                >
                  {/* Brass screws */}
                  {[
                    { top: '-3px', left: '14px' },
                    { top: '-3px', right: '14px' },
                    { bottom: '-3px', left: '14px' },
                    { bottom: '-3px', right: '14px' }
                  ].map((pos, i) => (
                    <div
                      key={i}
                      className="absolute w-2.5 h-2.5 rounded-full z-10"
                      style={{
                        ...pos,
                        background: 'radial-gradient(circle at 35% 30%, #6a4a2a, #2a1a0a)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.6), 0 1px 1px rgba(230,171,42,0.15)'
                      }}
                    >
                      <div className="absolute inset-[3px] rounded-full" style={{ background: 'linear-gradient(45deg, transparent 45%, #4a3018 45%, #4a3018 55%, transparent 55%)' }} />
                    </div>
                  ))}

                  {/* CRT Screen */}
                  <div
                    className="relative w-full h-full rounded-full overflow-hidden"
                    style={{
                      background: `radial-gradient(circle at 40% 35%, rgba(74,255,158,0.04) 0%, rgba(26,64,40,0.2) 30%, rgba(5,16,8,0.95) 70%, #030906 100%)`,
                      boxShadow: `inset 0 0 40px rgba(0,0,0,0.9), inset 0 0 80px rgba(74,255,158,0.05), 0 0 0 1px rgba(74,255,158,0.15)`
                    }}
                  >
                    {/* Grid SVG */}
                    <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 200 200">
                      <g stroke={CRT_RING} strokeWidth="0.4" fill="none" opacity="0.7">
                        <line x1="100" y1="0" x2="100" y2="200" />
                        <line x1="0" y1="100" x2="200" y2="100" />
                        <line x1="13.4" y1="50" x2="186.6" y2="150" />
                        <line x1="50" y1="13.4" x2="150" y2="186.6" />
                        <line x1="50" y1="186.6" x2="150" y2="13.4" />
                        <line x1="13.4" y1="150" x2="186.6" y2="50" />
                      </g>
                      <g fill={PHOS_DIM} fontFamily="monospace" fontSize="5" fontWeight="700" textAnchor="middle" opacity="0.8">
                        <text x="100" y="8">N</text>
                        <text x="100" y="198">S</text>
                        <text x="5" y="102">W</text>
                        <text x="195" y="102">E</text>
                      </g>
                    </svg>

                    {/* Concentric rings */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[25%] h-[25%] rounded-full border" style={{ borderColor: CRT_RING }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] rounded-full border opacity-70" style={{ borderColor: CRT_RING }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full border opacity-50" style={{ borderColor: CRT_RING }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full border-[1.5px] opacity-80" style={{ borderColor: PHOS_DK }} />

                    {/* Cross lines */}
                    <div className="absolute top-1/2 left-0 right-0 h-px -translate-y-1/2" style={{ background: CRT_RING }} />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2" style={{ background: CRT_RING }} />

                    {/* Labels */}
                    <div className="absolute top-[8%] left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.28em] uppercase font-bold" style={{ color: PHOS_DIM, textShadow: `0 0 4px ${PHOS_GLOW}` }}>
                      250 MI
                    </div>
                    <div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 font-mono text-[7px] tracking-[0.28em] uppercase font-bold" style={{ color: PHOS_DIM, textShadow: `0 0 4px ${PHOS_GLOW}` }}>
                      OPANA
                    </div>

                    {/* Sweep beam */}
                    <motion.div
                      className="absolute top-1/2 left-1/2 w-1/2 h-1/2 origin-top-left"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
                    >
                      <div
                        className="absolute top-0 left-0 w-full h-[1.5px]"
                        style={{
                          background: `linear-gradient(90deg, ${PHOS} 0%, rgba(74,255,158,0.5) 30%, rgba(74,255,158,0.15) 70%, transparent 100%)`,
                          boxShadow: `0 0 6px ${PHOS_GLOW}, 0 0 12px rgba(74,255,158,0.3)`
                        }}
                      />
                      <div
                        className="absolute top-0 left-0 w-full h-full origin-top-left"
                        style={{ background: `conic-gradient(from 0deg at 0 0, rgba(74,255,158,0.15) 0deg, rgba(74,255,158,0.05) 20deg, transparent 45deg)` }}
                      />
                    </motion.div>

                    {/* Center dot */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full z-10"
                      style={{ background: PHOS, boxShadow: `0 0 8px ${PHOS_GLOW}, 0 0 16px rgba(74,255,158,0.4)` }}
                    />

                    {/* LIVE BLIPS */}
                    {liveBlips.map((blip) => {
                      const pos = polarToXY(blip.angle, blip.radius);
                      const sizeMap = { xs: 3, sm: 5, md: 8, lg: 11 };
                      const size = sizeMap[blip.size];
                      return (
                        <motion.div
                          key={blip.id}
                          className="absolute rounded-full z-[6] pointer-events-none"
                          initial={{ opacity: 0, scale: 0.2 }}
                          animate={{
                            opacity: [0.7, 1, 0.7],
                            scale: [1, 1.15, 1],
                            left: `${pos.x}%`,
                            top: `${pos.y}%`
                          }}
                          transition={{
                            opacity: { duration: 2 + (blip.id % 3) * 0.5, repeat: Infinity },
                            scale: { duration: 2 + (blip.id % 3) * 0.5, repeat: Infinity },
                            left: { duration: 1.2, ease: [0.4, 0, 0.2, 1] },
                            top: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
                          }}
                          style={{
                            width: size,
                            height: size,
                            marginLeft: -size / 2,
                            marginTop: -size / 2,
                            background: PHOS,
                            boxShadow: `0 0 ${size * 1.5}px ${PHOS_GLOW}, 0 0 ${size * 2}px rgba(74,255,158,0.5)`
                          }}
                        />
                      );
                    })}

                    {/* Scanlines overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20 mix-blend-multiply"
                      style={{ background: 'repeating-linear-gradient(180deg, transparent 0, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 3px)' }}
                    />

                    {/* Glare */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.06) 0%, transparent 35%), radial-gradient(ellipse at 70% 85%, rgba(255,255,255,0.03) 0%, transparent 30%)' }}
                    />

                    {/* Vignette */}
                    <div
                      className="absolute inset-0 pointer-events-none z-20"
                      style={{ background: 'radial-gradient(circle at 50% 50%, transparent 45%, rgba(0,0,0,0.65) 100%)' }}
                    />

                    {/* Alert wash */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none z-[21]"
                      style={{ background: 'radial-gradient(circle at 50% 50%, transparent 55%, rgba(205,14,20,0.08) 85%, rgba(205,14,20,0.15) 100%)' }}
                      animate={{ opacity: [1, 0.35, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </div>
                </div>
              </div>

              {/* State body - Alert */}
              <div className="flex-1 flex flex-col gap-3 px-5 pt-2">
                {/* Alert banner */}
                <motion.div
                  className="flex items-center justify-center gap-2.5 py-2.5 px-3 rounded"
                  style={{ background: 'rgba(255,56,56,0.08)', border: '1.5px solid rgba(255,56,56,0.4)' }}
                  animate={{ opacity: [1, 0.35, 1], x: [-1, 1, -1] }}
                  transition={{ opacity: { duration: 1.2, repeat: Infinity }, x: { duration: 0.4, repeat: Infinity } }}
                >
                  <AlertTriangle size={18} style={{ color: ALERT, filter: 'drop-shadow(0 0 6px rgba(255,56,56,0.6))' }} />
                  <span className="font-display text-[13px] font-bold uppercase tracking-[0.14em]" style={{ color: ALERT, textShadow: '0 0 8px rgba(255,56,56,0.5)' }}>
                    Massive Contact
                  </span>
                </motion.div>

                {/* Alert data panel */}
                <div
                  className="rounded-md p-3 flex flex-col gap-1.5 relative"
                  style={{ background: 'rgba(20,0,0,0.7)', border: '1px solid rgba(255,56,56,0.3)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ALERT}, transparent)` }} />
                  {[
                    { label: 'Bearing:', value: <><strong className="text-off-white font-bold">003°</strong> · Due North</> },
                    { label: 'Range:', value: <><span className="text-off-white font-bold">{estimatedRange}</span> miles<motion.span className="inline-block w-1.5 h-2.5 ml-0.5 align-middle" style={{ background: ALERT }} animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} /></> },
                    { label: 'Contacts:', value: <><span className="text-off-white font-bold">{blipCount || '—'}</span> <strong className="text-off-white">{blipCount === 0 ? 'tracking…' : blipCount < 6 ? 'inbound' : blipCount < 14 ? 'formation' : blipCount < 24 ? 'large formation' : 'massive'}</strong></> },
                    { label: 'Estimate:', value: <>50+ <strong className="text-off-white font-bold">maybe 180+</strong></> }
                  ].map((row, i) => (
                    <div key={i} className="flex items-baseline gap-2.5 font-mono text-[10px] leading-tight">
                      <span className="font-bold tracking-[0.12em] uppercase min-w-[70px] text-right flex-shrink-0" style={{ color: ALERT }}>{row.label}</span>
                      <span className="tracking-[0.04em] flex-1" style={{ color: '#FAF4E4' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA - Alert */}
              <div className="px-5 pb-4 pt-3" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                <button
                  onClick={nextScreen}
                  className="relative w-full py-4 bg-ha-red hover:bg-ha-red/90 text-cream font-display text-[13px] font-bold tracking-[0.2em] uppercase rounded-full transition-colors"
                  style={{ boxShadow: '0 4px 14px rgba(205,14,20,0.35), inset 0 -2px 4px rgba(0,0,0,0.25)' }}
                >
                  {/* Corner decorations */}
                  <div className="absolute inset-1 pointer-events-none">
                    <div className="absolute top-0 left-5 w-2.5 h-2.5 border-l-[1.5px] border-t-[1.5px] border-black/30" />
                    <div className="absolute bottom-0 right-5 w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-black/30" />
                  </div>
                  What Do You Do?
                </button>
              </div>
            </motion.div>
          )}

          {/* DECISION */}
          {screen === 'decision' && (
            <motion.div key="decision" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white mb-2">You Have 53 Minutes</h2>
                <p className="text-white/60 text-sm">The largest radar contact in history. What's your move?</p>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-4">
                {DECISION_OPTIONS.map((option) => (
                  <motion.button
                    key={option.id}
                    onClick={() => handleDecision(option.id)}
                    className="flex items-start gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/50 rounded-xl text-left transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-3xl">{option.icon}</span>
                    <div>
                      <h3 className="text-white font-bold mb-1">{option.label}</h3>
                      <p className="text-white/60 text-sm">{option.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* OUTCOME */}
          {screen === 'outcome' && selectedDecision && (
            <motion.div key="outcome" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className={`w-full max-w-sm rounded-2xl p-6 mb-6 ${OUTCOMES[selectedDecision].isHistorical ? 'bg-amber-500/10 border-2 border-amber-500' : 'bg-white/5 border border-white/10'}`}>
                  {OUTCOMES[selectedDecision].isHistorical && (
                    <div className="flex items-center gap-2 text-amber-400 mb-3">
                      <span className="text-sm font-bold uppercase">Historical Path</span>
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-4">{OUTCOMES[selectedDecision].title}</h3>
                  <p className="text-white/80 whitespace-pre-line leading-relaxed">{OUTCOMES[selectedDecision].content}</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 max-w-sm">
                  <p className="text-center text-white/60 text-sm">
                    <strong className="text-red-400">7:55 AM:</strong> First bombs fall on Pearl Harbor<br />
                    <strong className="text-amber-400">2,403</strong> Americans killed
                  </p>
                </div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  What Happened to Lockard?
                </button>
              </div>
            </motion.div>
          )}

          {/* LEGACY */}
          {screen === 'legacy' && (
            <motion.div key="legacy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Award size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Joseph Lockard's Legacy</h2>
                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <div className="space-y-4 text-left">
                    <div>
                      <p className="text-amber-400 font-bold">Distinguished Service Medal</p>
                      <p className="text-white/60 text-sm">For his actions on December 7, 1941</p>
                    </div>
                    <div>
                      <p className="text-amber-400 font-bold">Career in Electronics</p>
                      <p className="text-white/60 text-sm">Earned 35+ patents after the war</p>
                    </div>
                    <div>
                      <p className="text-amber-400 font-bold">Lifelong Advocate</p>
                      <p className="text-white/60 text-sm">Spoke about the importance of heeding warnings</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/70 max-w-sm italic">
                  "I did my job. I reported what I saw. The failure was in the system, not the soldiers."
                </p>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Complete Beat 2
                </button>
              </div>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="The Radar Blip"
              onComplete={() => goToScreen('completion')}
            />
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <XPCompletionScreen
              beatNumber={2}
              beatTitle="The Radar Blip"
              xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
              host={host}
              onContinue={nextScreen}
              nextBeatPreview="Tora! Tora! Tora! - Experience the attack"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

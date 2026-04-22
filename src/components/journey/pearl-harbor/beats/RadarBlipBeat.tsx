/**
 * Beat 2: The Radar Blip - 7:02 AM
 * Format: Branching Decision
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Step into Private Lockard's shoes at Opana Point
 * when he detected the incoming Japanese attack on radar.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Radio, Sparkles, Award, AlertTriangle } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';

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
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedDecision, setSelectedDecision] = useState<DecisionOption | null>(null);
  const [radarPulse, setRadarPulse] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

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
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  // Radar animation
  useEffect(() => {
    if (screen === 'radar-setup' || screen === 'blip-appears') {
      const interval = setInterval(() => {
        setRadarPulse((prev) => (prev + 1) % 360);
      }, 50);
      return () => clearInterval(interval);
    }
  }, [screen]);

  // Restore checkpoint
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.selectedDecision) {
          setSelectedDecision(checkpoint.state.selectedDecision);
        }
      }
    }
  }, []);

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

  const handleDecision = (decision: DecisionOption) => {
    setSelectedDecision(decision);
    nextScreen();
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
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
              onComplete={() => setScreen('intro')}
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

          {/* RADAR SETUP */}
          {screen === 'radar-setup' && (
            <motion.div key="radar-setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Radar Display */}
                <div className="relative w-64 h-64 rounded-full bg-black border-4 border-green-900 mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(0,50,0,0.3)_100%)]" />
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-green-900/50" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-green-900/50" />
                  </div>
                  {/* Sweep line */}
                  <motion.div
                    className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left"
                    style={{ rotate: radarPulse }}
                  />
                  {/* Center dot */}
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400" />
                  {/* Static noise */}
                  <div className="absolute inset-0 opacity-20">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-green-400"
                        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Opana Point Radar Station</h3>
                <p className="text-white/60 text-center max-w-sm mb-4">
                  The SCR-270 radar was experimental technology. Most officers didn't trust it. You've been trained for only a few months.
                </p>
                <div className="bg-white/5 rounded-xl p-4 max-w-sm">
                  <p className="text-white/70 text-sm">
                    <strong className="text-amber-400">Time:</strong> 7:02 AM<br />
                    <strong className="text-amber-400">Status:</strong> Scheduled shutdown passed<br />
                    <strong className="text-amber-400">Visibility:</strong> Clear morning
                  </p>
                </div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Keep Watching...
                </button>
              </div>
            </motion.div>
          )}

          {/* BLIP APPEARS */}
          {screen === 'blip-appears' && (
            <motion.div key="blip-appears" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Radar with massive blip swarm */}
                <div className="relative w-64 h-64 rounded-full bg-black border-4 border-green-900 mb-6 overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(0,50,0,0.3)_100%)]" />
                  <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-green-900/50" /></div>
                  <div className="absolute inset-0 flex items-center justify-center"><div className="h-full w-px bg-green-900/50" /></div>
                  <motion.div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 bg-gradient-to-r from-green-400 to-transparent origin-left" style={{ rotate: radarPulse }} />
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-green-400" />
                  {/* MASSIVE ATTACK - 20 blips representing incoming Japanese aircraft */}
                  {attackBlips.map((blip) => (
                    <motion.div
                      key={`blip-${blip.id}`}
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        scale: [0.9, 1.2, 0.9]
                      }}
                      transition={{
                        duration: blip.duration,
                        repeat: Infinity,
                        delay: blip.delay,
                        ease: "easeInOut"
                      }}
                      className="absolute rounded-full bg-green-400"
                      style={{
                        top: `${blip.top}%`,
                        left: `${blip.left}%`,
                        width: `${blip.size}px`,
                        height: `${blip.size}px`,
                        boxShadow: `0 0 ${blip.size * 2}px rgba(74,222,128,0.8), 0 0 ${blip.size}px rgba(74,222,128,1)`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  ))}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                  <div className="flex items-center justify-center gap-2 text-red-400 mb-3">
                    <AlertTriangle size={24} />
                    <span className="font-bold text-lg">MASSIVE CONTACT DETECTED</span>
                  </div>
                  <div className="bg-red-500/10 rounded-xl p-4 max-w-sm border border-red-500/30 mb-4">
                    <p className="text-white font-mono text-sm">
                      <span className="text-red-400">BEARING:</span> Due North<br />
                      <span className="text-red-400">RANGE:</span> 137 miles<br />
                      <span className="text-red-400">SIZE:</span> Largest contact ever seen<br />
                      <span className="text-red-400">ESTIMATE:</span> 50+ aircraft... maybe 180+
                    </p>
                  </div>
                  <p className="text-white/70 text-sm max-w-sm">
                    This is no flock of birds. This is bigger than anything you've ever seen on the scope. Your heart races as you double-check the readings.
                  </p>
                </motion.div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-colors">
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">📡</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 2 Complete!</h2>
                <p className="text-white/60 mb-6">The Radar Blip - 7:02 AM</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Tora! Tora! Tora! - Experience the attack minute by minute
                </p>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
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

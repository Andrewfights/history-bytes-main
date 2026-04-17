/**
 * Beat 3: Tora! Tora! Tora! - The Attack Begins
 * Format: Interactive Map + Timeline Scrubber + Audio Experience
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Experience the attack minute by minute through an
 * interactive timeline and map of Pearl Harbor.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Clock, MapPin, Volume2, VolumeX } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useWW2ModuleAssets } from '../hooks/useWW2ModuleAssets';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';

// Media keys from WW2ModuleEditor
const MEDIA_KEYS = {
  aerialMap: 'pearl-harbor-aerial-map-showing-attack-routes',
  attackSounds: 'period-accurate-attack-sounds-optional',
};

type Screen = 'pre-video' | 'intro' | 'map-overview' | 'timeline' | 'hotspots' | 'reflection' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'map-overview', 'timeline', 'hotspots', 'reflection', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-3',
  xpReward: 50,
};

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  icon: string;
  position: { x: number; y: number };
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '7:48 AM',
    title: 'First Wave Arrives',
    description: 'Commander Fuchida leads 183 aircraft over Kahuku Point. Surprise is complete.',
    icon: '✈️',
    position: { x: 50, y: 15 },
  },
  {
    time: '7:53 AM',
    title: '"Tora! Tora! Tora!"',
    description: 'Fuchida signals complete surprise achieved. The code word "Tora" (Tiger) is transmitted to the Japanese fleet.',
    icon: '📻',
    position: { x: 30, y: 25 },
  },
  {
    time: '7:55 AM',
    title: 'Torpedo Planes Strike',
    description: 'Kate torpedo bombers attack Battleship Row. Multiple battleships hit in the first minutes.',
    icon: '💥',
    position: { x: 55, y: 50 },
  },
  {
    time: '8:10 AM',
    title: 'USS Arizona Explodes',
    description: 'A 1,760-pound bomb penetrates the forward magazine. 1,177 sailors killed in seconds.',
    icon: '🔥',
    position: { x: 52, y: 55 },
  },
  {
    time: '8:54 AM',
    title: 'Second Wave',
    description: '170 additional aircraft arrive. Focus shifts to airfields and remaining ships.',
    icon: '✈️',
    position: { x: 45, y: 20 },
  },
  {
    time: '9:30 AM',
    title: 'USS Shaw Explodes',
    description: 'The destroyer USS Shaw\'s forward magazine detonates, creating one of the most photographed explosions of the attack.',
    icon: '💥',
    position: { x: 50, y: 60 },
  },
];

interface MapHotspot {
  id: string;
  name: string;
  description: string;
  casualties: string;
  position: { x: number; y: number };
}

const MAP_HOTSPOTS: MapHotspot[] = [
  {
    id: 'arizona',
    name: 'USS Arizona',
    description: 'Sunk by bomb. Forward magazine explosion.',
    casualties: '1,177 killed',
    position: { x: 52, y: 55 },
  },
  {
    id: 'oklahoma',
    name: 'USS Oklahoma',
    description: '9 torpedoes. Capsized in 12 minutes.',
    casualties: '429 killed',
    position: { x: 48, y: 52 },
  },
  {
    id: 'west-virginia',
    name: 'USS West Virginia',
    description: '7 torpedoes, 2 bombs. Sank upright.',
    casualties: '106 killed',
    position: { x: 54, y: 58 },
  },
  {
    id: 'wheeler',
    name: 'Wheeler Field',
    description: 'Aircraft parked wingtip-to-wingtip. Two-thirds destroyed on the ground.',
    casualties: '37 killed',
    position: { x: 35, y: 35 },
  },
  {
    id: 'hickam',
    name: 'Hickam Field',
    description: 'Army Air Corps base. Heavy bombing during both waves.',
    casualties: '139 killed',
    position: { x: 58, y: 70 },
  },
];

interface ToraToraToraBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function ToraToraToraBeat({ host, onComplete, onSkip, onBack, isPreview = false }: ToraToraToraBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [viewedHotspots, setViewedHotspots] = useState<Set<string>>(new Set());
  const [selectedHotspot, setSelectedHotspot] = useState<MapHotspot | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();
  const { getMediaUrl } = useWW2ModuleAssets();

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
      const shouldShowPreVideo = (isPreview || !checkpoint?.lessonId) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  // Get uploaded media URLs
  const aerialMapUrl = getMediaUrl('ph-beat-3', MEDIA_KEYS.aerialMap);
  const attackSoundsUrl = getMediaUrl('ph-beat-3', MEDIA_KEYS.attackSounds);

  // Handle attack sounds audio
  useEffect(() => {
    if (attackSoundsUrl && audioEnabled && screen === 'timeline') {
      if (!audioRef.current) {
        audioRef.current = new Audio(attackSoundsUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = 0.3;
      }
      audioRef.current.play().catch(console.error);
    } else if (audioRef.current) {
      audioRef.current.pause();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [attackSoundsUrl, audioEnabled, screen]);

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.viewedHotspots) {
          setViewedHotspots(new Set(checkpoint.state.viewedHotspots));
        }
        if (checkpoint.state?.currentEventIndex !== undefined) {
          setCurrentEventIndex(checkpoint.state.currentEventIndex);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {
          viewedHotspots: Array.from(viewedHotspots),
          currentEventIndex,
        },
      });
    }
  }, [screen, viewedHotspots, currentEventIndex, saveCheckpoint]);

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

  const handleHotspotClick = (hotspot: MapHotspot) => {
    setSelectedHotspot(hotspot);
    setViewedHotspots((prev) => new Set([...prev, hotspot.id]));
  };

  const allHotspotsViewed = viewedHotspots.size >= 3; // Require at least 3

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Tora! Tora! Tora!</h1>
          <p className="text-white/50 text-xs">Beat 3 of 10</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img src={host.avatarUrl || '/assets/hosts/default.png'} alt={host.name} className="w-full h-full object-cover" />
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
              beatTitle="Tora! Tora! Tora!"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">✈️</motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">The Attack Begins</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  At 7:48 AM, the first wave of 183 Japanese aircraft swept over Oahu. In less than two hours, the Pacific Fleet would be devastated.
                </p>
                <div className="bg-red-500/10 rounded-xl p-4 max-w-sm border border-red-500/30">
                  <p className="text-red-300 font-mono text-lg text-center">
                    "AIR RAID PEARL HARBOR.<br/>THIS IS NOT A DRILL."
                  </p>
                  <p className="text-white/50 text-xs mt-2 text-center">— First radio transmission, 7:58 AM</p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Experience the Attack
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* MAP OVERVIEW */}
          {screen === 'map-overview' && (
            <motion.div key="map-overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <h3 className="text-lg font-bold text-white mb-4">Pearl Harbor - December 7, 1941</h3>
                {/* Map - Use uploaded image or fallback to stylized version */}
                <div className="relative w-full max-w-sm aspect-square bg-blue-900/30 rounded-2xl border border-white/10 mb-4 overflow-hidden">
                  {aerialMapUrl ? (
                    <img
                      src={aerialMapUrl}
                      alt="Pearl Harbor aerial map"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      {/* Water */}
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-800/20 to-blue-900/40" />
                      {/* Ford Island */}
                      <div className="absolute top-[40%] left-[40%] w-[25%] h-[30%] bg-green-800/50 rounded-full transform -rotate-12" />
                      {/* Battleship Row indicator */}
                      <div className="absolute top-[45%] left-[48%] w-[8%] h-[25%] bg-gray-600/50 rounded" />
                    </>
                  )}
                  {/* Labels - always show */}
                  <div className="absolute top-[35%] left-[42%] text-white/60 text-xs drop-shadow-lg">Ford Island</div>
                  <div className="absolute top-[50%] left-[58%] text-amber-400 text-xs font-bold drop-shadow-lg">Battleship Row</div>
                  <div className="absolute top-[25%] left-[25%] text-white/60 text-xs drop-shadow-lg">Wheeler Field</div>
                  <div className="absolute top-[75%] left-[55%] text-white/60 text-xs drop-shadow-lg">Hickam Field</div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 max-w-sm">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-amber-400" /> Key Locations
                  </h4>
                  <ul className="text-white/70 text-sm space-y-1">
                    <li>• <strong>Battleship Row:</strong> 8 battleships moored</li>
                    <li>• <strong>Ford Island:</strong> Naval Air Station</li>
                    <li>• <strong>Wheeler/Hickam:</strong> Army Air Corps bases</li>
                  </ul>
                </div>
              </div>
              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  See the Timeline
                </button>
              </div>
            </motion.div>
          )}

          {/* TIMELINE */}
          {screen === 'timeline' && (
            <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Clock size={20} className="text-amber-400" /> Attack Timeline
                </h3>
                <button onClick={() => setAudioEnabled(!audioEnabled)} className="p-2 text-white/40 hover:text-white">
                  {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
              </div>

              {/* Timeline events */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {TIMELINE_EVENTS.map((event, index) => {
                  const isCurrentEvent = index === currentEventIndex;
                  const isPastEvent = index < currentEventIndex;
                  const isActive = index <= currentEventIndex;

                  return (
                    <motion.div
                      key={event.time}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: isActive ? 1 : 0.3,
                        x: 0,
                        scale: isCurrentEvent ? 1.02 : 1,
                      }}
                      transition={{
                        delay: index * 0.05,
                        type: 'spring',
                        stiffness: 300,
                        damping: 25,
                      }}
                      className={`relative p-4 rounded-xl border transition-colors ${
                        isCurrentEvent
                          ? 'bg-amber-500/15 border-amber-400'
                          : isPastEvent
                          ? 'bg-green-500/10 border-green-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      {/* Pulse glow for current event */}
                      {isCurrentEvent && (
                        <motion.div
                          className="absolute inset-0 rounded-xl border-2 border-amber-400"
                          animate={{ opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                      )}
                      <div className="flex items-start gap-3 relative z-10">
                        <motion.span
                          className="text-2xl"
                          animate={isCurrentEvent ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.6, repeat: isCurrentEvent ? Infinity : 0, repeatDelay: 1 }}
                        >
                          {event.icon}
                        </motion.span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`font-mono font-bold ${isCurrentEvent ? 'text-amber-300' : 'text-amber-400'}`}>
                              {event.time}
                            </span>
                            <span className="text-white font-bold">{event.title}</span>
                            {isPastEvent && <span className="text-green-400 text-xs">✓</span>}
                          </div>
                          <p className="text-white/60 text-sm">{event.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Timeline scrubber - Enhanced */}
              <div className="mt-4 mb-2">
                {/* Custom track with glow effect */}
                <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full"
                    style={{ width: `${(currentEventIndex / (TIMELINE_EVENTS.length - 1)) * 100}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                  <motion.div
                    className="absolute h-full w-full bg-amber-400/20"
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={TIMELINE_EVENTS.length - 1}
                  value={currentEventIndex}
                  onChange={(e) => setCurrentEventIndex(parseInt(e.target.value))}
                  className="w-full -mt-2 relative z-10 opacity-0 cursor-pointer h-6"
                  style={{ WebkitAppearance: 'none' }}
                />
                {/* Time markers */}
                <div className="flex justify-between text-white/40 text-[10px] mt-1 px-1">
                  {TIMELINE_EVENTS.map((event, idx) => (
                    <motion.span
                      key={event.time}
                      className={`${idx === currentEventIndex ? 'text-amber-400 font-bold' : ''}`}
                      animate={{ scale: idx === currentEventIndex ? 1.1 : 1 }}
                    >
                      {event.time.replace(' AM', '')}
                    </motion.span>
                  ))}
                </div>
              </div>

              <button
                onClick={nextScreen}
                disabled={currentEventIndex < TIMELINE_EVENTS.length - 1}
                className={`w-full py-4 font-bold rounded-xl transition-colors ${currentEventIndex >= TIMELINE_EVENTS.length - 1 ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/10 text-white/30'}`}
              >
                {currentEventIndex >= TIMELINE_EVENTS.length - 1 ? 'Explore the Damage' : 'Scrub Through Timeline'}
              </button>
            </motion.div>
          )}

          {/* HOTSPOTS */}
          {screen === 'hotspots' && (
            <motion.div key="hotspots" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-4">
              <motion.div
                className="mb-4 text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-lg font-bold text-white mb-1">Explore the Damage</h3>
                <p className="text-white/60 text-sm">Tap locations to learn about casualties</p>
              </motion.div>

              {/* Map with hotspots - Enhanced */}
              <motion.div
                className="relative flex-1 bg-blue-900/30 rounded-2xl border border-white/10 overflow-hidden"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                {aerialMapUrl ? (
                  <img
                    src={aerialMapUrl}
                    alt="Pearl Harbor aerial map"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-800/20 to-blue-900/40" />
                    <div className="absolute top-[40%] left-[40%] w-[25%] h-[30%] bg-green-800/50 rounded-full transform -rotate-12" />
                  </>
                )}

                {MAP_HOTSPOTS.map((hotspot, index) => {
                  const isViewed = viewedHotspots.has(hotspot.id);
                  return (
                    <motion.button
                      key={hotspot.id}
                      onClick={() => handleHotspotClick(hotspot)}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${hotspot.position.x}%`, top: `${hotspot.position.y}%` }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, type: 'spring', stiffness: 300 }}
                    >
                      {/* Outer ripple ring for unviewed */}
                      {!isViewed && (
                        <motion.div
                          className="absolute inset-[-8px] rounded-full border-2 border-red-400"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                        />
                      )}
                      {/* Glow effect */}
                      <motion.div
                        className={`absolute inset-[-4px] rounded-full ${isViewed ? 'bg-amber-400/30' : 'bg-red-500/40'}`}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                      {/* Main button */}
                      <div
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center ${isViewed ? 'bg-amber-500' : 'bg-red-500'} shadow-lg`}
                      >
                        <motion.span
                          className="text-white text-xs font-bold"
                          animate={!isViewed ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        >
                          {isViewed ? '✓' : '!'}
                        </motion.span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>

              {/* Hotspot detail modal - Enhanced */}
              <AnimatePresence>
                {selectedHotspot && (
                  <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="absolute bottom-20 left-4 right-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-5 border border-white/20 shadow-2xl"
                  >
                    <motion.div
                      className="absolute inset-0 rounded-2xl border border-red-500/30"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <button onClick={() => setSelectedHotspot(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-colors">✕</button>
                    <motion.h4
                      className="text-white font-bold text-lg mb-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {selectedHotspot.name}
                    </motion.h4>
                    <motion.p
                      className="text-white/70 text-sm mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {selectedHotspot.description}
                    </motion.p>
                    <motion.p
                      className="text-red-400 font-bold text-lg"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                    >
                      {selectedHotspot.casualties}
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress - Enhanced */}
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  {MAP_HOTSPOTS.map((h) => (
                    <motion.div
                      key={h.id}
                      className={`w-2 h-2 rounded-full ${viewedHotspots.has(h.id) ? 'bg-amber-400' : 'bg-white/20'}`}
                      animate={viewedHotspots.has(h.id) ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    />
                  ))}
                </div>
                <p className="text-white/40 text-sm">
                  {viewedHotspots.size}/{MAP_HOTSPOTS.length} locations explored
                </p>
              </motion.div>

              <motion.button
                onClick={nextScreen}
                disabled={!allHotspotsViewed}
                className={`mt-4 w-full py-4 font-bold rounded-xl transition-colors ${allHotspotsViewed ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/10 text-white/30'}`}
                animate={allHotspotsViewed ? { scale: [1, 1.02, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {allHotspotsViewed ? 'Continue' : `Explore ${3 - viewedHotspots.size} more locations`}
              </motion.button>
            </motion.div>
          )}

          {/* REFLECTION */}
          {screen === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 relative"
                >
                  <motion.div
                    className="absolute inset-0 rounded-full bg-red-500/10"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <span className="text-4xl">🕯️</span>
                </motion.div>
                <motion.h2
                  className="text-2xl font-bold text-white mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  The Cost
                </motion.h2>
                <motion.div
                  className="bg-white/5 rounded-2xl p-6 max-w-sm border border-white/10 relative overflow-hidden"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {/* Subtle shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                  />
                  <div className="grid grid-cols-2 gap-4 text-center relative z-10">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.p
                        className="text-3xl font-bold text-red-400"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                      >
                        2,403
                      </motion.p>
                      <p className="text-white/50 text-sm">Americans Killed</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <motion.p
                        className="text-3xl font-bold text-amber-400"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                      >
                        1,178
                      </motion.p>
                      <p className="text-white/50 text-sm">Wounded</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <motion.p
                        className="text-3xl font-bold text-white"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
                      >
                        21
                      </motion.p>
                      <p className="text-white/50 text-sm">Ships Sunk/Damaged</p>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <motion.p
                        className="text-3xl font-bold text-white"
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                      >
                        188
                      </motion.p>
                      <p className="text-white/50 text-sm">Aircraft Destroyed</p>
                    </motion.div>
                  </div>
                </motion.div>
                <motion.p
                  className="text-white/60 mt-6 max-w-sm text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  Japanese losses: 64 killed, 29 aircraft, 5 midget submarines. The attack lasted 110 minutes.
                </motion.p>
              </div>
              <motion.button
                onClick={nextScreen}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                Complete Beat 3
              </motion.button>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Tora! Tora! Tora! - The Attack Begins"
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
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">✈️</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 3 Complete!</h2>
                <p className="text-white/60 mb-6">Tora! Tora! Tora! - The Attack Begins</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Voices from the Harbor - Hear from those who lived through it
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

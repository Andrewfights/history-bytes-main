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
import { ArrowLeft, Sparkles, Clock, MapPin, ChevronRight } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useWW2ModuleAssets } from '../hooks/useWW2ModuleAssets';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';

type Screen = 'pre-video' | 'intro' | 'timeline-map' | 'cost-summary' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'timeline-map', 'cost-summary', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-3',
  xpReward: 55,
};

// Timeline runs from 7:48 AM to 9:45 AM = 117 minutes total
const TIMELINE_START_MINUTES = 7 * 60 + 48; // 468 minutes from midnight
const TIMELINE_DURATION = 117; // 9:45 - 7:48 = 117 minutes

interface TimelineEvent {
  time: string;
  minutes: number; // Minutes from 7:48 (0-117)
  title: string;
  description: string;
  icon: string;
  type: 'wave' | 'explosion' | 'damage' | 'signal';
  coordinates: { x: number; y: number };
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    time: '7:48 AM',
    minutes: 0,
    title: 'First Wave Arrives',
    description: 'Commander Fuchida leads 183 aircraft over Kahuku Point. Complete surprise achieved.',
    icon: '✈️',
    type: 'wave',
    coordinates: { x: 50, y: 10 },
  },
  {
    time: '7:53 AM',
    minutes: 5,
    title: '"Tora! Tora! Tora!"',
    description: 'Fuchida signals complete surprise. The code word is transmitted to the Japanese fleet.',
    icon: '📻',
    type: 'signal',
    coordinates: { x: 45, y: 25 },
  },
  {
    time: '7:55 AM',
    minutes: 7,
    title: 'Torpedo Planes Strike',
    description: 'Kate torpedo bombers target Battleship Row. Multiple battleships hit.',
    icon: '💥',
    type: 'explosion',
    coordinates: { x: 55, y: 50 },
  },
  {
    time: '8:06 AM',
    minutes: 18,
    title: 'USS Oklahoma Capsizes',
    description: 'Hit by 9 torpedoes, the Oklahoma rolls over in just 12 minutes. 429 men trapped inside.',
    icon: '🚢',
    type: 'damage',
    coordinates: { x: 48, y: 52 },
  },
  {
    time: '8:10 AM',
    minutes: 22,
    title: 'USS Arizona Explodes',
    description: 'A 1,760-pound bomb penetrates the forward magazine. 1,177 sailors killed in seconds.',
    icon: '🔥',
    type: 'explosion',
    coordinates: { x: 52, y: 55 },
  },
  {
    time: '8:25 AM',
    minutes: 37,
    title: 'Wheeler Field Hit',
    description: 'Aircraft parked wingtip-to-wingtip destroyed. Two-thirds of planes never get airborne.',
    icon: '✈️',
    type: 'damage',
    coordinates: { x: 35, y: 35 },
  },
  {
    time: '8:54 AM',
    minutes: 66,
    title: 'Second Wave Arrives',
    description: '170 additional aircraft arrive. Focus shifts to airfields and remaining ships.',
    icon: '✈️',
    type: 'wave',
    coordinates: { x: 50, y: 15 },
  },
  {
    time: '9:30 AM',
    minutes: 102,
    title: 'USS Shaw Explodes',
    description: "The destroyer's forward magazine detonates, creating one of the most photographed explosions.",
    icon: '💥',
    type: 'explosion',
    coordinates: { x: 50, y: 60 },
  },
  {
    time: '9:45 AM',
    minutes: 117,
    title: 'Attack Concludes',
    description: 'Japanese aircraft withdraw. In 110 minutes, the Pacific Fleet has been devastated.',
    icon: '🏁',
    type: 'signal',
    coordinates: { x: 50, y: 5 },
  },
];

interface MapHotspot {
  id: string;
  name: string;
  description: string;
  casualties: number;
  type: 'ship' | 'airfield' | 'base';
  position: { x: number; y: number };
  unlocksAtMinute: number; // When this hotspot becomes tappable
}

const MAP_HOTSPOTS: MapHotspot[] = [
  {
    id: 'arizona',
    name: 'USS Arizona',
    description: 'Forward magazine explosion. Sank in 9 minutes.',
    casualties: 1177,
    type: 'ship',
    position: { x: 52, y: 55 },
    unlocksAtMinute: 22,
  },
  {
    id: 'oklahoma',
    name: 'USS Oklahoma',
    description: 'Hit by 9 torpedoes. Capsized in 12 minutes.',
    casualties: 429,
    type: 'ship',
    position: { x: 48, y: 52 },
    unlocksAtMinute: 18,
  },
  {
    id: 'west-virginia',
    name: 'USS West Virginia',
    description: '7 torpedoes, 2 bombs. Sank upright at moorings.',
    casualties: 106,
    type: 'ship',
    position: { x: 54, y: 58 },
    unlocksAtMinute: 7,
  },
  {
    id: 'california',
    name: 'USS California',
    description: 'Two torpedo hits. Slowly flooded and sank.',
    casualties: 98,
    type: 'ship',
    position: { x: 56, y: 62 },
    unlocksAtMinute: 7,
  },
  {
    id: 'nevada',
    name: 'USS Nevada',
    description: 'Only battleship to get underway during attack.',
    casualties: 60,
    type: 'ship',
    position: { x: 58, y: 65 },
    unlocksAtMinute: 66,
  },
  {
    id: 'wheeler',
    name: 'Wheeler Field',
    description: 'Army Air Corps base. Aircraft destroyed on ground.',
    casualties: 37,
    type: 'airfield',
    position: { x: 35, y: 35 },
    unlocksAtMinute: 37,
  },
  {
    id: 'hickam',
    name: 'Hickam Field',
    description: 'Army airfield. Heavy bombing during both waves.',
    casualties: 121,
    type: 'airfield',
    position: { x: 58, y: 70 },
    unlocksAtMinute: 7,
  },
  {
    id: 'ford-island',
    name: 'Ford Island',
    description: 'Naval Air Station at the center of Pearl Harbor.',
    casualties: 33,
    type: 'base',
    position: { x: 45, y: 45 },
    unlocksAtMinute: 7,
  },
];

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
  const [currentMinute, setCurrentMinute] = useState(0);
  const [viewedHotspots, setViewedHotspots] = useState<Set<string>>(new Set());
  const [selectedHotspot, setSelectedHotspot] = useState<MapHotspot | null>(null);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const scrubberRef = useRef<HTMLDivElement>(null);
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
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  // Get uploaded media URLs
  const aerialMapUrl = getMediaUrl('ph-beat-4', 'pearl-harbor-aerial-map');

  // Load checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.viewedHotspots) {
          setViewedHotspots(new Set(checkpoint.state.viewedHotspots));
        }
        if (checkpoint.state?.currentMinute !== undefined) {
          setCurrentMinute(checkpoint.state.currentMinute);
        }
      }
    }
  }, []);

  // Save checkpoint on screen/state change
  useEffect(() => {
    if (screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {
          viewedHotspots: Array.from(viewedHotspots),
          currentMinute,
        },
      });
    }
  }, [screen, viewedHotspots, currentMinute, saveCheckpoint]);

  // Auto-play timeline
  useEffect(() => {
    if (isAutoPlaying && currentMinute < TIMELINE_DURATION) {
      const timer = setTimeout(() => {
        setCurrentMinute(prev => Math.min(prev + 1, TIMELINE_DURATION));
      }, 100); // Faster playback
      return () => clearTimeout(timer);
    } else if (currentMinute >= TIMELINE_DURATION) {
      setIsAutoPlaying(false);
    }
  }, [isAutoPlaying, currentMinute]);

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
    if (currentMinute >= hotspot.unlocksAtMinute) {
      setSelectedHotspot(hotspot);
      setViewedHotspots((prev) => new Set([...prev, hotspot.id]));
    }
  };

  // Timeline scrubber handlers
  const handleScrub = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!scrubberRef.current) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setCurrentMinute(Math.round(percent * TIMELINE_DURATION));
    setIsAutoPlaying(false);
  }, []);

  const handleScrubStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    handleScrub(e);
  }, [handleScrub]);

  // Drag event listeners for smooth scrubbing
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      handleScrub(e);
    };
    const handleEnd = () => setIsDragging(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, handleScrub]);

  // Format time from minutes
  const formatTime = (minutes: number) => {
    const totalMinutes = TIMELINE_START_MINUTES + minutes;
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${mins.toString().padStart(2, '0')} ${period}`;
  };

  // Get current active events
  const activeEvents = TIMELINE_EVENTS.filter(event => currentMinute >= event.minutes);
  const currentEvent = TIMELINE_EVENTS.find(event =>
    currentMinute >= event.minutes &&
    (TIMELINE_EVENTS.indexOf(event) === TIMELINE_EVENTS.length - 1 ||
     currentMinute < TIMELINE_EVENTS[TIMELINE_EVENTS.indexOf(event) + 1]?.minutes)
  );

  // Get available hotspots
  const availableHotspots = MAP_HOTSPOTS.filter(h => currentMinute >= h.unlocksAtMinute);
  const allTimelineComplete = currentMinute >= TIMELINE_DURATION;
  const minHotspotsViewed = viewedHotspots.size >= 4; // Require at least 4

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
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
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Explore the Timeline
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* TIMELINE-MAP */}
          {screen === 'timeline-map' && (
            <motion.div key="timeline-map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-4">
              {/* Current time display */}
              <div className="text-center mb-3">
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/30"
                  animate={{ scale: isAutoPlaying ? [1, 1.02, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Clock size={16} className="text-amber-400" />
                  <span className="text-amber-400 font-mono font-bold text-lg">{formatTime(currentMinute)}</span>
                </motion.div>
              </div>

              {/* Current event card */}
              <AnimatePresence mode="wait">
                {currentEvent && (
                  <motion.div
                    key={currentEvent.time}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white/5 rounded-xl p-3 mb-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{currentEvent.icon}</span>
                      <span className="text-amber-400 font-mono text-sm">{currentEvent.time}</span>
                      <span className="text-white font-bold">{currentEvent.title}</span>
                    </div>
                    <p className="text-white/60 text-sm">{currentEvent.description}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Map with hotspots and event markers */}
              <div className="relative flex-1 bg-blue-900/30 rounded-2xl border border-white/10 overflow-hidden mb-3">
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
                    <div className="absolute top-[35%] left-[42%] text-white/60 text-xs">Ford Island</div>
                    <div className="absolute top-[50%] left-[52%] text-amber-400 text-xs font-bold">Battleship Row</div>
                  </>
                )}

                {/* Event markers on map */}
                {activeEvents.map((event, index) => (
                  <motion.div
                    key={event.time}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${event.coordinates.x}%`, top: `${event.coordinates.y}%` }}
                  >
                    {event.type === 'explosion' && (
                      <motion.div
                        className="w-6 h-6 rounded-full bg-red-500/50 flex items-center justify-center"
                        animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <span className="text-xs">💥</span>
                      </motion.div>
                    )}
                    {event.type === 'wave' && (
                      <motion.div
                        className="text-lg"
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        ✈️
                      </motion.div>
                    )}
                    {event.type === 'damage' && (
                      <motion.div
                        className="w-4 h-4 rounded-full bg-orange-500/70"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                ))}

                {/* Hotspots */}
                {MAP_HOTSPOTS.map((hotspot) => {
                  const isAvailable = currentMinute >= hotspot.unlocksAtMinute;
                  const isViewed = viewedHotspots.has(hotspot.id);

                  if (!isAvailable) return null;

                  return (
                    <motion.button
                      key={hotspot.id}
                      onClick={() => handleHotspotClick(hotspot)}
                      className="absolute -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${hotspot.position.x}%`, top: `${hotspot.position.y}%` }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {!isViewed && (
                        <motion.div
                          className="absolute inset-[-6px] rounded-full border-2 border-amber-400"
                          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shadow-lg ${
                          isViewed ? 'bg-green-500' : 'bg-amber-500'
                        }`}
                      >
                        {isViewed ? '✓' : <MapPin size={12} />}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Timeline scrubber - Redesigned for better UX */}
              <div className="mb-4">
                {/* Scrubber track with large touch area */}
                <div
                  ref={scrubberRef}
                  onClick={handleScrub}
                  onMouseDown={handleScrubStart}
                  onTouchStart={handleScrubStart}
                  className="relative h-12 flex items-center cursor-pointer select-none"
                >
                  {/* Track background */}
                  <div className="absolute inset-x-0 h-2 bg-white/10 rounded-full" />

                  {/* Progress fill with glow */}
                  <motion.div
                    className="absolute left-0 h-2 bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                    style={{
                      width: `${(currentMinute / TIMELINE_DURATION) * 100}%`,
                      boxShadow: '0 0 12px rgba(245, 158, 11, 0.4)'
                    }}
                  />

                  {/* Event markers - larger and more visible */}
                  {TIMELINE_EVENTS.map((event) => (
                    <div
                      key={event.time}
                      className={`absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full border-2 transition-all duration-200 ${
                        currentMinute >= event.minutes
                          ? 'bg-white border-white scale-100'
                          : 'bg-transparent border-white/40 scale-75'
                      }`}
                      style={{ left: `${(event.minutes / TIMELINE_DURATION) * 100}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  ))}

                  {/* Draggable thumb with pulse animation */}
                  <motion.div
                    className="absolute top-1/2 w-6 h-6 bg-white rounded-full shadow-lg border-2 border-amber-500 z-10 pointer-events-none"
                    style={{
                      left: `${(currentMinute / TIMELINE_DURATION) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    animate={!isDragging ? { scale: [1, 1.15, 1] } : { scale: 1.1 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                </div>

                {/* Time labels - larger and clearer */}
                <div className="flex justify-between text-white/50 text-xs font-medium px-1 mt-1">
                  <span>7:48 AM</span>
                  <span>8:15</span>
                  <span>8:45</span>
                  <span>9:15</span>
                  <span>9:45 AM</span>
                </div>
              </div>

              {/* Auto-play / Progress */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isAutoPlaying
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/10 text-white/70 border border-white/20'
                  }`}
                >
                  {isAutoPlaying ? 'Pause' : 'Auto-Play'}
                </button>
                <div className="text-white/40 text-sm">
                  {viewedHotspots.size}/{MAP_HOTSPOTS.length} locations explored
                </div>
              </div>

              {/* Hotspot detail modal */}
              <AnimatePresence>
                {selectedHotspot && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute bottom-24 left-4 right-4 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl p-5 border border-white/20 shadow-2xl z-20"
                  >
                    <button
                      onClick={() => setSelectedHotspot(null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
                    >
                      ✕
                    </button>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">
                        {selectedHotspot.type === 'ship' ? '🚢' : selectedHotspot.type === 'airfield' ? '✈️' : '🏛️'}
                      </span>
                      <h4 className="text-white font-bold text-lg">{selectedHotspot.name}</h4>
                    </div>
                    <p className="text-white/70 text-sm mb-3">{selectedHotspot.description}</p>
                    <p className="text-red-400 font-bold text-xl">{selectedHotspot.casualties.toLocaleString()} killed</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Continue button */}
              <button
                onClick={nextScreen}
                disabled={!allTimelineComplete || !minHotspotsViewed}
                className={`w-full py-4 font-bold rounded-xl transition-colors ${
                  allTimelineComplete && minHotspotsViewed
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                {!allTimelineComplete
                  ? 'Scrub through the full timeline'
                  : !minHotspotsViewed
                  ? `Explore ${4 - viewedHotspots.size} more locations`
                  : 'See the Full Cost'}
              </button>
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

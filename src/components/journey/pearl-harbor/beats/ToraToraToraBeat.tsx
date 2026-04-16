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
import { PreModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig } from '@/lib/firestore';

// Media keys from WW2ModuleEditor
const MEDIA_KEYS = {
  aerialMap: 'pearl-harbor-aerial-map-showing-attack-routes',
  attackSounds: 'period-accurate-attack-sounds-optional',
};

type Screen = 'pre-video' | 'intro' | 'map-overview' | 'timeline' | 'hotspots' | 'reflection' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'map-overview', 'timeline', 'hotspots', 'reflection', 'completion'];

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
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();
  const { getMediaUrl } = useWW2ModuleAssets();

  // Subscribe to Firestore for pre-module video config
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
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
      setScreen(SCREENS[currentIndex + 1]);
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete]);

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
                {TIMELINE_EVENTS.map((event, index) => (
                  <motion.div
                    key={event.time}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: index <= currentEventIndex ? 1 : 0.3, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-xl border ${index <= currentEventIndex ? 'bg-white/10 border-amber-500/50' : 'bg-white/5 border-white/10'}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{event.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-amber-400 font-mono font-bold">{event.time}</span>
                          <span className="text-white font-bold">{event.title}</span>
                        </div>
                        <p className="text-white/60 text-sm">{event.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Timeline scrubber */}
              <div className="mt-4 mb-2">
                <input
                  type="range"
                  min={0}
                  max={TIMELINE_EVENTS.length - 1}
                  value={currentEventIndex}
                  onChange={(e) => setCurrentEventIndex(parseInt(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-white/40 text-xs mt-1">
                  <span>7:48 AM</span>
                  <span>9:45 AM</span>
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
              <div className="mb-4 text-center">
                <h3 className="text-lg font-bold text-white mb-1">Explore the Damage</h3>
                <p className="text-white/60 text-sm">Tap locations to learn about casualties</p>
              </div>

              {/* Map with hotspots */}
              <div className="relative flex-1 bg-blue-900/30 rounded-2xl border border-white/10 overflow-hidden">
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

                {MAP_HOTSPOTS.map((hotspot) => (
                  <motion.button
                    key={hotspot.id}
                    onClick={() => handleHotspotClick(hotspot)}
                    className={`absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center ${viewedHotspots.has(hotspot.id) ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ left: `${hotspot.position.x}%`, top: `${hotspot.position.y}%` }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="text-white text-xs font-bold">!</span>
                  </motion.button>
                ))}
              </div>

              {/* Hotspot detail modal */}
              <AnimatePresence>
                {selectedHotspot && (
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute bottom-20 left-4 right-4 bg-slate-800 rounded-2xl p-4 border border-white/10"
                  >
                    <button onClick={() => setSelectedHotspot(null)} className="absolute top-2 right-2 text-white/40 hover:text-white">✕</button>
                    <h4 className="text-white font-bold text-lg mb-2">{selectedHotspot.name}</h4>
                    <p className="text-white/70 text-sm mb-2">{selectedHotspot.description}</p>
                    <p className="text-red-400 font-bold">{selectedHotspot.casualties}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Progress */}
              <div className="mt-4 text-center text-white/40 text-sm">
                {viewedHotspots.size}/{MAP_HOTSPOTS.length} locations explored
              </div>

              <button
                onClick={nextScreen}
                disabled={!allHotspotsViewed}
                className={`mt-4 w-full py-4 font-bold rounded-xl transition-colors ${allHotspotsViewed ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white/10 text-white/30'}`}
              >
                {allHotspotsViewed ? 'Continue' : `Explore ${3 - viewedHotspots.size} more locations`}
              </button>
            </motion.div>
          )}

          {/* REFLECTION */}
          {screen === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6">
                  <span className="text-4xl">🕯️</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-6">The Cost</h2>
                <div className="bg-white/5 rounded-2xl p-6 max-w-sm border border-white/10">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-3xl font-bold text-red-400">2,403</p>
                      <p className="text-white/50 text-sm">Americans Killed</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-amber-400">1,178</p>
                      <p className="text-white/50 text-sm">Wounded</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">21</p>
                      <p className="text-white/50 text-sm">Ships Sunk/Damaged</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-white">188</p>
                      <p className="text-white/50 text-sm">Aircraft Destroyed</p>
                    </div>
                  </div>
                </div>
                <p className="text-white/60 mt-6 max-w-sm text-sm">
                  Japanese losses: 64 killed, 29 aircraft, 5 midget submarines. The attack lasted 110 minutes.
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Beat 3
              </button>
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
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

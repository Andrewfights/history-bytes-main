/**
 * Beat 5: Breaking News - America Learns
 * Format: Audio Experience + Drag-and-Drop
 * XP: 45 | Duration: 4-5 min
 *
 * Narrative: How America heard the news on that Sunday -
 * radio interruptions, newspaper headlines, and the dramatic shift in public opinion.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Radio, Newspaper, ArrowRight, Play, Pause, Volume2 } from 'lucide-react';
import { WW2Host } from '@/types';
import { DragAndDropSorter, SortableItem, PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig, type BreakingNewsStationMedia } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useWW2ModuleAssets } from '../hooks/useWW2ModuleAssets';

// Media keys from WW2ModuleEditor
const MEDIA_KEYS = {
  cbsRadio: 'cbs-radio-broadcast-clip-optional',
  nbcRadio: 'nbc-radio-broadcast-clip-optional',
  nytFrontPage: 'new-york-times-front-page-facsimile',
};

type Screen = 'pre-video' | 'intro' | 'radio-stations' | 'station-video' | 'newspaper' | 'opinion-shift' | 'tsukiyama' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'radio-stations', 'station-video', 'newspaper', 'opinion-shift', 'tsukiyama', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-5',
  xpReward: 45,
};

interface RadioStation {
  id: string;
  name: string;
  program: string;
  announcement: string;
  time: string;
}

const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cbs',
    name: 'CBS',
    program: 'New York Philharmonic',
    announcement: '"We interrupt this program to bring you a special news bulletin. The Japanese have attacked Pearl Harbor, Hawaii, by air, President Roosevelt has just announced..."',
    time: '2:26 PM EST',
  },
  {
    id: 'nbc',
    name: 'NBC',
    program: 'Football: Giants vs. Dodgers',
    announcement: '"Flash! Washington. The White House announces Japanese attack on Pearl Harbor..."',
    time: '2:29 PM EST',
  },
  {
    id: 'mutual',
    name: 'MBS',
    program: 'Double or Nothing Quiz Show',
    announcement: '"We interrupt this broadcast to bring you this important bulletin from the United Press..."',
    time: '2:30 PM EST',
  },
];

// Items for the BEFORE/AFTER sorting challenge
const OPINION_ITEMS: SortableItem[] = [
  { id: 'oppose-88', label: '88% opposed war', icon: '📊' },
  { id: 'afc-800k', label: 'America First: 800,000 members', icon: '🏛️' },
  { id: 'lindbergh', label: 'Lindbergh: "Keep out of war"', icon: '🎤' },
  { id: 'approve-97', label: '97% approved declaration', icon: '📊' },
  { id: 'afc-disbanded', label: 'America First disbanded (Dec 11)', icon: '🏛️' },
  { id: 'enlistment', label: 'Millions volunteered to enlist', icon: '🎖️' },
];

const OPINION_CATEGORIES = [
  { id: 'before', label: 'BEFORE Dec 7' },
  { id: 'after', label: 'AFTER Dec 7' },
];

const CORRECT_CATEGORIES: Record<string, string> = {
  'oppose-88': 'before',
  'afc-800k': 'before',
  'lindbergh': 'before',
  'approve-97': 'after',
  'afc-disbanded': 'after',
  'enlistment': 'after',
};

interface BreakingNewsBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function BreakingNewsBeat({ host, onComplete, onSkip, onBack, isPreview = false }: BreakingNewsBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [selectedStation, setSelectedStation] = useState<RadioStation | null>(null);
  const [stationsListened, setStationsListened] = useState<Set<string>>(new Set());
  const [sortingComplete, setSortingComplete] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [stationMedia, setStationMedia] = useState<Record<string, BreakingNewsStationMedia>>({});
  const [currentStationVideoUrl, setCurrentStationVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();
  const { getMediaUrl } = useWW2ModuleAssets();

  // Get uploaded media URLs
  const cbsRadioUrl = getMediaUrl('ph-beat-5', MEDIA_KEYS.cbsRadio);
  const nbcRadioUrl = getMediaUrl('ph-beat-5', MEDIA_KEYS.nbcRadio);
  const nytFrontPageUrl = getMediaUrl('ph-beat-5', MEDIA_KEYS.nytFrontPage);

  // Map station IDs to uploaded audio URLs
  const stationAudioUrls: Record<string, string | null> = {
    cbs: cbsRadioUrl,
    nbc: nbcRadioUrl,
    mutual: null, // No uploaded audio for Mutual
  };

  // Handle audio playback for radio stations
  const handlePlayAudio = useCallback(() => {
    if (!selectedStation) return;
    const audioUrl = stationAudioUrls[selectedStation.id];
    if (!audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [selectedStation, isPlaying]);

  // Stop audio when changing stations or screens
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [selectedStation, screen]);

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.stationsListened) {
          setStationsListened(new Set(checkpoint.state.stationsListened));
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
        state: {
          stationsListened: Array.from(stationsListened),
        },
      });
    }
  }, [hasLoadedConfig, screen, stationsListened, saveCheckpoint]);

  // Subscribe to Firestore for pre-module video config and station media
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
      // Get station media (audio + video per station)
      if (assets?.breakingNewsStations) {
        setStationMedia(assets.breakingNewsStations);
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

  // After pre-video ends, go directly to radio-stations
  const handlePreVideoComplete = () => {
    setScreen('radio-stations');
  };

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextIndex = currentIndex + 1;
      // Skip post-video if not configured
      if (SCREENS[nextIndex] === 'post-video' && !postModuleVideoConfig) {
        nextIndex++;
      }
      if (nextIndex < SCREENS.length) {
        setScreen(SCREENS[nextIndex]);
      } else {
        clearCheckpoint();
        onComplete(skipped ? 0 : LESSON_DATA.xpReward);
      }
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig]);

  const handleStationSelect = (station: RadioStation) => {
    setSelectedStation(station);
    setStationsListened((prev) => new Set([...prev, station.id]));

    // Play audio if available from Firestore
    const media = stationMedia[station.id];
    if (media?.audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(media.audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const handlePlayStationVideo = () => {
    if (selectedStation && stationMedia[selectedStation.id]?.videoUrl) {
      setCurrentStationVideoUrl(stationMedia[selectedStation.id].videoUrl!);
      setScreen('station-video');
    } else {
      // No video, skip to newspaper
      setScreen('newspaper');
    }
  };

  const handleSortingComplete = (score: number, total: number) => {
    setSortingComplete(true);
  };

  const allStationsListened = stationsListened.size >= 2; // Require at least 2

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Breaking News</h1>
          <p className="text-white/50 text-xs">Beat 5 of 10</p>
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
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Breaking News"
              onComplete={handlePreVideoComplete}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative overflow-hidden">
              {/* Red atmospheric background */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 30% 30%, rgba(205,14,20,0.15) 0%, transparent 55%),
                    radial-gradient(ellipse at 70% 70%, rgba(100,50,30,0.18) 0%, transparent 55%),
                    linear-gradient(180deg, #1a0806 0%, #0a0502 50%, #050201 100%)
                  `
                }}
              />

              {/* Scan lines overlay */}
              <div
                className="absolute inset-0 z-[1] pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(205,14,20,0.04) 2px, rgba(205,14,20,0.04) 3px)'
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
                      ◆ Sunday, Dec 7 · 2:22 PM EST
                    </span>
                    <div className="w-6 h-px bg-ha-red" />
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-playfair italic text-[50px] sm:text-[62px] font-bold text-off-white leading-[0.95] tracking-tight mb-4"
                    style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
                  >
                    Tune <em className="text-gold">in.</em>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-cormorant italic text-lg text-off-white/70 max-w-[520px] leading-relaxed mb-6"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                  >
                    News of the attack hit American radios while most of the country was finishing Sunday dinner. Only one of these three stations cut into its programming to carry the bulletin.
                  </motion.p>

                  {/* Radio console */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full max-w-[600px] rounded p-5 mb-6"
                    style={{
                      background: 'rgba(20,10,6,0.78)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(230,171,42,0.3)'
                    }}
                  >
                    {/* Red top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-ha-red" />

                    {/* Header */}
                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-dashed border-off-white/[0.08]">
                      <div className="flex items-center gap-2.5 font-mono text-[9px] tracking-[0.28em] text-ha-red uppercase font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-ha-red shadow-[0_0_6px_var(--ha-red,#CD0E14)] animate-pulse" />
                        ◆ Live Broadcast Log
                      </div>
                      <span className="font-mono text-[8px] tracking-[0.25em] text-off-white/50 uppercase font-semibold">
                        <span className="text-gold">3</span> stations monitored · NYC market
                      </span>
                    </div>

                    {/* Frequency dial */}
                    <div
                      className="h-14 rounded-sm mb-4 relative overflow-hidden flex items-center"
                      style={{
                        background: '#080402',
                        border: '1px solid #6A3A12'
                      }}
                    >
                      {/* Tick marks background */}
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 24px, rgba(230,171,42,0.15) 24px, rgba(230,171,42,0.15) 25px)'
                        }}
                      />

                      {/* Station markers */}
                      <div className="relative w-full h-full flex justify-around items-center px-4">
                        {[
                          { name: 'CBS', freq: '880', pos: '20%' },
                          { name: 'NBC', freq: '660', pos: '50%' },
                          { name: 'MBS', freq: '1050', pos: '78%' },
                        ].map((station) => (
                          <div
                            key={station.name}
                            className="absolute flex flex-col items-center"
                            style={{ left: station.pos }}
                          >
                            <span className="font-mono text-[9px] text-gold font-bold tracking-[0.1em]">{station.name}</span>
                            <div className="w-0.5 h-3 bg-gold-dp my-0.5" />
                            <span className="font-mono text-[7px] text-off-white/50">{station.freq}</span>
                          </div>
                        ))}

                        {/* Radio needle */}
                        <motion.div
                          className="absolute h-full w-0.5 bg-ha-red z-10"
                          style={{ left: '78%', boxShadow: '0 0 10px var(--ha-red, #CD0E14)' }}
                          animate={{ x: [0, 2, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <div
                            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-ha-red"
                            style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
                          />
                        </motion.div>
                      </div>
                    </div>

                    {/* Station preview list */}
                    <div className="flex flex-col gap-1.5">
                      {[
                        { id: 'cbs', name: 'CBS', program: 'New York Philharmonic', status: 'Still playing' },
                        { id: 'nbc', name: 'NBC', program: 'Dodgers vs. Giants', status: 'Still playing' },
                        { id: 'mbs', name: 'MBS', program: 'Double or Nothing · Interrupted', status: 'On Air', selected: true },
                      ].map((station) => (
                        <div
                          key={station.id}
                          className="grid grid-cols-[52px_1fr_auto] gap-3 items-center p-2.5 rounded transition-all"
                          style={{
                            background: station.selected ? 'rgba(230,171,42,0.05)' : 'rgba(0,0,0,0.3)',
                            border: station.selected ? '1px solid var(--gold, #E6AB2A)' : '1px solid rgba(230,171,42,0.15)',
                            boxShadow: station.selected ? 'inset 0 0 0 1px rgba(230,171,42,0.3)' : 'none'
                          }}
                        >
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-oswald font-bold text-[11px] tracking-[0.06em]"
                            style={{
                              background: station.selected ? '#B2641F' : '#1a1008',
                              border: station.selected ? '1.5px solid var(--gold, #E6AB2A)' : '1.5px solid #B2641F',
                              color: station.selected ? 'var(--cream, #FAF4E4)' : 'var(--gold, #E6AB2A)'
                            }}
                          >
                            {station.name}
                          </div>
                          <div className="text-left min-w-0">
                            <p className="font-playfair italic text-sm font-bold text-off-white truncate">{station.program}</p>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] text-off-white/50 font-bold">
                            {station.selected && (
                              <div className="flex gap-0.5 h-3.5 items-end">
                                {[30, 70, 100, 55].map((h, i) => (
                                  <motion.span
                                    key={i}
                                    className="w-0.5 bg-gold rounded-sm"
                                    style={{ height: `${h}%` }}
                                    animate={{ height: ['30%', `${h}%`, '30%'] }}
                                    transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, delay: i * 0.1 }}
                                  />
                                ))}
                              </div>
                            )}
                            <span className={station.selected ? 'text-gold' : ''}>{station.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Spacer for scroll */}
                  <div className="h-8 flex-shrink-0" />
                </div>
              </div>

              {/* Bottom CTA - Fixed at bottom */}
              <div className="relative z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-[#0a0502] via-[#0a0502]/95 to-transparent backdrop-blur-sm border-t border-off-white/[0.06] flex-shrink-0">
                <div className="flex flex-col items-center gap-3.5 max-w-sm mx-auto">
                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={nextScreen}
                    className="relative w-full py-4 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[13px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3"
                  >
                    {/* Corner brackets */}
                    <span className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px] border-l-[1.5px] border-t-[1.5px] border-gold" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px] border-r-[1.5px] border-b-[1.5px] border-gold" />
                    Tune to MBS · 1050 kHz
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </motion.button>

                  {/* Skip link */}
                  <button
                    onClick={() => { setSkipped(true); onSkip(); }}
                    className="font-mono text-[9.5px] tracking-[0.28em] text-off-white/35 uppercase font-semibold hover:text-off-white/50 transition-colors py-1 px-2.5"
                  >
                    Skip this beat
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* RADIO STATIONS - New simplified 3 station view */}
          {screen === 'radio-stations' && (
            <motion.div key="radio-stations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <Radio size={32} className="text-amber-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white mb-2">Tune In</h3>
                <p className="text-white/60 text-sm">Select a radio station to hear the breaking news</p>
              </div>

              {/* Three station cards */}
              <div className="flex-1 flex flex-col gap-4">
                {RADIO_STATIONS.map((station) => {
                  const media = stationMedia[station.id];
                  const isSelected = selectedStation?.id === station.id;
                  const hasListened = stationsListened.has(station.id);

                  return (
                    <motion.button
                      key={station.id}
                      onClick={() => handleStationSelect(station)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500'
                          : hasListened
                          ? 'bg-green-500/10 border-green-500/50'
                          : 'bg-white/5 border-white/20 hover:border-amber-500/50'
                      }`}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Station badge */}
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
                          isSelected ? 'bg-amber-500 text-black' : 'bg-white/10 text-amber-400'
                        }`}>
                          {station.name}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold">{station.program}</p>
                          <p className="text-white/50 text-sm">{station.time}</p>
                        </div>

                        {/* Playing indicator */}
                        {isSelected && isPlaying && (
                          <div className="flex items-center gap-1">
                            <Volume2 size={18} className="text-amber-400 animate-pulse" />
                          </div>
                        )}

                        {/* Listened checkmark */}
                        {hasListened && !isSelected && (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>

                      {/* Show announcement when selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 pt-4 border-t border-white/10"
                        >
                          <p className="text-amber-100/80 text-sm italic leading-relaxed">
                            {station.announcement}
                          </p>
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Continue button - enabled after listening to at least 1 station */}
              <button
                onClick={handlePlayStationVideo}
                disabled={stationsListened.size === 0}
                className={`w-full py-4 font-bold rounded-xl transition-colors mt-4 ${
                  stationsListened.size > 0
                    ? 'bg-amber-500 hover:bg-amber-400 text-black'
                    : 'bg-white/10 text-white/30'
                }`}
              >
                {stationsListened.size > 0 ? 'Continue' : 'Select a station to listen'}
              </button>
            </motion.div>
          )}

          {/* STATION VIDEO - Video that plays after selecting a station */}
          {screen === 'station-video' && (
            <motion.div
              key="station-video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full bg-black"
            >
              {currentStationVideoUrl ? (
                <div className="flex-1 flex flex-col">
                  {/* Video player - full width */}
                  <div className="flex-1 relative">
                    <video
                      ref={videoRef}
                      src={currentStationVideoUrl}
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                      onEnded={() => setScreen('newspaper')}
                    />
                  </div>

                  {/* Skip button */}
                  <div className="p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                    <button
                      onClick={() => setScreen('newspaper')}
                      className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
                    >
                      Skip Video
                    </button>
                  </div>
                </div>
              ) : (
                // No video configured, auto-advance
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-white/50">Loading...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* NEWSPAPER */}
          {screen === 'newspaper' && (
            <motion.div key="newspaper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <Newspaper size={32} className="text-amber-400 mb-4" />
                <h3 className="text-lg font-bold text-white mb-6">December 8, 1941</h3>

                {/* Newspaper front page - use uploaded image or fallback to mockup */}
                {nytFrontPageUrl ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-sm w-full rounded-lg overflow-hidden shadow-xl"
                  >
                    <img
                      src={nytFrontPageUrl}
                      alt="New York Times front page - December 8, 1941"
                      className="w-full h-auto"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-amber-50 rounded-lg p-4 max-w-sm w-full shadow-xl"
                  >
                    <div className="text-center border-b-2 border-black pb-2 mb-3">
                      <p className="text-black font-serif text-xs">THE NEW YORK TIMES</p>
                    </div>
                    <h2 className="text-black font-serif font-bold text-xl text-center mb-2">
                      JAPAN WARS ON U.S. AND BRITAIN
                    </h2>
                    <p className="text-black font-serif text-sm text-center mb-3">
                      MAKES SUDDEN ATTACK ON HAWAII;<br />
                      HEAVY FIGHTING AT SEA REPORTED
                    </p>
                    <div className="border-t border-black pt-2 text-black text-xs font-serif space-y-1">
                      <p>• Congress to Vote War Declaration Today</p>
                      <p>• Pacific Fleet Damaged in Surprise Raid</p>
                      <p>• Japanese Also Attack Philippines, Guam</p>
                      <p>• President Roosevelt to Address Nation</p>
                    </div>
                  </motion.div>
                )}

                <p className="text-white/60 text-sm text-center mt-4 max-w-sm">
                  Newspapers printed EXTRA editions throughout the night. By morning, every American knew their world had changed.
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                See the Shift
              </button>
            </motion.div>
          )}

          {/* OPINION SHIFT - DRAG AND DROP */}
          {screen === 'opinion-shift' && (
            <motion.div key="opinion-shift" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative">
              {!sortingComplete ? (
                <DragAndDropSorter
                  mode="categorize"
                  items={OPINION_ITEMS}
                  categories={OPINION_CATEGORIES}
                  correctCategories={CORRECT_CATEGORIES}
                  onComplete={handleSortingComplete}
                  title="The Great Shift"
                  instructions="Sort these facts into BEFORE or AFTER Pearl Harbor"
                />
              ) : (
                <div className="flex flex-col h-full p-6">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    {/* Animated icon with glow */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 relative"
                    >
                      <motion.div
                        className="absolute inset-0 rounded-full bg-green-500/20"
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <ArrowRight size={40} className="text-green-400" />
                    </motion.div>

                    <motion.h2
                      className="text-2xl font-bold text-white mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      Overnight Transformation
                    </motion.h2>

                    {/* Enhanced stats card */}
                    <motion.div
                      className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 relative overflow-hidden"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      />

                      <div className="flex items-center justify-between gap-4 relative z-10">
                        {/* BEFORE stat */}
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <motion.p
                            className="text-red-400 text-3xl font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: 'spring', stiffness: 200 }}
                          >
                            88%
                          </motion.p>
                          <p className="text-white/50 text-xs">Opposed War</p>
                          <p className="text-white/30 text-xs">Jan 1940</p>
                        </motion.div>

                        {/* Animated arrow */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          >
                            <ArrowRight className="text-amber-400" size={28} />
                          </motion.div>
                        </motion.div>

                        {/* AFTER stat */}
                        <motion.div
                          className="text-center"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.8 }}
                        >
                          <motion.p
                            className="text-green-400 text-3xl font-bold"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.9, type: 'spring', stiffness: 200 }}
                          >
                            97%
                          </motion.p>
                          <p className="text-white/50 text-xs">Approved War</p>
                          <p className="text-white/30 text-xs">Dec 8 1941</p>
                        </motion.div>
                      </div>

                      {/* Connecting line animation */}
                      <motion.div
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-red-400 via-amber-400 to-green-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '80%' }}
                        transition={{ delay: 1, duration: 0.8 }}
                      />
                    </motion.div>

                    {/* Additional context */}
                    <motion.p
                      className="text-white/40 text-sm mt-4 max-w-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      One day changed everything
                    </motion.p>
                  </div>

                  <motion.button
                    onClick={nextScreen}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                  >
                    One More Story
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* TSUKIYAMA STORY */}
          {screen === 'tsukiyama' && (
            <motion.div key="tsukiyama" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-3xl mb-4">🎖️</div>
                <h3 className="text-xl font-bold text-white mb-2">Ted Tsukiyama</h3>
                <p className="text-amber-400 text-sm mb-6">Nisei ROTC Student</p>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 space-y-4">
                  <p className="text-white/80 text-sm">
                    Ted Tsukiyama was a University of Hawaii ROTC student, an American of Japanese ancestry — a "Nisei."
                  </p>
                  <p className="text-white/80 text-sm">
                    On December 7, he was called to active duty to defend his homeland. He answered the call proudly.
                  </p>
                  <p className="text-white/80 text-sm">
                    On <strong className="text-red-400">January 19, 1942</strong>, he was dismissed from service — solely because of his ancestry.
                  </p>
                  <p className="text-white/80 text-sm">
                    Later, Tsukiyama fought to prove his loyalty and served with the legendary <strong className="text-amber-400">442nd Regimental Combat Team</strong>, the most decorated unit in U.S. military history.
                  </p>
                </div>

                <p className="text-white/50 text-sm text-center mt-4 max-w-sm italic">
                  "We had to prove we were Americans. We did it on the battlefield."
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Beat 5
              </button>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Breaking News"
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
                if (!skipped) {
                  playXPSound();
                }
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">📻</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 5 Complete!</h2>
                <p className="text-white/60 mb-6">Breaking News - America Learns</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Nagumo's Dilemma - What if Japan had launched a third wave?
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

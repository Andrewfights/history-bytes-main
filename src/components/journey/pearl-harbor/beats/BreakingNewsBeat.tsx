/**
 * Beat 5: Breaking News - America Learns
 * Format: Radio Experience
 * XP: 45 | Duration: 3-4 min
 *
 * Narrative: How America heard the news on that Sunday -
 * users tune into radio broadcasts from CBS, NBC, and MBS.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Radio, Play, Pause, Volume2, VolumeX } from 'lucide-react';

// Bakelite radio color constants
const BAK_HI = '#6a2a18';
const BAK_1 = '#4a1c10';
const BAK_2 = '#2e120a';
const BAK_3 = '#180906';
const DIAL_CREAM = '#f5e5b8';
const DIAL_GOLD = '#d4a860';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig, type BreakingNewsStationMedia } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useWW2ModuleAssets } from '../hooks/useWW2ModuleAssets';

// Media keys from WW2ModuleEditor
const MEDIA_KEYS = {
  cbsRadio: 'cbs-radio-broadcast-clip-optional',
  nbcRadio: 'nbc-radio-broadcast-clip-optional',
  mbsRadio: 'mbs-radio-broadcast-clip-optional',
};

type Screen = 'pre-video' | 'intro' | 'radio-stations' | 'station-video' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'radio-stations', 'station-video', 'post-video', 'completion'];

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
  freq: string;
  dialPosition: number; // percentage position on dial strip
}

const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'cbs',
    name: 'CBS',
    program: 'New York Philharmonic',
    announcement: '"We interrupt this program to bring you a special news bulletin. The Japanese have attacked Pearl Harbor, Hawaii, by air, President Roosevelt has just announced..."',
    time: '2:26 PM EST',
    freq: '880',
    dialPosition: 24,
  },
  {
    id: 'nbc',
    name: 'NBC',
    program: 'Football: Giants vs. Dodgers',
    announcement: '"Flash! Washington. The White House announces Japanese attack on Pearl Harbor..."',
    time: '2:29 PM EST',
    freq: '660',
    dialPosition: 52,
  },
  {
    id: 'mutual',
    name: 'MBS',
    program: 'Double or Nothing Quiz Show',
    announcement: '"We interrupt this broadcast to bring you this important bulletin from the United Press..."',
    time: '2:30 PM EST',
    freq: '710',
    dialPosition: 76,
  },
];


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
  const [skipped, setSkipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [stationMedia, setStationMedia] = useState<Record<string, BreakingNewsStationMedia>>({});
  const [currentStationVideoUrl, setCurrentStationVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inlineVideoRef = useRef<HTMLVideoElement>(null);
  const [dialNeedlePosition, setDialNeedlePosition] = useState(50); // Center by default
  const [showBulletin, setShowBulletin] = useState(false);
  const bulletinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();
  const { getMediaUrl } = useWW2ModuleAssets();

  // Get uploaded media URLs
  const cbsRadioUrl = getMediaUrl('ph-beat-5', MEDIA_KEYS.cbsRadio);
  const nbcRadioUrl = getMediaUrl('ph-beat-5', MEDIA_KEYS.nbcRadio);
  const mbsRadioUrl = getMediaUrl('ph-beat-5', MEDIA_KEYS.mbsRadio);

  // Map station IDs to uploaded audio URLs
  const stationAudioUrls: Record<string, string | null> = {
    cbs: cbsRadioUrl,
    nbc: nbcRadioUrl,
    mutual: mbsRadioUrl,
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

    // Update dial needle position
    setDialNeedlePosition(station.dialPosition);

    // Reset video state
    setIsVideoPlaying(false);
    setVideoEnded(false);
    setShowBulletin(false);

    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }

    // Check if this station has a video - if so, prepare it (will play on "Listen In" click)
    const media = stationMedia[station.id];
    if (media?.videoUrl) {
      setCurrentStationVideoUrl(media.videoUrl);
    } else {
      setCurrentStationVideoUrl(null);
      // No video, show bulletin after delay
      if (bulletinTimeoutRef.current) {
        clearTimeout(bulletinTimeoutRef.current);
      }
      bulletinTimeoutRef.current = setTimeout(() => {
        setShowBulletin(true);
      }, 1800);
    }
  };

  // Handle "Listen In" button click - play the video inline
  const handleListenIn = () => {
    if (!selectedStation) return;

    const media = stationMedia[selectedStation.id];
    if (media?.videoUrl) {
      setCurrentStationVideoUrl(media.videoUrl);
      setIsVideoPlaying(true);
      setVideoEnded(false);
      // Video will auto-play via the autoPlay attribute
    } else if (media?.audioUrl) {
      // Fall back to audio if no video
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(media.audioUrl);
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setShowBulletin(true);
      };
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  // Handle video end
  const handleInlineVideoEnd = () => {
    setIsVideoPlaying(false);
    setVideoEnded(true);
    setShowBulletin(true);
  };

  const handlePlayStationVideo = () => {
    if (selectedStation && stationMedia[selectedStation.id]?.videoUrl) {
      setCurrentStationVideoUrl(stationMedia[selectedStation.id].videoUrl!);
      setScreen('station-video');
    } else {
      // No video, skip to post-video
      setScreen('post-video');
    }
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

          {/* RADIO STATIONS - v4: Bigger video, single row chips, compact radio */}
          {screen === 'radio-stations' && (
            <motion.div key="radio-stations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full overflow-hidden">

              {/* SCREEN BODY - Main content area */}
              <div
                className="flex-1 flex flex-col gap-3 p-3.5 md:p-4 min-h-0 overflow-y-auto"
                style={{ background: 'radial-gradient(ellipse at 50% 15%, rgba(60,30,8,0.25), transparent 60%)' }}
              >
                {/* VIDEO AREA - 16:9 for video content */}
                <div
                  className="relative w-full overflow-hidden flex-shrink-0 rounded-lg"
                  style={{
                    aspectRatio: '16/9',
                    border: '1px solid rgba(230,171,42,0.22)',
                    boxShadow: '0 0 0 1px rgba(0,0,0,0.6), 0 12px 40px rgba(0,0,0,0.55)'
                  }}
                >
                  {/* Gold corner brackets */}
                  <div className="absolute top-2 left-2 w-3.5 h-3.5 border-l-2 border-t-2 border-gold z-[12] pointer-events-none" />
                  <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-r-2 border-b-2 border-gold z-[12] pointer-events-none" />

                  {/* ═══ EMPTY STATE: Placeholder Image ═══ */}
                  <div
                    className={`absolute inset-0 transition-opacity duration-500 ${(selectedStation && isVideoPlaying) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                  >
                    <img
                      src="/assets/breaking-news/click-station-placeholder.png"
                      alt="Please Click a Station"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* ═══ INLINE VIDEO PLAYER ═══ */}
                  {currentStationVideoUrl && isVideoPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 z-[10]"
                    >
                      <video
                        ref={inlineVideoRef}
                        src={currentStationVideoUrl}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain bg-black"
                        onEnded={handleInlineVideoEnd}
                      />
                      {/* Video controls overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <motion.div
                              className="w-2 h-2 rounded-full bg-ha-red"
                              style={{ boxShadow: '0 0 8px var(--ha-red)' }}
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <span className="font-mono text-[10px] tracking-[0.2em] text-white/80 uppercase">
                              {selectedStation?.name} Broadcast
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              setIsVideoPlaying(false);
                              setVideoEnded(true);
                              setShowBulletin(true);
                            }}
                            className="text-[10px] font-mono tracking-wider text-white/60 hover:text-white transition-colors uppercase"
                          >
                            Skip →
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* ═══ PHILCO RADIO (compact, v4 design) ═══ */}
                <div
                  className="relative w-full max-w-[560px] mx-auto rounded-[14px_14px_18px_18px] p-2.5 md:p-3 flex-shrink-0"
                  style={{
                    background: `linear-gradient(180deg, ${BAK_HI} 0%, ${BAK_1} 20%, ${BAK_2} 70%, ${BAK_3} 100%)`,
                    boxShadow: 'inset 0 1px 0 rgba(255,200,140,0.18), inset 0 -2px 4px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Bakelite grain texture */}
                  <div
                    className="absolute inset-0 rounded-[inherit] opacity-60 mix-blend-multiply pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='bg'%3E%3CfeTurbulence type='turbulence' baseFrequency='2.5' numOctaves='2' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.05 0 0 0 0 0.02 0 0 0 0 0.01 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23bg)'/%3E%3C/svg%3E")` }}
                  />

                  {/* Nameplate */}
                  <div
                    className="relative rounded-[3px] px-3 py-0.5 text-center mb-2"
                    style={{
                      background: 'linear-gradient(180deg, #1a0a04, #0a0402)',
                      border: '1px solid rgba(212,168,96,0.3)',
                      boxShadow: 'inset 0 0 8px rgba(0,0,0,0.8)'
                    }}
                  >
                    <span className="font-mono text-[8.5px] tracking-[0.3em] uppercase font-bold" style={{ color: DIAL_GOLD }}>
                      Philco Transitone
                    </span>
                  </div>

                  {/* Radio body: knobs + dial */}
                  <div className="relative z-[2] flex items-center gap-2.5">
                    {/* Volume knob */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="relative w-8 h-8 md:w-10 md:h-10 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 30% 25%, #5a2818, #1a0804 80%)',
                          border: '1px solid rgba(0,0,0,0.8)',
                          boxShadow: 'inset 0 2px 4px rgba(255,160,100,0.25), inset 0 -2px 4px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div
                          className="absolute top-[3px] md:top-[4px] left-1/2 -translate-x-1/2 w-0.5 h-2 md:h-2.5 rounded-sm"
                          style={{ background: DIAL_CREAM, boxShadow: '0 0 3px rgba(245,229,184,0.6)' }}
                        />
                      </div>
                      <span className="mt-0.5 font-mono text-[7px] md:text-[8px] tracking-[0.25em] uppercase font-bold" style={{ color: DIAL_GOLD, opacity: 0.9 }}>Vol</span>
                    </div>

                    {/* Dial */}
                    <div
                      className="flex-1 h-[46px] md:h-[54px] rounded-[3px] p-1 md:p-1.5 flex flex-col justify-between relative"
                      style={{
                        background: `linear-gradient(180deg, ${DIAL_CREAM} 0%, #e8d39a 100%)`,
                        boxShadow: 'inset 0 2px 6px rgba(120,80,40,0.3), inset 0 -1px 2px rgba(255,240,200,0.8), 0 1px 0 rgba(0,0,0,0.5)',
                        border: '1px solid rgba(0,0,0,0.4)'
                      }}
                    >
                      {/* Station labels (top) */}
                      <div className="flex justify-between px-1.5 font-mono text-[7px] md:text-[8.5px] tracking-[0.2em] font-bold" style={{ color: '#6a3818' }}>
                        {RADIO_STATIONS.map((station) => (
                          <span
                            key={station.id}
                            className="relative"
                            style={{
                              color: selectedStation?.id === station.id ? 'var(--ha-red-deep, #8A0A0E)' : '#6a3818',
                              opacity: selectedStation?.id === station.id ? 1 : 0.5
                            }}
                          >
                            {station.name}
                            {selectedStation?.id === station.id && (
                              <motion.span
                                className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-ha-red"
                                style={{ boxShadow: '0 0 4px var(--ha-red)' }}
                                layoutId="station-indicator"
                              />
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Tick marks row */}
                      <div className="relative h-[22px] flex items-end px-1">
                        <div className="absolute bottom-[3px] left-0 right-0 h-px" style={{ background: '#6a3818', opacity: 0.3 }} />
                        <div className="flex-1 flex justify-between">
                          {[55, null, 80, null, 100, null, 140, null, 160].map((num, i) => (
                            <div key={i} className="flex flex-col items-center">
                              <div
                                className="w-px"
                                style={{
                                  height: num !== null ? '10px' : '5px',
                                  background: '#5a2c10',
                                  opacity: num !== null ? 0.85 : 0.6
                                }}
                              />
                              {num !== null && (
                                <span className="font-mono text-[7px] font-bold mt-0.5" style={{ color: '#5a2c10' }}>{num}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Red tuning needle */}
                      <motion.div
                        className="absolute top-0 bottom-0 w-0.5 z-[5]"
                        style={{
                          background: 'linear-gradient(180deg, var(--ha-red-br, #E84046), var(--ha-red, #CD0E14), var(--ha-red-deep, #8A0A0E))',
                          boxShadow: '0 0 6px rgba(205,14,20,0.6)'
                        }}
                        animate={{ left: `${dialNeedlePosition}%` }}
                        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
                      >
                        <div
                          className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-ha-red"
                          style={{ boxShadow: '0 0 6px var(--ha-red-br)' }}
                        />
                      </motion.div>
                    </div>

                    {/* Tuning knob */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className="relative w-8 h-8 md:w-10 md:h-10 rounded-full"
                        style={{
                          background: 'radial-gradient(circle at 30% 25%, #5a2818, #1a0804 80%)',
                          border: '1px solid rgba(0,0,0,0.8)',
                          boxShadow: 'inset 0 2px 4px rgba(255,160,100,0.25), inset 0 -2px 4px rgba(0,0,0,0.7), 0 2px 4px rgba(0,0,0,0.5)'
                        }}
                      >
                        <div
                          className="absolute top-[4px] md:top-[4px] left-1/2 -translate-x-1/2 w-0.5 h-2 md:h-2.5 rounded-sm origin-bottom rotate-[18deg]"
                          style={{ background: DIAL_CREAM, boxShadow: '0 0 3px rgba(245,229,184,0.6)' }}
                        />
                      </div>
                      <span className="mt-0.5 font-mono text-[7px] md:text-[8px] tracking-[0.25em] uppercase font-bold" style={{ color: DIAL_GOLD, opacity: 0.9 }}>Tune</span>
                    </div>
                  </div>
                </div>

                {/* ═══ ON AIR LINE ═══ */}
                <div className="flex items-center justify-between gap-2 px-1 flex-shrink-0">
                  <div className="flex items-center gap-2 font-mono text-[8.5px] md:text-[9.5px] tracking-[0.3em] text-ha-red uppercase font-bold">
                    <div className="w-3.5 h-px bg-ha-red" />
                    <span className="relative pl-2.5">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-[5px]" style={{ color: 'var(--ha-red)' }}>◆</span>
                      On the Air
                    </span>
                  </div>
                  <span className="font-mono text-[8.5px] md:text-[9.5px] tracking-[0.22em] text-off-white/40 uppercase font-semibold">
                    Sun · Dec 7, 1941
                  </span>
                </div>

                {/* ═══ STATION CHIPS - SINGLE ROW (v4) ═══ */}
                <div className="flex gap-2 flex-shrink-0">
                  {RADIO_STATIONS.map((station) => {
                    const isSelected = selectedStation?.id === station.id;
                    return (
                      <button
                        key={station.id}
                        onClick={() => handleStationSelect(station)}
                        className="flex-1 min-w-0 flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded-[10px] relative transition-all"
                        style={{
                          background: isSelected
                            ? 'linear-gradient(180deg, rgba(45,28,10,0.7), rgba(22,14,6,0.5))'
                            : 'rgba(15,10,5,0.55)',
                          border: isSelected
                            ? '1px solid rgba(230,171,42,0.55)'
                            : '1px solid rgba(230,171,42,0.15)',
                          backdropFilter: 'blur(6px)',
                          boxShadow: isSelected
                            ? '0 0 22px rgba(230,171,42,0.15), inset 0 1px 0 rgba(230,171,42,0.12)'
                            : 'none'
                        }}
                      >
                        {/* On-air pulse dot for active station */}
                        {isSelected && (
                          <motion.div
                            className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full"
                            style={{ background: 'var(--ha-red-br, #E84046)', boxShadow: '0 0 6px var(--ha-red-br)' }}
                            animate={{ opacity: [1, 0.55, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                          />
                        )}

                        {/* Station avatar */}
                        <div
                          className="w-9 h-9 md:w-[42px] md:h-[42px] rounded-full flex items-center justify-center font-oswald font-black text-[10px] md:text-[11px] tracking-[0.03em]"
                          style={{
                            background: isSelected
                              ? 'radial-gradient(circle at 30% 25%, #5a3818, #1a0a04)'
                              : 'radial-gradient(circle at 30% 25%, #3a2010, #0a0402)',
                            border: isSelected
                              ? '1px solid var(--gold, #E6AB2A)'
                              : '1px solid rgba(230,171,42,0.25)',
                            color: isSelected ? 'var(--gold-br, #F6E355)' : 'rgba(230,171,42,0.75)',
                            boxShadow: isSelected
                              ? 'inset 0 0 8px rgba(0,0,0,0.7), 0 0 10px rgba(230,171,42,0.35)'
                              : 'inset 0 0 6px rgba(0,0,0,0.6)'
                          }}
                        >
                          {station.name}
                        </div>

                        {/* Frequency */}
                        <span
                          className="font-mono text-[8.5px] md:text-[9.5px] tracking-[0.2em] uppercase font-bold text-center leading-[1.2]"
                          style={{ color: isSelected ? 'var(--gold, #E6AB2A)' : 'rgba(242,238,230,0.5)' }}
                        >
                          {station.freq} khz
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* ═══ LISTEN IN / CONTINUE BUTTON ═══ */}
                <button
                  onClick={() => {
                    if (!selectedStation) return;
                    if (videoEnded || showBulletin) {
                      // Video finished or no video - continue to next screen
                      handlePlayStationVideo();
                    } else if (stationMedia[selectedStation.id]?.videoUrl && !isVideoPlaying) {
                      // Has video and not playing - start playing
                      handleListenIn();
                    } else if (!stationMedia[selectedStation.id]?.videoUrl) {
                      // No video - continue directly
                      handlePlayStationVideo();
                    }
                  }}
                  disabled={!selectedStation}
                  className="relative w-full py-3.5 md:py-4 rounded-[10px] font-oswald text-[12px] md:text-[13px] font-black tracking-[0.28em] md:tracking-[0.3em] uppercase flex items-center justify-center gap-2.5 flex-shrink-0 transition-all"
                  style={{
                    background: selectedStation
                      ? 'linear-gradient(180deg, var(--gold-br, #F6E355) 0%, var(--gold, #E6AB2A) 45%, var(--gold-dp, #B2641F) 100%)'
                      : 'rgba(60,40,20,0.5)',
                    color: selectedStation ? '#1a0b02' : 'rgba(242,238,230,0.5)',
                    boxShadow: selectedStation
                      ? '0 6px 18px rgba(230,171,42,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(138,80,20,0.3)'
                      : 'none',
                    cursor: selectedStation ? 'pointer' : 'not-allowed'
                  }}
                >
                  {/* Corner brackets */}
                  <span className="absolute top-[-1px] left-[-1px] w-[9px] h-[9px] border-l-[1.5px] border-t-[1.5px] border-ha-red pointer-events-none" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-[9px] h-[9px] border-r-[1.5px] border-b-[1.5px] border-ha-red pointer-events-none" />

                  {!selectedStation ? (
                    'Select a Station'
                  ) : isVideoPlaying ? (
                    <>
                      <Radio size={16} className="animate-pulse" />
                      Now Playing...
                    </>
                  ) : videoEnded || showBulletin ? (
                    <>
                      Continue
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </>
                  ) : stationMedia[selectedStation.id]?.videoUrl ? (
                    <>
                      <Play size={16} />
                      Listen In
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
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
                      onEnded={() => setScreen('post-video')}
                    />
                  </div>

                  {/* Skip button */}
                  <div className="p-4" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                    <button
                      onClick={() => setScreen('post-video')}
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
            <XPCompletionScreen
              beatNumber={5}
              beatTitle="Breaking News"
              xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
              host={host}
              onContinue={nextScreen}
              nextBeatPreview="Nagumo's Dilemma - What if there was a third wave?"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

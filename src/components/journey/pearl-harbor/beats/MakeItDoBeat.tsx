/**
 * Beat 11: Make It Do, Or Do Without - The Home Front
 * Format: Video Montage (Reusable type)
 * XP: 45 | Duration: 4-5 min
 *
 * Narrative: See how everyday Americans sacrificed for the war effort.
 * Multiple video scenes with a recurring theme of civilian contribution.
 *
 * This is a REUSABLE beat type: video-montage
 * Can be used for any topic with multiple short video segments.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Play, Pause, Volume2, VolumeX, ChevronRight, Home } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen =
  | 'pre-video'
  | 'intro'
  | 'cooking-fat'
  | 'fabric-scene'
  | 'victory-gardens'
  | 'rationing-facts'
  | 'reflection'
  | 'post-video'
  | 'completion';

const SCREENS: Screen[] = [
  'pre-video',
  'intro',
  'cooking-fat',
  'fabric-scene',
  'victory-gardens',
  'rationing-facts',
  'reflection',
  'post-video',
  'completion'
];

const LESSON_DATA = {
  id: 'ph-beat-9',
  xpReward: 45,
};

// Video scene configuration for the montage
interface VideoScene {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  videoKey: string; // Key for Firestore media asset
  factoid: string;
  icon: string;
}

const VIDEO_SCENES: VideoScene[] = [
  {
    id: 'cooking-fat',
    title: 'Fat for Explosives',
    subtitle: 'Kitchen to Battlefield',
    description: 'Every pound of cooking fat collected helped manufacture glycerin for explosives.',
    videoKey: 'make-it-do-cooking-fat',
    factoid: 'Glycerin from cooking fat was used to make nitroglycerin for bombs and artillery shells.',
    icon: '🍳',
  },
  {
    id: 'fabric-scene',
    title: 'Fabric Rationing',
    subtitle: 'Every Thread Counts',
    description: 'Clothing restrictions saved fabric for military uniforms, parachutes, and bandages.',
    videoKey: 'make-it-do-fabric',
    factoid: 'The War Production Board limited skirt lengths and banned cuffs on pants to save fabric.',
    icon: '🧵',
  },
  {
    id: 'victory-gardens',
    title: 'Victory Gardens',
    subtitle: 'Growing for Freedom',
    description: '20 million Americans planted gardens to supplement rationed food supplies.',
    videoKey: 'make-it-do-gardens',
    factoid: 'By 1944, Victory Gardens produced 40% of all vegetables consumed in America.',
    icon: '🥕',
  },
];

// Rationing facts for the quiz/education screen - styled as authentic OPA stamps
interface RationingFact {
  item: string;
  amount: string;
  reason: string;
  serial: string;
  color: 'red' | 'blue' | 'brown';
  iconType: 'sugar' | 'coffee' | 'gas' | 'rubber' | 'meat' | 'butter';
}

const RATIONING_FACTS: RationingFact[] = [
  { item: 'Sugar', amount: '8 oz / week', reason: 'Key ingredient in the manufacture of military explosives.', serial: 'No. 30', color: 'red', iconType: 'sugar' },
  { item: 'Coffee', amount: '1 lb / 5 wks', reason: 'Shipping lanes cleared for the transport of war materials.', serial: 'No. 12', color: 'brown', iconType: 'coffee' },
  { item: 'Gasoline', amount: '3 gal / week', reason: 'Fuel for tanks, jeeps, and transport on every front.', serial: 'No. 4-A', color: 'blue', iconType: 'gas' },
  { item: 'Rubber', amount: 'Severely Limited', reason: 'Tires, gas masks, and life rafts for the troops.', serial: 'No. 18', color: 'red', iconType: 'rubber' },
  { item: 'Meat', amount: '28 oz / week', reason: 'Feeding millions of troops and Allied forces overseas.', serial: 'No. 22', color: 'brown', iconType: 'meat' },
  { item: 'Butter', amount: '4 oz / week', reason: 'Rendered fats were needed to manufacture munitions.', serial: 'No. 15', color: 'red', iconType: 'butter' },
];

// SVG icons for ration stamps (line illustrations)
const RationIcon = ({ type }: { type: RationingFact['iconType'] }) => {
  const icons: Record<string, React.ReactNode> = {
    sugar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M4 12h16M6 8h12M8 16h8M12 4v4M12 16v4"/><rect x="7" y="8" width="10" height="8" rx="1"/>
      </svg>
    ),
    coffee: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M4 8h14v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8z"/><path d="M18 10h2a2 2 0 0 1 0 4h-2"/><path d="M8 3c0 1 1 1.5 1 2.5S8 7 8 7M12 3c0 1 1 1.5 1 2.5S12 7 12 7"/>
      </svg>
    ),
    gas: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M5 20V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v15"/><path d="M4 20h12M15 9h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2M15 13h3"/>
      </svg>
    ),
    rubber: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/>
      </svg>
    ),
    meat: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M6 8c0-2 2-4 5-4s5 2 5 4c2 0 4 2 4 4s-1 4-3 5c-1 3-4 5-7 5s-6-2-7-5c-2-1-3-2-3-4 0-2 2-4 4-4 0-1 1-1 2-1z"/><circle cx="9" cy="11" r="1"/>
      </svg>
    ),
    butter: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
        <path d="M4 12l4-4h8l4 4v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6z"/><path d="M8 8v-2h8v2M8 14h8M8 17h8"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

interface MakeItDoBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function MakeItDoBeat({ host, onComplete, onSkip, onBack, isPreview = false }: MakeItDoBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // For video scenes
  const [sceneVideoUrls, setSceneVideoUrls] = useState<Record<string, string>>({});

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Restore from checkpoint
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
      }
    }
  }, []);

  // Save checkpoint on screen change - only after config is loaded
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {},
      });
    }
  }, [hasLoadedConfig, screen, saveCheckpoint]);

  // Subscribe to Firestore for video configs
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      // Pre-module video
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }

      // Post-module video
      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        setPostModuleVideoConfig(postModuleVideo);
      } else {
        setPostModuleVideoConfig(null);
      }

      // Scene videos from montage assets
      const montageAssets = assets?.montageVideos?.[LESSON_DATA.id];
      if (montageAssets) {
        const urls: Record<string, string> = {};
        VIDEO_SCENES.forEach(scene => {
          if (montageAssets[scene.videoKey]) {
            urls[scene.id] = montageAssets[scene.videoKey];
          }
        });
        setSceneVideoUrls(urls);
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

  const currentSceneIndex = VIDEO_SCENES.findIndex(s => s.id === screen);
  const currentScene = currentSceneIndex >= 0 ? VIDEO_SCENES[currentSceneIndex] : null;

  // Video control functions
  const togglePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [videoPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setVideoCurrentTime(current);
      if (duration > 0) {
        setVideoProgress((current / duration) * 100);
      }
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * videoRef.current.duration;
      videoRef.current.currentTime = newTime;
    }
  }, []);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset video state when scene changes
  useEffect(() => {
    setVideoProgress(0);
    setVideoCurrentTime(0);
    setVideoDuration(0);
    setVideoPlaying(false);
  }, [screen]);

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Make It Do</h1>
          <p className="text-white/50 text-xs">Beat 8 of 13</p>
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
              beatTitle="Make It Do, Or Do Without"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Home size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">The Home Front</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  While soldiers fought overseas, everyday Americans fought a different battle at home. Through sacrifice and ingenuity, civilians became an essential part of the war effort.
                </p>
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 italic text-sm">
                    "Use it up, wear it out, make it do, or do without."
                  </p>
                  <p className="text-white/50 text-xs mt-2">— Popular wartime slogan</p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  See How They Helped
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* VIDEO SCENE SCREENS - Cooking Fat, Fabric, Victory Gardens */}
          {currentScene && (
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Video Player Area */}
              <div className="relative aspect-video bg-black">
                {sceneVideoUrls[currentScene.id] ? (
                  <>
                    <video
                      ref={videoRef}
                      src={sceneVideoUrls[currentScene.id]}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted={isMuted}
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      onEnded={() => setVideoPlaying(false)}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      playsInline
                    />

                    {/* Tap to play/pause overlay */}
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={togglePlayPause}
                    />

                    {/* Video Controls */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      {/* Progress bar */}
                      <div
                        className="relative h-1 bg-white/20 rounded-full cursor-pointer mb-3"
                        onClick={handleProgressClick}
                      >
                        <div
                          className="absolute h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                          style={{ width: `${videoProgress}%` }}
                        />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-400 rounded-full shadow-lg"
                          style={{
                            left: `${videoProgress}%`,
                            marginLeft: '-6px',
                            boxShadow: '0 0 8px rgba(251, 191, 36, 0.6)'
                          }}
                        />
                      </div>

                      {/* Time and controls row */}
                      <div className="flex items-center justify-between">
                        {/* Left: Mute */}
                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="w-8 h-8 rounded-full bg-white/10 border border-amber-500/20 flex items-center justify-center text-white/70 hover:text-amber-400 hover:border-amber-500/40 transition-colors"
                        >
                          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>

                        {/* Center: Play/Pause */}
                        <button
                          onClick={togglePlayPause}
                          className="w-12 h-12 rounded-full bg-cream flex items-center justify-center shadow-lg"
                        >
                          {videoPlaying ? (
                            <Pause size={20} className="text-black" />
                          ) : (
                            <Play size={20} className="text-black ml-0.5" />
                          )}
                        </button>

                        {/* Right: Time */}
                        <div className="flex items-center gap-1 font-mono text-xs tracking-wider">
                          <span className="text-amber-400 font-semibold">{formatTime(videoCurrentTime)}</span>
                          <span className="text-white/40">/</span>
                          <span className="text-white/50">{formatTime(videoDuration)}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-900/30 to-black/50">
                    <span className="text-5xl mb-4">{currentScene.icon}</span>
                    <p className="text-white/60 text-sm">Video: {currentScene.videoKey}</p>
                    <p className="text-white/40 text-xs mt-1">Upload via admin panel</p>
                  </div>
                )}
              </div>

              {/* Scene Info */}
              <div className="flex-1 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{currentScene.icon}</span>
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentScene.title}</h3>
                    <p className="text-amber-400 text-sm">{currentScene.subtitle}</p>
                  </div>
                </div>

                <p className="text-white/70 mb-6 leading-relaxed">
                  {currentScene.description}
                </p>

                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                  <p className="text-xs text-amber-400 uppercase tracking-wider mb-1">Did You Know?</p>
                  <p className="text-amber-200 text-sm">
                    {currentScene.factoid}
                  </p>
                </div>

                {/* Scene Progress Dots */}
                <div className="flex justify-center gap-2 mt-6">
                  {VIDEO_SCENES.map((scene, idx) => (
                    <div
                      key={scene.id}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentSceneIndex
                          ? 'bg-amber-500'
                          : idx < currentSceneIndex
                            ? 'bg-amber-500/50'
                            : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="px-6" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {currentSceneIndex < VIDEO_SCENES.length - 1 ? 'Next Scene' : 'Continue'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* RATIONING FACTS - OPA Stamp Design */}
          {screen === 'rationing-facts' && (
            <motion.div
              key="rationing-facts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-full"
              style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(100,60,20,0.22) 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, rgba(138,10,14,0.15) 0%, transparent 50%), linear-gradient(180deg, #0c0906 0%, #070503 60%, #030201 100%)',
              }}
            >
              {/* Hero Block */}
              <div className="text-center py-6 px-4">
                {/* Ration Book Illustration */}
                <div className="relative w-28 h-20 mx-auto mb-4" style={{ filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.6))' }}>
                  <div
                    className="absolute inset-0 rounded-sm"
                    style={{
                      background: 'linear-gradient(135deg, #9a5a28 0%, #7a4518 50%, #5a3210 100%)',
                      border: '1px solid #3a1e08',
                      transform: 'rotate(-2deg)',
                      boxShadow: 'inset 0 1px 0 rgba(255,200,150,0.2), inset 0 -2px 4px rgba(0,0,0,0.4), 2px 4px 0 rgba(58,30,8,0.4)',
                    }}
                  >
                    <div className="absolute inset-[6px] border border-[rgba(255,220,170,0.35)] rounded-[1px]" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2" style={{ transform: 'rotate(-2deg)' }}>
                      <span className="font-mono text-[5px] tracking-[0.2em] text-[rgba(255,220,170,0.85)] font-bold uppercase">United States of America</span>
                      <span className="font-display text-[8px] text-[rgba(255,230,190,0.95)] uppercase tracking-wide leading-none mt-0.5" style={{ textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}>Office of Price<br/>Administration</span>
                      <span className="font-display text-[12px] font-bold text-[rgba(255,230,190,1)] uppercase tracking-wider leading-none mt-1 italic" style={{ textShadow: '0 1px 0 rgba(0,0,0,0.5)' }}>War Ration<br/>Book Two</span>
                    </div>
                  </div>
                  {/* OPA Stamp */}
                  <div
                    className="absolute -top-1.5 -right-2.5 w-8 h-8 rounded-full flex flex-col items-center justify-center z-10"
                    style={{
                      background: 'rgba(156,28,31,0.85)',
                      border: '1.5px solid rgba(255,80,80,0.8)',
                      transform: 'rotate(14deg)',
                      boxShadow: '0 0 8px rgba(138,10,14,0.5)',
                    }}
                  >
                    <span className="font-display text-[5px] font-black text-white uppercase leading-none">O.P.A.</span>
                    <span className="font-mono text-[4px] text-[rgba(255,220,220,0.85)] tracking-wider font-bold leading-none">1943</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="w-3 h-px bg-gold-2/60" />
                  <span className="font-mono text-[8px] tracking-[0.35em] text-gold-2 font-bold uppercase">What families carried</span>
                  <span className="w-3 h-px bg-gold-2/60" />
                </div>
                <h3 className="font-display text-xl font-bold text-white uppercase tracking-wide italic">
                  Ration Book <em className="text-gold-2">Basics</em>
                </h3>
                <p className="font-serif text-sm text-off-white/60 italic mt-1">Every family had one. These were the stamps they spent.</p>
              </div>

              {/* Ration Stamps Grid */}
              <div className="flex-1 px-4 pb-4">
                <div className="grid grid-cols-2 gap-2.5">
                  {RATIONING_FACTS.map((fact, index) => {
                    const borderColor = fact.color === 'red' ? '#9c1c1f' : fact.color === 'blue' ? '#2a4868' : '#5a3018';
                    return (
                      <motion.div
                        key={fact.item}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                        className="relative rounded-[3px] p-3 overflow-hidden"
                        style={{
                          background: 'radial-gradient(ellipse at 30% 25%, #f2e4bd 0%, #e8d49c 60%, #d6b478 100%)',
                          minHeight: '130px',
                        }}
                      >
                        {/* Paper texture overlay */}
                        <div
                          className="absolute inset-0 mix-blend-multiply opacity-50 pointer-events-none rounded-[3px]"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch' seed='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.26 0 0 0 0 0.1 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`,
                          }}
                        />

                        {/* Decorative border */}
                        <div className="absolute inset-[4px] border-[1.5px] rounded-[1px] pointer-events-none z-[2]" style={{ borderColor }} />
                        <div className="absolute inset-[6.5px] border-[0.5px] rounded-[1px] pointer-events-none z-[2] opacity-50" style={{ borderColor }} />

                        {/* Corner marks */}
                        <div className="absolute top-[7px] left-[7px] w-[5px] h-[5px] border-t border-l pointer-events-none z-[3]" style={{ borderColor }} />
                        <div className="absolute top-[7px] right-[7px] w-[5px] h-[5px] border-t border-r pointer-events-none z-[3]" style={{ borderColor }} />
                        <div className="absolute bottom-[7px] left-[7px] w-[5px] h-[5px] border-b border-l pointer-events-none z-[3]" style={{ borderColor }} />
                        <div className="absolute bottom-[7px] right-[7px] w-[5px] h-[5px] border-b border-r pointer-events-none z-[3]" style={{ borderColor }} />

                        {/* Content */}
                        <div className="relative z-[3]">
                          {/* Top row: serial + OPA */}
                          <div className="flex justify-between items-center mb-2 px-0.5">
                            <span className="font-mono text-[7px] tracking-[0.2em] uppercase font-bold" style={{ color: borderColor }}>◆ {fact.serial}</span>
                            <span className="font-mono text-[6px] tracking-[0.25em] uppercase font-bold opacity-80" style={{ color: borderColor }}>O.P.A.</span>
                          </div>

                          {/* Middle row: icon + item info */}
                          <div className="flex items-start gap-2.5">
                            <div
                              className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-sm"
                              style={{
                                color: '#2a1608',
                                background: 'rgba(245,229,184,0.4)',
                                border: '1px solid rgba(58,30,10,0.25)',
                                boxShadow: 'inset 0 1px 2px rgba(255,240,200,0.3)',
                              }}
                            >
                              <RationIcon type={fact.iconType} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-display text-[12px] font-bold uppercase tracking-wide leading-none" style={{ color: '#2a1608' }}>{fact.item}</div>
                              <div className="font-serif text-[16px] leading-none mt-1" style={{ color: fact.color === 'blue' ? '#2a4868' : fact.color === 'brown' ? '#5a3018' : '#701419' }}>{fact.amount}</div>
                            </div>
                          </div>

                          {/* Divider */}
                          <div
                            className="h-px my-2 mx-0.5 opacity-35"
                            style={{ background: 'repeating-linear-gradient(90deg, #3a1e0a 0, #3a1e0a 3px, transparent 3px, transparent 6px)' }}
                          />

                          {/* Why row */}
                          <div className="px-0.5">
                            <span className="font-mono text-[6px] tracking-[0.2em] uppercase font-bold block mb-0.5" style={{ color: borderColor }}>◆ Why rationed</span>
                            <span className="text-[10px] leading-[1.25]" style={{ color: '#3a1e0a', fontFamily: "'Special Elite', serif" }}>{fact.reason}</span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Penalty Notice */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="relative rounded-[3px] p-4 mt-3 overflow-hidden flex items-center gap-4"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 25%, #f2e4bd 0%, #e8d49c 60%, #d6b478 100%)',
                  }}
                >
                  {/* Paper texture */}
                  <div
                    className="absolute inset-0 mix-blend-multiply opacity-45 pointer-events-none rounded-[3px]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p2'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.26 0 0 0 0 0.1 0 0 0 0.15 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p2)'/%3E%3C/svg%3E")`,
                    }}
                  />
                  {/* Border */}
                  <div className="absolute inset-[4px] border-[1.5px] border-[#9c1c1f] rounded-[1px] pointer-events-none z-[2]" />
                  <div className="absolute inset-[6.5px] border-[0.5px] border-dashed border-[#9c1c1f] opacity-50 rounded-[1px] pointer-events-none z-[2]" />

                  {/* Red Rubber Stamp */}
                  <div
                    className="relative w-16 h-16 rounded-full border-[2px] border-[#9c1c1f] flex flex-col items-center justify-center flex-shrink-0 z-[3]"
                    style={{
                      transform: 'rotate(-8deg)',
                      background: 'rgba(245,229,184,0.25)',
                      boxShadow: 'inset 0 0 0 1px rgba(156,28,31,0.3)',
                      filter: 'drop-shadow(0 2px 3px rgba(138,10,14,0.2))',
                    }}
                  >
                    <div className="absolute inset-[3px] border border-dashed border-[#9c1c1f] rounded-full opacity-45" />
                    <span className="font-display text-[8px] font-black uppercase leading-none" style={{ color: '#701419' }}>Penalty</span>
                    <span className="font-display text-[14px] font-black uppercase leading-none mt-0.5" style={{ color: '#701419' }}>$10,000</span>
                    <span className="font-mono text-[5px] uppercase font-bold leading-none mt-0.5 opacity-85" style={{ color: '#701419' }}>O.P.A. 1943</span>
                  </div>

                  {/* Notice Text */}
                  <div className="relative z-[3] flex-1">
                    <span className="font-mono text-[7px] tracking-[0.25em] text-[#9c1c1f] uppercase font-bold block mb-1.5">◆ Official notice · Rationing violations</span>
                    <span className="text-[12px] leading-[1.3]" style={{ color: '#2a1608', fontFamily: "'Special Elite', serif" }}>
                      Families who violated rationing rules faced fines up to <strong className="font-serif text-[14px]" style={{ color: '#701419' }}>$10,000</strong> or imprisonment — roughly $190,000 today.
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Continue CTA */}
              <div className="px-4 pb-4" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={nextScreen}
                  className="relative w-full py-4 bg-gold-2 hover:bg-gold-1 text-[#1a0b02] font-display text-sm font-bold tracking-[0.25em] uppercase rounded transition-colors flex items-center justify-center gap-3"
                  style={{ boxShadow: '0 6px 18px rgba(230,171,42,0.25), inset 0 -3px 6px rgba(138,80,20,0.2)' }}
                >
                  {/* Corner brackets */}
                  <div className="absolute -top-px -left-px w-2.5 h-2.5 border-t-[1.5px] border-l-[1.5px] border-ha-red" />
                  <div className="absolute -bottom-px -right-px w-2.5 h-2.5 border-b-[1.5px] border-r-[1.5px] border-ha-red" />
                  Continue
                  <ChevronRight size={18} strokeWidth={2.4} />
                </button>
                <p className="text-center font-mono text-[8px] tracking-[0.25em] text-off-white/30 uppercase font-semibold mt-2.5">
                  ◆ Up next · Reflection
                </p>
              </div>
            </motion.div>
          )}

          {/* REFLECTION */}
          {screen === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
                >
                  <span className="text-3xl">💭</span>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-4">Reflection</h3>

                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/80 leading-relaxed">
                    The American home front showed how civilians could contribute to a war effort through everyday sacrifices. From saving cooking fat to growing vegetables, ordinary people made extraordinary contributions.
                  </p>
                </div>

                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 text-sm italic">
                    "Every citizen was a soldier in the war for production."
                  </p>
                </div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Complete Beat
                </button>
              </div>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Make It Do, Or Do Without"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <XPCompletionScreen
              beatNumber={8}
              beatTitle="Make It Do"
              xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
              host={host}
              onContinue={() => {
                clearCheckpoint();
                onComplete(skipped ? 0 : LESSON_DATA.xpReward);
              }}
              nextBeatPreview="Letters Home - Hear the words of soldiers in their own voices"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

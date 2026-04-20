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

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Play, Volume2, VolumeX, ChevronRight, Home } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
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
  id: 'ph-beat-8',
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

// Rationing facts for the quiz/education screen
interface RationingFact {
  item: string;
  points: string;
  reason: string;
  icon: string;
}

const RATIONING_FACTS: RationingFact[] = [
  { item: 'Sugar', points: '8 oz/week', reason: 'Used in making explosives', icon: '🍬' },
  { item: 'Coffee', points: '1 lb/5 weeks', reason: 'Shipping lanes needed for war materials', icon: '☕' },
  { item: 'Gasoline', points: '3 gal/week', reason: 'Fuel for military vehicles', icon: '⛽' },
  { item: 'Rubber', points: 'Limited', reason: 'Tires, gas masks, life rafts', icon: '🚗' },
  { item: 'Meat', points: '28 oz/week', reason: 'Feeding the troops overseas', icon: '🥩' },
  { item: 'Butter', points: '4 oz/week', reason: 'Fats needed for munitions', icon: '🧈' },
];

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

  // Save checkpoint on screen change
  useEffect(() => {
    if (screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {},
      });
    }
  }, [screen, saveCheckpoint]);

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
      const shouldShowPreVideo = (isPreview || !checkpoint?.lessonId) &&
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

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
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
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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
                      src={sceneVideoUrls[currentScene.id]}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted={isMuted}
                      onPlay={() => setVideoPlaying(true)}
                      onEnded={() => setVideoPlaying(false)}
                      playsInline
                    />
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
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

              <div className="px-6" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  {currentSceneIndex < VIDEO_SCENES.length - 1 ? 'Next Scene' : 'Continue'}
                  <ChevronRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* RATIONING FACTS */}
          {screen === 'rationing-facts' && (
            <motion.div key="rationing-facts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <span className="text-4xl">📋</span>
                <h3 className="text-xl font-bold text-white mt-2">Ration Book Basics</h3>
                <p className="text-white/60 text-sm">Every family had one</p>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                {RATIONING_FACTS.map((fact, index) => (
                  <motion.div
                    key={fact.item}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-xl p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{fact.icon}</span>
                      <span className="text-white font-medium text-sm">{fact.item}</span>
                    </div>
                    <p className="text-amber-400 font-bold text-sm mb-1">{fact.points}</p>
                    <p className="text-white/50 text-xs">{fact.reason}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 rounded-xl p-4 border border-white/10 mt-4"
              >
                <p className="text-white/70 text-sm text-center">
                  Families who violated rationing rules faced fines up to <strong className="text-amber-400">$10,000</strong> or imprisonment.
                </p>
              </motion.div>

              <div className="mt-4" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Continue
                </button>
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

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6 items-center justify-center"
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
                clearCheckpoint();
                onComplete(skipped ? 0 : LESSON_DATA.xpReward);
              }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">🏠</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Beat 8 Complete!</h2>
              <p className="text-white/60 mb-6">Make It Do, Or Do Without</p>
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
              </div>
              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Letters Home - Hear the words of soldiers in their own voices.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

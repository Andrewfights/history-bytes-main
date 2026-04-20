/**
 * Beat 13: The Things They Carried - Artifacts of War
 * Format: Artifact Gallery (Reusable type)
 * XP: 45 | Duration: 4-5 min
 *
 * Narrative: Explore personal items that soldiers brought to war.
 * Swipeable showcase of historical artifacts with detailed information.
 *
 * This is a REUSABLE beat type: artifact-gallery
 * Can be used for any collection of historical items, documents, or objects.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ArrowLeft, Sparkles, Package, ChevronLeft, ChevronRight, ZoomIn, X, Info } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen =
  | 'pre-video'
  | 'intro'
  | 'gallery'
  | 'handkerchief-demo'
  | 'reflection'
  | 'post-video'
  | 'completion';

const SCREENS: Screen[] = [
  'pre-video',
  'intro',
  'gallery',
  'handkerchief-demo',
  'reflection',
  'post-video',
  'completion'
];

const LESSON_DATA = {
  id: 'ph-beat-10',
  xpReward: 45,
};

// Artifact configuration
interface Artifact {
  id: string;
  name: string;
  category: string;
  description: string;
  story: string;
  imageKey: string; // Key for Firestore image asset
  facts: string[];
  owner?: string;
  icon: string;
}

const ARTIFACTS: Artifact[] = [
  {
    id: 'photo-wallet',
    name: 'Wallet Photo',
    category: 'Personal',
    description: 'A worn photograph of a sweetheart or family, carried in a wallet.',
    story: 'Soldiers carried photos of loved ones everywhere. Many photos were found on soldiers after battles, sometimes the only way to identify them or notify their families.',
    imageKey: 'things-carried-photo-wallet',
    facts: [
      'Photos were often the only reminder of home',
      'Many soldiers kissed their photos before battle',
      'Damaged photos were repaired with tape and carried anyway',
    ],
    owner: 'Countless servicemen',
    icon: '📸',
  },
  {
    id: 'cigarettes',
    name: 'Lucky Strike Cigarettes',
    category: 'Comfort Item',
    description: 'Cigarettes were included in military rations and became a form of currency.',
    story: 'Lucky Strike changed its packaging from green to white during WWII, claiming the green dye was needed for the war effort. Their slogan became "Lucky Strike Green Has Gone to War."',
    imageKey: 'things-carried-cigarettes',
    facts: [
      'Each K-ration included 4 cigarettes',
      'Used as currency with locals',
      'Considered essential for morale',
    ],
    icon: '🚬',
  },
  {
    id: 'pocket-bible',
    name: 'Pocket Bible',
    category: 'Spiritual',
    description: 'A small Bible or religious text, often given by family before deployment.',
    story: 'The Armed Forces distributed millions of pocket-sized Bibles. Many soldiers believed these books brought them luck, and some had bullet marks where the book stopped shrapnel.',
    imageKey: 'things-carried-bible',
    facts: [
      'Over 14 million distributed during WWII',
      'Fit in a shirt pocket',
      'Some had metal covers for protection',
    ],
    icon: '📖',
  },
  {
    id: 'silk-map',
    name: 'Silk Escape Map',
    category: 'Survival',
    description: 'Maps printed on silk that could be hidden in clothing and wouldn\'t rustle or tear when wet.',
    story: 'Silk maps were given to aircrews flying over enemy territory. They could be sewn into jacket linings and survived water, unlike paper. Some showed escape routes to neutral countries.',
    imageKey: 'things-carried-silk-map',
    facts: [
      'Printed by companies like Bartholomew',
      'Could be hidden in playing cards',
      'Silent unlike paper maps',
    ],
    icon: '🗺️',
  },
  {
    id: 'handkerchief',
    name: 'Mother\'s Handkerchief',
    category: 'Personal',
    description: 'A simple cotton handkerchief, often embroidered by a mother or wife.',
    story: 'This handkerchief was carried by Ensign James through the attack on Pearl Harbor. His mother had embroidered his initials on the corner. He kept it with him throughout the entire war.',
    imageKey: 'things-carried-handkerchief',
    facts: [
      'Often the last gift from home',
      'Used for everything from wounds to tears',
      'Many soldiers were buried with them',
    ],
    owner: 'Ensign William James',
    icon: '🤧',
  },
  {
    id: 'dog-tags',
    name: 'Dog Tags',
    category: 'Identification',
    description: 'Two identical metal tags worn around the neck for identification.',
    story: 'If a soldier was killed, one tag stayed with the body while the other went to the commanding officer for records. The notch was for the embossing machine, though many believed it was to place in a dead soldier\'s teeth.',
    imageKey: 'things-carried-dog-tags',
    facts: [
      'Made of monel metal (corrosion-resistant)',
      'Included blood type after 1943',
      'Two tags: one stays, one goes',
    ],
    icon: '🏷️',
  },
];

interface ThingsCarriedBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function ThingsCarriedBeat({ host, onComplete, onSkip, onBack, isPreview = false }: ThingsCarriedBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  // Gallery state
  const [currentArtifactIndex, setCurrentArtifactIndex] = useState(0);
  const [viewedArtifacts, setViewedArtifacts] = useState<Set<string>>(new Set());
  const [isZoomed, setIsZoomed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Image URLs from Firestore
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  // Swipe handling
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
        state: { viewedArtifacts: Array.from(viewedArtifacts), currentArtifactIndex },
      });
    }
  }, [screen, saveCheckpoint, viewedArtifacts, currentArtifactIndex]);

  // Subscribe to Firestore for assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      // Pre/Post module videos
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

      // Artifact images
      const artifactAssets = assets?.artifactImages?.[LESSON_DATA.id];
      if (artifactAssets) {
        const urls: Record<string, string> = {};
        ARTIFACTS.forEach(artifact => {
          if (artifactAssets[artifact.imageKey]) {
            urls[artifact.id] = artifactAssets[artifact.imageKey];
          }
        });
        setImageUrls(urls);
      }

      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // Set initial screen based on pre-module video
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

  // Mark current artifact as viewed
  useEffect(() => {
    if (screen === 'gallery') {
      const artifact = ARTIFACTS[currentArtifactIndex];
      if (artifact && !viewedArtifacts.has(artifact.id)) {
        setViewedArtifacts(prev => new Set(prev).add(artifact.id));
      }
    }
  }, [currentArtifactIndex, screen, viewedArtifacts]);

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

  const goToNextArtifact = () => {
    if (currentArtifactIndex < ARTIFACTS.length - 1) {
      setCurrentArtifactIndex(currentArtifactIndex + 1);
      setShowInfo(false);
    }
  };

  const goToPrevArtifact = () => {
    if (currentArtifactIndex > 0) {
      setCurrentArtifactIndex(currentArtifactIndex - 1);
      setShowInfo(false);
    }
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100 && currentArtifactIndex < ARTIFACTS.length - 1) {
      goToNextArtifact();
    } else if (info.offset.x > 100 && currentArtifactIndex > 0) {
      goToPrevArtifact();
    }
  };

  const currentArtifact = ARTIFACTS[currentArtifactIndex];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">The Things They Carried</h1>
          <p className="text-white/50 text-xs">Beat 10 of 13</p>
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
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="The Things They Carried"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Package size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Artifacts of War</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  Every soldier carried pieces of home into battle. These small objects - photos, letters, lucky charms - connected them to the world they fought to protect.
                </p>
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 italic text-sm">
                    "They carried all they could bear, and then some, including a silent awe for the terrible power of the things they carried."
                  </p>
                  <p className="text-white/50 text-xs mt-2">— Tim O'Brien, "The Things They Carried"</p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Explore the Collection
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* GALLERY */}
          {screen === 'gallery' && (
            <motion.div
              key="gallery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
              ref={containerRef}
            >
              {/* Gallery Counter */}
              <div className="px-4 py-2 flex items-center justify-between">
                <p className="text-white/50 text-sm">{currentArtifactIndex + 1} of {ARTIFACTS.length}</p>
                <div className="flex items-center gap-2">
                  {ARTIFACTS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentArtifactIndex
                          ? 'bg-amber-500'
                          : viewedArtifacts.has(ARTIFACTS[idx].id)
                            ? 'bg-amber-500/50'
                            : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Artifact Display */}
              <motion.div
                className="flex-1 relative px-4"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={handleDragEnd}
                style={{ x }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentArtifact.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="h-full flex flex-col"
                  >
                    {/* Artifact Image */}
                    <div
                      className="relative aspect-square bg-gradient-to-b from-amber-900/20 to-black/40 rounded-2xl overflow-hidden mb-4"
                      onClick={() => setIsZoomed(true)}
                    >
                      {imageUrls[currentArtifact.id] ? (
                        <img
                          src={imageUrls[currentArtifact.id]}
                          alt={currentArtifact.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <span className="text-7xl mb-4">{currentArtifact.icon}</span>
                          <p className="text-white/40 text-sm">Artifact: {currentArtifact.imageKey}</p>
                        </div>
                      )}
                      <button className="absolute bottom-4 right-4 p-2 rounded-full bg-black/50 text-white/70 hover:text-white">
                        <ZoomIn size={20} />
                      </button>
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/50 text-amber-400 text-xs">
                        {currentArtifact.category}
                      </div>
                    </div>

                    {/* Artifact Info */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">{currentArtifact.name}</h3>
                          {currentArtifact.owner && (
                            <p className="text-amber-400 text-sm">{currentArtifact.owner}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setShowInfo(!showInfo)}
                          className={`p-2 rounded-full ${showInfo ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/70'}`}
                        >
                          <Info size={20} />
                        </button>
                      </div>

                      <p className="text-white/70 mb-4">{currentArtifact.description}</p>

                      {showInfo && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4"
                        >
                          <p className="text-white/80 text-sm mb-3">{currentArtifact.story}</p>
                          <div className="space-y-2">
                            {currentArtifact.facts.map((fact, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-amber-400">•</span>
                                <p className="text-white/60 text-sm">{fact}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Navigation Arrows */}
                {currentArtifactIndex > 0 && (
                  <button
                    onClick={goToPrevArtifact}
                    className="absolute left-0 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-r-xl text-white/70 hover:text-white"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                {currentArtifactIndex < ARTIFACTS.length - 1 && (
                  <button
                    onClick={goToNextArtifact}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-l-xl text-white/70 hover:text-white"
                  >
                    <ChevronRight size={24} />
                  </button>
                )}
              </motion.div>

              {/* Continue Button */}
              <div className="px-4" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                {viewedArtifacts.size >= 3 ? (
                  <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                    Continue
                  </button>
                ) : (
                  <p className="text-center text-white/40 text-sm py-4">
                    Swipe to explore more artifacts ({viewedArtifacts.size}/{Math.min(3, ARTIFACTS.length)} required)
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* HANDKERCHIEF DEMO - Special interactive moment */}
          {screen === 'handkerchief-demo' && (
            <motion.div key="handkerchief-demo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', duration: 1 }}
                  className="w-32 h-32 bg-gradient-to-br from-white/20 to-white/5 rounded-lg flex items-center justify-center mb-6 border border-white/20"
                >
                  <span className="text-6xl">🤧</span>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-4">A Mother's Gift</h3>

                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/80 leading-relaxed">
                    Ensign William James carried this handkerchief through the attack on Pearl Harbor. His mother had embroidered his initials in the corner.
                  </p>
                  <p className="text-white/60 text-sm mt-4 italic">
                    "When the bombs started falling, I reached into my pocket and felt it there. It reminded me what I was fighting for."
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30"
                >
                  <p className="text-amber-200 text-sm">
                    The simple things we carry can hold the greatest meaning.
                  </p>
                </motion.div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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

                <h3 className="text-xl font-bold text-white mb-4">What Would You Carry?</h3>

                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/80 leading-relaxed">
                    These objects remind us that soldiers weren't just warriors - they were sons, husbands, fathers, and friends. The things they carried connected them to everything they loved.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6">
                  {ARTIFACTS.slice(0, 6).map(artifact => (
                    <div
                      key={artifact.id}
                      className={`p-3 rounded-xl text-center border transition-colors ${
                        viewedArtifacts.has(artifact.id)
                          ? 'bg-amber-500/10 border-amber-500/30'
                          : 'bg-white/5 border-white/10'
                      }`}
                    >
                      <span className="text-2xl">{artifact.icon}</span>
                    </div>
                  ))}
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
              beatTitle="The Things They Carried"
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">📦</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Beat 10 Complete!</h2>
              <p className="text-white/60 mb-6">The Things They Carried</p>
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
              </div>
              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Code Talkers - Learn about the unbreakable Navajo code.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={() => setIsZoomed(false)}
          >
            <button className="absolute top-4 right-4 p-2 text-white/70 hover:text-white">
              <X size={24} />
            </button>
            {imageUrls[currentArtifact.id] ? (
              <img
                src={imageUrls[currentArtifact.id]}
                alt={currentArtifact.name}
                className="max-w-full max-h-full object-contain p-4"
              />
            ) : (
              <span className="text-9xl">{currentArtifact.icon}</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

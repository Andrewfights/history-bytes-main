/**
 * Beat 8: Day of Infamy - FDR's Response
 * Format: Primary Source Moment + Drag-and-Drop
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Analyze FDR's historic "Day of Infamy" speech,
 * the Congressional vote, and the Marshall warning.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, Sparkles, FileText, Edit3, Users, AlertCircle, Play, Pause, Volume2 } from 'lucide-react';
import { WW2Host } from '@/types';
import { DragAndDropSorter, SortableItem, PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useScreenHistory } from '../hooks/useScreenHistory';
import { useWW2ModuleAssets } from '../hooks/useWW2ModuleAssets';

// Media keys from WW2ModuleEditor
const MEDIA_KEYS = {
  fdrSpeech: 'fdr-day-of-infamy-speech-audio-optional',
};

type Screen = 'pre-video' | 'intro' | 'speech-evolution' | 'reconstruct' | 'vote' | 'marshall' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'speech-evolution', 'reconstruct', 'vote', 'marshall', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-6',
  xpReward: 50,
};

// Words for the speech reconstruction drag-and-drop
const SPEECH_ITEMS: SortableItem[] = [
  { id: 'yesterday', label: 'Yesterday,' },
  { id: 'december', label: 'December 7, 1941 —' },
  { id: 'date', label: 'a date which' },
  { id: 'will', label: 'will live' },
  { id: 'infamy', label: 'in infamy —' },
];

const CORRECT_SPEECH_ORDER = ['yesterday', 'december', 'date', 'will', 'infamy'];

interface DayOfInfamyBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function DayOfInfamyBeat({ host, onComplete, onSkip, onBack, isPreview = false }: DayOfInfamyBeatProps) {
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

  const [showDraftComparison, setShowDraftComparison] = useState(false);
  const [reconstructComplete, setReconstructComplete] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();
  const { getMediaUrl } = useWW2ModuleAssets();

  // Get uploaded media URLs
  const fdrSpeechUrl = getMediaUrl('ph-beat-8', MEDIA_KEYS.fdrSpeech);

  // Handle FDR speech audio playback
  const handlePlayAudio = useCallback(() => {
    if (!fdrSpeechUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(fdrSpeechUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [fdrSpeechUrl, isPlaying]);

  // Stop audio when changing screens
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [screen]);

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        resetHistory(savedScreen);
      }
    }
  }, [resetHistory]);

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

  // Subscribe to Firestore for pre-module video config
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
        resetHistory('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview, resetHistory]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextScreenValue = SCREENS[currentIndex + 1];
      // Skip post-video if not configured
      if (nextScreenValue === 'post-video' && !postModuleVideoConfig?.enabled) {
        nextScreenValue = 'completion';
      }
      goToScreen(nextScreenValue);
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig, goToScreen]);

  const handleReconstructComplete = (isCorrect: boolean, attempts: number) => {
    setReconstructComplete(true);
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={goToPrevScreen} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          {isFirstScreen ? <X size={24} /> : <ChevronLeft size={24} />}
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Day of Infamy</h1>
          <p className="text-white/50 text-xs">Beat 8 of 10</p>
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
              beatTitle="Day of Infamy"
              onComplete={() => goToScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <FileText size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">FDR's Response</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  At 12:30 PM on December 8, 1941, President Franklin D. Roosevelt addressed a joint session of Congress. His six-minute speech would become one of the most famous in American history.
                </p>
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 italic text-sm">
                    "Yesterday, December 7, 1941 — a date which will live in infamy..."
                  </p>
                  {/* Audio play button if uploaded */}
                  {fdrSpeechUrl && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handlePlayAudio}
                      className="mt-3 flex items-center justify-center gap-2 w-full py-2 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg border border-amber-500/30 transition-colors"
                    >
                      {isPlaying ? (
                        <Pause size={16} className="text-amber-400" />
                      ) : (
                        <Volume2 size={16} className="text-amber-400" />
                      )}
                      <span className="text-amber-400 text-sm font-medium">
                        {isPlaying ? 'Pause Speech' : 'Listen to FDR\'s Speech'}
                      </span>
                    </motion.button>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Analyze the Speech
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* SPEECH EVOLUTION */}
          {screen === 'speech-evolution' && (
            <motion.div key="speech-evolution" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Edit3 size={20} className="text-amber-400" /> The Edit That Made History
                </h3>
                <p className="text-white/60 text-sm">FDR made one crucial change to his first draft</p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {/* Toggle between drafts */}
                <div className="flex justify-center gap-4 mb-6">
                  <button
                    onClick={() => setShowDraftComparison(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${!showDraftComparison ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    First Draft
                  </button>
                  <button
                    onClick={() => setShowDraftComparison(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${showDraftComparison ? 'bg-amber-500 text-black' : 'bg-white/10 text-white/60'}`}
                  >
                    Final Version
                  </button>
                </div>

                {/* Draft display */}
                <AnimatePresence mode="wait">
                  {!showDraftComparison ? (
                    <motion.div
                      key="first-draft"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-amber-50 rounded-xl p-6 max-w-sm mx-auto"
                    >
                      <p className="text-amber-900 font-serif text-lg leading-relaxed">
                        "Yesterday, December 7, 1941 — a date which will live in{' '}
                        <span className="line-through text-red-600">world history</span>{' '}
                        — the United States of America was suddenly and deliberately attacked..."
                      </p>
                      <p className="text-amber-700 text-xs mt-4 text-right">— First Draft</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="final-draft"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-amber-50 rounded-xl p-6 max-w-sm mx-auto"
                    >
                      <p className="text-amber-900 font-serif text-lg leading-relaxed">
                        "Yesterday, December 7, 1941 — a date which will live in{' '}
                        <span className="underline text-amber-600 font-bold">infamy</span>{' '}
                        — the United States of America was suddenly and deliberately attacked..."
                      </p>
                      <p className="text-amber-700 text-xs mt-4 text-right">— Final Version</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm mx-auto mt-6 border border-white/10">
                  <p className="text-white/80 text-sm">
                    <strong className="text-amber-400">"World history"</strong> was factual but forgettable.
                  </p>
                  <p className="text-white/80 text-sm mt-2">
                    <strong className="text-amber-400">"Infamy"</strong> conveyed moral outrage — it's remembered 80+ years later.
                  </p>
                </div>
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Reconstruct the Opening
              </button>
            </motion.div>
          )}

          {/* RECONSTRUCT */}
          {screen === 'reconstruct' && (
            <motion.div key="reconstruct" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative">
              {!reconstructComplete ? (
                <DragAndDropSorter
                  mode="order"
                  items={SPEECH_ITEMS}
                  correctOrder={CORRECT_SPEECH_ORDER}
                  onComplete={handleReconstructComplete}
                  title="Reconstruct the Opening"
                  instructions="Put the words in the correct order"
                  showHints
                  maxAttempts={3}
                />
              ) : (
                <div className="flex flex-col h-full p-6">
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-4xl mb-4">✍️</motion.div>
                    <h3 className="text-lg font-bold text-white mb-4">Complete Opening Line</h3>
                    <div className="bg-amber-500/10 rounded-xl p-6 max-w-sm border border-amber-500/30">
                      <p className="text-amber-200 font-serif text-lg italic">
                        "Yesterday, December 7, 1941 — a date which will live in infamy — the United States of America was suddenly and deliberately attacked by naval and air forces of the Empire of Japan."
                      </p>
                    </div>
                  </div>
                  <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                    See the Vote
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* VOTE */}
          {screen === 'vote' && (
            <motion.div key="vote" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <Users size={32} className="text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white">The Declaration Vote</h3>
                <p className="text-white/60 text-sm">33 minutes after FDR's speech concluded</p>
              </div>

              <div className="flex-1 flex flex-col justify-center space-y-6">
                {/* House vote */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <h4 className="text-white font-bold mb-3">House of Representatives</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-8 bg-green-500/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '99.7%' }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                    <span className="text-green-400 font-bold text-xl">388</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 h-8 bg-red-500/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '0.3%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                    <span className="text-red-400 font-bold text-xl">1</span>
                  </div>
                </motion.div>

                {/* Senate vote */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/5 rounded-xl p-4 border border-white/10"
                >
                  <h4 className="text-white font-bold mb-3">Senate</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-8 bg-green-500/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 1, delay: 0.7 }}
                        className="h-full bg-green-500 rounded-full"
                      />
                    </div>
                    <span className="text-green-400 font-bold text-xl">82</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex-1 h-8 bg-red-500/20 rounded-full overflow-hidden" />
                    <span className="text-red-400 font-bold text-xl">0</span>
                  </div>
                </motion.div>

                {/* Rankin */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30"
                >
                  <p className="text-white font-bold mb-2">The Lone "No" Vote</p>
                  <p className="text-white/80 text-sm">
                    <strong className="text-amber-400">Jeannette Rankin</strong> (R-Montana), the first woman elected to Congress, cast the only vote against war.
                  </p>
                  <p className="text-amber-200 italic text-sm mt-2">
                    "As a woman, I can't go to war, and I refuse to send anyone else."
                  </p>
                  <p className="text-white/50 text-xs mt-2">
                    She had also voted against entering WWI in 1917.
                  </p>
                </motion.div>
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                One More Story
              </button>
            </motion.div>
          )}

          {/* MARSHALL WARNING */}
          {screen === 'marshall' && (
            <motion.div key="marshall" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertCircle size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">The Warning That Arrived Too Late</h3>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 space-y-4">
                  <p className="text-white/80 text-sm">
                    Army Chief of Staff <strong className="text-amber-400">George C. Marshall</strong> sent a war warning to Pearl Harbor at <strong>11:45 AM</strong> Washington time.
                  </p>
                  <p className="text-white/80 text-sm">
                    Due to atmospheric conditions, the message couldn't be sent by Army radio. It was sent via commercial telegram instead.
                  </p>
                  <p className="text-white/80 text-sm">
                    The telegram was delivered by a young Japanese-American bicycle messenger named <strong className="text-amber-400">Tadao Fuchikami</strong>.
                  </p>
                  <p className="text-red-400 text-sm font-bold">
                    The message arrived at 11:45 AM Hawaii time — AFTER the attack had ended.
                  </p>
                </div>

                <div className="bg-red-500/10 rounded-xl p-4 max-w-sm border border-red-500/30 mt-4">
                  <p className="text-white/70 text-sm text-center">
                    Fuchikami was stopped by soldiers who thought he might be a Japanese spy. He wasn't released until he showed them the telegram.
                  </p>
                </div>
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Beat 8
              </button>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="A Date Which Will Live in Infamy"
              onComplete={() => goToScreen('completion')}
            />
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <XPCompletionScreen
              beatNumber={8}
              beatTitle="Day of Infamy"
              xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
              host={host}
              onContinue={nextScreen}
              nextBeatPreview="Arsenal of Democracy - How America mobilized for war"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

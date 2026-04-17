/**
 * Beat 7: Fact or Myth? - Pearl Harbor Legends
 * Format: Fact or Myth Swipe Quiz
 * XP: 50 | Duration: 4-5 min
 *
 * Narrative: Challenge common misconceptions about Pearl Harbor
 * through swipe-based fact vs myth statements.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, HelpCircle, Sparkles, Trophy, Target } from 'lucide-react';
import { WW2Host } from '@/types';
import { FactOrMythSwiper, FactOrMythStatement, PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'pre-video' | 'intro' | 'swipe-quiz' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'swipe-quiz', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-7',
  xpReward: 50,
};

// 8 Fact or Myth statements from PRD
const STATEMENTS: FactOrMythStatement[] = [
  {
    id: 'warning',
    statement: 'The United States had absolutely no warning before the attack.',
    isFact: false,
    explanation:
      'The U.S. had broken Japan\'s diplomatic "Purple" code (MAGIC) and knew war was imminent, though not the specific target. Radar also detected the incoming planes 53 minutes before the attack.',
    source: 'MAGIC decrypts, National Security Agency archives',
  },
  {
    id: 'kgmb-radio',
    statement: 'Japanese pilots used Hawaiian radio station KGMB to navigate to Oahu.',
    isFact: true,
    explanation:
      'Commander Fuchida confirmed that pilots tuned to KGMB\'s signal to home in on Oahu. The station was playing music early that Sunday morning, providing an unintentional beacon.',
    source: 'Fuchida, "Midway: The Battle That Doomed Japan"',
  },
  {
    id: 'carriers-targeted',
    statement: 'The Japanese specifically targeted American aircraft carriers at Pearl Harbor.',
    isFact: false,
    explanation:
      'Japanese naval doctrine (Kantai Kessen) prioritized battleships for decisive fleet battles. Carriers were secondary targets. Fortunately for the U.S., all three Pacific carriers were away from port.',
    source: 'Japanese Naval War College studies',
  },
  {
    id: 'fdr-conspiracy',
    statement: 'President Roosevelt knew the attack was coming and let it happen to justify entering the war.',
    isFact: false,
    explanation:
      'This conspiracy theory has been thoroughly debunked by historians. Intelligence indicated war was coming, but the specific target and timing were unknown. FDR would not have sacrificed the Pacific Fleet.',
    source: 'Multiple Congressional investigations, 1946-1995',
  },
  {
    id: 'planes-parked',
    statement: 'American planes were parked wingtip-to-wingtip because commanders wanted easy targets for Japan.',
    isFact: false,
    explanation:
      'Planes were grouped together as an anti-sabotage measure to make them easier to guard - the perceived threat was internal sabotage, not an air attack. This tragically made them easier targets.',
    source: 'Army Board investigation, 1944',
  },
  {
    id: 'arizona-bomb',
    statement: 'A single 1,760-pound bomb destroyed the USS Arizona, killing 1,177 men.',
    isFact: true,
    explanation:
      'A modified 16-inch naval shell dropped as a bomb penetrated the Arizona\'s deck and ignited the forward ammunition magazines. The explosion killed nearly half of all Americans who died that day.',
    source: 'National Park Service, USS Arizona Memorial',
  },
  {
    id: 'nevada-grounded',
    statement: 'The USS Nevada was intentionally run aground to prevent blocking the harbor entrance.',
    isFact: true,
    explanation:
      'After taking multiple hits, Nevada\'s crew got her underway - the only battleship to do so. When it became clear she might sink in the channel, she was deliberately beached at Hospital Point.',
    source: 'USS Nevada action report, December 7, 1941',
  },
  {
    id: 'japan-aggression',
    statement: 'Japan attacked Pearl Harbor purely out of military aggression and expansionism.',
    isFact: false,
    explanation:
      'While Japan pursued aggressive expansion, the attack was largely a response to the U.S. oil embargo that threatened to cripple Japan\'s military within 18 months. It was a desperate gamble, not pure aggression.',
    source: 'Imperial Conference records, November-December 1941',
  },
];

interface FactOrMythBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function FactOrMythBeat({ host, onComplete, onSkip, onBack, isPreview = false }: FactOrMythBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [finalScore, setFinalScore] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Restore checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.finalScore !== undefined) {
          setFinalScore(checkpoint.state.finalScore);
        }
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
        state: {
          finalScore,
        },
      });
    }
  }, [screen, finalScore, saveCheckpoint]);

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
      const earnedXP = skipped ? 0 : LESSON_DATA.xpReward;
      onComplete(earnedXP);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig]);

  const handleQuizComplete = (score: number, total: number) => {
    setFinalScore(score);
    nextScreen();
  };

  const handleSkip = () => {
    setSkipped(true);
    onSkip();
  };

  const getScoreMessage = () => {
    const percentage = (finalScore / STATEMENTS.length) * 100;
    if (percentage === 100) return "Perfect! You're a Pearl Harbor historian!";
    if (percentage >= 75) return 'Excellent work! You know your history well.';
    if (percentage >= 50) return 'Good effort! Some myths are tricky to spot.';
    return 'Keep learning! History is full of surprises.';
  };

  const getScoreColor = () => {
    const percentage = (finalScore / STATEMENTS.length) * 100;
    if (percentage >= 75) return 'text-green-400';
    if (percentage >= 50) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Fact or Myth?</h1>
          <p className="text-white/50 text-xs">Beat 7 of 10</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img
            src={host.avatarUrl || '/assets/hosts/default.png'}
            alt={host.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Fact or Myth"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO SCREEN */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
                >
                  <HelpCircle size={40} className="text-amber-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  Pearl Harbor Legends
                </h2>

                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  Separating fact from fiction about December 7, 1941. Some of what "everyone knows" about Pearl Harbor is actually wrong.
                </p>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <span className="text-green-400 font-bold text-sm">F</span>
                      </div>
                      <span className="text-white/80 text-sm">Swipe RIGHT</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm">M</span>
                      </div>
                      <span className="text-white/80 text-sm">Swipe LEFT</span>
                    </div>
                  </div>
                  <p className="text-white/50 text-xs">
                    Or tap the buttons at the bottom
                  </p>
                </div>

                <div className="flex items-center gap-2 text-amber-400/80 text-sm">
                  <Target size={16} />
                  <span>{STATEMENTS.length} statements to evaluate</span>
                </div>
              </div>

              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Start the Quiz
                </button>
                <button
                  onClick={handleSkip}
                  className="w-full py-3 text-white/50 hover:text-white/70 text-sm transition-colors"
                >
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* SWIPE QUIZ SCREEN */}
          {screen === 'swipe-quiz' && (
            <motion.div
              key="swipe-quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <FactOrMythSwiper
                statements={STATEMENTS}
                onComplete={handleQuizComplete}
              />
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Fact or Myth"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION SCREEN */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6 items-center justify-center"
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-6"
              >
                {finalScore === STATEMENTS.length ? '🏆' : finalScore >= STATEMENTS.length / 2 ? '✅' : '📚'}
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">Beat 7 Complete!</h2>
              <p className="text-white/60 mb-4">Fact or Myth? - Pearl Harbor Legends</p>

              {/* Score display */}
              <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10 text-center max-w-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Trophy className={getScoreColor()} size={32} />
                  <span className={`text-4xl font-bold ${getScoreColor()}`}>
                    {finalScore}/{STATEMENTS.length}
                  </span>
                </div>
                <p className="text-white/70 text-sm">{getScoreMessage()}</p>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">
                  +{skipped ? 0 : LESSON_DATA.xpReward} XP
                </span>
              </div>

              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Day of Infamy - Analyze FDR's historic speech
              </p>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  className="mt-6 w-full max-w-sm py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
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

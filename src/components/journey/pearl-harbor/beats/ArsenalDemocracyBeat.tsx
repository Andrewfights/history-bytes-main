/**
 * Beat 9: Arsenal of Democracy - America Transforms
 * Format: Timed Challenge + Interactive Visualization
 * XP: 50 | Duration: 4-5 min
 *
 * Narrative: See how America mobilized for war - the industrial
 * transformation that changed the world.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Factory, Globe, AlertTriangle, TrendingUp } from 'lucide-react';
import { WW2Host } from '@/types';
import { TimedChallenge, TimedQuestion, PreModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig } from '@/lib/firestore';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'pre-video' | 'intro' | 'production' | 'timed-challenge' | 'strategy' | 'dark-side' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'production', 'timed-challenge', 'strategy', 'dark-side', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-9',
  xpReward: 50,
};

interface ProductionStat {
  label: string;
  value: string;
  icon: string;
  delay: number;
}

const PRODUCTION_STATS: ProductionStat[] = [
  { label: 'Aircraft Produced', value: '296,000', icon: '✈️', delay: 0 },
  { label: 'Ships Built', value: '87,620', icon: '🚢', delay: 0.2 },
  { label: 'Tanks Built', value: '86,000', icon: '🛡️', delay: 0.4 },
  { label: 'Workers (1941)', value: '6.9 Million', icon: '👷', delay: 0.6 },
  { label: 'Workers (Late 1942)', value: '17.5 Million', icon: '👷‍♀️', delay: 0.8 },
  { label: 'Women in Workforce', value: '8 Million', icon: '💪', delay: 1.0 },
];

const CHALLENGE_QUESTIONS: TimedQuestion[] = [
  {
    id: 'q1',
    question: 'How many aircraft did the US produce from 1942-1945 compared to Japan\'s ENTIRE war production?',
    options: ['About the same', 'Twice as many', 'Three times as many', 'Five times as many'],
    correctIndex: 2,
    explanation: 'The US produced nearly 300,000 aircraft. Japan produced about 76,000 during the entire war.',
    category: 'Production',
  },
  {
    id: 'q2',
    question: 'By 1944, what share of world munitions did the US produce?',
    options: ['15%', '25%', '40%', '60%'],
    correctIndex: 2,
    explanation: 'By 1944, the United States produced approximately 40% of the world\'s munitions.',
    category: 'Production',
  },
  {
    id: 'q3',
    question: 'How fast could Liberty ships be built at peak production?',
    options: ['6 months', '3 months', '6 weeks', 'Less than 5 days'],
    correctIndex: 3,
    explanation: 'The SS Robert E. Peary was built in 4 days, 15 hours. Average time dropped from 244 days to 42 days.',
    category: 'Production',
  },
  {
    id: 'q4',
    question: 'What percentage of the US war effort was directed to the Pacific vs Europe?',
    options: ['50% Pacific, 50% Europe', '78% Pacific, 22% Europe', '22% Pacific, 78% Europe', '90% Pacific, 10% Europe'],
    correctIndex: 2,
    explanation: '"Europe First" strategy meant 78% of resources went to the Atlantic theater, only 22% to the Pacific.',
    category: 'Strategy',
  },
  {
    id: 'q5',
    question: 'What was the B-29 Superfortress program\'s cost compared to the atomic bomb?',
    options: ['Half as much', 'About the same', '50% more', 'Three times as much'],
    correctIndex: 2,
    explanation: 'The B-29 program cost $3 billion, more than the $2 billion Manhattan Project.',
    category: 'Production',
  },
];

interface ArsenalDemocracyBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function ArsenalDemocracyBeat({ host, onComplete, onSkip, onBack, isPreview = false }: ArsenalDemocracyBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [challengeComplete, setChallengeComplete] = useState(false);
  const [challengeScore, setChallengeScore] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
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
        state: {},
      });
    }
  }, [screen, saveCheckpoint]);

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

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      setScreen(SCREENS[currentIndex + 1]);
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete]);

  const handleChallengeComplete = (score: number, total: number, streak: number) => {
    setChallengeScore(score);
    setChallengeComplete(true);
    nextScreen();
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Arsenal of Democracy</h1>
          <p className="text-white/50 text-xs">Beat 9 of 10</p>
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
              beatTitle="Arsenal of Democracy"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Factory size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">America Transforms</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  Pearl Harbor unleashed the greatest industrial mobilization in human history. In just four years, America outproduced the rest of the world combined.
                </p>
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 italic text-sm">
                    "We must be the great arsenal of democracy."
                  </p>
                  <p className="text-white/50 text-xs mt-2">— President Roosevelt, December 1940</p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  See the Numbers
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* PRODUCTION DASHBOARD */}
          {screen === 'production' && (
            <motion.div key="production" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <TrendingUp size={28} className="text-green-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white">War Production Dashboard</h3>
                <p className="text-white/60 text-sm">1942-1945</p>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-3">
                {PRODUCTION_STATS.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stat.delay }}
                    className="bg-white/5 rounded-xl p-4 border border-white/10 text-center"
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <motion.p
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: stat.delay + 0.2, type: 'spring' }}
                      className="text-xl font-bold text-amber-400 mt-2"
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-white/50 text-xs mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 mt-4"
              >
                <p className="text-green-300 text-center text-sm">
                  <strong>40%</strong> of world munitions produced by the US in 1944
                </p>
              </motion.div>

              <div className="mt-4" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Test Your Knowledge
                </button>
              </div>
            </motion.div>
          )}

          {/* TIMED CHALLENGE */}
          {screen === 'timed-challenge' && (
            <motion.div key="timed-challenge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <TimedChallenge
                questions={CHALLENGE_QUESTIONS}
                timeLimit={90}
                perQuestionTime={18}
                onComplete={handleChallengeComplete}
                showStreak
                showProgress
              />
            </motion.div>
          )}

          {/* TWO-OCEAN STRATEGY */}
          {screen === 'strategy' && (
            <motion.div key="strategy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <Globe size={28} className="text-blue-400 mx-auto mb-2" />
                <h3 className="text-lg font-bold text-white">Two-Ocean War</h3>
                <p className="text-white/60 text-sm">"Europe First" Strategy</p>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {/* Visual breakdown */}
                <div className="relative h-16 bg-white/10 rounded-xl overflow-hidden mb-4">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 1 }}
                    className="absolute left-0 top-0 h-full bg-blue-500"
                  />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '22%' }}
                    transition={{ duration: 1 }}
                    className="absolute right-0 top-0 h-full bg-amber-500"
                  />
                  <div className="absolute inset-0 flex items-center justify-between px-4">
                    <span className="text-white font-bold">78% Atlantic</span>
                    <span className="text-black font-bold">22% Pacific</span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                  <h4 className="text-white font-bold mb-3">Why "Europe First"?</h4>
                  <ul className="space-y-2 text-white/70 text-sm">
                    <li>• <strong className="text-blue-400">ABC-1 Talks (1941):</strong> US-UK agreement before Pearl Harbor</li>
                    <li>• <strong className="text-blue-400">Nazi threat:</strong> Germany seen as greater danger</li>
                    <li>• <strong className="text-blue-400">British survival:</strong> UK needed immediate support</li>
                    <li>• <strong className="text-blue-400">Soviet Union:</strong> Keep Russia fighting Germany</li>
                  </ul>
                </div>

                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                  <p className="text-amber-200 text-sm text-center">
                    Despite the "Europe First" strategy, American forces still conducted massive Pacific operations - Midway, Guadalcanal, the island-hopping campaign - with just 22% of resources.
                  </p>
                </div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  The Dark Side
                </button>
              </div>
            </motion.div>
          )}

          {/* DARK SIDE - INTERNMENT */}
          {screen === 'dark-side' && (
            <motion.div key="dark-side" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                  <AlertTriangle size={32} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 text-center">The Dark Side of Mobilization</h3>

                <div className="bg-red-500/10 rounded-xl p-4 max-w-sm border border-red-500/30 mb-4">
                  <p className="text-3xl font-bold text-red-400 text-center mb-2">120,000</p>
                  <p className="text-white/80 text-sm text-center">
                    Japanese Americans forcibly relocated to internment camps under Executive Order 9066.
                  </p>
                </div>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 space-y-3">
                  <p className="text-white/80 text-sm">
                    Two-thirds were <strong className="text-amber-400">American citizens</strong>. Many lost homes, businesses, and livelihoods.
                  </p>
                  <p className="text-white/80 text-sm">
                    No Japanese American was ever convicted of espionage or sabotage during the war.
                  </p>
                  <p className="text-white/80 text-sm">
                    In 1988, the U.S. government formally apologized and paid reparations.
                  </p>
                </div>

                <p className="text-white/50 text-sm text-center mt-4 max-w-sm italic">
                  Remember Ted Tsukiyama? He was one of 120,000 whose loyalty was questioned despite his service.
                </p>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Complete Beat 9
                </button>
              </div>
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 items-center justify-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">🏭</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Beat 9 Complete!</h2>
              <p className="text-white/60 mb-6">Arsenal of Democracy - America Transforms</p>
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
              </div>
              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Mastery Run - Prove your knowledge in the final challenge!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

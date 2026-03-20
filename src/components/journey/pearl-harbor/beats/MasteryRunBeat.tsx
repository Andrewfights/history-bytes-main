/**
 * Beat 10: Mastery Run - Pearl Harbor Final Challenge
 * Format: Timed Challenge (Quiz Gauntlet)
 * XP: 75 (max) | Duration: 6-8 min
 *
 * Narrative: Prove your mastery with 12 questions covering
 * all aspects of the Pearl Harbor curriculum.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Trophy, Target, Award, Star } from 'lucide-react';
import { WW2Host } from '@/types';
import { TimedChallenge, TimedQuestion } from '../shared';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { MASTERY_SCORING } from '@/data/pearlHarborLessons';

type Screen = 'intro' | 'quiz' | 'results' | 'completion';
const SCREENS: Screen[] = ['intro', 'quiz', 'results', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-10',
  xpReward: 75, // Max XP for perfect score
};

// 12 questions covering all beats
const MASTERY_QUESTIONS: TimedQuestion[] = [
  // Beat 1: Road to War
  {
    id: 'q1',
    question: 'What percentage of Japan\'s oil came from the United States before the embargo?',
    options: ['About 40%', 'About 60%', 'Over 80%', '100%'],
    correctIndex: 2,
    explanation: 'Japan depended on the U.S. for over 80% of its oil supply.',
    category: 'Geopolitical',
  },
  // Beat 2: Radar Blip
  {
    id: 'q2',
    question: 'How many minutes before the attack did radar operators detect the incoming planes?',
    options: ['15 minutes', '30 minutes', '53 minutes', '90 minutes'],
    correctIndex: 2,
    explanation: 'Privates Lockard and Elliott detected the planes at 7:02 AM, 53 minutes before the attack began.',
    category: 'Radar',
  },
  // Beat 3: Tora Tora Tora
  {
    id: 'q3',
    question: 'How many aircraft were in the first wave of the attack?',
    options: ['89', '183', '250', '353'],
    correctIndex: 1,
    explanation: 'The first wave consisted of 183 aircraft: 49 bombers, 51 dive bombers, 40 torpedo planes, and 43 fighters.',
    category: 'Tactical',
  },
  // Beat 4: Voices
  {
    id: 'q4',
    question: 'Who was the first African American to receive the Navy Cross?',
    options: ['Jesse Owens', 'Doris Miller', 'Benjamin Davis', 'Joe Louis'],
    correctIndex: 1,
    explanation: 'Doris Miller received the Navy Cross for his heroic actions during the Pearl Harbor attack.',
    category: 'Human',
  },
  // Beat 5: Breaking News
  {
    id: 'q5',
    question: 'What percentage of Americans approved of declaring war on December 8, 1941?',
    options: ['76%', '85%', '91%', '97%'],
    correctIndex: 3,
    explanation: 'After Pearl Harbor, 97% of Americans approved of the war declaration - up from 88% opposing war in January 1940.',
    category: 'Opinion',
  },
  // Beat 6: Nagumo's Dilemma
  {
    id: 'q6',
    question: 'How many barrels of fuel were in Pearl Harbor\'s exposed storage tanks?',
    options: ['500,000', '1.5 million', '4.5 million', '10 million'],
    correctIndex: 2,
    explanation: 'The 4.5 million barrels of exposed fuel could have crippled the Pacific Fleet if destroyed.',
    category: 'Third Wave',
  },
  // Beat 7: Fact or Myth
  {
    id: 'q7',
    question: 'Did the US break Japan\'s military codes before Pearl Harbor?',
    options: ['Yes, all codes', 'Only naval codes', 'Only the Purple diplomatic code', 'No codes were broken'],
    correctIndex: 2,
    explanation: 'The US broke the Purple diplomatic code (MAGIC), not Japan\'s military codes. This is a common misconception.',
    category: 'Myths',
  },
  // Beat 8: Day of Infamy
  {
    id: 'q8',
    question: 'What word did FDR change "world history" to in his famous speech?',
    options: ['Tragedy', 'Infamy', 'Shame', 'Disgrace'],
    correctIndex: 1,
    explanation: 'FDR changed "world history" to "infamy" - a single edit that made the speech unforgettable.',
    category: 'Primary Source',
  },
  // More comprehensive questions
  {
    id: 'q9',
    question: 'What was the final vote in the House for declaring war?',
    options: ['388-1', '420-0', '350-25', '400-10'],
    correctIndex: 0,
    explanation: 'The House voted 388-1, with Jeannette Rankin casting the only "no" vote.',
    category: 'Political',
  },
  // Beat 9: Arsenal of Democracy
  {
    id: 'q10',
    question: 'By 1944, what percentage of world munitions did the US produce?',
    options: ['20%', '30%', '40%', '50%'],
    correctIndex: 2,
    explanation: 'The United States produced approximately 40% of the world\'s munitions by 1944.',
    category: 'Legacy',
  },
  {
    id: 'q11',
    question: 'How many Japanese Americans were forcibly relocated to internment camps?',
    options: ['50,000', '80,000', '120,000', '200,000'],
    correctIndex: 2,
    explanation: 'Executive Order 9066 led to the internment of approximately 120,000 Japanese Americans.',
    category: 'Legacy',
  },
  {
    id: 'q12',
    question: 'Which battleship was the only one to get underway during the attack?',
    options: ['USS Arizona', 'USS Oklahoma', 'USS Nevada', 'USS California'],
    correctIndex: 2,
    explanation: 'The USS Nevada was the only battleship to get underway, but was deliberately grounded to avoid blocking the harbor channel.',
    category: 'Tactical',
  },
];

interface MasteryRunBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

export function MasteryRunBeat({ host, onComplete, onSkip, onBack }: MasteryRunBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [score, setScore] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [skipped, setSkipped] = useState(false);

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
        state: { score },
      });
    }
  }, [screen, score, saveCheckpoint]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      setScreen(SCREENS[currentIndex + 1]);
    } else {
      clearCheckpoint();
      const earnedXP = skipped ? 0 : calculateXP();
      onComplete(earnedXP);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, score]);

  const handleQuizComplete = (finalScore: number, total: number, streak: number) => {
    setScore(finalScore);
    setMaxStreak(streak);
    nextScreen();
  };

  const calculateXP = () => {
    if (score >= MASTERY_SCORING.perfect.minCorrect) return MASTERY_SCORING.perfect.xp;
    if (score >= MASTERY_SCORING.excellent.minCorrect) return MASTERY_SCORING.excellent.xp;
    if (score >= MASTERY_SCORING.good.minCorrect) return MASTERY_SCORING.good.xp;
    return MASTERY_SCORING.needsWork.xp;
  };

  const getScoreTier = () => {
    if (score >= MASTERY_SCORING.perfect.minCorrect) return { tier: 'Perfect!', color: 'text-amber-400', bg: 'bg-amber-500/20', badge: MASTERY_SCORING.perfect.badge };
    if (score >= MASTERY_SCORING.excellent.minCorrect) return { tier: 'Excellent!', color: 'text-green-400', bg: 'bg-green-500/20', badge: null };
    if (score >= MASTERY_SCORING.good.minCorrect) return { tier: 'Good Work!', color: 'text-blue-400', bg: 'bg-blue-500/20', badge: null };
    return { tier: 'Keep Learning', color: 'text-white/60', bg: 'bg-white/10', badge: null };
  };

  const tierInfo = getScoreTier();
  const earnedXP = calculateXP();

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Mastery Run</h1>
          <p className="text-white/50 text-xs">Beat 10 of 10</p>
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
      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
                >
                  <Trophy size={48} className="text-white" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Pearl Harbor Final Challenge</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  Put everything you've learned to the test. 12 questions covering the entire Pearl Harbor curriculum.
                </p>

                {/* Rules */}
                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 mb-6 text-left">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Target size={16} className="text-amber-400" /> Challenge Rules
                  </h4>
                  <ul className="text-white/70 text-sm space-y-2">
                    <li>• <strong className="text-white">12 questions</strong> from all 9 beats</li>
                    <li>• <strong className="text-white">30 seconds</strong> per question</li>
                    <li>• Build streaks for bonus points</li>
                    <li>• <strong className="text-amber-400">12/12</strong> earns "Pearl Harbor Scholar" badge</li>
                  </ul>
                </div>

                {/* Scoring tiers */}
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-400">12: 75 XP</span>
                  <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">10-11: 60 XP</span>
                  <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">8-9: 45 XP</span>
                  <span className="px-2 py-1 rounded bg-white/10 text-white/60">&lt;8: 30 XP</span>
                </div>
              </div>

              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold rounded-xl transition-colors">
                  Begin Mastery Run
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* QUIZ */}
          {screen === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
              <TimedChallenge
                questions={MASTERY_QUESTIONS}
                timeLimit={360} // 6 minutes total
                perQuestionTime={30}
                onComplete={handleQuizComplete}
                showStreak
                showProgress
              />
            </motion.div>
          )}

          {/* RESULTS */}
          {screen === 'results' && (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                {/* Trophy/Badge */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 15 }}
                  className={`w-24 h-24 rounded-full ${tierInfo.bg} flex items-center justify-center mb-6`}
                >
                  {tierInfo.badge ? (
                    <Award size={48} className={tierInfo.color} />
                  ) : (
                    <Trophy size={48} className={tierInfo.color} />
                  )}
                </motion.div>

                <h2 className={`text-3xl font-bold ${tierInfo.color} mb-2`}>{tierInfo.tier}</h2>

                {/* Score display */}
                <div className="bg-white/5 rounded-2xl p-6 max-w-sm w-full border border-white/10 mb-6">
                  <div className="text-center mb-4">
                    <span className="text-5xl font-bold text-white">{score}</span>
                    <span className="text-2xl text-white/40">/{MASTERY_QUESTIONS.length}</span>
                  </div>

                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <p className="text-amber-400 font-bold text-xl">{maxStreak}</p>
                      <p className="text-white/40 text-xs">Max Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-green-400 font-bold text-xl">{Math.round((score / MASTERY_QUESTIONS.length) * 100)}%</p>
                      <p className="text-white/40 text-xs">Accuracy</p>
                    </div>
                  </div>
                </div>

                {/* Badge earned */}
                {tierInfo.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-4 border border-amber-500/50 mb-6 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="text-amber-400" size={20} />
                      <span className="text-amber-400 font-bold">Badge Earned!</span>
                      <Star className="text-amber-400" size={20} />
                    </div>
                    <p className="text-white font-bold">{tierInfo.badge}</p>
                  </motion.div>
                )}

                {/* XP earned */}
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{earnedXP} XP</span>
                </div>
              </div>

              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Complete Journey
              </button>
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6 items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30"
              >
                <Trophy size={48} className="text-white" />
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2 text-center">Pearl Harbor Journey Complete!</h2>
              <p className="text-white/60 mb-6 text-center">You've completed all 10 beats</p>

              <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6 text-center">
                <p className="text-white/70 text-sm leading-relaxed">
                  From the Road to War through the Arsenal of Democracy, you've explored one of the most pivotal days in American history.
                </p>
                <p className="text-amber-400 mt-4 font-medium">
                  December 7, 1941 - Never Forget
                </p>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : earnedXP} XP</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

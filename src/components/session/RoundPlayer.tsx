import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelData, LevelRound } from '@/types';
import { TwoTruthsRound } from './rounds/TwoTruthsRound';
import { QuickFireRound } from './rounds/QuickFireRound';
import { DecisionRound } from './rounds/DecisionRound';
import { ChronoRound } from './rounds/ChronoRound';
import { WhoAmIRound } from './rounds/WhoAmIRound';

interface RoundPlayerProps {
  level: LevelData;
  onComplete: (score: number, total: number) => void;
}

const ROUND_LABELS: Record<LevelRound['type'], string> = {
  'two-truths': 'Two Truths & a Lie',
  'quick-fire': 'Quick Fire',
  'decision': 'Historical Decision',
  'chrono': 'Chrono Order',
  'who-am-i': 'Who Am I?',
};

export function RoundPlayer({ level, onComplete }: RoundPlayerProps) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.isBoss ? 45 : null);

  const currentRound = level.rounds[roundIdx];
  const total = level.rounds.length;

  // Boss timer
  useEffect(() => {
    if (!level.isBoss || timeLeft === null || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(t => (t !== null ? t - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, level.isBoss]);

  // Timer expired — complete with current score
  useEffect(() => {
    if (timeLeft === 0) onComplete(score, total);
  }, [timeLeft]);

  const handleRoundComplete = (correct: boolean) => {
    const newScore = correct ? score + 1 : score;
    if (roundIdx + 1 >= total) {
      onComplete(newScore, total);
    } else {
      setScore(newScore);
      setRoundIdx(i => i + 1);
    }
  };

  return (
    <div className="px-5 py-6 pb-28">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground">
            Round {roundIdx + 1} of {total}
          </p>
          {level.isBoss && timeLeft !== null && (
            <p className={`text-xs font-bold tabular-nums ${timeLeft <= 10 ? 'text-destructive' : 'text-primary'}`}>
              ⏱ {timeLeft}s
            </p>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-border overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((roundIdx) / total) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {ROUND_LABELS[currentRound.type]}
        </p>
      </div>

      {/* Round component */}
      <AnimatePresence mode="wait">
        <motion.div
          key={roundIdx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {currentRound.type === 'two-truths' && (
            <TwoTruthsRound round={currentRound} onComplete={handleRoundComplete} />
          )}
          {currentRound.type === 'quick-fire' && (
            <QuickFireRound round={currentRound} onComplete={handleRoundComplete} />
          )}
          {currentRound.type === 'decision' && (
            <DecisionRound round={currentRound} onComplete={handleRoundComplete} />
          )}
          {currentRound.type === 'chrono' && (
            <ChronoRound round={currentRound} onComplete={handleRoundComplete} />
          )}
          {currentRound.type === 'who-am-i' && (
            <WhoAmIRound round={currentRound} onComplete={handleRoundComplete} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

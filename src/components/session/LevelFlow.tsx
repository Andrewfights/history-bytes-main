import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { LevelData, MasteryState } from '@/types';
import { HostIntroScreen } from './HostIntroScreen';
import { RoundPlayer } from './RoundPlayer';
import { LevelResults, getMasteryFromScore } from './LevelResults';
import { useApp } from '@/context/AppContext';

type LevelPhase = 'intro' | 'rounds' | 'results';

interface LevelFlowProps {
  level: LevelData;
  actTitle: string;
  onClose: () => void;
  onComplete: (nodeId: string, mastery: MasteryState, xpEarned: number) => void;
  nodeId: string;
}

export function LevelFlow({ level, actTitle, onClose, onComplete, nodeId }: LevelFlowProps) {
  const { addXP } = useApp();
  const [phase, setPhase] = useState<LevelPhase>('intro');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const handleRoundsComplete = (roundScore: number, roundTotal: number) => {
    setScore(roundScore);
    setTotal(roundTotal);
    const mastery = getMasteryFromScore(roundScore, roundTotal);
    const xp = Math.round((roundScore / Math.max(roundTotal, 1)) * level.xpReward);
    addXP(xp);
    onComplete(nodeId, mastery, xp);
    setPhase('results');
  };

  const mastery = getMasteryFromScore(score, total);
  const xpEarned = Math.round((score / Math.max(total, 1)) * level.xpReward);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-auto"
    >
      {/* Close button — only during intro/rounds */}
      {phase !== 'results' && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HostIntroScreen
              level={level}
              actTitle={actTitle}
              onBegin={() => setPhase('rounds')}
            />
          </motion.div>
        )}

        {phase === 'rounds' && (
          <motion.div key="rounds" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <RoundPlayer level={level} onComplete={handleRoundsComplete} />
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <LevelResults
              score={score}
              total={total}
              xpEarned={xpEarned}
              mastery={mastery}
              isBoss={level.isBoss}
              onContinue={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

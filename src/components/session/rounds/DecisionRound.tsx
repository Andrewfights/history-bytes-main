import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecisionRound as DecisionRoundType } from '@/types';

interface DecisionRoundProps {
  round: DecisionRoundType;
  onComplete: (correct: boolean) => void;
}

export function DecisionRound({ round, onComplete }: DecisionRoundProps) {
  const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
  const isCorrect = chosen === round.correctOption;

  const handleChoose = (opt: 'A' | 'B') => {
    if (chosen !== null) return;
    setChosen(opt);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-1">Historical Decision</p>
        <h2 className="font-editorial text-xl font-bold">What would you do?</h2>
      </div>

      {/* Scenario */}
      <div className="archival-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/60 via-primary/20 to-transparent rounded-l" />
        <div className="pl-4">
          <p className="text-sm leading-relaxed text-foreground/90">{round.scenario}</p>
        </div>
      </div>

      {/* Choices */}
      {chosen === null ? (
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleChoose('A')}
            className="w-full p-4 rounded-xl border border-border bg-card text-left hover:border-primary/50 transition-all"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary block mb-1">Option A</span>
            <p className="text-sm">{round.optionA}</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleChoose('B')}
            className="w-full p-4 rounded-xl border border-border bg-card text-left hover:border-primary/50 transition-all"
          >
            <span className="text-[10px] uppercase tracking-wider font-bold text-primary block mb-1">Option B</span>
            <p className="text-sm">{round.optionB}</p>
          </motion.button>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Outcome */}
            <div className={`p-4 rounded-xl border ${isCorrect ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}`}>
              <p className={`text-xs uppercase tracking-wider font-bold mb-2 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                {isCorrect ? '✓ What actually happened' : '✗ What actually happened'}
              </p>
              <p className="text-sm font-semibold">{round.outcome}</p>
            </div>

            {/* Historical context */}
            <p className="text-sm text-muted-foreground leading-relaxed">{round.explanation}</p>

            <button
              onClick={() => onComplete(isCorrect)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
            >
              Continue ▸
            </button>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

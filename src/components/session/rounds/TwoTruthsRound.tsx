import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { TwoTruthsRound as TwoTruthsRoundType } from '@/types';

interface TwoTruthsRoundProps {
  round: TwoTruthsRoundType;
  onComplete: (correct: boolean) => void;
}

export function TwoTruthsRound({ round, onComplete }: TwoTruthsRoundProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === round.lieIndex;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-1">Two Truths & a Lie</p>
        <h2 className="font-editorial text-xl font-bold">Which one is the lie?</h2>
      </div>

      <div className="space-y-3">
        {round.statements.map((statement, idx) => {
          const isSelected = selected === idx;
          const isTheActualLie = idx === round.lieIndex;
          let borderClass = 'border-border bg-card';
          if (selected !== null) {
            if (isTheActualLie) borderClass = 'border-success bg-success/10';
            else if (isSelected) borderClass = 'border-destructive bg-destructive/10';
            else borderClass = 'border-border bg-card opacity-50';
          } else if (isSelected) {
            borderClass = 'border-primary bg-primary/10';
          }

          return (
            <motion.button
              key={idx}
              whileTap={selected === null ? { scale: 0.97 } : undefined}
              onClick={() => handleSelect(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${borderClass}`}
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                  {selected !== null && isTheActualLie ? <Check size={14} /> : String.fromCharCode(65 + idx)}
                </span>
                <p className="text-sm leading-relaxed">{statement}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className={`flex items-center gap-2 font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
              {isCorrect ? <Check size={18} /> : <X size={18} />}
              <span>{isCorrect ? 'Correct!' : 'Not quite!'}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{round.explanation}</p>
            <button
              onClick={() => onComplete(isCorrect)}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
            >
              Continue ▸
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

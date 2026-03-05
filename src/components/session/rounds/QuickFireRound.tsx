import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { QuickFireRound as QuickFireRoundType } from '@/types';

interface QuickFireRoundProps {
  round: QuickFireRoundType;
  onComplete: (correct: boolean) => void;
}

export function QuickFireRound({ round, onComplete }: QuickFireRoundProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const isCorrect = selected === round.answerIndex;

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-1">Quick Fire</p>
      </div>

      <div className="archival-card py-5 px-4 text-center">
        <p className="font-editorial text-lg leading-snug">{round.prompt}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {round.choices.map((choice, idx) => {
          let cls = 'border-border bg-card hover:border-primary/50';
          if (selected !== null) {
            if (idx === round.answerIndex) cls = 'border-success bg-success/10';
            else if (idx === selected) cls = 'border-destructive bg-destructive/10';
            else cls = 'border-border bg-card opacity-40';
          }
          return (
            <motion.button
              key={idx}
              whileTap={selected === null ? { scale: 0.96 } : undefined}
              onClick={() => handleSelect(idx)}
              className={`p-3.5 rounded-xl border text-sm font-semibold transition-all text-left ${cls}`}
            >
              {choice}
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
              <span>{isCorrect ? 'Correct!' : 'Incorrect!'}</span>
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

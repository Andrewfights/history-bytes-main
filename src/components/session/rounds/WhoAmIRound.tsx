import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WhoAmIRound as WhoAmIRoundType } from '@/types';

interface WhoAmIRoundProps {
  round: WhoAmIRoundType;
  onComplete: (correct: boolean) => void;
}

export function WhoAmIRound({ round, onComplete }: WhoAmIRoundProps) {
  const [revealedClues, setRevealedClues] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const isCorrect = selected === round.answer;

  const handleReveal = () => {
    if (revealedClues < round.clues.length) setRevealedClues(r => r + 1);
  };

  const handleAnswer = (choice: string) => {
    if (selected !== null) return;
    setSelected(choice);
  };

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-1">Who Am I?</p>
        <h2 className="font-editorial text-xl font-bold">Identify the figure</h2>
      </div>

      {/* Clues */}
      <div className="space-y-2">
        {round.clues.map((clue, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i < revealedClues ? 1 : 0.3, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-3 rounded-xl border text-sm ${
              i < revealedClues
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-card'
            }`}
          >
            {i < revealedClues ? clue : '???'}
          </motion.div>
        ))}
        {selected === null && revealedClues < round.clues.length && (
          <button onClick={handleReveal} className="text-xs text-primary font-bold hover:underline">
            + Reveal next clue (fewer points)
          </button>
        )}
      </div>

      {/* Choices */}
      <div className="grid grid-cols-2 gap-2.5">
        {round.choices.map((choice) => {
          let cls = 'border-border bg-card hover:border-primary/50';
          if (selected !== null) {
            if (choice === round.answer) cls = 'border-success bg-success/10';
            else if (choice === selected) cls = 'border-destructive bg-destructive/10';
            else cls = 'border-border bg-card opacity-40';
          }
          return (
            <motion.button
              key={choice}
              whileTap={selected === null ? { scale: 0.96 } : undefined}
              onClick={() => handleAnswer(choice)}
              className={`p-3.5 rounded-xl border text-sm font-semibold transition-all ${cls}`}
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
            <p className={`font-bold ${isCorrect ? 'text-success' : 'text-destructive'}`}>
              {isCorrect ? `✓ That's right — ${round.answer}!` : `✗ It was ${round.answer}`}
            </p>
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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ChronoRound as ChronoRoundType } from '@/types';

interface ChronoRoundProps {
  round: ChronoRoundType;
  onComplete: (correct: boolean) => void;
}

export function ChronoRound({ round, onComplete }: ChronoRoundProps) {
  const [order, setOrder] = useState(() => [...round.events].sort(() => Math.random() - 0.5));
  const [submitted, setSubmitted] = useState(false);

  const moveItem = (idx: number, dir: -1 | 1) => {
    if (submitted) return;
    const newOrder = [...order];
    const target = idx + dir;
    if (target < 0 || target >= newOrder.length) return;
    [newOrder[idx], newOrder[target]] = [newOrder[target], newOrder[idx]];
    setOrder(newOrder);
  };

  const isCorrect = order.every((e, i) => i === 0 || e.year >= order[i - 1].year);

  const handleSubmit = () => setSubmitted(true);

  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-1">Chrono Order</p>
        <h2 className="font-editorial text-xl font-bold">Arrange oldest to newest</h2>
      </div>

      <div className="space-y-2">
        {order.map((event, i) => (
          <motion.div
            key={event.text}
            layout
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              submitted
                ? isCorrect
                  ? 'border-success bg-success/10'
                  : 'border-destructive bg-destructive/10'
                : 'border-border bg-card'
            }`}
          >
            <div className="flex flex-col gap-1">
              <button onClick={() => moveItem(i, -1)} disabled={submitted || i === 0} className="p-0.5 hover:text-primary disabled:opacity-20 transition-colors">
                <ArrowUp size={14} />
              </button>
              <button onClick={() => moveItem(i, 1)} disabled={submitted || i === order.length - 1} className="p-0.5 hover:text-primary disabled:opacity-20 transition-colors">
                <ArrowDown size={14} />
              </button>
            </div>
            <span className="flex-1 text-sm font-medium">{event.text}</span>
            {submitted && (
              <span className="text-xs text-muted-foreground">
                {event.year < 0 ? `${Math.abs(event.year)} BCE` : `${event.year} CE`}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {!submitted ? (
          <motion.button
            key="submit"
            exit={{ opacity: 0 }}
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm"
          >
            Lock In Order
          </motion.button>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className={`font-bold text-center ${isCorrect ? 'text-success' : 'text-destructive'}`}>
              {isCorrect ? '✓ Perfect order!' : '✗ Not quite — correct order shown above'}
            </p>
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

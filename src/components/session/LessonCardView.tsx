import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Bookmark, Lightbulb } from 'lucide-react';
import { LessonCard } from '@/types';

interface LessonCardViewProps {
  cards: LessonCard[];
  onComplete: () => void;
  topicTitle: string;
}

export function LessonCardView({ cards, onComplete, topicTitle }: LessonCardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const currentCard = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;
  const isFirst = currentIndex === 0;

  const goNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (!isFirst) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>{topicTitle}</span>
          <span>Card {currentIndex + 1} of {cards.length}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 px-4 py-6 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            <div className="lesson-card h-full flex flex-col">
              <h2 className="font-editorial text-xl font-bold mb-4">
                {currentCard.title}
              </h2>

              <p className="text-foreground/90 leading-relaxed mb-6">
                {currentCard.body}
              </p>

              {currentCard.keyFact && (
                <div className="mt-auto p-4 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Lightbulb size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                        Key Fact
                      </p>
                      <p className="text-sm text-foreground/80">
                        {currentCard.keyFact}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors self-start">
                <Bookmark size={16} />
                Add Note
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-4 flex items-center gap-3" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goPrev}
          disabled={isFirst}
          className="w-12 h-12 rounded-xl border border-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-colors"
        >
          <ChevronLeft size={24} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="flex-1 h-12 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:glow-yellow transition-all"
        >
          {isLast ? 'Start Quiz' : 'Next'}
          <ChevronRight size={18} />
        </motion.button>
      </div>
    </div>
  );
}

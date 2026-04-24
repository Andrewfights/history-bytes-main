import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Bookmark, Lightbulb, X } from 'lucide-react';
import { LessonCard } from '@/types';

interface LessonCardViewProps {
  cards: LessonCard[];
  onComplete: () => void;
  onClose?: () => void;
  topicTitle: string;
}

export function LessonCardView({ cards, onComplete, onClose, topicTitle }: LessonCardViewProps) {
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
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Top Bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{topicTitle}</span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">
              Card <em className="text-[var(--gold-2)] not-italic font-medium">{currentIndex + 1}</em>/{cards.length}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-4">
        <div className="h-1 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--gold-3), var(--gold-2))'
            }}
            animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card content */}
      <div className="flex-1 px-4 py-2 overflow-hidden">
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
            {/* Teaching Card */}
            <div className="teach-card">
              {/* Gold corner brackets */}
              <div className="corner-tl" />
              <div className="corner-tr" />
              <div className="corner-bl" />
              <div className="corner-br" />

              <div className="teach-card-inner">
                {/* Kick */}
                <div className="teach-kick">
                  Card {String(currentIndex + 1).padStart(2, '0')} · Concept
                </div>

                {/* Title - with gold emphasis on certain words */}
                <h2 className="teach-title">
                  {currentCard.title}
                </h2>

                {/* Body */}
                <div className="teach-body">
                  <p>{currentCard.body}</p>
                </div>

                {/* Key Fact */}
                {currentCard.keyFact && (
                  <div className="keyfact-v3">
                    <div className="keyfact-stamp">Essential</div>
                    <div className="keyfact-badge">
                      <Lightbulb size={15} />
                    </div>
                    <div className="keyfact-content">
                      <div className="keyfact-kick">Key Fact</div>
                      <div className="keyfact-text">
                        {currentCard.keyFact}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card footer */}
                <div className="mt-4 flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-2">
                    <Bookmark size={14} />
                    <span className="text-xs uppercase tracking-wider font-medium">Note</span>
                  </button>
                  <div className="font-[var(--font-mono)] text-xs text-muted-foreground">
                    <em className="text-[var(--gold-2)] not-italic">{String(currentIndex + 1).padStart(2, '0')}</em>
                    <span className="mx-0.5">/</span>
                    <span>{String(cards.length).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
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
          className="w-12 h-12 rounded-lg border border-border flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:border-primary/50 transition-colors bg-[rgba(0,0,0,0.3)]"
        >
          <ChevronLeft size={24} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={goNext}
          className="btn-primary-lg flex-1"
          style={{ minHeight: '48px' }}
        >
          {isLast ? 'Start Quiz' : 'Next Card'}
          <ChevronRight size={16} strokeWidth={2.5} />
        </motion.button>
      </div>
    </div>
  );
}

/**
 * FactOrMythSwiper - Swipe-based quiz for fact vs myth statements
 * Used in Beat 7 (Fact or Myth? - Pearl Harbor Legends)
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo, useAnimation } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';

export interface FactOrMythStatement {
  id: string;
  statement: string;
  isFact: boolean;
  explanation: string;
  source?: string;
}

interface FactOrMythSwiperProps {
  statements: FactOrMythStatement[];
  onComplete: (score: number, totalStatements: number) => void;
  onAnswer?: (statementId: string, answeredFact: boolean, isCorrect: boolean) => void;
}

interface AnswerResult {
  statementId: string;
  answeredFact: boolean;
  isCorrect: boolean;
}

export function FactOrMythSwiper({
  statements,
  onComplete,
  onAnswer,
}: FactOrMythSwiperProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [lastAnswer, setLastAnswer] = useState<'fact' | 'myth' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const controls = useAnimation();

  const currentStatement = statements[currentIndex];
  const isLastStatement = currentIndex === statements.length - 1;
  const score = results.filter((r) => r.isCorrect).length;

  const handleSwipe = useCallback(async (direction: 'left' | 'right') => {
    if (isAnimating || showExplanation) return;

    setIsAnimating(true);
    const answeredFact = direction === 'right';
    const isCorrect = currentStatement.isFact === answeredFact;

    // Animate card off screen
    await controls.start({
      x: direction === 'right' ? 300 : -300,
      opacity: 0,
      rotate: direction === 'right' ? 15 : -15,
      transition: { duration: 0.3 },
    });

    // Record result
    const result: AnswerResult = {
      statementId: currentStatement.id,
      answeredFact,
      isCorrect,
    };
    setResults((prev) => [...prev, result]);
    setLastAnswer(answeredFact ? 'fact' : 'myth');
    onAnswer?.(currentStatement.id, answeredFact, isCorrect);

    // Show explanation
    setShowExplanation(true);

    // Reset card position (hidden)
    controls.set({ x: 0, opacity: 0, rotate: 0 });
  }, [isAnimating, showExplanation, currentStatement, controls, onAnswer]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      handleSwipe('right');
    } else if (info.offset.x < -threshold) {
      handleSwipe('left');
    } else {
      // Snap back
      controls.start({ x: 0, rotate: 0, transition: { type: 'spring' } });
    }
  };

  const handleContinue = async () => {
    if (isLastStatement) {
      onComplete(score + (results[results.length - 1]?.isCorrect ? 1 : 0), statements.length);
    } else {
      setShowExplanation(false);
      setLastAnswer(null);
      setCurrentIndex((prev) => prev + 1);

      // Animate new card in
      controls.set({ x: 0, opacity: 0, scale: 0.8 });
      await controls.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3 },
      });
      setIsAnimating(false);
    }
  };

  const handleButtonAnswer = (isFact: boolean) => {
    handleSwipe(isFact ? 'right' : 'left');
  };

  // Get last answer result
  const lastResult = results[results.length - 1];

  return (
    <div className="flex flex-col h-full">
      {/* Progress bar */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-amber-500"
              initial={{ width: 0 }}
              animate={{
                width: `${((currentIndex + (showExplanation ? 1 : 0)) / statements.length) * 100}%`
              }}
            />
          </div>
          <span className="text-white/60 text-sm font-mono">
            {currentIndex + 1}/{statements.length}
          </span>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <span className="text-green-400">
            <CheckCircle2 size={16} className="inline mr-1" />
            {score} Correct
          </span>
          <span className="text-red-400">
            <XCircle size={16} className="inline mr-1" />
            {results.length - score} Wrong
          </span>
        </div>
      </div>

      {/* Swipe indicators */}
      <div className="flex items-center justify-between px-8 py-4">
        <div className="flex items-center gap-2 text-red-400">
          <ChevronLeft size={24} />
          <span className="font-bold">MYTH</span>
        </div>
        <div className="flex items-center gap-2 text-green-400">
          <span className="font-bold">FACT</span>
          <ChevronRight size={24} />
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-6 pb-6 relative">
        <AnimatePresence mode="wait">
          {!showExplanation ? (
            // Statement card
            <motion.div
              key={currentStatement.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={handleDragEnd}
              animate={controls}
              initial={{ opacity: 1, scale: 1 }}
              className="w-full max-w-sm cursor-grab active:cursor-grabbing"
              style={{ x: 0, rotate: 0 }}
            >
              <motion.div
                className="bg-gradient-to-b from-slate-700 to-slate-800 rounded-2xl p-8 shadow-2xl border border-white/10"
                whileHover={{ scale: 1.02 }}
              >
                {/* Question mark icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-4xl">❓</span>
                  </div>
                </div>

                {/* Statement */}
                <p className="text-white text-lg text-center leading-relaxed font-medium">
                  "{currentStatement.statement}"
                </p>

                {/* Swipe hint */}
                <p className="text-white/40 text-center text-sm mt-6">
                  Swipe or tap below
                </p>
              </motion.div>
            </motion.div>
          ) : (
            // Explanation card
            <motion.div
              key={`${currentStatement.id}-explanation`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-sm"
            >
              <div
                className={`rounded-2xl p-6 shadow-2xl border-2 ${
                  lastResult?.isCorrect
                    ? 'bg-green-500/10 border-green-500'
                    : 'bg-red-500/10 border-red-500'
                }`}
              >
                {/* Result header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  {lastResult?.isCorrect ? (
                    <>
                      <CheckCircle2 size={32} className="text-green-400" />
                      <span className="text-green-400 font-bold text-xl">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={32} className="text-red-400" />
                      <span className="text-red-400 font-bold text-xl">Incorrect</span>
                    </>
                  )}
                </div>

                {/* The truth */}
                <div
                  className={`px-4 py-2 rounded-lg text-center mb-4 ${
                    currentStatement.isFact
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-red-500/20 text-red-300'
                  }`}
                >
                  <span className="font-bold">
                    This is a {currentStatement.isFact ? 'FACT' : 'MYTH'}
                  </span>
                </div>

                {/* Explanation */}
                <div className="bg-white/5 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Lightbulb size={18} className="text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-white/80 text-sm leading-relaxed">
                      {currentStatement.explanation}
                    </p>
                  </div>
                </div>

                {/* Source */}
                {currentStatement.source && (
                  <p className="text-white/40 text-xs text-center">
                    Source: {currentStatement.source}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom buttons */}
      <div className="p-4 border-t border-white/10" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        {!showExplanation ? (
          // Fact/Myth buttons
          <div className="flex gap-4">
            <button
              onClick={() => handleButtonAnswer(false)}
              disabled={isAnimating}
              className="flex-1 py-4 bg-red-500/20 hover:bg-red-500/30 border-2 border-red-500 text-red-400 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              MYTH
            </button>
            <button
              onClick={() => handleButtonAnswer(true)}
              disabled={isAnimating}
              className="flex-1 py-4 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500 text-green-400 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              FACT
            </button>
          </div>
        ) : (
          // Continue button
          <button
            onClick={handleContinue}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
          >
            {isLastStatement ? 'See Results' : 'Next Statement'}
          </button>
        )}
      </div>
    </div>
  );
}

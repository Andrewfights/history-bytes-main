/**
 * SequenceOrder - Drag to reorder items in correct sequence
 * Used for Q15 (Marshall warning sequence)
 */

import { useState, useCallback } from 'react';
import { Reorder, motion, AnimatePresence } from 'framer-motion';
import { GripVertical, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import type { SequenceOrderQuestion, ExamAnswer } from '../types';

interface SequenceOrderProps {
  question: SequenceOrderQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function SequenceOrder({ question, onAnswer }: SequenceOrderProps) {
  const [orderedItems, setOrderedItems] = useState(() =>
    shuffleArray([...question.items])
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [correctPositions, setCorrectPositions] = useState<Set<number>>(new Set());

  const handleSubmit = useCallback(() => {
    if (isSubmitted) return;

    const currentOrder = orderedItems.map((item) => item.id);
    const correctCount = currentOrder.filter(
      (id, index) => id === question.correctOrder[index]
    ).length;

    const isCorrect = correctCount === question.correctOrder.length;

    // Mark correct positions
    const correct = new Set<number>();
    currentOrder.forEach((id, index) => {
      if (id === question.correctOrder[index]) {
        correct.add(index);
      }
    });
    setCorrectPositions(correct);

    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect,
      value: currentOrder,
      partialCredit: correctCount / question.correctOrder.length,
    });
  }, [orderedItems, question, isSubmitted, onAnswer]);

  const handleReset = () => {
    setOrderedItems(shuffleArray([...question.items]));
    setCorrectPositions(new Set());
  };

  return (
    <div className="flex flex-col h-full">
      {/* Category badge */}
      {question.category && (
        <div className="mb-3">
          <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
            {question.category}
          </span>
        </div>
      )}

      {/* Question text */}
      <h3 className="text-lg font-bold text-white mb-2 leading-relaxed">
        {question.prompt}
      </h3>

      {/* Instructions */}
      <p className="text-white/50 text-sm mb-4">
        Drag to arrange in the correct order
      </p>

      {/* Reorderable list */}
      <Reorder.Group
        axis="y"
        values={orderedItems}
        onReorder={isSubmitted ? () => {} : setOrderedItems}
        className="flex-1 space-y-2"
      >
        {orderedItems.map((item, index) => {
          const isPositionCorrect = correctPositions.has(index);
          const shouldShowCorrect = isSubmitted && isPositionCorrect;
          const shouldShowIncorrect = isSubmitted && !isPositionCorrect;

          return (
            <Reorder.Item
              key={item.id}
              value={item}
              dragListener={!isSubmitted}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                shouldShowCorrect
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : shouldShowIncorrect
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : 'bg-white/5 border-2 border-white/10'
              } ${!isSubmitted ? 'cursor-grab active:cursor-grabbing hover:border-white/30' : ''}`}
            >
              {/* Order number */}
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                  shouldShowCorrect
                    ? 'bg-green-500 text-white'
                    : shouldShowIncorrect
                    ? 'bg-red-500 text-white'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {index + 1}
              </span>

              {/* Icon */}
              {item.icon && <span className="text-lg">{item.icon}</span>}

              {/* Label */}
              <span className="flex-1 text-white text-sm">{item.label}</span>

              {/* Drag handle or result icon */}
              {!isSubmitted ? (
                <GripVertical size={18} className="text-white/40 shrink-0" />
              ) : shouldShowCorrect ? (
                <CheckCircle2 size={18} className="text-green-400 shrink-0" />
              ) : (
                <XCircle size={18} className="text-red-400 shrink-0" />
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Result summary */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-xl text-center ${
            correctPositions.size === question.items.length
              ? 'bg-green-500/20'
              : correctPositions.size >= question.items.length / 2
              ? 'bg-amber-500/20'
              : 'bg-red-500/20'
          }`}
        >
          <p className="text-white font-bold">
            {correctPositions.size === question.items.length
              ? 'Perfect sequence!'
              : `${correctPositions.size}/${question.items.length} in correct position`}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <div className="mt-4 flex gap-3">
        {!isSubmitted && (
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
          >
            <RotateCcw size={18} />
            Reset
          </button>
        )}
        <AnimatePresence>
          {!isSubmitted && (
            <motion.button
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleSubmit}
              className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
            >
              Check Order
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

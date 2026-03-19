/**
 * MultiSelectQuestion - Checkbox-style multi-select question
 * Used for Q12 (Fuchida credibility)
 * Supports both standard mode and game show mode
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Square, CheckSquare } from 'lucide-react';
import type { MultiSelectQuestion as MultiSelectQuestionType, ExamAnswer } from '../types';

interface MultiSelectQuestionProps {
  question: MultiSelectQuestionType;
  onAnswer: (answer: ExamAnswer) => void;
  isGameShowMode?: boolean;
  onSelectionChange?: (hasSelection: boolean, value: unknown) => void;
  isLockedIn?: boolean;
  disabled?: boolean;
}

export function MultiSelectQuestion({
  question,
  onAnswer,
  isGameShowMode = false,
  onSelectionChange,
  isLockedIn = false,
  disabled = false,
}: MultiSelectQuestionProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    setSelectedIndices(new Set());
    setIsSubmitted(false);
  }, [question.id]);

  const handleToggle = (index: number) => {
    if (isSubmitted || disabled || isLockedIn) return;
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      if (isGameShowMode && onSelectionChange) {
        onSelectionChange(next.size > 0, Array.from(next));
      }
      return next;
    });
  };

  const isDisabled = isSubmitted || disabled || isLockedIn;
  const showFeedback = !isGameShowMode && isSubmitted;

  const handleSubmit = () => {
    if (selectedIndices.size === 0 || isSubmitted) return;

    const correctSet = new Set(question.correctIndices);
    let isCorrect = false;

    if (question.requireAllCorrect) {
      // Must match exactly
      isCorrect =
        selectedIndices.size === correctSet.size &&
        Array.from(selectedIndices).every((idx) => correctSet.has(idx));
    } else {
      // Partial credit: count correct selections
      const correctSelections = Array.from(selectedIndices).filter((idx) =>
        correctSet.has(idx)
      ).length;
      isCorrect = correctSelections === correctSet.size && selectedIndices.size === correctSet.size;
    }

    setIsSubmitted(true);

    const correctSelections = Array.from(selectedIndices).filter((idx) =>
      new Set(question.correctIndices).has(idx)
    ).length;

    onAnswer({
      questionId: question.id,
      isCorrect,
      value: Array.from(selectedIndices),
      partialCredit: correctSelections / question.correctIndices.length,
    });
  };

  const correctSet = new Set(question.correctIndices);

  return (
    <div className="flex flex-col h-full">
      {!isGameShowMode && (
        <>
          {question.category && (
            <div className="mb-3">
              <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
                {question.category}
              </span>
            </div>
          )}
          <h3 className="text-lg font-bold text-white mb-2 leading-relaxed">
            {question.prompt}
          </h3>
        </>
      )}

      {/* Instructions */}
      <p className="text-white/50 text-sm mb-4">
        Select all that apply ({question.correctIndices.length} correct answers)
      </p>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {question.options.map((option, index) => {
          const isSelected = selectedIndices.has(index);
          const isCorrectAnswer = correctSet.has(index);
          const showCorrect = showFeedback && isCorrectAnswer;
          const showIncorrect = showFeedback && isSelected && !isCorrectAnswer;
          const showMissed = showFeedback && isCorrectAnswer && !isSelected;

          return (
            <motion.button
              key={index}
              whileHover={!isDisabled ? { scale: 1.01 } : {}}
              whileTap={!isDisabled ? { scale: 0.99 } : {}}
              onClick={() => handleToggle(index)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-start gap-3 ${
                showCorrect && isSelected
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : showIncorrect
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : showMissed
                  ? 'bg-amber-500/10 border-2 border-amber-500/50'
                  : isSelected
                  ? isLockedIn
                    ? 'bg-green-500/20 border-2 border-green-500/50'
                    : 'bg-amber-500/20 border-2 border-amber-500'
                  : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
              } ${isDisabled && !isSelected ? 'opacity-50' : ''}`}
            >
              <span className="shrink-0 mt-0.5">
                {isSelected ? (
                  <CheckSquare
                    size={22}
                    className={
                      showCorrect
                        ? 'text-green-400'
                        : showIncorrect
                        ? 'text-red-400'
                        : isLockedIn
                        ? 'text-green-400'
                        : 'text-amber-400'
                    }
                  />
                ) : (
                  <Square
                    size={22}
                    className={showMissed ? 'text-amber-400' : 'text-white/40'}
                  />
                )}
              </span>
              <span className="flex-1 text-white text-sm leading-relaxed">{option}</span>
              {showCorrect && isSelected && <CheckCircle2 size={20} className="text-green-400 shrink-0" />}
              {showIncorrect && <XCircle size={20} className="text-red-400 shrink-0" />}
              {showMissed && <span className="text-amber-400 text-xs shrink-0">missed</span>}
            </motion.button>
          );
        })}
      </div>

      {!isGameShowMode && (
        <AnimatePresence>
          {selectedIndices.size > 0 && !isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6"
            >
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
              >
                Submit Answer ({selectedIndices.size} selected)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * MultipleChoiceExam - Multiple choice question for Final Exam
 * Supports both standard mode (immediate feedback) and game show mode (no feedback)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { MultipleChoiceQuestion, ExamAnswer } from '../types';

interface MultipleChoiceExamProps {
  question: MultipleChoiceQuestion;
  onAnswer: (answer: ExamAnswer) => void;
  // Game show mode props
  isGameShowMode?: boolean;
  onSelectionChange?: (hasSelection: boolean, value: unknown) => void;
  isLockedIn?: boolean;
  disabled?: boolean;
}

export function MultipleChoiceExam({
  question,
  onAnswer,
  isGameShowMode = false,
  onSelectionChange,
  isLockedIn = false,
  disabled = false,
}: MultipleChoiceExamProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset selection when question changes
  useEffect(() => {
    setSelectedIndex(null);
    setIsSubmitted(false);
  }, [question.id]);

  const handleSelect = (index: number) => {
    if (isSubmitted || disabled || isLockedIn) return;
    setSelectedIndex(index);

    // In game show mode, notify parent of selection change
    if (isGameShowMode && onSelectionChange) {
      onSelectionChange(true, index);
    }
  };

  const handleSubmit = () => {
    if (selectedIndex === null || isSubmitted) return;

    const isCorrect = selectedIndex === question.correctIndex;
    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect,
      value: selectedIndex,
    });
  };

  // Determine if we should show feedback (only in standard mode after submit)
  const showFeedback = !isGameShowMode && isSubmitted;

  return (
    <div className="flex flex-col h-full">
      {/* Category badge and prompt - only in standard mode (game show mode shows these in wrapper) */}
      {!isGameShowMode && (
        <>
          {question.category && (
            <div className="mb-3">
              <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
                {question.category}
              </span>
            </div>
          )}
          <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">
            {question.prompt}
          </h3>
        </>
      )}

      {/* Options - 2x2 grid layout for game show mode, vertical stack otherwise */}
      <div className={`${isGameShowMode ? 'grid grid-cols-2 gap-2 sm:gap-2 auto-rows-fr' : 'space-y-3'}`}>
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === question.correctIndex;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrectOption;
          const isDisabled = isSubmitted || disabled || isLockedIn;

          return (
            <motion.button
              key={index}
              whileHover={!isDisabled ? { scale: 1.01 } : {}}
              whileTap={!isDisabled ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(index)}
              disabled={isDisabled}
              className={`w-full h-full ${isGameShowMode ? 'p-2.5 sm:p-2.5 min-h-[3.75rem] sm:min-h-[3.5rem]' : 'p-4 min-h-[52px]'} rounded-xl text-left transition-all flex items-start gap-2 active:scale-[0.98] ${
                showCorrect
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : showIncorrect
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : isSelected
                  ? isLockedIn
                    ? 'bg-green-500/20 border-2 border-green-500/50' // Locked in state
                    : 'bg-amber-500/20 border-2 border-amber-500'
                  : 'bg-white/5 border-2 border-white/10 hover:border-white/30 active:border-white/40'
              } ${isDisabled && !isSelected ? 'opacity-50' : ''}`}
            >
              {/* Option letter - larger on mobile for better touch visibility */}
              <span
                className={`${isGameShowMode ? 'w-6 h-6 text-xs sm:w-6 sm:h-6 sm:text-xs' : 'w-8 h-8 text-sm'} rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5 ${
                  showCorrect
                    ? 'bg-green-500 text-white'
                    : showIncorrect
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? isLockedIn
                      ? 'bg-green-500 text-white'
                      : 'bg-amber-500 text-black'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              {/* Option text - improved mobile readability */}
              <span className={`flex-1 text-white ${isGameShowMode ? 'text-xs sm:text-sm leading-snug' : 'leading-snug'} break-words`}>{option}</span>

              {/* Result icon (only in standard mode) */}
              {showCorrect && (
                <CheckCircle2 size={isGameShowMode ? 18 : 24} className="text-green-400 shrink-0 mt-0.5" />
              )}
              {showIncorrect && (
                <XCircle size={isGameShowMode ? 18 : 24} className="text-red-400 shrink-0 mt-0.5" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Submit button - only show in standard mode when answer selected but not submitted */}
      {!isGameShowMode && (
        <AnimatePresence>
          {selectedIndex !== null && !isSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6"
              style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
            >
              <button
                onClick={handleSubmit}
                className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold rounded-xl transition-colors min-h-[52px]"
              >
                Submit Answer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

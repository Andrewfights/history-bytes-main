/**
 * PercentageComparison - Compare two percentage values (simplified to multiple choice)
 * Used for Q13 (US production vs Axis)
 * Supports both standard mode and game show mode
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { PercentageCompareQuestion, ExamAnswer } from '../types';

interface PercentageComparisonProps {
  question: PercentageCompareQuestion;
  onAnswer: (answer: ExamAnswer) => void;
  isGameShowMode?: boolean;
  onSelectionChange?: (hasSelection: boolean, value: unknown) => void;
  isLockedIn?: boolean;
  disabled?: boolean;
}

export function PercentageComparison({
  question,
  onAnswer,
  isGameShowMode = false,
  onSelectionChange,
  isLockedIn = false,
  disabled = false,
}: PercentageComparisonProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // For MVP, we use the simplified answerOptions format
  const options = question.answerOptions ?? [];
  const correctOptionIndex = question.correctOptionIndex ?? 0;

  useEffect(() => {
    setSelectedIndex(null);
    setIsSubmitted(false);
  }, [question.id]);

  const handleSelect = (index: number) => {
    if (isSubmitted || disabled || isLockedIn) return;
    setSelectedIndex(index);
    if (isGameShowMode && onSelectionChange) {
      onSelectionChange(true, index);
    }
  };

  const isDisabled = isSubmitted || disabled || isLockedIn;
  const showFeedback = !isGameShowMode && isSubmitted;

  const handleSubmit = () => {
    if (selectedIndex === null || isSubmitted) return;

    const isCorrect = selectedIndex === correctOptionIndex;
    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect,
      value: selectedIndex,
    });
  };

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
          <h3 className="text-xl font-bold text-white mb-4 leading-relaxed">
            {question.prompt}
          </h3>
        </>
      )}

      {/* Visual comparison bars - only reveal values in standard mode after submit */}
      <div className="mb-6 space-y-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">{question.optionA.label}</span>
            <span className="text-amber-400 font-bold text-lg">
              {showFeedback ? `${question.optionA.correctValue}%` : '?%'}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: showFeedback ? `${question.optionA.correctValue}%` : '0%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">{question.optionB.label}</span>
            <span className="text-amber-400 font-bold text-lg">
              {showFeedback ? `${question.optionB.correctValue}%` : '?%'}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: showFeedback ? `${question.optionB.correctValue}%` : '0%' }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              className="h-full bg-red-500 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrectOption = index === correctOptionIndex;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrectOption;

          return (
            <motion.button
              key={index}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(index)}
              disabled={isDisabled}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                showCorrect
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : showIncorrect
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : isSelected
                  ? isLockedIn
                    ? 'bg-green-500/20 border-2 border-green-500/50'
                    : 'bg-amber-500/20 border-2 border-amber-500'
                  : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
              } ${isDisabled && !isSelected ? 'opacity-50' : ''}`}
            >
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
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
              <span className="flex-1 text-white font-medium">{option}</span>
              {showCorrect && <CheckCircle2 size={24} className="text-green-400 shrink-0" />}
              {showIncorrect && <XCircle size={24} className="text-red-400 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {!isGameShowMode && (
        <AnimatePresence>
          {selectedIndex !== null && !isSubmitted && (
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
                Submit Answer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

/**
 * DualAnswerSlider - Two-value question (simplified to multiple choice for MVP)
 * Used for Q8 (Japan oil dependency)
 * Supports both standard mode and game show mode
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { DualSliderQuestion, ExamAnswer } from '../types';

interface DualAnswerSliderProps {
  question: DualSliderQuestion;
  onAnswer: (answer: ExamAnswer) => void;
  isGameShowMode?: boolean;
  onSelectionChange?: (hasSelection: boolean, value: unknown) => void;
  isLockedIn?: boolean;
  disabled?: boolean;
}

export function DualAnswerSlider({
  question,
  onAnswer,
  isGameShowMode = false,
  onSelectionChange,
  isLockedIn = false,
  disabled = false,
}: DualAnswerSliderProps) {
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

    const isCorrect = selectedIndex === correctIndex;
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

      {/* Visual hint showing the two metrics */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <div className="text-white/60 text-xs mb-1">{question.partA.label}</div>
          <div className="text-2xl font-bold text-amber-400">?{question.partA.unit}</div>
        </div>
        <div className="flex-1 bg-white/5 rounded-xl p-4 text-center border border-white/10">
          <div className="text-white/60 text-xs mb-1">{question.partB.label}</div>
          <div className="text-2xl font-bold text-amber-400">?{question.partB.unit}</div>
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

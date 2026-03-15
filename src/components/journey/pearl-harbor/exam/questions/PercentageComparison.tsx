/**
 * PercentageComparison - Compare two percentage values (simplified to multiple choice)
 * Used for Q13 (US production vs Axis)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { PercentageCompareQuestion, ExamAnswer } from '../types';

interface PercentageComparisonProps {
  question: PercentageCompareQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

export function PercentageComparison({ question, onAnswer }: PercentageComparisonProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // For MVP, we use the simplified answerOptions format
  const options = question.answerOptions ?? [];
  const correctIndex = question.correctOptionIndex ?? 0;

  const handleSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedIndex(index);
  };

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
      {/* Category badge */}
      {question.category && (
        <div className="mb-3">
          <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
            {question.category}
          </span>
        </div>
      )}

      {/* Question text */}
      <h3 className="text-xl font-bold text-white mb-4 leading-relaxed">
        {question.prompt}
      </h3>

      {/* Visual comparison bars (placeholder - shows actual values after submit) */}
      <div className="mb-6 space-y-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">{question.optionA.label}</span>
            <span className="text-amber-400 font-bold text-lg">
              {isSubmitted ? `${question.optionA.correctValue}%` : '?%'}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: isSubmitted ? `${question.optionA.correctValue}%` : '0%',
              }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">{question.optionB.label}</span>
            <span className="text-amber-400 font-bold text-lg">
              {isSubmitted ? `${question.optionB.correctValue}%` : '?%'}
            </span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: isSubmitted ? `${question.optionB.correctValue}%` : '0%',
              }}
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
          const isCorrect = index === correctIndex;
          const showCorrect = isSubmitted && isCorrect;
          const showIncorrect = isSubmitted && isSelected && !isCorrect;

          return (
            <motion.button
              key={index}
              whileHover={!isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(index)}
              disabled={isSubmitted}
              className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                showCorrect
                  ? 'bg-green-500/20 border-2 border-green-500'
                  : showIncorrect
                  ? 'bg-red-500/20 border-2 border-red-500'
                  : isSelected
                  ? 'bg-amber-500/20 border-2 border-amber-500'
                  : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
              }`}
            >
              {/* Option letter */}
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  showCorrect
                    ? 'bg-green-500 text-white'
                    : showIncorrect
                    ? 'bg-red-500 text-white'
                    : isSelected
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>

              {/* Option text */}
              <span className="flex-1 text-white font-medium">{option}</span>

              {/* Result icon */}
              {showCorrect && (
                <CheckCircle2 size={24} className="text-green-400 shrink-0" />
              )}
              {showIncorrect && (
                <XCircle size={24} className="text-red-400 shrink-0" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Submit button */}
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
    </div>
  );
}

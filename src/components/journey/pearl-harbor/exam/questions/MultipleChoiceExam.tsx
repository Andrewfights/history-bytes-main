/**
 * MultipleChoiceExam - Multiple choice question for Final Exam
 * Adapted from TimedChallenge but without per-question timer
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { MultipleChoiceQuestion, ExamAnswer } from '../types';

interface MultipleChoiceExamProps {
  question: MultipleChoiceQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

export function MultipleChoiceExam({ question, onAnswer }: MultipleChoiceExamProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (index: number) => {
    if (isSubmitted) return;
    setSelectedIndex(index);
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
      <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">
        {question.prompt}
      </h3>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {question.options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const isCorrect = index === question.correctIndex;
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
              <span className="flex-1 text-white">{option}</span>

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

      {/* Submit button - only show if answer selected but not submitted */}
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

/**
 * BranchingReveal - Multi-option question with reveal content
 * Used for Q7 (Fuel tanks / Nimitz)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import type { BranchingRevealQuestion, ExamAnswer } from '../types';

interface BranchingRevealProps {
  question: BranchingRevealQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

export function BranchingReveal({ question, onAnswer }: BranchingRevealProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedId(optionId);
  };

  const handleSubmit = () => {
    if (!selectedId || isSubmitted) return;

    const selectedOption = question.options.find((opt) => opt.id === selectedId);
    const isCorrect = selectedOption?.isCorrect ?? false;

    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect,
      value: selectedId,
    });
  };

  const correctOption = question.options.find((opt) => opt.isCorrect);
  const selectedOption = question.options.find((opt) => opt.id === selectedId);

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
        {question.options.map((option) => {
          const isSelected = selectedId === option.id;
          const showCorrect = isSubmitted && option.isCorrect;
          const showIncorrect = isSubmitted && isSelected && !option.isCorrect;

          return (
            <motion.button
              key={option.id}
              whileHover={!isSubmitted ? { scale: 1.02 } : {}}
              whileTap={!isSubmitted ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(option.id)}
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
              {/* Option indicator */}
              <span
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  showCorrect
                    ? 'border-green-500 bg-green-500'
                    : showIncorrect
                    ? 'border-red-500 bg-red-500'
                    : isSelected
                    ? 'border-amber-500 bg-amber-500'
                    : 'border-white/30'
                }`}
              >
                {(showCorrect || showIncorrect || isSelected) && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </span>

              {/* Option text */}
              <span className="flex-1 text-white">{option.label}</span>

              {/* Reveal indicator */}
              {option.revealContent && !isSubmitted && (
                <ChevronRight size={20} className="text-white/40" />
              )}

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

      {/* Reveal content (shown after correct answer) */}
      <AnimatePresence>
        {isSubmitted && correctOption?.revealContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <p className="text-amber-200 text-sm leading-relaxed">
                {correctOption.revealContent}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <AnimatePresence>
        {selectedId && !isSubmitted && (
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

/**
 * TwoPartAnswer - Two linked answer parts
 * Used for Q14 (Yorktown repair)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { TwoPartQuestion, ExamAnswer } from '../types';

interface TwoPartAnswerProps {
  question: TwoPartQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

export function TwoPartAnswer({ question, onAnswer }: TwoPartAnswerProps) {
  const [partASelection, setPartASelection] = useState<number | null>(null);
  const [partBSelection, setPartBSelection] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelectPartA = (index: number) => {
    if (isSubmitted) return;
    setPartASelection(index);
  };

  const handleSelectPartB = (index: number) => {
    if (isSubmitted) return;
    setPartBSelection(index);
  };

  const handleSubmit = () => {
    if (partASelection === null || partBSelection === null || isSubmitted) return;

    const partACorrect = partASelection === question.partA.correctIndex;
    const partBCorrect = partBSelection === question.partB.correctIndex;

    let isCorrect = false;
    let partialCredit = 0;

    if (question.bothRequired) {
      isCorrect = partACorrect && partBCorrect;
      partialCredit = isCorrect ? 1 : 0;
    } else {
      partialCredit = ((partACorrect ? 1 : 0) + (partBCorrect ? 1 : 0)) / 2;
      isCorrect = partialCredit === 1;
    }

    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect,
      value: { partA: partASelection, partB: partBSelection },
      partialCredit,
    });
  };

  const canSubmit = partASelection !== null && partBSelection !== null;

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

      {/* Main question text */}
      <h3 className="text-lg font-bold text-white mb-4 leading-relaxed">
        {question.prompt}
      </h3>

      {/* Part A */}
      <div className="mb-6">
        <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
            A
          </span>
          {question.partA.prompt}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {question.partA.options.map((option, index) => {
            const isSelected = partASelection === index;
            const isCorrect = index === question.partA.correctIndex;
            const showCorrect = isSubmitted && isCorrect;
            const showIncorrect = isSubmitted && isSelected && !isCorrect;

            return (
              <motion.button
                key={index}
                whileHover={!isSubmitted ? { scale: 1.02 } : {}}
                whileTap={!isSubmitted ? { scale: 0.98 } : {}}
                onClick={() => handleSelectPartA(index)}
                disabled={isSubmitted}
                className={`p-3 rounded-xl text-center transition-all text-sm ${
                  showCorrect
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : showIncorrect
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : isSelected
                    ? 'bg-amber-500/20 border-2 border-amber-500'
                    : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
                }`}
              >
                <span className="text-white">{option}</span>
                {showCorrect && (
                  <CheckCircle2 size={16} className="text-green-400 inline ml-2" />
                )}
                {showIncorrect && (
                  <XCircle size={16} className="text-red-400 inline ml-2" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Part B */}
      <div className="flex-1">
        <h4 className="text-white/80 font-medium mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">
            B
          </span>
          {question.partB.prompt}
        </h4>
        <div className="space-y-2">
          {question.partB.options.map((option, index) => {
            const isSelected = partBSelection === index;
            const isCorrect = index === question.partB.correctIndex;
            const showCorrect = isSubmitted && isCorrect;
            const showIncorrect = isSubmitted && isSelected && !isCorrect;

            return (
              <motion.button
                key={index}
                whileHover={!isSubmitted ? { scale: 1.01 } : {}}
                whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                onClick={() => handleSelectPartB(index)}
                disabled={isSubmitted}
                className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 text-sm ${
                  showCorrect
                    ? 'bg-green-500/20 border-2 border-green-500'
                    : showIncorrect
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : isSelected
                    ? 'bg-amber-500/20 border-2 border-amber-500'
                    : 'bg-white/5 border-2 border-white/10 hover:border-white/30'
                }`}
              >
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
                <span className="flex-1 text-white">{option}</span>
                {showCorrect && (
                  <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                )}
                {showIncorrect && (
                  <XCircle size={18} className="text-red-400 shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Requirement note */}
      {question.bothRequired && !isSubmitted && (
        <p className="text-white/40 text-xs text-center mt-4">
          Both parts must be correct for full credit
        </p>
      )}

      {/* Submit button */}
      <AnimatePresence>
        {canSubmit && !isSubmitted && (
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

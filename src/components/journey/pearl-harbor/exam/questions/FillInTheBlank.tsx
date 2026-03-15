/**
 * FillInTheBlank - Text input question for Final Exam
 * Used for Q3 (FDR "infamy" speech)
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { FillInBlankQuestion, ExamAnswer } from '../types';

interface FillInTheBlankProps {
  question: FillInBlankQuestion;
  onAnswer: (answer: ExamAnswer) => void;
}

export function FillInTheBlank({ question, onAnswer }: FillInTheBlankProps) {
  const [inputValue, setInputValue] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (!inputValue.trim() || isSubmitted) return;

    const trimmedValue = inputValue.trim();
    const correct = question.caseSensitive
      ? question.correctAnswers.includes(trimmedValue)
      : question.correctAnswers.some(
          (ans) => ans.toLowerCase() === trimmedValue.toLowerCase()
        );

    setIsCorrect(correct);
    setIsSubmitted(true);

    onAnswer({
      questionId: question.id,
      isCorrect: correct,
      value: trimmedValue,
    });
  };

  const handleWordOption = (word: string) => {
    if (isSubmitted) return;
    setInputValue(word);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
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

      {/* Blank prompt with fill-in */}
      <div className="bg-white/5 rounded-xl p-6 mb-6 border-2 border-white/10">
        <p className="text-lg text-white/80 font-medium text-center leading-relaxed">
          {question.blankPrompt.split('______').map((part, index, arr) => (
            <span key={index}>
              {part}
              {index < arr.length - 1 && (
                <span
                  className={`inline-block min-w-[120px] px-2 py-1 mx-1 border-b-2 ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-red-500 bg-red-500/20'
                      : inputValue
                      ? 'border-amber-500 bg-amber-500/20'
                      : 'border-white/40'
                  }`}
                >
                  {inputValue || '______'}
                </span>
              )}
            </span>
          ))}
        </p>
      </div>

      {/* Word bank (if provided) */}
      {question.wordOptions && !isSubmitted && (
        <div className="mb-6">
          <p className="text-white/40 text-xs mb-3 text-center">
            Choose a word or type your own:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {question.wordOptions.map((word) => (
              <button
                key={word}
                onClick={() => handleWordOption(word)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  inputValue.toLowerCase() === word.toLowerCase()
                    ? 'bg-amber-500 text-black'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Text input */}
      {!isSubmitted && (
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            className="w-full px-4 py-4 bg-white/5 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-amber-500 transition-colors"
            autoComplete="off"
            autoCapitalize="off"
          />
        </div>
      )}

      {/* Result display */}
      {isSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex-1 p-4 rounded-xl ${
            isCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {isCorrect ? (
              <CheckCircle2 size={24} className="text-green-400" />
            ) : (
              <XCircle size={24} className="text-red-400" />
            )}
            <span className="text-white font-bold">
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
          </div>
          {!isCorrect && (
            <p className="text-white/70 text-sm">
              The correct answer was:{' '}
              <span className="text-white font-medium">
                {question.correctAnswers[0]}
              </span>
            </p>
          )}
        </motion.div>
      )}

      {/* Submit button */}
      <AnimatePresence>
        {inputValue.trim() && !isSubmitted && (
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

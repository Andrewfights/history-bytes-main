import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronRight } from 'lucide-react';
import { Question } from '@/types';

interface QuizViewProps {
  questions: Question[];
  onComplete: (score: number, answers: number[]) => void;
}

export function QuizView({ questions, onComplete }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;
  const isLast = currentIndex === questions.length - 1;

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    setHasSubmitted(true);
    setUserAnswers(prev => [...prev, selectedAnswer]);
    
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (isLast) {
      // correctAnswers was already updated in handleSubmit(), so use it directly
      onComplete(correctAnswers, userAnswers);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Progress */}
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Quiz</span>
          <span>Q{currentIndex + 1} of {questions.length}</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-6 space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h2 className="font-editorial text-xl font-semibold leading-snug">
              {currentQuestion.prompt}
            </h2>

            <div className="space-y-3">
              {currentQuestion.choices.map((choice, index) => {
                let optionClass = 'quiz-option';
                
                if (hasSubmitted) {
                  if (index === currentQuestion.answer) {
                    optionClass = 'quiz-option quiz-option-correct';
                  } else if (index === selectedAnswer && !isCorrect) {
                    optionClass = 'quiz-option quiz-option-incorrect';
                  }
                } else if (index === selectedAnswer) {
                  optionClass = 'quiz-option quiz-option-selected';
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                    onClick={() => !hasSubmitted && setSelectedAnswer(index)}
                    disabled={hasSubmitted}
                    className={optionClass}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        hasSubmitted && index === currentQuestion.answer
                          ? 'border-success bg-success'
                          : hasSubmitted && index === selectedAnswer && !isCorrect
                          ? 'border-destructive bg-destructive'
                          : index === selectedAnswer
                          ? 'border-primary bg-primary'
                          : 'border-border'
                      }`}>
                        {hasSubmitted && index === currentQuestion.answer && (
                          <Check size={14} className="text-success-foreground" />
                        )}
                        {hasSubmitted && index === selectedAnswer && !isCorrect && (
                          <X size={14} className="text-destructive-foreground" />
                        )}
                      </div>
                      <span>{choice}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {hasSubmitted && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`p-4 rounded-xl ${
                    isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
                  }`}
                >
                  <p className={`text-sm font-medium mb-1 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <p className="text-sm text-foreground/80">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action button */}
      <div className="p-4" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
        {!hasSubmitted ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:glow-yellow transition-all"
          >
            Submit
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:glow-yellow transition-all"
          >
            {isLast ? 'See Results' : 'Next Question'}
            <ChevronRight size={18} />
          </motion.button>
        )}
      </div>
    </div>
  );
}

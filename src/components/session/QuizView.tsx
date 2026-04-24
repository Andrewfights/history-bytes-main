import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Lightbulb, X } from 'lucide-react';
import { Question } from '@/types';

interface QuizViewProps {
  questions: Question[];
  onComplete: (score: number, answers: number[]) => void;
  onClose?: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D'];

export function QuizView({ questions, onComplete, onClose }: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [streak, setStreak] = useState(1);
  const [answerHistory, setAnswerHistory] = useState<boolean[]>([]);

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedAnswer === currentQuestion.answer;
  const isLast = currentIndex === questions.length - 1;
  const score = Math.round((correctAnswers / questions.length) * 100);

  const handleSubmit = () => {
    if (selectedAnswer === null) return;

    setHasSubmitted(true);
    setUserAnswers(prev => [...prev, selectedAnswer]);
    setAnswerHistory(prev => [...prev, isCorrect]);

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => prev + 1);
    } else {
      setStreak(1);
    }
  };

  const handleNext = () => {
    if (isLast) {
      const finalCorrect = isCorrect ? correctAnswers + 1 : correctAnswers;
      onComplete(finalCorrect, [...userAnswers, selectedAnswer!]);
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setHasSubmitted(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Top Bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[var(--ha-red)] font-bold text-xs uppercase tracking-wider">QUIZ</span>
            <span className="text-muted-foreground/50">·</span>
            <span className="text-foreground">
              <em className="text-[var(--gold-2)] not-italic font-medium">{currentIndex + 1}</em> of {questions.length}
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Progress Segments */}
      <div className="px-4 pb-4">
        <div className="quiz-progress-segments">
          {questions.map((_, i) => {
            let segmentClass = 'quiz-progress-seg';
            if (i < currentIndex) {
              segmentClass += ' done';
              if (answerHistory[i]) {
                segmentClass += ' correct';
              } else {
                segmentClass += ' incorrect';
              }
            } else if (i === currentIndex) {
              if (hasSubmitted) {
                segmentClass += ' done';
                if (isCorrect) {
                  segmentClass += ' correct';
                } else {
                  segmentClass += ' incorrect';
                }
              } else {
                segmentClass += ' current';
              }
            }
            return <div key={i} className={segmentClass} />;
          })}
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 px-4 py-2 space-y-4 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Question Card */}
            <div className="p-5 rounded-lg bg-[linear-gradient(180deg,rgba(19,21,24,0.95),rgba(10,8,5,0.95))] border border-[rgba(230,171,42,0.2)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Question</span>
                <span className="text-xs font-mono text-[var(--gold-2)]">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
                </span>
              </div>
              <h2
                className="font-['DM_Serif_Display',Georgia,serif] italic text-[22px] md:text-[26px] text-[var(--off-white)] leading-tight"
                dangerouslySetInnerHTML={{
                  __html: currentQuestion.prompt.replace(
                    /\*(.*?)\*/g,
                    '<em class="not-italic text-[var(--gold-2)]">$1</em>'
                  )
                }}
              />

              {/* Hint button - placeholder */}
              <button className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-[var(--gold-2)] transition-colors py-1.5 px-3 rounded border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)]">
                <Lightbulb size={12} />
                <span>Use a hint</span>
                <span className="text-[var(--text-4)]">−5 XP</span>
              </button>
            </div>

            {/* Answer Options */}
            <div className="space-y-2.5">
              {currentQuestion.choices.map((choice, index) => {
                let answerClass = 'quiz-answer-v3';

                if (hasSubmitted) {
                  if (index === currentQuestion.answer) {
                    answerClass += ' correct';
                  } else if (index === selectedAnswer && !isCorrect) {
                    answerClass += ' incorrect';
                  }
                } else if (index === selectedAnswer) {
                  answerClass += ' selected';
                }

                return (
                  <motion.button
                    key={index}
                    whileHover={!hasSubmitted ? { scale: 1.01 } : {}}
                    whileTap={!hasSubmitted ? { scale: 0.99 } : {}}
                    onClick={() => !hasSubmitted && setSelectedAnswer(index)}
                    disabled={hasSubmitted}
                    className={answerClass}
                  >
                    <div className="quiz-letter">{LETTERS[index]}</div>
                    <span className="quiz-answer-text-v3">{choice}</span>
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
                  className={`p-4 rounded-lg border ${
                    isCorrect
                      ? 'bg-[rgba(61,214,122,0.08)] border-[var(--success)]'
                      : 'bg-[rgba(205,14,20,0.08)] border-[var(--ha-red)]'
                  }`}
                >
                  <p className={`text-sm font-bold mb-1.5 uppercase tracking-wider ${
                    isCorrect ? 'text-[var(--success)]' : 'text-[var(--ha-red)]'
                  }`}>
                    {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <p className="text-sm text-[var(--text-2)] font-[var(--font-calligraphy)] italic">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-4" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
        {/* Score and Streak */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground">
              Score <em className="not-italic text-[var(--gold-2)] font-mono">{score}</em>/100
            </span>
            <span className="text-[var(--text-4)]">·</span>
            <span className="text-muted-foreground">
              Streak <em className="not-italic text-[var(--gold-2)] font-mono">×{streak}</em>
            </span>
          </div>
        </div>

        {!hasSubmitted ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={selectedAnswer === null}
            className="btn-primary-lg w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none"
            style={{ minHeight: '52px' }}
          >
            Submit Answer
            <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNext}
            className="btn-primary-lg w-full"
            style={{ minHeight: '52px' }}
          >
            {isLast ? 'See Results' : 'Next Question'}
            <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
        )}
      </div>
    </div>
  );
}

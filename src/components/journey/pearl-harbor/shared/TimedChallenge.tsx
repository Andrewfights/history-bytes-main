/**
 * TimedChallenge - Countdown quiz with streak bonuses
 * Used in Beat 1 (Road to War), Beat 9 (Arsenal of Democracy), Beat 10 (Mastery Run)
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Zap, CheckCircle2, XCircle, Trophy } from 'lucide-react';

export interface TimedQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  category?: string;
}

interface TimedChallengeProps {
  questions: TimedQuestion[];
  timeLimit: number; // seconds for entire challenge
  perQuestionTime?: number; // optional per-question time limit
  onComplete: (score: number, totalQuestions: number, streak: number) => void;
  onTimeUp?: () => void;
  showStreak?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  selectedIndex: number;
  timeSpent: number;
}

export function TimedChallenge({
  questions,
  timeLimit,
  perQuestionTime,
  onComplete,
  onTimeUp,
  showStreak = true,
  showProgress = true,
  allowSkip = false,
}: TimedChallengeProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(perQuestionTime || 0);
  const [score, setScore] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  // Main timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp?.();
      handleComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Per-question timer (if enabled)
  useEffect(() => {
    if (!perQuestionTime || isAnswered) return;

    setQuestionTimeRemaining(perQuestionTime);
    const timer = setInterval(() => {
      setQuestionTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-fail if time runs out
          handleAnswer(-1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, perQuestionTime, isAnswered]);

  const handleAnswer = useCallback((index: number) => {
    if (isAnswered) return;

    const timeSpent = Date.now() - questionStartTime;
    const isCorrect = index === currentQuestion.correctIndex;

    setSelectedAnswer(index);
    setIsAnswered(true);

    // Update score and streak
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setCurrentStreak((prev) => {
        const newStreak = prev + 1;
        if (newStreak > maxStreak) {
          setMaxStreak(newStreak);
        }
        return newStreak;
      });
    } else {
      setCurrentStreak(0);
    }

    // Record result
    setResults((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        isCorrect,
        selectedIndex: index,
        timeSpent,
      },
    ]);
  }, [isAnswered, questionStartTime, currentQuestion, maxStreak]);

  const handleNext = () => {
    if (isLastQuestion) {
      handleComplete();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setQuestionStartTime(Date.now());
    }
  };

  const handleComplete = () => {
    setShowResult(true);
    onComplete(score, questions.length, maxStreak);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    const percentage = timeRemaining / timeLimit;
    if (percentage > 0.5) return 'text-green-400';
    if (percentage > 0.25) return 'text-amber-400';
    return 'text-red-400';
  };

  // Results screen
  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[400px] text-center p-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center mb-6"
        >
          <Trophy size={48} className="text-white" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>

        <div className="text-4xl font-bold text-amber-400 mb-4">
          {score}/{questions.length}
        </div>

        <p className="text-white/60 mb-6">{percentage}% Correct</p>

        {showStreak && maxStreak > 1 && (
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full mb-6">
            <Zap size={18} className="text-orange-400" />
            <span className="text-orange-400 font-bold">
              Best Streak: {maxStreak}
            </span>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        {/* Timer */}
        <div className={`flex items-center gap-2 ${getTimerColor()}`}>
          <Clock size={18} />
          <span className="font-mono font-bold text-lg">
            {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="text-white/60 text-sm">
            {currentQuestionIndex + 1} / {questions.length}
          </div>
        )}

        {/* Streak */}
        {showStreak && currentStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1 px-3 py-1 bg-orange-500/20 rounded-full"
          >
            <Zap size={14} className="text-orange-400" />
            <span className="text-orange-400 font-bold text-sm">
              {currentStreak}x
            </span>
          </motion.div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentQuestionIndex + (isAnswered ? 1 : 0)) / questions.length) * 100}%`
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Category badge */}
            {currentQuestion.category && (
              <div className="mb-3">
                <span className="px-3 py-1 bg-white/10 rounded-full text-white/60 text-xs">
                  {currentQuestion.category}
                </span>
              </div>
            )}

            {/* Question text */}
            <h3 className="text-xl font-bold text-white mb-6 leading-relaxed">
              {currentQuestion.question}
            </h3>

            {/* Per-question timer (if enabled) */}
            {perQuestionTime && !isAnswered && (
              <div className="mb-4">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      questionTimeRemaining > 5 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{
                      width: `${(questionTimeRemaining / perQuestionTime) * 100}%`
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="space-y-3 flex-1">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showCorrect = isAnswered && isCorrect;
                const showIncorrect = isAnswered && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    whileHover={!isAnswered ? { scale: 1.02 } : {}}
                    whileTap={!isAnswered ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswer(index)}
                    disabled={isAnswered}
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        showCorrect
                          ? 'bg-green-500 text-white'
                          : showIncorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </span>

                    {/* Option text */}
                    <span className="flex-1 text-white">{option}</span>

                    {/* Result icon */}
                    {showCorrect && (
                      <CheckCircle2 size={24} className="text-green-400" />
                    )}
                    {showIncorrect && (
                      <XCircle size={24} className="text-red-400" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation (shown after answering) */}
            <AnimatePresence>
              {isAnswered && currentQuestion.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <p className="text-white/70 text-sm">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-white/10"
          style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
        >
          <button
            onClick={handleNext}
            className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        </motion.div>
      )}
    </div>
  );
}

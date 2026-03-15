/**
 * FinalExamBeat - Main component for Pearl Harbor Final Exam (Beat 11)
 * 15 questions with tiered difficulty, host integration, and comprehensive scoring
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import type {
  ExamScreen,
  ExamQuestion,
  ExamAnswer,
  ExamDifficulty,
  FinalExamBeatProps,
} from './types';
import { ExamProgressBar } from './ExamProgressBar';
import { ExamQuestionRenderer } from './ExamQuestionRenderer';
import { ExamResults } from './ExamResults';
import { FINAL_EXAM_QUESTIONS } from './examQuestions';
import {
  FINAL_EXAM_CONFIG,
  shuffleQuestionsWithinTiers,
  calculateExamScore,
  getTierForIndex,
  EXAM_HOST_DIALOGUES,
} from './examConfig';

export function FinalExamBeat({
  host,
  onComplete,
  onSkip,
  onBack,
}: FinalExamBeatProps) {
  // State machine
  const [screen, setScreen] = useState<ExamScreen>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, ExamAnswer>>(new Map());
  const [shuffledQuestions, setShuffledQuestions] = useState<ExamQuestion[]>([]);
  const [currentTier, setCurrentTier] = useState<ExamDifficulty>('easy');
  const [showingTierTransition, setShowingTierTransition] = useState(false);

  // Initialize shuffled questions
  useEffect(() => {
    if (FINAL_EXAM_CONFIG.shuffleWithinTiers) {
      setShuffledQuestions(shuffleQuestionsWithinTiers(FINAL_EXAM_QUESTIONS));
    } else {
      setShuffledQuestions([...FINAL_EXAM_QUESTIONS]);
    }
  }, []);

  // Get current question
  const currentQuestion = shuffledQuestions[currentIndex];

  // Calculate correct count
  const correctCount = Array.from(answers.values()).filter((a) => a.isCorrect).length;

  // Handle intro continue
  const handleIntroStart = useCallback(() => {
    setScreen('question');
  }, []);

  // Handle answer submission
  const handleAnswer = useCallback(
    (answer: ExamAnswer) => {
      setAnswers((prev) => new Map(prev).set(answer.questionId, answer));
      setScreen('answer_reveal');

      // After delay, move to next question or results
      setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= shuffledQuestions.length) {
          // Exam complete
          setScreen('results');
        } else {
          // Check for tier transition
          const currentTierValue = getTierForIndex(currentIndex);
          const nextTierValue = getTierForIndex(nextIndex);

          if (currentTierValue !== nextTierValue) {
            // Show tier transition
            setCurrentTier(nextTierValue);
            setShowingTierTransition(true);
            setScreen('transition');

            setTimeout(() => {
              setShowingTierTransition(false);
              setCurrentIndex(nextIndex);
              setScreen('question');
            }, 3000);
          } else {
            // Continue to next question
            setCurrentIndex(nextIndex);
            setScreen('question');
          }
        }
      }, 2000);
    },
    [currentIndex, shuffledQuestions.length]
  );

  // Handle exam completion
  const handleComplete = useCallback(
    (xp: number) => {
      onComplete(xp);
    },
    [onComplete]
  );

  // Handle retry
  const handleRetry = useCallback(() => {
    setAnswers(new Map());
    setCurrentIndex(0);
    setCurrentTier('easy');
    setScreen('intro');
    setShuffledQuestions(shuffleQuestionsWithinTiers(FINAL_EXAM_QUESTIONS));
  }, []);

  // Handle review lessons (go back to lesson select)
  const handleReviewLessons = useCallback(() => {
    onBack();
  }, [onBack]);

  // Calculate score for results
  const examResult = calculateExamScore(answers, shuffledQuestions);

  // Get tier intro message
  const getTierIntro = (tier: ExamDifficulty) => {
    switch (tier) {
      case 'easy':
        return EXAM_HOST_DIALOGUES.easyTierIntro;
      case 'medium':
        return EXAM_HOST_DIALOGUES.mediumTierIntro;
      case 'hard':
        return EXAM_HOST_DIALOGUES.hardTierIntro;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 flex items-center justify-between border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-white font-bold">Final Exam</h1>
        <button
          onClick={onSkip}
          className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </header>

      {/* Progress bar (hidden during intro/results) */}
      {screen !== 'intro' && screen !== 'results' && (
        <div className="px-4 py-3 border-b border-white/10">
          <ExamProgressBar
            currentIndex={currentIndex}
            answeredCount={answers.size}
            correctCount={correctCount}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Intro screen */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                {/* Host avatar */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.4 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg"
                  style={{ backgroundColor: host.primaryColor }}
                >
                  {host.avatar}
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-2xl font-bold text-white mb-2"
                >
                  Pearl Harbor Final Exam
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/60 mb-6"
                >
                  15 Questions • No Time Limit
                </motion.p>

                {/* Host introduction */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="max-w-md mb-8"
                >
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-white/50 text-xs mb-1">{host.name}</p>
                    <p className="text-white/90 text-sm leading-relaxed">
                      {EXAM_HOST_DIALOGUES.intro}
                    </p>
                  </div>
                </motion.div>

                {/* Difficulty tiers preview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-3 mb-8"
                >
                  <div className="px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                    Easy (1-5)
                  </div>
                  <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg text-amber-400 text-sm">
                    Medium (6-10)
                  </div>
                  <div className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    Hard (11-15)
                  </div>
                </motion.div>

                {/* Start button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={handleIntroStart}
                  className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Begin Exam
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Question screen */}
          {(screen === 'question' || screen === 'answer_reveal') && currentQuestion && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-4 overflow-y-auto"
            >
              <ExamQuestionRenderer
                question={currentQuestion}
                hostMode={currentQuestion.hostMode}
                host={host}
                onAnswer={handleAnswer}
                questionNumber={currentIndex + 1}
              />

              {/* Explanation overlay after answer */}
              <AnimatePresence>
                {screen === 'answer_reveal' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-8 pb-6 px-4"
                  >
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-white/80 text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Tier transition screen */}
          {screen === 'transition' && (
            <motion.div
              key="transition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full items-center justify-center p-6 text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Tier indicator */}
                <div
                  className={`text-4xl font-bold mb-4 ${
                    currentTier === 'medium'
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {currentTier === 'medium' ? 'Medium' : 'Hard'} Tier
                </div>

                {/* Tier range */}
                <div className="text-white/60 mb-6">
                  Questions {currentTier === 'medium' ? '6-10' : '11-15'}
                </div>

                {/* Host message */}
                <div className="max-w-md bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/50 text-xs mb-1">{host.name}</p>
                  <p className="text-white/90 text-sm leading-relaxed">
                    {getTierIntro(currentTier)}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Results screen */}
          {screen === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ExamResults
                result={examResult}
                answers={answers}
                questions={shuffledQuestions}
                host={host}
                onComplete={handleComplete}
                onRetry={handleRetry}
                onReviewLessons={handleReviewLessons}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

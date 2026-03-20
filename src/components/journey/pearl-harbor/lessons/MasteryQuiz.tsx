/**
 * MasteryQuiz - Lesson 7: Mastery Run
 *
 * Screens:
 * 1. Intro - "Prove your knowledge"
 * 2. Quiz - 10 mixed questions from all lessons
 * 3. Completion - Badge celebration
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward, Trophy, Star, CheckCircle2, XCircle } from 'lucide-react';
import { WW2Host } from '@/types';

interface MasteryQuizProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'intro' | 'quiz' | 'completion';

// Mastery quiz questions from all lessons
const QUIZ_QUESTIONS = [
  // From Lesson 1
  {
    id: 1,
    question: 'On what date did the attack on Pearl Harbor occur?',
    choices: ['December 7, 1940', 'December 7, 1941', 'December 7, 1942', 'November 7, 1941'],
    correctIndex: 1,
    lesson: 'Morning of the Attack',
  },
  {
    id: 2,
    question: 'How long did the attack on Pearl Harbor last?',
    choices: ['About 30 minutes', 'About 1 hour', 'About 2 hours', 'About 4 hours'],
    correctIndex: 2,
    lesson: 'Morning of the Attack',
  },
  // From Lesson 2
  {
    id: 3,
    question: 'What did the radar operators at Opana Point detect?',
    choices: ['A single aircraft', 'A formation of 50+ aircraft', 'A Japanese submarine', 'Nothing unusual'],
    correctIndex: 1,
    lesson: 'Radar Warning',
  },
  {
    id: 4,
    question: 'Why was the radar warning ignored?',
    choices: ['Equipment malfunction', 'The officer assumed it was expected B-17 bombers', 'The operators didn\'t report it', 'The information center was closed'],
    correctIndex: 1,
    lesson: 'Radar Warning',
  },
  // From Lesson 3
  {
    id: 5,
    question: 'How many crew members died on the USS Arizona?',
    choices: ['429', '1,177', '2,403', '100'],
    correctIndex: 1,
    lesson: 'Voices from Pearl Harbor',
  },
  // From Lesson 4
  {
    id: 6,
    question: 'What time (Eastern) did the radio broadcast interrupt regular programming?',
    choices: ['7:55 AM', '12:00 PM', '2:22 PM', '6:00 PM'],
    correctIndex: 2,
    lesson: 'Radio Break-In',
  },
  // From Lesson 5
  {
    id: 7,
    question: 'How many battleships were moored at Battleship Row?',
    choices: ['4', '6', '8', '10'],
    correctIndex: 2,
    lesson: 'Battleship Row',
  },
  {
    id: 8,
    question: 'Which two battleships were "total losses" that never returned to service?',
    choices: ['Arizona and Oklahoma', 'West Virginia and California', 'Nevada and Tennessee', 'Maryland and Pennsylvania'],
    correctIndex: 0,
    lesson: 'Battleship Row',
  },
  // From Lesson 6
  {
    id: 9,
    question: 'What are the "black tears" at the Arizona Memorial?',
    choices: ['Memorial flowers', 'Oil still leaking from the sunken ship', 'Rain water', 'Painted markers'],
    correctIndex: 1,
    lesson: 'Arizona Memorial',
  },
  {
    id: 10,
    question: 'Why is the USS Arizona left underwater as a memorial?',
    choices: ['Too expensive to raise', 'It serves as a grave site for over 900 crew members', 'Too damaged to move', 'Navy regulations'],
    correctIndex: 1,
    lesson: 'Arizona Memorial',
  },
];

const LESSON_DATA = {
  title: 'Mastery Run',
  subtitle: 'Prove your knowledge',
  xpReward: 65,
  passingScore: 8, // Need 8 out of 10 to pass
};

export function MasteryQuiz({ host, onComplete, onSkip, onBack }: MasteryQuizProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [skipped, setSkipped] = useState(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const passed = correctAnswers >= LESSON_DATA.passingScore;

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    const correct = index === currentQuestion.correctIndex;
    setIsAnswerCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
    setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setScreen('completion');
    }
  };

  const handleComplete = () => {
    if (skipped || !passed) {
      onSkip();
    } else {
      onComplete(LESSON_DATA.xpReward);
    }
  };

  const handleSkipLesson = () => {
    setSkipped(true);
    onSkip();
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 7</h1>
          <p className="text-xs text-amber-400">{LESSON_DATA.title}</p>
        </div>
        {screen === 'quiz' ? (
          <button
            onClick={handleSkipLesson}
            className="text-white/50 hover:text-white/80 text-sm font-medium"
          >
            Skip
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'intro' ? '0%' :
                   screen === 'quiz' ? `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` :
                   '100%'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
              style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/50 to-amber-600/30 flex items-center justify-center mb-6"
              >
                <Trophy size={64} className="text-amber-400" />
              </motion.div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-6">
                {LESSON_DATA.subtitle}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60">Questions:</span>
                  <span className="text-white font-bold">{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white/60">Pass Score:</span>
                  <span className="text-amber-400 font-bold">{LESSON_DATA.passingScore}/{totalQuestions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">XP Reward:</span>
                  <span className="text-green-400 font-bold">+{LESSON_DATA.xpReward}</span>
                </div>
              </div>

              <p className="text-white/50 text-sm mb-6 max-w-sm">
                Questions cover all 6 previous lessons. Take your time and remember what you've learned!
              </p>

              {/* Host message */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-8 max-w-sm">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: host.primaryColor }}
                >
                  {host.avatar}
                </div>
                <p className="text-white/70 text-sm text-left">
                  "This is it - show me everything you've learned about December 7, 1941. Good luck!"
                </p>
              </div>

              <motion.button
                onClick={() => setScreen('quiz')}
                className="px-8 py-4 rounded-full bg-amber-500 text-black font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Mastery Quiz
              </motion.button>
            </motion.div>
          )}

          {/* Quiz Screen */}
          {screen === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-6"
              style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
            >
              {/* Score and progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  <span className="text-white font-bold">{correctAnswers}/{answeredQuestions.length}</span>
                </div>
                <span className="text-white/60 text-sm">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>
              </div>

              {/* Question */}
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <p className="text-amber-400/60 text-xs mb-2">{currentQuestion.lesson}</p>
                <h2 className="font-editorial text-xl font-bold text-white">
                  {currentQuestion.question}
                </h2>
              </motion.div>

              {/* Choices */}
              <div className="space-y-3 flex-1">
                {currentQuestion.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectedAnswer === null && handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === null
                        ? 'border-white/20 bg-white/5 hover:border-amber-400/50'
                        : selectedAnswer === index
                          ? isAnswerCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : index === currentQuestion.correctIndex
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5 opacity-50'
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <div className="flex items-center gap-3">
                      {selectedAnswer !== null && (
                        index === currentQuestion.correctIndex ? (
                          <CheckCircle2 size={20} className="text-green-400 flex-shrink-0" />
                        ) : selectedAnswer === index ? (
                          <XCircle size={20} className="text-red-400 flex-shrink-0" />
                        ) : null
                      )}
                      <span className="text-white text-sm">{choice}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Feedback and next */}
              {selectedAnswer !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                >
                  <div className={`p-3 rounded-xl mb-4 text-center ${
                    isAnswerCorrect ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    <span className={`font-bold ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isAnswerCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </span>
                  </div>

                  <motion.button
                    onClick={nextQuestion}
                    className="w-full py-4 rounded-full bg-amber-500 text-black font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'See Results'}
                  </motion.button>
                </motion.div>
              )}

              {selectedAnswer === null && (
                <button
                  onClick={() => {
                    setAnsweredQuestions(prev => [...prev, currentQuestionIndex]);
                    nextQuestion();
                  }}
                  className="mt-4 w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip Question
                </button>
              )}
            </motion.div>
          )}

          {/* Completion Screen */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
              style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
            >
              {passed ? (
                <>
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 150 }}
                    className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6 relative"
                  >
                    <Trophy size={64} className="text-white" />
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-amber-300"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>

                  <h2 className="font-editorial text-3xl font-bold text-white mb-2">
                    Pearl Harbor Scholar
                  </h2>

                  <p className="text-amber-400 font-bold text-xl mb-4">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm">
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-white">{correctAnswers}</span>
                      <span className="text-white/60">/{totalQuestions}</span>
                      <p className="text-green-400 text-sm mt-1">Excellent!</p>
                    </div>

                    <div className="flex justify-center gap-1">
                      {QUIZ_QUESTIONS.map((_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full ${
                            answeredQuestions.includes(i)
                              ? i < correctAnswers ? 'bg-green-500' : 'bg-red-500'
                              : 'bg-white/20'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 max-w-sm"
                  >
                    <p className="text-amber-400 font-bold mb-2">🎖️ Badge Earned</p>
                    <p className="text-white/70 text-sm">
                      You've completed all 7 Pearl Harbor lessons and proven your knowledge of December 7, 1941.
                    </p>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6"
                  >
                    <span className="text-5xl">📚</span>
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Keep Learning
                  </h2>

                  <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm">
                    <div className="text-center mb-4">
                      <span className="text-4xl font-bold text-white">{correctAnswers}</span>
                      <span className="text-white/60">/{totalQuestions}</span>
                      <p className="text-orange-400 text-sm mt-1">Need {LESSON_DATA.passingScore} to pass</p>
                    </div>
                  </div>

                  <p className="text-white/60 text-sm mb-6 max-w-sm">
                    Review the lessons and try again. You can do it!
                  </p>
                </>
              )}

              <motion.button
                onClick={handleComplete}
                className={`px-8 py-4 rounded-full font-bold text-lg ${
                  passed
                    ? 'bg-amber-500 text-black'
                    : 'bg-orange-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {passed ? 'Complete Journey' : 'Continue Anyway'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

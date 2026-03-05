import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Zap, Trophy, XCircle, CheckCircle2 } from 'lucide-react';
import { BossContent, Question } from '@/types';

interface BossNodeProps {
  content: BossContent;
  xpReward: number;
  onComplete: (xp: number, message?: string) => void;
}

export function BossNode({ content, xpReward, onComplete }: BossNodeProps) {
  const [phase, setPhase] = useState<'intro' | 'challenge' | 'results'>('intro');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(content.timeLimit);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const currentQuestion = content.questions[questionIndex];
  const totalQuestions = content.questions.length;
  const passThreshold = Math.ceil(totalQuestions * 0.7); // Need 70% to pass

  // Timer countdown
  useEffect(() => {
    if (phase !== 'challenge' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('results');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const handleStartChallenge = () => {
    setPhase('challenge');
  };

  const handleSelectAnswer = (index: number) => {
    if (isAnswerLocked) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = useCallback(() => {
    if (selectedAnswer === null || isAnswerLocked) return;

    setIsAnswerLocked(true);
    const isCorrect = selectedAnswer === currentQuestion.answer;
    if (isCorrect) setScore((s) => s + 1);

    // Brief delay then move to next question
    setTimeout(() => {
      if (questionIndex < totalQuestions - 1) {
        setQuestionIndex((i) => i + 1);
        setSelectedAnswer(null);
        setIsAnswerLocked(false);
      } else {
        setPhase('results');
      }
    }, 500);
  }, [selectedAnswer, isAnswerLocked, currentQuestion, questionIndex, totalQuestions]);

  const handleComplete = () => {
    const passed = score >= passThreshold;
    const xp = passed ? Math.round(xpReward * content.xpMultiplier) : Math.floor(xpReward * 0.3);
    const message = passed ? content.hostVictory : content.hostDefeat;
    onComplete(xp, message, { correct: score, total: totalQuestions });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-destructive';
    if (timeLeft <= 30) return 'text-warning';
    return 'text-primary';
  };

  const passed = score >= passThreshold;

  return (
    <div className="px-4 py-6 pb-28">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {/* Boss Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary flex items-center justify-center"
            >
              <Trophy size={48} className="text-primary" />
            </motion.div>

            <h2 className="font-editorial text-2xl font-bold mb-2">Boss Challenge</h2>

            {/* Stats */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Timer size={18} className="text-muted-foreground" />
                <span className="text-sm">{formatTime(content.timeLimit)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={18} className="text-primary" />
                <span className="text-sm">{content.xpMultiplier}x XP</span>
              </div>
            </div>

            {/* Host Intro */}
            <div className="bg-card rounded-xl border border-border p-4 mb-6 text-left">
              <p className="text-sm italic text-muted-foreground">"{content.hostIntro}"</p>
            </div>

            {/* Rules */}
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-sm mb-2">Challenge Rules</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Answer {totalQuestions} questions before time runs out</li>
                <li>• Get {passThreshold}+ correct to pass ({Math.round((passThreshold/totalQuestions)*100)}%)</li>
                <li>• Pass to earn {content.xpMultiplier}x XP bonus!</li>
              </ul>
            </div>

            {/* Start Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                onClick={handleStartChallenge}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start Challenge
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Timer Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Timer size={16} className={getTimerColor()} />
                  <span className={`font-mono font-bold ${getTimerColor()}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {questionIndex + 1}/{totalQuestions}
                </span>
              </div>

              {/* Time Progress */}
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${timeLeft <= 10 ? 'bg-destructive' : timeLeft <= 30 ? 'bg-warning' : 'bg-primary'}`}
                  initial={{ width: '100%' }}
                  animate={{ width: `${(timeLeft / content.timeLimit) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Question Progress */}
              <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
                <motion.div
                  className="h-full bg-success"
                  animate={{ width: `${((questionIndex + (isAnswerLocked ? 1 : 0)) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Score Display */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap size={16} className="text-primary" />
              <span className="text-sm font-bold">
                Score: {score}/{questionIndex + (isAnswerLocked ? 1 : 0)}
              </span>
            </div>

            {/* Question */}
            <motion.div
              key={questionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="font-bold text-lg mb-4">{currentQuestion.prompt}</h3>

              <div className="space-y-2 mb-4">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.answer;

                  let cardStyle = 'bg-card border-border hover:border-primary/50';
                  if (isAnswerLocked) {
                    if (isCorrectAnswer) {
                      cardStyle = 'bg-success/10 border-success';
                    } else if (isSelected && !isCorrectAnswer) {
                      cardStyle = 'bg-destructive/10 border-destructive';
                    }
                  } else if (isSelected) {
                    cardStyle = 'bg-primary/10 border-primary';
                  }

                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={isAnswerLocked}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${cardStyle}`}
                      whileTap={!isAnswerLocked ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          isAnswerLocked
                            ? isCorrectAnswer
                              ? 'bg-success/20 text-success'
                              : isSelected
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-muted text-muted-foreground'
                            : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {isAnswerLocked ? (
                            isCorrectAnswer ? <CheckCircle2 size={16} /> : isSelected ? <XCircle size={16} /> : String.fromCharCode(65 + index)
                          ) : (
                            String.fromCharCode(65 + index)
                          )}
                        </div>
                        <span className="text-sm">{choice}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            {/* Submit Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || isAnswerLocked}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  selectedAnswer !== null && !isAnswerLocked
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
              >
                {isAnswerLocked ? 'Next...' : 'Lock In Answer'}
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                passed ? 'bg-success/20' : 'bg-destructive/20'
              }`}
            >
              {passed ? (
                <Trophy size={48} className="text-success" />
              ) : (
                <XCircle size={48} className="text-destructive" />
              )}
            </motion.div>

            <h2 className="font-editorial text-2xl font-bold mb-2">
              {passed ? 'Challenge Complete!' : 'Challenge Failed'}
            </h2>

            {/* Score */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 ${
              passed ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
            }`}>
              <span className="font-bold text-lg">{score}/{totalQuestions}</span>
              <span className="text-sm">correct</span>
            </div>

            {/* XP Earned */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap size={20} className="text-primary" />
                <span className="font-bold text-xl">
                  +{passed ? Math.round(xpReward * content.xpMultiplier) : Math.floor(xpReward * 0.3)} XP
                </span>
              </div>
              {passed && (
                <span className="text-xs text-primary font-bold">{content.xpMultiplier}x BONUS!</span>
              )}
            </div>

            {/* Host Message */}
            <div className={`p-4 rounded-xl mb-6 ${passed ? 'bg-success/10' : 'bg-muted'}`}>
              <p className="text-sm italic">"{passed ? content.hostVictory : content.hostDefeat}"</p>
            </div>

            {/* Time Remaining */}
            {timeLeft > 0 && (
              <p className="text-xs text-muted-foreground mb-4">
                Time remaining: {formatTime(timeLeft)}
              </p>
            )}

            {/* Continue Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleComplete}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors ${
                  passed
                    ? 'bg-success text-white hover:bg-success/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {passed ? 'Claim Rewards' : 'Continue'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

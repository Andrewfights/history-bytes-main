import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, XCircle, Pause, Play } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  ghostArmyContent,
  getGhostArmyQuestion,
  getGhostArmyQuestions,
  GhostArmyQuestion,
  InteractionTrigger,
} from '@/data/ghostArmyData';
import { WrongAnswerBanner } from '@/components/shared/WrongAnswerFeedback';
import { FunnelExitDialog } from './FunnelExitDialog';

interface GhostArmyPlayerProps {
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
  onExit: () => void;
}

export function GhostArmyPlayer({ onComplete, onExit }: GhostArmyPlayerProps) {
  const { funnelState, updateGhostArmyProgress, addXP } = useApp();
  const videoRef = useRef<HTMLIFrameElement>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(funnelState.ww2.ghostArmyProgress.lastTimestamp);
  const [completedInteractions, setCompletedInteractions] = useState<string[]>(
    funnelState.ww2.ghostArmyProgress.interactionsCompleted
  );

  // Interaction state
  const [activeInteraction, setActiveInteraction] = useState<InteractionTrigger | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<GhostArmyQuestion | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<GhostArmyQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  // UI state
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Mark as started on mount
  useEffect(() => {
    if (!funnelState.ww2.ghostArmyProgress.started) {
      updateGhostArmyProgress({ started: true });
    }
  }, []);

  // Simulate video time progress (since we can't directly control YouTube iframe)
  useEffect(() => {
    if (isPlaying && !activeInteraction) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          // Save progress periodically
          if (newTime % 10 === 0) {
            updateGhostArmyProgress({ lastTimestamp: newTime });
          }
          return newTime;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, activeInteraction]);

  // Check for interaction triggers
  useEffect(() => {
    if (activeInteraction) return;

    for (const trigger of ghostArmyContent.interactionTriggers) {
      const triggerId = trigger.questionId || trigger.questionIds?.join(',') || '';
      if (currentTime >= trigger.timestamp && !completedInteractions.includes(triggerId)) {
        // Pause and show interaction
        setIsPlaying(false);
        setActiveInteraction(trigger);

        if (trigger.type === 'final-quiz' && trigger.questionIds) {
          const questions = getGhostArmyQuestions(trigger.questionIds);
          setQuizQuestions(questions);
          setQuizIndex(0);
          setCurrentQuestion(questions[0]);
        } else if (trigger.questionId) {
          const question = getGhostArmyQuestion(trigger.questionId);
          if (question) setCurrentQuestion(question);
        }
        break;
      }
    }

    // Check for completion
    if (currentTime >= ghostArmyContent.duration && completedInteractions.length === ghostArmyContent.interactionTriggers.length) {
      handleVideoComplete();
    }
  }, [currentTime, completedInteractions, activeInteraction]);

  const handleVideoComplete = () => {
    const totalQuestions = ghostArmyContent.questions.length;
    const xp = Math.round((correctAnswers / totalQuestions) * ghostArmyContent.xpReward);
    addXP(xp);
    onComplete(xp, { correct: correctAnswers, total: totalQuestions });
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuestion) return;
    setShowResult(true);
    setTotalAnswered(prev => prev + 1);

    if (selectedAnswer === currentQuestion.answer) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!activeInteraction) return;

    // Final quiz - move to next question
    if (activeInteraction.type === 'final-quiz' && quizIndex < quizQuestions.length - 1) {
      setQuizIndex(prev => prev + 1);
      setCurrentQuestion(quizQuestions[quizIndex + 1]);
      setSelectedAnswer(null);
      setShowResult(false);
      return;
    }

    // Mark interaction as complete
    const triggerId = activeInteraction.questionId || activeInteraction.questionIds?.join(',') || '';
    const newCompleted = [...completedInteractions, triggerId];
    setCompletedInteractions(newCompleted);
    updateGhostArmyProgress({ interactionsCompleted: newCompleted });

    // Reset and continue
    setActiveInteraction(null);
    setCurrentQuestion(null);
    setQuizQuestions([]);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setIsPlaying(true);
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    updateGhostArmyProgress({ lastTimestamp: currentTime });
    onExit();
  };

  const isCorrect = selectedAnswer !== null && currentQuestion && selectedAnswer === currentQuestion.answer;
  const progress = (currentTime / ghostArmyContent.duration) * 100;

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-background overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleExitClick}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Exit</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">WW2 Demo</p>
            <p className="font-bold text-sm">{ghostArmyContent.title}</p>
          </div>
          <div className="w-16" />
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Video Player Area */}
      <div className="relative">
        {/* Video embed (placeholder) */}
        <div className="aspect-video bg-obsidian-900 relative">
          {/* Placeholder video display */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-obsidian-800 to-obsidian-950">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {isPlaying ? '🎬' : '⏸️'}
              </div>
              <p className="text-white/60 text-sm">
                {isPlaying ? 'Video playing...' : 'Video paused'}
              </p>
              <p className="text-white/40 text-xs mt-2">
                {Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(ghostArmyContent.duration / 60)}:{(ghostArmyContent.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Play/Pause overlay */}
          {!activeInteraction && (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity"
            >
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                {isPlaying ? <Pause size={32} className="text-white" /> : <Play size={32} className="text-white ml-1" />}
              </div>
            </button>
          )}
        </div>

        {/* Context */}
        {!activeInteraction && (
          <div className="px-4 py-4">
            <p className="text-sm text-muted-foreground">
              {ghostArmyContent.context}
            </p>
          </div>
        )}
      </div>

      {/* Interaction Panel */}
      <AnimatePresence>
        {activeInteraction && currentQuestion && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-x-0 bottom-0 z-20 bg-background border-t border-border rounded-t-3xl max-h-[70vh] overflow-y-auto pb-20"
          >
            <div className="px-4 py-6">
              {/* Question type badge */}
              <div className="flex items-center justify-center mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  activeInteraction.type === 'final-quiz'
                    ? 'bg-amber-500/20 text-amber-400'
                    : activeInteraction.type === 'aha'
                    ? 'bg-purple-500/20 text-purple-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {activeInteraction.type === 'final-quiz'
                    ? `Final Quiz (${quizIndex + 1}/${quizQuestions.length})`
                    : activeInteraction.type === 'aha'
                    ? 'Challenge Question'
                    : 'Comprehension Check'}
                </span>
              </div>

              {/* Question */}
              <h3 className="font-bold text-lg text-center mb-6">{currentQuestion.prompt}</h3>

              {/* Choices */}
              <div className="space-y-3 mb-6">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.answer;

                  let cardStyle = 'bg-card border-border hover:border-primary/50';
                  if (showResult) {
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
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${cardStyle}`}
                      whileHover={!showResult ? { scale: 1.01 } : {}}
                      whileTap={!showResult ? { scale: 0.99 } : {}}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                          showResult
                            ? isCorrectAnswer
                              ? 'bg-success/20 text-success'
                              : isSelected
                              ? 'bg-destructive/20 text-destructive'
                              : 'bg-muted text-muted-foreground'
                            : isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-sm">{choice}</span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Result feedback */}
              {showResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-xl mb-6 ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 size={18} className="text-success" />
                    ) : (
                      <XCircle size={18} className="text-destructive" />
                    )}
                    <span className="font-bold">
                      {isCorrect ? 'Correct!' : 'Not quite!'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </motion.div>
              )}

              {/* Action button */}
              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAnswer !== null
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
                >
                  {activeInteraction.type === 'final-quiz' && quizIndex < quizQuestions.length - 1
                    ? 'Next Question'
                    : 'Continue Video'}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Dialog */}
      <FunnelExitDialog
        isOpen={showExitDialog}
        onContinue={() => setShowExitDialog(false)}
        onExit={handleConfirmExit}
      />
    </div>
  );
}

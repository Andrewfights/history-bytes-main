import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, CheckCircle2, XCircle, ChevronRight, RotateCcw } from 'lucide-react';
import { TriviaQuestion, TriviaSet } from '@/lib/triviaStorage';

interface TriviaPlayerProps {
  triviaSet: TriviaSet;
  onComplete: (results: { correct: number; total: number; xpEarned: number }) => void;
  onExit?: () => void;
}

type Phase = 'video' | 'question' | 'response' | 'complete';

export function TriviaPlayer({ triviaSet, onComplete, onExit }: TriviaPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('video');
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showAnswers, setShowAnswers] = useState(false);
  const [results, setResults] = useState({ correct: 0, total: 0, xpEarned: 0 });

  const videoRef = useRef<HTMLVideoElement>(null);
  const responseVideoRef = useRef<HTMLVideoElement>(null);
  const triggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = triviaSet.questions[currentQuestionIndex];
  const hasMoreQuestions = currentQuestionIndex < triviaSet.questions.length - 1;

  // Handle video time updates for timed triggers
  useEffect(() => {
    if (phase !== 'video' || !currentQuestion) return;

    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (typeof currentQuestion.answerTrigger === 'number') {
        if (video.currentTime >= currentQuestion.answerTrigger && !showAnswers) {
          setShowAnswers(true);
        }
      }
    };

    const handleEnded = () => {
      if (currentQuestion.answerTrigger === 'end') {
        setShowAnswers(true);
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [phase, currentQuestion, showAnswers]);

  // Auto-play video when entering video phase
  useEffect(() => {
    if (phase === 'video' && videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
    if (phase === 'response' && responseVideoRef.current) {
      responseVideoRef.current.play().catch(console.error);
    }
  }, [phase]);

  // If no question video, show answers immediately
  useEffect(() => {
    if (phase === 'video' && currentQuestion && !currentQuestion.questionVideoUrl) {
      setShowAnswers(true);
    }
  }, [phase, currentQuestion]);

  const handleAnswerSelect = (answerId: string) => {
    if (selectedAnswerId) return; // Already answered

    setSelectedAnswerId(answerId);
    const answer = currentQuestion.answers.find(a => a.id === answerId);
    const correct = answer?.isCorrect || false;
    setIsCorrect(correct);

    // Update results
    setResults(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
      xpEarned: prev.xpEarned + (correct ? currentQuestion.xpReward : 0),
    }));

    // Transition to response phase
    setTimeout(() => {
      setPhase('response');
    }, 500);
  };

  const handleResponseVideoEnd = () => {
    // Could auto-advance here or wait for button click
  };

  const handleNextQuestion = () => {
    if (hasMoreQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
      setPhase('video');
      setSelectedAnswerId(null);
      setShowAnswers(false);
      setIsCorrect(false);
    } else {
      setPhase('complete');
      onComplete(results);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setPhase('video');
    setSelectedAnswerId(null);
    setShowAnswers(false);
    setIsCorrect(false);
    setResults({ correct: 0, total: 0, xpEarned: 0 });
  };

  if (!currentQuestion && phase !== 'complete') {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-muted-foreground">No questions in this trivia set.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      {/* Progress bar */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{triviaSet.title}</span>
          <span className="text-sm text-muted-foreground">
            {currentQuestionIndex + 1} / {triviaSet.questions.length}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIndex + (phase === 'complete' ? 1 : 0)) / triviaSet.questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Video & Question Phase */}
        {(phase === 'video' || phase === 'question') && currentQuestion && (
          <motion.div
            key={`question-${currentQuestionIndex}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Video Player */}
            {currentQuestion.questionVideoUrl && (
              <div className="relative aspect-video bg-black">
                <video
                  ref={videoRef}
                  src={currentQuestion.questionVideoUrl}
                  poster={currentQuestion.questionVideoThumbnail}
                  className="w-full h-full object-contain cursor-pointer"
                  muted={isMuted}
                  playsInline
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                />

                {/* Video controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-white" />
                    ) : (
                      <Volume2 size={18} className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Question & Answers */}
            <AnimatePresence>
              {showAnswers && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4 space-y-4"
                >
                  {/* Question Text */}
                  <div className="text-center">
                    <h3 className="font-editorial text-xl font-bold mb-2">
                      {currentQuestion.questionText}
                    </h3>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-2">
                    {currentQuestion.answers.map((answer, index) => {
                      const isSelected = selectedAnswerId === answer.id;
                      const showResult = selectedAnswerId !== null;

                      return (
                        <motion.button
                          key={answer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleAnswerSelect(answer.id)}
                          disabled={selectedAnswerId !== null}
                          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                            showResult
                              ? answer.isCorrect
                                ? 'bg-success/20 border-success'
                                : isSelected
                                ? 'bg-destructive/20 border-destructive'
                                : 'bg-card border-border opacity-50'
                              : isSelected
                              ? 'bg-primary/20 border-primary'
                              : 'bg-card border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                              showResult
                                ? answer.isCorrect
                                  ? 'bg-success text-white'
                                  : isSelected
                                  ? 'bg-destructive text-white'
                                  : 'bg-muted text-muted-foreground'
                                : isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                              {String.fromCharCode(65 + index)}
                            </div>
                            <span className="flex-1">{answer.text}</span>
                            {showResult && answer.isCorrect && (
                              <CheckCircle2 size={20} className="text-success" />
                            )}
                            {showResult && isSelected && !answer.isCorrect && (
                              <XCircle size={20} className="text-destructive" />
                            )}
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Response Phase */}
        {phase === 'response' && currentQuestion && (
          <motion.div
            key="response"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            {/* Response Video */}
            {(isCorrect ? currentQuestion.correctVideoUrl : currentQuestion.wrongVideoUrl) ? (
              <div className="relative aspect-video bg-black">
                <video
                  ref={responseVideoRef}
                  src={isCorrect ? currentQuestion.correctVideoUrl : currentQuestion.wrongVideoUrl}
                  className="w-full h-full object-contain cursor-pointer"
                  muted={isMuted}
                  playsInline
                  onEnded={handleResponseVideoEnd}
                  onClick={() => {
                    if (responseVideoRef.current) {
                      if (responseVideoRef.current.paused) {
                        responseVideoRef.current.play();
                      } else {
                        responseVideoRef.current.pause();
                      }
                    }
                  }}
                />

                {/* Video controls */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-white" />
                    ) : (
                      <Volume2 size={18} className="text-white" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* No response video - show result card */
              <div className="p-8 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                  className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                    isCorrect ? 'bg-success/20' : 'bg-destructive/20'
                  }`}
                >
                  {isCorrect ? (
                    <CheckCircle2 size={40} className="text-success" />
                  ) : (
                    <XCircle size={40} className="text-destructive" />
                  )}
                </motion.div>
              </div>
            )}

            {/* Response Message */}
            <div className="p-4 space-y-4">
              <div className={`p-4 rounded-xl ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                <p className="font-bold text-center mb-2">
                  {isCorrect ? currentQuestion.correctMessage : currentQuestion.wrongMessage}
                </p>
              </div>

              {/* XP Earned */}
              {isCorrect && (
                <div className="flex items-center justify-center">
                  <span className="text-gold-highlight font-bold">
                    +{currentQuestion.xpReward} XP
                  </span>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleNextQuestion}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                {hasMoreQuestions ? 'Next Question' : 'See Results'}
                <ChevronRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-6xl mb-6"
            >
              🎖️
            </motion.div>

            <h2 className="font-editorial text-2xl font-bold mb-2">Trivia Complete!</h2>
            <p className="text-muted-foreground mb-6">{triviaSet.title}</p>

            {/* Results */}
            <div className="flex items-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {results.correct}/{results.total}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="h-12 w-px bg-border" />
              <div className="text-center">
                <div className="text-3xl font-bold text-gold-highlight">
                  +{results.xpEarned}
                </div>
                <div className="text-sm text-muted-foreground">XP Earned</div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="w-full max-w-xs mb-8">
              <div className="flex items-center justify-between text-sm mb-1">
                <span>Accuracy</span>
                <span className="font-bold">
                  {Math.round((results.correct / results.total) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${(results.correct / results.total) * 100}%` }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleRestart}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
              >
                <RotateCcw size={18} />
                Try Again
              </button>
              {onExit && (
                <button
                  onClick={onExit}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

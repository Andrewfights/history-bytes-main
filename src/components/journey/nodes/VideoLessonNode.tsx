import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward, CheckCircle2 } from 'lucide-react';
import { VideoLessonContent, Question } from '@/types';
import { WrongAnswerBanner } from '@/components/shared/WrongAnswerFeedback';

interface VideoLessonNodeProps {
  content: VideoLessonContent;
  xpReward: number;
  onComplete: (xp: number, message?: string, scoreDetails?: { correct: number; total: number }) => void;
}

export function VideoLessonNode({ content, xpReward, onComplete }: VideoLessonNodeProps) {
  const [phase, setPhase] = useState<'watch' | 'questions'>('watch');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Allow skip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setCanSkip(true), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const prog = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(prog);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // If no questions, complete immediately
    if (content.questions.length === 0) {
      onComplete(xpReward, content.hostReaction, { correct: 1, total: 1 });
    } else {
      setPhase('questions');
    }
  };

  const handleContinueToQuestions = () => {
    if (content.questions.length === 0) {
      onComplete(xpReward, content.hostReaction, { correct: 1, total: 1 });
    } else {
      setPhase('questions');
    }
  };

  const handleSelectAnswer = (index: number) => {
    if (showExplanation) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    const currentQuestion = content.questions[questionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answer;
    if (isCorrect) setScore(score + 1);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (questionIndex < content.questions.length - 1) {
      setQuestionIndex(questionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      // Calculate final score
      const currentQuestion = content.questions[questionIndex];
      const isCorrect = selectedAnswer === currentQuestion.answer;
      const finalScore = isCorrect ? score + 1 : score;
      const xp = Math.round((finalScore / content.questions.length) * xpReward);
      onComplete(xp, content.hostReaction, { correct: finalScore, total: content.questions.length });
    }
  };

  // Check if it's a YouTube embed
  const isYouTube = content.videoUrl.includes('youtube.com') || content.videoUrl.includes('youtu.be');

  return (
    <div className="px-4 py-6 pb-28">
      <AnimatePresence mode="wait">
        {phase === 'watch' && (
          <motion.div
            key="watch"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">🎬</span>
              <h2 className="font-editorial text-xl font-bold mb-1">{content.title}</h2>
              <p className="text-sm text-muted-foreground">{content.context}</p>
            </div>

            {/* Video Player */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-border mb-4">
              {isYouTube ? (
                <iframe
                  src={`${content.videoUrl}${content.videoUrl.includes('?') ? '&' : '?'}autoplay=0&controls=1`}
                  title={content.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={content.videoUrl}
                    poster={content.thumbnailUrl}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={handleVideoEnded}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />

                  {/* Play/Pause Overlay */}
                  {!isPlaying && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handlePlayPause}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors"
                    >
                      <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center">
                        <Play size={32} className="text-primary-foreground ml-1" fill="currentColor" />
                      </div>
                    </motion.button>
                  )}

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                    <motion.div
                      className="h-full bg-primary"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  {/* Controls */}
                  {isPlaying && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                      <button
                        onClick={handlePlayPause}
                        className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        <Pause size={16} />
                      </button>
                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                onClick={handleContinueToQuestions}
                disabled={!canSkip && !isYouTube}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  canSkip || isYouTube
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {!canSkip && !isYouTube ? (
                  'Watch to continue...'
                ) : (
                  <>
                    {content.questions.length > 0 ? 'Continue to Questions' : 'Continue'}
                    <SkipForward size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {/* Question Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                  Question {questionIndex + 1} of {content.questions.length}
                </span>
                <span className="text-xs text-muted-foreground">
                  Score: {score}/{questionIndex + (showExplanation ? 1 : 0)}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{
                    width: `${((questionIndex + (showExplanation ? 1 : 0)) / content.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <div>
              <h3 className="font-bold text-lg mb-4">{content.questions[questionIndex].prompt}</h3>

              <div className="space-y-2 mb-4">
                {content.questions[questionIndex].choices.map((choice, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === content.questions[questionIndex].answer;

                  let cardStyle = 'bg-card border-border hover:border-primary/50';
                  if (showExplanation) {
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
                      disabled={showExplanation}
                      className={`w-full p-3 rounded-lg border transition-all text-left ${cardStyle}`}
                      whileTap={!showExplanation ? { scale: 0.99 } : {}}
                    >
                      <span className="text-sm">{choice}</span>
                    </motion.button>
                  );
                })}
              </div>

              {showExplanation && (
                selectedAnswer === content.questions[questionIndex].answer ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl bg-success/10"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 size={16} className="text-success" />
                      <p className="text-sm font-bold">Correct!</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {content.questions[questionIndex].explanation}
                    </p>
                  </motion.div>
                ) : (
                  <WrongAnswerBanner
                    question={content.questions[questionIndex]}
                    userAnswer={content.questions[questionIndex].choices[selectedAnswer ?? 0]}
                    correctAnswer={content.questions[questionIndex].choices[content.questions[questionIndex].answer as number]}
                    nodeTitle={content.title}
                    nodeType="video-lesson"
                  />
                )
              )}
            </div>

            {/* Action Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              {!showExplanation ? (
                <motion.button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAnswer !== null
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  Submit Answer
                </motion.button>
              ) : (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleNextQuestion}
                  className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
                >
                  {questionIndex < content.questions.length - 1 ? 'Next Question' : 'Complete'}
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

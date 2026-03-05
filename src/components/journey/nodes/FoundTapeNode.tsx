import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { FoundTapeContent, Question } from '@/types';
import { Slider } from '@/components/ui/slider';

interface FoundTapeNodeProps {
  content: FoundTapeContent;
  xpReward: number;
  onComplete: (xp: number, message?: string) => void;
}

export function FoundTapeNode({ content, xpReward, onComplete }: FoundTapeNodeProps) {
  const [phase, setPhase] = useState<'listen' | 'questions'>('listen');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  // Update current line based on audio time
  useEffect(() => {
    const lineIndex = content.transcript.findIndex(
      (line, idx) =>
        currentTime >= line.startTime &&
        (idx === content.transcript.length - 1 || currentTime < content.transcript[idx + 1].startTime)
    );
    if (lineIndex !== currentLineIndex) {
      setCurrentLineIndex(lineIndex);
      // Auto-scroll to current line
      if (transcriptRef.current && lineIndex >= 0) {
        const lineElement = transcriptRef.current.children[lineIndex] as HTMLElement;
        lineElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, content.transcript, currentLineIndex]);

  // Enable skip after 30 seconds
  useEffect(() => {
    if (currentTime >= 30) {
      setCanSkip(true);
    }
  }, [currentTime]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = (value[0] / 100) * duration;
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPhase('questions');
  };

  const handleSkip = () => {
    setPhase('questions');
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
      // Complete the node - account for the current answer
      const currentQuestion = content.questions[questionIndex];
      const isCorrect = selectedAnswer === currentQuestion.answer;
      const finalScore = isCorrect ? score + 1 : score;
      const xp = Math.round((finalScore / content.questions.length) * xpReward);
      onComplete(xp, `You got ${finalScore}/${content.questions.length} questions right!`, { correct: finalScore, total: content.questions.length });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="px-4 py-6 pb-28">
      <AnimatePresence mode="wait">
        {phase === 'listen' && (
          <motion.div
            key="listen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">🎙️</span>
              <h2 className="font-editorial text-xl font-bold mb-1">Found Tape</h2>
              <p className="text-sm text-muted-foreground italic">"{content.context}"</p>
            </div>

            {/* Audio Player */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <h3 className="font-bold mb-3">{content.title}</h3>

              {/* Progress Bar */}
              <div className="mb-3">
                <Slider
                  value={[duration ? (currentTime / duration) * 100 : 0]}
                  onValueChange={handleSeek}
                  max={100}
                  step={0.1}
                  className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handlePlayPause}
                  className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={24} className="text-primary-foreground" />
                  ) : (
                    <Play size={24} className="text-primary-foreground ml-1" />
                  )}
                </button>
              </div>

              <audio
                ref={audioRef}
                src={content.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleAudioEnded}
              />
            </div>

            {/* Transcript */}
            <div className="bg-card rounded-xl border border-border p-4 mb-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-3">
                Transcript
              </h4>
              <div
                ref={transcriptRef}
                className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide"
              >
                {content.transcript.map((line, index) => (
                  <motion.p
                    key={line.id}
                    className={`text-sm p-2 rounded transition-all ${
                      index === currentLineIndex
                        ? 'bg-primary/20 text-foreground font-medium'
                        : index < currentLineIndex
                        ? 'text-muted-foreground'
                        : 'text-muted-foreground/60'
                    }`}
                    animate={index === currentLineIndex ? { scale: 1.02 } : { scale: 1 }}
                  >
                    {line.text}
                  </motion.p>
                ))}
              </div>
            </div>

            {/* Skip Button */}
            {canSkip && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleSkip}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward size={16} />
                Skip to questions
              </motion.button>
            )}
          </motion.div>
        )}

        {phase === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((questionIndex + (showExplanation ? 1 : 0)) / content.questions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question */}
            <QuestionCard
              question={content.questions[questionIndex]}
              selectedAnswer={selectedAnswer}
              showExplanation={showExplanation}
              onSelectAnswer={handleSelectAnswer}
            />

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

// Question Card Component
interface QuestionCardProps {
  question: Question;
  selectedAnswer: number | null;
  showExplanation: boolean;
  onSelectAnswer: (index: number) => void;
}

function QuestionCard({ question, selectedAnswer, showExplanation, onSelectAnswer }: QuestionCardProps) {
  const isCorrect = selectedAnswer === question.answer;

  return (
    <div>
      <h3 className="font-bold text-lg mb-4">{question.prompt}</h3>

      <div className="space-y-2 mb-4">
        {question.choices.map((choice, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectAnswer = index === question.answer;

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
              onClick={() => onSelectAnswer(index)}
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
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={`p-4 rounded-xl ${isCorrect ? 'bg-success/10' : 'bg-muted'}`}
        >
          <p className="text-sm font-bold mb-1">{isCorrect ? '✓ Correct!' : '✗ Not quite!'}</p>
          <p className="text-sm text-muted-foreground">{question.explanation}</p>
        </motion.div>
      )}
    </div>
  );
}

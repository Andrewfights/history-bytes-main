import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CheckCircle2, X, ZoomIn } from 'lucide-react';
import { ImageExploreContent, ImageHotspot, Question } from '@/types';

interface ImageExploreNodeProps {
  content: ImageExploreContent;
  xpReward: number;
  onComplete: (xp: number, message?: string, scoreDetails?: { correct: number; total: number }) => void;
}

export function ImageExploreNode({ content, xpReward, onComplete }: ImageExploreNodeProps) {
  const [phase, setPhase] = useState<'explore' | 'questions'>('explore');
  const [discoveredHotspots, setDiscoveredHotspots] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<ImageHotspot | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const allDiscovered = discoveredHotspots.length === content.hotspots.length;

  const handleHotspotClick = (hotspot: ImageHotspot) => {
    setActiveHotspot(hotspot);
    if (!discoveredHotspots.includes(hotspot.id)) {
      setDiscoveredHotspots([...discoveredHotspots, hotspot.id]);
    }
  };

  const handleCloseHotspot = () => {
    setActiveHotspot(null);
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
      const currentQuestion = content.questions[questionIndex];
      const isCorrect = selectedAnswer === currentQuestion.answer;
      const finalScore = isCorrect ? score + 1 : score;
      const xp = Math.round((finalScore / content.questions.length) * xpReward);
      onComplete(xp, content.hostReaction, { correct: finalScore, total: content.questions.length });
    }
  };

  const getImageTypeIcon = () => {
    switch (content.imageType) {
      case 'map': return '🗺️';
      case 'document': return '📜';
      case 'propaganda': return '📯';
      default: return '📷';
    }
  };

  return (
    <div className="px-4 py-6 pb-28">
      <AnimatePresence mode="wait">
        {phase === 'explore' && (
          <motion.div
            key="explore"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-4">
              <span className="text-4xl mb-2 block">{getImageTypeIcon()}</span>
              <h2 className="font-editorial text-xl font-bold mb-1">{content.title}</h2>
              <p className="text-sm text-muted-foreground">{content.context}</p>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin size={14} className="text-primary" />
              <span className="text-sm text-muted-foreground">
                Discovered {discoveredHotspots.length} of {content.hotspots.length} points
              </span>
              {allDiscovered && (
                <CheckCircle2 size={14} className="text-success" />
              )}
            </div>

            {/* Image Container */}
            <div
              className={`relative w-full rounded-xl overflow-hidden border border-border mb-4 transition-all ${
                isZoomed ? 'aspect-auto max-h-[70vh]' : 'aspect-video'
              }`}
            >
              <img
                src={content.imageUrl}
                alt={content.title}
                className={`w-full h-full ${isZoomed ? 'object-contain' : 'object-cover'}`}
              />

              {/* Zoom Toggle */}
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute top-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <ZoomIn size={16} />
              </button>

              {/* Hotspots */}
              {content.hotspots.map((hotspot) => {
                const isDiscovered = discoveredHotspots.includes(hotspot.id);
                const isActive = activeHotspot?.id === hotspot.id;

                return (
                  <motion.button
                    key={hotspot.id}
                    onClick={() => handleHotspotClick(hotspot)}
                    className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary scale-125 z-20'
                        : isDiscovered
                        ? 'bg-success/80'
                        : 'bg-primary/80 animate-pulse'
                    }`}
                    style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isDiscovered ? (
                      <CheckCircle2 size={16} className="text-white" />
                    ) : (
                      <MapPin size={16} className="text-white" />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Active Hotspot Detail */}
            <AnimatePresence>
              {activeHotspot && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="mb-4 p-4 rounded-xl bg-card border border-border relative"
                >
                  <button
                    onClick={handleCloseHotspot}
                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                  <h3 className="font-bold text-sm mb-1 pr-8">{activeHotspot.label}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{activeHotspot.description}</p>
                  {activeHotspot.revealFact && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-primary font-medium">
                        💡 {activeHotspot.revealFact}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tap instruction */}
            {!activeHotspot && discoveredHotspots.length === 0 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground mb-4"
              >
                Tap the pulsing markers to explore
              </motion.p>
            )}

            {/* Continue Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                onClick={handleContinueToQuestions}
                disabled={!allDiscovered}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                  allDiscovered
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {allDiscovered
                  ? content.questions.length > 0
                    ? 'Continue to Questions'
                    : 'Continue'
                  : `Discover ${content.hotspots.length - discoveredHotspots.length} more points`}
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
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className={`p-4 rounded-xl ${
                    selectedAnswer === content.questions[questionIndex].answer
                      ? 'bg-success/10'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className={
                      selectedAnswer === content.questions[questionIndex].answer
                        ? 'text-success'
                        : 'text-muted-foreground'
                    } />
                    <p className="text-sm font-bold">
                      {selectedAnswer === content.questions[questionIndex].answer
                        ? 'Correct!'
                        : 'Not quite!'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {content.questions[questionIndex].explanation}
                  </p>
                </motion.div>
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

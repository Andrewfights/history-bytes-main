import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Map, CheckCircle2, XCircle, Sparkles, Globe } from 'lucide-react';
import { MapMystery } from '@/types';
import { useLiveMapMysteries } from '@/hooks/useLiveData';

interface MapMysteryGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function MapMysteryGame({ onBack, onComplete }: MapMysteryGameProps) {
  const allMysteries = useLiveMapMysteries();
  const [mysteries] = useState<MapMystery[]>(() => {
    // Get 5 random mysteries
    const shuffled = [...allMysteries].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'results'>('playing');

  const currentMystery = mysteries[currentRound];
  const totalRounds = mysteries.length;

  const handleSelect = (index: number) => {
    if (isRevealed) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null || isRevealed) return;

    const correct = selectedIndex === currentMystery.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
    }

    setIsRevealed(true);
  };

  const handleNext = () => {
    if (currentRound < totalRounds - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedIndex(null);
      setIsRevealed(false);
      setIsCorrect(false);
    } else {
      setPhase('results');
    }
  };

  const handleComplete = () => {
    // 25 base XP + 5 per correct answer
    const xp = 25 + (score * 5);
    onComplete(xp);
  };

  if (phase === 'results') {
    return (
      <div className="px-4 py-6 pb-28">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
            <Sparkles size={40} className="text-primary" />
          </div>

          <h2 className="font-editorial text-2xl font-bold mb-2">Expedition Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You identified {score} of {totalRounds} empires correctly
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-8">
            +{25 + (score * 5)} XP
          </div>

          <div className="space-y-3">
            <button
              onClick={handleComplete}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
            >
              Continue
            </button>
            <button
              onClick={onBack}
              className="w-full py-3 text-muted-foreground"
            >
              Back to Arcade
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="font-editorial text-xl font-bold">Map Mysteries</h1>
          <p className="text-sm text-muted-foreground">Identify empires by territory</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Empire {currentRound + 1} of {totalRounds}
          </span>
          <span className="text-xs text-muted-foreground">
            Score: {score}/{currentRound + (isRevealed ? 1 : 0)}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((currentRound + (isRevealed ? 1 : 0)) / totalRounds) * 100}%` }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMystery.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* Map Display */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Globe size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                {isRevealed ? `Peak: ${currentMystery.peakYear}` : 'Which empire is this?'}
              </span>
            </div>

            {/* Territory Shape */}
            <div className="relative aspect-video bg-muted/50 rounded-lg overflow-hidden mb-4">
              <svg
                viewBox="0 0 300 200"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                <motion.path
                  d={currentMystery.svgPath}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                  fill={isRevealed ? (isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)') : 'rgb(var(--primary))'}
                  fillOpacity={0.3}
                  stroke={isRevealed ? (isCorrect ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)') : 'rgb(var(--primary))'}
                  strokeWidth="2"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Map size={32} className="text-primary/30" />
              </div>
            </div>

            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="font-bold text-lg mb-1">{currentMystery.empireName}</p>
                <p className="text-xs text-muted-foreground">{currentMystery.modernRegion}</p>
              </motion.div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {currentMystery.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrectAnswer = index === currentMystery.correctIndex;

              let cardStyle = 'bg-card border-border hover:border-primary/50';
              if (isRevealed) {
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
                  onClick={() => handleSelect(index)}
                  disabled={isRevealed}
                  className={`w-full p-3 rounded-xl border transition-all text-left ${cardStyle}`}
                  whileTap={!isRevealed ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                      isRevealed
                        ? isCorrectAnswer
                          ? 'bg-success/20 text-success'
                          : isSelected
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-muted text-muted-foreground'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isRevealed ? (
                        isCorrectAnswer ? <CheckCircle2 size={16} /> : isSelected ? <XCircle size={16} /> : String.fromCharCode(65 + index)
                      ) : (
                        String.fromCharCode(65 + index)
                      )}
                    </div>
                    <span className="text-sm font-medium">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Fun Fact */}
          <AnimatePresence>
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className={`p-4 rounded-xl ${isCorrect ? 'bg-success/10 border border-success/30' : 'bg-muted'}`}>
                  <div className="flex items-start gap-2 mb-2">
                    {isCorrect ? (
                      <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                    ) : (
                      <Map size={18} className="text-primary shrink-0 mt-0.5" />
                    )}
                    <span className="font-bold text-sm">
                      {isCorrect ? 'Excellent geography!' : 'Not quite!'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentMystery.funFact}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      {/* Action Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        {!isRevealed ? (
          <motion.button
            onClick={handleSubmit}
            disabled={selectedIndex === null}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedIndex !== null
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {selectedIndex !== null ? 'Submit Answer' : 'Select an Empire'}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
          >
            {currentRound < totalRounds - 1 ? 'Next Territory' : 'See Results'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

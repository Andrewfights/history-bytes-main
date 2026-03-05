import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AnachronismScene } from '@/types';
import { useLiveAnachronismScenes } from '@/hooks/useLiveData';

interface AnachronismGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function AnachronismGame({ onBack, onComplete }: AnachronismGameProps) {
  const allScenes = useLiveAnachronismScenes();
  const [scenes] = useState<AnachronismScene[]>(() => {
    // Get 5 random scenes
    const shuffled = [...allScenes].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'results'>('playing');

  const currentScene = scenes[currentRound];
  const totalRounds = scenes.length;

  const handleSelect = (detailId: string) => {
    if (isRevealed) return;
    setSelectedId(detailId);
  };

  const handleSubmit = () => {
    if (!selectedId || isRevealed) return;

    const selectedDetail = currentScene.details.find(d => d.id === selectedId);
    const correct = selectedDetail?.isAnachronism ?? false;

    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
    }
    setIsRevealed(true);
  };

  const handleNext = () => {
    if (currentRound < totalRounds - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedId(null);
      setIsRevealed(false);
      setIsCorrect(false);
    } else {
      setPhase('results');
    }
  };

  const handleComplete = () => {
    const xp = 20 + (score * 2);
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
            <Search size={40} className="text-primary" />
          </div>

          <h2 className="font-editorial text-2xl font-bold mb-2">Detective Complete!</h2>
          <p className="text-muted-foreground mb-6">You spotted {score} of {totalRounds} anachronisms</p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-8">
            +{20 + (score * 2)} XP
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
          <h1 className="font-editorial text-xl font-bold">Spot the Anachronism</h1>
          <p className="text-sm text-muted-foreground">Find what doesn't belong</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Scene {currentRound + 1} of {totalRounds}
          </span>
          <span className="text-xs text-muted-foreground">
            Score: {score}/{currentRound + (isRevealed ? 1 : 0)}
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${((currentRound + (isRevealed ? 1 : 0)) / totalRounds) * 100}%` }}
          />
        </div>
      </div>

      {/* Scene Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScene.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="mb-6"
        >
          {/* Scene Header */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                {currentScene.era} • {currentScene.year}
              </span>
            </div>
            <p className="text-sm italic text-muted-foreground">{currentScene.setting}</p>
          </div>

          {/* Details to Choose From */}
          <div className="space-y-2">
            {currentScene.details.map((detail) => {
              const isSelected = selectedId === detail.id;
              const isTheAnachronism = detail.isAnachronism;

              let cardStyle = 'bg-card border-border hover:border-primary/50';
              if (isRevealed) {
                if (isTheAnachronism) {
                  cardStyle = 'bg-destructive/10 border-destructive';
                } else if (isSelected && !isTheAnachronism) {
                  cardStyle = 'bg-muted border-muted-foreground/30';
                } else {
                  cardStyle = 'bg-success/10 border-success/30';
                }
              } else if (isSelected) {
                cardStyle = 'bg-primary/10 border-primary';
              }

              return (
                <motion.button
                  key={detail.id}
                  onClick={() => handleSelect(detail.id)}
                  disabled={isRevealed}
                  className={`w-full p-4 rounded-xl border transition-all text-left ${cardStyle}`}
                  whileTap={!isRevealed ? { scale: 0.99 } : {}}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${
                      isRevealed
                        ? isTheAnachronism
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-success/20 text-success'
                        : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {isRevealed ? (
                        isTheAnachronism ? <XCircle size={18} /> : <CheckCircle2 size={18} />
                      ) : (
                        detail.id.toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{detail.text}</p>
                      {isRevealed && isTheAnachronism && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-destructive/20 text-destructive"
                        >
                          ANACHRONISM
                        </motion.span>
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Explanation */}
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
                  <Search size={18} className="text-primary shrink-0 mt-0.5" />
                )}
                <span className="font-bold text-sm">
                  {isCorrect ? 'Sharp eye!' : 'Not quite!'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{currentScene.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        {!isRevealed ? (
          <motion.button
            onClick={handleSubmit}
            disabled={!selectedId}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedId
                ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            {selectedId ? 'This Doesn\'t Belong!' : 'Select the Anachronism'}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
          >
            {currentRound < totalRounds - 1 ? 'Next Scene' : 'See Results'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

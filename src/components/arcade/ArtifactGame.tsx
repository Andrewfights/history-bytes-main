import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { ArtifactCase } from '@/types';
import { useLiveArtifactCases } from '@/hooks/useLiveData';

interface ArtifactGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function ArtifactGame({ onBack, onComplete }: ArtifactGameProps) {
  const allCases = useLiveArtifactCases();
  const [cases] = useState<ArtifactCase[]>(() => {
    // Get 5 random cases
    const shuffled = [...allCases].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [revealedClues, setRevealedClues] = useState(1);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [phase, setPhase] = useState<'playing' | 'results'>('playing');

  const currentCase = cases[currentRound];
  const totalRounds = cases.length;

  const getClueXP = (clueCount: number) => {
    switch (clueCount) {
      case 1: return 40;
      case 2: return 30;
      case 3: return 20;
      case 4: return 10;
      default: return 10;
    }
  };

  const handleRevealClue = () => {
    if (revealedClues < 4) {
      setRevealedClues(revealedClues + 1);
    }
  };

  const handleSelect = (index: number) => {
    if (isRevealed) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null || isRevealed) return;

    const correct = selectedIndex === currentCase.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      const xpEarned = getClueXP(revealedClues);
      setTotalXP(totalXP + xpEarned);
    }

    setIsRevealed(true);
  };

  const handleNext = () => {
    if (currentRound < totalRounds - 1) {
      setCurrentRound(currentRound + 1);
      setRevealedClues(1);
      setSelectedIndex(null);
      setIsRevealed(false);
      setIsCorrect(false);
    } else {
      setPhase('results');
    }
  };

  const handleComplete = () => {
    onComplete(totalXP);
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

          <h2 className="font-editorial text-2xl font-bold mb-2">Investigation Complete!</h2>
          <p className="text-muted-foreground mb-6">You identified {totalRounds} artifacts</p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-8">
            +{totalXP} XP
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
          <h1 className="font-editorial text-xl font-bold">Artifact Detective</h1>
          <p className="text-sm text-muted-foreground">Fewer clues = more points!</p>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Case {currentRound + 1} of {totalRounds}
          </span>
          <span className="text-xs text-primary font-bold">
            {totalXP} XP earned
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
          key={currentCase.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* Clue Card */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                Clues Revealed: {revealedClues}/4
              </span>
              <span className={`text-xs font-bold ${
                revealedClues === 1 ? 'text-green-400' :
                revealedClues === 2 ? 'text-yellow-400' :
                revealedClues === 3 ? 'text-orange-400' : 'text-red-400'
              }`}>
                Worth: {getClueXP(revealedClues)} XP
              </span>
            </div>

            {/* Clues */}
            <div className="space-y-3">
              {currentCase.clues.map((clue, index) => {
                const isVisible = index < revealedClues;
                return (
                  <motion.div
                    key={index}
                    initial={isVisible ? { opacity: 0, y: 10 } : {}}
                    animate={isVisible ? { opacity: 1, y: 0 } : {}}
                    className={`p-3 rounded-lg ${
                      isVisible ? 'bg-muted' : 'bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isVisible ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground/20 text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <p className={`text-sm flex-1 ${
                        isVisible ? 'text-foreground' : 'text-muted-foreground/50'
                      }`}>
                        {isVisible ? clue : '??? Reveal to see this clue ???'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Reveal Button */}
            {!isRevealed && revealedClues < 4 && (
              <button
                onClick={handleRevealClue}
                className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <Eye size={16} />
                Reveal Next Clue (-{getClueXP(revealedClues) - getClueXP(revealedClues + 1)} XP)
              </button>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {currentCase.options.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrectAnswer = index === currentCase.correctIndex;

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

          {/* Reveal Text */}
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
                      <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                    )}
                    <span className="font-bold text-sm">
                      {isCorrect ? `+${getClueXP(revealedClues)} XP! ${currentCase.name}` : `It was: ${currentCase.name}`}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentCase.revealText}</p>
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
            {selectedIndex !== null ? 'Submit Answer' : 'Select an Artifact'}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
          >
            {currentRound < totalRounds - 1 ? 'Next Artifact' : 'See Results'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

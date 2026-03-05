import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Zap, CheckCircle2, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { CauseEffectPair } from '@/types';
import { useLiveCauseEffectPairs } from '@/hooks/useLiveData';

interface CauseEffectGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

export function CauseEffectGame({ onBack, onComplete }: CauseEffectGameProps) {
  const allPairs = useLiveCauseEffectPairs();
  const [pairs] = useState<CauseEffectPair[]>(() => {
    // Get 6 random pairs
    const shuffled = [...allPairs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [phase, setPhase] = useState<'playing' | 'results'>('playing');

  const currentPair = pairs[currentRound];
  const totalRounds = pairs.length;

  // Shuffle options for current round
  const shuffledOptions = useMemo(() => {
    const options = [currentPair.correctAnswer, ...currentPair.wrongAnswers];
    return options.sort(() => Math.random() - 0.5);
  }, [currentPair]);

  const correctOptionIndex = shuffledOptions.indexOf(currentPair.correctAnswer);

  const handleSelect = (index: number) => {
    if (isRevealed) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null || isRevealed) return;

    const correct = selectedIndex === correctOptionIndex;
    setIsCorrect(correct);

    if (correct) {
      setScore(score + 1);
      setStreak(streak + 1);
    } else {
      setStreak(0);
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
    // Base 20 XP + 5 per correct + streak bonus
    const xp = 20 + (score * 5);
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

          <h2 className="font-editorial text-2xl font-bold mb-2">Chain Complete!</h2>
          <p className="text-muted-foreground mb-6">
            You connected {score} of {totalRounds} cause-effect pairs
          </p>

          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-8">
            +{20 + (score * 5)} XP
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
          <h1 className="font-editorial text-xl font-bold">Cause & Effect</h1>
          <p className="text-sm text-muted-foreground">Connect historical events</p>
        </div>
        {streak >= 2 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold"
          >
            🔥 {streak} Streak
          </motion.div>
        )}
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Round {currentRound + 1} of {totalRounds}
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
          key={currentPair.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {/* Prompt Card */}
          <div className="bg-card rounded-xl border border-border p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                currentPair.type === 'cause-to-effect'
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}>
                {currentPair.type === 'cause-to-effect' ? 'Cause → Effect' : 'Effect → Cause'}
              </div>
              <span className="text-xs text-muted-foreground">{currentPair.era}</span>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                currentPair.type === 'cause-to-effect'
                  ? 'bg-blue-500/20'
                  : 'bg-purple-500/20'
              }`}>
                <Zap size={20} className={
                  currentPair.type === 'cause-to-effect'
                    ? 'text-blue-400'
                    : 'text-purple-400'
                } />
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                  {currentPair.type === 'cause-to-effect' ? 'The Cause' : 'The Effect'}
                </p>
                <p className="text-sm font-medium">{currentPair.prompt}</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
              <ArrowRight size={16} className="text-primary" />
              <span className="text-xs font-bold uppercase text-primary tracking-wider">
                What was the {currentPair.type === 'cause-to-effect' ? 'effect' : 'cause'}?
              </span>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-2 mb-4">
            {shuffledOptions.map((option, index) => {
              const isSelected = selectedIndex === index;
              const isCorrectAnswer = index === correctOptionIndex;

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
                  className={`w-full p-4 rounded-xl border transition-all text-left ${cardStyle}`}
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
                    <span className="text-sm">{option}</span>
                  </div>
                </motion.button>
              );
            })}
          </div>

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
                      <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                    )}
                    <span className="font-bold text-sm">
                      {isCorrect ? 'Correct connection!' : 'Not quite!'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{currentPair.explanation}</p>
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
            {selectedIndex !== null ? 'Submit Answer' : 'Select an Answer'}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg"
          >
            {currentRound < totalRounds - 1 ? 'Next Round' : 'See Results'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

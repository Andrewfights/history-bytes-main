import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { TwoTruthsQuestions, getRandomTwoTruthsQuestion } from '@/data/journeyData';
import { TwoTruthsQuestion } from '@/types';

interface TwoTruthsGameProps {
  onBack: () => void;
  onComplete: (xp: number) => void;
}

const ROUNDS_PER_GAME = 5;
const XP_PER_CORRECT = 15;

export function TwoTruthsGame({ onBack, onComplete }: TwoTruthsGameProps) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<TwoTruthsQuestion>(() => {
    const q = getRandomTwoTruthsQuestion([]);
    return q!;
  });

  const handleSelect = (index: number) => {
    if (isRevealed) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    const isCorrect = selectedIndex === currentQuestion.lieIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
    } else {
      setStreak(0);
    }
    setIsRevealed(true);
  };

  const handleNext = () => {
    const nextRound = round + 1;
    if (nextRound >= ROUNDS_PER_GAME) {
      // Calculate XP: base + streak bonus
      const baseXP = score * XP_PER_CORRECT;
      const streakBonus = streak >= 3 ? Math.floor(baseXP * 0.25) : 0;
      onComplete(baseXP + streakBonus);
    } else {
      // Get next question
      const newUsed = [...usedQuestions, currentQuestion.id];
      setUsedQuestions(newUsed);
      const nextQ = getRandomTwoTruthsQuestion(newUsed);
      if (nextQ) {
        setCurrentQuestion(nextQ);
      }
      setRound(nextRound);
      setSelectedIndex(null);
      setIsRevealed(false);
    }
  };

  const isCorrect = selectedIndex === currentQuestion.lieIndex;

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ChevronLeft size={16} />
        <span>Arcade</span>
      </button>

      <div className="text-center mb-6">
        <span className="text-4xl mb-2 block">2+1</span>
        <h1 className="font-editorial text-2xl font-bold mb-1">Two Truths & a Lie</h1>
        <p className="text-sm text-muted-foreground">Find the FALSE statement</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
            Round {round + 1} of {ROUNDS_PER_GAME}
          </span>
          <div className="flex items-center gap-3">
            {streak >= 2 && (
              <span className="text-xs font-bold text-primary">
                {streak} streak!
              </span>
            )}
            <span className="text-xs text-muted-foreground">
              Score: {score}/{round + (isRevealed ? 1 : 0)}
            </span>
          </div>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            animate={{ width: `${((round + (isRevealed ? 1 : 0)) / ROUNDS_PER_GAME) * 100}%` }}
          />
        </div>
      </div>

      {/* Category Tag */}
      <div className="mb-4">
        <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded">
          {currentQuestion.category}
        </span>
      </div>

      {/* Statements */}
      <div className="space-y-3 mb-6">
        {currentQuestion.statements.map((statement, index) => {
          const isSelected = selectedIndex === index;
          const isTheLie = index === currentQuestion.lieIndex;
          const showResult = isRevealed;

          let cardStyle = 'bg-card border-border hover:border-primary/50';
          if (isSelected && !showResult) {
            cardStyle = 'bg-primary/10 border-primary';
          } else if (showResult) {
            if (isTheLie) {
              cardStyle = 'bg-destructive/10 border-destructive';
            } else {
              cardStyle = 'bg-success/10 border-success';
            }
          }

          return (
            <motion.button
              key={index}
              onClick={() => handleSelect(index)}
              disabled={isRevealed}
              className={`w-full p-4 rounded-xl border transition-all text-left ${cardStyle}`}
              whileHover={!isRevealed ? { scale: 1.01 } : {}}
              whileTap={!isRevealed ? { scale: 0.99 } : {}}
            >
              <div className="flex items-start gap-3">
                {/* Letter Badge */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold ${
                  showResult
                    ? isTheLie
                      ? 'bg-destructive/20 text-destructive'
                      : 'bg-success/20 text-success'
                    : isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {showResult ? (
                    isTheLie ? <XCircle size={18} /> : <CheckCircle2 size={18} />
                  ) : (
                    String.fromCharCode(65 + index)
                  )}
                </div>

                {/* Statement */}
                <div className="flex-1">
                  <p className="text-sm">{statement}</p>
                  {showResult && isTheLie && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-destructive/20 text-destructive"
                    >
                      THE LIE
                    </motion.span>
                  )}
                </div>
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
            <div className={`p-4 rounded-xl ${
              isCorrect ? 'bg-success/10 border border-success/30' : 'bg-muted'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                ) : (
                  <Lightbulb size={18} className="text-primary shrink-0 mt-0.5" />
                )}
                <span className="font-bold text-sm">
                  {isCorrect ? 'Correct!' : 'Not quite!'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
            </div>
          </motion.div>
        )}
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
            whileTap={selectedIndex !== null ? { scale: 0.98 } : {}}
          >
            {selectedIndex !== null ? 'Submit Answer' : 'Select the Lie'}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleNext}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            {round + 1 >= ROUNDS_PER_GAME ? 'Finish Game' : 'Next Round'}
          </motion.button>
        )}
      </div>
    </div>
  );
}

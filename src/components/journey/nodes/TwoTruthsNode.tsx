import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { TwoTruthsContent } from '@/types';

interface TwoTruthsNodeProps {
  content: TwoTruthsContent;
  xpReward: number;
  onComplete: (xp: number, message?: string) => void;
}

export function TwoTruthsNode({ content, xpReward, onComplete }: TwoTruthsNodeProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (index: number) => {
    if (isRevealed) return;
    setSelectedIndex(index);
  };

  const handleSubmit = () => {
    if (selectedIndex === null) return;
    const correct = selectedIndex === content.lieIndex;
    setIsCorrect(correct);
    setIsRevealed(true);
  };

  const handleContinue = () => {
    const xp = isCorrect ? xpReward : Math.floor(xpReward * 0.5);
    onComplete(xp, content.hostReaction, { correct: isCorrect ? 1 : 0, total: 1 });
  };

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-4xl mb-2 block">🤔</span>
        <h2 className="font-editorial text-xl font-bold mb-1">Two Truths & a Lie</h2>
        <p className="text-sm text-muted-foreground">
          Which statement is <span className="text-destructive font-semibold">FALSE</span>?
        </p>
      </div>

      {/* Statements */}
      <div className="space-y-3 mb-6">
        {content.statements.map((statement, index) => {
          const isSelected = selectedIndex === index;
          const isTheLie = index === content.lieIndex;
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
              <p className="text-sm text-muted-foreground">{content.explanation}</p>
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
            onClick={handleContinue}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}

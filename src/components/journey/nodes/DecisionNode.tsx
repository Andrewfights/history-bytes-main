import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, CheckCircle2, History } from 'lucide-react';
import { DecisionContent } from '@/types';

interface DecisionNodeProps {
  content: DecisionContent;
  xpReward: number;
  onComplete: (xp: number, message?: string) => void;
}

export function DecisionNode({ content, xpReward, onComplete }: DecisionNodeProps) {
  const [phase, setPhase] = useState<'context' | 'choice' | 'outcome'>('context');
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | null>(null);

  const handleStartChoice = () => {
    setPhase('choice');
  };

  const handleSelectOption = (option: 'A' | 'B') => {
    setSelectedOption(option);
    setPhase('outcome');
  };

  const handleComplete = () => {
    const chosenOption = selectedOption === 'A' ? content.optionA : content.optionB;
    const xp = chosenOption.isHistorical ? xpReward : Math.floor(xpReward * 0.7);
    onComplete(xp, content.hostReaction, { correct: chosenOption.isHistorical ? 1 : 0, total: 1 });
  };

  const chosenOption = selectedOption === 'A' ? content.optionA : content.optionB;

  return (
    <div className="px-4 py-6 pb-28">
      <AnimatePresence mode="wait">
        {phase === 'context' && (
          <motion.div
            key="context"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-4xl mb-2 block">⚖️</span>
              <h2 className="font-editorial text-xl font-bold mb-1">Historical Decision</h2>
              <p className="text-sm text-muted-foreground">What would you do?</p>
            </div>

            {/* Context Card */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <p className="text-sm italic text-muted-foreground mb-4">{content.context}</p>
              <p className="text-base leading-relaxed">{content.scenario}</p>
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                onClick={handleStartChoice}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
              >
                Make Your Decision
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'choice' && (
          <motion.div
            key="choice"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <Scale size={32} className="mx-auto mb-2 text-primary" />
              <h2 className="font-editorial text-xl font-bold">Choose Your Path</h2>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <motion.button
                onClick={() => handleSelectOption('A')}
                className="w-full p-5 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center font-bold text-blue-500 shrink-0">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{content.optionA.label}</h3>
                  </div>
                </div>
              </motion.button>

              <div className="text-center text-sm text-muted-foreground font-bold">OR</div>

              <motion.button
                onClick={() => handleSelectOption('B')}
                className="w-full p-5 rounded-xl border-2 border-border bg-card hover:border-primary/50 transition-all text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center font-bold text-orange-500 shrink-0">
                    B
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{content.optionB.label}</h3>
                  </div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'outcome' && chosenOption && (
          <motion.div
            key="outcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  chosenOption.isHistorical ? 'bg-success/20' : 'bg-muted'
                }`}
              >
                {chosenOption.isHistorical ? (
                  <CheckCircle2 size={32} className="text-success" />
                ) : (
                  <History size={32} className="text-muted-foreground" />
                )}
              </motion.div>
              <h2 className="font-editorial text-xl font-bold mb-1">
                {chosenOption.isHistorical ? 'You Chose History!' : 'An Alternate Path'}
              </h2>
            </div>

            {/* Your Choice */}
            <div className={`p-4 rounded-xl mb-4 ${
              chosenOption.isHistorical ? 'bg-success/10 border border-success/30' : 'bg-muted'
            }`}>
              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Your Choice</p>
              <p className="font-bold mb-2">{chosenOption.label}</p>
              <p className="text-sm text-muted-foreground">{chosenOption.outcome}</p>
            </div>

            {/* Historical Outcome */}
            <div className="p-4 rounded-xl bg-card border border-border">
              <div className="flex items-center gap-2 mb-2">
                <History size={16} className="text-primary" />
                <p className="text-xs font-bold uppercase text-muted-foreground">What Actually Happened</p>
              </div>
              <p className="text-sm">{content.historicalOutcome}</p>
            </div>

            {/* Continue Button */}
            <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleComplete}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

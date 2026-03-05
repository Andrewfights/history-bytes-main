import { motion, AnimatePresence } from 'framer-motion';
import { Flame, AlertTriangle } from 'lucide-react';

interface StreakRecoveryModalProps {
  isOpen: boolean;
  lostStreak: number;
  onRecoveryChallenge: () => void;
  onAcceptLoss: () => void;
}

export function StreakRecoveryModal({ isOpen, lostStreak, onRecoveryChallenge, onAcceptLoss }: StreakRecoveryModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl p-8 text-center"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-destructive" />
            </div>

            <h2 className="font-editorial text-xl font-bold">Oh no!</h2>
            <p className="text-muted-foreground mt-2">
              Your streak broke! You had a <span className="text-foreground font-bold">{lostStreak}-day</span> streak.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              Complete a recovery challenge to restore it!
            </p>

            <div className="space-y-3 mt-6">
              <button
                onClick={onRecoveryChallenge}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-95"
              >
                <Flame size={16} />
                Recovery Challenge
              </button>
              <button
                onClick={onAcceptLoss}
                className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm transition-all hover:text-foreground"
              >
                Accept Loss
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

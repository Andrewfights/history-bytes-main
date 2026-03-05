import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Play, RotateCcw, Sparkles, X } from 'lucide-react';
import { RandomResult } from '@/lib/randomizer';

interface LuckyResultModalProps {
  isOpen: boolean;
  result: RandomResult | null;
  onStartChallenge: () => void;
  onReroll: () => void;
  onClose: () => void;
  isRerolling?: boolean;
}

const nodeTypeEmojis: Record<string, string> = {
  'two-truths': '🎭',
  'found-tape': '📜',
  'headlines': '📰',
  'quiz-mix': '❓',
  'decision': '⚖️',
  'boss': '👑',
};

const nodeTypeLabels: Record<string, string> = {
  'two-truths': 'Two Truths & A Lie',
  'found-tape': 'Found Tape',
  'headlines': 'Headlines',
  'quiz-mix': 'Quiz Mix',
  'decision': 'Decision Point',
  'boss': 'Boss Challenge',
};

export function LuckyResultModal({
  isOpen,
  result,
  onStartChallenge,
  onReroll,
  onClose,
  isRerolling = false,
}: LuckyResultModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  if (!result) return null;

  const emoji = nodeTypeEmojis[result.node.type] || '🎲';
  const typeLabel = nodeTypeLabels[result.node.type] || result.node.type;

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
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.7, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden relative"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X size={20} className="text-muted-foreground" />
            </button>

            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-6 pb-8 relative">
              {/* Sparkles animation */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute top-4 left-8"
              >
                <Sparkles size={16} className="text-primary/60" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute top-8 right-16"
              >
                <Sparkles size={12} className="text-primary/40" />
              </motion.div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Dices size={16} className="text-primary" />
                <span>Your Lucky Pick</span>
              </div>

              {/* Arc Icon & Title */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="text-4xl">{result.arc.icon}</div>
                <div>
                  <h2 className="font-editorial text-lg font-bold text-foreground">
                    {result.arc.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">{result.chapter.title}</p>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-6 pt-4">
              {/* Node Info */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-muted/50 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-xl">
                    {emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{result.node.title}</h3>
                    <p className="text-xs text-muted-foreground">{typeLabel}</p>
                  </div>
                </div>

                {/* XP Preview */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Potential XP</span>
                  <span className="font-bold text-primary">+{result.node.xpReward} XP</span>
                </div>
              </motion.div>

              {/* Boss badge */}
              {result.node.type === 'boss' && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 mb-4 flex items-center gap-2"
                >
                  <span className="text-lg">👑</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-500">Boss Challenge!</p>
                    <p className="text-xs text-muted-foreground">Extra XP multiplier active</p>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <button
                  onClick={onStartChallenge}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  <Play size={18} />
                  Start Challenge
                </button>

                <button
                  onClick={onReroll}
                  disabled={isRerolling}
                  className="w-full py-3 rounded-xl border border-border text-muted-foreground font-medium text-sm flex items-center justify-center gap-2 transition-all hover:text-foreground hover:border-foreground/30 disabled:opacity-50"
                >
                  <RotateCcw size={16} className={isRerolling ? 'animate-spin' : ''} />
                  {isRerolling ? 'Rerolling...' : 'Try Again'}
                </button>
              </motion.div>
            </div>

            {/* Confetti overlay */}
            <AnimatePresence>
              {showConfetti && <ConfettiOverlay />}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ConfettiOverlay() {
  const particles = Array.from({ length: 20 }, (_, i) => i);
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => {
        const startX = Math.random() * 100;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 6;
        const delay = Math.random() * 0.3;

        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: `${startX}%`, opacity: 1, rotate: 0 }}
            animate={{
              y: '120%',
              x: `${startX + (Math.random() - 0.5) * 30}%`,
              opacity: [1, 1, 0],
              rotate: Math.random() * 360,
            }}
            transition={{
              duration: 1.5 + Math.random(),
              delay,
              ease: 'easeOut',
            }}
            className="absolute rounded-sm"
            style={{
              backgroundColor: color,
              width: size,
              height: size,
            }}
          />
        );
      })}
    </div>
  );
}

export default LuckyResultModal;

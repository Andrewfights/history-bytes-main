import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Share2 } from 'lucide-react';

interface XPModalProps {
  isOpen: boolean;
  xpEarned: number;
  nodeName: string;
  onContinue: () => void;
  onShare?: () => void;
}

export function XPModal({ isOpen, xpEarned, nodeName, onContinue, onShare }: XPModalProps) {
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
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4"
            >
              <Trophy size={32} className="text-primary" />
            </motion.div>

            <h2 className="font-editorial text-xl font-bold">Level Complete</h2>

            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="text-3xl font-bold text-gradient-gold mt-2"
            >
              +{xpEarned} XP
            </motion.p>

            <p className="text-muted-foreground text-sm mt-2">{nodeName} mastered!</p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={onContinue}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm transition-all hover:opacity-90 active:scale-95"
              >
                Continue
              </button>
              {onShare && (
                <button
                  onClick={onShare}
                  className="py-3 px-4 rounded-xl border border-border bg-card font-bold text-sm flex items-center gap-2 transition-all hover:border-primary/50 active:scale-95"
                >
                  <Share2 size={16} />
                  Share
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

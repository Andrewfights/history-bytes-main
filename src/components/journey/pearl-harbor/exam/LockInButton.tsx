/**
 * LockInButton - HQ-style answer confirmation button
 * Features:
 * - Disabled until user has made a selection
 * - Scale + glow animation on press
 * - Shows "LOCKED IN" state after confirmation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Check } from 'lucide-react';

interface LockInButtonProps {
  hasSelection: boolean;
  isLockedIn: boolean;
  onLockIn: () => void;
  disabled?: boolean;
}

export function LockInButton({
  hasSelection,
  isLockedIn,
  onLockIn,
  disabled = false,
}: LockInButtonProps) {
  const canLockIn = hasSelection && !isLockedIn && !disabled;

  return (
    <div className="flex flex-col items-center gap-2">
      <AnimatePresence mode="wait">
        {isLockedIn ? (
          <motion.div
            key="locked"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-2 px-8 py-4 bg-green-500/20 border-2 border-green-500 rounded-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <Check className="w-6 h-6 text-green-400" />
            </motion.div>
            <span className="text-green-400 font-bold text-lg">LOCKED IN</span>
          </motion.div>
        ) : (
          <motion.button
            key="lock-in"
            onClick={onLockIn}
            disabled={!canLockIn}
            initial={{ scale: 1 }}
            whileHover={canLockIn ? { scale: 1.02 } : {}}
            whileTap={canLockIn ? { scale: 0.98 } : {}}
            className={`
              flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg
              transition-all duration-200
              ${canLockIn
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
              }
            `}
          >
            <Lock className={`w-5 h-5 ${canLockIn ? 'text-black' : 'text-white/30'}`} />
            <span>LOCK IN ANSWER</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Helper text */}
      {!hasSelection && !isLockedIn && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/40 text-sm"
        >
          Select an answer to lock in
        </motion.p>
      )}
    </div>
  );
}

/**
 * Compact lock-in indicator for tight layouts
 */
export function LockInIndicator({ isLockedIn }: { isLockedIn: boolean }) {
  if (!isLockedIn) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 border border-green-500/50 rounded-full"
    >
      <Check className="w-3 h-3 text-green-400" />
      <span className="text-green-400 text-xs font-medium">Locked</span>
    </motion.div>
  );
}

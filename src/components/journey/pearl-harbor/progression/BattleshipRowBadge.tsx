/**
 * BattleshipRowBadge - Master achievement for completing all Pearl Harbor activities
 */

import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';

interface BattleshipRowBadgeProps {
  isUnlocked: boolean;
  progress: number;
}

export function BattleshipRowBadge({ isUnlocked, progress }: BattleshipRowBadgeProps) {
  if (isUnlocked) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/30 border border-amber-500/50 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
        >
          <Trophy size={40} className="text-white" />
        </motion.div>
        <h3 className="text-xl font-bold text-amber-400 mb-1">Battleship Row Master</h3>
        <p className="text-white/60 text-sm">
          You have completed all Pearl Harbor activities!
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium">
          <Trophy size={16} />
          +100 XP Bonus Claimed
        </div>
      </motion.div>
    );
  }

  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
        <Lock size={32} className="text-white/30" />
      </div>
      <h3 className="text-xl font-bold text-white/40 mb-1">Battleship Row Master</h3>
      <p className="text-white/30 text-sm mb-4">
        Complete all activities to earn this badge
      </p>

      {/* Progress bar */}
      <div className="max-w-xs mx-auto">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500/50 to-amber-600/50 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-white/40 text-xs mt-2">{progress}% complete</p>
      </div>
    </div>
  );
}

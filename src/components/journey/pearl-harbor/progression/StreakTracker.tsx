/**
 * StreakTracker - Display current streak and XP bonus
 */

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakTrackerProps {
  currentStreak: number;
  streakBonus: number;
}

export function StreakTracker({ currentStreak, streakBonus }: StreakTrackerProps) {
  if (currentStreak === 0) {
    return (
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
              <Flame size={20} className="text-white/40" />
            </div>
            <div>
              <p className="text-white/60 text-sm">Start your streak!</p>
              <p className="text-white/40 text-xs">Complete an activity today</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-orange-500/30 flex items-center justify-center"
          >
            <Flame size={24} className="text-orange-400 fill-orange-400" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">{currentStreak}</span>
              <span className="text-white/60">day streak</span>
            </div>
            <p className="text-orange-400 text-sm font-medium">
              +{streakBonus}% XP bonus active!
            </p>
          </div>
        </div>

        {/* Streak dots */}
        <div className="flex gap-1">
          {Array.from({ length: Math.min(currentStreak, 7) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="w-2 h-2 rounded-full bg-orange-400"
            />
          ))}
          {currentStreak > 7 && (
            <span className="text-orange-400 text-xs font-bold">+{currentStreak - 7}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

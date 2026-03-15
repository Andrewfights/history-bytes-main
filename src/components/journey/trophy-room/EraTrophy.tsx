/**
 * EraTrophy - Individual era trophy card
 * Shows completion status, stats, and trophy for each historical era
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Clock, BookOpen } from 'lucide-react';
import { Arc } from '@/types';
import { TrophyCase } from './TrophyCase';
import { EraProgress } from './hooks/useTrophyProgress';

interface EraTrophyProps {
  progress: EraProgress;
  onClick?: () => void;
  delay?: number;
}

export function EraTrophy({ progress, onClick, delay = 0 }: EraTrophyProps) {
  const { arc, isCompleted, chaptersCompleted, totalChapters, progressPercentage, xpEarned } = progress;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`relative w-full p-4 rounded-2xl border-2 text-left transition-all ${
        isCompleted
          ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/30 hover:border-amber-500/50'
          : 'bg-card/50 border-border hover:border-primary/30 hover:bg-card/70'
      }`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center gap-4">
        {/* Trophy */}
        <TrophyCase isCompleted={isCompleted} icon={arc.badge} size="sm" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{arc.icon}</span>
            <h3 className={`font-editorial font-bold truncate ${
              isCompleted ? 'text-amber-100' : 'text-foreground'
            }`}>
              {arc.title}
            </h3>
          </div>

          {isCompleted ? (
            // Completed stats
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 size={14} />
                <span>Completed</span>
              </span>
              <span className="text-amber-400 font-bold">+{arc.totalXP} XP</span>
            </div>
          ) : (
            // Progress stats
            <div className="mt-2">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen size={12} />
                  <span>{chaptersCompleted}/{totalChapters} chapters</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{progressPercentage}% complete</span>
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ delay: delay + 0.2, duration: 0.5 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* XP Badge (for incomplete) */}
        {!isCompleted && (
          <div className="shrink-0 px-2 py-1 rounded-lg bg-primary/10 text-primary text-xs font-medium">
            {arc.totalXP} XP
          </div>
        )}
      </div>

      {/* Completed glow effect */}
      {isCompleted && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 pointer-events-none" />
      )}
    </motion.button>
  );
}

// Compact version for grid display
interface EraTrophyCompactProps {
  progress: EraProgress;
  onClick?: () => void;
  delay?: number;
}

export function EraTrophyCompact({ progress, onClick, delay = 0 }: EraTrophyCompactProps) {
  const { arc, isCompleted, progressPercentage } = progress;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={onClick}
      className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
        isCompleted
          ? 'bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30'
          : 'bg-card/30 border-border/50 hover:border-primary/30'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <TrophyCase isCompleted={isCompleted} icon={arc.badge} size="md" />

      <div className="mt-3 text-center">
        <span className="text-lg">{arc.icon}</span>
        <h4 className={`text-sm font-bold mt-1 line-clamp-1 ${
          isCompleted ? 'text-amber-100' : 'text-foreground/70'
        }`}>
          {arc.title}
        </h4>

        {isCompleted ? (
          <span className="text-xs text-green-400 font-medium">Complete</span>
        ) : (
          <span className="text-xs text-muted-foreground">{progressPercentage}%</span>
        )}
      </div>
    </motion.button>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { MasteryState } from '@/types';
import { Crown, Star, Trophy, Check } from 'lucide-react';

interface LevelResultsProps {
  score: number;
  total: number;
  xpEarned: number;
  mastery: MasteryState;
  isBoss?: boolean;
  onContinue: () => void;
}

const masteryConfig: Record<MasteryState, { label: string; stars: number; color: string; icon: React.ReactNode }> = {
  unplayed: { label: 'Unplayed', stars: 0, color: 'text-muted-foreground', icon: null },
  played:   { label: 'Played',   stars: 1, color: 'text-muted-foreground', icon: <Star size={20} /> },
  accurate: { label: 'Accurate', stars: 2, color: 'text-primary',          icon: <Star size={20} className="text-primary" /> },
  mastered: { label: 'Mastered', stars: 3, color: 'text-secondary',        icon: <Trophy size={20} className="text-secondary" /> },
  crowned:  { label: 'Crowned',  stars: 4, color: 'text-primary',          icon: <Crown size={20} className="text-primary" /> },
};

export function getMasteryFromScore(score: number, total: number): MasteryState {
  if (total === 0) return 'played';
  const pct = (score / total) * 100;
  if (pct === 100) return 'crowned';
  if (pct >= 80) return 'mastered';
  if (pct >= 60) return 'accurate';
  return 'played';
}

export function LevelResults({ score, total, xpEarned, mastery, isBoss, onContinue }: LevelResultsProps) {
  const config = masteryConfig[mastery];
  const accuracyPct = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center"
    >
      {/* Trophy / Crown */}
      <motion.div
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 250, damping: 16, delay: 0.1 }}
        className="mb-4"
      >
        {mastery === 'crowned' ? (
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, -5, 5, -3, 3, 0] }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-7xl"
            >
              👑
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0, 1] }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="absolute -inset-4 rounded-full border-2 border-primary/50"
            />
          </div>
        ) : mastery === 'mastered' ? (
          <div className="text-7xl">🏆</div>
        ) : (
          <div className="text-7xl">⭐</div>
        )}
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="font-editorial text-2xl font-bold mb-1"
      >
        {isBoss ? 'Boss Defeated!' : 'Level Complete!'}
      </motion.h1>

      {/* Mastery badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`flex items-center gap-1.5 mb-6 ${config.color}`}
      >
        {/* Stars */}
        <div className="flex gap-0.5">
          {[1, 2, 3, 4].map(i => (
            <span key={i} className={i <= config.stars ? 'text-primary' : 'text-border'}>★</span>
          ))}
        </div>
        <span className="font-semibold text-sm">{config.label}</span>
      </motion.div>

      {/* Stats card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="archival-card w-full max-w-sm mb-8"
      >
        <div className="grid grid-cols-3 gap-4 py-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{score}/{total}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Accuracy</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-bold">{accuracyPct}%</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">Score</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">+{xpEarned}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">XP Earned</p>
          </div>
        </div>
      </motion.div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onContinue}
        className="px-10 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm tracking-wide"
      >
        Continue on Map ▸
      </motion.button>
    </motion.div>
  );
}

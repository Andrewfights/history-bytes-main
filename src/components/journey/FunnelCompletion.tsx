import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Target, Trophy, ChevronRight, Unlock } from 'lucide-react';
import { ghostArmyContent } from '@/data/ghostArmyData';

interface FunnelCompletionProps {
  xpEarned: number;
  stats: {
    correct: number;
    total: number;
  };
  onExploreMore: () => void;
}

// Get star rating based on accuracy
function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  return 1;
}

export function FunnelCompletion({ xpEarned, stats, onExploreMore }: FunnelCompletionProps) {
  const [showUnlock, setShowUnlock] = useState(false);
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100;
  const stars = getStarRating(accuracy);

  // Show unlock animation after initial celebration
  useEffect(() => {
    const timer = setTimeout(() => setShowUnlock(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-background px-4 py-8 pb-32 overflow-y-auto">
      {/* Celebration Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">🎖️</div>
        <h1 className="font-editorial text-3xl font-bold mb-2">Mission Complete!</h1>
        <p className="text-muted-foreground">{ghostArmyContent.title}</p>
      </motion.div>

      {/* Star Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 mb-8"
      >
        {[1, 2, 3].map((starNum) => (
          <motion.div
            key={starNum}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + starNum * 0.1, type: 'spring', stiffness: 200 }}
          >
            <Star
              size={40}
              className={starNum <= stars ? 'text-amber-400 fill-amber-400' : 'text-muted'}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {/* XP Earned */}
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Zap size={20} className="mx-auto mb-2 text-gold-highlight" />
          <div className="text-2xl font-bold text-gold-highlight">+{xpEarned}</div>
          <div className="text-xs text-muted-foreground">XP Earned</div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Target size={20} className="mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>

        {/* Questions */}
        <div className="p-4 rounded-xl bg-card border border-border text-center col-span-2">
          <Trophy size={20} className="mx-auto mb-2 text-emerald-400" />
          <div className="text-2xl font-bold">{stats.correct}/{stats.total}</div>
          <div className="text-xs text-muted-foreground">Questions Correct</div>
        </div>
      </motion.div>

      {/* Completion Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6"
      >
        <p className="text-sm text-center italic">
          "{ghostArmyContent.completionMessage}"
        </p>
      </motion.div>

      {/* Unlock Reveal */}
      <AnimatePresence>
        {showUnlock && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Unlock size={18} className="text-gold-primary" />
              <span className="text-sm font-bold text-gold-primary">STORIES UNLOCKED</span>
            </div>

            <div className="space-y-2">
              {[
                { title: 'Operation Fortitude', desc: 'The D-Day deception' },
                { title: 'Battle of the Bulge', desc: "Hitler's last gamble" },
                { title: 'D-Day Deception', desc: 'Fooling the German High Command' },
              ].map((story, index) => (
                <motion.div
                  key={story.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-primary/20 flex items-center justify-center">
                    <Unlock size={14} className="text-gold-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{story.title}</p>
                    <p className="text-xs text-muted-foreground">{story.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <button
          onClick={onExploreMore}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
        >
          Explore More WW2 Stories
          <ChevronRight size={20} />
        </button>
      </motion.div>
    </div>
  );
}

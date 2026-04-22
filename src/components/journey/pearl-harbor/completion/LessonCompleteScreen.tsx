/**
 * LessonCompleteScreen - Quick celebration after completing a single lesson
 * Shows XP earned with animated seal, stats plaque, and continue button
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';

interface LessonCompleteProps {
  lessonTitle: string;
  xpEarned: number;
  timeSpent: string;
  accuracy: number;
  streak: number;
  onContinue: () => void;
  onReview?: () => void;
  onClose?: () => void;
}

export function LessonCompleteScreen({
  lessonTitle,
  xpEarned,
  timeSpent,
  accuracy,
  streak,
  onContinue,
  onReview,
  onClose,
}: LessonCompleteProps) {
  const [displayXp, setDisplayXp] = useState(0);

  // Animate XP count-up
  useEffect(() => {
    const duration = 1000;
    const steps = 20;
    const increment = xpEarned / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= xpEarned) {
        setDisplayXp(xpEarned);
        clearInterval(timer);
      } else {
        setDisplayXp(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [xpEarned]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-void flex flex-col"
    >
      {/* Celebration background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gold radial glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 25%, rgba(230,171,42,0.2) 0%, transparent 55%),
              radial-gradient(ellipse at 30% 80%, rgba(205,14,20,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(230,171,42,0.08) 0%, transparent 50%)
            `
          }}
        />
        {/* Subtle gold dust particles */}
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(230,171,42,0.5) 1px, transparent 2px),
              radial-gradient(circle at 85% 15%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 75% 40%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 25% 55%, rgba(230,171,42,0.5) 1px, transparent 2px),
              radial-gradient(circle at 60% 70%, rgba(230,171,42,0.3) 1px, transparent 2px)
            `
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3">
        {onClose && (
          <button onClick={onClose} className="p-2 -ml-2 text-off-white/50 hover:text-off-white">
            <X size={20} />
          </button>
        )}
        <div className="flex-1" />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-5 h-px bg-ha-red" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-ha-red uppercase font-semibold">
            Lesson Complete
          </span>
          <div className="w-5 h-px bg-ha-red" />
        </motion.div>

        {/* Lesson title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-2xl font-bold text-off-white italic mb-6"
        >
          {lessonTitle}
        </motion.h2>

        {/* Gold seal with XP */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-4"
        >
          <div
            className="w-[120px] h-[120px] rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(246,227,85,0.12), transparent 50%),
                linear-gradient(135deg, rgba(230,171,42,0.06), rgba(178,100,31,0.06))
              `,
              border: '2px solid #B2641F',
              boxShadow: `
                inset 0 0 30px rgba(230,171,42,0.15),
                0 0 40px rgba(230,171,42,0.15)
              `
            }}
          >
            {/* Inner dashed ring */}
            <div
              className="absolute inset-[6px] rounded-full"
              style={{ border: '1px dashed rgba(230,171,42,0.35)' }}
            />
            {/* Outer ring */}
            <div
              className="absolute -inset-2 rounded-full"
              style={{ border: '1px solid rgba(230,171,42,0.1)' }}
            />
            {/* XP number */}
            <span
              className="font-display text-[44px] font-bold leading-none"
              style={{
                background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 2px 0 rgba(106,58,18,0.3)'
              }}
            >
              +{displayXp}
            </span>
          </div>
        </motion.div>

        {/* XP label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="font-mono text-[11px] tracking-[0.35em] text-gold-2 uppercase font-bold mb-4"
        >
          XP Earned
        </motion.div>

        {/* Ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-9 h-px bg-gradient-to-r from-transparent to-gold-2/50" />
          <span className="text-gold-2 text-[6px]">◆</span>
          <div className="w-9 h-px bg-gradient-to-l from-transparent to-gold-2/50" />
        </motion.div>

        {/* Stats plaque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-xs bg-ink-lift border border-gold-2/15 rounded-[10px] p-4 mb-6 relative"
        >
          {/* Top accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-0.5 bg-gold-2" />

          <div className="grid grid-cols-3 gap-2">
            {/* Time */}
            <div className="text-center relative">
              <div className="font-serif text-xl font-bold text-off-white">{timeSpent}</div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                Time
              </div>
              <div className="absolute right-0 top-2 bottom-2 w-px bg-off-white/10" />
            </div>

            {/* Accuracy */}
            <div className="text-center relative">
              <div className="font-serif text-xl font-bold text-success">{accuracy}%</div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                Accuracy
              </div>
              <div className="absolute right-0 top-2 bottom-2 w-px bg-off-white/10" />
            </div>

            {/* Streak */}
            <div className="text-center">
              <div className="font-serif text-xl font-bold text-gold-2">×{streak}</div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                Streak
              </div>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs space-y-2"
        >
          {/* Continue button */}
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-8 rounded-full font-display text-sm font-bold uppercase tracking-[0.15em]"
            style={{
              background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 50%, #B2641F 100%)',
              color: '#000',
              boxShadow: '0 3px 0 #6A3A12'
            }}
          >
            Next Lesson
            <ArrowRight size={16} />
          </button>

          {/* Review button */}
          {onReview && (
            <button
              onClick={onReview}
              className="w-full py-2 font-mono text-[10px] tracking-[0.2em] text-off-white/70 uppercase font-semibold hover:text-off-white transition-colors"
            >
              Review Lesson
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

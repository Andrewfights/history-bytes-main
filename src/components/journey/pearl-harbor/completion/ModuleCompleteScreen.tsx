/**
 * ModuleCompleteScreen - Major celebration after completing a module/beat
 * Shows larger XP reveal, rank progress card, host message, and navigation options
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, X, Flag } from 'lucide-react';

interface ModuleCompleteProps {
  moduleTitle: string;
  xpEarned: number;
  totalXp: number;
  currentRank: string;
  nextRank: string;
  xpToNextRank: number;
  rankProgress: number; // 0-100
  xpGained: number; // XP gained toward rank (for delta visualization)
  lessonsCompleted: number;
  totalLessons: number;
  accuracy: number;
  timeSpent: string;
  hostName: string;
  hostMessage: string;
  onContinue: () => void;
  onBackToCampaign?: () => void;
  onClose?: () => void;
}

export function ModuleCompleteScreen({
  moduleTitle,
  xpEarned,
  totalXp,
  currentRank,
  nextRank,
  xpToNextRank,
  rankProgress,
  xpGained,
  lessonsCompleted,
  totalLessons,
  accuracy,
  timeSpent,
  hostName,
  hostMessage,
  onContinue,
  onBackToCampaign,
  onClose,
}: ModuleCompleteProps) {
  const [displayXp, setDisplayXp] = useState(0);

  // Animate XP count-up
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
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

  // Calculate delta bar width (shows XP gained this session)
  const deltaWidth = Math.min((xpGained / (xpGained + xpToNextRank)) * 100, 100 - rankProgress);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] bg-void flex flex-col overflow-y-auto"
    >
      {/* Celebration background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
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
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: `
              radial-gradient(circle at 15% 20%, rgba(230,171,42,0.5) 1px, transparent 2px),
              radial-gradient(circle at 85% 15%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 75% 40%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 25% 55%, rgba(230,171,42,0.5) 1px, transparent 2px),
              radial-gradient(circle at 60% 70%, rgba(230,171,42,0.3) 1px, transparent 2px),
              radial-gradient(circle at 10% 85%, rgba(230,171,42,0.4) 1px, transparent 2px),
              radial-gradient(circle at 90% 90%, rgba(230,171,42,0.3) 1px, transparent 2px)
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
      <div className="relative z-10 flex-1 flex flex-col items-center px-6 py-4 text-center">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3 mb-4"
        >
          <div className="w-5 h-px bg-ha-red" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-ha-red uppercase font-semibold">
            Module Complete
          </span>
          <div className="w-5 h-px bg-ha-red" />
        </motion.div>

        {/* Module title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-serif text-[28px] font-bold text-off-white italic mb-6 leading-tight"
        >
          {moduleTitle}
        </motion.h2>

        {/* Large gold seal with XP */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
          className="relative mb-2"
        >
          <div
            className="w-[150px] h-[150px] rounded-full flex items-center justify-center flex-col relative"
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
            <div
              className="absolute inset-[6px] rounded-full"
              style={{ border: '1px dashed rgba(230,171,42,0.35)' }}
            />
            <div
              className="absolute -inset-2 rounded-full"
              style={{ border: '1px solid rgba(230,171,42,0.1)' }}
            />
            <span
              className="font-display text-[72px] font-bold leading-none"
              style={{
                background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent'
              }}
            >
              +{displayXp}
            </span>
            <span className="font-mono text-[11px] tracking-[0.35em] text-gold-2 uppercase font-bold mt-1">
              XP Earned
            </span>
          </div>
        </motion.div>

        {/* Triple diamond ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 mb-5"
        >
          <div className="w-9 h-px bg-gradient-to-r from-transparent to-gold-2/50" />
          <span className="text-gold-2 text-[6px] tracking-[4px]">◆ ◆ ◆</span>
          <div className="w-9 h-px bg-gradient-to-l from-transparent to-gold-2/50" />
        </motion.div>

        {/* Stats plaque */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-xs bg-ink-lift border border-gold-2/15 rounded-[10px] p-4 mb-5 relative"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-9 h-0.5 bg-gold-2" />

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center relative">
              <div className="font-serif text-xl font-bold text-off-white">
                {lessonsCompleted}<span className="text-[13px] text-off-white/50">/{totalLessons}</span>
              </div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                Lessons
              </div>
              <div className="absolute right-0 top-2 bottom-2 w-px bg-off-white/10" />
            </div>

            <div className="text-center relative">
              <div className="font-serif text-xl font-bold text-success">{accuracy}%</div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                Accuracy
              </div>
              <div className="absolute right-0 top-2 bottom-2 w-px bg-off-white/10" />
            </div>

            <div className="text-center">
              <div className="font-serif text-xl font-bold text-off-white">{timeSpent}</div>
              <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold mt-1">
                Time
              </div>
            </div>
          </div>
        </motion.div>

        {/* Rank progress card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-xs bg-ink-lift border border-gold-2/15 rounded-[10px] p-4 mb-5 relative overflow-hidden"
        >
          {/* Left gold accent */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2" />

          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pl-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #F6E355, #B2641F)' }}
            >
              <Flag size={12} className="text-void" />
            </div>
            <span className="font-mono text-[9px] tracking-[0.2em] text-off-white/50 uppercase font-semibold">
              Rank Progress
            </span>
          </div>

          {/* Current rank */}
          <div className="font-serif text-base font-bold text-gold-2 pl-2 mb-2">
            {currentRank}
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2 pl-2 mb-2">
            <div className="flex-1 h-[5px] bg-off-white/10 rounded-full overflow-hidden relative">
              {/* Base progress */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rankProgress}%` }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #B2641F, #F6E355)' }}
              />
              {/* Delta (newly gained XP) */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: `${deltaWidth}%`, opacity: 0.6 }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute top-0 h-full"
                style={{
                  left: `${rankProgress}%`,
                  background: '#F6E355',
                  boxShadow: '0 0 8px #F6E355'
                }}
              />
            </div>
            <span className="font-mono text-[10px] text-gold-2 font-semibold tracking-[0.08em]">
              +{xpGained}
            </span>
          </div>

          {/* XP to next rank */}
          <div className="font-mono text-[9px] text-off-white/50 tracking-[0.1em] pl-2">
            {xpToNextRank} XP to <span className="text-gold-2">{nextRank}</span>
          </div>
        </motion.div>

        {/* Host message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-xs bg-ink-lift border border-gold-2/15 rounded-[10px] p-3 mb-6 relative overflow-hidden"
        >
          {/* Left red accent */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-ha-red" />

          <div className="flex gap-3 pl-2">
            {/* Host avatar placeholder */}
            <div
              className="w-7 h-7 rounded-full flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #5a3a1a, #2a1a08)',
                border: '1px solid #6A3A12'
              }}
            />

            <div className="flex-1 text-left">
              <div className="font-mono text-[8px] text-gold-2 tracking-[0.25em] uppercase font-bold mb-1">
                ◆ {hostName}
              </div>
              <p className="font-sans text-[10.5px] text-off-white/70 leading-relaxed italic">
                "{hostMessage}"
              </p>
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="w-full max-w-xs space-y-2"
        >
          {/* Continue button */}
          <button
            onClick={onContinue}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-8 rounded-[10px] font-display text-sm font-bold uppercase tracking-[0.15em] bg-ha-red text-off-white relative"
          >
            {/* Corner accents */}
            <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold-2" />
            <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold-2" />
            Next Module
            <ArrowRight size={16} />
          </button>

          {/* Back to campaign button */}
          {onBackToCampaign && (
            <button
              onClick={onBackToCampaign}
              className="w-full py-2 font-mono text-[10px] tracking-[0.2em] text-off-white/70 uppercase font-semibold hover:text-off-white transition-colors"
            >
              Back to Campaign
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

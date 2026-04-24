/**
 * XPCompletionScreen - Celebratory module completion screen
 * Design: Gold seal with chiseled XP, stats plaque, host message, ceremonial styling
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { WW2Host } from '@/types';
import { playXPSound } from '@/lib/xpAudioManager';
import { HistoryLogo } from '@/components/brand/HistoryLogo';

interface XPCompletionScreenProps {
  beatNumber: number;
  beatTitle: string;
  xpEarned: number;
  host: WW2Host;
  onContinue: () => void;
  nextBeatPreview?: string;
}

export function XPCompletionScreen({
  beatNumber,
  beatTitle,
  xpEarned,
  host,
  onContinue,
  nextBeatPreview,
}: XPCompletionScreenProps) {
  // Play XP sound when component mounts
  useEffect(() => {
    if (xpEarned > 0) {
      const timer = setTimeout(() => playXPSound(), 400);
      return () => clearTimeout(timer);
    }
  }, [xpEarned]);

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-void flex flex-col overflow-hidden">
      {/* Celebration background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Radial gradients */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 50% 25%, rgba(230,171,42,0.2) 0%, transparent 55%),
              radial-gradient(ellipse at 30% 80%, rgba(205,14,20,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(230,171,42,0.08) 0%, transparent 50%)
            `,
          }}
        />
        {/* Gold dust dots */}
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
            `,
          }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <div className="w-5" /> {/* Spacer */}
        <div className="flex flex-col items-center gap-1">
          <HistoryLogo variant="icon" className="w-5 h-5" />
          <div className="w-[22px] h-[2px] bg-red-hist" />
        </div>
        <div className="w-5" /> {/* Spacer */}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 mb-3"
        >
          <div className="w-5 h-px bg-red-hist" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-red-hist font-semibold uppercase">
            Beat Complete
          </span>
          <div className="w-5 h-px bg-red-hist" />
        </motion.div>

        {/* Module title */}
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-serif text-[28px] font-bold italic text-off-white mb-5 leading-none"
        >
          {beatTitle}
        </motion.h1>

        {/* Gold seal with XP */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', damping: 15 }}
          className="relative mb-4"
        >
          {/* Outer ring */}
          <div
            className="w-[150px] h-[150px] rounded-full flex items-center justify-center relative"
            style={{
              background: `
                radial-gradient(circle at 30% 30%, rgba(246,227,85,0.12), transparent 50%),
                linear-gradient(135deg, rgba(230,171,42,0.06), rgba(178,100,31,0.06))
              `,
              border: '2px solid var(--gold-dp)',
              boxShadow: 'inset 0 0 30px rgba(230,171,42,0.15), 0 0 40px rgba(230,171,42,0.15)',
            }}
          >
            {/* Dashed inner ring */}
            <div
              className="absolute inset-[6px] rounded-full"
              style={{ border: '1px dashed rgba(230,171,42,0.35)' }}
            />
            {/* Outer glow ring */}
            <div
              className="absolute -inset-2 rounded-full"
              style={{ border: '1px solid rgba(230,171,42,0.1)' }}
            />

            {/* XP content */}
            <div className="flex flex-col items-center">
              <span
                className="font-display text-[54px] font-bold leading-none tracking-tight"
                style={{
                  background: 'linear-gradient(180deg, var(--gold-br) 0%, var(--gold) 45%, var(--gold-dp) 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  textShadow: '0 2px 0 rgba(106,58,18,0.3)',
                }}
              >
                +{xpEarned}
              </span>
            </div>
          </div>
        </motion.div>

        {/* XP Earned label */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="font-mono text-[11px] tracking-[0.35em] text-gold font-bold uppercase mb-4"
        >
          XP Earned
        </motion.span>

        {/* Ornament diamonds */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-gold text-[6px] mb-5"
        >
          <div className="w-9 h-px bg-gradient-to-r from-transparent to-gold-dp" />
          <span className="tracking-[4px]">&#9670;</span>
          <div className="w-9 h-px bg-gradient-to-l from-transparent to-gold-dp" />
        </motion.div>

        {/* Host message card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-[320px] bg-ink border border-gold-2/15 rounded-[10px] p-3 flex gap-2.5 relative overflow-hidden mb-6"
        >
          {/* Red left border */}
          <div className="absolute left-0 inset-y-0 w-[3px] bg-red-hist" />

          {/* Host avatar */}
          <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 ml-1.5 bg-gradient-to-br from-[#5a3a1a] to-[#2a1a08] border border-gold-dk">
            {host.imageUrl && (
              <img src={host.imageUrl} alt={host.name} className="w-full h-full object-cover" />
            )}
          </div>

          {/* Message */}
          <div className="flex-1 min-w-0 text-left">
            <div className="font-mono text-[8px] tracking-[0.25em] text-gold font-bold uppercase mb-0.5">
              &#9670; {host.name}
            </div>
            <p className="font-sans text-[10.5px] text-off-white/70 leading-[1.4] italic">
              "Solid work, soldier. You're making real progress through this campaign."
            </p>
          </div>
        </motion.div>

        {/* Next beat preview */}
        {nextBeatPreview && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="font-serif text-sm italic text-off-white/50 mb-4 max-w-[280px]"
          >
            Next: {nextBeatPreview}
          </motion.p>
        )}
      </div>

      {/* Bottom buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 px-6 pb-safe"
        style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      >
        {/* Primary button - red with gold corners */}
        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-red-hist text-off-white font-display text-[13px] font-bold uppercase tracking-[0.15em] rounded-[10px] flex items-center justify-center gap-2 relative mb-2"
        >
          {/* Gold corner brackets */}
          <div className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-gold" />
          <div className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-gold" />

          Next Beat
          <ChevronRight size={14} strokeWidth={2.5} />
        </button>

        {/* Ghost button */}
        <button className="w-full py-2 font-mono text-[10px] font-semibold tracking-[0.2em] uppercase text-off-white/50 hover:text-off-white/70 transition-colors">
          Back to Campaign
        </button>
      </motion.div>
    </div>
  );
}

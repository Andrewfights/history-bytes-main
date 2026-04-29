/**
 * XPCompletionScreen - Celebratory module completion screen
 * Design: Bronze Star medal stamp, confetti burst, animated XP count-up
 * Three variants: Standard, Streak Milestone, Rank-Up
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, Flame, Target } from 'lucide-react';
import { WW2Host } from '@/types';
import { playXPSound } from '@/lib/xpAudioManager';

interface XPCompletionScreenProps {
  beatNumber: number;
  beatTitle: string;
  xpEarned: number;
  host: WW2Host;
  onContinue: () => void;
  nextBeatPreview?: string;
  // Optional stats
  streak?: number;
  streakMilestone?: boolean; // Show 7-day celebration
  streakBonus?: number;
  accuracy?: { correct: number; total: number };
  // Rank progress
  currentRank?: string;
  nextRank?: string;
  currentXP?: number;
  xpForNextRank?: number;
  // Rank-up celebration
  rankUp?: {
    fromRank: string;
    fromTier: string;
    toRank: string;
    toTier: string;
  };
  moduleNumber?: number;
  totalModules?: number;
}

// Confetti particle types with brand colors
const PARTICLE_TYPES = [
  'ribbon-gold', 'ribbon-gold', 'ribbon-gold',
  'ribbon-cream', 'ribbon-cream',
  'ribbon-red',
  'dot-gold', 'dot-gold',
  'dot-cream',
  'diamond-gold', 'diamond-gold',
  'spark'
];

interface Particle {
  id: number;
  type: string;
  xt: number;
  yt: number;
  rot: number;
  dur: number;
  delay: number;
  xStart: number;
}

export function XPCompletionScreen({
  beatNumber,
  beatTitle,
  xpEarned,
  host,
  onContinue,
  nextBeatPreview,
  streak = 0,
  streakMilestone = false,
  streakBonus = 0,
  accuracy,
  currentRank = 'Time Tourist',
  nextRank = 'Archive Apprentice',
  currentXP = 245,
  xpForNextRank = 300,
  rankUp,
  moduleNumber = beatNumber,
  totalModules = 10,
}: XPCompletionScreenProps) {
  const [displayXP, setDisplayXP] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(currentXP);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [progressFilled, setProgressFilled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const totalXP = xpEarned + streakBonus;
  const newTotal = currentXP + totalXP;
  const progressFrom = (currentXP / xpForNextRank) * 100;
  const progressTo = Math.min((newTotal / xpForNextRank) * 100, 100);

  // Generate confetti particles
  const generateParticles = useCallback(() => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 38; i++) {
      newParticles.push({
        id: i,
        type: PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)],
        xt: (Math.random() - 0.5) * 360,
        yt: 220 + Math.random() * 280,
        rot: (360 + Math.random() * 720) * (Math.random() < 0.5 ? 1 : -1),
        dur: 1.6 + Math.random() * 1.2,
        delay: Math.random() * 0.4,
        xStart: (Math.random() - 0.5) * 30,
      });
    }
    setParticles(newParticles);
  }, []);

  // Play celebration sounds
  const playFanfare = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      const playTone = (freq: number, dur: number, vol: number, delay: number) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
          osc.connect(g).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + dur + 0.05);
        }, delay);
      };

      // Medal thunk
      playTone(50, 0.18, 0.2, 0);
      // 3-note fanfare
      playTone(440, 0.15, 0.25, 1100);
      playTone(660, 0.15, 0.25, 1300);
      playTone(880, 0.4, 0.3, 1500);
    } catch (e) {
      // Audio not supported
    }
  }, []);

  // XP count-up animation
  const animateCountUp = useCallback((target: number, duration: number, setter: (v: number) => void) => {
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setter(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, []);

  // Start animations on mount
  useEffect(() => {
    generateParticles();
    setShowFlash(true);

    // Play sounds
    if (xpEarned > 0) {
      setTimeout(() => playXPSound(), 400);
      playFanfare();
    }

    // Start XP count-up after medal lands
    setTimeout(() => {
      animateCountUp(totalXP, 900, setDisplayXP);
      animateCountUp(newTotal, 1400, setDisplayTotal);
    }, 1700);

    // Start progress bar fill
    setTimeout(() => setProgressFilled(true), 2000);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [generateParticles, playFanfare, animateCountUp, totalXP, newTotal, xpEarned]);

  const getParticleStyles = (type: string): string => {
    switch (type) {
      case 'ribbon-gold':
        return 'w-2 h-[3px] bg-gradient-to-r from-gold-br to-gold-dp shadow-[0_0_4px_rgba(246,227,85,0.4)]';
      case 'ribbon-cream':
        return 'w-1.5 h-[2.5px] bg-cream shadow-[0_0_3px_rgba(250,244,228,0.5)]';
      case 'ribbon-red':
        return 'w-[7px] h-[3px] bg-gradient-to-r from-red-hist to-red-dp shadow-[0_0_3px_rgba(232,58,64,0.4)]';
      case 'dot-gold':
        return 'w-1 h-1 rounded-full bg-gradient-radial from-gold-br to-gold-dp shadow-[0_0_5px_rgba(246,227,85,0.5)]';
      case 'dot-cream':
        return 'w-[3px] h-[3px] rounded-full bg-cream shadow-[0_0_4px_rgba(250,244,228,0.6)]';
      case 'diamond-gold':
        return 'w-[5px] h-[5px] bg-gold-br rotate-45 shadow-[0_0_6px_rgba(246,227,85,0.6)]';
      case 'spark':
        return 'w-[2px] h-2 bg-gradient-to-b from-cream to-transparent opacity-85';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-void flex flex-col overflow-hidden">
      {/* Atmospheric background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(138,80,20,0.18) 0%, transparent 55%),
            linear-gradient(180deg, #0a0604 0%, #050201 50%, #000 100%)
          `,
        }}
      />

      {/* Confetti layer */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute ${getParticleStyles(p.type)}`}
            style={{ left: `${50 + p.xStart / 3.4}%`, top: '35%' }}
            initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              x: p.xt,
              y: p.yt,
              rotate: p.rot,
            }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              ease: [0.2, 0.7, 0.4, 1],
            }}
          />
        ))}
      </div>

      {/* Flash burst */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="absolute z-48 pointer-events-none rounded-full"
            style={{
              top: '35%',
              left: '50%',
              width: 120,
              height: 120,
              background: 'radial-gradient(circle, rgba(255,235,140,0.7) 0%, rgba(246,227,85,0.3) 30%, transparent 70%)',
            }}
            initial={{ opacity: 0, scale: 0.3, x: '-50%', y: '-50%' }}
            animate={{ opacity: [0, 1, 0], scale: [0.3, 1.5, 3.5] }}
            transition={{ duration: 1, ease: [0.2, 0.7, 0.4, 1] }}
            onAnimationComplete={() => setShowFlash(false)}
          />
        )}
      </AnimatePresence>

      {/* Beat header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 gap-2">
        <div className="w-[30px] h-[30px] rounded-full bg-[rgba(20,14,8,0.5)] border border-divider flex items-center justify-center text-text-2">
          <ChevronRight size={13} className="rotate-180" />
        </div>
        <div className="flex flex-col items-center gap-0.5 flex-1 min-w-0">
          <span className="font-oswald text-sm font-bold text-off-white uppercase tracking-wide truncate">
            {rankUp ? 'Promotion' : streakMilestone ? 'Streak Milestone' : 'Module Complete'}
          </span>
          <span className="font-mono text-[7.5px] tracking-[0.26em] text-text-3 uppercase font-semibold">
            {rankUp ? 'Rank Advanced' : streakMilestone ? 'Module Complete' : beatTitle}
          </span>
        </div>
        <div className="w-[30px] h-[30px] rounded-full bg-[rgba(20,14,8,0.5)] border border-divider flex items-center justify-center text-text-2">
          <span className="text-xs">✕</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-[2px] bg-off-white/[0.06]">
        <div className="absolute left-0 top-0 h-full w-full bg-gradient-to-r from-gold to-gold-br" />
      </div>

      {/* Main celebration content */}
      <div className="flex-1 flex flex-col relative z-10 overflow-y-auto px-[18px] py-4">
        {/* Kicker */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex items-center justify-center gap-[9px] mb-4"
        >
          <div className="w-5 h-px bg-gold opacity-50" />
          <div className="w-[5px] h-[5px] bg-gold rotate-45 shadow-[0_0_4px_rgba(230,171,42,0.6)]" />
          <span className="font-mono text-[8.5px] tracking-[0.32em] text-gold uppercase font-bold">
            {rankUp ? 'Rank · Advanced' : streakMilestone ? 'Seven Days · Unbroken' : 'Module · Complete'}
          </span>
          <div className="w-[5px] h-[5px] bg-gold rotate-45 shadow-[0_0_4px_rgba(230,171,42,0.6)]" />
          <div className="w-5 h-px bg-gold opacity-50" />
        </motion.div>

        {/* Medal Hero */}
        <motion.div
          initial={{ scale: 2.2, rotate: -25, opacity: 0, filter: 'blur(8px)' }}
          animate={{ scale: 1, rotate: 0, opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.9, ease: [0.34, 1.5, 0.64, 1] }}
          className="relative w-[90px] h-[104px] mx-auto mb-4 flex flex-col items-center"
        >
          {/* Ribbon */}
          <div
            className="w-[30px] h-[24px] z-[2]"
            style={{
              background: 'linear-gradient(90deg, #1a3a5f 0%, #1a3a5f 33%, #f5e8d4 33%, #f5e8d4 66%, #8a0a0e 66%, #8a0a0e 100%)',
              clipPath: 'polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
          {/* Disc */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 14px rgba(230,171,42,0.25), inset 0 1px 2px rgba(246,227,85,0.25), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.6)',
                '0 0 30px rgba(246,227,85,0.5), inset 0 1px 2px rgba(246,227,85,0.4), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.6)',
                '0 0 14px rgba(230,171,42,0.25), inset 0 1px 2px rgba(246,227,85,0.25), inset 0 -2px 4px rgba(0,0,0,0.3), 0 4px 10px rgba(0,0,0,0.6)',
              ],
            }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1.2 }}
            className="w-[60px] h-[60px] -mt-1.5 rounded-full flex items-center justify-center relative z-[1]"
            style={{
              background: 'radial-gradient(circle at 35% 30%, #F6E355 0%, #E6AB2A 50%, #B2641F 100%)',
              border: '2px solid var(--gold-dp)',
            }}
          >
            {/* Inner dashed ring */}
            <div className="absolute inset-1 rounded-full border border-dashed border-[rgba(110,60,10,0.55)]" />
            {/* Star */}
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#3a1c08] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
            </svg>
          </motion.div>

          {/* Sparkles */}
          {[
            { top: -4, right: 8, delay: 1.4, size: 10 },
            { bottom: 18, left: -4, delay: 1.7, size: 7 },
            { top: 30, right: -6, delay: 2.0, size: 6 },
            { top: 50, left: -2, delay: 1.8, size: 5 },
          ].map((spark, i) => (
            <motion.div
              key={i}
              className="absolute bg-gold-br"
              style={{
                width: spark.size,
                height: spark.size,
                top: spark.top,
                right: spark.right,
                bottom: spark.bottom,
                left: spark.left,
                clipPath: 'polygon(50% 0, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0 50%, 45% 45%)',
                boxShadow: '0 0 6px rgba(246,227,85,0.6)',
              }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, 180, 360] }}
              transition={{ duration: 1.6, repeat: Infinity, delay: spark.delay }}
            />
          ))}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="font-serif text-[30px] font-bold italic text-off-white text-center leading-[0.95] tracking-tight mb-1"
        >
          {rankUp ? (
            <>You've <em className="text-transparent bg-clip-text bg-gradient-to-b from-gold-br via-gold to-gold-dp">advanced.</em></>
          ) : streakMilestone ? (
            <>A week <em className="text-transparent bg-clip-text bg-gradient-to-b from-gold-br via-gold to-gold-dp">at the front.</em></>
          ) : (
            <>Well <em className="text-transparent bg-clip-text bg-gradient-to-b from-gold-br via-gold to-gold-dp">done.</em></>
          )}
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="font-mono text-[8.5px] tracking-[0.3em] text-text-3 uppercase font-bold text-center mb-5"
        >
          {rankUp ? 'A new chapter begins' : streakMilestone ? 'Streak Bonus Awarded' : `Module ${String(moduleNumber).padStart(2, '0')} · Pearl Harbor`}
        </motion.div>

        {/* XP Hero */}
        <motion.div
          initial={{ scale: 0.4, opacity: 0, filter: 'blur(4px)' }}
          animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
          transition={{ delay: 1.7, duration: 0.7, ease: [0.34, 1.7, 0.64, 1] }}
          className="flex flex-col items-center mb-4"
        >
          <div className="flex items-center gap-[7px] mb-1">
            <div className="w-[14px] h-px bg-gold opacity-40" />
            <span className="font-mono text-[8px] tracking-[0.35em] text-gold uppercase font-bold">Awarded</span>
            <div className="w-[14px] h-px bg-gold opacity-40" />
          </div>
          <div
            className="font-serif italic font-bold text-[54px] leading-none tracking-tight flex items-baseline gap-1"
            style={{
              background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 50%, #B2641F 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 0 30px rgba(246,227,85,0.15)',
            }}
          >
            <span className="text-[30px] leading-none self-start mt-1.5">+</span>
            <span>{displayXP}</span>
            <span className="font-oswald not-italic text-[18px] tracking-[0.16em] font-bold self-end mb-2 ml-0.5">XP</span>
          </div>

          {/* Streak bonus chip */}
          {streakBonus > 0 && (
            <div className="mt-1.5 px-2.5 py-1 bg-[rgba(40,24,10,0.6)] border border-gold rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(230,171,42,0.2)]">
              <svg viewBox="0 0 24 24" className="w-[9px] h-[9px] fill-gold-br">
                <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" />
              </svg>
              <span className="font-mono text-[8px] tracking-[0.22em] text-gold-br uppercase font-bold">
                +{streakBonus} Streak Bonus
              </span>
            </div>
          )}
        </motion.div>

        {/* Streak Milestone Card */}
        {streakMilestone && streak >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.1, duration: 0.7 }}
            className="relative p-3 rounded-md border border-gold overflow-hidden flex items-center gap-3 mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(60,36,14,0.7), rgba(40,24,10,0.85))',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-br to-transparent" />
            <motion.div
              animate={{ rotate: [-2, 2, -1, 3, -2], scale: [1, 1.05, 0.98, 1.03, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-[38px] h-[38px] flex items-center justify-center text-gold-br drop-shadow-[0_0_8px_rgba(246,227,85,0.5)]"
            >
              <Flame size={38} fill="currentColor" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="font-serif italic font-bold text-[18px] text-gold-br leading-none mb-0.5">
                {streak}-Day Streak
              </div>
              <div className="font-mono text-[8px] tracking-[0.24em] text-gold uppercase font-bold leading-snug">
                Longest run yet · Keep it lit
              </div>
            </div>
          </motion.div>
        )}

        {/* Rank-Up Block */}
        {rankUp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.7 }}
            className="relative p-3.5 rounded-md border-[1.5px] border-gold-br overflow-hidden mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(80,46,14,0.7), rgba(40,24,10,0.85))',
            }}
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold-br to-transparent" />
            <div className="flex items-center gap-2 mb-2">
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-[5px] h-[5px] rounded-full bg-gold-br shadow-[0_0_6px_var(--gold-br)]"
              />
              <span className="font-mono text-[8px] tracking-[0.32em] text-gold-br uppercase font-bold shadow-[0_0_6px_rgba(246,227,85,0.4)]">
                Rank Promotion
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0 opacity-50">
                <div className="font-serif italic font-bold text-sm text-cream leading-tight truncate">
                  {rankUp.fromRank}
                </div>
                <div className="font-mono text-[7px] tracking-[0.22em] text-text-3 uppercase font-bold">
                  {rankUp.fromTier}
                </div>
              </div>
              <span className="text-gold font-mono font-bold text-sm flex-shrink-0">→</span>
              <div className="flex-1 min-w-0 text-right">
                <div className="font-serif italic font-bold text-base text-gold-br leading-tight truncate shadow-[0_0_8px_rgba(246,227,85,0.3)]">
                  {rankUp.toRank}
                </div>
                <div className="font-mono text-[7px] tracking-[0.22em] text-text-3 uppercase font-bold">
                  {rankUp.toTier}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Rank Progress Block */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 0.7 }}
          className="relative p-3 rounded-md border border-gold/15 mb-3"
          style={{ background: 'rgba(20,14,8,0.45)' }}
        >
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold to-transparent" />

          <div className="flex justify-between items-baseline mb-2 gap-2.5">
            <div className="font-serif italic text-[13px] font-bold text-cream leading-none">
              {rankUp ? rankUp.toRank : currentRank} <span className="text-text-3 italic">· {rankUp ? 'new rank' : 'current rank'}</span>
            </div>
            <div className="font-mono text-[8px] tracking-[0.22em] text-gold uppercase font-bold text-right">
              Next: {rankUp ? 'Field Researcher' : nextRank}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-[10px] bg-off-white/[0.08] rounded-[5px] overflow-hidden border border-gold/[0.12] mb-2">
            <motion.div
              className="absolute left-0 top-0 bottom-0 rounded-[5px]"
              style={{
                background: 'linear-gradient(90deg, var(--gold-dp) 0%, var(--gold) 50%, var(--gold-br) 100%)',
                boxShadow: '0 0 10px rgba(230,171,42,0.3), inset 0 1px 1px rgba(246,227,85,0.4)',
              }}
              initial={{ width: `${rankUp ? 0 : progressFrom}%` }}
              animate={{ width: progressFilled ? `${rankUp ? 8 : progressTo}%` : `${rankUp ? 0 : progressFrom}%` }}
              transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/25 to-transparent" />
            </motion.div>
          </div>

          <div className="flex justify-between items-center font-mono text-[8px] tracking-[0.18em] text-text-3 uppercase font-semibold">
            <span>
              <span className="text-text-4">{currentXP}</span>
              <span className="text-gold mx-1">→</span>
              <span className="text-gold-br font-bold">{displayTotal}</span>
              <span> / {xpForNextRank} XP</span>
            </span>
            <span className="text-text-4">{Math.max(0, xpForNextRank - newTotal)} to advance</span>
          </div>
        </motion.div>

        {/* Metrics Row */}
        {(streak > 0 || accuracy) && !streakMilestone && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.2, duration: 0.7 }}
            className="grid grid-cols-2 gap-2 mb-3"
          >
            {/* Streak */}
            <div
              className="p-2.5 rounded border flex items-center gap-2.5"
              style={{
                background: 'linear-gradient(135deg, rgba(40,24,10,0.6), rgba(20,12,6,0.5))',
                borderColor: 'rgba(230,171,42,0.3)',
              }}
            >
              <motion.div
                animate={{ rotate: [-2, 2, -1, 3, -2], scale: [1, 1.05, 0.98, 1.03, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-6 h-6 text-gold-br drop-shadow-[0_0_4px_rgba(246,227,85,0.5)]"
              >
                <Flame size={24} fill="currentColor" />
              </motion.div>
              <div className="flex-1 min-w-0 flex flex-col gap-px">
                <div className="font-serif italic font-bold text-base text-cream leading-none">
                  {streak}<span className="text-[9px] font-mono tracking-[0.18em] text-gold uppercase font-bold not-italic ml-0.5">DAY</span>
                </div>
                <div className="font-mono text-[7px] tracking-[0.24em] text-text-3 uppercase font-bold">Streak</div>
              </div>
            </div>

            {/* Accuracy */}
            {accuracy && (
              <div className="p-2.5 rounded border border-divider flex items-center gap-2.5" style={{ background: 'rgba(20,14,8,0.45)' }}>
                <div className="w-6 h-6 text-gold">
                  <Target size={24} strokeWidth={1.6} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-px">
                  <div className="font-serif italic font-bold text-base text-cream leading-none">
                    {accuracy.correct} / {accuracy.total}
                  </div>
                  <div className="font-mono text-[7px] tracking-[0.24em] text-text-3 uppercase font-bold">
                    Correct · {Math.round((accuracy.correct / accuracy.total) * 100)}%
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Lesson Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4, duration: 0.6 }}
          className="p-2.5 rounded border border-dashed border-divider flex items-center gap-2.5 mb-4"
          style={{ background: 'rgba(20,14,8,0.3)' }}
        >
          <div className="w-6 h-6 rounded-full bg-[rgba(40,24,10,0.7)] border border-gold flex items-center justify-center text-gold flex-shrink-0">
            <Check size={11} strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0 flex flex-col gap-px">
            <div className="font-mono text-[7px] tracking-[0.28em] text-gold uppercase font-bold">
              Module · {String(moduleNumber).padStart(2, '0')} · Of · {totalModules}
            </div>
            <div className="font-serif italic text-[13px] text-cream font-semibold leading-tight truncate">
              {beatTitle}
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 0.6 }}
        className="relative z-10 px-[18px] pb-safe"
        style={{ paddingBottom: 'max(0.875rem, calc(env(safe-area-inset-bottom) + 0.875rem))' }}
      >
        <button
          onClick={onContinue}
          className="relative w-full py-3.5 px-[18px] bg-red-hist rounded text-cream font-oswald text-[13px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2.5 transition-all hover:brightness-105"
          style={{
            boxShadow: '0 4px 14px rgba(205,14,20,0.35), inset 0 -2px 4px rgba(0,0,0,0.25)',
          }}
        >
          {/* Gold corner brackets */}
          <span className="absolute top-[4px] left-[18px] w-[9px] h-[9px] border-l-[1.5px] border-t-[1.5px] border-gold/45 pointer-events-none" />
          <span className="absolute bottom-[4px] right-[18px] w-[9px] h-[9px] border-r-[1.5px] border-b-[1.5px] border-gold/45 pointer-events-none" />
          <span>{rankUp ? 'Claim New Rank' : 'Continue the Lesson'}</span>
          <ChevronRight size={12} strokeWidth={2} />
        </button>
      </motion.div>
    </div>
  );
}

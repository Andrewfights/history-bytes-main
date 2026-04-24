/**
 * BattleCard - Operation card with visual states
 * Design: History Academy Dark v2 - Theater Selection
 */

import { motion } from 'framer-motion';
import { Lock, Star, FileText, ArrowRight } from 'lucide-react';
import { WW2Battle, BattleStatus, WW2Theater } from '@/types';
import { cn } from '@/lib/utils';

interface BattleCardProps {
  battle: WW2Battle;
  status: BattleStatus;
  onClick: () => void;
  index: number;
  theater: WW2Theater;
}

export function BattleCard({ battle, status, onClick, index, theater }: BattleCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isAvailable = status === 'available';
  const isFirstStop = battle.isFirstStop;
  const isUnlocked = isAvailable || isFirstStop || isCompleted;

  // Operation number
  const opNum = index + 1 + (theater === 'european' ? 5 : 0);

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        'relative w-full text-left mb-3.5 bg-ink border overflow-hidden z-[2] transition-transform',
        isLocked ? 'cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5',
        isUnlocked && !isLocked && 'border-gold-2 shadow-[0_0_0_1px_rgba(230,171,42,0.15),0_12px_30px_rgba(0,0,0,0.5)]',
        isLocked && 'border-gold-2/15'
      )}
    >
      {/* Corner accents for unlocked cards */}
      {isUnlocked && !isLocked && (
        <>
          <div className="absolute -top-[1px] -left-[1px] w-[10px] h-[10px] border-l-[1.5px] border-t-[1.5px] border-gold-2 z-[5]" />
          <div className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] border-r-[1.5px] border-b-[1.5px] border-gold-2 z-[5]" />
        </>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center px-3.5 py-2.5 bg-black/55 relative z-[3] border-b border-off-white/[0.08]">
        <span className={cn(
          'font-mono text-[9px] tracking-[0.25em] font-bold uppercase',
          isLocked ? 'text-off-white/32' : 'text-gold-2'
        )}>
          OP {String(opNum).padStart(2, '0')}
        </span>
        <span className={cn(
          'font-mono text-[8.5px] tracking-[0.2em] font-bold uppercase flex items-center gap-1.5',
          isUnlocked && !isLocked && 'text-gold-1',
          isLocked && 'text-off-white/32',
          isCompleted && 'text-[#3DD67A]'
        )}>
          {isUnlocked && !isCompleted && (
            <>
              <Star size={10} className="animate-pulse" style={{ filter: 'drop-shadow(0 0 4px rgba(246,227,85,0.8))' }} />
              Start Here
            </>
          )}
          {isCompleted && 'Completed'}
          {isLocked && (
            <>
              <Lock size={10} />
              Locked
            </>
          )}
        </span>
      </div>

      {/* Hero Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-ink-lift">
        <img
          src={battle.imageUrl}
          alt={battle.name}
          className="w-full h-full object-cover"
        />

        {/* Grain overlay */}
        <div
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .35 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Gradient overlay for title legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent z-[2] pointer-events-none" />

        {/* CLASSIFIED stamp for locked cards */}
        {isLocked && (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-black/65 to-black/85 z-[1]" />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[8deg] px-4 py-2 border-2 border-ha-red font-display text-[14px] font-bold tracking-[0.3em] uppercase z-[4] pointer-events-none opacity-90"
              style={{
                color: '#CD0E14',
                background: 'rgba(15,5,5,0.75)',
                textShadow: '0 0 10px rgba(205,14,20,0.5)',
              }}
            >
              <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-ha-red/50" />
              <span className="absolute -bottom-[3px] left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-ha-red/50" />
              Classified
            </div>
          </>
        )}

        {/* Title overlay at bottom */}
        <div className="absolute left-0 right-0 bottom-0 px-4 py-3.5 z-[3]">
          <div className={cn(
            'flex items-center gap-1.5 font-mono text-[8px] tracking-[0.35em] uppercase font-semibold mb-1.5',
            isLocked ? 'text-off-white/32' : 'text-gold-2'
          )}>
            <span className="text-ha-red text-[6px]">◆</span>
            Chapter {String(opNum).padStart(2, '0')} · {battle.chapter || 'Operation'}
          </div>
          <h3 className={cn(
            'font-display text-[22px] font-bold uppercase tracking-[-0.005em] leading-[0.95] mb-1 italic',
            isLocked ? 'text-off-white/50' : 'text-off-white',
            isUnlocked && !isLocked && 'text-[#FFF7E0]'
          )}
          style={isUnlocked && !isLocked ? { textShadow: '0 0 12px rgba(230,171,42,0.3)' } : undefined}
          >
            {battle.name}
          </h3>
          <p className={cn(
            'font-serif italic text-[13px] tracking-[0.02em]',
            isLocked ? 'text-off-white/32' : 'text-off-white/70'
          )}>
            {battle.subtitle}
          </p>
        </div>
      </div>

      {/* Meta Strip */}
      <div className="flex items-center justify-between gap-2.5 px-3.5 py-3 bg-black/45 border-t border-off-white/[0.08] z-[3] relative">
        {/* Left - Stats */}
        <div className="flex gap-3.5 items-center">
          <div className={cn(
            'flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.1em] font-semibold',
            isLocked ? 'text-off-white/32' : 'text-off-white/70'
          )}>
            <FileText size={12} className={isLocked ? 'text-off-white/32' : 'text-gold-2'} />
            <span className={cn(
              'font-display text-[12px] font-bold tracking-[0.02em]',
              isLocked ? 'text-off-white/32' : 'text-gold-1'
            )}>
              {battle.lessonCount}
            </span>
            Lessons
          </div>
          <div className={cn(
            'flex items-center gap-1.5 font-mono text-[9.5px] tracking-[0.1em] font-semibold',
            isLocked ? 'text-off-white/32' : 'text-off-white/70'
          )}>
            <Star size={12} className={isLocked ? 'text-off-white/32' : 'text-gold-2'} fill="currentColor" />
            <span className={cn(
              'font-display text-[12px] font-bold tracking-[0.02em]',
              isLocked ? 'text-off-white/32' : 'text-gold-1'
            )}>
              +{battle.xpReward}
            </span>
            XP
          </div>
        </div>

        {/* Right - CTA or Lock Message */}
        {isUnlocked && !isLocked ? (
          <div className="bg-ha-red text-off-white px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 relative">
            {/* Corner accents */}
            <div className="absolute -top-[1px] -left-[1px] w-[5px] h-[5px] border-t border-l border-gold-2" />
            <div className="absolute -bottom-[1px] -right-[1px] w-[5px] h-[5px] border-b border-r border-gold-2" />
            Deploy
            <ArrowRight size={10} />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 font-mono text-[9px] text-off-white/50 tracking-[0.15em] uppercase font-semibold text-right">
            <Lock size={11} className="text-off-white/32" />
            Req: OP {String(opNum - 1).padStart(2, '0')}
          </div>
        )}
      </div>
    </motion.button>
  );
}

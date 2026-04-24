/**
 * TheaterColumn - Column wrapper with theater banner and operation cards
 * Design: History Academy Dark v2 - Theater Selection
 */

import { motion } from 'framer-motion';
import { Anchor, Shield } from 'lucide-react';
import { WW2Theater, BattleStatus } from '@/types';
import { getBattlesByTheater } from '@/data/ww2Battles';
import { BattleCard } from './BattleCard';
import { cn } from '@/lib/utils';

interface TheaterColumnProps {
  theater: WW2Theater;
  getBattleStatus: (battleId: string) => BattleStatus;
  onBattleClick: (battleId: string) => void;
}

export function TheaterColumn({
  theater,
  getBattleStatus,
  onBattleClick,
}: TheaterColumnProps) {
  const battles = getBattlesByTheater(theater);
  const isPacific = theater === 'pacific';

  // Calculate progress
  const completed = battles.filter(b => getBattleStatus(b.id) === 'completed').length;
  const progressPercent = (completed / battles.length) * 100;

  // Theater-specific styles
  const theaterStyles = isPacific
    ? {
        tint: 'rgba(30,70,115,0.14)',
        tintHi: 'rgba(30,70,115,0.28)',
        stroke: '#4A7BAA',
        accent: '#6AA1D8',
        borderColor: 'rgba(74,123,170,0.22)',
      }
    : {
        tint: 'rgba(120,25,20,0.14)',
        tintHi: 'rgba(120,25,20,0.28)',
        stroke: '#A83028',
        accent: '#DC4842',
        borderColor: 'rgba(168,48,40,0.22)',
      };

  return (
    <motion.section
      initial={{ opacity: 0, x: isPacific ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative p-0.5"
      style={{
        background: `linear-gradient(180deg, ${theaterStyles.tint} 0%, transparent 40%, transparent 100%)`,
        border: `1px solid ${theaterStyles.borderColor}`,
      }}
    >
      {/* Corner accents */}
      <div
        className="absolute -top-[1px] -left-[1px] w-[9px] h-[9px]"
        style={{ borderLeft: `1.5px solid ${theaterStyles.stroke}`, borderTop: `1.5px solid ${theaterStyles.stroke}` }}
      />
      <div
        className="absolute -bottom-[1px] -right-[1px] w-[9px] h-[9px]"
        style={{ borderRight: `1.5px solid ${theaterStyles.stroke}`, borderBottom: `1.5px solid ${theaterStyles.stroke}` }}
      />

      {/* Theater Header */}
      <div
        className="px-5 py-6 text-center relative border-b"
        style={{
          background: `linear-gradient(180deg, ${theaterStyles.tintHi}, transparent)`,
          borderBottomColor: theaterStyles.borderColor,
        }}
      >
        {/* Emblem */}
        <div
          className="w-14 h-14 rounded-full mx-auto mb-3 flex items-center justify-center relative"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(246,227,85,0.25), transparent 60%), linear-gradient(135deg, #3a3018, #151008)',
            border: `1.5px solid ${theaterStyles.stroke}`,
          }}
        >
          <div className="absolute -inset-1 rounded-full border border-dashed border-gold-2/30" />
          {isPacific ? (
            <Anchor size={26} style={{ color: theaterStyles.accent }} />
          ) : (
            <Shield size={26} style={{ color: theaterStyles.accent }} />
          )}
        </div>

        {/* Kicker */}
        <div
          className="font-mono text-[8.5px] tracking-[0.4em] font-semibold uppercase mb-1.5"
          style={{ color: theaterStyles.accent }}
        >
          ◆ Theater {isPacific ? '01' : '02'} · {isPacific ? 'Western Pacific' : 'Continental Europe'}
        </div>

        {/* Theater Name */}
        <h2 className="font-serif text-[28px] font-semibold italic text-off-white leading-none mb-2 tracking-[0.005em]">
          The {isPacific ? 'Pacific' : 'European'} Theater
        </h2>

        {/* Dates */}
        <div className="flex items-center justify-center gap-2.5 font-mono text-[9.5px] tracking-[0.25em] text-gold-2 uppercase font-semibold mb-3.5">
          <span className="w-[18px] h-[1px] bg-gold-2/35" />
          {isPacific ? 'Dec 1941 – Sep 1945' : 'Sep 1939 – May 1945'}
          <span className="w-[18px] h-[1px] bg-gold-2/35" />
        </div>

        {/* Theater Progress */}
        <div className="inline-flex items-center gap-2.5 px-3 py-2 bg-black/30 border border-off-white/[0.08] max-w-[260px] mx-auto">
          <span className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold">
            Ops
          </span>
          <div className="flex-1 h-[2px] bg-off-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: theaterStyles.accent }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, delay: 0.5 }}
            />
          </div>
          <span
            className="font-display text-[12px] font-bold tracking-[0.02em]"
            style={{ color: theaterStyles.accent }}
          >
            {completed}/{battles.length}
          </span>
        </div>
      </div>

      {/* Operations List */}
      <div className="relative px-4 py-5">
        {/* Timeline rail */}
        <div
          className="absolute left-1/2 top-9 bottom-9 w-[1px] z-0 pointer-events-none"
          style={{
            background: `linear-gradient(180deg, transparent, rgba(230,171,42,0.35) 5%, rgba(230,171,42,0.35) 95%, transparent)`
          }}
        />

        {battles.map((battle, index) => (
          <div key={battle.id}>
            <BattleCard
              battle={battle}
              status={getBattleStatus(battle.id)}
              onClick={() => onBattleClick(battle.id)}
              index={index}
              theater={theater}
            />

            {/* Connector between cards */}
            {index < battles.length - 1 && (
              <div className="flex items-center justify-center py-1 relative z-[1]">
                <div className="flex items-center gap-2.5 px-2.5 py-1 bg-ink border border-off-white/[0.08]">
                  <span className="font-mono text-[8.5px] tracking-[0.18em] text-off-white/50 uppercase font-semibold">
                    {battles[index + 1]?.subtitle?.split('–')[0]?.trim() || 'Next'}
                  </span>
                  <span style={{ color: theaterStyles.accent }} className="text-[10px] leading-none">
                    ▼
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Theater Footer */}
      <div className="px-5 py-3.5 text-center border-t border-off-white/[0.08] bg-black/25">
        <div className="flex items-center justify-center gap-2.5 font-mono text-[8.5px] tracking-[0.3em] text-off-white/50 uppercase font-semibold">
          <span className="w-[18px] h-[1px] bg-off-white/[0.08]" />
          End of {isPacific ? 'Pacific' : 'European'} Theater
          <span className="w-[18px] h-[1px] bg-off-white/[0.08]" />
        </div>
      </div>
    </motion.section>
  );
}

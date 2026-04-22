/**
 * RankLadder - Horizontal rank progression with nodes
 * Shows current rank position and XP progress to next rank
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export const RANKS = [
  { name: 'Time Tourist', minXp: 0, maxXp: 10000, shortLabel: '0-10k' },
  { name: 'Archive Apprentice', minXp: 10000, maxXp: 25000, shortLabel: '10k-25k' },
  { name: 'Field Researcher', minXp: 25000, maxXp: 50000, shortLabel: '25k-50k' },
  { name: 'Archive Master', minXp: 50000, maxXp: 100000, shortLabel: '50k-100k' },
  { name: 'Grand Historian', minXp: 100000, maxXp: Infinity, shortLabel: '100k+' },
] as const;

interface RankLadderProps {
  currentXp: number;
  className?: string;
  compact?: boolean;
}

export function getRankInfo(xp: number) {
  const rankIndex = RANKS.findIndex((r) => xp < r.maxXp);
  const currentRankIndex = rankIndex === -1 ? RANKS.length - 1 : rankIndex;
  const currentRank = RANKS[currentRankIndex];
  const nextRank = RANKS[currentRankIndex + 1];

  const xpIntoRank = xp - currentRank.minXp;
  const xpForRank = currentRank.maxXp - currentRank.minXp;
  const progressPercent = xpForRank === Infinity ? 100 : (xpIntoRank / xpForRank) * 100;
  const xpToNextRank = nextRank ? currentRank.maxXp - xp : 0;

  return {
    currentRank,
    currentRankIndex,
    nextRank,
    xpIntoRank,
    xpForRank,
    progressPercent,
    xpToNextRank,
  };
}

export function RankLadder({ currentXp, className, compact = false }: RankLadderProps) {
  const { currentRank, currentRankIndex, nextRank, progressPercent, xpToNextRank } = getRankInfo(currentXp);

  if (compact) {
    return (
      <div className={cn('rank-ladder-compact', className)}>
        {/* Progress bar */}
        <div className="flex justify-between items-center mb-1.5">
          <div className="flex items-center gap-1.5">
            <Star size={12} className="text-gold-2" fill="currentColor" />
            <span className="font-serif text-sm font-bold text-off-white">{currentRank.name}</span>
          </div>
          {nextRank && (
            <span className="font-mono text-[9px] text-text-3">
              {xpToNextRank.toLocaleString()} XP to {nextRank.name}
            </span>
          )}
        </div>
        <div className="prog-bar">
          <motion.div
            className="prog-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="font-mono text-[8px] text-text-3">
            {currentXp.toLocaleString()} XP
          </span>
          <span className="font-mono text-[8px] text-text-3">
            {currentRank.maxXp === Infinity ? 'MAX' : `${currentRank.maxXp.toLocaleString()} XP`}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('rank-ladder', className)}>
      {/* Header */}
      <div className="flex justify-between items-end mb-3">
        <div>
          <div className="sec-kick">Rank Progression</div>
          <div className="sec-title">
            The <em>road</em> to Grand Historian
          </div>
        </div>
        <div className="text-right">
          <div className="font-serif text-lg font-bold text-off-white">
            {currentXp.toLocaleString()}
            <span className="text-text-3 text-sm font-normal">
              {' '}/ {currentRank.maxXp === Infinity ? '∞' : currentRank.maxXp.toLocaleString()} XP
            </span>
          </div>
          {nextRank && (
            <div className="font-mono text-[9px] text-text-3">
              {xpToNextRank.toLocaleString()} XP to <span className="text-gold-2">{nextRank.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Ladder track */}
      <div className="relative">
        {/* Track line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-off-white/10">
          <motion.div
            className="h-full bg-gold-2"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentRankIndex / (RANKS.length - 1)) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Nodes */}
        <div className="flex justify-between relative">
          {RANKS.map((rank, index) => {
            const isComplete = index < currentRankIndex;
            const isCurrent = index === currentRankIndex;
            const isLocked = index > currentRankIndex;

            return (
              <div key={rank.name} className="flex flex-col items-center">
                {/* Node */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center border-2 z-10',
                    isComplete && 'bg-gold-2 border-gold-2',
                    isCurrent && 'bg-gold-2 border-gold-2 ring-2 ring-gold-2/30 ring-offset-2 ring-offset-void',
                    isLocked && 'bg-void border-off-white/20'
                  )}
                >
                  {isLocked ? (
                    <Lock size={12} className="text-off-white/30" />
                  ) : (
                    <Star size={12} className={cn(isComplete || isCurrent ? 'text-void' : 'text-off-white/30')} fill="currentColor" />
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <div
                    className={cn(
                      'font-mono text-[8px] tracking-wide',
                      isCurrent ? 'text-gold-2' : isComplete ? 'text-text-2' : 'text-text-3'
                    )}
                  >
                    {rank.shortLabel}
                  </div>
                  <div
                    className={cn(
                      'font-serif text-[10px] font-bold',
                      isCurrent ? 'text-off-white' : 'text-text-3'
                    )}
                  >
                    {rank.name.split(' ')[0]}
                  </div>
                  {isCurrent && (
                    <div className="font-mono text-[7px] text-gold-2 mt-0.5">
                      &#9670; You are here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RankLadder;

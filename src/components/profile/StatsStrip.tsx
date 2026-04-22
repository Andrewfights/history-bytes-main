/**
 * StatsStrip - Stats row display for profile
 * 4-column (mobile) / 6-column (desktop) layout
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star, Flame, Target, Trophy, Award, Globe } from 'lucide-react';

export interface UserStats {
  totalXp: number;
  weeklyXp?: number;
  streak: number;
  bestStreak?: number;
  accuracy: number;
  questionsAnswered?: number;
  trophies: number;
  trophyBreakdown?: string; // "3G · 3S · 3B"
  certificates?: number;
  erasExplored?: number;
  totalEras?: number;
}

interface StatsStripProps {
  stats: UserStats;
  className?: string;
  compact?: boolean;
}

export function StatsStrip({ stats, className, compact = false }: StatsStripProps) {
  const {
    totalXp,
    weeklyXp,
    streak,
    bestStreak,
    accuracy,
    questionsAnswered,
    trophies,
    trophyBreakdown,
    certificates,
    erasExplored,
    totalEras,
  } = stats;

  const primaryStats = [
    {
      key: 'xp',
      label: 'Total XP',
      value: totalXp >= 1000 ? `${(totalXp / 1000).toFixed(1)}k` : totalXp.toString(),
      sub: weeklyXp ? `+${weeklyXp} this week` : undefined,
      color: 'text-gold-2',
      icon: <Star size={14} fill="currentColor" />,
    },
    {
      key: 'streak',
      label: 'Day Streak',
      value: streak.toString(),
      sub: bestStreak ? `Best: ${bestStreak} days` : undefined,
      color: 'text-ha-red',
      icon: <Flame size={14} />,
    },
    {
      key: 'accuracy',
      label: 'Accuracy',
      value: `${accuracy}%`,
      sub: questionsAnswered ? `${questionsAnswered.toLocaleString()} questions` : undefined,
      color: 'text-success',
      icon: <Target size={14} />,
    },
    {
      key: 'trophies',
      label: 'Trophies',
      value: trophies.toString(),
      sub: trophyBreakdown || undefined,
      color: 'text-gold-2',
      icon: <Trophy size={14} />,
    },
  ];

  const secondaryStats = [
    {
      key: 'certificates',
      label: 'Certificates',
      value: (certificates || 0).toString(),
      sub: 'Awarded',
      color: 'text-gold-2',
      icon: <Award size={14} />,
    },
    {
      key: 'eras',
      label: 'Eras Explored',
      value: `${erasExplored || 0}`,
      sub: totalEras ? `/ ${totalEras}` : 'Across all time',
      color: 'text-off-white',
      icon: <Globe size={14} />,
    },
  ];

  if (compact) {
    return (
      <div className={cn('grid grid-cols-4 gap-2', className)}>
        {primaryStats.map((stat) => (
          <StatCard key={stat.key} stat={stat} compact />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('stats-strip', className)}>
      {/* Mobile: 4-column primary stats */}
      <div className="grid grid-cols-4 gap-2 md:hidden">
        {primaryStats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>

      {/* Desktop: 6-column with all stats */}
      <div className="hidden md:grid md:grid-cols-6 gap-2">
        {[...primaryStats, ...secondaryStats].map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>
    </div>
  );
}

interface StatCardProps {
  stat: {
    key: string;
    label: string;
    value: string;
    sub?: string;
    color: string;
    icon: React.ReactNode;
  };
  compact?: boolean;
}

function StatCard({ stat, compact }: StatCardProps) {
  if (compact) {
    return (
      <div className="text-center py-2 px-1 bg-ink-lift rounded-lg border border-border-gold/50">
        <div className={cn('font-serif text-base font-bold', stat.color)}>{stat.value}</div>
        <div className="font-mono text-[7px] text-text-3 tracking-wider uppercase">{stat.label}</div>
      </div>
    );
  }

  return (
    <div className="bg-ink-lift rounded-lg border border-border-gold/50 p-3 text-center">
      <div className="font-mono text-[8px] text-text-3 tracking-wide uppercase mb-1">
        {stat.label}
      </div>
      <div className={cn('font-serif text-xl font-bold', stat.color)}>{stat.value}</div>
      {stat.sub && (
        <div className="font-mono text-[8px] text-text-3 mt-0.5">{stat.sub}</div>
      )}
    </div>
  );
}

export default StatsStrip;

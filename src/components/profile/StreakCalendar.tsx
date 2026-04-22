/**
 * StreakCalendar - 7-day week calendar with streak tracking
 * Shows current streak with fire icon and weekly progress
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Flame } from 'lucide-react';

export type DayStatus = 'on' | 'off' | 'today' | 'future';

interface StreakCalendarProps {
  streak: number;
  weekDays?: DayStatus[];
  nextMilestone?: number;
  milestoneReward?: number;
  className?: string;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakCalendar({
  streak,
  weekDays,
  nextMilestone,
  milestoneReward,
  className,
}: StreakCalendarProps) {
  // Default: calculate from streak
  const days = weekDays || calculateWeekDays(streak);
  const isPerfectWeek = days.filter((d) => d === 'on' || d === 'today').length === 7;

  return (
    <div className={cn('streak-calendar bg-ink-lift rounded-xl border border-border-gold p-4', className)}>
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-3 via-gold-1 to-gold-3 rounded-t-xl" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-1 to-gold-3 flex items-center justify-center">
          <Flame size={16} className="text-void" />
        </div>
        <div className="flex-1">
          <div className="font-mono text-[8px] text-text-3 tracking-[0.25em] uppercase font-semibold">
            Current Streak
          </div>
          <div className="font-serif text-xl font-bold italic text-gold-2">
            {streak} days
          </div>
        </div>
      </div>

      {/* Week label */}
      <div className="flex justify-between items-center mb-2">
        <span className="font-mono text-[9px] text-text-3 tracking-wide">This Week</span>
        {isPerfectWeek && (
          <span className="font-mono text-[9px] text-gold-2 font-bold">
            &#9670; Perfect
          </span>
        )}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((status, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-sm flex items-center justify-center font-mono text-[10px] font-bold',
                status === 'on' && 'bg-gradient-to-br from-gold-3 to-gold-2 text-void',
                status === 'today' && 'bg-ha-red text-off-white',
                status === 'off' && 'bg-off-white/8 text-text-3',
                status === 'future' && 'bg-transparent border border-off-white/10 text-text-4'
              )}
            >
              {DAY_LABELS[i]}
            </div>
          </div>
        ))}
      </div>

      {/* Next milestone */}
      {nextMilestone && milestoneReward && (
        <div className="font-mono text-[9px] text-text-3">
          Next milestone: <span className="text-off-white font-bold">{nextMilestone} days</span>
          <span className="text-gold-2 ml-1">+{milestoneReward} XP</span>
        </div>
      )}
    </div>
  );
}

// Calculate week days from streak count
function calculateWeekDays(streak: number): DayStatus[] {
  const today = new Date().getDay();
  const mondayOffset = today === 0 ? 6 : today - 1; // Days since Monday

  const days: DayStatus[] = [];
  for (let i = 0; i < 7; i++) {
    if (i > mondayOffset) {
      days.push('future');
    } else if (i === mondayOffset) {
      days.push('today');
    } else if (streak > mondayOffset - i) {
      days.push('on');
    } else {
      days.push('off');
    }
  }

  return days;
}

export default StreakCalendar;

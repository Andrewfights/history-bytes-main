/**
 * ActivityFeed - Recent activity list for profile
 * Shows trophies, certificates, lessons, games, rank ups
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Star, Award, Check, Gamepad2, Shield, ChevronRight } from 'lucide-react';

export type ActivityType = 'trophy' | 'certificate' | 'lesson' | 'game' | 'rank';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  text: string;
  highlight?: string;
  timestamp: string;
  xpEarned?: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

const activityConfig: Record<ActivityType, { icon: React.ReactNode; bgClass: string; iconClass: string }> = {
  trophy: {
    icon: <Star size={12} fill="currentColor" />,
    bgClass: 'bg-gradient-to-br from-gold-2/15 to-gold-3/8 border-gold-2/20',
    iconClass: 'text-gold-2',
  },
  certificate: {
    icon: <Award size={12} />,
    bgClass: 'bg-gold-2/8 border-gold-2/15',
    iconClass: 'text-gold-2',
  },
  lesson: {
    icon: <Check size={12} />,
    bgClass: 'bg-success/8 border-success/20',
    iconClass: 'text-success',
  },
  game: {
    icon: <Gamepad2 size={12} />,
    bgClass: 'bg-info/8 border-info/20',
    iconClass: 'text-info',
  },
  rank: {
    icon: <Shield size={12} fill="currentColor" />,
    bgClass: 'bg-ha-red/8 border-ha-red/20',
    iconClass: 'text-ha-red',
  },
};

export function ActivityFeed({
  activities,
  maxItems = 6,
  onViewAll,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div
      className={cn(
        'activity-feed bg-ink-lift rounded-xl border border-border-gold overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-divider">
        <div className="sec-kick mb-0.5">&#9670; The Record</div>
        <div className="font-serif text-[15px] font-bold italic text-off-white">Recent Activity</div>
      </div>

      {/* Activity list */}
      <div className="divide-y divide-divider">
        {displayActivities.map((activity) => (
          <ActivityRow key={activity.id} activity={activity} />
        ))}
      </div>

      {/* View all link */}
      {onViewAll && activities.length > maxItems && (
        <button
          onClick={onViewAll}
          className="w-full px-4 py-2.5 flex items-center justify-center gap-1 text-text-3 hover:text-gold-2 transition-colors border-t border-divider"
        >
          <span className="font-mono text-[9px] tracking-wide uppercase">View All Activity</span>
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const config = activityConfig[activity.type];

  return (
    <div className="px-4 py-3 flex gap-3 items-start">
      {/* Icon */}
      <div
        className={cn(
          'w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border',
          config.bgClass
        )}
      >
        <span className={config.iconClass}>{config.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-[12px] text-off-white leading-snug">
          {activity.highlight ? (
            <>
              {activity.text.split(activity.highlight)[0]}
              <span className="text-gold-2 font-semibold">{activity.highlight}</span>
              {activity.text.split(activity.highlight)[1]}
            </>
          ) : (
            activity.text
          )}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-[8px] text-text-3 tracking-wide uppercase">
            {activity.timestamp}
          </span>
          {activity.xpEarned && (
            <span className="font-mono text-[8px] text-gold-2 font-bold">
              +{activity.xpEarned} XP
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ActivityFeed;

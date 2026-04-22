/**
 * Medal - Reusable trophy medal component with tier variants
 * Used in Trophy Room and Profile sections
 * Structure: ribbon (3 parts) + disc (ring + icon + stars)
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Lock, Star } from 'lucide-react';

export type MedalTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'locked';

export interface MedalProps {
  tier: MedalTier;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: {
    wrapper: 'w-12 h-[68px]',
    ribbon: 'h-4',
    disc: 'w-10 h-10',
    ring: 'w-8 h-8',
    icon: 'w-4 h-4',
    stars: 'gap-0.5',
    starSize: 'w-2 h-2',
  },
  md: {
    wrapper: 'w-16 h-[88px]',
    ribbon: 'h-5',
    disc: 'w-14 h-14',
    ring: 'w-11 h-11',
    icon: 'w-5 h-5',
    stars: 'gap-1',
    starSize: 'w-2.5 h-2.5',
  },
  lg: {
    wrapper: 'w-24 h-[130px]',
    ribbon: 'h-7',
    disc: 'w-20 h-20',
    ring: 'w-16 h-16',
    icon: 'w-7 h-7',
    stars: 'gap-1.5',
    starSize: 'w-3 h-3',
  },
};

const tierStars: Record<MedalTier, number> = {
  bronze: 0,
  silver: 2,
  gold: 3,
  platinum: 4,
  locked: 0,
};

export function Medal({ tier, icon, size = 'md', className }: MedalProps) {
  const sizes = sizeMap[size];
  const starCount = tierStars[tier];

  return (
    <div className={cn('medal relative flex flex-col items-center', tier, sizes.wrapper, className)}>
      {/* Ribbon */}
      <div className={cn('medal-ribbon relative flex justify-center', sizes.ribbon)}>
        <div className="medal-ribbon-l absolute left-0 top-0 w-1/2 h-full origin-top-right skew-x-[15deg]" />
        <div className="medal-ribbon-r absolute right-0 top-0 w-1/2 h-full origin-top-left -skew-x-[15deg]" />
        <div className="medal-ribbon-c absolute left-1/2 -translate-x-1/2 top-0 w-3 h-full" />
      </div>

      {/* Disc */}
      <div className={cn('medal-disc relative rounded-full flex items-center justify-center -mt-1', sizes.disc)}>
        {/* Ring */}
        <div className={cn('medal-ring rounded-full flex items-center justify-center', sizes.ring)}>
          {/* Icon */}
          <div className={cn('medal-icon', sizes.icon)}>
            {tier === 'locked' ? (
              <Lock className="w-full h-full" />
            ) : icon ? (
              icon
            ) : (
              <Star className="w-full h-full" fill="currentColor" />
            )}
          </div>
        </div>
      </div>

      {/* Stars (for silver, gold, platinum) */}
      {starCount > 0 && (
        <div className={cn('medal-stars flex items-center justify-center -mt-1', sizes.stars)}>
          {Array.from({ length: starCount }).map((_, i) => (
            <Star key={i} className={cn('fill-current', sizes.starSize)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Medal;

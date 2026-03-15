/**
 * TierBadge - Material tier indicator for souvenirs
 *
 * Shows the current tier (Gray, Bronze, Silver, Gold) with
 * appropriate styling and optional glow effects.
 */

import { motion } from 'framer-motion';
import type { SouvenirTier } from '@/types';
import { SOUVENIR_TIER_NAMES, SOUVENIR_TIER_COLORS } from '@/types';

interface TierBadgeProps {
  tier: SouvenirTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export function TierBadge({
  tier,
  size = 'md',
  showLabel = true,
  animate = false,
  className = '',
}: TierBadgeProps) {
  const colors = SOUVENIR_TIER_COLORS[tier];
  const label = SOUVENIR_TIER_NAMES[tier];

  // Size variants
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  // Tier icons
  const tierIcons: Record<SouvenirTier, string> = {
    gray: '◆',
    bronze: '◆',
    silver: '◆',
    gold: '★',
  };

  return (
    <motion.div
      initial={animate ? { scale: 0.8, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      style={{
        backgroundColor: `${colors.primary}20`,
        color: colors.primary,
        boxShadow: tier === 'gold' ? `0 0 12px ${colors.glow}` : undefined,
      }}
    >
      {/* Tier icon */}
      <span
        className={iconSize[size]}
        style={{ color: colors.primary }}
      >
        {tierIcons[tier]}
      </span>

      {/* Label */}
      {showLabel && (
        <span>{label}</span>
      )}
    </motion.div>
  );
}

// Compact circle badge for smaller displays
export function TierDot({
  tier,
  size = 'md',
  className = '',
}: {
  tier: SouvenirTier;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const colors = SOUVENIR_TIER_COLORS[tier];

  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`rounded-full ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: colors.primary,
        boxShadow: tier === 'gold' ? `0 0 8px ${colors.glow}` : `0 0 4px ${colors.glow}`,
      }}
    />
  );
}

// Progress indicator showing current tier and next tier
export function TierProgress({
  currentTier,
  className = '',
}: {
  currentTier: SouvenirTier;
  className?: string;
}) {
  const tiers: SouvenirTier[] = ['gray', 'bronze', 'silver', 'gold'];
  const currentIndex = tiers.indexOf(currentTier);

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {tiers.map((tier, index) => {
        const isAchieved = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const colors = SOUVENIR_TIER_COLORS[tier];

        return (
          <div key={tier} className="flex items-center">
            {/* Tier dot */}
            <div
              className={`
                rounded-full transition-all duration-300
                ${isCurrent ? 'w-4 h-4' : 'w-3 h-3'}
                ${isAchieved ? '' : 'opacity-30'}
              `}
              style={{
                backgroundColor: isAchieved ? colors.primary : '#4B5563',
                boxShadow: isCurrent && isAchieved ? `0 0 8px ${colors.glow}` : undefined,
              }}
            />

            {/* Connector line */}
            {index < tiers.length - 1 && (
              <div
                className="w-3 h-0.5 mx-0.5"
                style={{
                  backgroundColor: index < currentIndex ? SOUVENIR_TIER_COLORS[tiers[index + 1]].primary : '#4B5563',
                  opacity: index < currentIndex ? 1 : 0.3,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

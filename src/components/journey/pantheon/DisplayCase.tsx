/**
 * DisplayCase - Museum-style glass vitrine for displaying souvenirs
 *
 * Shows a souvenir at its current material tier, with appropriate
 * spotlight effects and styling. Empty/locked cases show placeholder.
 */

import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Souvenir, SouvenirTier, PantheonWorld } from '@/types';
import { SOUVENIR_TIER_COLORS, SOUVENIR_TIER_NAMES } from '@/types';
import { TierBadge } from './TierBadge';

interface DisplayCaseProps {
  world: PantheonWorld;
  souvenir: Souvenir | null;
  tier: SouvenirTier | null;
  isUnlocked: boolean;
  isHighlighted?: boolean;
  onClick?: () => void;
}

export function DisplayCase({
  world,
  souvenir,
  tier,
  isUnlocked,
  isHighlighted = false,
  onClick,
}: DisplayCaseProps) {
  const isLocked = !world.isAvailable;
  const isEmpty = !isUnlocked && world.isAvailable;
  const hasContent = isUnlocked && souvenir && tier;

  // Spotlight color based on tier
  const spotlightColor = tier ? SOUVENIR_TIER_COLORS[tier] : null;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
      className={`
        relative flex flex-col items-center p-4 rounded-2xl
        transition-all duration-300
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${isHighlighted ? 'ring-2 ring-amber-400' : ''}
      `}
      style={{
        background: hasContent
          ? `linear-gradient(180deg, ${spotlightColor?.glow}15 0%, transparent 100%)`
          : 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)',
      }}
    >
      {/* Glass vitrine effect */}
      <div
        className={`
          relative w-32 h-40 rounded-xl overflow-hidden
          border-2 backdrop-blur-sm
          ${hasContent ? 'border-white/20' : 'border-white/10'}
          ${isHighlighted ? 'shadow-lg shadow-amber-400/20' : ''}
        `}
        style={{
          background: hasContent
            ? `radial-gradient(ellipse at top, ${spotlightColor?.glow}10 0%, transparent 70%)`
            : 'rgba(0,0,0,0.3)',
          boxShadow: hasContent && tier === 'gold'
            ? `inset 0 0 30px ${spotlightColor?.glow}20`
            : undefined,
        }}
      >
        {/* Spotlight beam effect */}
        {hasContent && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-full opacity-20"
            style={{
              background: `linear-gradient(180deg, ${spotlightColor?.primary} 0%, transparent 100%)`,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-3">
          {/* Locked state */}
          {isLocked && (
            <div className="flex flex-col items-center gap-2 text-white/40">
              <Lock size={24} />
              <span className="text-xs text-center">Coming Soon</span>
            </div>
          )}

          {/* Empty state (available but not unlocked) */}
          {isEmpty && (
            <div className="flex flex-col items-center gap-2">
              {/* Placeholder silhouette */}
              <div className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20" />
              <span className="text-xs text-white/40 text-center">
                Complete {world.name} to unlock
              </span>
            </div>
          )}

          {/* Souvenir display */}
          {hasContent && souvenir && (
            <>
              {/* Souvenir image */}
              <div className="relative w-20 h-20 mb-2">
                <img
                  src={souvenir.images[tier]}
                  alt={souvenir.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to placeholder if image fails
                    (e.target as HTMLImageElement).src = '/assets/pantheon/placeholder.png';
                  }}
                />

                {/* Gold glow effect */}
                {tier === 'gold' && (
                  <div
                    className="absolute inset-0 rounded-full blur-xl opacity-30 -z-10"
                    style={{ backgroundColor: spotlightColor?.glow }}
                  />
                )}
              </div>

              {/* Tier badge */}
              <TierBadge tier={tier} size="sm" showLabel={false} />
            </>
          )}
        </div>

        {/* Glass reflection overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* Nameplate */}
      <div className="mt-3 text-center">
        <h3 className="text-sm font-medium text-white/90">{world.name}</h3>
        {hasContent && tier && (
          <p className="text-xs text-white/50 mt-0.5">
            {SOUVENIR_TIER_NAMES[tier]}
          </p>
        )}
      </div>
    </motion.button>
  );
}

// Compact version for smaller displays
export function DisplayCaseCompact({
  world,
  souvenir,
  tier,
  isUnlocked,
  onClick,
}: Omit<DisplayCaseProps, 'isHighlighted'>) {
  const isLocked = !world.isAvailable;
  const hasContent = isUnlocked && souvenir && tier;
  const spotlightColor = tier ? SOUVENIR_TIER_COLORS[tier] : null;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative flex items-center gap-3 p-3 rounded-xl
        bg-white/5 hover:bg-white/10 transition-colors
        ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      {/* Souvenir thumbnail */}
      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{
          background: hasContent
            ? `radial-gradient(circle, ${spotlightColor?.glow}20 0%, transparent 70%)`
            : 'rgba(255,255,255,0.05)',
        }}
      >
        {hasContent && souvenir ? (
          <img
            src={souvenir.images[tier]}
            alt={souvenir.name}
            className="w-10 h-10 object-contain"
          />
        ) : isLocked ? (
          <Lock size={18} className="text-white/30" />
        ) : (
          <div className="w-8 h-8 rounded-full border border-dashed border-white/20" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 text-left">
        <h4 className="text-sm font-medium text-white/90">{world.name}</h4>
        <p className="text-xs text-white/50">
          {isLocked ? 'Coming Soon' : hasContent && tier ? SOUVENIR_TIER_NAMES[tier] : 'Not unlocked'}
        </p>
      </div>

      {/* Tier indicator */}
      {hasContent && tier && (
        <TierBadge tier={tier} size="sm" showLabel={false} />
      )}
    </button>
  );
}

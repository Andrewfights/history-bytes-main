/**
 * TrophyProgressWidget - Compact in-game souvenir progress display
 *
 * Shows current souvenir tier with visual indicator. Compact enough for
 * HUD corners in quiz/exam screens. Expandable to show tier requirements.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { usePantheonProgress } from './hooks/usePantheonProgress';
import { TierDot, TierProgress } from './TierBadge';
import { getSouvenirByWorldId } from '@/data/pantheonSouvenirs';
import type { SouvenirTier } from '@/types';
import { SOUVENIR_TIER_NAMES, SOUVENIR_TIER_COLORS } from '@/types';

interface TrophyProgressWidgetProps {
  worldId?: string; // Default to 'ww2' for MVP
  variant?: 'compact' | 'mini' | 'expanded';
  showLabel?: boolean;
  className?: string;
}

export function TrophyProgressWidget({
  worldId = 'ww2',
  variant = 'compact',
  showLabel = true,
  className = '',
}: TrophyProgressWidgetProps) {
  const { getSouvenirTier, hasSouvenir } = usePantheonProgress();
  const [isExpanded, setIsExpanded] = useState(false);

  const souvenir = getSouvenirByWorldId(worldId);
  if (!souvenir) return null;

  const tier = getSouvenirTier(souvenir.id);
  const hasUnlocked = hasSouvenir(souvenir.id);
  const colors = tier ? SOUVENIR_TIER_COLORS[tier] : null;

  // Mini variant - just a dot indicator
  if (variant === 'mini') {
    return (
      <div className={`flex items-center gap-1.5 ${className}`}>
        {hasUnlocked && tier ? (
          <TierDot tier={tier} size="sm" />
        ) : (
          <div className="w-3 h-3 rounded-full bg-white/20 border border-dashed border-white/30" />
        )}
        {showLabel && (
          <span className="text-xs text-white/60">
            {hasUnlocked && tier ? SOUVENIR_TIER_NAMES[tier] : 'Locked'}
          </span>
        )}
      </div>
    );
  }

  // Compact variant - icon + tier with expand option
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-colors"
        >
          {/* Souvenir icon */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
            style={{
              background: hasUnlocked && colors
                ? `linear-gradient(135deg, ${colors.glow}30 0%, transparent 100%)`
                : 'rgba(255,255,255,0.05)',
            }}
          >
            {hasUnlocked ? '🪖' : '🔒'}
          </div>

          {/* Tier info */}
          <div className="text-left">
            {hasUnlocked && tier ? (
              <>
                <div className="text-xs font-medium text-white/90">
                  {souvenir.name.split(' ')[0]}
                </div>
                <div
                  className="text-[10px] font-bold uppercase tracking-wide"
                  style={{ color: colors?.primary }}
                >
                  {SOUVENIR_TIER_NAMES[tier]}
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-white/50">Souvenir</div>
                <div className="text-[10px] text-white/30">Locked</div>
              </>
            )}
          </div>

          {/* Expand indicator */}
          {isExpanded ? (
            <ChevronUp size={14} className="text-white/40" />
          ) : (
            <ChevronDown size={14} className="text-white/40" />
          )}
        </button>

        {/* Expanded panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: -5, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.95 }}
              className="absolute top-full left-0 right-0 mt-2 z-50"
            >
              <div className="bg-slate-900/95 backdrop-blur-sm border border-white/10 rounded-xl p-4 shadow-xl">
                {/* Souvenir preview */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{
                      background: hasUnlocked && colors
                        ? `linear-gradient(135deg, ${colors.glow}20 0%, transparent 100%)`
                        : 'rgba(255,255,255,0.05)',
                    }}
                  >
                    🪖
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{souvenir.name}</h4>
                    <p className="text-xs text-white/50">{souvenir.description}</p>
                  </div>
                </div>

                {/* Tier progress */}
                <div className="mb-3">
                  <p className="text-xs text-white/40 mb-2">Progress</p>
                  {hasUnlocked && tier ? (
                    <TierProgress currentTier={tier} />
                  ) : (
                    <div className="flex items-center gap-1">
                      {(['gray', 'bronze', 'silver', 'gold'] as SouvenirTier[]).map((t) => (
                        <div
                          key={t}
                          className="w-3 h-3 rounded-full bg-white/10"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Tier requirements */}
                <div className="space-y-1.5 text-[10px]">
                  <TierRequirement tier="gray" label="Completion" requirement="Complete all lessons" currentTier={tier} />
                  <TierRequirement tier="bronze" label="Master's" requirement="60%+ on Final Exam" currentTier={tier} />
                  <TierRequirement tier="silver" label="PhD" requirement="80%+ on Final Exam" currentTier={tier} />
                  <TierRequirement tier="gold" label="Rhodes Scholar" requirement="100% Perfect Score" currentTier={tier} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded variant - full display
  return (
    <div className={`bg-slate-900/80 backdrop-blur-sm border border-white/10 rounded-xl p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
          style={{
            background: hasUnlocked && colors
              ? `linear-gradient(135deg, ${colors.glow}20 0%, transparent 100%)`
              : 'rgba(255,255,255,0.05)',
          }}
        >
          🪖
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">{souvenir.name}</h3>
          {hasUnlocked && tier ? (
            <div
              className="text-sm font-bold"
              style={{ color: colors?.primary }}
            >
              {SOUVENIR_TIER_NAMES[tier]}
            </div>
          ) : (
            <div className="text-sm text-white/40">Not unlocked</div>
          )}
        </div>
      </div>

      {/* Tier progress */}
      {hasUnlocked && tier && (
        <div className="mb-4">
          <TierProgress currentTier={tier} />
        </div>
      )}

      {/* Requirements grid */}
      <div className="grid grid-cols-2 gap-2">
        <TierRequirementCard tier="gray" label="Completion" requirement="Finish lessons" currentTier={tier} />
        <TierRequirementCard tier="bronze" label="Master's" requirement="60%+ exam" currentTier={tier} />
        <TierRequirementCard tier="silver" label="PhD" requirement="80%+ exam" currentTier={tier} />
        <TierRequirementCard tier="gold" label="Rhodes" requirement="100% perfect" currentTier={tier} />
      </div>
    </div>
  );
}

// Helper component for tier requirement row
function TierRequirement({
  tier,
  label,
  requirement,
  currentTier,
}: {
  tier: SouvenirTier;
  label: string;
  requirement: string;
  currentTier: SouvenirTier | null;
}) {
  const colors = SOUVENIR_TIER_COLORS[tier];
  const isAchieved = currentTier && getTierRank(currentTier) >= getTierRank(tier);

  return (
    <div className={`flex items-center gap-2 ${isAchieved ? 'opacity-100' : 'opacity-40'}`}>
      <div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.primary }}
      />
      <span className="text-white/70 font-medium">{label}:</span>
      <span className="text-white/50">{requirement}</span>
      {isAchieved && <span className="text-green-400 ml-auto">✓</span>}
    </div>
  );
}

// Helper component for tier requirement card
function TierRequirementCard({
  tier,
  label,
  requirement,
  currentTier,
}: {
  tier: SouvenirTier;
  label: string;
  requirement: string;
  currentTier: SouvenirTier | null;
}) {
  const colors = SOUVENIR_TIER_COLORS[tier];
  const isAchieved = currentTier && getTierRank(currentTier) >= getTierRank(tier);

  return (
    <div
      className={`p-2 rounded-lg border ${
        isAchieved ? 'bg-white/5 border-white/10' : 'bg-black/20 border-white/5'
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: isAchieved ? colors.primary : '#4B5563' }}
        />
        <span
          className="text-xs font-bold"
          style={{ color: isAchieved ? colors.primary : '#6B7280' }}
        >
          {label}
        </span>
      </div>
      <p className="text-[10px] text-white/40">{requirement}</p>
    </div>
  );
}

// Helper to get tier rank
function getTierRank(tier: SouvenirTier): number {
  const ranks: Record<SouvenirTier, number> = {
    gray: 1,
    bronze: 2,
    silver: 3,
    gold: 4,
  };
  return ranks[tier];
}

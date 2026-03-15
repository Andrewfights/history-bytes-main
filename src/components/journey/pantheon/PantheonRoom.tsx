/**
 * PantheonRoom - Main souvenir gallery view
 *
 * Museum-style room displaying souvenirs from all historical worlds.
 * Each souvenir shows in a glass display case at its current material tier.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, X } from 'lucide-react';
import { usePantheonProgress } from './hooks/usePantheonProgress';
import { DisplayCase } from './DisplayCase';
import { TierBadge, TierProgress } from './TierBadge';
import { PANTHEON_WORLDS, getSouvenirById } from '@/data/pantheonSouvenirs';
import type { Souvenir, SouvenirTier } from '@/types';
import { SOUVENIR_TIER_NAMES } from '@/types';

interface PantheonRoomProps {
  onBack: () => void;
}

export function PantheonRoom({ onBack }: PantheonRoomProps) {
  const {
    progress,
    isLoading,
    getSouvenirTier,
    getSouvenirProgress,
    hasSouvenir,
    getTotalSouvenirs,
    getHighestTier,
    markVisited,
  } = usePantheonProgress();

  const [selectedSouvenir, setSelectedSouvenir] = useState<{
    souvenir: Souvenir;
    tier: SouvenirTier;
  } | null>(null);

  // Mark as visited on mount
  useEffect(() => {
    markVisited();
  }, [markVisited]);

  // Stats
  const totalSouvenirs = getTotalSouvenirs();
  const totalWorlds = PANTHEON_WORLDS.length;
  const availableWorlds = PANTHEON_WORLDS.filter(w => w.isAvailable).length;
  const highestTier = getHighestTier();

  const handleCaseClick = (worldId: string, souvenirId: string) => {
    const souvenir = getSouvenirById(souvenirId);
    const tier = getSouvenirTier(souvenirId);

    if (souvenir && tier) {
      setSelectedSouvenir({ souvenir, tier });
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden"
    >
      {/* Museum environment background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(ellipse at center top, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)
          `,
        }}
      />

      {/* Wooden floor reflection */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 opacity-20"
        style={{
          background: 'linear-gradient(0deg, #3E2723 0%, transparent 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Back</span>
          </button>

          <h1 className="font-editorial text-xl font-bold text-white">
            The Pantheon
          </h1>

          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-center gap-6 py-4 border-b border-white/5">
          {/* Collection count */}
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <span className="text-white/70 text-sm">
              <span className="text-white font-medium">{totalSouvenirs}</span>
              {' / '}
              {availableWorlds} Souvenirs
            </span>
          </div>

          {/* Highest tier */}
          {highestTier && (
            <div className="flex items-center gap-2">
              <span className="text-white/50 text-sm">Highest:</span>
              <TierBadge tier={highestTier} size="sm" />
            </div>
          )}
        </div>

        {/* Display Cases Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-lg mx-auto">
            {/* World souvenirs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {PANTHEON_WORLDS.map((world) => {
                const souvenir = getSouvenirById(world.souvenirId);
                const tier = getSouvenirTier(world.souvenirId);
                const isUnlocked = hasSouvenir(world.souvenirId);

                return (
                  <DisplayCase
                    key={world.id}
                    world={world}
                    souvenir={souvenir || null}
                    tier={tier}
                    isUnlocked={isUnlocked}
                    onClick={() => {
                      if (isUnlocked && souvenir) {
                        handleCaseClick(world.id, world.souvenirId);
                      }
                    }}
                  />
                );
              })}
            </div>

            {/* Empty state message */}
            {totalSouvenirs === 0 && (
              <div className="mt-8 text-center">
                <p className="text-white/50 text-sm">
                  Complete historical journeys to unlock souvenirs
                </p>
                <p className="text-white/30 text-xs mt-2">
                  Your collection awaits...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-center gap-4 text-xs text-white/50">
            <span>Material Tiers:</span>
            {(['gray', 'bronze', 'silver', 'gold'] as SouvenirTier[]).map((tier) => (
              <div key={tier} className="flex items-center gap-1">
                <TierBadge tier={tier} size="sm" showLabel={true} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Souvenir Detail Modal */}
      <AnimatePresence>
        {selectedSouvenir && (
          <SouvenirDetailModal
            souvenir={selectedSouvenir.souvenir}
            tier={selectedSouvenir.tier}
            progress={getSouvenirProgress(selectedSouvenir.souvenir.id)}
            onClose={() => setSelectedSouvenir(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Souvenir detail modal
function SouvenirDetailModal({
  souvenir,
  tier,
  progress,
  onClose,
}: {
  souvenir: Souvenir;
  tier: SouvenirTier;
  progress: ReturnType<ReturnType<typeof usePantheonProgress>['getSouvenirProgress']>;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Souvenir image */}
        <div className="relative pt-8 pb-4 px-8">
          {/* Glow effect */}
          {tier === 'gold' && (
            <div
              className="absolute inset-0 blur-3xl opacity-30"
              style={{
                background: 'radial-gradient(circle, #FFD700 0%, transparent 70%)',
              }}
            />
          )}

          <img
            src={souvenir.images[tier]}
            alt={souvenir.name}
            className="relative z-10 w-48 h-48 mx-auto object-contain"
          />
        </div>

        {/* Info */}
        <div className="px-6 pb-6">
          {/* Name and tier */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-editorial text-xl font-bold text-white">
              {souvenir.name}
            </h2>
            <TierBadge tier={tier} size="md" />
          </div>

          {/* Tier progress */}
          <div className="mb-4">
            <TierProgress currentTier={tier} />
          </div>

          {/* Description */}
          <p className="text-white/70 text-sm mb-3">
            {souvenir.description}
          </p>

          {/* Significance */}
          <p className="text-amber-400/80 text-sm italic">
            "{souvenir.significance}"
          </p>

          {/* Stats */}
          {progress && (
            <div className="mt-4 pt-4 border-t border-white/10 text-xs text-white/50">
              <div className="flex justify-between">
                <span>Unlocked</span>
                <span>{new Date(progress.unlockedAt).toLocaleDateString()}</span>
              </div>
              {progress.upgradedAt && tier !== 'gray' && (
                <div className="flex justify-between mt-1">
                  <span>Last Upgraded</span>
                  <span>{new Date(progress.upgradedAt).toLocaleDateString()}</span>
                </div>
              )}
              {progress.examScores.length > 0 && (
                <div className="flex justify-between mt-1">
                  <span>Best Exam Score</span>
                  <span>{Math.max(...progress.examScores)}%</span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

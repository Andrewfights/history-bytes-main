/**
 * WW2TheaterSelection - Theater Select page
 * Design: History Academy Dark v2 - Theater Selection
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, X, Star, Anchor, Shield } from 'lucide-react';
import { WW2Host } from '@/types';
import { getBattleById } from '@/data/ww2Battles';
import { TheaterColumn } from './TheaterColumn';
import { useWW2TheaterProgress } from './hooks/useWW2TheaterProgress';
import { cn } from '@/lib/utils';

interface WW2TheaterSelectionProps {
  host: WW2Host;
  onBack: () => void;
  onSelectPearlHarbor: () => void;
  onSelectWorldMap: () => void;
  onChangeGuide?: () => void;
}

export function WW2TheaterSelection({
  host,
  onBack,
  onSelectPearlHarbor,
  onSelectWorldMap,
  onChangeGuide,
}: WW2TheaterSelectionProps) {
  const {
    getBattleStatus,
    syncPearlHarborCompletion,
    getOverallProgress,
    isLoading,
  } = useWW2TheaterProgress();

  const [showComingSoon, setShowComingSoon] = useState<string | null>(null);

  // Sync Pearl Harbor completion on mount
  useEffect(() => {
    syncPearlHarborCompletion();
  }, [syncPearlHarborCompletion]);

  const handleBattleClick = (battleId: string) => {
    const status = getBattleStatus(battleId);

    // If locked, do nothing
    if (status === 'locked') return;

    // Pearl Harbor navigates to its lesson map
    if (battleId === 'pearl-harbor') {
      onSelectPearlHarbor();
      return;
    }

    // Other battles show "Coming Soon" modal
    setShowComingSoon(battleId);
  };

  const overallProgress = getOverallProgress();
  const progressPercent = overallProgress.total > 0
    ? Math.round((overallProgress.completed / overallProgress.total) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-void overflow-hidden"
      style={{
        background: `
          radial-gradient(ellipse 80% 50% at 25% 10%, rgba(30,70,115,0.12), transparent 60%),
          radial-gradient(ellipse 80% 50% at 75% 10%, rgba(120,25,20,0.12), transparent 60%),
          #050709
        `
      }}
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.45] pointer-events-none z-[100] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.8 0 0 0 0 0.65 0 0 0 0 0.3 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Top Bar */}
      <header className="relative z-10 flex items-center gap-4 px-4 md:px-7 py-4 border-b border-off-white/[0.08]">
        {/* Red accent line */}
        <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[100px] h-[2px] bg-ha-red" />

        {/* Back button */}
        <button
          onClick={onBack}
          className="w-9 h-9 border border-gold-2/15 bg-ink flex items-center justify-center text-off-white/70 hover:text-gold-2 hover:border-gold-2/35 transition-colors flex-shrink-0"
        >
          <ArrowLeft size={14} />
        </button>

        {/* Campaign Mark */}
        <div className="flex items-center gap-3 flex-1">
          <div className="w-11 h-11 border-[1.5px] border-gold-3 flex items-center justify-center flex-shrink-0 relative"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(246,227,85,0.3), transparent 60%), linear-gradient(135deg, #4a4018, #1a1608)'
            }}
          >
            <div className="absolute -inset-1 border border-dashed border-gold-2/35" />
            <Star size={22} className="text-gold-1" fill="currentColor" />
          </div>
          <div className="leading-tight">
            <div className="flex items-center gap-1.5 font-mono text-[8.5px] tracking-[0.3em] text-ha-red font-semibold uppercase mb-0.5">
              <span className="text-[6px]">◆</span>
              Campaign · {overallProgress.total} Operations
            </div>
            <div className="font-display text-[18px] font-bold text-off-white uppercase tracking-[0.01em] italic leading-none">
              World War <em className="text-gold-2 italic">II</em>
            </div>
            <div className="text-[11px] text-off-white/50 mt-0.5 tracking-[0.02em]">
              Global Theaters of Operation
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onSelectWorldMap}
            className="flex items-center gap-2 px-3.5 py-2 bg-ink border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/35 transition-colors font-mono text-[10px] tracking-[0.2em] uppercase font-semibold"
          >
            <Globe size={13} />
            Map View
          </button>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-[1320px] mx-auto px-4 md:px-7 pb-24">

          {/* Briefing Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center py-8 md:py-10"
          >
            {/* Ornament */}
            <div className="flex items-center justify-center gap-3.5 mb-4">
              <div className="w-[60px] h-[1px] bg-gradient-to-r from-transparent via-gold-2 to-transparent" />
              <span className="w-[5px] h-[5px] bg-ha-red rotate-45" />
              <span className="font-mono text-[9px] tracking-[0.4em] text-ha-red font-semibold uppercase">
                Select Your Front
              </span>
              <span className="w-[5px] h-[5px] bg-ha-red rotate-45" />
              <div className="w-[60px] h-[1px] bg-gradient-to-r from-transparent via-gold-2 to-transparent" />
            </div>

            {/* Title */}
            <h1 className="font-serif text-[clamp(36px,5vw,56px)] font-bold italic text-off-white leading-[1.05] tracking-[-0.01em] mb-3">
              Choose A Theater <em className="text-gold-2 italic relative">
                To Deploy
                <span className="absolute bottom-[-2px] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold-2 to-transparent" />
              </em>
            </h1>

            {/* Subtitle */}
            <p className="text-[13px] text-off-white/50 mb-6 tracking-[0.01em]">
              Complete <strong className="text-gold-2 font-semibold italic">Pearl Harbor</strong> to unlock the rest of the campaign.
            </p>

            {/* Progress Bar */}
            <div className="inline-flex items-center gap-3.5 px-5 py-3 bg-ink border border-gold-2/15 relative">
              {/* Corner accents */}
              <div className="absolute -top-[1px] -left-[1px] w-[7px] h-[7px] border-t border-l border-gold-2" />
              <div className="absolute -bottom-[1px] -right-[1px] w-[7px] h-[7px] border-b border-r border-gold-2" />

              <span className="font-mono text-[9px] tracking-[0.25em] text-off-white/50 uppercase font-semibold">
                Campaign Progress
              </span>
              <div className="w-40 h-[3px] bg-off-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-gold-3 to-gold-1"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="font-display text-[14px] font-bold text-gold-1 tracking-[0.02em]">
                <span className="text-off-white mr-1">{overallProgress.completed}</span>/{overallProgress.total} Battles
              </span>
            </div>
          </motion.div>

          {/* Theater Columns */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-gold-2/20 border-t-gold-2 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mt-3.5">
              {/* Pacific Theater */}
              <TheaterColumn
                theater="pacific"
                getBattleStatus={getBattleStatus}
                onBattleClick={handleBattleClick}
              />

              {/* European Theater */}
              <TheaterColumn
                theater="european"
                getBattleStatus={getBattleStatus}
                onBattleClick={handleBattleClick}
              />
            </div>
          )}
        </div>
      </div>

      {/* Coming Soon Modal */}
      <AnimatePresence>
        {showComingSoon && (
          <ComingSoonModal
            battleId={showComingSoon}
            onClose={() => setShowComingSoon(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Coming Soon Modal Component
function ComingSoonModal({
  battleId,
  onClose,
}: {
  battleId: string;
  onClose: () => void;
}) {
  const battle = getBattleById(battleId);
  if (!battle) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-sm bg-ink border border-gold-2/15 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner accents */}
        <div className="absolute -top-[1px] -left-[1px] w-[9px] h-[9px] border-t border-l border-gold-2 z-10" />
        <div className="absolute -top-[1px] -right-[1px] w-[9px] h-[9px] border-t border-r border-gold-2 z-10" />
        <div className="absolute -bottom-[1px] -left-[1px] w-[9px] h-[9px] border-b border-l border-gold-2 z-10" />
        <div className="absolute -bottom-[1px] -right-[1px] w-[9px] h-[9px] border-b border-r border-gold-2 z-10" />

        {/* Battle Image */}
        <div className="relative h-40">
          <img
            src={battle.imageUrl}
            alt={battle.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 flex items-center justify-center text-off-white/70 hover:text-off-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          <h3 className="font-display text-xl font-bold text-off-white uppercase tracking-[0.01em] italic mb-1">
            {battle.name}
          </h3>
          <p className="text-off-white/50 text-sm mb-4">{battle.subtitle}</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-2/20 border border-gold-2/30 mb-4">
            <span className="text-gold-2 text-sm font-semibold">Coming Soon</span>
          </div>

          <p className="text-off-white/60 text-sm mb-4">{battle.description}</p>

          <div className="flex items-center justify-center gap-4 text-xs text-off-white/40">
            <span>{battle.lessonCount} Lessons</span>
            <span className="text-gold-2">+{battle.xpReward} XP</span>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full py-3 bg-off-white/10 hover:bg-off-white/20 text-off-white font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

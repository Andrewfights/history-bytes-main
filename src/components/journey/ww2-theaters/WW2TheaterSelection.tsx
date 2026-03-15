/**
 * WW2TheaterSelection - Main page for selecting WW2 theater battles
 * Shows Pacific and European theater columns with progressive unlocking
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Globe, X } from 'lucide-react';
import { WW2Host } from '@/types';
import { getBattleById } from '@/data/ww2Battles';
import { TheaterColumn } from './TheaterColumn';
import { useWW2TheaterProgress } from './hooks/useWW2TheaterProgress';

interface WW2TheaterSelectionProps {
  host: WW2Host;
  onBack: () => void;
  onSelectPearlHarbor: () => void;
  onSelectWorldMap: () => void;
}

export function WW2TheaterSelection({
  host,
  onBack,
  onSelectPearlHarbor,
  onSelectWorldMap,
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden"
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vintage paper texture overlay */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paper'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.04' numOctaves='5' result='noise'/%3E%3CfeDiffuseLighting in='noise' lighting-color='%23fff' surfaceScale='2'%3E%3CfeDistantLight azimuth='45' elevation='60'/%3E%3C/feDiffuseLighting%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23paper)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ backgroundColor: host.primaryColor }}
            >
              {host.avatar}
            </div>
            <div>
              <h1 className="font-editorial text-lg font-bold text-white">
                World War II
              </h1>
              <p className="text-sm text-white/60">
                Global Theaters of Operation
              </p>
            </div>
          </div>
        </div>

        {/* World Map Button */}
        <button
          onClick={onSelectWorldMap}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Globe size={18} className="text-white/70" />
          <span className="text-sm text-white/70">Map</span>
        </button>
      </div>

      {/* Main Title */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-center py-4 px-4"
      >
        <h2 className="text-2xl font-editorial font-bold text-amber-100">
          Select a Theater to Deploy
        </h2>
        <p className="text-white/50 text-sm mt-1">
          Complete Pearl Harbor to unlock more campaigns
        </p>
        {/* Overall Progress */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs text-white/40">
          <span>Overall Progress:</span>
          <span className="text-amber-400 font-medium">
            {overallProgress.completed}/{overallProgress.total} Battles
          </span>
        </div>
      </motion.div>

      {/* Theater Columns */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:gap-4 max-w-4xl mx-auto">
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
        className="relative max-w-sm w-full bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Battle Image */}
        <div className="relative h-40">
          <img
            src={battle.imageUrl}
            alt={battle.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-transparent to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 text-center">
          <h3 className="text-xl font-bold text-white mb-1">{battle.name}</h3>
          <p className="text-white/50 text-sm mb-4">{battle.subtitle}</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-lg mb-4">
            <span className="text-amber-400 text-sm font-medium">
              Coming Soon
            </span>
          </div>

          <p className="text-white/60 text-sm mb-4">{battle.description}</p>

          <div className="flex items-center justify-center gap-4 text-xs text-white/40">
            <span>{battle.lessonCount} Lessons</span>
            <span className="text-amber-400">+{battle.xpReward} XP</span>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
          >
            Got it
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

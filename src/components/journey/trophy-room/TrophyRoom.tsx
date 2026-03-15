/**
 * TrophyRoom - Master trophy collection view
 * Displays all era trophies with filtering and stats
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Filter, Sparkles, Target } from 'lucide-react';
import { useTrophyProgress } from './hooks/useTrophyProgress';
import { EraTrophy, EraTrophyCompact } from './EraTrophy';
import { TrophyCase } from './TrophyCase';

type FilterType = 'all' | 'completed' | 'in-progress';
type ViewType = 'list' | 'grid';

interface TrophyRoomProps {
  onBack: () => void;
  onSelectEra?: (arcId: string) => void;
}

export function TrophyRoom({ onBack, onSelectEra }: TrophyRoomProps) {
  const { eraProgress, trophyStats } = useTrophyProgress();
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('list');

  // Filter eras based on selection
  const filteredEras = eraProgress.filter((progress) => {
    if (filter === 'completed') return progress.isCompleted;
    if (filter === 'in-progress') return !progress.isCompleted && progress.progressPercentage > 0;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-xl font-bold text-white flex items-center gap-2 justify-center">
            <Trophy size={20} className="text-amber-400" />
            Trophy Room
          </h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="px-4 py-6"
      >
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-2xl p-5 border border-amber-500/20">
          <div className="flex items-center justify-between">
            {/* Main trophy display */}
            <div className="flex items-center gap-4">
              <TrophyCase
                isCompleted={trophyStats.completedEras > 0}
                size="lg"
              />
              <div>
                <div className="text-3xl font-bold text-white">
                  {trophyStats.completedEras}
                  <span className="text-lg text-white/50">/{trophyStats.totalEras}</span>
                </div>
                <p className="text-white/60 text-sm">Eras Conquered</p>
              </div>
            </div>

            {/* Stats */}
            <div className="text-right space-y-2">
              <div className="flex items-center gap-2 justify-end">
                <Sparkles size={16} className="text-amber-400" />
                <span className="text-amber-400 font-bold">{trophyStats.totalXPEarned.toLocaleString()}</span>
                <span className="text-white/40 text-sm">XP</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Target size={16} className="text-white/40" />
                <span className="text-white/60 text-sm">
                  {trophyStats.overallProgress}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="mt-4">
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trophyStats.overallProgress}%` }}
                transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <div className="px-4 pb-4">
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'All', count: eraProgress.length },
            { id: 'completed', label: 'Completed', count: eraProgress.filter(e => e.isCompleted).length },
            { id: 'in-progress', label: 'In Progress', count: eraProgress.filter(e => !e.isCompleted && e.progressPercentage > 0).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as FilterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === tab.id
                  ? 'bg-white text-black'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 ${filter === tab.id ? 'text-black/60' : 'text-white/40'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Era List */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <AnimatePresence mode="wait">
          {filteredEras.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-64 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Filter size={24} className="text-white/30" />
              </div>
              <p className="text-white/50">No eras match this filter</p>
              <button
                onClick={() => setFilter('all')}
                className="mt-3 text-sm text-primary hover:underline"
              >
                Show all eras
              </button>
            </motion.div>
          ) : viewType === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filteredEras.map((progress, index) => (
                <EraTrophy
                  key={progress.arc.id}
                  progress={progress}
                  onClick={() => onSelectEra?.(progress.arc.id)}
                  delay={index * 0.05}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-3 gap-3"
            >
              {filteredEras.map((progress, index) => (
                <EraTrophyCompact
                  key={progress.arc.id}
                  progress={progress}
                  onClick={() => onSelectEra?.(progress.arc.id)}
                  delay={index * 0.03}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

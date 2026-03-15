/**
 * BattleCard - Individual battle card with visual states
 * Supports: locked, available, in-progress, completed, first-stop
 */

import { motion } from 'framer-motion';
import { Lock, Check, Play, Star } from 'lucide-react';
import { WW2Battle, BattleStatus } from '@/types';

interface BattleCardProps {
  battle: WW2Battle;
  status: BattleStatus;
  onClick: () => void;
  index: number;
}

export function BattleCard({ battle, status, onClick, index }: BattleCardProps) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in-progress';
  const isAvailable = status === 'available';
  const isFirstStop = battle.isFirstStop;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      disabled={isLocked}
      className={`
        relative w-full rounded-xl overflow-hidden
        transition-all duration-300
        ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${isLocked ? 'opacity-60' : 'opacity-100'}
      `}
      whileHover={!isLocked ? { scale: 1.02 } : undefined}
      whileTap={!isLocked ? { scale: 0.98 } : undefined}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {/* Battle Image */}
        <img
          src={battle.imageUrl}
          alt={battle.name}
          className={`
            w-full h-full object-cover
            ${isLocked ? 'grayscale blur-[1px]' : ''}
            transition-all duration-300
          `}
        />

        {/* Gradient Overlay */}
        <div
          className={`
            absolute inset-0
            ${isLocked
              ? 'bg-gradient-to-t from-black/80 via-black/40 to-black/20'
              : 'bg-gradient-to-t from-black/70 via-black/30 to-transparent'
            }
          `}
        />

        {/* First Stop Highlight - Pulsing Gold Border */}
        {isFirstStop && !isCompleted && (
          <>
            <motion.div
              className="absolute inset-0 border-2 sm:border-4 border-amber-400 rounded-xl pointer-events-none"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(251, 191, 36, 0.4)',
                  '0 0 0 8px rgba(251, 191, 36, 0)',
                ],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            {/* Start Here Badge */}
            <div className="absolute top-1 left-1 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-500 rounded-md shadow-lg">
              <div className="flex items-center gap-0.5 sm:gap-1">
                <Star size={10} className="sm:hidden text-white fill-white" />
                <Star size={12} className="hidden sm:block text-white fill-white" />
                <span className="text-[8px] sm:text-[10px] font-bold text-white uppercase tracking-wide">
                  Start Here
                </span>
              </div>
            </div>
          </>
        )}

        {/* Status Indicators */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Lock size={16} className="sm:hidden text-white/80" />
              <Lock size={24} className="hidden sm:block text-white/80" />
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
              <Check size={14} className="sm:hidden text-white" strokeWidth={3} />
              <Check size={18} className="hidden sm:block text-white" strokeWidth={3} />
            </div>
          </div>
        )}

        {isInProgress && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg animate-pulse">
              <Play size={12} className="sm:hidden text-white fill-white ml-0.5" />
              <Play size={16} className="hidden sm:block text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* Bottom Content */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
          {/* Chapter Label */}
          <div
            className={`
              text-[8px] sm:text-[10px] font-bold uppercase tracking-wider mb-0.5
              ${isLocked ? 'text-white/50' : 'text-amber-400'}
            `}
          >
            Chapter: {battle.name}
          </div>

          {/* Battle Name */}
          <h3
            className={`
              text-sm sm:text-lg font-bold leading-tight
              ${isLocked ? 'text-white/60' : 'text-white'}
            `}
          >
            {battle.name}
          </h3>

          {/* Subtitle - Date */}
          <p
            className={`
              text-[10px] sm:text-xs mt-0.5
              ${isLocked ? 'text-white/40' : 'text-white/70'}
            `}
          >
            {battle.subtitle}
          </p>

          {/* XP and Lessons Info */}
          <div
            className={`
              flex items-center gap-2 sm:gap-3 mt-1 sm:mt-2 text-[10px] sm:text-xs
              ${isLocked ? 'text-white/40' : 'text-white/60'}
            `}
          >
            <span>{battle.lessonCount} Lessons</span>
            <span className="text-amber-400">+{battle.xpReward} XP</span>
          </div>
        </div>
      </div>

      {/* Completed Overlay */}
      {isCompleted && (
        <div className="absolute inset-0 bg-green-500/10 pointer-events-none" />
      )}
    </motion.button>
  );
}

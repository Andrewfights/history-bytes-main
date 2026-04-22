/**
 * TheaterColumn - Column wrapper with theater banner and battle cards
 */

import { motion } from 'framer-motion';
import { WW2Theater, BattleStatus } from '@/types';
import { getBattlesByTheater } from '@/data/ww2Battles';
import { BattleCard } from './BattleCard';

interface TheaterColumnProps {
  theater: WW2Theater;
  getBattleStatus: (battleId: string) => BattleStatus;
  onBattleClick: (battleId: string) => void;
}

export function TheaterColumn({
  theater,
  getBattleStatus,
  onBattleClick,
}: TheaterColumnProps) {
  const battles = getBattlesByTheater(theater);
  const isPacific = theater === 'pacific';

  // Banner image paths
  const bannerUrl = isPacific
    ? '/assets/ww2-battles/pacific-theater-banner.png'
    : '/assets/ww2-battles/european-theater-banner.png';

  // Theater colors - using black base with subtle color tint
  const theaterColor = isPacific ? 'blue' : 'red';
  const bgGradient = isPacific
    ? 'from-blue-900/20 via-black/80 to-black'
    : 'from-red-900/20 via-black/80 to-black';

  return (
    <motion.div
      initial={{ opacity: 0, x: isPacific ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className={`
        relative flex flex-col rounded-2xl overflow-hidden
        bg-gradient-to-b ${bgGradient}
        border border-white/10
      `}
    >
      {/* Theater Banner Header */}
      <div className="relative h-12 sm:h-16 flex items-center justify-center overflow-hidden">
        {/* Banner Background */}
        <div
          className={`
            absolute inset-0
            ${isPacific ? 'bg-blue-900/40' : 'bg-red-900/40'}
          `}
        />

        {/* Banner Image */}
        <img
          src={bannerUrl}
          alt={isPacific ? 'The Pacific Theater' : 'The European Theater'}
          className="relative h-12 object-contain z-10"
          onError={(e) => {
            // Fallback to text if image fails
            e.currentTarget.style.display = 'none';
          }}
        />

        {/* Fallback Text Banner */}
        <div className="absolute inset-0 flex items-center justify-center">
          <h2
            className={`
              font-editorial text-[10px] sm:text-sm md:text-xl font-bold uppercase tracking-wider text-center px-2
              ${isPacific ? 'text-blue-200' : 'text-red-200'}
            `}
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            The {isPacific ? 'Pacific' : 'European'} Theater
          </h2>
        </div>

        {/* Decorative Border */}
        <div
          className={`
            absolute bottom-0 left-0 right-0 h-1
            ${isPacific ? 'bg-blue-500/50' : 'bg-red-500/50'}
          `}
        />
      </div>

      {/* Battle Cards with Connector Lines */}
      <div className="relative flex flex-col gap-2 sm:gap-3 p-2 sm:p-3">
        {battles.map((battle, index) => (
          <div key={battle.id} className="relative">
            {/* Connector Line (between cards) */}
            {index > 0 && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-0.5 h-3 bg-white/20" />
            )}

            {/* Connector Arrow */}
            {index > 0 && (
              <div
                className={`
                  absolute -top-2 left-1/2 transform -translate-x-1/2
                  w-2 h-2 rotate-45 border-b border-r
                  ${getBattleStatus(battle.id) === 'locked'
                    ? 'border-white/20'
                    : isPacific
                      ? 'border-blue-400/50'
                      : 'border-red-400/50'
                  }
                `}
              />
            )}

            <BattleCard
              battle={battle}
              status={getBattleStatus(battle.id)}
              onClick={() => onBattleClick(battle.id)}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Theater Progress Footer */}
      <div className="p-3 pt-0">
        <TheaterProgressBar
          theater={theater}
          battles={battles}
          getBattleStatus={getBattleStatus}
        />
      </div>
    </motion.div>
  );
}

// Progress bar for theater completion
function TheaterProgressBar({
  theater,
  battles,
  getBattleStatus,
}: {
  theater: WW2Theater;
  battles: ReturnType<typeof getBattlesByTheater>;
  getBattleStatus: (battleId: string) => BattleStatus;
}) {
  const completed = battles.filter(
    (b) => getBattleStatus(b.id) === 'completed'
  ).length;
  const percentage = (completed / battles.length) * 100;
  const isPacific = theater === 'pacific';

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] sm:text-xs text-white/50">
        <span>Progress</span>
        <span>
          {completed}/{battles.length} Complete
        </span>
      </div>
      <div className="h-1 sm:h-1.5 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className={`
            h-full rounded-full
            ${isPacific ? 'bg-blue-500' : 'bg-red-500'}
          `}
        />
      </div>
    </div>
  );
}

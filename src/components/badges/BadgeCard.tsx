import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Badge, RARITY_CONFIG } from '@/types/badges';

interface BadgeCardProps {
  badge: Badge;
  isEarned: boolean;
  isNew?: boolean;
  onClick?: () => void;
  progress?: { current: number; target: number } | null;
}

export function BadgeCard({ badge, isEarned, isNew, onClick, progress }: BadgeCardProps) {
  const rarityConfig = RARITY_CONFIG[badge.rarity];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
        isEarned
          ? `${rarityConfig.bgColor} border border-current/20`
          : 'bg-muted/50 border border-border/50'
      }`}
    >
      {/* New indicator */}
      {isNew && (
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
      )}

      {/* Badge icon */}
      <div
        className={`text-3xl mb-1.5 ${
          isEarned ? '' : 'grayscale opacity-40'
        }`}
      >
        {isEarned ? (
          badge.icon
        ) : (
          <div className="relative">
            <span className="opacity-30">{badge.icon}</span>
            <Lock size={12} className="absolute inset-0 m-auto text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Badge name */}
      <p
        className={`text-[10px] font-medium text-center leading-tight ${
          isEarned ? rarityConfig.color : 'text-muted-foreground'
        }`}
      >
        {badge.name}
      </p>

      {/* Progress bar for locked badges */}
      {!isEarned && progress && progress.target > 0 && (
        <div className="w-full mt-1.5">
          <div className="h-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary/50 rounded-full transition-all"
              style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }}
            />
          </div>
          <p className="text-[8px] text-muted-foreground/70 mt-0.5 text-center">
            {progress.current}/{progress.target}
          </p>
        </div>
      )}

      {/* Rarity shimmer for earned rare+ badges */}
      {isEarned && (badge.rarity === 'rare' || badge.rarity === 'epic' || badge.rarity === 'legendary') && (
        <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
      )}
    </motion.button>
  );
}

/**
 * EraTile - Individual clickable era tile with key art image
 * Shows era name, date range, and "Coming Soon" badge if not available
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { HistoricalEra, getEraImageUrl } from '@/data/historicalEras';

interface EraTileProps {
  era: HistoricalEra;
  size?: 'sm' | 'md' | 'lg';
  onClick: () => void;
}

const sizeClasses = {
  sm: 'h-36 sm:h-44',
  md: 'h-44 sm:h-52',
  lg: 'h-48 sm:h-56',
};

export function EraTile({ era, size = 'md', onClick }: EraTileProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getEraImageUrl(era.id);

  return (
    <motion.button
      onClick={onClick}
      className={`
        relative w-full ${sizeClasses[size]} rounded-2xl overflow-hidden
        text-left group
        ${era.isAvailable ? 'cursor-pointer' : 'cursor-pointer'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Image */}
      {!imageError && imageUrl ? (
        <img
          src={imageUrl}
          alt={era.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        // Fallback gradient when image fails
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${era.accentColor}40 0%, ${era.accentColor}80 100%)`,
          }}
        />
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Accent border on left */}
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: era.accentColor }}
      />

      {/* Coming Soon overlay */}
      {!era.isAvailable && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="absolute top-3 right-3">
            <Lock size={16} className="text-white/60" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
        {/* Coming Soon Badge */}
        {!era.isAvailable && (
          <span className="inline-block px-2 py-0.5 mb-2 rounded-full bg-white/20 text-white/80 text-[10px] font-medium uppercase tracking-wider">
            Coming Soon
          </span>
        )}

        {/* Era Name */}
        <h3 className="font-editorial font-bold text-sm sm:text-base text-white leading-tight mb-0.5">
          {era.name}
        </h3>

        {/* Date Range */}
        <p className="text-[10px] sm:text-xs text-white/60">
          {era.dateRange}
        </p>

        {/* XP Reward (if available) */}
        {era.isAvailable && era.xpReward && (
          <p className="text-[10px] text-amber-400 mt-1">
            +{era.xpReward} XP
          </p>
        )}
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${era.accentColor}20 0%, transparent 70%)`,
        }}
      />
    </motion.button>
  );
}

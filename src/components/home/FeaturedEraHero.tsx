/**
 * FeaturedEraHero - Large hero section for the featured/primary era
 * Shows full-width key art with progress and prominent CTA
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles, CheckCircle } from 'lucide-react';
import { HistoricalEra, getEraImageUrl } from '@/data/historicalEras';

interface FeaturedEraHeroProps {
  era: HistoricalEra;
  progress?: {
    completed: number;
    total: number;
    xp: number;
  };
  onStart: () => void;
  overrideImageUrl?: string; // Custom image URL (e.g., Pearl Harbor artwork from Firebase)
}

export function FeaturedEraHero({ era, progress, onStart, overrideImageUrl }: FeaturedEraHeroProps) {
  const [imageError, setImageError] = useState(false);
  // Use override image if provided, otherwise fall back to era default
  const imageUrl = overrideImageUrl || getEraImageUrl(era.id);

  const hasStarted = progress && progress.completed > 0;
  const isComplete = progress && progress.completed >= progress.total;
  const progressPercent = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <motion.button
      onClick={onStart}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden text-left group"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Background Image */}
      {!imageError && imageUrl ? (
        <img
          src={imageUrl}
          alt={era.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${era.accentColor}40 0%, ${era.accentColor}80 100%)`,
          }}
        />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Accent border */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full rounded-l"
        style={{
          background: `linear-gradient(to bottom, ${era.accentColor}, ${era.accentColor}80)`,
        }}
      />

      {/* Featured badge */}
      <div className="absolute top-3 left-4 sm:top-4 sm:left-5">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-void/60 backdrop-blur-sm border border-gold-2/30">
          <span className="text-gold-2 text-[10px]">◆</span>
          <span className="font-mono text-gold-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider">
            Featured
          </span>
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          {/* Left: Title and info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-off-white leading-tight">
                {era.name}
              </h2>
              {isComplete && (
                <CheckCircle size={18} className="text-success" />
              )}
            </div>

            <p className="text-off-white/70 text-xs sm:text-sm mb-1">
              {era.subtitle}
            </p>

            <p className="font-mono text-off-white/50 text-[10px] sm:text-xs uppercase tracking-wide">
              {era.dateRange}
            </p>

            {/* Progress section */}
            {progress && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-off-white/60 text-[10px] uppercase tracking-wide">
                    {progress.completed}/{progress.total} Lessons
                  </span>
                  {progress.xp > 0 && (
                    <span className="flex items-center gap-1 text-gold-2 font-mono text-[10px]">
                      <Sparkles size={12} />
                      {progress.xp} XP
                    </span>
                  )}
                </div>
                <div className="h-[2px] bg-void/50 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold-2 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right: CTA Button */}
          <div className="flex flex-col items-end gap-2">
            <div
              className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                shadow-lg transition-transform group-hover:scale-105
                ${isComplete
                  ? 'bg-success'
                  : hasStarted
                    ? 'bg-gold-2'
                    : 'bg-ha-red'
                }
              `}
            >
              {isComplete ? (
                <CheckCircle size={24} className="text-void" />
              ) : (
                <Play
                  size={20}
                  className="ml-0.5 text-void"
                  fill="currentColor"
                />
              )}
            </div>

            <span className={`font-mono text-[10px] sm:text-xs font-semibold uppercase tracking-wider ${
              isComplete
                ? 'text-success'
                : hasStarted
                  ? 'text-gold-2'
                  : 'text-off-white'
            }`}>
              {isComplete
                ? 'Review'
                : hasStarted
                  ? 'Continue'
                  : 'Begin'}
            </span>
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at bottom left, ${era.accentColor}30 0%, transparent 50%)`,
        }}
      />
    </motion.button>
  );
}

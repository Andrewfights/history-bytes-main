/**
 * FeaturedEraHero - Large hero section for the featured/primary era
 * Shows full-width key art with progress and prominent CTA
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { HistoricalEra, getEraImageUrl } from '@/data/historicalEras';
import { Progress } from '@/components/ui/progress';

interface FeaturedEraHeroProps {
  era: HistoricalEra;
  progress?: {
    completed: number;
    total: number;
    xp: number;
  };
  onStart: () => void;
}

export function FeaturedEraHero({ era, progress, onStart }: FeaturedEraHeroProps) {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getEraImageUrl(era.id);

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
        <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          Featured Journey
        </span>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          {/* Left: Title and info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white leading-tight">
                {era.name}
              </h2>
              {isComplete && (
                <CheckCircle size={18} className="text-green-400" />
              )}
            </div>

            <p className="text-white/70 text-xs sm:text-sm mb-1">
              {era.subtitle}
            </p>

            <p className="text-white/50 text-[10px] sm:text-xs">
              {era.dateRange}
            </p>

            {/* Progress section */}
            {progress && (
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">
                    {progress.completed}/{progress.total} Lessons
                  </span>
                  {progress.xp > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Sparkles size={12} />
                      {progress.xp} XP
                    </span>
                  )}
                </div>
                <Progress value={progressPercent} className="h-1.5" />
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
                  ? 'bg-green-500'
                  : hasStarted
                    ? 'bg-amber-500'
                    : 'bg-white'
                }
              `}
            >
              {isComplete ? (
                <CheckCircle size={24} className="text-white" />
              ) : (
                <Play
                  size={20}
                  className={`ml-0.5 ${hasStarted ? 'text-white' : 'text-black'}`}
                  fill={hasStarted ? 'white' : 'black'}
                />
              )}
            </div>

            <span className={`text-xs sm:text-sm font-semibold ${
              isComplete
                ? 'text-green-400'
                : hasStarted
                  ? 'text-amber-400'
                  : 'text-white'
            }`}>
              {isComplete
                ? 'Review'
                : hasStarted
                  ? 'Continue'
                  : 'Start'}
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

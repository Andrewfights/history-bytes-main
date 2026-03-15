/**
 * FeaturedGameHero - Large hero card for the daily featured game
 * Similar to FeaturedEraHero component in home section
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Gamepad2 } from 'lucide-react';
import { ArcadeGame, XP_CAP_PLAYS } from '@/data/arcadeGames';

interface FeaturedGameHeroProps {
  game: ArcadeGame;
  imageUrl?: string;
  playsToday: number;
  onPlay: () => void;
}

export function FeaturedGameHero({
  game,
  imageUrl,
  playsToday,
  onPlay,
}: FeaturedGameHeroProps) {
  const [imageError, setImageError] = useState(false);
  const xpCapReached = playsToday >= XP_CAP_PLAYS;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden group"
    >
      {/* Background Image or Gradient */}
      {!imageError && imageUrl ? (
        <img
          src={imageUrl}
          alt={game.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${game.accentColor}60 0%, ${game.accentColor}20 100%)`,
          }}
        />
      )}

      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />

      {/* Accent border on left */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full"
        style={{ backgroundColor: game.accentColor }}
      />

      {/* Featured Today badge - top left */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10">
        <Sparkles size={12} className="text-primary" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-primary">
          Featured Today
        </span>
      </div>

      {/* Progress dots - top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm">
        <div className="flex gap-1">
          {[0, 1, 2].map(j => (
            <div
              key={j}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                j < playsToday ? 'bg-primary' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/60 ml-1">
          {playsToday}/{XP_CAP_PLAYS}
        </span>
      </div>

      {/* Icon decoration (when no image) */}
      {(imageError || !imageUrl) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl opacity-30">
          {game.icon}
        </div>
      )}

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          {/* Text content */}
          <div className="flex-1">
            {/* XP Badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/20 text-primary text-xs font-bold">
                <Sparkles size={10} />
                2× XP Today
              </span>
              {!xpCapReached && (
                <span className="text-[10px] text-white/60">
                  +{game.xpReward * 2} XP
                </span>
              )}
            </div>

            {/* Game Title */}
            <h2 className="font-editorial text-xl sm:text-2xl font-bold text-white leading-tight mb-1">
              {game.title}
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-sm text-white/70 line-clamp-2">
              {game.description}
            </p>
          </div>

          {/* Play Now Button */}
          <motion.button
            onClick={onPlay}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            <Gamepad2 size={18} />
            Play Now
          </motion.button>
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at bottom, ${game.accentColor}15 0%, transparent 60%)`,
        }}
      />
    </motion.div>
  );
}

/**
 * GameTile - Individual clickable game tile for carousel
 * Shows game icon/image, title, and progress indicators
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2 } from 'lucide-react';
import { ArcadeGame, XP_CAP_PLAYS } from '@/data/arcadeGames';

interface GameTileProps {
  game: ArcadeGame;
  imageUrl?: string;
  playsToday: number;
  onClick: () => void;
}

export function GameTile({ game, imageUrl, playsToday, onClick }: GameTileProps) {
  const [imageError, setImageError] = useState(false);
  const xpCapReached = playsToday >= XP_CAP_PLAYS;

  return (
    <motion.button
      onClick={onClick}
      className="relative w-36 h-44 sm:w-40 sm:h-48 rounded-2xl overflow-hidden text-left group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background Image or Gradient */}
      {!imageError && imageUrl ? (
        <img
          src={imageUrl}
          alt={game.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      {/* Accent border on left */}
      <div
        className="absolute top-0 left-0 w-1 h-full"
        style={{ backgroundColor: game.accentColor }}
      />

      {/* Icon overlay (when no image or as additional decoration) */}
      {(imageError || !imageUrl) && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl opacity-60">
          {game.icon}
        </div>
      )}

      {/* Progress dots - top right */}
      <div className="absolute top-2 right-2 flex gap-0.5">
        {[0, 1, 2].map(j => (
          <div
            key={j}
            className={`w-2 h-2 rounded-full transition-colors ${
              j < playsToday ? 'bg-primary' : 'bg-white/20'
            }`}
          />
        ))}
      </div>

      {/* Content at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-3">
        {/* XP Badge */}
        {!xpCapReached ? (
          <span className="inline-block px-1.5 py-0.5 mb-1.5 rounded bg-primary/20 text-primary text-[9px] font-bold">
            +{game.xpReward} XP
          </span>
        ) : (
          <span className="inline-block px-1.5 py-0.5 mb-1.5 rounded bg-white/10 text-white/50 text-[9px] font-medium">
            Max XP
          </span>
        )}

        {/* Game Title */}
        <h3 className="font-editorial font-bold text-xs sm:text-sm text-white leading-tight line-clamp-2">
          {game.title}
        </h3>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${game.accentColor}20 0%, transparent 70%)`,
        }}
      />
    </motion.button>
  );
}

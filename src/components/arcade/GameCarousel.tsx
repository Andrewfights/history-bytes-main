/**
 * GameCarousel - Horizontal scrollable row of game tiles
 * Similar to EraCarousel component in home section
 */

import { motion } from 'framer-motion';
import { ArcadeGame, getGameImageUrl } from '@/data/arcadeGames';
import { GameTile } from './GameTile';

interface GameCarouselProps {
  title: string;
  subtitle?: string;
  games: ArcadeGame[];
  gameThumbnails: Record<string, string>;
  onSelectGame: (gameType: string) => void;
  getPlaysToday: (gameId: string) => number;
}

export function GameCarousel({
  title,
  subtitle,
  games,
  gameThumbnails,
  onSelectGame,
  getPlaysToday,
}: GameCarouselProps) {
  if (games.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="section-plaque">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Scrollable row */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scroll-snap-x hide-scrollbar scroll-smooth-touch">
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0"
          >
            <GameTile
              game={game}
              imageUrl={getGameImageUrl(game, gameThumbnails)}
              playsToday={getPlaysToday(game.id)}
              onClick={() => onSelectGame(game.type)}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

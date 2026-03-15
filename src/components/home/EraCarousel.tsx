/**
 * EraCarousel - Horizontal scrollable row of era tiles
 * Used for "Coming Soon" section with horizontal scroll
 */

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { HistoricalEra } from '@/data/historicalEras';
import { EraTile } from './EraTile';

interface EraCarouselProps {
  title: string;
  subtitle?: string;
  eras: HistoricalEra[];
  onSelectEra: (eraId: string) => void;
}

export function EraCarousel({ title, subtitle, eras, onSelectEra }: EraCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (eras.length === 0) return null;

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
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scroll-snap-x hide-scrollbar scroll-smooth-touch"
      >
        {eras.map((era, index) => (
          <motion.div
            key={era.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex-shrink-0 w-36 sm:w-44"
          >
            <EraTile
              era={era}
              size="sm"
              onClick={() => onSelectEra(era.id)}
            />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

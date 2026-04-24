/**
 * EraGrid - List layout for era tiles
 * Shows eras in a vertical stack with available/sealed states
 * Includes header with availability stats
 */

import { motion } from 'framer-motion';
import { HistoricalEra } from '@/data/historicalEras';
import { EraTile } from './EraTile';

interface EraGridProps {
  eras: HistoricalEra[];
  onSelectEra: (eraId: string) => void;
}

export function EraGrid({ eras, onSelectEra }: EraGridProps) {
  const availableCount = eras.filter(e => e.isAvailable).length;
  const sealedCount = eras.filter(e => !e.isAvailable).length;

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex items-end justify-between gap-4 pb-4 border-b border-off-white/10 relative flex-wrap">
        {/* Red accent line */}
        <div className="absolute bottom-0 left-0 w-20 h-[2px] bg-red-600" />

        <div className="flex flex-col gap-1">
          <div
            className="flex items-center gap-2"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.35em',
              color: '#CD0E14',
              fontWeight: 700,
              textTransform: 'uppercase'
            }}
          >
            <span className="w-4 h-[1px] bg-red-600" />
            Campaign · {eras.length} Historical Arcs
          </div>
          <h2 className="font-serif italic font-bold text-2xl sm:text-3xl text-off-white">
            All <em className="text-gold-2">Eras</em>
          </h2>
        </div>

        {/* Stats */}
        <div
          className="flex items-center gap-3"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            fontWeight: 600
          }}
        >
          {/* Available stat */}
          <div className="flex items-center gap-1.5" style={{ color: '#F6E355' }}>
            <span
              className="w-[7px] h-[7px] rounded-full animate-pulse"
              style={{
                background: '#E6AB2A',
                boxShadow: '0 0 8px rgba(230,171,42,0.7)'
              }}
            />
            {availableCount} Available
          </div>
          <span style={{ color: 'rgba(242,238,230,0.32)' }}>·</span>
          {/* Sealed stat */}
          <div className="flex items-center gap-1.5" style={{ color: 'rgba(242,238,230,0.5)' }}>
            <span
              className="w-[7px] h-[7px] rounded-full opacity-65"
              style={{ background: '#8A0A0E' }}
            />
            {sealedCount} Sealed
          </div>
        </div>
      </div>

      {/* Era List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-2.5"
      >
        {eras.map((era, index) => (
          <motion.div
            key={era.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <EraTile
              era={era}
              onClick={() => era.isAvailable ? onSelectEra(era.id) : undefined}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

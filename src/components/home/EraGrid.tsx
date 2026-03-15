/**
 * EraGrid - Grid layout for era tiles
 * 2 columns on mobile, 3 on tablet, responsive gap
 */

import { motion } from 'framer-motion';
import { HistoricalEra } from '@/data/historicalEras';
import { EraTile } from './EraTile';

interface EraGridProps {
  eras: HistoricalEra[];
  onSelectEra: (eraId: string) => void;
}

export function EraGrid({ eras, onSelectEra }: EraGridProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
    >
      {eras.map((era, index) => (
        <motion.div
          key={era.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <EraTile
            era={era}
            size="md"
            onClick={() => onSelectEra(era.id)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * CountryTooltip - Hover/tap info panel for countries
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Clock, Star } from 'lucide-react';
import { WW2Country, FACTION_COLORS } from '@/data/ww2Countries';
import { CountryProgressStatus } from './CountryPath';

interface CountryTooltipProps {
  country: WW2Country | null;
  status: CountryProgressStatus | null;
  position: { x: number; y: number } | null;
}

export function CountryTooltip({ country, status, position }: CountryTooltipProps) {
  if (!country || !position) return null;

  const isLocked = status === 'locked';
  const isComplete = status === 'complete';

  // Get faction label
  const factionLabel = {
    allies: 'Allied Powers',
    axis: 'Axis Powers',
    neutral: 'Neutral Nation',
  }[country.faction];

  // Get status label
  const statusLabel = {
    locked: 'Locked',
    available: 'Available',
    'in-progress': 'In Progress',
    complete: 'Completed',
  }[status || 'locked'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute z-50 pointer-events-none"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -100%) translateY(-12px)',
        }}
      >
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 min-w-[180px] max-w-[240px]">
          {/* Country name and flag */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{country.flagEmoji}</span>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{country.name}</h3>
              <span
                className="text-xs font-medium"
                style={{ color: FACTION_COLORS[country.faction].base }}
              >
                {factionLabel}
              </span>
            </div>
            {isLocked && (
              <Lock size={14} className="text-muted-foreground" />
            )}
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
            {country.briefDescription}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>{country.estimatedTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star size={12} className="text-gold-primary" />
              <span>{country.xpAvailable} XP</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-2 pt-2 border-t border-border">
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                isComplete
                  ? 'bg-success/20 text-success'
                  : isLocked
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary/20 text-primary'
              }`}
            >
              {statusLabel}
            </span>
          </div>

          {/* Arrow pointer */}
          <div
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full"
            style={{
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid hsl(var(--border))',
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

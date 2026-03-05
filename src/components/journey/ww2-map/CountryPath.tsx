/**
 * CountryPath - Interactive SVG path for a single country
 */

import { motion } from 'framer-motion';
import { WW2Country, FACTION_COLORS } from '@/data/ww2Countries';

export type CountryProgressStatus = 'locked' | 'available' | 'in-progress' | 'complete';

interface CountryPathProps {
  country: WW2Country;
  status: CountryProgressStatus;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (countryId: string) => void;
  onHover: (countryId: string | null) => void;
}

export function CountryPath({
  country,
  status,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}: CountryPathProps) {
  const isLocked = status === 'locked';
  const isComplete = status === 'complete';
  const isInProgress = status === 'in-progress';

  // Get fill color based on faction and status
  const getFillColor = () => {
    if (isLocked) return '#374151'; // Gray for locked
    if (isComplete) return FACTION_COLORS[country.faction].complete;
    return FACTION_COLORS[country.faction].base;
  };

  // Get stroke color based on state
  const getStrokeColor = () => {
    if (isSelected) return '#FFD700'; // Gold for selected
    if (isInProgress) return '#F59E0B'; // Amber for in-progress
    if (isComplete) return '#22C55E'; // Green for complete
    if (isHovered && !isLocked) return '#FFFFFF';
    return '#1F2937'; // Dark gray default
  };

  const handleClick = () => {
    if (!isLocked) {
      onSelect(country.id);
    }
  };

  return (
    <motion.path
      d={country.svgPath}
      fill={getFillColor()}
      stroke={getStrokeColor()}
      strokeWidth={isSelected || isInProgress ? 2 : isHovered ? 1.5 : 0.5}
      initial={{ opacity: 0 }}
      animate={{
        opacity: isLocked ? 0.4 : 1,
        scale: isHovered && !isLocked ? 1.02 : 1,
      }}
      whileHover={!isLocked ? { filter: 'brightness(1.2)' } : {}}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      onMouseEnter={() => onHover(country.id)}
      onMouseLeave={() => onHover(null)}
      style={{
        cursor: isLocked ? 'not-allowed' : 'pointer',
        transformOrigin: `${country.centerPoint.x}px ${country.centerPoint.y}px`,
      }}
      className="transition-all"
    />
  );
}

// Checkmark overlay for completed countries
interface CompletionOverlayProps {
  country: WW2Country;
  isComplete: boolean;
}

export function CompletionOverlay({ country, isComplete }: CompletionOverlayProps) {
  if (!isComplete) return null;

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
    >
      <circle
        cx={country.centerPoint.x}
        cy={country.centerPoint.y}
        r={8}
        fill="#22C55E"
        stroke="#FFFFFF"
        strokeWidth={1}
      />
      <path
        d={`M ${country.centerPoint.x - 3} ${country.centerPoint.y} L ${country.centerPoint.x - 1} ${country.centerPoint.y + 3} L ${country.centerPoint.x + 4} ${country.centerPoint.y - 3}`}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.g>
  );
}

// Pulse animation for available countries
interface AvailablePulseProps {
  country: WW2Country;
  isAvailable: boolean;
}

export function AvailablePulse({ country, isAvailable }: AvailablePulseProps) {
  if (!isAvailable) return null;

  return (
    <motion.circle
      cx={country.centerPoint.x}
      cy={country.centerPoint.y}
      r={6}
      fill="none"
      stroke={FACTION_COLORS[country.faction].base}
      strokeWidth={2}
      initial={{ r: 4, opacity: 1 }}
      animate={{ r: 12, opacity: 0 }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

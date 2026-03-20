/**
 * CountryModal - Pre-launch modal with country details
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Star, BookOpen, ChevronRight, CheckCircle2 } from 'lucide-react';
import { WW2Country, FACTION_COLORS } from '@/data/ww2Countries';
import { CountryProgressStatus } from './CountryPath';

interface CountryModalProps {
  country: WW2Country | null;
  status: CountryProgressStatus | null;
  isOpen: boolean;
  onClose: () => void;
  onStartJourney: (countryId: string) => void;
}

export function CountryModal({
  country,
  status,
  isOpen,
  onClose,
  onStartJourney,
}: CountryModalProps) {
  if (!country) return null;

  const isComplete = status === 'complete';
  const isInProgress = status === 'in-progress';

  // Get faction display info
  const factionInfo = {
    allies: { label: 'Allied Powers', color: FACTION_COLORS.allies.base },
    axis: { label: 'Axis Powers', color: FACTION_COLORS.axis.base },
    neutral: { label: 'Neutral Nation', color: FACTION_COLORS.neutral.base },
  }[country.faction];

  // Get status display info
  const statusInfo = {
    free: 'Independent',
    occupied: 'Occupied',
    annexed: 'Annexed',
  }[country.status];

  const handleStart = () => {
    onStartJourney(country.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-x-4 z-50 max-w-md mx-auto max-h-[70vh] overflow-y-auto"
            style={{ bottom: 'max(6rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
          >
            <div className="bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
              {/* Header with faction color accent */}
              <div
                className="h-2"
                style={{ backgroundColor: factionInfo.color }}
              />

              {/* Content */}
              <div className="p-6">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
                >
                  <X size={16} />
                </button>

                {/* Country header */}
                <div className="flex items-start gap-4 mb-4">
                  <span className="text-4xl">{country.flagEmoji}</span>
                  <div className="flex-1">
                    <h2 className="font-editorial text-2xl font-bold mb-1">
                      {country.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm font-medium"
                        style={{ color: factionInfo.color }}
                      >
                        {factionInfo.label}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-sm text-muted-foreground">
                        {statusInfo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-muted-foreground mb-6">
                  {country.briefDescription}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <BookOpen size={20} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Modules</p>
                    <p className="font-bold">3</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Clock size={20} className="mx-auto mb-1 text-primary" />
                    <p className="text-xs text-muted-foreground">Est. Time</p>
                    <p className="font-bold">{country.estimatedTime}</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <Star size={20} className="mx-auto mb-1 text-gold-primary" />
                    <p className="text-xs text-muted-foreground">XP Available</p>
                    <p className="font-bold">{country.xpAvailable}</p>
                  </div>
                </div>

                {/* Completion status */}
                {isComplete && (
                  <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg border border-success/30 mb-4">
                    <CheckCircle2 size={20} className="text-success" />
                    <span className="text-sm font-medium text-success">
                      Journey Completed
                    </span>
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  <button
                    onClick={handleStart}
                    className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    {isComplete ? 'Replay Journey' : isInProgress ? 'Continue Journey' : 'Start Journey'}
                    <ChevronRight size={20} />
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Map
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

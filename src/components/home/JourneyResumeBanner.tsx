/**
 * JourneyResumeBanner - Compact banner for quick journey resume
 * Only shows when journey is in progress (started but not complete)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ChevronRight } from 'lucide-react';
import { usePearlHarborProgress } from '@/components/journey/pearl-harbor/hooks/usePearlHarborProgress';
import { PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';

const DISMISS_KEY = 'hb_journey_banner_dismissed';

interface JourneyResumeBannerProps {
  onResume: () => void;
}

export function JourneyResumeBanner({ onResume }: JourneyResumeBannerProps) {
  const { progress, isLoading } = usePearlHarborProgress();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for dismissed state on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      // Reset dismissed state daily
      const dismissedDate = new Date(dismissed).toDateString();
      const today = new Date().toDateString();
      if (dismissedDate !== today) {
        localStorage.removeItem(DISMISS_KEY);
      } else {
        setIsDismissed(true);
      }
    }
  }, []);

  // Count completed lessons (beats use ph-beat- prefix)
  const completedLessons = progress.completedActivities.filter(
    id => id.startsWith('ph-beat-')
  ).length;

  const totalLessons = PEARL_HARBOR_LESSONS.length;
  const hasStarted = completedLessons > 0 || progress.unlockedLessons.length > 0;
  const isComplete = completedLessons >= totalLessons;

  // Only show if in progress (started but not complete) and not dismissed
  const shouldShow = hasStarted && !isComplete && !isDismissed && !isLoading;

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    localStorage.setItem(DISMISS_KEY, new Date().toISOString());
  };

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.button
          onClick={onResume}
          initial={{ opacity: 0, y: -20, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -20, height: 0 }}
          className="w-full relative overflow-hidden rounded-xl border border-gold-2/30 bg-ink-lift mb-4"
        >
          {/* Left gold accent bar */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gold-2 rounded-l-xl" />

          {/* Pearl Harbor background artwork */}
          <div className="absolute inset-0">
            <img
              src="/assets/ww2-battles/pearl-harbor.png"
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-void/85 via-void/65 to-void/45" />
          </div>

          <div className="relative flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gold-2/20 flex items-center justify-center border border-gold-2/30">
                <Zap size={16} className="text-gold-2" />
              </div>
              <div className="text-left">
                <p className="font-serif text-sm font-semibold text-off-white">
                  Continue: Pearl Harbor
                </p>
                <p className="font-mono text-[10px] text-off-white/60 uppercase tracking-wide">
                  {completedLessons}/{totalLessons} lessons complete
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ChevronRight size={18} className="text-gold-2" />
              <button
                onClick={handleDismiss}
                className="p-1.5 rounded-full hover:bg-off-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X size={14} className="text-off-white/50" />
              </button>
            </div>
          </div>

          {/* Progress bar at bottom */}
          <div className="relative h-[2px] bg-void/50">
            <motion.div
              className="h-full bg-gold-2"
              initial={{ width: 0 }}
              animate={{ width: `${(completedLessons / totalLessons) * 100}%` }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/**
 * JourneyCard - Featured journey entry card for the home page
 * Shows Pearl Harbor journey with progress and one-tap entry
 */

import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { usePearlHarborProgress } from '@/components/journey/pearl-harbor/hooks/usePearlHarborProgress';
import { PEARL_HARBOR_LESSONS } from '@/data/pearlHarborLessons';
import { Progress } from '@/components/ui/progress';

interface JourneyCardProps {
  onEnterJourney: () => void;
}

export function JourneyCard({ onEnterJourney }: JourneyCardProps) {
  const { progress, totalXP, isLoading } = usePearlHarborProgress();

  // Count completed lessons (beats use ph-beat- prefix)
  const completedLessons = progress.completedActivities.filter(
    id => id.startsWith('ph-beat-')
  ).length;

  const totalLessons = PEARL_HARBOR_LESSONS.length;
  const progressPercent = Math.round((completedLessons / totalLessons) * 100);
  const isComplete = completedLessons >= totalLessons;
  const hasStarted = completedLessons > 0 || progress.unlockedLessons.length > 0;

  if (isLoading) {
    return (
      <div className="archival-card animate-pulse h-32" />
    );
  }

  return (
    <motion.button
      onClick={onEnterJourney}
      className="w-full archival-card relative overflow-hidden text-left group"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Gradient accent on left */}
      <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-l" />

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="pl-5 pr-4 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🎖️</span>
              <h3 className="font-editorial font-bold text-lg text-foreground">
                Pearl Harbor
              </h3>
              {isComplete && (
                <CheckCircle size={16} className="text-green-400" />
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              December 7, 1941 — "A Date Which Will Live in Infamy"
            </p>
          </div>

          <ArrowRight
            size={20}
            className="text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all mt-1"
          />
        </div>

        {/* Progress section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {hasStarted ? `${completedLessons}/${totalLessons} Lessons` : '7 Interactive Lessons'}
            </span>
            {totalXP > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <Sparkles size={14} />
                {totalXP} XP
              </span>
            )}
          </div>

          {hasStarted && (
            <Progress value={progressPercent} className="h-2" />
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-sm font-semibold ${
            isComplete
              ? 'text-green-400'
              : hasStarted
                ? 'text-amber-400'
                : 'text-primary'
          }`}>
            {isComplete
              ? 'Review Campaign'
              : hasStarted
                ? 'Continue Campaign'
                : 'Start Campaign'}
          </span>
          <ArrowRight size={14} className={
            isComplete
              ? 'text-green-400'
              : hasStarted
                ? 'text-amber-400'
                : 'text-primary'
          } />
        </div>
      </div>
    </motion.button>
  );
}

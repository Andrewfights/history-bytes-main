import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Calendar } from 'lucide-react';
import { useThisDay } from '@/hooks/useThisDay';
import { useApp } from '@/context/AppContext';
import { HistoricalEvent } from '@/data/thisDayData';

interface ThisDayCardProps {
  onNavigateToArc?: (arcId: string) => void;
}

const categoryColors: Record<HistoricalEvent['category'], string> = {
  warfare: 'text-red-400',
  politics: 'text-blue-400',
  science: 'text-cyan-400',
  culture: 'text-purple-400',
  exploration: 'text-emerald-400',
  revolution: 'text-orange-400',
};

export function ThisDayCard({ onNavigateToArc }: ThisDayCardProps) {
  const {
    currentEvent,
    currentIndex,
    events,
    nextEvent,
    prevEvent,
    goToEvent,
    hasMultiple,
    dateDisplay,
  } = useThisDay();

  const { setActiveTab } = useApp();

  const handleExploreRelated = () => {
    if (currentEvent?.relatedArcId) {
      // Navigate to Journey tab - the arc detail view
      setActiveTab('journey');
      if (onNavigateToArc) {
        onNavigateToArc(currentEvent.relatedArcId);
      }
    }
  };

  // Fallback if no events for today
  if (!currentEvent) {
    return (
      <div className="archival-card relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent rounded-l" />
        <div className="pl-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{dateDisplay}</span>
          </div>
          <h3 className="font-editorial font-bold text-base mb-1.5">
            This Day in History
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explore historical events that shaped our world. Check back tomorrow for more history!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="archival-card relative overflow-hidden">
      {/* Gradient accent */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary/40 via-primary/20 to-transparent rounded-l" />

      <div className="pl-4">
        {/* Date header */}
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{dateDisplay}</span>
          {hasMultiple && (
            <span className="text-[10px] text-muted-foreground/70">
              {currentIndex + 1} of {events.length}
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Year display */}
            <p className="year-display text-4xl text-primary mb-1">
              {currentEvent.year}
            </p>

            {/* Title */}
            <h3 className="font-editorial font-bold text-base mb-1.5">
              {currentEvent.title}
            </h3>

            {/* Category tag */}
            <span className={`text-[10px] uppercase tracking-wider font-medium ${categoryColors[currentEvent.category]}`}>
              {currentEvent.category}
            </span>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              {currentEvent.description}
            </p>

            {/* Link to related journey content */}
            {currentEvent.relatedArcId && (
              <button
                onClick={handleExploreRelated}
                className="mt-3 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors group"
              >
                <span>Explore this topic</span>
                <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls */}
        {hasMultiple && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
            {/* Dot indicators */}
            <div className="flex gap-1.5">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToEvent(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === currentIndex
                      ? 'w-4 bg-primary'
                      : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                  aria-label={`Go to event ${i + 1}`}
                />
              ))}
            </div>

            {/* Arrow controls */}
            <div className="flex gap-1">
              <button
                onClick={prevEvent}
                className="p-1.5 rounded hover:bg-muted transition-colors"
                aria-label="Previous event"
              >
                <ChevronLeft size={14} className="text-muted-foreground" />
              </button>
              <button
                onClick={nextEvent}
                className="p-1.5 rounded hover:bg-muted transition-colors"
                aria-label="Next event"
              >
                <ChevronRight size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

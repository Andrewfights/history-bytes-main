/**
 * InteractiveMap - Reusable map component with hotspots and timeline scrubber
 * Used in Beat 1 (Road to War), Beat 3 (Tora! Tora! Tora!), Beat 9 (Arsenal of Democracy)
 */

import { useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Clock, ImageOff } from 'lucide-react';

export interface MapHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  label: string;
  icon?: string;
  content: ReactNode;
  pulseColor?: string;
}

export interface TimelineEvent {
  time: string;
  label: string;
  x: number;
  y: number;
  description?: string;
}

export interface TimelineMarker {
  time: string;
  events: TimelineEvent[];
}

interface InteractiveMapProps {
  mapImage: string;
  hotspots: MapHotspot[];
  timeline?: TimelineMarker[];
  onHotspotView?: (id: string) => void;
  onTimelineChange?: (time: string) => void;
  onAllHotspotsViewed?: () => void;
  viewedHotspots?: Set<string>;
  className?: string;
}

export function InteractiveMap({
  mapImage,
  hotspots,
  timeline,
  onHotspotView,
  onTimelineChange,
  onAllHotspotsViewed,
  viewedHotspots = new Set(),
  className = '',
}: InteractiveMapProps) {
  const [selectedHotspot, setSelectedHotspot] = useState<MapHotspot | null>(null);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [localViewedHotspots, setLocalViewedHotspots] = useState<Set<string>>(viewedHotspots);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleHotspotClick = useCallback((hotspot: MapHotspot) => {
    setSelectedHotspot(hotspot);

    if (!localViewedHotspots.has(hotspot.id)) {
      const newViewed = new Set(localViewedHotspots);
      newViewed.add(hotspot.id);
      setLocalViewedHotspots(newViewed);
      onHotspotView?.(hotspot.id);

      // Check if all hotspots have been viewed
      if (newViewed.size === hotspots.length) {
        onAllHotspotsViewed?.();
      }
    }
  }, [localViewedHotspots, hotspots.length, onHotspotView, onAllHotspotsViewed]);

  const handleCloseDetail = () => {
    setSelectedHotspot(null);
  };

  const handleTimelineChange = (index: number) => {
    if (timeline && index >= 0 && index < timeline.length) {
      setCurrentTimeIndex(index);
      onTimelineChange?.(timeline[index].time);
    }
  };

  const currentTimelineEvents = timeline?.[currentTimeIndex]?.events || [];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Map Container */}
      <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden bg-slate-900">
        {/* Map Image or Placeholder */}
        {imageError || !mapImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white/60">
            <ImageOff size={48} className="mb-3 text-white/40" />
            <p className="text-sm">Map image not available</p>
            <p className="text-xs text-white/40 mt-1">Upload an image in the admin panel</p>
          </div>
        ) : (
          <img
            src={mapImage}
            alt="Interactive Map"
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}

        {/* Darkening overlay for better hotspot visibility */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Hotspots */}
        {hotspots.map((hotspot) => {
          const isViewed = localViewedHotspots.has(hotspot.id);
          return (
            <motion.button
              key={hotspot.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              onClick={() => handleHotspotClick(hotspot)}
            >
              {/* Pulse ring */}
              {!isViewed && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: hotspot.pulseColor || 'rgb(251, 191, 36)' }}
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.6, 0, 0.6],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Hotspot button */}
              <div
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isViewed
                    ? 'bg-green-500 border-2 border-green-300'
                    : 'bg-amber-500 border-2 border-amber-300 hover:scale-110'
                }`}
              >
                {hotspot.icon ? (
                  <span className="text-lg">{hotspot.icon}</span>
                ) : (
                  <span className="text-white font-bold text-sm">
                    {isViewed ? '✓' : '+'}
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}

        {/* Timeline Events (if timeline mode) */}
        <AnimatePresence>
          {currentTimelineEvents.map((event, index) => (
            <motion.div
              key={`${event.time}-${index}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: index * 0.1 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${event.x}%`, top: `${event.y}%` }}
            >
              <div className="relative">
                {/* Event marker */}
                <motion.div
                  className="w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />

                {/* Event label */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className="px-2 py-1 bg-black/80 text-white text-xs rounded font-medium">
                    {event.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Progress indicator */}
        <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 rounded-full">
          <span className="text-white text-xs font-medium">
            {localViewedHotspots.size}/{hotspots.length} explored
          </span>
        </div>
      </div>

      {/* Timeline Scrubber */}
      {timeline && timeline.length > 0 && (
        <div className="mt-4 px-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleTimelineChange(currentTimeIndex - 1)}
              disabled={currentTimeIndex === 0}
              className="p-2 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="flex-1">
              {/* Timeline track */}
              <div className="relative h-2 bg-white/20 rounded-full">
                <motion.div
                  className="absolute h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentTimeIndex + 1) / timeline.length) * 100}%`
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Timeline markers */}
                {timeline.map((marker, index) => (
                  <button
                    key={marker.time}
                    onClick={() => handleTimelineChange(index)}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                    style={{ left: `${((index + 0.5) / timeline.length) * 100}%` }}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 transition-all ${
                        index <= currentTimeIndex
                          ? 'bg-amber-500 border-amber-300'
                          : 'bg-slate-700 border-slate-500'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Current time label */}
              <div className="mt-2 flex items-center justify-center gap-2">
                <Clock size={14} className="text-amber-400" />
                <span className="text-white font-mono text-sm">
                  {timeline[currentTimeIndex].time}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleTimelineChange(currentTimeIndex + 1)}
              disabled={currentTimeIndex === timeline.length - 1}
              className="p-2 rounded-full bg-white/10 text-white disabled:opacity-30 hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Hotspot Detail Modal */}
      <AnimatePresence>
        {selectedHotspot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60"
              onClick={handleCloseDetail}
            />

            {/* Detail Card */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-xl p-5 max-w-sm w-full border border-white/10 shadow-2xl"
            >
              {/* Close button */}
              <button
                onClick={handleCloseDetail}
                className="absolute top-3 right-3 p-1 text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                {selectedHotspot.icon && (
                  <span className="text-3xl">{selectedHotspot.icon}</span>
                )}
                <h3 className="font-bold text-white text-lg">
                  {selectedHotspot.label}
                </h3>
              </div>

              {/* Content */}
              <div className="text-white/80 text-sm leading-relaxed">
                {selectedHotspot.content}
              </div>

              {/* Got it button */}
              <button
                onClick={handleCloseDetail}
                className="mt-5 w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg transition-colors"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * InteractiveMapPlayer - Renders an interactive map with clickable hotspots
 * Used in games and journey experiences
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, ExternalLink, Info, ChevronRight } from 'lucide-react';
import { InteractiveMap, MapHotspot, getMapById } from '@/data/interactiveMaps';

interface InteractiveMapPlayerProps {
  mapId?: string;
  map?: InteractiveMap;
  onHotspotClick?: (hotspot: MapHotspot) => void;
  onNavigate?: (route: string) => void;
  onLessonStart?: (lessonId: string) => void;
  onQuizStart?: (quizId: string) => void;
  completedHotspots?: Set<string>;
  className?: string;
}

export function InteractiveMapPlayer({
  mapId,
  map: providedMap,
  onHotspotClick,
  onNavigate,
  onLessonStart,
  onQuizStart,
  completedHotspots = new Set(),
  className = '',
}: InteractiveMapPlayerProps) {
  // Get map from ID or use provided map
  const map = providedMap || (mapId ? getMapById(mapId) : null);

  // State
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<MapHotspot | null>(null);
  const [showInfo, setShowInfo] = useState<MapHotspot | null>(null);
  const [playingMedia, setPlayingMedia] = useState<{ type: 'audio' | 'video'; url: string } | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Handle hotspot click
  const handleHotspotClick = useCallback((hotspot: MapHotspot) => {
    // Call external handler if provided
    onHotspotClick?.(hotspot);

    // Handle action based on type
    switch (hotspot.action.type) {
      case 'info':
        setShowInfo(hotspot);
        break;

      case 'modal':
        setActiveModal(hotspot);
        break;

      case 'navigate':
        if (hotspot.action.route) {
          onNavigate?.(hotspot.action.route);
        }
        break;

      case 'lesson':
        if (hotspot.action.lessonId) {
          onLessonStart?.(hotspot.action.lessonId);
        }
        break;

      case 'quiz':
        if (hotspot.action.quizId) {
          onQuizStart?.(hotspot.action.quizId);
        }
        break;

      case 'audio':
        if (hotspot.action.mediaUrl) {
          setPlayingMedia({ type: 'audio', url: hotspot.action.mediaUrl });
        }
        break;

      case 'video':
        if (hotspot.action.mediaUrl) {
          setPlayingMedia({ type: 'video', url: hotspot.action.mediaUrl });
        }
        break;

      case 'link':
        if (hotspot.action.linkUrl) {
          window.open(hotspot.action.linkUrl, hotspot.action.linkTarget || '_blank');
        }
        break;
    }
  }, [onHotspotClick, onNavigate, onLessonStart, onQuizStart]);

  if (!map) {
    return (
      <div className={`flex items-center justify-center p-8 bg-muted rounded-xl ${className}`}>
        <p className="text-muted-foreground">Map not found</p>
      </div>
    );
  }

  // Filter visible hotspots
  const visibleHotspots = map.hotspots.filter(h => {
    if (!h.isVisible) return false;
    if (h.showOnHover) return hoveredHotspot === h.id;
    return map.showAllHotspots || !h.isLocked;
  });

  return (
    <div className={`relative ${className}`}>
      {/* Map Image */}
      <div className="relative overflow-hidden rounded-xl">
        <img
          src={map.imageUrl}
          alt={map.name}
          className="w-full h-auto"
          draggable={false}
        />

        {/* Hotspots */}
        {visibleHotspots.map(hotspot => {
          const isHovered = hoveredHotspot === hotspot.id;
          const isCompleted = completedHotspots.has(hotspot.id);

          return (
            <motion.button
              key={hotspot.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: hotspot.style?.hoverScale || 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleHotspotClick(hotspot)}
              onMouseEnter={() => setHoveredHotspot(hotspot.id)}
              onMouseLeave={() => setHoveredHotspot(null)}
              disabled={hotspot.isLocked}
              className={`absolute transition-all cursor-pointer ${
                hotspot.shape === 'circle' ? 'rounded-full' : 'rounded-lg'
              } ${hotspot.isLocked ? 'opacity-50 cursor-not-allowed' : ''} ${
                isCompleted ? 'ring-2 ring-green-500' : ''
              }`}
              style={{
                left: `${hotspot.x - hotspot.width / 2}%`,
                top: `${hotspot.y - hotspot.height / 2}%`,
                width: `${hotspot.width}%`,
                height: `${hotspot.height}%`,
                backgroundColor: isHovered
                  ? (hotspot.style?.hoverBackgroundColor || 'rgba(59, 130, 246, 0.5)')
                  : (hotspot.style?.backgroundColor || 'rgba(59, 130, 246, 0.3)'),
                borderWidth: hotspot.style?.borderWidth || 2,
                borderStyle: 'solid',
                borderColor: isHovered
                  ? (hotspot.style?.hoverBorderColor || 'rgba(59, 130, 246, 1)')
                  : (hotspot.style?.borderColor || 'rgba(59, 130, 246, 0.8)'),
                opacity: hotspot.style?.opacity || 0.9,
              }}
            >
              {/* Pulse animation */}
              {hotspot.style?.pulseAnimation && !isCompleted && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    backgroundColor: hotspot.style?.borderColor || 'rgba(59, 130, 246, 0.5)',
                  }}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}

              {/* Icon */}
              {hotspot.iconEmoji && (
                <span className="absolute inset-0 flex items-center justify-center text-lg sm:text-xl">
                  {hotspot.iconEmoji}
                </span>
              )}

              {/* Completed checkmark */}
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </motion.button>
          );
        })}

        {/* Tooltip for hovered hotspot */}
        <AnimatePresence>
          {hoveredHotspot && (() => {
            const hotspot = map.hotspots.find(h => h.id === hoveredHotspot);
            if (!hotspot || !hotspot.tooltipText) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute z-20 px-3 py-2 bg-black/90 text-white text-sm rounded-lg shadow-lg pointer-events-none max-w-xs"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y - hotspot.height / 2 - 2}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                {hotspot.tooltipText}
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Label overlays */}
        {visibleHotspots.filter(h => h.showLabel).map(hotspot => (
          <div
            key={`label-${hotspot.id}`}
            className="absolute z-10 pointer-events-none"
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y + hotspot.height / 2 + 1}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <span className="px-2 py-0.5 rounded bg-black/70 text-white text-xs whitespace-nowrap">
              {hotspot.label}
            </span>
          </div>
        ))}
      </div>

      {/* Info Popup */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setShowInfo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl p-5 max-w-sm w-full shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                {showInfo.iconEmoji && (
                  <span className="text-3xl">{showInfo.iconEmoji}</span>
                )}
                <div>
                  <h3 className="font-bold text-lg">{showInfo.label}</h3>
                </div>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {showInfo.action.infoText}
              </p>

              <button
                onClick={() => setShowInfo(null)}
                className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-medium"
              >
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Image */}
              {activeModal.action.modalImageUrl && (
                <img
                  src={activeModal.action.modalImageUrl}
                  alt={activeModal.label}
                  className="w-full h-48 object-cover"
                />
              )}

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {activeModal.iconEmoji && (
                      <span className="text-3xl">{activeModal.iconEmoji}</span>
                    )}
                    <h3 className="font-bold text-xl">
                      {activeModal.action.modalTitle || activeModal.label}
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveModal(null)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {activeModal.action.modalContent}
                </p>

                <button
                  onClick={() => setActiveModal(null)}
                  className="mt-6 w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audio/Video Player */}
      <AnimatePresence>
        {playingMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
            onClick={() => setPlayingMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setPlayingMedia(null)}
                className="absolute -top-10 right-0 p-2 text-white hover:text-white/80"
              >
                <X size={24} />
              </button>

              {playingMedia.type === 'audio' ? (
                <div className="bg-card rounded-xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Volume2 size={32} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Audio Playing</p>
                      <p className="text-sm text-muted-foreground">Click anywhere to close</p>
                    </div>
                  </div>
                  <audio
                    ref={audioRef}
                    src={playingMedia.url}
                    controls
                    autoPlay
                    className="w-full"
                    onEnded={() => setPlayingMedia(null)}
                  />
                </div>
              ) : (
                <video
                  ref={videoRef}
                  src={playingMedia.url}
                  controls
                  autoPlay
                  className="w-full rounded-xl"
                  onEnded={() => setPlayingMedia(null)}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

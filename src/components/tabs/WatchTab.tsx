import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Play, ChevronUp, ChevronDown } from 'lucide-react';
import { watchCategories, isYouTubeUrl } from '@/data/watchData';
import { HistoryLogo } from '@/components/brand';
import { useApp } from '@/context/AppContext';

const SWIPE_THRESHOLD = 50;

// Filter chip names matching design
const FILTER_NAMES: Record<string, string> = {
  'modern': 'World',
  'classical': 'Classical',
  'medieval': 'Medieval',
  'renaissance': 'Renaissance',
  'ancient': 'Ancient',
};

export function WatchTab() {
  const { streak } = useApp();
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCategory = watchCategories[categoryIndex];
  const currentVideo = currentCategory?.videos[videoIndex];
  const nextVideo = currentCategory?.videos[videoIndex + 1];

  // Play video when it changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay may be blocked, user can tap to play
      });
    }
  }, [categoryIndex, videoIndex]);

  const goToNextVideo = useCallback(() => {
    if (!currentCategory) return;
    if (videoIndex < currentCategory.videos.length - 1) {
      setDirection('up');
      setVideoIndex(prev => prev + 1);
      setIsPlaying(false);
    }
  }, [currentCategory, videoIndex]);

  const goToPrevVideo = useCallback(() => {
    if (videoIndex > 0) {
      setDirection('down');
      setVideoIndex(prev => prev - 1);
      setIsPlaying(false);
    }
  }, [videoIndex]);

  const goToNextCategory = useCallback(() => {
    if (categoryIndex < watchCategories.length - 1) {
      setDirection('left');
      setCategoryIndex(prev => prev + 1);
      setVideoIndex(0);
      setIsPlaying(false);
    }
  }, [categoryIndex]);

  const goToPrevCategory = useCallback(() => {
    if (categoryIndex > 0) {
      setDirection('right');
      setCategoryIndex(prev => prev - 1);
      setVideoIndex(0);
      setIsPlaying(false);
    }
  }, [categoryIndex]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;

    // Vertical swipe (change video within category)
    if (Math.abs(offset.y) > Math.abs(offset.x)) {
      if (offset.y < -SWIPE_THRESHOLD || velocity.y < -500) {
        goToNextVideo();
      } else if (offset.y > SWIPE_THRESHOLD || velocity.y > 500) {
        goToPrevVideo();
      }
    }
    // Horizontal swipe (change category)
    else {
      if (offset.x < -SWIPE_THRESHOLD || velocity.x < -500) {
        goToNextCategory();
      } else if (offset.x > SWIPE_THRESHOLD || velocity.x > 500) {
        goToPrevCategory();
      }
    }
  }, [goToNextVideo, goToPrevVideo, goToNextCategory, goToPrevCategory]);

  const toggleLike = useCallback(() => {
    if (!currentVideo) return;
    setIsLiked(prev => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }));
  }, [currentVideo]);

  const toggleSave = useCallback(() => {
    if (!currentVideo) return;
    setIsSaved(prev => ({ ...prev, [currentVideo.id]: !prev[currentVideo.id] }));
  }, [currentVideo]);

  const togglePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          goToPrevVideo();
          break;
        case 'ArrowDown':
          e.preventDefault();
          goToNextVideo();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrevCategory();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextCategory();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextVideo, goToPrevVideo, goToNextCategory, goToPrevCategory, togglePlayPause]);

  if (!currentVideo) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black">
        <p className="text-off-white/50 font-mono text-sm">No videos available</p>
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: string | null) => ({
      y: dir === 'up' ? '100%' : dir === 'down' ? '-100%' : 0,
      x: dir === 'left' ? '100%' : dir === 'right' ? '-100%' : 0,
      opacity: 0,
    }),
    center: {
      y: 0,
      x: 0,
      opacity: 1,
    },
    exit: (dir: string | null) => ({
      y: dir === 'up' ? '-100%' : dir === 'down' ? '100%' : 0,
      x: dir === 'left' ? '-100%' : dir === 'right' ? '100%' : 0,
      opacity: 0,
    }),
  };

  return (
    <div
      ref={containerRef}
      className="h-[calc(100vh-4rem)] md:h-[calc(100vh-3.5rem)] overflow-hidden bg-black relative"
    >
      {/* Header - ink background with border */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-ink border-b border-off-white/[0.06]">
        {/* Top row with logo and controls */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2">
            <HistoryLogo variant="icon" size="sm" />
            <div className="w-px h-4 bg-gold/30" />
          </div>
          <div className="flex items-center gap-2">
            {/* Streak indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-card border border-off-white/[0.06]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-gold">
                <path d="M12 2s1 3 3 5 3 4 3 7a6 6 0 1 1-12 0c0-2 1-4 2-5s2-3 2-5 1-2 2-2z"/>
              </svg>
              <span className="font-mono text-[10px] text-gold font-semibold tracking-wider">{streak}</span>
            </div>
            {/* Settings */}
            <button className="w-8 h-8 bg-card border border-off-white/[0.06] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-off-white/70">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
              </svg>
            </button>
            {/* Profile */}
            <button className="w-8 h-8 bg-card border border-off-white/[0.06] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-off-white/70">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Filter chips - rectangular style */}
        <div className="flex items-center gap-1.5 px-4 pb-2.5 overflow-x-auto scrollbar-hide">
          {watchCategories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              onClick={() => {
                setDirection(idx > categoryIndex ? 'left' : 'right');
                setCategoryIndex(idx);
                setVideoIndex(0);
                setIsPlaying(false);
              }}
              className={`px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.15em] font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                idx === categoryIndex
                  ? 'bg-gold text-[#1a1008] border border-gold'
                  : 'bg-card border border-off-white/[0.06] text-off-white/60 hover:border-gold/40'
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {FILTER_NAMES[cat.id] || cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main video area - 9:16 feed */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${currentCategory.id}-${currentVideo.id}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {isYouTubeUrl(currentVideo.videoUrl) ? (
              <div className="relative w-full h-full">
                <iframe
                  src={currentVideo.videoUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ border: 'none' }}
                />
                {/* Overlay to capture swipe gestures */}
                <div className="absolute top-0 left-0 right-16 h-20 bg-transparent" style={{ pointerEvents: 'auto' }} />
                <div className="absolute bottom-0 left-0 right-16 h-40 bg-transparent" style={{ pointerEvents: 'auto' }} />
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src={currentVideo.videoUrl}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                  onClick={togglePlayPause}
                />
                {/* Center play button - red square with white border */}
                {!isPlaying && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-ha-red border-2 border-off-white flex items-center justify-center z-10"
                    onClick={togglePlayPause}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-off-white ml-0.5">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Action buttons on right side - smaller, circular with blur */}
      <div className="absolute right-2.5 bottom-24 z-20 flex flex-col items-center gap-3.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); toggleLike(); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all ${
            isLiked[currentVideo.id]
              ? 'bg-ha-red shadow-[0_0_15px_rgba(205,14,20,0.5)]'
              : 'bg-black/60 backdrop-blur-sm border border-off-white/15'
          }`}>
            <svg viewBox="0 0 24 24" fill={isLiked[currentVideo.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-off-white">
              <path d="M12 21s-7-6-7-12a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 6-7 12-7 12z"/>
            </svg>
          </div>
          <span className="font-mono text-[8px] text-off-white font-semibold uppercase tracking-[0.15em]">Like</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); toggleSave(); }}
          className="flex flex-col items-center gap-0.5"
        >
          <div className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all ${
            isSaved[currentVideo.id]
              ? 'bg-gold shadow-[0_0_15px_rgba(230,171,42,0.4)]'
              : 'bg-black/60 backdrop-blur-sm border border-off-white/15'
          }`}>
            <svg viewBox="0 0 24 24" fill={isSaved[currentVideo.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className={`w-3.5 h-3.5 ${isSaved[currentVideo.id] ? 'text-void' : 'text-off-white'}`}>
              <path d="M5 3v18l7-4 7 4V3z"/>
            </svg>
          </div>
          <span className="font-mono text-[8px] text-off-white font-semibold uppercase tracking-[0.15em]">Save</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="w-[34px] h-[34px] rounded-full bg-black/60 backdrop-blur-sm border border-off-white/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-off-white">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <path d="M8.6 10.5L15.4 6.5M8.6 13.5L15.4 17.5"/>
            </svg>
          </div>
          <span className="font-mono text-[8px] text-off-white font-semibold uppercase tracking-[0.15em]">Share</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="w-[34px] h-[34px] rounded-full bg-black/60 backdrop-blur-sm border border-off-white/15 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5 text-off-white">
              <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16v.01"/>
            </svg>
          </div>
          <span className="font-mono text-[8px] text-off-white font-semibold uppercase tracking-[0.15em]">Facts</span>
        </motion.button>
      </div>

      {/* Video info overlay at bottom */}
      <div className="absolute bottom-3.5 left-3.5 right-[70px] z-20">
        <motion.div
          key={currentVideo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Next indicator tag */}
          {nextVideo && (
            <div
              className="inline-block mb-1.5 px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] uppercase font-bold text-gold border border-off-white/[0.06]"
              style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
            >
              ◆ Next
            </div>
          )}

          <h2
            className="font-oswald text-lg font-bold text-off-white uppercase leading-none mb-1.5 tracking-tight"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            {currentVideo.title}
          </h2>
          <p
            className="text-[11px] text-off-white/85 line-clamp-2 leading-relaxed"
            style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
          >
            {currentVideo.description}
          </p>
        </motion.div>
      </div>

      {/* Navigation hints */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 text-off-white/30">
        {videoIndex > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <ChevronUp size={20} />
            <span className="text-[9px] font-mono uppercase">Prev</span>
          </motion.div>
        )}
      </div>

      <div className="absolute left-4 bottom-32 z-10 flex flex-col items-center gap-1 text-off-white/30">
        {currentCategory && videoIndex < currentCategory.videos.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-[9px] font-mono uppercase">Next</span>
            <ChevronDown size={20} />
          </motion.div>
        )}
      </div>

      {/* Video position indicator */}
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1.5">
        {currentCategory?.videos.slice(0, 8).map((_, idx) => (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all ${
              idx === videoIndex ? 'h-5 bg-gold' : 'h-3 bg-off-white/20'
            }`}
          />
        ))}
        {currentCategory && currentCategory.videos.length > 8 && (
          <span className="font-mono text-[8px] text-off-white/40 text-center">+{currentCategory.videos.length - 8}</span>
        )}
      </div>
    </div>
  );
}

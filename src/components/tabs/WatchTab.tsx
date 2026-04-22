import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Heart, Share2, Bookmark, MessageCircle, ChevronUp, ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { watchCategories, isYouTubeUrl } from '@/data/watchData';

const SWIPE_THRESHOLD = 50;

export function WatchTab() {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | 'left' | 'right' | null>(null);
  const [isLiked, setIsLiked] = useState<Record<string, boolean>>({});
  const [isSaved, setIsSaved] = useState<Record<string, boolean>>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentCategory = watchCategories[categoryIndex];
  const currentVideo = currentCategory?.videos[videoIndex];

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
    }
  }, [currentCategory, videoIndex]);

  const goToPrevVideo = useCallback(() => {
    if (videoIndex > 0) {
      setDirection('down');
      setVideoIndex(prev => prev - 1);
    }
  }, [videoIndex]);

  const goToNextCategory = useCallback(() => {
    if (categoryIndex < watchCategories.length - 1) {
      setDirection('left');
      setCategoryIndex(prev => prev + 1);
      setVideoIndex(0);
    }
  }, [categoryIndex]);

  const goToPrevCategory = useCallback(() => {
    if (categoryIndex > 0) {
      setDirection('right');
      setCategoryIndex(prev => prev - 1);
      setVideoIndex(0);
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
    } else {
      videoRef.current.pause();
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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">No videos available</p>
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
      {/* Category indicator at top */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-void/80 to-transparent">
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {watchCategories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              onClick={() => {
                setDirection(idx > categoryIndex ? 'left' : 'right');
                setCategoryIndex(idx);
                setVideoIndex(0);
              }}
              className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase tracking-wide font-medium transition-all whitespace-nowrap ${
                idx === categoryIndex
                  ? 'bg-gold-2 text-void'
                  : 'border border-off-white/20 text-off-white/70 hover:border-gold-2/40'
              }`}
              animate={{ scale: idx === categoryIndex ? 1 : 0.9 }}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main video area */}
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
              {/* Overlay to capture swipe gestures without blocking video interaction */}
              <div
                className="absolute top-0 left-0 right-16 h-16 bg-transparent"
                style={{ pointerEvents: 'auto' }}
              />
              <div
                className="absolute bottom-0 left-0 right-16 h-32 bg-transparent"
                style={{ pointerEvents: 'auto' }}
              />
            </div>
          ) : (
            <video
              ref={videoRef}
              src={currentVideo.videoUrl}
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlayPause}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Video info overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-16 z-20 p-4 pb-6 bg-gradient-to-t from-void/90 via-void/50 to-transparent">
        <motion.div
          key={currentVideo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-serif text-lg font-bold text-off-white leading-tight mb-1">
            {currentVideo.title}
          </h2>
          <p className="text-sm text-off-white/70 line-clamp-2">
            {currentVideo.description}
          </p>
          <div className="flex items-center gap-3 mt-2 font-mono text-[10px] text-off-white/50 uppercase tracking-wide">
            <span>{currentVideo.duration}</span>
            {currentVideo.views && (
              <span>
                {currentVideo.views >= 1000000
                  ? `${(currentVideo.views / 1000000).toFixed(1)}M views`
                  : `${(currentVideo.views / 1000).toFixed(0)}K views`}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Action buttons on right side */}
      <div className="absolute right-2 bottom-24 z-20 flex flex-col items-center gap-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); toggleLike(); }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            isLiked[currentVideo.id] ? 'bg-ha-red' : 'bg-off-white/10 backdrop-blur-sm border border-off-white/10'
          }`}>
            <Heart
              size={22}
              className={isLiked[currentVideo.id] ? 'text-off-white fill-off-white' : 'text-off-white'}
            />
          </div>
          <span className="font-mono text-[9px] text-off-white/70 uppercase tracking-wide">Like</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); toggleSave(); }}
          className="flex flex-col items-center gap-1"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            isSaved[currentVideo.id] ? 'bg-gold-2' : 'bg-off-white/10 backdrop-blur-sm border border-off-white/10'
          }`}>
            <Bookmark
              size={22}
              className={isSaved[currentVideo.id] ? 'text-void fill-void' : 'text-off-white'}
            />
          </div>
          <span className="font-mono text-[9px] text-off-white/70 uppercase tracking-wide">Save</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-off-white/10 backdrop-blur-sm border border-off-white/10 flex items-center justify-center">
            <Share2 size={22} className="text-off-white" />
          </div>
          <span className="font-mono text-[9px] text-off-white/70 uppercase tracking-wide">Share</span>
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1"
        >
          <div className="w-11 h-11 rounded-full bg-off-white/10 backdrop-blur-sm border border-off-white/10 flex items-center justify-center">
            <MessageCircle size={22} className="text-off-white" />
          </div>
          <span className="font-mono text-[9px] text-off-white/70 uppercase tracking-wide">Facts</span>
        </motion.button>
      </div>

      {/* Navigation hints */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex flex-col items-center gap-1 text-white/40">
        {videoIndex > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <ChevronUp size={20} />
            <span className="text-[10px]">Prev</span>
          </motion.div>
        )}
      </div>

      <div className="absolute left-4 bottom-32 z-10 flex flex-col items-center gap-1 text-white/40">
        {currentCategory && videoIndex < currentCategory.videos.length - 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-[10px]">Next</span>
            <ChevronDown size={20} />
          </motion.div>
        )}
      </div>

      {/* Video position indicator */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-1">
        {currentCategory?.videos.map((_, idx) => (
          <div
            key={idx}
            className={`w-1 h-4 rounded-full transition-all ${
              idx === videoIndex ? 'bg-gold-2' : 'bg-off-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

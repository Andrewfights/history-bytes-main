import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onEnded?: () => void;
  onProgress?: (percent: number) => void;
  className?: string;
  showControls?: boolean;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  onEnded,
  onProgress,
  className,
  showControls = true,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(muted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const hideControlsTimeout = useRef<NodeJS.Timeout>();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  const handleSeek = useCallback((value: number[]) => {
    if (!videoRef.current) return;
    const time = (value[0] / 100) * duration;
    videoRef.current.currentTime = time;
    setProgress(value[0]);
  }, [duration]);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    const prog = (current / dur) * 100;
    setProgress(prog);
    setCurrentTime(current);
    onProgress?.(prog);
  }, [onProgress]);

  const handleLoadedMetadata = useCallback(() => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onEnded?.();
  }, [onEnded]);

  const showControlsTemporarily = useCallback(() => {
    setShowControlsOverlay(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControlsOverlay(false);
      }
    }, 3000);
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden group',
        className
      )}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
      />

      {/* Play/Pause overlay - larger touch target for mobile */}
      <AnimatePresence>
        {!isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={togglePlay}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 sm:w-16 sm:h-16 rounded-full bg-primary/90 flex items-center justify-center active:bg-primary transition-colors"
            >
              <Play size={32} className="text-primary-foreground ml-1" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls overlay - improved mobile touch targets */}
      {showControls && (
        <AnimatePresence>
          {showControlsOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent"
            >
              {/* Progress bar - larger touch target on mobile */}
              <div className="mb-3 sm:mb-2">
                <Slider
                  value={[progress]}
                  min={0}
                  max={100}
                  step={0.1}
                  onValueChange={handleSeek}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4 sm:[&_[role=slider]]:h-3 sm:[&_[role=slider]]:w-3 touch-none"
                />
              </div>

              {/* Controls row - larger touch targets for mobile */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-3">
                  <button
                    onClick={togglePlay}
                    className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-primary active:text-primary transition-colors"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={22} className="sm:w-5 sm:h-5" /> : <Play size={22} className="sm:w-5 sm:h-5" />}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-primary active:text-primary transition-colors"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={22} className="sm:w-5 sm:h-5" /> : <Volume2 size={22} className="sm:w-5 sm:h-5" />}
                  </button>

                  <span className="text-xs sm:text-xs text-white/80 font-mono ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <button
                  onClick={toggleFullscreen}
                  className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-primary active:text-primary transition-colors"
                  aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isFullscreen ? <Minimize size={22} className="sm:w-5 sm:h-5" /> : <Maximize size={22} className="sm:w-5 sm:h-5" />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

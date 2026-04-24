/**
 * VideoPlayer - Video player component for lesson intros and historical footage
 * Features auto-play, fade-in, and completion callbacks
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward, Maximize, Loader2 } from 'lucide-react';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  className?: string;
}

export function VideoPlayer({
  src,
  poster,
  title,
  autoPlay = true,
  loop = false,
  muted: initialMuted = false,
  onComplete,
  onSkip,
  showSkip = true,
  className = '',
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastInteractionRef = useRef<number>(Date.now());

  // Auto-hide controls after inactivity when playing
  useEffect(() => {
    // Clear any existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = null;
    }

    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    // Set timeout to hide controls after 2.5 seconds of no interaction
    controlsTimeoutRef.current = setTimeout(() => {
      const timeSinceInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceInteraction >= 2400) {
        setShowControls(false);
      }
    }, 2500);

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, showControls]);

  // Handle video events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(video.duration);
      if (autoPlay) {
        video.play().catch(() => {
          // Autoplay was blocked - show play button
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete && !loop) {
        onComplete();
      }
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [autoPlay, loop, onComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle any user interaction (mouse or touch)
  const handleInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
    if (!showControls) {
      setShowControls(true);
    }
  }, [showControls]);

  if (hasError) {
    return (
      <div className={`relative bg-black rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <p className="text-white/60 mb-4">Video unavailable</p>
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`relative bg-black rounded-xl overflow-hidden ${className}`}
      onClick={handleInteraction}
      onMouseMove={handleInteraction}
      onTouchStart={handleInteraction}
      onTouchMove={handleInteraction}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop={loop}
        muted={isMuted}
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black flex items-center justify-center"
          >
            <Loader2 size={48} className="text-white/50 animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Title Overlay */}
      {title && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4">
          <p className="text-white font-bold">{title}</p>
        </div>
      )}

      {/* Controls Overlay */}
      <AnimatePresence>
        {showControls && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          >
            {/* Center Play Button */}
            {!isPlaying && (
              <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                <Play size={32} className="text-white ml-1" />
              </button>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              {/* Progress Bar */}
              <div
                className="h-1 bg-white/20 rounded-full mb-3 cursor-pointer"
                onClick={handleSeek}
              >
                <motion.div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Controls Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 text-white/80 hover:text-white"
                    aria-label={isPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white/80 hover:text-white"
                    aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <span className="text-white/60 text-sm">
                    {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {showSkip && onSkip && (
                    <button
                      onClick={onSkip}
                      className="px-3 py-1 rounded-lg bg-white/10 text-white/80 text-sm hover:bg-white/20 flex items-center gap-1"
                      aria-label="Skip video"
                    >
                      <SkipForward size={16} />
                      Skip
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default VideoPlayer;

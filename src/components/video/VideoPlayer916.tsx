import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, SkipForward } from 'lucide-react';

interface VideoPlayer916Props {
  /** Video source URL */
  src: string;
  /** Poster/thumbnail image URL */
  poster?: string;
  /** Title to display */
  title?: string;
  /** Label indicator (e.g. "◆ 9:16 Lesson Video") */
  label?: string;
  /** Called when video ends */
  onComplete?: () => void;
  /** Called when skip button is pressed */
  onSkip?: () => void;
  /** Show skip button */
  showSkipButton?: boolean;
  /** Skip button text */
  skipText?: string;
  /** Auto-play on mount */
  autoPlay?: boolean;
  /** Loop video */
  loop?: boolean;
  /** Initial muted state */
  initialMuted?: boolean;
}

export function VideoPlayer916({
  src,
  poster,
  title,
  label = '◆ 9:16 Lesson Video',
  onComplete,
  onSkip,
  showSkipButton = true,
  skipText = 'Skip',
  autoPlay = false,
  loop = false,
  initialMuted = true,
}: VideoPlayer916Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Handle play/pause
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

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  }, []);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [onComplete]);

  // Auto-play
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked - user will need to click play
      });
    }
  }, [autoPlay]);

  // Hide controls after inactivity
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true);
      return;
    }

    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isPlaying, currentTime]);

  // Show controls on interaction
  const handleInteraction = () => {
    setShowControls(true);
  };

  // Seek on progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    videoRef.current.currentTime = percentage * duration;
  };

  return (
    <div
      className="relative w-full h-full bg-void flex items-center justify-center overflow-hidden"
      onClick={handleInteraction}
      onMouseMove={handleInteraction}
    >
      {/* Video element - centered for 9:16 aspect ratio */}
      <div className="relative w-full max-w-[450px] aspect-[9/16]">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop={loop}
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover rounded-xl"
          onClick={togglePlayPause}
        />

        {/* Placeholder overlay when not playing */}
        <AnimatePresence>
          {!isPlaying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-void/60 rounded-xl"
            >
              <button
                onClick={togglePlayPause}
                className="w-20 h-20 rounded-full bg-off-white/20 backdrop-blur-sm border border-off-white/30 flex items-center justify-center mb-4"
              >
                <Play size={32} className="text-off-white ml-1" fill="currentColor" />
              </button>
              {label && (
                <span className="font-mono text-[10px] text-gold-2 uppercase tracking-wider">
                  {label}
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 left-4 right-4"
            >
              <div
                className="h-1 bg-off-white/20 rounded-full cursor-pointer overflow-hidden"
                onClick={handleProgressClick}
              >
                <div
                  className="h-full bg-gold-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 font-mono text-[10px] text-off-white/50">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
            >
              {/* Audio toggle */}
              <button
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-off-white/10 backdrop-blur-sm border border-off-white/15 flex items-center justify-center"
              >
                {isMuted ? (
                  <VolumeX size={18} className="text-off-white/70" />
                ) : (
                  <Volume2 size={18} className="text-off-white" />
                )}
              </button>

              {/* Play/Pause button */}
              <button
                onClick={togglePlayPause}
                className="w-14 h-14 rounded-full bg-off-white/20 backdrop-blur-sm border border-off-white/30 flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause size={24} className="text-off-white" />
                ) : (
                  <Play size={24} className="text-off-white ml-0.5" fill="currentColor" />
                )}
              </button>

              {/* Skip button */}
              {showSkipButton && onSkip ? (
                <button
                  onClick={onSkip}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-off-white/10 backdrop-blur-sm border border-off-white/15 font-mono text-xs text-off-white/70 uppercase tracking-wider"
                >
                  {skipText}
                  <SkipForward size={14} />
                </button>
              ) : (
                <div className="w-10" /> // Spacer for alignment
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Corner decorations */}
        <div className="absolute top-2 left-2 w-5 h-5 border-l-2 border-t-2 border-gold-2/30 rounded-tl pointer-events-none" />
        <div className="absolute top-2 right-2 w-5 h-5 border-r-2 border-t-2 border-gold-2/30 rounded-tr pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-5 h-5 border-l-2 border-b-2 border-gold-2/30 rounded-bl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-5 h-5 border-r-2 border-b-2 border-gold-2/30 rounded-br pointer-events-none" />
      </div>

      {/* Title overlay at top */}
      {title && (
        <div className="absolute top-4 left-4 right-4 text-center">
          <h3 className="font-serif text-lg font-bold text-off-white">{title}</h3>
        </div>
      )}
    </div>
  );
}

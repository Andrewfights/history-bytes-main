/**
 * PreModuleVideoScreen - Full-screen video player for pre-module intro videos
 * Shows an explainer/introduction video before a beat begins
 *
 * Features:
 * - Tap anywhere to play/pause
 * - Always visible skip button and scrub bar
 * - Works with both 9:16 and 16:9 videos
 * - Clean, uniform design for mobile and desktop
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, Volume2, VolumeX, Pause } from 'lucide-react';
import type { PreModuleVideoConfig } from '@/lib/firestore';

interface PreModuleVideoScreenProps {
  config: PreModuleVideoConfig;
  beatTitle: string;
  onComplete: () => void;
}

export function PreModuleVideoScreen({ config, beatTitle, onComplete }: PreModuleVideoScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCenterIcon, setShowCenterIcon] = useState(false);

  const handlePlay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  }, []);

  const handlePause = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
    // Show center icon briefly
    setShowCenterIcon(true);
    setTimeout(() => setShowCenterIcon(false), 800);
  }, [isPlaying, handlePause, handlePlay]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setDuration(total);
      setProgress((current / total) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    onComplete();
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  }, [onComplete]);

  const handleVideoTap = useCallback((e: React.MouseEvent) => {
    // Don't toggle if clicking on controls area
    if ((e.target as HTMLElement).closest('.controls-area')) return;

    if (hasStarted) {
      handleTogglePlay();
    } else {
      handlePlay();
    }
  }, [hasStarted, handleTogglePlay, handlePlay]);

  // Scrub bar interaction
  const handleScrub = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!progressBarRef.current || !videoRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const newTime = percent * videoRef.current.duration;

    videoRef.current.currentTime = newTime;
    setProgress(percent * 100);
    setCurrentTime(newTime);
  }, []);

  // Format time as M:SS
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pt-safe bg-black flex flex-col z-[60]">
      {/* Video Container */}
      <div
        className="flex-1 relative flex items-center justify-center min-h-0 cursor-pointer"
        onClick={handleVideoTap}
      >
        <video
          ref={videoRef}
          src={config.videoUrl}
          className="max-w-full max-h-full w-auto h-auto"
          style={{ objectFit: 'contain' }}
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Pre-play overlay - before video starts */}
        <AnimatePresence>
          {!hasStarted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70 flex flex-col items-center justify-center"
            >
              {/* Title */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-8 px-6"
              >
                <h2 className="text-white text-xl sm:text-2xl font-bold mb-2">
                  {config.title || beatTitle}
                </h2>
                <p className="text-white/60 text-sm sm:text-base">
                  Tap to play
                </p>
              </motion.div>

              {/* Large Play Button */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center"
              >
                <Play size={48} className="text-white ml-2" fill="white" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center play/pause icon - shows briefly on tap */}
        <AnimatePresence>
          {showCenterIcon && hasStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="w-20 h-20 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                {isPlaying ? (
                  <Pause size={40} className="text-white" />
                ) : (
                  <Play size={40} className="text-white ml-1" fill="white" />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Controls Bar - Always visible */}
      <div
        className="controls-area shrink-0 bg-gradient-to-t from-black via-black/95 to-black/80 px-4 pt-4"
        style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
      >
        {/* Scrub Bar - Interactive */}
        <div
          ref={progressBarRef}
          onClick={handleScrub}
          onTouchMove={handleScrub}
          className="relative h-8 flex items-center cursor-pointer group mb-3"
        >
          {/* Track background */}
          <div className="absolute inset-x-0 h-1.5 bg-white/20 rounded-full group-hover:h-2 transition-all" />

          {/* Progress fill */}
          <div
            className="absolute left-0 h-1.5 bg-purple-500 rounded-full group-hover:h-2 transition-all"
            style={{ width: `${progress}%` }}
          />

          {/* Scrub handle */}
          <div
            className="absolute w-4 h-4 bg-white rounded-full shadow-lg transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between text-xs text-white/50 mb-4">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Control buttons row */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mute button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors"
          >
            {isMuted ? (
              <VolumeX size={22} className="text-white" />
            ) : (
              <Volume2 size={22} className="text-white" />
            )}
          </button>

          {/* Center: Play/Pause button */}
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:bg-white/90 active:bg-white/80 transition-colors shadow-lg"
          >
            {isPlaying ? (
              <Pause size={28} className="text-black" />
            ) : (
              <Play size={28} className="text-black ml-1" fill="black" />
            )}
          </button>

          {/* Right: Skip button */}
          <button
            onClick={handleSkip}
            className="h-12 px-5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center gap-2 transition-colors"
          >
            <span className="text-white text-sm font-medium">Skip</span>
            <SkipForward size={18} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

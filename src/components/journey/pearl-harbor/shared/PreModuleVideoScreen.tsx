/**
 * PreModuleVideoScreen - Full-screen video player for pre-module intro videos
 * Shows an explainer/introduction video before a beat begins
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, SkipForward, Volume2, VolumeX, Pause } from 'lucide-react';
import type { PreModuleVideoConfig } from '@/lib/firestore';

interface PreModuleVideoScreenProps {
  config: PreModuleVideoConfig;
  beatTitle: string;
  onComplete: () => void;
}

export function PreModuleVideoScreen({ config, beatTitle, onComplete }: PreModuleVideoScreenProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  // Auto-hide controls after 3 seconds of play
  useEffect(() => {
    if (isPlaying && hasStarted) {
      const timer = setTimeout(() => setShowControls(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, hasStarted]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    }
  };

  const handlePause = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(percent);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    onComplete();
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onComplete();
  };

  const handleScreenTap = () => {
    setShowControls(true);
    if (hasStarted) {
      handleTogglePlay();
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Video Container */}
      <div
        className="flex-1 relative flex items-center justify-center"
        onClick={handleScreenTap}
      >
        <video
          ref={videoRef}
          src={config.videoUrl}
          className="w-full h-full object-contain"
          playsInline
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Pre-play overlay */}
        {!hasStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 flex flex-col items-center justify-center"
          >
            {/* Title */}
            {config.title && (
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white text-xl font-bold mb-2 text-center px-4"
              >
                {config.title}
              </motion.h2>
            )}

            <motion.p
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-sm mb-8 text-center px-4"
            >
              Introduction to {beatTitle}
            </motion.p>

            {/* Play Button - larger touch target for mobile */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', damping: 15 }}
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 active:bg-white/40 transition-colors"
            >
              <Play size={40} className="text-white ml-1 sm:w-12 sm:h-12" fill="white" />
            </motion.button>

            {/* Skip option */}
            {(config.skipAllowed !== false) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSkip();
                }}
                className="mt-8 text-white/50 hover:text-white/80 text-sm flex items-center gap-2 transition-colors"
              >
                <SkipForward size={16} />
                Skip introduction
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Playing controls overlay */}
        {hasStarted && showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none"
          >
            {/* Center play/pause - larger touch target for mobile */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTogglePlay();
                }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center active:bg-black/50 transition-colors"
              >
                {isPlaying ? (
                  <Pause size={32} className="text-white sm:w-10 sm:h-10" />
                ) : (
                  <Play size={32} className="text-white ml-1 sm:w-10 sm:h-10" fill="white" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Bottom controls bar - improved mobile touch targets and safe area */}
      <div
        className="bg-black/80 backdrop-blur-sm border-t border-white/10 px-4 py-3"
        style={{ paddingBottom: 'max(0.75rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
      >
        {/* Progress bar - taller for easier touch interaction */}
        <div className="h-2 bg-white/20 rounded-full mb-3 overflow-hidden touch-none">
          <motion.div
            className="h-full bg-purple-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          {/* Mute toggle - larger touch target */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 -m-1 text-white/60 hover:text-white active:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
          </button>

          {/* Title - responsive text size */}
          <div className="text-center flex-1 min-w-0">
            <p className="text-white/60 text-xs sm:text-sm truncate px-2">
              {config.title || `Introduction to ${beatTitle}`}
            </p>
          </div>

          {/* Skip button - larger touch target */}
          {(config.skipAllowed !== false) && (
            <button
              onClick={handleSkip}
              className="px-3 py-2 text-white/60 hover:text-white active:text-white text-sm flex items-center gap-1.5 transition-colors min-h-[44px]"
            >
              Skip
              <SkipForward size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

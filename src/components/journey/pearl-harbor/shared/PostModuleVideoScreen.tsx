/**
 * PostModuleVideoScreen - Minimal video player for post-module completion videos
 * Design: Gold bracket corners, Oswald title, cream play button, gold progress bar
 */

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, Volume2, VolumeX, Pause, Trophy } from 'lucide-react';
import type { PostModuleVideoConfig } from '@/lib/firestore';

interface PostModuleVideoScreenProps {
  config: PostModuleVideoConfig;
  beatTitle: string;
  onComplete: () => void;
}

export function PostModuleVideoScreen({ config, beatTitle, onComplete }: PostModuleVideoScreenProps) {
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
    if ((e.target as HTMLElement).closest('.controls-area')) return;
    if (hasStarted) {
      handleTogglePlay();
    } else {
      handlePlay();
    }
  }, [hasStarted, handleTogglePlay, handlePlay]);

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

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 pt-safe bg-void flex flex-col z-[60]">
      {/* Video Container */}
      <div
        className="flex-1 relative flex items-center justify-center min-h-0 cursor-pointer p-4 sm:p-6 md:p-8"
        onClick={handleVideoTap}
      >
        {/* Video frame with bracket corners - constrained to fit viewport */}
        <div className="relative max-w-full max-h-full flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {/* Gold bracket corners */}
          <svg className="absolute -top-[7px] -left-[7px] w-[18px] h-[18px] z-10 pointer-events-none" viewBox="0 0 18 18">
            <path d="M0 8 L0 0 L8 0" stroke="#E6AB2A" strokeWidth="1.8" fill="none" strokeOpacity="0.85"/>
          </svg>
          <svg className="absolute -top-[7px] -right-[7px] w-[18px] h-[18px] z-10 pointer-events-none" viewBox="0 0 18 18" style={{ transform: 'scaleX(-1)' }}>
            <path d="M0 8 L0 0 L8 0" stroke="#E6AB2A" strokeWidth="1.8" fill="none" strokeOpacity="0.85"/>
          </svg>
          <svg className="absolute -bottom-[7px] -left-[7px] w-[18px] h-[18px] z-10 pointer-events-none" viewBox="0 0 18 18" style={{ transform: 'scaleY(-1)' }}>
            <path d="M0 8 L0 0 L8 0" stroke="#E6AB2A" strokeWidth="1.8" fill="none" strokeOpacity="0.85"/>
          </svg>
          <svg className="absolute -bottom-[7px] -right-[7px] w-[18px] h-[18px] z-10 pointer-events-none" viewBox="0 0 18 18" style={{ transform: 'scale(-1)' }}>
            <path d="M0 8 L0 0 L8 0" stroke="#E6AB2A" strokeWidth="1.8" fill="none" strokeOpacity="0.85"/>
          </svg>

          <video
            ref={videoRef}
            src={config.videoUrl}
            className="rounded-[3px]"
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 180px)',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              boxShadow: '0 0 0 1px rgba(230,171,42,0.18), 0 0 0 5px rgba(10,6,3,0.9), 0 20px 50px rgba(0,0,0,0.8)'
            }}
            playsInline
            muted={isMuted}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Pre-play overlay */}
          <AnimatePresence>
            {!hasStarted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70 flex flex-col items-center justify-center rounded-[3px]"
              >
                {/* Trophy Icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', damping: 12 }}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gold-br to-gold-dp flex items-center justify-center mb-3"
                >
                  <Trophy size={24} className="text-void sm:w-7 sm:h-7" />
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-6 px-6"
                >
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-[0.02em] text-off-white drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
                    {config.title || 'Beat Complete!'}
                  </h2>
                  <p className="font-serif italic text-off-white/70 text-sm mt-1">
                    {beatTitle}
                  </p>
                  <p className="font-serif italic text-off-white/40 text-xs mt-2 drop-shadow-[0_1px_6px_rgba(0,0,0,0.6)]">
                    Tap to play
                  </p>
                </motion.div>

                {/* Large Play Button */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                  className="w-[62px] h-[62px] sm:w-[72px] sm:h-[72px] rounded-full bg-white/10 backdrop-blur-[10px] border-[1.5px] border-white/80 flex items-center justify-center cursor-pointer shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
                >
                  <div className="w-0 h-0 border-l-[15px] sm:border-l-[18px] border-l-off-white border-y-[10px] sm:border-y-[12px] border-y-transparent ml-1 sm:ml-1.5" />
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
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  {isPlaying ? (
                    <Pause size={32} className="text-off-white" />
                  ) : (
                    <div className="w-0 h-0 border-l-[16px] border-l-off-white border-y-[10px] border-y-transparent ml-1" />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className="controls-area shrink-0 bg-void px-4 sm:px-5 pt-3 border-t border-off-white/[0.08]"
        style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.75rem))' }}
      >
        {/* Progress Bar */}
        <div
          ref={progressBarRef}
          onClick={handleScrub}
          onTouchMove={handleScrub}
          className="relative h-6 flex items-center cursor-pointer group mb-2"
        >
          {/* Track background */}
          <div className="absolute inset-x-0 h-[3px] bg-off-white/10 rounded-sm" />

          {/* Progress fill - gold gradient */}
          <div
            className="absolute left-0 h-[3px] rounded-sm"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--gold-dp), var(--gold-br))'
            }}
          />

          {/* Glowing knob */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-[10px] h-[10px] bg-gold-br rounded-full transition-opacity"
            style={{
              left: `${progress}%`,
              marginLeft: '-5px',
              boxShadow: '0 0 10px var(--gold), 0 0 0 3px rgba(230,171,42,0.15)'
            }}
          />
        </div>

        {/* Time display */}
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.1em] mb-3">
          <span className="text-gold-2 font-bold">{formatTime(currentTime)}</span>
          <span className="text-off-white/50">{formatTime(duration)}</span>
        </div>

        {/* Control buttons row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Mute button - transparent circular */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-[32px] h-[32px] rounded-full bg-ink-lift/60 backdrop-blur-sm border border-gold-2/15 flex items-center justify-center text-off-white/70 hover:text-gold-2 hover:border-gold-2/30 active:bg-gold-2/10 transition-colors"
          >
            {isMuted ? (
              <VolumeX size={14} />
            ) : (
              <Volume2 size={14} />
            )}
          </button>

          {/* Center: Play/Pause button - cream */}
          <button
            onClick={handleTogglePlay}
            className="w-[48px] h-[48px] rounded-full bg-cream flex items-center justify-center shadow-[0_4px_14px_rgba(0,0,0,0.4)] hover:bg-cream/90 active:bg-cream/80 transition-colors"
          >
            {isPlaying ? (
              <Pause size={20} className="text-void" />
            ) : (
              <div className="w-0 h-0 border-l-[13px] border-l-void border-y-[8px] border-y-transparent ml-[3px]" />
            )}
          </button>

          {/* Right: Skip button - pill with border */}
          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-ink-lift/60 backdrop-blur-sm border border-gold-2/15 text-off-white/70 hover:text-gold-2 hover:border-gold-2/30 active:bg-gold-2/10 transition-colors"
          >
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase font-semibold">Skip</span>
            <SkipForward size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}

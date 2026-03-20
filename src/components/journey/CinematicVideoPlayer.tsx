/**
 * CinematicVideoPlayer - Full-screen video player for cinematic entry videos
 * Used for theater/module entry cinematics (e.g., 40-second Pearl Harbor intro)
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SkipForward, Volume2, VolumeX } from 'lucide-react';
import { useAudioContextSafe } from '@/context/AudioContext';

interface CinematicVideoPlayerProps {
  videoUrl: string;
  onComplete: () => void;
  onSkip?: () => void;
  showSkipButton?: boolean;
  skipButtonDelay?: number; // ms before skip button appears, default 3000
  className?: string;
}

export function CinematicVideoPlayer({
  videoUrl,
  onComplete,
  onSkip,
  showSkipButton = true,
  skipButtonDelay = 3000,
  className = '',
}: CinematicVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted for iOS autoplay
  const audioContext = useAudioContextSafe();

  // Notify audio context when video starts/ends
  useEffect(() => {
    if (isLoaded && audioContext) {
      audioContext.notifyVideoStart();
    }

    return () => {
      if (audioContext) {
        audioContext.notifyVideoEnd();
      }
    };
  }, [isLoaded, audioContext]);

  // Show skip button after delay
  useEffect(() => {
    if (!showSkipButton) return;

    const timer = setTimeout(() => {
      setShowSkip(true);
    }, skipButtonDelay);

    return () => clearTimeout(timer);
  }, [showSkipButton, skipButtonDelay]);

  const handleLoadedData = () => {
    setIsLoaded(true);
  };

  const handleEnded = () => {
    if (hasEnded) return;
    setHasEnded(true);
    onComplete();
  };

  const handleSkip = () => {
    if (hasEnded) return;
    setHasEnded(true);

    if (videoRef.current) {
      videoRef.current.pause();
    }

    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-black ${className}`}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        muted={isMuted}
        playsInline
        onLoadedData={handleLoadedData}
        onEnded={handleEnded}
        className="w-full h-full object-contain"
      />

      {/* Mute toggle button */}
      {isLoaded && !hasEnded && (
        <button
          onClick={toggleMute}
          className="absolute top-8 right-8 flex items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white transition-colors"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}

      {/* Loading indicator */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black"
          >
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip button */}
      <AnimatePresence>
        {showSkip && !hasEnded && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleSkip}
            className="absolute bottom-8 right-8 flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-full text-white font-medium transition-colors"
          >
            <span>Skip</span>
            <SkipForward size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default CinematicVideoPlayer;

/**
 * AudioPlayer - Audio player component for testimonies and narration
 * Features waveform visualization, progress tracking, and transcript display
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw, SkipForward, Loader2 } from 'lucide-react';
import { useAudioContextSafe } from '@/context/AudioContext';

interface AudioPlayerProps {
  src: string;
  title?: string;
  subtitle?: string;
  avatar?: string;
  transcript?: string;
  autoPlay?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  showSkip?: boolean;
  className?: string;
}

export function AudioPlayer({
  src,
  title,
  subtitle,
  avatar,
  transcript,
  autoPlay = false,
  onComplete,
  onSkip,
  showSkip = true,
  className = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const audioContext = useAudioContextSafe();

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedData = () => {
      setIsLoading(false);
      setDuration(audio.duration);
      if (autoPlay) {
        audio.play().catch(() => {
          setIsPlaying(false);
        });
      }
    };

    const handleTimeUpdate = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onComplete) {
        onComplete();
      }
    };

    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      // Fade out background music when audio starts
      audioContext?.notifyVideoStart();
    };
    const handlePause = () => {
      setIsPlaying(false);
      // Fade background music back in when audio pauses
      audioContext?.notifyVideoEnd();
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      // If component unmounts while playing, notify to restore background music
      if (!audio.paused) {
        audioContext?.notifyVideoEnd();
      }
    };
  }, [autoPlay, onComplete, audioContext]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    audio.play();
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate fake waveform bars
  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10;
    const isActive = (i / 40) * 100 < progress;
    return { height, isActive };
  });

  if (hasError) {
    return (
      <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Audio unavailable</p>
          {onSkip && (
            <button
              onClick={onSkip}
              className="px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-xl overflow-hidden ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Header with avatar and title */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          {avatar && (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-xl overflow-hidden">
              {avatar.startsWith('http') || avatar.startsWith('/') ? (
                <img src={avatar} alt={title} className="w-full h-full object-cover" />
              ) : (
                avatar
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && <h4 className="font-semibold text-foreground truncate">{title}</h4>}
            {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
          </div>
          {isLoading && <Loader2 size={20} className="text-muted-foreground animate-spin" />}
        </div>
      </div>

      {/* Waveform visualization */}
      <div className="px-4 py-6">
        <div
          className="flex items-center justify-center gap-0.5 h-12 cursor-pointer"
          onClick={handleSeek}
        >
          {waveformBars.map((bar, i) => (
            <motion.div
              key={i}
              className={`w-1 rounded-full transition-colors ${
                bar.isActive ? 'bg-primary' : 'bg-muted'
              }`}
              initial={{ height: 4 }}
              animate={{
                height: isPlaying ? bar.height : bar.height * 0.5,
                opacity: bar.isActive ? 1 : 0.5,
              }}
              transition={{
                height: { duration: 0.1 },
                opacity: { duration: 0.2 },
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4">
        <div
          className="h-1.5 bg-muted rounded-full cursor-pointer overflow-hidden"
          onClick={handleSeek}
        >
          <motion.div
            className="h-full bg-primary rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label="Restart audio"
          >
            <RotateCcw size={18} />
          </button>
          <motion.button
            onClick={togglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
          </motion.button>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted"
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          {transcript && (
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                showTranscript
                  ? 'bg-primary/20 text-primary'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              Transcript
            </button>
          )}
          {showSkip && onSkip && (
            <button
              onClick={onSkip}
              className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium hover:text-foreground flex items-center gap-1"
            >
              <SkipForward size={14} />
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Transcript Panel */}
      <AnimatePresence>
        {showTranscript && transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="p-4 max-h-40 overflow-y-auto">
              <p className="text-sm text-foreground/80 leading-relaxed">{transcript}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AudioPlayer;

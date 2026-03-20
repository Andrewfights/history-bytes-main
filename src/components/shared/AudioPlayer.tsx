import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useAudioContextSafe } from '@/context/AudioContext';

interface AudioPlayerProps {
  src: string;
  title?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
  compact?: boolean;
}

const PLAYBACK_SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export function AudioPlayer({
  src,
  title,
  autoPlay = false,
  onEnded,
  className = '',
  compact = false,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioContext = useAudioContextSafe();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
      if (autoPlay) {
        audio.play().catch(() => {});
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      onEnded?.();
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

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      // If component unmounts while playing, notify to restore background music
      if (!audio.paused) {
        audioContext?.notifyVideoEnd();
      }
    };
  }, [autoPlay, onEnded, audioContext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Number(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = 0;
    setCurrentTime(0);
  };

  const cycleSpeed = () => {
    const currentIndex = PLAYBACK_SPEEDS.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % PLAYBACK_SPEEDS.length;
    setPlaybackSpeed(PLAYBACK_SPEEDS[nextIndex]);
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <audio ref={audioRef} src={src} preload="metadata" />

        <button
          onClick={togglePlay}
          disabled={!isLoaded}
          className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>

        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </div>

        <span className="text-xs text-muted-foreground w-10 text-right">
          {formatTime(currentTime)}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-card border border-border rounded-xl p-4 ${className}`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {title && (
        <p className="text-sm font-medium text-foreground mb-3 truncate">{title}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-border rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) ${progress}%, hsl(var(--border)) ${progress}%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-xs text-muted-foreground">{formatTime(currentTime)}</span>
          <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestart}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={18} />
          </button>

          <button
            onClick={togglePlay}
            disabled={!isLoaded}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>

          <button
            onClick={toggleMute}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <button
          onClick={cycleSpeed}
          className="px-3 py-1.5 rounded-lg bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
        >
          {playbackSpeed}x
        </button>
      </div>
    </div>
  );
}

export default AudioPlayer;

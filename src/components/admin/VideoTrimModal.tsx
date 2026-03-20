/**
 * VideoTrimModal - Modal for trimming exam videos to 10 seconds
 * Allows setting start point, auto-calculates end point
 * For videos shorter than 10s, the last frame will be held during playback
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Pause, SkipBack, Scissors, Check, AlertCircle } from 'lucide-react';

const TARGET_DURATION = 10; // Target clip duration in seconds

interface VideoTrimModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  currentTrimStart?: number;
  currentTrimEnd?: number;
  videoDuration?: number;
  onSave: (trimStart: number, trimEnd: number) => void;
  title?: string;
}

export function VideoTrimModal({
  isOpen,
  onClose,
  videoUrl,
  currentTrimStart = 0,
  currentTrimEnd,
  videoDuration: initialDuration,
  onSave,
  title = 'Trim Video',
}: VideoTrimModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [trimStart, setTrimStart] = useState(currentTrimStart);
  const [trimEnd, setTrimEnd] = useState(currentTrimEnd || Math.min(currentTrimStart + TARGET_DURATION, initialDuration || TARGET_DURATION));
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate effective trim end (start + 10s or video end, whichever is smaller)
  const effectiveTrimEnd = Math.min(trimStart + TARGET_DURATION, duration);
  const clipDuration = effectiveTrimEnd - trimStart;
  const isShortVideo = clipDuration < TARGET_DURATION;

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTrimStart(currentTrimStart);
      setTrimEnd(currentTrimEnd || Math.min(currentTrimStart + TARGET_DURATION, duration || TARGET_DURATION));
      setIsPlaying(false);
      setIsPreviewMode(false);
      setCurrentTime(currentTrimStart);
    }
  }, [isOpen, currentTrimStart, currentTrimEnd, duration]);

  // Handle video metadata loaded
  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const videoDuration = videoRef.current.duration;
      setDuration(videoDuration);
      setTrimEnd(Math.min(trimStart + TARGET_DURATION, videoDuration));
      videoRef.current.currentTime = trimStart;
    }
  }, [trimStart]);

  // Handle time update
  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const time = videoRef.current.currentTime;
      setCurrentTime(time);

      // In preview mode, loop within trim bounds
      if (isPreviewMode && time >= effectiveTrimEnd) {
        videoRef.current.currentTime = trimStart;
      }
    }
  }, [isPreviewMode, trimStart, effectiveTrimEnd]);

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  // Seek to start of trim
  const seekToStart = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = trimStart;
      setCurrentTime(trimStart);
    }
  }, [trimStart]);

  // Preview the trimmed clip
  const previewClip = useCallback(() => {
    if (videoRef.current) {
      setIsPreviewMode(true);
      videoRef.current.currentTime = trimStart;
      videoRef.current.play();
      setIsPlaying(true);
    }
  }, [trimStart]);

  // Handle scrubber click
  const handleScrubberClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current || duration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration]);

  // Handle trim start change
  const handleTrimStartChange = useCallback((newStart: number) => {
    const clampedStart = Math.max(0, Math.min(newStart, duration - 1));
    setTrimStart(clampedStart);
    setTrimEnd(Math.min(clampedStart + TARGET_DURATION, duration));

    if (videoRef.current) {
      videoRef.current.currentTime = clampedStart;
      setCurrentTime(clampedStart);
    }
  }, [duration]);

  // Set current time as trim start
  const setCurrentAsStart = useCallback(() => {
    handleTrimStartChange(currentTime);
  }, [currentTime, handleTrimStartChange]);

  // Handle save
  const handleSave = useCallback(() => {
    onSave(trimStart, effectiveTrimEnd);
    onClose();
  }, [trimStart, effectiveTrimEnd, onSave, onClose]);

  // Format time as MM:SS.s
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toFixed(1).padStart(4, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <p className="text-sm text-muted-foreground">
                Set the 10-second clip to play during the exam
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Video Player */}
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              src={videoUrl}
              className="w-full h-full object-contain"
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => {
                setIsPlaying(false);
                setIsPreviewMode(false);
              }}
            />

            {/* Play/Pause overlay */}
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group"
            >
              <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                {isPlaying ? (
                  <Pause size={28} className="text-gray-900" />
                ) : (
                  <Play size={28} className="text-gray-900 ml-1" />
                )}
              </div>
            </button>

            {/* Current time indicator */}
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/70 text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>

            {/* Preview mode indicator */}
            {isPreviewMode && (
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold">
                PREVIEW MODE
              </div>
            )}
          </div>

          {/* Scrubber / Timeline */}
          <div className="px-6 py-4 border-b border-border">
            <div
              className="relative h-12 bg-muted rounded-lg cursor-pointer overflow-hidden"
              onClick={handleScrubberClick}
            >
              {/* Trim region highlight */}
              <div
                className="absolute top-0 bottom-0 bg-primary/30"
                style={{
                  left: `${(trimStart / duration) * 100}%`,
                  width: `${((effectiveTrimEnd - trimStart) / duration) * 100}%`,
                }}
              />

              {/* Trim start handle */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary cursor-ew-resize"
                style={{ left: `${(trimStart / duration) * 100}%` }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDragging(true);
                }}
              >
                <div className="absolute -top-1 -left-2 w-5 h-3 bg-primary rounded-t-sm" />
              </div>

              {/* Trim end indicator */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-primary/50"
                style={{ left: `${(effectiveTrimEnd / duration) * 100}%` }}
              >
                <div className="absolute -top-1 -left-2 w-5 h-3 bg-primary/50 rounded-t-sm" />
              </div>

              {/* Current position indicator */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
                style={{ left: `${(currentTime / duration) * 100}%` }}
              />

              {/* Time markers */}
              <div className="absolute bottom-1 left-2 text-xs text-muted-foreground">
                0:00
              </div>
              <div className="absolute bottom-1 right-2 text-xs text-muted-foreground">
                {formatTime(duration)}
              </div>
            </div>

            {/* Trim info */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Trim: <span className="text-foreground font-mono">{formatTime(trimStart)}</span>
                  {' → '}
                  <span className="text-foreground font-mono">{formatTime(effectiveTrimEnd)}</span>
                </span>
                <span className="text-muted-foreground">
                  Clip: <span className="text-foreground font-mono">{clipDuration.toFixed(1)}s</span>
                </span>
              </div>

              {isShortVideo && (
                <div className="flex items-center gap-1.5 text-amber-400 text-xs">
                  <AlertCircle size={14} />
                  <span>Last frame will hold for {(TARGET_DURATION - clipDuration).toFixed(1)}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="px-6 py-4 space-y-4">
            {/* Trim start input */}
            <div className="flex items-center gap-4">
              <label className="text-sm text-muted-foreground w-24">Start Time:</label>
              <input
                type="number"
                min={0}
                max={Math.max(0, duration - 1)}
                step={0.1}
                value={trimStart.toFixed(1)}
                onChange={(e) => handleTrimStartChange(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 bg-muted border border-border rounded-lg text-foreground text-sm font-mono"
              />
              <span className="text-sm text-muted-foreground">seconds</span>
              <button
                onClick={setCurrentAsStart}
                className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm rounded-lg transition-colors flex items-center gap-2"
              >
                <Scissors size={14} />
                Use Current Position
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={seekToStart}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors flex items-center gap-2"
              >
                <SkipBack size={16} />
                Go to Start
              </button>
              <button
                onClick={previewClip}
                className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg transition-colors flex items-center gap-2"
              >
                <Play size={16} />
                Preview Clip
              </button>
              <div className="flex-1" />
              <button
                onClick={onClose}
                className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors flex items-center gap-2"
              >
                <Check size={16} />
                Save Trim
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default VideoTrimModal;

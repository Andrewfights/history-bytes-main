/**
 * GameShowQuestionWrapper - Orchestrates the HQ-style game show experience
 * Wraps each question with:
 * - Video playback (top 40% of screen)
 * - Countdown timer
 * - Lock-in functionality
 * - No immediate feedback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX } from 'lucide-react';
import { CountdownTimer } from './CountdownTimer';
import { LockInButton } from './LockInButton';
import { GAME_SHOW_CONFIG } from './examConfig';
import { useExamAudio } from '@/lib/audioManager';
import type { ExamQuestion, PendingAnswer } from './types';

interface VideoTrimSettings {
  trimStart?: number;
  trimEnd?: number;
}

interface GameShowQuestionWrapperProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  videoUrl?: string;
  videoTrim?: VideoTrimSettings;
  nextVideoUrl?: string;
  onQuestionComplete: (answer: PendingAnswer) => void;
  children: (props: GameShowChildProps) => React.ReactNode;
}

export interface GameShowChildProps {
  onSelectionChange: (hasSelection: boolean, value: unknown) => void;
  isLockedIn: boolean;
  isTimedOut: boolean;
  disabled: boolean;
}

export function GameShowQuestionWrapper({
  question,
  questionNumber,
  totalQuestions,
  videoUrl,
  videoTrim,
  nextVideoUrl,
  onQuestionComplete,
  children,
}: GameShowQuestionWrapperProps) {
  const [hasSelection, setHasSelection] = useState(false);
  const [currentValue, setCurrentValue] = useState<unknown>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_SHOW_CONFIG.questionTimeLimit);
  const [isPaused, setIsPaused] = useState(false);

  const completedRef = useRef(false);
  const audio = useExamAudio();

  // Handle selection change from child component
  const handleSelectionChange = useCallback((hasSelection: boolean, value: unknown) => {
    if (isLockedIn || isTimedOut) return;
    setHasSelection(hasSelection);
    setCurrentValue(value);
  }, [isLockedIn, isTimedOut]);

  // Handle lock-in
  const handleLockIn = useCallback(() => {
    if (!hasSelection || isLockedIn || isTimedOut || completedRef.current) return;

    // Mark as completed IMMEDIATELY to prevent race with timer expiration
    completedRef.current = true;
    setIsLockedIn(true);
    setIsPaused(true);
    audio.play('lockIn');

    // Brief pause before completing
    setTimeout(() => {
      audio.play('whoosh');

      onQuestionComplete({
        questionId: question.id,
        value: currentValue,
        isLockedIn: true,
        timeRemaining,
        timedOut: false,
      });
    }, GAME_SHOW_CONFIG.lockInPauseDuration);
  }, [hasSelection, isLockedIn, isTimedOut, currentValue, timeRemaining, question.id, onQuestionComplete, audio]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (isLockedIn || completedRef.current) return;

    // Mark as completed IMMEDIATELY to prevent race with lock-in
    completedRef.current = true;
    setIsTimedOut(true);
    setIsPaused(true);
    audio.play('buzzer');

    // Brief pause to show "TIME!" then complete
    setTimeout(() => {
      audio.play('whoosh');

      onQuestionComplete({
        questionId: question.id,
        value: hasSelection ? currentValue : null,
        isLockedIn: false,
        timeRemaining: 0,
        timedOut: true,
      });
    }, 800); // Show "TIME!" for 800ms
  }, [isLockedIn, hasSelection, currentValue, question.id, onQuestionComplete, audio]);

  // Track timer ticks and play audio
  const handleTick = useCallback((time: number) => {
    setTimeRemaining(time);
    audio.playTimerTick(time);
  }, [audio]);

  // Reset state when question changes
  useEffect(() => {
    setHasSelection(false);
    setCurrentValue(null);
    setIsLockedIn(false);
    setIsTimedOut(false);
    setTimeRemaining(GAME_SHOW_CONFIG.questionTimeLimit);
    setIsPaused(false);
    completedRef.current = false;
  }, [question.id]);

  const isDisabled = isLockedIn || isTimedOut;
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Trim settings
  const trimStart = videoTrim?.trimStart ?? 0;
  const trimEnd = videoTrim?.trimEnd;
  const TARGET_CLIP_DURATION = 10; // Target duration in seconds

  // Reset video state when URL changes
  useEffect(() => {
    setVideoLoaded(false);
    setVideoError(false);
  }, [videoUrl]);

  // Handle video loaded - seek to trim start
  const handleVideoLoaded = useCallback(() => {
    setVideoLoaded(true);
    if (videoRef.current && trimStart > 0) {
      videoRef.current.currentTime = trimStart;
    }
  }, [trimStart]);

  // Handle video time update - loop within trim bounds or hold last frame
  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const effectiveTrimEnd = trimEnd ?? video.duration;
    const clipDuration = effectiveTrimEnd - trimStart;

    // If we've reached the trim end
    if (video.currentTime >= effectiveTrimEnd) {
      // For short videos (< 10s), hold the last frame
      if (clipDuration < TARGET_CLIP_DURATION) {
        video.pause();
        // Keep the video at the last frame (trimEnd or video end)
        video.currentTime = effectiveTrimEnd - 0.01;
      } else {
        // Loop back to trim start
        video.currentTime = trimStart;
      }
    }
  }, [trimStart, trimEnd]);

  return (
    <div className="flex flex-col h-full">
      {/* Video Section - Constrained to ~30% of viewport, maintains aspect ratio */}
      <div className="shrink-0 bg-black relative overflow-hidden flex items-center justify-center" style={{ maxHeight: '30vh' }}>
        <div className="w-full h-full max-h-[30vh] aspect-video relative">
          {videoUrl && !videoError ? (
            <>
              {/* Loading spinner */}
              {!videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {/* Video */}
              <motion.video
                ref={videoRef}
                src={videoUrl}
                autoPlay
                muted={isVideoMuted}
                playsInline
                onLoadedData={handleVideoLoaded}
                onTimeUpdate={handleTimeUpdate}
                onError={() => setVideoError(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: videoLoaded ? 1 : 0 }}
                className="w-full h-full object-contain bg-black"
              />
            </>
          ) : (
            /* Fallback gradient when no video */
            <div className="w-full h-full bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-950 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-amber-500/30 animate-pulse" />
              </div>
            </div>
          )}

          {/* Preload next video */}
          {nextVideoUrl && (
            <video src={nextVideoUrl} preload="auto" muted className="hidden" />
          )}

          {/* Timer overlay on video - larger for mobile visibility */}
          <div className="absolute top-2 right-2 w-12 h-12 sm:w-10 sm:h-10">
            <CountdownTimer
              duration={GAME_SHOW_CONFIG.questionTimeLimit}
              warningThreshold={GAME_SHOW_CONFIG.countdownWarningThreshold}
              onTimeUp={handleTimeUp}
              isPaused={isPaused}
              onTick={handleTick}
            />
          </div>

          {/* Question number overlay - larger touch-friendly text */}
          <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 rounded">
            <span className="text-white text-xs sm:text-xs font-medium">
              Q{questionNumber}/{totalQuestions}
            </span>
          </div>

          {/* Mute/unmute button - larger touch target */}
          <button
            onClick={() => setIsVideoMuted(!isVideoMuted)}
            className="absolute bottom-2 right-2 p-2 sm:p-1.5 bg-black/60 hover:bg-black/80 active:bg-black/90 rounded-full transition-colors min-w-[40px] min-h-[40px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
            aria-label={isVideoMuted ? 'Unmute' : 'Mute'}
          >
            {isVideoMuted ? (
              <VolumeX size={18} className="text-white/70 sm:w-4 sm:h-4" />
            ) : (
              <Volume2 size={18} className="text-white sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Question + Answers Section - Fits remaining space with scroll if needed */}
      <div className="flex-1 flex flex-col px-3 sm:px-4 py-2 min-h-0 overflow-hidden">
        {/* Question prompt - responsive sizing */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 rounded-lg p-3 sm:p-2 border border-white/10 mb-2 shrink-0"
        >
          <p className="text-white text-sm sm:text-sm leading-snug sm:leading-tight">
            {question.prompt}
          </p>
        </motion.div>

        {/* Question content (answer options rendered by child) - scrollable if content overflows */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              {children({
                onSelectionChange: handleSelectionChange,
                isLockedIn,
                isTimedOut,
                disabled: isDisabled,
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Lock-in button - Fixed at absolute bottom of screen */}
      <div className="shrink-0 px-3 sm:px-4 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
        <AnimatePresence>
          {isTimedOut ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                <span className="text-red-400 font-bold text-sm">Time's Up!</span>
              </div>
            </motion.div>
          ) : (
            <LockInButton
              hasSelection={hasSelection}
              isLockedIn={isLockedIn}
              onLockIn={handleLockIn}
              disabled={isTimedOut}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * Simplified wrapper for non-game-show mode (legacy support)
 */
interface StandardQuestionWrapperProps {
  question: ExamQuestion;
  questionNumber: number;
  children: React.ReactNode;
}

export function StandardQuestionWrapper({
  question,
  questionNumber,
  children,
}: StandardQuestionWrapperProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span className="text-white/60 text-sm">
          Question {questionNumber}
        </span>
        {question.category && (
          <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
            {question.category}
          </span>
        )}
      </div>

      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <p className="text-white text-lg leading-relaxed">
          {question.prompt}
        </p>
      </div>

      {children}
    </div>
  );
}

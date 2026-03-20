/**
 * GameShowQuestionWrapper - Orchestrates the HQ-style game show experience
 * Wraps each question with:
 * - Video playback
 * - Countdown timer
 * - Lock-in functionality
 * - No immediate feedback
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CountdownTimer } from './CountdownTimer';
import { LockInButton } from './LockInButton';
import { ResponsiveVideoContainer } from './QuestionVideoPlayer';
import { GAME_SHOW_CONFIG } from './examConfig';
import { useExamAudio } from '@/lib/audioManager';
import type { ExamQuestion, PendingAnswer, VideoLayoutMode } from './types';

interface GameShowQuestionWrapperProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  videoUrl?: string;
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

// Determine video layout mode based on question type
function getVideoLayoutMode(questionType: string): VideoLayoutMode {
  switch (questionType) {
    case 'drag-timeline':
    case 'sequence-order':
      // These need full width, use background
      return 'background';
    case 'fill-in-blank':
    case 'two-part':
      // These need keyboard space, use top banner
      return 'top-banner';
    default:
      // Standard questions use side panel
      return 'side-panel';
  }
}

export function GameShowQuestionWrapper({
  question,
  questionNumber,
  totalQuestions,
  videoUrl,
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

  const layoutMode = getVideoLayoutMode(question.type);
  const isDisabled = isLockedIn || isTimedOut;

  return (
    <div className="flex flex-col h-full">
      {/* Header with question number and timer */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-sm">
            Question {questionNumber}/{totalQuestions}
          </span>
          {question.category && (
            <span className="px-2 py-1 bg-white/10 rounded text-xs text-white/60">
              {question.category}
            </span>
          )}
        </div>

        {/* Timer */}
        <div className="w-24 h-24">
          <CountdownTimer
            duration={GAME_SHOW_CONFIG.questionTimeLimit}
            warningThreshold={GAME_SHOW_CONFIG.countdownWarningThreshold}
            onTimeUp={handleTimeUp}
            isPaused={isPaused}
            onTick={handleTick}
          />
        </div>
      </div>

      {/* Main content area with video and question */}
      <div className="flex-1 overflow-y-auto">
        <ResponsiveVideoContainer
          videoUrl={videoUrl}
          desktopLayout={layoutMode}
          nextVideoUrl={nextVideoUrl}
        >
          <div className="flex flex-col gap-4">
            {/* Question prompt */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-xl p-4 border border-white/10"
            >
              <p className="text-white text-lg leading-relaxed">
                {question.prompt}
              </p>
            </motion.div>

            {/* Question content (rendered by child) */}
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
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
        </ResponsiveVideoContainer>
      </div>

      {/* Lock-in button (fixed at bottom) */}
      <div className="shrink-0 pt-4" style={{ paddingBottom: 'max(0.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
        <AnimatePresence>
          {isTimedOut ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center"
            >
              <div className="px-6 py-3 bg-red-500/20 border border-red-500/50 rounded-xl">
                <span className="text-red-400 font-bold">Time's Up!</span>
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

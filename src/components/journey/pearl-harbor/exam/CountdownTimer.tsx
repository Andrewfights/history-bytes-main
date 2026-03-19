/**
 * CountdownTimer - HQ-style countdown timer for game show mode
 * Visual states:
 * - Green (10-4s): Steady countdown
 * - Amber (3s): Pulse animation begins
 * - Red (2-1s): Faster pulse, glow effect
 * - Flash (0s): "TIME!" text
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownTimerProps {
  duration: number; // Total seconds
  warningThreshold: number; // When to start pulsing (e.g., 3)
  onTimeUp: () => void;
  isPaused?: boolean;
  onTick?: (timeRemaining: number) => void;
}

type TimerState = 'normal' | 'warning' | 'critical' | 'expired';

export function CountdownTimer({
  duration,
  warningThreshold,
  onTimeUp,
  isPaused = false,
  onTick,
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [timerState, setTimerState] = useState<TimerState>('normal');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpired = useRef(false);

  // Determine timer state based on time remaining
  const getTimerState = useCallback((time: number): TimerState => {
    if (time <= 0) return 'expired';
    if (time <= 2) return 'critical';
    if (time <= warningThreshold) return 'warning';
    return 'normal';
  }, [warningThreshold]);

  // Update timer state when time changes
  useEffect(() => {
    setTimerState(getTimerState(timeRemaining));
  }, [timeRemaining, getTimerState]);

  // Main countdown effect
  useEffect(() => {
    if (isPaused || hasExpired.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Use 100ms interval for smooth visual updates
    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 0.1);

        // Trigger onTick for whole second changes
        const prevWhole = Math.ceil(prev);
        const newWhole = Math.ceil(newTime);
        if (prevWhole !== newWhole && onTick) {
          onTick(newWhole);
        }

        // Handle expiration
        if (newTime <= 0 && !hasExpired.current) {
          hasExpired.current = true;
          setTimeout(() => onTimeUp(), 100);
        }

        return newTime;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPaused, onTimeUp, onTick]);

  // Reset when duration changes
  useEffect(() => {
    setTimeRemaining(duration);
    hasExpired.current = false;
  }, [duration]);

  // Calculate progress percentage (for circular indicator)
  const progress = (timeRemaining / duration) * 100;
  const displayTime = Math.ceil(timeRemaining);

  // Get colors based on state
  const getColors = () => {
    switch (timerState) {
      case 'normal':
        return {
          ring: 'stroke-green-500',
          text: 'text-green-400',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          glow: '',
        };
      case 'warning':
        return {
          ring: 'stroke-amber-500',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
        };
      case 'critical':
        return {
          ring: 'stroke-red-500',
          text: 'text-red-400',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          glow: 'shadow-[0_0_30px_rgba(239,68,68,0.4)]',
        };
      case 'expired':
        return {
          ring: 'stroke-red-600',
          text: 'text-red-500',
          bg: 'bg-red-500/20',
          border: 'border-red-500/50',
          glow: 'shadow-[0_0_40px_rgba(239,68,68,0.5)]',
        };
    }
  };

  const colors = getColors();

  // SVG circle properties
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <motion.div
      className={`relative flex items-center justify-center ${colors.glow}`}
      animate={
        timerState === 'warning'
          ? { scale: [1, 1.05, 1] }
          : timerState === 'critical'
          ? { scale: [1, 1.08, 1] }
          : {}
      }
      transition={
        timerState === 'warning'
          ? { duration: 0.5, repeat: Infinity }
          : timerState === 'critical'
          ? { duration: 0.3, repeat: Infinity }
          : {}
      }
    >
      {/* Background circle */}
      <div
        className={`absolute inset-0 rounded-full ${colors.bg} ${colors.border} border-2 transition-colors duration-300`}
      />

      {/* SVG Progress Ring */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={`${colors.ring} transition-colors duration-300`}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {timerState === 'expired' ? (
            <motion.div
              key="time-up"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className={`text-lg font-bold ${colors.text}`}
            >
              TIME!
            </motion.div>
          ) : (
            <motion.div
              key={displayTime}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`text-3xl font-bold ${colors.text} tabular-nums`}
            >
              {displayTime}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/**
 * Compact version of the timer for inline display
 */
export function CountdownTimerCompact({
  duration,
  warningThreshold,
  onTimeUp,
  isPaused = false,
}: Omit<CountdownTimerProps, 'onTick'>) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasExpired = useRef(false);

  useEffect(() => {
    if (isPaused || hasExpired.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 0.1);
        if (newTime <= 0 && !hasExpired.current) {
          hasExpired.current = true;
          setTimeout(() => onTimeUp(), 100);
        }
        return newTime;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, onTimeUp]);

  useEffect(() => {
    setTimeRemaining(duration);
    hasExpired.current = false;
  }, [duration]);

  const displayTime = Math.ceil(timeRemaining);
  const isWarning = timeRemaining <= warningThreshold && timeRemaining > 0;
  const isCritical = timeRemaining <= 2 && timeRemaining > 0;
  const isExpired = timeRemaining <= 0;

  const colorClass = isExpired
    ? 'text-red-500'
    : isCritical
    ? 'text-red-400'
    : isWarning
    ? 'text-amber-400'
    : 'text-green-400';

  return (
    <motion.span
      className={`font-mono font-bold tabular-nums ${colorClass}`}
      animate={isWarning || isCritical ? { scale: [1, 1.1, 1] } : {}}
      transition={isCritical ? { duration: 0.3, repeat: Infinity } : { duration: 0.5, repeat: Infinity }}
    >
      {isExpired ? "TIME!" : `${displayTime}s`}
    </motion.span>
  );
}

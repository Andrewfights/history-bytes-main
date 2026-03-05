import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface FirstTimeTooltipProps {
  tooltipId: string;
  message: string;
  icon?: React.ReactNode;
  position?: 'top' | 'bottom' | 'center';
  delay?: number;
  autoHideDuration?: number;
  onDismiss?: () => void;
}

// Tooltip content for each node type
export const NODE_TOOLTIPS: Record<string, { message: string; icon: string }> = {
  'video-lesson': {
    message: "Videos have a quiz after. Pay attention!",
    icon: '🎬',
  },
  'image-explore': {
    message: "Tap the pulsing dots to explore!",
    icon: '🗺️',
  },
  'two-truths': {
    message: "Read carefully - one of these is a lie!",
    icon: '🤔',
  },
  'found-tape': {
    message: "Listen closely - you can replay anytime!",
    icon: '🎧',
  },
  'headlines': {
    message: "Read the headlines and answer questions!",
    icon: '📰',
  },
  'chrono-order': {
    message: "Tap and hold, then drag up or down!",
    icon: '⏳',
  },
  'quiz-mix': {
    message: "Test your knowledge - take your time!",
    icon: '📝',
  },
  'decision': {
    message: "Make a choice - there's no wrong answer!",
    icon: '⚖️',
  },
  'boss': {
    message: "Boss round! 60 seconds - think fast!",
    icon: '👑',
  },
};

export function FirstTimeTooltip({
  tooltipId,
  message,
  icon,
  position = 'top',
  delay = 500,
  autoHideDuration = 5000,
  onDismiss,
}: FirstTimeTooltipProps) {
  const { hasSeenTooltip, markTooltipSeen } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  // Check if we should show the tooltip
  const shouldShow = !hasSeenTooltip(tooltipId);

  useEffect(() => {
    if (!shouldShow) return;

    // Show tooltip after delay
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(showTimer);
  }, [shouldShow, delay]);

  useEffect(() => {
    if (!isVisible || !shouldShow) return;

    // Auto-hide after duration
    const hideTimer = setTimeout(() => {
      handleDismiss();
    }, autoHideDuration);

    return () => clearTimeout(hideTimer);
  }, [isVisible, shouldShow, autoHideDuration]);

  const handleDismiss = () => {
    setIsVisible(false);
    markTooltipSeen(tooltipId);
    onDismiss?.();
  };

  if (!shouldShow) return null;

  const positionClasses = {
    top: 'top-4 left-4 right-4',
    bottom: 'bottom-24 left-4 right-4',
    center: 'top-1/2 left-4 right-4 -translate-y-1/2',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: position === 'bottom' ? 20 : -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position === 'bottom' ? 20 : -20, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className={`fixed ${positionClasses[position]} z-50 pointer-events-auto`}
        >
          <div className="bg-primary text-primary-foreground rounded-xl p-4 shadow-lg border border-primary/20 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                {icon || <Lightbulb size={20} />}
              </div>

              {/* Message */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-0.5">Tip</p>
                <p className="text-sm opacity-90">{message}</p>
              </div>

              {/* Dismiss button */}
              <button
                onClick={handleDismiss}
                className="p-1 rounded-full hover:bg-primary-foreground/20 transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Progress bar for auto-hide */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
              className="h-0.5 bg-primary-foreground/30 rounded-full mt-3"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Hook for easy tooltip usage in node components
export function useNodeTooltip(nodeType: string) {
  const { hasSeenTooltip, markTooltipSeen } = useApp();
  const tooltipId = `node-${nodeType}`;
  const tooltipConfig = NODE_TOOLTIPS[nodeType];

  return {
    shouldShow: !hasSeenTooltip(tooltipId) && !!tooltipConfig,
    tooltipId,
    message: tooltipConfig?.message || '',
    icon: tooltipConfig?.icon || '💡',
    markSeen: () => markTooltipSeen(tooltipId),
  };
}

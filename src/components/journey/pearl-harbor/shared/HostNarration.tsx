/**
 * HostNarration - Shared component for host dialogue throughout games
 * Shows the host avatar with speech bubble for instructions, feedback, and trivia
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Volume2, X } from 'lucide-react';
import { WW2Host } from '@/types';
import { HostDialogue } from '@/data/ww2Hosts';

interface HostNarrationProps {
  host: WW2Host;
  dialogue: HostDialogue;
  phase: 'intro' | 'playing' | 'feedback' | 'completion';
  feedbackType?: 'correct' | 'incorrect' | 'encouragement';
  onContinue?: () => void;
  onSkip?: () => void;
  showVideo?: boolean;
  videoUrl?: string;
  autoAdvance?: boolean;
  autoAdvanceDelay?: number;
}

export function HostNarration({
  host,
  dialogue,
  phase,
  feedbackType,
  onContinue,
  onSkip,
  showVideo = false,
  videoUrl,
  autoAdvance = false,
  autoAdvanceDelay = 3000,
}: HostNarrationProps) {
  const [currentText, setCurrentText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  // Get the appropriate text based on phase
  const getDisplayText = () => {
    switch (phase) {
      case 'intro':
        return dialogue.intro;
      case 'playing':
        if (feedbackType === 'correct' && dialogue.correct.length > 0) {
          return dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)];
        }
        if (feedbackType === 'incorrect' && dialogue.incorrect.length > 0) {
          return dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)];
        }
        if (feedbackType === 'encouragement' && dialogue.encouragement.length > 0) {
          return dialogue.encouragement[Math.floor(Math.random() * dialogue.encouragement.length)];
        }
        return dialogue.instructions;
      case 'feedback':
        if (feedbackType === 'correct' && dialogue.correct.length > 0) {
          return dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)];
        }
        if (feedbackType === 'incorrect' && dialogue.incorrect.length > 0) {
          return dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)];
        }
        return '';
      case 'completion':
        return dialogue.completion;
      default:
        return '';
    }
  };

  const targetText = getDisplayText();

  // Typing effect
  useEffect(() => {
    if (!targetText) return;

    setCurrentText('');
    setIsTyping(true);

    let index = 0;
    const typingInterval = setInterval(() => {
      if (index < targetText.length) {
        setCurrentText(targetText.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);

        // Auto-advance if enabled
        if (autoAdvance && onContinue) {
          setTimeout(onContinue, autoAdvanceDelay);
        }
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [targetText, autoAdvance, autoAdvanceDelay, onContinue]);

  if (phase === 'feedback' && !targetText) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full"
    >
      <div className="flex gap-3 items-start">
        {/* Host Avatar */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="shrink-0"
        >
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
        </motion.div>

        {/* Speech Bubble */}
        <div className="flex-1 relative">
          {/* Bubble pointer */}
          <div
            className="absolute left-0 top-3 w-0 h-0 -ml-2"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '8px solid rgba(255,255,255,0.1)',
            }}
          />

          <div className="bg-white/10 rounded-xl rounded-tl-sm p-4 border border-white/10">
            {/* Host name */}
            <p className="text-xs text-white/50 mb-1 font-medium">{host.name}</p>

            {/* Video section */}
            {showVideo && videoUrl && (
              <div className="mb-3 aspect-video rounded-lg overflow-hidden bg-black">
                <video
                  src={videoUrl}
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Text content */}
            <p className="text-white/90 text-sm leading-relaxed">
              {currentText}
              {isTyping && <span className="animate-pulse">|</span>}
            </p>

            {/* Action buttons */}
            {!isTyping && phase !== 'feedback' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2 mt-3"
              >
                {onContinue && (
                  <button
                    onClick={onContinue}
                    className="px-4 py-2 rounded-lg bg-white text-black font-medium text-sm hover:bg-white/90 transition-colors"
                  >
                    {phase === 'intro' ? 'Got it!' : phase === 'completion' ? 'Continue' : 'Next'}
                  </button>
                )}
                {onSkip && phase === 'intro' && (
                  <button
                    onClick={onSkip}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white/70 font-medium text-sm hover:bg-white/20 transition-colors"
                  >
                    Skip
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * HostFeedback - Quick feedback popup during gameplay
 */
interface HostFeedbackProps {
  host: WW2Host;
  text: string;
  type: 'correct' | 'incorrect' | 'info';
}

export function HostFeedback({ host, text, type }: HostFeedbackProps) {
  const bgColor = type === 'correct' ? 'bg-green-500/20 border-green-500/30' :
                  type === 'incorrect' ? 'bg-red-500/20 border-red-500/30' :
                  'bg-white/10 border-white/20';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${bgColor}`}
    >
      <span className="text-lg">{host.avatar}</span>
      <span className="text-white/90 text-sm">{text}</span>
    </motion.div>
  );
}

/**
 * HostIntroOverlay - Full-screen intro with host video/narration
 */
interface HostIntroOverlayProps {
  host: WW2Host;
  dialogue: HostDialogue;
  onStart: () => void;
  gameTitle: string;
  videoUrl?: string;
}

export function HostIntroOverlay({
  host,
  dialogue,
  onStart,
  gameTitle,
  videoUrl,
}: HostIntroOverlayProps) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [videoEnded, setVideoEnded] = useState(!videoUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Video or Avatar */}
        {videoUrl && !videoEnded ? (
          <div className="w-full max-w-md aspect-video rounded-2xl overflow-hidden bg-black mb-6">
            <video
              src={videoUrl}
              autoPlay
              className="w-full h-full object-cover"
              onEnded={() => setVideoEnded(true)}
            />
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl mb-6 shadow-lg"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </motion.div>
        )}

        {/* Game Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white mb-2 text-center"
        >
          {gameTitle}
        </motion.h1>

        {/* Host Intro Text */}
        {!showInstructions ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="max-w-md text-center"
          >
            <p className="text-white/70 text-sm mb-2">{host.name} says:</p>
            <p className="text-white/90 leading-relaxed italic">"{dialogue.intro}"</p>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={() => setShowInstructions(true)}
              className="mt-6 px-6 py-3 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors"
            >
              How to Play
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-md text-center"
          >
            <p className="text-white/90 leading-relaxed mb-6">{dialogue.instructions}</p>

            <button
              onClick={onStart}
              className="px-8 py-4 rounded-xl bg-white text-black font-bold text-lg hover:bg-white/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Start
            </button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * HostCompletionOverlay - End screen with host summary
 */
interface HostCompletionOverlayProps {
  host: WW2Host;
  dialogue: HostDialogue;
  stats: {
    score?: number;
    total?: number;
    xpEarned: number;
    timeSpent?: number;
  };
  onContinue: () => void;
  onRetry?: () => void;
  gameTitle: string;
}

export function HostCompletionOverlay({
  host,
  dialogue,
  stats,
  onContinue,
  onRetry,
  gameTitle,
}: HostCompletionOverlayProps) {
  const accuracy = stats.score !== undefined && stats.total
    ? Math.round((stats.score / stats.total) * 100)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Host Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg"
          style={{ backgroundColor: host.primaryColor }}
        >
          {host.avatar}
        </motion.div>

        {/* Completion Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center max-w-md mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-3">{gameTitle} Complete</h2>
          <p className="text-white/70 italic">"{dialogue.completion}"</p>
          <p className="text-white/50 text-sm mt-1">— {host.name}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-4 mb-6"
        >
          {accuracy !== null && (
            <div className="px-6 py-3 rounded-xl bg-white/10 text-center">
              <div className="text-2xl font-bold text-white">{accuracy}%</div>
              <div className="text-xs text-white/50">Accuracy</div>
            </div>
          )}
          <div className="px-6 py-3 rounded-xl bg-amber-500/20 text-center">
            <div className="text-2xl font-bold text-amber-400">+{stats.xpEarned}</div>
            <div className="text-xs text-amber-400/70">XP Earned</div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            onClick={onContinue}
            className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
          >
            Continue
          </button>
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3 rounded-xl bg-white/10 text-white/70 font-medium hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

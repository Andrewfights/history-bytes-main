import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices } from 'lucide-react';
import { getRandomPlayableNode, RandomResult } from '@/lib/randomizer';
import { useApp } from '@/context/AppContext';

interface DiceButtonProps {
  onResult: (result: RandomResult) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'card';
  excludeCompleted?: boolean;
  className?: string;
}

const diceEmojis = ['🎲', '⚔️', '🏛️', '📜', '🗺️', '👑', '🎭', '⚡'];

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
};

export function DiceButton({
  onResult,
  size = 'md',
  variant = 'primary',
  excludeCompleted = true,
  className = '',
}: DiceButtonProps) {
  const { completedJourneyNodes } = useApp();
  const [isRolling, setIsRolling] = useState(false);
  const [currentEmoji, setCurrentEmoji] = useState('🎲');
  const [showConfetti, setShowConfetti] = useState(false);

  const handleRoll = useCallback(() => {
    if (isRolling) return;

    setIsRolling(true);
    setShowConfetti(false);

    // Cycle through emojis during roll
    let emojiIndex = 0;
    const emojiInterval = setInterval(() => {
      emojiIndex = (emojiIndex + 1) % diceEmojis.length;
      setCurrentEmoji(diceEmojis[emojiIndex]);
    }, 100);

    // After animation, get result
    setTimeout(() => {
      clearInterval(emojiInterval);

      const result = getRandomPlayableNode({
        excludeCompleted: excludeCompleted ? completedJourneyNodes : [],
        excludeBoss: false,
      });

      if (result) {
        // Set final emoji based on node type
        const finalEmoji = getEmojiForNodeType(result.node.type);
        setCurrentEmoji(finalEmoji);
        setShowConfetti(true);

        // Callback with result
        setTimeout(() => {
          onResult(result);
          setIsRolling(false);
          setShowConfetti(false);
          setCurrentEmoji('🎲');
        }, 500);
      } else {
        setIsRolling(false);
        setCurrentEmoji('🎲');
      }
    }, 1500);
  }, [isRolling, completedJourneyNodes, excludeCompleted, onResult]);

  const getEmojiForNodeType = (type: string): string => {
    switch (type) {
      case 'two-truths': return '🎭';
      case 'found-tape': return '📜';
      case 'headlines': return '📰';
      case 'quiz-mix': return '❓';
      case 'decision': return '⚖️';
      case 'boss': return '👑';
      default: return '🎲';
    }
  };

  if (variant === 'card') {
    return (
      <motion.button
        onClick={handleRoll}
        disabled={isRolling}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-xl p-4 text-left group relative overflow-hidden ${className}`}
      >
        <div className="flex items-center gap-4">
          <motion.div
            animate={isRolling ? {
              rotate: [0, 360, 720, 1080],
              scale: [1, 1.2, 0.9, 1.1, 1],
            } : {}}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className={`${sizeClasses[size]} rounded-xl bg-primary/20 flex items-center justify-center`}
          >
            {currentEmoji}
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {isRolling ? 'Rolling...' : "I'm Feeling Lucky"}
            </h3>
            <p className="text-sm text-muted-foreground">
              Jump into a random challenge
            </p>
          </div>
        </div>

        {/* Confetti burst */}
        <AnimatePresence>
          {showConfetti && <ConfettiBurst />}
        </AnimatePresence>
      </motion.button>
    );
  }

  return (
    <motion.button
      onClick={handleRoll}
      disabled={isRolling}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative rounded-full flex items-center justify-center transition-colors ${
        variant === 'primary'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'bg-card border border-border hover:border-primary/50'
      } ${sizeClasses[size]} ${className}`}
    >
      <motion.span
        animate={isRolling ? {
          rotate: [0, 360, 720, 1080],
          scale: [1, 1.3, 0.8, 1.2, 1],
        } : {}}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        {isRolling ? currentEmoji : <Dices size={size === 'sm' ? 18 : size === 'md' ? 24 : 32} />}
      </motion.span>

      {/* Confetti burst */}
      <AnimatePresence>
        {showConfetti && <ConfettiBurst />}
      </AnimatePresence>
    </motion.button>
  );
}

// Mini confetti burst component
function ConfettiBurst() {
  const particles = Array.from({ length: 12 }, (_, i) => i);
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map((i) => {
        const angle = (i / 12) * 360;
        const color = colors[i % colors.length];
        return (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0.5],
              x: Math.cos(angle * Math.PI / 180) * 60,
              y: Math.sin(angle * Math.PI / 180) * 60,
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
}

export default DiceButton;

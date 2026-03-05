import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Play, Crown, Trophy } from 'lucide-react';
import { JourneyNode, JourneyNodeType } from '@/types';

export type NodeState = 'completed' | 'current' | 'available' | 'locked';

interface MapNodeProps {
  node: JourneyNode;
  state: NodeState;
  position: { x: number; y: number };
  onClick: () => void;
}

// Node type emojis
const nodeTypeEmojis: Record<JourneyNodeType, string> = {
  'two-truths': '2+1',
  'found-tape': '🎙️',
  'headlines': '📰',
  'quiz-mix': '❓',
  'decision': '⚖️',
  'boss': '👑',
};

// Node type labels
const nodeTypeLabels: Record<JourneyNodeType, string> = {
  'two-truths': 'Two Truths',
  'found-tape': 'Found Tape',
  'headlines': 'Headlines',
  'quiz-mix': 'Quiz Mix',
  'decision': 'Decision',
  'boss': 'Boss',
};

export function MapNode({ node, state, position, onClick }: MapNodeProps) {
  const isBoss = node.type === 'boss';
  const isClickable = state === 'current' || state === 'available' || state === 'completed';
  const nodeSize = isBoss ? 72 : 56;

  // Get visual styling based on state
  const getNodeStyles = () => {
    switch (state) {
      case 'completed':
        return {
          bg: 'bg-success',
          border: 'border-success',
          text: 'text-white',
          icon: <CheckCircle2 size={isBoss ? 28 : 24} className="text-white" />,
        };
      case 'current':
        return {
          bg: 'bg-primary',
          border: 'border-primary',
          text: 'text-primary-foreground',
          icon: <Play size={isBoss ? 28 : 24} className="text-primary-foreground ml-0.5" />,
        };
      case 'available':
        return {
          bg: 'bg-card',
          border: 'border-primary',
          text: 'text-primary',
          icon: <span className="text-lg">{nodeTypeEmojis[node.type]}</span>,
        };
      case 'locked':
      default:
        return {
          bg: 'bg-muted',
          border: 'border-muted-foreground/30',
          text: 'text-muted-foreground',
          icon: <Lock size={isBoss ? 24 : 20} className="text-muted-foreground" />,
        };
    }
  };

  const styles = getNodeStyles();

  return (
    <motion.div
      className="absolute flex flex-col items-center"
      style={{
        left: `${position.x}%`,
        top: position.y,
        transform: 'translateX(-50%)',
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: node.order * 0.1, type: 'spring', stiffness: 200 }}
    >
      {/* Node Circle */}
      <motion.button
        onClick={isClickable ? onClick : undefined}
        disabled={!isClickable}
        className={`
          relative flex items-center justify-center rounded-full
          border-4 ${styles.bg} ${styles.border}
          transition-all duration-200
          ${isClickable ? 'cursor-pointer hover:scale-110' : 'cursor-not-allowed'}
          ${isBoss ? 'shadow-lg' : 'shadow-md'}
        `}
        style={{ width: nodeSize, height: nodeSize }}
        whileHover={isClickable ? { scale: 1.1 } : {}}
        whileTap={isClickable ? { scale: 0.95 } : {}}
      >
        {/* Pulsing glow for current node */}
        {state === 'current' && (
          <motion.div
            className="absolute inset-0 rounded-full bg-primary"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Boss crown decoration */}
        {isBoss && state !== 'locked' && (
          <motion.div
            className="absolute -top-3 left-1/2 -translate-x-1/2"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: node.order * 0.1 + 0.2 }}
          >
            <Crown size={20} className="text-amber-500 fill-amber-500" />
          </motion.div>
        )}

        {/* Inner icon */}
        <span className="relative z-10">{styles.icon}</span>

        {/* Completion star burst */}
        {state === 'completed' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-amber-400 rounded-full"
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{
                  x: Math.cos((i * 60 * Math.PI) / 180) * 30,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 30,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              />
            ))}
          </motion.div>
        )}
      </motion.button>

      {/* Node Label */}
      <motion.div
        className="mt-2 text-center max-w-[80px]"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: node.order * 0.1 + 0.15 }}
      >
        <p className={`text-xs font-semibold truncate ${
          state === 'locked' ? 'text-muted-foreground/60' : 'text-foreground'
        }`}>
          {node.title}
        </p>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <Trophy size={10} className={state === 'locked' ? 'text-muted-foreground/40' : 'text-amber-500'} />
          <span className={`text-[10px] ${
            state === 'locked' ? 'text-muted-foreground/40' : 'text-muted-foreground'
          }`}>
            {node.xpReward} XP
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Host } from '@/types';

interface HostBubbleProps {
  host: Host;
  message: string;
  variant?: 'default' | 'success' | 'error';
}

export function HostBubble({ host, message, variant = 'default' }: HostBubbleProps) {
  const bgColor = {
    default: 'bg-card border-border',
    success: 'bg-success/10 border-success/30',
    error: 'bg-destructive/10 border-destructive/30',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex items-start gap-3"
    >
      {/* Host Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
        className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-2xl"
      >
        {host.avatar}
      </motion.div>

      {/* Speech Bubble */}
      <div className={`relative flex-1 p-4 rounded-xl border ${bgColor}`}>
        {/* Triangle pointer */}
        <div className={`absolute left-0 top-4 -translate-x-2 w-0 h-0
          border-t-8 border-t-transparent
          border-r-8 border-r-current
          border-b-8 border-b-transparent
          ${variant === 'success' ? 'text-success/30' : variant === 'error' ? 'text-destructive/30' : 'text-border'}`}
        />

        <p className="text-sm font-medium mb-1">{host.name}</p>
        <p className="text-sm text-muted-foreground italic">"{message}"</p>
      </div>
    </motion.div>
  );
}

// Compact version for inline use
interface HostReactionProps {
  host: Host;
  isCorrect: boolean;
}

export function HostReaction({ host, isCorrect }: HostReactionProps) {
  const reactions = isCorrect
    ? ['Excellent!', 'Well done!', 'You got it!', 'Impressive!']
    : ['Not quite...', 'Think again!', 'Close, but...', 'History says otherwise!'];

  const message = reactions[Math.floor(Math.random() * reactions.length)];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-2 text-sm"
    >
      <span className="text-lg">{host.avatar}</span>
      <span className={isCorrect ? 'text-success' : 'text-destructive'}>
        {message}
      </span>
    </motion.div>
  );
}

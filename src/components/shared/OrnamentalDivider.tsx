import { motion } from 'framer-motion';

interface OrnamentalDividerProps {
  variant?: 'simple' | 'compass' | 'laurel';
  className?: string;
}

export function OrnamentalDivider({ variant = 'simple', className = '' }: OrnamentalDividerProps) {
  const symbol = variant === 'compass' ? '✦' : variant === 'laurel' ? '⚜' : '◆';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className={`flex items-center gap-3 py-2 ${className}`}
    >
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="flex items-center gap-1.5">
        <span className="text-[6px] text-primary/40">───</span>
        <span className="text-primary/60 text-xs">{symbol}</span>
        <span className="text-[6px] text-primary/40">───</span>
      </div>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </motion.div>
  );
}

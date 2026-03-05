import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';

interface ResumeBannerProps {
  nodeName: string;
  onResume: () => void;
  onDismiss: () => void;
}

export function ResumeBanner({ nodeName, onResume, onDismiss }: ResumeBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mx-4 mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center justify-between gap-3"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">You left off at</p>
        <p className="font-semibold text-sm truncate">{nodeName}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onResume}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-bold text-xs transition-all hover:opacity-90 active:scale-95"
        >
          <Play size={12} />
          Resume
        </button>
        <button
          onClick={onDismiss}
          className="p-1.5 rounded-lg hover:bg-card transition-colors"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>
    </motion.div>
  );
}

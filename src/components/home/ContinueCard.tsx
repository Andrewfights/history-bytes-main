import { Play, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { continueSession } from '@/data/mockData';

interface ContinueCardProps {
  onResume: () => void;
}

export function ContinueCard({ onResume }: ContinueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="lesson-card card-hover cursor-pointer group"
      onClick={onResume}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Continue
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{continueSession.session.duration}</span>
        </div>
      </div>
      
      <h3 className="font-editorial text-lg font-semibold mb-1">
        {continueSession.topic}: {continueSession.chapter}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4">
        Session {continueSession.sessionNumber} of {continueSession.totalSessions}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '40%' }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-semibold transition-all group-hover:glow-yellow"
        >
          <Play size={14} fill="currentColor" />
          Resume
        </motion.button>
      </div>
    </motion.div>
  );
}

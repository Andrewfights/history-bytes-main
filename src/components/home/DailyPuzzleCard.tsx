import { Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface DailyPuzzleCardProps {
  onPlay: () => void;
}

export function DailyPuzzleCard({ onPlay }: DailyPuzzleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="lesson-card card-hover cursor-pointer group border-primary/20"
      onClick={onPlay}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Calendar className="text-primary" size={24} />
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-0.5">Daily Puzzle</h3>
          <p className="text-sm text-muted-foreground">Guess the Year</p>
        </div>
        
        <motion.div
          className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"
          whileHover={{ x: 3 }}
        >
          <ChevronRight size={20} className="text-primary" />
        </motion.div>
      </div>
    </motion.div>
  );
}

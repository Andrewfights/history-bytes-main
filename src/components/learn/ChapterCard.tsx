import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Chapter } from '@/types';

interface ChapterCardProps {
  chapter: Chapter;
  index: number;
  onSelect: () => void;
}

export function ChapterCard({ chapter, index, onSelect }: ChapterCardProps) {
  const progress = (chapter.completedSessions / chapter.sessionsCount) * 100;
  const isComplete = progress === 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="lesson-card card-hover cursor-pointer group"
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
          isComplete 
            ? 'bg-success/10 text-success' 
            : 'bg-primary/10 text-primary'
        }`}>
          {isComplete ? <CheckCircle2 size={20} /> : index + 1}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold mb-1 pr-6">{chapter.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {chapter.description}
          </p>
          
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${isComplete ? 'bg-success' : 'bg-primary'}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ delay: 0.3 + index * 0.1 }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {chapter.completedSessions}/{chapter.sessionsCount}
            </span>
          </div>
        </div>
        
        <ChevronRight size={20} className="text-muted-foreground group-hover:text-primary transition-colors mt-2" />
      </div>
    </motion.div>
  );
}

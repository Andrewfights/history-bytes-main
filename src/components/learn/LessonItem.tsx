import { motion } from 'framer-motion';
import { Play, CheckCircle2, Lock, Clock } from 'lucide-react';
import { Lesson } from '@/types';

interface LessonItemProps {
  lesson: Lesson;
  unitOrder: number;
  isCompleted?: boolean;
  isLocked?: boolean;
  isCurrent?: boolean;
  onClick?: () => void;
}

export function LessonItem({
  lesson,
  unitOrder,
  isCompleted = false,
  isLocked = false,
  isCurrent = false,
  onClick,
}: LessonItemProps) {
  const lessonNumber = `${unitOrder}.${lesson.order}`;

  return (
    <motion.button
      onClick={onClick}
      disabled={isLocked}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
        isLocked
          ? 'opacity-50 cursor-not-allowed'
          : isCurrent
          ? 'bg-primary/10 border border-primary/30'
          : 'hover:bg-muted/50 active:scale-[0.99]'
      }`}
      whileTap={!isLocked ? { scale: 0.99 } : {}}
    >
      {/* Status Icon */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          isCompleted
            ? 'bg-success/20 text-success'
            : isLocked
            ? 'bg-muted text-muted-foreground'
            : isCurrent
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        {isCompleted ? (
          <CheckCircle2 size={16} />
        ) : isLocked ? (
          <Lock size={14} />
        ) : isCurrent ? (
          <Play size={14} className="ml-0.5" />
        ) : (
          <span className="text-xs font-bold">{lessonNumber}</span>
        )}
      </div>

      {/* Lesson Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isCompleted ? 'text-muted-foreground' : 'text-foreground'
          }`}
        >
          {lesson.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={12} />
          <span>{lesson.durationMinutes} min</span>
          <span className="text-gold-primary">+{lesson.xpReward} XP</span>
        </div>
      </div>

      {/* Completed checkmark or play icon */}
      {isCompleted && (
        <CheckCircle2 size={18} className="text-success shrink-0" />
      )}
    </motion.button>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle2, Clock } from 'lucide-react';
import { Unit, Lesson } from '@/types';
import { LessonItem } from './LessonItem';
import { formatDuration } from '@/data/courseData';

interface UnitAccordionProps {
  unit: Unit;
  lessons: Lesson[];
  isFirst?: boolean;
  completedLessons?: Set<string>;
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
}

export function UnitAccordion({
  unit,
  lessons,
  isFirst = false,
  completedLessons = new Set(),
  currentLessonId,
  onLessonClick,
}: UnitAccordionProps) {
  const [isOpen, setIsOpen] = useState(isFirst);

  const completedCount = lessons.filter(l => completedLessons.has(l.id)).length;
  const isUnitCompleted = completedCount === lessons.length;
  const hasProgress = completedCount > 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden mb-3">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 p-4 text-left bg-card hover:bg-muted/50 transition-colors"
      >
        {/* Status indicator */}
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            isUnitCompleted
              ? 'bg-success/20 text-success'
              : hasProgress
              ? 'bg-primary/20 text-primary'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {isUnitCompleted ? (
            <CheckCircle2 size={18} />
          ) : (
            <span className="text-sm font-bold">{unit.order}</span>
          )}
        </div>

        {/* Unit info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            Unit {unit.order}: {unit.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {formatDuration(unit.totalDurationMinutes)}
            </span>
            <span>
              {completedCount}/{lessons.length} lessons
            </span>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={20} className="text-muted-foreground" />
        </motion.div>
      </button>

      {/* Lessons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 pt-1 space-y-1 border-t border-border bg-muted/20">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson.id);
                const isCurrent = lesson.id === currentLessonId;
                // A lesson is locked if the previous one isn't completed (and it's not the first)
                const previousLesson = lessons[index - 1];
                const isLocked = index > 0 && previousLesson && !completedLessons.has(previousLesson.id) && !isCurrent;

                return (
                  <LessonItem
                    key={lesson.id}
                    lesson={lesson}
                    unitOrder={unit.order}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isLocked={isLocked}
                    onClick={() => !isLocked && onLessonClick(lesson.id)}
                  />
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

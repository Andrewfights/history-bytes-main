import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Clock, Lock, Play, BookOpen } from 'lucide-react';
import { Unit, Lesson } from '@/types';
import { formatDuration } from '@/data/courseData';

interface UnitAccordionProps {
  unit: Unit;
  lessons: Lesson[];
  isFirst?: boolean;
  completedLessons?: Set<string>;
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
}

// Convert number to Roman numeral
function toRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  for (const [value, symbol] of romanNumerals) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
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
  const progressPercent = lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0;

  return (
    <div className="mb-3 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-4 p-4 text-left bg-[linear-gradient(180deg,rgba(19,21,24,0.95),rgba(10,8,5,0.95))] border border-[var(--border-gold)] rounded-lg hover:border-[var(--gold-2)]/40 transition-colors"
      >
        {/* Roman numeral with progress ring */}
        <div className="relative w-12 h-12 flex-shrink-0">
          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="rgba(230,171,42,0.15)"
              strokeWidth="2"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke={isUnitCompleted ? 'var(--success)' : 'var(--gold-2)'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={`${(progressPercent / 100) * 125.6} 125.6`}
              className="transition-all duration-500"
            />
          </svg>
          {/* Roman numeral or check */}
          <div className={`absolute inset-0 flex items-center justify-center ${
            isUnitCompleted ? 'text-[var(--success)]' : 'text-[var(--gold-2)]'
          }`}>
            {isUnitCompleted ? (
              <Check size={20} strokeWidth={3} />
            ) : (
              <span className="font-[var(--font-stat)] italic text-lg">
                {toRoman(unit.order)}
              </span>
            )}
          </div>
        </div>

        {/* Unit info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono text-[var(--ha-red)] uppercase tracking-[0.25em]">
              Unit {toRoman(unit.order)}
            </span>
            {isUnitCompleted && (
              <span className="px-1.5 py-0.5 text-[7px] font-mono uppercase tracking-wider bg-[var(--success)]/15 text-[var(--success)] rounded">
                Complete
              </span>
            )}
          </div>
          <h3 className="font-['Playfair_Display',Georgia,serif] italic text-base text-[var(--off-white)] leading-tight">
            {unit.title}
          </h3>
          <div className="flex items-center gap-3 text-[10px] text-[var(--text-3)] mt-1.5 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Clock size={10} />
              {formatDuration(unit.totalDurationMinutes)}
            </span>
            <span className="text-[var(--text-4)]">·</span>
            <span className="flex items-center gap-1">
              <BookOpen size={10} />
              {completedCount}/{lessons.length}
            </span>
          </div>
        </div>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="flex-shrink-0"
        >
          <ChevronDown size={18} className="text-[var(--text-3)]" />
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
            <div className="pt-2 space-y-1.5 pl-5 border-l border-[var(--border-gold)] ml-6 mt-1">
              {lessons.map((lesson, index) => {
                const isCompleted = completedLessons.has(lesson.id);
                const isCurrent = lesson.id === currentLessonId;
                // A lesson is locked if the previous one isn't completed (and it's not the first)
                const previousLesson = lessons[index - 1];
                const isLocked = index > 0 && previousLesson && !completedLessons.has(previousLesson.id) && !isCurrent;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => !isLocked && onLessonClick(lesson.id)}
                    disabled={isLocked}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all ${
                      isLocked
                        ? 'opacity-50 cursor-not-allowed bg-[rgba(0,0,0,0.2)]'
                        : isCurrent
                        ? 'bg-[rgba(230,171,42,0.1)] border border-[var(--gold-2)]'
                        : isCompleted
                        ? 'bg-[rgba(61,214,122,0.05)] border border-[var(--success)]/20 hover:border-[var(--success)]/40'
                        : 'bg-[rgba(0,0,0,0.3)] border border-[var(--border-gold)] hover:border-[var(--gold-2)]/40'
                    }`}
                  >
                    {/* Lesson status */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isLocked
                        ? 'bg-[rgba(255,255,255,0.05)] text-[var(--text-4)]'
                        : isCompleted
                        ? 'bg-[var(--success)]/15 text-[var(--success)]'
                        : isCurrent
                        ? 'bg-[var(--gold-2)] text-[#1a0b02]'
                        : 'bg-[rgba(230,171,42,0.1)] text-[var(--gold-2)]'
                    }`}>
                      {isLocked ? (
                        <Lock size={12} />
                      ) : isCompleted ? (
                        <Check size={14} strokeWidth={3} />
                      ) : isCurrent ? (
                        <Play size={12} fill="currentColor" className="ml-0.5" />
                      ) : (
                        <span className="font-mono text-xs">{String(index + 1).padStart(2, '0')}</span>
                      )}
                    </div>

                    {/* Lesson info */}
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium leading-tight ${
                        isLocked
                          ? 'text-[var(--text-4)]'
                          : isCompleted
                          ? 'text-[var(--text-2)]'
                          : 'text-[var(--off-white)]'
                      }`}>
                        {lesson.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-[var(--text-4)] mt-0.5 font-mono">
                        <span>{lesson.durationMinutes} min</span>
                        <span>·</span>
                        <span>{lesson.cardCount || 3} cards</span>
                      </div>
                    </div>

                    {/* Current indicator */}
                    {isCurrent && (
                      <span className="px-2 py-1 text-[7px] font-mono uppercase tracking-wider bg-[var(--gold-2)] text-[#1a0b02] rounded font-bold">
                        Continue
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

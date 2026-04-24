import { Unit, Lesson } from '@/types';
import { UnitAccordion } from './UnitAccordion';
import { BookOpen, Clock, Trophy, ChevronRight } from 'lucide-react';

interface CourseSyllabusProps {
  units: Unit[];
  lessonsByUnit: Map<string, Lesson[]>;
  completedLessons?: Set<string>;
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
  courseTitle?: string;
  totalXP?: number;
}

export function CourseSyllabus({
  units,
  lessonsByUnit,
  completedLessons = new Set(),
  currentLessonId,
  onLessonClick,
  courseTitle,
  totalXP = 300,
}: CourseSyllabusProps) {
  const totalLessons = Array.from(lessonsByUnit.values()).flat().length;
  const completedCount = completedLessons.size;
  const totalMinutes = units.reduce((sum, unit) => sum + (unit.totalDurationMinutes || 0), 0);
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <section className="px-4 mb-8">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[9px] font-mono text-[var(--ha-red)] uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-3 h-px bg-[var(--ha-red)]" />
            Syllabus
          </span>
        </div>
        {courseTitle && (
          <h2 className="font-['Playfair_Display',Georgia,serif] italic text-xl text-[var(--off-white)] mb-3">
            {courseTitle}
          </h2>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 py-3 px-4 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[var(--border-gold)]">
          <div className="flex items-center gap-2">
            <BookOpen size={14} className="text-[var(--gold-2)]" />
            <span className="text-xs text-[var(--text-2)]">
              <span className="font-mono text-[var(--gold-2)]">{completedCount}</span>
              <span className="text-[var(--text-4)]">/</span>
              <span className="font-mono">{totalLessons}</span>
              <span className="text-[var(--text-4)] ml-1">lessons</span>
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--divider)]" />
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-[var(--text-3)]" />
            <span className="text-xs text-[var(--text-3)]">
              ~{Math.round(totalMinutes / 60)}h {totalMinutes % 60}m
            </span>
          </div>
          <div className="w-px h-4 bg-[var(--divider)]" />
          <div className="flex items-center gap-2">
            <Trophy size={14} className="text-[var(--gold-2)]" />
            <span className="text-xs font-mono text-[var(--gold-2)]">{totalXP} XP</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono text-[var(--text-3)] mb-1.5">
            <span>Progress</span>
            <span className="text-[var(--gold-2)]">{progressPercent}%</span>
          </div>
          <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100
                  ? 'linear-gradient(90deg, var(--success-deep), var(--success))'
                  : 'linear-gradient(90deg, var(--gold-3), var(--gold-2))'
              }}
            />
          </div>
        </div>
      </div>

      {/* Units */}
      <div>
        {units.map((unit, index) => {
          const lessons = lessonsByUnit.get(unit.id) || [];
          return (
            <UnitAccordion
              key={unit.id}
              unit={unit}
              lessons={lessons}
              isFirst={index === 0}
              completedLessons={completedLessons}
              currentLessonId={currentLessonId}
              onLessonClick={onLessonClick}
            />
          );
        })}
      </div>

      {/* Total summary */}
      <div className="mt-4 p-4 rounded-lg bg-[rgba(0,0,0,0.3)] border border-[var(--border-gold)] text-center">
        <p className="text-xs text-[var(--text-3)] font-mono uppercase tracking-wider">
          {units.length} units · {totalLessons} lessons · {totalXP} XP available
        </p>
      </div>
    </section>
  );
}

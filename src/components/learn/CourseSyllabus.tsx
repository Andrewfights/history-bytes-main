import { Unit, Lesson } from '@/types';
import { UnitAccordion } from './UnitAccordion';

interface CourseSyllabusProps {
  units: Unit[];
  lessonsByUnit: Map<string, Lesson[]>;
  completedLessons?: Set<string>;
  currentLessonId?: string;
  onLessonClick: (lessonId: string) => void;
}

export function CourseSyllabus({
  units,
  lessonsByUnit,
  completedLessons = new Set(),
  currentLessonId,
  onLessonClick,
}: CourseSyllabusProps) {
  return (
    <section className="px-4 mb-8">
      <h2 className="font-editorial text-lg font-semibold mb-4">Syllabus</h2>

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
      <div className="mt-4 p-4 rounded-xl bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">
          {units.length} units | {Array.from(lessonsByUnit.values()).flat().length} lessons
        </p>
      </div>
    </section>
  );
}

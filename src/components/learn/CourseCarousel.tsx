import { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { Course, CourseProgress } from '@/types';
import { CourseCard } from './CourseCard';
import { ContinueLearningCard } from './ContinueLearningCard';

interface CourseCarouselProps {
  title: string;
  subtitle?: string;
  courses: Course[];
  progress?: Map<string, CourseProgress>; // For continue learning section
  onCourseClick: (courseId: string) => void;
  onViewAll?: () => void;
  type?: 'standard' | 'continue';
}

export function CourseCarousel({
  title,
  subtitle,
  courses,
  progress,
  onCourseClick,
  onViewAll,
  type = 'standard',
}: CourseCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (courses.length === 0) return null;

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4">
        <div>
          <h2 className="font-editorial text-lg font-semibold text-foreground">{title}</h2>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs text-primary font-medium"
          >
            View all
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Scrollable row */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-2 px-4 scroll-snap-x hide-scrollbar scroll-smooth-touch"
      >
        {type === 'continue' && progress
          ? courses.map((course) => {
              const courseProgress = progress.get(course.id);
              if (!courseProgress) return null;
              return (
                <ContinueLearningCard
                  key={course.id}
                  course={course}
                  progress={courseProgress}
                  onClick={() => onCourseClick(course.id)}
                />
              );
            })
          : courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => onCourseClick(course.id)}
                size="md"
              />
            ))}
      </div>
    </section>
  );
}

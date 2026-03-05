import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, Users, CheckCircle2, Play } from 'lucide-react';
import { Course, CourseProgress, Unit, Lesson } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';
import { RatingDisplay } from './RatingDisplay';
import { InstructorCard } from './InstructorCard';
import { CourseSyllabus } from './CourseSyllabus';
import { useLiveCourseData } from '@/hooks/useLiveData';
import {
  getInstructorById,
  formatDuration,
  formatEnrollment,
} from '@/data/courseData';

interface CourseDetailPageProps {
  course: Course;
  progress?: CourseProgress;
  completedLessons: Set<string>;
  onBack: () => void;
  onLessonClick: (lessonId: string) => void;
  onStartCourse: () => void;
}

export function CourseDetailPage({
  course,
  progress,
  completedLessons,
  onBack,
  onLessonClick,
  onStartCourse,
}: CourseDetailPageProps) {
  const { getUnitsByCourseId, getLessonsByUnitId } = useLiveCourseData();
  const instructor = getInstructorById(course.instructorId);
  const units = getUnitsByCourseId(course.id);

  // Build lessons by unit map
  const lessonsByUnit = useMemo(() => {
    const map = new Map<string, Lesson[]>();
    units.forEach(unit => {
      map.set(unit.id, getLessonsByUnitId(unit.id));
    });
    return map;
  }, [units, getLessonsByUnitId]);

  // Find current lesson (first uncompleted)
  const currentLessonId = useMemo(() => {
    for (const unit of units) {
      const lessons = lessonsByUnit.get(unit.id) || [];
      for (const lesson of lessons) {
        if (!completedLessons.has(lesson.id)) {
          return lesson.id;
        }
      }
    }
    return undefined;
  }, [units, lessonsByUnit, completedLessons]);

  const hasStarted = progress && progress.percentComplete > 0;

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground touch-target"
          >
            <ArrowLeft size={24} />
          </button>
          <span className="text-sm font-medium text-foreground truncate">
            {course.title}
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="px-4 pt-4 pb-6">
        {/* Hero Background */}
        <div className="relative h-40 rounded-xl overflow-hidden mb-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />

          {/* Overlay content */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <DifficultyBadge difficulty={course.difficulty} />
          </div>
        </div>

        {/* Title & Meta */}
        <h1 className="font-editorial text-2xl font-bold text-foreground mb-2">
          {course.title}
        </h1>

        {instructor && (
          <p className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
            <span className="text-lg">{instructor.avatar}</span>
            <span>{instructor.name}</span>
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-5">
          <RatingDisplay rating={course.rating} ratingsCount={course.ratingsCount} size="md" />
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(course.totalDurationMinutes)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {formatEnrollment(course.enrolledCount)}
          </span>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={onStartCourse}
          className="w-full py-4 rounded-xl btn-gold flex items-center justify-center gap-2 font-bold text-base"
          whileTap={{ scale: 0.98 }}
        >
          <Play size={20} className="ml-0.5" />
          {hasStarted ? 'Continue Learning' : 'Start Course'}
        </motion.button>

        {/* Progress indicator */}
        {progress && progress.percentComplete > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{progress.lessonsCompleted}/{progress.totalLessons} lessons</span>
              <span>{progress.percentComplete}% complete</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress.percentComplete}%` }}
              />
            </div>
          </div>
        )}
      </section>

      {/* Description */}
      <section className="px-4 mb-8">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {course.description}
        </p>
      </section>

      {/* Learning Outcomes */}
      <section className="px-4 mb-8">
        <h2 className="font-editorial text-lg font-semibold mb-3">What You'll Learn</h2>
        <div className="space-y-2">
          {course.learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-success shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">{outcome}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Instructor */}
      {instructor && <InstructorCard instructor={instructor} />}

      {/* Syllabus */}
      <CourseSyllabus
        units={units}
        lessonsByUnit={lessonsByUnit}
        completedLessons={completedLessons}
        currentLessonId={currentLessonId}
        onLessonClick={onLessonClick}
      />
    </div>
  );
}

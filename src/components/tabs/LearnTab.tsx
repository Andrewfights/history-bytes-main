import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { CourseCatalog } from '@/components/learn/CourseCatalog';
import { CourseDetailPage } from '@/components/learn/CourseDetailPage';
import { getCourseById, getUnitsByCourseId, getLessonsByUnitId } from '@/data/courseData';

interface LearnTabProps {
  initialTopicId?: string; // Legacy prop - maps to courseId
  onSelectChapter: (chapterId: string) => void; // Legacy prop - maps to lessonId
}

export function LearnTab({ initialTopicId, onSelectChapter }: LearnTabProps) {
  const { completedLessons, courseProgress } = useApp();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(initialTopicId || null);

  const selectedCourse = selectedCourseId ? getCourseById(selectedCourseId) : null;
  const currentProgress = selectedCourseId ? courseProgress.get(selectedCourseId) : undefined;

  const handleCourseClick = useCallback((courseId: string) => {
    setSelectedCourseId(courseId);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCourseId(null);
  }, []);

  const handleLessonClick = useCallback((lessonId: string) => {
    // Use the legacy callback to navigate to the lesson
    onSelectChapter(lessonId);
  }, [onSelectChapter]);

  const handleStartCourse = useCallback(() => {
    if (!selectedCourseId) return;

    // Find the first incomplete lesson
    const courseUnits = getUnitsByCourseId(selectedCourseId);
    for (const unit of courseUnits) {
      const unitLessons = getLessonsByUnitId(unit.id);
      for (const lesson of unitLessons) {
        if (!completedLessons.has(lesson.id)) {
          onSelectChapter(lesson.id);
          return;
        }
      }
    }

    // All lessons completed - start from beginning
    const firstUnit = courseUnits[0];
    if (firstUnit) {
      const firstLesson = getLessonsByUnitId(firstUnit.id)[0];
      if (firstLesson) {
        onSelectChapter(firstLesson.id);
      }
    }
  }, [selectedCourseId, completedLessons, onSelectChapter]);

  return (
    <AnimatePresence mode="wait">
      {selectedCourse ? (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <CourseDetailPage
            course={selectedCourse}
            progress={currentProgress}
            completedLessons={completedLessons}
            onBack={handleBack}
            onLessonClick={handleLessonClick}
            onStartCourse={handleStartCourse}
          />
        </motion.div>
      ) : (
        <motion.div
          key="catalog"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="pt-6">
            {/* Page Header */}
            <div className="px-4 mb-6">
              {/* Kicker */}
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-6 h-[1px] bg-ha-red" />
                <span className="font-mono text-[10px] font-bold tracking-[0.3em] text-ha-red uppercase">
                  The Library • Open
                </span>
              </div>
              {/* Title */}
              <h1 className="font-display text-[28px] sm:text-[36px] font-bold text-off-white uppercase tracking-tight leading-none mb-2">
                The <span className="text-gold-2">Curriculum.</span>
              </h1>
              {/* Subtitle */}
              <p className="text-off-white/60 text-[13px] sm:text-sm leading-relaxed">
                Courses, instructors, certificates. Structured learning in the Academy style.
              </p>
            </div>
            <CourseCatalog
              courseProgress={courseProgress}
              onCourseClick={handleCourseClick}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

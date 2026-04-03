import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Course, CourseProgress } from '@/types';
import { CourseHero } from './CourseHero';
import { CourseCarousel } from './CourseCarousel';
import { useLiveCourses, useLiveFeaturedCourse } from '@/hooks/useLiveData';
import { carouselRows, getInstructorById, formatDuration } from '@/data/courseData';
import { useApp } from '@/context/AppContext';
import { Zap, Flame, Target, BookOpen, Play, ChevronDown, Clock, Users, Star } from 'lucide-react';

interface CourseCatalogProps {
  courseProgress: Map<string, CourseProgress>;
  onCourseClick: (courseId: string) => void;
}

export function CourseCatalog({ courseProgress, onCourseClick }: CourseCatalogProps) {
  const { data: allCourses } = useLiveCourses();
  const { data: featuredCourse } = useLiveFeaturedCourse();
  const { user, totalCorrectAnswers, totalQuestions } = useApp();
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Get courses with progress for "Continue Learning"
  const inProgressCourses = useMemo(() => {
    return allCourses.filter(course => {
      const progress = courseProgress.get(course.id);
      return progress && progress.percentComplete > 0 && progress.percentComplete < 100;
    });
  }, [courseProgress, allCourses]);

  // Get completed courses
  const completedCourses = useMemo(() => {
    return allCourses.filter(course => {
      const progress = courseProgress.get(course.id);
      return progress && progress.percentComplete === 100;
    });
  }, [courseProgress, allCourses]);

  // Sort courses - featured first, then by chronoOrder
  const sortedCourses = useMemo(() => {
    return [...allCourses].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (a.chronoOrder || 0) - (b.chronoOrder || 0);
    });
  }, [allCourses]);

  // Calculate quiz accuracy
  const quizAccuracy = totalQuestions > 0
    ? Math.round((totalCorrectAnswers / totalQuestions) * 100)
    : 0;

  return (
    <div className="pb-28">
      {/* Compact Progress Stats Row */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border">
          {/* XP */}
          <div className="flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Zap size={16} className="text-amber-500" />
            </div>
            <div>
              <div className="font-bold text-sm">{user.xp.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">XP</div>
            </div>
          </div>
          {/* Streak */}
          <div className="flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Flame size={16} className="text-orange-500" />
            </div>
            <div>
              <div className="font-bold text-sm">{user.streak}</div>
              <div className="text-[10px] text-muted-foreground">Streak</div>
            </div>
          </div>
          {/* Accuracy */}
          <div className="flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Target size={16} className="text-blue-500" />
            </div>
            <div>
              <div className="font-bold text-sm">
                {totalQuestions > 0 ? `${quizAccuracy}%` : '—'}
              </div>
              <div className="text-[10px] text-muted-foreground">Accuracy</div>
            </div>
          </div>
          {/* Courses */}
          <div className="flex-1 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <BookOpen size={16} className="text-green-500" />
            </div>
            <div>
              <div className="font-bold text-sm">{completedCourses.length}/{allCourses.length}</div>
              <div className="text-[10px] text-muted-foreground">Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      {inProgressCourses.length > 0 && (
        <div className="mb-6">
          <div className="px-4 mb-3">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
              <Play size={12} />
              Continue Learning
            </h2>
            <div className="mt-2 w-12 h-[3px] bg-green-500 rounded-full" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 px-4 scroll-smooth snap-x">
            {inProgressCourses.map((course) => {
              const progress = courseProgress.get(course.id);
              const instructor = getInstructorById(course.instructorId);
              return (
                <button
                  key={course.id}
                  onClick={() => onCourseClick(course.id)}
                  className="flex-shrink-0 w-44 text-left group snap-start"
                >
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-800">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <Play size={20} className="text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="h-1.5 bg-white/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${progress?.percentComplete || 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-white/80">
                          {progress?.lessonsCompleted || 0}/{progress?.totalLessons || 0} lessons
                        </span>
                        <span className="text-[10px] text-green-400 font-medium">
                          {progress?.percentComplete || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  {instructor && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <span>{instructor.avatar}</span>
                      <span className="truncate">{instructor.name}</span>
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Featured Hero */}
      {featuredCourse && !inProgressCourses.find(c => c.id === featuredCourse.id) && (
        <CourseHero
          course={featuredCourse}
          onStart={() => onCourseClick(featuredCourse.id)}
        />
      )}

      {/* Browse All Courses - Grid */}
      <div className="px-4 mb-6">
        <div className="mb-3">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider">
            <BookOpen size={12} />
            All Courses
            <span className="text-muted-foreground/60">({allCourses.length})</span>
          </h2>
          <div className="mt-2 w-12 h-[3px] bg-amber-500 rounded-full" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(showAllCourses ? sortedCourses : sortedCourses.slice(0, 6)).map((course) => {
            const progress = courseProgress.get(course.id);
            const instructor = getInstructorById(course.instructorId);
            const isComplete = progress?.percentComplete === 100;
            const hasProgress = progress && progress.percentComplete > 0;

            return (
              <motion.button
                key={course.id}
                onClick={() => onCourseClick(course.id)}
                className="text-left group"
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-2 bg-slate-800">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                  {/* Badges - Top Left */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {course.isNew && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                        NEW
                      </span>
                    )}
                    {isComplete && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center gap-1">
                        ✓ DONE
                      </span>
                    )}
                  </div>

                  {/* XP Badge - Top Right */}
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/90 text-white text-[10px] font-bold">
                      +{course.lessonsCount * 25} XP
                    </span>
                  </div>

                  {/* Bottom info */}
                  <div className="absolute bottom-2 left-2 right-2">
                    {/* Difficulty badge */}
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mb-1 ${
                      course.difficulty === 'beginner' ? 'bg-green-500/80 text-white' :
                      course.difficulty === 'intermediate' ? 'bg-amber-500/80 text-white' :
                      'bg-red-500/80 text-white'
                    }`}>
                      {course.difficulty}
                    </span>

                    {/* Progress bar */}
                    {hasProgress && !isComplete && (
                      <div className="mt-1">
                        <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${progress.percentComplete}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Info */}
                <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  {instructor && <span>{instructor.avatar}</span>}
                  <span className="flex items-center gap-0.5">
                    <Star size={10} className="fill-amber-400 text-amber-400" />
                    {course.rating}
                  </span>
                  <span>•</span>
                  <span>{formatDuration(course.totalDurationMinutes)}</span>
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                  <Users size={10} />
                  <span>{(course.enrolledCount / 1000).toFixed(1)}k enrolled</span>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Show More / Show Less Button */}
        {sortedCourses.length > 6 && (
          <button
            onClick={() => setShowAllCourses(!showAllCourses)}
            className="w-full mt-4 p-3 rounded-xl bg-gradient-to-r from-slate-800/80 to-slate-900/60 border border-white/10 hover:border-amber-500/30 transition-all group flex items-center justify-center gap-2"
          >
            <span className="text-sm font-medium text-white/80">
              {showAllCourses ? 'Show Less' : `View All ${sortedCourses.length} Courses`}
            </span>
            <motion.div
              animate={{ rotate: showAllCourses ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={16} className="text-white/60" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Category Carousels */}
      {carouselRows
        .filter(row => row.type !== 'continue') // Skip continue row since we have our own
        .slice(0, 3) // Show only first 3 category carousels
        .map(row => {
          const courses = row.courseIds
            .map(id => allCourses.find(c => c.id === id))
            .filter(Boolean) as Course[];

          if (courses.length === 0) return null;

          return (
            <CourseCarousel
              key={row.id}
              title={row.title}
              subtitle={row.subtitle}
              courses={courses}
              onCourseClick={onCourseClick}
              type="standard"
            />
          );
        })}

      {/* Empty state if no courses */}
      {allCourses.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground">No courses available yet.</p>
        </div>
      )}
    </div>
  );
}

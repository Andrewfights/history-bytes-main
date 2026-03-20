import { useMemo } from 'react';
import { Course, CourseProgress } from '@/types';
import { CourseHero } from './CourseHero';
import { CourseCarousel } from './CourseCarousel';
import { useLiveCourses, useLiveFeaturedCourse, useLiveCourseById } from '@/hooks/useLiveData';
import { carouselRows } from '@/data/courseData';

interface CourseCatalogProps {
  courseProgress: Map<string, CourseProgress>;
  onCourseClick: (courseId: string) => void;
}

export function CourseCatalog({ courseProgress, onCourseClick }: CourseCatalogProps) {
  const { data: allCourses } = useLiveCourses();
  const { data: featuredCourse } = useLiveFeaturedCourse();

  // Get courses with progress for "Continue Learning"
  const inProgressCourses = useMemo(() => {
    return allCourses.filter(course => {
      const progress = courseProgress.get(course.id);
      return progress && progress.percentComplete > 0 && progress.percentComplete < 100;
    });
  }, [courseProgress, allCourses]);

  // Build rows
  const rows = useMemo(() => {
    return carouselRows.map(row => {
      if (row.type === 'continue') {
        return {
          ...row,
          courses: inProgressCourses,
        };
      }
      return {
        ...row,
        courses: row.courseIds.map(id => allCourses.find(c => c.id === id)).filter(Boolean) as Course[],
      };
    }).filter(row => row.courses.length > 0);
  }, [inProgressCourses, allCourses]);

  return (
    <div className="pb-28">
      {/* Featured Hero */}
      {featuredCourse && (
        <CourseHero
          course={featuredCourse}
          onStart={() => onCourseClick(featuredCourse.id)}
        />
      )}

      {/* Carousel Rows */}
      {rows.map(row => (
        <CourseCarousel
          key={row.id}
          title={row.title}
          subtitle={row.subtitle}
          courses={row.courses}
          progress={row.type === 'continue' ? courseProgress : undefined}
          onCourseClick={onCourseClick}
          type={row.type === 'continue' ? 'continue' : 'standard'}
        />
      ))}

      {/* Empty state if no courses */}
      {allCourses.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-muted-foreground">No courses available yet.</p>
        </div>
      )}
    </div>
  );
}

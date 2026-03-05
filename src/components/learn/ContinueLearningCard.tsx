import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import { Course, CourseProgress } from '@/types';
import { getInstructorById, formatDuration } from '@/data/courseData';
import { useThumbnailUrl } from '@/lib/thumbnailUtils';

interface ContinueLearningCardProps {
  course: Course;
  progress: CourseProgress;
  onClick?: () => void;
}

export function ContinueLearningCard({ course, progress, onClick }: ContinueLearningCardProps) {
  const instructor = getInstructorById(course.instructorId);
  const thumbnailUrl = useThumbnailUrl(course.thumbnailUrl, course.id);

  return (
    <motion.button
      onClick={onClick}
      className="continue-card w-64 flex-shrink-0 text-left group scroll-snap-start"
      whileTap={{ scale: 0.98 }}
    >
      {/* Background image */}
      <img
        src={thumbnailUrl}
        alt={course.title}
        className="absolute inset-0 w-full h-full object-cover rounded-xl"
      />
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 rounded-xl" />

      {/* Content */}
      <div className="relative h-full p-4 flex flex-col justify-between">
        {/* Top section */}
        <div className="flex items-start gap-3">
          {/* Play button */}
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Play size={18} className="text-primary-foreground ml-0.5" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
              {course.title}
            </h3>
            {instructor && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {instructor.avatar} {instructor.name}
              </p>
            )}
          </div>
        </div>

        {/* Bottom section */}
        <div>
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>{progress.lessonsCompleted}/{progress.totalLessons} lessons</span>
            <span>{progress.percentComplete}% complete</span>
          </div>

          {/* Progress bar */}
          <div className="continue-card-progress">
            <div
              className="continue-card-progress-fill transition-all duration-300"
              style={{ width: `${progress.percentComplete}%` }}
            />
          </div>
        </div>
      </div>
    </motion.button>
  );
}

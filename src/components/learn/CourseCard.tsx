import { motion } from 'framer-motion';
import { Clock, Users } from 'lucide-react';
import { Course, Instructor } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';
import { RatingDisplay } from './RatingDisplay';
import { formatDuration, formatEnrollment, getInstructorById } from '@/data/courseData';
import { useThumbnailUrl } from '@/lib/thumbnailUtils';

interface CourseCardProps {
  course: Course;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function CourseCard({ course, onClick, size = 'md' }: CourseCardProps) {
  const instructor = getInstructorById(course.instructorId);
  const thumbnailUrl = useThumbnailUrl(course.thumbnailUrl, course.id);

  const sizeClasses = {
    sm: 'w-36',
    md: 'w-44',
    lg: 'w-56',
  };

  return (
    <motion.button
      onClick={onClick}
      className={`${sizeClasses[size]} flex-shrink-0 text-left group scroll-snap-start`}
      whileTap={{ scale: 0.98 }}
    >
      {/* Thumbnail */}
      <div className="course-card relative mb-2">
        {/* Background image */}
        <img
          src={thumbnailUrl}
          alt={course.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay */}
        <div className="course-card-overlay absolute inset-0" />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          {course.isNew && (
            <span className="px-2 py-0.5 rounded-full bg-success text-success-foreground text-[10px] font-bold">
              NEW
            </span>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <DifficultyBadge difficulty={course.difficulty} size="sm" />
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
          {course.title}
        </h3>

        {instructor && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span>{instructor.avatar}</span>
            <span className="truncate">{instructor.name}</span>
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <RatingDisplay rating={course.rating} showCount={false} size="sm" />
          <span className="flex items-center gap-1">
            <Clock size={10} />
            {formatDuration(course.totalDurationMinutes)}
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={10} />
          <span>{formatEnrollment(course.enrolledCount)} enrolled</span>
        </div>
      </div>
    </motion.button>
  );
}

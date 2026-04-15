import { motion } from 'framer-motion';
import { Clock, Users, Play } from 'lucide-react';
import { Course } from '@/types';
import { DifficultyBadge } from './DifficultyBadge';
import { RatingDisplay } from './RatingDisplay';
import { getInstructorById, formatDuration, formatEnrollment } from '@/data/courseData';
import { useThumbnailUrl } from '@/lib/thumbnailUtils';

interface CourseHeroProps {
  course: Course;
  onStart: () => void;
}

export function CourseHero({ course, onStart }: CourseHeroProps) {
  const instructor = getInstructorById(course.instructorId);
  const thumbnailUrl = useThumbnailUrl(course.thumbnailUrl, course.id);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mx-4 mb-8 rounded-2xl overflow-hidden"
    >
      {/* Background image */}
      <img
        src={thumbnailUrl}
        alt={course.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradient for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gold-highlight/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative p-6">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          {course.isFeatured && (
            <span className="px-2 py-1 rounded-full bg-gold-primary/20 text-gold-highlight text-[10px] font-bold uppercase tracking-wider">
              Featured
            </span>
          )}
          <DifficultyBadge difficulty={course.difficulty} size="sm" />
        </div>

        {/* Title */}
        <h1 className="font-editorial text-2xl font-bold text-foreground mb-2 leading-tight">
          {course.title}
        </h1>

        {/* Instructor */}
        {instructor && (
          <p className="text-sm text-muted-foreground mb-4 flex items-center gap-2">
            <span className="text-lg">{instructor.avatar}</span>
            <span>{instructor.name}</span>
            {instructor.credentials && (
              <span className="text-xs opacity-70">| {instructor.credentials}</span>
            )}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-muted-foreground">
          <RatingDisplay
            rating={course.rating}
            ratingsCount={course.ratingsCount}
            size="md"
          />
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {formatDuration(course.totalDurationMinutes)}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} />
            {formatEnrollment(course.enrolledCount)} enrolled
          </span>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={onStart}
          className="w-full py-4 rounded-xl btn-gold flex items-center justify-center gap-2 font-bold text-base"
          whileTap={{ scale: 0.98 }}
        >
          <Play size={20} className="ml-0.5" />
          Start Your Campaign
        </motion.button>
      </div>
    </motion.section>
  );
}

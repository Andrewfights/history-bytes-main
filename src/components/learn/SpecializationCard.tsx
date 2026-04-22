/**
 * SpecializationCard - Featured learning path/specialization card
 * Shows course progress, wax seal, and CTA buttons
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export type CourseStatus = 'done' | 'part' | 'locked';

export interface Specialization {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  era: string;
  courses: number;
  totalHours: number;
  xpReward: number;
  courseProgress: CourseStatus[];
  certificate?: boolean;
}

interface SpecializationCardProps {
  specialization: Specialization;
  onContinue: () => void;
  onViewSyllabus?: () => void;
  className?: string;
}

export function SpecializationCard({
  specialization,
  onContinue,
  onViewSyllabus,
  className,
}: SpecializationCardProps) {
  const {
    title,
    subtitle,
    description,
    era,
    courses,
    totalHours,
    xpReward,
    courseProgress,
    certificate,
  } = specialization;

  const completedCourses = courseProgress.filter((s) => s === 'done').length;
  const progressPercent = (completedCourses / courseProgress.length) * 100;

  return (
    <div
      className={cn(
        'specialization-card relative rounded-2xl overflow-hidden bg-ink-lift border border-border-gold',
        className
      )}
    >
      {/* Background scene */}
      <div className="relative h-40 overflow-hidden">
        {/* Pillar graphics */}
        <div className="absolute inset-0 flex justify-around items-end opacity-20">
          <div className="w-8 h-24 bg-gradient-to-t from-gold-3/50 to-transparent rounded-t" />
          <div className="w-6 h-32 bg-gradient-to-t from-gold-3/50 to-transparent rounded-t" />
          <div className="w-10 h-28 bg-gradient-to-t from-gold-3/50 to-transparent rounded-t" />
          <div className="w-6 h-20 bg-gradient-to-t from-gold-3/50 to-transparent rounded-t" />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-radial from-gold-2/10 via-transparent to-transparent" />

        {/* Tag */}
        <div className="absolute top-4 left-4">
          <span className="font-mono text-[8px] tracking-[0.2em] text-gold-2/80 uppercase bg-void/60 px-2 py-1 rounded">
            Specialization · {courses} Courses
          </span>
        </div>

        {/* Wax seal */}
        <div className="absolute top-4 right-4">
          <div className="relative">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                'bg-gradient-radial from-ha-red to-ha-red-deep',
                'border-2 border-gold-2 shadow-lg',
              )}
            >
              <span className="font-serif text-lg font-bold italic text-gold-1">H</span>
            </div>
            {certificate && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-mono text-[6px] text-gold-2/80 uppercase bg-void px-1 rounded">
                Certificate
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Kick + Title */}
        <div className="sec-kick mb-1">{era}</div>
        <h2 className="font-display text-xl font-bold uppercase text-off-white leading-tight mb-1">
          {title.split(' ').slice(0, -1).join(' ')}<br />
          <span className="font-serif italic text-gold-2 normal-case">
            {title.split(' ').slice(-1)}
          </span>
        </h2>

        {subtitle && (
          <p className="font-serif text-[12px] italic text-text-2 mb-2">"{subtitle}"</p>
        )}

        <p className="font-body text-[12px] text-text-2 leading-relaxed mb-4">
          {description}
        </p>

        {/* Meta stats */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <MetaStat value={courses.toString()} label="Courses" />
          <MetaStat value={`${totalHours}h`} label="Total Hours" />
          <MetaStat value={xpReward.toLocaleString()} label="XP Reward" />
          <MetaStat value="◆" label="Certificate" highlight />
        </div>

        {/* Course progress dots */}
        <div className="flex gap-1.5 mb-4">
          {courseProgress.map((status, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-1.5 rounded-full',
                status === 'done' && 'bg-gold-2',
                status === 'part' && 'bg-gradient-to-r from-gold-2 to-off-white/20',
                status === 'locked' && 'bg-off-white/10'
              )}
              title={`Course ${i + 1}: ${status}`}
            />
          ))}
        </div>

        {/* CTAs */}
        <div className="flex gap-2">
          <button
            onClick={onContinue}
            className="flex-1 btn-ha-red flex items-center justify-center gap-2 py-3"
          >
            <Play size={14} fill="currentColor" />
            <span>Continue Path</span>
            <ChevronRight size={14} />
          </button>
          {onViewSyllabus && (
            <button
              onClick={onViewSyllabus}
              className="btn-ha-ghost px-4 py-3"
            >
              View Syllabus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaStat({
  value,
  label,
  highlight,
}: {
  value: string;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={cn('font-serif text-lg font-bold', highlight ? 'text-gold-2' : 'text-off-white')}>
        {value}
      </div>
      <div className="font-mono text-[7px] text-text-3 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export default SpecializationCard;

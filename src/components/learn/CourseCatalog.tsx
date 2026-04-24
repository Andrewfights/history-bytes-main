/**
 * CourseCatalog - Learn section main page
 * Design: Academic library with dark academia aesthetic
 * Sections: Header, Stats, Continue Learning, Specialization, Eras, Catalog, Faculty, Certificates
 */

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Course, CourseProgress } from '@/types';
import { useLiveCourses, useLiveFeaturedCourse } from '@/hooks/useLiveData';
import { getInstructorById, formatDuration } from '@/data/courseData';
import { useApp } from '@/context/AppContext';
import { Search, Play, ChevronRight, Star, Clock, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CourseCatalogProps {
  courseProgress: Map<string, CourseProgress>;
  onCourseClick: (courseId: string) => void;
}

// Era background gradients matching the design spec
const eraBackgrounds: Record<string, string> = {
  ww2: 'bg-gradient-to-br from-[#3a2818] to-[#0a0604]',
  egy: 'bg-gradient-to-br from-[#6a4820] to-[#2a1a08]',
  grc: 'bg-gradient-to-br from-[#3a3a3a] to-[#1a1a1a]',
  rom: 'bg-gradient-to-br from-[#4a2814] to-[#1a0804]',
  rev: 'bg-gradient-to-br from-[#4a2818] to-[#1a0804]',
  brz: 'bg-gradient-to-br from-[#3a2818] to-[#1a1008]',
  med: 'bg-gradient-to-br from-[#2a2a3a] to-[#0a0a14]',
  default: 'bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a]',
};

// Map course era to background key
function getEraKey(era?: string): string {
  if (!era) return 'default';
  const lower = era.toLowerCase();
  if (lower.includes('ww2') || lower.includes('world war')) return 'ww2';
  if (lower.includes('egypt') || lower.includes('pharaoh')) return 'egy';
  if (lower.includes('greek') || lower.includes('greece')) return 'grc';
  if (lower.includes('rome') || lower.includes('roman')) return 'rom';
  if (lower.includes('revolution') || lower.includes('1775')) return 'rev';
  if (lower.includes('bronze') || lower.includes('ancient')) return 'brz';
  if (lower.includes('medieval') || lower.includes('middle')) return 'med';
  return 'default';
}

// Era icons
const EraIcons = {
  all: () => (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <circle cx="12" cy="12" r="9" />
    </svg>
  ),
  ancient: () => (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 21h16M6 21V9l6-5 6 5v12M10 21v-5h4v5" />
    </svg>
  ),
  classical: () => (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M5 20h14M7 20V6M17 20V6M5 6h14M9 6V4h6v2" />
    </svg>
  ),
  medieval: () => (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M12 3L4 8v13h16V8zM9 21v-7h6v7" />
    </svg>
  ),
  modern: () => (
    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={1.8}>
      <path d="M4 17V9l16-3v11" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="18" cy="16" r="2" />
    </svg>
  ),
};

// Sample faculty data
const sampleFaculty = [
  { id: '1', name: 'Sgt. Mitchell', title: 'Sergeant · Retired', role: 'Pacific & ETO Combat Vet', era: 'WW2', courseCount: 4, rating: 4.9 },
  { id: '2', name: 'Prof. Aurelia', title: 'Professor · Classics', role: 'Classical Historian', era: 'Classical', courseCount: 6, rating: 4.8 },
  { id: '3', name: 'Dr. Khalid', title: 'Curator · Egyptology', role: 'Cairo Museum', era: 'Egypt', courseCount: 5, rating: 4.9 },
  { id: '4', name: 'Cpt. Hargrove', title: 'Living Historian', role: 'Revolutionary Reenactor', era: '1775', courseCount: 3, rating: 4.7 },
];

// Sample certificates
const sampleCertificates = [
  { id: '1', title: 'Introduction to Ancient Egypt', instructor: 'Dr. Khalid', date: 'March 12, 2026' },
  { id: '2', title: 'The Greek Polis', instructor: 'Prof. Aurelia', date: 'February 28, 2026' },
  { id: '3', title: 'Foundations of WW2', instructor: 'Sgt. Mitchell', date: 'January 18, 2026' },
];

// Sample specialization
const sampleSpecialization = {
  id: 'ancient-world',
  title: 'Cradles of Civilization',
  subtitle: '"In the beginning, there were cities."',
  description: 'Four courses tracing the first civilizations from Mesopotamia to the Bronze Age collapse.',
  era: 'The Ancient World',
  courses: 4,
  totalHours: 22,
  xpReward: 1240,
  courseProgress: ['done', 'part', 'locked', 'locked'] as const,
};

// Era filter options
const eraFilters = [
  { id: 'all', name: 'All', count: 48, Icon: EraIcons.all },
  { id: 'ancient', name: 'Ancient', count: 12, Icon: EraIcons.ancient },
  { id: 'classical', name: 'Classical', count: 8, Icon: EraIcons.classical },
  { id: 'medieval', name: 'Medieval', count: 6, Icon: EraIcons.medieval },
  { id: 'modern', name: 'Modern', count: 10, Icon: EraIcons.modern },
];

export function CourseCatalog({ courseProgress, onCourseClick }: CourseCatalogProps) {
  const { data: allCourses } = useLiveCourses();
  const { data: featuredCourse } = useLiveFeaturedCourse();
  const [selectedEra, setSelectedEra] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Get courses with progress for "Continue Learning"
  const inProgressCourses = useMemo(() => {
    return allCourses.filter(course => {
      const progress = courseProgress.get(course.id);
      return progress && progress.percentComplete > 0 && progress.percentComplete < 100;
    });
  }, [courseProgress, allCourses]);

  // Get completed courses count
  const completedCount = useMemo(() => {
    return allCourses.filter(course => {
      const progress = courseProgress.get(course.id);
      return progress && progress.percentComplete === 100;
    }).length;
  }, [courseProgress, allCourses]);

  // Sort and filter courses
  const sortedCourses = useMemo(() => {
    let filtered = [...allCourses];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query)
      );
    }

    // Sort by featured first, then chronoOrder
    return filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (a.chronoOrder || 0) - (b.chronoOrder || 0);
    });
  }, [allCourses, searchQuery]);

  return (
    <div className="pb-28">
      {/* ═══════════ SEARCH ═══════════ */}
      <div className="px-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[13px] h-[13px] text-text-3" />
          <input
            type="text"
            placeholder="Search courses, eras, instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-ink-lift border border-border-gold rounded-lg py-2.5 pl-9 pr-4 font-body text-[12.5px] text-off-white placeholder:text-text-3 outline-none focus:border-gold-2/30 transition-colors"
          />
        </div>
      </div>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <div className="px-4 mb-5">
        <div className="flex gap-1.5">
          <StatsCard value={allCourses.length} label="Courses" highlight />
          <StatsCard value={12} label="Paths" />
          <StatsCard value={inProgressCourses.length} label="Enrolled" />
          <StatsCard value={completedCount} label="Certs" />
        </div>
      </div>

      {/* ═══════════ CONTINUE LEARNING ═══════════ */}
      {inProgressCourses.length > 0 && (
        <div className="mb-5">
          <SectionHeader
            kick="Resume"
            title="Continue Learning"
            action={`All ${inProgressCourses.length} →`}
          />
          <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
            {inProgressCourses.map((course) => {
              const progress = courseProgress.get(course.id);
              return (
                <ContinueLearningCard
                  key={course.id}
                  course={course}
                  progress={progress!}
                  onClick={() => onCourseClick(course.id)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════ FEATURED SPECIALIZATION ═══════════ */}
      <div className="mb-5">
        <SectionHeader
          kick="Specialization"
          title="Learning Path"
          action="All 12 →"
        />
        <div className="px-4">
          <SpecializationHero specialization={sampleSpecialization} />
        </div>
      </div>

      {/* ═══════════ BROWSE BY ERA ═══════════ */}
      <div className="mb-5">
        <SectionHeader kick="Navigate" title="Browse by Era" />
        <div className="flex gap-2 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {eraFilters.map((era) => (
            <button
              key={era.id}
              onClick={() => setSelectedEra(era.id)}
              className={cn(
                'flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full border transition-all',
                selectedEra === era.id
                  ? 'bg-gold-2 text-void border-gold-2'
                  : 'bg-ink-lift border-border-gold hover:border-gold-2/30'
              )}
            >
              <span className={selectedEra === era.id ? 'text-void' : 'text-gold-2'}>
                <era.Icon />
              </span>
              <span className={cn(
                'font-mono text-[9.5px] font-bold tracking-[0.2em] uppercase',
                selectedEra === era.id ? 'text-void' : 'text-text-2'
              )}>
                {era.name}
              </span>
              <span className={cn(
                'font-mono text-[8px] font-semibold',
                selectedEra === era.id ? 'text-void/55' : 'text-text-3'
              )}>
                {era.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════ COURSE CATALOG ═══════════ */}
      <div className="mb-5">
        <SectionHeader
          kick="The Stacks"
          title="Course Catalog"
          action={`All ${allCourses.length} →`}
        />
        <div className="px-4 flex flex-col gap-3">
          {sortedCourses.slice(0, 5).map((course) => {
            const progress = courseProgress.get(course.id);
            return (
              <CourseCard
                key={course.id}
                course={course}
                progress={progress}
                onClick={() => onCourseClick(course.id)}
              />
            );
          })}
        </div>
      </div>

      {/* ═══════════ FACULTY ═══════════ */}
      <div className="mb-5">
        <SectionHeader
          kick="Faculty"
          title="Your Instructors"
          action="All 12 →"
        />
        <div className="flex gap-2.5 overflow-x-auto px-4 pb-2 hide-scrollbar">
          {sampleFaculty.map((instructor) => (
            <FacultyCard key={instructor.id} instructor={instructor} />
          ))}
        </div>
      </div>

      {/* ═══════════ CERTIFICATES ═══════════ */}
      {completedCount > 0 && (
        <div className="mb-5">
          <SectionHeader
            kick="Your Diplomas"
            title="Earned Certificates"
            action="Share →"
          />
          <div className="px-4 flex flex-col gap-2.5">
            {sampleCertificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allCourses.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className="text-text-3 font-body text-sm">No courses available yet.</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════

function StatsCard({ value, label, highlight }: { value: number; label: string; highlight?: boolean }) {
  return (
    <div className="flex-1 px-2 py-2.5 bg-ink-lift border border-border-gold rounded-lg text-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3.5 h-[1px] bg-gold-2" />
      <div className={cn(
        'font-display text-base font-bold leading-none mt-0.5',
        highlight ? 'text-gold-2' : 'text-off-white'
      )}>
        {value}
      </div>
      <div className="font-mono text-[7.5px] tracking-[0.18em] text-text-3 uppercase font-semibold mt-1">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({ kick, title, action }: { kick: string; title: string; action?: string }) {
  return (
    <div className="px-4 pb-2.5 flex justify-between items-end">
      <div>
        <div className="font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold mb-0.5">
          {kick}
        </div>
        <div className="font-display text-lg font-bold text-off-white uppercase tracking-tight leading-none">
          {title}
        </div>
      </div>
      {action && (
        <button className="font-mono text-[9px] tracking-[0.18em] text-gold-2 uppercase font-semibold flex items-center gap-1">
          {action}
        </button>
      )}
    </div>
  );
}

function ContinueLearningCard({
  course,
  progress,
  onClick
}: {
  course: Course;
  progress: CourseProgress;
  onClick: () => void;
}) {
  const eraKey = getEraKey(course.era);

  return (
    <motion.button
      onClick={onClick}
      className="flex-shrink-0 w-[230px] bg-ink-lift border border-border-gold rounded-[10px] overflow-hidden text-left"
      whileTap={{ scale: 0.98 }}
    >
      {/* Media */}
      <div className={cn(
        'h-[100px] relative overflow-hidden',
        eraBackgrounds[eraKey]
      )}>
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

        {/* Percentage badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-gold-2 px-2 py-0.5 font-mono text-[8px] font-bold tracking-wide border border-border-gold rounded-sm z-10">
          {progress.percentComplete}%
        </div>

        {/* Era mini label */}
        <div className="absolute bottom-2 left-2 font-mono text-[7.5px] tracking-[0.25em] text-gold-2 uppercase font-bold z-10">
          {course.era || 'History'}
        </div>
      </div>

      {/* Body */}
      <div className="p-2.5 pb-3">
        <h3 className="font-serif text-sm font-bold italic text-off-white leading-tight line-clamp-2 min-h-[32px] mb-1">
          {course.title}
        </h3>
        <div className="flex items-center gap-1.5 text-text-2 text-[10.5px] mb-1.5">
          <Play size={9} className="text-gold-2" fill="currentColor" />
          <span className="truncate">Next: Lesson {(progress.lessonsCompleted || 0) + 1}</span>
        </div>
        <div className="h-[2px] bg-off-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gold-2 rounded-full transition-all"
            style={{ width: `${progress.percentComplete}%` }}
          />
        </div>
      </div>
    </motion.button>
  );
}

function SpecializationHero({ specialization }: { specialization: typeof sampleSpecialization }) {
  return (
    <div className="bg-ink-lift border border-border-gold rounded-xl overflow-hidden relative">
      {/* Media background */}
      <div className="h-[170px] relative overflow-hidden bg-gradient-to-br from-[#3a2818] to-[#0a0604]">
        {/* Radial glows */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 20% 30%, rgba(230,171,42,0.28), transparent 55%), radial-gradient(ellipse at 70% 70%, rgba(178,100,31,0.2), transparent 50%)'
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/95" />

        {/* Tag */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 border border-gold-2/30 rounded-sm z-10">
          <span className="text-gold-2 text-[7px]">◆</span>
          <span className="font-mono text-[8.5px] tracking-[0.3em] text-gold-2 uppercase font-bold">
            Specialization · {specialization.courses} Courses
          </span>
        </div>

        {/* Wax seal */}
        <div className="absolute bottom-3 right-3 w-[50px] h-[50px] z-10">
          <div className="absolute inset-0 rounded-full bg-gradient-radial from-ha-red to-ha-red-deep border-2 border-gold-2 shadow-lg" style={{
            boxShadow: '0 3px 10px rgba(0,0,0,0.5), inset 0 0 10px rgba(0,0,0,0.4)'
          }} />
          <div className="absolute inset-1 rounded-full border border-dashed border-gold-2/50 flex items-center justify-center">
            <span className="font-serif text-base font-bold italic text-gold-1 drop-shadow">H</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pt-4 relative z-10">
        <div className="font-mono text-[9px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-1">
          {specialization.era}
        </div>
        <h2 className="font-display text-[28px] font-bold text-off-white leading-[0.95] tracking-tight uppercase mb-1">
          {specialization.title.split(' ').slice(0, -1).join(' ')}<br />
          <span className="text-gold-2">{specialization.title.split(' ').slice(-1)}</span>
        </h2>
        <p className="font-serif text-sm italic text-gold-2 mb-2.5">{specialization.subtitle}</p>
        <p className="font-body text-xs text-text-2 leading-relaxed mb-3">{specialization.description}</p>

        {/* Meta */}
        <div className="flex gap-3.5 py-2.5 border-t border-b border-off-white/8 mb-3">
          <MetaStat value={specialization.courses.toString()} label="Courses" />
          <MetaStat value={`${specialization.totalHours}h`} label="Total" />
          <MetaStat value={specialization.xpReward.toLocaleString()} label="XP" />
          <MetaStat value="◆" label="Cert" highlight />
        </div>

        {/* Course progress */}
        <div className="flex gap-1 mb-3.5">
          {specialization.courseProgress.map((status, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 h-[3px] rounded-full',
                status === 'done' && 'bg-gold-2',
                status === 'part' && 'bg-gradient-to-r from-gold-2 to-off-white/10',
                status === 'locked' && 'bg-off-white/10'
              )}
            />
          ))}
        </div>

        {/* CTA */}
        <button className="w-full btn-ha-red flex items-center justify-center gap-2 py-3 relative">
          <span>Continue Path</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

function MetaStat({ value, label, highlight }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className="flex flex-col">
      <div className={cn(
        'font-display text-sm font-bold leading-none',
        highlight ? 'text-gold-2' : 'text-gold-2'
      )}>
        {value}
      </div>
      <div className="font-mono text-[7px] tracking-[0.2em] text-text-3 uppercase font-semibold mt-0.5">
        {label}
      </div>
    </div>
  );
}

function CourseCard({
  course,
  progress,
  onClick
}: {
  course: Course;
  progress?: CourseProgress;
  onClick: () => void;
}) {
  const eraKey = getEraKey(course.era);
  const instructor = getInstructorById(course.instructorId);
  const hasProgress = progress && progress.percentComplete > 0;

  // Difficulty badge styles
  const difficultyStyles = {
    beginner: 'bg-success/15 text-success border-success/30',
    intermediate: 'bg-gold-2/15 text-gold-2 border-gold-2/30',
    advanced: 'bg-ha-red/15 text-ha-red border-ha-red/30',
  };

  return (
    <motion.button
      onClick={onClick}
      className="w-full bg-ink-lift border border-border-gold rounded-[10px] overflow-hidden flex text-left"
      whileTap={{ scale: 0.98 }}
    >
      {/* Media */}
      <div className={cn(
        'w-[106px] flex-shrink-0 relative overflow-hidden',
        eraBackgrounds[eraKey]
      )}>
        {/* Glow */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(230,171,42,0.15), transparent 60%)'
        }} />

        {/* Era tag */}
        <div className="absolute top-1.5 left-1.5 font-mono text-[7px] tracking-[0.25em] text-gold-2 uppercase font-bold bg-black/70 px-1.5 py-0.5 rounded-sm z-10">
          {course.era || 'History'}
        </div>

        {/* Difficulty badge */}
        <div className={cn(
          'absolute bottom-1.5 left-1.5 px-1.5 py-0.5 font-mono text-[7px] tracking-[0.18em] uppercase font-bold rounded-full border z-10',
          difficultyStyles[course.difficulty as keyof typeof difficultyStyles] || difficultyStyles.beginner
        )}>
          {course.difficulty === 'beginner' ? 'Beg.' : course.difficulty === 'intermediate' ? 'Int.' : 'Adv.'}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-2.5 flex flex-col gap-0.5 min-w-0 relative">
        {/* Red accent */}
        <div className="absolute top-0 left-3 w-[18px] h-[1.5px] bg-ha-red" />

        <h3 className="font-serif text-sm font-bold italic text-off-white leading-tight line-clamp-1 mt-2">
          {course.title}
        </h3>

        {instructor && (
          <p className="font-body text-[10px] text-gold-2 italic">
            {instructor.name}
          </p>
        )}

        <div className="flex justify-between items-center font-mono text-[8.5px] text-text-3 tracking-wide mt-auto">
          <span>{formatDuration(course.totalDurationMinutes)} · {course.lessonsCount} lessons</span>
          <span className="flex items-center gap-0.5 text-gold-2">
            <Star size={8} fill="currentColor" />
            {course.rating}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function FacultyCard({ instructor }: { instructor: typeof sampleFaculty[0] }) {
  return (
    <div className="flex-shrink-0 w-[150px] bg-ink-lift border border-border-gold rounded-[10px] overflow-hidden">
      {/* Portrait */}
      <div className="h-[130px] relative overflow-hidden bg-gradient-to-b from-[#3a2818] to-[#0a0604]">
        {/* Spotlight */}
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(230,171,42,0.2), transparent 60%)'
        }} />

        {/* Era tag */}
        <div className="absolute top-2 left-2 bg-black/70 text-gold-2 px-1.5 py-0.5 font-mono text-[7.5px] tracking-[0.2em] uppercase font-bold rounded-sm z-10">
          {instructor.era}
        </div>

        {/* Silhouette placeholder */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 w-[55%] h-[85%] rounded-[45%_45%_10%_10%]" style={{
          background: 'radial-gradient(ellipse at 50% 25%, rgba(120,80,40,0.55), rgba(40,30,20,0.9))'
        }}>
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[42%] h-[32%] rounded-full" style={{
            background: 'radial-gradient(circle, rgba(200,160,120,0.55), rgba(120,90,60,0.25))'
          }} />
        </div>
      </div>

      {/* Info */}
      <div className="p-2.5 pt-2 relative">
        {/* Red accent */}
        <div className="absolute top-0 left-0 w-[22px] h-[1.5px] bg-ha-red" />

        <h3 className="font-serif text-[13px] font-bold italic text-off-white leading-none mt-2 mb-0.5">
          {instructor.name}
        </h3>
        <p className="font-body text-[10px] text-gold-2 italic leading-tight mb-1.5">
          {instructor.role}
        </p>
        <div className="font-mono text-[8px] text-text-3 tracking-wide">
          <span className="text-gold-2 font-display text-[11px] font-bold mr-0.5">{instructor.courseCount}</span>
          Courses ·
          <span className="text-gold-2 font-display text-[11px] font-bold ml-0.5 mr-0.5">{instructor.rating}★</span>
        </div>
      </div>
    </div>
  );
}

function CertificateCard({ certificate }: { certificate: typeof sampleCertificates[0] }) {
  return (
    <div className="bg-ink-lift border border-gold-2/30 rounded-[10px] p-3.5 flex gap-3 items-center relative overflow-hidden">
      {/* Corner flourishes */}
      <div className="absolute top-1.5 left-1.5 w-[9px] h-[9px] border-l-[1.5px] border-t-[1.5px] border-gold-2 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-[9px] h-[9px] border-r-[1.5px] border-b-[1.5px] border-gold-2 pointer-events-none" />

      {/* Wax seal */}
      <div className="w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center bg-gradient-radial from-ha-red to-ha-red-deep border-2 border-gold-2" style={{
        boxShadow: '0 3px 8px rgba(0,0,0,0.4), inset 0 0 8px rgba(0,0,0,0.3)'
      }}>
        <Award size={18} className="text-gold-1" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-mono text-[7.5px] tracking-[0.3em] text-gold-2 uppercase font-bold mb-0.5">
          Academy Certificate
        </div>
        <h3 className="font-serif text-[13px] font-bold italic text-off-white leading-tight line-clamp-1 mb-0.5">
          {certificate.title}
        </h3>
        <div className="font-mono text-[9px] text-text-3 tracking-wide font-semibold">
          {certificate.instructor} · {certificate.date}
        </div>
      </div>
    </div>
  );
}

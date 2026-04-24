/**
 * DossierJourneyMap - Mission briefing style lesson journey
 * Intelligence file aesthetic with declassified/classified states
 * Option B design system with brass fasteners and dossier cards
 */

import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { DossierCard, DossierState } from './DossierCard';
import { PearlHarborLesson } from '@/data/pearlHarborLessons';

interface DossierJourneyMapProps {
  moduleTitle: string;
  moduleSubtitle?: string;
  fileCode?: string; // e.g., "PH-1941"
  lessons: PearlHarborLesson[];
  completedLessons: Set<string>;
  currentLessonId?: string;
  totalXp: number;
  maxXp: number;
  onLessonClick: (lessonId: string) => void;
  onBack: () => void;
}

export function DossierJourneyMap({
  moduleTitle,
  moduleSubtitle = 'Pearl Harbor',
  fileCode = 'PH-1941',
  lessons,
  completedLessons,
  currentLessonId,
  totalXp,
  maxXp,
  onLessonClick,
  onBack,
}: DossierJourneyMapProps) {
  const completedCount = completedLessons.size;
  const totalCount = lessons.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Calculate estimated time
  const completedMinutes = lessons
    .filter(l => completedLessons.has(l.id))
    .reduce((sum, l) => sum + parseInt(l.duration || '0'), 0);
  const remainingMinutes = lessons
    .filter(l => !completedLessons.has(l.id))
    .reduce((sum, l) => sum + parseInt(l.duration || '0'), 0);

  // Determine lesson states with 4 states: done, cur, upcoming, lock
  const getLessonState = (lessonId: string, index: number): DossierState => {
    if (completedLessons.has(lessonId)) return 'done';
    if (lessonId === currentLessonId) return 'cur';

    // Find the first incomplete lesson
    const firstIncompleteIndex = lessons.findIndex(l => !completedLessons.has(l.id));

    // If this is the first incomplete, it's current
    if (!currentLessonId && index === firstIncompleteIndex) return 'cur';

    // If this is the next one after current, it's upcoming
    if (index === firstIncompleteIndex + 1) return 'upcoming';

    // Check if all previous lessons are complete
    const previousLessons = lessons.slice(0, index);
    const allPreviousComplete = previousLessons.every(l => completedLessons.has(l.id));

    // If all previous complete and this is not current, it's upcoming
    if (allPreviousComplete) return 'upcoming';

    // Otherwise locked
    return 'lock';
  };

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Classification header strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-black/40 border-b border-ha-red/30 border-t border-ha-red/30">
        <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">
          <span className="w-[7px] h-[7px] rounded-full bg-ha-red shadow-[0_0_8px_var(--ha-red)] animate-pulse" />
          Briefing · Active
        </div>
        <div className="font-mono text-[9px] tracking-[0.28em] text-off-white/50 uppercase font-semibold">
          File · <span className="text-gold-2">{fileCode}</span>
        </div>
      </div>

      {/* Intel header */}
      <div className="relative px-4 py-4 text-center bg-gradient-to-b from-[#131009] to-[#0a0805]">
        <button
          onClick={onBack}
          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-off-white/50 hover:text-gold-2 transition-colors font-mono text-[10px] tracking-[0.28em] uppercase font-semibold"
        >
          <ArrowLeft size={14} strokeWidth={2.2} />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="font-mono text-[8.5px] tracking-[0.36em] text-off-white/50 uppercase font-semibold mb-1.5">
          Chapter · World Wars
        </div>
        <h1 className="font-playfair italic font-bold text-[24px] sm:text-[28px] text-off-white leading-none tracking-[-0.015em] mb-1">
          {moduleTitle.split(' ')[0]} <span className="text-gold-2">{moduleTitle.split(' ').slice(1).join(' ') || 'Harbor'}</span>
        </h1>
        <p className="font-dm-serif italic text-[13px] text-gold-2">
          December 7, 1941
        </p>
      </div>

      {/* Progress bar section */}
      <div className="px-4 py-3 bg-black/30 border-t border-off-white/[0.06] border-b border-off-white/[0.06]">
        {/* Labels */}
        <div className="flex justify-between font-mono text-[8.5px] text-off-white/50 tracking-[0.18em] uppercase font-bold mb-2">
          <span>Declassified</span>
          <span className="text-gold-2 font-bold">{completedCount}/{totalCount}</span>
        </div>

        {/* Progress bar */}
        <div className="h-[4px] bg-gold-2/15 rounded-sm overflow-hidden mb-3">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-dp via-gold-2 to-gold-br rounded-sm"
            style={{ boxShadow: '0 0 8px rgba(230,171,42,0.4)' }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-black/35 rounded border border-off-white/[0.06]">
            <div className="font-dm-serif italic text-[18px] text-gold-br leading-none">{totalXp}</div>
            <div className="font-mono text-[7.5px] tracking-[0.25em] text-off-white/40 uppercase font-bold mt-1">XP Earned</div>
          </div>
          <div className="text-center p-2 bg-black/35 rounded border border-off-white/[0.06]">
            <div className="font-dm-serif italic text-[18px] text-gold-br leading-none">{completedMinutes}m</div>
            <div className="font-mono text-[7.5px] tracking-[0.25em] text-off-white/40 uppercase font-bold mt-1">Completed</div>
          </div>
          <div className="text-center p-2 bg-black/35 rounded border border-off-white/[0.06]">
            <div className="font-dm-serif italic text-[18px] text-gold-br leading-none">{remainingMinutes}m</div>
            <div className="font-mono text-[7.5px] tracking-[0.25em] text-off-white/40 uppercase font-bold mt-1">Remaining</div>
          </div>
        </div>
      </div>

      {/* Main feed header */}
      <div className="flex items-baseline justify-between px-4 py-3 border-b border-dashed border-off-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="w-[7px] h-[7px] rounded-full bg-ha-red shadow-[0_0_8px_var(--ha-red)] animate-pulse" />
          <span className="font-mono text-[9.5px] tracking-[0.4em] text-[#E84046] uppercase font-bold">
            Case File · {totalCount} Dossiers
          </span>
        </div>
        <span className="font-mono text-[9px] tracking-[0.28em] text-gold-2 uppercase font-bold">
          File {fileCode}
        </span>
      </div>

      {/* Dossier cards list */}
      <div
        className="flex-1 px-4 py-4 overflow-y-auto relative"
        style={{
          background: 'linear-gradient(180deg, #0f0a05 0%, #0a0805 100%)'
        }}
      >
        {/* Grid background pattern */}
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent 0, transparent 29px, rgba(230,171,42,0.025) 29px, rgba(230,171,42,0.025) 30px),
              repeating-linear-gradient(0deg, transparent 0, transparent 29px, rgba(230,171,42,0.025) 29px, rgba(230,171,42,0.025) 30px)
            `
          }}
        />

        {/* Red dashed thread connecting cards */}
        <div
          className="absolute left-[50px] sm:left-[60px] top-4 bottom-4 w-0.5 z-0 pointer-events-none opacity-50"
          style={{
            background: 'repeating-linear-gradient(180deg, var(--ha-red) 0, var(--ha-red) 4px, transparent 4px, transparent 8px)'
          }}
        />

        {/* Lesson cards */}
        <div className="relative z-10 space-y-3.5">
          {lessons.map((lesson, index) => {
            const state = getLessonState(lesson.id, index);
            return (
              <DossierCard
                key={lesson.id}
                lesson={lesson}
                state={state}
                index={index}
                onClick={() => onLessonClick(lesson.id)}
              />
            );
          })}
        </div>

        {/* XP total at bottom */}
        <div className="relative z-10 mt-6 pt-4 border-t border-off-white/10 text-center">
          <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/40 uppercase mb-1">
            Total Intelligence
          </div>
          <div className="font-dm-serif italic text-lg font-bold text-gold-2">
            {totalXp} <span className="text-off-white/40 text-sm">/ {maxXp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

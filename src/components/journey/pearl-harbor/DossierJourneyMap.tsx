/**
 * DossierJourneyMap - Mission briefing style lesson journey
 * Intelligence file aesthetic with declassified/classified states
 * Replaces Duolingo-style zigzag path
 */

import { ArrowLeft, Crown } from 'lucide-react';
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

  // Determine lesson states
  const getLessonState = (lessonId: string, index: number): DossierState => {
    if (completedLessons.has(lessonId)) return 'done';
    if (lessonId === currentLessonId) return 'cur';

    // Find the first incomplete lesson - that's the current one if not explicitly set
    if (!currentLessonId) {
      const firstIncompletIndex = lessons.findIndex(l => !completedLessons.has(l.id));
      if (index === firstIncompletIndex) return 'cur';
    }

    // If any previous lesson is incomplete, this one is locked
    const previousLessons = lessons.slice(0, index);
    const allPreviousComplete = previousLessons.every(l => completedLessons.has(l.id));
    if (!allPreviousComplete) return 'lock';

    // If current lesson is not set and this is the first incomplete, it's current
    // Otherwise it's locked
    return 'lock';
  };

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Header */}
      <header className="relative bg-ink border-b border-off-white/[0.06] px-4 py-3 text-center">
        <button
          onClick={onBack}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-1 text-off-white/60 hover:text-off-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="font-mono text-[9px] tracking-[0.25em] text-off-white/50 uppercase font-semibold mb-1">
          {moduleSubtitle}
        </div>
        <h1 className="font-serif text-[22px] font-bold text-off-white italic">
          {moduleTitle}
        </h1>
        <div className="flex items-center justify-center gap-1.5 mt-1.5 font-mono text-[9px] text-off-white/50 tracking-[0.15em] uppercase">
          <Crown size={10} className="text-gold-2" />
          <span>{completedCount} of {totalCount} briefed</span>
        </div>
      </header>

      {/* Briefing status strip */}
      <div className="flex justify-between items-center px-4 py-1.5 bg-black/30 border-y border-off-white/[0.06]">
        <div className="flex items-center gap-1.5 font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold">
          {/* Blinking dot */}
          <span className="w-1.5 h-1.5 rounded-full bg-ha-red shadow-[0_0_8px_var(--ha-red)] animate-pulse" />
          Briefing · Active
        </div>
        <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold">
          File · {fileCode}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-ink">
        <div className="flex justify-between font-mono text-[8.5px] text-off-white/50 mb-1.5 tracking-[0.15em] uppercase">
          <span>Declassified</span>
          <span>{completedCount} / {totalCount}</span>
        </div>
        <div className="h-[3px] bg-off-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gold-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Dossier cards list */}
      <div
        className="flex-1 px-4 py-4 overflow-y-auto relative"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(230,171,42,0.04) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 80%, rgba(205,14,20,0.04) 0%, transparent 40%)
          `
        }}
      >
        {/* Grid background pattern */}
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent 0, transparent 29px, rgba(230,171,42,0.03) 29px, rgba(230,171,42,0.03) 30px),
              repeating-linear-gradient(0deg, transparent 0, transparent 29px, rgba(230,171,42,0.03) 29px, rgba(230,171,42,0.03) 30px)
            `
          }}
        />

        {/* Red dashed thread connecting cards */}
        <div className="dossier-thread absolute left-[56px] top-0 bottom-0 w-0.5 z-0 pointer-events-none" />

        {/* Lesson cards */}
        <div className="relative z-10 space-y-3">
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
        <div className="mt-6 pt-4 border-t border-off-white/10 text-center">
          <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/40 uppercase mb-1">
            Total Intelligence
          </div>
          <div className="font-serif text-lg font-bold text-gold-2">
            {totalXp} <span className="text-off-white/40 text-sm">/ {maxXp} XP</span>
          </div>
        </div>
      </div>
    </div>
  );
}

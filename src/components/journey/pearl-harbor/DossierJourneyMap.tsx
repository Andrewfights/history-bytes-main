/**
 * DossierJourneyMap - Mission briefing style lesson journey
 * Intelligence file aesthetic with declassified/classified states
 * Option B design system with brass fasteners, desktop sidebar, and dossier cards
 */

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { DossierCard, DossierState } from './DossierCard';
import { PearlHarborLesson } from '@/data/pearlHarborLessons';
import { subscribeToJourneyUIAssets, type FirestoreJourneyUIAssets } from '@/lib/firestore';

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
  // Subscribe to journey UI assets for custom lesson card images
  const [journeyAssets, setJourneyAssets] = useState<FirestoreJourneyUIAssets | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToJourneyUIAssets(setJourneyAssets);
    return () => unsubscribe();
  }, []);

  const completedCount = completedLessons.size;
  const totalCount = lessons.length;
  const progressPercent = (completedCount / totalCount) * 100;

  // Calculate estimated time
  const completedMinutes = lessons
    .filter((l) => completedLessons.has(l.id))
    .reduce((sum, l) => sum + parseInt(l.duration || '0'), 0);
  const remainingMinutes = lessons
    .filter((l) => !completedLessons.has(l.id))
    .reduce((sum, l) => sum + parseInt(l.duration || '0'), 0);

  // Total runtime
  const totalMinutes = lessons.reduce((sum, l) => sum + parseInt(l.duration || '0'), 0);

  // Determine lesson states with 4 states: done, cur, upcoming, lock
  const getLessonState = (lessonId: string, index: number): DossierState => {
    if (completedLessons.has(lessonId)) return 'done';
    if (lessonId === currentLessonId) return 'cur';

    // Find the first incomplete lesson
    const firstIncompleteIndex = lessons.findIndex((l) => !completedLessons.has(l.id));

    // If this is the first incomplete, it's current
    if (!currentLessonId && index === firstIncompleteIndex) return 'cur';

    // If this is the next one after current, it's upcoming
    if (index === firstIncompleteIndex + 1) return 'upcoming';

    // Check if all previous lessons are complete
    const previousLessons = lessons.slice(0, index);
    const allPreviousComplete = previousLessons.every((l) => completedLessons.has(l.id));

    // If all previous complete and this is not current, it's upcoming
    if (allPreviousComplete) return 'upcoming';

    // Otherwise locked
    return 'lock';
  };

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Classification header strip */}
      <div className="brf-header-top">
        <div className="brf-classif">
          <span className="brf-classif-dot" />
          Briefing · Active
        </div>
        <div className="brf-file">
          File · <em>{fileCode}</em> · Rev. 07
        </div>
      </div>

      {/* Desktop: 2-column layout | Mobile: Single column */}
      <div className="brf-desktop-layout lg:grid flex flex-col flex-1">
        {/* LEFT SIDEBAR (Desktop) / HEADER SECTION (Mobile) */}
        <aside className="brf-side">
          <button onClick={onBack} className="brf-side-back">
            <ArrowLeft size={12} strokeWidth={2.2} />
            All Campaigns
          </button>

          <div className="brf-side-chapter">Chapter 07 · World Wars</div>

          <h1 className="brf-side-title">
            {moduleTitle.split(' ')[0]}{' '}
            <em>{moduleTitle.split(' ').slice(1).join(' ') || 'Harbor'}</em>
          </h1>

          <p className="brf-side-subtitle">
            December 7, 1941 · The day that changed the course of history.{' '}
            {totalCount} lessons, declassified one by one.
          </p>

          {/* File card (metadata strip) */}
          <div className="brf-file-card">
            <div className="brf-file-rows">
              <div className="brf-file-row">
                <div className="brf-file-row-k">Operation</div>
                <div className="brf-file-row-v">{moduleSubtitle}</div>
              </div>
              <div className="brf-file-row">
                <div className="brf-file-row-k">Theater</div>
                <div className="brf-file-row-v">Pacific</div>
              </div>
              <div className="brf-file-row">
                <div className="brf-file-row-k">Era</div>
                <div className="brf-file-row-v">World Wars</div>
              </div>
              <div className="brf-file-row">
                <div className="brf-file-row-k">Date</div>
                <div className="brf-file-row-v">
                  <em>7.Dec.1941</em>
                </div>
              </div>
              <div className="brf-file-row">
                <div className="brf-file-row-k">Total Runtime</div>
                <div className="brf-file-row-v">
                  <em>{totalMinutes}</em> min
                </div>
              </div>
              <div className="brf-file-row">
                <div className="brf-file-row-k">Classification</div>
                <div className="brf-file-row-v">Active</div>
              </div>
            </div>
          </div>

          {/* Progress card */}
          <div className="brf-progress-card">
            <div className="brf-prog-head">
              <div className="brf-prog-head-lbl">Declassified</div>
              <div className="brf-prog-head-val">
                <em>{completedCount}</em>/{totalCount}
              </div>
            </div>
            <div className="brf-prog-bar-lg">
              <motion.div
                className="brf-prog-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="brf-prog-stats">
              <div className="brf-prog-stat">
                <div className="brf-prog-stat-v">{totalXp}</div>
                <div className="brf-prog-stat-l">XP Earned</div>
              </div>
              <div className="brf-prog-stat">
                <div className="brf-prog-stat-v">{completedMinutes}m</div>
                <div className="brf-prog-stat-l">Completed</div>
              </div>
              <div className="brf-prog-stat">
                <div className="brf-prog-stat-v">{remainingMinutes}m</div>
                <div className="brf-prog-stat-l">Remaining</div>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN: Dossier feed */}
        <main className="brf-main flex-1">
          {/* Main header */}
          <div className="brf-main-header">
            <div className="brf-main-kick">
              <span className="brf-main-kick-dot" />
              Case File · {totalCount} Dossiers
            </div>
            <div className="brf-main-file">
              Internal Use Only · <em>File {fileCode}</em>
            </div>
          </div>

          {/* Red thread */}
          <div className="brf-thread" />

          {/* Dossier cards list */}
          <div className="brf-dossier-list">
            {lessons.map((lesson, index) => {
              const state = getLessonState(lesson.id, index);
              const cardImageUrl = journeyAssets?.lessonCardImages?.[lesson.id];
              return (
                <DossierCard
                  key={lesson.id}
                  lesson={lesson}
                  state={state}
                  index={index}
                  onClick={() => onLessonClick(lesson.id)}
                  showRightColumn={true}
                  cardImageUrl={cardImageUrl}
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
        </main>
      </div>
    </div>
  );
}

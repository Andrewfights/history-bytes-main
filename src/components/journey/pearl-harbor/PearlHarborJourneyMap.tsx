/**
 * PearlHarborJourneyMap - Mission Briefing / Dossier style lesson path
 * Design: History Academy Dark v2 - Option B (Intelligence File Aesthetic)
 * Shows lessons as dossier cards connected by classified thread
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Crown, Lock, Check, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { WW2Host } from '@/types';
import { PEARL_HARBOR_LESSONS, TOTAL_XP, PearlHarborLesson } from '@/data/pearlHarborLessons';
import { usePearlHarborProgress } from './hooks/usePearlHarborProgress';
import { MusicControl } from '@/components/shared/MusicControl';
import { subscribeToWW2ModuleAssets, type FirestoreWW2ModuleAssets } from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';

interface PearlHarborJourneyMapProps {
  host: WW2Host;
  onSelectLesson: (lessonId: string) => void;
  onOpenWorldMap: () => void;
  onBack: () => void;
}

type LessonState = 'completed' | 'unlocked' | 'current' | 'locked';

// Historical timestamps for each lesson (Dec 7, 1941)
const LESSON_TIMESTAMPS: Record<string, string> = {
  'radar-blip': '07:02',
  'dismissal': '07:39',
  'first-wave': '07:55',
  'voices-harbor': '08:10',
  'second-wave': '09:00',
  'america-learns': '14:26',
  'damage-done': '10:30',
  'letters-home': '18:00',
  'mastery-run': '23:59',
};

// Locations for each lesson
const LESSON_LOCATIONS: Record<string, string> = {
  'radar-blip': 'Opana Point',
  'dismissal': 'Fort Shafter',
  'first-wave': 'Battleship Row',
  'voices-harbor': 'Survivor Testimonies',
  'second-wave': 'Ford Island',
  'america-learns': 'Coast-to-Coast',
  'damage-done': 'Harbor Assessment',
  'letters-home': 'Personnel Records',
  'mastery-run': 'Final Briefing',
};

export function PearlHarborJourneyMap({
  host,
  onSelectLesson,
  onOpenWorldMap,
  onBack,
}: PearlHarborJourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { progress, totalXP, isLessonUnlocked, isActivityCompleted } = usePearlHarborProgress();
  const [moduleAssets, setModuleAssets] = useState<FirestoreWW2ModuleAssets | null>(null);

  // Subscribe to module assets for archived beats and custom order
  useEffect(() => {
    if (!isFirebaseConfigured()) return;

    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      setModuleAssets(assets);
    });

    return () => unsubscribe();
  }, []);

  // Get ordered and active (non-archived) lessons
  const activeLessons = useMemo(() => {
    const archivedBeatIds = Object.keys(moduleAssets?.archivedBeats || {});
    const customOrder = moduleAssets?.beatOrder;

    const nonArchivedLessons = PEARL_HARBOR_LESSONS.filter(
      l => !archivedBeatIds.includes(l.id)
    );

    if (!customOrder || customOrder.length === 0) {
      return nonArchivedLessons;
    }

    const ordered: PearlHarborLesson[] = [];
    for (const beatId of customOrder) {
      const beat = nonArchivedLessons.find(b => b.id === beatId);
      if (beat) ordered.push(beat);
    }

    for (const beat of nonArchivedLessons) {
      if (!ordered.find(b => b.id === beat.id)) {
        ordered.push(beat);
      }
    }

    return ordered;
  }, [moduleAssets?.archivedBeats, moduleAssets?.beatOrder]);

  // Determine lesson states
  const getLessonState = (lesson: PearlHarborLesson, index: number): LessonState => {
    const isCompleted = isActivityCompleted(lesson.id);
    const isUnlocked = isLessonUnlocked(lesson.id);

    if (isCompleted) return 'completed';
    if (isUnlocked) return 'unlocked';
    if (index === 0) return 'current';

    const prevLesson = activeLessons[index - 1];
    if (prevLesson && isLessonUnlocked(prevLesson.id)) return 'current';
    return 'locked';
  };

  const lessonStates = activeLessons.map((lesson, index) => ({
    lesson,
    state: getLessonState(lesson, index),
  }));

  const completedCount = lessonStates.filter(l => l.state === 'completed').length;
  const currentLessonIndex = lessonStates.findIndex(l => l.state === 'current' || l.state === 'unlocked');

  // Auto-scroll to current lesson
  useEffect(() => {
    if (currentLessonIndex >= 0 && scrollRef.current) {
      const nodeElements = scrollRef.current.querySelectorAll('[data-lesson]');
      if (nodeElements[currentLessonIndex]) {
        setTimeout(() => {
          nodeElements[currentLessonIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
        }, 300);
      }
    }
  }, [currentLessonIndex]);

  return (
    <div className="fixed inset-0 z-[60] bg-void flex flex-col">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="relative z-10 bg-ink border-b border-off-white/[0.06]">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-3.5 z-20 text-off-white/70 hover:text-off-white transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Title section */}
        <div className="text-center pt-3 pb-2.5 px-12">
          <div className="font-mono text-[9px] tracking-[0.25em] text-off-white/50 uppercase font-semibold mb-1">
            Pearl Harbor
          </div>
          <h1 className="font-serif text-[22px] font-bold italic text-off-white leading-none">
            Day of Infamy
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-2 font-mono text-[9px] tracking-[0.15em] text-off-white/50 uppercase">
            <Crown size={10} className="text-gold-2" />
            <span>
              <span className="text-gold-2">{completedCount}</span> of {activeLessons.length} briefed
            </span>
          </div>
        </div>

        {/* Classified strip */}
        <div className="flex justify-between items-center px-4 py-2 bg-void/40 border-t border-b border-off-white/[0.06]">
          <div className="flex items-center gap-2 font-mono text-[8px] tracking-[0.3em] text-ha-red uppercase font-bold">
            <span className="w-1.5 h-1.5 bg-ha-red rounded-full shadow-[0_0_8px_var(--ha-red)] animate-pulse" />
            Briefing · Active
          </div>
          <div className="font-mono text-[8px] tracking-[0.2em] text-off-white/50 uppercase font-semibold">
            File · PH-1941
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-2.5">
          <div className="flex justify-between font-mono text-[8.5px] tracking-[0.15em] text-off-white/50 uppercase font-semibold mb-1.5">
            <span>Declassified</span>
            <span>
              <span className="text-gold-2">{completedCount}</span> / {activeLessons.length}
            </span>
          </div>
          <div className="h-[3px] bg-off-white/[0.08] rounded-sm overflow-hidden">
            <motion.div
              className="h-full bg-gold-2 rounded-sm"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / activeLessons.length) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      </header>

      {/* ═══════════ DOSSIER FEED ═══════════ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(230,171,42,0.04) 0%, transparent 40%),
            radial-gradient(ellipse at 70% 80%, rgba(205,14,20,0.04) 0%, transparent 40%)
          `,
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg, transparent 0, transparent 29px, rgba(230,171,42,0.03) 29px, rgba(230,171,42,0.03) 30px),
              repeating-linear-gradient(0deg, transparent 0, transparent 29px, rgba(230,171,42,0.03) 29px, rgba(230,171,42,0.03) 30px)
            `,
          }}
        />

        {/* Red thread */}
        <div className="absolute left-[40px] top-0 bottom-0 w-[2px] z-[1] pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: 'repeating-linear-gradient(180deg, var(--ha-red) 0, var(--ha-red) 3px, transparent 3px, transparent 7px)',
              opacity: 0.4,
            }}
          />
        </div>

        {/* Dossier cards */}
        <div className="relative z-[2] px-4 py-4 pb-32">
          <AnimatePresence mode="wait">
            {lessonStates.map(({ lesson, state }, index) => {
              const isClickable = state === 'current' || state === 'completed' || state === 'unlocked';
              const timestamp = LESSON_TIMESTAMPS[lesson.id] || '00:00';
              const location = LESSON_LOCATIONS[lesson.id] || lesson.subtitle;

              return (
                <motion.button
                  key={lesson.id}
                  data-lesson
                  onClick={isClickable ? () => onSelectLesson(lesson.id) : undefined}
                  disabled={!isClickable}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={cn(
                    'relative w-full text-left mb-3 p-2.5 rounded flex gap-2.5 border transition-all',
                    isClickable ? 'cursor-pointer' : 'cursor-not-allowed',
                    state === 'completed' && 'bg-[rgba(30,24,18,0.6)] border-gold-2/35',
                    state === 'current' && 'bg-gradient-to-br from-[rgba(58,28,16,0.5)] to-ink-lift border-ha-red shadow-[0_6px_18px_rgba(0,0,0,0.4)]',
                    state === 'unlocked' && 'bg-[rgba(58,40,20,0.4)] border-gold-2/50',
                    state === 'locked' && 'bg-ink-lift border-off-white/[0.06] opacity-45'
                  )}
                >
                  {/* Corner fasteners */}
                  <div
                    className={cn(
                      'absolute top-[5px] left-[5px] w-1.5 h-1.5 rounded-full border-[1.5px] bg-ink z-[3]',
                      state === 'current' ? 'border-ha-red' : 'border-gold-deep'
                    )}
                  />
                  <div
                    className={cn(
                      'absolute top-[5px] right-[5px] w-1.5 h-1.5 rounded-full border-[1.5px] bg-ink z-[3]',
                      state === 'current' ? 'border-ha-red' : 'border-gold-deep'
                    )}
                  />

                  {/* Photo */}
                  <div
                    className={cn(
                      'relative w-[58px] h-[58px] rounded flex-shrink-0 overflow-hidden border',
                      state === 'completed' && 'bg-gradient-to-br from-[#3a2818] to-[#1a0c04] border-gold-2/20',
                      state === 'current' && 'border-ha-red/50',
                      state === 'unlocked' && 'bg-gradient-to-br from-[#3a2818] to-[#1a0c04] border-gold-2/30',
                      state === 'locked' && 'bg-gradient-to-br from-[#2a2a2a] to-[#0a0a0a] border-off-white/10'
                    )}
                    style={
                      state === 'current'
                        ? {
                            background: `
                              radial-gradient(ellipse at 30% 30%, rgba(205,14,20,0.4), transparent 60%),
                              linear-gradient(135deg, #3a1810, #0a0604)
                            `,
                          }
                        : {}
                    }
                  >
                    {/* Glow overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 40%, rgba(230,171,42,0.2), transparent 70%)',
                      }}
                    />

                    {/* Silhouette placeholder */}
                    {state !== 'locked' && (
                      <div
                        className="absolute inset-[15%_25%]"
                        style={{
                          background: 'radial-gradient(ellipse at 50% 30%, rgba(120,80,40,0.5), rgba(40,30,20,0.8))',
                          borderRadius: '40% 40% 15% 15%',
                        }}
                      />
                    )}

                    {/* Number stamp */}
                    <div
                      className={cn(
                        'absolute top-1 right-1 px-1.5 py-0.5 rounded-sm font-mono text-[7px] font-bold tracking-[0.1em] z-[2]',
                        state === 'current'
                          ? 'bg-ha-red text-off-white'
                          : 'bg-void/70 text-gold-2'
                      )}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </div>

                    {/* Lock icon for locked */}
                    {state === 'locked' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock size={18} className="text-off-white/30" />
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    {/* Label */}
                    <div
                      className={cn(
                        'flex items-center gap-1.5 font-mono text-[7px] tracking-[0.28em] uppercase font-bold mb-1',
                        state === 'completed' && 'text-gold-2',
                        state === 'current' && 'text-ha-red',
                        state === 'unlocked' && 'text-gold-2',
                        state === 'locked' && 'text-off-white/35'
                      )}
                    >
                      <span
                        className={cn(
                          'w-[5px] h-[5px] rounded-full',
                          state === 'completed' && 'bg-gold-2',
                          state === 'current' && 'bg-ha-red shadow-[0_0_6px_var(--ha-red)]',
                          state === 'unlocked' && 'bg-gold-2',
                          state === 'locked' && 'bg-off-white/35'
                        )}
                      />
                      {state === 'completed' && `Declassified · ${timestamp}`}
                      {state === 'current' && `Active Briefing · ${timestamp}`}
                      {state === 'unlocked' && `In Progress · ${timestamp}`}
                      {state === 'locked' && `Classified · ${timestamp}`}
                    </div>

                    {/* Title */}
                    <h3
                      className={cn(
                        'font-serif text-[14px] font-bold italic leading-none mb-1',
                        state === 'locked' ? 'text-off-white/50' : 'text-off-white'
                      )}
                    >
                      {lesson.title}
                    </h3>

                    {/* Meta */}
                    <div className="flex items-center gap-2 font-mono text-[7.5px] tracking-[0.08em] text-off-white/50">
                      <span>{location}</span>
                      <span className="text-off-white/30">·</span>
                      <span>{lesson.duration || '5 min'}</span>
                      {state !== 'locked' && (
                        <>
                          <span className="text-off-white/30">·</span>
                          <span
                            className={cn(
                              'font-bold',
                              state === 'current' ? 'text-ha-red' : 'text-gold-2'
                            )}
                          >
                            +{lesson.xpReward} XP
                          </span>
                        </>
                      )}
                    </div>

                    {/* Description for current */}
                    {state === 'current' && (
                      <p className="font-body text-[9.5px] text-off-white/70 leading-[1.4] mt-1.5 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}

                    {/* Return notice for unlocked */}
                    {state === 'unlocked' && (
                      <p className="font-body text-[9.5px] text-gold-2/80 leading-[1.4] mt-1.5">
                        Return to complete and earn XP.
                      </p>
                    )}
                  </div>

                  {/* Play button for current */}
                  {(state === 'current' || state === 'unlocked') && (
                    <div className="flex-shrink-0 self-center">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-full flex items-center justify-center border-2',
                          state === 'current'
                            ? 'bg-ha-red border-off-white text-off-white shadow-[0_4px_12px_rgba(205,14,20,0.5)]'
                            : 'bg-gold-2 border-off-white text-void shadow-[0_4px_12px_rgba(230,171,42,0.4)]'
                        )}
                      >
                        <Play size={14} className="ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  )}

                  {/* Checkmark for completed */}
                  {state === 'completed' && (
                    <div className="flex-shrink-0 self-center">
                      <div className="w-7 h-7 rounded-full bg-gold-2 flex items-center justify-center">
                        <Check size={14} className="text-void" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>

          {/* Final badge */}
          {completedCount === activeLessons.length && activeLessons.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center mt-6 py-6"
            >
              <div
                className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-4xl mb-3 border-2 border-gold-2"
                style={{
                  background: 'radial-gradient(circle at 30% 25%, #FFEC8B 0%, #E6AB2A 50%, #B2641F 100%)',
                  boxShadow: '0 0 30px rgba(230,171,42,0.5)',
                }}
              >
                <span role="img" aria-label="medal">
                  🎖️
                </span>
              </div>
              <h3 className="font-serif text-xl font-bold italic text-off-white">
                Briefing Complete
              </h3>
              <p className="font-mono text-[10px] tracking-[0.2em] text-off-white/50 uppercase mt-1">
                All files declassified
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Music Control */}
      <MusicControl position="bottom-left" />
    </div>
  );
}

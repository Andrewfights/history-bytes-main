/**
 * PearlHarborJourneyMap - Duolingo-style lesson path for Pearl Harbor
 * Shows 7 lessons in a vertical progression with View Map button
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Globe, Lock, CheckCircle2, Play, Crown, AlertCircle } from 'lucide-react';
import { WW2Host } from '@/types';
import { PEARL_HARBOR_LESSONS, TOTAL_XP, PearlHarborLesson } from '@/data/pearlHarborLessons';
import { usePearlHarborProgress } from './hooks/usePearlHarborProgress';
import { MusicControl } from '@/components/shared/MusicControl';

interface PearlHarborJourneyMapProps {
  host: WW2Host;
  onSelectLesson: (lessonId: string) => void;
  onOpenWorldMap: () => void;
  onBack: () => void;
}

// 'completed' = fully finished with XP earned
// 'unlocked' = skipped/started but not finished (can proceed, but should return)
// 'current' = next lesson to play
// 'locked' = cannot access yet
type LessonState = 'completed' | 'unlocked' | 'current' | 'locked';

export function PearlHarborJourneyMap({
  host,
  onSelectLesson,
  onOpenWorldMap,
  onBack,
}: PearlHarborJourneyMapProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { progress, totalXP, isLessonUnlocked, isActivityCompleted } = usePearlHarborProgress();

  // Determine lesson states
  const getLessonState = (lesson: PearlHarborLesson, index: number): LessonState => {
    const isCompleted = isActivityCompleted(lesson.id);
    const isUnlocked = isLessonUnlocked(lesson.id);

    if (isCompleted) return 'completed';
    if (isUnlocked) return 'unlocked'; // Skipped but not completed
    if (index === 0) return 'current';

    // Check if previous lesson is unlocked (completed or skipped)
    const prevLesson = PEARL_HARBOR_LESSONS[index - 1];
    if (isLessonUnlocked(prevLesson.id)) return 'current';
    return 'locked';
  };

  const lessonStates = PEARL_HARBOR_LESSONS.map((lesson, index) => ({
    lesson,
    state: getLessonState(lesson, index),
  }));

  const completedCount = lessonStates.filter(l => l.state === 'completed').length;
  const skippedCount = lessonStates.filter(l => l.state === 'unlocked').length;
  const currentLessonIndex = lessonStates.findIndex(l => l.state === 'current');

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
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm pt-4 pb-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} className="text-white/70" />
        </button>

        {/* Title */}
        <div className="text-center pt-2">
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-white/50 mb-1">
            Pearl Harbor
          </p>
          <h1 className="font-editorial text-xl sm:text-2xl font-bold text-white mb-2">
            Day of Infamy
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/50 text-xs sm:text-sm">
            <Crown size={14} className="text-amber-400 sm:w-4 sm:h-4" />
            <span>{completedCount} of {PEARL_HARBOR_LESSONS.length} completed</span>
          </div>
        </div>

        {/* Host indicator */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <span className="text-white/70 text-sm">{host.name}</span>
        </div>

        {/* XP Progress */}
        <div className="mt-4 mx-6">
          <div className="flex items-center justify-between text-xs text-white/50 mb-1">
            <span>Progress</span>
            <span>{totalXP} / {TOTAL_XP} XP</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalXP / TOTAL_XP) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </div>
      </div>

      {/* Lesson Path */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden pb-32"
      >
        <AnimatePresence mode="wait">
          <motion.div
            className="flex flex-col items-center py-8 px-4 gap-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {lessonStates.map(({ lesson, state }, index) => {
              const isClickable = state === 'current' || state === 'completed' || state === 'unlocked';
              const isBoss = lesson.type === 'mastery-run';

              return (
                <motion.div
                  key={lesson.id}
                  data-lesson
                  className="flex flex-col items-center w-full max-w-full sm:max-w-xs md:max-w-sm px-2 sm:px-0"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.08 }}
                >
                  {/* Connector line (except for first) */}
                  {index > 0 && (
                    <div
                      className={`w-1 h-8 -mt-8 mb-2 rounded-full ${
                        state === 'completed'
                          ? 'bg-green-500'
                          : state === 'unlocked' || lessonStates[index - 1].state === 'completed' || lessonStates[index - 1].state === 'unlocked'
                          ? 'bg-amber-400'
                          : 'bg-white/20'
                      }`}
                    />
                  )}

                  {/* Lesson Card */}
                  <motion.button
                    onClick={isClickable ? () => onSelectLesson(lesson.id) : undefined}
                    disabled={!isClickable}
                    className={`
                      relative w-full p-4 rounded-2xl border-2 transition-all
                      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${state === 'completed'
                        ? 'bg-green-500/10 border-green-500/50'
                        : state === 'unlocked'
                        ? 'bg-orange-500/10 border-orange-500/50'
                        : state === 'current'
                        ? 'bg-white/10 border-amber-400'
                        : 'bg-white/5 border-white/10'
                      }
                    `}
                    whileHover={isClickable ? { scale: 1.02 } : {}}
                    whileTap={isClickable ? { scale: 0.98 } : {}}
                  >
                    {/* Pulsing ring for current */}
                    {state === 'current' && (
                      <motion.div
                        className="absolute inset-[-4px] rounded-2xl border-2 border-amber-400"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}

                    <div className="flex items-center gap-4">
                      {/* Icon Circle */}
                      <div
                        className={`
                          w-14 h-14 rounded-full flex items-center justify-center text-2xl
                          ${isBoss ? 'w-16 h-16' : ''}
                          ${state === 'locked'
                            ? 'bg-zinc-800'
                            : state === 'completed'
                            ? 'bg-green-500'
                            : state === 'unlocked'
                            ? 'bg-orange-500'
                            : 'bg-amber-400/80'
                          }
                        `}
                      >
                        {state === 'locked' ? (
                          <Lock size={24} className="text-zinc-600" />
                        ) : (
                          lesson.icon
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${
                            state === 'locked' ? 'text-zinc-600'
                            : state === 'completed' ? 'text-green-400'
                            : state === 'unlocked' ? 'text-orange-400'
                            : 'text-amber-400'
                          }`}>
                            LESSON {lesson.number}
                          </span>
                          {state === 'completed' && (
                            <CheckCircle2 size={14} className="text-green-500" />
                          )}
                          {state === 'unlocked' && (
                            <AlertCircle size={14} className="text-orange-500" />
                          )}
                        </div>
                        <h3 className={`font-bold text-base sm:text-lg ${
                          state === 'locked' ? 'text-zinc-500' : 'text-white'
                        }`}>
                          {lesson.title}
                        </h3>
                        <p className={`text-xs sm:text-sm ${
                          state === 'locked' ? 'text-zinc-600' : 'text-white/60'
                        }`}>
                          {state === 'unlocked' ? 'Skipped - Return to complete' : lesson.subtitle}
                        </p>
                      </div>

                      {/* Play indicator or XP */}
                      <div className="flex flex-col items-end gap-1">
                        {(state === 'current' || state === 'unlocked') && (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            state === 'unlocked' ? 'bg-orange-500' : 'bg-amber-400'
                          }`}>
                            <Play size={20} className="text-black fill-black ml-0.5" />
                          </div>
                        )}
                        {state === 'completed' && (
                          <span className="text-xs font-bold text-green-500">
                            +{lesson.xpReward} XP
                          </span>
                        )}
                        {(state === 'current' || state === 'unlocked') && (
                          <span className={`text-xs font-bold ${
                            state === 'unlocked' ? 'text-orange-400' : 'text-amber-400'
                          }`}>
                            {lesson.xpReward} XP
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Description for current/completed */}
                    {state !== 'locked' && (
                      <p className="mt-3 text-sm text-white/50 text-left">
                        {state === 'unlocked'
                          ? 'You skipped this lesson. Complete it to earn XP!'
                          : lesson.description
                        }
                      </p>
                    )}
                  </motion.button>
                </motion.div>
              );
            })}

            {/* Final Badge */}
            {completedCount === PEARL_HARBOR_LESSONS.length && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center mt-4 sm:mt-6"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-4xl sm:text-5xl mb-3 sm:mb-4">
                  🎖️
                </div>
                <h3 className="font-editorial text-lg sm:text-xl font-bold text-white">
                  Pearl Harbor Complete
                </h3>
                <p className="text-white/60 text-xs sm:text-sm mt-1">
                  You've mastered the story of December 7, 1941
                </p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Music Control */}
      <MusicControl position="bottom-left" />

      {/* View Map Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onClick={onOpenWorldMap}
        className="fixed z-30 flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
        style={{
          bottom: 'max(6rem, calc(5.5rem + env(safe-area-inset-bottom)))',
          right: '1rem',
        }}
      >
        <Globe size={18} className="sm:w-5 sm:h-5" />
        <span>View Map</span>
      </motion.button>
    </div>
  );
}

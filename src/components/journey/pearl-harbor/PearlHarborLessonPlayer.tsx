/**
 * PearlHarborLessonPlayer - Router component for Pearl Harbor lessons
 * Routes to the correct lesson component based on lessonId
 *
 * Handles two completion states:
 * - Complete: User finished all screens and earned XP
 * - Skip: User skipped ahead, lesson is unlocked but not completed
 *
 * Now includes checkpoint resume functionality
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Construction, RotateCcw, Play } from 'lucide-react';
import { WW2Host } from '@/types';
import { getLessonById } from '@/data/pearlHarborLessons';
import { usePearlHarborProgress } from './hooks/usePearlHarborProgress';
import { useApp } from '@/context/AppContext';
import { VideoLessonPlayer } from './lessons/VideoLessonPlayer';
import { RadarBranchingLesson } from './lessons/RadarBranchingLesson';
import { TestimoniesLesson } from './lessons/TestimoniesLesson';
import { RadioHeadlineLesson } from './lessons/RadioHeadlineLesson';
import { BattleshipRowLesson } from './lessons/BattleshipRowLesson';
import { MemorialTourLesson } from './lessons/MemorialTourLesson';
import { MasteryQuiz } from './lessons/MasteryQuiz';
// New 10-beat curriculum components
import {
  RoadToWarBeat,
  RadarBlipBeat,
  ToraToraToraBeat,
  DamageDoneBeat,
  VoicesFromHarborBeat,
  BreakingNewsBeat,
  NagumoDilemmaBeat,
  FactOrMythBeat,
  DayOfInfamyBeat,
  ArsenalDemocracyBeat,
  MasteryRunBeat,
  FinalExamBeat,
} from './beats';

interface PearlHarborLessonPlayerProps {
  lessonId: string;
  host: WW2Host;
  onComplete: () => void;
  onBack: () => void;
}

export function PearlHarborLessonPlayer({
  lessonId,
  host,
  onComplete,
  onBack,
}: PearlHarborLessonPlayerProps) {
  const { completeActivity, unlockLesson, hasResumableCheckpoint, clearCheckpoint, checkpoint } = usePearlHarborProgress();
  // Sync with main app context for XP and journey progress
  const { addXP, markJourneyNodeComplete } = useApp();
  const [showResumePrompt, setShowResumePrompt] = useState(() => hasResumableCheckpoint(lessonId));
  const [shouldResumeFromCheckpoint, setShouldResumeFromCheckpoint] = useState(true);
  const lesson = getLessonById(lessonId);

  if (!lesson) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Lesson not found</p>
      </div>
    );
  }

  // Handle resume choice
  const handleResume = () => {
    setShouldResumeFromCheckpoint(true);
    setShowResumePrompt(false);
  };

  const handleStartOver = () => {
    clearCheckpoint();
    setShouldResumeFromCheckpoint(false);
    setShowResumePrompt(false);
  };

  // Show resume prompt if there's a checkpoint for this lesson
  if (showResumePrompt && checkpoint?.lessonId === lessonId) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="font-editorial text-lg font-bold text-white">{lesson.title}</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Resume Prompt */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
          >
            <RotateCcw size={40} className="text-amber-400" />
          </motion.div>

          <h2 className="font-editorial text-2xl font-bold text-white mb-2">
            Resume Lesson?
          </h2>

          <p className="text-white/60 mb-2">
            You left off at: <span className="text-amber-400 font-medium capitalize">{checkpoint.screen}</span>
          </p>

          <p className="text-white/40 text-sm mb-8">
            Pick up where you left off, or start fresh.
          </p>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <motion.button
              onClick={handleResume}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-amber-500 text-black font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={20} />
              Resume
            </motion.button>

            <motion.button
              onClick={handleStartOver}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw size={20} />
              Start Over
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Called when user fully completes the lesson (earns XP)
  const handleLessonComplete = (xp: number) => {
    completeActivity(lessonId);
    // Sync with main app context
    addXP(xp);
    markJourneyNodeComplete(`pearl-harbor-${lessonId}`);
    onComplete();
  };

  // Called when user skips the lesson (can proceed but no XP)
  const handleLessonSkip = () => {
    unlockLesson(lessonId);
    // Track in main context as unlocked (not completed - no XP)
    // Using a different prefix to distinguish skipped vs completed
    markJourneyNodeComplete(`pearl-harbor-${lessonId}-unlocked`);
    onComplete();
  };

  // Route to the correct lesson component based on type
  switch (lesson.type) {
    // New 10-beat curriculum
    case 'road-to-war':
      return (
        <RoadToWarBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'radar-blip':
      return (
        <RadarBlipBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'tora-tora-tora':
      return (
        <ToraToraToraBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'damage-done':
      return (
        <DamageDoneBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'voices-harbor':
      return (
        <VoicesFromHarborBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'breaking-news':
      return (
        <BreakingNewsBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'nagumo-dilemma':
      return (
        <NagumoDilemmaBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'fact-or-myth':
      return (
        <FactOrMythBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'day-of-infamy':
      return (
        <DayOfInfamyBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'arsenal-democracy':
      return (
        <ArsenalDemocracyBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'mastery-run':
      return (
        <MasteryRunBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'final-exam':
      return (
        <FinalExamBeat
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    // Legacy lesson types (can be removed once all beats are implemented)
    case 'video-hotspots':
      return (
        <VideoLessonPlayer
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'radar-branching':
      return (
        <RadarBranchingLesson
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'testimonies':
      return (
        <TestimoniesLesson
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'radio-headline':
      return (
        <RadioHeadlineLesson
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'battleship-row':
      return (
        <BattleshipRowLesson
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    case 'memorial-tour':
      return (
        <MemorialTourLesson
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );

    // Fallback for any unknown lesson types
    default:
      return (
        <ComingSoonLesson
          lesson={lesson}
          host={host}
          onComplete={handleLessonComplete}
          onSkip={handleLessonSkip}
          onBack={onBack}
        />
      );
  }
}

// Placeholder component for lessons not yet implemented
interface ComingSoonLessonProps {
  lesson: { title: string; icon: string; xpReward: number };
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

function ComingSoonLesson({ lesson, host, onComplete, onSkip, onBack }: ComingSoonLessonProps) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">{lesson.title}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 rounded-full bg-amber-400/20 flex items-center justify-center mb-6"
        >
          <span className="text-5xl">{lesson.icon}</span>
        </motion.div>

        <h2 className="font-editorial text-2xl font-bold text-white mb-2">
          {lesson.title}
        </h2>

        <div className="flex items-center gap-2 text-amber-400 mb-6">
          <Construction size={20} />
          <span>Coming Soon</span>
        </div>

        <p className="text-white/60 max-w-sm mb-8">
          This lesson is being developed. You can skip to continue, or check back later for the full experience.
        </p>

        {/* Host message */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-8 max-w-sm">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <p className="text-white/70 text-sm text-left">
            "This lesson is still being prepared. You can skip for now and come back to complete it later!"
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs">
          <motion.button
            onClick={() => onComplete(lesson.xpReward)}
            className="px-8 py-4 rounded-full bg-green-500 text-white font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Complete (+{lesson.xpReward} XP)
          </motion.button>

          <motion.button
            onClick={onSkip}
            className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-bold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Skip for Now
          </motion.button>
        </div>
      </div>
    </div>
  );
}

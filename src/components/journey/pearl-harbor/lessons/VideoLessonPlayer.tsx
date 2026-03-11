/**
 * VideoLessonPlayer - Lesson 1: Morning of the Attack
 *
 * Screens:
 * 1. Title - Key art, title, CTA
 * 2. Video + Hotspots - 60-75s video with tappable hotspots
 * 3. Recap Card - Summary of key points
 * 4. Quiz 1 - Date question (MCQ)
 * 5. Quiz 2 - Map tap question
 * 6. Quiz 3 - Duration question (MCQ)
 * 7. Completion - Badge and summary
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward, CheckCircle2, X, MapPin } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { LeaveConfirmDialog } from '@/components/shared/LeaveConfirmDialog';

interface VideoLessonPlayerProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'title' | 'video' | 'recap' | 'quiz-date' | 'quiz-map' | 'quiz-duration' | 'completion';

const LESSON_ID = 'ph-lesson-1';
const SCREENS: Screen[] = ['title', 'video', 'recap', 'quiz-date', 'quiz-map', 'quiz-duration', 'completion'];

// Lesson content data
const LESSON_DATA = {
  title: 'Morning of the Attack',
  subtitle: 'Pearl Harbor, Hawaii - December 7, 1941',
  xpReward: 40,
  videoUrl: '', // Placeholder - will be provided
  videoDuration: 75, // seconds
  hotspots: [
    { id: 'planes', time: 15, x: 30, y: 25, label: 'Japanese Aircraft', content: 'The first wave consisted of 183 aircraft including fighters, bombers, and torpedo planes.' },
    { id: 'arizona', time: 35, x: 60, y: 50, label: 'USS Arizona', content: 'A bomb penetrated the forward magazine, causing a massive explosion that killed 1,177 crew members.' },
    { id: 'battleship-row', time: 55, x: 45, y: 65, label: 'Battleship Row', content: 'Eight battleships were moored here. All were damaged; four were sunk.' },
  ],
  recap: {
    summary: 'On December 7, 1941, Japan launched a surprise military attack against the United States naval base at Pearl Harbor, Hawaii.',
    duration: 'The attack lasted approximately 2 hours, in two waves.',
  },
  quizzes: {
    date: {
      prompt: 'When did the attack on Pearl Harbor happen?',
      choices: ['December 7, 1940', 'December 7, 1941', 'December 7, 1942', 'November 7, 1941'],
      correctIndex: 1,
      explanation: 'The attack occurred on December 7, 1941 - a date which President Roosevelt called "a date which will live in infamy."',
    },
    map: {
      prompt: 'Tap where Pearl Harbor is located.',
      correctArea: { x: 46, y: 49, radius: 8 }, // Oahu island position on the SVG map
      explanation: 'Pearl Harbor is located on the island of Oahu, Hawaii, in the Pacific Ocean - about 2,400 miles from the US mainland and 3,850 miles from Japan.',
    },
    duration: {
      prompt: 'How long did the attack last?',
      choices: ['About 30 minutes', 'About 1 hour', 'About 2 hours', 'About 4 hours'],
      correctIndex: 2,
      explanation: 'The attack lasted approximately 2 hours, from 7:48 AM to 9:45 AM local time.',
    },
  },
};

export function VideoLessonPlayer({ host, onComplete, onSkip, onBack }: VideoLessonPlayerProps) {
  const [screen, setScreen] = useState<Screen>('title');
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [viewedHotspots, setViewedHotspots] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [mapTapPosition, setMapTapPosition] = useState<{ x: number; y: number } | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());
  const [isRestoringCheckpoint, setIsRestoringCheckpoint] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const videoRef = useRef<HTMLDivElement>(null);

  // Checkpoint system
  const { saveCheckpoint, clearCheckpoint, getCheckpointForLesson } = usePearlHarborProgress();

  // Restore from checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpointForLesson(LESSON_ID);
    if (checkpoint) {
      console.log('[Video Lesson] Restoring from checkpoint:', checkpoint.screen);
      setScreen(checkpoint.screen as Screen);
      // Restore lesson-specific state
      if (checkpoint.state.viewedTestimonies) {
        setViewedHotspots(checkpoint.state.viewedTestimonies);
      }
      if (checkpoint.state.quizScore !== undefined) {
        setScore(checkpoint.state.quizScore);
      }
      if (checkpoint.state.skippedScreens) {
        setSkippedScreens(new Set(checkpoint.state.skippedScreens as Screen[]));
      }
    }
    setIsRestoringCheckpoint(false);
  }, []);

  // Save checkpoint on screen change
  useEffect(() => {
    if (isRestoringCheckpoint) return;
    if (screen === 'completion') return;

    const screenIndex = SCREENS.indexOf(screen);
    saveCheckpoint(LESSON_ID, screen, screenIndex, {
      viewedTestimonies: viewedHotspots, // Reusing this field for hotspots
      quizScore: score,
      skippedScreens: Array.from(skippedScreens),
    });
  }, [screen, viewedHotspots, score, skippedScreens, isRestoringCheckpoint, saveCheckpoint]);

  // Simulate video progress
  useEffect(() => {
    if (isPlaying && screen === 'video') {
      const interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + (100 / LESSON_DATA.videoDuration);
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, screen]);

  // Check completion criteria for video screen
  const canProceedFromVideo = videoProgress >= 80 || viewedHotspots.length >= 2;

  const handleHotspotClick = (id: string) => {
    setActiveHotspot(id);
    setIsPlaying(false);
    if (!viewedHotspots.includes(id)) {
      setViewedHotspots(prev => [...prev, id]);
    }
  };

  const handleQuizAnswer = (index: number, correctIndex: number) => {
    setSelectedAnswer(index);
    const correct = index === correctIndex;
    setIsAnswerCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleMapTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMapTapPosition({ x, y });

    const { correctArea } = LESSON_DATA.quizzes.map;
    const distance = Math.sqrt(Math.pow(x - correctArea.x, 2) + Math.pow(y - correctArea.y, 2));
    const correct = distance <= correctArea.radius;
    setIsAnswerCorrect(correct);
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextScreen = (wasSkipped: boolean = false) => {
    // Track if this screen was skipped (not properly completed)
    if (wasSkipped) {
      setSkippedScreens(prev => new Set([...prev, screen]));
    }

    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setMapTapPosition(null);

    const screens: Screen[] = ['title', 'video', 'recap', 'quiz-date', 'quiz-map', 'quiz-duration', 'completion'];
    const currentIndex = screens.indexOf(screen);
    if (currentIndex < screens.length - 1) {
      setScreen(screens[currentIndex + 1]);
    }
  };

  // Skip all remaining screens and unlock (but don't complete) the lesson
  const handleSkipLesson = () => {
    clearCheckpoint();
    onSkip();
  };

  const handleComplete = () => {
    // Clear checkpoint when lesson is complete
    clearCheckpoint();

    // Check if any screens were skipped - if so, only unlock, don't complete
    if (skippedScreens.size > 0) {
      onSkip();
    } else {
      onComplete(LESSON_DATA.xpReward);
    }
  };

  // Check if the lesson was properly completed (all quizzes answered correctly)
  const wasLessonCompleted = score === 3 && skippedScreens.size === 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={() => setShowLeaveConfirm(true)} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 1</h1>
          <p className="text-xs text-amber-400">{LESSON_DATA.title}</p>
        </div>
        {screen !== 'completion' && screen !== 'title' ? (
          <button
            onClick={handleSkipLesson}
            className="text-white/50 hover:text-white/80 text-sm font-medium"
          >
            Skip All
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-400"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'title' ? '0%' :
                   screen === 'video' ? '15%' :
                   screen === 'recap' ? '30%' :
                   screen === 'quiz-date' ? '50%' :
                   screen === 'quiz-map' ? '65%' :
                   screen === 'quiz-duration' ? '80%' :
                   '100%'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Title Screen */}
          {screen === 'title' && (
            <motion.div
              key="title"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              {/* Key art placeholder */}
              <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-red-900/50 to-orange-900/50 flex items-center justify-center mb-8">
                <span className="text-8xl">💥</span>
              </div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-8">
                {LESSON_DATA.subtitle}
              </p>

              <motion.button
                onClick={nextScreen}
                className="px-8 py-4 rounded-full bg-amber-400 text-black font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Story
              </motion.button>
            </motion.div>
          )}

          {/* Video Screen */}
          {screen === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Video area */}
              <div
                ref={videoRef}
                className="relative flex-1 bg-black"
              >
                {/* Video placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-6xl opacity-50">🎬</span>
                </div>

                {/* Hotspots */}
                {LESSON_DATA.hotspots.map((hotspot) => {
                  const isVisible = (videoProgress / 100) * LESSON_DATA.videoDuration >= hotspot.time;
                  const isViewed = viewedHotspots.includes(hotspot.id);

                  if (!isVisible) return null;

                  return (
                    <motion.button
                      key={hotspot.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => handleHotspotClick(hotspot.id)}
                      className={`absolute w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                        isViewed ? 'border-green-400 bg-green-400/20' : 'border-amber-400 bg-amber-400/20'
                      }`}
                      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      {isViewed ? (
                        <CheckCircle2 size={20} className="text-green-400" />
                      ) : (
                        <motion.div
                          className="w-3 h-3 rounded-full bg-amber-400"
                          animate={{ scale: [1, 1.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      )}
                    </motion.button>
                  );
                })}

                {/* Hotspot detail overlay */}
                <AnimatePresence>
                  {activeHotspot && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="absolute inset-x-4 bottom-20 p-4 rounded-xl bg-black/90 border border-white/20"
                    >
                      <button
                        onClick={() => setActiveHotspot(null)}
                        className="absolute top-2 right-2 p-1 text-white/60 hover:text-white"
                      >
                        <X size={20} />
                      </button>
                      <h3 className="font-bold text-white mb-2">
                        {LESSON_DATA.hotspots.find(h => h.id === activeHotspot)?.label}
                      </h3>
                      <p className="text-white/70 text-sm">
                        {LESSON_DATA.hotspots.find(h => h.id === activeHotspot)?.content}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video controls */}
                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center"
                    >
                      {isPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
                    </button>

                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 transition-all"
                        style={{ width: `${videoProgress}%` }}
                      />
                    </div>

                    {canProceedFromVideo ? (
                      <button
                        onClick={() => nextScreen(false)}
                        className="px-4 py-2 rounded-full text-sm font-bold bg-amber-400 text-black"
                      >
                        Continue
                      </button>
                    ) : (
                      <button
                        onClick={() => nextScreen(true)}
                        className="px-4 py-2 rounded-full text-sm font-bold bg-white/10 text-white/60 hover:bg-white/20"
                      >
                        <SkipForward size={16} className="inline mr-1" />
                        Skip
                      </button>
                    )}
                  </div>

                  <p className="text-center text-white/50 text-xs mt-2">
                    {viewedHotspots.length}/3 hotspots viewed
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Recap Screen */}
          {screen === 'recap' && (
            <motion.div
              key="recap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-amber-400/20 flex items-center justify-center mb-6">
                <span className="text-4xl">📋</span>
              </div>

              <h2 className="font-editorial text-2xl font-bold text-white mb-4">
                Key Takeaways
              </h2>

              <p className="text-white/80 mb-4 max-w-sm">
                {LESSON_DATA.recap.summary}
              </p>

              <p className="text-white/60 text-sm mb-8">
                {LESSON_DATA.recap.duration}
              </p>

              <motion.button
                onClick={nextScreen}
                className="px-8 py-4 rounded-full bg-amber-400 text-black font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Test Your Knowledge
              </motion.button>
            </motion.div>
          )}

          {/* Quiz: Date */}
          {screen === 'quiz-date' && (
            <motion.div
              key="quiz-date"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-6 text-center">
                {LESSON_DATA.quizzes.date.prompt}
              </h2>

              <div className="space-y-3 flex-1">
                {LESSON_DATA.quizzes.date.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectedAnswer === null && handleQuizAnswer(index, LESSON_DATA.quizzes.date.correctIndex)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === null
                        ? 'border-white/20 bg-white/5 hover:border-amber-400/50'
                        : selectedAnswer === index
                          ? isAnswerCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : index === LESSON_DATA.quizzes.date.correctIndex
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5 opacity-50'
                    }`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <span className="text-white">{choice}</span>
                  </motion.button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isAnswerCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-4 ${
                      isAnswerCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    <p className={`font-bold mb-1 ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isAnswerCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {LESSON_DATA.quizzes.date.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswerCorrect !== null ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen(false)}
                  className="w-full py-4 rounded-full bg-amber-400 text-black font-bold"
                >
                  Next
                </motion.button>
              ) : (
                <button
                  onClick={() => nextScreen(true)}
                  className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip Question
                </button>
              )}
            </motion.div>
          )}

          {/* Quiz: Map */}
          {screen === 'quiz-map' && (
            <motion.div
              key="quiz-map"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-6 text-center">
                {LESSON_DATA.quizzes.map.prompt}
              </h2>

              {/* Map area - Pacific Ocean SVG */}
              <div
                className="relative flex-1 rounded-xl overflow-hidden border border-white/20"
                onClick={mapTapPosition === null ? handleMapTap : undefined}
              >
                {/* SVG Pacific Map */}
                <svg
                  viewBox="0 0 100 100"
                  className="absolute inset-0 w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {/* Ocean background */}
                  <rect width="100" height="100" fill="#0c2d48" />

                  {/* Ocean depth gradient */}
                  <defs>
                    <radialGradient id="oceanGradient" cx="50%" cy="50%" r="70%">
                      <stop offset="0%" stopColor="#1a4a6e" />
                      <stop offset="100%" stopColor="#0a1f33" />
                    </radialGradient>
                    <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2d5a3d" />
                      <stop offset="100%" stopColor="#1a3d28" />
                    </linearGradient>
                  </defs>
                  <rect width="100" height="100" fill="url(#oceanGradient)" />

                  {/* Grid lines for ocean */}
                  {[20, 40, 60, 80].map(y => (
                    <line key={`h${y}`} x1="0" y1={y} x2="100" y2={y} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.3" />
                  ))}
                  {[20, 40, 60, 80].map(x => (
                    <line key={`v${x}`} x1={x} y1="0" x2={x} y2="100" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="0.3" />
                  ))}

                  {/* Japan - positioned at left side, accurate shape */}
                  <g>
                    {/* Hokkaido */}
                    <path d="M8,22 Q10,20 12,21 Q13,23 11,25 Q9,24 8,22" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.3" />
                    {/* Honshu (main island) */}
                    <path d="M7,26 Q9,25 11,26 Q14,28 15,32 Q14,35 12,36 Q10,35 8,33 Q6,30 7,26" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.3" />
                    {/* Shikoku */}
                    <path d="M10,37 Q12,36 13,38 Q12,40 10,39 Q9,38 10,37" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.3" />
                    {/* Kyushu */}
                    <path d="M7,38 Q9,37 10,39 Q9,42 7,41 Q6,40 7,38" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.3" />
                    <text x="6" y="48" fill="#ffffff" fillOpacity="0.5" fontSize="3" fontWeight="bold">JAPAN</text>
                  </g>

                  {/* USA West Coast - right side */}
                  <g>
                    {/* Pacific Northwest to California */}
                    <path d="M82,15 Q84,14 86,15 Q88,18 89,22 Q90,28 91,35 Q92,42 90,48 Q88,52 86,50 Q84,46 83,40 Q82,32 82,25 Q81,20 82,15" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.3" />
                    {/* Baja California */}
                    <path d="M86,50 Q88,52 87,58 Q86,62 84,60 Q83,56 84,52 Q85,50 86,50" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.3" />
                    <text x="88" y="30" fill="#ffffff" fillOpacity="0.5" fontSize="3" fontWeight="bold" transform="rotate(90,88,30)">USA</text>
                  </g>

                  {/* Hawaiian Islands - center of Pacific */}
                  <g>
                    {/* Kauai */}
                    <ellipse cx="43" cy="48" rx="1.2" ry="0.9" fill="#2d7a4d" stroke="#4a9965" strokeWidth="0.2" />
                    {/* Oahu (Pearl Harbor location!) */}
                    <ellipse cx="46" cy="49" rx="1.5" ry="1.1" fill="#3d8a5d" stroke="#5ab978" strokeWidth="0.3" />
                    {/* Pearl Harbor marker on Oahu */}
                    <circle cx="45.5" cy="49.2" r="0.4" fill="#ef4444" fillOpacity="0.6" />
                    {/* Molokai */}
                    <ellipse cx="49" cy="49" rx="1.3" ry="0.5" fill="#2d7a4d" stroke="#4a9965" strokeWidth="0.2" />
                    {/* Lanai */}
                    <ellipse cx="49" cy="50.5" rx="0.6" ry="0.5" fill="#2d7a4d" stroke="#4a9965" strokeWidth="0.2" />
                    {/* Maui */}
                    <ellipse cx="52" cy="50" rx="1.4" ry="1" fill="#2d7a4d" stroke="#4a9965" strokeWidth="0.2" />
                    {/* Big Island (Hawaii) */}
                    <ellipse cx="56" cy="53" rx="2.2" ry="2" fill="#2d7a4d" stroke="#4a9965" strokeWidth="0.2" />
                    <text x="44" y="58" fill="#ffffff" fillOpacity="0.6" fontSize="2.5" fontWeight="bold">HAWAII</text>
                  </g>

                  {/* Alaska (partial, top right) */}
                  <path d="M75,5 Q78,4 82,5 Q85,7 83,10 Q80,12 77,10 Q74,8 75,5" fill="url(#landGradient)" stroke="#3d7a52" strokeWidth="0.2" opacity="0.7" />
                  <text x="76" y="8" fill="#ffffff" fillOpacity="0.3" fontSize="2">Alaska</text>

                  {/* Pacific Ocean label */}
                  <text x="50" y="75" fill="#ffffff" fillOpacity="0.15" fontSize="6" fontWeight="bold" textAnchor="middle">PACIFIC OCEAN</text>

                  {/* Distance indicators */}
                  <text x="25" y="48" fill="#ffffff" fillOpacity="0.2" fontSize="2" textAnchor="middle">~3,850 mi</text>
                  <text x="68" y="48" fill="#ffffff" fillOpacity="0.2" fontSize="2" textAnchor="middle">~2,400 mi</text>
                </svg>

                {/* Tap indicator */}
                {mapTapPosition && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`absolute w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                      isAnswerCorrect ? 'border-green-500 bg-green-500/30' : 'border-red-500 bg-red-500/30'
                    }`}
                    style={{
                      left: `${mapTapPosition.x}%`,
                      top: `${mapTapPosition.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <MapPin size={16} className={isAnswerCorrect ? 'text-green-400' : 'text-red-400'} />
                  </motion.div>
                )}

                {/* Correct location indicator */}
                {mapTapPosition && !isAnswerCorrect && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute w-8 h-8 rounded-full border-2 border-green-500 bg-green-500/30 flex items-center justify-center"
                    style={{
                      left: `${LESSON_DATA.quizzes.map.correctArea.x}%`,
                      top: `${LESSON_DATA.quizzes.map.correctArea.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <MapPin size={16} className="text-green-400" />
                  </motion.div>
                )}

                {mapTapPosition === null && (
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white/50 text-sm">Tap on the map to locate Pearl Harbor</p>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isAnswerCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl my-4 ${
                      isAnswerCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    <p className={`font-bold mb-1 ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isAnswerCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {LESSON_DATA.quizzes.map.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswerCorrect !== null ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen(false)}
                  className="w-full py-4 rounded-full bg-amber-400 text-black font-bold"
                >
                  Next
                </motion.button>
              ) : (
                <button
                  onClick={() => nextScreen(true)}
                  className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors mt-4"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip Question
                </button>
              )}
            </motion.div>
          )}

          {/* Quiz: Duration */}
          {screen === 'quiz-duration' && (
            <motion.div
              key="quiz-duration"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-6 text-center">
                {LESSON_DATA.quizzes.duration.prompt}
              </h2>

              <div className="space-y-3 flex-1">
                {LESSON_DATA.quizzes.duration.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectedAnswer === null && handleQuizAnswer(index, LESSON_DATA.quizzes.duration.correctIndex)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === null
                        ? 'border-white/20 bg-white/5 hover:border-amber-400/50'
                        : selectedAnswer === index
                          ? isAnswerCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : index === LESSON_DATA.quizzes.duration.correctIndex
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5 opacity-50'
                    }`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <span className="text-white">{choice}</span>
                  </motion.button>
                ))}
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {isAnswerCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl mb-4 ${
                      isAnswerCorrect ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
                    }`}
                  >
                    <p className={`font-bold mb-1 ${isAnswerCorrect ? 'text-green-400' : 'text-red-400'}`}>
                      {isAnswerCorrect ? 'Correct!' : 'Not quite'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {LESSON_DATA.quizzes.duration.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswerCorrect !== null ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen(false)}
                  className="w-full py-4 rounded-full bg-amber-400 text-black font-bold"
                >
                  Next
                </motion.button>
              ) : (
                <button
                  onClick={() => nextScreen(true)}
                  className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip Question
                </button>
              )}
            </motion.div>
          )}

          {/* Completion Screen */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              {skippedScreens.size === 0 ? (
                <>
                  {/* Fully completed */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6"
                  >
                    <span className="text-5xl">🎖️</span>
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Lesson Complete!
                  </h2>

                  <p className="text-amber-400 font-bold mb-6">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="text-left bg-white/5 rounded-xl p-4 mb-8 max-w-sm">
                    <p className="text-white/80 text-sm mb-2">Key facts learned:</p>
                    <ul className="text-white/60 text-sm space-y-1">
                      <li>• December 7, 1941 - the attack date</li>
                      <li>• Pearl Harbor, Hawaii - the location</li>
                      <li>• Approximately 2 hours - the duration</li>
                    </ul>
                  </div>

                  <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                    <span>Progress:</span>
                    <span className="text-amber-400 font-bold">1 of 7</span>
                  </div>

                  <motion.button
                    onClick={handleComplete}
                    className="px-8 py-4 rounded-full bg-amber-400 text-black font-bold text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Next Lesson
                  </motion.button>
                </>
              ) : (
                <>
                  {/* Skipped some content */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6"
                  >
                    <SkipForward size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Lesson Unlocked
                  </h2>

                  <p className="text-orange-400 font-medium mb-4">
                    You skipped {skippedScreens.size} section{skippedScreens.size > 1 ? 's' : ''}
                  </p>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm">
                      You can proceed to the next lesson, but come back to complete this one to earn <span className="text-amber-400 font-bold">+{LESSON_DATA.xpReward} XP</span>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                    <span>Progress:</span>
                    <span className="text-orange-400 font-bold">1 of 7 (incomplete)</span>
                  </div>

                  <motion.button
                    onClick={handleComplete}
                    className="px-8 py-4 rounded-full bg-orange-500 text-white font-bold text-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue Anyway
                  </motion.button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Leave Confirmation Dialog */}
      <LeaveConfirmDialog
        isOpen={showLeaveConfirm}
        onConfirm={() => {
          // Save checkpoint before leaving so user can resume
          const screenIndex = SCREENS.indexOf(screen);
          saveCheckpoint(LESSON_ID, screen, screenIndex, {
            viewedTestimonies: viewedHotspots,
            quizScore: score,
            skippedScreens: Array.from(skippedScreens),
          });
          onBack();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
      />
    </div>
  );
}

/**
 * MemorialTourLesson - Lesson 6: Arizona Memorial
 *
 * Screens:
 * 1. Intro - "A place of remembrance"
 * 2. Panorama Tour - 360° view simulation with hotspots
 * 3. Reflection Quiz - Why we remember
 * 4. Completion - Final thoughts
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward, Eye, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { WW2Host } from '@/types';

interface MemorialTourLessonProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'intro' | 'tour' | 'reflection' | 'completion';

// Lesson content
const LESSON_DATA = {
  title: 'Arizona Memorial',
  subtitle: 'A place of remembrance',
  xpReward: 55,
  hotspots: [
    {
      id: 'shrine',
      angle: 0,
      name: 'The Shrine Room',
      icon: '🕯️',
      image: 'shrine',
      description: 'The Shrine Room contains a marble wall engraved with the names of all 1,177 crew members who died on the USS Arizona. Fresh flowers and leis are placed here daily by visitors paying their respects.',
    },
    {
      id: 'oil',
      angle: 90,
      name: 'Black Tears',
      icon: '💧',
      image: 'oil',
      description: 'Oil still seeps from the sunken hull at a rate of about 2-9 quarts per day. Often called "the tears of the Arizona" or "black tears," this oil is a constant reminder that the ship is still bleeding. Scientists estimate the leaking could continue for decades.',
    },
    {
      id: 'hull',
      angle: 180,
      name: 'The Sunken Hull',
      icon: '⚓',
      image: 'hull',
      description: 'Looking down through the crystal-clear water, you can see the rusted remains of the battleship just 40 feet below. The ship\'s gun turrets, now encrusted with coral, still point skyward. Over 900 crew members remain entombed within.',
    },
    {
      id: 'flag',
      angle: 270,
      name: 'The Flag',
      icon: '🇺🇸',
      image: 'flag',
      description: 'An American flag flies from a flagpole attached to the severed mainmast of the Arizona, which still rises above the water. The flag is raised and lowered daily, just as it would be on an active Navy vessel. The Arizona is still considered a commissioned Navy ship.',
    },
  ],
  reflection: {
    question: 'Why is the USS Arizona left underwater as a memorial rather than raised and preserved?',
    choices: [
      'It was too expensive to raise',
      'The ship is a grave site for over 900 crew members who remain inside',
      'The Navy forgot about it after the war',
      'It was too damaged to be of historical value',
    ],
    correctIndex: 1,
    explanation: 'The USS Arizona is the final resting place for 1,102 of the 1,177 crew members who died. It was decided that the ship should remain where it sank as a permanent memorial and grave site. Many survivors have chosen to have their ashes interred with their shipmates.',
  },
};

export function MemorialTourLesson({ host, onComplete, onSkip, onBack }: MemorialTourLessonProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentHotspotIndex, setCurrentHotspotIndex] = useState(0);
  const [viewedHotspots, setViewedHotspots] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());

  const currentHotspot = LESSON_DATA.hotspots[currentHotspotIndex];

  const navigateHotspot = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next'
      ? (currentHotspotIndex + 1) % LESSON_DATA.hotspots.length
      : (currentHotspotIndex - 1 + LESSON_DATA.hotspots.length) % LESSON_DATA.hotspots.length;
    setCurrentHotspotIndex(newIndex);

    const hotspotId = LESSON_DATA.hotspots[newIndex].id;
    if (!viewedHotspots.includes(hotspotId)) {
      setViewedHotspots(prev => [...prev, hotspotId]);
    }
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    setIsAnswerCorrect(index === LESSON_DATA.reflection.correctIndex);
  };

  const nextScreen = (wasSkipped: boolean = false) => {
    if (wasSkipped) {
      setSkippedScreens(prev => new Set([...prev, screen]));
    }

    // Mark first hotspot as viewed when entering tour
    if (screen === 'intro') {
      setViewedHotspots([LESSON_DATA.hotspots[0].id]);
    }

    const screens: Screen[] = ['intro', 'tour', 'reflection', 'completion'];
    const currentIndex = screens.indexOf(screen);
    if (currentIndex < screens.length - 1) {
      setScreen(screens[currentIndex + 1]);
    }
  };

  const handleComplete = () => {
    if (skippedScreens.size > 0 || !isAnswerCorrect) {
      onSkip();
    } else {
      onComplete(LESSON_DATA.xpReward);
    }
  };

  const handleSkipLesson = () => {
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 6</h1>
          <p className="text-xs text-amber-400">{LESSON_DATA.title}</p>
        </div>
        {screen !== 'completion' && screen !== 'intro' ? (
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
          className="h-full bg-slate-400"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'intro' ? '0%' :
                   screen === 'tour' ? '40%' :
                   screen === 'reflection' ? '75%' :
                   '100%'
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* Intro Screen */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700/50 to-slate-600/30 flex items-center justify-center mb-6 relative overflow-hidden"
              >
                <span className="text-6xl">🏛️</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-6">
                {LESSON_DATA.subtitle}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm text-left">
                <p className="text-white/80 text-sm mb-3">
                  The USS Arizona Memorial straddles the sunken hull of the battleship, built in 1962 to honor the 1,177 sailors and Marines who lost their lives aboard.
                </p>
                <p className="text-white/60 text-sm">
                  Every year, over 1.8 million visitors come to pay their respects at this sacred site.
                </p>
              </div>

              {/* Host message */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 mb-8 max-w-sm">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: host.primaryColor }}
                >
                  {host.avatar}
                </div>
                <p className="text-white/70 text-sm text-left">
                  "This is hallowed ground. Let's explore the memorial and understand why we remember."
                </p>
              </div>

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-slate-500 text-white font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Eye size={20} className="inline mr-2" />
                Begin Tour
              </motion.button>
            </motion.div>
          )}

          {/* Tour Screen */}
          {screen === 'tour' && (
            <motion.div
              key="tour"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Panorama simulation */}
              <div className="flex-1 relative bg-gradient-to-b from-slate-800 to-slate-900 overflow-hidden">
                {/* Background scene based on hotspot */}
                <motion.div
                  key={currentHotspot.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="text-center">
                    <motion.span
                      className="text-8xl block mb-4"
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      {currentHotspot.icon}
                    </motion.span>
                    <h3 className="text-white font-bold text-xl mb-2">
                      {currentHotspot.name}
                    </h3>
                  </div>
                </motion.div>

                {/* Navigation arrows */}
                <button
                  onClick={() => navigateHotspot('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button
                  onClick={() => navigateHotspot('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight size={24} className="text-white" />
                </button>

                {/* Hotspot indicators */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {LESSON_DATA.hotspots.map((hotspot, index) => (
                    <button
                      key={hotspot.id}
                      onClick={() => {
                        setCurrentHotspotIndex(index);
                        if (!viewedHotspots.includes(hotspot.id)) {
                          setViewedHotspots(prev => [...prev, hotspot.id]);
                        }
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentHotspotIndex === index
                          ? 'bg-white scale-125'
                          : viewedHotspots.includes(hotspot.id)
                          ? 'bg-white/60'
                          : 'bg-white/30'
                      }`}
                    />
                  ))}
                </div>

                {/* Compass */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                  <motion.div
                    animate={{ rotate: currentHotspot.angle }}
                    className="w-1 h-4 bg-red-500 rounded-full origin-bottom"
                  />
                </div>
              </div>

              {/* Description panel */}
              <motion.div
                key={currentHotspot.id + '-desc'}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-800 border-t border-white/10"
              >
                <p className="text-white/80 text-sm leading-relaxed">
                  {currentHotspot.description}
                </p>
              </motion.div>

              {/* Progress and continue */}
              <div className="p-4 bg-slate-900">
                <p className="text-white/50 text-sm text-center mb-3">
                  {viewedHotspots.length} of {LESSON_DATA.hotspots.length} locations viewed
                </p>
                {viewedHotspots.length >= LESSON_DATA.hotspots.length ? (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => nextScreen()}
                    className="w-full py-4 rounded-full bg-slate-500 text-white font-bold"
                  >
                    Continue to Reflection
                  </motion.button>
                ) : (
                  <button
                    onClick={() => nextScreen(true)}
                    className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                  >
                    <SkipForward size={16} className="inline mr-2" />
                    Skip Tour
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Reflection Screen */}
          {screen === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <div className="text-center mb-6">
                <span className="text-4xl mb-2 block">🤔</span>
                <h2 className="font-editorial text-xl font-bold text-white">
                  Reflection
                </h2>
              </div>

              <h3 className="text-white font-bold mb-6">
                {LESSON_DATA.reflection.question}
              </h3>

              <div className="space-y-3 flex-1">
                {LESSON_DATA.reflection.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => selectedAnswer === null && handleQuizAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedAnswer === null
                        ? 'border-white/20 bg-white/5 hover:border-slate-400/50'
                        : selectedAnswer === index
                          ? isAnswerCorrect
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-red-500 bg-red-500/20'
                          : index === LESSON_DATA.reflection.correctIndex
                            ? 'border-green-500 bg-green-500/20'
                            : 'border-white/10 bg-white/5 opacity-50'
                    }`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    <span className="text-white text-sm">{choice}</span>
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
                      {isAnswerCorrect ? 'Correct' : 'Not quite'}
                    </p>
                    <p className="text-white/70 text-sm">
                      {LESSON_DATA.reflection.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswerCorrect !== null ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen()}
                  className="w-full py-4 rounded-full bg-slate-500 text-white font-bold"
                >
                  Continue
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
              {skippedScreens.size === 0 && isAnswerCorrect ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Tour Complete
                  </h2>

                  <p className="text-slate-400 font-bold mb-6">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="text-left bg-white/5 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm mb-3">You visited:</p>
                    <ul className="text-white/60 text-sm space-y-1">
                      {LESSON_DATA.hotspots.map(h => (
                        <li key={h.id} className="flex items-center gap-2">
                          <span>{h.icon}</span>
                          <span>{h.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-500/10 border border-slate-500/30 rounded-xl p-4 mb-8 max-w-sm">
                    <p className="text-white/70 text-sm italic">
                      "We remember them not for how they died, but for how they lived - with courage, duty, and sacrifice."
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center mb-6"
                  >
                    <SkipForward size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Lesson Unlocked
                  </h2>

                  <p className="text-orange-400 font-medium mb-4">
                    You skipped some content
                  </p>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm">
                      Return to complete the full tour and earn <span className="text-slate-400 font-bold">+{LESSON_DATA.xpReward} XP</span>.
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <span>Progress:</span>
                <span className={`font-bold ${skippedScreens.size === 0 && isAnswerCorrect ? 'text-slate-400' : 'text-orange-400'}`}>
                  6 of 7 {skippedScreens.size > 0 || !isAnswerCorrect ? '(incomplete)' : ''}
                </span>
              </div>

              <motion.button
                onClick={handleComplete}
                className={`px-8 py-4 rounded-full font-bold text-lg ${
                  skippedScreens.size === 0 && isAnswerCorrect
                    ? 'bg-slate-500 text-white'
                    : 'bg-orange-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {skippedScreens.size === 0 && isAnswerCorrect ? 'Final Lesson' : 'Continue Anyway'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

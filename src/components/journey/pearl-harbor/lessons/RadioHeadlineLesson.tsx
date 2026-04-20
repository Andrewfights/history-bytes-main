/**
 * RadioHeadlineLesson - Lesson 4: Radio Break-In
 *
 * Screens:
 * 1. Intro - "Breaking news interrupts regular programming"
 * 2. Radio Broadcast - Vintage radio visual with audio simulation
 * 3. Tag the Facts - Tap WHERE/WHO/WHEN/WHAT as you hear them
 * 4. Headline Builder - Drag words to build a newspaper headline
 * 5. Completion - See actual December 7 headlines
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ArrowLeft, SkipForward, Radio, Newspaper, CheckCircle2, Volume2 } from 'lucide-react';
import { WW2Host } from '@/types';

interface RadioHeadlineLessonProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'intro' | 'radio' | 'facts' | 'headline' | 'completion';

// Lesson content
const LESSON_DATA = {
  title: 'Radio Break-In',
  subtitle: 'How America learned of the attack',
  xpReward: 45,
  broadcast: {
    intro: 'We interrupt this program to bring you a special news bulletin...',
    content: 'The Japanese have attacked Pearl Harbor, Hawaii, by air, President Roosevelt has just announced. The attack also was made on all naval and military activities on the principal island of Oahu.',
    announcer: 'John Daly, CBS News',
    time: '2:22 PM Eastern Time',
  },
  facts: [
    { id: 'who', label: 'WHO', answer: 'The Japanese', color: '#ef4444' },
    { id: 'what', label: 'WHAT', answer: 'Attacked', color: '#f59e0b' },
    { id: 'where', label: 'WHERE', answer: 'Pearl Harbor, Hawaii', color: '#22c55e' },
    { id: 'when', label: 'WHEN', answer: 'December 7, 1941', color: '#3b82f6' },
  ],
  headlineWords: [
    { id: '1', text: 'JAPAN', order: 1 },
    { id: '2', text: 'ATTACKS', order: 2 },
    { id: '3', text: 'PEARL', order: 3 },
    { id: '4', text: 'HARBOR', order: 4 },
  ],
  realHeadlines: [
    { paper: 'Honolulu Star-Bulletin', headline: 'WAR! OAHU BOMBED BY JAPANESE PLANES' },
    { paper: 'Los Angeles Times', headline: 'JAPAN ATTACKS U.S.! Hawaii, Philippines Bombed' },
    { paper: 'New York Times', headline: 'JAPAN WARS ON U.S. AND BRITAIN' },
  ],
};

export function RadioHeadlineLesson({ host, onComplete, onSkip, onBack }: RadioHeadlineLessonProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [broadcastProgress, setBroadcastProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [taggedFacts, setTaggedFacts] = useState<string[]>([]);
  const [headlineOrder, setHeadlineOrder] = useState(() =>
    [...LESSON_DATA.headlineWords].sort(() => Math.random() - 0.5)
  );
  const [isHeadlineCorrect, setIsHeadlineCorrect] = useState<boolean | null>(null);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());

  // Simulate broadcast progress
  useEffect(() => {
    if (screen === 'radio' && isPlaying && broadcastProgress < 100) {
      const interval = setInterval(() => {
        setBroadcastProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [screen, isPlaying, broadcastProgress]);

  const handleTagFact = (factId: string) => {
    if (!taggedFacts.includes(factId)) {
      setTaggedFacts(prev => [...prev, factId]);
    }
  };

  const checkHeadline = () => {
    const isCorrect = headlineOrder.every((word, index) => word.order === index + 1);
    setIsHeadlineCorrect(isCorrect);
  };

  const nextScreen = (wasSkipped: boolean = false) => {
    if (wasSkipped) {
      setSkippedScreens(prev => new Set([...prev, screen]));
    }

    const screens: Screen[] = ['intro', 'radio', 'facts', 'headline', 'completion'];
    const currentIndex = screens.indexOf(screen);
    if (currentIndex < screens.length - 1) {
      setScreen(screens[currentIndex + 1]);
    }
  };

  const handleComplete = () => {
    if (skippedScreens.size > 0 || !isHeadlineCorrect) {
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
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 4</h1>
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
          className="h-full bg-amber-500"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'intro' ? '0%' :
                   screen === 'radio' ? '25%' :
                   screen === 'facts' ? '50%' :
                   screen === 'headline' ? '75%' :
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
                className="w-32 h-32 rounded-2xl bg-gradient-to-br from-amber-900/50 to-amber-800/30 flex items-center justify-center mb-6 relative"
              >
                <Radio size={64} className="text-amber-400" />
                <motion.div
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-red-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-6">
                {LESSON_DATA.subtitle}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm text-left">
                <p className="text-amber-400 font-bold mb-2">{LESSON_DATA.broadcast.time}</p>
                <p className="text-white/80 text-sm mb-2">
                  Millions of Americans were listening to their radios on a quiet Sunday afternoon when the broadcast was suddenly interrupted...
                </p>
                <p className="text-white/50 text-xs italic">
                  "{LESSON_DATA.broadcast.intro}"
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
                  "This is how most Americans first learned of the attack. Listen carefully to the broadcast."
                </p>
              </div>

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-amber-500 text-black font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Listen to Broadcast
              </motion.button>
            </motion.div>
          )}

          {/* Radio Screen */}
          {screen === 'radio' && (
            <motion.div
              key="radio"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center px-6"
            >
              {/* Vintage Radio */}
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                className="w-64 h-48 rounded-2xl bg-gradient-to-b from-amber-900 to-amber-950 border-4 border-amber-800 mb-6 relative overflow-hidden"
              >
                {/* Radio dial */}
                <div className="absolute top-4 left-4 right-4 h-16 bg-amber-200/10 rounded-lg flex items-center justify-center">
                  <div className="w-full h-1 bg-amber-400/30 relative">
                    <motion.div
                      className="absolute top-1/2 -translate-y-1/2 w-1 h-4 bg-red-500"
                      animate={{ x: [0, 180, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </div>
                </div>

                {/* Speaker grille */}
                <div className="absolute bottom-4 left-4 right-4 h-20 bg-amber-950 rounded-lg">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-px bg-amber-700/50 mt-2" />
                  ))}
                </div>

                {/* ON indicator */}
                <motion.div
                  className="absolute top-4 right-4 w-3 h-3 rounded-full bg-green-500"
                  animate={{ opacity: isPlaying ? [1, 0.5, 1] : 0.3 }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              </motion.div>

              {/* Transcript */}
              <div className="bg-white/5 rounded-xl p-4 mb-4 max-w-sm w-full">
                <p className="text-white/50 text-xs mb-2">{LESSON_DATA.broadcast.announcer}</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {broadcastProgress > 10 && `"${LESSON_DATA.broadcast.intro}`}
                  {broadcastProgress > 40 && ` ${LESSON_DATA.broadcast.content}"`}
                </p>
              </div>

              {/* Play controls */}
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-14 h-14 rounded-full flex items-center justify-center ${
                    isPlaying ? 'bg-amber-500' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  <Volume2 size={24} className={isPlaying ? 'text-black' : 'text-white'} />
                </button>
                <div className="flex-1 w-48">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      style={{ width: `${broadcastProgress}%` }}
                    />
                  </div>
                </div>
              </div>

              {broadcastProgress >= 100 ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen()}
                  className="px-8 py-4 rounded-full bg-amber-500 text-black font-bold"
                >
                  Continue
                </motion.button>
              ) : (
                <button
                  onClick={() => nextScreen(true)}
                  className="px-4 py-2 rounded-full bg-white/10 text-white/60 text-sm hover:bg-white/20"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip
                </button>
              )}
            </motion.div>
          )}

          {/* Facts Screen */}
          {screen === 'facts' && (
            <motion.div
              key="facts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <h2 className="font-editorial text-xl font-bold text-white mb-2 text-center">
                The Key Facts
              </h2>
              <p className="text-white/60 text-sm mb-6 text-center">
                Tap each fact from the broadcast
              </p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {LESSON_DATA.facts.map((fact) => {
                  const isTagged = taggedFacts.includes(fact.id);
                  return (
                    <motion.button
                      key={fact.id}
                      onClick={() => handleTagFact(fact.id)}
                      disabled={isTagged}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isTagged
                          ? 'border-opacity-100 bg-opacity-20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                      style={{
                        borderColor: isTagged ? fact.color : undefined,
                        backgroundColor: isTagged ? `${fact.color}20` : undefined,
                      }}
                      whileHover={!isTagged ? { scale: 1.05 } : {}}
                      whileTap={!isTagged ? { scale: 0.95 } : {}}
                    >
                      <span
                        className="text-xs font-bold block mb-1"
                        style={{ color: fact.color }}
                      >
                        {fact.label}
                      </span>
                      <span className={`text-sm ${isTagged ? 'text-white' : 'text-white/50'}`}>
                        {isTagged ? fact.answer : '???'}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex-1" />

              {taggedFacts.length >= 4 ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen()}
                  className="w-full py-4 rounded-full bg-amber-500 text-black font-bold"
                >
                  Build the Headline
                </motion.button>
              ) : (
                <button
                  onClick={() => nextScreen(true)}
                  className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                >
                  <SkipForward size={16} className="inline mr-2" />
                  Skip
                </button>
              )}
            </motion.div>
          )}

          {/* Headline Builder Screen */}
          {screen === 'headline' && (
            <motion.div
              key="headline"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col px-6 py-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <Newspaper size={24} className="text-amber-400" />
                <div>
                  <h2 className="font-editorial text-xl font-bold text-white">
                    Build the Headline
                  </h2>
                  <p className="text-white/60 text-sm">
                    Drag words into the correct order
                  </p>
                </div>
              </div>

              {/* Newspaper mockup */}
              <div className="bg-amber-100 rounded-lg p-4 mb-6">
                <div className="text-center mb-2">
                  <span className="text-amber-900 text-xs font-bold">EXTRA EDITION</span>
                </div>

                {/* Draggable headline area */}
                <Reorder.Group
                  axis="x"
                  values={headlineOrder}
                  onReorder={setHeadlineOrder}
                  className="flex flex-wrap justify-center gap-2 min-h-[60px] p-2 bg-white rounded"
                >
                  {headlineOrder.map((word) => (
                    <Reorder.Item
                      key={word.id}
                      value={word}
                      className={`px-3 py-2 rounded font-bold text-lg cursor-grab active:cursor-grabbing ${
                        isHeadlineCorrect === null
                          ? 'bg-amber-200 text-amber-900'
                          : isHeadlineCorrect
                          ? 'bg-green-200 text-green-900'
                          : 'bg-red-200 text-red-900'
                      }`}
                      whileDrag={{ scale: 1.1, zIndex: 1 }}
                    >
                      {word.text}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>

              {/* Check/feedback */}
              {isHeadlineCorrect !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl mb-4 ${
                    isHeadlineCorrect
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  <p className={`font-bold mb-1 ${isHeadlineCorrect ? 'text-green-400' : 'text-red-400'}`}>
                    {isHeadlineCorrect ? 'Perfect!' : 'Not quite right'}
                  </p>
                  <p className="text-white/70 text-sm">
                    {isHeadlineCorrect
                      ? 'This headline was seen across America on December 7, 1941.'
                      : 'Try rearranging: JAPAN ATTACKS PEARL HARBOR'}
                  </p>
                </motion.div>
              )}

              <div className="flex-1" />

              {isHeadlineCorrect === true ? (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => nextScreen()}
                  className="w-full py-4 rounded-full bg-amber-500 text-black font-bold"
                >
                  See Real Headlines
                </motion.button>
              ) : isHeadlineCorrect === false ? (
                <button
                  onClick={() => {
                    setIsHeadlineCorrect(null);
                    setHeadlineOrder([...LESSON_DATA.headlineWords].sort(() => Math.random() - 0.5));
                  }}
                  className="w-full py-4 rounded-full bg-white/20 text-white font-bold"
                >
                  Try Again
                </button>
              ) : (
                <div className="space-y-3">
                  <motion.button
                    onClick={checkHeadline}
                    className="w-full py-4 rounded-full bg-amber-500 text-black font-bold"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Check Headline
                  </motion.button>
                  <button
                    onClick={() => nextScreen(true)}
                    className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                  >
                    <SkipForward size={16} className="inline mr-2" />
                    Skip
                  </button>
                </div>
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
              {skippedScreens.size === 0 && isHeadlineCorrect ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Extra! Extra!
                  </h2>

                  <p className="text-amber-400 font-bold mb-6">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="text-left bg-white/5 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm mb-3">Real headlines from December 7:</p>
                    {LESSON_DATA.realHeadlines.map((h, i) => (
                      <div key={i} className="mb-2 last:mb-0">
                        <p className="text-white/50 text-xs">{h.paper}</p>
                        <p className="text-white font-bold text-sm">"{h.headline}"</p>
                      </div>
                    ))}
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
                      Come back to complete the headline builder and earn <span className="text-amber-400 font-bold">+{LESSON_DATA.xpReward} XP</span>.
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <span>Progress:</span>
                <span className={`font-bold ${skippedScreens.size === 0 && isHeadlineCorrect ? 'text-amber-400' : 'text-orange-400'}`}>
                  4 of 7 {skippedScreens.size > 0 || !isHeadlineCorrect ? '(incomplete)' : ''}
                </span>
              </div>

              <motion.button
                onClick={handleComplete}
                className={`px-8 py-4 rounded-full font-bold text-lg ${
                  skippedScreens.size === 0 && isHeadlineCorrect
                    ? 'bg-amber-500 text-black'
                    : 'bg-orange-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {skippedScreens.size === 0 && isHeadlineCorrect ? 'Next Lesson' : 'Continue Anyway'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

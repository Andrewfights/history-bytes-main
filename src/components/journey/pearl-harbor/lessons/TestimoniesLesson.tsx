/**
 * TestimoniesLesson - Lesson 3: Voices from Pearl Harbor
 *
 * Screens:
 * 1. Intro - "Hear from those who were there"
 * 2. Testimony 1 - Sailor's account (USS Arizona survivor)
 * 3. Testimony 2 - Nurse's account (treating wounded)
 * 4. Testimony 3 - Civilian's account (Honolulu resident)
 * 5. Completion - Reflection on human cost
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, SkipForward, Play, Pause, Volume2, Users, Heart, Home, CheckCircle2 } from 'lucide-react';
import { WW2Host } from '@/types';

interface TestimoniesLessonProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

type Screen = 'intro' | 'testimony-1' | 'testimony-2' | 'testimony-3' | 'completion';

// Lesson content
const LESSON_DATA = {
  title: 'Voices from Pearl Harbor',
  subtitle: 'First-hand accounts from December 7, 1941',
  xpReward: 50,
  testimonies: [
    {
      id: 'sailor',
      name: 'Seaman First Class James Anderson',
      role: 'USS Arizona Survivor',
      avatar: '⚓',
      avatarBg: '#1e3a5f',
      icon: Users,
      quote: `I was below deck in the forward compartment when the first bomb hit. The whole ship shook like nothing I'd ever felt. I heard men yelling, saw smoke filling the corridors. I made it topside just as the magazine exploded. The heat was unbearable. I jumped into the water - oil was burning on the surface. I swam as hard as I could. When I looked back, the Arizona was gone. 1,177 of my shipmates... gone in minutes.`,
      question: 'Where was the sailor when the attack began?',
      choices: ['On deck watching the sunrise', 'Below deck in the forward compartment', 'On shore leave in Honolulu', 'In the ship\'s mess hall'],
      correctIndex: 1,
      explanation: 'Seaman Anderson was below deck in the forward compartment when the first bomb struck, which is why he survived - he was not near the magazine that exploded.',
    },
    {
      id: 'nurse',
      name: 'Lieutenant Ruth Erickson',
      role: 'Navy Nurse Corps',
      avatar: '🏥',
      avatarBg: '#5c1e3a',
      icon: Heart,
      quote: `The wounded started arriving before we even knew what happened. Burns, shrapnel wounds, men in shock. We ran out of beds within the first hour. We used the hallways, the lawn - anywhere we could put a stretcher. I worked for 36 hours straight. The hardest part wasn't the injuries - it was telling men that their friends didn't make it. Some of them were just boys, really. Eighteen, nineteen years old.`,
      question: 'What was the biggest challenge the nurses faced?',
      choices: ['Running out of medical supplies', 'The emotional toll of telling men about their lost friends', 'Finding enough doctors to help', 'Communicating with the patients'],
      correctIndex: 1,
      explanation: 'Lt. Erickson said the hardest part wasn\'t treating the physical injuries, but the emotional burden of telling wounded men that their friends had been killed.',
    },
    {
      id: 'civilian',
      name: 'Mary Tanaka',
      role: 'Honolulu Resident',
      avatar: '🏠',
      avatarBg: '#3a5c1e',
      icon: Home,
      quote: `We were getting ready for church when we heard the planes. At first, I thought it was just military exercises - we heard those all the time. Then we saw the smoke rising from Pearl Harbor. My husband said "Those are Japanese planes." I didn't believe him until I saw the red circles on the wings. Everything changed after that. The island went into lockdown. We had blackout curtains, curfews. And for us Japanese-Americans, the suspicion began immediately.`,
      question: 'How did Mary first react to the sound of planes?',
      choices: ['She immediately knew it was an attack', 'She thought it was military exercises', 'She ran to the shelter', 'She called the police'],
      correctIndex: 1,
      explanation: 'Like many civilians, Mary initially assumed the sounds were just routine military exercises, which were common in Hawaii. The reality of the attack only became clear when they saw the smoke and the Japanese insignia on the planes.',
    },
  ],
};

export function TestimoniesLesson({ host, onComplete, onSkip, onBack }: TestimoniesLessonProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentTestimonyIndex, setCurrentTestimonyIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [skippedScreens, setSkippedScreens] = useState<Set<Screen>>(new Set());
  const [showQuiz, setShowQuiz] = useState(false);

  const currentTestimony = LESSON_DATA.testimonies[currentTestimonyIndex];

  // Simulate reading/audio progress
  const handlePlay = () => {
    setIsPlaying(true);
    const interval = setInterval(() => {
      setReadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
          setShowQuiz(true);
          return 100;
        }
        return prev + 2;
      });
    }, 100);
  };

  const handleQuizAnswer = (index: number) => {
    setSelectedAnswer(index);
    const correct = index === currentTestimony.correctIndex;
    setIsAnswerCorrect(correct);
    if (correct) {
      setCorrectAnswers(prev => prev + 1);
    }
  };

  const nextScreen = (wasSkipped: boolean = false) => {
    if (wasSkipped) {
      setSkippedScreens(prev => new Set([...prev, screen]));
    }

    // Reset state for next testimony
    setSelectedAnswer(null);
    setIsAnswerCorrect(null);
    setReadProgress(0);
    setShowQuiz(false);
    setIsPlaying(false);

    if (screen === 'intro') {
      setScreen('testimony-1');
    } else if (screen === 'testimony-1') {
      setCurrentTestimonyIndex(1);
      setScreen('testimony-2');
    } else if (screen === 'testimony-2') {
      setCurrentTestimonyIndex(2);
      setScreen('testimony-3');
    } else if (screen === 'testimony-3') {
      setScreen('completion');
    }
  };

  const handleComplete = () => {
    if (skippedScreens.size > 0 || correctAnswers < 2) {
      onSkip();
    } else {
      onComplete(LESSON_DATA.xpReward);
    }
  };

  const handleSkipLesson = () => {
    onSkip();
  };

  const TestimonyIcon = currentTestimony?.icon || Users;

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">Lesson 3</h1>
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
          className="h-full bg-purple-500"
          initial={{ width: '0%' }}
          animate={{
            width: screen === 'intro' ? '0%' :
                   screen === 'testimony-1' ? '25%' :
                   screen === 'testimony-2' ? '50%' :
                   screen === 'testimony-3' ? '75%' :
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
                className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-900/50 to-purple-800/30 flex items-center justify-center mb-6 relative"
              >
                <Users size={64} className="text-purple-400" />
              </motion.div>

              <h1 className="font-editorial text-3xl font-bold text-white mb-2">
                {LESSON_DATA.title}
              </h1>
              <p className="text-white/60 mb-6">
                {LESSON_DATA.subtitle}
              </p>

              <div className="bg-white/5 rounded-xl p-4 mb-6 max-w-sm text-left">
                <p className="text-white/80 text-sm mb-4">
                  History isn't just about dates and battles. It's about the people who lived through them.
                </p>
                <div className="space-y-2">
                  {LESSON_DATA.testimonies.map((t, i) => (
                    <div key={t.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
                        style={{ backgroundColor: t.avatarBg }}
                      >
                        {t.avatar}
                      </div>
                      <span className="text-white/70 text-sm">{t.role}</span>
                    </div>
                  ))}
                </div>
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
                  "These are real accounts from survivors. Listen carefully - their stories deserve to be remembered."
                </p>
              </div>

              <motion.button
                onClick={() => nextScreen()}
                className="px-8 py-4 rounded-full bg-purple-500 text-white font-bold text-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hear Their Stories
              </motion.button>
            </motion.div>
          )}

          {/* Testimony Screens */}
          {(screen === 'testimony-1' || screen === 'testimony-2' || screen === 'testimony-3') && (
            <motion.div
              key={screen}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="flex-1 flex flex-col px-6 py-6"
            >
              {!showQuiz ? (
                <>
                  {/* Character Card */}
                  <div className="flex items-center gap-4 mb-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                      style={{ backgroundColor: currentTestimony.avatarBg }}
                    >
                      {currentTestimony.avatar}
                    </motion.div>
                    <div>
                      <h2 className="font-editorial text-lg font-bold text-white">
                        {currentTestimony.name}
                      </h2>
                      <p className="text-white/60 text-sm flex items-center gap-2">
                        <TestimonyIcon size={14} />
                        {currentTestimony.role}
                      </p>
                    </div>
                  </div>

                  {/* Transcript Card */}
                  <div className="flex-1 bg-white/5 rounded-xl p-4 mb-6 overflow-y-auto">
                    <div className="relative">
                      <p className="text-white/80 leading-relaxed text-sm">
                        "{currentTestimony.quote}"
                      </p>
                      {/* Reading progress overlay */}
                      {readProgress < 100 && (
                        <div
                          className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90"
                          style={{
                            top: `${readProgress}%`,
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Audio Controls */}
                  <div className="bg-white/5 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePlay}
                        disabled={isPlaying || readProgress >= 100}
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${
                          isPlaying ? 'bg-purple-500' : 'bg-white/20 hover:bg-white/30'
                        }`}
                      >
                        {isPlaying ? (
                          <Pause size={24} className="text-white" />
                        ) : (
                          <Play size={24} className="text-white ml-1" />
                        )}
                      </button>

                      <div className="flex-1">
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-purple-500"
                            style={{ width: `${readProgress}%` }}
                          />
                        </div>
                        <p className="text-white/50 text-xs mt-1">
                          {readProgress < 100 ? 'Tap play to listen' : 'Complete'}
                        </p>
                      </div>

                      <Volume2 size={20} className="text-white/40" />
                    </div>
                  </div>

                  {/* Skip button */}
                  {readProgress < 100 && (
                    <button
                      onClick={() => {
                        setShowQuiz(true);
                        setReadProgress(100);
                      }}
                      className="w-full py-3 rounded-full bg-white/10 text-white/60 font-medium hover:bg-white/20 transition-colors"
                    >
                      <SkipForward size={16} className="inline mr-2" />
                      Skip to Question
                    </button>
                  )}
                </>
              ) : (
                <>
                  {/* Quiz Section */}
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                      style={{ backgroundColor: currentTestimony.avatarBg }}
                    >
                      {currentTestimony.avatar}
                    </div>
                    <div>
                      <p className="text-white/60 text-sm">Question about</p>
                      <p className="text-white font-bold">{currentTestimony.name.split(' ').slice(-1)}'s testimony</p>
                    </div>
                  </div>

                  <h2 className="font-editorial text-xl font-bold text-white mb-6">
                    {currentTestimony.question}
                  </h2>

                  <div className="space-y-3 flex-1">
                    {currentTestimony.choices.map((choice, index) => (
                      <motion.button
                        key={index}
                        onClick={() => selectedAnswer === null && handleQuizAnswer(index)}
                        disabled={selectedAnswer !== null}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedAnswer === null
                            ? 'border-white/20 bg-white/5 hover:border-purple-400/50'
                            : selectedAnswer === index
                              ? isAnswerCorrect
                                ? 'border-green-500 bg-green-500/20'
                                : 'border-red-500 bg-red-500/20'
                              : index === currentTestimony.correctIndex
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
                          {isAnswerCorrect ? 'Correct!' : 'Not quite'}
                        </p>
                        <p className="text-white/70 text-sm">
                          {currentTestimony.explanation}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isAnswerCorrect !== null ? (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      onClick={() => nextScreen()}
                      className="w-full py-4 rounded-full bg-purple-500 text-white font-bold"
                    >
                      {screen === 'testimony-3' ? 'Finish' : 'Next Testimony'}
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
                </>
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
              {skippedScreens.size === 0 && correctAnswers >= 2 ? (
                <>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-6"
                  >
                    <CheckCircle2 size={48} className="text-white" />
                  </motion.div>

                  <h2 className="font-editorial text-2xl font-bold text-white mb-2">
                    Stories Remembered
                  </h2>

                  <p className="text-purple-400 font-bold mb-6">
                    +{LESSON_DATA.xpReward} XP
                  </p>

                  <div className="text-left bg-white/5 rounded-xl p-4 mb-8 max-w-sm">
                    <p className="text-white/80 text-sm mb-2">You heard from:</p>
                    <ul className="text-white/60 text-sm space-y-2">
                      {LESSON_DATA.testimonies.map(t => (
                        <li key={t.id} className="flex items-center gap-2">
                          <span>{t.avatar}</span>
                          <span>{t.role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-8 max-w-sm">
                    <p className="text-white/80 text-sm">
                      "Their voices remind us that behind every statistic was a human being with hopes, fears, and loved ones. This is why we remember."
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
                    You skipped some testimonies
                  </p>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6 max-w-sm">
                    <p className="text-white/80 text-sm">
                      You can proceed, but come back to hear all the stories and earn <span className="text-purple-400 font-bold">+{LESSON_DATA.xpReward} XP</span>.
                    </p>
                  </div>
                </>
              )}

              <div className="flex items-center gap-2 text-white/50 text-sm mb-8">
                <span>Progress:</span>
                <span className={`font-bold ${skippedScreens.size === 0 && correctAnswers >= 2 ? 'text-purple-400' : 'text-orange-400'}`}>
                  3 of 7 {skippedScreens.size > 0 || correctAnswers < 2 ? '(incomplete)' : ''}
                </span>
              </div>

              <motion.button
                onClick={handleComplete}
                className={`px-8 py-4 rounded-full font-bold text-lg ${
                  skippedScreens.size === 0 && correctAnswers >= 2
                    ? 'bg-purple-500 text-white'
                    : 'bg-orange-500 text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {skippedScreens.size === 0 && correctAnswers >= 2 ? 'Next Lesson' : 'Continue Anyway'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

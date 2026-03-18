/**
 * Beat 4: Voices from the Harbor - Stories of December 7
 * Format: Primary Source Moment (Perspective Carousel)
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Hear from those who lived through Pearl Harbor -
 * survivors, heroes, and witnesses from all sides.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, ChevronRight, User, Quote, CheckCircle2, XCircle } from 'lucide-react';
import { WW2Host } from '@/types';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useWW2ModuleAssets } from '../hooks/useWW2ModuleAssets';

type Screen = 'intro' | 'story-1' | 'quiz-1' | 'story-2' | 'quiz-2' | 'story-3' | 'quiz-3' | 'story-4' | 'quiz-4' | 'completion';
const SCREENS: Screen[] = ['intro', 'story-1', 'quiz-1', 'story-2', 'quiz-2', 'story-3', 'quiz-3', 'story-4', 'quiz-4', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-4',
  xpReward: 50,
};

interface Perspective {
  id: string;
  name: string;
  role: string;
  image: string;
  story: string[];
  quote: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const PERSPECTIVES: Perspective[] = [
  {
    id: 'stratton',
    name: 'Donald Stratton',
    role: 'USS Arizona Survivor',
    image: '👨‍✈️',
    story: [
      'Donald Stratton was just 18 years old, a Seaman First Class aboard the USS Arizona.',
      'When the bomb hit, he was engulfed in flames. He suffered burns over 60-70% of his body.',
      'Despite his injuries, he and five other sailors escaped by crawling hand-over-hand across a 70-foot rope to the USS Vestal.',
      'Stratton spent a year recovering, then RE-ENLISTED and served until 1944.',
      'He spent decades campaigning for Joe George, the sailor who threw them the rope, to receive the Bronze Star. George finally received it posthumously in 2017.',
    ],
    quote: "We weren't heroes. We were just kids doing what we had to do to survive.",
    quiz: {
      question: 'How did Donald Stratton escape the burning Arizona?',
      options: [
        'He jumped into the water and swam',
        'He crawled across a rope to another ship',
        'He was rescued by a small boat',
        'He climbed down a ladder',
      ],
      correctIndex: 1,
      explanation: 'Stratton and five others escaped by crawling across a 70-foot rope thrown from the USS Vestal, despite severe burns.',
    },
  },
  {
    id: 'miller',
    name: 'Doris Miller',
    role: 'USS West Virginia',
    image: '🎖️',
    story: [
      'Doris Miller was a Mess Attendant Third Class — one of the only positions open to African Americans in the segregated Navy.',
      'When the attack began, he was collecting laundry below decks on the USS West Virginia.',
      'Miller carried the mortally wounded Captain Mervyn Bennion to shelter, then manned an anti-aircraft machine gun.',
      'He had never been trained on the weapon. He fired until ammunition ran out — approximately 15 minutes.',
      'Miller became the first African American to receive the Navy Cross. He was killed in action in 1943.',
    ],
    quote: "It wasn't hard. I just pulled the trigger and she worked fine.",
    quiz: {
      question: 'What historic honor did Doris Miller receive?',
      options: [
        'Medal of Honor',
        'First African American to receive the Navy Cross',
        'Purple Heart',
        'Silver Star',
      ],
      correctIndex: 1,
      explanation: 'Doris Miller became the first African American to receive the Navy Cross for his heroic actions at Pearl Harbor.',
    },
  },
  {
    id: 'fox',
    name: 'Annie Fox',
    role: 'Chief Nurse, Hickam Field',
    image: '👩‍⚕️',
    story: [
      'First Lieutenant Annie Fox was the Chief Nurse at Hickam Field Hospital.',
      'When bombs began falling, she organized her nurses and began treating casualties under active attack.',
      'The hospital itself was hit during the bombing, but Fox kept her team working.',
      'She became the first woman to receive the Purple Heart in World War II.',
      'Her citation praised her "calmness, courage, and leadership" under fire.',
    ],
    quote: "There was no time to be afraid. There were men who needed us.",
    quiz: {
      question: 'What distinction did Annie Fox achieve in WWII?',
      options: [
        'First woman combat pilot',
        'First woman to receive the Purple Heart in WWII',
        'First woman ship captain',
        'First woman combat medic',
      ],
      correctIndex: 1,
      explanation: 'Annie Fox became the first woman to receive the Purple Heart in World War II for her courage at Hickam Field.',
    },
  },
  {
    id: 'abe',
    name: 'Zenji Abe',
    role: 'Japanese Dive Bomber Pilot',
    image: '🎌',
    story: [
      'Zenji Abe was a dive bomber pilot who flew from the carrier Akagi on December 7.',
      'He targeted the USS Raleigh during the attack, scoring hits on the light cruiser.',
      'After the war, Abe became an advocate for peace and reconciliation.',
      'He traveled to Pearl Harbor multiple times to meet with American survivors.',
      'Abe publicly apologized and worked to build bridges between former enemies.',
    ],
    quote: "We were soldiers following orders. But war itself is the real enemy.",
    quiz: {
      question: 'What did Zenji Abe dedicate himself to after the war?',
      options: [
        'Writing war memoirs',
        'Peace and reconciliation with Americans',
        'Japanese military history',
        'Aviation engineering',
      ],
      correctIndex: 1,
      explanation: 'Abe became a peace advocate, meeting with American survivors and working to build bridges between former enemies.',
    },
  },
];

interface VoicesFromHarborBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

// Map perspective IDs to media keys
const MEDIA_KEY_MAP: Record<string, string> = {
  stratton: 'donald-stratton-portrait',
  miller: 'doris-miller-portrait',
  fox: 'annie-fox-portrait',
  abe: 'zenji-abe-portrait',
};

export function VoicesFromHarborBeat({ host, onComplete, onSkip, onBack }: VoicesFromHarborBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number | null>>({});
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [skipped, setSkipped] = useState(false);

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();
  const { getMediaUrl } = useWW2ModuleAssets();

  // Helper to get uploaded portrait URL for a perspective
  const getPortraitUrl = (perspectiveId: string): string | null => {
    const mediaKey = MEDIA_KEY_MAP[perspectiveId];
    if (!mediaKey) return null;
    return getMediaUrl('ph-beat-4', mediaKey);
  };

  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.quizAnswers) {
          setQuizAnswers(checkpoint.state.quizAnswers);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { quizAnswers },
      });
    }
  }, [screen, quizAnswers, saveCheckpoint]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      setScreen(SCREENS[currentIndex + 1]);
      setShowQuizResult(false);
      // Update story index for story screens
      if (SCREENS[currentIndex + 1].startsWith('story-')) {
        const storyNum = parseInt(SCREENS[currentIndex + 1].split('-')[1]) - 1;
        setCurrentStoryIndex(storyNum);
      }
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete]);

  const handleQuizAnswer = (perspectiveId: string, answerIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [perspectiveId]: answerIndex }));
    setShowQuizResult(true);
  };

  const currentPerspective = PERSPECTIVES[currentStoryIndex];
  const isQuizScreen = screen.startsWith('quiz-');
  const quizPerspectiveIndex = isQuizScreen ? parseInt(screen.split('-')[1]) - 1 : 0;
  const quizPerspective = PERSPECTIVES[quizPerspectiveIndex];
  const selectedAnswer = quizAnswers[quizPerspective?.id];
  const isCorrect = selectedAnswer === quizPerspective?.quiz.correctIndex;

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Voices from the Harbor</h1>
          <p className="text-white/50 text-xs">Beat 4 of 10</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img src={host.avatarUrl || '/assets/hosts/default.png'} alt={host.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-amber-500" animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Quote size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Stories of December 7</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  History isn't just about dates and facts. It's about people. Meet four individuals whose lives were forever changed on that Sunday morning.
                </p>
                <div className="flex justify-center gap-4 mb-6">
                  {PERSPECTIVES.map((p) => {
                    const portraitUrl = getPortraitUrl(p.id);
                    return (
                      <div key={p.id} className="text-center">
                        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl mb-1 overflow-hidden">
                          {portraitUrl ? (
                            <img src={portraitUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            p.image
                          )}
                        </div>
                        <p className="text-white/50 text-xs">{p.name.split(' ')[1]}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-3">
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Hear Their Stories
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* STORY SCREENS */}
          {screen.startsWith('story-') && currentPerspective && (
            <motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 overflow-y-auto">
                {/* Profile */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center text-3xl overflow-hidden">
                    {getPortraitUrl(currentPerspective.id) ? (
                      <img src={getPortraitUrl(currentPerspective.id)!} alt={currentPerspective.name} className="w-full h-full object-cover" />
                    ) : (
                      currentPerspective.image
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{currentPerspective.name}</h3>
                    <p className="text-amber-400 text-sm">{currentPerspective.role}</p>
                  </div>
                </div>

                {/* Story paragraphs */}
                <div className="space-y-4 mb-6">
                  {currentPerspective.story.map((paragraph, index) => (
                    <motion.p
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.15 }}
                      className="text-white/80 leading-relaxed"
                    >
                      {paragraph}
                    </motion.p>
                  ))}
                </div>

                {/* Quote */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30"
                >
                  <Quote size={20} className="text-amber-400 mb-2" />
                  <p className="text-amber-200 italic">"{currentPerspective.quote}"</p>
                  <p className="text-white/50 text-sm mt-2">— {currentPerspective.name}</p>
                </motion.div>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                Quick Question <ChevronRight size={20} />
              </button>
            </motion.div>
          )}

          {/* QUIZ SCREENS */}
          {isQuizScreen && quizPerspective && (
            <motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-2xl mx-auto mb-3 overflow-hidden">
                    {getPortraitUrl(quizPerspective.id) ? (
                      <img src={getPortraitUrl(quizPerspective.id)!} alt={quizPerspective.name} className="w-full h-full object-cover" />
                    ) : (
                      quizPerspective.image
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white">{quizPerspective.quiz.question}</h3>
                </div>

                <div className="space-y-3">
                  {quizPerspective.quiz.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrectOption = index === quizPerspective.quiz.correctIndex;
                    const showResult = showQuizResult && isSelected;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => !showQuizResult && handleQuizAnswer(quizPerspective.id, index)}
                        disabled={showQuizResult}
                        className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                          showResult
                            ? isCorrectOption
                              ? 'bg-green-500/20 border-2 border-green-500'
                              : 'bg-red-500/20 border-2 border-red-500'
                            : showQuizResult && isCorrectOption
                            ? 'bg-green-500/20 border-2 border-green-500'
                            : 'bg-white/5 border border-white/10 hover:border-amber-500/50'
                        }`}
                        whileTap={!showQuizResult ? { scale: 0.98 } : {}}
                      >
                        <span className="flex-1 text-white">{option}</span>
                        {showQuizResult && isCorrectOption && <CheckCircle2 size={20} className="text-green-400" />}
                        {showResult && !isCorrectOption && <XCircle size={20} className="text-red-400" />}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation */}
                <AnimatePresence>
                  {showQuizResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}
                    >
                      <p className={`font-bold mb-1 ${isCorrect ? 'text-green-400' : 'text-amber-400'}`}>
                        {isCorrect ? 'Correct!' : 'Not quite'}
                      </p>
                      <p className="text-white/70 text-sm">{quizPerspective.quiz.explanation}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {showQuizResult && (
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  {quizPerspectiveIndex < PERSPECTIVES.length - 1 ? 'Next Story' : 'Complete'}
                </button>
              )}
            </motion.div>
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <motion.div key="completion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">🎙️</motion.div>
                <h2 className="text-2xl font-bold text-white mb-2">Beat 4 Complete!</h2>
                <p className="text-white/60 mb-6">Voices from the Harbor</p>
                <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                  <Sparkles className="text-amber-400" />
                  <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
                </div>
                <p className="text-white/50 text-sm text-center max-w-sm">
                  Next: Breaking News - How America heard the news on that Sunday
                </p>
              </div>
              <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                Continue
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

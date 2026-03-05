/**
 * FirstPersonPOV - Hook 7: Jack Holder's first-person account with quiz checkpoints
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward, HelpCircle } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface FirstPersonPOVProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface StorySegment {
  id: string;
  text: string;
  duration: number;
  quiz?: {
    question: string;
    options: { text: string; correct: boolean }[];
    explanation: string;
  };
}

const STORY_SEGMENTS: StorySegment[] = [
  {
    id: '1',
    text: "I was at Hickam Field that Sunday morning. It was supposed to be a quiet day. I'd just finished breakfast in the mess hall when I heard a sound I'll never forget.",
    duration: 8,
    quiz: {
      question: "What was Jack's first warning of the attack?",
      options: [
        { text: "A loud explosion", correct: true },
        { text: "Air raid sirens", correct: false },
        { text: "Radio announcement", correct: false },
        { text: "Someone shouting", correct: false },
      ],
      explanation: "Most servicemen's first warning was the sound of bombs and explosions, not sirens.",
    },
  },
  {
    id: '2',
    text: "A bomb hit about 100 yards from where I stood. The ground shook. I looked up and saw planes with red circles on their wings - the Rising Sun of Japan.",
    duration: 8,
    quiz: {
      question: "How did Jack identify the planes as Japanese?",
      options: [
        { text: "The plane models", correct: false },
        { text: "Red circles (Rising Sun) on wings", correct: true },
        { text: "Radio communication", correct: false },
        { text: "The direction they came from", correct: false },
      ],
      explanation: "The red 'meatball' (Hinomaru) on Japanese aircraft was the clearest identifier.",
    },
  },
  {
    id: '3',
    text: "My instincts kicked in. I ran to the nearest gun emplacement - a .50 caliber machine gun. Another airman was already there, trying to get it working.",
    duration: 7,
  },
  {
    id: '4',
    text: "We started firing at the low-flying planes. I remember seeing the pilots' faces - they were that close. One plane banked so low I could see the pilot looking right at me.",
    duration: 9,
    quiz: {
      question: "How close were the Japanese planes flying?",
      options: [
        { text: "High altitude (10,000+ feet)", correct: false },
        { text: "Medium altitude (5,000 feet)", correct: false },
        { text: "Low enough to see pilots' faces", correct: true },
        { text: "They stayed over the harbor", correct: false },
      ],
      explanation: "The attackers flew extremely low to avoid detection and improve accuracy.",
    },
  },
  {
    id: '5',
    text: "The attack lasted nearly two hours. When it was over, I looked around and couldn't believe what I saw. Hickam Field was in ruins. Good friends were gone.",
    duration: 8,
    quiz: {
      question: "How long did the Pearl Harbor attack last?",
      options: [
        { text: "30 minutes", correct: false },
        { text: "1 hour", correct: false },
        { text: "Nearly 2 hours", correct: true },
        { text: "All day", correct: false },
      ],
      explanation: "The attack came in two waves and lasted from 7:48 AM to 9:45 AM - about 2 hours.",
    },
  },
  {
    id: '6',
    text: "I served the rest of the war with one thought in my mind - remember December 7th. Remember the friends we lost. Make sure it was never forgotten.",
    duration: 8,
  },
];

const DEFAULT_HOST: WW2Host = {
  id: 'soldier',
  name: 'Sergeant Mitchell',
  title: 'U.S. Army Infantryman',
  era: '1941-1945',
  specialty: 'Combat Veteran',
  primaryColor: '#3d5c3d',
  avatar: '🪖',
  voiceStyle: 'determined',
  description: '',
};

export function FirstPersonPOV({ onComplete, onBack, host = DEFAULT_HOST }: FirstPersonPOVProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeInSegment, setTimeInSegment] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dialogue = getHostDialogue(host.id, 'first-person') || getHostDialogue('soldier', 'first-person')!;

  const segment = STORY_SEGMENTS[currentSegment];
  const hasQuiz = segment?.quiz;

  // Simulate audio/video playback
  useState(() => {
    if (!isPlaying || !segment) return;

    const timer = setInterval(() => {
      setTimeInSegment(prev => {
        if (prev >= segment.duration) {
          setIsPlaying(false);
          if (segment.quiz) {
            setShowQuiz(true);
          } else {
            advanceToNext();
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  // Handle timer
  useState(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeInSegment(prev => {
        if (prev >= segment.duration) {
          clearInterval(timer);
          setIsPlaying(false);
          if (segment.quiz) {
            setShowQuiz(true);
          } else {
            advanceToNext();
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  });

  const advanceToNext = () => {
    if (currentSegment < STORY_SEGMENTS.length - 1) {
      setCurrentSegment(prev => prev + 1);
      setTimeInSegment(0);
      setShowQuiz(false);
      setSelectedAnswer(null);
      setIsPlaying(true);
    } else {
      setGameState('results');
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);

    // Simulate playback
    const timer = setInterval(() => {
      setTimeInSegment(prev => {
        if (prev >= segment.duration) {
          clearInterval(timer);
          setIsPlaying(false);
          if (segment.quiz) {
            setShowQuiz(true);
          } else {
            setTimeout(advanceToNext, 1500);
          }
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = segment.quiz!.options[index].correct;

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
    } else {
      setFeedback(segment.quiz!.explanation);
    }

    setTimeout(() => {
      setFeedback(null);
      advanceToNext();
    }, 3000);
  };

  const handleSkip = () => {
    setIsPlaying(false);
    if (segment.quiz) {
      setShowQuiz(true);
    } else {
      advanceToNext();
    }
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Eyewitness Account"
        onStart={() => {
          setGameState('playing');
          handlePlay();
        }}
      />
    );
  }

  if (gameState === 'results') {
    const quizCount = STORY_SEGMENTS.filter(s => s.quiz).length;

    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Eyewitness Account"
        stats={{
          score,
          total: quizCount,
          xpEarned: 45,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentSegment(0);
          setScore(0);
          setTimeInSegment(0);
          setShowQuiz(false);
          setSelectedAnswer(null);
          setGameState('playing');
          setTimeout(handlePlay, 500);
        }}
      />
    );
  }

  const progress = (timeInSegment / segment.duration) * 100;

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Eyewitness</h1>
        <div className="text-white/60 text-sm">{currentSegment + 1}/{STORY_SEGMENTS.length}</div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex gap-1">
          {STORY_SEGMENTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentSegment ? 'bg-green-500' : i === currentSegment ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4"
          >
            <HostFeedback
              host={host}
              text={feedback}
              type={selectedAnswer !== null && segment.quiz?.options[selectedAnswer].correct ? 'correct' : 'info'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Speaker */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-900/50 to-slate-800 flex items-center justify-center border-2 border-amber-500/30">
              <span className="text-3xl">👨</span>
            </div>
            <div>
              <p className="text-white font-medium">Jack Holder</p>
              <p className="text-white/50 text-sm">Hickam Field, December 7, 1941</p>
            </div>
          </div>

          {/* Story text */}
          <div className="bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-white/90 text-lg leading-relaxed italic">
              "{segment.text}"
            </p>

            {/* Playback progress */}
            {isPlaying && (
              <div className="mt-6">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/40">{timeInSegment}s / {segment.duration}s</span>
                  <button onClick={handleSkip} className="text-white/60 hover:text-white">
                    <SkipForward size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Play button when paused */}
            {!isPlaying && !showQuiz && timeInSegment < segment.duration && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handlePlay}
                className="mt-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 mx-auto"
              >
                <Play size={16} />
                <span>Continue</span>
              </motion.button>
            )}
          </div>

          {/* Quiz */}
          <AnimatePresence>
            {showQuiz && segment.quiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle size={18} className="text-amber-400" />
                  <p className="text-amber-400 text-sm font-medium">Quick Check</p>
                </div>

                <p className="text-white/90 mb-4">{segment.quiz.question}</p>

                <div className="space-y-2">
                  {segment.quiz.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = option.correct;
                    const showResult = selectedAnswer !== null;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => handleAnswer(index)}
                        disabled={selectedAnswer !== null}
                        whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                        whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${
                          showResult && isCorrect
                            ? 'bg-green-500/30 border-green-500'
                            : showResult && isSelected && !isCorrect
                            ? 'bg-red-500/30 border-red-500'
                            : 'bg-white/10 border-white/20 hover:bg-white/20'
                        }`}
                      >
                        <span className="text-white/90">{option.text}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Host indicator */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-center gap-2">
        <span className="text-lg">{host.avatar}</span>
        <span className="text-white/60 text-sm">
          {hasQuiz ? "Quiz checkpoint ahead..." : "Listen carefully..."}
        </span>
      </div>
    </div>
  );
}

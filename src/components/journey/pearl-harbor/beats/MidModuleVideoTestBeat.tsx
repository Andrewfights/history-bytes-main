/**
 * Mid-Module Video Test Beat - Knowledge Check with Video
 * Format: 5 questions with 16:9 host video + answers below (like Final Exam)
 * XP: 50 | Duration: 4-5 min
 *
 * This beat uses the game show format with videos per question per host.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X, Sparkles, CheckCircle, XCircle, Brain, Volume2, VolumeX, Clock } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import {
  subscribeToWW2ModuleAssets,
  type PreModuleVideoConfig,
  type PostModuleVideoConfig,
  type MidModuleTestQuestion,
  type MidModuleTestHostVideos,
} from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'pre-video' | 'intro' | 'quiz' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'intro', 'quiz', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-5-5',
  xpReward: 50,
};

// Default questions (can be overridden via Firestore admin)
const DEFAULT_QUESTIONS: MidModuleTestQuestion[] = [
  {
    id: 'mmt-q1',
    question: 'How did most Americans first learn about the attack on Pearl Harbor?',
    options: [
      'Newspapers the next day',
      'Radio broadcasts interrupting programs',
      'Letters from soldiers',
      'Movie theater newsreels',
    ],
    correctIndex: 1,
    explanation: 'Radio networks like CBS, NBC, and MBS interrupted their regular Sunday programming to announce the attack, reaching millions of Americans within minutes.',
    timerDuration: 30,
  },
  {
    id: 'mmt-q2',
    question: 'What made the spread of news about Pearl Harbor unprecedented?',
    options: [
      'It was the first war ever reported',
      'Most Americans had telephones',
      'Millions heard it almost instantly via radio',
      'It was announced by the military only',
    ],
    correctIndex: 2,
    explanation: 'By 1941, over 30 million American homes had radios. For the first time in history, news of an attack reached the entire nation within hours.',
    timerDuration: 30,
  },
  {
    id: 'mmt-q3',
    question: 'What did radar operators detect on the morning of the attack?',
    options: [
      'A submarine fleet',
      'A small training squadron',
      'A large formation of incoming aircraft',
      'A weather anomaly',
    ],
    correctIndex: 2,
    explanation: "Privates Lockard and Elliott at Opana Point detected a massive formation of aircraft over 100 miles away, but their warning was dismissed as a scheduled flight of American B-17s.",
    timerDuration: 30,
  },
  {
    id: 'mmt-q4',
    question: 'What key word did Franklin D. Roosevelt add to his speech?',
    options: [
      'Victory',
      'Honor',
      'Infamy',
      'Freedom',
    ],
    correctIndex: 2,
    explanation: 'FDR personally edited his speech, changing "a date which will live in world history" to "a date which will live in infamy." This single word change made the line iconic.',
    timerDuration: 30,
  },
  {
    id: 'mmt-q5',
    question: "What was the main purpose of Roosevelt's speech to Congress?",
    options: [
      'To announce a peace agreement',
      'To ask Congress to declare war',
      'To introduce new military leaders',
      'To explain the attack in detail',
    ],
    correctIndex: 1,
    explanation: 'The "Day of Infamy" speech was a formal request for Congress to declare war on Japan. Congress approved the declaration within an hour, with only one dissenting vote.',
    timerDuration: 30,
  },
];

interface MidModuleVideoTestBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function MidModuleVideoTestBeat({ host, onComplete, onSkip, onBack, isPreview = false }: MidModuleVideoTestBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);

  // Questions and videos from Firestore
  const [questions, setQuestions] = useState<MidModuleTestQuestion[]>(DEFAULT_QUESTIONS);
  const [questionVideos, setQuestionVideos] = useState<Record<string, MidModuleTestHostVideos>>({});

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Map host.id to video host id (soldier -> sergeant mapping)
  const getVideoHostId = useCallback((hostId: string): string => {
    if (hostId === 'soldier') return 'sergeant';
    return hostId;
  }, []);

  // Get video for current question and host
  const currentVideoUrl = useMemo(() => {
    const q = questions[currentQuestion];
    if (!q) return null;
    const videoHostId = getVideoHostId(host.id);
    return questionVideos[q.id]?.[videoHostId]?.videoUrl || null;
  }, [questions, currentQuestion, questionVideos, host.id, getVideoHostId]);

  // Restore checkpoint on mount
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
        if (checkpoint.state?.currentQuestion !== undefined) {
          setCurrentQuestion(checkpoint.state.currentQuestion);
        }
        if (checkpoint.state?.score !== undefined) {
          setScore(checkpoint.state.score);
        }
      }
    }
  }, []);

  // Save checkpoint on screen change
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: {
          currentQuestion,
          score,
        },
      });
    }
  }, [hasLoadedConfig, screen, currentQuestion, score, saveCheckpoint]);

  // Subscribe to Firestore for videos and questions
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      // Pre/post module videos
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }

      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        setPostModuleVideoConfig(postModuleVideo);
      } else {
        setPostModuleVideoConfig(null);
      }

      // Question videos
      if (assets?.midModuleTestVideos) {
        setQuestionVideos(assets.midModuleTestVideos);
      }

      // Custom questions (if set)
      if (assets?.midModuleTestQuestions && assets.midModuleTestQuestions.length > 0) {
        setQuestions(assets.midModuleTestQuestions);
      }

      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // Set initial screen based on pre-module video availability
  useEffect(() => {
    if (hasLoadedConfig && screen === 'intro') {
      const checkpoint = getCheckpoint();
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextScreenIndex = currentIndex + 1;
      // Skip post-video if not configured
      if (SCREENS[nextScreenIndex] === 'post-video' && !postModuleVideoConfig?.enabled) {
        nextScreenIndex++;
      }
      if (nextScreenIndex < SCREENS.length) {
        setScreen(SCREENS[nextScreenIndex]);
      } else {
        clearCheckpoint();
        onComplete(skipped ? 0 : LESSON_DATA.xpReward);
      }
    } else {
      clearCheckpoint();
      const earnedXP = skipped ? 0 : LESSON_DATA.xpReward;
      onComplete(earnedXP);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig]);

  // Get current question's timer duration (default 30 seconds)
  const currentTimerDuration = useMemo(() => {
    const q = questions[currentQuestion];
    return q?.timerDuration || 30;
  }, [questions, currentQuestion]);

  // Reset timer when question changes
  useEffect(() => {
    if (screen === 'quiz' && !hasAnswered) {
      setTimeRemaining(currentTimerDuration);
    }
  }, [currentQuestion, screen, hasAnswered, currentTimerDuration]);

  // Timer countdown
  useEffect(() => {
    if (screen !== 'quiz' || hasAnswered || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - auto-submit with no answer or selected answer
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, hasAnswered, timeRemaining]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (screen === 'quiz' && timeRemaining === 0 && !hasAnswered) {
      // Force submit - mark as answered without adding to score
      setHasAnswered(true);
    }
  }, [screen, timeRemaining, hasAnswered]);

  const handleAnswerSelect = (index: number) => {
    if (hasAnswered) return;
    setSelectedAnswer(index);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setHasAnswered(true);

    const currentQ = questions[currentQuestion];
    if (selectedAnswer === currentQ.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setHasAnswered(false);
    } else {
      nextScreen();
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    onSkip();
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect score! You've been paying attention!";
    if (percentage >= 80) return 'Excellent! You know your Pearl Harbor history.';
    if (percentage >= 60) return 'Good job! Keep learning.';
    return "Don't worry - the journey continues!";
  };

  const currentQ = questions[currentQuestion];

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Knowledge Check</h1>
          <p className="text-white/50 text-xs">Mid-Module Test</p>
        </div>
        <button
          onClick={handleSkip}
          className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-white/10">
        <motion.div
          className="h-full bg-amber-500"
          initial={{ width: 0 }}
          animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Knowledge Check"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO SCREEN */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6"
            >
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
                >
                  <Brain size={40} className="text-amber-400" />
                </motion.div>

                <h2 className="text-2xl font-bold text-white mb-4">
                  Pop Quiz Time!
                </h2>

                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  Hope you've been paying attention, soldier. Let's see how much you've learned about Pearl Harbor so far.
                </p>

                <div className="bg-white/5 rounded-xl p-4 max-w-sm border border-white/10 mb-6">
                  <div className="flex items-center justify-center gap-4 text-white/60 text-sm">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-400">{questions.length}</p>
                      <p>Questions</p>
                    </div>
                    <div className="h-8 w-px bg-white/20" />
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-400">{LESSON_DATA.xpReward}</p>
                      <p>XP Reward</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Start Quiz
                </button>
              </div>
            </motion.div>
          )}

          {/* QUIZ SCREEN - Video + Answers */}
          {screen === 'quiz' && currentQ && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Video Section - 16:9 aspect ratio */}
              <div className="shrink-0 bg-black relative overflow-hidden flex items-center justify-center" style={{ maxHeight: '30vh' }}>
                <div className="w-full h-full max-h-[30vh] aspect-video relative">
                  {currentVideoUrl ? (
                    <video
                      key={currentQ.id}
                      src={currentVideoUrl}
                      autoPlay
                      loop
                      muted={isVideoMuted}
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-900/30 via-slate-900 to-slate-950 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style={{ backgroundColor: host.primaryColor }}>
                        {host.avatar}
                      </div>
                    </div>
                  )}

                  {/* Question counter overlay */}
                  <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/60 rounded">
                    <span className="text-white text-xs font-medium">
                      Q{currentQuestion + 1}/{questions.length}
                    </span>
                  </div>

                  {/* Timer overlay */}
                  {!hasAnswered && (
                    <motion.div
                      className={`absolute bottom-2 left-2 px-2.5 py-1 rounded flex items-center gap-1.5 ${
                        timeRemaining <= 5 ? 'bg-red-500/80' : timeRemaining <= 10 ? 'bg-amber-500/80' : 'bg-black/60'
                      }`}
                      animate={timeRemaining <= 5 ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 0.5 }}
                    >
                      <Clock size={12} className="text-white" />
                      <span className={`text-xs font-bold ${timeRemaining <= 5 ? 'text-white' : 'text-white/90'}`}>
                        {timeRemaining}s
                      </span>
                    </motion.div>
                  )}

                  {/* Score overlay */}
                  <div className="absolute top-2 right-2 px-2.5 py-1 bg-black/60 rounded">
                    <span className="text-amber-400 text-xs font-medium">
                      {score}/{currentQuestion + (hasAnswered ? 1 : 0)}
                    </span>
                  </div>

                  {/* Mute button */}
                  {currentVideoUrl && (
                    <button
                      onClick={() => setIsVideoMuted(!isVideoMuted)}
                      className="absolute bottom-2 right-2 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
                    >
                      {isVideoMuted ? (
                        <VolumeX size={16} className="text-white/70" />
                      ) : (
                        <Volume2 size={16} className="text-white" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Question + Options */}
              <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                {/* Question progress dots */}
                <div className="flex gap-1 mb-4">
                  {questions.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1 flex-1 rounded-full ${
                        idx < currentQuestion
                          ? 'bg-amber-500'
                          : idx === currentQuestion
                          ? 'bg-amber-500/50'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>

                {/* Question */}
                <motion.div
                  key={currentQ.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 rounded-lg p-3 border border-white/10 mb-4"
                >
                  <p className="text-white text-sm leading-relaxed">
                    {currentQ.question}
                  </p>
                </motion.div>

                {/* Options */}
                <div className="space-y-2 flex-1">
                  {currentQ.options.map((option, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === currentQ.correctIndex;
                    const showResult = hasAnswered;

                    let bgColor = 'bg-white/5 border-white/10';
                    if (isSelected && !showResult) {
                      bgColor = 'bg-amber-500/20 border-amber-500/50';
                    } else if (showResult) {
                      if (isCorrect) {
                        bgColor = 'bg-green-500/20 border-green-500/50';
                      } else if (isSelected && !isCorrect) {
                        bgColor = 'bg-red-500/20 border-red-500/50';
                      }
                    }

                    return (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        onClick={() => handleAnswerSelect(idx)}
                        disabled={hasAnswered}
                        className={`w-full p-3 rounded-xl border text-left transition-all ${bgColor} ${
                          !hasAnswered ? 'hover:bg-white/10 active:bg-white/15' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 text-xs font-medium shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="text-white text-sm flex-1">{option}</span>
                          {showResult && isCorrect && (
                            <CheckCircle size={18} className="text-green-400 shrink-0" />
                          )}
                          {showResult && isSelected && !isCorrect && (
                            <XCircle size={18} className="text-red-400 shrink-0" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation after answering */}
                {hasAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-white/5 rounded-xl border border-white/10"
                  >
                    <p className="text-white/70 text-sm">{currentQ.explanation}</p>
                  </motion.div>
                )}

                {/* Action button */}
                <div className="mt-4" style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 0.5rem))' }}>
                  {!hasAnswered ? (
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className={`w-full py-3.5 font-bold rounded-xl transition-colors ${
                        selectedAnswer !== null
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-white/10 text-white/30'
                      }`}
                    >
                      Submit Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                    >
                      {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Knowledge Check"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION SCREEN */}
          {screen === 'completion' && (
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6 items-center justify-center"
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl mb-6"
              >
                {score === questions.length ? '🏆' : score >= questions.length * 0.6 ? '🎯' : '📚'}
              </motion.div>

              <h2 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h2>
              <p className="text-white/60 mb-4">Mid-Module Knowledge Check</p>

              {/* Score display */}
              <div className="bg-white/5 rounded-2xl p-6 mb-6 border border-white/10 text-center max-w-sm">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className={`text-4xl font-bold ${
                    score === questions.length ? 'text-green-400' :
                    score >= questions.length * 0.6 ? 'text-amber-400' : 'text-red-400'
                  }`}>
                    {score}/{questions.length}
                  </span>
                </div>
                <p className="text-white/70 text-sm">{getScoreMessage()}</p>
              </div>

              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">
                  +{skipped ? 0 : LESSON_DATA.xpReward} XP
                </span>
              </div>

              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Day of Infamy - Analyze FDR's historic speech
              </p>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button
                  onClick={() => nextScreen()}
                  className="mt-6 w-full max-w-sm py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

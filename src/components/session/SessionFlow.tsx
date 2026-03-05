import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { LessonCardView } from '@/components/session/LessonCardView';
import { QuizView } from '@/components/session/QuizView';
import { ResultsView } from '@/components/session/ResultsView';
import { mockLessonCards, mockQuestions } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import { useLiveGuide } from '@/hooks/useLiveData';
import { Question } from '@/types';

type SessionPhase = 'intro' | 'lessons' | 'quiz' | 'results';

interface MissedQuestion {
  question: Question;
  userAnswer: number;
}

interface SessionFlowProps {
  sessionId: string;
  topicTitle: string;
  onClose: () => void;
  onNextSession: () => void;
}

// Guide Intro Component
function GuideIntro({
  guideId,
  topicTitle,
  onContinue
}: {
  guideId: string | null;
  topicTitle: string;
  onContinue: () => void;
}) {
  const guide = useLiveGuide(guideId || '');
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSkip, setShowSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasIntroVideo = guide?.introVideoUrl;

  useEffect(() => {
    // Show skip button after 2 seconds
    const timer = setTimeout(() => setShowSkip(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto-play video
    if (hasIntroVideo && videoRef.current) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [hasIntroVideo]);

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Auto-continue after video ends
    setTimeout(onContinue, 500);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  // If no guide or no video, show a simple intro message
  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="font-editorial text-2xl font-bold mb-4">Starting Lesson</h2>
          <p className="text-muted-foreground mb-8">{topicTitle}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2"
          >
            Begin <ChevronRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300' },
  };
  const colors = colorMap[guide.primaryColor] || colorMap.amber;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {/* Guide Avatar/Video */}
        <div className={`relative w-32 h-32 mx-auto rounded-full overflow-hidden ${colors.bg} border-2 ${colors.border} mb-6`}>
          {hasIntroVideo ? (
            <>
              <video
                ref={videoRef}
                src={guide.introVideoUrl}
                className="w-full h-full object-cover"
                muted={isMuted}
                playsInline
                onEnded={handleVideoEnded}
              />
              {isPlaying && (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-1 right-1 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                >
                  {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
                </button>
              )}
              {!isPlaying && (
                <button
                  onClick={() => {
                    videoRef.current?.play().then(() => setIsPlaying(true)).catch(console.error);
                  }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={18} className="text-primary ml-0.5" fill="currentColor" />
                  </div>
                </button>
              )}
            </>
          ) : guide.imageUrl ? (
            <img src={guide.imageUrl} alt={guide.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {guide.avatar}
            </div>
          )}
        </div>

        {/* Guide Message */}
        <h2 className="font-editorial text-xl font-bold mb-2">{guide.name}</h2>
        <p className={`text-sm ${colors.text} mb-4`}>{guide.title}</p>
        <p className="text-muted-foreground text-sm italic mb-6">
          "Let's explore {topicTitle} together."
        </p>

        {/* Continue Button */}
        <AnimatePresence>
          {(showSkip || !hasIntroVideo) && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center gap-2 mx-auto"
            >
              Start Lesson <ChevronRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function SessionFlow({ sessionId, topicTitle, onClose, onNextSession }: SessionFlowProps) {
  const { addXP, selectedGuideId } = useApp();
  const [phase, setPhase] = useState<SessionPhase>('intro');
  const [startTime] = useState(Date.now());
  const [quizScore, setQuizScore] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState('0:00');
  const [xpEarned, setXpEarned] = useState(0);
  const [missedQuestions, setMissedQuestions] = useState<MissedQuestion[]>([]);

  // Filter cards and questions by session
  const cards = mockLessonCards.filter(c => c.sessionId === sessionId || sessionId === 's1');
  const questions = mockQuestions.filter(q => q.sessionId === sessionId || sessionId === 's1');

  useEffect(() => {
    if (phase === 'results') {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      setTimeElapsed(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
  }, [phase, startTime]);

  const handleIntroComplete = () => {
    setPhase('lessons');
  };

  const handleLessonsComplete = () => {
    setPhase('quiz');
  };

  const handleQuizComplete = (score: number, userAnswers: number[]) => {
    setQuizScore(score);

    // Build missed questions list
    const missed: MissedQuestion[] = [];
    questions.forEach((question, index) => {
      const userAnswer = userAnswers[index];
      if (userAnswer !== question.answer) {
        missed.push({ question, userAnswer });
      }
    });
    setMissedQuestions(missed);

    const xp = Math.round((score / questions.length) * 50);
    setXpEarned(xp);
    addXP(xp);
    setPhase('results');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background z-50 overflow-auto"
    >
      {/* Close button (only show during lessons/quiz/intro) */}
      {phase !== 'results' && (
        <button
          onClick={onClose}
          className="fixed top-4 right-4 z-10 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:border-primary/50 transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GuideIntro
              guideId={selectedGuideId}
              topicTitle={topicTitle}
              onContinue={handleIntroComplete}
            />
          </motion.div>
        )}

        {phase === 'lessons' && (
          <motion.div
            key="lessons"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <LessonCardView
              cards={cards}
              topicTitle={topicTitle}
              onComplete={handleLessonsComplete}
            />
          </motion.div>
        )}

        {phase === 'quiz' && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <QuizView
              questions={questions}
              onComplete={handleQuizComplete}
            />
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ResultsView
              score={quizScore}
              totalQuestions={questions.length}
              timeElapsed={timeElapsed}
              xpEarned={xpEarned}
              missedQuestions={missedQuestions}
              onNextSession={onNextSession}
              onGoHome={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

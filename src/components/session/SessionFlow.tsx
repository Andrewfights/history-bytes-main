import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Volume2, VolumeX, ChevronRight, Clock, BookOpen } from 'lucide-react';
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

// Opening Slide Component - New Design v3
function GuideIntro({
  guideId,
  topicTitle,
  onContinue,
  lessonNumber = 1,
  unitTitle = 'Unit I'
}: {
  guideId: string | null;
  topicTitle: string;
  onContinue: () => void;
  lessonNumber?: number;
  unitTitle?: string;
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

  // If no guide, show a simple intro message
  if (!guide) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          {/* Lesson kick */}
          <div className="text-xs font-mono text-[var(--ha-red)] uppercase tracking-[0.35em] mb-3 flex items-center justify-center gap-2">
            <span className="w-3 h-px bg-[var(--ha-red)]" />
            Lesson {String(lessonNumber).padStart(2, '0')}
          </div>
          <h2 className="font-['Playfair_Display',Georgia,serif] italic text-2xl text-[var(--off-white)] mb-4">{topicTitle}</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="btn-primary-lg"
          >
            Begin Lesson <ChevronRight size={16} strokeWidth={2.5} />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 md:p-6">
      {/* Content container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full"
      >
        {/* Portrait with credential stamp */}
        <div className="relative mb-5">
          {/* Host portrait */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', damping: 15 }}
            className="relative w-36 h-36 rounded-full overflow-hidden border-[3px] border-[var(--gold-2)] shadow-[0_0_30px_rgba(230,171,42,0.3)]"
          >
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
                      <Play size={18} className="text-[var(--gold-2)] ml-0.5" fill="currentColor" />
                    </div>
                  </button>
                )}
              </>
            ) : guide.imageUrl ? (
              <img src={guide.imageUrl} alt={guide.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl bg-[var(--ink-lift)]">
                {guide.avatar}
              </div>
            )}
          </motion.div>

          {/* Press credential stamp */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: -8 }}
            transition={{ delay: 0.3, type: 'spring', damping: 12 }}
            className="absolute -bottom-3 -right-3 px-2.5 py-1.5 bg-[var(--parch-1)] border-2 border-[var(--parch-red)] text-[var(--parch-red-dp)] font-mono text-[8px] uppercase tracking-[0.25em] font-bold rounded-sm shadow-lg"
          >
            ◆ History Guide
          </motion.div>
        </div>

        {/* Host name and title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <h3 className="font-[var(--font-display)] text-lg uppercase tracking-wide text-[var(--off-white)] mb-1">
            {guide.name}
          </h3>
          <p className="text-xs font-mono text-[var(--gold-2)] uppercase tracking-[0.2em]">
            {guide.title}
          </p>
        </motion.div>

        {/* Quote */}
        <motion.blockquote
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="text-center mb-6 max-w-xs"
        >
          <p className="font-[var(--font-calligraphy)] italic text-[var(--text-2)] text-base leading-relaxed">
            "Let's explore <em className="text-[var(--gold-2)]">{topicTitle}</em> together."
          </p>
        </motion.blockquote>

        {/* Lesson Meta Strip */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-4 mb-6 py-3 px-5 rounded-lg bg-[rgba(0,0,0,0.4)] border border-[var(--border-gold)]"
        >
          <div className="flex items-center gap-2 text-xs">
            <BookOpen size={12} className="text-[var(--gold-2)]" />
            <span className="text-[var(--text-3)]">Lesson</span>
            <span className="font-mono text-[var(--gold-2)]">{String(lessonNumber).padStart(2, '0')}</span>
          </div>
          <div className="w-px h-4 bg-[var(--divider)]" />
          <div className="flex items-center gap-2 text-xs">
            <Clock size={12} className="text-[var(--text-3)]" />
            <span className="text-[var(--text-3)]">~15 min</span>
          </div>
        </motion.div>

        {/* Lesson Title Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mb-8"
        >
          <div className="text-xs font-mono text-[var(--ha-red)] uppercase tracking-[0.35em] mb-2 flex items-center justify-center gap-2">
            <span className="w-3 h-px bg-[var(--ha-red)]" />
            {unitTitle}
            <span className="w-3 h-px bg-[var(--ha-red)]" />
          </div>
          <h2 className="font-['Playfair_Display',Georgia,serif] italic text-2xl md:text-3xl text-[var(--off-white)] leading-tight">
            {topicTitle}
          </h2>
        </motion.div>

        {/* CTA Button */}
        <AnimatePresence>
          {(showSkip || !hasIntroVideo) && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onContinue}
              className="btn-primary-lg"
            >
              Begin Lesson <ChevronRight size={16} strokeWidth={2.5} />
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

  // Lock body scroll when component mounts (full-screen view)
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

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

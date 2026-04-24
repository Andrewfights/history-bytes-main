import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Home, ArrowRight, BookOpen, ChevronDown, ChevronUp, X, Check, Award } from 'lucide-react';
import { Question } from '@/types';

interface MissedQuestion {
  question: Question;
  userAnswer: number;
}

interface ResultsViewProps {
  score: number;
  totalQuestions: number;
  timeElapsed: string;
  xpEarned: number;
  missedQuestions: MissedQuestion[];
  onNextSession: () => void;
  onGoHome: () => void;
  lessonTitle?: string;
  artifactUnlocked?: string;
}

// SVG Medal Component
function MedalIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 140" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ribbons */}
      <path d="M40 0 L20 50 L40 40 L60 50 L80 50 L100 0 L80 0 L60 30 L40 0Z" fill="#CD0E14" />
      <path d="M30 5 L45 35" stroke="#8A0A0E" strokeWidth="3" />
      <path d="M90 5 L75 35" stroke="#8A0A0E" strokeWidth="3" />
      {/* Medal disc */}
      <circle cx="60" cy="90" r="44" fill="url(#medalGradient)" />
      <circle cx="60" cy="90" r="36" stroke="rgba(0,0,0,0.35)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <path d="M60 65 L65 78 L80 78 L68 87 L73 100 L60 91 L47 100 L52 87 L40 78 L55 78 Z" fill="rgba(0,0,0,0.4)" />
      <defs>
        <radialGradient id="medalGradient" cx="35%" cy="30%">
          <stop offset="0%" stopColor="#FFEC8B" />
          <stop offset="20%" stopColor="#F6E355" />
          <stop offset="55%" stopColor="#E6AB2A" />
          <stop offset="85%" stopColor="#B2641F" />
          <stop offset="100%" stopColor="#6A3A12" />
        </radialGradient>
      </defs>
    </svg>
  );
}

export function ResultsView({
  score,
  totalQuestions,
  timeElapsed,
  xpEarned,
  missedQuestions,
  onNextSession,
  onGoHome,
  lessonTitle = 'Lesson',
  artifactUnlocked,
}: ResultsViewProps) {
  const [showReview, setShowReview] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);
  const starCount = percentage >= 90 ? 3 : percentage >= 70 ? 2 : 1;
  const streak = Math.max(1, score); // Simplified streak

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center"
      >
        {/* Medal */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', damping: 10, stiffness: 100 }}
          className="relative w-28 h-32 mb-3"
        >
          <MedalIcon className="w-full h-full drop-shadow-[0_6px_16px_rgba(0,0,0,0.5)]" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8, type: 'spring' }}
            className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-[var(--gold-2)] flex items-center justify-center shadow-lg"
          >
            <Check size={20} className="text-[#1a0b02]" strokeWidth={3} />
          </motion.div>
        </motion.div>

        {/* Stamp */}
        <motion.div
          initial={{ scale: 2, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: -3 }}
          transition={{ delay: 0.3, type: 'spring', damping: 12 }}
          className="lc-stamp mb-4"
        >
          Lesson Complete
        </motion.div>

        {/* Stars */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 mb-5"
        >
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.2, type: 'spring', damping: 8 }}
              className={`lc-star ${i > starCount ? 'dim' : ''}`}
            >
              <Star size={38} fill={i <= starCount ? 'var(--gold-1)' : 'rgba(230,171,42,0.18)'} />
            </motion.div>
          ))}
        </motion.div>

        {/* Lesson Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="font-['Playfair_Display',Georgia,serif] italic text-2xl text-[var(--off-white)] mb-2"
        >
          {lessonTitle}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-sm text-[var(--text-2)] mb-5 max-w-xs font-[var(--font-calligraphy)] italic"
        >
          {score === totalQuestions
            ? `Perfect score! All ${totalQuestions} questions correct.`
            : `${score} out of ${totalQuestions} correct. Great work!`}
        </motion.p>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lc-stats mb-4 w-full max-w-sm"
        >
          <div className="lc-stat">
            <div className="lc-stat-label">Time</div>
            <div className="lc-stat-value">
              {timeElapsed.split(':')[0]}<span className="unit">m</span>
            </div>
          </div>
          <div className="lc-stat">
            <div className="lc-stat-label">Quiz</div>
            <div className="lc-stat-value">
              <em>{score}</em>/{totalQuestions}
            </div>
          </div>
          <div className="lc-stat">
            <div className="lc-stat-label">Accuracy</div>
            <div className="lc-stat-value">
              <em>{percentage}</em><span className="unit">%</span>
            </div>
          </div>
          <div className="lc-stat">
            <div className="lc-stat-label">Streak</div>
            <div className="lc-stat-value">
              ×<em>{streak}</em>
            </div>
          </div>
        </motion.div>

        {/* XP Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.55 }}
          className="lc-xp-badge mb-4"
        >
          <span className="lc-xp-label">XP Earned</span>
          <span className="lc-xp-value">+{xpEarned}</span>
        </motion.div>

        {/* Artifact Unlock */}
        {artifactUnlocked && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="lc-unlock-banner mb-5"
          >
            <div className="lc-unlock-icon">
              <Award size={22} />
            </div>
            <div className="lc-unlock-text">
              <div className="lc-unlock-kick">◆ Artifact Unlocked</div>
              <div className="lc-unlock-name">{artifactUnlocked}</div>
            </div>
          </motion.div>
        )}

        {/* Review Mistakes Button */}
        {missedQuestions.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            onClick={() => setShowReview(!showReview)}
            className="flex items-center gap-2 text-sm text-[var(--gold-2)] font-medium mb-4 hover:underline py-2"
          >
            <BookOpen size={16} />
            Review {missedQuestions.length} Mistake{missedQuestions.length > 1 ? 's' : ''}
            {showReview ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </motion.button>
        )}

        {/* Missed Questions Review */}
        <AnimatePresence>
          {showReview && missedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-sm space-y-4 mb-6 overflow-hidden text-left"
            >
              {missedQuestions.map((missed, index) => (
                <motion.div
                  key={missed.question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-[rgba(10,8,5,0.8)] border border-[var(--ha-red)]/30"
                >
                  <p className="text-sm font-medium text-[var(--off-white)] mb-3 font-[var(--font-stat)] italic">
                    {missed.question.prompt}
                  </p>

                  <div className="space-y-2 mb-3">
                    {/* Your wrong answer */}
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[var(--ha-red)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={12} className="text-[var(--ha-red)]" />
                      </div>
                      <div>
                        <span className="text-[var(--text-3)]">You answered: </span>
                        <span className="text-[var(--ha-red)]">{missed.question.choices[missed.userAnswer]}</span>
                      </div>
                    </div>

                    {/* Correct answer */}
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-[var(--success)]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-[var(--success)]" />
                      </div>
                      <div>
                        <span className="text-[var(--text-3)]">Correct: </span>
                        <span className="text-[var(--success)]">{missed.question.choices[missed.question.answer as number]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-[rgba(230,171,42,0.05)] border border-[var(--border-gold)] rounded">
                    <p className="text-xs text-[var(--text-3)] mb-1 uppercase tracking-wider font-mono">Why?</p>
                    <p className="text-sm text-[var(--text-2)] font-[var(--font-calligraphy)] italic">{missed.question.explanation}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
        style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextSession}
          className="btn-primary-lg w-full"
          style={{ minHeight: '52px' }}
        >
          Next Lesson
          <ArrowRight size={16} strokeWidth={2.5} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoHome}
          className="w-full h-12 border border-[var(--border-gold)] rounded-md font-[var(--font-display)] text-sm uppercase tracking-wider text-[var(--text-2)] flex items-center justify-center gap-2 hover:border-[var(--gold-2)] hover:text-[var(--gold-2)] transition-colors bg-[rgba(0,0,0,0.3)]"
        >
          Review Lesson
        </motion.button>

        <motion.button
          onClick={onGoHome}
          className="w-full py-2 text-sm text-[var(--text-3)] hover:text-[var(--text-2)] transition-colors flex items-center justify-center gap-2"
        >
          <Home size={14} />
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}

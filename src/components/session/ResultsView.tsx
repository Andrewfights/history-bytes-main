import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Sparkles, Home, ArrowRight, BookOpen, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
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
}

export function ResultsView({
  score,
  totalQuestions,
  timeElapsed,
  xpEarned,
  missedQuestions,
  onNextSession,
  onGoHome,
}: ResultsViewProps) {
  const [showReview, setShowReview] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);
  const isPerfect = percentage === 100;
  const isGood = percentage >= 80;

  return (
    <div className="flex flex-col min-h-screen px-4 py-6">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex-1 flex flex-col items-center justify-center text-center"
      >
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className={`w-24 h-24 rounded-full mb-6 flex items-center justify-center ${
            isPerfect ? 'bg-primary/20' : isGood ? 'bg-success/20' : 'bg-secondary/20'
          }`}
        >
          <Trophy
            size={48}
            className={isPerfect ? 'text-primary' : isGood ? 'text-success' : 'text-secondary'}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-editorial text-3xl font-bold mb-2"
        >
          {isPerfect ? 'Perfect!' : isGood ? 'Great Job!' : 'Session Complete'}
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-5xl font-bold text-gradient-gold mb-8"
        >
          {percentage}%
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 w-full max-w-sm mb-6"
        >
          <div className="lesson-card text-center py-4">
            <Trophy size={20} className="mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">{score}/{totalQuestions}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="lesson-card text-center py-4">
            <Clock size={20} className="mx-auto mb-1 text-secondary" />
            <p className="text-lg font-bold">{timeElapsed}</p>
            <p className="text-xs text-muted-foreground">Time</p>
          </div>
          <div className="lesson-card text-center py-4">
            <Sparkles size={20} className="mx-auto mb-1 text-primary" />
            <p className="text-lg font-bold">+{xpEarned}</p>
            <p className="text-xs text-muted-foreground">XP</p>
          </div>
        </motion.div>

        {/* Review Mistakes Button */}
        {missedQuestions.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            onClick={() => setShowReview(!showReview)}
            className="flex items-center gap-2 text-primary font-medium mb-4 hover:underline"
          >
            <BookOpen size={18} />
            Review {missedQuestions.length} Mistake{missedQuestions.length > 1 ? 's' : ''}
            {showReview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </motion.button>
        )}

        {/* Missed Questions Review */}
        <AnimatePresence>
          {showReview && missedQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="w-full max-w-sm space-y-4 mb-6 overflow-hidden"
            >
              {missedQuestions.map((missed, index) => (
                <motion.div
                  key={missed.question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="lesson-card text-left p-4 border-destructive/30"
                >
                  <p className="text-sm font-medium text-foreground mb-3">
                    {missed.question.prompt}
                  </p>
                  
                  <div className="space-y-2 mb-3">
                    {/* Your wrong answer */}
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-destructive/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X size={12} className="text-destructive" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">You answered: </span>
                        <span className="text-destructive">{missed.question.choices[missed.userAnswer]}</span>
                      </div>
                    </div>
                    
                    {/* Correct answer */}
                    <div className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={12} className="text-success" />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Correct: </span>
                        <span className="text-success">{missed.question.choices[missed.question.answer as number]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">Why?</p>
                    <p className="text-sm text-foreground/80">{missed.question.explanation}</p>
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
        transition={{ delay: 0.6 }}
        className="space-y-3"
        style={{ paddingBottom: 'max(1rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNextSession}
          className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-semibold flex items-center justify-center gap-2 hover:glow-yellow transition-all"
        >
          Next Session
          <ArrowRight size={18} />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onGoHome}
          className="w-full h-14 border border-border rounded-xl font-semibold flex items-center justify-center gap-2 hover:border-primary/50 transition-colors"
        >
          <Home size={18} />
          Back to Home
        </motion.button>
      </motion.div>
    </div>
  );
}

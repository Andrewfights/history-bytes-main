/**
 * ExamResults - Results screen for Final Exam
 * Shows score, tier, badges, XP, and review options
 */

import { motion } from 'framer-motion';
import { Award, Star, RotateCcw, BookOpen, ChevronRight } from 'lucide-react';
import type { ExamScoreResult, ExamAnswer, ExamQuestion } from './types';
import type { WW2Host } from '../../../../types';
import {
  EXAM_HOST_DIALOGUES,
  BADGE_DISPLAY_NAMES,
  FINAL_EXAM_SCORING,
} from './examConfig';

interface ExamResultsProps {
  result: ExamScoreResult;
  answers: Map<string, ExamAnswer>;
  questions: ExamQuestion[];
  host: WW2Host;
  onComplete: (xp: number) => void;
  onRetry: () => void;
  onReviewLessons: () => void;
}

export function ExamResults({
  result,
  answers,
  questions,
  host,
  onComplete,
  onRetry,
  onReviewLessons,
}: ExamResultsProps) {
  const tierConfig = FINAL_EXAM_SCORING[result.tier];
  const hostMessage = EXAM_HOST_DIALOGUES.results[result.tier];

  // Determine visual style based on tier
  const getTierStyle = () => {
    switch (result.tier) {
      case 'perfect':
        return {
          gradient: 'from-amber-400 via-yellow-300 to-amber-400',
          textColor: 'text-amber-400',
          bgColor: 'bg-amber-500/20',
          borderColor: 'border-amber-500',
        };
      case 'expert':
        return {
          gradient: 'from-blue-400 via-cyan-300 to-blue-400',
          textColor: 'text-blue-400',
          bgColor: 'bg-blue-500/20',
          borderColor: 'border-blue-500',
        };
      case 'historian':
        return {
          gradient: 'from-green-400 via-emerald-300 to-green-400',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/20',
          borderColor: 'border-green-500',
        };
      case 'review':
        return {
          gradient: 'from-orange-400 via-amber-300 to-orange-400',
          textColor: 'text-orange-400',
          bgColor: 'bg-orange-500/20',
          borderColor: 'border-orange-500',
        };
      case 'retry':
        return {
          gradient: 'from-red-400 via-rose-300 to-red-400',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/20',
          borderColor: 'border-red-500',
        };
    }
  };

  const style = getTierStyle();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full overflow-y-auto"
    >
      {/* Hero section */}
      <div className="text-center py-6">
        {/* Gold star for perfect */}
        {result.goldStar && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
            className="mb-4"
          >
            <Star
              size={64}
              className="mx-auto text-amber-400 fill-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]"
            />
          </motion.div>
        )}

        {/* Score circle */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
          className={`relative w-32 h-32 mx-auto mb-4 rounded-full border-4 ${style.borderColor} ${style.bgColor} flex items-center justify-center`}
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{result.correct}</div>
            <div className="text-white/60 text-sm">of {result.total}</div>
          </div>
        </motion.div>

        {/* Percentage and tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={`text-3xl font-bold ${style.textColor} mb-1`}>
            {result.percentage}%
          </div>
          <div className="text-white/60 text-sm">{tierConfig.tier}</div>
        </motion.div>
      </div>

      {/* Host message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mx-4 mb-6"
      >
        <div className="flex gap-3 items-start">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            style={{ backgroundColor: host.primaryColor }}
          >
            {host.avatar}
          </div>
          <div className="flex-1 bg-white/5 rounded-xl rounded-tl-sm p-4 border border-white/10">
            <p className="text-white/50 text-xs mb-1">{host.name}</p>
            <p className="text-white/90 text-sm leading-relaxed">{hostMessage}</p>
          </div>
        </div>
      </motion.div>

      {/* Breakdown by tier */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mx-4 mb-6"
      >
        <h3 className="text-white/60 text-xs uppercase tracking-wide mb-3">
          Performance by Difficulty
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 text-center">
            <div className="text-green-400 text-2xl font-bold">
              {result.breakdown.easy}/5
            </div>
            <div className="text-green-400/60 text-xs">Easy</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
            <div className="text-amber-400 text-2xl font-bold">
              {result.breakdown.medium}/5
            </div>
            <div className="text-amber-400/60 text-xs">Medium</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-center">
            <div className="text-red-400 text-2xl font-bold">
              {result.breakdown.hard}/5
            </div>
            <div className="text-red-400/60 text-xs">Hard</div>
          </div>
        </div>
      </motion.div>

      {/* Rewards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mx-4 mb-6"
      >
        <h3 className="text-white/60 text-xs uppercase tracking-wide mb-3">Rewards</h3>
        <div className="space-y-3">
          {/* XP */}
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 text-lg">+</span>
            </div>
            <div className="flex-1">
              <div className="text-amber-400 font-bold">{result.xp} XP</div>
              <div className="text-amber-400/60 text-xs">Experience Points</div>
            </div>
          </div>

          {/* Badge (if earned) */}
          {result.badge && (
            <div className={`flex items-center gap-3 ${style.bgColor} border ${style.borderColor}/30 rounded-xl p-4`}>
              <div className={`w-10 h-10 rounded-full ${style.bgColor} flex items-center justify-center`}>
                <Award size={20} className={style.textColor} />
              </div>
              <div className="flex-1">
                <div className={`${style.textColor} font-bold`}>
                  {BADGE_DISPLAY_NAMES[result.badge] || result.badge}
                </div>
                <div className={`${style.textColor}/60 text-xs`}>Badge Earned</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-auto p-4 space-y-3"
      >
        {/* Continue button */}
        <button
          onClick={() => onComplete(result.xp)}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          Continue
          <ChevronRight size={20} />
        </button>

        {/* Conditional actions based on score */}
        {result.promptRetry && (
          <button
            onClick={onRetry}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
        )}

        {result.promptRevisit && (
          <button
            onClick={onReviewLessons}
            className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <BookOpen size={18} />
            Review Lessons
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

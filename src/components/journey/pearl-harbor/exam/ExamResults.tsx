/**
 * ExamResults - Results screen for Final Exam
 * Shows score, tier, badges, XP, and review options
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, RotateCcw, BookOpen, ChevronRight, Trophy, Crown, Swords } from 'lucide-react';
import type { ExamScoreResult, ExamAnswer, ExamQuestion } from './types';
import type { WW2Host, SouvenirTier } from '../../../../types';
import {
  EXAM_HOST_DIALOGUES,
  BADGE_DISPLAY_NAMES,
  FINAL_EXAM_SCORING,
} from './examConfig';
import { usePantheonProgress, TierBadge } from '../../pantheon';

interface ExamResultsProps {
  result: ExamScoreResult;
  answers: Map<string, ExamAnswer>;
  questions: ExamQuestion[];
  host: WW2Host;
  onComplete: (xp: number) => void;
  onRetry: () => void;
  onReviewLessons: () => void;
  onEnterArena?: () => void;
}

export function ExamResults({
  result,
  answers,
  questions,
  host,
  onComplete,
  onRetry,
  onReviewLessons,
  onEnterArena,
}: ExamResultsProps) {
  const tierConfig = FINAL_EXAM_SCORING[result.tier];
  const hostMessage = EXAM_HOST_DIALOGUES.results[result.tier];

  // Pantheon souvenir upgrade tracking
  const { recordExamScore, getSouvenirTier } = usePantheonProgress();
  const [souvenirUpgrade, setSouvenirUpgrade] = useState<SouvenirTier | null>(null);
  const [showUpgradeNotice, setShowUpgradeNotice] = useState(false);

  // Record exam score and check for souvenir upgrade
  useEffect(() => {
    const newTier = recordExamScore('ww2', result.correct, result.total);
    if (newTier) {
      setSouvenirUpgrade(newTier);
      // Delay showing upgrade notice for dramatic effect
      setTimeout(() => setShowUpgradeNotice(true), 800);
    }
  }, [result.correct, result.total, recordExamScore]);

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

          {/* Souvenir Upgrade Notification */}
          <AnimatePresence>
            {showUpgradeNotice && souvenirUpgrade && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 border border-amber-500/30 rounded-xl p-4 overflow-hidden relative"
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 to-transparent" />

                <div className="relative flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-slate-700/50 flex items-center justify-center text-2xl">
                    🪖
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">M1 Helmet Upgraded!</span>
                      <TierBadge tier={souvenirUpgrade} size="sm" />
                    </div>
                    <div className="text-white/60 text-xs">Your souvenir has been upgraded in The Pantheon</div>
                  </div>
                  <Trophy size={20} className="text-amber-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* THE ARENA - Elite Challenge Invitation (only for passing students) */}
      {result.tier !== 'retry' && onEnterArena && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mx-4 mb-6"
        >
          <button
            onClick={onEnterArena}
            className="w-full relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-amber-500/30 p-4 text-left group hover:border-amber-500/50 transition-all"
          >
            {/* Animated glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/10 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <div className="relative flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center">
                <Crown size={28} className="text-amber-400" />
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-editorial text-lg font-bold text-white">THE ARENA</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 rounded">Elite</span>
                </div>
                <p className="text-white/60 text-xs mb-2">
                  15 questions. Three tiers. Risk it all for Rhodes Scholar status.
                </p>
                <div className="flex items-center gap-3 text-[10px] text-white/40">
                  <span>+200 to +1,000 XP</span>
                  <span>•</span>
                  <span>Leaderboard Rankings</span>
                </div>
              </div>

              <ChevronRight size={20} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}

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

/**
 * ExamResults - Results screen for Final Exam
 * Shows score, tier, badges, XP, and review options
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, RotateCcw, BookOpen, ChevronRight, Trophy, Crown, ChevronDown, Clock, XCircle, CheckCircle2 } from 'lucide-react';
import type { ExamScoreResult, ExamAnswer, ExamQuestion, MultipleChoiceQuestion, FillInBlankQuestion, BranchingRevealQuestion, DualSliderQuestion, DragTimelineQuestion, MultiSelectQuestion, PercentageCompareQuestion, TwoPartQuestion, SequenceOrderQuestion } from './types';
import type { WW2Host, SouvenirTier } from '../../../../types';
import {
  EXAM_HOST_DIALOGUES,
  BADGE_DISPLAY_NAMES,
  FINAL_EXAM_SCORING,
} from './examConfig';
import { usePantheonProgress, TierBadge } from '../../pantheon';

// Helper functions for displaying answers by question type
function getCorrectAnswerDisplay(question: ExamQuestion): string {
  switch (question.type) {
    case 'multiple-choice': {
      const q = question as MultipleChoiceQuestion;
      return q.options[q.correctIndex];
    }
    case 'fill-in-blank': {
      const q = question as FillInBlankQuestion;
      return q.correctAnswers[0];
    }
    case 'branching-reveal': {
      const q = question as BranchingRevealQuestion;
      const correctOption = q.options.find((o) => o.isCorrect);
      return correctOption?.label || 'Unknown';
    }
    case 'dual-slider': {
      const q = question as DualSliderQuestion;
      if (q.answerOptions && q.correctOptionIndex !== undefined) {
        return q.answerOptions[q.correctOptionIndex];
      }
      return `${q.partA.label}: ${q.partA.correctValue}${q.partA.unit}, ${q.partB.label}: ${q.partB.correctValue}${q.partB.unit}`;
    }
    case 'drag-timeline': {
      const q = question as DragTimelineQuestion;
      return q.items
        .map((item) => `${item.label} → ${q.categories.find((c) => c.id === q.correctPlacements[item.id])?.label}`)
        .join(', ');
    }
    case 'multi-select': {
      const q = question as MultiSelectQuestion;
      return q.correctIndices.map((i) => q.options[i]).join(', ');
    }
    case 'percentage-compare': {
      const q = question as PercentageCompareQuestion;
      if (q.answerOptions && q.correctOptionIndex !== undefined) {
        return q.answerOptions[q.correctOptionIndex];
      }
      return `${q.optionA.label}: ${q.optionA.correctValue}%, ${q.optionB.label}: ${q.optionB.correctValue}%`;
    }
    case 'two-part': {
      const q = question as TwoPartQuestion;
      return `A: ${q.partA.options[q.partA.correctIndex]}, B: ${q.partB.options[q.partB.correctIndex]}`;
    }
    case 'sequence-order': {
      const q = question as SequenceOrderQuestion;
      return q.correctOrder.map((id, i) => `${i + 1}. ${q.items.find((item) => item.id === id)?.label}`).join(', ');
    }
    default:
      return 'Unknown';
  }
}

function getUserAnswerDisplay(question: ExamQuestion, answer: ExamAnswer): string {
  if (answer.timedOut && !answer.value) {
    return 'No answer (timed out)';
  }

  switch (question.type) {
    case 'multiple-choice': {
      const q = question as MultipleChoiceQuestion;
      const idx = answer.value as number;
      return q.options[idx] || 'No selection';
    }
    case 'fill-in-blank': {
      return (answer.value as string) || 'No answer';
    }
    case 'branching-reveal': {
      const q = question as BranchingRevealQuestion;
      const selectedId = answer.value as string;
      const option = q.options.find((o) => o.id === selectedId);
      return option?.label || 'No selection';
    }
    case 'dual-slider': {
      const q = question as DualSliderQuestion;
      if (q.answerOptions) {
        const idx = answer.value as number;
        return q.answerOptions[idx] || 'No selection';
      }
      const values = answer.value as { partA: number; partB: number };
      return `${q.partA.label}: ${values?.partA}${q.partA.unit}, ${q.partB.label}: ${values?.partB}${q.partB.unit}`;
    }
    case 'drag-timeline': {
      const q = question as DragTimelineQuestion;
      const placements = answer.value as Record<string, string | null>;
      return q.items
        .map((item) => {
          const categoryId = placements?.[item.id];
          const category = q.categories.find((c) => c.id === categoryId);
          return `${item.label} → ${category?.label || 'Not placed'}`;
        })
        .join(', ');
    }
    case 'multi-select': {
      const q = question as MultiSelectQuestion;
      const indices = answer.value as number[];
      return indices?.length > 0 ? indices.map((i) => q.options[i]).join(', ') : 'No selection';
    }
    case 'percentage-compare': {
      const q = question as PercentageCompareQuestion;
      if (q.answerOptions) {
        const idx = answer.value as number;
        return q.answerOptions[idx] || 'No selection';
      }
      return String(answer.value);
    }
    case 'two-part': {
      const q = question as TwoPartQuestion;
      const values = answer.value as { partA: number; partB: number };
      const partA = values?.partA !== undefined ? q.partA.options[values.partA] : 'No selection';
      const partB = values?.partB !== undefined ? q.partB.options[values.partB] : 'No selection';
      return `A: ${partA}, B: ${partB}`;
    }
    case 'sequence-order': {
      const q = question as SequenceOrderQuestion;
      const order = answer.value as string[];
      return order?.map((id, i) => `${i + 1}. ${q.items.find((item) => item.id === id)?.label}`).join(', ') || 'No answer';
    }
    default:
      return String(answer.value);
  }
}

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
  const [showMissedQuestions, setShowMissedQuestions] = useState(false);

  // Get missed questions
  const missedQuestions = questions.filter((q) => {
    const answer = answers.get(q.id);
    return answer && !answer.isCorrect;
  });

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

      {/* Missed Questions Review */}
      {missedQuestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="mx-4 mb-6"
        >
          <button
            onClick={() => setShowMissedQuestions(!showMissedQuestions)}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle size={20} className="text-red-400" />
              </div>
              <div className="text-left">
                <div className="text-white font-medium">Review Missed Questions</div>
                <div className="text-white/50 text-xs">{missedQuestions.length} question{missedQuestions.length !== 1 ? 's' : ''} to review</div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: showMissedQuestions ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-white/50" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showMissedQuestions && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-3 space-y-3">
                  {missedQuestions.map((question, index) => {
                    const answer = answers.get(question.id)!;
                    const correctAnswer = getCorrectAnswerDisplay(question);
                    const userAnswer = getUserAnswerDisplay(question, answer);

                    return (
                      <motion.div
                        key={question.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4"
                      >
                        {/* Question number and timed out badge */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-white/10 rounded text-white/60 text-xs font-medium">
                            Q{question.questionNumber}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            question.difficulty === 'easy' ? 'bg-green-500/20 text-green-400' :
                            question.difficulty === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {question.difficulty}
                          </span>
                          {answer.timedOut && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded text-xs font-medium">
                              <Clock size={12} />
                              Timed Out
                            </span>
                          )}
                        </div>

                        {/* Question prompt */}
                        <p className="text-white/90 text-sm mb-3 leading-relaxed">
                          {question.prompt}
                        </p>

                        {/* User's answer */}
                        <div className="flex items-start gap-2 mb-2">
                          <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-red-400/60 text-xs">Your answer:</span>
                            <p className="text-red-400 text-sm">{userAnswer}</p>
                          </div>
                        </div>

                        {/* Correct answer */}
                        <div className="flex items-start gap-2">
                          <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="text-green-400/60 text-xs">Correct answer:</span>
                            <p className="text-green-400 text-sm">{correctAnswer}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

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

      {/* Actions - improved mobile touch targets */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-auto p-4 space-y-3"
        style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
      >
        {/* Continue button */}
        <button
          onClick={() => onComplete(result.xp)}
          className="w-full py-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[52px]"
        >
          Continue
          <ChevronRight size={20} />
        </button>

        {/* Conditional actions based on score */}
        {result.promptRetry && (
          <button
            onClick={onRetry}
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <RotateCcw size={18} />
            Try Again
          </button>
        )}

        {result.promptRevisit && (
          <button
            onClick={onReviewLessons}
            className="w-full py-3.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[48px]"
          >
            <BookOpen size={18} />
            Review Lessons
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

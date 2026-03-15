/**
 * ExamProgressBar - Tiered progress indicator for Final Exam
 * Shows progress through Easy (1-5), Medium (6-10), Hard (11-15)
 */

import { motion } from 'framer-motion';
import { getTierForIndex, TIER_COLORS, FINAL_EXAM_CONFIG } from './examConfig';
import type { ExamDifficulty } from './types';

interface ExamProgressBarProps {
  currentIndex: number;
  answeredCount: number;
  correctCount: number;
}

export function ExamProgressBar({
  currentIndex,
  answeredCount,
  correctCount,
}: ExamProgressBarProps) {
  const totalQuestions = FINAL_EXAM_CONFIG.totalQuestions;
  const questionsPerTier = FINAL_EXAM_CONFIG.questionsPerTier;
  const currentTier = getTierForIndex(currentIndex);

  const tiers: { difficulty: ExamDifficulty; label: string; range: string }[] = [
    { difficulty: 'easy', label: 'Easy', range: '1-5' },
    { difficulty: 'medium', label: 'Medium', range: '6-10' },
    { difficulty: 'hard', label: 'Hard', range: '11-15' },
  ];

  return (
    <div className="w-full">
      {/* Question counter */}
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/60 text-xs">
          Question {currentIndex + 1} of {totalQuestions}
        </span>
        <span className="text-white/60 text-xs">
          {correctCount}/{answeredCount} correct
        </span>
      </div>

      {/* Tiered progress bar */}
      <div className="flex gap-1">
        {tiers.map((tier, tierIndex) => {
          const tierStart = tierIndex * questionsPerTier;
          const tierEnd = tierStart + questionsPerTier;
          const colors = TIER_COLORS[tier.difficulty];
          const isCurrentTier = currentTier === tier.difficulty;

          return (
            <div key={tier.difficulty} className="flex-1">
              {/* Tier label */}
              <div
                className={`text-center text-[10px] font-medium mb-1 ${
                  isCurrentTier ? colors.text : 'text-white/30'
                }`}
              >
                {tier.label}
              </div>

              {/* Progress segments */}
              <div className="flex gap-0.5">
                {Array.from({ length: questionsPerTier }).map((_, i) => {
                  const questionIndex = tierStart + i;
                  const isAnswered = questionIndex < answeredCount;
                  const isCurrent = questionIndex === currentIndex;

                  return (
                    <motion.div
                      key={questionIndex}
                      initial={false}
                      animate={{
                        backgroundColor: isAnswered
                          ? `var(--${tier.difficulty}-answered)`
                          : isCurrent
                          ? `var(--${tier.difficulty}-current)`
                          : 'rgba(255,255,255,0.1)',
                      }}
                      className={`h-2 flex-1 rounded-sm transition-colors ${
                        isAnswered
                          ? tier.difficulty === 'easy'
                            ? 'bg-green-500'
                            : tier.difficulty === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                          : isCurrent
                          ? tier.difficulty === 'easy'
                            ? 'bg-green-500/40'
                            : tier.difficulty === 'medium'
                            ? 'bg-amber-500/40'
                            : 'bg-red-500/40'
                          : 'bg-white/10'
                      }`}
                      style={{
                        boxShadow: isCurrent ? `0 0 8px ${
                          tier.difficulty === 'easy'
                            ? 'rgba(34, 197, 94, 0.5)'
                            : tier.difficulty === 'medium'
                            ? 'rgba(245, 158, 11, 0.5)'
                            : 'rgba(239, 68, 68, 0.5)'
                        }` : undefined,
                      }}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Current tier indicator */}
      <motion.div
        key={currentTier}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mt-2 text-center text-xs font-medium ${TIER_COLORS[currentTier].text}`}
      >
        {currentTier === 'easy'
          ? 'Fundamentals'
          : currentTier === 'medium'
          ? 'Connecting Concepts'
          : 'Analysis & Synthesis'}
      </motion.div>
    </div>
  );
}

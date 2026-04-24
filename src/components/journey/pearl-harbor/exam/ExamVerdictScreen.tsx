/**
 * ExamVerdictScreen - Final Verdict / Host Congrats with results
 * State 03: Host video frame, CLEARED/FAILED stamp, results grid,
 * difficulty breakdown, action buttons
 */

import { motion } from 'framer-motion';
import { Medal, List, X } from 'lucide-react';
import type { WW2Host } from '@/types';
import type { ExamScoreResult } from './types';
import { EXAM_HOST_DIALOGUES } from './examConfig';

interface ExamVerdictScreenProps {
  host: WW2Host;
  result: ExamScoreResult;
  videoUrl?: string;
  onViewCommendation: () => void;
  onReviewAnswers: () => void;
  onClose: () => void;
}

export function ExamVerdictScreen({
  host,
  result,
  videoUrl,
  onViewCommendation,
  onReviewAnswers,
  onClose,
}: ExamVerdictScreenProps) {
  const passed = result.percentage >= 70;
  const passLine = Math.ceil(result.total * 0.7);

  // Get host congrats message based on tier
  const getCongratsMessage = () => {
    switch (result.tier) {
      case 'perfect':
        return 'Perfect score. Outstanding work, soldier.';
      case 'expert':
        return 'Outstanding work, cadet.';
      case 'historian':
        return 'Solid performance. Well done.';
      case 'review':
        return 'You passed. Some areas need review.';
      case 'retry':
        return 'Not quite. Review the materials and try again.';
      default:
        return 'Exam complete.';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-void">
      {/* Header */}
      <div className="exam-header">
        <div className="exam-header-top">
          <div
            className="exam-header-kick"
            style={{
              color: passed ? 'var(--success)' : '#E84046',
            }}
          >
            <span
              className="exam-header-kick-dot"
              style={{
                background: passed ? 'var(--success)' : 'var(--ha-red)',
                boxShadow: passed
                  ? '0 0 6px var(--success)'
                  : '0 0 6px var(--ha-red)',
              }}
            />
            Exam Complete
          </div>
          <div className="exam-header-file">
            File · <em>PH-1941-EX</em>
          </div>
          <button className="exam-header-close" onClick={onClose}>
            <X size={11} strokeWidth={2.4} />
          </button>
        </div>
        <div className="exam-header-title-wrap">
          <div className="exam-header-title">
            Final <em>Exam</em>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="exam-body flex-1 overflow-y-auto">
        {/* Host stage */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="exam-verdict-stage"
        >
          <span className="exam-verdict-stage-corner-tr" />
          <span className="exam-verdict-stage-corner-bl" />

          {videoUrl ? (
            <video
              src={videoUrl}
              className="exam-host-video"
              autoPlay
              playsInline
              muted
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#3a2818] via-[#1a1008] to-[#050302] flex items-center justify-center">
              <span className="text-6xl">{host.avatar}</span>
            </div>
          )}

          <div className="exam-verdict-label">Verdict</div>

          <motion.div
            initial={{ scale: 2, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: -5, opacity: 1 }}
            transition={{ type: 'spring', bounce: 0.4, delay: 0.3 }}
            className={`exam-verdict-stamp ${!passed ? 'failed' : ''}`}
          >
            {passed ? 'Cleared' : 'Failed'}
          </motion.div>

          <div className="exam-verdict-caption">{getCongratsMessage()}</div>
        </motion.div>

        {/* Results grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="exam-results-grid"
        >
          {/* Primary card - Score */}
          <div className="exam-result-card primary">
            <div className="exam-result-lbl">Score</div>
            <div className="exam-result-val">
              <em>{result.correct}</em>/{result.total} Correct
            </div>
            <div className="exam-result-sub">
              {passed ? (
                <>
                  Above the <em style={{ color: 'var(--gold-2)', fontStyle: 'normal' }}>{passLine}</em>-question pass line.
                </>
              ) : (
                <>
                  Below the <em style={{ color: 'var(--ha-red)', fontStyle: 'normal' }}>{passLine}</em>-question pass line.
                </>
              )}
            </div>
          </div>

          {/* Accuracy */}
          <div className="exam-result-card">
            <div className="exam-result-lbl">Accuracy</div>
            <div className={`exam-result-val ${passed ? 'green' : ''}`}>
              {result.percentage}%
            </div>
          </div>

          {/* XP Earned */}
          <div className="exam-result-card">
            <div className="exam-result-lbl">XP Earned</div>
            <div className="exam-result-val">+{result.xp}</div>
          </div>
        </motion.div>

        {/* Difficulty breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="exam-breakdown-row"
        >
          <div className="exam-breakdown-col easy">
            <div className="exam-bc-lbl">Fund.</div>
            <div className="exam-bc-score">
              <em>{result.breakdown.easy}</em>
              <span className="exam-bc-slash">/</span>
              5
            </div>
          </div>
          <div className="exam-breakdown-col medium">
            <div className="exam-bc-lbl">Op.</div>
            <div className="exam-bc-score">
              <em>{result.breakdown.medium}</em>
              <span className="exam-bc-slash">/</span>
              5
            </div>
          </div>
          <div className="exam-breakdown-col hard">
            <div className="exam-bc-lbl">Hard</div>
            <div className="exam-bc-score">
              <em>{result.breakdown.hard}</em>
              <span className="exam-bc-slash">/</span>
              5
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="exam-verdict-actions"
        >
          {passed && (
            <button className="exam-btn primary" onClick={onViewCommendation}>
              <Medal size={12} strokeWidth={2.6} />
              View Commendation
            </button>
          )}
          <button className="exam-btn secondary" onClick={onReviewAnswers}>
            <List size={12} strokeWidth={2.6} />
            {passed ? 'Review Answers' : 'Review & Retry'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

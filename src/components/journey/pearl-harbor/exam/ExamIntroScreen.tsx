/**
 * ExamIntroScreen - Commission Briefing style exam intro
 * State 01: Gold seal, parchment dispatch, difficulty legend, Begin Exam CTA
 */

import { motion } from 'framer-motion';
import { Play, Clock, Target, List, TrendingUp, Flag, X } from 'lucide-react';
import type { WW2Host } from '@/types';
import { EXAM_HOST_DIALOGUES } from './examConfig';

interface ExamIntroScreenProps {
  host: WW2Host;
  questionCount: number;
  timePerQuestion: number;
  passPercentage: number;
  totalXp: number;
  onStart: () => void;
  onClose: () => void;
}

export function ExamIntroScreen({
  host,
  questionCount,
  timePerQuestion,
  passPercentage,
  totalXp,
  onStart,
  onClose,
}: ExamIntroScreenProps) {
  // Calculate difficulty tiers based on question count
  const easyCount = Math.ceil(questionCount * 0.33);
  const mediumCount = Math.ceil(questionCount * 0.34);
  const hardCount = questionCount - easyCount - mediumCount;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-void">
      {/* Header */}
      <div className="exam-header">
        <div className="exam-header-top">
          <div className="exam-header-kick">
            <span className="exam-header-kick-dot" />
            Exam · Ready
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="exam-commission"
        >
          <span className="exam-commission-corner-tr" />
          <span className="exam-commission-corner-bl" />

          {/* Top section with seal and title */}
          <div className="exam-commission-top">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.4, delay: 0.2 }}
              className="exam-seal"
            >
              <Flag size={32} />
            </motion.div>

            <div className="exam-commission-kick">Final Examination</div>

            <h1 className="exam-commission-title">
              Pearl <em>Harbor</em>
            </h1>

            <div className="exam-commission-meta-strip">
              <span><em>{questionCount}</em>&nbsp;Questions</span>
              <span className="dot" />
              <span><em>{timePerQuestion}s</em>&nbsp;Each</span>
              <span className="dot" />
              <span>Pass <em>{passPercentage}%</em></span>
            </div>
          </div>

          {/* Dispatch card from host */}
          <div className="exam-dispatch-wrap">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="exam-dispatch-card"
            >
              <div className="exam-dispatch-header">
                <div className="exam-dispatch-host">
                  <div className="exam-dispatch-host-portrait">
                    {host.imageUrl ? (
                      <img
                        src={host.imageUrl}
                        alt={host.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl flex items-center justify-center h-full">
                        {host.avatar}
                      </span>
                    )}
                  </div>
                  <div className="exam-dispatch-host-info">
                    <div className="exam-dispatch-host-name">{host.name}</div>
                    <div className="exam-dispatch-host-role">Chief Examiner</div>
                  </div>
                </div>
                <div className="exam-dispatch-stamp">Briefing</div>
              </div>

              <div className="exam-dispatch-body">
                <p>
                  {questionCount} questions. {timePerQuestion} seconds each. Lock in before the ring runs out.
                </p>
                <p>
                  Difficulty ramps — <strong>fundamentals</strong>, then{' '}
                  <strong>operational</strong>, then the <strong>hard ones</strong>.
                  Pass at {passPercentage}% and you earn the commendation.
                </p>
              </div>

              <div className="exam-dispatch-signature">
                <div className="exam-dispatch-sig-name">— {host.name}</div>
              </div>
            </motion.div>
          </div>

          {/* Meta pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="exam-meta-pills"
          >
            <div className="exam-meta-pill">
              <List size={9} strokeWidth={2} />
              <em>{questionCount}</em>&nbsp;Qs
            </div>
            <div className="exam-meta-pill">
              <Clock size={9} strokeWidth={2} />
              <em>{timePerQuestion}s</em>&nbsp;each
            </div>
            <div className="exam-meta-pill">
              <Target size={9} strokeWidth={2} />
              Pass <em>{passPercentage}%</em>
            </div>
            <div className="exam-meta-pill">
              <TrendingUp size={9} strokeWidth={2} />
              <em>+{totalXp}</em>&nbsp;XP
            </div>
          </motion.div>

          {/* Difficulty tags */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="exam-diff-tags"
          >
            <div className="exam-diff-tag easy">
              Easy
              <span className="exam-diff-tag-num">Q1–{easyCount}</span>
            </div>
            <div className="exam-diff-tag medium">
              Op
              <span className="exam-diff-tag-num">Q{easyCount + 1}–{easyCount + mediumCount}</span>
            </div>
            <div className="exam-diff-tag hard">
              Hard
              <span className="exam-diff-tag-num">Q{easyCount + mediumCount + 1}–{questionCount}</span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="exam-cta-wrap"
          >
            <button className="exam-cta" onClick={onStart}>
              <Play size={12} />
              Begin Exam
            </button>
            <div className="exam-cta-note">
              Once started, the timer doesn't pause.
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

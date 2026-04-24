/**
 * ExamQuestionScreen - Live Question screen with new design
 * State 02: Host video frame, circular timer, question card with brass fasteners,
 * stacked answers for mobile, Lock In CTA
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Volume2, VolumeX } from 'lucide-react';
import type { WW2Host } from '@/types';
import type { ExamQuestion, ExamDifficulty, PendingAnswer } from './types';
import { GAME_SHOW_CONFIG } from './examConfig';
import { useExamAudio } from '@/lib/audioManager';

interface ExamQuestionScreenProps {
  question: ExamQuestion;
  questionNumber: number;
  totalQuestions: number;
  currentScore: number;
  host: WW2Host;
  videoUrl?: string;
  onQuestionComplete: (pendingAnswer: PendingAnswer) => void;
  onClose: () => void;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export function ExamQuestionScreen({
  question,
  questionNumber,
  totalQuestions,
  currentScore,
  host,
  videoUrl,
  onQuestionComplete,
  onClose,
}: ExamQuestionScreenProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(GAME_SHOW_CONFIG.questionTimeLimit);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audio = useExamAudio();
  const [isMuted, setIsMuted] = useState(() => audio.getMuted());

  // Get difficulty label and class
  const getDifficultyInfo = (difficulty: ExamDifficulty) => {
    switch (difficulty) {
      case 'easy':
        return { label: 'Fundamentals', className: '' };
      case 'medium':
        return { label: 'Operational', className: 'medium' };
      case 'hard':
        return { label: 'Hard', className: 'hard' };
    }
  };

  const difficultyInfo = getDifficultyInfo(question.difficulty);

  // Get answer options based on question type
  const getOptions = (): string[] => {
    if (question.type === 'multiple-choice') {
      return question.options;
    }
    if (question.type === 'dual-slider' && question.answerOptions) {
      return question.answerOptions;
    }
    if (question.type === 'percentage-compare' && question.answerOptions) {
      return question.answerOptions;
    }
    return [];
  };

  const options = getOptions();

  // Timer effect
  useEffect(() => {
    if (isLockedIn) return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - auto-submit
          clearInterval(timerRef.current!);
          handleTimeUp();
          return 0;
        }
        // Play tick sound in last 5 seconds
        if (prev <= 6 && prev > 1) {
          audio.play('tick');
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLockedIn]);

  // Handle time up
  const handleTimeUp = useCallback(() => {
    audio.play('timeout');
    setIsLockedIn(true);

    setTimeout(() => {
      onQuestionComplete({
        questionId: question.id,
        value: selectedIndex,
        isLockedIn: false,
        timeRemaining: 0,
        timedOut: true,
      });
    }, GAME_SHOW_CONFIG.lockInPauseDuration);
  }, [selectedIndex, question.id, onQuestionComplete, audio]);

  // Handle lock in
  const handleLockIn = useCallback(() => {
    if (selectedIndex === null || isLockedIn) return;

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    audio.play('lockin');
    setIsLockedIn(true);

    setTimeout(() => {
      onQuestionComplete({
        questionId: question.id,
        value: selectedIndex,
        isLockedIn: true,
        timeRemaining,
        timedOut: false,
      });
    }, GAME_SHOW_CONFIG.lockInPauseDuration);
  }, [selectedIndex, isLockedIn, timeRemaining, question.id, onQuestionComplete, audio]);

  // Handle answer selection
  const handleSelectAnswer = (index: number) => {
    if (isLockedIn) return;
    setSelectedIndex(index);
    audio.play('select');
  };

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    const newMuted = audio.toggleMute();
    setIsMuted(newMuted);
  }, [audio]);

  // Calculate timer stroke dash offset (for SVG circle)
  const timerProgress = (timeRemaining / GAME_SHOW_CONFIG.questionTimeLimit) * 126;
  const timerClass = timeRemaining <= 3 ? 'danger' : timeRemaining <= 5 ? 'warning' : '';

  // XP per question
  const xpPerQuestion = question.difficulty === 'easy' ? 10 : question.difficulty === 'medium' ? 15 : 20;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-void">
      {/* Header */}
      <div className="exam-header">
        <div className="exam-header-top">
          <div className="exam-header-kick">
            <span className="exam-header-kick-dot" />
            In Progress
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
        {/* Live status strip */}
        <div className="exam-live-status">
          <div className="exam-live-q">
            Q&nbsp;
            <span className="exam-live-q-num">
              {String(questionNumber).padStart(2, '0')}
            </span>
            /<span className="exam-live-q-total">{totalQuestions}</span>
          </div>
          <div className={`exam-live-diff ${difficultyInfo.className}`}>
            {difficultyInfo.label}
          </div>
          <div className="exam-live-score">
            Score&nbsp;
            <span className="exam-live-score-num">{currentScore}</span>
          </div>
        </div>

        {/* Host frame */}
        <div className="exam-host-frame">
          <span className="exam-host-frame-corner-tr" />
          <span className="exam-host-frame-corner-bl" />

          {videoUrl ? (
            <video
              src={videoUrl}
              className="exam-host-video"
              autoPlay
              playsInline
              muted={isMuted}
              loop
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#3a2818] via-[#1a1008] to-[#050302] flex items-center justify-center">
              <span className="text-4xl">{host.avatar}</span>
            </div>
          )}

          {/* Top strip */}
          <div className="exam-host-top">
            <div className="exam-host-live-badge">Live</div>
            <div className="exam-host-category">{question.category || difficultyInfo.label}</div>
          </div>

          {/* Timer */}
          <div className="exam-timer">
            <svg viewBox="0 0 46 46">
              <circle cx="23" cy="23" r="20" className="exam-timer-track" />
              <circle
                cx="23"
                cy="23"
                r="20"
                className={`exam-timer-fill ${timerClass}`}
                style={{ strokeDashoffset: 126 - timerProgress }}
              />
            </svg>
            <div className={`exam-timer-num ${timerClass}`}>{timeRemaining}</div>
          </div>

          {/* Caption */}
          {question.hostDirection && (
            <div className="exam-host-caption">{question.hostDirection}</div>
          )}

          {/* Audio indicator */}
          <button className="exam-host-audio" onClick={handleToggleMute}>
            {isMuted ? (
              <VolumeX size={10} className="text-gold-1" />
            ) : (
              <>
                <span className="exam-host-audio-bar" />
                <span className="exam-host-audio-bar" />
                <span className="exam-host-audio-bar" />
                <span className="exam-host-audio-bar" />
                <span className="exam-host-audio-lbl">Speaking</span>
              </>
            )}
          </button>
        </div>

        {/* Question card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="exam-q-card"
        >
          <span className="exam-q-card-fastener-bl" />
          <span className="exam-q-card-fastener-br" />

          <div className="exam-q-num-block">
            <div className="exam-q-num">{String(questionNumber).padStart(2, '0')}</div>
            <div className="exam-q-num-sub">Question</div>
          </div>

          <div className="exam-q-body">
            <div className="exam-q-kick">
              ◆ {difficultyInfo.label} · {xpPerQuestion} XP
            </div>
            <div className="exam-q-text">{question.prompt}</div>
          </div>
        </motion.div>

        {/* Answer buttons */}
        <div className="exam-answers">
          {options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={`exam-answer ${selectedIndex === index ? 'selected' : ''} ${isLockedIn ? 'disabled' : ''}`}
              onClick={() => handleSelectAnswer(index)}
              disabled={isLockedIn}
            >
              <div className="exam-ans-letter">{LETTERS[index]}</div>
              <div className="exam-ans-text">{option}</div>
            </motion.button>
          ))}
        </div>

        {/* Lock In CTA */}
        <div className="exam-lock-wrap">
          <button
            className="exam-lock-cta"
            onClick={handleLockIn}
            disabled={selectedIndex === null || isLockedIn}
          >
            <Lock size={12} strokeWidth={2.6} />
            {isLockedIn ? 'Locked In' : 'Lock In Answer'}
          </button>
          <div className="exam-lock-note">
            Locks when you press it or when time runs out.
          </div>
        </div>
      </div>
    </div>
  );
}

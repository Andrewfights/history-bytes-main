/**
 * Pearl Harbor Final Exam - Type Definitions
 * 15-question chapter assessment with tiered difficulty
 */

import type { WW2Host } from '../../../../types';

// ---- Question Types ----

export type ExamQuestionType =
  | 'multiple-choice'
  | 'fill-in-blank'
  | 'branching-reveal'
  | 'dual-slider'
  | 'drag-timeline'
  | 'multi-select'
  | 'percentage-compare'
  | 'two-part'
  | 'sequence-order';

export type ExamDifficulty = 'easy' | 'medium' | 'hard';

export type HostMode = 'pip' | 'voice-only';

// ---- Base Question Interface ----

export interface BaseExamQuestion {
  id: string;
  questionNumber: number;
  type: ExamQuestionType;
  difficulty: ExamDifficulty;
  prompt: string;
  explanation: string;
  sourceBeat: number; // Beat 1-10 that this question is from
  hostDirection: string; // Direction for host presentation
  hostMode: HostMode;
  visualAsset?: string; // Placeholder for visual presentation
  category?: string; // Topic badge (Timeline, Attack, etc.)
}

// ---- Specific Question Types ----

export interface MultipleChoiceQuestion extends BaseExamQuestion {
  type: 'multiple-choice';
  options: string[];
  correctIndex: number;
}

export interface FillInBlankQuestion extends BaseExamQuestion {
  type: 'fill-in-blank';
  blankPrompt: string; // Text with ______ for the blank
  correctAnswers: string[]; // Accept multiple valid spellings
  caseSensitive?: boolean;
  wordOptions?: string[]; // Optional word bank
}

export interface BranchingRevealQuestion extends BaseExamQuestion {
  type: 'branching-reveal';
  options: {
    id: string;
    label: string;
    isCorrect: boolean;
    revealContent?: string;
  }[];
}

export interface DualSliderQuestion extends BaseExamQuestion {
  type: 'dual-slider';
  partA: {
    label: string;
    unit: string;
    minValue: number;
    maxValue: number;
    correctValue: number;
    tolerance: number;
  };
  partB: {
    label: string;
    unit: string;
    minValue: number;
    maxValue: number;
    correctValue: number;
    tolerance: number;
  };
  // For simplified version with answer options
  answerOptions?: string[];
  correctOptionIndex?: number;
}

export interface DragTimelineQuestion extends BaseExamQuestion {
  type: 'drag-timeline';
  items: { id: string; label: string; icon?: string }[];
  categories: { id: string; label: string }[];
  correctPlacements: Record<string, string>; // itemId -> categoryId
}

export interface MultiSelectQuestion extends BaseExamQuestion {
  type: 'multi-select';
  options: string[];
  correctIndices: number[];
  requireAllCorrect?: boolean;
}

export interface PercentageCompareQuestion extends BaseExamQuestion {
  type: 'percentage-compare';
  optionA: { label: string; correctValue: number };
  optionB: { label: string; correctValue: number };
  // For simplified version with answer options
  answerOptions?: string[];
  correctOptionIndex?: number;
}

export interface TwoPartQuestion extends BaseExamQuestion {
  type: 'two-part';
  partA: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
  partB: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
  bothRequired: boolean; // Both must be correct for full credit
}

export interface SequenceOrderQuestion extends BaseExamQuestion {
  type: 'sequence-order';
  items: { id: string; label: string; icon?: string }[];
  correctOrder: string[]; // Array of item IDs in correct order
}

// ---- Union Type for All Questions ----

export type ExamQuestion =
  | MultipleChoiceQuestion
  | FillInBlankQuestion
  | BranchingRevealQuestion
  | DualSliderQuestion
  | DragTimelineQuestion
  | MultiSelectQuestion
  | PercentageCompareQuestion
  | TwoPartQuestion
  | SequenceOrderQuestion;

// ---- Answer Types ----

export interface ExamAnswer {
  questionId: string;
  isCorrect: boolean;
  value: unknown; // The user's answer (varies by question type)
  partialCredit?: number; // 0-1 for partial credit questions
  timedOut?: boolean; // True if user didn't answer in time
  timeRemaining?: number; // Seconds left when answer was locked in
}

// ---- Game Show Mode Types ----

export interface PendingAnswer {
  questionId: string;
  value: unknown;
  isLockedIn: boolean;
  timeRemaining: number;
  timedOut: boolean;
}

export type VideoLayoutMode = 'side-panel' | 'top-banner' | 'background';

export interface GameShowConfig {
  enabled: boolean;
  questionTimeLimit: number; // seconds
  countdownWarningThreshold: number; // seconds when pulse starts
  allowEarlyLockIn: boolean;
  lockInPauseDuration: number; // ms pause after lock-in before advancing
}

// ---- Scoring Types ----

export type ScoreTier = 'perfect' | 'expert' | 'historian' | 'review' | 'retry';

export interface ScoreTierConfig {
  minCorrect: number;
  xp: number;
  badge: string | null;
  tier: string; // Display name
  goldStar?: boolean;
  promptRevisit?: boolean;
  promptRetry?: boolean;
}

export interface ExamScoreResult {
  correct: number;
  total: number;
  percentage: number;
  breakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
  tier: ScoreTier;
  xp: number;
  badge: string | null;
  goldStar: boolean;
  promptRevisit: boolean;
  promptRetry: boolean;
}

// ---- State Machine Types ----

export type ExamScreen =
  | 'intro'
  | 'question'
  | 'answer_reveal'
  | 'transition'
  | 'milestone_video'  // Playing milestone transition/completion video
  | 'results'
  | 'question_active'  // Game show mode: question with active timer
  | 'locked_in'        // Game show mode: answer locked, brief pause
  | 'time_up';         // Game show mode: timer expired

export interface ExamState {
  screen: ExamScreen;
  currentQuestionIndex: number;
  answers: Map<string, ExamAnswer>;
  score: number;
  currentTier: ExamDifficulty;
  shuffledQuestions: ExamQuestion[];
}

// ---- Component Props ----

export interface FinalExamBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
}

export interface ExamQuestionRendererProps {
  question: ExamQuestion;
  hostMode: HostMode;
  host: WW2Host;
  onAnswer: (answer: ExamAnswer) => void;
}

export interface ExamResultsProps {
  result: ExamScoreResult;
  answers: Map<string, ExamAnswer>;
  questions: ExamQuestion[];
  host: WW2Host;
  onComplete: (xp: number) => void;
  onRetry: () => void;
  onReviewLessons: () => void;
}

// ---- Host Dialogue ----

export interface ExamHostDialogue {
  intro: string;
  easyTierIntro: string;
  mediumTierIntro: string;
  hardTierIntro: string;
  correctFeedback: string[];
  incorrectFeedback: string[];
  tierTransition: Record<ExamDifficulty, string>;
  results: Record<ScoreTier, string>;
}

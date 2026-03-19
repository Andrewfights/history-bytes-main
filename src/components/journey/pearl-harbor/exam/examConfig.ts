/**
 * Pearl Harbor Final Exam - Configuration
 * Scoring tiers, shuffle logic, and exam settings
 */

import type {
  ExamQuestion,
  ExamDifficulty,
  ScoreTier,
  ScoreTierConfig,
  ExamScoreResult,
  ExamAnswer,
  ExamHostDialogue,
  GameShowConfig,
} from './types';

// ---- Exam Configuration ----

export const FINAL_EXAM_CONFIG = {
  totalQuestions: 15,
  questionsPerTier: 5,
  tiersInOrder: ['easy', 'medium', 'hard'] as const,
  shuffleWithinTiers: true,
  noPerQuestionTimer: false, // Changed: now has game show timer
  lessonId: 'ph-beat-11',
  xpReward: 150, // Max XP for perfect score
};

// ---- Game Show Mode Configuration ----

export const GAME_SHOW_CONFIG: GameShowConfig = {
  enabled: true,
  questionTimeLimit: 10, // 10 seconds per question
  countdownWarningThreshold: 3, // Pulse/blink at 3 seconds
  allowEarlyLockIn: true, // User can lock in answer early
  lockInPauseDuration: 1000, // 1 second pause after lock-in
};

// ---- Scoring System (from PRD) ----

export const FINAL_EXAM_SCORING: Record<ScoreTier, ScoreTierConfig> = {
  perfect: {
    minCorrect: 15,
    xp: 150,
    badge: 'pearl-harbor-scholar',
    tier: 'Perfect Score',
    goldStar: true,
  },
  expert: {
    minCorrect: 12,
    xp: 120,
    badge: 'pearl-harbor-expert',
    tier: 'Expert',
  },
  historian: {
    minCorrect: 9,
    xp: 90,
    badge: 'pearl-harbor-historian',
    tier: 'Passing',
  },
  review: {
    minCorrect: 6,
    xp: 60,
    badge: null,
    tier: 'Needs Review',
    promptRevisit: true,
  },
  retry: {
    minCorrect: 0,
    xp: 30,
    badge: null,
    tier: 'Retry Recommended',
    promptRetry: true,
  },
};

// ---- Helper Functions ----

/**
 * Determine which scoring tier the user achieved
 */
export function getScoreTier(correctCount: number): ScoreTier {
  if (correctCount >= FINAL_EXAM_SCORING.perfect.minCorrect) return 'perfect';
  if (correctCount >= FINAL_EXAM_SCORING.expert.minCorrect) return 'expert';
  if (correctCount >= FINAL_EXAM_SCORING.historian.minCorrect) return 'historian';
  if (correctCount >= FINAL_EXAM_SCORING.review.minCorrect) return 'review';
  return 'retry';
}

/**
 * Calculate full exam score result from answers
 */
export function calculateExamScore(
  answers: Map<string, ExamAnswer>,
  questions: ExamQuestion[]
): ExamScoreResult {
  let correct = 0;
  const breakdown = { easy: 0, medium: 0, hard: 0 };

  answers.forEach((answer, questionId) => {
    if (answer.isCorrect) {
      correct++;
      const question = questions.find((q) => q.id === questionId);
      if (question) {
        breakdown[question.difficulty]++;
      }
    }
  });

  const tier = getScoreTier(correct);
  const tierConfig = FINAL_EXAM_SCORING[tier];

  return {
    correct,
    total: FINAL_EXAM_CONFIG.totalQuestions,
    percentage: Math.round((correct / FINAL_EXAM_CONFIG.totalQuestions) * 100),
    breakdown,
    tier,
    xp: tierConfig.xp,
    badge: tierConfig.badge,
    goldStar: tierConfig.goldStar ?? false,
    promptRevisit: tierConfig.promptRevisit ?? false,
    promptRetry: tierConfig.promptRetry ?? false,
  };
}

/**
 * Shuffle questions within their difficulty tiers
 * Maintains tier order: Easy (Q1-5) → Medium (Q6-10) → Hard (Q11-15)
 */
export function shuffleQuestionsWithinTiers(questions: ExamQuestion[]): ExamQuestion[] {
  // Group questions by difficulty
  const easy = questions.filter((q) => q.difficulty === 'easy');
  const medium = questions.filter((q) => q.difficulty === 'medium');
  const hard = questions.filter((q) => q.difficulty === 'hard');

  // Shuffle each tier
  const shuffleArray = <T>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Combine in tier order
  return [
    ...shuffleArray(easy),
    ...shuffleArray(medium),
    ...shuffleArray(hard),
  ];
}

/**
 * Get the difficulty tier for a given question index (0-14)
 */
export function getTierForIndex(index: number): ExamDifficulty {
  if (index < 5) return 'easy';
  if (index < 10) return 'medium';
  return 'hard';
}

/**
 * Check if transitioning to a new tier
 */
export function isNewTier(currentIndex: number, nextIndex: number): boolean {
  return getTierForIndex(currentIndex) !== getTierForIndex(nextIndex);
}

// ---- Host Dialogue ----

export const EXAM_HOST_DIALOGUES: ExamHostDialogue = {
  intro:
    "Welcome to the Final Exam! This is HQ Trivia style - you have 10 seconds per question. Lock in your answer before time runs out. You won't see if you're right or wrong until the end. Ready to test your knowledge?",

  easyTierIntro:
    "Let's start with the fundamentals. These first five questions cover the basics you should know.",

  mediumTierIntro:
    "Moving to the next level. These questions require you to connect concepts and think about why things happened.",

  hardTierIntro:
    "Final stretch - the challenging questions. These test your deeper understanding of Pearl Harbor history.",

  correctFeedback: [
    'Excellent!',
    "That's right!",
    'Well done!',
    'Correct!',
    'Perfect!',
    'You know your history!',
  ],

  incorrectFeedback: [
    'Not quite.',
    "Let's review that.",
    'Remember this for next time.',
    'Close, but not correct.',
    'Good try - review this topic.',
  ],

  tierTransition: {
    easy: "Nice work on the basics. Now let's see how well you can connect the dots.",
    medium:
      "You're doing great. These last five are the real challenge - they're about deeper patterns and what-ifs.",
    hard: "That's it - you've completed the Pearl Harbor chapter. Let's see how you did.",
  },

  results: {
    perfect:
      "Outstanding! You've achieved perfect mastery of Pearl Harbor history. You truly understand this pivotal moment in history.",
    expert:
      "Impressive work! You've demonstrated expert knowledge of Pearl Harbor. You clearly paid attention to the details.",
    historian:
      "Good effort! You have a solid foundation of Pearl Harbor history. A few areas could use a review.",
    review:
      "Keep studying. Review the lessons where you struggled and try again when you're ready.",
    retry:
      "Don't give up. Go back through the beats and absorb the material. Pearl Harbor's story is worth understanding.",
  },
};

// ---- Tier Colors ----

export const TIER_COLORS: Record<ExamDifficulty, { bg: string; text: string; border: string }> = {
  easy: {
    bg: 'bg-green-500/20',
    text: 'text-green-400',
    border: 'border-green-500',
  },
  medium: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500',
  },
  hard: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500',
  },
};

// ---- Badge Display Names ----

export const BADGE_DISPLAY_NAMES: Record<string, string> = {
  'pearl-harbor-scholar': 'Pearl Harbor Scholar',
  'pearl-harbor-expert': 'Pearl Harbor Expert',
  'pearl-harbor-historian': 'Pearl Harbor Historian',
};

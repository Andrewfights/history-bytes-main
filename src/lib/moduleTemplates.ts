/**
 * Module Templates - Reusable journey beat templates
 * Defines all available module types for journey building
 */

import type { FirestoreModuleTemplate, ModuleCategory } from './firestore';

// ============ Template Configuration Schemas ============

// Schema for timed challenge questions
export interface TimedChallengeConfig {
  timeLimit: number; // Total time in seconds
  perQuestionTime?: number; // Optional per-question limit
  streakBonus: boolean;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    category?: string;
  }>;
}

// Schema for fact or myth statements
export interface FactOrMythConfig {
  statements: Array<{
    id: string;
    statement: string;
    isFact: boolean;
    explanation: string;
    source?: string;
  }>;
}

// Schema for drag-and-drop order mode
export interface DragDropOrderConfig {
  title?: string;
  instructions?: string;
  items: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  correctOrder: string[]; // Array of item IDs in correct order
  maxAttempts?: number;
  showHints?: boolean;
}

// Schema for drag-and-drop categorize mode
export interface DragDropCategorizeConfig {
  title?: string;
  instructions?: string;
  items: Array<{
    id: string;
    label: string;
    icon?: string;
  }>;
  categories: Array<{
    id: string;
    label: string;
  }>;
  correctPlacements: Record<string, string>; // itemId -> categoryId
}

// Schema for interactive map
export interface InteractiveMapConfig {
  mapImageUrl?: string;
  hotspots: Array<{
    id: string;
    x: number; // Percentage 0-100
    y: number;
    label: string;
    icon?: string;
    content: string; // HTML or markdown content
    pulseColor?: string;
  }>;
  timeline?: Array<{
    time: string;
    events: Array<{
      id: string;
      title: string;
      description: string;
    }>;
  }>;
}

// Schema for branching decision
export interface BranchingDecisionConfig {
  scenario: string;
  decisions: Array<{
    id: string;
    prompt: string;
    options: Array<{
      id: string;
      text: string;
      outcome: string;
      isCorrect?: boolean;
      nextDecisionId?: string;
    }>;
  }>;
  outcomes: Record<string, {
    title: string;
    description: string;
    xpMultiplier?: number;
  }>;
}

// Schema for primary source analysis
export interface PrimarySourceConfig {
  sourceText: string;
  sourceType: 'speech' | 'document' | 'letter' | 'article';
  sourceTitle: string;
  sourceAttribution: string;
  context: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }>;
}

// Schema for tiered exam
export interface TieredExamConfig {
  totalQuestions: number;
  questionsPerTier: number;
  tiersInOrder: Array<'easy' | 'medium' | 'hard'>;
  shuffleWithinTiers: boolean;
  questions: Array<{
    id: string;
    questionNumber: number;
    type: string;
    difficulty: 'easy' | 'medium' | 'hard';
    prompt: string;
    options?: string[];
    correctIndex?: number;
    correctAnswers?: string[];
    explanation: string;
    category?: string;
  }>;
  scoring: {
    perfect: { minCorrect: number; xp: number; badge?: string };
    expert: { minCorrect: number; xp: number; badge?: string };
    passing: { minCorrect: number; xp: number };
    retry: { xp: number };
  };
}

// Schema for watch/narration (Ghost Army style)
export interface WatchNarrationConfig {
  narration: Array<{
    atSecond: number;
    text: string;
    duration: number;
  }>;
  quoteInteraction?: {
    quote: string;
    attribution: string;
    isReal: boolean;
    explanation: string;
  };
  transitionText?: string;
}

// Schema for timeline learn (Ghost Army style)
export interface TimelineLearnConfig {
  context: string;
  mapDescription?: string;
  chronoChallenge: {
    prompt: string;
    events: Array<{
      id: string;
      text: string;
      order: number;
    }>;
  };
  revealNarration?: string;
}

// Schema for artifact detective (Ghost Army style)
export interface ArtifactDetectiveConfig {
  introNarration: string;
  artifacts: Array<{
    id: string;
    name: string;
    clues: string[];
    choices: string[];
    correctIndex: number;
    revealText: string;
    audioDescription?: string;
  }>;
  conclusionNarration?: string;
}

// Schema for tactical boss (Ghost Army style)
export interface TacticalBossConfig {
  operationName: string;
  briefing: string;
  timeLimit: number;
  assets: Array<{
    id: string;
    name: string;
    icon: string;
    count: number;
    description: string;
  }>;
  zones: Array<{
    id: string;
    name: string;
    description: string;
    correctAssets: string[];
  }>;
  successNarration: string;
  failureNarration: string;
}

// Schema for video trivia (Ghost Army style)
export interface VideoTriviaConfig {
  introText?: string;
  questions: Array<{
    id: string;
    questionText: string;
    questionVideoUrl?: string;
    answerTrigger: number | 'end';
    answers: Array<{
      id: string;
      text: string;
      isCorrect: boolean;
    }>;
    correctMessage: string;
    wrongMessage: string;
    correctVideoUrl?: string;
    wrongVideoUrl?: string;
    xpReward: number;
  }>;
}

// Schema for resolution/conclusion (Ghost Army style)
export interface ResolutionConfig {
  photoCaption?: string;
  narration: string[];
  keyStats: Array<{
    label: string;
    value: string;
  }>;
  unlockedStories?: Array<{
    title: string;
    description: string;
  }>;
  closingQuote?: string;
}

// ============ Template Type Union ============

export type TemplateConfig =
  | TimedChallengeConfig
  | FactOrMythConfig
  | DragDropOrderConfig
  | DragDropCategorizeConfig
  | InteractiveMapConfig
  | BranchingDecisionConfig
  | PrimarySourceConfig
  | TieredExamConfig
  | WatchNarrationConfig
  | TimelineLearnConfig
  | ArtifactDetectiveConfig
  | TacticalBossConfig
  | VideoTriviaConfig
  | ResolutionConfig;

// ============ Default Module Templates ============

export const MODULE_TEMPLATES: FirestoreModuleTemplate[] = [
  // ---- Pearl Harbor Templates ----
  {
    id: 'timed-challenge',
    name: 'Timed Challenge',
    description: 'Countdown quiz with multiple choice questions, streak bonuses, and time pressure',
    category: 'quiz',
    icon: '⏱️',
    configSchema: {
      type: 'object',
      required: ['questions', 'timeLimit'],
      properties: {
        timeLimit: { type: 'number', minimum: 30 },
        perQuestionTime: { type: 'number', minimum: 5 },
        streakBonus: { type: 'boolean' },
        questions: { type: 'array', minItems: 1 },
      },
    },
    defaultConfig: {
      timeLimit: 120,
      streakBonus: true,
      questions: [],
    } as TimedChallengeConfig,
    componentPath: 'shared/TimedChallenge',
  },
  {
    id: 'fact-or-myth',
    name: 'Fact or Myth Swiper',
    description: 'Swipe left for myth, right for fact - test historical knowledge',
    category: 'quiz',
    icon: '🤔',
    configSchema: {
      type: 'object',
      required: ['statements'],
      properties: {
        statements: { type: 'array', minItems: 1 },
      },
    },
    defaultConfig: {
      statements: [],
    } as FactOrMythConfig,
    componentPath: 'shared/FactOrMythSwiper',
  },
  {
    id: 'drag-and-drop-order',
    name: 'Sequence Ordering',
    description: 'Drag items to arrange them in the correct chronological order',
    category: 'interactive',
    icon: '📋',
    configSchema: {
      type: 'object',
      required: ['items', 'correctOrder'],
      properties: {
        title: { type: 'string' },
        instructions: { type: 'string' },
        items: { type: 'array', minItems: 2 },
        correctOrder: { type: 'array', minItems: 2 },
        maxAttempts: { type: 'number', minimum: 1 },
        showHints: { type: 'boolean' },
      },
    },
    defaultConfig: {
      items: [],
      correctOrder: [],
      maxAttempts: 3,
      showHints: true,
    } as DragDropOrderConfig,
    componentPath: 'shared/DragAndDropSorter',
  },
  {
    id: 'drag-and-drop-categorize',
    name: 'Category Sorting',
    description: 'Sort items into the correct categories (before/after, cause/effect, etc.)',
    category: 'interactive',
    icon: '📂',
    configSchema: {
      type: 'object',
      required: ['items', 'categories', 'correctPlacements'],
      properties: {
        title: { type: 'string' },
        instructions: { type: 'string' },
        items: { type: 'array', minItems: 2 },
        categories: { type: 'array', minItems: 2 },
        correctPlacements: { type: 'object' },
      },
    },
    defaultConfig: {
      items: [],
      categories: [
        { id: 'before', label: 'BEFORE' },
        { id: 'after', label: 'AFTER' },
      ],
      correctPlacements: {},
    } as DragDropCategorizeConfig,
    componentPath: 'shared/DragAndDropSorter',
  },
  {
    id: 'interactive-map',
    name: 'Interactive Map',
    description: 'Map with clickable hotspots revealing information and optional timeline',
    category: 'interactive',
    icon: '🗺️',
    configSchema: {
      type: 'object',
      required: ['hotspots'],
      properties: {
        mapImageUrl: { type: 'string' },
        hotspots: { type: 'array', minItems: 1 },
        timeline: { type: 'array' },
      },
    },
    defaultConfig: {
      hotspots: [],
    } as InteractiveMapConfig,
    componentPath: 'shared/InteractiveMap',
  },
  {
    id: 'branching-decision',
    name: 'Branching Decision',
    description: 'Decision tree with multiple paths and outcomes based on choices',
    category: 'interactive',
    icon: '🔀',
    configSchema: {
      type: 'object',
      required: ['scenario', 'decisions', 'outcomes'],
      properties: {
        scenario: { type: 'string' },
        decisions: { type: 'array', minItems: 1 },
        outcomes: { type: 'object' },
      },
    },
    defaultConfig: {
      scenario: '',
      decisions: [],
      outcomes: {},
    } as BranchingDecisionConfig,
    componentPath: 'beats/BranchingDecision',
  },
  {
    id: 'primary-source',
    name: 'Primary Source Analysis',
    description: 'Analyze historical documents, speeches, or letters with comprehension questions',
    category: 'narrative',
    icon: '📜',
    configSchema: {
      type: 'object',
      required: ['sourceText', 'sourceType', 'questions'],
      properties: {
        sourceText: { type: 'string' },
        sourceType: { type: 'string', enum: ['speech', 'document', 'letter', 'article'] },
        sourceTitle: { type: 'string' },
        sourceAttribution: { type: 'string' },
        context: { type: 'string' },
        questions: { type: 'array', minItems: 1 },
      },
    },
    defaultConfig: {
      sourceText: '',
      sourceType: 'document',
      sourceTitle: '',
      sourceAttribution: '',
      context: '',
      questions: [],
    } as PrimarySourceConfig,
    componentPath: 'beats/PrimarySource',
  },
  {
    id: 'final-exam',
    name: 'Tiered Exam',
    description: 'Multi-question assessment with tiered difficulty (easy → medium → hard)',
    category: 'assessment',
    icon: '📝',
    configSchema: {
      type: 'object',
      required: ['questions', 'scoring'],
      properties: {
        totalQuestions: { type: 'number', minimum: 5 },
        questionsPerTier: { type: 'number', minimum: 1 },
        tiersInOrder: { type: 'array' },
        shuffleWithinTiers: { type: 'boolean' },
        questions: { type: 'array', minItems: 5 },
        scoring: { type: 'object' },
      },
    },
    defaultConfig: {
      totalQuestions: 15,
      questionsPerTier: 5,
      tiersInOrder: ['easy', 'medium', 'hard'],
      shuffleWithinTiers: true,
      questions: [],
      scoring: {
        perfect: { minCorrect: 15, xp: 150 },
        expert: { minCorrect: 12, xp: 120 },
        passing: { minCorrect: 9, xp: 90 },
        retry: { xp: 30 },
      },
    } as TieredExamConfig,
    componentPath: 'exam/FinalExamBeat',
  },

  // ---- Ghost Army Templates ----
  {
    id: 'watch-narration',
    name: 'Watch & Narration',
    description: 'Video content with timed narration and quote validation interaction',
    category: 'narrative',
    icon: '🎬',
    configSchema: {
      type: 'object',
      required: ['narration'],
      properties: {
        narration: { type: 'array', minItems: 1 },
        quoteInteraction: { type: 'object' },
        transitionText: { type: 'string' },
      },
    },
    defaultConfig: {
      narration: [],
    } as WatchNarrationConfig,
    componentPath: 'ghost-army/WatchNode',
  },
  {
    id: 'timeline-learn',
    name: 'Timeline Challenge',
    description: 'Learn about events by reordering them chronologically',
    category: 'interactive',
    icon: '📅',
    configSchema: {
      type: 'object',
      required: ['context', 'chronoChallenge'],
      properties: {
        context: { type: 'string' },
        mapDescription: { type: 'string' },
        chronoChallenge: { type: 'object' },
        revealNarration: { type: 'string' },
      },
    },
    defaultConfig: {
      context: '',
      chronoChallenge: {
        prompt: '',
        events: [],
      },
    } as TimelineLearnConfig,
    componentPath: 'ghost-army/LearnNode',
  },
  {
    id: 'artifact-detective',
    name: 'Artifact Detective',
    description: 'Examine artifacts, reveal clues, and answer questions about what you find',
    category: 'interactive',
    icon: '🔍',
    configSchema: {
      type: 'object',
      required: ['artifacts'],
      properties: {
        introNarration: { type: 'string' },
        artifacts: { type: 'array', minItems: 1 },
        conclusionNarration: { type: 'string' },
      },
    },
    defaultConfig: {
      introNarration: '',
      artifacts: [],
    } as ArtifactDetectiveConfig,
    componentPath: 'ghost-army/WhoAmINode',
  },
  {
    id: 'tactical-boss',
    name: 'Tactical Boss',
    description: 'Strategy challenge - place assets on a map within time limit',
    category: 'challenge',
    icon: '⚔️',
    configSchema: {
      type: 'object',
      required: ['operationName', 'briefing', 'assets', 'zones'],
      properties: {
        operationName: { type: 'string' },
        briefing: { type: 'string' },
        timeLimit: { type: 'number', minimum: 30 },
        assets: { type: 'array', minItems: 1 },
        zones: { type: 'array', minItems: 1 },
        successNarration: { type: 'string' },
        failureNarration: { type: 'string' },
      },
    },
    defaultConfig: {
      operationName: '',
      briefing: '',
      timeLimit: 120,
      assets: [],
      zones: [],
      successNarration: '',
      failureNarration: '',
    } as TacticalBossConfig,
    componentPath: 'ghost-army/TacticalBossNode',
  },
  {
    id: 'video-trivia',
    name: 'Video Trivia',
    description: 'Video-driven questions that trigger at specific timestamps',
    category: 'quiz',
    icon: '🎥',
    configSchema: {
      type: 'object',
      required: ['questions'],
      properties: {
        introText: { type: 'string' },
        questions: { type: 'array', minItems: 1 },
      },
    },
    defaultConfig: {
      questions: [],
    } as VideoTriviaConfig,
    componentPath: 'ghost-army/TriviaPlayer',
  },
  {
    id: 'resolution',
    name: 'Resolution/Conclusion',
    description: 'Story conclusion with statistics, unlocks, and closing narrative',
    category: 'narrative',
    icon: '🏆',
    configSchema: {
      type: 'object',
      required: ['narration', 'keyStats'],
      properties: {
        photoCaption: { type: 'string' },
        narration: { type: 'array', minItems: 1 },
        keyStats: { type: 'array', minItems: 1 },
        unlockedStories: { type: 'array' },
        closingQuote: { type: 'string' },
      },
    },
    defaultConfig: {
      narration: [],
      keyStats: [],
    } as ResolutionConfig,
    componentPath: 'ghost-army/ResolutionNode',
  },
];

// ============ Helper Functions ============

export function getTemplateById(templateId: string): FirestoreModuleTemplate | undefined {
  return MODULE_TEMPLATES.find(t => t.id === templateId);
}

export function getTemplatesByCategory(category: ModuleCategory): FirestoreModuleTemplate[] {
  return MODULE_TEMPLATES.filter(t => t.category === category);
}

export function getDefaultConfigForTemplate(templateId: string): Record<string, unknown> {
  const template = getTemplateById(templateId);
  return template?.defaultConfig ?? {};
}

export function getCategoryLabel(category: ModuleCategory): string {
  const labels: Record<ModuleCategory, string> = {
    quiz: 'Quiz',
    interactive: 'Interactive',
    narrative: 'Narrative',
    challenge: 'Challenge',
    assessment: 'Assessment',
  };
  return labels[category];
}

export function getCategoryIcon(category: ModuleCategory): string {
  const icons: Record<ModuleCategory, string> = {
    quiz: '❓',
    interactive: '👆',
    narrative: '📖',
    challenge: '🎯',
    assessment: '📝',
  };
  return icons[category];
}

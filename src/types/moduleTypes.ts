/**
 * Module Types - Taxonomy for all interactive educational modules
 * Used by admins when building experiences/scenes
 */

// ============================================================
// MODULE CATEGORIES
// ============================================================

export type ModuleCategory =
  | 'quiz'
  | 'timeline'
  | 'map'
  | 'media'
  | 'interactive'
  | 'arcade'
  | 'matching'
  | 'assessment';

export const MODULE_CATEGORIES: Record<ModuleCategory, { label: string; icon: string; description: string }> = {
  quiz: { label: 'Quiz', icon: '❓', description: 'Test knowledge with questions' },
  timeline: { label: 'Timeline', icon: '⏳', description: 'Order events chronologically' },
  map: { label: 'Map/Location', icon: '📍', description: 'Interactive maps and locations' },
  media: { label: 'Media/Narrative', icon: '🎬', description: 'Video, audio, and story content' },
  interactive: { label: 'Interactive', icon: '👆', description: 'Hands-on exploration' },
  arcade: { label: 'Arcade/Reflex', icon: '🎮', description: 'Fast-paced games' },
  matching: { label: 'Matching/Puzzle', icon: '🧩', description: 'Match and solve puzzles' },
  assessment: { label: 'Assessment', icon: '📝', description: 'Formal tests and challenges' },
};

// ============================================================
// MODULE TYPE DEFINITIONS
// ============================================================

export interface ModuleTypeDefinition {
  id: string;
  name: string;
  category: ModuleCategory;
  description: string;
  icon: string;
  hasHotspots?: boolean;      // Requires hotspot placement
  hasTimeline?: boolean;      // Has timeline/ordering
  hasMedia?: boolean;         // Requires image/video/audio
  hasChoices?: boolean;       // Multiple choice answers
  hasDragDrop?: boolean;      // Drag and drop interaction
  hasTimer?: boolean;         // Timed challenge
  editorComponent?: string;   // Custom editor component name
}

// ============================================================
// QUIZ MODULES
// ============================================================

export const QUIZ_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'multiple-choice',
    name: 'Multiple Choice',
    category: 'quiz',
    description: 'Standard 4-5 option quiz question',
    icon: '🔘',
    hasChoices: true,
  },
  {
    id: 'multi-select',
    name: 'Multi-Select',
    category: 'quiz',
    description: 'Multiple correct answers from options',
    icon: '☑️',
    hasChoices: true,
  },
  {
    id: 'fill-blank',
    name: 'Fill in the Blank',
    category: 'quiz',
    description: 'Type or select missing words',
    icon: '✏️',
    hasChoices: true,
  },
  {
    id: 'two-truths',
    name: 'Two Truths & a Lie',
    category: 'quiz',
    description: 'Identify the false statement',
    icon: '🤥',
    hasChoices: true,
  },
  {
    id: 'fact-myth',
    name: 'Fact or Myth',
    category: 'quiz',
    description: 'Swipe true/false on statements',
    icon: '✅',
    hasChoices: true,
  },
  {
    id: 'video-trivia',
    name: 'Video Trivia',
    category: 'quiz',
    description: 'Questions triggered by video playback',
    icon: '🎥',
    hasMedia: true,
    hasChoices: true,
  },
];

// ============================================================
// TIMELINE MODULES
// ============================================================

export const TIMELINE_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'chrono-order',
    name: 'Chronological Order',
    category: 'timeline',
    description: 'Drag events into correct sequence',
    icon: '📅',
    hasDragDrop: true,
    hasTimeline: true,
  },
  {
    id: 'drag-categorize',
    name: 'Category Sort',
    category: 'timeline',
    description: 'Sort items into groups (before/after, cause/effect)',
    icon: '🗂️',
    hasDragDrop: true,
  },
  {
    id: 'guess-year',
    name: 'Guess the Year',
    category: 'timeline',
    description: 'Identify year from clues',
    icon: '📆',
    hasChoices: true,
  },
];

// ============================================================
// MAP/LOCATION MODULES
// ============================================================

export const MAP_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'hotspot-map',
    name: 'Hotspot Map',
    category: 'map',
    description: 'Tap locations on image/map to discover info',
    icon: '🗺️',
    hasHotspots: true,
    hasMedia: true,
    editorComponent: 'ImageHotspotEditor',
  },
  {
    id: 'carrier-hunt',
    name: 'Strategic Hunt',
    category: 'map',
    description: 'Locate targets on map within time limit',
    icon: '🎯',
    hasHotspots: true,
    hasMedia: true,
    hasTimer: true,
  },
  {
    id: 'geoguessr',
    name: 'Location Guesser',
    category: 'map',
    description: 'Identify location from image or map',
    icon: '🌍',
    hasMedia: true,
    hasChoices: true,
  },
  {
    id: 'tactical-deploy',
    name: 'Tactical Deployment',
    category: 'map',
    description: 'Place assets in correct zones on map',
    icon: '⚔️',
    hasHotspots: true,
    hasMedia: true,
    hasDragDrop: true,
    hasTimer: true,
  },
];

// ============================================================
// MEDIA/NARRATIVE MODULES
// ============================================================

export const MEDIA_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'video-lesson',
    name: 'Video Lesson',
    category: 'media',
    description: 'Watch video with comprehension questions',
    icon: '🎬',
    hasMedia: true,
    hasChoices: true,
  },
  {
    id: 'watch-narration',
    name: 'Watch & Narrate',
    category: 'media',
    description: 'Video with timed text overlay',
    icon: '📺',
    hasMedia: true,
  },
  {
    id: 'found-tape',
    name: 'Found Tape',
    category: 'media',
    description: 'Audio recording with transcript',
    icon: '📼',
    hasMedia: true,
    hasChoices: true,
  },
  {
    id: 'voiced-letter',
    name: 'Voiced Letter',
    category: 'media',
    description: 'Historical letter with narration',
    icon: '✉️',
    hasMedia: true,
  },
  {
    id: 'primary-source',
    name: 'Primary Source',
    category: 'media',
    description: 'Document or speech analysis',
    icon: '📜',
    hasMedia: true,
    hasChoices: true,
  },
  {
    id: 'headlines',
    name: 'Headlines',
    category: 'media',
    description: 'Period news carousel with questions',
    icon: '📰',
    hasMedia: true,
    hasChoices: true,
  },
];

// ============================================================
// INTERACTIVE MODULES
// ============================================================

export const INTERACTIVE_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'before-after',
    name: 'Before/After Slider',
    category: 'interactive',
    description: 'Compare two states with slider',
    icon: '↔️',
    hasMedia: true,
    hasHotspots: true,
  },
  {
    id: 'image-explore',
    name: 'Image Explore',
    category: 'interactive',
    description: 'Discover hotspots on image',
    icon: '🔍',
    hasMedia: true,
    hasHotspots: true,
    editorComponent: 'ImageHotspotEditor',
  },
  {
    id: 'panorama-tour',
    name: 'Panorama Tour',
    category: 'interactive',
    description: '360° exploration with hotspots',
    icon: '🌐',
    hasMedia: true,
    hasHotspots: true,
  },
  {
    id: 'artifact-detective',
    name: 'Artifact Detective',
    category: 'interactive',
    description: 'Progressive clue reveal with answer',
    icon: '🔎',
    hasChoices: true,
  },
  {
    id: 'branching-decision',
    name: 'Branching Decision',
    category: 'interactive',
    description: 'Choice-based narrative paths',
    icon: '🔀',
    hasChoices: true,
  },
  {
    id: 'what-if-sim',
    name: 'What-If Simulation',
    category: 'interactive',
    description: 'Counterfactual scenario exploration',
    icon: '💭',
    hasChoices: true,
  },
];

// ============================================================
// ARCADE/REFLEX MODULES
// ============================================================

export const ARCADE_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'radar-blip',
    name: 'Radar Blip',
    category: 'arcade',
    description: 'Tap targets under time pressure',
    icon: '📡',
    hasTimer: true,
  },
  {
    id: 'torpedo-dodge',
    name: 'Dodge Game',
    category: 'arcade',
    description: 'Lane-based avoidance challenge',
    icon: '💣',
    hasTimer: true,
  },
  {
    id: 'speech-blanks',
    name: 'Speech Blanks',
    category: 'arcade',
    description: 'Fill speech with audio playback',
    icon: '🎤',
    hasMedia: true,
    hasDragDrop: true,
  },
  {
    id: 'wave-defense',
    name: 'Wave Defense',
    category: 'arcade',
    description: 'Multi-wave positioning game',
    icon: '🛡️',
    hasTimer: true,
  },
  {
    id: 'escape-maze',
    name: 'Escape Path',
    category: 'arcade',
    description: 'Branching survival choices',
    icon: '🏃',
    hasChoices: true,
    hasTimer: true,
  },
];

// ============================================================
// MATCHING/PUZZLE MODULES
// ============================================================

export const MATCHING_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'connections',
    name: 'Connections',
    category: 'matching',
    description: '4x4 category matching grid',
    icon: '🔗',
  },
  {
    id: 'wordle',
    name: 'Word Guess',
    category: 'matching',
    description: '6 guesses for historical term',
    icon: '🔤',
  },
  {
    id: 'wreck-match',
    name: 'Image Match',
    category: 'matching',
    description: 'Match images to labels',
    icon: '🖼️',
    hasMedia: true,
  },
  {
    id: 'anachronism',
    name: 'Spot the Error',
    category: 'matching',
    description: 'Find out-of-place detail in scene',
    icon: '👁️',
    hasMedia: true,
    hasHotspots: true,
  },
  {
    id: 'cause-effect',
    name: 'Cause & Effect',
    category: 'matching',
    description: 'Match historical causes to effects',
    icon: '➡️',
    hasDragDrop: true,
  },
];

// ============================================================
// ASSESSMENT MODULES
// ============================================================

export const ASSESSMENT_MODULES: ModuleTypeDefinition[] = [
  {
    id: 'timed-challenge',
    name: 'Timed Challenge',
    category: 'assessment',
    description: 'Speed quiz with streak bonus',
    icon: '⏱️',
    hasTimer: true,
    hasChoices: true,
  },
  {
    id: 'boss-challenge',
    name: 'Boss Challenge',
    category: 'assessment',
    description: 'High-stakes threshold quiz',
    icon: '👹',
    hasTimer: true,
    hasChoices: true,
  },
  {
    id: 'final-exam',
    name: 'Final Exam',
    category: 'assessment',
    description: 'Tiered difficulty test (Easy/Medium/Hard)',
    icon: '🎓',
    hasChoices: true,
  },
  {
    id: 'mastery-run',
    name: 'Mastery Run',
    category: 'assessment',
    description: 'Chapter assessment quiz',
    icon: '🏆',
    hasChoices: true,
  },
];

// ============================================================
// ALL MODULES (Combined)
// ============================================================

export const ALL_MODULES: ModuleTypeDefinition[] = [
  ...QUIZ_MODULES,
  ...TIMELINE_MODULES,
  ...MAP_MODULES,
  ...MEDIA_MODULES,
  ...INTERACTIVE_MODULES,
  ...ARCADE_MODULES,
  ...MATCHING_MODULES,
  ...ASSESSMENT_MODULES,
];

// Helper to get module by ID
export function getModuleType(id: string): ModuleTypeDefinition | undefined {
  return ALL_MODULES.find(m => m.id === id);
}

// Helper to get modules by category
export function getModulesByCategory(category: ModuleCategory): ModuleTypeDefinition[] {
  return ALL_MODULES.filter(m => m.category === category);
}

// Helper to get modules that support hotspots
export function getHotspotModules(): ModuleTypeDefinition[] {
  return ALL_MODULES.filter(m => m.hasHotspots);
}

// ============================================================
// HOTSPOT TYPES (for map/location modules)
// ============================================================

export interface ModuleHotspot {
  id: string;
  x: number;           // percentage position (0-100)
  y: number;           // percentage position (0-100)
  label: string;       // Display name
  description?: string;
  revealFact?: string; // Additional fact shown on tap
  isCorrect?: boolean; // For quiz-type hotspots
  order?: number;      // For ordered sequences
}

export interface HotspotMapConfig {
  imageUrl: string;
  hotspots: ModuleHotspot[];
  instructions?: string;
  requireAllHotspots?: boolean;
  showLabelsOnHover?: boolean;
}

// ============================================================
// MODULE CONTENT BASE INTERFACES
// ============================================================

export interface BaseModuleContent {
  moduleType: string;
  title?: string;
  instructions?: string;
}

export interface HotspotModuleContent extends BaseModuleContent {
  moduleType: 'hotspot-map' | 'image-explore' | 'before-after' | 'tactical-deploy' | 'carrier-hunt';
  imageUrl: string;
  hotspots: ModuleHotspot[];
  afterImageUrl?: string;  // For before/after
}

export interface QuizModuleContent extends BaseModuleContent {
  moduleType: 'multiple-choice' | 'multi-select' | 'fill-blank' | 'two-truths' | 'fact-myth';
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctIndices?: number[];  // For multi-select
  correctAnswer?: string;     // For fill-blank
  explanation?: string;
}

export interface TimelineModuleContent extends BaseModuleContent {
  moduleType: 'chrono-order' | 'drag-categorize';
  items: Array<{
    id: string;
    text: string;
    date?: string;
    category?: string;
    order: number;
  }>;
}

// Union type for all module content
export type ModuleContent =
  | HotspotModuleContent
  | QuizModuleContent
  | TimelineModuleContent
  | BaseModuleContent;

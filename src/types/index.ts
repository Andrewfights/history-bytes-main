// Core data types for History Channel Trivia App

// ---- Rank System (17 Tiers) ----
export type Rank =
  | 'Time Tourist'
  | 'Archive Apprentice'
  | 'Fact Finder'
  | 'Chronicle Cadet'
  | 'Era Explorer'
  | 'Timeline Tracker'
  | 'Historical Detective'
  | 'Myth Breaker'
  | 'Primary Source Specialist'
  | 'Master of Eras'
  | 'Archive Architect'
  | 'Cultural Cartographer'
  | 'Historian'
  | 'Distinguished Historian'
  | 'Grand Historian'
  | 'Legendary Historian'
  | 'Rhodes Scholar';

export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'legendary';

export interface RankInfo {
  rank: Rank;
  icon: string;
  tier: RankTier;
  minXP: number;
}

export const RANK_DATA: RankInfo[] = [
  { rank: 'Time Tourist', icon: '🎫', tier: 'bronze', minXP: 0 },
  { rank: 'Archive Apprentice', icon: '📚', tier: 'bronze', minXP: 300 },
  { rank: 'Fact Finder', icon: '🔍', tier: 'bronze', minXP: 600 },
  { rank: 'Chronicle Cadet', icon: '📜', tier: 'silver', minXP: 1200 },
  { rank: 'Era Explorer', icon: '🧭', tier: 'silver', minXP: 2000 },
  { rank: 'Timeline Tracker', icon: '⏳', tier: 'silver', minXP: 3500 },
  { rank: 'Historical Detective', icon: '🕵️', tier: 'gold', minXP: 5000 },
  { rank: 'Myth Breaker', icon: '💡', tier: 'gold', minXP: 7000 },
  { rank: 'Primary Source Specialist', icon: '📰', tier: 'gold', minXP: 10000 },
  { rank: 'Master of Eras', icon: '🏛️', tier: 'platinum', minXP: 15000 },
  { rank: 'Archive Architect', icon: '🗂️', tier: 'platinum', minXP: 20000 },
  { rank: 'Cultural Cartographer', icon: '🗺️', tier: 'platinum', minXP: 25000 },
  { rank: 'Historian', icon: '🎓', tier: 'diamond', minXP: 30000 },
  { rank: 'Distinguished Historian', icon: '⭐', tier: 'diamond', minXP: 40000 },
  { rank: 'Grand Historian', icon: '👑', tier: 'diamond', minXP: 55000 },
  { rank: 'Legendary Historian', icon: '🏆', tier: 'legendary', minXP: 70000 },
  { rank: 'Rhodes Scholar', icon: '🎖️', tier: 'legendary', minXP: 100000 },
];

export function getRank(xp: number): Rank {
  for (let i = RANK_DATA.length - 1; i >= 0; i--) {
    if (xp >= RANK_DATA[i].minXP) {
      return RANK_DATA[i].rank;
    }
  }
  return 'Time Tourist';
}

export function getRankInfo(xp: number): RankInfo {
  for (let i = RANK_DATA.length - 1; i >= 0; i--) {
    if (xp >= RANK_DATA[i].minXP) {
      return RANK_DATA[i];
    }
  }
  return RANK_DATA[0];
}

export function getNextRankXP(xp: number): { next: Rank | null; threshold: number; current: number } {
  const currentIndex = RANK_DATA.findIndex((r, i) => {
    const nextRank = RANK_DATA[i + 1];
    return xp >= r.minXP && (!nextRank || xp < nextRank.minXP);
  });

  if (currentIndex === RANK_DATA.length - 1) {
    return { next: null, threshold: RANK_DATA[currentIndex].minXP, current: RANK_DATA[currentIndex].minXP };
  }

  const nextRank = RANK_DATA[currentIndex + 1];
  return {
    next: nextRank.rank,
    threshold: nextRank.minXP,
    current: RANK_DATA[currentIndex].minXP,
  };
}

// ---- Mastery System ----
export type MasteryState = 'unplayed' | 'played' | 'accurate' | 'mastered' | 'crowned';

// ---- Level Round Types ----
export interface TwoTruthsRound {
  type: 'two-truths';
  statements: string[];
  lieIndex: number;
  explanation: string;
}

export interface QuickFireRound {
  type: 'quick-fire';
  prompt: string;
  choices: string[];
  answerIndex: number;
  explanation: string;
}

export interface DecisionRound {
  type: 'decision';
  scenario: string;
  optionA: string;
  optionB: string;
  correctOption: 'A' | 'B';
  outcome: string;
  explanation: string;
}

export interface ChronoRound {
  type: 'chrono';
  events: { text: string; year: number }[];
}

export interface WhoAmIRound {
  type: 'who-am-i';
  clues: string[];
  answer: string;
  choices: string[];
  explanation: string;
}

export type LevelRound = TwoTruthsRound | QuickFireRound | DecisionRound | ChronoRound | WhoAmIRound;

// ---- Level Data ----
export interface LevelData {
  id: string;
  actId: string;
  title: string;
  hostName: string;
  hostQuote: string;
  rounds: LevelRound[];
  xpReward: number;
  isBoss?: boolean;
}

// ---- Arcade ----
export interface ArcadePlayRecord {
  playsToday: number;
  xpEarned: number;
  lastPlayDate: string;
}

export interface User {
  id: string;
  displayName: string;
  anonLeaderboard: boolean;
  xp: number;
  streak: number;
  lastActiveDate: string;
}

export interface Topic {
  id: string;
  title: string;
  slug: string;
  icon: string;
  chaptersCount: number;
  chronoOrder: number;
}

export interface Chapter {
  id: string;
  topicId: string;
  title: string;
  description: string;
  sessionsCount: number;
  completedSessions: number;
}

export interface Session {
  id: string;
  chapterId: string;
  title: string;
  duration: string;
  cardsCount: number;
  questionsCount: number;
}

export interface LessonCard {
  id: string;
  sessionId: string;
  title: string;
  body: string;
  keyFact?: string;
  imageUrl?: string;
  videoUrl?: string;
  videoDuration?: string;
}

export interface Question {
  id: string;
  sessionId: string;
  type: 'multiple-choice' | 'true-false' | 'order-events';
  prompt: string;
  choices: string[];
  answer: string | number;
  explanation: string;
  // Extended wrong answer feedback
  wrongAnswerExplanation?: string;
  wrongAnswerImageUrl?: string;
}

export interface Progress {
  userId: string;
  sessionId: string;
  score: number;
  xp: number;
  completedAt: string;
}

export interface DailyPuzzle {
  id: string;
  date: string;
  clues: string[];
  answer: number; // Year
  explanation: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  xp: number;
  isCurrentUser?: boolean;
}

export type TabType = 'home' | 'journey' | 'learn' | 'arcade' | 'watch' | 'profile';

export interface ExploreNode {
  id: string;
  title: string;
  type: 'lesson' | 'story' | 'language' | 'game';
  status: 'locked' | 'current' | 'completed';
  x: number; // percentage position
  y: number;
  icon: string;
}

// A row in the explore path — single node or branch choice
export interface ExploreRow {
  nodes: ExploreNode[];
  isBranch?: boolean; // true = user picks one path
}

export interface ArcadeGame {
  id: string;
  title: string;
  description: string;
  type: 'word' | 'chrono' | 'who-am-i' | 'map-lock' | 'quote-or-fake' | 'wordle' | 'two-truths' | 'guess-year' | 'anachronism' | 'connections' | 'map-mystery' | 'artifact' | 'cause-effect';
  icon: string;
  locked: boolean;
  xpReward: number;
}

// ---- Watch Tab (TikTok-style video feed) ----
export interface WatchVideo {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration: string;
  views?: number;
}

export interface WatchCategory {
  id: string;
  name: string;
  icon: string;
  videos: WatchVideo[];
}

// ---- Journey Mode (Duolingo-style learning path) ----

export interface Host {
  id: string;
  name: string;
  avatar: string;
  personality: 'guide' | 'historian' | 'character';
  catchphrases: string[];
}

export interface Arc {
  id: string;
  title: string;
  description: string;
  icon: string;
  hostId: string;
  chapters: JourneyChapter[];
  badge: string;
  totalXP: number;
  aiVideoUrl?: string; // AI-generated intro video
}

export interface JourneyChapter {
  id: string;
  arcId: string;
  title: string;
  description: string;
  order: number;
  nodes: JourneyNode[];
  isLocked: boolean;
  aiVideoUrl?: string; // AI-generated chapter intro
}

export type JourneyNodeType = 'two-truths' | 'found-tape' | 'headlines' | 'quiz-mix' | 'decision' | 'boss' | 'video-lesson' | 'image-explore' | 'chrono-order'
  // Pearl Harbor lesson types
  | 'video-hotspots' | 'radar-branching' | 'testimonies' | 'radio-headline' | 'battleship-row' | 'memorial-tour' | 'mastery-run';

export interface JourneyNode {
  id: string;
  chapterId: string;
  type: JourneyNodeType;
  title: string;
  order: number;
  content: JourneyNodeContent;
  xpReward: number;
  isCompleted?: boolean;
}

// Union type for all node content types
export type JourneyNodeContent =
  | TwoTruthsContent
  | FoundTapeContent
  | HeadlinesContent
  | QuizMixContent
  | DecisionContent
  | BossContent
  | VideoLessonContent
  | ImageExploreContent
  | ChronoOrderContent
  // Pearl Harbor lesson content types
  | VideoHotspotsContent
  | RadarBranchingContent
  | TestimoniesContent
  | RadioHeadlineContent
  | BattleshipRowContent
  | MemorialTourContent
  | MasteryRunContent;

// Node content types
export interface TwoTruthsContent {
  type: 'two-truths';
  statements: string[];
  lieIndex: number;
  explanation: string;
  hostReaction: string;
  context?: string; // Optional learning context shown before the game
  learningPoints?: string[]; // Optional bullet points of what to learn
}

export interface FoundTapeContent {
  type: 'found-tape';
  audioUrl: string;
  transcript: TranscriptLine[];
  title: string;
  context: string; // "Recording from the Bastille, 1789"
  questions: Question[];
}

export interface TranscriptLine {
  id: string;
  text: string;
  startTime: number; // seconds
  endTime: number;
}

export interface HeadlinesContent {
  type: 'headlines';
  publication: string; // "PARIS GAZETTE"
  date: string; // "July 14, 1789"
  headlines: Headline[];
  questions: Question[];
}

export interface Headline {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
}

export interface QuizMixContent {
  type: 'quiz-mix';
  questions: Question[];
}

export interface DecisionContent {
  type: 'decision';
  scenario: string;
  context: string;
  optionA: { label: string; outcome: string; isHistorical: boolean };
  optionB: { label: string; outcome: string; isHistorical: boolean };
  historicalOutcome: string;
  hostReaction: string;
}

export interface BossContent {
  type: 'boss';
  timeLimit: number; // seconds
  questions: Question[];
  xpMultiplier: number;
  hostIntro: string;
  hostVictory: string;
  hostDefeat: string;
}

// Video Lesson - Full-screen video with comprehension questions
export interface VideoLessonContent {
  type: 'video-lesson';
  videoUrl: string;
  title: string;
  context: string; // Setup text shown before video
  thumbnailUrl?: string;
  duration?: number; // seconds
  questions: Question[]; // 1-2 comprehension questions after video
  hostReaction: string;
}

// Image Explore - Interactive image with tappable hotspots
export interface ImageExploreContent {
  type: 'image-explore';
  imageUrl: string;
  imageType: 'photo' | 'map' | 'document' | 'propaganda';
  title: string;
  context: string;
  hotspots: ImageHotspot[];
  questions: Question[];
  hostReaction: string;
}

export interface ImageHotspot {
  id: string;
  x: number; // percentage position (0-100)
  y: number; // percentage position (0-100)
  label: string;
  description: string;
  revealFact?: string; // Additional fact revealed when tapped
}

// Chrono Order - Drag-to-order timeline game
export interface ChronoOrderContent {
  type: 'chrono-order';
  title: string;
  context: string;
  events: ChronoEvent[];
  explanation: string;
  hostReaction: string;
}

export interface ChronoEvent {
  id: string;
  text: string;
  date: string; // Display date after ordering
  year: number; // For sorting (use decimals for month precision, e.g., 1939.67)
  imageUrl?: string; // Optional thumbnail
}

// ---- Pearl Harbor Lesson Content Types ----

// Lesson 1: Video with Hotspots
export interface VideoHotspotsContent {
  type: 'video-hotspots';
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  hotspots: Array<{
    id: string;
    time: number; // seconds
    label: string;
    content: string;
    imageUrl?: string;
  }>;
  quizzes: Array<{
    id: string;
    type: 'date' | 'map-tap' | 'duration' | 'mcq';
    prompt: string;
    choices?: string[];
    correctAnswer: string | number | { x: number; y: number };
    explanation: string;
  }>;
  hostReaction: string;
}

// Lesson 2: Radar + Branching Choices
export interface RadarBranchingContent {
  type: 'radar-branching';
  radarConfig: {
    duration: number;
    targetCount: number;
  };
  scenario: string;
  choices: Array<{
    id: string;
    label: string;
    isHistorical: boolean;
    outcome: string;
    outcomeImageUrl?: string;
  }>;
  reflectionQuiz: {
    prompt: string;
    choices: string[];
    correctIndex: number;
    explanation: string;
  };
  hostReaction: string;
}

// Lesson 3: Audio Testimonies
export interface TestimoniesContent {
  type: 'testimonies';
  testimonies: Array<{
    id: string;
    name: string;
    role: string;
    imageUrl?: string;
    audioUrl: string;
    transcript: string;
    comprehensionQuestion: {
      prompt: string;
      choices: string[];
      correctIndex: number;
      explanation: string;
    };
  }>;
  hostReaction: string;
}

// Lesson 4: Radio Audio + Headline Builder
export interface RadioHeadlineContent {
  type: 'radio-headline';
  radioAudioUrl: string;
  radioBackgroundImageUrl?: string;
  markers: Array<{
    time: number;
    type: 'where' | 'who' | 'when';
    prompt: string;
    choices: string[];
    correctIndex: number;
  }>;
  headlineBuilder: {
    instruction: string;
    segments: string[];
    correctOrder: number[];
  };
  hostReaction: string;
}

// Lesson 5: Before/After + Ship Details + Timed Challenge
export interface BattleshipRowContent {
  type: 'battleship-row';
  beforeImageUrl: string;
  afterImageUrl: string;
  ships: Array<{
    id: string;
    name: string;
    x: number;
    y: number;
    casualties: number;
    status: string;
    fate: string;
    isTotalLoss: boolean;
  }>;
  timedChallenge: {
    prompt: string;
    timeLimit: number;
    correctShipIds: string[];
  };
  hostReaction: string;
}

// Lesson 6: Memorial Tour
export interface MemorialTourContent {
  type: 'memorial-tour';
  stops: Array<{
    id: string;
    title: string;
    imageUrl: string;
    description: string;
    hotspots: Array<{
      id: string;
      x: number;
      y: number;
      label: string;
      fact: string;
    }>;
  }>;
  reflection: {
    prompt: string;
    choices: string[];
  };
  hostReaction: string;
}

// Lesson 7: Mastery Quiz
export interface MasteryRunContent {
  type: 'mastery-run';
  questions: Array<{
    id: string;
    lessonSource: number; // 1-6, which lesson it's from
    type: 'mcq' | 'map-tap' | 'sequence' | 'image-tap' | 'audio-snippet' | 'fill-blank';
    prompt: string;
    choices?: string[];
    correctAnswer: string | number | number[];
    explanation: string;
    imageUrl?: string;
    audioUrl?: string;
  }>;
  passingScore: number;
  hostIntro: string;
  hostVictory: string;
  hostDefeat: string;
}

// Journey progress tracking
export interface JourneyProgress {
  arcId: string;
  chapterId: string;
  nodeId: string;
  completedNodes: string[];
  currentStreak: number;
}

// Two Truths game data for Arcade
export interface TwoTruthsQuestion {
  id: string;
  category: string;
  statements: string[];
  lieIndex: number;
  explanation: string;
}

// ---- New Arcade Game Types ----

// Spot the Anachronism
export interface AnachronismScene {
  id: string;
  era: string;
  year: string;
  setting: string;
  details: { id: string; text: string; isAnachronism: boolean }[];
  explanation: string;
}

// Historical Connections
export interface ConnectionsPuzzle {
  id: string;
  categories: {
    name: string;
    items: string[];
    difficulty: 1 | 2 | 3 | 4;
    color: 'yellow' | 'green' | 'blue' | 'purple';
  }[];
}

// Map Mysteries
export interface MapMystery {
  id: string;
  empireName: string;
  svgPath: string;
  options: string[];
  correctIndex: number;
  peakYear: string;
  funFact: string;
  modernRegion: string;
}

// Artifact Detective
export interface ArtifactCase {
  id: string;
  name: string;
  clues: string[];
  options: string[];
  correctIndex: number;
  revealText: string;
}

// Cause & Effect
export interface CauseEffectPair {
  id: string;
  type: 'cause-to-effect' | 'effect-to-cause';
  prompt: string;
  correctAnswer: string;
  wrongAnswers: string[];
  explanation: string;
  era: string;
}

// ---- Learn Tab (Course Platform) ----

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type CourseCategory = 'ancient-history' | 'medieval' | 'renaissance' | 'modern' | 'warfare' | 'culture';

export interface Instructor {
  id: string;
  name: string;
  title: string;
  avatar: string;
  bio: string;
  credentials?: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnailUrl: string;
  heroImageUrl: string;
  category: CourseCategory;
  difficulty: CourseDifficulty;
  totalDurationMinutes: number;
  rating: number;
  ratingsCount: number;
  enrolledCount: number;
  instructorId: string;
  unitsCount: number;
  lessonsCount: number;
  learningOutcomes: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  chronoOrder: number;
}

export interface Unit {
  id: string;
  courseId: string;
  order: number;
  title: string;
  description: string;
  lessonsCount: number;
  totalDurationMinutes: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  durationMinutes: number;
  cardsCount: number;
  questionsCount: number;
  xpReward: number;
}

export interface CourseCarouselRow {
  id: string;
  title: string;
  subtitle?: string;
  type: 'continue' | 'featured' | 'category' | 'new';
  courseIds: string[];
}

export interface CourseProgress {
  courseId: string;
  unitsCompleted: number;
  lessonsCompleted: number;
  totalLessons: number;
  currentUnitId?: string;
  currentLessonId?: string;
  lastAccessedAt: string;
  percentComplete: number;
}

// ---- Spirit Guides (Global Hosts for Onboarding) ----

export type SpiritGuidePersonality = 'wise' | 'bold' | 'witty' | 'scholarly' | 'regal' | 'adventurous';

export interface SpiritGuide {
  id: string;
  name: string;
  title: string;
  era: string;
  specialty: string;
  avatar: string;
  imageUrl?: string;
  introVideoUrl?: string;        // 5-15 second preview video for guide selection
  welcomeVideoUrl?: string;      // Welcome video after guide selection
  celebrationVideoUrl?: string;  // Celebration video for journey milestones
  introQuote: string;
  introStory?: string;           // 20-30 second personal story about the guide (for TTS)
  welcomeMessage: string;
  personality: SpiritGuidePersonality;
  primaryColor: string;
  secondaryColor: string;
  catchphrases: string[];
}

// ---- WW2 Module Hosts ----

export interface WW2Host {
  id: 'eisenhower' | 'journalist' | 'codebreaker';
  name: string;
  title: string;
  era: string;
  specialty: string;
  imageUrl?: string;         // Portrait image for carousel
  introVideoUrl?: string;    // 30s intro video for selection
  welcomeVideoUrl?: string;  // Return visit greeting video
  primaryColor: string;
  avatar: string;
  voiceStyle: string;
  description: string;
}

export interface UserWW2Preferences {
  selectedHostId: string | null;
  lastVisitDate: string;
  hasSeenIntro: boolean;
}

// ---- Pearl Harbor Module Types ----

export type PearlHarborGameType =
  // Attack Timeline (Hooks 1-2)
  | 'radar-blip'
  | 'plane-tracer'
  | 'wave-defense'
  | 'speech-reaction'
  // Devastation (Hooks 3-4)
  | 'before-after'
  | 'wreck-match'
  | 'voiced-letter'
  // Survival (Hooks 5-7)
  | 'panorama-tour'
  | 'escape-choice'
  | 'what-if'
  | 'first-person'
  // Strategic (Hooks 8-9)
  | 'carrier-hunt'
  | 'sub-puzzle'
  // Legacy Games (Hooks 10-11)
  | 'torpedo-dodge'
  | 'speech-blanks';

export type PearlHarborSection =
  | 'attack-timeline'
  | 'devastation'
  | 'survival'
  | 'strategic'
  | 'legacy-games';

export interface PearlHarborActivity {
  id: string;
  type: PearlHarborGameType;
  section: PearlHarborSection;
  title: string;
  description: string;
  xpReward: number;
  bucket: 'quizzes' | 'stories' | 'maps';
  isCompleted?: boolean;
}

// Radar Blip Game (Hook 1)
export interface RadarBlipConfig {
  type: 'radar-blip';
  duration: number;
  blips: Array<{
    id: string;
    appearAt: number;
    x: number;
    y: number;
    isHostile: boolean;
    label: string;
  }>;
  audioUrl?: string;
}

// Before/After Slider (Hook 3)
export interface BeforeAfterConfig {
  type: 'before-after';
  beforeImageUrl: string;
  afterImageUrl: string;
  beforeLabel: string;
  afterLabel: string;
  hotspots: Array<{
    x: number;
    y: number;
    label: string;
    fact: string;
  }>;
}

// Escape Choice (Hook 5)
export interface EscapeChoiceConfig {
  type: 'escape-choice';
  timeLimit: number;
  stages: Array<{
    id: string;
    narration: string;
    imageUrl?: string;
    choices: Array<{
      text: string;
      outcome: 'survive' | 'injury' | 'death';
      nextStageId?: string;
      explanation: string;
    }>;
  }>;
}

// Torpedo Dodge (Hook 10)
export interface TorpedoDodgeConfig {
  type: 'torpedo-dodge';
  duration: number;
  lanes: 3;
  torpedoes: Array<{
    launchAt: number;
    lane: 0 | 1 | 2;
    speed: 'slow' | 'medium' | 'fast';
  }>;
  maxHits: number;
}

// Speech Blanks (Hook 11)
export interface SpeechBlanksConfig {
  type: 'speech-blanks';
  audioUrl: string;
  transcript: string;
  blanks: Array<{
    position: number;
    correctWord: string;
    wordBank: string[];
  }>;
}

// Mastery Buckets (Hook 12)
export interface PearlHarborMasteryBuckets {
  quizzes: {
    items: string[];
    completedItems: string[];
    progress: number;
  };
  stories: {
    items: string[];
    completedItems: string[];
    progress: number;
  };
  maps: {
    items: string[];
    completedItems: string[];
    progress: number;
  };
}

export interface PearlHarborProgress {
  completedActivities: string[];
  unlockedLessons: string[]; // Lessons that have been started/skipped (can proceed to next)
  masteryBuckets: PearlHarborMasteryBuckets;
  currentStreak: number;
  lastPlayDate: string | null;
  totalXP: number;
  hasBattleshipRowBadge: boolean;
}

// ---- WW2 Theater Selection Types ----

export type WW2Theater = 'pacific' | 'european';

export type BattleStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface WW2Battle {
  id: string;
  theater: WW2Theater;
  name: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  globalOrder: number; // 1-10 display order across both theaters
  lessonCount: number;
  xpReward: number;
  description: string;
  unlockRequirement: string | null; // Battle ID that must be completed first
  isFirstStop?: boolean; // Pearl Harbor is the required first stop
}

export interface WW2TheaterProgress {
  completedBattles: string[];
  currentBattle: string | null;
  unlockedBattles: string[];
  totalXP: number;
  lastVisited: string | null;
}

// ---- Pantheon Souvenir Room Types ----

// Souvenir material tiers (visual quality based on performance)
export type SouvenirTier = 'gray' | 'bronze' | 'silver' | 'gold';

// Tier display names
export const SOUVENIR_TIER_NAMES: Record<SouvenirTier, string> = {
  gray: 'Completion',
  bronze: "Master's",
  silver: 'PhD',
  gold: 'Rhodes Scholar',
};

// Tier colors for UI
export const SOUVENIR_TIER_COLORS: Record<SouvenirTier, { primary: string; glow: string }> = {
  gray: { primary: '#9E9E9E', glow: '#757575' },
  bronze: { primary: '#CD7F32', glow: '#FFB300' },
  silver: { primary: '#C0C0C0', glow: '#E3F2FD' },
  gold: { primary: '#FFD700', glow: '#FFF8E1' },
};

// Individual souvenir definition (static data)
export interface Souvenir {
  id: string;                              // e.g., 'ww2-m1-helmet'
  worldId: string;                         // e.g., 'ww2'
  name: string;                            // e.g., 'M1 Combat Helmet'
  description: string;                     // Historical context
  significance: string;                    // Thematic meaning
  images: Record<SouvenirTier, string>;    // Image URLs per tier
}

// Player's progress for a single souvenir
export interface SouvenirProgress {
  souvenirId: string;
  currentTier: SouvenirTier;
  unlockedAt: string;                      // ISO date when first earned (gray tier)
  upgradedAt?: string;                     // ISO date of last tier upgrade
  examScores: number[];                    // Historical exam scores for tier calculation
}

// Full Pantheon state (persisted)
export interface PantheonProgress {
  souvenirs: Record<string, SouvenirProgress>;  // keyed by souvenirId
  lastVisited?: string;                         // ISO date
}

// World definition for Pantheon display
export interface PantheonWorld {
  id: string;
  name: string;
  souvenirId: string;
  order: number;
  isAvailable: boolean;  // false for "coming soon" worlds
}

/**
 * Pearl Harbor Lessons Data
 * 14-Beat Curriculum following Master Script v2
 * Total XP: 815 across 14 beats (665 core + 150 Final Exam)
 *
 * Includes 4 reusable beat types for future module creation:
 * - video-montage: Multiple short video scenes
 * - primary-source-audio: Historical documents with audio
 * - artifact-gallery: Swipeable item showcase
 * - audio-vocabulary: Interactive pronunciation learning
 *
 * ARCHIVED BEATS (components kept for potential future use):
 * - tora-tora-tora: ToraToraToraBeat.tsx
 * - nagumo-dilemma: NagumoDilemmaBeat.tsx
 * - fact-or-myth: FactOrMythBeat.tsx
 */

export type BeatType =
  | 'road-to-war'
  | 'radar-blip'
  | 'damage-done'
  | 'voices-harbor'
  | 'breaking-news'
  | 'mid-module-test'
  | 'day-of-infamy'
  | 'empty-war-chest'
  | 'arsenal-democracy'
  | 'mastery-run'
  | 'final-exam'
  // Reusable beat types for module creation
  | 'video-montage'      // Multiple short video scenes with recurring theme
  | 'primary-source-audio' // Historical documents with audio narration
  | 'artifact-gallery'   // Swipeable showcase of historical items
  | 'audio-vocabulary';  // Interactive pronunciation/language learning

// Archived beat types (kept for reference, not in active curriculum)
export type ArchivedBeatType =
  | 'tora-tora-tora'
  | 'nagumo-dilemma'
  | 'fact-or-myth';

export interface PearlHarborLesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  type: BeatType;
  icon: string;
  xpReward: number;
  description: string;
  screens: number;
  formats: string[]; // Quiver formats used
  narrativeArc: string;
  duration: string; // Estimated duration
}

export const PEARL_HARBOR_LESSONS: PearlHarborLesson[] = [
  {
    id: 'ph-beat-1',
    number: 1,
    title: 'Why Pearl Harbor?',
    subtitle: 'The Road to War',
    type: 'road-to-war',
    icon: '🗺️',
    xpReward: 45,
    description: 'Explore the events leading to December 7, 1941',
    screens: 5,
    formats: ['Interactive Map', 'Timed Challenge'],
    narrativeArc: 'Setup / Context',
    duration: '4-5 min',
  },
  {
    id: 'ph-beat-2',
    number: 2,
    title: 'The Radar Blip',
    subtitle: '7:02 AM',
    type: 'radar-blip',
    icon: '📡',
    xpReward: 50,
    description: 'Step into Private Lockard\'s shoes at Opana Point',
    screens: 7,
    formats: ['Branching Decision'],
    narrativeArc: 'Immersion / Warning',
    duration: '5-6 min',
  },
  // ARCHIVED: Tora! Tora! Tora! (was beat 3) - see ToraToraToraBeat.tsx
  {
    id: 'ph-beat-3',
    number: 3,
    title: 'Damage Done',
    subtitle: 'The Full Impact',
    type: 'damage-done',
    icon: '💥',
    xpReward: 55,
    description: 'Explore the timeline and full impact of the attack',
    screens: 5,
    formats: ['Interactive Timeline', 'Interactive Map'],
    narrativeArc: 'Impact / Consequences',
    duration: '5-7 min',
  },
  {
    id: 'ph-beat-4',
    number: 4,
    title: 'Voices from the Harbor',
    subtitle: 'Stories of December 7',
    type: 'voices-harbor',
    icon: '🎙️',
    xpReward: 50,
    description: 'Hear from those who lived through it',
    screens: 10,
    formats: ['Primary Source Moment'],
    narrativeArc: 'Human Scale',
    duration: '5-6 min',
  },
  {
    id: 'ph-beat-5',
    number: 5,
    title: 'Breaking News',
    subtitle: 'America Learns',
    type: 'breaking-news',
    icon: '📻',
    xpReward: 45,
    description: 'How America heard the news on that Sunday',
    screens: 6,
    formats: ['Audio Experience', 'Drag-and-Drop'],
    narrativeArc: 'Context / Transformation',
    duration: '4-5 min',
  },
  {
    id: 'ph-beat-5-5',
    number: 5,
    title: 'Knowledge Check',
    subtitle: 'Mid-Module Test',
    type: 'mid-module-test',
    icon: '🧠',
    xpReward: 50,
    description: 'Test your understanding of Pearl Harbor so far',
    screens: 5,
    formats: ['Multiple Choice Quiz'],
    narrativeArc: 'Assessment / Checkpoint',
    duration: '3-4 min',
  },
  // ARCHIVED: Nagumo's Dilemma (was beat 7) - see NagumoDilemmaBeat.tsx
  // ARCHIVED: Fact or Myth? (was beat 8) - see FactOrMythBeat.tsx
  {
    id: 'ph-beat-6',
    number: 6,
    title: 'Day of Infamy',
    subtitle: "FDR's Response",
    type: 'day-of-infamy',
    icon: '📜',
    xpReward: 50,
    description: 'Analyze FDR\'s historic speech',
    screens: 6,
    formats: ['Primary Source Moment', 'Drag-and-Drop'],
    narrativeArc: 'Resolution / Primary Source Analysis',
    duration: '5-6 min',
  },
  {
    id: 'ph-beat-7',
    number: 7,
    title: 'An Empty War Chest',
    subtitle: "America's Unpreparedness",
    type: 'empty-war-chest',
    icon: '📦',
    xpReward: 50,
    description: 'Discover how unprepared America was for war',
    screens: 5,
    formats: ['Interactive Comparison', 'Facts Grid'],
    narrativeArc: 'Context / Challenge',
    duration: '5-6 min',
  },
  {
    id: 'ph-beat-8',
    number: 8,
    title: 'Arsenal of Democracy',
    subtitle: 'America Transforms',
    type: 'arsenal-democracy',
    icon: '🏭',
    xpReward: 50,
    description: 'See how America mobilized for war',
    screens: 6,
    formats: ['Timed Challenge', 'Interactive Map'],
    narrativeArc: 'Legacy / Consequence',
    duration: '4-5 min',
  },
  {
    id: 'ph-beat-9',
    number: 9,
    title: 'Make It Do, Or Do Without',
    subtitle: 'The Home Front',
    type: 'video-montage',
    icon: '🏠',
    xpReward: 45,
    description: 'See how everyday Americans sacrificed for the war effort',
    screens: 6,
    formats: ['Video Montage', 'Quiz'],
    narrativeArc: 'Human Scale / Sacrifice',
    duration: '4-5 min',
  },
  {
    id: 'ph-beat-10',
    number: 10,
    title: 'Letters Home',
    subtitle: 'Voices from the Front',
    type: 'primary-source-audio',
    icon: '✉️',
    xpReward: 50,
    description: 'Hear the words of soldiers in their own voices',
    screens: 6,
    formats: ['Primary Source Audio', 'Reflection'],
    narrativeArc: 'Human Connection',
    duration: '5-6 min',
  },
  {
    id: 'ph-beat-11',
    number: 11,
    title: 'The Things They Carried',
    subtitle: 'Artifacts of War',
    type: 'artifact-gallery',
    icon: '🎒',
    xpReward: 45,
    description: 'Explore personal items that soldiers brought to war',
    screens: 6,
    formats: ['Artifact Gallery', 'Interactive Demo'],
    narrativeArc: 'Human Scale / Artifacts',
    duration: '4-5 min',
  },
  {
    id: 'ph-beat-12',
    number: 12,
    title: 'Code Talkers',
    subtitle: 'The Navajo Secret',
    type: 'audio-vocabulary',
    icon: '🦅',
    xpReward: 55,
    description: 'Learn about the unbreakable code and try speaking it',
    screens: 8,
    formats: ['Audio Vocabulary', 'Pronunciation Game'],
    narrativeArc: 'Legacy / Innovation',
    duration: '6-7 min',
  },
  {
    id: 'ph-beat-13',
    number: 13,
    title: 'Mastery Run',
    subtitle: 'Pearl Harbor Final Challenge',
    type: 'mastery-run',
    icon: '🏆',
    xpReward: 75,
    description: 'Prove your mastery with the final challenge',
    screens: 3,
    formats: ['Timed Challenge'],
    narrativeArc: 'Mastery / Assessment',
    duration: '6-8 min',
  },
  {
    id: 'ph-beat-14',
    number: 14,
    title: 'Final Exam',
    subtitle: 'Pearl Harbor Chapter Assessment',
    type: 'final-exam',
    icon: '📝',
    xpReward: 150,
    description: 'Complete the 15-question chapter assessment',
    screens: 15,
    formats: ['Multiple Choice', 'Fill-in-Blank', 'Multi-Select', 'Sequence Order'],
    narrativeArc: 'Comprehensive Assessment',
    duration: '15-20 min',
  },
];

export const TOTAL_XP = PEARL_HARBOR_LESSONS.reduce((sum, lesson) => sum + lesson.xpReward, 0);
// Total: 815 XP (665 XP core curriculum + 150 XP Final Exam)

export function getLessonById(id: string): PearlHarborLesson | undefined {
  return PEARL_HARBOR_LESSONS.find(lesson => lesson.id === id);
}

export function getNextLesson(currentId: string): PearlHarborLesson | undefined {
  const currentIndex = PEARL_HARBOR_LESSONS.findIndex(lesson => lesson.id === currentId);
  if (currentIndex >= 0 && currentIndex < PEARL_HARBOR_LESSONS.length - 1) {
    return PEARL_HARBOR_LESSONS[currentIndex + 1];
  }
  return undefined;
}

export function getLessonByNumber(number: number): PearlHarborLesson | undefined {
  return PEARL_HARBOR_LESSONS.find(lesson => lesson.number === number);
}

// XP Scoring tiers for Mastery Run (Beat 13)
export const MASTERY_SCORING = {
  perfect: { minCorrect: 12, xp: 75, badge: 'Pearl Harbor Scholar' },
  excellent: { minCorrect: 10, xp: 60, badge: null },
  good: { minCorrect: 8, xp: 45, badge: null },
  needsWork: { minCorrect: 0, xp: 30, badge: null },
};

// XP Scoring tiers for Final Exam (Beat 14)
export const FINAL_EXAM_SCORING = {
  perfect: { minCorrect: 15, xp: 150, badge: 'pearl-harbor-scholar', tier: 'Perfect Score', goldStar: true },
  expert: { minCorrect: 12, xp: 120, badge: 'pearl-harbor-expert', tier: 'Expert' },
  historian: { minCorrect: 9, xp: 90, badge: 'pearl-harbor-historian', tier: 'Passing' },
  review: { minCorrect: 6, xp: 60, badge: null, tier: 'Needs Review', promptRevisit: true },
  retry: { minCorrect: 0, xp: 30, badge: null, tier: 'Retry Recommended', promptRetry: true },
};

/**
 * Pearl Harbor Lessons Data
 * 10-Beat Curriculum following PRD specification
 * Total XP: 520 across 10 beats
 */

export type BeatType =
  | 'road-to-war'
  | 'radar-blip'
  | 'tora-tora-tora'
  | 'voices-harbor'
  | 'breaking-news'
  | 'nagumo-dilemma'
  | 'fact-or-myth'
  | 'day-of-infamy'
  | 'arsenal-democracy'
  | 'mastery-run'
  | 'final-exam';

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
  {
    id: 'ph-beat-3',
    number: 3,
    title: 'Tora! Tora! Tora!',
    subtitle: 'The Attack Begins',
    type: 'tora-tora-tora',
    icon: '✈️',
    xpReward: 50,
    description: 'Experience the attack minute by minute',
    screens: 6,
    formats: ['Interactive Map', 'Audio Experience'],
    narrativeArc: 'Reveal / Escalation',
    duration: '5-6 min',
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
    id: 'ph-beat-6',
    number: 6,
    title: "Nagumo's Dilemma",
    subtitle: 'The Third Wave',
    type: 'nagumo-dilemma',
    icon: '⚓',
    xpReward: 55,
    description: 'What if Japan had launched a third wave?',
    screens: 7,
    formats: ['Branching Decision'],
    narrativeArc: 'Decision / What If',
    duration: '6-7 min',
  },
  {
    id: 'ph-beat-7',
    number: 7,
    title: 'Fact or Myth?',
    subtitle: 'Pearl Harbor Legends',
    type: 'fact-or-myth',
    icon: '❓',
    xpReward: 50,
    description: 'Challenge common misconceptions',
    screens: 3,
    formats: ['Fact or Myth Quiz'],
    narrativeArc: 'Critical Thinking / Understanding',
    duration: '4-5 min',
  },
  {
    id: 'ph-beat-8',
    number: 8,
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
    id: 'ph-beat-9',
    number: 9,
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
    id: 'ph-beat-10',
    number: 10,
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
    id: 'ph-beat-11',
    number: 11,
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
// Total: 670 XP (520 XP core curriculum + 150 XP Final Exam)

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

// XP Scoring tiers for Mastery Run (Beat 10)
export const MASTERY_SCORING = {
  perfect: { minCorrect: 12, xp: 75, badge: 'Pearl Harbor Scholar' },
  excellent: { minCorrect: 10, xp: 60, badge: null },
  good: { minCorrect: 8, xp: 45, badge: null },
  needsWork: { minCorrect: 0, xp: 30, badge: null },
};

// XP Scoring tiers for Final Exam (Beat 11)
export const FINAL_EXAM_SCORING = {
  perfect: { minCorrect: 15, xp: 150, badge: 'pearl-harbor-scholar', tier: 'Perfect Score', goldStar: true },
  expert: { minCorrect: 12, xp: 120, badge: 'pearl-harbor-expert', tier: 'Expert' },
  historian: { minCorrect: 9, xp: 90, badge: 'pearl-harbor-historian', tier: 'Passing' },
  review: { minCorrect: 6, xp: 60, badge: null, tier: 'Needs Review', promptRevisit: true },
  retry: { minCorrect: 0, xp: 30, badge: null, tier: 'Retry Recommended', promptRetry: true },
};

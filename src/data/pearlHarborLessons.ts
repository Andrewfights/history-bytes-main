/**
 * Pearl Harbor Lessons Data
 * 7 structured lessons following Duolingo-style progression
 */

export interface PearlHarborLesson {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  type: 'video-hotspots' | 'radar-branching' | 'testimonies' | 'radio-headline' | 'battleship-row' | 'memorial-tour' | 'mastery-run';
  icon: string;
  xpReward: number;
  description: string;
  screens: number; // Number of screens in this lesson
}

export const PEARL_HARBOR_LESSONS: PearlHarborLesson[] = [
  {
    id: 'ph-lesson-1',
    number: 1,
    title: 'Morning of the Attack',
    subtitle: 'December 7, 1941',
    type: 'video-hotspots',
    icon: '🎬',
    xpReward: 40,
    description: 'Watch the story of the surprise attack unfold',
    screens: 7, // Title, Video+Hotspots, Recap, Quiz1, Quiz2, Quiz3, Completion
  },
  {
    id: 'ph-lesson-2',
    number: 2,
    title: 'Radar Warning',
    subtitle: 'What Would You Do?',
    type: 'radar-branching',
    icon: '📡',
    xpReward: 45,
    description: 'Step into the officer\'s shoes at Opana Point',
    screens: 6, // Setup, Radar Game, Choice, Outcome, Reflection, Completion
  },
  {
    id: 'ph-lesson-3',
    number: 3,
    title: 'Voices from Pearl Harbor',
    subtitle: 'Primary Sources',
    type: 'testimonies',
    icon: '🎙️',
    xpReward: 50,
    description: 'Hear from people who were there',
    screens: 5, // Intro, Voice1+Q, Voice2+Q, Voice3+Q, Completion
  },
  {
    id: 'ph-lesson-4',
    number: 4,
    title: 'Radio Break-In',
    subtitle: 'Audio Experience',
    type: 'radio-headline',
    icon: '📻',
    xpReward: 45,
    description: 'How Americans heard the news',
    screens: 5, // Setup, Radio+Taps, Headline Builder, FDR Card, Completion
  },
  {
    id: 'ph-lesson-5',
    number: 5,
    title: 'Battleship Row',
    subtitle: 'Before & After',
    type: 'battleship-row',
    icon: '🚢',
    xpReward: 50,
    description: 'Explore the devastation of the attack',
    screens: 5, // Intro, Slider, Ship Details, Timed Challenge, Completion
  },
  {
    id: 'ph-lesson-6',
    number: 6,
    title: 'Arizona Memorial',
    subtitle: 'Inside the Memorial',
    type: 'memorial-tour',
    icon: '🏛️',
    xpReward: 55,
    description: 'Visit the USS Arizona Memorial',
    screens: 5, // Entry, Panorama Tour, Hotspots, Reflection, Completion
  },
  {
    id: 'ph-lesson-7',
    number: 7,
    title: 'Mastery Run',
    subtitle: 'Pearl Harbor Challenge',
    type: 'mastery-run',
    icon: '👑',
    xpReward: 65,
    description: 'Put everything together in one challenge',
    screens: 3, // Briefing, Questions, Results
  },
];

export const TOTAL_XP = PEARL_HARBOR_LESSONS.reduce((sum, lesson) => sum + lesson.xpReward, 0);

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

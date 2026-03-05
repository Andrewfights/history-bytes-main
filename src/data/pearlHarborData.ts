/**
 * Pearl Harbor Module Data - Activities organized by section
 */

import { PearlHarborActivity, PearlHarborSection, PearlHarborMasteryBuckets } from '@/types';

export const PEARL_HARBOR_SECTIONS: { id: PearlHarborSection; title: string; description: string; icon: string }[] = [
  {
    id: 'attack-timeline',
    title: 'Attack Timeline',
    description: 'Experience the morning of December 7, 1941',
    icon: '📡',
  },
  {
    id: 'devastation',
    title: 'Devastation',
    description: 'Witness the destruction of Battleship Row',
    icon: '💥',
  },
  {
    id: 'survival',
    title: 'Survival Tales',
    description: 'Stories of heroism and survival',
    icon: '🎖️',
  },
  {
    id: 'strategic',
    title: 'Strategic Surprises',
    description: 'The turning point of naval warfare',
    icon: '🎯',
  },
  {
    id: 'legacy-games',
    title: 'Legacy Games',
    description: 'Test your knowledge with fun challenges',
    icon: '🎮',
  },
];

export const PEARL_HARBOR_ACTIVITIES: PearlHarborActivity[] = [
  // Attack Timeline (Hooks 1-2)
  {
    id: 'radar-blip',
    type: 'radar-blip',
    section: 'attack-timeline',
    title: 'Radar Blip',
    description: 'Spot incoming blips on the radar screen at Opana Point',
    xpReward: 25,
    bucket: 'quizzes',
  },
  {
    id: 'plane-tracer',
    type: 'plane-tracer',
    section: 'attack-timeline',
    title: 'Plane Wave Tracer',
    description: 'Trace the attack wave paths over Oahu',
    xpReward: 30,
    bucket: 'maps',
  },
  {
    id: 'wave-defense',
    type: 'wave-defense',
    section: 'attack-timeline',
    title: 'Wave Defense',
    description: 'Defend against the two waves of attack',
    xpReward: 35,
    bucket: 'quizzes',
  },
  {
    id: 'speech-reaction',
    type: 'speech-reaction',
    section: 'attack-timeline',
    title: 'FDR Speech Reaction',
    description: 'React to FDR\'s Day of Infamy speech',
    xpReward: 25,
    bucket: 'stories',
  },

  // Devastation (Hooks 3-4)
  {
    id: 'before-after',
    type: 'before-after',
    section: 'devastation',
    title: 'Before & After',
    description: 'Compare Battleship Row before and after the attack',
    xpReward: 20,
    bucket: 'maps',
  },
  {
    id: 'wreck-match',
    type: 'wreck-match',
    section: 'devastation',
    title: 'Wreck Match',
    description: 'Match ships to their casualty counts',
    xpReward: 30,
    bucket: 'quizzes',
  },
  {
    id: 'voiced-letter',
    type: 'voiced-letter',
    section: 'devastation',
    title: 'Voiced Letter',
    description: 'Listen to Jane Colestock\'s firsthand account',
    xpReward: 25,
    bucket: 'stories',
  },

  // Survival (Hooks 5-7)
  {
    id: 'panorama-tour',
    type: 'panorama-tour',
    section: 'survival',
    title: 'USS Arizona Tour',
    description: '360° tour of the USS Arizona wreck',
    xpReward: 35,
    bucket: 'maps',
  },
  {
    id: 'escape-choice',
    type: 'escape-choice',
    section: 'survival',
    title: 'Escape the Blaze',
    description: 'Make life-or-death decisions to survive',
    xpReward: 50,
    bucket: 'stories',
  },
  {
    id: 'what-if',
    type: 'what-if',
    section: 'survival',
    title: 'What If?',
    description: 'What if the radar warning was relayed?',
    xpReward: 40,
    bucket: 'quizzes',
  },
  {
    id: 'first-person',
    type: 'first-person',
    section: 'survival',
    title: 'Jack Holder\'s Story',
    description: 'Experience the attack through a survivor\'s eyes',
    xpReward: 45,
    bucket: 'stories',
  },

  // Strategic (Hooks 8-9)
  {
    id: 'carrier-hunt',
    type: 'carrier-hunt',
    section: 'strategic',
    title: 'Hunt the Carriers',
    description: 'Locate the absent aircraft carriers',
    xpReward: 30,
    bucket: 'maps',
  },
  {
    id: 'sub-puzzle',
    type: 'sub-puzzle',
    section: 'strategic',
    title: 'Submarine Puzzle',
    description: 'Assemble the midget sub and hear crew logs',
    xpReward: 25,
    bucket: 'stories',
  },

  // Legacy Games (Hooks 10-11)
  {
    id: 'torpedo-dodge',
    type: 'torpedo-dodge',
    section: 'legacy-games',
    title: 'Torpedo Alley',
    description: 'Dodge incoming torpedoes in this timing game',
    xpReward: 25,
    bucket: 'quizzes',
  },
  {
    id: 'speech-blanks',
    type: 'speech-blanks',
    section: 'legacy-games',
    title: 'Day of Infamy Speech',
    description: 'Fill in the blanks of FDR\'s famous speech',
    xpReward: 30,
    bucket: 'quizzes',
  },
];

export const INITIAL_MASTERY_BUCKETS: PearlHarborMasteryBuckets = {
  quizzes: {
    items: ['radar-blip', 'wave-defense', 'wreck-match', 'what-if', 'torpedo-dodge', 'speech-blanks'],
    completedItems: [],
    progress: 0,
  },
  stories: {
    items: ['speech-reaction', 'voiced-letter', 'escape-choice', 'first-person', 'sub-puzzle'],
    completedItems: [],
    progress: 0,
  },
  maps: {
    items: ['plane-tracer', 'before-after', 'panorama-tour', 'carrier-hunt'],
    completedItems: [],
    progress: 0,
  },
};

export function getActivityById(id: string): PearlHarborActivity | undefined {
  return PEARL_HARBOR_ACTIVITIES.find(a => a.id === id);
}

export function getActivitiesBySection(section: PearlHarborSection): PearlHarborActivity[] {
  return PEARL_HARBOR_ACTIVITIES.filter(a => a.section === section);
}

export function getSectionById(id: PearlHarborSection) {
  return PEARL_HARBOR_SECTIONS.find(s => s.id === id);
}

export function calculateTotalXP(): number {
  return PEARL_HARBOR_ACTIVITIES.reduce((sum, a) => sum + a.xpReward, 0);
}

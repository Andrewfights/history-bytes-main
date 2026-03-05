// Ghost Army Funnel Experience Data
// This is a self-contained data file for the WW2 demo funnel experience

export interface GhostArmyQuestion {
  id: string;
  prompt: string;
  choices: string[];
  answer: number;
  explanation: string;
}

export interface InteractionTrigger {
  timestamp: number; // Seconds into video
  type: 'comprehension' | 'aha' | 'final-quiz';
  questionId?: string; // Single question
  questionIds?: string[]; // Multiple questions (for final quiz)
}

export interface GhostArmyContent {
  id: string;
  title: string;
  context: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  xpReward: number;
  interactionTriggers: InteractionTrigger[];
  questions: GhostArmyQuestion[];
  completionMessage: string;
}

export const ghostArmyContent: GhostArmyContent = {
  id: 'ww2-ghost-army',
  title: 'The Ghost Army',
  context: 'A classified deception unit that fooled the Nazis with inflatable tanks, sound effects, and theatrical performances.',
  // Using a placeholder video URL - can be replaced with actual content
  videoUrl: 'https://www.youtube.com/embed/1AvLMl9pHKE?autoplay=0&controls=1&modestbranding=1&rel=0',
  thumbnailUrl: 'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?auto=format&w=800',
  duration: 300, // 5 minutes
  xpReward: 320,
  interactionTriggers: [
    { timestamp: 60, type: 'comprehension', questionId: 'ga-q1' },
    { timestamp: 180, type: 'aha', questionId: 'ga-q2' },
    { timestamp: 280, type: 'final-quiz', questionIds: ['ga-q3', 'ga-q4', 'ga-q5'] },
  ],
  questions: [
    {
      id: 'ga-q1',
      prompt: "What was the Ghost Army's primary mission?",
      choices: ['Direct combat', 'Deceiving the enemy', 'Medical support', 'Communications'],
      answer: 1,
      explanation: 'The Ghost Army specialized in tactical deception, using fake tanks, sound trucks, and radio tricks to mislead German forces about Allied positions and strength.',
    },
    {
      id: 'ga-q2',
      prompt: 'Which of these was NOT a deception technique used by the Ghost Army?',
      choices: ['Inflatable tanks', 'Sound trucks', 'Fake radio transmissions', 'Trained carrier pigeons'],
      answer: 3,
      explanation: 'The Ghost Army used inflatable tanks, sound effects broadcast from trucks, and fake radio transmissions - but not carrier pigeons. Their deception was technological and theatrical.',
    },
    {
      id: 'ga-q3',
      prompt: 'How many soldiers made up the Ghost Army?',
      choices: ['About 500', 'About 1,100', 'About 5,000', 'About 10,000'],
      answer: 1,
      explanation: 'The 23rd Headquarters Special Troops consisted of about 1,100 men who impersonated much larger forces - sometimes pretending to be 30,000 troops.',
    },
    {
      id: 'ga-q4',
      prompt: 'Many Ghost Army members later became famous in what field?',
      choices: ['Politics', 'Military leadership', 'Art and design', 'Medicine'],
      answer: 2,
      explanation: 'The unit recruited artists and designers. Fashion designer Bill Blass and painter Ellsworth Kelly were among its members, using their creative skills for military deception.',
    },
    {
      id: 'ga-q5',
      prompt: 'When was the Ghost Army officially declassified?',
      choices: ['1946', '1965', '1996', '2013'],
      answer: 2,
      explanation: 'The Ghost Army remained classified for over 50 years until 1996. Their incredible story of artistic warfare finally became public knowledge.',
    },
  ],
  completionMessage: 'The art of deception saved thousands of Allied lives and helped turn the tide of World War II.',
};

// Get a question by ID
export function getGhostArmyQuestion(id: string): GhostArmyQuestion | undefined {
  return ghostArmyContent.questions.find(q => q.id === id);
}

// Get questions by IDs (for final quiz)
export function getGhostArmyQuestions(ids: string[]): GhostArmyQuestion[] {
  return ids.map(id => ghostArmyContent.questions.find(q => q.id === id)).filter(Boolean) as GhostArmyQuestion[];
}

// Get the next uncompleted interaction trigger
export function getNextInteraction(
  currentTime: number,
  completedInteractions: string[]
): InteractionTrigger | null {
  for (const trigger of ghostArmyContent.interactionTriggers) {
    const triggerId = trigger.questionId || trigger.questionIds?.join(',') || '';
    if (currentTime >= trigger.timestamp && !completedInteractions.includes(triggerId)) {
      return trigger;
    }
  }
  return null;
}

// Calculate max seekable time based on completed interactions
export function getMaxSeekableTime(completedInteractions: string[]): number {
  let maxTime = 0;

  for (const trigger of ghostArmyContent.interactionTriggers) {
    const triggerId = trigger.questionId || trigger.questionIds?.join(',') || '';
    if (completedInteractions.includes(triggerId)) {
      maxTime = Math.max(maxTime, trigger.timestamp);
    }
  }

  // Allow 10 seconds buffer past last completed interaction
  return maxTime > 0 ? maxTime + 10 : 60; // Start with first 60 seconds available
}

/**
 * Pearl Harbor Final Exam - Question Data
 * 10 questions: 4 Easy, 4 Medium, 2 Hard
 * Updated with new WW2 module curriculum questions
 */

import type { ExamQuestion } from './types';

export const FINAL_EXAM_QUESTIONS: ExamQuestion[] = [
  // ============================================================
  // EASY TIER (Questions 1-4) - Direct recall
  // ============================================================

  // Q1: Multiple Choice - Start of WWII
  {
    id: 'exam-q1',
    questionNumber: 1,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'What event is widely considered the official start of World War II?',
    options: ['Japan invades China', 'Germany invades Poland', 'The attack on Pearl Harbor', 'Germany invades France'],
    correctIndex: 1,
    explanation:
      'Germany\'s invasion of Poland on September 1, 1939 is widely considered the official start of World War II. This led Britain and France to declare war on Germany two days later.',
    sourceBeat: 1,
    hostDirection:
      'Let\'s start with the basics. Do you know what event kicked off the entire war?',
    hostMode: 'pip',
    category: 'Timeline',
  },

  // Q2: Multiple Choice - Blitzkrieg
  {
    id: 'exam-q2',
    questionNumber: 2,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'What does the term Blitzkrieg mean?',
    options: ['Total war', 'Lightning war', 'Air superiority', 'Quick surrender'],
    correctIndex: 1,
    explanation:
      'Blitzkrieg, meaning "lightning war" in German, was a military tactic designed to create disorganization among enemy forces through the use of mobile forces and locally concentrated firepower.',
    sourceBeat: 1,
    hostDirection:
      'The Germans had a new way of fighting. Do you know what they called it?',
    hostMode: 'pip',
    category: 'Military',
  },

  // Q3: Multiple Choice - Radar Technology
  {
    id: 'exam-q3',
    questionNumber: 3,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'What was the major new technology that detected incoming aircraft on the morning of Pearl Harbor?',
    options: ['Sonar', 'Radar', 'Satellite imaging', 'Telegraph intercepts'],
    correctIndex: 1,
    explanation:
      'Radar (Radio Detection and Ranging) was the new technology that detected the incoming Japanese aircraft. Privates Lockard and Elliott spotted the attack force on their SCR-270B radar at Opana Point at 7:02 AM, 53 minutes before the attack began.',
    sourceBeat: 2,
    hostDirection:
      'A new technology gave the U.S. a chance to see the attack coming. What was it?',
    hostMode: 'pip',
    category: 'Technology',
  },

  // Q4: Multiple Choice - USS Arizona
  {
    id: 'exam-q4',
    questionNumber: 4,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'Which battleship explosion caused the greatest loss of life during the attack?',
    options: ['USS Nevada', 'USS Oklahoma', 'USS Arizona', 'USS Shaw'],
    correctIndex: 2,
    explanation:
      'The USS Arizona suffered a catastrophic explosion when a bomb penetrated its forward magazine, killing 1,177 crew members - nearly half of the total American casualties that day. The ship sank in less than nine minutes.',
    sourceBeat: 3,
    hostDirection:
      'One ship\'s destruction became the symbol of that terrible day. Which one was it?',
    hostMode: 'pip',
    category: 'Attack',
  },

  // ============================================================
  // MEDIUM TIER (Questions 5-8) - Connecting concepts
  // ============================================================

  // Q5: Multiple Choice - American Isolationism
  {
    id: 'exam-q5',
    questionNumber: 5,
    type: 'multiple-choice',
    difficulty: 'medium',
    prompt: 'Why did many Americans initially want to avoid entering World War II?',
    options: [
      'They believed Germany would win too quickly',
      'The U.S. economy was too strong to risk',
      'They were still affected by WWI and the Great Depression',
      'They had already signed an alliance with Japan',
    ],
    correctIndex: 2,
    explanation:
      'Many Americans were still scarred by the losses of World War I (over 116,000 American deaths) and the economic hardship of the Great Depression. The isolationist movement was strong, with organizations like the America First Committee advocating for staying out of European conflicts.',
    sourceBeat: 1,
    hostDirection:
      'Before Pearl Harbor, most Americans wanted nothing to do with another war. Why was that?',
    hostMode: 'voice-only',
    category: 'Politics',
  },

  // Q6: Multiple Choice - Radar Warning Dismissed
  {
    id: 'exam-q6',
    questionNumber: 6,
    type: 'multiple-choice',
    difficulty: 'medium',
    prompt: 'What mistake was made after the radar operators detected a massive formation approaching Oahu?',
    options: [
      'They assumed it was a weather storm',
      'They fired on American planes',
      'The warning was dismissed as expected U.S. aircraft',
      'The radar system malfunctioned',
    ],
    correctIndex: 2,
    explanation:
      'When Private Lockard reported the massive radar contact to Lieutenant Kermit Tyler at Fort Shafter, Tyler assumed it was a flight of B-17 bombers expected from the mainland and told him "Don\'t worry about it." This tragic assumption cost precious warning time.',
    sourceBeat: 2,
    hostDirection:
      'The warning came through, but it was ignored. What went wrong?',
    hostMode: 'voice-only',
    category: 'Warning',
  },

  // Q7: Multiple Choice - Attack Duration
  {
    id: 'exam-q7',
    questionNumber: 7,
    type: 'multiple-choice',
    difficulty: 'medium',
    prompt: 'Approximately how long did the Pearl Harbor attack last?',
    options: ['20 minutes', '2 hours', '8 hours', '2 full days'],
    correctIndex: 1,
    explanation:
      'The attack lasted approximately 2 hours, from 7:55 AM to around 9:45 AM. It came in two waves: the first wave struck at 7:55 AM with 183 aircraft, and the second wave arrived around 8:50 AM with 170 aircraft.',
    sourceBeat: 3,
    hostDirection:
      'The attack felt like an eternity to those who lived through it. How long did it actually last?',
    hostMode: 'voice-only',
    category: 'Attack',
  },

  // Q8: Multiple Choice - Radio News
  {
    id: 'exam-q8',
    questionNumber: 8,
    type: 'multiple-choice',
    difficulty: 'medium',
    prompt: 'What made Pearl Harbor different from previous U.S. crises in terms of how fast Americans learned about it?',
    options: [
      'Television broadcasts spread the news instantly',
      'Newspapers were delivered by airplane',
      'Most American households had radios by 1941',
      'The military sent out mass letters',
    ],
    correctIndex: 2,
    explanation:
      'By 1941, over 80% of American households owned a radio. News of the attack interrupted regular Sunday programming across the nation, allowing millions of Americans to learn about the attack within minutes - an unprecedented speed for the time.',
    sourceBeat: 5,
    hostDirection:
      'Pearl Harbor was the first crisis Americans experienced in real-time. What made that possible?',
    hostMode: 'voice-only',
    category: 'Impact',
  },

  // ============================================================
  // HARD TIER (Questions 9-10) - Analysis and synthesis
  // ============================================================

  // Q9: Multiple Choice - FDR Infamy Speech
  {
    id: 'exam-q9',
    questionNumber: 9,
    type: 'multiple-choice',
    difficulty: 'hard',
    prompt: 'Which famous phrase from Roosevelt\'s speech replaced the original wording "a date which will live in world history"?',
    options: [
      '"A date that will bring victory"',
      '"A date that will live in infamy"',
      '"A date that will unite the world"',
      '"A date that will never be forgotten"',
    ],
    correctIndex: 1,
    explanation:
      'Roosevelt personally edited his speech, crossing out "world history" and writing "infamy" above it. This single word choice transformed a factual statement into one of the most iconic lines in American political rhetoric. The original draft with his handwritten edit is preserved at the National Archives.',
    sourceBeat: 6,
    hostDirection:
      'FDR was a master of words. One edit changed history. What word did he choose?',
    hostMode: 'voice-only',
    category: 'Primary Source',
  },

  // Q10: Multiple Choice - Military Unpreparedness
  {
    id: 'exam-q10',
    questionNumber: 10,
    type: 'multiple-choice',
    difficulty: 'hard',
    prompt: 'Which problem best describes how unprepared the U.S. military was immediately after Pearl Harbor?',
    options: [
      'The U.S. had no Navy at all',
      'The U.S. had too many tanks but not enough planes',
      'The U.S. had shortages in tanks, rifles, and ammunition supplies',
      'The U.S. refused to train new soldiers',
    ],
    correctIndex: 2,
    explanation:
      'Despite being an industrial powerhouse, the U.S. military was severely unprepared for war in December 1941. The Army had critical shortages of tanks, rifles, and ammunition. Soldiers trained with wooden mock-ups of weapons and trucks labeled "TANK." It took the full mobilization of American industry to transform this under-equipped force into the arsenal of democracy.',
    sourceBeat: 7,
    hostDirection:
      'America had to fight a war it wasn\'t ready for. What was the biggest problem?',
    hostMode: 'voice-only',
    category: 'Mobilization',
  },
];

// ---- Helper to get questions by difficulty ----

export function getQuestionsByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): ExamQuestion[] {
  return FINAL_EXAM_QUESTIONS.filter((q) => q.difficulty === difficulty);
}

// ---- Helper to get question by ID ----

export function getQuestionById(id: string): ExamQuestion | undefined {
  return FINAL_EXAM_QUESTIONS.find((q) => q.id === id);
}

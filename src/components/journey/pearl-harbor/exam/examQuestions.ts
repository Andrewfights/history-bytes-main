/**
 * Pearl Harbor Final Exam - Question Data
 * 15 questions: 5 Easy, 5 Medium, 5 Hard
 * All content sourced from PRD specifications
 */

import type { ExamQuestion } from './types';

export const FINAL_EXAM_QUESTIONS: ExamQuestion[] = [
  // ============================================================
  // EASY TIER (Questions 1-5) - Direct recall
  // ============================================================

  // Q1: Multiple Choice - Attack Time
  {
    id: 'exam-q1',
    questionNumber: 1,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'What time did the first bombs fall on Pearl Harbor on the morning of December 7, 1941?',
    options: ['6:30 AM', '7:02 AM', '7:55 AM', '8:10 AM'],
    correctIndex: 2,
    explanation:
      'The first wave began its attack at 7:55 AM Hawaiian time. While 7:02 AM is when radar detected the incoming planes, and 8:10 AM is when the Arizona exploded, the actual bombing commenced at 7:55.',
    sourceBeat: 3,
    hostDirection:
      "Let's start with the basics. Can you tell me when the first bombs actually fell?",
    hostMode: 'pip',
    category: 'Timeline',
  },

  // Q2: Multiple Choice - Doris Miller
  {
    id: 'exam-q2',
    questionNumber: 2,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'Who was the first African American to receive the Navy Cross for his actions during the attack?',
    options: ['Ted Tsukiyama', 'Doris Miller', 'Joseph Lockard', 'Donald Stratton'],
    correctIndex: 1,
    explanation:
      "Mess Attendant 2nd Class Doris Miller of the USS West Virginia, the ship's heavyweight boxing champion, carried wounded Captain Bennion to safety and then manned a .50-caliber machine gun with no formal training for 15 minutes. He was the first African American to receive the Navy Cross. He was killed in action in 1943 aboard the USS Liscome Bay. The future aircraft carrier CVN-81 will bear his name.",
    sourceBeat: 4,
    hostDirection:
      'This question is about one of the most remarkable acts of bravery that morning. A man who was denied combat training because of the color of his skin.',
    hostMode: 'pip',
    category: 'Heroes',
  },

  // Q3: Fill-in-the-Blank - FDR Infamy
  {
    id: 'exam-q3',
    questionNumber: 3,
    type: 'fill-in-blank',
    difficulty: 'easy',
    prompt:
      "In his famous address to Congress, President Roosevelt changed one key word in the opening line. He replaced 'a date which will live in world history' with what phrase?",
    blankPrompt: "...a date which will live in ______",
    correctAnswers: ['infamy', 'Infamy', 'INFAMY'],
    caseSensitive: false,
    wordOptions: ['tragedy', 'infamy', 'darkness'],
    explanation:
      "Roosevelt personally edited the speech, crossing out 'world history' and writing 'infamy' above it in his own hand. This single word choice transformed a factual statement into one of the most iconic lines in American political rhetoric. The original drafts are preserved at the National Archives.",
    sourceBeat: 8,
    hostDirection:
      'FDR was a masterful communicator. One word changed everything about how America remembered this day. Can you fill in the blank?',
    hostMode: 'voice-only',
    category: 'Primary Source',
  },

  // Q4: Multiple Choice - Aircraft Count
  {
    id: 'exam-q4',
    questionNumber: 4,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'How many Japanese aircraft launched from the carrier fleet to attack Pearl Harbor?',
    options: ['183', '270', '353', '414'],
    correctIndex: 2,
    explanation:
      'A total of 353 aircraft launched from 6 carriers: 183 in the first wave (40 torpedo bombers, 49 horizontal bombers, 51 dive bombers, 43 fighters) and 170 in the second wave (54 horizontal bombers, 78 dive bombers, 36 fighters). The fleet launched from approximately 230 miles north of Oahu after a 3,500-mile voyage from Hitokappu Bay.',
    sourceBeat: 3,
    hostDirection:
      'The Japanese strike force was massive. Do you remember the total number of aircraft that flew toward Oahu that morning?',
    hostMode: 'voice-only',
    category: 'Attack',
  },

  // Q5: Multiple Choice - Jeannette Rankin
  {
    id: 'exam-q5',
    questionNumber: 5,
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'What was the sole vote against declaring war on Japan in Congress?',
    options: [
      'Senator Gerald Nye',
      'Charles Lindbergh',
      'Representative Jeannette Rankin',
      'Senator Burton Wheeler',
    ],
    correctIndex: 2,
    explanation:
      "Jeannette Rankin of Montana was the sole vote against declaring war. The House voted 388-1 and the Senate 82-0. Remarkably, Rankin had also voted against entering World War I in 1917, making her the only member of Congress to vote against both World Wars. She was a lifelong pacifist who said, 'As a woman, I can't go to war, and I refuse to send anyone else.'",
    sourceBeat: 5,
    hostDirection:
      'Nearly everyone in Congress agreed. But one person stood alone. Do you know who it was?',
    hostMode: 'pip',
    category: 'Politics',
  },

  // ============================================================
  // MEDIUM TIER (Questions 6-10) - Connecting concepts
  // ============================================================

  // Q6: Multiple Choice - Wheeler Field
  {
    id: 'exam-q6',
    questionNumber: 6,
    type: 'multiple-choice',
    difficulty: 'medium',
    prompt:
      'American planes at Wheeler Field were parked wingtip-to-wingtip on the morning of the attack. Why were they arranged this way?',
    options: [
      "There wasn't enough hangar space",
      'It was an anti-sabotage precaution to make them easier to guard',
      'Pilots needed to taxi quickly for a scramble drill',
      'They were being prepared for a demonstration flyover',
    ],
    correctIndex: 1,
    explanation:
      'General Short had placed the Hawaiian command on Alert Level 1, which focused entirely on the threat of internal sabotage from the local Japanese population, not on an external air attack. Planes were clustered tightly so they could be guarded more easily against ground-level saboteurs. This tragically made them sitting ducks for aerial attack. The precaution against one threat created catastrophic vulnerability to another.',
    sourceBeat: 7,
    hostDirection:
      'This is one of the great tragic ironies of Pearl Harbor. The military was prepared, but for the completely wrong threat. Why were those planes lined up like that?',
    hostMode: 'voice-only',
    category: 'Strategy',
  },

  // Q7: Branching Reveal - Fuel Tanks
  {
    id: 'exam-q7',
    questionNumber: 7,
    type: 'branching-reveal',
    difficulty: 'medium',
    prompt:
      'What critical target did the Japanese leave completely intact that Admiral Nimitz later said would have forced the Pacific Fleet to retreat to the West Coast?',
    options: [
      { id: 'sub-base', label: 'The submarine base', isCorrect: false },
      {
        id: 'fuel-tanks',
        label: 'The fuel storage tanks (4.5 million barrels)',
        isCorrect: true,
        revealContent:
          'Admiral Nimitz assessed that their destruction would have been more devastating than the loss of the battleships.',
      },
      { id: 'quarters', label: 'The officer quarters and command center', isCorrect: false },
      { id: 'ammo', label: 'The ammunition depot at West Loch', isCorrect: false },
    ],
    explanation:
      "Pearl Harbor's fuel tank farm held 4.5 million barrels of oil in exposed, above-ground tanks. They were never targeted. Admiral Nimitz assessed that their destruction would have been more devastating than the loss of the battleships, forcing the entire Pacific Fleet to retreat approximately 2,000 miles to the U.S. West Coast, potentially extending the war by years. Commander Genda had advocated targeting these facilities, but Admiral Nagumo chose to withdraw after two waves.",
    sourceBeat: 6,
    hostDirection:
      'The Japanese achieved tactical surprise. But they missed something that could have changed the entire course of the war. What was it?',
    hostMode: 'voice-only',
    category: 'Strategy',
  },

  // Q8: Dual-Answer Slider - Oil Dependency (simplified to multiple choice for MVP)
  {
    id: 'exam-q8',
    questionNumber: 8,
    type: 'dual-slider',
    difficulty: 'medium',
    prompt:
      "What percentage of Japan's oil imports came from the United States before the embargo, and approximately how long could Japan's reserves last without new supply?",
    partA: {
      label: 'Oil from US',
      unit: '%',
      minValue: 0,
      maxValue: 100,
      correctValue: 80,
      tolerance: 5,
    },
    partB: {
      label: 'Reserve duration',
      unit: 'years',
      minValue: 0,
      maxValue: 5,
      correctValue: 2,
      tolerance: 0.5,
    },
    answerOptions: ['50% / 5 years', 'Over 80% / Less than 2 years', '65% / 3 years', '90% / 6 months'],
    correctOptionIndex: 1,
    explanation:
      "Japan depended on the United States for over 80% of its oil imports, consuming more than 32 million barrels annually while producing only about 3 million domestically. When the U.S. imposed a total oil embargo on August 1, 1941, Japan's strategic reserves could sustain operations for less than two years. This resource chokehold made military action, in the minds of Japan's leadership, a mathematical inevitability unless they were willing to withdraw from China entirely.",
    sourceBeat: 1,
    hostDirection:
      "To understand Pearl Harbor, you have to understand Japan's desperation. They were running out of the one thing a modern military can't function without.",
    hostMode: 'voice-only',
    category: 'Causes',
  },

  // Q9: Multiple Choice - Radar Warning Ignored
  {
    id: 'exam-q9',
    questionNumber: 9,
    type: 'multiple-choice',
    difficulty: 'medium',
    prompt:
      'Private Joseph Lockard detected the incoming Japanese attack force on radar 53 minutes before the first bombs fell. Why was his warning ignored?',
    options: [
      'The radar equipment malfunctioned and showed false readings',
      'Lieutenant Tyler assumed the blip was incoming B-17 bombers expected from the mainland',
      'The phone lines to command were down due to a storm',
      'Lockard was told to shut down the radar station before reporting',
    ],
    correctIndex: 1,
    explanation:
      "At 7:02 AM, 19-year-old Private Lockard detected 180+ aircraft at 137 miles north on the SCR-270B radar at Opana Point. He called the Fort Shafter Information Center, where Lieutenant Kermit Tyler, aware that B-17 bombers were expected from the mainland, told him 'Don't worry about it.' Tyler's assumption was reasonable based on the information he had, but it represented a catastrophic failure of the early warning system. The technology worked perfectly; the human interpretation failed.",
    sourceBeat: 2,
    hostDirection:
      "Fifty-three minutes. That's how long they had. One young man saw it coming. So why didn't anyone listen?",
    hostMode: 'voice-only',
    category: 'Warning',
  },

  // Q10: Drag-and-Drop Timeline - Public Opinion Shift
  {
    id: 'exam-q10',
    questionNumber: 10,
    type: 'drag-timeline',
    difficulty: 'medium',
    prompt: "How did the American public's attitude toward entering the war change in the 24 hours following the attack?",
    items: [
      { id: 'oppose', label: '88% opposed war', icon: '📉' },
      { id: 'approve', label: '97% approved war declaration', icon: '📈' },
      { id: 'afc-active', label: 'AFC: 800,000 members', icon: '🏛️' },
      { id: 'afc-disbanded', label: 'AFC disbanded Dec 11', icon: '❌' },
    ],
    categories: [
      { id: 'before', label: 'BEFORE Attack' },
      { id: 'after', label: 'AFTER Attack' },
    ],
    correctPlacements: {
      oppose: 'before',
      'afc-active': 'before',
      approve: 'after',
      'afc-disbanded': 'after',
    },
    explanation:
      "In January 1940, 88% of Americans opposed declaring war. Within 24 hours of the Pearl Harbor attack, 97% approved the war declaration. The America First Committee, which had boasted over 800,000 members and was the most powerful isolationist organization in the country, disbanded on December 11, just four days after the attack. Pearl Harbor didn't just change policy; it transformed the American psyche overnight.",
    sourceBeat: 1,
    hostDirection:
      'This might be the most dramatic shift in public opinion in American history. One day changed everything. Can you sort out the before and after?',
    hostMode: 'voice-only',
    category: 'Impact',
  },

  // ============================================================
  // HARD TIER (Questions 11-15) - Analysis and synthesis
  // ============================================================

  // Q11: Multiple Choice - Kantai Kessen
  {
    id: 'exam-q11',
    questionNumber: 11,
    type: 'multiple-choice',
    difficulty: 'hard',
    prompt:
      "The Japanese Navy's attack plan prioritized battleships over aircraft carriers as primary targets. What was the name of the strategic doctrine that explains this priority, and where did it originate?",
    options: [
      'Bushido Code - derived from samurai tradition',
      'Kantai Kessen (Decisive Battle) - derived from the Battle of Tsushima, 1905',
      'Greater East Asia Co-Prosperity doctrine - derived from Meiji-era expansion',
      "Combined Fleet Strategy - derived from Yamamoto's Harvard studies",
    ],
    correctIndex: 1,
    explanation:
      "Kantai Kessen, or 'Decisive Battle' doctrine, was the foundational strategy of the Imperial Japanese Navy. It originated from Admiral Togo's stunning victory over the Russian Baltic Fleet at the Battle of Tsushima Strait in 1905, where battleship-centric firepower destroyed the enemy in a single decisive engagement. This doctrine led Japanese planners to prioritize battleships as their primary targets at Pearl Harbor, even though forward-thinking officers like Genda recognized that aircraft carriers would prove more decisive in the coming war. The carriers' absence from harbor on December 7 was coincidental, not a Japanese failure.",
    sourceBeat: 6,
    hostDirection:
      'To understand why the Japanese attacked the way they did, you have to understand how they thought about naval warfare. This goes back decades before Pearl Harbor.',
    hostMode: 'voice-only',
    category: 'Doctrine',
  },

  // Q12: Multi-Select - Fuchida Credibility
  {
    id: 'exam-q12',
    questionNumber: 12,
    type: 'multi-select',
    difficulty: 'hard',
    prompt:
      'Captain Mitsuo Fuchida, who led the air attack and later claimed he passionately argued for a third strike wave, has been called an unreliable narrator by modern historians. What evidence undermines his post-war account? (Select all that apply)',
    options: [
      'His 1945 USSBS testimony was humble and pragmatic, contradicting his later dramatic accounts',
      'Both Genda and Admiral Kusaka denied the third-wave debate occurred as Fuchida described',
      'Fuchida was not actually present during the carrier\'s withdrawal decision',
      'His 1963 account with Prange significantly inflated his personal role and advocacy',
    ],
    correctIndices: [0, 1, 3], // A, B, D are correct; C is false
    requireAllCorrect: true,
    explanation:
      "Fuchida's credibility is a key historiographical issue. His 1945 testimony to the U.S. Strategic Bombing Survey was measured and tactical. But his 1963 collaboration with historian Gordon Prange painted a far more dramatic picture, with Fuchida as a passionate advocate for continuing the attack. Crucially, both Commander Genda (the tactical planner) and Admiral Kusaka (Nagumo's chief of staff) denied that the heated third-wave debate occurred the way Fuchida later described it. This 'Third Wave Mysticism' has distorted popular understanding of the decision to withdraw.",
    sourceBeat: 6,
    hostDirection:
      "Here's something most people don't know: one of our key eyewitnesses to Pearl Harbor may have been rewriting his own history. This is about how myths get made.",
    hostMode: 'voice-only',
    category: 'Historiography',
  },

  // Q13: Percentage Comparison - US Production (simplified to multiple choice)
  {
    id: 'exam-q13',
    questionNumber: 13,
    type: 'percentage-compare',
    difficulty: 'hard',
    prompt:
      "By 1944, the United States was producing what percentage of the world's total munitions? And how did this compare to ALL Axis powers combined?",
    optionA: { label: 'United States', correctValue: 40 },
    optionB: { label: 'All Axis Powers', correctValue: 30 },
    answerOptions: ['U.S. 25% / Axis 35%', 'U.S. 40% / Axis 30%', 'U.S. 35% / Axis 40%', 'U.S. 50% / Axis 20%'],
    correctOptionIndex: 1,
    explanation:
      "By 1944, the United States alone was producing 40% of the entire world's munitions output. The combined Axis powers (Germany, Japan, Italy) produced only 30%. This staggering industrial mobilization saw the American defense workforce surge from 6.9 million in 1941 to 17.5 million by late 1942, with 8 million women entering the defense industries. The U.S. produced between 296,000 and 304,000 aircraft, 87,620 naval vessels, and 86,000 to 102,000 tanks during the war. Admiral Yamamoto's warning that Japan could 'run wild for six months' proved tragically prescient.",
    sourceBeat: 9,
    hostDirection:
      "Pearl Harbor didn't just start a war. It unleashed something the world had never seen before. How dominant was America's war production?",
    hostMode: 'voice-only',
    category: 'Legacy',
  },

  // Q14: Two-Part Answer - USS Yorktown
  {
    id: 'exam-q14',
    questionNumber: 14,
    type: 'two-part',
    difficulty: 'hard',
    prompt:
      "The repair of the USS Yorktown at Pearl Harbor's dry docks proved to be one of the most consequential events of the Pacific War. How long did the repair take, and why did it matter?",
    partA: {
      prompt: 'How long did the repair take?',
      options: ['2 weeks', '72 hours', '5 days', '1 week'],
      correctIndex: 1,
    },
    partB: {
      prompt: 'Why did it matter?',
      options: [
        'It allowed Yorktown to participate in the Battle of the Coral Sea',
        'It allowed Yorktown to fight at the Battle of Midway, where Japan lost 4 carriers',
        'It enabled the Doolittle Raid on Tokyo',
        'It reinforced the defense of Guadalcanal',
      ],
      correctIndex: 1,
    },
    bothRequired: true,
    explanation:
      'The USS Yorktown arrived at Pearl Harbor heavily damaged from the Battle of the Coral Sea. An estimated 90-day repair was completed in just 72 hours by 1,400 workers at the very dry docks the Japanese had left intact. The Yorktown then sailed to Midway, where it played a critical role in the battle that destroyed four Japanese carriers and turned the tide of the Pacific War. This is the most powerful argument for why Nagumo\'s failure to launch a third wave targeting Pearl Harbor\'s infrastructure was the war\'s most consequential missed opportunity.',
    sourceBeat: 6,
    hostDirection:
      'Remember those dry docks the Japanese left standing? Six months later, something happened there that changed the entire war. Do you know what it was?',
    hostMode: 'voice-only',
    category: 'Consequence',
  },

  // Q15: Sequence Ordering - Marshall Warning
  {
    id: 'exam-q15',
    questionNumber: 15,
    type: 'sequence-order',
    difficulty: 'hard',
    prompt:
      'General Marshall sent an urgent warning message to Pearl Harbor on the morning of December 7. Arrange these events in the correct order.',
    items: [
      { id: 'marshall-sends', label: 'Marshall sends warning at 11:45 AM Washington time', icon: '📝' },
      { id: 'telegraph-selected', label: 'Commercial telegraph selected after military channels failed', icon: '📡' },
      { id: 'messenger-dispatch', label: 'Message delivered by bicycle messenger Tadao Fuchikami', icon: '🚲' },
      { id: 'arrives-after', label: 'Fuchikami arrives at Fort Shafter AFTER the attack has ended', icon: '⏰' },
    ],
    correctOrder: ['marshall-sends', 'telegraph-selected', 'messenger-dispatch', 'arrives-after'],
    explanation:
      "This sequence represents one of the most bitter 'what ifs' of Pearl Harbor. General Marshall's warning, sent from Washington at 11:45 AM EST (6:15 AM Hawaiian time), could have provided nearly two hours of advance warning. But atmospheric interference blocked the military radio channel. The message was rerouted through commercial telegraph, arrived in Honolulu, was not flagged as priority, and was given to bicycle messenger Tadao Fuchikami for routine delivery. He arrived at Fort Shafter after the attack was over. The technology existed to prevent the disaster; the system failed at every link in the chain.",
    sourceBeat: 8,
    hostDirection:
      "This is the one that hurts the most. The warning was sent. It was on its way. And then everything that could go wrong, did go wrong. Can you piece together what happened?",
    hostMode: 'voice-only',
    category: 'Warning',
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

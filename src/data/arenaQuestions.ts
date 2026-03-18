/**
 * The Arena - Pearl Harbor Elite Assessment Questions
 * 15 Questions: Hard (1-5), Harder (6-10), Hardest (11-15)
 *
 * Cash-out checkpoints after Q5 (Master's) and Q10 (PhD)
 * Two wrong answers = reset to zero
 * Complete all 15 = Rhodes Scholar
 */

export type ArenaTier = 'hard' | 'harder' | 'hardest';
export type ArenaRecognition = 'graduate' | 'masters' | 'phd' | 'rhodes_scholar';

export type QuestionFormat =
  | 'multiple_choice'
  | 'primary_source'
  | 'true_false'
  | 'data_comparison'
  | 'drag_match'
  | 'timeline_reconstruction'
  | 'map_trace'
  | 'document_analysis'
  | 'audio_fill_blank'
  | 'narrative_choice'
  | 'multi_part'
  | 'map_deep_dive'
  | 'historiography'
  | 'three_part_analysis'
  | 'historiography_deep';

export interface ArenaQuestion {
  id: string;
  tier: ArenaTier;
  questionNumber: number;
  format: QuestionFormat;
  topic: string;
  question: string;
  visualDescription: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  correctAnswer: string;
  explanation: string;
  hostDirection: string;
  sourceReference: string;
}

export interface ArenaTierConfig {
  tier: ArenaTier;
  label: string;
  questions: number[];
  xpBonus: number;
  recognition: ArenaRecognition;
  checkpointAfter: boolean;
}

export const ARENA_TIERS: ArenaTierConfig[] = [
  {
    tier: 'hard',
    label: 'Hard',
    questions: [1, 2, 3, 4, 5],
    xpBonus: 200,
    recognition: 'masters',
    checkpointAfter: true,
  },
  {
    tier: 'harder',
    label: 'Harder',
    questions: [6, 7, 8, 9, 10],
    xpBonus: 500,
    recognition: 'phd',
    checkpointAfter: true,
  },
  {
    tier: 'hardest',
    label: 'Hardest',
    questions: [11, 12, 13, 14, 15],
    xpBonus: 1000,
    recognition: 'rhodes_scholar',
    checkpointAfter: false,
  },
];

export const RECOGNITION_TIERS: Record<ArenaRecognition, {
  label: string;
  description: string;
  xpBonus: number;
  icon: string;
}> = {
  graduate: {
    label: 'Graduate',
    description: 'Completed all beats and passed Final Exam',
    xpBonus: 0,
    icon: '🎓',
  },
  masters: {
    label: "Master's",
    description: 'Completed Arena Tier 1 (5 Hard questions)',
    xpBonus: 200,
    icon: '📜',
  },
  phd: {
    label: 'PhD',
    description: 'Completed Arena Tiers 1+2 (10 questions)',
    xpBonus: 500,
    icon: '🎖️',
  },
  rhodes_scholar: {
    label: 'Rhodes Scholar',
    description: 'Completed all 15 Arena questions',
    xpBonus: 1000,
    icon: '👑',
  },
};

export const ARENA_QUESTIONS: ArenaQuestion[] = [
  // ============================================
  // TIER 1: HARD (Questions 1-5)
  // ============================================
  {
    id: 'arena-q1',
    tier: 'hard',
    questionNumber: 1,
    format: 'multiple_choice',
    topic: 'USS Ward Engagement',
    question: 'Over an hour before any Japanese plane reached Pearl Harbor, the destroyer USS Ward fired on and sank a vessel trying to enter the harbor. What type of vessel was it, and what time did this occur?',
    visualDescription: 'A dark, pre-dawn illustration of the harbor entrance. Sonar pings play in the background. The options appear over a silhouette of USS Ward.',
    options: [
      { id: 'a', text: 'A Japanese reconnaissance seaplane, at 6:15 AM', isCorrect: false },
      { id: 'b', text: 'A Japanese Type A midget submarine, at approximately 6:45 AM', isCorrect: true },
      { id: 'c', text: 'A Japanese supply vessel attempting to plant mines, at 5:30 AM', isCorrect: false },
      { id: 'd', text: 'A German U-boat conducting surveillance, at 6:00 AM', isCorrect: false },
    ],
    correctAnswer: 'B) A Japanese Type A midget submarine, at approximately 6:45 AM',
    explanation: "The USS Ward, a destroyer on routine patrol, detected and fired upon a Japanese Type A midget submarine attempting to follow the cargo ship USS Antares into the harbor at approximately 6:45 AM. This was over an hour before the air attack began at 7:55 AM. Ward's crew reported the engagement up the chain of command, but the report was met with skepticism and requests for confirmation, consuming precious time. This was technically the first shot fired in the Pacific War.",
    hostDirection: "The first shot of the Pacific War wasn't fired from a plane. It happened in the dark water outside the harbor, and almost nobody believed the man who reported it.",
    sourceReference: 'Research File 1 (Chronology - USS Ward engagement at 0645)',
  },
  {
    id: 'arena-q2',
    tier: 'hard',
    questionNumber: 2,
    format: 'primary_source',
    topic: 'Bomb Plot Message',
    question: "On September 24, 1941 — more than two months before the attack — Japanese intelligence sent a message that divided Pearl Harbor into five specific zones and requested ship locations within each. What is this intercept known as, and why did American intelligence fail to act on it?",
    visualDescription: 'A simulated declassified intelligence document appears on screen with a grid overlay of Pearl Harbor. Key text fragments are highlighted but partially redacted.',
    options: [
      { id: 'a', text: "The 'Purple' Intercept — ignored because it was in an unbroken code", isCorrect: false },
      { id: 'b', text: "The 'Bomb Plot' Message — treated as routine intelligence rather than a targeting indicator", isCorrect: true },
      { id: 'c', text: "The 'Wind Code' Message — lost in translation during decryption", isCorrect: false },
      { id: 'd', text: "The 'East Wind Rain' Signal — dismissed as a weather forecast", isCorrect: false },
    ],
    correctAnswer: "B) The 'Bomb Plot' Message — treated as routine intelligence rather than a targeting indicator",
    explanation: "The 'Bomb Plot' message was sent on September 24, 1941 and translated in Washington on October 9. It divided Pearl Harbor into five sub-areas and requested detailed reporting on which ships were berthed in each zone. This was the first time Japan had ever requested specific ship positions within a harbor — a clear targeting pattern. But American intelligence analysts treated it as routine diplomatic traffic, not recognizing it as operational targeting data for an upcoming attack. It is considered one of the most consequential intelligence failures in history.",
    hostDirection: "Two months before the attack, the United States had a piece of paper that essentially said: Japan is mapping this harbor for a strike. And nobody connected the dots.",
    sourceReference: 'Research File 7 (Primary Sources - Bomb Plot Grid Message)',
  },
  {
    id: 'arena-q3',
    tier: 'hard',
    questionNumber: 3,
    format: 'true_false',
    topic: 'Red Hill Underground',
    question: 'After Pearl Harbor, the U.S. Navy built an underground fuel storage facility at Red Hill to protect against future attacks. When did construction actually begin — before or after December 7, 1941?',
    visualDescription: 'A dramatic engineering cross-section illustration of underground fuel tanks carved into a mountainside. Two large buttons: BEFORE and AFTER.',
    options: [
      { id: 'a', text: 'AFTER — Construction began January 1942 as an emergency response', isCorrect: false },
      { id: 'b', text: 'BEFORE — Construction began December 26, 1940, nearly a year before the attack', isCorrect: true },
    ],
    correctAnswer: 'B) BEFORE — Construction began December 26, 1940, nearly a year before the attack',
    explanation: "The Red Hill Underground Fuel Storage facility began construction on December 26, 1940 — nearly a full year before the attack. It was completed in September 1943. This means the U.S. Navy had already recognized the vulnerability of Pearl Harbor's above-ground fuel tanks before the Japanese attack. The 4.5 million barrels of exposed fuel that the Japanese left intact during the attack were already being addressed by a construction project that was underway. This adds a bitter layer to the 'what if' debate: the Navy knew the tanks were vulnerable, but the facility wasn't finished in time.",
    hostDirection: "Here's something that will surprise you. The Navy knew those fuel tanks were a problem. The question is: when did they start doing something about it?",
    sourceReference: 'Research File 4 (Third Wave Analysis - Red Hill Underground)',
  },
  {
    id: 'arena-q4',
    tier: 'hard',
    questionNumber: 4,
    format: 'data_comparison',
    topic: 'Aircraft Losses',
    question: 'Japanese aircraft losses more than doubled between the first and second waves of the attack. How many planes were lost in each wave, and what strategic conclusion did Admiral Nagumo draw from this?',
    visualDescription: "Two animated counters side by side: 'First Wave Losses' and 'Second Wave Losses.' Below, a risk assessment meter moves from green toward red.",
    options: [
      { id: 'a', text: '5 first wave / 12 second wave — Nagumo concluded the carriers had been found', isCorrect: false },
      { id: 'b', text: '9 first wave / 20 second wave — Nagumo concluded a third wave would face even heavier losses', isCorrect: true },
      { id: 'c', text: '15 first wave / 30 second wave — Nagumo concluded his fleet was at risk of destruction', isCorrect: false },
      { id: 'd', text: "3 first wave / 8 second wave — Nagumo concluded the mission objectives were already met", isCorrect: false },
    ],
    correctAnswer: 'B) 9 first wave / 20 second wave — Nagumo concluded a third wave would face even heavier losses',
    explanation: "Japan lost 9 aircraft in the first wave and 20 in the second — more than doubling. This escalating attrition reflected the fact that American anti-aircraft defenses were rapidly organizing, initial surprise was lost, and pilots were becoming more effective at shooting back. For Nagumo, this trajectory suggested a third wave would face even heavier losses, potentially catastrophic. Combined with the unknown locations of American carriers Enterprise and Lexington (which could counterattack at any moment), fuel constraints, and the danger of night landings if they stayed too long, the math argued for withdrawal.",
    hostDirection: "Nagumo was watching the numbers in real time. The first wave was nearly flawless. The second wave cost more than twice as many planes. What was he seeing?",
    sourceReference: 'Research File 4 (Third Wave Analysis - loss differential)',
  },
  {
    id: 'arena-q5',
    tier: 'hard',
    questionNumber: 5,
    format: 'drag_match',
    topic: 'Carrier Divisions',
    question: 'The Japanese strike force was organized into three carrier divisions. Name the six aircraft carriers and their divisional groupings.',
    visualDescription: 'Six carrier silhouettes appear on the left. Three division labels appear on the right: 1st Carrier Division, 2nd Carrier Division, 5th Carrier Division. Players drag each carrier to its correct division.',
    options: [
      { id: 'a', text: 'Akagi + Kaga = 1st Division, Soryu + Hiryu = 2nd Division, Shokaku + Zuikaku = 5th Division', isCorrect: true },
      { id: 'b', text: 'Akagi + Soryu = 1st Division, Kaga + Hiryu = 2nd Division, Shokaku + Zuikaku = 5th Division', isCorrect: false },
      { id: 'c', text: 'Shokaku + Zuikaku = 1st Division, Akagi + Kaga = 2nd Division, Soryu + Hiryu = 5th Division', isCorrect: false },
      { id: 'd', text: 'Akagi + Hiryu = 1st Division, Kaga + Soryu = 2nd Division, Shokaku + Zuikaku = 5th Division', isCorrect: false },
    ],
    correctAnswer: '1st Carrier Division: Akagi and Kaga (Vice Admiral Nagumo). 2nd Carrier Division: Soryu and Hiryu (Rear Admiral Yamaguchi). 5th Carrier Division: Shokaku and Zuikaku (Rear Admiral Hara).',
    explanation: "The Kido Butai (Mobile Force) that attacked Pearl Harbor was the largest carrier fleet ever assembled at that time: six fleet carriers organized into three divisions. The 1st Carrier Division (Akagi and Kaga) was the most experienced, under Nagumo's direct command. The 2nd Division (Soryu and Hiryu) was commanded by the aggressive Rear Admiral Yamaguchi, who would later die at Midway. The 5th Division (Shokaku and Zuikaku) was the newest. The fleet also included 2 battleships, 2 heavy cruisers, 1 light cruiser, and 9 destroyers.",
    hostDirection: "Six carriers. Three divisions. The largest carrier strike force the world had ever seen. Can you sort them out?",
    sourceReference: 'Research File 2 (Geography - Kido Butai composition)',
  },

  // ============================================
  // TIER 2: HARDER (Questions 6-10)
  // ============================================
  {
    id: 'arena-q6',
    tier: 'harder',
    questionNumber: 6,
    format: 'timeline_reconstruction',
    topic: '14-Part Message Timing',
    question: "The Japanese Foreign Office instructed its embassy to deliver the 14-Part Message to Secretary of State Hull at exactly 1:00 PM Washington time on December 7. Why was this specific time chosen, and what went wrong with the delivery?",
    visualDescription: 'Two animated clocks appear side by side: one showing Washington DC time, one showing Hawaiian time. A diplomatic cable animation shows the message being decoded.',
    options: [
      { id: 'a', text: '1:00 PM Washington = 7:30 AM Hawaii, 25 minutes before attack. Embassy staff were too slow decoding/typing it, and it was delivered AFTER the bombs had already fallen.', isCorrect: true },
      { id: 'b', text: '1:00 PM Washington = 9:00 AM Hawaii, during the second wave. The message was a formal surrender demand.', isCorrect: false },
      { id: 'c', text: '1:00 PM Washington = 6:00 AM Hawaii. The timing was random and unrelated to military operations.', isCorrect: false },
      { id: 'd', text: '1:00 PM Washington = 8:00 AM Hawaii. Hull refused to see the ambassador on a Sunday.', isCorrect: false },
    ],
    correctAnswer: 'A) 1:00 PM Washington = 7:30 AM Hawaii, 25 minutes before the attack. The embassy was too slow, delivering it after the attack had already begun.',
    explanation: "The 1:00 PM Washington delivery time was calculated precisely: it equaled 7:30 AM Hawaiian time, just 25 minutes before the planned attack at 7:55 AM. Japan intended this as a formal diplomatic break delivered moments before the first bombs — technically complying with international conventions about declaring hostilities. But the Japanese embassy staff in Washington struggled to decode and type the lengthy 14-part message. Ambassador Nomura and Special Envoy Kurusu didn't reach Hull's office until after 2:00 PM, by which time the attack was already underway. Hull, having already been informed of the attack, famously told them: 'In all my fifty years of public service I have never seen a document that was more crowded with infamous falsehoods and distortions.'",
    hostDirection: "Japan tried to thread an impossible needle: break off negotiations 25 minutes before the first bomb. It was supposed to be a declaration of war, not a sneak attack. But the clock ran out.",
    sourceReference: 'Research File 7 (Primary Sources - 14-Part Message), Research File 2 (Geography - Fourteen-Part Message timing)',
  },
  {
    id: 'arena-q7',
    tier: 'harder',
    questionNumber: 7,
    format: 'map_trace',
    topic: 'Kido Butai Route',
    question: 'The Kido Butai traveled approximately 3,500 miles across the Pacific from a remote assembly point. Where did the fleet depart from, and why was this specific route chosen?',
    visualDescription: 'A dark Pacific Ocean map with no route marked. The player must trace the approximate path by selecting waypoints.',
    options: [
      { id: 'a', text: 'Yokosuka Naval Base, via the central Pacific for speed', isCorrect: false },
      { id: 'b', text: 'Hitokappu Bay in the Kuril Islands, via the northern Pacific to avoid shipping lanes and use storm cover', isCorrect: true },
      { id: 'c', text: 'Truk Lagoon in the Caroline Islands, via the southern Pacific to stay near friendly bases', isCorrect: false },
      { id: 'd', text: 'Sasebo Naval Base, via the Marshall Islands chain for refueling', isCorrect: false },
    ],
    correctAnswer: 'B) Hitokappu Bay in the Kuril Islands, via the northern Pacific to avoid shipping lanes and use storm cover',
    explanation: "The Kido Butai assembled at the remote Hitokappu Bay (Tankan Bay) in the Kuril Islands, far from prying eyes. From there, the fleet sailed approximately 3,500 miles via the northern Pacific route. This route was chosen for three strategic reasons: it was far from normal commercial shipping lanes (minimizing the chance of being spotted), winter storms in the northern Pacific provided natural concealment from aerial reconnaissance, and the carriers' launch position 230 miles north of Oahu was designed to keep them outside the range of American land-based patrol aircraft. The entire transit was conducted under strict radio silence.",
    hostDirection: "Six carriers, 3,500 miles of open ocean, absolute radio silence. One sighting by a fishing boat or patrol plane could have changed everything. Where did they start?",
    sourceReference: 'Research File 2 (Geography - fleet distance, Hitokappu Bay, launch point)',
  },
  {
    id: 'arena-q8',
    tier: 'harder',
    questionNumber: 8,
    format: 'document_analysis',
    topic: 'Roberts Commission',
    question: 'The Roberts Commission, appointed by President Roosevelt in December 1941, was the first formal investigation into the Pearl Harbor disaster. What were its key findings, and why do modern historians consider the investigation fundamentally flawed?',
    visualDescription: "A simulated government report cover page appears: 'Roberts Commission Report, January 23, 1942.' Key findings are shown as redacted excerpts that the player must evaluate.",
    options: [
      { id: 'a', text: 'Found that the attack was entirely unpredictable and absolved all commanders of blame', isCorrect: false },
      { id: 'b', text: "Found Short and Kimmel guilty of 'dereliction of duty' but shielded Washington leadership from scrutiny, making the Hawaii commanders scapegoats", isCorrect: true },
      { id: 'c', text: 'Found that FDR had deliberately withheld intelligence from Hawaii commanders as part of a war entry strategy', isCorrect: false },
      { id: 'd', text: 'Found systematic failures at every level and recommended sweeping military intelligence reform', isCorrect: false },
    ],
    correctAnswer: "B) Found Short and Kimmel guilty of 'dereliction of duty' but shielded Washington leadership from scrutiny",
    explanation: "The Roberts Commission held secret hearings in Washington and Honolulu, examining 127 witnesses and over 3,000 pages of documents. Its final report, submitted January 23, 1942, found General Short and Admiral Kimmel guilty of 'dereliction of duty.' However, modern historians consider this deeply problematic: the commission didn't examine Washington's failure to forward critical MAGIC intelligence intercepts to Hawaii, didn't investigate General Marshall's delayed warning message, and effectively concentrated all blame on the field commanders while shielding higher-level decision-makers. It satisfied the public's immediate demand for accountability but created a scapegoat narrative that took decades to unravel. Both Short and Kimmel were denied courts-martial where they could have defended themselves.",
    hostDirection: "Within weeks of the attack, the government launched an investigation. They found two men responsible and case closed. But was it really that simple? What did the commission actually do — and what did it ignore?",
    sourceReference: 'Research File 7 (Primary Sources - Roberts Commission Report)',
  },
  {
    id: 'arena-q9',
    tier: 'harder',
    questionNumber: 9,
    format: 'audio_fill_blank',
    topic: 'KGMB Navigation',
    question: "Commander Fuchida used a commercial radio station to navigate the attack force during the approach to Pearl Harbor. What was the station's call sign, what was Fuchida specifically listening for, and what navigational correction did it enable?",
    visualDescription: 'A vintage radio dial appears, tuned to a specific frequency. Static crackles. A faint music broadcast fades in.',
    options: [
      { id: 'a', text: 'KGU — music programming — 10-degree correction', isCorrect: false },
      { id: 'b', text: 'KGMB — weather broadcast — 5-degree course correction', isCorrect: true },
      { id: 'c', text: 'KNDI — military frequency — 3-degree correction', isCorrect: false },
      { id: 'd', text: 'KPOI — news bulletin — 7-degree correction', isCorrect: false },
    ],
    correctAnswer: 'B) KGMB — weather broadcast — 5-degree course correction',
    explanation: "Commander Fuchida tuned his radio direction finder to KGMB, a Honolulu commercial radio station. The station's weather broadcast — reporting partly cloudy conditions with clouds over the mountains — confirmed that the attack routes along the coast would have good visibility. More critically, the radio signal itself allowed Fuchida to use direction-finding to correct a 5-degree drift in the flight path caused by wind during the approach. A civilian entertainment station inadvertently served as a navigational beacon guiding 183 attack aircraft to their target.",
    hostDirection: "Here's one of the most incredible details of the attack. The lead pilot of 183 aircraft was listening to a Honolulu radio station. Not for entertainment. For something far more useful.",
    sourceReference: 'Research File 2 (Geography - KGMB, Fuchida navigation)',
  },
  {
    id: 'arena-q10',
    tier: 'harder',
    questionNumber: 10,
    format: 'narrative_choice',
    topic: '442nd Regiment',
    question: "Ted Tsukiyama's story connects Pearl Harbor to the 442nd Regimental Combat Team. What makes the 442nd historically significant, and what is the specific irony of Tsukiyama's military service?",
    visualDescription: 'A portrait of a young Nisei soldier in uniform. Beside it, a display of military decorations.',
    options: [
      { id: 'a', text: 'The 442nd was the first integrated military unit, and Tsukiyama was denied promotion due to racism', isCorrect: false },
      { id: 'b', text: 'The 442nd, composed almost entirely of Japanese Americans, became the most decorated unit of its size in U.S. history — while 120,000 Japanese Americans were interned back home', isCorrect: true },
      { id: 'c', text: 'The 442nd was a covert intelligence unit, and Tsukiyama spied on Japan from within internment camps', isCorrect: false },
      { id: 'd', text: 'The 442nd was formed to guard internment camps, and Tsukiyama refused to serve in that capacity', isCorrect: false },
    ],
    correctAnswer: 'B) The 442nd became the most decorated unit of its size in U.S. history while 120,000 Japanese Americans were interned',
    explanation: "Ted Tsukiyama was a Nisei (second-generation Japanese American) ROTC student at the University of Hawaii. His ROTC unit was the only one called to active service on December 7, 1941. But on January 19, 1942, he was dismissed from service due to his Japanese ancestry. He later volunteered for the 442nd Regimental Combat Team, composed almost entirely of Japanese Americans, which became the most decorated unit of its size in U.S. military history. The profound irony: these men fought and died for a country that had simultaneously imprisoned 120,000 of their family members in internment camps. Tsukiyama also served in the Military Intelligence Service in Burma, using his Japanese language skills for the very country that had questioned his loyalty.",
    hostDirection: "This might be the most important story to come out of Pearl Harbor. Not about the attack itself. About what happened to Americans afterward, and how they responded.",
    sourceReference: 'Research File 3 (Perspectives - Tsukiyama), Research File 5 (Geopolitical - internment)',
  },

  // ============================================
  // TIER 3: HARDEST (Questions 11-15)
  // ============================================
  {
    id: 'arena-q11',
    tier: 'hardest',
    questionNumber: 11,
    format: 'multi_part',
    topic: 'Operation Z',
    question: "Admiral Yamamoto's plan for Pearl Harbor was designated Operation Z. Specifically, how did this plan depart from traditional Kantai Kessen doctrine, and who was the tactical architect who designed the actual strike?",
    visualDescription: 'A split-screen diagram: left side shows traditional Kantai Kessen (enemy fleet lured to Japanese waters, battleship engagement), right side shows Operation Z (strike enemy fleet in its own harbor, carrier-based aviation).',
    options: [
      { id: 'a', text: 'Operation Z used submarines instead of surface ships; Yamamoto designed every detail personally', isCorrect: false },
      { id: 'b', text: 'Operation Z reversed the doctrine by striking the enemy in their own harbor using massed carrier aviation; Commander Minoru Genda was the tactical architect', isCorrect: true },
      { id: 'c', text: 'Operation Z combined air and naval bombardment from nearby islands; Admiral Nagumo designed the strike plan', isCorrect: false },
      { id: 'd', text: 'Operation Z was a defensive posture that drew the Americans to Midway; Captain Fuchida planned the tactics', isCorrect: false },
    ],
    correctAnswer: 'B) Operation Z struck the enemy in their own harbor using massed carrier aviation; Genda was the tactical architect',
    explanation: "Traditional Kantai Kessen (Decisive Battle) doctrine, rooted in Admiral Togo's victory at Tsushima in 1905, called for luring the enemy fleet into Japanese-controlled waters for a battleship-centric decisive engagement. Operation Z fundamentally reversed this: instead of waiting for the enemy to come, Japan would cross the Pacific and strike the American fleet in its own harbor. The weapon would not be battleships but massed carrier-based aviation — an unprecedented concept at this scale. Commander Minoru Genda was the tactical architect who designed the actual strike plan. His strategy was outlined in Combined Fleet Top Secret Operation Order No. 1, later recovered in the Philippines after the war. Traditional admirals resisted because it violated everything the IJN had trained for.",
    hostDirection: "For decades, the Japanese Navy trained for one kind of war. Then one plan threw all of that out. What was different about it, and whose idea was it really?",
    sourceReference: 'Research File 4 (Third Wave - Kantai Kessen, Genda), Research File 7 (Primary Sources - Operation Z, Combined Fleet Order No. 1)',
  },
  {
    id: 'arena-q12',
    tier: 'hardest',
    questionNumber: 12,
    format: 'map_deep_dive',
    topic: 'Battleship Row F4',
    question: "The Battleship Row mooring positions are designated F1 through F6. The 'nested' pairing of battleships created a specific tactical vulnerability for the outboard ships and a different vulnerability for the inboard ships. Explain what happened at berth F4 and why the nested formation mattered.",
    visualDescription: 'A detailed mooring diagram of Battleship Row showing F1-F6 berths, with ship silhouettes in paired positions. The player must tap F4 and then select the correct description.',
    options: [
      { id: 'a', text: 'F4: Maryland (outboard) shielded Oklahoma (inboard); Maryland took 9 torpedoes and sank', isCorrect: false },
      { id: 'b', text: 'F4: Oklahoma (outboard) took 9 torpedoes and capsized in 12 minutes, trapping sailors inside; Maryland (inboard) was shielded from torpedoes but hit by bombs', isCorrect: true },
      { id: 'c', text: 'F4: Both Oklahoma and Maryland were hit by torpedoes simultaneously and sank together', isCorrect: false },
      { id: 'd', text: 'F4: Oklahoma was empty; Maryland took all the damage alone', isCorrect: false },
    ],
    correctAnswer: 'B) Oklahoma outboard took 9 torpedoes and capsized in 12 minutes; Maryland inboard was shielded but hit by bombs',
    explanation: "At berth F4, USS Oklahoma was moored outboard (facing the harbor channel) and USS Maryland inboard (against Ford Island). The nested formation meant Oklahoma absorbed the torpedo strikes: 9 torpedoes in rapid succession caused her to capsize in just 12 minutes — so fast that 415 men were trapped inside the overturned hull. Rescue teams later had to drill through the ship's bottom to reach survivors in air pockets. Maryland, shielded from torpedoes by Oklahoma's hull, was only damaged by bombs dropped from above. This pattern repeated across Battleship Row: outboard ships (Oklahoma, West Virginia) took torpedo devastation while inboard ships (Maryland, Tennessee) suffered primarily bomb damage. The nested formation concentrated torpedo vulnerability on the outer vessels.",
    hostDirection: "The way the ships were parked determined who lived and who died. If you were a torpedo pilot, you could only hit the outer ship. At berth F4, that decision killed 415 men in 12 minutes.",
    sourceReference: 'Research File 2 (Geography - Mooring positions F1-F6, Oklahoma details)',
  },
  {
    id: 'arena-q13',
    tier: 'hardest',
    questionNumber: 13,
    format: 'historiography',
    topic: 'Prange/Fuchida Problem',
    question: "Gordon Prange's 'At Dawn We Slept' is the most widely read book on Pearl Harbor. What specific methodological problem makes this foundational work unreliable on key points, and which historical figures contradicted its primary source?",
    visualDescription: "A simulated book cover of 'At Dawn We Slept' appears alongside two columns of testimony excerpts — one from 1945, one from 1963 — attributed to the same person. Key contradictions are highlighted.",
    options: [
      { id: 'a', text: "Prange relied on Admiral Nagumo's memoirs, which were written to avoid war crimes prosecution; Yamamoto's staff contradicted them", isCorrect: false },
      { id: 'b', text: 'Prange relied heavily on Mitsuo Fuchida, whose accounts grew more dramatic over time; both Genda and Admiral Kusaka denied key scenes as Fuchida described them', isCorrect: true },
      { id: 'c', text: 'Prange relied on American military intelligence summaries that were later found to be fabricated; the CIA contradicted them in declassified reports', isCorrect: false },
      { id: 'd', text: 'Prange relied on captured Japanese documents that were mistranslated; Japanese historians corrected the translations in the 1990s', isCorrect: false },
    ],
    correctAnswer: 'B) Prange relied on Fuchida, whose accounts evolved dramatically; Genda and Kusaka contradicted key claims',
    explanation: "Gordon Prange conducted extensive interviews with Captain Mitsuo Fuchida, the air attack commander, making him a primary source for the book's narrative. The problem: Fuchida's story changed significantly over the decades. His 1945 testimony to the U.S. Strategic Bombing Survey was humble, tactical, and pragmatic. But by the time he collaborated with Prange in the 1960s, his account had become far more dramatic — positioning himself as a passionate advocate for a third wave who was overruled by a timid Nagumo. Crucially, Commander Minoru Genda (the actual tactical planner) and Admiral Kusaka (Nagumo's chief of staff) both denied that the third-wave debate occurred as Fuchida described it. This means the most popular Pearl Harbor book's most dramatic scenes may be substantially embellished by a self-aggrandizing primary source.",
    hostDirection: "This is the book most people read when they want to understand Pearl Harbor. Millions of copies. But there is a problem buried inside it that most readers never discover.",
    sourceReference: 'Research File 4 (Third Wave - Fuchida credibility), Research File 6 (Myths - Third Wave Mysticism)',
  },
  {
    id: 'arena-q14',
    tier: 'hardest',
    questionNumber: 14,
    format: 'three_part_analysis',
    topic: 'MAGIC Intelligence',
    question: "The United States had broken Japan's 'Purple' diplomatic cipher through a program codenamed MAGIC. What specific type of intelligence did MAGIC provide, what critical type did it NOT provide, and why does this distinction collapse the most common conspiracy theories about Pearl Harbor?",
    visualDescription: "A classified-style intelligence diagram shows two categories: 'DIPLOMATIC CODES (BROKEN)' and 'NAVAL OPERATIONAL CODES (NOT BROKEN).'",
    options: [
      { id: 'a', text: 'MAGIC broke naval codes, providing ship movements but not diplomatic intent — this proves FDR knew the fleet was coming', isCorrect: false },
      { id: 'b', text: "MAGIC broke diplomatic codes, revealing Japan's political positions but NOT military operational plans or fleet movements — meaning the U.S. had strategic warning that war was likely but no tactical knowledge of when, where, or how the attack would come", isCorrect: true },
      { id: 'c', text: 'MAGIC broke both diplomatic and naval codes but the information was restricted to a small circle who chose not to act', isCorrect: false },
      { id: 'd', text: 'MAGIC provided complete intelligence on the attack plan, which FDR suppressed to justify war entry', isCorrect: false },
    ],
    correctAnswer: 'B) MAGIC broke diplomatic codes only — strategic warning but no tactical knowledge',
    explanation: "MAGIC broke the Japanese diplomatic cipher known as 'Purple,' providing access to communications between Tokyo and its embassies. This gave the U.S. insight into Japan's diplomatic positions, negotiation strategies, and general intentions. However, MAGIC did NOT break Japanese naval operational codes (JN-25). This distinction is absolutely critical: the U.S. knew war was increasingly likely (strategic warning) but had no visibility into specific military plans, fleet movements, target selection, or attack timing (tactical intelligence). This single fact demolishes the FDR conspiracy theory, because the intelligence system physically could not have told Roosevelt when and where the attack would come. The failure at Pearl Harbor was not a conspiracy of silence but a catastrophic gap between knowing that an enemy intends to fight and knowing when and where the first blow will land.",
    hostDirection: "This is the question that separates people who understand Pearl Harbor from people who think they do. The answer destroys the biggest conspiracy theory in American history.",
    sourceReference: 'Research File 6 (Myths - Intelligence Realities), Research File 7 (Primary Sources - MAGIC and Purple)',
  },
  {
    id: 'arena-q15',
    tier: 'hardest',
    questionNumber: 15,
    format: 'historiography_deep',
    topic: 'PHNY Logbook',
    question: 'The Pearl Harbor Navy Yard Logbook was returned to the National Archives in 2025. What makes this document uniquely valuable compared to memoirs, oral histories, and post-war testimony, and what type of historical bias does it specifically avoid?',
    visualDescription: 'An animation of a weathered logbook opening, revealing handwritten entries with timestamps. Beside the logbook, faded portraits of memoir authors appear.',
    options: [
      { id: 'a', text: 'It was written by senior officers, providing authoritative command decisions not captured elsewhere', isCorrect: false },
      { id: 'b', text: 'It contains real-time, handwritten entries made DURING the attack itself, avoiding the hindsight bias, memory distortion, and self-aggrandizement that affect all post-hoc accounts', isCorrect: true },
      { id: 'c', text: 'It includes photographs taken during the attack that were previously classified', isCorrect: false },
      { id: 'd', text: 'It records intercepted Japanese radio communications that prove the third wave was planned', isCorrect: false },
    ],
    correctAnswer: 'B) Real-time entries made DURING the attack, avoiding hindsight bias and memory distortion',
    explanation: "The Pearl Harbor Navy Yard Logbook is uniquely valuable because it contains regular, handwritten entries made in real time during the attack — not reconstructed hours, months, or decades later. Every other major Pearl Harbor source (memoirs, oral histories, Congressional testimonies, post-war interviews) was created after the fact, and is therefore subject to hindsight bias (knowing how things turned out changes how you remember experiencing them), memory distortion (details shift over time), and self-aggrandizement (people tend to enhance their own roles in historical events). The PHNY Logbook avoids all of these problems. It captures events as they were perceived in the moment, with the chaos, incomplete information, and raw confusion of real-time documentation. The handwriting itself — steady at first, then increasingly urgent — tells a story that no polished memoir can replicate. It is arguably the most reliable minute-by-minute American primary source for the attack.",
    hostDirection: "This is the rarest kind of historical document. Not what someone remembered years later. Not what someone told a historian to make themselves look good. This is what someone wrote down while the bombs were still falling. And that makes all the difference.",
    sourceReference: 'Research File 7 (Primary Sources - PHNY Logbook)',
  },
];

// Helper functions
export function getQuestionsByTier(tier: ArenaTier): ArenaQuestion[] {
  return ARENA_QUESTIONS.filter(q => q.tier === tier);
}

export function getQuestionById(id: string): ArenaQuestion | undefined {
  return ARENA_QUESTIONS.find(q => q.id === id);
}

export function getQuestionByNumber(num: number): ArenaQuestion | undefined {
  return ARENA_QUESTIONS.find(q => q.questionNumber === num);
}

export function getTierForQuestion(questionNumber: number): ArenaTier {
  if (questionNumber <= 5) return 'hard';
  if (questionNumber <= 10) return 'harder';
  return 'hardest';
}

export function isCheckpointQuestion(questionNumber: number): boolean {
  return questionNumber === 5 || questionNumber === 10;
}

export function getRecognitionForCheckpoint(questionNumber: number): ArenaRecognition | null {
  if (questionNumber === 5) return 'masters';
  if (questionNumber === 10) return 'phd';
  if (questionNumber === 15) return 'rhodes_scholar';
  return null;
}

export function getXPBonusForTier(recognition: ArenaRecognition): number {
  return RECOGNITION_TIERS[recognition]?.xpBonus || 0;
}

// Shuffle questions within each tier for replayability
export function getShuffledArenaQuestions(): ArenaQuestion[] {
  const hard = getQuestionsByTier('hard').sort(() => Math.random() - 0.5);
  const harder = getQuestionsByTier('harder').sort(() => Math.random() - 0.5);
  const hardest = getQuestionsByTier('hardest').sort(() => Math.random() - 0.5);

  return [...hard, ...harder, ...hardest].map((q, index) => ({
    ...q,
    questionNumber: index + 1,
  }));
}

import { Topic, Chapter, Session, LessonCard, Question, DailyPuzzle, LeaderboardEntry, User } from '@/types';

export const mockUser: User = {
  id: 'user-1',
  displayName: 'NewUser',
  anonLeaderboard: false,
  xp: 0,
  streak: 0,
  lastActiveDate: new Date().toISOString(),
};

export const mockTopics: Topic[] = [
  { id: 't1', title: 'The Ancient World', slug: 'ancient-world', icon: '🏛️', chaptersCount: 4, chronoOrder: 1 },
  { id: 't2', title: 'Classical Civilizations', slug: 'classical-civilizations', icon: '⚔️', chaptersCount: 4, chronoOrder: 2 },
  { id: 't3', title: 'Medieval Period', slug: 'medieval-period', icon: '🏰', chaptersCount: 4, chronoOrder: 3 },
  { id: 't4', title: 'Renaissance & Exploration', slug: 'renaissance-exploration', icon: '🧭', chaptersCount: 4, chronoOrder: 4 },
  { id: 't5', title: 'Modern Era', slug: 'modern-era', icon: '🌍', chaptersCount: 4, chronoOrder: 5 },
];

export const mockChapters: Chapter[] = [
  // Ancient World
  { id: 'c1', topicId: 't1', title: 'Ancient Egypt', description: 'Pharaohs, pyramids, and the Nile civilization', sessionsCount: 3, completedSessions: 0 },
  { id: 'c2', topicId: 't1', title: 'Mesopotamia', description: 'The cradle of civilization between two rivers', sessionsCount: 3, completedSessions: 0 },
  { id: 'c3', topicId: 't1', title: 'Ancient China', description: 'Dynasties, philosophy, and the Great Wall', sessionsCount: 3, completedSessions: 0 },
  { id: 'c4', topicId: 't1', title: 'Indus Valley', description: 'One of the world\'s earliest urban civilizations', sessionsCount: 2, completedSessions: 0 },
  // Classical Civilizations
  { id: 'c5', topicId: 't2', title: 'Ancient Greece', description: 'Democracy, philosophy, and the Olympic Games', sessionsCount: 3, completedSessions: 0 },
  { id: 'c6', topicId: 't2', title: 'The Roman Empire', description: 'From republic to empire, rise and fall', sessionsCount: 4, completedSessions: 0 },
  { id: 'c7', topicId: 't2', title: 'Persian Empire', description: 'The largest empire the ancient world had seen', sessionsCount: 3, completedSessions: 0 },
  { id: 'c8', topicId: 't2', title: 'Alexander the Great', description: 'The conqueror who changed the ancient world', sessionsCount: 2, completedSessions: 0 },
  // Medieval Period
  { id: 'c9', topicId: 't3', title: 'Feudal Europe', description: 'Lords, vassals, and the feudal system', sessionsCount: 3, completedSessions: 0 },
  { id: 'c10', topicId: 't3', title: 'The Crusades', description: 'Holy wars that reshaped East and West', sessionsCount: 3, completedSessions: 0 },
  { id: 'c11', topicId: 't3', title: 'The Mongol Empire', description: 'Genghis Khan and the largest land empire', sessionsCount: 3, completedSessions: 0 },
  { id: 'c12', topicId: 't3', title: 'The Black Death', description: 'The plague that devastated medieval Europe', sessionsCount: 2, completedSessions: 0 },
  // Renaissance & Exploration
  { id: 'c13', topicId: 't4', title: 'Italian Renaissance', description: 'Art, science, and humanism reborn', sessionsCount: 3, completedSessions: 0 },
  { id: 'c14', topicId: 't4', title: 'Age of Exploration', description: 'Voyages that connected the world', sessionsCount: 3, completedSessions: 0 },
  { id: 'c15', topicId: 't4', title: 'The Reformation', description: 'Religious revolution in Europe', sessionsCount: 3, completedSessions: 0 },
  { id: 'c16', topicId: 't4', title: 'Scientific Revolution', description: 'New ways of understanding the universe', sessionsCount: 2, completedSessions: 0 },
  // Modern Era
  { id: 'c17', topicId: 't5', title: 'The French Revolution', description: 'Liberty, equality, and the fall of monarchy', sessionsCount: 3, completedSessions: 0 },
  { id: 'c18', topicId: 't5', title: 'World War I', description: 'The Great War that reshaped nations', sessionsCount: 4, completedSessions: 0 },
  { id: 'c19', topicId: 't5', title: 'World War II', description: 'Global conflict and its aftermath', sessionsCount: 4, completedSessions: 0 },
  { id: 'c20', topicId: 't5', title: 'The Cold War', description: 'Superpower rivalry and the atomic age', sessionsCount: 3, completedSessions: 0 },
];

export const mockSessions: Session[] = [
  // Ancient Egypt sessions
  { id: 's1', chapterId: 'c1', title: 'The Gift of the Nile', duration: '3-4 min', cardsCount: 4, questionsCount: 5 },
  { id: 's2', chapterId: 'c1', title: 'Pharaohs and Pyramids', duration: '4-5 min', cardsCount: 5, questionsCount: 5 },
  { id: 's3', chapterId: 'c1', title: 'Egyptian Religion', duration: '3-4 min', cardsCount: 4, questionsCount: 5 },
  // Ancient Greece sessions
  { id: 's4', chapterId: 'c5', title: 'Birth of Democracy', duration: '3-4 min', cardsCount: 4, questionsCount: 5 },
  { id: 's5', chapterId: 'c5', title: 'Greek Philosophy', duration: '4-5 min', cardsCount: 5, questionsCount: 5 },
  { id: 's6', chapterId: 'c5', title: 'Sparta vs Athens', duration: '3-4 min', cardsCount: 4, questionsCount: 5 },
  // Roman Empire sessions
  { id: 's7', chapterId: 'c6', title: 'Rise of Rome', duration: '4-5 min', cardsCount: 5, questionsCount: 5 },
  { id: 's8', chapterId: 'c6', title: 'Julius Caesar', duration: '3-4 min', cardsCount: 4, questionsCount: 5 },
  { id: 's9', chapterId: 'c6', title: 'Fall of Rome', duration: '4-5 min', cardsCount: 5, questionsCount: 5 },
];

export const mockLessonCards: LessonCard[] = [
  // The Gift of the Nile (s1)
  {
    id: 'lc1',
    sessionId: 's1',
    title: 'The Nile: Lifeline of Egypt',
    body: 'Ancient Egypt flourished along the Nile River, which flows north through the desert for over 4,000 miles. The annual flooding of the Nile deposited rich, fertile soil along its banks, making agriculture possible in an otherwise barren landscape.',
    keyFact: 'The ancient Egyptians called their land "Kemet" meaning "black land" after the dark, fertile soil left by the Nile floods.',
  },
  {
    id: 'lc2',
    sessionId: 's1',
    title: 'Predictable Flooding',
    body: 'Unlike other rivers, the Nile flooded predictably every year between June and September. This allowed Egyptians to plan their agricultural calendar with precision, planting crops after the waters receded and harvesting before the next flood.',
    keyFact: 'The Egyptians developed a 365-day calendar based on the Nile\'s flooding cycle.',
  },
  {
    id: 'lc3',
    sessionId: 's1',
    title: 'Transportation and Trade',
    body: 'The Nile served as Egypt\'s main highway. Boats could sail south using the wind and float north with the current. This made trade and communication between Upper and Lower Egypt efficient and united the civilization.',
    keyFact: 'The Nile was so central to Egyptian life that their words for "north" and "south" literally meant "downstream" and "upstream."',
  },
  {
    id: 'lc4',
    sessionId: 's1',
    title: 'Gift of the Gods',
    body: 'Egyptians believed the Nile was a gift from the gods, particularly Hapi, the god of the annual flood. They celebrated the flooding with festivals and offerings, thanking the gods for another year of abundance.',
    keyFact: 'The Greek historian Herodotus called Egypt "the gift of the Nile."',
  },
  // Birth of Democracy (s4)
  {
    id: 'lc5',
    sessionId: 's4',
    title: 'Athens: Birthplace of Democracy',
    body: 'Around 508 BCE, the Athenian leader Cleisthenes introduced a system of political reforms that he called "demokratia" — rule by the people. This was revolutionary: for the first time, ordinary citizens could participate directly in government.',
    keyFact: 'The word "democracy" comes from the Greek words "demos" (people) and "kratos" (power or rule).',
  },
  {
    id: 'lc6',
    sessionId: 's4',
    title: 'The Assembly',
    body: 'All male citizens over 18 could attend the Assembly (Ekklesia), which met about 40 times per year on a hillside called the Pnyx. Here, citizens debated and voted on laws, war, and foreign policy. A quorum of 6,000 was needed for major decisions.',
    keyFact: 'Citizens were paid a small fee to attend the Assembly, ensuring even poor citizens could participate.',
  },
  {
    id: 'lc7',
    sessionId: 's4',
    title: 'Lottery and Rotation',
    body: 'Many government positions were filled by lottery rather than election. Athenians believed this prevented corruption and ensured all citizens had equal opportunity to serve. Most positions rotated annually.',
    keyFact: 'The Council of 500, which prepared business for the Assembly, was chosen entirely by lottery.',
  },
  {
    id: 'lc8',
    sessionId: 's4',
    title: 'Limits of Athenian Democracy',
    body: 'Athenian democracy had significant limitations. Women, slaves, and foreigners could not participate. Only about 30,000 of Athens\' 300,000 residents were eligible citizens. Despite these limits, it remains a foundational model for modern democracies.',
    keyFact: 'Women in Athens had no political rights and could not own property in their own name.',
  },
];

export const mockQuestions: Question[] = [
  // The Gift of the Nile questions (s1)
  {
    id: 'q1',
    sessionId: 's1',
    type: 'multiple-choice',
    prompt: 'What did the ancient Egyptians call their land?',
    choices: ['Kemet', 'Aegyptus', 'Nubia', 'Memphis'],
    answer: 0,
    explanation: 'The Egyptians called their land "Kemet" meaning "black land" after the dark, fertile soil deposited by the Nile floods.',
  },
  {
    id: 'q2',
    sessionId: 's1',
    type: 'multiple-choice',
    prompt: 'When did the Nile flood each year?',
    choices: ['January to March', 'June to September', 'October to December', 'March to May'],
    answer: 1,
    explanation: 'The Nile flooded predictably every year between June and September, allowing Egyptians to plan their agricultural calendar.',
  },
  {
    id: 'q3',
    sessionId: 's1',
    type: 'true-false',
    prompt: 'The Egyptians developed a 365-day calendar based on the Nile\'s flooding cycle.',
    choices: ['True', 'False'],
    answer: 0,
    explanation: 'True! The predictable nature of the Nile\'s flooding helped Egyptians develop one of the earliest 365-day calendars.',
  },
  {
    id: 'q4',
    sessionId: 's1',
    type: 'multiple-choice',
    prompt: 'Who was Hapi in Egyptian mythology?',
    choices: ['The sun god', 'The god of the annual flood', 'The god of the dead', 'The king of the gods'],
    answer: 1,
    explanation: 'Hapi was the god of the annual Nile flood. Egyptians believed the flooding was a gift from the gods.',
  },
  {
    id: 'q5',
    sessionId: 's1',
    type: 'multiple-choice',
    prompt: 'Which Greek historian called Egypt "the gift of the Nile"?',
    choices: ['Plato', 'Aristotle', 'Herodotus', 'Thucydides'],
    answer: 2,
    explanation: 'Herodotus, often called the "Father of History," famously described Egypt as "the gift of the Nile."',
  },
  // Birth of Democracy questions (s4)
  {
    id: 'q6',
    sessionId: 's4',
    type: 'multiple-choice',
    prompt: 'Who introduced democratic reforms in Athens around 508 BCE?',
    choices: ['Pericles', 'Cleisthenes', 'Solon', 'Draco'],
    answer: 1,
    explanation: 'Cleisthenes introduced democratic reforms in 508 BCE and is often called the "Father of Athenian Democracy."',
  },
  {
    id: 'q7',
    sessionId: 's4',
    type: 'multiple-choice',
    prompt: 'What was the Athenian Assembly called?',
    choices: ['Senate', 'Agora', 'Ekklesia', 'Boule'],
    answer: 2,
    explanation: 'The Ekklesia was the principal assembly of Athenian democracy, where citizens voted on laws and policy.',
  },
  {
    id: 'q8',
    sessionId: 's4',
    type: 'true-false',
    prompt: 'Many government positions in Athens were filled by lottery rather than election.',
    choices: ['True', 'False'],
    answer: 0,
    explanation: 'True! Athenians believed lottery prevented corruption and gave all citizens equal opportunity to serve.',
  },
  {
    id: 'q9',
    sessionId: 's4',
    type: 'multiple-choice',
    prompt: 'Approximately what percentage of Athens\' population could vote?',
    choices: ['About 10%', 'About 30%', 'About 50%', 'About 75%'],
    answer: 0,
    explanation: 'Only about 10% of Athens\' population (30,000 of 300,000) were eligible citizens who could participate in democracy.',
  },
  {
    id: 'q10',
    sessionId: 's4',
    type: 'multiple-choice',
    prompt: 'Where did the Athenian Assembly typically meet?',
    choices: ['The Parthenon', 'The Agora', 'The Pnyx', 'The Acropolis'],
    answer: 2,
    explanation: 'The Assembly met on the Pnyx, a hill near the Acropolis that could accommodate thousands of citizens.',
  },
];

export const mockDailyPuzzle: DailyPuzzle = {
  id: 'dp-today',
  date: new Date().toISOString().split('T')[0],
  clues: [
    'A mighty empire fell on this date, ending over a thousand years of history.',
    'The city\'s walls were breached after a 53-day siege.',
    'The conqueror renamed the city and made it his new capital.',
  ],
  answer: 1453,
  explanation: 'Constantinople fell to the Ottoman Turks on May 29, 1453, ending the Byzantine Empire. Sultan Mehmed II renamed it Istanbul.',
};

export const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, userId: 'u1', displayName: 'HistoryMaster', xp: 2450 },
  { rank: 2, userId: 'u2', displayName: 'ChronoKing', xp: 2180 },
  { rank: 3, userId: 'u3', displayName: 'AncientScribe', xp: 1920 },
  { rank: 4, userId: 'u4', displayName: 'TimeWalker', xp: 1750 },
  { rank: 5, userId: 'u5', displayName: 'EraExplorer', xp: 1580 },
  { rank: 6, userId: 'user-1', displayName: 'NewUser', xp: 0, isCurrentUser: true },
];

export const continueSession = null;

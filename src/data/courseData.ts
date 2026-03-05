import { Course, Unit, Lesson, Instructor, CourseCarouselRow } from '@/types';

// ---- INSTRUCTORS ----

export const instructors: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Dr. Sarah Chen',
    title: 'Professor of Ancient History',
    avatar: '👩‍🏫',
    bio: 'Dr. Chen has spent over 20 years researching ancient civilizations, with a focus on Egypt and Mesopotamia. Her work has been featured in National Geographic and the Smithsonian.',
    credentials: 'PhD, Cambridge University',
  },
  {
    id: 'inst-2',
    name: 'Prof. Marcus Williams',
    title: 'Classical Studies Scholar',
    avatar: '👨‍🎓',
    bio: 'A leading expert on Greek and Roman history, Professor Williams brings ancient civilizations to life through engaging storytelling and archaeological insights.',
    credentials: 'PhD, Oxford University',
  },
  {
    id: 'inst-3',
    name: 'Dr. Elena Vasquez',
    title: 'Medieval History Expert',
    avatar: '👩‍🔬',
    bio: 'Dr. Vasquez specializes in medieval European history, with particular expertise in the Crusades and feudal systems. She has authored three bestselling history books.',
    credentials: 'PhD, Sorbonne University',
  },
  {
    id: 'inst-4',
    name: 'Dr. James Okonkwo',
    title: 'Renaissance Scholar',
    avatar: '👨‍🏫',
    bio: 'An expert on the Renaissance and Age of Exploration, Dr. Okonkwo combines art history with political analysis to reveal how ideas transformed the world.',
    credentials: 'PhD, University of Florence',
  },
  {
    id: 'inst-5',
    name: 'Prof. Lisa Park',
    title: 'Modern History Specialist',
    avatar: '👩‍💼',
    bio: 'Professor Park focuses on 20th-century history, with expertise in both World Wars and the Cold War era. Her documentary series has won multiple awards.',
    credentials: 'PhD, Harvard University',
  },
  {
    id: 'inst-6',
    name: 'Dr. Ahmed Hassan',
    title: 'Military History Expert',
    avatar: '👨‍✈️',
    bio: 'A former military strategist turned historian, Dr. Hassan analyzes the great battles and military innovations that shaped civilizations throughout history.',
    credentials: 'PhD, West Point Military Academy',
  },
];

// ---- COURSES ----

export const courses: Course[] = [
  {
    id: 'course-1',
    title: 'Ancient Egypt: Land of the Pharaohs',
    slug: 'ancient-egypt',
    description: 'Journey through 3,000 years of Egyptian civilization. Explore the mysteries of the pyramids, decode hieroglyphics, and meet the powerful pharaohs who built an empire along the Nile.',
    thumbnailUrl: '/images/courses/egypt-thumb.jpg',
    heroImageUrl: '/images/courses/egypt-hero.jpg',
    category: 'ancient-history',
    difficulty: 'beginner',
    totalDurationMinutes: 180,
    rating: 4.8,
    ratingsCount: 1247,
    enrolledCount: 12500,
    instructorId: 'inst-1',
    unitsCount: 4,
    lessonsCount: 12,
    learningOutcomes: [
      'Understand the importance of the Nile River to Egyptian civilization',
      'Identify major pharaohs and their contributions',
      'Explain ancient Egyptian religious beliefs and practices',
      'Describe the construction and purpose of the pyramids',
    ],
    isFeatured: true,
    chronoOrder: 1,
  },
  {
    id: 'course-2',
    title: 'Classical Greece: Democracy & Philosophy',
    slug: 'classical-greece',
    description: 'Discover the birthplace of democracy, philosophy, and the Olympic Games. From the wisdom of Socrates to the strategies of Alexander, explore the civilization that shaped Western thought.',
    thumbnailUrl: '/images/courses/greece-thumb.jpg',
    heroImageUrl: '/images/courses/greece-hero.jpg',
    category: 'ancient-history',
    difficulty: 'beginner',
    totalDurationMinutes: 210,
    rating: 4.9,
    ratingsCount: 982,
    enrolledCount: 9800,
    instructorId: 'inst-2',
    unitsCount: 4,
    lessonsCount: 14,
    learningOutcomes: [
      'Explain the origins and workings of Athenian democracy',
      'Compare the philosophies of Socrates, Plato, and Aristotle',
      'Analyze the rivalry between Athens and Sparta',
      'Assess Alexander the Great\'s impact on the ancient world',
    ],
    isNew: true,
    chronoOrder: 2,
  },
  {
    id: 'course-3',
    title: 'The Roman Empire: Rise and Fall',
    slug: 'roman-empire',
    description: 'From a small city-state to the greatest empire the world had ever seen. Follow Rome\'s journey through triumph and tragedy, from Julius Caesar to the fall of the Western Empire.',
    thumbnailUrl: '/images/courses/rome-thumb.jpg',
    heroImageUrl: '/images/courses/rome-hero.jpg',
    category: 'ancient-history',
    difficulty: 'intermediate',
    totalDurationMinutes: 270,
    rating: 4.7,
    ratingsCount: 1534,
    enrolledCount: 15200,
    instructorId: 'inst-2',
    unitsCount: 5,
    lessonsCount: 16,
    learningOutcomes: [
      'Trace the evolution from Roman Republic to Empire',
      'Analyze the leadership styles of key emperors',
      'Understand Roman engineering and cultural achievements',
      'Identify the factors that led to Rome\'s decline',
    ],
    chronoOrder: 3,
  },
  {
    id: 'course-4',
    title: 'Medieval Europe: Castles & Crusades',
    slug: 'medieval-europe',
    description: 'Enter the world of knights, castles, and religious crusades. Explore the feudal system, witness the Black Death\'s devastation, and understand how medieval society transformed into the Renaissance.',
    thumbnailUrl: '/images/courses/medieval-thumb.jpg',
    heroImageUrl: '/images/courses/medieval-hero.jpg',
    category: 'medieval',
    difficulty: 'intermediate',
    totalDurationMinutes: 240,
    rating: 4.6,
    ratingsCount: 876,
    enrolledCount: 8700,
    instructorId: 'inst-3',
    unitsCount: 4,
    lessonsCount: 13,
    learningOutcomes: [
      'Describe the structure and function of the feudal system',
      'Analyze the causes and effects of the Crusades',
      'Explain the impact of the Black Death on European society',
      'Identify the key cultural and technological developments',
    ],
    chronoOrder: 4,
  },
  {
    id: 'course-5',
    title: 'World War II: The Global Conflict',
    slug: 'world-war-ii',
    description: 'The most devastating conflict in human history. From the rise of fascism to D-Day, from the Holocaust to Hiroshima, understand the war that reshaped our world.',
    thumbnailUrl: '/images/courses/ww2-thumb.jpg',
    heroImageUrl: '/images/courses/ww2-hero.jpg',
    category: 'modern',
    difficulty: 'intermediate',
    totalDurationMinutes: 300,
    rating: 4.9,
    ratingsCount: 2156,
    enrolledCount: 21500,
    instructorId: 'inst-5',
    unitsCount: 6,
    lessonsCount: 20,
    learningOutcomes: [
      'Identify the causes and key events leading to WWII',
      'Analyze major battles and turning points of the war',
      'Understand the Holocaust and its historical significance',
      'Evaluate the war\'s impact on the modern world order',
    ],
    isFeatured: true,
    chronoOrder: 5,
  },
];

// ---- UNITS ----

export const units: Unit[] = [
  // Ancient Egypt Course
  {
    id: 'unit-1-1',
    courseId: 'course-1',
    order: 1,
    title: 'The Gift of the Nile',
    description: 'Discover how the Nile River shaped every aspect of Egyptian civilization.',
    lessonsCount: 3,
    totalDurationMinutes: 45,
  },
  {
    id: 'unit-1-2',
    courseId: 'course-1',
    order: 2,
    title: 'Pharaohs and Pyramids',
    description: 'Meet the god-kings who ruled Egypt and built monuments for eternity.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-1-3',
    courseId: 'course-1',
    order: 3,
    title: 'Egyptian Religion',
    description: 'Explore the complex beliefs about gods, the afterlife, and mummification.',
    lessonsCount: 3,
    totalDurationMinutes: 45,
  },
  {
    id: 'unit-1-4',
    courseId: 'course-1',
    order: 4,
    title: 'Daily Life in Egypt',
    description: 'See how ordinary Egyptians lived, worked, and celebrated.',
    lessonsCount: 3,
    totalDurationMinutes: 40,
  },
  // Classical Greece Course
  {
    id: 'unit-2-1',
    courseId: 'course-2',
    order: 1,
    title: 'Birth of Democracy',
    description: 'Learn how Athens invented a revolutionary form of government.',
    lessonsCount: 4,
    totalDurationMinutes: 55,
  },
  {
    id: 'unit-2-2',
    courseId: 'course-2',
    order: 2,
    title: 'Greek Philosophy',
    description: 'Explore the ideas of Socrates, Plato, and Aristotle.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-2-3',
    courseId: 'course-2',
    order: 3,
    title: 'Sparta vs Athens',
    description: 'Witness the rivalry between two powerful city-states.',
    lessonsCount: 4,
    totalDurationMinutes: 55,
  },
  {
    id: 'unit-2-4',
    courseId: 'course-2',
    order: 4,
    title: 'Alexander the Great',
    description: 'Follow the conqueror who spread Greek culture across the known world.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  // Roman Empire Course
  {
    id: 'unit-3-1',
    courseId: 'course-3',
    order: 1,
    title: 'Rise of Rome',
    description: 'From village to republic: the early centuries of Roman history.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-3-2',
    courseId: 'course-3',
    order: 2,
    title: 'Julius Caesar',
    description: 'The general who conquered Gaul and changed Rome forever.',
    lessonsCount: 3,
    totalDurationMinutes: 55,
  },
  {
    id: 'unit-3-3',
    courseId: 'course-3',
    order: 3,
    title: 'The Roman Empire',
    description: 'Augustus and the golden age of imperial Rome.',
    lessonsCount: 4,
    totalDurationMinutes: 60,
  },
  {
    id: 'unit-3-4',
    courseId: 'course-3',
    order: 4,
    title: 'Roman Culture',
    description: 'Engineering marvels, gladiators, and daily life in Rome.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-3-5',
    courseId: 'course-3',
    order: 5,
    title: 'Fall of Rome',
    description: 'The factors that brought down the greatest empire.',
    lessonsCount: 3,
    totalDurationMinutes: 55,
  },
  // Medieval Europe Course
  {
    id: 'unit-4-1',
    courseId: 'course-4',
    order: 1,
    title: 'Feudal Society',
    description: 'Lords, vassals, serfs: the structure of medieval life.',
    lessonsCount: 3,
    totalDurationMinutes: 55,
  },
  {
    id: 'unit-4-2',
    courseId: 'course-4',
    order: 2,
    title: 'The Crusades',
    description: 'Holy wars that reshaped relations between East and West.',
    lessonsCount: 4,
    totalDurationMinutes: 65,
  },
  {
    id: 'unit-4-3',
    courseId: 'course-4',
    order: 3,
    title: 'The Black Death',
    description: 'The plague that killed a third of Europe.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-4-4',
    courseId: 'course-4',
    order: 4,
    title: 'Medieval Culture',
    description: 'Castles, cathedrals, and the seeds of the Renaissance.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  // World War II Course
  {
    id: 'unit-5-1',
    courseId: 'course-5',
    order: 1,
    title: 'Road to War',
    description: 'How the Treaty of Versailles and the Great Depression led to conflict.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-5-2',
    courseId: 'course-5',
    order: 2,
    title: 'Blitzkrieg',
    description: 'Germany\'s lightning war conquers Europe.',
    lessonsCount: 4,
    totalDurationMinutes: 55,
  },
  {
    id: 'unit-5-3',
    courseId: 'course-5',
    order: 3,
    title: 'Turning Points',
    description: 'Stalingrad, Midway, and El Alamein change the war\'s direction.',
    lessonsCount: 4,
    totalDurationMinutes: 55,
  },
  {
    id: 'unit-5-4',
    courseId: 'course-5',
    order: 4,
    title: 'The Holocaust',
    description: 'Understanding the systematic genocide of six million Jews.',
    lessonsCount: 3,
    totalDurationMinutes: 45,
  },
  {
    id: 'unit-5-5',
    courseId: 'course-5',
    order: 5,
    title: 'D-Day to Victory',
    description: 'The Allied invasion of Europe and the fall of Nazi Germany.',
    lessonsCount: 3,
    totalDurationMinutes: 50,
  },
  {
    id: 'unit-5-6',
    courseId: 'course-5',
    order: 6,
    title: 'Pacific Theater',
    description: 'Island hopping, atomic bombs, and Japan\'s surrender.',
    lessonsCount: 3,
    totalDurationMinutes: 45,
  },
];

// ---- LESSONS ----

export const lessons: Lesson[] = [
  // Ancient Egypt - Unit 1: Gift of the Nile
  { id: 'lesson-1-1-1', unitId: 'unit-1-1', order: 1, title: 'The Nile River', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-1-1-2', unitId: 'unit-1-1', order: 2, title: 'Predictable Flooding', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-1-1-3', unitId: 'unit-1-1', order: 3, title: 'Transportation and Trade', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Ancient Egypt - Unit 2: Pharaohs and Pyramids
  { id: 'lesson-1-2-1', unitId: 'unit-1-2', order: 1, title: 'The God-Kings', durationMinutes: 15, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-1-2-2', unitId: 'unit-1-2', order: 2, title: 'Building the Pyramids', durationMinutes: 20, cardsCount: 5, questionsCount: 5, xpReward: 35 },
  { id: 'lesson-1-2-3', unitId: 'unit-1-2', order: 3, title: 'Famous Pharaohs', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Ancient Egypt - Unit 3: Egyptian Religion
  { id: 'lesson-1-3-1', unitId: 'unit-1-3', order: 1, title: 'Gods and Goddesses', durationMinutes: 15, cardsCount: 5, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-1-3-2', unitId: 'unit-1-3', order: 2, title: 'The Afterlife', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-1-3-3', unitId: 'unit-1-3', order: 3, title: 'Mummification', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Ancient Egypt - Unit 4: Daily Life
  { id: 'lesson-1-4-1', unitId: 'unit-1-4', order: 1, title: 'Social Classes', durationMinutes: 12, cardsCount: 4, questionsCount: 4, xpReward: 20 },
  { id: 'lesson-1-4-2', unitId: 'unit-1-4', order: 2, title: 'Work and Crafts', durationMinutes: 14, cardsCount: 4, questionsCount: 4, xpReward: 22 },
  { id: 'lesson-1-4-3', unitId: 'unit-1-4', order: 3, title: 'Food and Festivals', durationMinutes: 14, cardsCount: 4, questionsCount: 4, xpReward: 22 },

  // Classical Greece - Unit 1: Birth of Democracy
  { id: 'lesson-2-1-1', unitId: 'unit-2-1', order: 1, title: 'Athens Rises', durationMinutes: 12, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-2-1-2', unitId: 'unit-2-1', order: 2, title: 'Cleisthenes\' Reforms', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-2-1-3', unitId: 'unit-2-1', order: 3, title: 'The Assembly', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-2-1-4', unitId: 'unit-2-1', order: 4, title: 'Limits of Democracy', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Classical Greece - Unit 2: Philosophy
  { id: 'lesson-2-2-1', unitId: 'unit-2-2', order: 1, title: 'Socrates', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-2-2-2', unitId: 'unit-2-2', order: 2, title: 'Plato', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-2-2-3', unitId: 'unit-2-2', order: 3, title: 'Aristotle', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  // Classical Greece - Unit 3: Sparta vs Athens
  { id: 'lesson-2-3-1', unitId: 'unit-2-3', order: 1, title: 'Spartan Society', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-2-3-2', unitId: 'unit-2-3', order: 2, title: 'Athenian Culture', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-2-3-3', unitId: 'unit-2-3', order: 3, title: 'Persian Wars', durationMinutes: 15, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-2-3-4', unitId: 'unit-2-3', order: 4, title: 'Peloponnesian War', durationMinutes: 12, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Classical Greece - Unit 4: Alexander
  { id: 'lesson-2-4-1', unitId: 'unit-2-4', order: 1, title: 'Philip of Macedon', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-2-4-2', unitId: 'unit-2-4', order: 2, title: 'Alexander\'s Conquests', durationMinutes: 18, cardsCount: 5, questionsCount: 5, xpReward: 35 },
  { id: 'lesson-2-4-3', unitId: 'unit-2-4', order: 3, title: 'Hellenistic World', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },

  // Roman Empire - Unit 1: Rise of Rome
  { id: 'lesson-3-1-1', unitId: 'unit-3-1', order: 1, title: 'Founding Myths', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-3-1-2', unitId: 'unit-3-1', order: 2, title: 'The Republic', durationMinutes: 18, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-1-3', unitId: 'unit-3-1', order: 3, title: 'Punic Wars', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  // Roman Empire - Unit 2: Julius Caesar
  { id: 'lesson-3-2-1', unitId: 'unit-3-2', order: 1, title: 'Conquest of Gaul', durationMinutes: 18, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-2-2', unitId: 'unit-3-2', order: 2, title: 'Crossing the Rubicon', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-2-3', unitId: 'unit-3-2', order: 3, title: 'Ides of March', durationMinutes: 20, cardsCount: 5, questionsCount: 5, xpReward: 35 },
  // Roman Empire - Unit 3: The Empire
  { id: 'lesson-3-3-1', unitId: 'unit-3-3', order: 1, title: 'Augustus Caesar', durationMinutes: 15, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-3-2', unitId: 'unit-3-3', order: 2, title: 'Pax Romana', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-3-3-3', unitId: 'unit-3-3', order: 3, title: 'The Five Good Emperors', durationMinutes: 15, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-3-4', unitId: 'unit-3-3', order: 4, title: 'Crisis of the Third Century', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Roman Empire - Unit 4: Culture
  { id: 'lesson-3-4-1', unitId: 'unit-3-4', order: 1, title: 'Roman Engineering', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-4-2', unitId: 'unit-3-4', order: 2, title: 'Gladiators & Games', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-4-3', unitId: 'unit-3-4', order: 3, title: 'Daily Life in Rome', durationMinutes: 17, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Roman Empire - Unit 5: Fall
  { id: 'lesson-3-5-1', unitId: 'unit-3-5', order: 1, title: 'Barbarian Invasions', durationMinutes: 18, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-5-2', unitId: 'unit-3-5', order: 2, title: 'Division of the Empire', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-3-5-3', unitId: 'unit-3-5', order: 3, title: 'The End of Rome', durationMinutes: 20, cardsCount: 5, questionsCount: 5, xpReward: 35 },

  // Medieval Europe - Unit 1: Feudal Society
  { id: 'lesson-4-1-1', unitId: 'unit-4-1', order: 1, title: 'The Feudal System', durationMinutes: 18, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-1-2', unitId: 'unit-4-1', order: 2, title: 'Lords and Vassals', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-1-3', unitId: 'unit-4-1', order: 3, title: 'Life of a Serf', durationMinutes: 20, cardsCount: 5, questionsCount: 5, xpReward: 35 },
  // Medieval Europe - Unit 2: Crusades
  { id: 'lesson-4-2-1', unitId: 'unit-4-2', order: 1, title: 'Call to Crusade', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-2-2', unitId: 'unit-4-2', order: 2, title: 'First Crusade', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-2-3', unitId: 'unit-4-2', order: 3, title: 'Saladin & Richard', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-2-4', unitId: 'unit-4-2', order: 4, title: 'Legacy of the Crusades', durationMinutes: 16, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // Medieval Europe - Unit 3: Black Death
  { id: 'lesson-4-3-1', unitId: 'unit-4-3', order: 1, title: 'Plague Arrives', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-3-2', unitId: 'unit-4-3', order: 2, title: 'Death Toll', durationMinutes: 16, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-4-3-3', unitId: 'unit-4-3', order: 3, title: 'Social Upheaval', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  // Medieval Europe - Unit 4: Culture
  { id: 'lesson-4-4-1', unitId: 'unit-4-4', order: 1, title: 'Castle Life', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-4-2', unitId: 'unit-4-4', order: 2, title: 'Gothic Cathedrals', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-4-4-3', unitId: 'unit-4-4', order: 3, title: 'Seeds of Change', durationMinutes: 17, cardsCount: 4, questionsCount: 5, xpReward: 25 },

  // World War II - Unit 1: Road to War
  { id: 'lesson-5-1-1', unitId: 'unit-5-1', order: 1, title: 'Treaty of Versailles', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-1-2', unitId: 'unit-5-1', order: 2, title: 'Rise of Fascism', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-1-3', unitId: 'unit-5-1', order: 3, title: 'Appeasement Fails', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  // World War II - Unit 2: Blitzkrieg
  { id: 'lesson-5-2-1', unitId: 'unit-5-2', order: 1, title: 'Invasion of Poland', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-5-2-2', unitId: 'unit-5-2', order: 2, title: 'Fall of France', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-5-2-3', unitId: 'unit-5-2', order: 3, title: 'Battle of Britain', durationMinutes: 14, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-2-4', unitId: 'unit-5-2', order: 4, title: 'Operation Barbarossa', durationMinutes: 13, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // World War II - Unit 3: Turning Points
  { id: 'lesson-5-3-1', unitId: 'unit-5-3', order: 1, title: 'Stalingrad', durationMinutes: 14, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-3-2', unitId: 'unit-5-3', order: 2, title: 'Midway', durationMinutes: 14, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-3-3', unitId: 'unit-5-3', order: 3, title: 'El Alamein', durationMinutes: 13, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-5-3-4', unitId: 'unit-5-3', order: 4, title: 'Kursk', durationMinutes: 14, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  // World War II - Unit 4: Holocaust
  { id: 'lesson-5-4-1', unitId: 'unit-5-4', order: 1, title: 'Nazi Ideology', durationMinutes: 15, cardsCount: 5, questionsCount: 4, xpReward: 25 },
  { id: 'lesson-5-4-2', unitId: 'unit-5-4', order: 2, title: 'The Final Solution', durationMinutes: 15, cardsCount: 5, questionsCount: 4, xpReward: 25 },
  { id: 'lesson-5-4-3', unitId: 'unit-5-4', order: 3, title: 'Resistance & Liberation', durationMinutes: 15, cardsCount: 5, questionsCount: 4, xpReward: 25 },
  // World War II - Unit 5: D-Day to Victory
  { id: 'lesson-5-5-1', unitId: 'unit-5-5', order: 1, title: 'D-Day', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 35 },
  { id: 'lesson-5-5-2', unitId: 'unit-5-5', order: 2, title: 'Liberation of Paris', durationMinutes: 16, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-5-3', unitId: 'unit-5-5', order: 3, title: 'Fall of Berlin', durationMinutes: 17, cardsCount: 5, questionsCount: 5, xpReward: 35 },
  // World War II - Unit 6: Pacific
  { id: 'lesson-5-6-1', unitId: 'unit-5-6', order: 1, title: 'Island Hopping', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
  { id: 'lesson-5-6-2', unitId: 'unit-5-6', order: 2, title: 'Atomic Bombs', durationMinutes: 15, cardsCount: 5, questionsCount: 5, xpReward: 30 },
  { id: 'lesson-5-6-3', unitId: 'unit-5-6', order: 3, title: 'Japan Surrenders', durationMinutes: 15, cardsCount: 4, questionsCount: 5, xpReward: 25 },
];

// ---- CAROUSEL ROWS ----

export const carouselRows: CourseCarouselRow[] = [
  {
    id: 'row-continue',
    title: 'Continue Learning',
    subtitle: 'Pick up where you left off',
    type: 'continue',
    courseIds: [], // Populated dynamically based on user progress
  },
  {
    id: 'row-popular',
    title: 'Popular Courses',
    subtitle: 'Top picks from our community',
    type: 'featured',
    courseIds: ['course-5', 'course-1', 'course-3', 'course-2'],
  },
  {
    id: 'row-ancient',
    title: 'Ancient History',
    type: 'category',
    courseIds: ['course-1', 'course-2', 'course-3'],
  },
  {
    id: 'row-medieval',
    title: 'Medieval Era',
    type: 'category',
    courseIds: ['course-4'],
  },
  {
    id: 'row-modern',
    title: 'Modern History',
    type: 'category',
    courseIds: ['course-5'],
  },
];

// ---- HELPER FUNCTIONS ----

export function getCourseById(id: string): Course | undefined {
  return courses.find(c => c.id === id);
}

export function getUnitsByCourseId(courseId: string): Unit[] {
  return units.filter(u => u.courseId === courseId).sort((a, b) => a.order - b.order);
}

export function getLessonsByUnitId(unitId: string): Lesson[] {
  return lessons.filter(l => l.unitId === unitId).sort((a, b) => a.order - b.order);
}

export function getInstructorById(id: string): Instructor | undefined {
  return instructors.find(i => i.id === id);
}

export function getCoursesByCategory(category: string): Course[] {
  return courses.filter(c => c.category === category);
}

export function getFeaturedCourse(): Course | undefined {
  return courses.find(c => c.isFeatured);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMinutes} min`;
}

export function formatEnrollment(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

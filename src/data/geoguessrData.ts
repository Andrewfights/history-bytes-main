// Historical scenes for Geoguessr History Mode

export interface Clue {
  id: string;
  text: string;
  xpPenalty: number;
}

export interface HistoricalScene {
  id: string;
  imageUrl: string;
  panoramaUrl?: string;
  event: string;
  year: number;
  location: string;
  era: string;
  difficulty: 1 | 2 | 3 | 4;
  clues: Clue[];
  options: {
    events?: string[];
    years?: number[];
    locations?: string[];
  };
  revealText: string;
  funFact: string;
}

export type GeoguessrMode = 'where' | 'when' | 'what';

// Historical scenes data
export const historicalScenes: HistoricalScene[] = [
  {
    id: 'bastille-1789',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Prise_de_la_Bastille.jpg/800px-Prise_de_la_Bastille.jpg',
    event: 'The Storming of the Bastille',
    year: 1789,
    location: 'Paris, France',
    era: 'French Revolution',
    difficulty: 2,
    clues: [
      { id: 'c1', text: 'This fortress was a symbol of royal authority and absolutism', xpPenalty: 10 },
      { id: 'c2', text: 'The date of this event became a national holiday in France', xpPenalty: 10 },
      { id: 'c3', text: 'Only 7 prisoners were found inside when it fell', xpPenalty: 10 },
      { id: 'c4', text: 'This event is often considered the start of a major revolution', xpPenalty: 10 },
    ],
    options: {
      events: [
        'The Storming of the Bastille',
        'The Reign of Terror',
        "Napoleon's Coronation",
        'The Tennis Court Oath',
      ],
      years: [1789, 1793, 1804, 1792],
      locations: ['Paris, France', 'Versailles, France', 'Lyon, France', 'Marseille, France'],
    },
    revealText: 'On July 14, 1789, Parisians stormed the Bastille fortress, marking the symbolic start of the French Revolution. The medieval fortress had become a symbol of royal tyranny.',
    funFact: 'The Bastille held only 7 prisoners on the day it was stormed!',
  },
  {
    id: 'colosseum-80ad',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/800px-Colosseo_2020.jpg',
    event: 'Inauguration of the Colosseum',
    year: 80,
    location: 'Rome, Italy',
    era: 'Ancient Rome',
    difficulty: 2,
    clues: [
      { id: 'c1', text: 'This amphitheater could hold up to 80,000 spectators', xpPenalty: 10 },
      { id: 'c2', text: 'It was built using concrete and sand', xpPenalty: 10 },
      { id: 'c3', text: 'Gladiatorial contests and public spectacles were held here', xpPenalty: 10 },
      { id: 'c4', text: 'Construction began under Emperor Vespasian', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Inauguration of the Colosseum',
        'Fall of Rome',
        'Assassination of Caesar',
        'Eruption of Vesuvius',
      ],
      years: [80, 79, 44, 476],
      locations: ['Rome, Italy', 'Pompeii, Italy', 'Athens, Greece', 'Constantinople'],
    },
    revealText: 'The Colosseum was inaugurated in 80 AD under Emperor Titus. The opening games lasted 100 days and featured gladiatorial combat, animal hunts, and mock naval battles.',
    funFact: 'The Colosseum had a retractable awning called the velarium to protect spectators from the sun!',
  },
  {
    id: 'd-day-1944',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Into_the_Jaws_of_Death_23-0455M_edit.jpg/800px-Into_the_Jaws_of_Death_23-0455M_edit.jpg',
    event: 'D-Day: Normandy Landings',
    year: 1944,
    location: 'Normandy, France',
    era: 'World War II',
    difficulty: 2,
    clues: [
      { id: 'c1', text: 'This was the largest seaborne invasion in history', xpPenalty: 10 },
      { id: 'c2', text: 'The operation was codenamed "Overlord"', xpPenalty: 10 },
      { id: 'c3', text: 'Five beach landing zones were designated', xpPenalty: 10 },
      { id: 'c4', text: 'General Eisenhower commanded the Allied forces', xpPenalty: 10 },
    ],
    options: {
      events: [
        'D-Day: Normandy Landings',
        'Battle of Britain',
        'Liberation of Paris',
        'VE Day',
      ],
      years: [1944, 1940, 1945, 1943],
      locations: ['Normandy, France', 'Dunkirk, France', 'Berlin, Germany', 'London, England'],
    },
    revealText: 'On June 6, 1944, Allied forces launched the largest amphibious invasion in history on the beaches of Normandy. Over 156,000 troops landed, marking a turning point in WWII.',
    funFact: 'The weather on D-Day was so poor that German commanders believed no invasion was possible!',
  },
  {
    id: 'berlin-wall-1989',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Berlin_Wall_1961-11-20.jpg/800px-Berlin_Wall_1961-11-20.jpg',
    event: 'Fall of the Berlin Wall',
    year: 1989,
    location: 'Berlin, Germany',
    era: 'Cold War',
    difficulty: 1,
    clues: [
      { id: 'c1', text: 'This barrier divided a city for 28 years', xpPenalty: 10 },
      { id: 'c2', text: 'The event symbolized the end of the Cold War', xpPenalty: 10 },
      { id: 'c3', text: 'People used hammers and picks to break through', xpPenalty: 10 },
      { id: 'c4', text: 'Germany was reunified the following year', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Fall of the Berlin Wall',
        'End of Soviet Union',
        'Reunification of Germany',
        'Velvet Revolution',
      ],
      years: [1989, 1991, 1990, 1968],
      locations: ['Berlin, Germany', 'Moscow, Russia', 'Prague, Czechoslovakia', 'Warsaw, Poland'],
    },
    revealText: 'On November 9, 1989, the Berlin Wall fell after 28 years of dividing East and West Berlin. Jubilant crowds gathered to celebrate and tear down the wall piece by piece.',
    funFact: 'The fall of the Berlin Wall was actually announced by mistake during a press conference!',
  },
  {
    id: 'moon-landing-1969',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Aldrin_Apollo_11_original.jpg/800px-Aldrin_Apollo_11_original.jpg',
    event: 'Apollo 11 Moon Landing',
    year: 1969,
    location: 'Sea of Tranquility, Moon',
    era: 'Space Race',
    difficulty: 1,
    clues: [
      { id: 'c1', text: '"That\'s one small step for man, one giant leap for mankind"', xpPenalty: 10 },
      { id: 'c2', text: 'Two astronauts walked on the lunar surface', xpPenalty: 10 },
      { id: 'c3', text: 'The mission was part of the Space Race', xpPenalty: 10 },
      { id: 'c4', text: 'An American flag was planted at this location', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Apollo 11 Moon Landing',
        'Sputnik Launch',
        'First Space Walk',
        'Challenger Disaster',
      ],
      years: [1969, 1957, 1965, 1986],
      locations: ['Sea of Tranquility, Moon', 'Cape Canaveral, USA', 'Star City, USSR', 'Houston, USA'],
    },
    revealText: 'On July 20, 1969, Neil Armstrong and Buzz Aldrin became the first humans to walk on the Moon. About 600 million people watched the historic event live on television.',
    funFact: 'The Apollo 11 computer had less processing power than a modern calculator!',
  },
  {
    id: 'great-fire-london-1666',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Great_Fire_London.jpg/800px-Great_Fire_London.jpg',
    event: 'Great Fire of London',
    year: 1666,
    location: 'London, England',
    era: 'Early Modern',
    difficulty: 3,
    clues: [
      { id: 'c1', text: 'The fire started in a bakery on Pudding Lane', xpPenalty: 10 },
      { id: 'c2', text: 'It destroyed 13,200 houses and 87 churches', xpPenalty: 10 },
      { id: 'c3', text: 'Christopher Wren rebuilt many structures afterward', xpPenalty: 10 },
      { id: 'c4', text: 'Only 6 verified deaths were recorded', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Great Fire of London',
        'Plague of London',
        'Gunpowder Plot',
        'English Civil War',
      ],
      years: [1666, 1665, 1605, 1642],
      locations: ['London, England', 'Edinburgh, Scotland', 'Paris, France', 'Amsterdam, Netherlands'],
    },
    revealText: 'The Great Fire of London burned from September 2-6, 1666. Starting in Thomas Farriner\'s bakery, it destroyed much of the medieval City of London.',
    funFact: 'Despite the massive destruction, only 6 deaths were officially recorded!',
  },
  {
    id: 'pompeii-79ad',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pompeii-street01.jpg/800px-Pompeii-street01.jpg',
    event: 'Eruption of Mount Vesuvius',
    year: 79,
    location: 'Pompeii, Italy',
    era: 'Ancient Rome',
    difficulty: 2,
    clues: [
      { id: 'c1', text: 'A volcanic eruption preserved this Roman city', xpPenalty: 10 },
      { id: 'c2', text: 'Pliny the Younger wrote eyewitness accounts', xpPenalty: 10 },
      { id: 'c3', text: 'The city was rediscovered in 1748', xpPenalty: 10 },
      { id: 'c4', text: 'Ash preserved incredible details of daily Roman life', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Eruption of Mount Vesuvius',
        'Fall of Rome',
        'Inauguration of the Colosseum',
        'Death of Julius Caesar',
      ],
      years: [79, 476, 80, 44],
      locations: ['Pompeii, Italy', 'Rome, Italy', 'Naples, Italy', 'Sicily, Italy'],
    },
    revealText: 'In 79 AD, Mount Vesuvius erupted and buried Pompeii under volcanic ash. The city remained frozen in time until its rediscovery in 1748.',
    funFact: 'Over 1,500 bodies have been found in Pompeii, many preserved in their final moments!',
  },
  {
    id: 'boston-tea-party-1773',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Boston_Tea_Party_Currier_colored.jpg/800px-Boston_Tea_Party_Currier_colored.jpg',
    event: 'Boston Tea Party',
    year: 1773,
    location: 'Boston, Massachusetts',
    era: 'American Revolution',
    difficulty: 2,
    clues: [
      { id: 'c1', text: 'Colonists protested "taxation without representation"', xpPenalty: 10 },
      { id: 'c2', text: '342 chests of tea were dumped into the harbor', xpPenalty: 10 },
      { id: 'c3', text: 'Protesters disguised themselves as Mohawk Indians', xpPenalty: 10 },
      { id: 'c4', text: 'This act of defiance led to the Intolerable Acts', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Boston Tea Party',
        'Signing of Declaration of Independence',
        'Battle of Lexington',
        'Boston Massacre',
      ],
      years: [1773, 1776, 1775, 1770],
      locations: ['Boston, Massachusetts', 'Philadelphia, Pennsylvania', 'New York, New York', 'Williamsburg, Virginia'],
    },
    revealText: 'On December 16, 1773, American colonists dumped 342 chests of British tea into Boston Harbor to protest taxes imposed without colonial representation.',
    funFact: 'The dumped tea would be worth about $1.7 million in today\'s money!',
  },
  {
    id: 'signing-magna-carta-1215',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg/800px-Magna_Carta_%28British_Library_Cotton_MS_Augustus_II.106%29.jpg',
    event: 'Signing of the Magna Carta',
    year: 1215,
    location: 'Runnymede, England',
    era: 'Medieval',
    difficulty: 3,
    clues: [
      { id: 'c1', text: 'King John was forced to agree to this document', xpPenalty: 10 },
      { id: 'c2', text: 'It established that no one is above the law', xpPenalty: 10 },
      { id: 'c3', text: 'English barons demanded limits on royal power', xpPenalty: 10 },
      { id: 'c4', text: 'It influenced the U.S. Constitution centuries later', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Signing of the Magna Carta',
        'Norman Conquest',
        'Black Death arrives in England',
        'Hundred Years War begins',
      ],
      years: [1215, 1066, 1348, 1337],
      locations: ['Runnymede, England', 'London, England', 'Westminster, England', 'Canterbury, England'],
    },
    revealText: 'On June 15, 1215, King John of England sealed the Magna Carta at Runnymede. This charter established fundamental principles of law and liberty.',
    funFact: 'Only 4 original copies of the 1215 Magna Carta still exist today!',
  },
  {
    id: 'hiroshima-1945',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Atomic_bombing_of_Japan.jpg/800px-Atomic_bombing_of_Japan.jpg',
    event: 'Atomic Bombing of Hiroshima',
    year: 1945,
    location: 'Hiroshima, Japan',
    era: 'World War II',
    difficulty: 2,
    clues: [
      { id: 'c1', text: 'The bomb was nicknamed "Little Boy"', xpPenalty: 10 },
      { id: 'c2', text: 'This event marked the first use of nuclear weapons in war', xpPenalty: 10 },
      { id: 'c3', text: 'Japan surrendered days later, ending WWII', xpPenalty: 10 },
      { id: 'c4', text: 'A second bomb was dropped three days later on another city', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Atomic Bombing of Hiroshima',
        'Pearl Harbor Attack',
        'Battle of Midway',
        'VJ Day',
      ],
      years: [1945, 1941, 1942, 1945],
      locations: ['Hiroshima, Japan', 'Pearl Harbor, Hawaii', 'Tokyo, Japan', 'Okinawa, Japan'],
    },
    revealText: 'On August 6, 1945, the United States dropped an atomic bomb on Hiroshima. The explosion killed approximately 80,000 people instantly, leading to Japan\'s surrender.',
    funFact: 'The Hiroshima Peace Memorial (Genbaku Dome) survived the blast and is now a UNESCO World Heritage Site.',
  },
  {
    id: 'titanic-1912',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/RMS_Titanic_3.jpg/800px-RMS_Titanic_3.jpg',
    event: 'Sinking of the Titanic',
    year: 1912,
    location: 'North Atlantic Ocean',
    era: 'Edwardian Era',
    difficulty: 1,
    clues: [
      { id: 'c1', text: 'This "unsinkable" ship struck an iceberg', xpPenalty: 10 },
      { id: 'c2', text: 'Over 1,500 passengers and crew perished', xpPenalty: 10 },
      { id: 'c3', text: 'It was on its maiden voyage from Southampton', xpPenalty: 10 },
      { id: 'c4', text: 'There were not enough lifeboats for everyone aboard', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Sinking of the Titanic',
        'Sinking of the Lusitania',
        'Start of World War I',
        'San Francisco Earthquake',
      ],
      years: [1912, 1915, 1914, 1906],
      locations: ['North Atlantic Ocean', 'Irish Sea', 'English Channel', 'Mediterranean Sea'],
    },
    revealText: 'On April 15, 1912, the RMS Titanic sank after hitting an iceberg during its maiden voyage. Of the 2,224 passengers and crew, more than 1,500 died.',
    funFact: 'The Titanic\'s wreck was not discovered until 1985, 73 years after it sank!',
  },
  {
    id: 'waterloo-1815',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Battle_of_Waterloo_1815.PNG/800px-Battle_of_Waterloo_1815.PNG',
    event: 'Battle of Waterloo',
    year: 1815,
    location: 'Waterloo, Belgium',
    era: 'Napoleonic Wars',
    difficulty: 3,
    clues: [
      { id: 'c1', text: 'This battle ended the rule of a French emperor', xpPenalty: 10 },
      { id: 'c2', text: 'The Duke of Wellington commanded the opposing forces', xpPenalty: 10 },
      { id: 'c3', text: 'Prussian reinforcements arrived at a crucial moment', xpPenalty: 10 },
      { id: 'c4', text: 'The defeated leader was exiled to a remote island', xpPenalty: 10 },
    ],
    options: {
      events: [
        'Battle of Waterloo',
        'Battle of Trafalgar',
        'Battle of Austerlitz',
        'Congress of Vienna',
      ],
      years: [1815, 1805, 1805, 1814],
      locations: ['Waterloo, Belgium', 'Cape Trafalgar, Spain', 'Austerlitz, Czech Republic', 'Vienna, Austria'],
    },
    revealText: 'On June 18, 1815, Napoleon was decisively defeated at Waterloo by the Duke of Wellington and Prussian forces. This ended Napoleon\'s rule and reshaped Europe.',
    funFact: 'The phrase "meeting your Waterloo" comes from this battle, meaning facing a decisive defeat!',
  },
];

// Helper functions
export function getScenesByEra(era: string): HistoricalScene[] {
  return historicalScenes.filter(scene => scene.era === era);
}

export function getScenesByDifficulty(difficulty: 1 | 2 | 3 | 4): HistoricalScene[] {
  return historicalScenes.filter(scene => scene.difficulty === difficulty);
}

export function getRandomScenes(count: number, excludeIds: string[] = []): HistoricalScene[] {
  const available = historicalScenes.filter(scene => !excludeIds.includes(scene.id));
  const shuffled = [...available].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getSceneById(id: string): HistoricalScene | undefined {
  return historicalScenes.find(scene => scene.id === id);
}

export function getAllEras(): string[] {
  return [...new Set(historicalScenes.map(scene => scene.era))];
}

// Scoring system
export const GEOGUESSR_SCORING = {
  BASE_XP: 50,
  TIME_BONUS_FAST: 20, // <30s
  TIME_BONUS_MEDIUM: 10, // <60s
  CLUE_PENALTY: 10,
  WRONG_ANSWER_PENALTY: 15,
  ROUNDS_PER_GAME: 5,
  MAX_XP_PER_GAME: 350,
};

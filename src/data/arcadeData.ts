import { AnachronismScene, ConnectionsPuzzle, MapMystery, ArtifactCase, CauseEffectPair } from '@/types';

// ============================================================
// SPOT THE ANACHRONISM DATA
// ============================================================

export const anachronismScenes: AnachronismScene[] = [
  {
    id: 'ana-1',
    era: 'Medieval Castle',
    year: '1200 CE',
    setting: 'A knight prepares for battle in the great hall',
    details: [
      { id: 'a', text: 'His squire polishes his chainmail armor', isAnachronism: false },
      { id: 'b', text: 'A servant brings a platter of roasted boar', isAnachronism: false },
      { id: 'c', text: 'The lord reads a newspaper by candlelight', isAnachronism: true },
      { id: 'd', text: 'Tapestries depicting past battles line the walls', isAnachronism: false },
    ],
    explanation: 'Newspapers weren\'t invented until the 1600s! The first successful daily newspaper started in 1702.',
  },
  {
    id: 'ana-2',
    era: 'Ancient Rome',
    year: '50 BCE',
    setting: 'A senator walks through the Roman Forum',
    details: [
      { id: 'a', text: 'Citizens debate politics under marble columns', isAnachronism: false },
      { id: 'b', text: 'A merchant sells silk from the Far East', isAnachronism: false },
      { id: 'c', text: 'A scribe writes on parchment scrolls', isAnachronism: false },
      { id: 'd', text: 'A vendor offers fresh tomatoes to passersby', isAnachronism: true },
    ],
    explanation: 'Tomatoes are native to the Americas and weren\'t brought to Europe until after Columbus in 1492!',
  },
  {
    id: 'ana-3',
    era: 'Ancient Egypt',
    year: '1300 BCE',
    setting: 'Workers construct a pyramid under the blazing sun',
    details: [
      { id: 'a', text: 'Overseers mark progress on papyrus rolls', isAnachronism: false },
      { id: 'b', text: 'Workers drink beer to stay refreshed', isAnachronism: false },
      { id: 'c', text: 'Camels carry limestone blocks to the site', isAnachronism: true },
      { id: 'd', text: 'Priests perform rituals for the pharaoh', isAnachronism: false },
    ],
    explanation: 'Camels weren\'t used in Egypt until around 900 BCE! The pyramids were built using oxen, sledges, and human labor.',
  },
  {
    id: 'ana-4',
    era: 'Viking Age',
    year: '900 CE',
    setting: 'Vikings prepare their longship for a voyage',
    details: [
      { id: 'a', text: 'Warriors sharpen their iron swords', isAnachronism: false },
      { id: 'b', text: 'The navigator checks his compass heading', isAnachronism: true },
      { id: 'c', text: 'Shields are mounted along the ship\'s sides', isAnachronism: false },
      { id: 'd', text: 'Traders load furs and amber for trade', isAnachronism: false },
    ],
    explanation: 'Vikings navigated by the sun, stars, and land sightings. The magnetic compass wasn\'t used in Europe until the 12th century!',
  },
  {
    id: 'ana-5',
    era: 'Renaissance Florence',
    year: '1490 CE',
    setting: 'Artists gather in a wealthy patron\'s studio',
    details: [
      { id: 'a', text: 'Leonardo sketches designs for a flying machine', isAnachronism: false },
      { id: 'b', text: 'An apprentice grinds pigments for paint', isAnachronism: false },
      { id: 'c', text: 'The patron poses for a photograph', isAnachronism: true },
      { id: 'd', text: 'Musicians play lutes in the corner', isAnachronism: false },
    ],
    explanation: 'Photography wasn\'t invented until 1839! Renaissance portraits were painted, not photographed.',
  },
  {
    id: 'ana-6',
    era: 'American Revolution',
    year: '1776 CE',
    setting: 'The Continental Congress debates independence',
    details: [
      { id: 'a', text: 'Delegates wear powdered wigs and waistcoats', isAnachronism: false },
      { id: 'b', text: 'Quill pens scratch across parchment', isAnachronism: false },
      { id: 'c', text: 'A secretary types the minutes on a typewriter', isAnachronism: true },
      { id: 'd', text: 'Candles illuminate the meeting hall', isAnachronism: false },
    ],
    explanation: 'The typewriter wasn\'t invented until 1868! All colonial documents were handwritten.',
  },
  {
    id: 'ana-7',
    era: 'Ancient Greece',
    year: '450 BCE',
    setting: 'Philosophers discuss ideas in the Athenian Agora',
    details: [
      { id: 'a', text: 'Socrates questions a young student', isAnachronism: false },
      { id: 'b', text: 'Citizens cast votes using pottery shards', isAnachronism: false },
      { id: 'c', text: 'A merchant accepts payment in paper money', isAnachronism: true },
      { id: 'd', text: 'Olive oil lamps light the evening gatherings', isAnachronism: false },
    ],
    explanation: 'Ancient Greeks used coins, not paper money. Paper currency originated in China around 700 CE.',
  },
  {
    id: 'ana-8',
    era: 'Elizabethan England',
    year: '1595 CE',
    setting: 'Shakespeare\'s company performs at the Globe Theatre',
    details: [
      { id: 'a', text: 'Actors wear elaborate costumes with ruffs', isAnachronism: false },
      { id: 'b', text: 'Groundlings stand in the pit for a penny', isAnachronism: false },
      { id: 'c', text: 'Electric spotlights illuminate the stage', isAnachronism: true },
      { id: 'd', text: 'Trumpets announce the start of the play', isAnachronism: false },
    ],
    explanation: 'Electric lighting wasn\'t invented until the 1870s! The Globe used natural daylight and candles.',
  },
  {
    id: 'ana-9',
    era: 'Napoleonic Wars',
    year: '1805 CE',
    setting: 'Napoleon surveys the battlefield at Austerlitz',
    details: [
      { id: 'a', text: 'Cavalry charges with sabers drawn', isAnachronism: false },
      { id: 'b', text: 'Artillery fires cannonballs at enemy lines', isAnachronism: false },
      { id: 'c', text: 'A general radios orders to distant units', isAnachronism: true },
      { id: 'd', text: 'Drummers beat signals for troop movements', isAnachronism: false },
    ],
    explanation: 'Radio wasn\'t invented until the 1890s! Military communication used flags, drums, and messengers.',
  },
  {
    id: 'ana-10',
    era: 'Colonial America',
    year: '1650 CE',
    setting: 'Pilgrims celebrate the harvest in Plymouth',
    details: [
      { id: 'a', text: 'Families gather for a feast of venison and corn', isAnachronism: false },
      { id: 'b', text: 'Children watch fireworks light up the sky', isAnachronism: true },
      { id: 'c', text: 'Prayers of thanksgiving are offered', isAnachronism: false },
      { id: 'd', text: 'Native Americans share in the celebration', isAnachronism: false },
    ],
    explanation: 'Fireworks displays weren\'t common in colonial America. The first major American fireworks celebration was July 4, 1777.',
  },
];

// ============================================================
// HISTORICAL CONNECTIONS DATA
// ============================================================

export const connectionsPuzzles: ConnectionsPuzzle[] = [
  {
    id: 'conn-1',
    categories: [
      { name: 'ROMAN EMPERORS', items: ['Augustus', 'Nero', 'Caligula', 'Trajan'], difficulty: 1, color: 'yellow' },
      { name: 'WWII BATTLES', items: ['Stalingrad', 'Normandy', 'Midway', 'Bulge'], difficulty: 2, color: 'green' },
      { name: 'RENAISSANCE ARTISTS', items: ['Michelangelo', 'Raphael', 'Donatello', 'Leonardo'], difficulty: 3, color: 'blue' },
      { name: 'ANCIENT WONDERS', items: ['Pyramids', 'Colossus', 'Lighthouse', 'Gardens'], difficulty: 4, color: 'purple' },
    ],
  },
  {
    id: 'conn-2',
    categories: [
      { name: 'GREEK PHILOSOPHERS', items: ['Socrates', 'Plato', 'Aristotle', 'Diogenes'], difficulty: 1, color: 'yellow' },
      { name: 'FRENCH KINGS', items: ['Louis XIV', 'Louis XVI', 'Charlemagne', 'Napoleon'], difficulty: 2, color: 'green' },
      { name: 'CIVIL WAR GENERALS', items: ['Grant', 'Lee', 'Sherman', 'Jackson'], difficulty: 3, color: 'blue' },
      { name: 'ANCIENT CAPITALS', items: ['Rome', 'Athens', 'Babylon', 'Memphis'], difficulty: 4, color: 'purple' },
    ],
  },
  {
    id: 'conn-3',
    categories: [
      { name: 'DECLARATION SIGNERS', items: ['Jefferson', 'Franklin', 'Adams', 'Hancock'], difficulty: 1, color: 'yellow' },
      { name: 'VIKING GODS', items: ['Odin', 'Thor', 'Freya', 'Loki'], difficulty: 2, color: 'green' },
      { name: 'SILK ROAD GOODS', items: ['Silk', 'Spices', 'Jade', 'Porcelain'], difficulty: 3, color: 'blue' },
      { name: 'COLD WAR EVENTS', items: ['Sputnik', 'Berlin', 'Cuba', 'Apollo'], difficulty: 4, color: 'purple' },
    ],
  },
  {
    id: 'conn-4',
    categories: [
      { name: 'EGYPTIAN PHARAOHS', items: ['Tutankhamun', 'Ramesses', 'Cleopatra', 'Hatshepsut'], difficulty: 1, color: 'yellow' },
      { name: 'REVOLUTIONARY DOCUMENTS', items: ['Magna Carta', 'Constitution', 'Declaration', 'Rights of Man'], difficulty: 2, color: 'green' },
      { name: 'MEDIEVAL WEAPONS', items: ['Longbow', 'Trebuchet', 'Crossbow', 'Mace'], difficulty: 3, color: 'blue' },
      { name: 'ANCIENT SCRIPTS', items: ['Hieroglyphics', 'Cuneiform', 'Sanskrit', 'Runic'], difficulty: 4, color: 'purple' },
    ],
  },
  {
    id: 'conn-5',
    categories: [
      { name: 'EXPLORERS', items: ['Columbus', 'Magellan', 'Drake', 'Cook'], difficulty: 1, color: 'yellow' },
      { name: 'CHINESE DYNASTIES', items: ['Han', 'Tang', 'Ming', 'Qing'], difficulty: 2, color: 'green' },
      { name: 'WWI POWERS', items: ['Britain', 'France', 'Russia', 'Serbia'], difficulty: 3, color: 'blue' },
      { name: 'PLAGUE YEARS', items: ['1348', '1665', '1720', '1918'], difficulty: 4, color: 'purple' },
    ],
  },
];

// ============================================================
// MAP MYSTERIES DATA
// ============================================================

export const mapMysteries: MapMystery[] = [
  {
    id: 'map-1',
    empireName: 'Roman Empire',
    svgPath: 'M100,50 L200,50 L250,100 L200,150 L100,150 L50,100 Z',
    options: ['Roman Empire', 'Byzantine Empire', 'Ottoman Empire', 'Holy Roman Empire'],
    correctIndex: 0,
    peakYear: '117 CE',
    funFact: 'At its peak under Trajan, Rome controlled the entire Mediterranean, calling it "Mare Nostrum" (Our Sea).',
    modernRegion: 'Mediterranean Basin, Western Europe, North Africa',
  },
  {
    id: 'map-2',
    empireName: 'Mongol Empire',
    svgPath: 'M50,50 L300,50 L350,150 L50,150 Z',
    options: ['Mongol Empire', 'Chinese Empire', 'Persian Empire', 'Russian Empire'],
    correctIndex: 0,
    peakYear: '1279 CE',
    funFact: 'The Mongol Empire was the largest contiguous land empire in history, spanning from Korea to Hungary.',
    modernRegion: 'Central Asia, China, Russia, Middle East',
  },
  {
    id: 'map-3',
    empireName: 'British Empire',
    svgPath: 'M50,50 L150,50 L150,100 L200,100 L200,150 L50,150 Z',
    options: ['British Empire', 'French Empire', 'Spanish Empire', 'Portuguese Empire'],
    correctIndex: 0,
    peakYear: '1920 CE',
    funFact: 'At its height, the British Empire covered 25% of Earth\'s land and was called "the empire on which the sun never sets."',
    modernRegion: 'Global - parts of every continent',
  },
  {
    id: 'map-4',
    empireName: 'Ancient Egypt',
    svgPath: 'M100,50 L150,50 L150,200 L100,200 Z',
    options: ['Ancient Egypt', 'Nubian Kingdom', 'Carthage', 'Assyrian Empire'],
    correctIndex: 0,
    peakYear: '1450 BCE',
    funFact: 'Egypt\'s New Kingdom expanded from the Nile Delta to modern-day Sudan and Syria.',
    modernRegion: 'Egypt and Sudan along the Nile River',
  },
  {
    id: 'map-5',
    empireName: 'Persian Empire',
    svgPath: 'M50,75 L250,75 L250,175 L50,175 Z',
    options: ['Persian Empire', 'Babylonian Empire', 'Assyrian Empire', 'Parthian Empire'],
    correctIndex: 0,
    peakYear: '500 BCE',
    funFact: 'The Achaemenid Persian Empire was the first true "world empire," connecting three continents.',
    modernRegion: 'Iran, Iraq, Turkey, Egypt, Central Asia',
  },
  {
    id: 'map-6',
    empireName: 'Ottoman Empire',
    svgPath: 'M75,50 L200,50 L225,100 L200,150 L75,150 L50,100 Z',
    options: ['Ottoman Empire', 'Byzantine Empire', 'Seljuk Empire', 'Mamluk Sultanate'],
    correctIndex: 0,
    peakYear: '1683 CE',
    funFact: 'The Ottoman Empire lasted over 600 years and controlled the crossroads of three continents.',
    modernRegion: 'Turkey, Middle East, North Africa, Balkans',
  },
  {
    id: 'map-7',
    empireName: 'Spanish Empire',
    svgPath: 'M50,100 L150,50 L250,100 L150,150 Z',
    options: ['Spanish Empire', 'Portuguese Empire', 'Dutch Empire', 'French Empire'],
    correctIndex: 0,
    peakYear: '1580 CE',
    funFact: 'The Spanish Empire was one of the first global empires, spanning the Americas, Philippines, and parts of Europe.',
    modernRegion: 'Spain, Latin America, Philippines',
  },
  {
    id: 'map-8',
    empireName: 'Aztec Empire',
    svgPath: 'M100,75 L175,75 L175,150 L100,150 Z',
    options: ['Aztec Empire', 'Mayan Civilization', 'Incan Empire', 'Olmec Civilization'],
    correctIndex: 0,
    peakYear: '1519 CE',
    funFact: 'Tenochtitlan, the Aztec capital, was built on an island and had a population larger than most European cities.',
    modernRegion: 'Central Mexico',
  },
  {
    id: 'map-9',
    empireName: 'Han Dynasty',
    svgPath: 'M75,50 L225,50 L225,175 L75,175 Z',
    options: ['Han Dynasty', 'Tang Dynasty', 'Ming Dynasty', 'Qin Dynasty'],
    correctIndex: 0,
    peakYear: '100 CE',
    funFact: 'The Han Dynasty established the Silk Road and created a civil service system that lasted 2,000 years.',
    modernRegion: 'China, Korea, Vietnam',
  },
  {
    id: 'map-10',
    empireName: 'Greek City-States',
    svgPath: 'M100,75 L175,75 L175,150 L100,150 Z',
    options: ['Greek City-States', 'Macedonian Empire', 'Roman Republic', 'Phoenician Colonies'],
    correctIndex: 0,
    peakYear: '450 BCE',
    funFact: 'Despite their small size, the Greek city-states invented democracy, philosophy, and the Olympic Games.',
    modernRegion: 'Greece, Western Turkey, Southern Italy',
  },
];

// ============================================================
// ARTIFACT DETECTIVE DATA
// ============================================================

export const artifactCases: ArtifactCase[] = [
  {
    id: 'art-1',
    name: 'Rosetta Stone',
    clues: [
      'This object was discovered in 1799 by French soldiers',
      'It contains the same text in three different scripts',
      'It helped scholars decode ancient Egyptian hieroglyphics',
      'It now resides in the British Museum',
    ],
    options: ['Dead Sea Scrolls', 'Rosetta Stone', 'Code of Hammurabi', 'Terracotta Warriors'],
    correctIndex: 1,
    revealText: 'The Rosetta Stone unlocked the secrets of ancient Egypt, allowing us to read hieroglyphics for the first time in 1,400 years.',
  },
  {
    id: 'art-2',
    name: 'Tutankhamun\'s Death Mask',
    clues: [
      'This artifact was discovered in 1922 in the Valley of the Kings',
      'It weighs over 24 pounds and is made of solid gold',
      'It belonged to a teenage pharaoh who died mysteriously',
      'Howard Carter found it after years of searching',
    ],
    options: ['Nefertiti Bust', 'Tutankhamun\'s Death Mask', 'Canopic Jars', 'Book of the Dead'],
    correctIndex: 1,
    revealText: 'King Tut\'s golden death mask is one of the most recognized artifacts in the world, symbolizing the wealth and artistry of ancient Egypt.',
  },
  {
    id: 'art-3',
    name: 'Magna Carta',
    clues: [
      'This document was created in 1215 in England',
      'It limited the power of a king for the first time',
      'Rebellious barons forced the monarch to sign it',
      'It influenced the U.S. Constitution and Bill of Rights',
    ],
    options: ['Declaration of Independence', 'Magna Carta', 'Domesday Book', 'Ten Commandments'],
    correctIndex: 1,
    revealText: 'The Magna Carta established that no one, not even the king, is above the law. It\'s a foundation of modern democracy.',
  },
  {
    id: 'art-4',
    name: 'Gutenberg Bible',
    clues: [
      'This object revolutionized the spread of knowledge in the 1450s',
      'It was created using a newly invented technology',
      'Fewer than 50 complete copies survive today',
      'It made books accessible to more people than ever before',
    ],
    options: ['Dead Sea Scrolls', 'Book of Kells', 'Gutenberg Bible', 'Codex Sinaiticus'],
    correctIndex: 2,
    revealText: 'The Gutenberg Bible was the first major book printed with movable type, sparking a revolution in communication.',
  },
  {
    id: 'art-5',
    name: 'Terracotta Army',
    clues: [
      'These objects were discovered by farmers digging a well in 1974',
      'There are approximately 8,000 of them',
      'Each one has a unique face and was meant to guard an emperor',
      'They were buried in Xi\'an, China over 2,000 years ago',
    ],
    options: ['Terracotta Army', 'Ming Vases', 'Jade Burial Suits', 'Bronze Age Weapons'],
    correctIndex: 0,
    revealText: 'The Terracotta Army was built to protect Emperor Qin Shi Huang in the afterlife. Each soldier is unique—no two are alike.',
  },
  {
    id: 'art-6',
    name: 'Dead Sea Scrolls',
    clues: [
      'These artifacts were found in caves near the Dead Sea in 1947',
      'They are some of the oldest known biblical manuscripts',
      'A young Bedouin shepherd discovered them by accident',
      'They were preserved by the dry desert climate for 2,000 years',
    ],
    options: ['Rosetta Stone', 'Nag Hammadi Library', 'Dead Sea Scrolls', 'Codex Vaticanus'],
    correctIndex: 2,
    revealText: 'The Dead Sea Scrolls contain the oldest known copies of the Hebrew Bible and shed light on ancient Jewish life.',
  },
  {
    id: 'art-7',
    name: 'Mona Lisa',
    clues: [
      'This artwork was created in the early 1500s',
      'It was stolen from a museum in 1911 and missing for two years',
      'The subject\'s mysterious smile has fascinated viewers for centuries',
      'It now hangs behind bulletproof glass in Paris',
    ],
    options: ['The Last Supper', 'Mona Lisa', 'Girl with a Pearl Earring', 'Starry Night'],
    correctIndex: 1,
    revealText: 'Leonardo da Vinci\'s Mona Lisa is the most visited painting in the world, drawing millions to the Louvre each year.',
  },
  {
    id: 'art-8',
    name: 'Hope Diamond',
    clues: [
      'This gemstone is said to carry a curse',
      'It originated in India and was once owned by French royalty',
      'It glows red under ultraviolet light due to its unique properties',
      'It currently resides in the Smithsonian Institution',
    ],
    options: ['Koh-i-Noor', 'Hope Diamond', 'Star of India', 'Cullinan Diamond'],
    correctIndex: 1,
    revealText: 'The Hope Diamond is a 45-carat blue diamond with a legendary "curse" that supposedly brought misfortune to its owners.',
  },
  {
    id: 'art-9',
    name: 'Code of Hammurabi',
    clues: [
      'This artifact dates to around 1750 BCE',
      'It contains 282 laws carved in stone',
      'It established the principle of "an eye for an eye"',
      'It was created by a Babylonian king',
    ],
    options: ['Ten Commandments', 'Code of Hammurabi', 'Rosetta Stone', 'Book of the Dead'],
    correctIndex: 1,
    revealText: 'Hammurabi\'s Code is one of the oldest deciphered writings of significant length, establishing early concepts of justice.',
  },
  {
    id: 'art-10',
    name: 'Declaration of Independence',
    clues: [
      'This document was signed in 1776',
      'John Hancock\'s signature is the largest on it',
      'It declared that "all men are created equal"',
      'Thomas Jefferson was its primary author',
    ],
    options: ['Constitution', 'Declaration of Independence', 'Bill of Rights', 'Articles of Confederation'],
    correctIndex: 1,
    revealText: 'The Declaration of Independence announced the birth of a new nation and articulated ideals that influenced revolutions worldwide.',
  },
];

// ============================================================
// CAUSE & EFFECT DATA
// ============================================================

export const causeEffectPairs: CauseEffectPair[] = [
  {
    id: 'ce-1',
    type: 'cause-to-effect',
    prompt: 'Archduke Franz Ferdinand was assassinated in Sarajevo in 1914',
    correctAnswer: 'World War I erupted',
    wrongAnswers: ['The French Revolution began', 'The Ottoman Empire collapsed', 'The Cold War started'],
    explanation: 'The assassination triggered a chain of alliance activations that led to the outbreak of World War I within weeks.',
    era: 'World War I',
  },
  {
    id: 'ce-2',
    type: 'effect-to-cause',
    prompt: 'The Roman Empire split into Eastern and Western halves in 285 CE',
    correctAnswer: 'The empire became too large to govern effectively',
    wrongAnswers: ['Constantine converted to Christianity', 'The Huns invaded Italy', 'A volcanic eruption caused crop failures'],
    explanation: 'Emperor Diocletian divided the empire because it had grown too vast for one person to rule effectively.',
    era: 'Ancient Rome',
  },
  {
    id: 'ce-3',
    type: 'cause-to-effect',
    prompt: 'Johannes Gutenberg invented the printing press around 1440',
    correctAnswer: 'Literacy rates increased and ideas spread rapidly',
    wrongAnswers: ['The Renaissance ended', 'Handwriting became obsolete overnight', 'Churches banned all books'],
    explanation: 'The printing press made books affordable and sparked a revolution in communication, education, and religion.',
    era: 'Renaissance',
  },
  {
    id: 'ce-4',
    type: 'effect-to-cause',
    prompt: 'The Black Death killed about one-third of Europe\'s population in the 1340s',
    correctAnswer: 'Infected fleas on rats spread the bubonic plague from Asia',
    wrongAnswers: ['A comet poisoned the water supply', 'Witch trials spread disease', 'A volcanic winter caused famine'],
    explanation: 'The plague traveled along trade routes from Central Asia, carried by fleas on rats aboard merchant ships.',
    era: 'Medieval Europe',
  },
  {
    id: 'ce-5',
    type: 'cause-to-effect',
    prompt: 'The Boston Tea Party occurred in December 1773',
    correctAnswer: 'Britain passed the Intolerable Acts to punish Massachusetts',
    wrongAnswers: ['America immediately declared independence', 'Britain lowered tea taxes', 'George Washington became president'],
    explanation: 'Britain\'s harsh response to the Tea Party further united the colonies and pushed them toward revolution.',
    era: 'American Revolution',
  },
  {
    id: 'ce-6',
    type: 'effect-to-cause',
    prompt: 'The Bastille prison was stormed on July 14, 1789',
    correctAnswer: 'Parisians feared the King would use the military against them',
    wrongAnswers: ['The queen ordered an attack on Paris', 'A fire broke out in the city', 'Napoleon led the assault'],
    explanation: 'Rumors that the King was sending troops to Paris sparked panic. The people stormed the Bastille for weapons.',
    era: 'French Revolution',
  },
  {
    id: 'ce-7',
    type: 'cause-to-effect',
    prompt: 'Columbus reached the Americas in 1492',
    correctAnswer: 'The Columbian Exchange began, transforming both hemispheres',
    wrongAnswers: ['Spain immediately became a democracy', 'Native Americans welcomed European rule', 'Trade with Asia stopped'],
    explanation: 'The encounter led to massive exchanges of plants, animals, cultures, and diseases between Old and New Worlds.',
    era: 'Age of Exploration',
  },
  {
    id: 'ce-8',
    type: 'effect-to-cause',
    prompt: 'Napoleon was exiled to the island of Elba in 1814',
    correctAnswer: 'Allied forces defeated him and captured Paris',
    wrongAnswers: ['He voluntarily retired from politics', 'The French people voted him out', 'A hurricane destroyed his army'],
    explanation: 'After military defeats and the loss of Paris, Napoleon was forced to abdicate and accept exile.',
    era: 'Napoleonic Era',
  },
  {
    id: 'ce-9',
    type: 'cause-to-effect',
    prompt: 'The Treaty of Versailles imposed harsh penalties on Germany in 1919',
    correctAnswer: 'German resentment contributed to the rise of Nazism',
    wrongAnswers: ['Germany immediately became prosperous', 'World peace was achieved', 'Britain and France became allies of Germany'],
    explanation: 'The treaty\'s harsh terms created economic hardship and national humiliation that Hitler exploited.',
    era: 'World War I',
  },
  {
    id: 'ce-10',
    type: 'effect-to-cause',
    prompt: 'The Berlin Wall fell on November 9, 1989',
    correctAnswer: 'An East German official mistakenly announced open borders',
    wrongAnswers: ['The USSR declared war on East Germany', 'A earthquake destroyed the wall', 'Western forces invaded'],
    explanation: 'A confused press conference led to thousands rushing the checkpoints, and overwhelmed guards let them through.',
    era: 'Cold War',
  },
  {
    id: 'ce-11',
    type: 'cause-to-effect',
    prompt: 'Japan attacked Pearl Harbor on December 7, 1941',
    correctAnswer: 'The United States declared war and entered WWII',
    wrongAnswers: ['The US remained neutral', 'Japan surrendered immediately', 'Germany broke its alliance with Japan'],
    explanation: 'The surprise attack united American public opinion and brought the industrial might of the US into the war.',
    era: 'World War II',
  },
  {
    id: 'ce-12',
    type: 'effect-to-cause',
    prompt: 'The Great Fire of London destroyed most of the city in 1666',
    correctAnswer: 'A bakery fire spread through the wooden buildings',
    wrongAnswers: ['The Dutch navy bombarded London', 'Lightning struck the Tower of London', 'Rebels set fire to Parliament'],
    explanation: 'The fire started in a bakery on Pudding Lane and spread rapidly through the densely packed wooden structures.',
    era: 'Early Modern',
  },
  {
    id: 'ce-13',
    type: 'cause-to-effect',
    prompt: 'The Soviet Union launched Sputnik in 1957',
    correctAnswer: 'The Space Race accelerated as the US feared falling behind',
    wrongAnswers: ['The Cold War immediately ended', 'NASA was dissolved', 'The USSR landed on the Moon'],
    explanation: 'Sputnik shocked Americans and led to massive investment in science education and the Apollo program.',
    era: 'Cold War',
  },
  {
    id: 'ce-14',
    type: 'effect-to-cause',
    prompt: 'The Emancipation Proclamation freed slaves in Confederate states in 1863',
    correctAnswer: 'Lincoln wanted to weaken the Confederacy and reframe the war',
    wrongAnswers: ['The Confederacy voluntarily freed slaves', 'Britain demanded it', 'Slaves staged a nationwide revolt'],
    explanation: 'Lincoln used his war powers to strike at slavery, transforming the Civil War into a fight for freedom.',
    era: 'American Civil War',
  },
  {
    id: 'ce-15',
    type: 'cause-to-effect',
    prompt: 'Alexander the Great died suddenly in 323 BCE without naming an heir',
    correctAnswer: 'His empire was divided among his generals',
    wrongAnswers: ['The Persian Empire was restored', 'Greece became a democracy again', 'Rome immediately conquered all his territory'],
    explanation: 'The Wars of the Diadochi saw Alexander\'s generals carve up his empire into rival kingdoms.',
    era: 'Ancient Greece',
  },
];

// Helper functions for random selection
export function getRandomAnachronismScenes(count: number = 5): AnachronismScene[] {
  const shuffled = [...anachronismScenes].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomConnectionsPuzzle(): ConnectionsPuzzle {
  return connectionsPuzzles[Math.floor(Math.random() * connectionsPuzzles.length)];
}

export function getRandomMapMysteries(count: number = 5): MapMystery[] {
  const shuffled = [...mapMysteries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomArtifactCases(count: number = 5): ArtifactCase[] {
  const shuffled = [...artifactCases].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getRandomCauseEffectPairs(count: number = 6): CauseEffectPair[] {
  const shuffled = [...causeEffectPairs].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

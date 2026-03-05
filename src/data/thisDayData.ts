// This Day in History - Historical events indexed by date

export interface HistoricalEvent {
  id: string;
  month: number;
  day: number;
  year: string;
  yearSort: number; // Numeric for sorting (-753 for BCE)
  title: string;
  description: string;
  category: 'warfare' | 'politics' | 'science' | 'culture' | 'exploration' | 'revolution';
  relatedArcId?: string;
  relatedChapterId?: string;
}

// Events indexed by "MM-DD" for O(1) lookup
export const thisDayEvents: Record<string, HistoricalEvent[]> = {
  // January
  "01-01": [
    {
      id: "jan1-45bce",
      month: 1, day: 1,
      year: "45 BCE",
      yearSort: -45,
      title: "Julian Calendar Takes Effect",
      description: "Julius Caesar's reformed calendar begins, replacing the Roman calendar and establishing the 365-day year.",
      category: "politics",
      relatedArcId: "ancient-rome",
    },
    {
      id: "jan1-1863",
      month: 1, day: 1,
      year: "1863",
      yearSort: 1863,
      title: "Emancipation Proclamation",
      description: "President Lincoln's executive order frees all enslaved people in Confederate states, changing the Civil War's purpose.",
      category: "politics",
      relatedArcId: "american-civil-war",
    },
  ],
  "01-10": [
    {
      id: "jan10-49bce",
      month: 1, day: 10,
      year: "49 BCE",
      yearSort: -49,
      title: "Caesar Crosses the Rubicon",
      description: "Julius Caesar leads his army across the Rubicon River, sparking civil war with the famous words 'the die is cast.'",
      category: "warfare",
      relatedArcId: "ancient-rome",
    },
  ],
  "01-15": [
    {
      id: "jan15-1559",
      month: 1, day: 15,
      year: "1559",
      yearSort: 1559,
      title: "Elizabeth I Crowned",
      description: "Elizabeth I is crowned Queen of England at Westminster Abbey, beginning a 45-year reign known as the Elizabethan Era.",
      category: "politics",
      relatedArcId: "renaissance",
    },
  ],
  "01-21": [
    {
      id: "jan21-1793",
      month: 1, day: 21,
      year: "1793",
      yearSort: 1793,
      title: "Execution of Louis XVI",
      description: "King Louis XVI of France is executed by guillotine in Paris, marking a turning point in the French Revolution.",
      category: "revolution",
      relatedArcId: "french-revolution",
      relatedChapterId: "fr-c3",
    },
  ],
  "01-27": [
    {
      id: "jan27-1945",
      month: 1, day: 27,
      year: "1945",
      yearSort: 1945,
      title: "Auschwitz Liberation",
      description: "Soviet troops liberate the Auschwitz concentration camp, revealing the full horror of the Holocaust to the world.",
      category: "warfare",
      relatedArcId: "world-war-2",
    },
  ],

  // February
  "02-03": [
    {
      id: "feb3-1870",
      month: 2, day: 3,
      year: "1870",
      yearSort: 1870,
      title: "15th Amendment Ratified",
      description: "The 15th Amendment is ratified, prohibiting denial of voting rights based on race, color, or previous servitude.",
      category: "politics",
      relatedArcId: "american-civil-war",
    },
  ],
  "02-11": [
    {
      id: "feb11-1990",
      month: 2, day: 11,
      year: "1990",
      yearSort: 1990,
      title: "Nelson Mandela Released",
      description: "After 27 years in prison, Nelson Mandela walks free, paving the way for the end of apartheid in South Africa.",
      category: "politics",
      relatedArcId: "cold-war",
    },
  ],
  "02-15": [
    {
      id: "feb15-1564",
      month: 2, day: 15,
      year: "1564",
      yearSort: 1564,
      title: "Galileo Galilei Born",
      description: "The 'father of modern science' is born in Pisa, Italy. His observations would revolutionize our understanding of the cosmos.",
      category: "science",
      relatedArcId: "renaissance",
    },
  ],
  "02-22": [
    {
      id: "feb22-1732",
      month: 2, day: 22,
      year: "1732",
      yearSort: 1732,
      title: "George Washington Born",
      description: "The future first President of the United States is born in Virginia, destined to lead the American Revolution.",
      category: "politics",
      relatedArcId: "american-revolution",
    },
  ],

  // March
  "03-04": [
    {
      id: "mar4-1789",
      month: 3, day: 4,
      year: "1789",
      yearSort: 1789,
      title: "U.S. Constitution Takes Effect",
      description: "The United States Constitution officially goes into effect as the new government convenes for the first time.",
      category: "politics",
      relatedArcId: "american-revolution",
    },
  ],
  "03-15": [
    {
      id: "mar15-44bce",
      month: 3, day: 15,
      year: "44 BCE",
      yearSort: -44,
      title: "Assassination of Julius Caesar",
      description: "Julius Caesar is assassinated by Roman senators on the Ides of March, forever changing the Roman Republic.",
      category: "politics",
      relatedArcId: "ancient-rome",
    },
  ],
  "03-21": [
    {
      id: "mar21-1804",
      month: 3, day: 21,
      year: "1804",
      yearSort: 1804,
      title: "Napoleonic Code Adopted",
      description: "Napoleon's civil code becomes law in France, influencing legal systems worldwide with its clear, accessible laws.",
      category: "politics",
      relatedArcId: "french-revolution",
    },
  ],

  // April
  "04-09": [
    {
      id: "apr9-1865",
      month: 4, day: 9,
      year: "1865",
      yearSort: 1865,
      title: "Lee Surrenders at Appomattox",
      description: "General Robert E. Lee surrenders to Ulysses S. Grant, effectively ending the American Civil War.",
      category: "warfare",
      relatedArcId: "american-civil-war",
    },
  ],
  "04-12": [
    {
      id: "apr12-1861",
      month: 4, day: 12,
      year: "1861",
      yearSort: 1861,
      title: "Attack on Fort Sumter",
      description: "Confederate forces fire on Fort Sumter in South Carolina, beginning the American Civil War.",
      category: "warfare",
      relatedArcId: "american-civil-war",
    },
    {
      id: "apr12-1961",
      month: 4, day: 12,
      year: "1961",
      yearSort: 1961,
      title: "Yuri Gagarin in Space",
      description: "Soviet cosmonaut Yuri Gagarin becomes the first human in space, orbiting Earth aboard Vostok 1.",
      category: "science",
      relatedArcId: "cold-war",
    },
  ],
  "04-15": [
    {
      id: "apr15-1452",
      month: 4, day: 15,
      year: "1452",
      yearSort: 1452,
      title: "Leonardo da Vinci Born",
      description: "The ultimate Renaissance man is born in Vinci, Italy. Artist, inventor, scientist—his genius knew no bounds.",
      category: "culture",
      relatedArcId: "renaissance",
    },
    {
      id: "apr15-1912",
      month: 4, day: 15,
      year: "1912",
      yearSort: 1912,
      title: "Titanic Sinks",
      description: "RMS Titanic sinks after hitting an iceberg, claiming over 1,500 lives in one of history's deadliest maritime disasters.",
      category: "exploration",
    },
  ],
  "04-19": [
    {
      id: "apr19-1775",
      month: 4, day: 19,
      year: "1775",
      yearSort: 1775,
      title: "Battles of Lexington and Concord",
      description: "The 'shot heard round the world' is fired as American colonists clash with British troops, starting the Revolutionary War.",
      category: "warfare",
      relatedArcId: "american-revolution",
    },
  ],

  // May
  "05-05": [
    {
      id: "may5-1821",
      month: 5, day: 5,
      year: "1821",
      yearSort: 1821,
      title: "Napoleon Dies on St. Helena",
      description: "Napoleon Bonaparte dies in exile on the island of St. Helena, ending the era of Napoleonic Europe.",
      category: "politics",
      relatedArcId: "french-revolution",
    },
  ],
  "05-08": [
    {
      id: "may8-1945",
      month: 5, day: 8,
      year: "1945",
      yearSort: 1945,
      title: "V-E Day",
      description: "Victory in Europe Day marks Nazi Germany's unconditional surrender, ending World War II in Europe.",
      category: "warfare",
      relatedArcId: "world-war-2",
      relatedChapterId: "ww2-c3",
    },
  ],
  "05-14": [
    {
      id: "may14-1796",
      month: 5, day: 14,
      year: "1796",
      yearSort: 1796,
      title: "First Smallpox Vaccine",
      description: "Edward Jenner administers the first smallpox vaccination, laying the foundation for modern immunology.",
      category: "science",
      relatedArcId: "industrial-revolution",
    },
  ],
  "05-29": [
    {
      id: "may29-1453",
      month: 5, day: 29,
      year: "1453",
      yearSort: 1453,
      title: "Fall of Constantinople",
      description: "Ottoman forces capture Constantinople, ending the Byzantine Empire and marking the end of the Middle Ages.",
      category: "warfare",
      relatedArcId: "medieval-europe",
    },
  ],

  // June
  "06-06": [
    {
      id: "jun6-1944",
      month: 6, day: 6,
      year: "1944",
      yearSort: 1944,
      title: "D-Day Invasion",
      description: "Allied forces storm the beaches of Normandy in the largest amphibious invasion in history, beginning the liberation of Europe.",
      category: "warfare",
      relatedArcId: "world-war-2",
      relatedChapterId: "ww2-c3",
    },
  ],
  "06-15": [
    {
      id: "jun15-1215",
      month: 6, day: 15,
      year: "1215",
      yearSort: 1215,
      title: "Magna Carta Sealed",
      description: "King John seals the Magna Carta at Runnymede, establishing that even kings must follow the law.",
      category: "politics",
      relatedArcId: "medieval-europe",
    },
  ],
  "06-18": [
    {
      id: "jun18-1815",
      month: 6, day: 18,
      year: "1815",
      yearSort: 1815,
      title: "Battle of Waterloo",
      description: "Napoleon meets his final defeat at Waterloo, ending 23 years of French Revolutionary and Napoleonic Wars.",
      category: "warfare",
      relatedArcId: "french-revolution",
    },
  ],
  "06-28": [
    {
      id: "jun28-1914",
      month: 6, day: 28,
      year: "1914",
      yearSort: 1914,
      title: "Assassination of Archduke Franz Ferdinand",
      description: "The heir to the Austro-Hungarian throne is assassinated in Sarajevo, triggering World War I.",
      category: "politics",
      relatedArcId: "world-war-1",
    },
  ],

  // July
  "07-04": [
    {
      id: "jul4-1776",
      month: 7, day: 4,
      year: "1776",
      yearSort: 1776,
      title: "Declaration of Independence",
      description: "The Continental Congress adopts the Declaration of Independence, proclaiming American sovereignty.",
      category: "revolution",
      relatedArcId: "american-revolution",
    },
  ],
  "07-14": [
    {
      id: "jul14-1789",
      month: 7, day: 14,
      year: "1789",
      yearSort: 1789,
      title: "Storming of the Bastille",
      description: "Parisian revolutionaries storm the Bastille fortress, igniting the French Revolution and changing Europe forever.",
      category: "revolution",
      relatedArcId: "french-revolution",
      relatedChapterId: "fr-c2",
    },
  ],
  "07-20": [
    {
      id: "jul20-1969",
      month: 7, day: 20,
      year: "1969",
      yearSort: 1969,
      title: "Moon Landing",
      description: "Apollo 11 astronauts Neil Armstrong and Buzz Aldrin become the first humans to walk on the Moon.",
      category: "science",
      relatedArcId: "cold-war",
    },
  ],
  "07-28": [
    {
      id: "jul28-1914",
      month: 7, day: 28,
      year: "1914",
      yearSort: 1914,
      title: "World War I Begins",
      description: "Austria-Hungary declares war on Serbia, setting off a chain of alliances that plunges Europe into the Great War.",
      category: "warfare",
      relatedArcId: "world-war-1",
    },
  ],

  // August
  "08-06": [
    {
      id: "aug6-1945",
      month: 8, day: 6,
      year: "1945",
      yearSort: 1945,
      title: "Atomic Bomb Dropped on Hiroshima",
      description: "The United States drops the first atomic bomb used in warfare on Hiroshima, Japan, ushering in the nuclear age.",
      category: "warfare",
      relatedArcId: "world-war-2",
    },
  ],
  "08-15": [
    {
      id: "aug15-1945",
      month: 8, day: 15,
      year: "1945",
      yearSort: 1945,
      title: "V-J Day",
      description: "Japan announces its surrender, ending World War II and bringing peace after six years of global conflict.",
      category: "warfare",
      relatedArcId: "world-war-2",
    },
  ],
  "08-24": [
    {
      id: "aug24-79",
      month: 8, day: 24,
      year: "79 CE",
      yearSort: 79,
      title: "Eruption of Vesuvius",
      description: "Mount Vesuvius erupts violently, burying Pompeii and Herculaneum and preserving a snapshot of Roman life.",
      category: "science",
      relatedArcId: "ancient-rome",
    },
  ],
  "08-28": [
    {
      id: "aug28-1963",
      month: 8, day: 28,
      year: "1963",
      yearSort: 1963,
      title: "I Have a Dream Speech",
      description: "Martin Luther King Jr. delivers his iconic speech at the March on Washington, galvanizing the civil rights movement.",
      category: "politics",
      relatedArcId: "cold-war",
    },
  ],

  // September
  "09-01": [
    {
      id: "sep1-1939",
      month: 9, day: 1,
      year: "1939",
      yearSort: 1939,
      title: "Germany Invades Poland",
      description: "Nazi Germany invades Poland, triggering declarations of war from Britain and France and beginning World War II.",
      category: "warfare",
      relatedArcId: "world-war-2",
      relatedChapterId: "ww2-c1",
    },
  ],
  "09-11": [
    {
      id: "sep11-1297",
      month: 9, day: 11,
      year: "1297",
      yearSort: 1297,
      title: "Battle of Stirling Bridge",
      description: "William Wallace leads Scottish forces to a stunning victory over the English army at Stirling Bridge.",
      category: "warfare",
      relatedArcId: "medieval-europe",
    },
  ],
  "09-17": [
    {
      id: "sep17-1787",
      month: 9, day: 17,
      year: "1787",
      yearSort: 1787,
      title: "U.S. Constitution Signed",
      description: "Delegates sign the United States Constitution in Philadelphia, creating a new framework for American government.",
      category: "politics",
      relatedArcId: "american-revolution",
    },
  ],
  "09-22": [
    {
      id: "sep22-1862",
      month: 9, day: 22,
      year: "1862",
      yearSort: 1862,
      title: "Preliminary Emancipation Proclamation",
      description: "President Lincoln issues the preliminary Emancipation Proclamation, announcing slaves will be freed on January 1, 1863.",
      category: "politics",
      relatedArcId: "american-civil-war",
    },
  ],

  // October
  "10-12": [
    {
      id: "oct12-1492",
      month: 10, day: 12,
      year: "1492",
      yearSort: 1492,
      title: "Columbus Reaches the Americas",
      description: "Christopher Columbus lands in the Bahamas, initiating European exploration and colonization of the Americas.",
      category: "exploration",
      relatedArcId: "age-of-exploration",
    },
  ],
  "10-16": [
    {
      id: "oct16-1793",
      month: 10, day: 16,
      year: "1793",
      yearSort: 1793,
      title: "Execution of Marie Antoinette",
      description: "The former Queen of France is executed by guillotine during the Reign of Terror.",
      category: "revolution",
      relatedArcId: "french-revolution",
      relatedChapterId: "fr-c3",
    },
  ],
  "10-19": [
    {
      id: "oct19-1781",
      month: 10, day: 19,
      year: "1781",
      yearSort: 1781,
      title: "Siege of Yorktown Ends",
      description: "British General Cornwallis surrenders at Yorktown, effectively ending the American Revolutionary War.",
      category: "warfare",
      relatedArcId: "american-revolution",
    },
  ],
  "10-25": [
    {
      id: "oct25-1415",
      month: 10, day: 25,
      year: "1415",
      yearSort: 1415,
      title: "Battle of Agincourt",
      description: "Henry V's outnumbered English army defeats the French in one of the most famous battles of the Hundred Years' War.",
      category: "warfare",
      relatedArcId: "medieval-europe",
    },
  ],
  "10-29": [
    {
      id: "oct29-1929",
      month: 10, day: 29,
      year: "1929",
      yearSort: 1929,
      title: "Black Tuesday",
      description: "The stock market crashes catastrophically, triggering the Great Depression that devastates the global economy.",
      category: "politics",
    },
  ],

  // November
  "11-05": [
    {
      id: "nov5-1605",
      month: 11, day: 5,
      year: "1605",
      yearSort: 1605,
      title: "Gunpowder Plot Foiled",
      description: "Guy Fawkes is caught guarding explosives beneath Parliament, foiling a plot to assassinate King James I.",
      category: "politics",
      relatedArcId: "renaissance",
    },
  ],
  "11-09": [
    {
      id: "nov9-1989",
      month: 11, day: 9,
      year: "1989",
      yearSort: 1989,
      title: "Fall of the Berlin Wall",
      description: "The Berlin Wall falls as East Germany opens its borders, symbolizing the end of the Cold War division of Europe.",
      category: "revolution",
      relatedArcId: "cold-war",
    },
  ],
  "11-11": [
    {
      id: "nov11-1918",
      month: 11, day: 11,
      year: "1918",
      yearSort: 1918,
      title: "Armistice Day",
      description: "The armistice ending World War I takes effect at 11 AM, silencing the guns after four years of devastating warfare.",
      category: "warfare",
      relatedArcId: "world-war-1",
    },
  ],
  "11-22": [
    {
      id: "nov22-1963",
      month: 11, day: 22,
      year: "1963",
      yearSort: 1963,
      title: "JFK Assassination",
      description: "President John F. Kennedy is assassinated in Dallas, Texas, shocking the nation and the world.",
      category: "politics",
      relatedArcId: "cold-war",
    },
  ],

  // December
  "12-07": [
    {
      id: "dec7-1941",
      month: 12, day: 7,
      year: "1941",
      yearSort: 1941,
      title: "Attack on Pearl Harbor",
      description: "Japan launches a surprise attack on Pearl Harbor, bringing the United States into World War II.",
      category: "warfare",
      relatedArcId: "world-war-2",
      relatedChapterId: "ww2-c2",
    },
  ],
  "12-16": [
    {
      id: "dec16-1773",
      month: 12, day: 16,
      year: "1773",
      yearSort: 1773,
      title: "Boston Tea Party",
      description: "American colonists dump 342 chests of British tea into Boston Harbor to protest taxation without representation.",
      category: "revolution",
      relatedArcId: "american-revolution",
    },
  ],
  "12-17": [
    {
      id: "dec17-1903",
      month: 12, day: 17,
      year: "1903",
      yearSort: 1903,
      title: "First Powered Flight",
      description: "The Wright Brothers achieve the first sustained powered flight at Kitty Hawk, North Carolina.",
      category: "science",
      relatedArcId: "industrial-revolution",
    },
  ],
  "12-25": [
    {
      id: "dec25-800",
      month: 12, day: 25,
      year: "800 CE",
      yearSort: 800,
      title: "Charlemagne Crowned Emperor",
      description: "Pope Leo III crowns Charlemagne as Holy Roman Emperor, uniting much of Western Europe under one ruler.",
      category: "politics",
      relatedArcId: "medieval-europe",
    },
    {
      id: "dec25-1991",
      month: 12, day: 25,
      year: "1991",
      yearSort: 1991,
      title: "Soviet Union Dissolves",
      description: "Mikhail Gorbachev resigns and the Soviet Union officially dissolves, ending the Cold War era.",
      category: "politics",
      relatedArcId: "cold-war",
    },
  ],
};

// Helper functions
export function getTodayKey(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

export function getEventsForToday(): HistoricalEvent[] {
  const key = getTodayKey();
  return thisDayEvents[key] || [];
}

export function getEventsForDate(month: number, day: number): HistoricalEvent[] {
  const key = `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return thisDayEvents[key] || [];
}

export function getAllEvents(): HistoricalEvent[] {
  return Object.values(thisDayEvents).flat();
}

export function getEventsByCategory(category: HistoricalEvent['category']): HistoricalEvent[] {
  return getAllEvents().filter(event => event.category === category);
}

export function getEventsByArc(arcId: string): HistoricalEvent[] {
  return getAllEvents().filter(event => event.relatedArcId === arcId);
}

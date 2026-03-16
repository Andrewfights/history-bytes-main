/**
 * WW2 Module Hosts - Three historical perspectives for guiding users through WW2 content
 */

import { WW2Host } from '@/types';
import { getWW2Hosts as getFirestoreWW2Hosts, subscribeToWW2Hosts } from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';
import { loadWW2Hosts, setWW2HostsFromFirestore } from '@/lib/adminStorage';

const WW2_HOSTS_STORAGE_KEY = 'hb-ww2-hosts';

// Cache for Firestore data
let firestoreHostsCache: WW2Host[] | null = null;
let firestoreSubscribed = false;

export const WW2_HOSTS: WW2Host[] = [
  {
    id: 'soldier',
    name: 'Sergeant Mitchell',
    title: 'U.S. Army Infantryman',
    era: '1941-1945',
    specialty: 'Combat Veteran',
    primaryColor: '#3d5c3d',
    avatar: '🪖',
    voiceStyle: 'determined',
    description: 'A seasoned soldier who fought across the Pacific and European theaters. Experience the war through the eyes of someone who was there in the trenches.',
    introVideoUrl: '/assets/ww2-guides/soldier-intro.mp4',
    welcomeVideoUrl: undefined,
  },
  {
    id: 'journalist',
    name: 'War Correspondent',
    title: 'Frontline Reporter',
    era: '1941-1945',
    specialty: 'Human Stories',
    primaryColor: '#4a5568',
    avatar: '📰',
    voiceStyle: 'empathetic',
    description: 'See the war through the lens of those who documented it. Hear the human stories from the frontlines - the courage, the fear, the sacrifice, and the hope.',
    introVideoUrl: '/assets/ww2-guides/journalist-intro.mp4',
    welcomeVideoUrl: undefined,
  },
  {
    id: 'codebreaker',
    name: 'Code Breaker',
    title: 'Intelligence Specialist',
    era: '1939-1945',
    specialty: 'The Secret War',
    primaryColor: '#2d3748',
    avatar: '🔬',
    voiceStyle: 'analytical',
    description: 'Discover the hidden war fought in the shadows. From Enigma to espionage, uncover the intelligence operations that changed the course of history.',
    introVideoUrl: '/assets/ww2-guides/codebreaker-intro.mp4',
    welcomeVideoUrl: undefined,
  },
];

// Host dialogue for different game contexts
export interface HostDialogue {
  intro: string;
  instructions: string;
  encouragement: string[];
  correct: string[];
  incorrect: string[];
  completion: string;
  triviaIntro?: string;
}

export const HOST_DIALOGUES: Record<string, Record<string, HostDialogue>> = {
  soldier: {
    'radar-blip': {
      intro: "Listen up, recruit. On the morning of December 7th, two privates at Opana Point spotted something on their radar that would change history.",
      instructions: "Your job is simple - identify hostile aircraft. Tap on enemy blips, but don't hit our boys coming in from California. Stay sharp!",
      encouragement: ["Good eye, soldier!", "Keep scanning!", "Stay focused!"],
      correct: ["That's a hit!", "Enemy spotted!", "Good catch!"],
      incorrect: ["Hold fire! Those are friendlies!", "Watch your targets!", "That's one of ours!"],
      completion: "Not bad, recruit. If only they'd listened to Private Elliott that morning...",
    },
    'torpedo-dodge': {
      intro: "Battleship Row, 0755 hours. Japanese torpedo bombers are making their attack run. Our ships are sitting ducks.",
      instructions: "Navigate through torpedo alley. Tap left or right to switch lanes. One hit won't sink you, but three will. Survive as long as you can!",
      encouragement: ["Keep moving!", "Don't let up!", "Stay alive!"],
      correct: ["Torpedo evaded!", "Close one!", "Nice dodge!"],
      incorrect: ["We're hit!", "Damage report!", "Brace for impact!"],
      completion: "You showed real grit out there. That's what it took to survive that morning.",
    },
    'before-after': {
      intro: "I want you to see what we lost that day. Before and after - it's a sight I'll never forget.",
      instructions: "Drag the slider to see the devastation. Tap on the markers to learn what happened at each location.",
      encouragement: ["Take your time.", "Important to remember.", "Never forget."],
      correct: [],
      incorrect: [],
      completion: "2,403 Americans died that morning. We remember every single one.",
    },
    'speech-blanks': {
      intro: "The day after the attack, President Roosevelt addressed Congress. His words still echo through history.",
      instructions: "Fill in the blanks of FDR's famous speech. Select a word from the bank, then tap where it belongs.",
      encouragement: ["You're getting it.", "Keep going.", "Almost there."],
      correct: ["That's right!", "Exactly!", "You know your history!"],
      incorrect: ["Not quite.", "Try again.", "Think about it."],
      completion: "Those words united a nation. Congress declared war within the hour.",
      triviaIntro: "Let me ask you something about this speech...",
    },
    'wave-defense': {
      intro: "The attack came in two waves. First, they hit our airfields to ground our planes. Then they came for Battleship Row.",
      instructions: "Assign your limited defenses to protect key targets. Swipe to send anti-aircraft crews and rescue boats where they're needed most.",
      encouragement: ["Quick decisions!", "Prioritize!", "Good thinking!"],
      correct: ["Position secured!", "Defense in place!", "Good call!"],
      incorrect: ["Too slow!", "Wrong position!", "We needed those elsewhere!"],
      completion: "You did what you could with what you had. That's all anyone can ask.",
    },
    'escape-choice': {
      intro: "The Arizona's been hit. Fires everywhere. Oil on the water. You've got seconds to make life-or-death decisions.",
      instructions: "Choose your path to survival. Every choice matters. Think fast - the clock is ticking.",
      encouragement: ["Trust your instincts.", "Move!", "Don't hesitate!"],
      correct: ["Smart choice!", "You made it!", "Keep moving!"],
      incorrect: ["That didn't work out...", "Different choice needed.", "Try another way."],
      completion: "You survived. Many didn't. Their courage that day... it still humbles me.",
    },
    'wreck-match': {
      intro: "Eight battleships were moored along Battleship Row. Each one has its own story, its own sacrifice.",
      instructions: "Match each ship to its fate. Drag the ship cards to their casualty counts. Learn what happened to each vessel.",
      encouragement: ["Study the silhouettes.", "Remember their names.", "Honor their memory."],
      correct: ["Correct match!", "That's right.", "You remember."],
      incorrect: ["Not that one.", "Check again.", "Different ship."],
      completion: "These weren't just ships. They were home to thousands of sailors.",
    },
    'carrier-hunt': {
      intro: "Here's what the Japanese didn't know - our aircraft carriers weren't in port that morning. It changed everything.",
      instructions: "Find where the carriers were on December 7th. Their absence turned defeat into opportunity.",
      encouragement: ["Check the Pacific.", "Think logistics.", "Where were they headed?"],
      correct: ["Found it!", "That's the Enterprise!", "Carrier located!"],
      incorrect: ["Not there.", "Keep searching.", "Wrong coordinates."],
      completion: "Those carriers would lead us to victory at Midway six months later.",
    },
    'what-if': {
      intro: "What if Private Elliott's radar warning had been taken seriously? What if we had 30 more minutes?",
      instructions: "Make the choice that could have changed history. Then see what might have happened.",
      encouragement: ["Think it through.", "What would you do?", "History hangs in the balance."],
      correct: [],
      incorrect: [],
      completion: "History can't be changed. But we can learn from it.",
    },
    'first-person': {
      intro: "Jack Holder was at Hickam Field that morning. A bomb landed 100 yards from him. This is his story.",
      instructions: "Watch and listen. Answer the questions about what you witnessed.",
      encouragement: ["Pay attention.", "Remember the details.", "This is real history."],
      correct: ["You were listening!", "Exactly what he said.", "Good memory!"],
      incorrect: ["Listen again.", "Not quite right.", "Watch closely."],
      completion: "Jack survived and told his story for 70 years. Now you carry it too.",
    },
    'sub-puzzle': {
      intro: "Five Japanese midget submarines tried to enter the harbor. The USS Ward sank one before the air attack even began.",
      instructions: "Piece together the submarine wreck. Listen to what we learned from these vessels.",
      encouragement: ["Almost there.", "Keep piecing.", "You're getting it."],
      correct: ["Piece fits!", "Good work!", "Keep going!"],
      incorrect: ["Doesn't fit.", "Try another spot.", "Rotate it."],
      completion: "One sub washed ashore intact. It gave us valuable intelligence.",
    },
    'voiced-letter': {
      intro: "Jane Colestock wrote this letter about that morning. Her husband ran out as the sirens wailed. Listen to her words.",
      instructions: "Listen to the letter. React to what you hear - her fear, her hope, her courage.",
      encouragement: ["Feel the moment.", "Imagine being there.", "These words are real."],
      correct: [],
      incorrect: [],
      completion: "Letters like this remind us that history isn't just facts - it's people.",
    },
    'panorama-tour': {
      intro: "The Arizona still lies where she sank. 1,177 men are still aboard. Let me show you the memorial.",
      instructions: "Look around the wreck site. Tap the markers to learn about different parts of the memorial.",
      encouragement: ["Take your time.", "Look closely.", "Remember them."],
      correct: [],
      incorrect: [],
      completion: "Oil still seeps from the Arizona. They say she's still weeping for her crew.",
    },
    'plane-tracer': {
      intro: "Two attack waves, 350 planes total. They came from six aircraft carriers positioned north of Oahu.",
      instructions: "Trace the attack routes on the map. Follow the paths the Japanese pilots took that morning.",
      encouragement: ["Follow the flight path.", "See their approach.", "Map the attack."],
      correct: ["Route traced!", "Accurate path!", "You've got it!"],
      incorrect: ["Different route.", "Not that direction.", "Check the approach."],
      completion: "In less than two hours, the Pacific Fleet was crippled. But not defeated.",
    },
    'speech-reaction': {
      intro: "The whole nation listened to FDR's address. Feel what Americans felt as they heard these words.",
      instructions: "React to key moments in the speech. Show how the nation responded.",
      encouragement: ["Feel the emotion.", "The nation is listening.", "History is being made."],
      correct: ["That's the spirit!", "Americans felt that too!", "United we stand!"],
      incorrect: [],
      completion: "A nation transformed in a single day. We would never be the same.",
    },
  },
};

export function getWW2HostById(id: string): WW2Host | undefined {
  const hosts = getStoredWW2Hosts();
  return hosts.find(host => host.id === id);
}

/**
 * Load WW2 hosts from cache (IndexedDB or Firestore).
 * Priority: Firestore cache > IndexedDB cache > defaults
 */
export function getStoredWW2Hosts(): WW2Host[] {
  // If we have Firestore cached data, use it (this is the source of truth for real-time)
  if (firestoreHostsCache && firestoreHostsCache.length > 0) {
    return firestoreHostsCache;
  }

  // Check IndexedDB cache (guaranteed persistence layer)
  const indexedDBData = loadWW2Hosts();
  if (indexedDBData.hosts && indexedDBData.hosts.length > 0) {
    console.log('[WW2Hosts] Using IndexedDB cache:', indexedDBData.hosts.length, 'hosts');
    return indexedDBData.hosts.map(h => ({
      id: h.id as WW2Host['id'],
      name: h.name,
      title: h.title,
      era: h.era,
      specialty: h.specialty,
      imageUrl: h.imageUrl,
      introVideoUrl: h.introVideoUrl,
      welcomeVideoUrl: h.welcomeVideoUrl,
      primaryColor: h.primaryColor,
      avatar: h.avatar,
      voiceStyle: h.voiceStyle,
      description: h.description,
    }));
  }

  // If Firebase is configured, return defaults while waiting for Firestore to load
  if (isFirebaseConfigured()) {
    console.log('[WW2Hosts] No cache, waiting for Firestore data...');
    return WW2_HOSTS;
  }

  // Fall back to defaults
  return WW2_HOSTS;
}

// Helper to map Firestore host to WW2Host with displayOrder
function mapFirestoreHostToWW2Host(h: {
  id: string;
  name: string;
  title: string;
  era: string;
  specialty: string;
  imageUrl?: string;
  introVideoUrl?: string;
  welcomeVideoUrl?: string;
  primaryColor: string;
  avatar: string;
  voiceStyle: string;
  description: string;
  displayOrder?: number;
}): WW2Host & { displayOrder?: number } {
  return {
    id: h.id as WW2Host['id'],
    name: h.name,
    title: h.title,
    era: h.era,
    specialty: h.specialty,
    imageUrl: h.imageUrl,
    introVideoUrl: h.introVideoUrl,
    welcomeVideoUrl: h.welcomeVideoUrl,
    primaryColor: h.primaryColor,
    avatar: h.avatar,
    voiceStyle: h.voiceStyle,
    description: h.description,
    displayOrder: h.displayOrder,
  };
}

// Sort hosts by displayOrder
function sortHostsByOrder<T extends { displayOrder?: number }>(hosts: T[]): T[] {
  return [...hosts].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

/**
 * Initialize Firestore subscription for WW2 hosts.
 * Call this once when the app starts (e.g., in AppContext or main.tsx).
 */
export function initWW2HostsSubscription(): () => void {
  if (!isFirebaseConfigured() || firestoreSubscribed) {
    return () => {};
  }

  firestoreSubscribed = true;

  const unsubscribe = subscribeToWW2Hosts((hosts) => {
    if (hosts && hosts.length > 0) {
      // Map and sort by displayOrder
      firestoreHostsCache = sortHostsByOrder(hosts.map(mapFirestoreHostToWW2Host));
      console.log('[WW2Hosts] Cache updated from Firestore:', firestoreHostsCache.map(h => ({
        id: h.id,
        order: (h as { displayOrder?: number }).displayOrder
      })));
      // Also update IndexedDB cache for persistence
      setWW2HostsFromFirestore(hosts.map(h => ({
        id: h.id,
        name: h.name,
        title: h.title,
        era: h.era,
        specialty: h.specialty,
        imageUrl: h.imageUrl,
        introVideoUrl: h.introVideoUrl,
        welcomeVideoUrl: h.welcomeVideoUrl,
        primaryColor: h.primaryColor,
        avatar: h.avatar,
        voiceStyle: h.voiceStyle,
        description: h.description,
        displayOrder: h.displayOrder,
      })));
    }
  });

  return () => {
    firestoreSubscribed = false;
    unsubscribe();
  };
}

/**
 * Async function to load WW2 hosts from Firestore.
 * Use this for initial data fetch.
 */
export async function loadWW2HostsFromFirestore(): Promise<WW2Host[]> {
  if (!isFirebaseConfigured()) {
    return getStoredWW2Hosts();
  }

  try {
    const hosts = await getFirestoreWW2Hosts();
    if (hosts && hosts.length > 0) {
      // Map and sort by displayOrder
      firestoreHostsCache = sortHostsByOrder(hosts.map(mapFirestoreHostToWW2Host));
      console.log('[WW2Hosts] Loaded from Firestore:', firestoreHostsCache.length, 'hosts');
      return firestoreHostsCache;
    }
  } catch (e) {
    console.error('[WW2Hosts] Error loading from Firestore:', e);
  }

  return getStoredWW2Hosts();
}

export function getHostDialogue(hostId: string, gameId: string): HostDialogue | undefined {
  return HOST_DIALOGUES[hostId]?.[gameId];
}

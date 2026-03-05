// Ghost Army 5-Node Story Experience Data
// A cinematic journey through WW2's most creative deception unit

// ---- Node Type Definitions ----

export type GhostArmyNodeType = 'watch' | 'learn' | 'interactive' | 'boss' | 'resolution' | 'trivia';

export interface NarrationSegment {
  atSecond: number;
  text: string;
  duration?: number; // How long to show (defaults to until next narration)
}

// Node 1: Watch Node - Quote or Fake
export interface QuoteOrFakeInteraction {
  type: 'quote-or-fake';
  quote: string;
  attribution: string;
  isReal: boolean;
  explanation: string;
}

export interface WatchNodeContent {
  type: 'watch';
  title: string;
  narration: NarrationSegment[];
  interaction: QuoteOrFakeInteraction;
  transitionText: string;
}

// Node 2: Learn Node - Chrono Order
export interface ChronoEvent {
  id: string;
  text: string;
  order: number; // Correct order position (1-based)
}

export interface LearnNodeContent {
  type: 'learn';
  title: string;
  context: string;
  mapDescription: string;
  chronoChallenge: {
    prompt: string;
    events: ChronoEvent[];
  };
  revealNarration: string;
}

// Node 3: Interactive Node - Who Am I (Clue Reveal)
export interface Artifact {
  id: string;
  name: string;
  clues: string[];
  choices: string[];
  correctIndex: number;
  revealText: string;
  audioDescription?: string;
}

export interface InteractiveNodeContent {
  type: 'interactive';
  title: string;
  introNarration: string;
  artifacts: Artifact[];
  conclusionNarration: string;
}

// Node 4: Boss Node - Tactical Placement
export interface DeceptionAsset {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface MapZone {
  id: string;
  name: string;
  description: string;
  correctAssets: string[]; // Asset IDs that should go here
}

export interface TacticalBossContent {
  type: 'boss';
  title: string;
  operationName: string;
  briefing: string;
  timeLimit: number; // seconds
  assets: DeceptionAsset[];
  zones: MapZone[];
  successNarration: string;
  failureNarration: string;
}

// Node 5: Resolution Node
export interface UnlockedStory {
  title: string;
  description: string;
}

export interface ResolutionNodeContent {
  type: 'resolution';
  title: string;
  photoCaption: string;
  narration: string[];
  keyStats: {
    label: string;
    value: string;
  }[];
  unlockedStories: UnlockedStory[];
  closingQuote: string;
}

// Trivia Node - Video-driven Q&A
export interface TriviaNodeContent {
  type: 'trivia';
  title: string;
  introText?: string;
  triviaSetId?: string; // Reference to a trivia set in IndexedDB
}

// Union type for all node content
export type GhostArmyNodeContent =
  | WatchNodeContent
  | LearnNodeContent
  | InteractiveNodeContent
  | TacticalBossContent
  | ResolutionNodeContent
  | TriviaNodeContent;

// Full node definition
export interface GhostArmyNode {
  id: string;
  type: GhostArmyNodeType;
  title: string;
  xpReward: number;
  content: GhostArmyNodeContent;
}

// Full story structure
export interface GhostArmyStory {
  id: string;
  era: string;
  chapter: string;
  title: string;
  description: string;
  totalXP: number;
  estimatedMinutes: number;
  learningArc: string;
  nodes: GhostArmyNode[];
}

// ---- Story Content ----

export const ghostArmyStory: GhostArmyStory = {
  id: 'ghost-army-story',
  era: 'World War II',
  chapter: 'Chapter 1',
  title: 'The Ghost Army',
  description: 'The classified unit that fooled the Nazis with art, sound, and deception.',
  totalXP: 215,
  estimatedMinutes: 18,
  learningArc: 'Myth → Zoom Out → Zoom In → Reality',
  nodes: [
    // ======== NODE 1: THE HOOK & THE MYTH ========
    {
      id: 'node-1-watch',
      type: 'watch',
      title: 'The Hook & The Myth',
      xpReward: 20,
      content: {
        type: 'watch',
        title: 'The Myth of Steel',
        narration: [
          {
            atSecond: 0,
            text: 'To win the Second World War, the Allies built an unstoppable machine of steel...',
            duration: 8,
          },
          {
            atSecond: 8,
            text: 'Sherman tanks. 50,000 rolling off assembly lines. The symbol of American industrial might.',
            duration: 7,
          },
          {
            atSecond: 15,
            text: 'But watch closely...',
            duration: 3,
          },
          {
            atSecond: 18,
            text: 'That tank? It weighs less than 100 pounds.',
            duration: 4,
          },
          {
            atSecond: 22,
            text: 'The most effective weapon of the war didn\'t fire a single bullet.',
            duration: 5,
          },
          {
            atSecond: 27,
            text: 'Welcome to the 23rd Headquarters Special Troops.',
            duration: 4,
          },
          {
            atSecond: 31,
            text: 'Welcome to the Ghost Army.',
            duration: 3,
          },
        ],
        interaction: {
          type: 'quote-or-fake',
          quote: 'All warfare is based on deception.',
          attribution: 'Sun Tzu, The Art of War',
          isReal: true,
          explanation: 'This 2,500-year-old quote from The Art of War has guided military strategy across civilizations. The Ghost Army would prove its truth in spectacular fashion.',
        },
        transitionText: 'Deception is as old as war itself. But never before had it been turned into an art form...',
      },
    },

    // ======== NODE 2: THE TACTICAL CHESSBOARD ========
    {
      id: 'node-2-learn',
      type: 'learn',
      title: 'The Tactical Chessboard',
      xpReward: 25,
      content: {
        type: 'learn',
        title: 'Patton\'s Dilemma',
        context: 'September 1944. The Allied front stretches across France. General George S. Patton, the most feared commander in Europe, faces an impossible choice.',
        mapDescription: 'A dark topographic map showing Allied (blue) and German (red) lines across Western Europe.',
        chronoChallenge: {
          prompt: 'Arrange these events to reveal Patton\'s dilemma:',
          events: [
            {
              id: 'e1',
              text: 'Patton\'s Third Army holds a critical section of the frontline',
              order: 1,
            },
            {
              id: 'e2',
              text: 'Eisenhower secretly orders Patton to march north for a major offensive',
              order: 2,
            },
            {
              id: 'e3',
              text: 'A dangerous 20-mile gap opens in the Allied defensive line',
              order: 3,
            },
            {
              id: 'e4',
              text: 'German reconnaissance reports the frontline is suddenly vulnerable',
              order: 4,
            },
          ],
        },
        revealNarration: 'How do you plug a 20-mile hole when you have no soldiers left? You don\'t. You make the enemy believe it\'s full of soldiers. You build a ghost.',
      },
    },

    // ======== NODE 3: ANATOMY OF A PHANTOM ========
    {
      id: 'node-3-interactive',
      type: 'interactive',
      title: 'Anatomy of a Phantom',
      xpReward: 30,
      content: {
        type: 'interactive',
        title: 'The Tools of Deception',
        introNarration: 'The Army didn\'t recruit soldiers for this mission. They recruited from art schools, advertising agencies, and theater companies. Each brought a unique weapon to the battlefield.',
        artifacts: [
          {
            id: 'artifact-1',
            name: 'The Sonic Halftrack',
            clues: [
              'I weigh 500 pounds.',
              'I can be heard from 15 miles away.',
              'I play records.',
            ],
            choices: ['Radio Antenna', 'Sonic Halftrack', 'Field Telephone', 'Propaganda Speaker'],
            correctIndex: 1,
            revealText: 'Powerful speakers mounted on halftracks played recordings of tank columns, artillery, and troop movements. German soldiers heard an army that didn\'t exist.',
            audioDescription: 'Sound of rumbling tank engines and marching troops',
          },
          {
            id: 'artifact-2',
            name: 'The Spoof Radio Operator',
            clues: [
              'I speak in Morse code.',
              'I copy the "fist" of real generals.',
              'I feed the enemy false intelligence.',
            ],
            choices: ['Code Breaker', 'Spoof Radio Operator', 'Signal Corps Technician', 'Propaganda Broadcaster'],
            correctIndex: 1,
            revealText: 'Every radio operator has a unique "fist" — their personal rhythm of tapping Morse code. Ghost Army operators studied real generals and mimicked their transmission style perfectly, sending false orders across enemy-monitored channels.',
          },
          {
            id: 'artifact-3',
            name: 'The Imperfect Decoy',
            clues: [
              'I am painted with perfect detail.',
              'I am intentionally left half-hidden in trees.',
              'I want to be discovered.',
            ],
            choices: ['Camouflage Net', 'Dummy Soldier', 'Imperfect Decoy Tank', 'Smoke Screen'],
            correctIndex: 2,
            revealText: 'A perfect disguise looks fake from the air. Ghost Army artists deliberately made their rubber tanks slightly visible, knowing German reconnaissance pilots would feel clever for "spotting" the secret. They never suspected what they saw was the deception itself.',
          },
        ],
        conclusionNarration: 'Art school rejects. Failed actors. Advertising men. Together, they became the most creative military unit in history.',
      },
    },

    // ======== NODE 4: OPERATION VIERSEN ========
    {
      id: 'node-4-boss',
      type: 'boss',
      title: 'Operation Viersen',
      xpReward: 75,
      content: {
        type: 'boss',
        title: 'The Rhine Crossing',
        operationName: 'Operation Viersen',
        briefing: 'March 1945. The Rhine River — the final barrier into Germany. The real Ninth Army needs to cross 10 miles south. Your mission: draw every Panzer division north. If you fail, thousands die at the crossing.',
        timeLimit: 120,
        assets: [
          {
            id: 'rubber-tanks',
            name: 'Rubber Tanks',
            icon: '🎈',
            count: 3,
            description: 'Inflatable Sherman tanks. Deploy where spy planes can "discover" them.',
          },
          {
            id: 'sound-trucks',
            name: 'Sound Trucks',
            icon: '🔊',
            count: 2,
            description: 'Sonic halftracks playing tank and troop movement recordings. Best used at night near the front.',
          },
          {
            id: 'radio-tents',
            name: 'Radio Tents',
            icon: '📻',
            count: 2,
            description: 'Spoof radio stations broadcasting fake HQ communications. Place in rear positions.',
          },
        ],
        zones: [
          {
            id: 'zone-front',
            name: 'Front Line',
            description: 'Visible to German forward observers. Sound carries to enemy positions at night.',
            correctAssets: ['sound-trucks'],
          },
          {
            id: 'zone-staging',
            name: 'Staging Area',
            description: 'Open fields partially visible from aerial reconnaissance.',
            correctAssets: ['rubber-tanks'],
          },
          {
            id: 'zone-rear',
            name: 'Rear Command',
            description: 'Behind the lines. Radio signals monitored by German intelligence.',
            correctAssets: ['radio-tents'],
          },
        ],
        successNarration: 'German High Command repositioned two Panzer divisions north — away from the real crossing. The Ninth Army crossed the Rhine with minimal resistance. Operation Viersen was a masterpiece.',
        failureNarration: 'The deception was detected. But even failed attempts taught the Ghost Army invaluable lessons for their next operation...',
      },
    },

    // ======== NODE 5: VIDEO TRIVIA CHALLENGE ========
    {
      id: 'node-5-trivia',
      type: 'trivia',
      title: 'Knowledge Check',
      xpReward: 40,
      content: {
        type: 'trivia',
        title: 'Ghost Army Knowledge Check',
        introText: 'Test your knowledge about the Ghost Army with these video questions!',
        // triviaSetId will be set in admin panel
      },
    },

    // ======== NODE 6: THE "TA-DA" MOMENT ========
    {
      id: 'node-6-resolution',
      type: 'resolution',
      title: 'The Reveal',
      xpReward: 25,
      content: {
        type: 'resolution',
        title: 'The Ghosts Unmasked',
        photoCaption: 'Ghost Army soldiers posing with deflated tank, 1945',
        narration: [
          'The Ghost Army staged over 20 battlefield deceptions across Europe.',
          '1,100 soldiers impersonating forces of 30,000.',
          'An estimated 30,000 Allied lives saved.',
          'Their story remained classified for over 50 years.',
          'Many members went on to reshape American culture.',
          'Fashion designer Bill Blass. Painter Ellsworth Kelly. Art director Arthur Singer.',
          'They proved that in war, creativity can be the most powerful weapon of all.',
        ],
        keyStats: [
          { label: 'Deception Operations', value: '20+' },
          { label: 'Unit Size', value: '1,100' },
          { label: 'Simulated Force', value: '30,000' },
          { label: 'Years Classified', value: '50+' },
          { label: 'Lives Saved (est.)', value: '30,000' },
        ],
        unlockedStories: [
          {
            title: 'Operation Fortitude',
            description: 'The D-Day deception that fooled Hitler',
          },
          {
            title: 'The Battle of the Bulge',
            description: 'Hitler\'s desperate last gamble',
          },
          {
            title: 'D-Day: The Longest Day',
            description: 'Storming Fortress Europe',
          },
        ],
        closingQuote: 'Sometimes, the most powerful weapon in a war is the ability to tell a convincing story.',
      },
    },
  ],
};

// ---- Helper Functions ----

export function getNode(nodeId: string): GhostArmyNode | undefined {
  return ghostArmyStory.nodes.find(n => n.id === nodeId);
}

export function getNodeByIndex(index: number): GhostArmyNode | undefined {
  return ghostArmyStory.nodes[index];
}

export function getNodeCount(): number {
  return ghostArmyStory.nodes.length;
}

export function getTotalXP(): number {
  return ghostArmyStory.nodes.reduce((sum, node) => sum + node.xpReward, 0);
}

export function isWatchNode(content: GhostArmyNodeContent): content is WatchNodeContent {
  return content.type === 'watch';
}

export function isLearnNode(content: GhostArmyNodeContent): content is LearnNodeContent {
  return content.type === 'learn';
}

export function isInteractiveNode(content: GhostArmyNodeContent): content is InteractiveNodeContent {
  return content.type === 'interactive';
}

export function isBossNode(content: GhostArmyNodeContent): content is TacticalBossContent {
  return content.type === 'boss';
}

export function isResolutionNode(content: GhostArmyNodeContent): content is ResolutionNodeContent {
  return content.type === 'resolution';
}

export function isTriviaNode(content: GhostArmyNodeContent): content is TriviaNodeContent {
  return content.type === 'trivia';
}

// Pearl Harbor Story Experience Data
// A cinematic journey through the attack that changed America forever

// Import types from Ghost Army (shared structure)
import type {
  NarrationSegment,
  QuoteOrFakeInteraction,
  WatchNodeContent,
  ChronoEvent,
  LearnNodeContent,
  Artifact,
  InteractiveNodeContent,
  ResolutionNodeContent,
  TriviaNodeContent,
} from './ghostArmyStory';

// Pearl Harbor specific boss node type
export interface DefenseAsset {
  id: string;
  name: string;
  icon: string;
  count: number;
  description: string;
}

export interface DefenseZone {
  id: string;
  name: string;
  description: string;
  correctAssets: string[];
}

export interface DefenseBossContent {
  type: 'boss';
  title: string;
  operationName: string;
  briefing: string;
  timeLimit: number;
  assets: DefenseAsset[];
  zones: DefenseZone[];
  successNarration: string;
  failureNarration: string;
}

export type PearlHarborNodeType = 'watch' | 'learn' | 'interactive' | 'boss' | 'resolution' | 'trivia';

export type PearlHarborNodeContent =
  | WatchNodeContent
  | LearnNodeContent
  | InteractiveNodeContent
  | DefenseBossContent
  | ResolutionNodeContent
  | TriviaNodeContent;

export interface PearlHarborNode {
  id: string;
  type: PearlHarborNodeType;
  title: string;
  xpReward: number;
  content: PearlHarborNodeContent;
}

export interface PearlHarborStory {
  id: string;
  era: string;
  chapter: string;
  title: string;
  description: string;
  totalXP: number;
  estimatedMinutes: number;
  learningArc: string;
  nodes: PearlHarborNode[];
}

// ---- Story Content ----

export const pearlHarborStory: PearlHarborStory = {
  id: 'pearl-harbor-story',
  era: 'World War II',
  chapter: 'Chapter 2',
  title: 'Pearl Harbor',
  description: 'The attack that thrust America into World War II and changed history forever.',
  totalXP: 215,
  estimatedMinutes: 20,
  learningArc: 'Shock → Context → Details → Experience → Understanding',
  nodes: [
    // ======== NODE 1: DAY OF INFAMY ========
    {
      id: 'node-1-watch',
      type: 'watch',
      title: 'Day of Infamy',
      xpReward: 20,
      content: {
        type: 'watch',
        title: 'A Date Which Will Live in Infamy',
        narration: [
          {
            atSecond: 0,
            text: 'December 7th, 1941. A peaceful Sunday morning in paradise.',
            duration: 6,
          },
          {
            atSecond: 6,
            text: 'Sailors slept in their bunks. Families prepared for church. The American Pacific Fleet rested at anchor.',
            duration: 8,
          },
          {
            atSecond: 14,
            text: 'At 7:48 AM, the first wave appeared over the mountains.',
            duration: 5,
          },
          {
            atSecond: 19,
            text: '183 Japanese aircraft. Destination: Battleship Row.',
            duration: 5,
          },
          {
            atSecond: 24,
            text: 'In less than two hours, 2,403 Americans would be dead.',
            duration: 5,
          },
          {
            atSecond: 29,
            text: 'The USS Arizona would become a tomb for 1,177 sailors.',
            duration: 5,
          },
          {
            atSecond: 34,
            text: 'And America would never be the same.',
            duration: 4,
          },
        ],
        interaction: {
          type: 'quote-or-fake',
          quote: 'Yesterday, December 7th, 1941 — a date which will live in infamy — the United States of America was suddenly and deliberately attacked.',
          attribution: 'President Franklin D. Roosevelt, December 8, 1941',
          isReal: true,
          explanation: 'FDR\'s words to Congress the day after the attack became one of history\'s most famous speeches. Within an hour, Congress declared war on Japan. Only one representative voted against it.',
        },
        transitionText: 'But the attack didn\'t come from nowhere. The storm had been building for a decade...',
      },
    },

    // ======== NODE 2: THE PATH TO WAR ========
    {
      id: 'node-2-learn',
      type: 'learn',
      title: 'The Path to War',
      xpReward: 25,
      content: {
        type: 'learn',
        title: 'Rising Tensions in the Pacific',
        context: 'Japan\'s military expansion across Asia put it on a collision course with American interests. As tensions escalated, both nations prepared for what many saw as inevitable conflict.',
        mapDescription: 'A strategic map of the Pacific showing Japanese expansion (red) and American territories (blue).',
        chronoChallenge: {
          prompt: 'Arrange these events to understand how war became inevitable:',
          events: [
            {
              id: 'e1',
              text: 'Japan invades Manchuria, beginning its expansion in Asia',
              order: 1,
            },
            {
              id: 'e2',
              text: 'Japan launches full-scale invasion of China, sparking international outrage',
              order: 2,
            },
            {
              id: 'e3',
              text: 'The U.S. imposes oil embargo on Japan, threatening its war machine',
              order: 3,
            },
            {
              id: 'e4',
              text: 'Diplomatic talks fail; Admiral Yamamoto plans the Pearl Harbor attack',
              order: 4,
            },
          ],
        },
        revealNarration: 'Japan faced a choice: abandon its empire or strike before America grew too strong. Admiral Yamamoto, who had studied at Harvard and knew American industrial might, warned his leaders: "I can run wild for six months... after that, I have no expectation of success."',
      },
    },

    // ======== NODE 3: ARTIFACTS OF DECEMBER 7TH ========
    {
      id: 'node-3-interactive',
      type: 'interactive',
      title: 'Artifacts of December 7th',
      xpReward: 30,
      content: {
        type: 'interactive',
        title: 'Witnesses to History',
        introNarration: 'The attack left behind artifacts that still tell the story. Each one reveals a different aspect of that fateful morning.',
        artifacts: [
          {
            id: 'artifact-1',
            name: 'The Opana Point Radar',
            clues: [
              'I was brand new, barely tested.',
              'I detected something at 7:02 AM — 137 miles away.',
              'My warning was dismissed as a flight of B-17s.',
            ],
            choices: ['Radio Tower', 'Opana Point Radar', 'Signal Lamp', 'Searchlight'],
            correctIndex: 1,
            revealText: 'Privates Lockard and Elliott detected the incoming Japanese planes 50 minutes before the attack. When they reported it, the officer on duty assumed it was an expected flight of American B-17s. The warning was ignored.',
            audioDescription: 'Radar blip sounds pinging steadily',
          },
          {
            id: 'artifact-2',
            name: 'The Mitsubishi A6M Zero',
            clues: [
              'I could fly 1,600 miles without refueling.',
              'I was lighter and faster than any American fighter.',
              'My weakness was my lack of armor.',
            ],
            choices: ['B-17 Bomber', 'P-40 Warhawk', 'Mitsubishi A6M Zero', 'Grumman Wildcat'],
            correctIndex: 2,
            revealText: 'The Japanese Zero was the war\'s most feared fighter. Its extreme range allowed it to fly from carriers stationed 230 miles away. But to achieve that range, it sacrificed armor — a weakness American pilots would later exploit.',
          },
          {
            id: 'artifact-3',
            name: 'The USS Arizona Bell',
            clues: [
              'I weighed over 500 pounds.',
              'I called sailors to duty every morning.',
              'I survived when 1,177 of my crew did not.',
            ],
            choices: ['Ship\'s Wheel', 'Anchor Chain', 'USS Arizona Bell', 'Captain\'s Clock'],
            correctIndex: 2,
            revealText: 'The Arizona\'s bell was recovered from the sunken battleship. Today it rings every December 7th at the Pearl Harbor Memorial, once for each year since the attack. The ship remains underwater, still leaking oil — "black tears" for her lost crew.',
          },
        ],
        conclusionNarration: 'These artifacts — a dismissed warning, a deadly fighter, and a memorial bell — remind us that history turns on moments both large and small.',
      },
    },

    // ======== NODE 4: THE DEFENSE OF PEARL HARBOR ========
    {
      id: 'node-4-boss',
      type: 'boss',
      title: 'The Defense of Pearl Harbor',
      xpReward: 75,
      content: {
        type: 'boss',
        title: 'Rally the Defense',
        operationName: 'Emergency Response',
        briefing: 'It\'s 7:55 AM. The first bombs are falling. You have minutes to organize a defense. Anti-aircraft guns need crews. Planes need to scramble. Rescue operations must begin. Where do you deploy your limited resources?',
        timeLimit: 90,
        assets: [
          {
            id: 'aa-crews',
            name: 'AA Gun Crews',
            icon: '🎯',
            count: 3,
            description: 'Anti-aircraft teams. Most effective on Battleship Row and airfield perimeters.',
          },
          {
            id: 'rescue-teams',
            name: 'Rescue Boats',
            icon: '⚓',
            count: 2,
            description: 'Small boats to rescue sailors from burning ships and the water.',
          },
          {
            id: 'fighter-pilots',
            name: 'Fighter Pilots',
            icon: '✈️',
            count: 2,
            description: 'P-40 pilots who can scramble if they reach undamaged aircraft.',
          },
        ],
        zones: [
          {
            id: 'zone-battleship-row',
            name: 'Battleship Row',
            description: 'The main target. Ships are taking heavy damage. Sailors are in the water.',
            correctAssets: ['rescue-teams'],
          },
          {
            id: 'zone-airfields',
            name: 'Wheeler & Hickam Airfields',
            description: 'Aircraft are being destroyed on the ground. Some P-40s may still be operational.',
            correctAssets: ['fighter-pilots'],
          },
          {
            id: 'zone-harbor-defense',
            name: 'Harbor Defense Points',
            description: 'Elevated positions with clear firing lines at incoming aircraft.',
            correctAssets: ['aa-crews'],
          },
        ],
        successNarration: 'Against overwhelming odds, American defenders shot down 29 Japanese aircraft and damaged dozens more. Individual acts of heroism saved countless lives. The spirit shown that morning would fuel America\'s determination to fight back.',
        failureNarration: 'The chaos of battle made perfect decisions impossible. But every defender who fought back that morning became a hero, regardless of the outcome.',
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
        title: 'Pearl Harbor Knowledge Check',
        introText: 'Test your knowledge about the attack on Pearl Harbor!',
        // triviaSetId will be set in admin panel
      },
    },

    // ======== NODE 6: AFTERMATH ========
    {
      id: 'node-6-resolution',
      type: 'resolution',
      title: 'The Aftermath',
      xpReward: 25,
      content: {
        type: 'resolution',
        title: 'A Nation Transformed',
        photoCaption: 'USS Arizona Memorial, Pearl Harbor, Hawaii',
        narration: [
          'The attack lasted just 1 hour and 15 minutes.',
          'But it transformed America overnight.',
          'The day before, the nation was divided over entering the war.',
          'The day after, recruitment offices couldn\'t handle the lines.',
          'American industry mobilized at unprecedented speed.',
          'Within four years, the U.S. would have the most powerful military in human history.',
          'The USS Arizona remains where she sank, a memorial to 1,177 sailors entombed below.',
          'Every year, survivors return to honor their fallen brothers — though fewer each year.',
          'Their sacrifice reminds us: freedom is never free.',
        ],
        keyStats: [
          { label: 'Attack Duration', value: '1h 15m' },
          { label: 'Americans Killed', value: '2,403' },
          { label: 'USS Arizona Dead', value: '1,177' },
          { label: 'Ships Sunk', value: '5' },
          { label: 'Ships Damaged', value: '16' },
          { label: 'Aircraft Destroyed', value: '188' },
          { label: 'Japanese Killed', value: '64' },
          { label: 'Days Until War Declared', value: '1' },
        ],
        unlockedStories: [
          {
            title: 'The Doolittle Raid',
            description: 'America\'s daring first strike back at Japan',
          },
          {
            title: 'Midway: Turning the Tide',
            description: 'The battle that changed the Pacific War',
          },
          {
            title: 'The Ghost Army',
            description: 'The secret unit that fooled the Nazis',
          },
        ],
        closingQuote: 'I fear all we have done is to awaken a sleeping giant and fill him with a terrible resolve. — Attributed to Admiral Isoroku Yamamoto',
      },
    },
  ],
};

// ---- Helper Functions ----

export function getPearlHarborNode(nodeId: string): PearlHarborNode | undefined {
  return pearlHarborStory.nodes.find(n => n.id === nodeId);
}

export function getPearlHarborNodeByIndex(index: number): PearlHarborNode | undefined {
  return pearlHarborStory.nodes[index];
}

export function getPearlHarborNodeCount(): number {
  return pearlHarborStory.nodes.length;
}

export function getPearlHarborTotalXP(): number {
  return pearlHarborStory.nodes.reduce((sum, node) => sum + node.xpReward, 0);
}

export function isPearlHarborWatchNode(content: PearlHarborNodeContent): content is WatchNodeContent {
  return content.type === 'watch';
}

export function isPearlHarborLearnNode(content: PearlHarborNodeContent): content is LearnNodeContent {
  return content.type === 'learn';
}

export function isPearlHarborInteractiveNode(content: PearlHarborNodeContent): content is InteractiveNodeContent {
  return content.type === 'interactive';
}

export function isPearlHarborBossNode(content: PearlHarborNodeContent): content is DefenseBossContent {
  return content.type === 'boss';
}

export function isPearlHarborResolutionNode(content: PearlHarborNodeContent): content is ResolutionNodeContent {
  return content.type === 'resolution';
}

export function isPearlHarborTriviaNode(content: PearlHarborNodeContent): content is TriviaNodeContent {
  return content.type === 'trivia';
}

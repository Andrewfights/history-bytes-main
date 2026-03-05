import { Host } from '@/types';

export const hosts: Host[] = [
  {
    id: 'historian',
    name: 'The Historian',
    avatar: '🧙',
    personality: 'guide',
    catchphrases: [
      "Fascinating choice...",
      "History remembers this differently!",
      "You're learning fast!",
      "Ah, but there's more to the story...",
      "Excellent! You've got a keen eye for history.",
      "Not quite, but a common misconception!",
    ],
  },
  {
    id: 'marie',
    name: 'Marie',
    avatar: '👸',
    personality: 'character',
    catchphrases: [
      "Zut alors! That is incorrect.",
      "Magnifique! You understand.",
      "The revolution changed everything...",
      "In Versailles, we had no idea what was coming.",
    ],
  },
  {
    id: 'caesar',
    name: 'Julius Caesar',
    avatar: '🏛️',
    personality: 'character',
    catchphrases: [
      "Veni, vidi... you got that wrong.",
      "The Senate would approve of your answer!",
      "Rome wasn't built in a day, and neither is knowledge.",
      "Alea iacta est - the die is cast!",
    ],
  },
  {
    id: 'correspondent',
    name: 'War Correspondent',
    avatar: '📻',
    personality: 'historian',
    catchphrases: [
      "This just in from the front lines...",
      "The soldiers I interviewed would disagree.",
      "History is written by those who were there.",
      "Let me tell you what I saw that day...",
    ],
  },
  {
    id: 'lincoln',
    name: 'Mr. Lincoln',
    avatar: '🎩',
    personality: 'character',
    catchphrases: [
      "A house divided cannot stand...",
      "You have shown wisdom beyond your years.",
      "The better angels of our nature guide you well.",
      "Four score and... that's not quite right.",
    ],
  },
  {
    id: 'hammurabi',
    name: 'Hammurabi',
    avatar: '📜',
    personality: 'character',
    catchphrases: [
      "The code is clear on this matter.",
      "Justice must be served equally.",
      "In ancient Babylon, we knew the value of law.",
      "An eye for an eye... but do you know the full context?",
    ],
  },
];

export function getHostById(id: string): Host | undefined {
  return hosts.find(h => h.id === id);
}

export function getRandomReaction(host: Host, isCorrect: boolean): string {
  const reactions = isCorrect
    ? host.catchphrases.filter((_, i) => i % 2 === 0) // Even indices for correct
    : host.catchphrases.filter((_, i) => i % 2 === 1); // Odd indices for incorrect
  return reactions[Math.floor(Math.random() * reactions.length)] || host.catchphrases[0];
}

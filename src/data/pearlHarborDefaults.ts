/**
 * Pearl Harbor Beat 1 Default Data
 * Shared between admin editor and RoadToWarBeat component
 */

import type { ModuleHotspot } from '@/types/moduleTypes';

// Default map image for Beat 1 - empty string means admin needs to upload an image
export const BEAT_1_DEFAULT_IMAGE = '';

// Default hotspots for Beat 1 - The Road to War
// These are the 3 key narrative points that explain why Pearl Harbor happened
export const BEAT_1_DEFAULT_HOTSPOTS: ModuleHotspot[] = [
  {
    id: 'isolationism',
    x: 25,
    y: 40,
    label: 'American Isolationism',
    description: '88% of Americans opposed declaring war in January 1940. The America First Committee had over 800,000 members advocating for neutrality. The Neutrality Acts (1935-37) restricted arms sales to warring nations.',
    revealFact: '"The United States must be kept out of foreign wars at all costs."',
  },
  {
    id: 'japan-resources',
    x: 75,
    y: 35,
    label: "Japan's Resource Crisis",
    description: 'Japan consumed 32+ million barrels of oil annually but produced only 3 million domestically. Over 80% of Japan\'s oil came from the United States. 74.1% of Japan\'s scrap iron imports came from the U.S.',
    revealFact: 'Without American resources, Japan\'s military machine would grind to a halt.',
  },
  {
    id: 'diplomatic-escalation',
    x: 50,
    y: 70,
    label: 'Diplomatic Escalation',
    description: 'July 26, 1941: U.S. freezes Japanese assets. August 1, 1941: Oil embargo begins. November 26, 1941: Hull Note demands complete withdrawal from China. December 1, 1941: Imperial Conference approves war.',
    revealFact: 'Admiral Yamamoto warned Japan could "run wild for six months" but would lose a prolonged war.',
  },
];

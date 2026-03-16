import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Crown, ChevronLeft, BookOpen, Gamepad2, Play, Brain, Lock, Signal, Sword, Flame, ChevronRight, Scroll } from 'lucide-react';
import { ExploreNode, ExploreRow, MasteryState, getNextRankXP } from '@/types';
import { useApp } from '@/context/AppContext';
import { LevelFlow } from '@/components/session/LevelFlow';
import { allLevelsByAct } from '@/data/levelData';
import { Progress } from '@/components/ui/progress';


// --- Acts data with row-based branching ---
type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'scholar';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; bars: number }> = {
  beginner:     { label: 'Beginner',     color: 'text-success',        bars: 1 },
  intermediate: { label: 'Intermediate', color: 'text-primary',        bars: 2 },
  advanced:     { label: 'Advanced',     color: 'text-secondary',      bars: 3 },
  expert:       { label: 'Expert',       color: 'text-destructive',    bars: 4 },
  scholar:      { label: 'Scholar',      color: 'text-destructive',    bars: 5 },
};

interface Act {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  difficulty: Difficulty;
  rows: ExploreRow[];
}

const actsData: Act[] = [
  {
    id: 'act1', number: 1, difficulty: 'beginner',
    title: 'The Ancient World',
    subtitle: 'Mesopotamia, Egypt & Early Civilizations (3500–600 BCE)',
    rows: [
      { nodes: [{ id: 'n1', title: 'Mesopotamia', type: 'lesson', status: 'completed', x: 50, y: 0, icon: '🏺' }] },
      { nodes: [{ id: 'n2', title: 'Hammurabi', type: 'story', status: 'completed', x: 50, y: 1, icon: '📜' }] },
      { nodes: [{ id: 'n3', title: 'Egypt', type: 'lesson', status: 'completed', x: 50, y: 2, icon: '🔺' }] },
      {
        isBranch: true,
        nodes: [
          { id: 'n4a', title: 'Latin Origins', type: 'language', status: 'current', x: 30, y: 3, icon: '🗣️' },
          { id: 'n4b', title: 'Greek Thought', type: 'lesson', status: 'current', x: 70, y: 3, icon: '🏛️' },
        ],
      },
      { nodes: [{ id: 'n5', title: 'Battle Trivia', type: 'game', status: 'locked', x: 50, y: 4, icon: '⚔️' }] },
      {
        isBranch: true,
        nodes: [
          { id: 'n6a', title: 'Rise of Rome', type: 'lesson', status: 'locked', x: 25, y: 5, icon: '🐺' },
          { id: 'n6b', title: 'Persian Empire', type: 'lesson', status: 'locked', x: 50, y: 5, icon: '🦁' },
          { id: 'n6c', title: 'Roman Tongue', type: 'language', status: 'locked', x: 75, y: 5, icon: '📖' },
        ],
      },
      { nodes: [{ id: 'n7', title: 'Ancient Boss', type: 'game', status: 'locked', x: 50, y: 6, icon: '👑' }] },
    ],
  },
  {
    id: 'act2', number: 2, difficulty: 'beginner',
    title: 'Classical Empires',
    subtitle: 'Greece, Rome, Han China & Maurya (600 BCE–476 CE)',
    rows: [
      { nodes: [{ id: 'a2n1', title: 'Athenian Democracy', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🏛️' }] },
      { nodes: [{ id: 'a2n2', title: 'Spartan Warriors', type: 'story', status: 'locked', x: 50, y: 1, icon: '⚔️' }] },
      { isBranch: true, nodes: [
        { id: 'a2n3a', title: 'Greek Myths', type: 'story', status: 'locked', x: 30, y: 2, icon: '⚡' },
        { id: 'a2n3b', title: 'Roman Republic', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '🐺' },
      ]},
      { nodes: [{ id: 'a2n4', title: 'Julius Caesar', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '🗡️' }] },
      { nodes: [{ id: 'a2n5', title: 'Latin Roots', type: 'language', status: 'locked', x: 50, y: 4, icon: '📖' }] },
      { isBranch: true, nodes: [
        { id: 'a2n6a', title: 'Han Dynasty', type: 'lesson', status: 'locked', x: 30, y: 5, icon: '🐉' },
        { id: 'a2n6b', title: 'Maurya Empire', type: 'lesson', status: 'locked', x: 70, y: 5, icon: '🐘' },
      ]},
      { nodes: [{ id: 'a2n7', title: 'Empire Trivia', type: 'game', status: 'locked', x: 50, y: 6, icon: '🎯' }] },
      { nodes: [{ id: 'a2n8', title: 'Classical Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act3', number: 3, difficulty: 'beginner',
    title: 'The Post-Classical World',
    subtitle: 'Byzantium, Islam & the Silk Roads (500–1200)',
    rows: [
      { nodes: [{ id: 'a3n1', title: 'Fall of Rome', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🏚️' }] },
      { nodes: [{ id: 'a3n2', title: 'Byzantine Empire', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '☦️' }] },
      { nodes: [{ id: 'a3n3', title: 'Rise of Islam', type: 'lesson', status: 'locked', x: 50, y: 2, icon: '☪️' }] },
      { isBranch: true, nodes: [
        { id: 'a3n4a', title: 'Silk Road Trade', type: 'story', status: 'locked', x: 30, y: 3, icon: '🐪' },
        { id: 'a3n4b', title: 'Viking Voyages', type: 'story', status: 'locked', x: 70, y: 3, icon: '⛵' },
      ]},
      { nodes: [{ id: 'a3n5', title: 'Arabic Words', type: 'language', status: 'locked', x: 50, y: 4, icon: '🗣️' }] },
      { nodes: [{ id: 'a3n6', title: 'Tang Dynasty', type: 'lesson', status: 'locked', x: 50, y: 5, icon: '🏯' }] },
      { nodes: [{ id: 'a3n7', title: 'Trade Routes Quiz', type: 'game', status: 'locked', x: 50, y: 6, icon: '🧭' }] },
      { nodes: [{ id: 'a3n8', title: 'Post-Classical Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act4', number: 4, difficulty: 'intermediate',
    title: 'Medieval Europe & the Mongols',
    subtitle: 'Feudalism, Crusades & Genghis Khan (1200–1450)',
    rows: [
      { nodes: [{ id: 'a4n1', title: 'Feudal System', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🏰' }] },
      { nodes: [{ id: 'a4n2', title: 'The Crusades', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '⚔️' }] },
      { isBranch: true, nodes: [
        { id: 'a4n3a', title: 'Knights Templar', type: 'story', status: 'locked', x: 30, y: 2, icon: '🛡️' },
        { id: 'a4n3b', title: 'Genghis Khan', type: 'story', status: 'locked', x: 70, y: 2, icon: '🏹' },
      ]},
      { nodes: [{ id: 'a4n4', title: 'Black Death', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '💀' }] },
      { nodes: [{ id: 'a4n5', title: 'Old English', type: 'language', status: 'locked', x: 50, y: 4, icon: '📜' }] },
      { nodes: [{ id: 'a4n6', title: 'Magna Carta', type: 'story', status: 'locked', x: 50, y: 5, icon: '📋' }] },
      { nodes: [{ id: 'a4n7', title: 'Castle Defense', type: 'game', status: 'locked', x: 50, y: 6, icon: '🏰' }] },
      { nodes: [{ id: 'a4n8', title: 'Medieval Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act5', number: 5, difficulty: 'intermediate',
    title: 'Renaissance & Reformation',
    subtitle: 'Art, Science & Religious Upheaval (1300–1600)',
    rows: [
      { nodes: [{ id: 'a5n1', title: 'Florence Rising', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🌸' }] },
      { nodes: [{ id: 'a5n2', title: 'Da Vinci', type: 'story', status: 'locked', x: 50, y: 1, icon: '🎨' }] },
      { isBranch: true, nodes: [
        { id: 'a5n3a', title: 'Michelangelo', type: 'story', status: 'locked', x: 30, y: 2, icon: '🗿' },
        { id: 'a5n3b', title: 'Gutenberg Press', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '📰' },
      ]},
      { nodes: [{ id: 'a5n4', title: 'Martin Luther', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '⛪' }] },
      { nodes: [{ id: 'a5n5', title: 'Italian Words', type: 'language', status: 'locked', x: 50, y: 4, icon: '🇮🇹' }] },
      { nodes: [{ id: 'a5n6', title: 'Scientific Method', type: 'lesson', status: 'locked', x: 50, y: 5, icon: '🔬' }] },
      { nodes: [{ id: 'a5n7', title: 'Art Match', type: 'game', status: 'locked', x: 50, y: 6, icon: '🖼️' }] },
      { nodes: [{ id: 'a5n8', title: 'Renaissance Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act6', number: 6, difficulty: 'intermediate',
    title: 'Age of Exploration',
    subtitle: 'Columbus, Colonialism & Global Trade (1450–1750)',
    rows: [
      { nodes: [{ id: 'a6n1', title: 'Columbus Sails', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '⛵' }] },
      { nodes: [{ id: 'a6n2', title: 'Magellan', type: 'story', status: 'locked', x: 50, y: 1, icon: '🌍' }] },
      { isBranch: true, nodes: [
        { id: 'a6n3a', title: 'Aztec Empire', type: 'lesson', status: 'locked', x: 30, y: 2, icon: '🦅' },
        { id: 'a6n3b', title: 'Inca Empire', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '🏔️' },
      ]},
      { nodes: [{ id: 'a6n4', title: 'Slave Trade', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '⛓️' }] },
      { nodes: [{ id: 'a6n5', title: 'Spanish Words', type: 'language', status: 'locked', x: 50, y: 4, icon: '🇪🇸' }] },
      { nodes: [{ id: 'a6n6', title: 'Spice Routes', type: 'story', status: 'locked', x: 50, y: 5, icon: '🧭' }] },
      { nodes: [{ id: 'a6n7', title: 'Map Challenge', type: 'game', status: 'locked', x: 50, y: 6, icon: '🗺️' }] },
      { nodes: [{ id: 'a6n8', title: 'Exploration Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act7', number: 7, difficulty: 'advanced',
    title: 'Enlightenment & Revolutions',
    subtitle: 'American, French & Haitian Revolutions (1650–1800)',
    rows: [
      { nodes: [{ id: 'a7n1', title: 'Age of Reason', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '💡' }] },
      { nodes: [{ id: 'a7n2', title: 'Voltaire & Locke', type: 'story', status: 'locked', x: 50, y: 1, icon: '📚' }] },
      { isBranch: true, nodes: [
        { id: 'a7n3a', title: 'American Revolution', type: 'lesson', status: 'locked', x: 30, y: 2, icon: '🦅' },
        { id: 'a7n3b', title: 'French Revolution', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '🇫🇷' },
      ]},
      { nodes: [{ id: 'a7n4', title: 'Haitian Revolution', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '✊' }] },
      { nodes: [{ id: 'a7n5', title: 'French Phrases', type: 'language', status: 'locked', x: 50, y: 4, icon: '🗣️' }] },
      { isBranch: true, nodes: [
        { id: 'a7n6a', title: 'Declaration of Rights', type: 'story', status: 'locked', x: 30, y: 5, icon: '📜' },
        { id: 'a7n6b', title: 'Napoleon Rises', type: 'story', status: 'locked', x: 70, y: 5, icon: '🎖️' },
      ]},
      { nodes: [{ id: 'a7n7', title: 'Revolution Quiz', type: 'game', status: 'locked', x: 50, y: 6, icon: '🎯' }] },
      { nodes: [{ id: 'a7n8', title: 'Revolution Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act8', number: 8, difficulty: 'advanced',
    title: 'Industrial Revolution',
    subtitle: 'Factories, Railroads & Urbanization (1760–1900)',
    rows: [
      { nodes: [{ id: 'a8n1', title: 'Steam Power', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🚂' }] },
      { nodes: [{ id: 'a8n2', title: 'Factory Life', type: 'story', status: 'locked', x: 50, y: 1, icon: '🏭' }] },
      { nodes: [{ id: 'a8n3', title: 'Child Labor', type: 'lesson', status: 'locked', x: 50, y: 2, icon: '👧' }] },
      { isBranch: true, nodes: [
        { id: 'a8n4a', title: 'Telegraph', type: 'lesson', status: 'locked', x: 30, y: 3, icon: '📡' },
        { id: 'a8n4b', title: 'Railways', type: 'lesson', status: 'locked', x: 70, y: 3, icon: '🛤️' },
      ]},
      { nodes: [{ id: 'a8n5', title: 'Industrial Terms', type: 'language', status: 'locked', x: 50, y: 4, icon: '⚙️' }] },
      { nodes: [{ id: 'a8n6', title: 'Darwin & Evolution', type: 'story', status: 'locked', x: 50, y: 5, icon: '🧬' }] },
      { nodes: [{ id: 'a8n7', title: 'Invention Match', type: 'game', status: 'locked', x: 50, y: 6, icon: '💡' }] },
      { nodes: [{ id: 'a8n8', title: 'Industrial Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act9', number: 9, difficulty: 'advanced',
    title: 'Imperialism & Nationalism',
    subtitle: 'Scramble for Africa, Meiji Japan & Unifications (1800–1914)',
    rows: [
      { nodes: [{ id: 'a9n1', title: 'Scramble for Africa', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🌍' }] },
      { nodes: [{ id: 'a9n2', title: 'Meiji Restoration', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '🇯🇵' }] },
      { isBranch: true, nodes: [
        { id: 'a9n3a', title: 'German Unification', type: 'lesson', status: 'locked', x: 30, y: 2, icon: '🇩🇪' },
        { id: 'a9n3b', title: 'Italian Unification', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '🇮🇹' },
      ]},
      { nodes: [{ id: 'a9n4', title: 'Opium Wars', type: 'story', status: 'locked', x: 50, y: 3, icon: '🚢' }] },
      { nodes: [{ id: 'a9n5', title: 'Colonial Terms', type: 'language', status: 'locked', x: 50, y: 4, icon: '📖' }] },
      { nodes: [{ id: 'a9n6', title: 'Zulu Kingdom', type: 'story', status: 'locked', x: 50, y: 5, icon: '🛡️' }] },
      { nodes: [{ id: 'a9n7', title: 'Empire Builder', type: 'game', status: 'locked', x: 50, y: 6, icon: '🗺️' }] },
      { nodes: [{ id: 'a9n8', title: 'Imperialism Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act10', number: 10, difficulty: 'expert',
    title: 'World War I & Interwar Period',
    subtitle: 'Trenches, Treaties & the Roaring Twenties (1914–1939)',
    rows: [
      { nodes: [{ id: 'a10n1', title: 'Assassination', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🔫' }] },
      { nodes: [{ id: 'a10n2', title: 'Trench Warfare', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '🪖' }] },
      { isBranch: true, nodes: [
        { id: 'a10n3a', title: 'Western Front', type: 'story', status: 'locked', x: 30, y: 2, icon: '🇫🇷' },
        { id: 'a10n3b', title: 'Eastern Front', type: 'story', status: 'locked', x: 70, y: 2, icon: '🇷🇺' },
      ]},
      { nodes: [{ id: 'a10n4', title: 'Treaty of Versailles', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '📋' }] },
      { nodes: [{ id: 'a10n5', title: 'Military Terms', type: 'language', status: 'locked', x: 50, y: 4, icon: '🎖️' }] },
      { nodes: [{ id: 'a10n6', title: 'Roaring Twenties', type: 'story', status: 'locked', x: 50, y: 5, icon: '🎷' }] },
      { nodes: [{ id: 'a10n7', title: 'Great Depression', type: 'lesson', status: 'locked', x: 50, y: 6, icon: '📉' }] },
      { nodes: [{ id: 'a10n8', title: 'WWI Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act11', number: 11, difficulty: 'expert',
    title: 'World War II & the Holocaust',
    subtitle: 'Global Conflict & Atomic Age (1939–1945)',
    rows: [
      { nodes: [{ id: 'a11n1', title: 'Rise of Fascism', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '⚠️' }] },
      { nodes: [{ id: 'a11n2', title: 'Blitzkrieg', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '⚡' }] },
      { isBranch: true, nodes: [
        { id: 'a11n3a', title: 'D-Day', type: 'story', status: 'locked', x: 30, y: 2, icon: '🏖️' },
        { id: 'a11n3b', title: 'Stalingrad', type: 'story', status: 'locked', x: 70, y: 2, icon: '❄️' },
      ]},
      { nodes: [{ id: 'a11n4', title: 'The Holocaust', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '🕯️' }] },
      { nodes: [{ id: 'a11n5', title: 'Code Breakers', type: 'story', status: 'locked', x: 50, y: 4, icon: '🔐' }] },
      { isBranch: true, nodes: [
        { id: 'a11n6a', title: 'Pacific Theater', type: 'lesson', status: 'locked', x: 30, y: 5, icon: '🌊' },
        { id: 'a11n6b', title: 'Hiroshima', type: 'lesson', status: 'locked', x: 70, y: 5, icon: '☢️' },
      ]},
      { nodes: [{ id: 'a11n7', title: 'War Strategy', type: 'game', status: 'locked', x: 50, y: 6, icon: '🎯' }] },
      { nodes: [{ id: 'a11n8', title: 'WWII Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act12', number: 12, difficulty: 'expert',
    title: 'Cold War & Decolonization',
    subtitle: 'Superpowers, Proxy Wars & New Nations (1945–1991)',
    rows: [
      { nodes: [{ id: 'a12n1', title: 'Iron Curtain', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🧊' }] },
      { nodes: [{ id: 'a12n2', title: 'Space Race', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '🚀' }] },
      { isBranch: true, nodes: [
        { id: 'a12n3a', title: 'Cuban Missile Crisis', type: 'story', status: 'locked', x: 30, y: 2, icon: '☢️' },
        { id: 'a12n3b', title: 'Vietnam War', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '🌿' },
      ]},
      { nodes: [{ id: 'a12n4', title: 'African Independence', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '✊' }] },
      { nodes: [{ id: 'a12n5', title: 'Cold War Jargon', type: 'language', status: 'locked', x: 50, y: 4, icon: '🕵️' }] },
      { nodes: [{ id: 'a12n6', title: 'Berlin Wall Falls', type: 'story', status: 'locked', x: 50, y: 5, icon: '🧱' }] },
      { nodes: [{ id: 'a12n7', title: 'Spy Trivia', type: 'game', status: 'locked', x: 50, y: 6, icon: '🔍' }] },
      { nodes: [{ id: 'a12n8', title: 'Cold War Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act13', number: 13, difficulty: 'scholar',
    title: 'Civil Rights & Social Movements',
    subtitle: 'Equality, Protest & Cultural Change (1950–1980)',
    rows: [
      { nodes: [{ id: 'a13n1', title: 'Rosa Parks', type: 'story', status: 'locked', x: 50, y: 0, icon: '🚌' }] },
      { nodes: [{ id: 'a13n2', title: 'MLK Jr.', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '✊' }] },
      { isBranch: true, nodes: [
        { id: 'a13n3a', title: 'Apartheid', type: 'lesson', status: 'locked', x: 30, y: 2, icon: '🇿🇦' },
        { id: 'a13n3b', title: 'Women\'s Liberation', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '♀️' },
      ]},
      { nodes: [{ id: 'a13n4', title: 'Stonewall', type: 'story', status: 'locked', x: 50, y: 3, icon: '🏳️‍🌈' }] },
      { nodes: [{ id: 'a13n5', title: 'Protest Songs', type: 'language', status: 'locked', x: 50, y: 4, icon: '🎵' }] },
      { nodes: [{ id: 'a13n6', title: 'Gandhi\'s Legacy', type: 'story', status: 'locked', x: 50, y: 5, icon: '🕊️' }] },
      { nodes: [{ id: 'a13n7', title: 'March to Freedom', type: 'game', status: 'locked', x: 50, y: 6, icon: '🎯' }] },
      { nodes: [{ id: 'a13n8', title: 'Civil Rights Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act14', number: 14, difficulty: 'scholar',
    title: 'Globalization & the Digital Age',
    subtitle: 'Internet, 9/11 & the Connected World (1991–2010)',
    rows: [
      { nodes: [{ id: 'a14n1', title: 'Fall of the USSR', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🇷🇺' }] },
      { nodes: [{ id: 'a14n2', title: 'World Wide Web', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '🌐' }] },
      { isBranch: true, nodes: [
        { id: 'a14n3a', title: 'EU Formation', type: 'lesson', status: 'locked', x: 30, y: 2, icon: '🇪🇺' },
        { id: 'a14n3b', title: 'Rwandan Genocide', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '🕯️' },
      ]},
      { nodes: [{ id: 'a14n4', title: '9/11 & Aftermath', type: 'lesson', status: 'locked', x: 50, y: 3, icon: '🏙️' }] },
      { nodes: [{ id: 'a14n5', title: 'Tech Vocabulary', type: 'language', status: 'locked', x: 50, y: 4, icon: '💻' }] },
      { nodes: [{ id: 'a14n6', title: 'Arab Spring', type: 'story', status: 'locked', x: 50, y: 5, icon: '📱' }] },
      { nodes: [{ id: 'a14n7', title: 'Timeline Challenge', type: 'game', status: 'locked', x: 50, y: 6, icon: '⏱️' }] },
      { nodes: [{ id: 'a14n8', title: 'Digital Age Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
  {
    id: 'act15', number: 15, difficulty: 'scholar',
    title: 'The Modern Era',
    subtitle: 'Climate, AI & the World Today (2010–Present)',
    rows: [
      { nodes: [{ id: 'a15n1', title: 'Climate Crisis', type: 'lesson', status: 'locked', x: 50, y: 0, icon: '🌡️' }] },
      { nodes: [{ id: 'a15n2', title: 'Rise of AI', type: 'lesson', status: 'locked', x: 50, y: 1, icon: '🤖' }] },
      { isBranch: true, nodes: [
        { id: 'a15n3a', title: 'COVID Pandemic', type: 'lesson', status: 'locked', x: 30, y: 2, icon: '😷' },
        { id: 'a15n3b', title: 'Social Media Age', type: 'lesson', status: 'locked', x: 70, y: 2, icon: '📲' },
      ]},
      { nodes: [{ id: 'a15n4', title: 'Space Exploration', type: 'story', status: 'locked', x: 50, y: 3, icon: '🚀' }] },
      { nodes: [{ id: 'a15n5', title: 'Modern Jargon', type: 'language', status: 'locked', x: 50, y: 4, icon: '💬' }] },
      { nodes: [{ id: 'a15n6', title: 'Democracy Today', type: 'lesson', status: 'locked', x: 50, y: 5, icon: '🗳️' }] },
      { nodes: [{ id: 'a15n7', title: 'Future Forecast', type: 'game', status: 'locked', x: 50, y: 6, icon: '🔮' }] },
      { nodes: [{ id: 'a15n8', title: 'Final Boss', type: 'game', status: 'locked', x: 50, y: 7, icon: '👑' }] },
    ],
  },
];

const NODE_TYPE_ICONS: Record<string, React.ElementType> = {
  lesson: BookOpen,
  story: Play,
  language: Brain,
  game: Gamepad2,
};

const NODE_SIZE = 64;
const CURRENT_NODE_SIZE = 72;

// --- Era color helpers ---
function getActEraColor(actNumber: number): string {
  if (actNumber <= 3) return 'hsl(var(--primary))';
  if (actNumber <= 6) return 'hsl(var(--secondary))';
  if (actNumber <= 9) return 'hsl(28, 90%, 55%)';
  if (actNumber <= 12) return 'hsl(var(--destructive))';
  return 'hsl(var(--success))';
}

function getActEraLabel(actNumber: number): string {
  if (actNumber <= 3) return 'Ancient';
  if (actNumber <= 6) return 'Medieval';
  if (actNumber <= 9) return 'Revolution';
  if (actNumber <= 12) return 'Modern Wars';
  return 'Contemporary';
}

// --- Act Select View ---
function ActSelectView({ onSelectAct }: { onSelectAct: (act: Act) => void }) {
  const { user, getRank, nodeMastery, getNodeMastery } = useApp();

  const rank = getRank(user.xp);
  const rankInfo = getNextRankXP(user.xp);
  const xpProgress = rankInfo.next
    ? Math.round(((user.xp - rankInfo.current) / (rankInfo.threshold - rankInfo.current)) * 100)
    : 100;

  function getActMasteryStats(act: Act) {
    const allNodes = act.rows.flatMap(r => r.nodes);
    const played = allNodes.filter(n => getNodeMastery(n.id) !== 'unplayed').length;
    const crowned = allNodes.filter(n => getNodeMastery(n.id) === 'crowned').length;
    return { played, crowned, total: allNodes.length };
  }

  function getActHostTeaser(act: Act): { name: string; quote: string } | null {
    const levels = allLevelsByAct[act.id];
    if (!levels || levels.length === 0) return null;
    return { name: levels[0].hostName, quote: levels[0].hostQuote };
  }

  function getInProgressAct(): Act | null {
    for (const act of actsData) {
      const { played, total } = getActMasteryStats(act);
      if (played > 0 && played < total) return act;
    }
    return null;
  }

  function isActLocked(act: Act): boolean {
    if (act.number === 1) return false;
    const prevAct = actsData.find(a => a.number === act.number - 1);
    if (!prevAct) return false;
    const { crowned } = getActMasteryStats(prevAct);
    return crowned === 0;
  }

  function getNextNodeTitle(act: Act): string {
    const levels = allLevelsByAct[act.id];
    if (!levels || levels.length === 0) return 'Level 1';
    const { played } = getActMasteryStats(act);
    return levels[Math.min(played, levels.length - 1)]?.title ?? 'Next Level';
  }

  const allUnplayed = Object.keys(nodeMastery).length === 0;
  const inProgressAct = getInProgressAct();

  return (
    <div className="pb-28">
      {/* ── Story Mode Hero Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-4 mt-5 mb-5 rounded-xl overflow-hidden border border-primary/30"
        style={{
          background: 'linear-gradient(135deg, hsl(0 0% 6%) 0%, hsl(0 0% 9%) 100%)',
          boxShadow: '0 0 40px hsl(53 91% 65% / 0.08)',
        }}
      >
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")', backgroundSize: '128px' }}
        />
        <div className="px-5 pt-4 pb-5 relative">
          <p className="text-[9px] uppercase tracking-[0.35em] font-bold text-primary/70 font-mono">Story Mode</p>
          <h1 className="font-display text-[26px] font-black tracking-wide uppercase leading-none mt-1">Your Campaign</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <span className="text-foreground font-semibold">{user.xp.toLocaleString()} XP</span>
            <span className="opacity-30">·</span>
            <span className="text-primary font-semibold">{rank}</span>
            <span className="opacity-30">·</span>
            <span className="flex items-center gap-1">
              <Flame size={11} className="text-orange-400" />
              <span className="font-semibold">{user.streak}</span>
            </span>
          </div>
          {rankInfo.next && (
            <div className="mt-3">
              <div className="flex justify-between text-[9px] text-muted-foreground mb-1">
                <span>{rank}</span>
                <span className="text-primary/70">{rankInfo.next}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-border overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground mt-1 text-right">
                {user.xp - rankInfo.current} / {rankInfo.threshold - rankInfo.current} XP to {rankInfo.next}
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── First-Time Onboarding ── */}
      {allUnplayed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mx-4 mb-6 rounded-xl border border-primary/30 bg-card p-6 text-center"
        >
          <div className="text-4xl mb-3">🏛</div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide">Begin Your Historical Journey</h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Start with the Ancient World and work your way through 15 eras of history.
          </p>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectAct(actsData[0])}
            className="mt-4 inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-6 py-2.5 rounded-lg"
          >
            Start Act I <ChevronRight size={16} />
          </motion.button>
        </motion.div>
      )}

      {/* ── Continue Campaign Banner ── */}
      {!allUnplayed && inProgressAct && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="px-4 mb-4"
        >
          <motion.button
            onClick={() => onSelectAct(inProgressAct)}
            className="w-full text-left rounded-xl border-2 p-4 relative overflow-hidden"
            style={{ background: 'hsl(0 0% 6%)' }}
            animate={{ borderColor: ['hsl(53 91% 65% / 0.2)', 'hsl(53 91% 65% / 0.7)', 'hsl(53 91% 65% / 0.2)'] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            whileTap={{ scale: 0.985 }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, hsl(53 91% 65% / 0.06) 0%, transparent 70%)' }} />
            <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-primary font-mono">Continue Where You Left Off</p>
            <div className="flex items-center justify-between mt-1.5">
              <div>
                <p className="font-display text-sm font-black uppercase tracking-wide">
                  Act {inProgressAct.number} — {inProgressAct.title}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">Next: {getNextNodeTitle(inProgressAct)}</p>
              </div>
              <span className="text-xs font-bold flex items-center gap-1 text-primary">Resume <ChevronRight size={14} /></span>
            </div>
          </motion.button>
        </motion.div>
      )}

      {/* ── Act List ── */}
      <div className="space-y-3 px-4">
        {actsData.map((act, i) => {
          const { played, crowned, total } = getActMasteryStats(act);
          const locked = isActLocked(act);
          const eraColor = getActEraColor(act.number);
          const diff = DIFFICULTY_CONFIG[act.difficulty];
          const hostTeaser = getActHostTeaser(act);
          const progressPct = total > 0 ? (played / total) * 100 : 0;
          const hasProgress = played > 0;

          return (
            <motion.div
              key={act.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <motion.button
                onClick={() => !locked && onSelectAct(act)}
                disabled={locked}
                whileTap={!locked ? { scale: 0.985 } : undefined}
                className="w-full text-left rounded-xl border bg-card overflow-hidden relative transition-all duration-300"
                style={{
                  borderColor: hasProgress ? `${eraColor.slice(0, -1)} / 0.45)` : 'hsl(var(--border))',
                  borderLeftWidth: '4px',
                  borderLeftColor: locked ? 'hsl(var(--border))' : eraColor,
                  opacity: locked ? 0.55 : 1,
                  filter: locked ? 'blur(0.3px)' : 'none',
                  boxShadow: hasProgress && !locked ? `0 4px 20px ${eraColor.slice(0, -1)} / 0.1)` : 'none',
                }}
              >
                <div className="p-4">
                  {/* Act header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 mb-1.5">
                        <p className="font-display text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Act {act.number}
                        </p>
                        <span className="text-border/60 text-xs">·</span>
                        <span className="text-[9px] uppercase tracking-[0.15em] font-bold" style={{ color: locked ? 'hsl(var(--muted-foreground))' : eraColor }}>
                          {getActEraLabel(act.number)}
                        </span>
                        <span className="text-border/60 text-xs">·</span>
                        <span className={`text-[9px] uppercase tracking-wider font-bold ${diff.color} flex items-center gap-0.5`}>
                          <Signal size={9} />{diff.label}
                        </span>
                      </div>

                      {/* Ornamental divider */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-px" style={{ background: `linear-gradient(to right, ${locked ? 'hsl(var(--border))' : eraColor.slice(0, -1)} / 0.4)}, transparent)` }} />
                        <span className="text-[8px] opacity-50" style={{ color: locked ? 'hsl(var(--border))' : eraColor }}>◆</span>
                      </div>

                      <h2 className="font-display text-[15px] font-black uppercase tracking-wide leading-tight">{act.title}</h2>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-snug line-clamp-1">{act.subtitle}</p>
                    </div>

                    {/* Right badge */}
                    <div className="flex flex-col items-center gap-0.5 ml-2 mt-0.5 shrink-0">
                      {locked ? (
                        <div className="w-8 h-8 rounded-full bg-border/30 flex items-center justify-center">
                          <Lock size={14} className="text-muted-foreground" />
                        </div>
                      ) : crowned > 0 ? (
                        <div className="flex flex-col items-center gap-0.5">
                          <Crown size={16} style={{ color: eraColor }} />
                          <span className="text-[9px] font-bold" style={{ color: eraColor }}>{crowned}</span>
                        </div>
                      ) : hasProgress ? (
                        <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: eraColor, color: eraColor }}>
                          {played}
                        </div>
                      ) : (
                        <Scroll size={16} className="text-muted-foreground/40" />
                      )}
                    </div>
                  </div>

                  {/* Host teaser */}
                  {hostTeaser && !locked && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.18 + i * 0.04 }}
                      className="mt-2.5 pl-3 border-l-2 border-border/40"
                    >
                      <p className="text-[9px] uppercase tracking-[0.12em] font-bold text-muted-foreground/50">Host: {hostTeaser.name}</p>
                      <p className="text-sm text-muted-foreground/70 italic leading-snug mt-0.5 line-clamp-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                        "{hostTeaser.quote}"
                      </p>
                    </motion.div>
                  )}

                  {locked && (
                    <p className="text-xs text-muted-foreground/50 mt-2 flex items-center gap-1">
                      <Lock size={9} /> Complete Act {act.number - 1} to unlock
                    </p>
                  )}

                  {/* Progress + CTA */}
                  {!locked && (
                    <div className="mt-3">
                      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: eraColor }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPct}%` }}
                          transition={{ delay: 0.3 + i * 0.04, duration: 0.7, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                          <span>{played} of {total} played</span>
                          {crowned > 0 && (
                            <>
                              <span className="opacity-40">·</span>
                              <span className="flex items-center gap-0.5" style={{ color: eraColor }}>
                                <Crown size={8} /> {crowned} Crowned
                              </span>
                            </>
                          )}
                        </div>
                        <span className="text-xs font-bold flex items-center gap-1" style={{ color: eraColor }}>
                          {hasProgress ? 'Continue' : 'Start'} <ChevronRight size={13} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// --- Mastery color/icon helpers ---
function getMasteryRing(mastery: MasteryState) {
  if (mastery === 'crowned')  return 'border-[3px] border-primary bg-primary/20';
  if (mastery === 'mastered') return 'border-[3px] border-secondary bg-secondary/10';
  if (mastery === 'accurate') return 'border-2 border-primary/60 bg-primary/5';
  if (mastery === 'played')   return 'border-2 border-muted-foreground/50 bg-card';
  return '';
}

// --- Single Node ---
function NodeCircle({ node, mastery, onTap }: { node: ExploreNode; mastery: MasteryState; onTap: (node: ExploreNode) => void }) {
  const isBossNode = node.icon === '👑' || node.type === 'game' && node.title.toLowerCase().includes('boss');
  const completed = node.status === 'completed' || mastery !== 'unplayed';
  const current = node.status === 'current';
  const locked = node.status === 'locked';
  const size = current ? CURRENT_NODE_SIZE : NODE_SIZE;
  const TypeIcon = NODE_TYPE_ICONS[node.type];

  const ringClass = mastery !== 'unplayed' && mastery !== 'played'
    ? getMasteryRing(mastery)
    : completed
    ? 'bg-primary'
    : current
    ? 'bg-primary/10 border-[3px] border-primary'
    : 'bg-card border-2 border-border/40';

  return (
    <motion.button
      disabled={locked}
      onClick={() => onTap(node)}
      className={`relative flex flex-col items-center group ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={!locked ? { scale: 1.1 } : undefined}
      whileTap={!locked ? { scale: 0.92 } : undefined}
    >
      {/* Boss ring */}
      {isBossNode && !locked && (
        <motion.div
          className="absolute inset-[-6px] rounded-full border-2 border-destructive/60"
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      )}

      <div
        className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${ringClass}`}
        style={{
          width: size,
          height: size,
          opacity: locked ? 0.55 : 1,
          boxShadow: mastery === 'crowned'
            ? '0 0 24px hsl(53, 91%, 65%, 0.5)'
            : current
            ? '0 0 30px hsl(53, 91%, 65%, 0.3)'
            : 'none',
        }}
      >
        {current && (
          <motion.div
            className="absolute inset-[-8px] rounded-full border-2 border-primary"
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          />
        )}
        {mastery === 'crowned' ? (
          <Crown size={26} className="text-primary" />
        ) : mastery === 'mastered' ? (
          <Check size={26} className="text-secondary" strokeWidth={3} />
        ) : mastery === 'accurate' || mastery === 'played' ? (
          <span className="text-[26px] leading-none select-none">{node.icon}</span>
        ) : locked ? (
          <Lock size={22} className="text-muted-foreground" />
        ) : isBossNode ? (
          <Sword size={26} className="text-destructive" />
        ) : (
          <span className="text-[28px] leading-none select-none">{node.icon}</span>
        )}
      </div>

      {current && mastery === 'unplayed' && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
        >
          Start
        </motion.div>
      )}

      {mastery !== 'unplayed' && (
        <div className="mt-1.5 flex items-center gap-0.5">
          {['played','accurate','mastered','crowned'].map((m, i) => (
            <div
              key={m}
              className={`w-1 h-1 rounded-full ${
                ['played','accurate','mastered','crowned'].indexOf(mastery) >= i
                  ? 'bg-primary'
                  : 'bg-border'
              }`}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1 mt-1">
        {TypeIcon && !locked && (
          <TypeIcon
            size={10}
            className={current ? 'text-primary' : completed ? 'text-foreground/60' : 'text-foreground/40'}
          />
        )}
        <span
          className={`text-sm font-semibold leading-tight text-center max-w-[90px] ${
            locked
              ? 'text-muted-foreground/60'
              : mastery === 'crowned'
              ? 'text-primary'
              : current
              ? 'text-primary'
              : 'text-foreground/70'
          }`}
        >
          {node.title}
        </span>
      </div>
    </motion.button>
  );
}

// --- Node Board View ---
const ZIGZAG_OFFSETS = [0, -35, -55, -35, 0, 35, 55, 35];

function NodeBoardView({ act, onBack }: { act: Act; onBack: () => void }) {
  const { getNodeMastery, setNodeMastery, addXP } = useApp();
  const [activeLevelFlow, setActiveLevelFlow] = useState<{ nodeId: string; levelIdx: number } | null>(null);

  const allNodes = act.rows.flatMap(r => r.nodes);
  const masteryCount = allNodes.filter(n => getNodeMastery(n.id) !== 'unplayed').length;

  const levels = allLevelsByAct[act.id] ?? [];

  const handleNodeClick = (node: ExploreNode) => {
    if (node.status === 'locked') return;
    // Find a level for this node (cycle through levels by node index)
    const nodeIdx = allNodes.findIndex(n => n.id === node.id);
    const levelIdx = nodeIdx % levels.length;
    setActiveLevelFlow({ nodeId: node.id, levelIdx });
  };

  const handleLevelComplete = (nodeId: string, mastery: import('@/types').MasteryState, xpEarned: number) => {
    setNodeMastery(nodeId, mastery);
  };

  const activeLevel = activeLevelFlow !== null ? levels[activeLevelFlow.levelIdx] : null;

  return (
    <>
      <div className="pb-28 overflow-x-hidden">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4 pb-4 px-4"
        >
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ChevronLeft size={16} />
            <span>All Acts</span>
          </button>
          <div className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] font-bold text-muted-foreground">
              Act {act.number}
            </p>
            <h1 className="font-editorial text-[22px] font-bold leading-tight mt-1">{act.title}</h1>
            <p className="text-xs text-muted-foreground mt-1.5">
              <Crown size={12} className="inline text-primary mr-1 -mt-0.5" />
              {masteryCount} of {allNodes.length} played
            </p>
          </div>
        </motion.div>

        {/* Path with branches */}
        <div className="flex flex-col items-center gap-0 pt-4 px-4">
          {act.rows.map((row, rowIdx) => {
            const isBranch = row.isBranch && row.nodes.length > 1;

            if (isBranch) {
              const hasCurrent = row.nodes.some(n => n.status === 'current');
              return (
                <motion.div
                  key={`row-${rowIdx}`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: rowIdx * 0.07, type: 'spring', stiffness: 280, damping: 20 }}
                  className="flex flex-col items-center mb-16"
                >
                  {hasCurrent && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-xs uppercase tracking-[0.2em] font-bold text-primary mb-4"
                    >
                      Choose your path
                    </motion.p>
                  )}
                  <div className="flex items-start justify-center gap-6">
                    {row.nodes.map((node) => (
                      <NodeCircle key={node.id} node={node} mastery={getNodeMastery(node.id)} onTap={handleNodeClick} />
                    ))}
                  </div>
                </motion.div>
              );
            }

            const node = row.nodes[0];
            if (!node) return null;
            const offset = ZIGZAG_OFFSETS[rowIdx % ZIGZAG_OFFSETS.length];

            return (
              <motion.div
                key={`row-${rowIdx}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: rowIdx * 0.07, type: 'spring', stiffness: 280, damping: 20 }}
                className="flex flex-col items-center mb-16"
                style={{ transform: `translateX(${offset}px)` }}
              >
                <NodeCircle node={node} mastery={getNodeMastery(node.id)} onTap={handleNodeClick} />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Level Flow Overlay */}
      <AnimatePresence>
        {activeLevelFlow && activeLevel && (
          <LevelFlow
            key={activeLevelFlow.nodeId}
            level={activeLevel}
            actTitle={`Act ${act.number} — ${act.title}`}
            nodeId={activeLevelFlow.nodeId}
            onClose={() => setActiveLevelFlow(null)}
            onComplete={handleLevelComplete}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// --- Main Explore Tab ---
export function ExploreTab() {
  const [selectedAct, setSelectedAct] = useState<Act | null>(null);

  return (
    <AnimatePresence mode="wait">
      {selectedAct ? (
        <motion.div
          key="board"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
        >
          <NodeBoardView act={selectedAct} onBack={() => setSelectedAct(null)} />
        </motion.div>
      ) : (
        <motion.div
          key="select"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25 }}
        >
          <ActSelectView onSelectAct={setSelectedAct} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}


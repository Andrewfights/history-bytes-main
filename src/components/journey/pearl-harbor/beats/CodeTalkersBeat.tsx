/**
 * Beat 14: Code Talkers - The Navajo Secret
 * Format: Audio Vocabulary (Reusable type)
 * XP: 55 | Duration: 6-7 min
 *
 * Narrative: Learn about the unbreakable Navajo code and try speaking it.
 * Interactive pronunciation game with audio learning.
 *
 * This is a REUSABLE beat type: audio-vocabulary
 * Can be used for any language learning, pronunciation, or audio-based vocabulary.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Volume2, VolumeX, Mic, Check, X, Play, Pause, RefreshCw } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen =
  | 'pre-video'
  | 'intro'
  | 'code-war'
  | 'navajo-intro'
  | 'pronunciation-game'
  | 'iwo-jima'
  | 'reflection'
  | 'post-video'
  | 'completion';

const SCREENS: Screen[] = [
  'pre-video',
  'intro',
  'code-war',
  'navajo-intro',
  'pronunciation-game',
  'iwo-jima',
  'reflection',
  'post-video',
  'completion'
];

const LESSON_DATA = {
  id: 'ph-beat-11',
  xpReward: 55,
};

// Navajo vocabulary for the pronunciation game
interface NavajoWord {
  id: string;
  english: string;
  navajo: string;
  pronunciation: string;
  meaning: string;
  audioKey: string;
  category: 'military' | 'letter' | 'number';
}

const NAVAJO_WORDS: NavajoWord[] = [
  {
    id: 'fighter-plane',
    english: 'Fighter Plane',
    navajo: "Da-he-tih-hi",
    pronunciation: 'dah-heh-tih-hee',
    meaning: "Hummingbird (swift and agile)",
    audioKey: 'code-talkers-fighter-plane',
    category: 'military',
  },
  {
    id: 'bomber',
    english: 'Bomber',
    navajo: 'Jay-sho',
    pronunciation: 'jay-show',
    meaning: 'Buzzard (large bird that carries destruction)',
    audioKey: 'code-talkers-bomber',
    category: 'military',
  },
  {
    id: 'submarine',
    english: 'Submarine',
    navajo: 'Besh-lo',
    pronunciation: 'besh-low',
    meaning: 'Iron Fish',
    audioKey: 'code-talkers-submarine',
    category: 'military',
  },
  {
    id: 'battleship',
    english: 'Battleship',
    navajo: 'Lo-tso',
    pronunciation: 'low-tso',
    meaning: 'Whale (large and powerful)',
    audioKey: 'code-talkers-battleship',
    category: 'military',
  },
  {
    id: 'tank',
    english: 'Tank',
    navajo: 'Chay-da-gahi',
    pronunciation: 'chay-dah-gah-hee',
    meaning: 'Tortoise (armored and slow)',
    audioKey: 'code-talkers-tank',
    category: 'military',
  },
  {
    id: 'grenade',
    english: 'Grenade',
    navajo: 'Ni-ma-si',
    pronunciation: 'nee-mah-see',
    meaning: 'Potato (shape)',
    audioKey: 'code-talkers-grenade',
    category: 'military',
  },
  {
    id: 'america',
    english: 'America',
    navajo: 'Ne-he-mah',
    pronunciation: 'neh-heh-mah',
    meaning: 'Our Mother',
    audioKey: 'code-talkers-america',
    category: 'military',
  },
  {
    id: 'attack',
    english: 'Attack',
    navajo: 'Al-tah-je-jay',
    pronunciation: 'al-tah-jeh-jay',
    meaning: 'Strike or assault',
    audioKey: 'code-talkers-attack',
    category: 'military',
  },
  {
    id: 'victory',
    english: 'Victory',
    navajo: 'A-do-nee-jay',
    pronunciation: 'ah-doe-nee-jay',
    meaning: 'Success or triumph',
    audioKey: 'code-talkers-victory',
    category: 'military',
  },
];

// Historical facts about code talkers
const CODE_TALKER_FACTS = [
  'The Navajo code was never broken by the enemy during the war.',
  'About 400-500 Navajo Code Talkers served in the Marine Corps.',
  'Major Howard Connor said, "Were it not for the Navajos, the Marines would never have taken Iwo Jima."',
  'Code Talkers transmitted messages about tactics, troop movements, and orders.',
  'The program was kept classified until 1968.',
  'In 2001, the original 29 Code Talkers received Congressional Gold Medals.',
];

interface CodeTalkersBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function CodeTalkersBeat({ host, onComplete, onSkip, onBack, isPreview = false }: CodeTalkersBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  // Pronunciation game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [wordsLearned, setWordsLearned] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio URLs from Firestore
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  // Select a subset of words for the game
  const gameWords = NAVAJO_WORDS.slice(0, 6);
  const currentWord = gameWords[currentWordIndex];

  // Restore from checkpoint
  useEffect(() => {
    const checkpoint = getCheckpoint();
    if (checkpoint?.lessonId === LESSON_DATA.id && checkpoint.screen) {
      const savedScreen = checkpoint.screen as Screen;
      if (SCREENS.includes(savedScreen) && savedScreen !== 'completion') {
        setScreen(savedScreen);
      }
    }
  }, []);

  // Save checkpoint on screen change - only after config is loaded
  useEffect(() => {
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { wordsLearned: Array.from(wordsLearned), currentWordIndex },
      });
    }
  }, [hasLoadedConfig, screen, saveCheckpoint, wordsLearned, currentWordIndex]);

  // Subscribe to Firestore for assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      // Pre/Post module videos
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }

      const postModuleVideo = assets?.postModuleVideos?.[LESSON_DATA.id];
      if (postModuleVideo?.enabled && postModuleVideo?.videoUrl) {
        setPostModuleVideoConfig(postModuleVideo);
      } else {
        setPostModuleVideoConfig(null);
      }

      // Word pronunciation audio
      const vocabAssets = assets?.vocabularyAudio?.[LESSON_DATA.id];
      if (vocabAssets) {
        const urls: Record<string, string> = {};
        NAVAJO_WORDS.forEach(word => {
          if (vocabAssets[word.audioKey]) {
            urls[word.id] = vocabAssets[word.audioKey];
          }
        });
        setAudioUrls(urls);
      }

      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // Set initial screen based on pre-module video
  useEffect(() => {
    if (hasLoadedConfig && screen === 'intro') {
      const checkpoint = getCheckpoint();
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        setScreen('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview]);

  // Audio playback
  const playAudio = (wordId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const url = audioUrls[wordId];
    if (url) {
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const nextScreen = useCallback(() => {
    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextScreenIndex = currentIndex + 1;
      if (SCREENS[nextScreenIndex] === 'post-video' && !postModuleVideoConfig?.enabled) {
        nextScreenIndex++;
      }
      if (nextScreenIndex < SCREENS.length) {
        setScreen(SCREENS[nextScreenIndex]);
      } else {
        clearCheckpoint();
        onComplete(skipped ? 0 : LESSON_DATA.xpReward);
      }
    } else {
      clearCheckpoint();
      onComplete(skipped ? 0 : LESSON_DATA.xpReward);
    }
  }, [screen, skipped, clearCheckpoint, onComplete, postModuleVideoConfig]);

  const handleWordLearned = () => {
    setWordsLearned(prev => new Set(prev).add(currentWord.id));
    setShowAnswer(false);
    if (currentWordIndex < gameWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      nextScreen();
    }
  };

  const handleReplayWord = () => {
    playAudio(currentWord.id);
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Code Talkers</h1>
          <p className="text-white/50 text-xs">Beat 11 of 13</p>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-amber-500/20">
          <img src={host.imageUrl || '/assets/hosts/default.png'} alt={host.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Progress */}
      <div className="h-1 bg-white/10">
        <motion.div className="h-full bg-amber-500" animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Code Talkers"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full relative overflow-hidden">
              {/* Gold atmospheric background */}
              <div
                className="absolute inset-0 z-0"
                style={{
                  background: `
                    radial-gradient(ellipse at 50% 40%, rgba(230,171,42,0.1) 0%, transparent 55%),
                    radial-gradient(ellipse at 30% 80%, rgba(120,80,30,0.2) 0%, transparent 55%),
                    linear-gradient(180deg, #1a1208 0%, #0a0604 50%, #050302 100%)
                  `
                }}
              />

              {/* Gold light rays */}
              <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] z-[1] pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-px h-[260px] origin-top"
                    style={{
                      background: 'linear-gradient(180deg, rgba(230,171,42,0.15), transparent)',
                      transform: `translate(-50%, 0) rotate(${-30 + i * 12}deg)`
                    }}
                  />
                ))}
              </div>

              {/* Grain overlay */}
              <div className="absolute inset-0 z-[5] opacity-35 mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='ng'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.5 0 0 0 0 0.35 0 0 0 0 0.15 0 0 0 0.3 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23ng)'/%3E%3C/svg%3E")`
                }}
              />

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto relative z-10">
                <div className="flex flex-col items-center text-center px-6 py-8 min-h-full">
                  {/* Kick label */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2.5 mb-4"
                  >
                    <div className="w-6 h-px bg-ha-red" />
                    <span className="font-mono text-[10px] tracking-[0.4em] text-ha-red font-bold uppercase">
                      ◆ Scene · An Unbreakable Code
                    </span>
                    <div className="w-6 h-px bg-ha-red" />
                  </motion.div>

                  {/* Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-playfair italic text-[42px] sm:text-[54px] font-bold text-off-white leading-[0.95] tracking-tight mb-4"
                    style={{ textShadow: '0 4px 24px rgba(0,0,0,0.8)' }}
                  >
                    The <em className="text-gold">Navajo secret.</em>
                  </motion.h1>

                  {/* Subtitle */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="font-cormorant italic text-lg text-off-white/70 max-w-[520px] leading-relaxed mb-6"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}
                  >
                    In WWII, 420 Navajo Marines created a code no cryptographer could crack. Based on a language the Japanese had never heard. Not one message, across three years of fighting, was ever broken.
                  </motion.p>

                  {/* Cipher panel */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative w-full max-w-[480px] rounded p-5 sm:p-6 mb-6"
                    style={{
                      background: 'rgba(20,14,8,0.78)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(230,171,42,0.3)'
                    }}
                  >
                    {/* Gold top bar */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-dp via-gold-br to-gold-dp" />

                    {/* Header */}
                    <div className="flex justify-between items-center mb-3 font-mono text-[8.5px] tracking-[0.3em] text-off-white/50 uppercase font-bold">
                      <span>◆ Diné Bizaad · Cipher Preview</span>
                      <span
                        className="text-ha-red font-bold py-0.5 px-2 animate-pulse"
                        style={{
                          border: '1px solid rgba(205,14,20,0.35)',
                          background: 'rgba(205,14,20,0.08)'
                        }}
                      >
                        Classified until 1968
                      </span>
                    </div>

                    {/* Cipher rows */}
                    <div className="flex flex-col gap-2.5 mb-4">
                      {[
                        { en: 'Battleship', na: 'Lo-tso' },
                        { en: 'Submarine', na: 'Besh-lo' },
                        { en: 'Fighter Plane', na: 'Da-he-tih-hi' },
                        { en: 'America', na: 'Ne-he-mah' },
                      ].map((row, i) => (
                        <div key={i} className="grid grid-cols-[100px_16px_1fr] gap-3 items-center">
                          <span className="font-mono text-[11.5px] tracking-[0.15em] text-off-white/70 uppercase font-semibold text-right">{row.en}</span>
                          <span className="font-mono text-sm text-gold-dp text-center">→</span>
                          <span className="font-playfair italic text-[17px] text-gold font-bold text-left tracking-wide">{row.na}</span>
                        </div>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-dashed border-off-white/[0.08] flex justify-between font-mono text-[8px] tracking-[0.18em] text-off-white/50 uppercase font-semibold">
                      <span>◆ 211 Coded Terms</span>
                      <span className="text-gold font-bold">Never broken</span>
                    </div>
                  </motion.div>

                  {/* Quote */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="w-full max-w-[480px] rounded p-4 mb-4"
                    style={{
                      background: 'rgba(15,10,6,0.7)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(230,171,42,0.3)',
                      borderLeft: '3px solid var(--gold, #E6AB2A)'
                    }}
                  >
                    <p className="font-cormorant italic text-[17px] text-off-white leading-relaxed mb-2">
                      <span className="text-gold text-[26px] leading-none align-[-6px] mr-0.5">"</span>
                      Were it not for the Navajos, the Marines would never have taken Iwo Jima.
                      <span className="text-gold text-[26px] leading-none align-[-14px] ml-0.5">"</span>
                    </p>
                    <p className="font-mono text-[9px] tracking-[0.22em] text-gold uppercase font-bold text-right">
                      — Major Howard Connor · 5th Marine Div. Signal Officer
                    </p>
                  </motion.div>

                  {/* Spacer for scroll */}
                  <div className="h-8 flex-shrink-0" />
                </div>
              </div>

              {/* Bottom CTA - Fixed at bottom */}
              <div className="relative z-20 px-6 pb-6 pt-4 bg-gradient-to-t from-[#0a0604] via-[#0a0604]/95 to-transparent backdrop-blur-sm border-t border-off-white/[0.06] flex-shrink-0">
                <div className="flex flex-col items-center gap-3.5 max-w-sm mx-auto">
                  {/* CTA Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    onClick={nextScreen}
                    className="relative w-full py-4 bg-ha-red hover:bg-ha-red/90 text-off-white font-oswald text-[13px] font-bold uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-3"
                  >
                    {/* Corner brackets */}
                    <span className="absolute top-[-1px] left-[-1px] w-[11px] h-[11px] border-l-[1.5px] border-t-[1.5px] border-gold" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-[11px] h-[11px] border-r-[1.5px] border-b-[1.5px] border-gold" />
                    Learn the Code
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </motion.button>

                  {/* Skip link */}
                  <button
                    onClick={() => { setSkipped(true); onSkip(); }}
                    className="font-mono text-[9.5px] tracking-[0.28em] text-off-white/35 uppercase font-semibold hover:text-off-white/50 transition-colors py-1 px-2.5"
                  >
                    Skip this beat
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CODE WAR - Why codes mattered */}
          {screen === 'code-war' && (
            <motion.div key="code-war" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <span className="text-4xl">🔐</span>
                <h3 className="text-xl font-bold text-white mt-2">The Code War</h3>
                <p className="text-white/60 text-sm">Why communication security mattered</p>
              </div>

              <div className="flex-1 space-y-4">
                <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30">
                  <h4 className="text-red-400 font-bold mb-2">The Problem</h4>
                  <p className="text-white/70 text-sm">
                    Japanese codebreakers could decipher most American codes within hours. Radio messages were being intercepted and decoded, costing American lives.
                  </p>
                </div>

                <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                  <h4 className="text-green-400 font-bold mb-2">The Solution</h4>
                  <p className="text-white/70 text-sm">
                    The Navajo language had no written form and was spoken by fewer than 30 non-Navajos worldwide. It was perfect for creating an unbreakable code.
                  </p>
                </div>

                <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                  <h4 className="text-amber-400 font-bold mb-2">The Result</h4>
                  <p className="text-white/70 text-sm">
                    Code Talkers could transmit a message in 20 seconds that would take a machine 30 minutes to encode and decode. The Japanese never broke it.
                  </p>
                </div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  How It Worked
                </button>
              </div>
            </motion.div>
          )}

          {/* NAVAJO INTRO - How the code worked */}
          {screen === 'navajo-intro' && (
            <motion.div key="navajo-intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <span className="text-4xl">🗣️</span>
                <h3 className="text-xl font-bold text-white mt-2">The Navajo Code</h3>
                <p className="text-white/60 text-sm">Nature-based military terminology</p>
              </div>

              <div className="flex-1">
                <p className="text-white/70 mb-4 text-center">
                  Code Talkers used Navajo words for animals and nature to represent military terms:
                </p>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {NAVAJO_WORDS.slice(0, 4).map((word, idx) => (
                    <motion.div
                      key={word.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-white/5 rounded-xl p-3 border border-white/10"
                    >
                      <p className="text-amber-400 font-bold text-sm">{word.english}</p>
                      <p className="text-white text-lg font-serif">{word.navajo}</p>
                      <p className="text-white/50 text-xs mt-1">{word.meaning}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-white/80 text-sm text-center">
                    The code was so complex that even Navajo speakers who weren't trained couldn't understand it - military terms were never used in everyday Navajo.
                  </p>
                </div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Try Speaking the Code
                </button>
              </div>
            </motion.div>
          )}

          {/* PRONUNCIATION GAME */}
          {screen === 'pronunciation-game' && currentWord && (
            <motion.div key="pronunciation-game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              {/* Progress */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-white/50 text-sm">Word {currentWordIndex + 1} of {gameWords.length}</p>
                <div className="flex gap-1">
                  {gameWords.map((w, idx) => (
                    <div
                      key={w.id}
                      className={`w-2 h-2 rounded-full ${
                        wordsLearned.has(w.id)
                          ? 'bg-green-400'
                          : idx === currentWordIndex
                            ? 'bg-amber-500'
                            : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Word Card */}
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  key={currentWord.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full max-w-sm"
                >
                  {/* English Word */}
                  <div className="text-center mb-6">
                    <p className="text-white/50 text-sm uppercase tracking-wider">English</p>
                    <h3 className="text-3xl font-bold text-white">{currentWord.english}</h3>
                  </div>

                  {/* Navajo Word Card */}
                  <div className="bg-gradient-to-b from-amber-900/30 to-amber-900/10 rounded-2xl p-6 border border-amber-500/30 mb-6">
                    <p className="text-amber-400 text-sm uppercase tracking-wider text-center mb-2">Navajo</p>
                    <h2 className="text-4xl font-bold text-white text-center font-serif mb-4">{currentWord.navajo}</h2>

                    {/* Audio Button */}
                    <button
                      onClick={() => playAudio(currentWord.id)}
                      className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                        audioUrls[currentWord.id]
                          ? 'bg-amber-500 hover:bg-amber-400 text-black'
                          : 'bg-white/20 text-white/50'
                      }`}
                      disabled={!audioUrls[currentWord.id]}
                    >
                      {isPlaying ? <Pause size={20} /> : <Volume2 size={20} />}
                      <span className="font-bold">Listen</span>
                    </button>

                    {!audioUrls[currentWord.id] && (
                      <p className="text-white/40 text-xs text-center mt-2">
                        Audio: {currentWord.audioKey}
                      </p>
                    )}
                  </div>

                  {/* Pronunciation Guide */}
                  <AnimatePresence>
                    {showAnswer ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4"
                      >
                        <p className="text-white/50 text-xs uppercase tracking-wider mb-1">Pronunciation</p>
                        <p className="text-white text-lg font-mono">{currentWord.pronunciation}</p>
                        <p className="text-white/60 text-sm mt-2">
                          <span className="text-amber-400">Meaning:</span> {currentWord.meaning}
                        </p>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowAnswer(true)}
                        className="w-full py-3 bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors mb-4"
                      >
                        Show Pronunciation
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <div className="flex gap-3">
                  <button
                    onClick={handleReplayWord}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    disabled={!audioUrls[currentWord.id]}
                  >
                    <RefreshCw size={20} />
                    Replay
                  </button>
                  <button
                    onClick={handleWordLearned}
                    className="flex-1 py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={20} />
                    Got It!
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* IWO JIMA - Historical impact */}
          {screen === 'iwo-jima' && (
            <motion.div key="iwo-jima" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-500/30 to-amber-900/20 flex items-center justify-center mb-6"
                >
                  <span className="text-5xl">🏝️</span>
                </motion.div>

                <h3 className="text-2xl font-bold text-white mb-4">The Battle of Iwo Jima</h3>

                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/80 leading-relaxed mb-4">
                    During the battle for Iwo Jima in February 1945, six Code Talkers worked around the clock, sending and receiving over 800 messages without a single error.
                  </p>
                  <p className="text-amber-400 font-bold">
                    All messages were transmitted and decoded perfectly.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
                  <div className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                    <p className="text-2xl font-bold text-amber-400">800+</p>
                    <p className="text-white/60 text-xs">Messages Sent</p>
                  </div>
                  <div className="bg-green-500/10 rounded-xl p-3 text-center border border-green-500/20">
                    <p className="text-2xl font-bold text-green-400">0</p>
                    <p className="text-white/60 text-xs">Errors</p>
                  </div>
                </div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {/* REFLECTION */}
          {screen === 'reflection' && (
            <motion.div key="reflection" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-6"
                >
                  <span className="text-3xl">🎖️</span>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-4">Honoring the Code Talkers</h3>

                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/80 leading-relaxed">
                    The Code Talkers' contribution was kept secret until 1968. In 2001, the original 29 Code Talkers received the Congressional Gold Medal, America's highest civilian honor.
                  </p>
                </div>

                {/* Words Learned Summary */}
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30 mb-4">
                  <p className="text-amber-200 text-sm">
                    You learned <strong>{wordsLearned.size}</strong> Navajo military terms!
                  </p>
                </div>

                <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                  {Array.from(wordsLearned).map(wordId => {
                    const word = NAVAJO_WORDS.find(w => w.id === wordId);
                    return word ? (
                      <div key={wordId} className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm">
                        {word.navajo}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Complete Beat
                </button>
              </div>
            </motion.div>
          )}

          {/* POST-MODULE VIDEO */}
          {screen === 'post-video' && postModuleVideoConfig && (
            <PostModuleVideoScreen
              config={postModuleVideoConfig}
              beatTitle="Code Talkers"
              onComplete={() => setScreen('completion')}
            />
          )}

          {/* COMPLETION */}
          {screen === 'completion' && (
            <XPCompletionScreen
              beatNumber={11}
              beatTitle="Code Talkers"
              xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
              host={host}
              onContinue={() => {
                clearCheckpoint();
                onComplete(skipped ? 0 : LESSON_DATA.xpReward);
              }}
              nextBeatPreview="Mastery Run - Test your knowledge of Pearl Harbor!"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

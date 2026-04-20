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
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
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

  // Save checkpoint on screen change
  useEffect(() => {
    if (screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { wordsLearned: Array.from(wordsLearned), currentWordIndex },
      });
    }
  }, [screen, saveCheckpoint, wordsLearned, currentWordIndex]);

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
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
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
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <span className="text-4xl">🦅</span>
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">The Navajo Secret</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  In WWII, Navajo Marines created an unbreakable code based on their native language. The Japanese never decoded a single message.
                </p>
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 italic text-sm">
                    "Were it not for the Navajos, the Marines would never have taken Iwo Jima."
                  </p>
                  <p className="text-white/50 text-xs mt-2">— Major Howard Connor</p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Learn the Code
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
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

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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

              <div style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))' }}>
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
            <motion.div
              key="completion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full p-6 items-center justify-center"
              onAnimationComplete={() => {
                if (!skipped) playXPSound();
                clearCheckpoint();
                onComplete(skipped ? 0 : LESSON_DATA.xpReward);
              }}
            >
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">🦅</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Beat 11 Complete!</h2>
              <p className="text-white/60 mb-6">Code Talkers - The Navajo Secret</p>
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
              </div>
              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: Mastery Run - Test your knowledge of Pearl Harbor!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

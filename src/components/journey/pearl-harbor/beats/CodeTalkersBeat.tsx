/**
 * Beat 11: Code Talkers - The Navajo Secret
 * Format: Interactive Dossier (Consolidated from 10 screens to 1)
 * XP: 55 | Duration: 6-7 min
 *
 * Learn about the unbreakable Navajo code through an interactive vocabulary game.
 * Users tap word cards to hear AI pronunciation and mark as learned.
 * Complete beat when all 6 terms are learned.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft as ChevronLeftIcon, X, Check, Play, Volume2, Sparkles, ChevronRight, Award } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';
import { useScreenHistory } from '../hooks/useScreenHistory';

type Screen = 'pre-video' | 'dossier' | 'post-video' | 'completion';
const SCREENS: Screen[] = ['pre-video', 'dossier', 'post-video', 'completion'];

const LESSON_DATA = {
  id: 'ph-beat-11',
  xpReward: 55,
};

// Navajo vocabulary - 6 military terms
interface NavajoWord {
  id: string;
  english: string;
  navajo: string;
  literal: string;
  phonetic: string;
  context: string;
  audioKey: string;
}

const NAVAJO_WORDS: NavajoWord[] = [
  {
    id: 'fighter-plane',
    english: 'Fighter Plane',
    navajo: 'Da-he-tih-hi',
    literal: 'Hummingbird',
    phonetic: 'dah-heh-TEE-hee',
    context: 'The hummingbird is swift and agile — darting through the sky the way a P-38 Lightning or Corsair fighter moves in combat. Code Talkers chose animals whose behavior matched the machine.',
    audioKey: 'code-talkers-fighter-plane',
  },
  {
    id: 'bomber',
    english: 'Bomber',
    navajo: 'Jay-sho',
    literal: 'Buzzard',
    phonetic: 'JAY-shoh',
    context: 'The buzzard — a large bird that carries destruction in its circling shadow. Perfect metaphor for the B-17 Flying Fortress or B-29 Superfortress dropping tons of ordnance below.',
    audioKey: 'code-talkers-bomber',
  },
  {
    id: 'submarine',
    english: 'Submarine',
    navajo: 'Besh-lo',
    literal: 'Iron Fish',
    phonetic: 'behsh-LOH',
    context: 'Iron fish — exactly what a submarine is. Underwater, metal-hulled, moves like a fish. The Navajo had no pre-existing word for "submarine," so the Code Talkers invented one that was both technically accurate and impossible to translate.',
    audioKey: 'code-talkers-submarine',
  },
  {
    id: 'battleship',
    english: 'Battleship',
    navajo: 'Lo-tso',
    literal: 'Whale',
    phonetic: 'LOH-tsoh',
    context: 'The whale — massive, powerful, cutting through the Pacific. The battleship was the whale of the fleet, and the metaphor carried both the scale and the gravity of what the term represented.',
    audioKey: 'code-talkers-battleship',
  },
  {
    id: 'tank',
    english: 'Tank',
    navajo: 'Chay-da-gahi',
    literal: 'Tortoise',
    phonetic: 'CHAY-dah-GAH-hee',
    context: 'The tortoise — armored, slow, relentless. The Sherman tank shared every property of the tortoise except one: it could kill. Japanese intercepts never made the connection.',
    audioKey: 'code-talkers-tank',
  },
  {
    id: 'grenade',
    english: 'Grenade',
    navajo: 'Ni-ma-si',
    literal: 'Potato',
    phonetic: 'nee-MAH-see',
    context: 'A potato — small, round, thrown. GI slang already called hand grenades "potato mashers," and the Navajo word captured the same ordinary shape that hid extraordinary power.',
    audioKey: 'code-talkers-grenade',
  },
];

interface CodeTalkersBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function CodeTalkersBeat({ host, onComplete, onSkip, onBack, isPreview = false }: CodeTalkersBeatProps) {
  // Use screen history hook for proper back navigation
  const {
    screen,
    isFirstScreen,
    goToScreen,
    goBack: goToPrevScreen,
    resetHistory,
  } = useScreenHistory<Screen>({
    initialScreen: 'dossier',
    screens: SCREENS,
    onExit: onBack,
  });

  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  // Game state
  const [activeWordIndex, setActiveWordIndex] = useState(0);
  const [learnedWords, setLearnedWords] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Audio URLs from Firestore
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

  const activeWord = NAVAJO_WORDS[activeWordIndex];
  const allLearned = learnedWords.size === NAVAJO_WORDS.length;

  // Subscribe to Firestore for assets
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
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
    if (hasLoadedConfig && screen === 'dossier') {
      const checkpoint = getCheckpoint();
      const shouldShowPreVideo = (isPreview || checkpoint?.lessonId !== LESSON_DATA.id) &&
        preModuleVideoConfig?.enabled &&
        preModuleVideoConfig?.videoUrl;
      if (shouldShowPreVideo) {
        resetHistory('pre-video');
      }
    }
  }, [hasLoadedConfig, preModuleVideoConfig, isPreview, resetHistory]);

  // Save checkpoint
  useEffect(() => {
    if (hasLoadedConfig && screen === 'dossier') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen: 'dossier',
        screenIndex: 0,
        timestamp: Date.now(),
        state: { learnedWords: Array.from(learnedWords), activeWordIndex },
      });
    }
  }, [hasLoadedConfig, screen, learnedWords, activeWordIndex, saveCheckpoint]);

  // Audio playback
  const playAudio = useCallback((wordId: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const url = audioUrls[wordId];
    if (url) {
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    } else {
      // Simulate audio playing for demo
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 1600);
    }
  }, [audioUrls]);

  // Select a word
  const selectWord = useCallback((index: number) => {
    setActiveWordIndex(index);
    setShowDetailSheet(true);
    playAudio(NAVAJO_WORDS[index].id);
  }, [playAudio]);

  // Mark word as learned
  const markLearned = useCallback(() => {
    setLearnedWords(prev => new Set(prev).add(activeWord.id));
    setShowDetailSheet(false);
  }, [activeWord]);

  // Navigate words
  const prevWord = useCallback(() => {
    const newIndex = (activeWordIndex - 1 + NAVAJO_WORDS.length) % NAVAJO_WORDS.length;
    setActiveWordIndex(newIndex);
    playAudio(NAVAJO_WORDS[newIndex].id);
  }, [activeWordIndex, playAudio]);

  const nextWord = useCallback(() => {
    const newIndex = (activeWordIndex + 1) % NAVAJO_WORDS.length;
    setActiveWordIndex(newIndex);
    playAudio(NAVAJO_WORDS[newIndex].id);
  }, [activeWordIndex, playAudio]);

  // Complete beat
  const handleComplete = useCallback(() => {
    if (postModuleVideoConfig?.enabled) {
      goToScreen('post-video');
    } else {
      goToScreen('completion');
    }
  }, [postModuleVideoConfig, goToScreen]);

  // Sound wave bars component
  const SoundWaveBars = () => (
    <div className="flex items-center gap-[2px] h-5">
      {[0, 0.1, 0.2, 0.15, 0.05].map((delay, i) => (
        <motion.div
          key={i}
          className="w-[2px] bg-gold-br rounded-sm"
          animate={{
            height: isPlaying ? ['8px', '16px', '8px'] : '8px',
          }}
          transition={{
            duration: 0.6,
            repeat: isPlaying ? Infinity : 0,
            delay,
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-void flex flex-col">
      {/* PRE-VIDEO */}
      {screen === 'pre-video' && preModuleVideoConfig && (
        <PreModuleVideoScreen
          config={preModuleVideoConfig}
          beatTitle="Code Talkers"
          onComplete={() => goToScreen('dossier')}
        />
      )}

      {/* MAIN DOSSIER SCREEN */}
      {screen === 'dossier' && (
        <>
          {/* Header */}
          <div className="relative px-4 py-3 border-b border-ha-red/30 bg-gradient-to-b from-[#131009] to-[#0a0805]">
            {/* Red top line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-ha-red/60" />

            <div className="flex items-center justify-between gap-3">
              <button onClick={goToPrevScreen} className="flex items-center gap-1.5 text-off-white/50 hover:text-gold transition-colors">
                {isFirstScreen ? <X size={16} strokeWidth={2.2} /> : <ChevronLeftIcon size={16} strokeWidth={2.2} />}
                <span className="font-mono text-[10px] tracking-[0.28em] uppercase font-bold hidden sm:inline">Pacific Theater</span>
              </button>

              <div className="flex items-center gap-2">
                <div className="w-[7px] h-[7px] rounded-full bg-ha-red shadow-[0_0_8px_var(--ha-red)] animate-pulse" />
                <span className="font-mono text-[9.5px] tracking-[0.42em] text-[#E84046] uppercase font-bold">Active Briefing</span>
              </div>

              <span className="font-mono text-[9px] tracking-[0.28em] text-off-white/50 uppercase font-semibold">
                Beat <span className="text-gold">11</span>/13
              </span>
            </div>

            {/* Title row */}
            <div className="flex items-baseline justify-between gap-4 mt-2 flex-wrap">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[9px] tracking-[0.32em] text-gold uppercase font-bold">WWII · Pacific · Intelligence</span>
                <h1 className="font-oswald font-black text-[28px] sm:text-[34px] text-off-white uppercase leading-none tracking-[0.01em]">
                  Code <span className="font-playfair italic font-bold text-gold normal-case">Talkers</span>
                </h1>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-[9px] tracking-[0.24em] text-off-white/50 uppercase font-bold whitespace-nowrap">
                  Beat <span className="text-gold">11</span>/13
                </span>
                <div className="w-[120px] sm:w-[180px] h-[3px] bg-gold/15 rounded-sm overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-gold-dp via-gold to-gold-br rounded-sm shadow-[0_0_8px_rgba(230,171,42,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: '85%' }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 relative"
              style={{
                background: 'linear-gradient(180deg, #0a0805 0%, #080503 100%)',
              }}
            >
              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-70 pointer-events-none"
                style={{
                  backgroundImage: `repeating-linear-gradient(90deg, transparent 0, transparent 39px, rgba(230,171,42,0.02) 39px, rgba(230,171,42,0.02) 40px),
                    repeating-linear-gradient(0deg, transparent 0, transparent 39px, rgba(230,171,42,0.02) 39px, rgba(230,171,42,0.02) 40px)`
                }}
              />

              {/* Subtitle */}
              <p className="relative z-10 font-cormorant italic text-[14px] sm:text-[15px] text-off-white/70 text-center leading-relaxed">
                The Navajo Marines whose language became America's unbreakable code.
              </p>

              {/* Story + Stats Cards */}
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
                {/* Story Card - Problem/Solution/Result */}
                <div className="relative bg-card border border-gold/15 rounded-lg p-4 sm:p-5 overflow-hidden">
                  {/* Brass fasteners */}
                  {['top-[6px] left-[6px]', 'top-[6px] right-[6px]', 'bottom-[6px] left-[6px]', 'bottom-[6px] right-[6px]'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-[9px] h-[9px] rounded-full z-10`}
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F)',
                        border: '1px solid #6A3A12',
                        boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    />
                  ))}

                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3 pb-2.5 border-b border-dashed border-off-white/[0.08]">
                    <div className="w-3.5 h-px bg-gold" />
                    <span className="font-mono text-[9px] tracking-[0.38em] text-gold uppercase font-bold">The Code War</span>
                  </div>

                  {/* Rows */}
                  <div className="space-y-3">
                    {/* Problem */}
                    <div className="grid grid-cols-[64px_1fr] gap-3 items-start">
                      <span className="font-oswald font-black text-[9px] tracking-[0.18em] uppercase text-center py-1 px-1.5 rounded-sm border-[1.5px] border-ha-red text-[#E84046] bg-ha-red/[0.15]">
                        Problem
                      </span>
                      <p className="font-cormorant italic text-[13px] sm:text-[14px] text-off-white/70 leading-[1.45]">
                        Japanese codebreakers could decipher <span className="text-[#E84046] font-bold">most American codes within hours.</span> Radio messages were being intercepted and decoded, costing American lives.
                      </p>
                    </div>

                    {/* Solution */}
                    <div className="grid grid-cols-[64px_1fr] gap-3 items-start">
                      <span className="font-oswald font-black text-[9px] tracking-[0.18em] uppercase text-center py-1 px-1.5 rounded-sm border-[1.5px] border-green-500 text-green-400 bg-green-500/[0.12]">
                        Solution
                      </span>
                      <p className="font-cormorant italic text-[13px] sm:text-[14px] text-off-white/70 leading-[1.45]">
                        The Navajo language had <span className="text-green-400 font-bold">no written form</span> and was spoken by fewer than 30 non-Navajos worldwide. It was perfect for creating an unbreakable code.
                      </p>
                    </div>

                    {/* Result */}
                    <div className="grid grid-cols-[64px_1fr] gap-3 items-start">
                      <span className="font-oswald font-black text-[9px] tracking-[0.18em] uppercase text-center py-1 px-1.5 rounded-sm border-[1.5px] border-gold text-gold-br bg-gold/[0.1]">
                        Result
                      </span>
                      <p className="font-cormorant italic text-[13px] sm:text-[14px] text-off-white/70 leading-[1.45]">
                        Code Talkers could transmit a message in <span className="text-gold font-bold">20 seconds</span> that would take a machine <span className="text-gold font-bold">30 minutes</span> to encode and decode. The Japanese never broke it.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Card - Iwo Jima */}
                <div className="relative bg-card border border-gold/15 rounded-lg p-4 sm:p-5 overflow-hidden flex flex-col gap-3">
                  {/* Brass fasteners */}
                  {['top-[6px] left-[6px]', 'top-[6px] right-[6px]', 'bottom-[6px] left-[6px]', 'bottom-[6px] right-[6px]'].map((pos, i) => (
                    <div key={i} className={`absolute ${pos} w-[9px] h-[9px] rounded-full z-10`}
                      style={{
                        background: 'radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F)',
                        border: '1px solid #6A3A12',
                        boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    />
                  ))}

                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-px bg-[#E84046]" />
                    <span className="font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">Field Report · Iwo Jima</span>
                  </div>

                  <h3 className="font-playfair italic font-bold text-[17px] text-off-white leading-tight">
                    The <span className="text-gold">Battle of Iwo Jima</span>
                  </h3>

                  {/* Stats row */}
                  <div className="grid grid-cols-2 gap-2.5 mt-1">
                    <div className="relative p-3 bg-black/40 border border-off-white/[0.08] rounded text-center">
                      <p className="font-dm-serif italic text-[28px] text-gold-br leading-none mb-0.5"
                        style={{ textShadow: '0 0 14px rgba(230,171,42,0.3)' }}>
                        800+
                      </p>
                      <p className="font-mono text-[8px] tracking-[0.28em] text-off-white/50 uppercase font-bold">Messages Sent</p>
                    </div>
                    <div className="relative p-3 bg-black/40 border border-off-white/[0.08] rounded text-center">
                      <p className="font-dm-serif italic text-[28px] text-green-400 leading-none mb-0.5"
                        style={{ textShadow: '0 0 14px rgba(61,214,122,0.25)' }}>
                        0
                      </p>
                      <p className="font-mono text-[8px] tracking-[0.28em] text-off-white/50 uppercase font-bold">Errors</p>
                    </div>
                  </div>

                  <p className="font-cormorant italic text-[12.5px] text-off-white/50 leading-relaxed">
                    February 1945. Six Code Talkers worked around the clock. <span className="text-gold font-bold">Every message transmitted and decoded perfectly.</span>
                  </p>
                </div>
              </div>

              {/* Word Grid Section */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-px bg-[#E84046]" />
                      <span className="font-mono text-[9px] tracking-[0.38em] text-[#E84046] uppercase font-bold">The Navajo Code</span>
                    </div>
                    <h2 className="font-oswald font-bold text-[17px] sm:text-[19px] text-off-white leading-tight tracking-[0.015em]">
                      Tap any term to <span className="font-playfair italic font-bold text-gold">hear it spoken</span>
                    </h2>
                    <p className="font-cormorant italic text-[12px] sm:text-[13px] text-off-white/50 leading-relaxed">
                      Nature-based military terminology. Press a card to play the Navajo pronunciation.
                    </p>
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.26em] text-off-white/70 uppercase font-bold py-1 px-2 border border-gold/15 rounded bg-black/40">
                    Terms learned: <span className="text-gold font-bold">{learnedWords.size}</span>/6
                  </div>
                </div>

                {/* Word Grid - 2x3 */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  {NAVAJO_WORDS.map((word, index) => {
                    const isActive = index === activeWordIndex && showDetailSheet;
                    const isLearned = learnedWords.has(word.id);

                    return (
                      <motion.button
                        key={word.id}
                        onClick={() => selectWord(index)}
                        className={`relative text-left p-3 sm:p-4 rounded-md min-h-[100px] sm:min-h-[110px] flex flex-col justify-between transition-all ${
                          isActive
                            ? 'border-gold bg-gradient-to-br from-[rgba(40,28,10,0.9)] to-[rgba(20,14,8,0.7)] shadow-[0_0_26px_rgba(230,171,42,0.25)]'
                            : isLearned
                              ? 'border-green-500/30 bg-gradient-to-b from-[rgba(20,40,20,0.3)] to-[rgba(15,25,15,0.5)]'
                              : 'border-gold/15 bg-card hover:border-gold/35 hover:bg-[rgba(20,14,8,0.8)] hover:-translate-y-0.5'
                        } border overflow-hidden`}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Brass fasteners */}
                        {['top-[5px] left-[5px]', 'top-[5px] right-[5px]'].map((pos, i) => (
                          <div key={i} className={`absolute ${pos} w-[7px] h-[7px] rounded-full z-10`}
                            style={{
                              background: isActive
                                ? 'radial-gradient(circle at 30% 30%, #fff2a8, #F6E355 50%, #E6AB2A)'
                                : 'radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F)',
                              border: '1px solid #6A3A12',
                              boxShadow: isActive
                                ? '0 0 8px rgba(246,227,85,0.6), inset 0 -1px 1px rgba(0,0,0,0.35)'
                                : 'inset 0 -1px 1px rgba(0,0,0,0.35)'
                            }}
                          />
                        ))}

                        {/* Top row: English + Check */}
                        <div className="flex items-start justify-between gap-2">
                          <span className={`font-oswald font-black text-[11px] sm:text-[13px] tracking-[0.08em] uppercase leading-tight ${
                            isLearned ? 'text-off-white/50' : 'text-off-white'
                          }`}>
                            {word.english}
                          </span>

                          {/* Check badge */}
                          <motion.div
                            className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-full bg-green-500/15 border-[1.5px] border-green-500 flex items-center justify-center flex-shrink-0"
                            initial={{ opacity: 0, scale: 0.7 }}
                            animate={{
                              opacity: isLearned ? 1 : 0,
                              scale: isLearned ? 1 : 0.7
                            }}
                            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                          >
                            <Check size={10} className="text-green-500" strokeWidth={3} />
                          </motion.div>
                        </div>

                        {/* Bottom: Navajo + Literal */}
                        <div className="flex flex-col gap-0.5 mt-2">
                          <span className={`font-playfair italic font-bold text-[18px] sm:text-[20px] leading-tight ${
                            isLearned ? 'text-green-400' : 'text-gold'
                          }`}>
                            {word.navajo}
                          </span>
                          <span className="font-cormorant italic text-[10px] sm:text-[11.5px] text-off-white/50 leading-tight">
                            {word.literal}
                          </span>
                        </div>

                        {/* Play button */}
                        <div className={`absolute bottom-2.5 right-2.5 w-[24px] h-[24px] sm:w-[26px] sm:h-[26px] rounded-full flex items-center justify-center transition-all ${
                          isPlaying && isActive ? 'opacity-0' : 'opacity-85'
                        }`}
                          style={{
                            background: 'radial-gradient(circle at 30% 25%, #fef0d0, #E6AB2A 50%, #B2641F)',
                            border: '1.5px solid #1a0b02',
                            boxShadow: '0 0 10px rgba(230,171,42,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                          }}
                        >
                          <Play size={10} className="text-[#1a0b02] ml-0.5" fill="#1a0b02" />
                        </div>

                        {/* Sound wave bars when playing */}
                        {isPlaying && isActive && (
                          <div className="absolute bottom-2.5 right-2.5 h-[26px] px-2 flex items-center gap-0.5 bg-black/70 border border-gold rounded-full">
                            <SoundWaveBars />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Completion Banner */}
              <div className="relative z-10 bg-gradient-to-br from-[rgba(60,40,16,0.4)] to-[rgba(20,14,8,0.7)] border border-gold/35 rounded-lg p-4 sm:p-5 overflow-hidden">
                {/* Brass fasteners */}
                {['top-[6px] left-[6px]', 'top-[6px] right-[6px]', 'bottom-[6px] left-[6px]', 'bottom-[6px] right-[6px]'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-[9px] h-[9px] rounded-full z-10`}
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #F6E355, #E6AB2A 50%, #B2641F)',
                      border: '1px solid #6A3A12',
                      boxShadow: 'inset 0 -1px 1px rgba(0,0,0,0.35), 0 1px 2px rgba(0,0,0,0.5)'
                    }}
                  />
                ))}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold text-[8px]">◆</span>
                      <span className="font-mono text-[9px] tracking-[0.4em] text-gold-br uppercase font-bold">Completion Requirement</span>
                    </div>
                    <h3 className="font-playfair italic font-black text-[18px] sm:text-[22px] text-off-white leading-tight mb-2">
                      Learn all <span className="text-gold">six terms</span> to declassify this briefing
                    </h3>
                    <p className="font-cormorant italic text-[13px] sm:text-[14px] text-off-white/70 leading-relaxed mb-3">
                      Kept secret until 1968. In 2001, the original <span className="font-playfair font-bold text-gold-br">29 Code Talkers</span> received the Congressional Gold Medal — America's highest civilian honor.
                    </p>

                    {/* Chips */}
                    <div className="flex flex-wrap gap-1.5">
                      {NAVAJO_WORDS.map(word => (
                        <span key={word.id} className={`font-playfair italic font-bold text-[12px] sm:text-[13px] py-1 px-2.5 rounded-full border ${
                          learnedWords.has(word.id)
                            ? 'text-green-400 bg-green-500/15 border-green-500/40'
                            : 'text-off-white/40 bg-black/30 border-off-white/10'
                        }`}>
                          {word.navajo}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={handleComplete}
                    disabled={!allLearned}
                    className={`relative flex items-center justify-center gap-2.5 py-3.5 px-5 sm:px-6 rounded font-oswald font-black text-[11.5px] tracking-[0.28em] uppercase whitespace-nowrap transition-all ${
                      allLearned
                        ? 'text-[#1a0b02] cursor-pointer hover:brightness-105'
                        : 'text-off-white/50 cursor-not-allowed opacity-50'
                    }`}
                    style={allLearned ? {
                      background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                      boxShadow: '0 8px 22px rgba(230,171,42,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                    } : {
                      background: 'rgba(230,171,42,0.2)',
                      border: '1px solid rgba(230,171,42,0.2)'
                    }}
                  >
                    {/* Corner brackets */}
                    <span className="absolute -top-px -left-px w-[9px] h-[9px] border-t-[1.5px] border-l-[1.5px] border-ha-red pointer-events-none" />
                    <span className="absolute -bottom-px -right-px w-[9px] h-[9px] border-b-[1.5px] border-r-[1.5px] border-ha-red pointer-events-none" />
                    <Award size={14} strokeWidth={2.6} />
                    Complete Beat
                  </button>
                </div>
              </div>

              {/* Skip link */}
              <div className="relative z-10 text-center pb-4">
                <button
                  onClick={() => { setSkipped(true); onSkip(); }}
                  className="font-mono text-[9.5px] tracking-[0.28em] text-off-white/35 uppercase font-semibold hover:text-off-white/50 transition-colors py-1 px-2.5"
                >
                  Skip this beat
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Sheet - Mobile Detail Panel */}
          <AnimatePresence>
            {showDetailSheet && (
              <>
                {/* Overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDetailSheet(false)}
                  className="fixed inset-0 bg-black/55 backdrop-blur-[4px] z-50"
                />

                {/* Sheet */}
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                  className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a130a] to-[#0a0805] border-t border-gold/35 rounded-t-[20px] max-h-[85vh] overflow-hidden flex flex-col"
                  style={{ boxShadow: '0 -18px 40px rgba(0,0,0,0.65), 0 0 30px rgba(230,171,42,0.1)' }}
                >
                  {/* Corner brackets */}
                  <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-gold z-10" />
                  <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-gold z-10" />

                  {/* Handle */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-9 h-1 bg-gold/40 rounded-full" />
                  </div>

                  {/* Close button */}
                  <button
                    onClick={() => setShowDetailSheet(false)}
                    className="absolute top-3 right-3.5 w-[26px] h-[26px] flex items-center justify-center bg-[rgba(20,14,8,0.8)] border border-gold/35 rounded-full z-10"
                  >
                    <X size={11} className="text-off-white/70" strokeWidth={2.4} />
                  </button>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-safe">
                    {/* Selected Term header */}
                    <div className="text-center py-3 border-b border-dashed border-off-white/[0.08]">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="w-4 h-px bg-[#E84046]" />
                        <span className="font-mono text-[9px] tracking-[0.42em] text-[#E84046] uppercase font-bold">Selected Term</span>
                        <div className="w-4 h-px bg-[#E84046]" />
                      </div>
                      <h2 className="font-oswald font-black text-[22px] sm:text-[26px] text-off-white uppercase tracking-[0.04em]">
                        {activeWord.english}
                      </h2>
                    </div>

                    {/* Navajo word display */}
                    <div className="relative my-4 py-5 px-4 rounded-lg overflow-hidden text-center"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 30%, rgba(80,50,18,0.4), rgba(20,14,8,0.8))',
                        border: '1px solid rgba(230,171,42,0.35)'
                      }}
                    >
                      {/* Top/bottom lines */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-50" />
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-gradient-to-r from-transparent via-gold-dp to-transparent opacity-40" />

                      <span className="font-mono text-[9.5px] tracking-[0.42em] text-gold uppercase font-bold">Navajo</span>
                      <h3 className="font-playfair italic font-black text-[36px] sm:text-[40px] text-off-white leading-none mt-2 mb-2"
                        style={{ textShadow: '0 0 24px rgba(230,171,42,0.25)' }}>
                        {activeWord.navajo}
                      </h3>
                      <p className="font-cormorant italic text-[14px] text-off-white/70">
                        Meaning: <span className="text-gold-br font-bold">{activeWord.literal}</span>
                      </p>
                    </div>

                    {/* AI Pronounce Button */}
                    <button
                      onClick={() => playAudio(activeWord.id)}
                      className={`relative w-full flex items-center justify-center gap-2.5 py-3.5 rounded-md font-oswald font-black text-[11.5px] tracking-[0.3em] uppercase mb-2 ${
                        isPlaying ? 'animate-pulse' : ''
                      }`}
                      style={{
                        background: isPlaying
                          ? 'linear-gradient(180deg, #fff2a8 0%, #F6E355 45%, #E6AB2A 100%)'
                          : 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                        color: '#1a0b02',
                        boxShadow: '0 8px 22px rgba(230,171,42,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(138,80,20,0.3)'
                      }}
                    >
                      {/* Corner brackets */}
                      <span className="absolute -top-px -left-px w-[9px] h-[9px] border-t-[1.5px] border-l-[1.5px] border-ha-red pointer-events-none" />
                      <span className="absolute -bottom-px -right-px w-[9px] h-[9px] border-b-[1.5px] border-r-[1.5px] border-ha-red pointer-events-none" />
                      <Volume2 size={14} />
                      {isPlaying ? 'Playing...' : 'Hear AI Pronunciation'}
                    </button>

                    {/* AI tag */}
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Sparkles size={9} className="text-gold" strokeWidth={2} />
                      <span className="font-mono text-[8px] tracking-[0.32em] text-off-white/50 uppercase font-bold">
                        Voiced by {host.name} · Your War Correspondent
                      </span>
                    </div>

                    {/* Phonetic guide */}
                    <div className="flex items-center justify-between gap-2.5 py-2.5 px-3.5 bg-black/40 border border-dashed border-off-white/[0.08] rounded mb-3">
                      <span className="font-mono text-[8.5px] tracking-[0.28em] text-off-white/50 uppercase font-bold">Phonetic</span>
                      <span className="font-mono text-[14px] text-gold-br tracking-wide">{activeWord.phonetic}</span>
                    </div>

                    {/* Context */}
                    <div className="py-3.5 px-4 bg-black/25 border-l-2 border-gold rounded mb-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-gold text-[7px]">◆</span>
                        <span className="font-mono text-[8.5px] tracking-[0.38em] text-gold uppercase font-bold">Why This Word</span>
                      </div>
                      <p className="font-cormorant italic text-[13px] sm:text-[13.5px] text-off-white/70 leading-[1.5]">
                        {activeWord.context.split(/(<em>|<\/em>)/).map((part, i) =>
                          part === '<em>' || part === '</em>' ? null :
                          activeWord.context.substring(0, activeWord.context.indexOf(part)).includes('<em>') &&
                          !activeWord.context.substring(0, activeWord.context.indexOf(part)).endsWith('</em>')
                            ? <span key={i} className="text-gold font-bold">{part}</span>
                            : part
                        )}
                      </p>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex gap-2 py-3 border-t border-off-white/[0.08]">
                      <button
                        onClick={prevWord}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[rgba(20,14,8,0.6)] border border-gold/15 rounded text-off-white/70 font-oswald font-bold text-[10.5px] tracking-[0.22em] uppercase hover:text-gold hover:border-gold/35 transition-colors"
                      >
                        <ChevronLeft size={11} strokeWidth={2.4} />
                        Prev
                      </button>
                      <button
                        onClick={markLearned}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded font-oswald font-bold text-[10.5px] tracking-[0.22em] uppercase"
                        style={{
                          background: 'linear-gradient(180deg, #3DD67A 0%, #1A8A3E 100%)',
                          color: '#0a1f10',
                          boxShadow: '0 4px 12px rgba(26,138,62,0.3), inset 0 1px 0 rgba(255,255,255,0.25)'
                        }}
                      >
                        <Check size={11} strokeWidth={3} />
                        Got It
                      </button>
                      <button
                        onClick={nextWord}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-[rgba(20,14,8,0.6)] border border-gold/15 rounded text-off-white/70 font-oswald font-bold text-[10.5px] tracking-[0.22em] uppercase hover:text-gold hover:border-gold/35 transition-colors"
                      >
                        Next
                        <ChevronRight size={11} strokeWidth={2.4} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </>
      )}

      {/* POST-VIDEO */}
      {screen === 'post-video' && postModuleVideoConfig && (
        <PostModuleVideoScreen
          config={postModuleVideoConfig}
          beatTitle="Code Talkers"
          onComplete={() => goToScreen('completion')}
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
          nextBeatPreview="Mastery Run - Test your knowledge!"
        />
      )}
    </div>
  );
}

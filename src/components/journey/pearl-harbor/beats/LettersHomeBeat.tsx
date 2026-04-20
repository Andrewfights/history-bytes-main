/**
 * Beat 12: Letters Home - Voices from the Front
 * Format: Primary Source Audio (Reusable type)
 * XP: 50 | Duration: 5-6 min
 *
 * Narrative: Hear the words of soldiers in their own voices through
 * AI-narrated letters from the front.
 *
 * This is a REUSABLE beat type: primary-source-audio
 * Can be used for any historical letters, documents, or speeches with audio narration.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Play, Pause, Volume2, VolumeX, Mail, User, ChevronRight, ChevronLeft } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { playXPSound } from '@/lib/xpAudioManager';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen =
  | 'pre-video'
  | 'intro'
  | 'letter-select'
  | 'barsky-letter'
  | 'adelman-letter'
  | 'james-letter'
  | 'reflection'
  | 'post-video'
  | 'completion';

const SCREENS: Screen[] = [
  'pre-video',
  'intro',
  'letter-select',
  'barsky-letter',
  'adelman-letter',
  'james-letter',
  'reflection',
  'post-video',
  'completion'
];

const LESSON_DATA = {
  id: 'ph-beat-9',
  xpReward: 50,
};

// Letter configuration
interface SoldierLetter {
  id: string;
  screenId: Screen;
  soldierName: string;
  rank: string;
  unit: string;
  date: string;
  location: string;
  recipient: string;
  excerpt: string;
  fullText: string;
  audioKey: string; // Key for Firestore audio asset
  photoKey: string; // Key for soldier photo
  context: string;
  icon: string;
}

const LETTERS: SoldierLetter[] = [
  {
    id: 'barsky',
    screenId: 'barsky-letter',
    soldierName: 'Joseph Barsky',
    rank: 'Private',
    unit: 'USS Arizona',
    date: 'December 5, 1941',
    location: 'Pearl Harbor, Hawaii',
    recipient: 'Mother',
    excerpt: '"The weather here is beautiful..."',
    fullText: `Dear Mother,

The weather here is beautiful, and I am getting along fine. We had liberty yesterday and I went to Honolulu. It is a pretty city but I would rather be home.

I hope you are feeling better and taking care of yourself. Don't worry about me. The Navy takes good care of us and the food is pretty good.

I am sending you some money from my pay. Please use it for whatever you need. I know things have been hard since Dad passed.

The ship is a good one and the fellows are swell. We have drills every day but there is also time to swim and enjoy the island.

I miss you and the family. Kiss the kids for me.

Your loving son,
Joseph`,
    audioKey: 'letters-home-barsky-audio',
    photoKey: 'letters-home-barsky-photo',
    context: 'Private Barsky was killed two days later during the attack on December 7, 1941. He was 19 years old.',
    icon: '⚓',
  },
  {
    id: 'adelman',
    screenId: 'adelman-letter',
    soldierName: 'Harvey Adelman',
    rank: 'Seaman First Class',
    unit: 'USS West Virginia',
    date: 'November 28, 1941',
    location: 'Pearl Harbor, Hawaii',
    recipient: 'Wife Ruth',
    excerpt: '"I dream of you every night..."',
    fullText: `My Dearest Ruth,

I dream of you every night and count the days until I can hold you again. The Pacific is beautiful but nothing compares to your smile.

The fellows here talk about their girls back home. I always say I have the best one waiting for me. They don't believe me until I show them your picture.

We have been busy with exercises but the officers say everything is peaceful. I hope to get leave for Christmas. Imagine - our first Christmas as husband and wife!

Keep writing to me. Your letters are the best part of my day. When the mail comes, every sailor rushes to see if there's something from home.

I love you more than words can say.

Forever yours,
Harvey`,
    audioKey: 'letters-home-adelman-audio',
    photoKey: 'letters-home-adelman-photo',
    context: 'Seaman Adelman survived the attack but lost many of his shipmates. He served throughout the war and was reunited with Ruth in 1945.',
    icon: '💑',
  },
  {
    id: 'james',
    screenId: 'james-letter',
    soldierName: 'Wendell James',
    rank: 'Mess Attendant Second Class',
    unit: 'USS Nevada',
    date: 'December 1, 1941',
    location: 'Pearl Harbor, Hawaii',
    recipient: 'Father',
    excerpt: '"They say we might see action..."',
    fullText: `Dear Father,

They say we might see action soon. I don't know what to expect but I am ready to do my duty. You raised me to be brave and I won't let you down.

The Navy is different for men like us. We serve in the mess but we are still part of the crew. Some of the white sailors have become my friends. We are all Americans here.

I have been learning to man an anti-aircraft gun in my spare time. The gunner's mate says I am a natural. Maybe someday they will let me serve at a gun station.

Please tell Mama I am eating well. The cooks here are good, though not as good as her Sunday dinners.

I pray for the family every night.

Your son,
Wendell`,
    audioKey: 'letters-home-james-audio',
    photoKey: 'letters-home-james-photo',
    context: 'During the attack, African American sailors like James often took up weapons despite not being trained for combat roles. Their bravery helped change military attitudes toward integration.',
    icon: '🎖️',
  },
];

interface LettersHomeBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function LettersHomeBeat({ host, onComplete, onSkip, onBack, isPreview = false }: LettersHomeBeatProps) {
  const [screen, setScreen] = useState<Screen>('intro');
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [postModuleVideoConfig, setPostModuleVideoConfig] = useState<PostModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Letters read tracking
  const [lettersRead, setLettersRead] = useState<Set<string>>(new Set());

  // Audio URLs from Firestore
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const { saveCheckpoint, clearCheckpoint, getCheckpoint } = usePearlHarborProgress();

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
        state: { lettersRead: Array.from(lettersRead) },
      });
    }
  }, [screen, saveCheckpoint, lettersRead]);

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

      // Letter audio files
      const letterAssets = assets?.letterAudio?.[LESSON_DATA.id];
      if (letterAssets) {
        const urls: Record<string, string> = {};
        const photos: Record<string, string> = {};
        LETTERS.forEach(letter => {
          if (letterAssets[letter.audioKey]) {
            urls[letter.id] = letterAssets[letter.audioKey];
          }
          if (letterAssets[letter.photoKey]) {
            photos[letter.id] = letterAssets[letter.photoKey];
          }
        });
        setAudioUrls(urls);
        setPhotoUrls(photos);
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

  // Audio playback handling
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.muted = isMuted;
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };
  };

  const toggleAudio = (url: string) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (url) {
      playAudio(url);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
  };

  const nextScreen = useCallback(() => {
    // Stop any playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
    }

    const currentIndex = SCREENS.indexOf(screen);
    if (currentIndex < SCREENS.length - 1) {
      let nextScreenIndex = currentIndex + 1;
      // Skip post-video if not configured
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

  const goToLetter = (screenId: Screen) => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
    }
    setScreen(screenId);
  };

  const currentLetter = LETTERS.find(l => l.screenId === screen);

  // Mark letter as read when viewing
  useEffect(() => {
    if (currentLetter && !lettersRead.has(currentLetter.id)) {
      setLettersRead(prev => new Set(prev).add(currentLetter.id));
    }
  }, [currentLetter, lettersRead]);

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-gradient-to-b from-slate-900 via-slate-950 to-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="text-white font-bold">Letters Home</h1>
          <p className="text-white/50 text-xs">Beat 9 of 13</p>
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
              beatTitle="Letters Home"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* INTRO */}
          {screen === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mb-6">
                  <Mail size={40} className="text-amber-400" />
                </motion.div>
                <h2 className="text-2xl font-bold text-white mb-4">Voices from the Front</h2>
                <p className="text-white/70 mb-6 max-w-sm leading-relaxed">
                  In the days before and after Pearl Harbor, soldiers wrote letters home. These words, preserved across decades, let us hear their voices once more.
                </p>
                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 italic text-sm">
                    "Letters from home were worth their weight in gold. We read them over and over until they fell apart."
                  </p>
                  <p className="text-white/50 text-xs mt-2">— WWII Veteran</p>
                </div>
              </div>
              <div className="space-y-3" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <button onClick={nextScreen} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                  Read Their Words
                </button>
                <button onClick={() => { setSkipped(true); onSkip(); }} className="w-full py-3 text-white/50 hover:text-white/70 text-sm">
                  Skip this beat
                </button>
              </div>
            </motion.div>
          )}

          {/* LETTER SELECT */}
          {screen === 'letter-select' && (
            <motion.div key="letter-select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white">Choose a Letter</h3>
                <p className="text-white/60 text-sm">Tap to hear their stories</p>
              </div>

              <div className="flex-1 space-y-4">
                {LETTERS.map((letter, index) => (
                  <motion.button
                    key={letter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.15 }}
                    onClick={() => goToLetter(letter.screenId)}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      lettersRead.has(letter.id)
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-white/5 border-white/10 hover:border-amber-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center">
                        {photoUrls[letter.id] ? (
                          <img src={photoUrls[letter.id]} alt={letter.soldierName} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <span className="text-2xl">{letter.icon}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-bold">{letter.soldierName}</p>
                          {lettersRead.has(letter.id) && (
                            <span className="text-xs text-green-400">Read</span>
                          )}
                        </div>
                        <p className="text-amber-400 text-sm">{letter.rank}, {letter.unit}</p>
                        <p className="text-white/50 text-xs mt-1">{letter.excerpt}</p>
                      </div>
                      <ChevronRight className="text-white/40" size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>

              {lettersRead.size === LETTERS.length && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4"
                  style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
                >
                  <button onClick={() => setScreen('reflection')} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors">
                    Continue to Reflection
                  </button>
                </motion.div>
              )}

              {lettersRead.size < LETTERS.length && (
                <div className="mt-4 text-center" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                  <p className="text-white/40 text-sm">{lettersRead.size} of {LETTERS.length} letters read</p>
                </div>
              )}
            </motion.div>
          )}

          {/* INDIVIDUAL LETTER SCREENS */}
          {currentLetter && (
            <motion.div
              key={currentLetter.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Letter Header */}
              <div className="p-4 bg-amber-900/20 border-b border-amber-500/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center overflow-hidden">
                    {photoUrls[currentLetter.id] ? (
                      <img src={photoUrls[currentLetter.id]} alt={currentLetter.soldierName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} className="text-amber-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-bold">{currentLetter.soldierName}</p>
                    <p className="text-amber-400 text-sm">{currentLetter.rank}, {currentLetter.unit}</p>
                    <p className="text-white/50 text-xs">{currentLetter.date}</p>
                  </div>
                </div>
              </div>

              {/* Audio Player */}
              <div className="px-4 py-3 bg-black/30 flex items-center gap-4">
                <button
                  onClick={() => audioUrls[currentLetter.id] && toggleAudio(audioUrls[currentLetter.id])}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    audioUrls[currentLetter.id]
                      ? 'bg-amber-500 hover:bg-amber-400'
                      : 'bg-white/20'
                  }`}
                  disabled={!audioUrls[currentLetter.id]}
                >
                  {isPlaying ? (
                    <Pause size={24} className="text-black" />
                  ) : (
                    <Play size={24} className={audioUrls[currentLetter.id] ? 'text-black ml-1' : 'text-white/50'} />
                  )}
                </button>
                <div className="flex-1">
                  <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-amber-500"
                      animate={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <p className="text-white/50 text-xs mt-1">
                    {audioUrls[currentLetter.id] ? 'Listen to the letter' : 'Audio: Upload via admin panel'}
                  </p>
                </div>
                <button onClick={toggleMute} className="p-2 text-white/60 hover:text-white">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
              </div>

              {/* Letter Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="bg-amber-50/5 rounded-xl p-6 border border-amber-500/10 font-serif">
                  <p className="text-amber-200/80 text-sm mb-4">To: {currentLetter.recipient}</p>
                  <div className="text-white/80 whitespace-pre-line leading-relaxed">
                    {currentLetter.fullText}
                  </div>
                </div>

                {/* Context */}
                <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-white/60 text-sm italic">
                    {currentLetter.context}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="px-4" style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}>
                <div className="flex gap-3">
                  <button
                    onClick={() => setScreen('letter-select')}
                    className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <ChevronLeft size={20} />
                    Back to Letters
                  </button>
                  <button
                    onClick={nextScreen}
                    className="flex-1 py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    Continue
                    <ChevronRight size={20} />
                  </button>
                </div>
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
                  <span className="text-3xl">💭</span>
                </motion.div>

                <h3 className="text-xl font-bold text-white mb-4">Their Words Live On</h3>

                <div className="bg-white/5 rounded-xl p-6 max-w-sm border border-white/10 mb-6">
                  <p className="text-white/80 leading-relaxed">
                    These letters remind us that history was lived by real people - with hopes, fears, and families waiting at home. Behind every statistic was a story.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-sm w-full mb-6">
                  {LETTERS.map(letter => (
                    <div key={letter.id} className="bg-amber-500/10 rounded-xl p-3 text-center border border-amber-500/20">
                      <span className="text-2xl">{letter.icon}</span>
                      <p className="text-white/60 text-xs mt-1">{letter.soldierName.split(' ')[1]}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-amber-500/10 rounded-xl p-4 max-w-sm border border-amber-500/30">
                  <p className="text-amber-200 text-sm italic">
                    "A letter from home was worth more than anything."
                  </p>
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
              beatTitle="Letters Home"
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-6xl mb-6">✉️</motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Beat 9 Complete!</h2>
              <p className="text-white/60 mb-6">Letters Home - Voices from the Front</p>
              <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/20 rounded-full mb-8">
                <Sparkles className="text-amber-400" />
                <span className="text-amber-400 font-bold text-xl">+{skipped ? 0 : LESSON_DATA.xpReward} XP</span>
              </div>
              <p className="text-white/50 text-sm text-center max-w-sm">
                Next: The Things They Carried - Explore personal items soldiers brought to war.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

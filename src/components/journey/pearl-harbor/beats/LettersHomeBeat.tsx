/**
 * Beat 12: Letters Home - Voices from the Front
 * Format: Primary Source Audio (Reusable type)
 * XP: 50 | Duration: 5-6 min
 *
 * V-Mail Archive Aesthetic - Redesigned with:
 * - Parchment gradients and noise textures
 * - SVG service insignia (anchor, heart, medal, poppy)
 * - Audio waveform player
 * - Censor stamps and cursive signatures
 * - Memorial completion with soldier fate cards
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, AlertTriangle } from 'lucide-react';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, PostModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig, type PostModuleVideoConfig } from '@/lib/firestore';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

// ═══════════════════════════════════════════════════════════
// SVG INSIGNIA COMPONENTS
// ═══════════════════════════════════════════════════════════

const AnchorInsignia = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="32" cy="10" r="5" />
    <line x1="32" y1="15" x2="32" y2="54" strokeWidth="3" strokeLinecap="round" />
    <line x1="20" y1="22" x2="44" y2="22" strokeLinecap="round" />
    <path d="M 12,42 Q 12,54 32,54 Q 52,54 52,42" strokeWidth="3" strokeLinecap="round" />
    <path d="M 12,42 L 8,38 M 12,42 L 17,41" strokeLinecap="round" />
    <path d="M 52,42 L 56,38 M 52,42 L 47,41" strokeLinecap="round" />
  </svg>
);

const HeartInsignia = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M 32,54 Q 10,38 10,22 Q 10,10 20,10 Q 28,10 32,18 Q 36,10 44,10 Q 54,10 54,22 Q 54,38 32,54 Z" />
    <rect x="22" y="22" width="20" height="14" strokeWidth="1.5" />
    <circle cx="28" cy="28" r="1.5" fill="currentColor" />
    <path d="M 24,32 L 32,26 L 40,32 L 40,34 L 24,34 Z" fill="currentColor" />
  </svg>
);

const MedalInsignia = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} fill="currentColor" stroke="currentColor" strokeWidth="2.5">
    <path d="M 22,6 L 32,26 L 42,6 L 38,6 L 32,18 L 26,6 Z" />
    <circle cx="32" cy="40" r="14" fill="none" />
    <path d="M 32,30 L 34.5,37 L 42,37 L 36,41 L 38,48 L 32,44 L 26,48 L 28,41 L 22,37 L 29.5,37 Z" />
  </svg>
);

const PoppyInsignia = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className}>
    <path
      d="M 32,18 Q 18,10 14,22 Q 12,32 22,34 Q 14,38 16,48 Q 22,52 32,44 Q 42,52 48,48 Q 50,38 42,34 Q 52,32 50,22 Q 46,10 32,18 Z"
      fill="currentColor"
      opacity="0.85"
    />
    <circle cx="32" cy="32" r="6" fill="#1a0804" />
    <circle cx="30" cy="30" r="1" fill="#2a1808" />
    <circle cx="34" cy="31" r="0.8" fill="#2a1808" />
    <circle cx="32" cy="34" r="0.8" fill="#2a1808" />
  </svg>
);

// ═══════════════════════════════════════════════════════════
// AUDIO WAVEFORM COMPONENT
// ═══════════════════════════════════════════════════════════

const AudioWaveform = ({ progress, barCount = 36 }: { progress: number; barCount?: number }) => {
  // Generate static wave pattern heights
  const heights = useRef<number[]>([]);
  if (heights.current.length === 0) {
    heights.current = Array.from({ length: barCount }, () => 20 + Math.random() * 70);
  }

  const playedBars = Math.floor((progress / 100) * barCount);

  return (
    <div className="flex items-center gap-[2px] h-7 flex-1 min-w-0">
      {heights.current.map((height, i) => (
        <div
          key={i}
          className={`flex-1 max-w-[6px] min-w-[2px] rounded-[1px] transition-colors ${
            i < playedBars
              ? 'bg-[#701419]'
              : i === playedBars
                ? 'bg-[#9c1c1f] shadow-[0_0_6px_#9c1c1f]'
                : 'bg-[#5a3818]'
          }`}
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// PARCHMENT NOISE TEXTURE (SVG DATA URI)
// ═══════════════════════════════════════════════════════════

const PARCHMENT_NOISE = `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='p'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.26 0 0 0 0 0.1 0 0 0 0.2 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23p)'/%3E%3C/svg%3E")`;

// ═══════════════════════════════════════════════════════════
// SCREEN & LETTER TYPES
// ═══════════════════════════════════════════════════════════

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
  id: 'ph-beat-10',
  xpReward: 50,
};

interface SoldierLetter {
  id: string;
  screenId: Screen;
  soldierName: string;
  rank: string;
  unit: string;
  ship: string;
  date: string;
  dateLabel: string;
  location: string;
  recipient: string;
  excerpt: string;
  greeting: string;
  fullText: string[];
  signature: string;
  signatureName: string;
  context: string;
  fate: 'kia' | 'survived';
  fateDate?: string;
  InsigniaComponent: React.FC<{ className?: string }>;
}

const LETTERS: SoldierLetter[] = [
  {
    id: 'barsky',
    screenId: 'barsky-letter',
    soldierName: 'Joseph Barsky',
    rank: 'Private',
    unit: 'U.S. Navy',
    ship: 'USS Arizona',
    date: 'December 5, 1941',
    dateLabel: '2 days before',
    location: 'Pearl Harbor',
    recipient: 'Mrs. Alma Barsky',
    excerpt: 'The weather here is beautiful, and I am getting along fine...',
    greeting: 'Dear Mother,',
    fullText: [
      'The weather here is beautiful, and I am getting along fine. We had liberty yesterday and I went to Honolulu. It is a pretty city but I would rather be home.',
      'I hope you are feeling better and taking care of yourself. Don\'t worry about me. The Navy takes good care of us and the food is pretty good.',
      'I am sending you some money from my pay. Please use it for whatever you need. **I know things have been hard since Dad passed.**',
      'The ship is a good one and the fellows are swell. We have drills every day but there is also time to swim and enjoy the island.',
      '*I miss you and the family. Kiss the kids for me.*'
    ],
    signature: 'Your loving son,',
    signatureName: 'Joseph',
    context: 'Pvt. Joseph Barsky was killed in action two days later when the USS Arizona was struck by a Japanese bomb that detonated the forward ammunition magazine. He was one of 1,177 sailors lost on the ship.',
    fate: 'kia',
    fateDate: 'Dec 7, 1941',
    InsigniaComponent: AnchorInsignia,
  },
  {
    id: 'adelman',
    screenId: 'adelman-letter',
    soldierName: 'Harvey Adelman',
    rank: 'Seaman First Class',
    unit: 'U.S. Navy',
    ship: 'USS West Virginia',
    date: 'December 6, 1941',
    dateLabel: '1 day before',
    location: 'Pearl Harbor',
    recipient: 'Ruth Adelman',
    excerpt: 'I dream of you every night, and the boys tease me for it...',
    greeting: 'My Dearest Ruth,',
    fullText: [
      'I dream of you every night and count the days until I can hold you again. The Pacific is beautiful but nothing compares to your smile.',
      'The fellows here talk about their girls back home. I always say I have the best one waiting for me. They don\'t believe me until I show them your picture.',
      'We have been busy with exercises but the officers say everything is peaceful. I hope to get leave for Christmas. **Imagine - our first Christmas as husband and wife!**',
      'Keep writing to me. Your letters are the best part of my day. When the mail comes, every sailor rushes to see if there\'s something from home.',
      '*I love you more than words can say.*'
    ],
    signature: 'Forever yours,',
    signatureName: 'Harvey',
    context: 'Seaman Adelman was killed in action on December 7, 1941 when the USS West Virginia was struck by multiple torpedoes and bombs during the attack.',
    fate: 'kia',
    fateDate: 'Dec 7, 1941',
    InsigniaComponent: HeartInsignia,
  },
  {
    id: 'james',
    screenId: 'james-letter',
    soldierName: 'Wendell James',
    rank: 'Mess Attendant 2nd Class',
    unit: 'U.S. Navy',
    ship: 'USS Nevada',
    date: 'December 4, 1941',
    dateLabel: '3 days before',
    location: 'Pearl Harbor',
    recipient: 'Mr. William James',
    excerpt: 'They say we might see action. I am ready if it comes...',
    greeting: 'Dear Father,',
    fullText: [
      'They say we might see action soon. I don\'t know what to expect but I am ready to do my duty. You raised me to be brave and I won\'t let you down.',
      'The Navy is different for men like us. We serve in the mess but we are still part of the crew. Some of the white sailors have become my friends. **We are all Americans here.**',
      'I have been learning to man an anti-aircraft gun in my spare time. The gunner\'s mate says I am a natural. Maybe someday they will let me serve at a gun station.',
      'Please tell Mama I am eating well. The cooks here are good, though not as good as her Sunday dinners.',
      '*I pray for the family every night.*'
    ],
    signature: 'Your son,',
    signatureName: 'Wendell',
    context: 'During the attack, African American sailors like James often took up weapons despite not being trained for combat roles. Their bravery helped change military attitudes toward integration.',
    fate: 'survived',
    InsigniaComponent: MedalInsignia,
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
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Letters read tracking
  const [lettersRead, setLettersRead] = useState<Set<string>>(new Set());

  // Audio URLs and reader names from Firestore
  const [audioUrls, setAudioUrls] = useState<Record<string, string>>({});
  const [readerNames, setReaderNames] = useState<Record<string, string>>({});

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
    if (hasLoadedConfig && screen !== 'completion') {
      saveCheckpoint({
        lessonId: LESSON_DATA.id,
        screen,
        screenIndex: SCREENS.indexOf(screen),
        timestamp: Date.now(),
        state: { lettersRead: Array.from(lettersRead) },
      });
    }
  }, [hasLoadedConfig, screen, saveCheckpoint, lettersRead]);

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

      // Get Letters Home audio from lettersHomeAudio collection
      const lettersHomeAudio = assets?.lettersHomeAudio;
      if (lettersHomeAudio) {
        const urls: Record<string, string> = {};
        const readers: Record<string, string> = {};
        LETTERS.forEach(letter => {
          const config = lettersHomeAudio[letter.id];
          if (config?.audioUrl) {
            urls[letter.id] = config.audioUrl;
          }
          if (config?.readerName) {
            readers[letter.id] = config.readerName;
          }
        });
        setAudioUrls(urls);
        setReaderNames(readers);
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

  // Audio cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const playAudio = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioRef.current = new Audio(url);
    audioRef.current.muted = isMuted;
    audioRef.current.play();
    setIsPlaying(true);

    audioRef.current.onloadedmetadata = () => {
      if (audioRef.current) {
        setAudioDuration(audioRef.current.duration);
      }
    };

    audioRef.current.ontimeupdate = () => {
      if (audioRef.current) {
        setAudioCurrentTime(audioRef.current.currentTime);
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };

    audioRef.current.onended = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setAudioCurrentTime(0);
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
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioProgress(0);
    }

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

  // Render text with markdown-style bold (**) and italic (*)
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-[#701419] font-serif">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-[#3a1e0a]">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Warm atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(60,35,12,0.35) 0%, transparent 55%),
            radial-gradient(ellipse at 20% 85%, rgba(138,10,14,0.08) 0%, transparent 45%)
          `
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/10">
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-gold transition-colors">
          <ArrowLeft size={22} />
        </button>
        <div className="flex-1 text-center flex flex-col items-center gap-0.5">
          <h1 className="font-oswald font-black text-[26px] tracking-[0.035em] uppercase text-off-white leading-none">
            Letters Home
          </h1>
          <span className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase font-semibold">
            Beat <em className="text-gold not-italic font-bold">9</em> of 13
          </span>
        </div>
        <div className="w-9 h-9 rounded-full border border-gold/20 overflow-hidden bg-gradient-to-br from-[#5a3818] to-[#2a1808] flex items-center justify-center">
          {host.imageUrl ? (
            <img src={host.imageUrl} alt={host.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-oswald font-bold text-sm text-gold">{host.name[0]}</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 h-[3px] bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-deep via-gold to-gold-bright"
          style={{ boxShadow: '0 0 8px rgba(230,171,42,0.5)' }}
          animate={{ width: `${((SCREENS.indexOf(screen) + 1) / SCREENS.length) * 100}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10">
        <AnimatePresence mode="wait">
          {/* PRE-MODULE VIDEO */}
          {screen === 'pre-video' && preModuleVideoConfig && (
            <PreModuleVideoScreen
              config={preModuleVideoConfig}
              beatTitle="Letters Home"
              onComplete={() => setScreen('intro')}
            />
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SCREEN 1: INTRO                                              */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {screen === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-full"
            >
              <div className="flex-1 flex flex-col items-center text-center px-6 py-8">
                {/* Kick label */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2.5 mb-4"
                >
                  <div className="w-5 h-px bg-gold" />
                  <span className="font-mono text-[10px] tracking-[0.4em] text-gold font-bold uppercase">
                    Scene · V-Mail <em className="text-ha-red not-italic">Archive</em>
                  </span>
                  <div className="w-5 h-px bg-gold" />
                </motion.div>

                {/* Title */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="font-playfair italic text-[44px] sm:text-[48px] text-off-white leading-none tracking-tight mb-3"
                >
                  Voices from <em className="text-gold">the front.</em>
                </motion.h1>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="font-cormorant italic text-[17px] text-white/70 max-w-[500px] leading-relaxed mb-6"
                >
                  Soldiers wrote letters home in the days before and after December 7. The words survived when the men didn't. Read them the way their mothers did.
                </motion.p>

                {/* Stacked V-Mail letters */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="relative w-full max-w-[420px] h-[280px] mb-6"
                >
                  {/* Background letters */}
                  <div
                    className="absolute inset-0 rounded"
                    style={{
                      transform: 'rotate(-3.5deg) translate(-18px, 14px)',
                      background: 'radial-gradient(ellipse at 25% 15%, #f2e4bd 0%, #e8d49c 55%, #d6b478 100%)',
                      opacity: 0.45,
                      filter: 'blur(0.5px)',
                      boxShadow: '0 14px 30px rgba(0,0,0,0.55)'
                    }}
                  />
                  <div
                    className="absolute inset-0 rounded"
                    style={{
                      transform: 'rotate(2deg) translate(12px, 8px)',
                      background: 'radial-gradient(ellipse at 25% 15%, #f2e4bd 0%, #e8d49c 55%, #d6b478 100%)',
                      opacity: 0.7,
                      boxShadow: '0 14px 30px rgba(0,0,0,0.55)'
                    }}
                  />

                  {/* Front letter */}
                  <div
                    className="absolute inset-0 rounded overflow-hidden"
                    style={{
                      transform: 'rotate(-0.8deg)',
                      background: 'radial-gradient(ellipse at 25% 15%, #f2e4bd 0%, #e8d49c 55%, #d6b478 100%)',
                      boxShadow: 'inset 0 0 40px rgba(120,80,30,0.15), 0 14px 30px rgba(0,0,0,0.55)'
                    }}
                  >
                    {/* Noise texture */}
                    <div
                      className="absolute inset-0 mix-blend-multiply opacity-50 pointer-events-none"
                      style={{ backgroundImage: PARCHMENT_NOISE }}
                    />

                    <div className="relative z-10 p-5 h-full flex flex-col">
                      {/* V-MAIL stamp */}
                      <div
                        className="absolute top-4 left-4 w-12 h-14 flex flex-col items-center justify-center"
                        style={{
                          background: '#9c1c1f',
                          border: '1px solid #701419',
                          boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3)',
                          transform: 'rotate(-6deg)'
                        }}
                      >
                        <div
                          className="absolute inset-[-3px] border-2 border-dashed border-[#9c1c1f] opacity-50"
                        />
                        <span className="font-playfair italic text-[24px] text-[#fef0d0] leading-none mb-0.5">V</span>
                        <span className="font-mono text-[7px] tracking-[0.2em] text-[#fef0d0] font-bold uppercase">Mail</span>
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start pl-16 mb-3">
                        <span className="font-mono text-[8px] tracking-[0.3em] text-[#5a3818] uppercase font-bold opacity-70">
                          Sender · Dispatch No. 331
                        </span>
                        <div className="text-right">
                          <div className="font-cormorant italic text-[17px] text-[#2a1608] font-bold">Dec. 3, 1941</div>
                          <div className="font-cormorant italic text-[13px] text-[#5a3818]">Hickam Field, Oahu</div>
                        </div>
                      </div>

                      {/* Divider */}
                      <div
                        className="h-px mb-3 opacity-40"
                        style={{ background: 'repeating-linear-gradient(90deg, #5a3818 0, #5a3818 4px, transparent 4px, transparent 8px)' }}
                      />

                      {/* Body */}
                      <div className="font-cormorant italic text-[20px] text-[#2a1608] font-bold mb-2">
                        My dearest Mary,
                      </div>
                      <div className="font-['Special_Elite',monospace] text-[12px] text-[#3a1e0a] leading-relaxed">
                        The island is peaceful tonight. I can hear the Pacific from my bunk. The men joke about how soft we have it here compared to the boys in Europe. I told Tommy not to worry about me; there's nothing out here for a thousand miles...
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom CTA */}
              <div className="px-6 pb-6 pt-4 bg-gradient-to-t from-black via-black/95 to-transparent">
                <div className="flex flex-col items-center gap-3 max-w-sm mx-auto">
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    onClick={nextScreen}
                    className="relative w-full py-4 px-8 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                      color: '#1a0b02',
                      borderRadius: '6px',
                      boxShadow: '0 8px 22px rgba(230,171,42,0.3), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 4px rgba(138,80,20,0.3)'
                    }}
                  >
                    <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-l-[1.5px] border-t-[1.5px] border-ha-red" />
                    <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-ha-red" />
                    <span className="font-oswald font-black text-[14px] tracking-[0.3em] uppercase">Read Their Words</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </motion.button>

                  <button
                    onClick={() => { setSkipped(true); onSkip(); }}
                    className="font-mono text-[9px] tracking-[0.3em] text-white/30 uppercase font-semibold hover:text-white/50 transition-colors py-2"
                  >
                    Skip this beat
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SCREEN 2: LETTER SELECT                                      */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {screen === 'letter-select' && (
            <motion.div
              key="letter-select"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-full p-5"
            >
              {/* Header */}
              <div className="text-center mb-5">
                <div className="flex items-center justify-center gap-2.5 mb-2">
                  <div className="w-4 h-px bg-gold" />
                  <span className="font-mono text-[9px] tracking-[0.4em] text-gold font-bold uppercase">
                    Choose Your Correspondent
                  </span>
                  <div className="w-4 h-px bg-gold" />
                </div>
                <h2 className="font-playfair italic text-[34px] text-off-white leading-none">
                  Choose <em className="text-gold">a letter</em>
                </h2>
                <p className="font-cormorant italic text-[15px] text-white/50 mt-1">
                  Tap a name to hear their story.
                </p>
              </div>

              {/* Letter cards */}
              <div className="flex-1 space-y-3">
                {LETTERS.map((letter, index) => (
                  <motion.button
                    key={letter.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => goToLetter(letter.screenId)}
                    className="w-full text-left rounded overflow-hidden transition-all hover:translate-y-[-2px]"
                    style={{
                      background: 'radial-gradient(ellipse at 15% 20%, #f2e4bd 0%, #e8d49c 55%, #d6b478 100%)',
                      border: '1px solid rgba(90,56,24,0.3)',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.4), inset 0 0 30px rgba(120,80,30,0.1)'
                    }}
                  >
                    {/* Noise overlay */}
                    <div
                      className="absolute inset-0 mix-blend-multiply opacity-45 pointer-events-none"
                      style={{ backgroundImage: PARCHMENT_NOISE }}
                    />

                    <div className="relative flex">
                      {/* Left: Insignia */}
                      <div
                        className="w-[100px] flex-shrink-0 flex items-center justify-center py-5 border-r border-dashed border-[#5a3818]/30"
                        style={{ background: 'linear-gradient(180deg, rgba(200,156,80,0.15), rgba(160,120,60,0.2))' }}
                      >
                        <letter.InsigniaComponent className="w-14 h-14 text-[#701419]" />
                      </div>

                      {/* Center: Info */}
                      <div className="flex-1 py-4 px-5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-playfair text-[22px] text-[#2a1608] leading-tight">
                            {letter.soldierName}
                          </span>
                          {lettersRead.has(letter.id) && (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[8px] tracking-[0.25em] text-[#2a5a2a] uppercase font-bold rounded-sm"
                              style={{
                                border: '1px solid rgba(42,90,42,0.4)',
                                background: 'rgba(42,90,42,0.12)'
                              }}
                            >
                              ✓ Read
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-[10px] tracking-[0.2em] text-[#701419] uppercase font-bold">
                          {letter.rank}
                        </div>
                        <div className="font-cormorant italic text-[14px] text-[#5a3818] mt-0.5">
                          {letter.ship} · Pearl Harbor
                        </div>
                        <div
                          className="font-['Special_Elite',monospace] text-[12px] text-[#3a1e0a] leading-relaxed mt-2 pt-2"
                          style={{ borderTop: '0.5px solid rgba(90,56,24,0.3)' }}
                        >
                          "{letter.excerpt}"
                        </div>
                      </div>

                      {/* Right: Date & chevron */}
                      <div className="flex flex-col items-end justify-between py-4 px-4 min-w-[110px]">
                        <div className="text-right">
                          <div className="font-mono text-[9px] tracking-[0.2em] text-[#701419] uppercase font-bold">
                            {letter.date.split(', ')[0].split(' ')[0]} {letter.date.split(' ')[1]}
                          </div>
                          <div className="font-cormorant italic text-[12px] text-[#5a3818]">
                            {letter.dateLabel}
                          </div>
                        </div>
                        <span className="font-playfair text-[26px] text-[#5a3818] transition-transform group-hover:translate-x-1">
                          ›
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Continue or progress */}
              <div className="pt-4 pb-6">
                {lettersRead.size === LETTERS.length ? (
                  <button
                    onClick={() => setScreen('reflection')}
                    className="w-full py-4 flex items-center justify-center gap-3"
                    style={{
                      background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                      color: '#1a0b02',
                      borderRadius: '6px',
                      boxShadow: '0 6px 18px rgba(230,171,42,0.3)'
                    }}
                  >
                    <span className="font-oswald font-black text-[13px] tracking-[0.28em] uppercase">Continue</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <path d="M5 12h14M13 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <p className="text-center font-mono text-[10px] tracking-[0.2em] text-white/40 uppercase">
                    {lettersRead.size} of {LETTERS.length} letters read
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SCREEN 3: LETTER DETAIL                                      */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {currentLetter && (
            <motion.div
              key={currentLetter.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-full p-5 gap-3"
            >
              {/* Meta header */}
              <div
                className="relative rounded overflow-hidden"
                style={{
                  background: 'radial-gradient(ellipse at 20% 20%, #f2e4bd, #e8d49c 70%, #d6b478)',
                  border: '1px solid rgba(90,56,24,0.35)',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.45)'
                }}
              >
                <div
                  className="absolute inset-0 mix-blend-multiply opacity-40 pointer-events-none"
                  style={{ backgroundImage: PARCHMENT_NOISE }}
                />
                <div className="relative flex items-center gap-4 p-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      border: '2px solid #9c1c1f',
                      background: 'rgba(156,28,31,0.08)'
                    }}
                  >
                    <currentLetter.InsigniaComponent className="w-8 h-8 text-[#701419]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-playfair italic text-[24px] text-[#2a1608] leading-tight">
                      {currentLetter.soldierName}
                    </div>
                    <div className="font-mono text-[10px] tracking-[0.22em] text-[#701419] uppercase font-bold">
                      {currentLetter.rank} · {currentLetter.unit}
                    </div>
                    <div className="font-cormorant italic text-[13px] text-[#5a3818]">
                      {currentLetter.ship} · Battleship Row, Pearl Harbor
                    </div>
                    <div className="font-cormorant italic text-[12px] text-[#5a3818] mt-0.5">
                      Written {currentLetter.date}
                    </div>
                  </div>
                  <div
                    className="px-3 py-1.5 font-oswald font-black text-[10px] tracking-[0.22em] text-[#701419] uppercase flex-shrink-0"
                    style={{
                      border: '2px solid #9c1c1f',
                      transform: 'rotate(-4deg)',
                      background: 'rgba(156,28,31,0.05)'
                    }}
                  >
                    Archive · NARA
                  </div>
                </div>
              </div>

              {/* Audio player */}
              <div
                className="relative rounded overflow-hidden"
                style={{
                  background: 'radial-gradient(ellipse at 10% 15%, #e8d49c, #d6b478 70%, #a88848)',
                  border: '1px solid rgba(90,56,24,0.4)',
                  boxShadow: '0 10px 28px rgba(0,0,0,0.5)'
                }}
              >
                <div
                  className="absolute inset-0 mix-blend-multiply opacity-60 pointer-events-none"
                  style={{ backgroundImage: PARCHMENT_NOISE }}
                />
                <div className="relative p-5">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-dashed border-[#5a3818]/40">
                    <div className="flex items-center gap-2 font-mono text-[9px] tracking-[0.35em] text-[#9c1c1f] uppercase font-bold">
                      <span className="text-[7px]">◆</span>
                      Archive Recording{readerNames[currentLetter.id] ? ` · Read by ${readerNames[currentLetter.id]}` : ''}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.2em] text-[#5a3818] uppercase font-bold">
                      <strong className="text-[#701419]">{formatTime(audioCurrentTime)}</strong>
                      <span className="opacity-50 mx-1">/</span>
                      {formatTime(audioDuration || 138)}
                    </div>
                  </div>

                  {/* Player body */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => audioUrls[currentLetter.id] && toggleAudio(audioUrls[currentLetter.id])}
                      disabled={!audioUrls[currentLetter.id]}
                      className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105"
                      style={{
                        background: audioUrls[currentLetter.id]
                          ? 'radial-gradient(circle at 35% 30%, #fef0d0 0%, #9c1c1f 40%, #701419 100%)'
                          : 'rgba(90,56,24,0.3)',
                        border: '2px solid #701419',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.3)'
                      }}
                    >
                      {isPlaying ? (
                        <Pause size={22} className="text-[#fef0d0]" fill="#fef0d0" />
                      ) : (
                        <Play size={22} className="text-[#fef0d0] ml-0.5" fill="#fef0d0" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-playfair italic text-[16px] text-[#2a1608]">
                          {currentLetter.soldierName.split(' ')[1]} to {currentLetter.recipient.split(' ')[0] === 'Mrs.' ? 'his mother' : currentLetter.recipient}
                        </span>
                      </div>
                      <AudioWaveform progress={audioProgress} />
                    </div>

                    <button
                      onClick={toggleMute}
                      className="w-8 h-8 flex items-center justify-center text-[#5a3818] hover:text-[#701419] transition-colors"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                  </div>

                  {/* Caption */}
                  {readerNames[currentLetter.id] && (
                    <div className="mt-3 pt-3 border-t border-dashed border-[#5a3818]/30 text-center font-cormorant italic text-[12px] text-[#5a3818]">
                      — Letter voiced by {readerNames[currentLetter.id]}
                    </div>
                  )}
                </div>
              </div>

              {/* Letter page */}
              <div
                className="relative rounded overflow-hidden flex-1"
                style={{
                  background: 'radial-gradient(ellipse at 20% 15%, #f2e4bd 0%, #e8d49c 55%, #d6b478 100%)',
                  border: '1px solid rgba(90,56,24,0.35)',
                  boxShadow: '0 18px 40px rgba(0,0,0,0.55), inset 0 0 40px rgba(120,80,30,0.12)'
                }}
              >
                <div
                  className="absolute inset-0 mix-blend-multiply opacity-45 pointer-events-none"
                  style={{ backgroundImage: PARCHMENT_NOISE }}
                />

                {/* Censor stamp */}
                <div
                  className="absolute top-4 right-4 z-10 px-2.5 py-1 font-oswald font-black text-[9px] tracking-[0.22em] text-[#1a4a1a] uppercase"
                  style={{
                    border: '2px solid #2a5a2a',
                    transform: 'rotate(4deg)',
                    background: 'rgba(42,90,42,0.08)'
                  }}
                >
                  Passed
                  <span className="block font-mono text-[6.5px] tracking-[0.15em] mt-0.5 opacity-80 font-bold">
                    U.S. Navy Censor · 1941
                  </span>
                </div>

                <div className="relative z-5 p-6 sm:p-8">
                  {/* Dateline */}
                  <div className="flex justify-end mb-4">
                    <div className="text-right">
                      <div className="font-cormorant italic text-[14px] text-[#5a3818]">{currentLetter.date}</div>
                      <div className="font-cormorant italic text-[15px] text-[#2a1608] font-bold">{currentLetter.ship}, Pearl Harbor</div>
                    </div>
                  </div>

                  {/* Greeting */}
                  <div className="font-cormorant italic font-bold text-[20px] text-[#2a1608] mb-3">
                    {currentLetter.greeting}
                  </div>

                  {/* Body */}
                  <div className="font-['Special_Elite',monospace] text-[13px] text-[#3a1e0a] leading-[1.75] tracking-wide">
                    {currentLetter.fullText.map((para, i) => (
                      <p key={i} className="mb-3">{renderText(para)}</p>
                    ))}
                  </div>

                  {/* Signature */}
                  <div className="mt-4">
                    <div className="font-['Special_Elite',monospace] text-[13px] text-[#3a1e0a]">
                      {currentLetter.signature}
                    </div>
                    <div
                      className="font-['Caveat',cursive] text-[26px] text-[#1a2a5a] mt-1 inline-block"
                      style={{ transform: 'rotate(-2deg)' }}
                    >
                      {currentLetter.signatureName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical context */}
              <div
                className="flex items-center gap-3 p-4 rounded-r"
                style={{
                  background: 'linear-gradient(90deg, rgba(138,10,14,0.1), rgba(138,10,14,0.04))',
                  borderLeft: '3px solid #8a0a0e'
                }}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    border: '1.5px solid #E84046',
                    background: 'rgba(205,14,20,0.1)'
                  }}
                >
                  <AlertTriangle size={18} className="text-[#E84046]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[8.5px] tracking-[0.3em] text-[#E84046] uppercase font-bold mb-1">
                    ◆ Historical Record
                  </div>
                  <p className="font-cormorant italic text-[13px] text-white/70 leading-relaxed">
                    {currentLetter.context.split('**').map((part, i) =>
                      i % 2 === 1 ? <strong key={i} className="text-off-white font-bold">{part}</strong> : part
                    )}
                  </p>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-3 pt-2 pb-4">
                <button
                  onClick={() => setScreen('letter-select')}
                  className="flex-1 py-3.5 flex items-center justify-center gap-2 rounded-md font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase font-bold transition-colors hover:text-gold hover:border-gold/40"
                  style={{
                    background: 'rgba(20,14,8,0.55)',
                    border: '1px solid rgba(230,171,42,0.15)'
                  }}
                >
                  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  Back to Letters
                </button>
                <button
                  onClick={nextScreen}
                  className="relative flex-[2] py-3.5 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                    color: '#1a0b02',
                    borderRadius: '6px',
                    boxShadow: '0 6px 18px rgba(230,171,42,0.3)'
                  }}
                >
                  <span className="absolute top-[-1px] left-[-1px] w-2 h-2 border-l-[1.5px] border-t-[1.5px] border-ha-red" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2 h-2 border-r-[1.5px] border-b-[1.5px] border-ha-red" />
                  <span className="font-oswald font-black text-[13px] tracking-[0.28em] uppercase">Continue</span>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* SCREEN 4: REFLECTION / COMPLETION                            */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {screen === 'reflection' && (
            <motion.div
              key="reflection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col min-h-full p-5"
            >
              <div className="flex-1 flex flex-col items-center gap-5 pt-4">
                {/* Memorial poppy */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative w-24 h-24 flex items-center justify-center"
                >
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '2px solid #9c1c1f',
                      background: 'radial-gradient(circle, rgba(156,28,31,0.12), rgba(156,28,31,0.02))',
                      boxShadow: '0 0 30px rgba(205,14,20,0.25), inset 0 0 20px rgba(156,28,31,0.2)'
                    }}
                  >
                    <div
                      className="absolute inset-[6px] rounded-full border border-dashed border-[#9c1c1f] opacity-45"
                    />
                  </div>
                  <PoppyInsignia className="relative w-12 h-12 text-[#9c1c1f]" />
                </motion.div>

                {/* Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2.5 mb-2">
                    <div className="w-5 h-px bg-[#E84046]" />
                    <span className="font-mono text-[10px] tracking-[0.4em] text-[#E84046] font-bold uppercase">
                      In Memoriam
                    </span>
                    <div className="w-5 h-px bg-[#E84046]" />
                  </div>
                  <h2 className="font-playfair italic text-[42px] text-off-white leading-none">
                    Their words <em className="text-gold">live on.</em>
                  </h2>
                </div>

                {/* Reflection memo */}
                <div
                  className="relative w-full rounded overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at 20% 15%, #f2e4bd, #e8d49c 70%, #d6b478)',
                    border: '1px solid rgba(90,56,24,0.35)',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
                  }}
                >
                  <div
                    className="absolute inset-0 mix-blend-multiply opacity-45 pointer-events-none"
                    style={{ backgroundImage: PARCHMENT_NOISE }}
                  />
                  <div
                    className="absolute inset-[6px] border border-dashed border-[#5a3818]/50 pointer-events-none"
                  />
                  <div className="relative p-5 text-center">
                    <div className="font-mono text-[9px] tracking-[0.35em] text-[#9c1c1f] uppercase font-bold mb-2 flex items-center justify-center gap-2">
                      <span className="text-[7px]">◆</span>
                      Remembered
                    </div>
                    <p className="font-cormorant italic text-[17px] text-[#2a1608] leading-relaxed">
                      These letters remind us that history was lived by real people — with hopes, fears, and families waiting at home. Behind every statistic was a story.
                    </p>
                  </div>
                </div>

                {/* Soldier fate cards */}
                <div className="w-full grid grid-cols-3 gap-2.5">
                  {LETTERS.map(letter => (
                    <div
                      key={letter.id}
                      className="relative rounded overflow-hidden"
                      style={{
                        background: 'radial-gradient(ellipse at 30% 20%, #f2e4bd, #e8d49c 65%, #d6b478)',
                        border: '1px solid rgba(90,56,24,0.35)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
                      }}
                    >
                      <div
                        className="absolute inset-0 mix-blend-multiply opacity-45 pointer-events-none"
                        style={{ backgroundImage: PARCHMENT_NOISE }}
                      />
                      <div className="relative flex flex-col items-center gap-2 p-4">
                        <letter.InsigniaComponent className="w-10 h-10 text-[#701419]" />
                        <div className="font-playfair italic text-[18px] text-[#2a1608]">
                          {letter.soldierName.split(' ')[1]}
                        </div>
                        <div className="font-cormorant italic text-[11px] text-[#5a3818] text-center leading-tight">
                          {letter.rank}<br/>{letter.ship}
                        </div>
                        <div
                          className="font-mono text-[8px] tracking-[0.25em] font-bold uppercase px-2 py-1 mt-1"
                          style={{
                            color: letter.fate === 'kia' ? '#701419' : '#1a5a1a',
                            border: `1px solid ${letter.fate === 'kia' ? '#9c1c1f' : '#2a5a2a'}`,
                            background: letter.fate === 'kia' ? 'rgba(156,28,31,0.08)' : 'rgba(42,90,42,0.08)'
                          }}
                        >
                          {letter.fate === 'kia' ? `Killed ${letter.fateDate}` : 'Survived'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Closing quote */}
                <div
                  className="w-full p-4 rounded text-center"
                  style={{
                    background: 'rgba(60,35,12,0.2)',
                    border: '1px solid rgba(230,171,42,0.25)'
                  }}
                >
                  <span className="font-playfair text-[28px] text-gold opacity-50">"</span>
                  <span className="font-cormorant italic font-bold text-[18px] text-gold mx-2 leading-tight">
                    A letter from home was worth more than anything.
                  </span>
                  <span className="font-playfair text-[28px] text-gold opacity-50">"</span>
                </div>
              </div>

              {/* Complete button */}
              <div className="pt-4 pb-6">
                <button
                  onClick={nextScreen}
                  className="relative w-full py-4 flex items-center justify-center gap-3"
                  style={{
                    background: 'linear-gradient(180deg, #F6E355 0%, #E6AB2A 45%, #B2641F 100%)',
                    color: '#1a0b02',
                    borderRadius: '6px',
                    boxShadow: '0 8px 22px rgba(230,171,42,0.3)'
                  }}
                >
                  <span className="absolute top-[-1px] left-[-1px] w-2.5 h-2.5 border-l-[1.5px] border-t-[1.5px] border-ha-red" />
                  <span className="absolute bottom-[-1px] right-[-1px] w-2.5 h-2.5 border-r-[1.5px] border-b-[1.5px] border-ha-red" />
                  <span className="font-oswald font-black text-[14px] tracking-[0.3em] uppercase">Complete Beat</span>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
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
            <XPCompletionScreen
              beatNumber={9}
              beatTitle="Letters Home"
              xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
              host={host}
              onContinue={() => {
                clearCheckpoint();
                onComplete(skipped ? 0 : LESSON_DATA.xpReward);
              }}
              nextBeatPreview="The Things They Carried - Explore personal items soldiers brought to war"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/**
 * VoicedLetterPlayer - Hook 4: Listen to Jane Colestock's firsthand account
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, SkipForward } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay } from '../shared/HostNarration';

interface VoicedLetterPlayerProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface LetterSegment {
  id: string;
  text: string;
  emotion: 'fear' | 'hope' | 'courage' | 'sorrow';
  duration: number;
}

const LETTER_SEGMENTS: LetterSegment[] = [
  {
    id: '1',
    text: "Dear Mother, I must tell you about Sunday morning. We were still in bed when we heard the most terrible explosions.",
    emotion: 'fear',
    duration: 8,
  },
  {
    id: '2',
    text: "The sirens started wailing and my husband jumped up. He said 'This is the real thing' and ran out the door still in his pajamas.",
    emotion: 'fear',
    duration: 9,
  },
  {
    id: '3',
    text: "I watched him run toward the harbor. The sky was filled with planes - so many planes. Black smoke was rising everywhere.",
    emotion: 'sorrow',
    duration: 8,
  },
  {
    id: '4',
    text: "The children were crying. I gathered them close and we hid under the kitchen table. The house shook with each explosion.",
    emotion: 'fear',
    duration: 8,
  },
  {
    id: '5',
    text: "Hours passed. I didn't know if my husband was alive or dead. Other wives gathered outside, holding each other, praying.",
    emotion: 'sorrow',
    duration: 8,
  },
  {
    id: '6',
    text: "When he finally came home that evening, covered in oil and ash, I have never felt such relief. So many others were not so fortunate.",
    emotion: 'hope',
    duration: 9,
  },
  {
    id: '7',
    text: "We are all changed now. But we are also more united than ever. America will not forget this day, and neither will I.",
    emotion: 'courage',
    duration: 8,
  },
];

const EMOTION_BUTTONS = [
  { id: 'fear', emoji: '😨', label: 'Fear' },
  { id: 'hope', emoji: '🙏', label: 'Hope' },
  { id: 'courage', emoji: '💪', label: 'Courage' },
  { id: 'sorrow', emoji: '😢', label: 'Sorrow' },
];

const DEFAULT_HOST: WW2Host = {
  id: 'soldier',
  name: 'Sergeant Mitchell',
  title: 'U.S. Army Infantryman',
  era: '1941-1945',
  specialty: 'Combat Veteran',
  primaryColor: '#3d5c3d',
  avatar: '🪖',
  voiceStyle: 'determined',
  description: '',
};

export function VoicedLetterPlayer({ onComplete, onBack, host = DEFAULT_HOST }: VoicedLetterPlayerProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showEmotions, setShowEmotions] = useState(false);
  const [userEmotions, setUserEmotions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeInSegment, setTimeInSegment] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const dialogue = getHostDialogue(host.id, 'voiced-letter') || getHostDialogue('soldier', 'voiced-letter')!;

  const segment = LETTER_SEGMENTS[currentSegment];

  // Simulate audio playback
  useEffect(() => {
    if (!isPlaying || !segment) return;

    timerRef.current = setInterval(() => {
      setTimeInSegment(prev => {
        if (prev >= segment.duration) {
          setIsPlaying(false);
          setShowEmotions(true);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, segment]);

  const handlePlay = () => {
    if (showEmotions) return;
    setIsPlaying(true);
  };

  const handleEmotionSelect = (emotionId: string) => {
    setUserEmotions(prev => [...prev, emotionId]);

    if (emotionId === segment.emotion) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      setShowEmotions(false);
      setTimeInSegment(0);

      if (currentSegment < LETTER_SEGMENTS.length - 1) {
        setCurrentSegment(prev => prev + 1);
        setIsPlaying(true);
      } else {
        setGameState('results');
      }
    }, 1000);
  };

  const handleSkip = () => {
    setShowEmotions(true);
    setIsPlaying(false);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Voiced Letter"
        onStart={() => {
          setGameState('playing');
          setIsPlaying(true);
        }}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Voiced Letter"
        stats={{
          score,
          total: LETTER_SEGMENTS.length,
          xpEarned: 25,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentSegment(0);
          setScore(0);
          setUserEmotions([]);
          setTimeInSegment(0);
          setShowEmotions(false);
          setGameState('playing');
          setIsPlaying(true);
        }}
      />
    );
  }

  const progress = (timeInSegment / segment.duration) * 100;

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Voiced Letter</h1>
        <div className="text-white/60 text-sm">{currentSegment + 1}/{LETTER_SEGMENTS.length}</div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex gap-1">
          {LETTER_SEGMENTS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentSegment ? 'bg-green-500' : i === currentSegment ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Letter Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Letter visual */}
        <motion.div
          key={segment.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Paper background */}
          <div
            className="bg-amber-50/10 rounded-lg p-6 border border-amber-900/30 shadow-xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M0 20h100M0 40h100M0 60h100M0 80h100' stroke='%23d4a574' stroke-width='0.3' opacity='0.2'/%3E%3C/svg%3E")`,
            }}
          >
            {/* Header */}
            <div className="text-center mb-4 pb-4 border-b border-amber-900/20">
              <p className="text-amber-200/60 text-xs uppercase tracking-wider">Letter from Pearl Harbor</p>
              <p className="text-amber-200/80 text-sm">Jane Colestock • December 1941</p>
            </div>

            {/* Letter text */}
            <p className="text-amber-100/90 text-lg leading-relaxed italic font-serif">
              "{segment.text}"
            </p>

            {/* Audio progress */}
            {isPlaying && (
              <div className="mt-6">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-amber-500"
                    initial={{ width: '0%' }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-white/40">{timeInSegment}s</span>
                  <button onClick={handleSkip} className="text-xs text-white/60 hover:text-white">
                    <SkipForward size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Emotion Selection */}
          <AnimatePresence>
            {showEmotions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6"
              >
                <p className="text-center text-white/60 text-sm mb-4">
                  What emotion does this passage convey?
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {EMOTION_BUTTONS.map((emotion) => (
                    <motion.button
                      key={emotion.id}
                      onClick={() => handleEmotionSelect(emotion.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <span className="text-2xl">{emotion.emoji}</span>
                      <span className="text-xs text-white/70">{emotion.label}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Play button when paused */}
          {!isPlaying && !showEmotions && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handlePlay}
              className="mt-6 mx-auto flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
            >
              <Play size={20} />
              <span>Continue Listening</span>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Host indicator */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-center gap-2">
        <span className="text-lg">{host.avatar}</span>
        <span className="text-white/60 text-sm">{host.name}: "Listen carefully..."</span>
      </div>
    </div>
  );
}

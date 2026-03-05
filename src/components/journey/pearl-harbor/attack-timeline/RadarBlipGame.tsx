/**
 * RadarBlipGame - Hook 1: Spot incoming blips on the radar screen
 * With host (Sergeant Mitchell) narration and feedback
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface RadarBlipGameProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface Blip {
  id: string;
  x: number;
  y: number;
  isHostile: boolean;
  appearAt: number;
  label: string;
  tapped?: boolean;
}

// Game configuration
const GAME_DURATION = 45;
const BLIPS: Blip[] = [
  { id: '1', x: 65, y: 30, isHostile: true, appearAt: 2, label: 'Unknown' },
  { id: '2', x: 25, y: 55, isHostile: false, appearAt: 4, label: 'B-17s' },
  { id: '3', x: 78, y: 45, isHostile: true, appearAt: 7, label: 'Unknown' },
  { id: '4', x: 40, y: 70, isHostile: true, appearAt: 10, label: 'Unknown' },
  { id: '5', x: 55, y: 25, isHostile: false, appearAt: 13, label: 'B-17s' },
  { id: '6', x: 85, y: 60, isHostile: true, appearAt: 16, label: 'Unknown' },
  { id: '7', x: 30, y: 35, isHostile: true, appearAt: 19, label: 'Unknown' },
  { id: '8', x: 70, y: 75, isHostile: true, appearAt: 22, label: 'Unknown' },
  { id: '9', x: 20, y: 80, isHostile: false, appearAt: 25, label: 'B-17s' },
  { id: '10', x: 60, y: 50, isHostile: true, appearAt: 28, label: 'Unknown' },
  { id: '11', x: 45, y: 40, isHostile: true, appearAt: 31, label: 'Unknown' },
  { id: '12', x: 80, y: 25, isHostile: true, appearAt: 34, label: 'Unknown' },
  { id: '13', x: 35, y: 65, isHostile: true, appearAt: 37, label: 'Unknown' },
  { id: '14', x: 50, y: 85, isHostile: false, appearAt: 40, label: 'B-17s' },
  { id: '15', x: 75, y: 55, isHostile: true, appearAt: 42, label: 'Unknown' },
];

// Default host if not provided
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

export function RadarBlipGame({ onComplete, onBack, host = DEFAULT_HOST }: RadarBlipGameProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [blips, setBlips] = useState<Blip[]>([]);
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const [isMuted, setIsMuted] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: 'correct' | 'incorrect' } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const dialogue = getHostDialogue(host.id, 'radar-blip') || getHostDialogue('soldier', 'radar-blip')!;

  const startGame = useCallback(() => {
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setBlips([]);
    setScore({ correct: 0, wrong: 0 });
    startTimeRef.current = Date.now();
  }, []);

  // Game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, GAME_DURATION - elapsed);
      setTimeLeft(remaining);

      const visibleBlips = BLIPS.filter(b => b.appearAt <= elapsed && !blips.find(vb => vb.id === b.id));
      if (visibleBlips.length > 0) {
        setBlips(prev => [...prev, ...visibleBlips]);
      }

      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        setGameState('results');
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, blips]);

  // Clear feedback after delay
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleBlipTap = (blip: Blip) => {
    if (blip.tapped) return;

    setBlips(prev => prev.map(b =>
      b.id === blip.id ? { ...b, tapped: true } : b
    ));

    if (blip.isHostile) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      const feedbackText = dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)];
      setFeedback({ text: feedbackText, type: 'correct' });
    } else {
      setScore(prev => ({ ...prev, wrong: prev.wrong + 1 }));
      const feedbackText = dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)];
      setFeedback({ text: feedbackText, type: 'incorrect' });
    }
  };

  // Intro screen with host
  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Radar Blip"
        onStart={startGame}
      />
    );
  }

  // Results screen with host
  if (gameState === 'results') {
    const totalHostile = BLIPS.filter(b => b.isHostile).length;

    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Radar Blip"
        stats={{
          score: score.correct,
          total: totalHostile,
          xpEarned: 25,
        }}
        onContinue={onComplete}
        onRetry={startGame}
      />
    );
  }

  // Playing screen
  return (
    <div className="h-screen flex flex-col bg-slate-950">
      <Header onBack={onBack} isMuted={isMuted} onToggleMute={() => setIsMuted(!isMuted)} />

      {/* Timer and Score */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">{host.avatar}</span>
          <span className="text-white/60 text-sm">{host.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-white">
            <span className="text-green-400 font-bold">{score.correct}</span>
            <span className="text-white/40 mx-1">/</span>
            <span className="text-red-400 font-bold">{score.wrong}</span>
          </div>
          <div className="text-white font-mono text-lg">
            {Math.ceil(timeLeft)}s
          </div>
        </div>
      </div>

      {/* Host Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-4 right-4 z-30"
          >
            <HostFeedback host={host} text={feedback.text} type={feedback.type} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Radar Screen */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-green-900/30 via-green-950/50 to-black" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={`h-${i}`}
              className="absolute left-0 right-0 h-px bg-green-500"
              style={{ top: `${(i + 1) * 10}%` }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <div
              key={`v-${i}`}
              className="absolute top-0 bottom-0 w-px bg-green-500"
              style={{ left: `${(i + 1) * 10}%` }}
            />
          ))}
        </div>

        {/* Circular scan lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[20, 35, 50, 65, 80].map((size) => (
            <div
              key={size}
              className="absolute rounded-full border border-green-500/20"
              style={{ width: `${size}%`, height: `${size}%` }}
            />
          ))}
        </div>

        {/* Scanning sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, rgba(74, 222, 128, 0.2) 30deg, transparent 60deg)',
          }}
        />

        {/* Blips */}
        <AnimatePresence>
          {blips.map((blip) => (
            <BlipDot
              key={blip.id}
              blip={blip}
              onTap={() => handleBlipTap(blip)}
            />
          ))}
        </AnimatePresence>

        {/* Center point */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500" />
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 bg-black/50 text-center">
        <p className="text-green-400/70 text-sm">Tap HOSTILE blips - Ignore B-17s</p>
      </div>
    </div>
  );
}

function Header({ onBack, isMuted, onToggleMute }: { onBack: () => void; isMuted: boolean; onToggleMute: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="font-editorial text-lg font-bold text-white">Radar Blip</h1>
      <button
        onClick={onToggleMute}
        className="p-2 -mr-2 text-white/60 hover:text-white transition-colors"
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>
    </div>
  );
}

interface BlipDotProps {
  blip: Blip;
  onTap: () => void;
}

function BlipDot({ blip, onTap }: BlipDotProps) {
  if (blip.tapped) {
    return (
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 0, opacity: 0 }}
        exit={{ scale: 0, opacity: 0 }}
        className={`absolute w-8 h-8 rounded-full ${
          blip.isHostile ? 'bg-green-500' : 'bg-red-500'
        }`}
        style={{
          left: `${blip.x}%`,
          top: `${blip.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    );
  }

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: [0, 1.2, 1], opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      onClick={onTap}
      className="absolute"
      style={{
        left: `${blip.x}%`,
        top: `${blip.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="w-8 h-8 rounded-full bg-green-500/80 flex items-center justify-center border-2 border-green-400"
      >
        <div className="w-2 h-2 rounded-full bg-green-300" />
      </motion.div>
      <motion.div
        initial={{ scale: 1, opacity: 0.5 }}
        animate={{ scale: 2, opacity: 0 }}
        transition={{ duration: 1, repeat: Infinity }}
        className="absolute inset-0 rounded-full border-2 border-green-400"
      />
    </motion.button>
  );
}

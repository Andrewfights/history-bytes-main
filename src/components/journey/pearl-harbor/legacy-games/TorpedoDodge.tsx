/**
 * TorpedoDodge - Hook 10: Timing tap game to dodge torpedoes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart } from 'lucide-react';

interface TorpedoDodgeProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Torpedo {
  id: string;
  lane: 0 | 1 | 2;
  speed: 'slow' | 'medium' | 'fast';
  position: number; // 0-100, torpedo travels from 100 to 0
}

const GAME_DURATION = 60; // seconds
const MAX_HITS = 3;
const LANE_COUNT = 3;

const SPEED_MAP = {
  slow: 1,
  medium: 1.5,
  fast: 2,
};

export function TorpedoDodge({ onComplete, onBack }: TorpedoDodgeProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [shipLane, setShipLane] = useState<0 | 1 | 2>(1);
  const [torpedoes, setTorpedoes] = useState<Torpedo[]>([]);
  const [hits, setHits] = useState(0);
  const [dodged, setDodged] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const torpedoIdRef = useRef(0);

  const startGame = useCallback(() => {
    setGameState('playing');
    setTimeLeft(GAME_DURATION);
    setShipLane(1);
    setTorpedoes([]);
    setHits(0);
    setDodged(0);
    setCombo(0);
    setMaxCombo(0);
    torpedoIdRef.current = 0;
  }, []);

  // Spawn torpedoes
  useEffect(() => {
    if (gameState !== 'playing') return;

    const spawnInterval = setInterval(() => {
      const lane = Math.floor(Math.random() * LANE_COUNT) as 0 | 1 | 2;
      const speed = ['slow', 'medium', 'fast'][Math.floor(Math.random() * 3)] as 'slow' | 'medium' | 'fast';

      const newTorpedo: Torpedo = {
        id: `torpedo-${torpedoIdRef.current++}`,
        lane,
        speed,
        position: 100,
      };

      setTorpedoes(prev => [...prev, newTorpedo]);
    }, 1500); // Spawn every 1.5 seconds

    return () => clearInterval(spawnInterval);
  }, [gameState]);

  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    gameLoopRef.current = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 0.05;
        if (newTime <= 0) {
          setGameState('results');
          return 0;
        }
        return newTime;
      });

      // Move torpedoes
      setTorpedoes(prev => {
        const updated: Torpedo[] = [];
        let hitsThisFrame = 0;
        let dodgedThisFrame = 0;

        for (const torpedo of prev) {
          const newPos = torpedo.position - SPEED_MAP[torpedo.speed] * 2;

          if (newPos <= 10) {
            // Check collision with ship
            if (torpedo.lane === shipLane && newPos > 0) {
              hitsThisFrame++;
            } else if (newPos <= 0) {
              dodgedThisFrame++;
            } else {
              updated.push({ ...torpedo, position: newPos });
            }
          } else {
            updated.push({ ...torpedo, position: newPos });
          }
        }

        if (hitsThisFrame > 0) {
          setHits(h => {
            const newHits = h + hitsThisFrame;
            if (newHits >= MAX_HITS) {
              setGameState('results');
            }
            return newHits;
          });
          setCombo(0);
        }

        if (dodgedThisFrame > 0) {
          setDodged(d => d + dodgedThisFrame);
          setCombo(c => {
            const newCombo = c + dodgedThisFrame;
            setMaxCombo(m => Math.max(m, newCombo));
            return newCombo;
          });
        }

        return updated;
      });
    }, 50);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameState, shipLane]);

  const moveLane = (direction: 'left' | 'right') => {
    setShipLane(prev => {
      if (direction === 'left') return Math.max(0, prev - 1) as 0 | 1 | 2;
      return Math.min(2, prev + 1) as 0 | 1 | 2;
    });
  };

  // Intro screen
  if (gameState === 'intro') {
    return (
      <div className="h-screen flex flex-col bg-slate-950">
        <Header onBack={onBack} />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-6xl mb-6"
          >
            🚢
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-2">Torpedo Alley</h2>
          <p className="text-white/60 mb-6">Battleship Row, December 7, 1941</p>

          <div className="max-w-sm text-white/50 text-sm mb-8">
            <p className="mb-4">
              Japanese torpedo bombers are attacking! Dodge incoming torpedoes
              by switching lanes.
            </p>
            <p>
              <strong className="text-white">Tap left or right</strong> to move your ship.
              Survive as long as possible!
            </p>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-4 rounded-xl bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition-colors"
          >
            Start Dodging
          </button>
        </div>
      </div>
    );
  }

  // Results screen
  if (gameState === 'results') {
    const survived = hits < MAX_HITS;

    return (
      <div className="h-screen flex flex-col bg-slate-950">
        <Header onBack={onBack} />

        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.5 }}
            className="text-6xl mb-6"
          >
            {survived ? '🎖️' : '💥'}
          </motion.div>

          <h2 className="text-2xl font-bold text-white mb-6">
            {survived ? 'You Survived!' : 'Ship Sunk!'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-6 w-full max-w-xs">
            <div className="p-4 rounded-xl bg-green-500/20 border border-green-500/30">
              <div className="text-3xl font-bold text-green-400">{dodged}</div>
              <div className="text-sm text-green-400/70">Torpedoes Dodged</div>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-500/30">
              <div className="text-3xl font-bold text-orange-400">x{maxCombo}</div>
              <div className="text-sm text-orange-400/70">Max Combo</div>
            </div>
          </div>

          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={onComplete}
              className="w-full px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
            >
              Continue (+25 XP)
            </button>
            <button
              onClick={startGame}
              className="w-full px-6 py-3 rounded-xl bg-white/10 text-white font-bold hover:bg-white/20 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Playing screen
  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-blue-950 to-black">
      <Header onBack={onBack} />

      {/* HUD */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          {Array.from({ length: MAX_HITS }).map((_, i) => (
            <Heart
              key={i}
              size={20}
              className={i < MAX_HITS - hits ? 'text-red-500 fill-red-500' : 'text-white/20'}
            />
          ))}
        </div>
        <div className="text-white font-mono text-lg">
          {Math.ceil(timeLeft)}s
        </div>
        {combo > 1 && (
          <motion.div
            key={combo}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            className="text-orange-400 font-bold"
          >
            x{combo}
          </motion.div>
        )}
      </div>

      {/* Game Area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Ocean background */}
        <motion.div
          className="absolute inset-0"
          animate={{ backgroundPositionY: ['0%', '100%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{
            backgroundImage: 'linear-gradient(180deg, transparent 0%, rgba(30, 58, 95, 0.3) 50%, transparent 100%)',
            backgroundSize: '100% 200%',
          }}
        />

        {/* Lane dividers */}
        <div className="absolute inset-y-0 left-1/3 w-px bg-white/10" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-white/10" />

        {/* Torpedoes */}
        <AnimatePresence>
          {torpedoes.map((torpedo) => (
            <motion.div
              key={torpedo.id}
              className="absolute"
              style={{
                left: `${(torpedo.lane * 33.33) + 16.66}%`,
                bottom: `${torpedo.position}%`,
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
            >
              <div className="w-8 h-16 bg-gradient-to-t from-red-600 to-red-400 rounded-full shadow-lg shadow-red-500/50">
                <div className="w-full h-2 bg-red-300 rounded-t-full" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Ship */}
        <motion.div
          className="absolute bottom-8"
          animate={{ left: `${(shipLane * 33.33) + 16.66}%` }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ transform: 'translateX(-50%)' }}
        >
          <div className="text-4xl">🚢</div>
        </motion.div>

        {/* Touch zones */}
        <button
          onClick={() => moveLane('left')}
          className="absolute left-0 top-0 w-1/2 h-full"
        />
        <button
          onClick={() => moveLane('right')}
          className="absolute right-0 top-0 w-1/2 h-full"
        />
      </div>

      {/* Controls hint */}
      <div className="px-4 py-3 bg-black/50 text-center">
        <p className="text-blue-400/70 text-sm">Tap left or right to switch lanes</p>
      </div>
    </div>
  );
}

function Header({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <button
        onClick={onBack}
        className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <h1 className="font-editorial text-lg font-bold text-white">Torpedo Alley</h1>
      <div className="w-10" />
    </div>
  );
}

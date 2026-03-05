/**
 * PlaneWaveTracer - Hook 1: Trace attack wave paths over Oahu map
 */

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface PlaneWaveTracerProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface PathPoint {
  x: number;
  y: number;
}

const TARGET_PATHS = [
  {
    id: 'wave1',
    name: 'Wave 1: Airfields',
    color: '#ef4444',
    points: [
      { x: 15, y: 20 }, // Starting from north
      { x: 35, y: 40 }, // Wheeler Field
      { x: 55, y: 60 }, // Hickam Field
    ],
    targets: ['Wheeler Field', 'Hickam Field'],
  },
  {
    id: 'wave2',
    name: 'Wave 2: Battleship Row',
    color: '#f97316',
    points: [
      { x: 85, y: 25 }, // Starting from east
      { x: 65, y: 50 }, // Ford Island
      { x: 50, y: 70 }, // Battleship Row
    ],
    targets: ['Ford Island', 'Battleship Row'],
  },
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

export function PlaneWaveTracer({ onComplete, onBack, host = DEFAULT_HOST }: PlaneWaveTracerProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentWave, setCurrentWave] = useState(0);
  const [userPath, setUserPath] = useState<PathPoint[]>([]);
  const [completedWaves, setCompletedWaves] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const dialogue = getHostDialogue(host.id, 'plane-tracer') || getHostDialogue('soldier', 'plane-tracer')!;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const point = getPoint(e);
    setUserPath([point]);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !canvasRef.current) return;
    const point = getPoint(e);
    setUserPath(prev => [...prev, point]);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    checkPath();
  };

  const getPoint = (e: React.TouchEvent | React.MouseEvent): PathPoint => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const checkPath = () => {
    const target = TARGET_PATHS[currentWave];
    if (userPath.length < 3) return;

    // Simple proximity check - did user get close to all waypoints?
    let hitCount = 0;
    for (const targetPoint of target.points) {
      for (const userPoint of userPath) {
        const distance = Math.sqrt(
          Math.pow(targetPoint.x - userPoint.x, 2) +
          Math.pow(targetPoint.y - userPoint.y, 2)
        );
        if (distance < 15) {
          hitCount++;
          break;
        }
      }
    }

    if (hitCount >= target.points.length - 1) {
      // Success!
      setCompletedWaves(prev => [...prev, currentWave]);
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);

      setTimeout(() => {
        setFeedback(null);
        if (currentWave < TARGET_PATHS.length - 1) {
          setCurrentWave(prev => prev + 1);
          setUserPath([]);
        } else {
          setGameState('results');
        }
      }, 1500);
    } else {
      setFeedback(dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)]);
      setTimeout(() => {
        setFeedback(null);
        setUserPath([]);
      }, 1500);
    }
  };

  const resetPath = () => {
    setUserPath([]);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Plane Wave Tracer"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Plane Wave Tracer"
        stats={{
          score: completedWaves.length,
          total: TARGET_PATHS.length,
          xpEarned: 30,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentWave(0);
          setCompletedWaves([]);
          setUserPath([]);
          setGameState('playing');
        }}
      />
    );
  }

  const currentTarget = TARGET_PATHS[currentWave];

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Plane Wave Tracer</h1>
        <button onClick={resetPath} className="p-2 -mr-2 text-white/60 hover:text-white">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Wave indicator */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-lg">{host.avatar}</span>
          <span className="text-white/80 text-sm">Trace: <span className="text-amber-400 font-medium">{currentTarget.name}</span></span>
        </div>
        <div className="flex gap-2 mt-2">
          {TARGET_PATHS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                completedWaves.includes(i) ? 'bg-green-500' : i === currentWave ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-32 left-4 right-4 z-30"
          >
            <HostFeedback host={host} text={feedback} type={completedWaves.includes(currentWave) ? 'correct' : 'incorrect'} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative bg-gradient-to-b from-blue-900/30 to-slate-900"
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Oahu Island outline (simplified) */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M 20,30 Q 30,20 50,25 T 80,35 Q 85,50 75,65 T 50,80 Q 30,75 20,60 T 20,30"
            fill="rgba(74, 85, 104, 0.5)"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
        </svg>

        {/* Target markers */}
        {currentTarget.points.map((point, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute w-6 h-6 rounded-full border-2 border-dashed border-amber-400/60 flex items-center justify-center"
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <span className="text-xs text-amber-400">{i + 1}</span>
          </motion.div>
        ))}

        {/* Target labels */}
        {currentTarget.targets.map((target, i) => (
          <div
            key={target}
            className="absolute text-xs text-white/60 bg-black/50 px-2 py-1 rounded"
            style={{
              left: `${currentTarget.points[i + 1]?.x || currentTarget.points[i].x}%`,
              top: `${(currentTarget.points[i + 1]?.y || currentTarget.points[i].y) + 8}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {target}
          </div>
        ))}

        {/* User drawn path */}
        {userPath.length > 1 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polyline
              points={userPath.map(p => `${p.x},${p.y}`).join(' ')}
              fill="none"
              stroke={currentTarget.color}
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Plane icon at path end */}
        {userPath.length > 0 && (
          <motion.div
            className="absolute text-2xl pointer-events-none"
            style={{
              left: `${userPath[userPath.length - 1].x}%`,
              top: `${userPath[userPath.length - 1].y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            ✈️
          </motion.div>
        )}
      </div>

      {/* Instructions */}
      <div className="px-4 py-3 bg-black/50 text-center">
        <p className="text-white/60 text-sm">Draw the attack path through all waypoints</p>
      </div>
    </div>
  );
}

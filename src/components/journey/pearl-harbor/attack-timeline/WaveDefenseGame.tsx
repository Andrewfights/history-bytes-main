/**
 * WaveDefenseGame - Hook 2: Defend against attack waves by assigning defenses
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Shield, Anchor, Plane } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface WaveDefenseGameProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface Target {
  id: string;
  name: string;
  type: 'airfield' | 'battleship';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  defended: boolean;
}

interface DefenseAsset {
  id: string;
  type: 'aa' | 'rescue' | 'fighter';
  name: string;
  icon: string;
  count: number;
}

const INITIAL_TARGETS: Target[] = [
  { id: 'wheeler', name: 'Wheeler Field', type: 'airfield', x: 30, y: 25, health: 100, maxHealth: 100, defended: false },
  { id: 'hickam', name: 'Hickam Field', type: 'airfield', x: 70, y: 30, health: 100, maxHealth: 100, defended: false },
  { id: 'arizona', name: 'USS Arizona', type: 'battleship', x: 45, y: 60, health: 100, maxHealth: 100, defended: false },
  { id: 'oklahoma', name: 'USS Oklahoma', type: 'battleship', x: 55, y: 65, health: 100, maxHealth: 100, defended: false },
  { id: 'westvirginia', name: 'USS West Virginia', type: 'battleship', x: 50, y: 75, health: 100, maxHealth: 100, defended: false },
];

const INITIAL_ASSETS: DefenseAsset[] = [
  { id: 'aa1', type: 'aa', name: 'AA Crew', icon: '🎯', count: 3 },
  { id: 'rescue1', type: 'rescue', name: 'Rescue Boat', icon: '⚓', count: 2 },
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

export function WaveDefenseGame({ onComplete, onBack, host = DEFAULT_HOST }: WaveDefenseGameProps) {
  const [gameState, setGameState] = useState<'intro' | 'wave1' | 'wave2' | 'results'>('intro');
  const [targets, setTargets] = useState<Target[]>(INITIAL_TARGETS);
  const [assets, setAssets] = useState<DefenseAsset[]>(INITIAL_ASSETS);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [waveAttacks, setWaveAttacks] = useState<{ targetId: string; damage: number }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const dialogue = getHostDialogue(host.id, 'wave-defense') || getHostDialogue('soldier', 'wave-defense')!;

  // Timer for each wave
  useEffect(() => {
    if (gameState !== 'wave1' && gameState !== 'wave2') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          processWaveEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState]);

  // Simulate attacks
  useEffect(() => {
    if (gameState !== 'wave1' && gameState !== 'wave2') return;

    const attackInterval = setInterval(() => {
      const targetType = gameState === 'wave1' ? 'airfield' : 'battleship';
      const eligibleTargets = targets.filter(t => t.type === targetType && t.health > 0);

      if (eligibleTargets.length > 0) {
        const target = eligibleTargets[Math.floor(Math.random() * eligibleTargets.length)];
        const damage = target.defended ? 10 : 25;

        setTargets(prev => prev.map(t =>
          t.id === target.id ? { ...t, health: Math.max(0, t.health - damage) } : t
        ));

        setWaveAttacks(prev => [...prev, { targetId: target.id, damage }]);
      }
    }, 2000);

    return () => clearInterval(attackInterval);
  }, [gameState, targets]);

  const processWaveEnd = () => {
    // Calculate score based on remaining health
    const waveTargetType = gameState === 'wave1' ? 'airfield' : 'battleship';
    const waveTargets = targets.filter(t => t.type === waveTargetType);
    const totalHealth = waveTargets.reduce((sum, t) => sum + t.health, 0);
    const maxHealth = waveTargets.reduce((sum, t) => sum + t.maxHealth, 0);
    const waveScore = Math.round((totalHealth / maxHealth) * 50);
    setScore(prev => prev + waveScore);

    if (gameState === 'wave1') {
      setTimeout(() => {
        setGameState('wave2');
        setTimeLeft(30);
        setWaveAttacks([]);
        // Reset some assets for wave 2
        setAssets([
          { id: 'aa2', type: 'aa', name: 'AA Crew', icon: '🎯', count: 2 },
          { id: 'rescue2', type: 'rescue', name: 'Rescue Boat', icon: '⚓', count: 3 },
        ]);
      }, 2000);
    } else {
      setGameState('results');
    }
  };

  const handleAssetSelect = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset && asset.count > 0) {
      setSelectedAsset(assetId);
    }
  };

  const handleTargetClick = (targetId: string) => {
    if (!selectedAsset) return;

    const asset = assets.find(a => a.id === selectedAsset);
    const target = targets.find(t => t.id === targetId);

    if (!asset || asset.count <= 0 || !target) return;

    // Assign defense
    setTargets(prev => prev.map(t =>
      t.id === targetId ? { ...t, defended: true } : t
    ));

    setAssets(prev => prev.map(a =>
      a.id === selectedAsset ? { ...a, count: a.count - 1 } : a
    ));

    setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
    setTimeout(() => setFeedback(null), 1500);
    setSelectedAsset(null);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Wave Defense"
        onStart={() => setGameState('wave1')}
      />
    );
  }

  if (gameState === 'results') {
    const survivingTargets = targets.filter(t => t.health > 0).length;

    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Wave Defense"
        stats={{
          score: survivingTargets,
          total: targets.length,
          xpEarned: 35,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setTargets(INITIAL_TARGETS);
          setAssets(INITIAL_ASSETS);
          setScore(0);
          setTimeLeft(30);
          setGameState('wave1');
        }}
      />
    );
  }

  const currentWaveTargets = gameState === 'wave1' ? 'airfield' : 'battleship';

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-center">
          <h1 className="font-editorial text-lg font-bold text-white">
            {gameState === 'wave1' ? 'Wave 1: Airfields' : 'Wave 2: Battleship Row'}
          </h1>
          <p className="text-sm text-amber-400">{timeLeft}s remaining</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-20 left-4 right-4 z-30"
          >
            <HostFeedback host={host} text={feedback} type="correct" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Map */}
      <div className="flex-1 relative bg-gradient-to-b from-blue-950/50 to-slate-900 overflow-hidden">
        {/* Attack indicators */}
        <AnimatePresence>
          {waveAttacks.slice(-3).map((attack, i) => (
            <motion.div
              key={`${attack.targetId}-${i}`}
              initial={{ opacity: 1, scale: 1 }}
              animate={{ opacity: 0, scale: 2 }}
              exit={{ opacity: 0 }}
              className="absolute text-2xl pointer-events-none"
              style={{
                left: `${targets.find(t => t.id === attack.targetId)?.x}%`,
                top: `${targets.find(t => t.id === attack.targetId)?.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              💥
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Targets */}
        {targets.map((target) => {
          const isCurrentWave = target.type === currentWaveTargets;
          const healthPercent = (target.health / target.maxHealth) * 100;

          return (
            <motion.button
              key={target.id}
              onClick={() => handleTargetClick(target.id)}
              className={`absolute flex flex-col items-center ${
                isCurrentWave ? 'pointer-events-auto' : 'pointer-events-none opacity-50'
              }`}
              style={{
                left: `${target.x}%`,
                top: `${target.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              animate={selectedAsset ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: selectedAsset ? Infinity : 0 }}
            >
              <div className={`text-3xl ${target.defended ? 'ring-2 ring-green-400 rounded-full p-1' : ''}`}>
                {target.type === 'airfield' ? '🛩️' : '🚢'}
              </div>
              <div className="w-12 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    healthPercent > 50 ? 'bg-green-500' : healthPercent > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${healthPercent}%` }}
                />
              </div>
              <span className="text-xs text-white/60 mt-1">{target.name}</span>
              {target.defended && (
                <Shield size={14} className="text-green-400 absolute -top-1 -right-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Asset Selection */}
      <div className="px-4 py-4 bg-black/50 border-t border-white/10">
        <p className="text-xs text-white/50 mb-2">Select a defense, then tap a target:</p>
        <div className="flex gap-3 justify-center">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => handleAssetSelect(asset.id)}
              disabled={asset.count <= 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                selectedAsset === asset.id
                  ? 'bg-amber-500/30 border-amber-500'
                  : asset.count > 0
                  ? 'bg-white/10 border-white/20 hover:bg-white/20'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <span className="text-xl">{asset.icon}</span>
              <span className="text-white/80">{asset.name}</span>
              <span className="text-xs text-white/50 bg-white/10 px-2 py-0.5 rounded-full">
                x{asset.count}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

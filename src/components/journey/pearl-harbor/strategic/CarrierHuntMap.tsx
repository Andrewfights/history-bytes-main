/**
 * CarrierHuntMap - Hook 8: Locate the absent carriers on December 7th
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, Check, X, Info } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface CarrierHuntMapProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface Carrier {
  id: string;
  name: string;
  location: string;
  description: string;
  x: number; // % position on map
  y: number;
  mission: string;
}

interface MapLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  type: 'port' | 'sea' | 'island';
}

const CARRIERS: Carrier[] = [
  {
    id: 'enterprise',
    name: 'USS Enterprise',
    location: 'At sea - returning from Wake Island',
    description: 'CV-6 was delivering aircraft to Wake Island. She was due to arrive at Pearl Harbor on December 6th but was delayed by weather.',
    x: 75,
    y: 45,
    mission: 'Delivering Marine fighters to Wake Island',
  },
  {
    id: 'lexington',
    name: 'USS Lexington',
    location: 'At sea - heading to Midway',
    description: 'CV-2 had departed Pearl Harbor on December 5th to deliver aircraft to Midway Island.',
    x: 60,
    y: 35,
    mission: 'Delivering Marine aircraft to Midway Island',
  },
  {
    id: 'saratoga',
    name: 'USS Saratoga',
    location: 'San Diego - West Coast',
    description: 'CV-3 was undergoing repairs at Puget Sound Naval Shipyard, then sailed to San Diego.',
    x: 85,
    y: 25,
    mission: 'Post-refit at San Diego',
  },
];

const MAP_LOCATIONS: MapLocation[] = [
  { id: 'pearl', name: 'Pearl Harbor', x: 35, y: 50, type: 'port' },
  { id: 'midway', name: 'Midway', x: 25, y: 35, type: 'island' },
  { id: 'wake', name: 'Wake Island', x: 15, y: 55, type: 'island' },
  { id: 'japan', name: 'Japan', x: 10, y: 30, type: 'port' },
  { id: 'sanDiego', name: 'San Diego', x: 85, y: 25, type: 'port' },
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

export function CarrierHuntMap({ onComplete, onBack, host = DEFAULT_HOST }: CarrierHuntMapProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentCarrierIndex, setCurrentCarrierIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [placedCarriers, setPlacedCarriers] = useState<{ carrierId: string; x: number; y: number }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  const dialogue = getHostDialogue(host.id, 'carrier-hunt') || getHostDialogue('soldier', 'carrier-hunt')!;

  const currentCarrier = CARRIERS[currentCarrierIndex];

  const handleMapClick = (x: number, y: number) => {
    if (!currentCarrier || feedback) return;

    // Check if click is close to correct position
    const distance = Math.sqrt(
      Math.pow(x - currentCarrier.x, 2) + Math.pow(y - currentCarrier.y, 2)
    );

    const isCorrect = distance < 15; // Within 15% of correct position

    setPlacedCarriers(prev => [...prev, { carrierId: currentCarrier.id, x, y }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback(dialogue.correct[Math.floor(Math.random() * dialogue.correct.length)]);
    } else {
      setFeedback(dialogue.incorrect[Math.floor(Math.random() * dialogue.incorrect.length)]);
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentCarrierIndex < CARRIERS.length - 1) {
        setCurrentCarrierIndex(prev => prev + 1);
      } else {
        setGameState('results');
      }
    }, 2500);
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Hunt the Carriers"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Hunt the Carriers"
        stats={{
          score,
          total: CARRIERS.length,
          xpEarned: 30,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentCarrierIndex(0);
          setScore(0);
          setPlacedCarriers([]);
          setGameState('playing');
        }}
        customMessage="Japan's failure to destroy the U.S. carriers would prove to be their greatest strategic mistake. These same carriers would win the decisive Battle of Midway just six months later."
      />
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Hunt the Carriers</h1>
        <div className="text-white/60 text-sm">{currentCarrierIndex + 1}/{CARRIERS.length}</div>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex gap-1">
          {CARRIERS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentCarrierIndex ? 'bg-green-500' : i === currentCarrierIndex ? 'bg-amber-500' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Carrier Info */}
      <div className="px-4 py-3 bg-black/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-400 text-sm font-medium">Locate:</p>
            <p className="text-white font-bold">{currentCarrier.name}</p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 text-white/60 hover:text-white"
          >
            <Info size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 bg-white/5 rounded-lg"
            >
              <p className="text-white/80 text-sm mb-2">{currentCarrier.mission}</p>
              <p className="text-white/50 text-xs">{currentCarrier.location}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 mt-2"
          >
            <HostFeedback
              host={host}
              text={feedback}
              type={feedback.includes('!') ? 'correct' : 'incorrect'}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map */}
      <div
        className="flex-1 relative bg-gradient-to-b from-blue-950 to-slate-900 overflow-hidden"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          handleMapClick(x, y);
        }}
      >
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(10)].map((_, i) => (
            <line
              key={`h${i}`}
              x1="0"
              y1={`${i * 10}%`}
              x2="100%"
              y2={`${i * 10}%`}
              stroke="white"
              strokeWidth="1"
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <line
              key={`v${i}`}
              x1={`${i * 10}%`}
              y1="0"
              x2={`${i * 10}%`}
              y2="100%"
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Map labels */}
        <div className="absolute inset-0 pointer-events-none">
          <span className="absolute left-[5%] top-[20%] text-white/30 text-xs">JAPAN</span>
          <span className="absolute right-[10%] top-[20%] text-white/30 text-xs">USA</span>
          <span className="absolute left-[30%] top-[45%] text-white/30 text-xs">PACIFIC OCEAN</span>
        </div>

        {/* Map locations */}
        {MAP_LOCATIONS.map((loc) => (
          <div
            key={loc.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: `${loc.x}%`,
              top: `${loc.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className={`w-3 h-3 rounded-full ${
              loc.type === 'port' ? 'bg-amber-500' : 'bg-green-500'
            }`} />
            <span className="text-xs text-white/60 mt-1 whitespace-nowrap">{loc.name}</span>
          </div>
        ))}

        {/* Placed carriers */}
        {placedCarriers.map((placed, index) => {
          const carrier = CARRIERS.find(c => c.id === placed.carrierId)!;
          const distance = Math.sqrt(
            Math.pow(placed.x - carrier.x, 2) + Math.pow(placed.y - carrier.y, 2)
          );
          const isCorrect = distance < 15;

          return (
            <motion.div
              key={placed.carrierId}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute flex flex-col items-center"
              style={{
                left: `${placed.x}%`,
                top: `${placed.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className={`text-3xl ${isCorrect ? '' : 'opacity-50'}`}>
                ⚓
              </div>
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                isCorrect ? 'bg-green-500/30 text-green-400' : 'bg-red-500/30 text-red-400'
              }`}>
                {isCorrect ? <Check size={12} /> : <X size={12} />}
                <span>{carrier.name.split(' ')[1]}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Correct positions shown after placement */}
        {placedCarriers.map((placed) => {
          const carrier = CARRIERS.find(c => c.id === placed.carrierId)!;
          const distance = Math.sqrt(
            Math.pow(placed.x - carrier.x, 2) + Math.pow(placed.y - carrier.y, 2)
          );
          const isCorrect = distance < 15;

          if (isCorrect) return null;

          return (
            <motion.div
              key={`correct-${carrier.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute flex flex-col items-center"
              style={{
                left: `${carrier.x}%`,
                top: `${carrier.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <div className="text-2xl opacity-50">⚓</div>
              <div className="px-2 py-0.5 rounded-full text-xs bg-amber-500/30 text-amber-400">
                Correct
              </div>
            </motion.div>
          );
        })}

        {/* Tap indicator */}
        {!feedback && (
          <motion.div
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="px-4 py-2 bg-black/70 rounded-full text-white/60 text-sm flex items-center gap-2">
              <MapPin size={14} />
              <span>Tap to place carrier</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Strategic insight */}
      <div className="px-4 py-3 bg-black/50">
        <p className="text-white/50 text-xs text-center">
          Japan targeted battleships, not realizing carriers would dominate the Pacific War.
        </p>
      </div>
    </div>
  );
}

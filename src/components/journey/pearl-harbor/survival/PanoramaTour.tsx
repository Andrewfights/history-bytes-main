/**
 * PanoramaTour - Hook 5: 360° tour of USS Arizona memorial with hotspots
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, X, Users, Info } from 'lucide-react';
import { WW2Host } from '@/types';
import { getHostDialogue } from '@/data/ww2Hosts';
import { HostIntroOverlay, HostCompletionOverlay, HostFeedback } from '../shared/HostNarration';

interface PanoramaTourProps {
  onComplete: () => void;
  onBack: () => void;
  host?: WW2Host;
}

interface TourStop {
  id: string;
  name: string;
  description: string;
  emoji: string;
  fact: string;
  hotspots: {
    id: string;
    x: number;
    y: number;
    label: string;
    content: string;
  }[];
}

const TOUR_STOPS: TourStop[] = [
  {
    id: 'memorial-entrance',
    name: 'Memorial Entrance',
    description: 'The white concrete memorial structure spans the sunken hull of the USS Arizona.',
    emoji: '🏛️',
    fact: 'The memorial was designed by Alfred Preis and dedicated in 1962.',
    hotspots: [
      { id: 'flag', x: 50, y: 20, label: 'American Flag', content: 'The flag flies from a pole attached to the severed mainmast of the Arizona.' },
      { id: 'opening', x: 30, y: 40, label: 'Open Design', content: 'The structure is open to the sky, allowing rain to fall on the water above the wreck.' },
    ],
  },
  {
    id: 'shrine-room',
    name: 'Shrine Room',
    description: 'The marble wall bears the names of all 1,177 crew members who died aboard the Arizona.',
    emoji: '🕯️',
    fact: '334 survivors have been interred with their shipmates after death.',
    hotspots: [
      { id: 'wall', x: 50, y: 35, label: 'Marble Wall', content: '1,177 names engraved in marble. The youngest was 15 years old.' },
      { id: 'window', x: 80, y: 45, label: 'Open Window', content: 'The window overlooks the sunken ship and allows for quiet reflection.' },
    ],
  },
  {
    id: 'well-deck',
    name: 'Well Deck',
    description: "Through the opening, you can see the rusted remains of the Arizona's deck and gun turret barbettes.",
    emoji: '⚓',
    fact: 'The ship still leaks about 2-9 quarts of oil per day, called the "tears of the Arizona."',
    hotspots: [
      { id: 'turret', x: 45, y: 55, label: 'Turret #3 Barbette', content: 'The ring that held the massive gun turret is still visible below the water.' },
      { id: 'oil', x: 60, y: 65, label: 'Oil Seepage', content: 'Oil continues to leak from the wreck - nearly 500,000 gallons remain.' },
    ],
  },
  {
    id: 'underwater-view',
    name: 'Underwater View',
    description: 'Looking down into the clear harbor water, the outline of the ship is visible.',
    emoji: '🌊',
    fact: 'The Arizona rests in 40 feet of water, much of it still visible from above.',
    hotspots: [
      { id: 'deck', x: 50, y: 50, label: 'Main Deck', content: 'The collapsed superstructure created debris fields across the deck.' },
      { id: 'hull', x: 35, y: 60, label: 'Hull Breach', content: 'The bomb penetrated 4 decks before igniting the forward magazine.' },
    ],
  },
];

const MEMORIAL_NAMES_SAMPLE = [
  'Abercrombie, Samuel Adolphus',
  'Adams, Robert Franklin',
  'Aguirre, Reyner Aceves',
  'Ahern, Richard James',
  'Alexander, Elvis Alfred',
  'Allen, Robert Lee',
  'Anderson, Charles Titus',
  'Anderson, Delbert Jake',
  'Andrews, Brainerd Wells',
  'Angle, Ernest Hersea',
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

export function PanoramaTour({ onComplete, onBack, host = DEFAULT_HOST }: PanoramaTourProps) {
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'results'>('intro');
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [viewedHotspots, setViewedHotspots] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [showNames, setShowNames] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const dialogue = getHostDialogue(host.id, 'panorama-tour') || getHostDialogue('soldier', 'panorama-tour')!;

  const currentStop = TOUR_STOPS[currentStopIndex];
  const totalHotspots = TOUR_STOPS.reduce((sum, stop) => sum + stop.hotspots.length, 0);

  const handleHotspotClick = (hotspotId: string) => {
    if (!viewedHotspots.includes(hotspotId)) {
      setViewedHotspots(prev => [...prev, hotspotId]);

      if (viewedHotspots.length === 0) {
        setFeedback(dialogue.encouragement[Math.floor(Math.random() * dialogue.encouragement.length)]);
        setTimeout(() => setFeedback(null), 2000);
      }
    }
    setActiveHotspot(hotspotId);
  };

  const goToNext = () => {
    if (currentStopIndex < TOUR_STOPS.length - 1) {
      setCurrentStopIndex(prev => prev + 1);
      setActiveHotspot(null);
    } else {
      setGameState('results');
    }
  };

  const goToPrev = () => {
    if (currentStopIndex > 0) {
      setCurrentStopIndex(prev => prev - 1);
      setActiveHotspot(null);
    }
  };

  if (gameState === 'intro') {
    return (
      <HostIntroOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Arizona Memorial Tour"
        onStart={() => setGameState('playing')}
      />
    );
  }

  if (gameState === 'results') {
    return (
      <HostCompletionOverlay
        host={host}
        dialogue={dialogue}
        gameTitle="Arizona Memorial Tour"
        stats={{
          score: viewedHotspots.length,
          total: totalHotspots,
          xpEarned: 35,
        }}
        onContinue={onComplete}
        onRetry={() => {
          setCurrentStopIndex(0);
          setViewedHotspots([]);
          setActiveHotspot(null);
          setGameState('playing');
        }}
        customMessage="The USS Arizona Memorial receives over 1.8 million visitors each year. It stands as a testament to those who gave their lives on December 7, 1941."
      />
    );
  }

  const activeHotspotData = currentStop.hotspots.find(h => h.id === activeHotspot);

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button onClick={onBack} className="p-2 -ml-2 text-white/60 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Memorial Tour</h1>
        <button
          onClick={() => setShowNames(!showNames)}
          className="p-2 text-white/60 hover:text-white"
        >
          <Users size={20} />
        </button>
      </div>

      {/* Progress */}
      <div className="px-4 py-2">
        <div className="flex gap-1">
          {TOUR_STOPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < currentStopIndex ? 'bg-green-500' : i === currentStopIndex ? 'bg-amber-500' : 'bg-white/20'
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
            className="px-4"
          >
            <HostFeedback host={host} text={feedback} type="correct" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Names Overlay */}
      <AnimatePresence>
        {showNames && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black/95 flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <h2 className="text-lg font-bold text-white">In Memory</h2>
              <button onClick={() => setShowNames(false)} className="text-white/60">
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-white/50 text-sm mb-4">
                1,177 crew members lost aboard the USS Arizona
              </p>
              <div className="space-y-2">
                {MEMORIAL_NAMES_SAMPLE.map((name) => (
                  <div key={name} className="py-2 border-b border-white/10">
                    <p className="text-white/80">{name}</p>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-sm mt-4 text-center">
                Showing 10 of 1,177 names
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panorama View */}
      <div className="flex-1 relative overflow-hidden">
        <motion.div
          key={currentStop.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex flex-col"
        >
          {/* Visual representation */}
          <div className="flex-1 relative bg-gradient-to-b from-blue-900/30 to-slate-900">
            {/* Scene emoji */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="text-8xl opacity-30"
              >
                {currentStop.emoji}
              </motion.div>
            </div>

            {/* Water effect */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-blue-900/50 to-transparent"
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
            />

            {/* Hotspots */}
            {currentStop.hotspots.map((hotspot) => {
              const isViewed = viewedHotspots.includes(hotspot.id);
              const isActive = activeHotspot === hotspot.id;

              return (
                <motion.button
                  key={hotspot.id}
                  onClick={() => handleHotspotClick(hotspot.id)}
                  className="absolute"
                  style={{
                    left: `${hotspot.x}%`,
                    top: `${hotspot.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={isActive ? {} : { scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${isActive
                      ? 'bg-amber-500 text-black'
                      : isViewed
                      ? 'bg-green-500/50 text-white'
                      : 'bg-white/20 text-white border-2 border-white/50'
                    }
                  `}>
                    <MapPin size={18} />
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Stop info */}
          <div className="px-4 py-4 bg-black/70">
            <h2 className="text-xl font-bold text-white mb-1">{currentStop.name}</h2>
            <p className="text-white/70 text-sm mb-3">{currentStop.description}</p>

            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg">
              <Info size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-300 text-sm">{currentStop.fact}</p>
            </div>
          </div>
        </motion.div>

        {/* Hotspot detail overlay */}
        <AnimatePresence>
          {activeHotspotData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-32 left-4 right-4"
            >
              <div className="bg-slate-900/95 rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-amber-400 font-medium">{activeHotspotData.label}</h3>
                  <button onClick={() => setActiveHotspot(null)} className="text-white/60">
                    <X size={18} />
                  </button>
                </div>
                <p className="text-white/80 text-sm">{activeHotspotData.content}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation arrows */}
        <button
          onClick={goToPrev}
          disabled={currentStopIndex === 0}
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 ${
            currentStopIndex === 0 ? 'opacity-30' : 'hover:bg-black/70'
          }`}
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/50 hover:bg-black/70"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      </div>

      {/* Bottom status */}
      <div className="px-4 py-3 bg-black/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{host.avatar}</span>
          <span className="text-white/60 text-sm">{host.name}</span>
        </div>
        <div className="text-white/40 text-sm">
          {viewedHotspots.length}/{totalHotspots} hotspots viewed
        </div>
      </div>
    </div>
  );
}

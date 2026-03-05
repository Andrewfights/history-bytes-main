/**
 * BeforeAfterSlider - Hook 3: Compare Battleship Row before and after the attack
 */

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Info, X } from 'lucide-react';

interface BeforeAfterSliderProps {
  onComplete: () => void;
  onBack: () => void;
}

interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  fact: string;
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'arizona',
    x: 35,
    y: 45,
    label: 'USS Arizona',
    fact: 'The Arizona was hit by a 1,760-pound armor-piercing bomb that detonated in the forward magazine. 1,177 crew members were killed.',
  },
  {
    id: 'oklahoma',
    x: 55,
    y: 55,
    label: 'USS Oklahoma',
    fact: 'Hit by multiple torpedoes, the Oklahoma capsized within 12 minutes. 429 crew members were killed.',
  },
  {
    id: 'ford-island',
    x: 25,
    y: 30,
    label: 'Ford Island',
    fact: 'The naval air station on Ford Island was one of the first targets. Most aircraft were destroyed on the ground.',
  },
  {
    id: 'oil-slick',
    x: 70,
    y: 65,
    label: 'Oil Slicks',
    fact: 'Burning oil from damaged ships spread across the harbor, making rescue efforts extremely dangerous.',
  },
];

export function BeforeAfterSlider({ onComplete, onBack }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [viewedHotspots, setViewedHotspots] = useState<string[]>([]);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSliderChange = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, x)));
  };

  const handleHotspotClick = (hotspot: Hotspot) => {
    setActiveHotspot(hotspot);
    if (!viewedHotspots.includes(hotspot.id)) {
      const newViewed = [...viewedHotspots, hotspot.id];
      setViewedHotspots(newViewed);
      if (newViewed.length === HOTSPOTS.length) {
        setIsComplete(true);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <button
          onClick={onBack}
          className="p-2 -ml-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-editorial text-lg font-bold text-white">Before & After</h1>
        <div className="text-white/60 text-sm">
          {viewedHotspots.length}/{HOTSPOTS.length}
        </div>
      </div>

      {/* Date Labels */}
      <div className="flex justify-between px-4 py-2 text-sm">
        <span className="text-blue-400">Dec 6, 1941</span>
        <span className="text-red-400">Dec 7, 1941</span>
      </div>

      {/* Slider Container */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden cursor-ew-resize"
        onMouseMove={(e) => e.buttons === 1 && handleSliderChange(e)}
        onMouseDown={handleSliderChange}
        onTouchMove={handleSliderChange}
      >
        {/* Before Image (Peaceful) */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900">
          {/* Placeholder for actual before image */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white/50">
              <div className="text-6xl mb-4">🚢🚢🚢</div>
              <p className="text-sm">Battleship Row - Peaceful Morning</p>
              <p className="text-xs text-white/30 mt-2">8 battleships moored</p>
            </div>
          </div>
        </div>

        {/* After Image (Devastation) */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-red-900/50 to-orange-900/30"
          style={{
            clipPath: `inset(0 0 0 ${sliderPosition}%)`,
          }}
        >
          {/* Placeholder for actual after image */}
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white/50">
              <div className="text-6xl mb-4">💥🔥💥</div>
              <p className="text-sm">Battleship Row - Under Attack</p>
              <p className="text-xs text-white/30 mt-2">2,403 Americans killed</p>
            </div>
          </div>

          {/* Hotspots - only show on "after" side */}
          {HOTSPOTS.map((hotspot) => (
            <motion.button
              key={hotspot.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
              onClick={() => handleHotspotClick(hotspot)}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                viewedHotspots.includes(hotspot.id)
                  ? 'bg-green-500/80 border-2 border-green-400'
                  : 'bg-white/20 border-2 border-white/50 animate-pulse'
              }`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <Info size={16} className="text-white" />
            </motion.button>
          ))}
        </div>

        {/* Slider Handle */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
            <div className="flex gap-0.5">
              <div className="w-0.5 h-4 bg-slate-400 rounded-full" />
              <div className="w-0.5 h-4 bg-slate-400 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions / Progress */}
      <div className="px-4 py-4 bg-black/50">
        {isComplete ? (
          <button
            onClick={onComplete}
            className="w-full py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-colors"
          >
            Continue (+20 XP)
          </button>
        ) : (
          <p className="text-center text-white/60 text-sm">
            Drag slider and tap hotspots to learn more
          </p>
        )}
      </div>

      {/* Hotspot Modal */}
      {activeHotspot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveHotspot(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-slate-900 rounded-2xl border border-white/20 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="font-bold text-white">{activeHotspot.label}</h3>
              <button
                onClick={() => setActiveHotspot(null)}
                className="p-1 text-white/60 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-white/80 text-sm leading-relaxed">
                {activeHotspot.fact}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

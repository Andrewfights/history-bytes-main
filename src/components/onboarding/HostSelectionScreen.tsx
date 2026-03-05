import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { HostCard } from './HostCard';
import { useSortedGuides } from '@/hooks/useLiveData';
import type { SpiritGuide } from '@/types';

interface HostSelectionScreenProps {
  onSelect: (guide: SpiritGuide) => void;
}

export function HostSelectionScreen({ onSelect }: HostSelectionScreenProps) {
  const guides = useSortedGuides();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + guides.length) % guides.length);
  }, [guides.length]);

  const handleSelect = () => {
    onSelect(guides[current]);
  };

  const variants = {
    enter: (d: number) => ({
      x: d > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (d: number) => ({
      x: d > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="pt-12 pb-6 text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-editorial text-3xl font-bold text-foreground mb-2"
        >
          Choose Your Guide
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-sm max-w-xs mx-auto"
        >
          Select a historical figure to guide you through the ages
        </motion.p>
      </div>

      {/* Carousel */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        {/* Previous card preview */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 scale-75 pointer-events-none hidden md:block">
          {(() => {
            const prevGuide = guides[(current - 1 + guides.length) % guides.length];
            return prevGuide.imageUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/50">
                <img src={prevGuide.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-5xl text-center">{prevGuide.avatar}</div>
            );
          })()}
        </div>

        {/* Main card */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full max-w-sm"
          >
            <HostCard
              guide={guides[current]}
              isActive={true}
              onSelect={handleSelect}
            />
          </motion.div>
        </AnimatePresence>

        {/* Next card preview */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 scale-75 pointer-events-none hidden md:block">
          {(() => {
            const nextGuide = guides[(current + 1) % guides.length];
            return nextGuide.imageUrl ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border/50">
                <img src={nextGuide.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="text-5xl text-center">{nextGuide.avatar}</div>
            );
          })()}
        </div>
      </div>

      {/* Navigation */}
      <div className="pb-12 px-6">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {guides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1);
                setCurrent(i);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to guide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => go(-1)}
            className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary/40 transition-colors"
            aria-label="Previous guide"
          >
            <ChevronLeft size={24} className="text-muted-foreground" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => go(1)}
            className="w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center hover:border-primary/40 transition-colors"
            aria-label="Next guide"
          >
            <ChevronRight size={24} className="text-muted-foreground" />
          </motion.button>
        </div>

        {/* Swipe hint on mobile */}
        <p className="text-center text-xs text-muted-foreground mt-4 md:hidden">
          Swipe or tap arrows to explore guides
        </p>
      </div>
    </div>
  );
}

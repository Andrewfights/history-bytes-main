import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

// Track which images have loaded successfully
const imageCache = new Set<string>();

interface HeroSlide {
  tag: string;
  title: string;
  subtitle: string;
  year?: string;
  action: { label: string; onClick: () => void };
  accent: 'primary' | 'secondary';
  image?: string;
  imagePosition?: string;
}

interface HeroCarouselProps {
  onContinueJourney: () => void;
  onPlayDaily: () => void;
}

export function HeroCarousel({ onContinueJourney, onPlayDaily }: HeroCarouselProps) {
  const { setActiveTab } = useApp();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set(imageCache));

  // Preload images
  useEffect(() => {
    const imagesToLoad = [
      '/images/carousel/medieval-era.jpg',
      '/images/carousel/daily-challenge.jpg',
      '/images/carousel/fall-of-rome.jpg',
    ];

    imagesToLoad.forEach(src => {
      if (!imageCache.has(src)) {
        const img = new Image();
        img.onload = () => {
          imageCache.add(src);
          setLoadedImages(new Set(imageCache));
        };
        img.src = src;
      }
    });
  }, []);

  const slides: HeroSlide[] = [
    {
      tag: 'Continue Your Journey',
      title: 'The Medieval Era Awaits',
      subtitle: 'Pick up where you left off — castles, crusades, and the age of chivalry.',
      action: { label: 'Continue Journey', onClick: onContinueJourney },
      accent: 'primary',
      image: '/images/carousel/medieval-era.jpg',
      imagePosition: 'center',
    },
    {
      tag: 'Daily Challenge',
      title: 'Prove Your Knowledge',
      subtitle: 'A new set of questions issued at dawn. How will you rank today?',
      action: { label: 'Accept Challenge', onClick: onPlayDaily },
      accent: 'secondary',
      image: '/images/carousel/daily-challenge.jpg',
      imagePosition: 'center',
    },
    {
      tag: 'Featured Topic',
      title: 'The Fall of Rome',
      subtitle: 'Explore how the greatest empire in history crumbled from within.',
      action: { label: 'Explore Now', onClick: () => setActiveTab('explore') },
      accent: 'primary',
      image: '/images/carousel/fall-of-rome.jpg',
      imagePosition: 'center top',
    },
  ];

  const go = useCallback((dir: number) => {
    setDirection(dir);
    setCurrent((prev) => (prev + dir + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-advance every 6s
  useEffect(() => {
    const timer = setInterval(() => go(1), 8500);
    return () => clearInterval(timer);
  }, [go]);

  const slide = slides[current];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  const hasImage = slide.image && loadedImages.has(slide.image);

  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      {/* Background image with gradient overlay */}
      <AnimatePresence mode="wait">
        {hasImage && (
          <motion.div
            key={`bg-${current}`}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
          >
            <img
              src={slide.image}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: slide.imagePosition || 'center' }}
            />
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0id2hpdGUiLz48L3N2Zz4=')] pointer-events-none z-10" />

      {/* Gold top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent z-10" />

      <div className="relative min-h-[200px] md:min-h-[220px]">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative z-10 p-6 md:p-8"
          >
            <p className={`section-plaque mb-3 ${hasImage ? 'text-primary drop-shadow-sm' : 'text-primary'}`}>{slide.tag}</p>
            {slide.year && (
              <p className="year-display text-5xl text-primary/30 mb-1">{slide.year}</p>
            )}
            <h2 className={`font-editorial text-xl md:text-2xl font-bold leading-tight mb-2 ${hasImage ? 'text-foreground drop-shadow-sm' : ''}`}>
              {slide.title}
            </h2>
            <p className={`text-sm leading-relaxed mb-6 max-w-md ${hasImage ? 'text-foreground/90 drop-shadow-sm' : 'text-muted-foreground'}`}>
              {slide.subtitle}
            </p>
            <button
              onClick={slide.action.onClick}
              className="btn-ceremonial flex items-center gap-2 px-6 py-2.5 text-sm tracking-wide transition-all active:scale-[0.97]"
            >
              {slide.action.label} <ArrowRight size={15} />
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 pb-5">
        {/* Dots */}
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 bg-primary'
                  : `w-1.5 ${hasImage ? 'bg-foreground/30 hover:bg-foreground/50' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}`
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-1.5">
          <button
            onClick={() => go(-1)}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${
              hasImage
                ? 'border-foreground/20 bg-background/50 backdrop-blur-sm hover:border-primary/40'
                : 'border-border bg-card hover:border-primary/40'
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft size={16} className={hasImage ? 'text-foreground/80' : 'text-muted-foreground'} />
          </button>
          <button
            onClick={() => go(1)}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors ${
              hasImage
                ? 'border-foreground/20 bg-background/50 backdrop-blur-sm hover:border-primary/40'
                : 'border-border bg-card hover:border-primary/40'
            }`}
            aria-label="Next slide"
          >
            <ChevronRight size={16} className={hasImage ? 'text-foreground/80' : 'text-muted-foreground'} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * WW2HostSelection - Select a historical guide for WW2 content
 * Uses a swipeable carousel with host portraits and auto-playing intro videos
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play } from 'lucide-react';
import { getStoredWW2Hosts } from '@/data/ww2Hosts';
import { WW2Host } from '@/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface WW2HostSelectionProps {
  onSelectHost: (hostId: string) => void;
}

export function WW2HostSelection({ onSelectHost }: WW2HostSelectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hosts, setHosts] = useState<WW2Host[]>([]);

  // Load hosts from storage (includes admin edits) on mount
  useEffect(() => {
    setHosts(getStoredWW2Hosts());
  }, []);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrentIndex(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrentIndex(api.selectedScrollSnap());
    });
  }, [api]);

  // Single click to choose the current guide
  const handleChooseGuide = () => {
    const host = hosts[currentIndex];
    if (host) {
      onSelectHost(host.id);
    }
  };

  // Click on a card to navigate to it
  const handleCardClick = (index: number) => {
    api?.scrollTo(index);
  };

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black overflow-hidden"
    >
      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center pt-6 pb-2 px-4"
        >
          <h1 className="font-editorial text-3xl font-bold text-white mb-2">
            Choose Your Guide
          </h1>
          <p className="text-white/60 max-w-md mx-auto">
            Select a historical figure to guide you through World War II
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-safe" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          <div className="relative w-full max-w-lg">
            {/* Navigation Arrows */}
            <button
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={scrollNext}
              disabled={currentIndex === hosts.length - 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Carousel Container */}
            <Carousel
              setApi={setApi}
              opts={{
                align: 'center',
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {hosts.map((host, index) => (
                  <CarouselItem key={host.id} className="pl-2 basis-[85%]">
                    <HostCarouselCard
                      host={host}
                      isActive={currentIndex === index}
                      isSelected={currentIndex === index}
                      onClick={() => handleCardClick(index)}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Dot Indicators */}
          <div className="flex gap-2 mt-4">
            {hosts.map((host, index) => (
              <button
                key={host.id}
                onClick={() => api?.scrollTo(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentIndex === index
                    ? 'bg-white w-6'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Choose Guide Button - positioned below dots */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleChooseGuide}
            className="w-full max-w-lg mt-6 py-4 px-8 rounded-xl bg-amber-500 text-black font-bold text-lg hover:bg-amber-400 transition-all active:scale-[0.98]"
          >
            Choose {hosts[currentIndex]?.name}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface HostCarouselCardProps {
  host: WW2Host;
  isActive: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function HostCarouselCard({ host, isActive, isSelected, onClick }: HostCarouselCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false); // Default volume ON
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  // Auto-play video when active, pause and reset when not
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive && host.introVideoUrl) {
      setVideoEnded(false);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Auto-play blocked, that's ok
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoEnded(false);
    }
  }, [isActive, host.introVideoUrl]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setVideoEnded(false);
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <motion.div
      onClick={onClick}
      animate={{
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl overflow-hidden border-2 transition-colors cursor-pointer ${
        isSelected
          ? 'border-amber-400 shadow-lg shadow-amber-400/20'
          : isActive
          ? 'border-white/40'
          : 'border-white/10'
      }`}
    >
      {/* Image/Video Container */}
      <div className="relative aspect-[4/5] bg-gradient-to-b from-slate-800 to-slate-900">
        {/* Portrait Image or Video */}
        {host.introVideoUrl && isActive && !videoEnded ? (
          <>
            <video
              ref={videoRef}
              src={host.introVideoUrl}
              muted={isMuted}
              playsInline
              autoPlay
              onLoadedData={() => setVideoLoaded(true)}
              onEnded={() => setVideoEnded(true)}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Mute Toggle */}
            <button
              onClick={toggleMute}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </>
        ) : host.imageUrl ? (
          <>
            <img
              src={host.imageUrl}
              alt={host.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Replay Button - shown after video ends, over the portrait */}
            {videoEnded && host.introVideoUrl && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleReplay}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/30"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors">
                  <Play size={28} className="text-white ml-1" fill="white" />
                </div>
              </motion.button>
            )}
          </>
        ) : (
          // Fallback to avatar
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: host.primaryColor }}
          >
            <span className="text-8xl">{host.avatar}</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Host Info */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="font-editorial text-2xl font-bold text-white mb-1">
            {host.name}
          </h3>
          <p className="text-white/70 text-sm mb-3">{host.title}</p>

          {/* Specialty Badge */}
          <div className="flex items-center gap-2">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${host.primaryColor}40`,
                color: 'white',
              }}
            >
              {host.specialty}
            </span>
            <span className="text-white/40 text-xs">{host.era}</span>
          </div>

          {/* Description - only show when active */}
          <AnimatePresence>
            {isActive && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-white/60 text-sm mt-3 line-clamp-2"
              >
                {host.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Indicator */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center"
          >
            <svg
              className="w-5 h-5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

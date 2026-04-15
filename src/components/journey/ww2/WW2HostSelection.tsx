/**
 * WW2HostSelection - Select a historical guide for WW2 content
 * Uses a swipeable carousel with host portraits and auto-playing intro videos
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Play, X, Info, Lock } from 'lucide-react';
import { getStoredWW2Hosts, loadWW2HostsFromFirestore, WW2_HOSTS } from '@/data/ww2Hosts';
import { subscribeToWW2Hosts } from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';
import { WW2Host } from '@/types';

// Helper to get default video URL for a host (fallback when Firestore doesn't have one)
function getDefaultVideoUrl(hostId: string, type: 'intro' | 'welcome'): string | undefined {
  const defaultHost = WW2_HOSTS.find(h => h.id === hostId);
  return type === 'intro' ? defaultHost?.introVideoUrl : defaultHost?.welcomeVideoUrl;
}
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/components/ui/carousel';

interface WW2HostSelectionProps {
  onSelectHost: (hostId: string) => void;
  onClose?: () => void;
}

// Helper to map Firestore hosts to WW2Host with proper video fallbacks
function mapFirestoreHost(h: {
  id: string;
  name: string;
  title: string;
  era: string;
  specialty: string;
  imageUrl?: string;
  introVideoUrl?: string;
  welcomeVideoUrl?: string;
  moreInfoVideoUrl?: string;
  primaryColor: string;
  avatar: string;
  voiceStyle: string;
  description: string;
  displayOrder?: number;
  hidden?: boolean;
  isAvailable?: boolean;
}): (WW2Host & { displayOrder?: number; hidden?: boolean }) | null {
  // Filter out hidden hosts
  if (h.hidden) return null;
  return {
    id: h.id as WW2Host['id'],
    name: h.name,
    title: h.title,
    era: h.era,
    specialty: h.specialty,
    imageUrl: h.imageUrl,
    // Use Firestore URL if valid (not local data URL), otherwise fall back to default
    introVideoUrl: (h.introVideoUrl && !h.introVideoUrl.startsWith('data:') && !h.introVideoUrl.startsWith('blob:'))
      ? h.introVideoUrl
      : getDefaultVideoUrl(h.id, 'intro'),
    welcomeVideoUrl: (h.welcomeVideoUrl && !h.welcomeVideoUrl.startsWith('data:') && !h.welcomeVideoUrl.startsWith('blob:'))
      ? h.welcomeVideoUrl
      : getDefaultVideoUrl(h.id, 'welcome'),
    moreInfoVideoUrl: h.moreInfoVideoUrl,
    primaryColor: h.primaryColor,
    avatar: h.avatar,
    voiceStyle: h.voiceStyle,
    description: h.description,
    displayOrder: h.displayOrder,
    isAvailable: h.isAvailable ?? true,  // Default to true if not specified
  };
}

// Sort hosts by displayOrder
function sortByDisplayOrder<T extends { displayOrder?: number }>(hosts: T[]): T[] {
  return [...hosts].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

export function WW2HostSelection({ onSelectHost, onClose }: WW2HostSelectionProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hosts, setHosts] = useState<WW2Host[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedRef = useRef(false); // Prevent double-loading race condition

  // More Info video modal state
  const [showMoreInfoVideo, setShowMoreInfoVideo] = useState(false);
  const [moreInfoVideoUrl, setMoreInfoVideoUrl] = useState<string | null>(null);

  // Load hosts from storage (includes admin edits) on mount and subscribe to updates
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const loadAndSubscribe = async () => {
      // Prevent double initialization
      if (loadedRef.current) return;
      loadedRef.current = true;

      // Initial load - use sync storage first for immediate display
      const initialHosts = getStoredWW2Hosts();
      console.log('[WW2HostSelection] Initial hosts from storage:', initialHosts.length);
      setHosts(sortByDisplayOrder(initialHosts));

      // If Firebase is configured, load from Firestore and set up subscription
      if (isFirebaseConfigured()) {
        console.log('[WW2HostSelection] Firebase configured, loading from Firestore...');

        // Load latest from Firestore
        const firestoreHosts = await loadWW2HostsFromFirestore();
        if (firestoreHosts.length > 0) {
          const mapped = firestoreHosts.map(mapFirestoreHost).filter((h): h is NonNullable<typeof h> => h !== null);
          console.log('[WW2HostSelection] Loaded from Firestore:', mapped.length, 'visible hosts');
          setHosts(sortByDisplayOrder(mapped));
        }

        // Subscribe to real-time updates (will fire on any admin changes)
        console.log('[WW2HostSelection] Setting up Firestore subscription...');
        unsubscribe = subscribeToWW2Hosts((firestoreHosts) => {
          if (firestoreHosts && firestoreHosts.length > 0) {
            const mapped = firestoreHosts.map(mapFirestoreHost).filter((h): h is NonNullable<typeof h> => h !== null);
            console.log('[WW2HostSelection] 🔥 Firestore update:', mapped.map(h => ({
              id: h.id,
              order: h.displayOrder,
              video: h.introVideoUrl ? '✓' : '✗'
            })));
            setHosts(sortByDisplayOrder(mapped));
          }
        });
      }

      setIsLoaded(true);
    };

    loadAndSubscribe();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Track current slide
  useEffect(() => {
    if (!api) return;

    setCurrentIndex(api.selectedScrollSnap());

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on('select', onSelect);

    return () => {
      api.off('select', onSelect);
    };
  }, [api]);

  // Single click to choose the current guide (only if available)
  const handleChooseGuide = () => {
    const host = hosts[currentIndex];
    if (host && host.isAvailable !== false) {
      onSelectHost(host.id);
    }
  };

  // Handle More Info button click
  const handleMoreInfo = () => {
    const host = hosts[currentIndex];
    if (host?.moreInfoVideoUrl) {
      setMoreInfoVideoUrl(host.moreInfoVideoUrl);
      setShowMoreInfoVideo(true);
    }
  };

  // Close More Info video modal
  const handleCloseMoreInfo = () => {
    setShowMoreInfoVideo(false);
    setMoreInfoVideoUrl(null);
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
      className="fixed inset-0 z-50 flex flex-col bg-gradient-to-b from-black via-neutral-950 to-black overflow-hidden"
    >
      {/* Red/gold accent gradient overlay */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(196,18,48,0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(198,162,79,0.1) 0%, transparent 40%)'
        }}
      />

      {/* Film grain overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Header with close button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative text-center pt-4 sm:pt-6 pb-2 px-4"
        >
          {/* Close/Back button */}
          {onClose && (
            <button
              onClick={onClose}
              className="absolute left-4 top-4 sm:top-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              aria-label="Go back"
            >
              <X size={20} />
            </button>
          )}

          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-white mb-2">
            Choose Your Guide
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md mx-auto px-2">
            Select a historical figure to guide you through World War II
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 overflow-hidden">
          <div className="relative w-full max-w-sm sm:max-w-md md:max-w-md lg:max-w-lg mx-auto">
            {/* Navigation Arrows - hidden on very small screens, use swipe instead */}
            <button
              onClick={scrollPrev}
              disabled={currentIndex === 0}
              className="hidden sm:flex absolute -left-2 sm:left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              <ChevronLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={scrollNext}
              disabled={currentIndex === hosts.length - 1}
              className="hidden sm:flex absolute -right-2 sm:right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 backdrop-blur-sm items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/20 transition-all"
            >
              <ChevronRight size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Carousel Container */}
            <Carousel
              setApi={setApi}
              opts={{
                align: 'center',
                loop: false,
                containScroll: false,
              }}
              className="w-full overflow-visible"
            >
              <CarouselContent className="ml-0">
                {hosts.map((host, index) => (
                  <CarouselItem
                    key={host.id}
                    className="pl-0 flex items-center justify-center"
                    style={{ flexBasis: '85%' }}
                  >
                    <div className="w-full max-w-[320px] sm:max-w-none">
                      <HostCarouselCard
                        host={host}
                        isActive={currentIndex === index}
                        isSelected={currentIndex === index}
                        onClick={() => handleCardClick(index)}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Dot Indicators - visible on all screen sizes with better mobile touch targets */}
          <div className="flex gap-2 sm:gap-2 mt-4 justify-center">
            {hosts.map((host, index) => (
              <button
                key={host.id}
                onClick={() => api?.scrollTo(index)}
                className={`h-2 sm:h-2.5 rounded-full transition-all min-w-[32px] sm:min-w-0 ${
                  currentIndex === index
                    ? 'bg-white w-6 sm:w-6'
                    : 'bg-white/30 hover:bg-white/50 active:bg-white/60 w-2 sm:w-2.5'
                }`}
                aria-label={`Go to ${host.name}`}
              />
            ))}
          </div>

          {/* Swipe hint - visible on mobile only */}
          <p className="text-center text-xs text-white/40 mt-2 sm:hidden">
            Swipe to explore guides
          </p>

          {/* Buttons Section - Choose Guide and More Info */}
          <div
            className="w-full px-4 mt-4 sm:mt-6"
            style={{ paddingBottom: 'max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))' }}
          >
            <div className="max-w-md mx-auto space-y-3">
              {/* More Info Button - only show if current guide has a more info video */}
              {hosts[currentIndex]?.moreInfoVideoUrl && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleMoreInfo}
                  className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-white/10 backdrop-blur-sm text-white font-medium text-sm sm:text-base hover:bg-white/20 active:bg-white/30 transition-all active:scale-[0.98] border border-white/20"
                >
                  <Info size={18} />
                  More About {hosts[currentIndex]?.name}
                </motion.button>
              )}

              {/* Choose Guide / Coming Soon Button */}
              {hosts[currentIndex]?.isAvailable !== false ? (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={handleChooseGuide}
                  className="w-full py-4 sm:py-4 px-6 sm:px-8 rounded-xl bg-amber-500 text-black font-bold text-base sm:text-lg hover:bg-amber-400 active:bg-amber-600 transition-all active:scale-[0.98] min-h-[52px]"
                >
                  Choose {hosts[currentIndex]?.name || 'Guide'}
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full py-4 sm:py-4 px-6 sm:px-8 rounded-xl bg-white/10 text-white/50 font-bold text-base sm:text-lg text-center min-h-[52px] flex items-center justify-center gap-2 border border-white/10"
                >
                  <Lock size={18} />
                  Coming Soon
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* More Info Video Modal */}
      <AnimatePresence>
        {showMoreInfoVideo && moreInfoVideoUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center">
              <video
                src={moreInfoVideoUrl}
                autoPlay
                playsInline
                controls
                onEnded={handleCloseMoreInfo}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 pb-8 bg-gradient-to-t from-black via-black/80 to-transparent">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleCloseMoreInfo}
                className="w-full max-w-md mx-auto block px-8 py-4 rounded-xl bg-white/20 backdrop-blur-sm text-white font-bold text-lg hover:bg-white/30 transition-all"
              >
                Back to Selection
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [videoError, setVideoError] = useState(false);

  // Check if this guide is available
  const isAvailable = host.isAvailable !== false;

  // Auto-play video when active, pause and reset when not
  useEffect(() => {
    if (!videoRef.current) return;

    if (isActive && host.introVideoUrl && !videoError) {
      setVideoEnded(false);
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch((err) => {
        console.log('[HostCard] Video play error:', err);
        // Auto-play blocked, that's ok
      });
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setVideoEnded(false);
    }
  }, [isActive, host.introVideoUrl, videoError]);

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

  // Determine what to show: video, image, or avatar
  const showVideo = host.introVideoUrl && isActive && !videoEnded && !videoError;
  const showImage = host.imageUrl && !showVideo;
  const showAvatar = !showVideo && !showImage;

  return (
    <motion.div
      onClick={onClick}
      animate={{
        scale: isActive ? 1 : 0.9,
        opacity: isActive ? 1 : 0.5,
      }}
      transition={{ duration: 0.3 }}
      className={`relative rounded-2xl overflow-hidden border-2 transition-colors cursor-pointer ${
        !isAvailable
          ? 'border-white/20'
          : isSelected
          ? 'border-amber-400 shadow-lg shadow-amber-400/20'
          : isActive
          ? 'border-white/40'
          : 'border-white/10'
      }`}
    >
      {/* Image/Video Container - limit height on desktop so buttons are visible */}
      <div className={`relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[4/5] md:max-h-[55vh] bg-gradient-to-b from-neutral-800 to-neutral-900 ${!isAvailable ? 'grayscale' : ''}`}>
        {/* Video - always render but hide when not active */}
        {host.introVideoUrl && (
          <video
            ref={videoRef}
            src={host.introVideoUrl}
            muted={isMuted}
            playsInline
            preload="auto"
            onLoadedData={() => setVideoLoaded(true)}
            onEnded={() => setVideoEnded(true)}
            onError={() => setVideoError(true)}
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              showVideo ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        )}

        {/* Mute Toggle - only when video is showing - improved touch target */}
        {showVideo && (
          <button
            onClick={toggleMute}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-11 h-11 sm:w-10 sm:h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 active:bg-black/80 transition-colors"
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
          >
            {isMuted ? <VolumeX size={20} className="sm:w-[18px] sm:h-[18px]" /> : <Volume2 size={20} className="sm:w-[18px] sm:h-[18px]" />}
          </button>
        )}

        {/* Image fallback */}
        {showImage && (
          <>
            <img
              src={host.imageUrl}
              alt={host.name}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            {/* Post-video overlay - Replay option */}
            {videoEnded && host.introVideoUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40"
              >
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleReplay}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-sm hover:bg-white/20 hover:text-white transition-colors"
                >
                  <Play size={14} fill="currentColor" />
                  Watch Again
                </motion.button>
              </motion.div>
            )}
          </>
        )}

        {/* Avatar fallback */}
        {showAvatar && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: host.primaryColor }}
          >
            <span className="text-8xl">{host.avatar}</span>
            {/* Replay option if video ended but no image */}
            {videoEnded && host.introVideoUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/40"
              >
                <motion.button
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  onClick={handleReplay}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/70 text-sm hover:bg-white/20 hover:text-white transition-colors"
                >
                  <Play size={14} fill="currentColor" />
                  Watch Again
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Host Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
          <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white mb-1">
            {host.name}
          </h3>
          <p className="text-white/70 text-xs sm:text-sm mb-2 sm:mb-3">{host.title}</p>

          {/* Specialty Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium"
              style={{
                backgroundColor: `${host.primaryColor}40`,
                color: 'white',
              }}
            >
              {host.specialty}
            </span>
            <span className="text-white/40 text-[10px] sm:text-xs">{host.era}</span>
          </div>

          {/* Description - only show when active */}
          <AnimatePresence>
            {isActive && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-white/60 text-xs sm:text-sm mt-2 sm:mt-3 line-clamp-2"
              >
                {host.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Indicator - only show for available guides */}
        {isSelected && isAvailable && (
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

        {/* Coming Soon Badge - for unavailable guides */}
        {!isAvailable && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1.5 border border-white/20"
          >
            <Lock size={14} className="text-white/70" />
            <span className="text-xs font-medium text-white/70">Coming Soon</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

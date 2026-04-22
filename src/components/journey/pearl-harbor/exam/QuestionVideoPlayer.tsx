/**
 * QuestionVideoPlayer - Lightweight looping video player for game show mode
 * Features:
 * - Autoplay, loop, muted (no controls)
 * - Multiple layout modes: side-panel, top-banner, background
 * - Preloads next question's video
 * - Fallback gradient if no video available
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { VideoLayoutMode } from './types';

interface QuestionVideoPlayerProps {
  videoUrl?: string;
  layoutMode: VideoLayoutMode;
  nextVideoUrl?: string; // For preloading
  onError?: () => void;
}

export function QuestionVideoPlayer({
  videoUrl,
  layoutMode,
  nextVideoUrl,
  onError,
}: QuestionVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const preloadRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset state when video URL changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [videoUrl]);

  // Handle video load
  const handleLoadedData = () => {
    setIsLoaded(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, likely due to browser policy
        // Video will still be visible, just paused
      });
    }
  };

  // Handle video error
  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Get layout-specific classes
  const getLayoutClasses = () => {
    switch (layoutMode) {
      case 'side-panel':
        return 'w-full aspect-video rounded-xl overflow-hidden';
      case 'top-banner':
        return 'w-full h-32 rounded-xl overflow-hidden';
      case 'background':
        return 'absolute inset-0 w-full h-full';
    }
  };

  const getOverlayClasses = () => {
    switch (layoutMode) {
      case 'side-panel':
        return ''; // No overlay for side panel
      case 'top-banner':
        return ''; // No overlay for top banner
      case 'background':
        return 'absolute inset-0 bg-black/60'; // Dim overlay for background
    }
  };

  // Fallback gradient when no video or error
  const FallbackGradient = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`${getLayoutClasses()} bg-gradient-to-br from-amber-900/30 via-black to-black`}
    >
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-amber-500/30 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );

  // No video URL provided
  if (!videoUrl || hasError) {
    return <FallbackGradient />;
  }

  return (
    <div className={`relative ${getLayoutClasses()}`}>
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Main video */}
      <motion.video
        ref={videoRef}
        src={videoUrl}
        autoPlay
        loop
        muted
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        className="w-full h-full object-cover"
      />

      {/* Background overlay (for background mode) */}
      {layoutMode === 'background' && (
        <div className={getOverlayClasses()} />
      )}

      {/* Preload next video (hidden) */}
      {nextVideoUrl && (
        <video
          ref={preloadRef}
          src={nextVideoUrl}
          preload="auto"
          muted
          className="hidden"
        />
      )}
    </div>
  );
}

/**
 * Container component that handles layout positioning
 */
interface QuestionVideoContainerProps {
  videoUrl?: string;
  layoutMode: VideoLayoutMode;
  nextVideoUrl?: string;
  children: React.ReactNode;
}

export function QuestionVideoContainer({
  videoUrl,
  layoutMode,
  nextVideoUrl,
  children,
}: QuestionVideoContainerProps) {
  if (layoutMode === 'background') {
    return (
      <div className="relative min-h-full">
        <QuestionVideoPlayer
          videoUrl={videoUrl}
          layoutMode={layoutMode}
          nextVideoUrl={nextVideoUrl}
        />
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  if (layoutMode === 'top-banner') {
    return (
      <div className="flex flex-col gap-4">
        <QuestionVideoPlayer
          videoUrl={videoUrl}
          layoutMode={layoutMode}
          nextVideoUrl={nextVideoUrl}
        />
        {children}
      </div>
    );
  }

  // side-panel (default)
  return (
    <div className="flex gap-6">
      <div className="w-2/5 shrink-0">
        <QuestionVideoPlayer
          videoUrl={videoUrl}
          layoutMode={layoutMode}
          nextVideoUrl={nextVideoUrl}
        />
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

/**
 * Mobile-responsive container that switches to top-banner on small screens
 */
interface ResponsiveVideoContainerProps {
  videoUrl?: string;
  desktopLayout: VideoLayoutMode;
  nextVideoUrl?: string;
  children: React.ReactNode;
}

export function ResponsiveVideoContainer({
  videoUrl,
  desktopLayout,
  nextVideoUrl,
  children,
}: ResponsiveVideoContainerProps) {
  // On mobile, always use top-banner
  // On desktop, use the specified layout
  return (
    <>
      {/* Mobile: top-banner */}
      <div className="md:hidden flex flex-col gap-4">
        <QuestionVideoPlayer
          videoUrl={videoUrl}
          layoutMode="top-banner"
          nextVideoUrl={nextVideoUrl}
        />
        {children}
      </div>

      {/* Desktop: specified layout */}
      <div className="hidden md:block">
        <QuestionVideoContainer
          videoUrl={videoUrl}
          layoutMode={desktopLayout}
          nextVideoUrl={nextVideoUrl}
        >
          {children}
        </QuestionVideoContainer>
      </div>
    </>
  );
}

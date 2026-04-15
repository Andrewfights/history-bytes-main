import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, BookOpen, Trophy, Compass, Volume2, VolumeX, Play } from 'lucide-react';
import type { SpiritGuide } from '@/types';

interface WelcomeScreenProps {
  guide: SpiritGuide;
  onBegin: () => void;
}

export function WelcomeScreen({ guide, onBegin }: WelcomeScreenProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasWelcomeVideo = !!guide.welcomeVideoUrl;

  const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
    slate: { bg: 'bg-slate-500/10', border: 'border-slate-400/30', text: 'text-slate-300', glow: 'shadow-slate-400/20' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', glow: 'shadow-purple-500/20' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
    red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
  };

  const colors = colorMap[guide.primaryColor] || colorMap.amber;

  const features = [
    { icon: Compass, label: 'Campaign through eras' },
    { icon: BookOpen, label: 'Learn from primary sources' },
    { icon: Trophy, label: 'Earn XP and rank up' },
  ];

  // Auto-play video when component mounts (if available)
  useEffect(() => {
    if (hasWelcomeVideo && videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            // Auto-play was prevented, user needs to click
            setIsPlaying(false);
          });
      }
    }
  }, [hasWelcomeVideo]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVideoEnded = () => {
    setVideoEnded(true);
    setIsPlaying(false);
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        setVideoEnded(false);
      }).catch(console.error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      {/* Animated Avatar / Welcome Video */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15, stiffness: 100 }}
        className={`relative w-40 h-40 rounded-full flex items-center justify-center overflow-hidden ${colors.bg} border-2 ${colors.border} shadow-2xl ${colors.glow} mb-6`}
      >
        {hasWelcomeVideo ? (
          <>
            <video
              ref={videoRef}
              src={guide.welcomeVideoUrl}
              className="w-full h-full object-cover"
              muted={isMuted}
              playsInline
              onEnded={handleVideoEnded}
            />

            {/* Play button overlay if not playing */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handlePlayVideo}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                    <Play size={24} className="text-primary ml-1" fill="currentColor" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Mute/Unmute button */}
            {isPlaying && (
              <button
                onClick={toggleMute}
                className="absolute bottom-2 right-2 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
            )}

            {/* Avatar badge */}
            <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center text-xl ${colors.bg} border-2 ${colors.border} bg-background z-10`}>
              {guide.avatar}
            </div>
          </>
        ) : (
          <span className="text-6xl">{guide.avatar}</span>
        )}
      </motion.div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center max-w-md mb-8"
      >
        <h2 className="font-editorial text-2xl font-bold text-foreground mb-2">
          Greetings, Traveler
        </h2>
        <p className={`text-sm ${colors.text} font-medium mb-4`}>
          {guide.name} will be your guide
        </p>
        <blockquote className="text-muted-foreground text-sm italic leading-relaxed">
          "{guide.welcomeMessage}"
        </blockquote>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 mb-10 w-full max-w-xs"
      >
        {features.map((feature, i) => (
          <motion.div
            key={feature.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
          >
            <div className={`w-10 h-10 rounded-full ${colors.bg} ${colors.border} border flex items-center justify-center`}>
              <feature.icon size={18} className={colors.text} />
            </div>
            <span className="text-sm text-foreground">{feature.label}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Begin Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onBegin}
        className="w-full max-w-xs py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base tracking-wide flex items-center justify-center gap-2 transition-all hover:bg-primary/90 shadow-lg"
      >
        Begin Your Campaign
        <ArrowRight size={18} />
      </motion.button>

      {/* Subtle hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-xs text-muted-foreground mt-4"
      >
        You can change your guide anytime in Settings
      </motion.p>
    </div>
  );
}

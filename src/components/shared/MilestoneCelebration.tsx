import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Star, Volume2, VolumeX, Play } from 'lucide-react';
import { MilestoneContent, MilestoneType } from '@/data/celebrationData';
import { useApp } from '@/context/AppContext';
import { useLiveGuide } from '@/hooks/useLiveData';

interface MilestoneCelebrationProps {
  isOpen: boolean;
  milestone: MilestoneContent | null;
  onContinue: () => void;
  newRankIcon?: string;
}

const typeBackgrounds: Record<MilestoneType, string> = {
  chapter: 'from-emerald-500/20 to-emerald-900/40',
  arc: 'from-amber-500/30 to-amber-900/50',
  rank: 'from-purple-500/30 to-purple-900/50',
  streak: 'from-orange-500/30 to-orange-900/50',
  crown: 'from-yellow-500/30 to-yellow-900/50',
  perfect: 'from-cyan-500/30 to-cyan-900/50',
};

const typeGlows: Record<MilestoneType, string> = {
  chapter: 'shadow-emerald-500/30',
  arc: 'shadow-amber-500/30',
  rank: 'shadow-purple-500/30',
  streak: 'shadow-orange-500/30',
  crown: 'shadow-yellow-500/30',
  perfect: 'shadow-cyan-500/30',
};

export function MilestoneCelebration({
  isOpen,
  milestone,
  onContinue,
  newRankIcon,
}: MilestoneCelebrationProps) {
  const { selectedGuideId } = useApp();
  const guide = useLiveGuide(selectedGuideId || '');
  const [showConfetti, setShowConfetti] = useState(false);
  const [xpAnimated, setXpAnimated] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const hasCelebrationVideo = guide?.celebrationVideoUrl;

  useEffect(() => {
    if (isOpen && milestone) {
      setShowConfetti(true);

      // Auto-play celebration video
      if (hasCelebrationVideo && videoRef.current) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }

      // Animate XP counter if there's a bonus
      if (milestone.xpBonus) {
        const duration = 1500;
        const steps = 30;
        const increment = milestone.xpBonus / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= milestone.xpBonus!) {
            setXpAnimated(milestone.xpBonus!);
            clearInterval(timer);
          } else {
            setXpAnimated(Math.floor(current));
          }
        }, duration / steps);

        return () => clearInterval(timer);
      }
    } else {
      setShowConfetti(false);
      setXpAnimated(0);
      setIsPlaying(false);
    }
  }, [isOpen, milestone, hasCelebrationVideo]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handlePlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  if (!milestone) return null;

  const bgGradient = typeBackgrounds[milestone.type] || typeBackgrounds.chapter;
  const glowClass = typeGlows[milestone.type] || typeGlows.chapter;
  const displayIcon = newRankIcon || milestone.emoji;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md px-6"
        >
          {/* Confetti Background */}
          {showConfetti && <CelebrationConfetti />}

          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            className={`w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl ${glowClass}`}
          >
            {/* Header with gradient */}
            <div className={`bg-gradient-to-br ${bgGradient} p-8 text-center relative`}>
              {/* Sparkle decorations */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-4 left-6"
              >
                <Sparkles size={16} className="text-white/40" />
              </motion.div>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1],
                  rotate: [360, 180, 0],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-8 right-8"
              >
                <Star size={14} className="text-white/30" />
              </motion.div>

              {/* Main Icon or Guide Video */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
                className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/10 backdrop-blur flex items-center justify-center overflow-hidden relative"
              >
                {hasCelebrationVideo ? (
                  <>
                    <video
                      ref={videoRef}
                      src={guide.celebrationVideoUrl}
                      className="w-full h-full object-cover"
                      muted={isMuted}
                      playsInline
                      loop
                      onEnded={() => setIsPlaying(false)}
                    />
                    {isPlaying && (
                      <button
                        onClick={toggleMute}
                        className="absolute bottom-1 right-1 p-1 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                      >
                        {isMuted ? <VolumeX size={10} /> : <Volume2 size={10} />}
                      </button>
                    )}
                    {!isPlaying && (
                      <button
                        onClick={handlePlayVideo}
                        className="absolute inset-0 flex items-center justify-center bg-black/30"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center">
                          <Play size={14} className="text-primary ml-0.5" fill="currentColor" />
                        </div>
                      </button>
                    )}
                  </>
                ) : (
                  <span className="text-5xl">{displayIcon}</span>
                )}
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="font-editorial text-2xl font-bold text-white mb-1"
              >
                {milestone.title}
              </motion.h1>

              {milestone.subtitle && (
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-white/80 text-sm font-medium"
                >
                  {milestone.subtitle}
                </motion.p>
              )}
            </div>

            {/* Content */}
            <div className="bg-card p-6">
              {/* Guide Message (if available) */}
              {guide && (
                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.55 }}
                  className="flex items-center gap-2 justify-center mb-4 text-sm text-muted-foreground"
                >
                  <span>{guide.avatar}</span>
                  <span className="italic">"{guide.catchphrases[Math.floor(Math.random() * guide.catchphrases.length)]}"</span>
                </motion.div>
              )}

              {/* Message */}
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-muted-foreground mb-6"
              >
                {milestone.message}
              </motion.p>

              {/* XP Bonus */}
              {milestone.xpBonus && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-primary/10 border border-primary/20"
                >
                  <Sparkles size={18} className="text-primary" />
                  <span className="font-bold text-primary text-lg">
                    +{xpAnimated} XP Bonus!
                  </span>
                </motion.div>
              )}

              {/* Continue Button */}
              <motion.button
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
              >
                Continue
                <ArrowRight size={18} />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function CelebrationConfetti() {
  const particles = Array.from({ length: 50 }, (_, i) => i);
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((i) => {
        const startX = Math.random() * 100;
        const color = colors[i % colors.length];
        const size = 4 + Math.random() * 8;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 2;
        const isCircle = Math.random() > 0.5;
        const rotation = Math.random() * 720;

        return (
          <motion.div
            key={i}
            initial={{
              y: -20,
              x: `${startX}vw`,
              opacity: 1,
              rotate: 0,
              scale: 0,
            }}
            animate={{
              y: '100vh',
              x: `${startX + (Math.random() - 0.5) * 20}vw`,
              opacity: [1, 1, 1, 0],
              rotate: rotation,
              scale: [0, 1, 1, 0.5],
            }}
            transition={{
              duration,
              delay,
              ease: 'easeOut',
            }}
            className="absolute"
            style={{
              backgroundColor: color,
              width: size,
              height: size,
              borderRadius: isCircle ? '50%' : '2px',
            }}
          />
        );
      })}
    </div>
  );
}

export default MilestoneCelebration;

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Play, CheckCircle2, XCircle, ChevronRight, Pause, Volume2, VolumeX } from 'lucide-react';
import { WatchNodeContent } from '@/data/ghostArmyStory';
import { useGhostArmyNodeMedia } from './useGhostArmyMedia';

interface WatchNodeProps {
  content: WatchNodeContent;
  xpReward: number;
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
}

type Phase = 'intro' | 'narration' | 'interaction' | 'result' | 'transition';

export function WatchNode({ content, xpReward, onComplete }: WatchNodeProps) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [narrationIndex, setNarrationIndex] = useState(0);
  const [swipeAnswer, setSwipeAnswer] = useState<'real' | 'fake' | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);

  // Get stored media for this node
  const media = useGhostArmyNodeMedia('node-1-watch');

  // Sync muted state across videos
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
    if (introVideoRef.current) {
      introVideoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Swipe gesture values
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Label visibility based on swipe direction
  const leftLabelOpacity = useTransform(x, [-150, -50, 0], [1, 0.3, 0]);
  const rightLabelOpacity = useTransform(x, [0, 50, 150], [0, 0.3, 1]);

  const handleStartNarration = () => {
    setPhase('narration');
  };

  // Auto-advance narration
  useEffect(() => {
    if (phase !== 'narration') return;

    const currentNarration = content.narration[narrationIndex];
    const duration = currentNarration?.duration || 5;

    const timer = setTimeout(() => {
      if (narrationIndex < content.narration.length - 1) {
        setNarrationIndex(prev => prev + 1);
      } else {
        // End of narration, show interaction
        setPhase('interaction');
      }
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [phase, narrationIndex, content.narration]);

  const handleSwipeEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.x > threshold) {
      // Swiped right = Real
      setSwipeAnswer('real');
      setIsCorrect(content.interaction.isReal === true);
      setPhase('result');
    } else if (info.offset.x < -threshold) {
      // Swiped left = Fake
      setSwipeAnswer('fake');
      setIsCorrect(content.interaction.isReal === false);
      setPhase('result');
    }
  };

  const handleContinue = () => {
    setPhase('transition');
    setTimeout(() => {
      const earnedXP = isCorrect ? xpReward : Math.floor(xpReward * 0.5);
      onComplete(earnedXP, { correct: isCorrect ? 1 : 0, total: 1 });
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <AnimatePresence mode="wait">
        {/* Intro Phase */}
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center"
          >
            {/* Cinematic video or placeholder */}
            <div className="w-full aspect-video bg-gradient-to-b from-obsidian-800 to-obsidian-950 rounded-xl mb-8 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20" />
              {media?.videoUrl ? (
                <>
                  <video
                    ref={introVideoRef}
                    src={media.videoUrl}
                    poster={media.videoThumbnail}
                    className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                    muted={isMuted}
                    autoPlay
                    playsInline
                    onClick={(e) => {
                      const video = e.currentTarget;
                      if (video.paused) {
                        video.play();
                      } else {
                        video.pause();
                      }
                    }}
                  />
                  {/* Audio toggle button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute bottom-3 right-3 z-20 w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-white" />
                    ) : (
                      <Volume2 size={18} className="text-white" />
                    )}
                  </button>
                </>
              ) : media?.backgroundImage ? (
                <img
                  src={media.backgroundImage}
                  alt="Ghost Army"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="text-center z-10">
                  <div className="text-5xl mb-4">🎬</div>
                  <p className="text-white/60 text-sm">B&W Tank Footage</p>
                </div>
              )}
            </div>

            <h2 className="font-editorial text-2xl font-bold mb-4">{content.title}</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              A cinematic journey into one of WWII's most classified operations.
            </p>

            <button
              onClick={handleStartNarration}
              className="flex items-center gap-3 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              <Play size={20} />
              Begin
            </button>
          </motion.div>
        )}

        {/* Narration Phase */}
        {phase === 'narration' && (
          <motion.div
            key="narration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)]"
          >
            {/* Full-screen cinematic view */}
            <div className="relative h-[50vh] bg-gradient-to-b from-obsidian-900 to-obsidian-950 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 z-10 pointer-events-none" />

              {/* Video or placeholder - use videoUrl2 for narration, fallback to videoUrl */}
              {(media?.videoUrl2 || media?.videoUrl) ? (
                <video
                  ref={videoRef}
                  src={media.videoUrl2 || media.videoUrl}
                  poster={media.videoThumbnail}
                  className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                  autoPlay
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                  onClick={() => {
                    if (videoRef.current) {
                      if (videoRef.current.paused) {
                        videoRef.current.play();
                      } else {
                        videoRef.current.pause();
                      }
                    }
                  }}
                />
              ) : media?.backgroundImage ? (
                <img
                  src={media.backgroundImage}
                  alt="Ghost Army"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl animate-pulse">🎬</div>
                </div>
              )}

              {/* Video controls overlay */}
              {media?.videoUrl && (
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                  {/* Mute/Unmute button */}
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX size={18} className="text-white" />
                    ) : (
                      <Volume2 size={18} className="text-white" />
                    )}
                  </button>
                  {/* Play/Pause button */}
                  <button
                    onClick={() => {
                      if (videoRef.current) {
                        if (isVideoPlaying) {
                          videoRef.current.pause();
                        } else {
                          videoRef.current.play();
                        }
                      }
                    }}
                    className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    {isVideoPlaying ? <Pause size={18} className="text-white" /> : <Play size={18} className="text-white ml-0.5" />}
                  </button>
                </div>
              )}

              {/* Film grain overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            </div>

            {/* Narration text */}
            <div className="px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={narrationIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  <p className="font-editorial text-xl italic leading-relaxed">
                    "{content.narration[narrationIndex]?.text}"
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2 mt-8">
                {content.narration.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === narrationIndex ? 'bg-primary' : i < narrationIndex ? 'bg-primary/50' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Interaction Phase - Quote or Fake */}
        {phase === 'interaction' && (
          <motion.div
            key="interaction"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8"
          >
            <h3 className="text-sm font-bold text-primary mb-8 uppercase tracking-wider">
              Quote or Fake?
            </h3>

            {/* Swipe Labels */}
            <div className="flex items-center justify-between w-full max-w-sm mb-4">
              <motion.span
                style={{ opacity: leftLabelOpacity }}
                className="text-lg font-bold text-red-400"
              >
                FAKE
              </motion.span>
              <motion.span
                style={{ opacity: rightLabelOpacity }}
                className="text-lg font-bold text-emerald-400"
              >
                REAL
              </motion.span>
            </div>

            {/* Swipeable Quote Card */}
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.9}
              onDragEnd={handleSwipeEnd}
              style={{ x, rotate, opacity }}
              className="w-full max-w-sm cursor-grab active:cursor-grabbing"
            >
              <div className="p-8 rounded-2xl bg-card border border-border shadow-xl">
                <blockquote className="text-xl font-editorial italic text-center mb-4">
                  "{content.interaction.quote}"
                </blockquote>
                <p className="text-center text-muted-foreground">
                  — {content.interaction.attribution}
                </p>
              </div>
            </motion.div>

            <p className="text-sm text-muted-foreground mt-8 text-center">
              Swipe left for FAKE, right for REAL
            </p>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8"
          >
            {/* Result Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                isCorrect ? 'bg-success/20' : 'bg-destructive/20'
              }`}
            >
              {isCorrect ? (
                <CheckCircle2 size={40} className="text-success" />
              ) : (
                <XCircle size={40} className="text-destructive" />
              )}
            </motion.div>

            <h3 className="text-2xl font-bold mb-2">
              {isCorrect ? 'Correct!' : 'Not quite!'}
            </h3>

            <p className="text-muted-foreground mb-4">
              You answered: <span className="font-bold capitalize">{swipeAnswer}</span>
            </p>

            {/* Quote card (smaller) */}
            <div className="p-6 rounded-xl bg-card border border-border mb-6 max-w-sm">
              <blockquote className="text-lg font-editorial italic text-center mb-3">
                "{content.interaction.quote}"
              </blockquote>
              <p className="text-center text-sm text-muted-foreground">
                — {content.interaction.attribution}
              </p>
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-emerald-400 font-bold text-center mb-2">
                  This quote is {content.interaction.isReal ? 'REAL' : 'FAKE'}
                </p>
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-8 max-w-sm">
              <p className="text-sm text-center">
                {content.interaction.explanation}
              </p>
            </div>

            {/* XP Earned */}
            <div className="flex items-center gap-2 mb-8">
              <span className="text-gold-highlight font-bold">
                +{isCorrect ? xpReward : Math.floor(xpReward * 0.5)} XP
              </span>
            </div>

            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Continue
              <ChevronRight size={20} />
            </button>
          </motion.div>
        )}

        {/* Transition Phase */}
        {phase === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6"
          >
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-editorial text-xl italic text-center max-w-sm"
            >
              "{content.transitionText}"
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

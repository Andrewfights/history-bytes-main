import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Unlock, ChevronRight, Quote } from 'lucide-react';
import { ResolutionNodeContent } from '@/data/ghostArmyStory';
import { useGhostArmyNodeMedia } from './useGhostArmyMedia';

interface ResolutionNodeProps {
  content: ResolutionNodeContent;
  xpReward: number;
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
}

type Phase = 'photos' | 'narration' | 'stats' | 'unlock';

export function ResolutionNode({ content, xpReward, onComplete }: ResolutionNodeProps) {
  const [phase, setPhase] = useState<Phase>('photos');
  const [narrationIndex, setNarrationIndex] = useState(0);

  // Get stored media for this node
  const media = useGhostArmyNodeMedia('node-5-resolution');

  // Auto-advance through photos and narration
  useEffect(() => {
    if (phase === 'photos') {
      const timer = setTimeout(() => setPhase('narration'), 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== 'narration') return;

    const timer = setTimeout(() => {
      if (narrationIndex < content.narration.length - 1) {
        setNarrationIndex(prev => prev + 1);
      } else {
        setPhase('stats');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [phase, narrationIndex, content.narration.length]);

  const handleViewUnlocks = () => {
    setPhase('unlock');
  };

  const handleFinish = () => {
    onComplete(xpReward, { correct: 0, total: 0 });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <AnimatePresence mode="wait">
        {/* Photos Phase */}
        {phase === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] relative"
          >
            {/* Historic photo - use uploaded image or placeholder */}
            <div className="absolute inset-0 bg-gradient-to-b from-obsidian-800 to-obsidian-950">
              {media?.backgroundImage ? (
                <img
                  src={media.backgroundImage}
                  alt="Ghost Army Soldiers"
                  className="absolute inset-0 w-full h-full object-cover opacity-80 sepia"
                />
              ) : null}
              <div className="absolute inset-0 bg-[url('/grain.png')] opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

              {/* Sepia-toned photo representation (fallback) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {!media?.backgroundImage && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1 }}
                      className="text-8xl mb-4 grayscale"
                    >
                      🪖
                    </motion.div>
                  )}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-white/80 text-sm italic px-6 bg-black/30 py-2 rounded-lg backdrop-blur-sm"
                  >
                    {content.photoCaption}
                  </motion.p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Narration Phase */}
        {phase === 'narration' && (
          <motion.div
            key="narration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={narrationIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-sm"
              >
                <p className="font-editorial text-xl leading-relaxed">
                  {content.narration[narrationIndex]}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-2 mt-12">
              {content.narration.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === narrationIndex ? 'bg-primary' : i < narrationIndex ? 'bg-primary/50' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Stats Phase */}
        {phase === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6 py-8"
          >
            {/* Mission complete header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-center mb-8"
            >
              <div className="text-6xl mb-4">🎖️</div>
              <h1 className="font-editorial text-3xl font-bold">Mission Complete</h1>
              <p className="text-muted-foreground mt-2">The Ghost Army</p>
            </motion.div>

            {/* Star rating */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              {[1, 2, 3].map((starNum) => (
                <motion.div
                  key={starNum}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4 + starNum * 0.15, type: 'spring', stiffness: 200 }}
                >
                  <Star size={36} className="text-amber-400 fill-amber-400" />
                </motion.div>
              ))}
            </motion.div>

            {/* Key stats grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-3 w-full max-w-sm mb-8"
            >
              {content.keyStats.slice(0, 4).map((stat, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-card border border-border text-center"
                >
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>

            {/* XP earned */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center gap-2 mb-8"
            >
              <span className="text-gold-highlight font-bold text-lg">+{xpReward} XP</span>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              onClick={handleViewUnlocks}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              View Unlocks
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        )}

        {/* Unlock Phase */}
        {phase === 'unlock' && (
          <motion.div
            key="unlock"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] px-6 py-8"
          >
            {/* Unlocked stories header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-gold-primary/20 flex items-center justify-center mx-auto mb-4"
              >
                <Unlock size={28} className="text-gold-primary" />
              </motion.div>
              <h2 className="font-editorial text-2xl font-bold">Stories Unlocked</h2>
              <p className="text-muted-foreground mt-2">Continue your WW2 journey</p>
            </div>

            {/* Unlocked story cards */}
            <div className="space-y-3 mb-8">
              {content.unlockedStories.map((story, index) => (
                <motion.div
                  key={story.title}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.15 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-12 h-12 rounded-full bg-gold-primary/20 flex items-center justify-center shrink-0">
                    <Unlock size={20} className="text-gold-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{story.title}</p>
                    <p className="text-sm text-muted-foreground">{story.description}</p>
                  </div>
                  <ChevronRight size={20} className="text-muted-foreground" />
                </motion.div>
              ))}
            </div>

            {/* Closing quote */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="p-6 rounded-xl bg-primary/5 border border-primary/20 mb-8"
            >
              <Quote size={24} className="text-primary/40 mb-3" />
              <p className="font-editorial text-lg italic text-center leading-relaxed">
                "{content.closingQuote}"
              </p>
            </motion.div>

            {/* Finish button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              onClick={handleFinish}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              Explore More WW2 Stories
              <ChevronRight size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

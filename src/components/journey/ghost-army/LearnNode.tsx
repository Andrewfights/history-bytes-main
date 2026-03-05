import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, CheckCircle2, XCircle, ChevronRight, MapPin } from 'lucide-react';
import { LearnNodeContent, ChronoEvent } from '@/data/ghostArmyStory';
import { useGhostArmyNodeMedia } from './useGhostArmyMedia';

interface LearnNodeProps {
  content: LearnNodeContent;
  xpReward: number;
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
}

type Phase = 'context' | 'challenge' | 'result' | 'reveal';

// Shuffle array (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function LearnNode({ content, xpReward, onComplete }: LearnNodeProps) {
  const [phase, setPhase] = useState<Phase>('context');
  const [orderedEvents, setOrderedEvents] = useState<ChronoEvent[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  // Get stored media for this node
  const media = useGhostArmyNodeMedia('node-2-learn');

  // Initialize shuffled events
  useEffect(() => {
    setOrderedEvents(shuffleArray(content.chronoChallenge.events));
  }, [content.chronoChallenge.events]);

  const handleStartChallenge = () => {
    setPhase('challenge');
  };

  const handleSubmit = () => {
    // Check order
    let correct = 0;
    orderedEvents.forEach((event, index) => {
      if (event.order === index + 1) {
        correct++;
      }
    });

    const allCorrect = correct === orderedEvents.length;
    setIsCorrect(allCorrect);
    setCorrectCount(correct);
    setPhase('result');
  };

  const handleContinue = () => {
    setPhase('reveal');
  };

  const handleFinish = () => {
    const earnedXP = isCorrect ? xpReward : Math.floor(xpReward * (correctCount / orderedEvents.length));
    onComplete(earnedXP, { correct: isCorrect ? 1 : 0, total: 1 });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background">
      <AnimatePresence mode="wait">
        {/* Context Phase */}
        {phase === 'context' && (
          <motion.div
            key="context"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)]"
          >
            {/* Map visualization */}
            <div className="relative h-[40vh] bg-gradient-to-b from-obsidian-900 to-obsidian-950 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10 z-10 pointer-events-none" />

              {/* Custom map image or placeholder */}
              {media?.backgroundImage ? (
                <img
                  src={media.backgroundImage}
                  alt="Tactical Map"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48">
                    {/* Simplified Europe outline */}
                    <div className="absolute inset-0 border-2 border-white/20 rounded-lg" />
                    {/* Allied line (blue) */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500/60" />
                    {/* German line (red) */}
                    <div className="absolute top-[40%] left-0 right-0 h-1 bg-red-500/60" />
                    {/* Gap indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute top-[45%] right-4 w-8 h-4 bg-amber-500/40 rounded"
                    />
                    <MapPin className="absolute top-[42%] right-6 text-amber-400" size={16} />
                  </div>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
            </div>

            {/* Context text */}
            <div className="px-6 py-8">
              <h2 className="font-editorial text-2xl font-bold mb-4">{content.title}</h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                {content.context}
              </p>

              <button
                onClick={handleStartChallenge}
                className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* Challenge Phase - Chrono Order */}
        {phase === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-6"
          >
            <div className="text-center mb-6">
              <h3 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">
                Chronological Order
              </h3>
              <p className="text-muted-foreground">
                {content.chronoChallenge.prompt}
              </p>
            </div>

            {/* Draggable events */}
            <Reorder.Group
              axis="y"
              values={orderedEvents}
              onReorder={setOrderedEvents}
              className="space-y-3 mb-8"
            >
              {orderedEvents.map((event, index) => (
                <Reorder.Item
                  key={event.id}
                  value={event}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <motion.div
                    whileDrag={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border"
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold">
                      {index + 1}
                    </div>
                    <GripVertical size={20} className="text-muted-foreground shrink-0" />
                    <p className="text-sm flex-1">{event.text}</p>
                  </motion.div>
                </Reorder.Item>
              ))}
            </Reorder.Group>

            <button
              onClick={handleSubmit}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Submit Order
            </button>
          </motion.div>
        )}

        {/* Result Phase */}
        {phase === 'result' && (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-6"
          >
            {/* Result header */}
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isCorrect ? 'bg-success/20' : 'bg-amber-500/20'
                }`}
              >
                {isCorrect ? (
                  <CheckCircle2 size={32} className="text-success" />
                ) : (
                  <XCircle size={32} className="text-amber-400" />
                )}
              </motion.div>
              <h3 className="text-xl font-bold">
                {isCorrect ? 'Perfect Order!' : `${correctCount}/${orderedEvents.length} Correct`}
              </h3>
            </div>

            {/* Show correct order */}
            <div className="space-y-2 mb-6">
              {content.chronoChallenge.events
                .sort((a, b) => a.order - b.order)
                .map((event, index) => {
                  const userOrder = orderedEvents.findIndex(e => e.id === event.id);
                  const wasCorrect = userOrder === index;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        wasCorrect ? 'bg-success/10 border border-success/30' : 'bg-card border border-border'
                      }`}
                    >
                      <div className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-sm ${
                        wasCorrect ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {index + 1}
                      </div>
                      <p className="text-sm flex-1">{event.text}</p>
                      {wasCorrect && <CheckCircle2 size={16} className="text-success shrink-0" />}
                    </motion.div>
                  );
                })}
            </div>

            {/* XP Earned */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-gold-highlight font-bold">
                +{isCorrect ? xpReward : Math.floor(xpReward * (correctCount / orderedEvents.length))} XP
              </span>
            </div>

            <button
              onClick={handleContinue}
              className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
            >
              Continue
            </button>
          </motion.div>
        )}

        {/* Reveal Phase */}
        {phase === 'reveal' && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-[calc(100vh-80px)] flex flex-col"
          >
            {/* Animated map showing the gap */}
            <div className="relative h-[40vh] bg-gradient-to-b from-obsidian-900 to-obsidian-950 overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grain.png')] opacity-10" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Map with animated gap */}
                  <div className="absolute inset-0 border-2 border-white/20 rounded-lg" />
                  {/* Allied line (blue) with gap */}
                  <div className="absolute top-1/2 left-0 w-1/3 h-1 bg-blue-500" />
                  <div className="absolute top-1/2 right-0 w-1/3 h-1 bg-blue-500" />
                  {/* Animated danger zone */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute top-[45%] left-1/3 right-1/3 h-8 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-2xl"
                    >
                      ⚠️
                    </motion.div>
                  </motion.div>
                  <p className="absolute bottom-4 left-0 right-0 text-center text-xs text-amber-400 font-bold">
                    20-MILE GAP
                  </p>
                </div>
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
            </div>

            {/* Reveal narration */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="font-editorial text-xl italic text-center max-w-sm mb-8 leading-relaxed"
              >
                "{content.revealNarration}"
              </motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                onClick={handleFinish}
                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
              >
                Continue
                <ChevronRight size={20} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

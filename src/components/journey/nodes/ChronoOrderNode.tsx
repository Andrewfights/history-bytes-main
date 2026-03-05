import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { GripVertical, CheckCircle2, XCircle, Calendar } from 'lucide-react';
import { ChronoOrderContent, ChronoEvent } from '@/types';

interface ChronoOrderNodeProps {
  content: ChronoOrderContent;
  xpReward: number;
  onComplete: (xp: number, message?: string, scoreDetails?: { correct: number; total: number }) => void;
}

export function ChronoOrderNode({ content, xpReward, onComplete }: ChronoOrderNodeProps) {
  // Shuffle events initially
  const [orderedEvents, setOrderedEvents] = useState<ChronoEvent[]>(() => {
    return [...content.events].sort(() => Math.random() - 0.5);
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Get the correct order
  const correctOrder = [...content.events].sort((a, b) => a.year - b.year);

  const handleSubmit = () => {
    // Check if order matches
    const correct = orderedEvents.every((event, index) => event.id === correctOrder[index].id);
    setIsCorrect(correct);
    setIsSubmitted(true);
  };

  const handleContinue = () => {
    const score = isCorrect ? 1 : 0;
    const xp = isCorrect ? xpReward : Math.floor(xpReward * 0.5);
    onComplete(xp, content.hostReaction, { correct: score, total: 1 });
  };

  const getPositionResult = (event: ChronoEvent, index: number) => {
    const correctIndex = correctOrder.findIndex(e => e.id === event.id);
    return {
      isCorrectPosition: correctIndex === index,
      correctPosition: correctIndex + 1,
    };
  };

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="text-4xl mb-2 block">⏳</span>
        <h2 className="font-editorial text-xl font-bold mb-1">{content.title}</h2>
        <p className="text-sm text-muted-foreground">{content.context}</p>
      </div>

      {/* Instructions */}
      {!isSubmitted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/20"
        >
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <p className="text-sm text-primary">
              Drag to arrange events in chronological order
            </p>
          </div>
        </motion.div>
      )}

      {/* Events List */}
      <div className="mb-6">
        {isSubmitted ? (
          // Show results in correct order
          <div className="space-y-2">
            {correctOrder.map((event, index) => {
              const userIndex = orderedEvents.findIndex(e => e.id === event.id);
              const wasCorrect = userIndex === index;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${
                    wasCorrect
                      ? 'bg-success/10 border-success'
                      : 'bg-destructive/10 border-destructive'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Position number */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      wasCorrect ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
                    }`}>
                      {wasCorrect ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1">{event.text}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>

                    {/* Thumbnail */}
                    {event.imageUrl && (
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={event.imageUrl}
                          alt={event.text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // Draggable list
          <Reorder.Group
            axis="y"
            values={orderedEvents}
            onReorder={setOrderedEvents}
            className="space-y-2"
          >
            {orderedEvents.map((event, index) => (
              <Reorder.Item
                key={event.id}
                value={event}
                className="cursor-grab active:cursor-grabbing"
              >
                <motion.div
                  className="p-4 rounded-xl bg-card border border-border hover:border-primary/50 transition-colors"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    {/* Drag handle */}
                    <div className="text-muted-foreground">
                      <GripVertical size={20} />
                    </div>

                    {/* Position number */}
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-muted-foreground">
                        {index + 1}
                      </span>
                    </div>

                    {/* Event content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.text}</p>
                    </div>

                    {/* Thumbnail */}
                    {event.imageUrl && (
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img
                          src={event.imageUrl}
                          alt={event.text}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Result / Explanation */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className={`p-4 rounded-xl ${
              isCorrect ? 'bg-success/10 border border-success/30' : 'bg-muted'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                {isCorrect ? (
                  <CheckCircle2 size={18} className="text-success shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />
                )}
                <span className="font-bold text-sm">
                  {isCorrect ? 'Perfect order!' : 'Not quite right'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{content.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
        {!isSubmitted ? (
          <motion.button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
            whileTap={{ scale: 0.98 }}
          >
            Check Order
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleContinue}
            className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
          >
            Continue
          </motion.button>
        )}
      </div>
    </div>
  );
}

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Crown, Play, Lock, CheckCircle2, Film } from 'lucide-react';
import { Arc, JourneyNode, JourneyNodeType } from '@/types';
import { useApp } from '@/context/AppContext';
import { ChapterIntroVideo } from './ChapterIntroVideo';

interface JourneyMapProps {
  arc: Arc;
  currentChapterIndex: number;
  onChapterChange: (index: number) => void;
  onSelectNode: (nodeId: string) => void;
  onBack: () => void;
}

// Node type emojis
const nodeTypeEmojis: Record<JourneyNodeType, string> = {
  'two-truths': '🎭',
  'found-tape': '🎙️',
  'headlines': '📰',
  'quiz-mix': '❓',
  'decision': '⚖️',
  'boss': '👑',
};

type NodeState = 'completed' | 'current' | 'available' | 'locked';

export function JourneyMap({
  arc,
  currentChapterIndex,
  onChapterChange,
  onSelectNode,
  onBack,
}: JourneyMapProps) {
  const { isJourneyNodeCompleted, hasViewedChapterIntro, markChapterIntroViewed } = useApp();
  const scrollRef = useRef<HTMLDivElement>(null);
  const chapter = arc.chapters[currentChapterIndex];
  const nodes = chapter.nodes;
  const [showIntroVideo, setShowIntroVideo] = useState(false);

  // Check if we should show intro video when chapter changes
  useEffect(() => {
    if (chapter.aiVideoUrl && !hasViewedChapterIntro(chapter.id)) {
      setShowIntroVideo(true);
    }
  }, [chapter.id, chapter.aiVideoUrl, hasViewedChapterIntro]);

  const handleIntroComplete = () => {
    markChapterIntroViewed(chapter.id);
    setShowIntroVideo(false);
  };

  const handleIntroSkip = () => {
    markChapterIntroViewed(chapter.id);
    setShowIntroVideo(false);
  };

  const handleWatchIntro = () => {
    setShowIntroVideo(true);
  };

  // Get node state using context-based completion tracking
  const getNodeState = (node: JourneyNode, index: number): NodeState => {
    if (isJourneyNodeCompleted(node.id)) return 'completed';
    if (index === 0) return 'current';
    const prevNode = nodes[index - 1];
    if (isJourneyNodeCompleted(prevNode.id)) return 'current';
    return 'locked';
  };

  const states = nodes.map((node, index) => getNodeState(node, index));

  // Count completed nodes
  const completedCount = nodes.filter(n => isJourneyNodeCompleted(n.id)).length;

  // Auto-scroll to current node
  useEffect(() => {
    const currentIndex = states.findIndex(state => state === 'current');
    if (currentIndex >= 0 && scrollRef.current) {
      const nodeElements = scrollRef.current.querySelectorAll('[data-node]');
      if (nodeElements[currentIndex]) {
        nodeElements[currentIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }, [currentChapterIndex, states]);

  return (
    <div className="fixed inset-0 z-[60] pt-safe bg-black flex flex-col">
      {/* Chapter Intro Video */}
      <ChapterIntroVideo
        chapter={chapter}
        isOpen={showIntroVideo}
        onComplete={handleIntroComplete}
        onSkip={handleIntroSkip}
      />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-sm pt-4 pb-4">
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute left-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={24} className="text-white/70" />
        </button>

        {/* Arc Title */}
        <div className="text-center pt-2">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50 mb-1">
            Chapter {currentChapterIndex + 1}
          </p>
          <h1 className="font-editorial text-2xl font-bold text-white mb-2">
            {chapter.title}
          </h1>
          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <Crown size={16} className="text-amber-400" />
            <span>{completedCount} of {nodes.length} played</span>
          </div>

          {/* Watch Intro button - only show if chapter has video */}
          {chapter.aiVideoUrl && (
            <button
              onClick={handleWatchIntro}
              className="mt-3 flex items-center justify-center gap-1.5 mx-auto px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 text-xs transition-colors"
            >
              <Film size={14} />
              Watch Intro
            </button>
          )}
        </div>

        {/* Chapter dots navigation */}
        {arc.chapters.length > 1 && (
          <div className="flex items-center justify-center gap-3 mt-4">
            {arc.chapters.map((ch, index) => {
              const isActive = index === currentChapterIndex;
              const chapterCompleted = ch.nodes.every(n => isJourneyNodeCompleted(n.id));

              return (
                <button
                  key={ch.id}
                  onClick={() => onChapterChange(index)}
                  className={`
                    w-3 h-3 rounded-full transition-all
                    ${isActive
                      ? 'bg-amber-400 w-6'
                      : chapterCompleted
                      ? 'bg-green-500 hover:scale-125'
                      : 'bg-zinc-600 hover:bg-zinc-500 hover:scale-125'
                    }
                  `}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto overflow-x-hidden pb-24"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter.id}
            className="flex flex-col items-center py-8 px-4 gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {nodes.map((node, index) => {
              const state = states[index];
              const isClickable = state === 'current' || state === 'available' || state === 'completed';
              const isBoss = node.type === 'boss';

              return (
                <motion.div
                  key={node.id}
                  data-node
                  className="flex flex-col items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Node Circle */}
                  <motion.button
                    onClick={isClickable ? () => onSelectNode(node.id) : undefined}
                    disabled={!isClickable}
                    className={`
                      relative flex items-center justify-center rounded-full
                      transition-all duration-300
                      ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'}
                      ${isBoss ? 'w-24 h-24' : 'w-20 h-20'}
                    `}
                    whileHover={isClickable ? { scale: 1.1 } : {}}
                    whileTap={isClickable ? { scale: 0.95 } : {}}
                  >
                    {/* Selection ring for current node */}
                    {state === 'current' && (
                      <motion.div
                        className="absolute inset-[-6px] rounded-full border-2 border-primary"
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    )}

                    {/* Completed ring */}
                    {state === 'completed' && (
                      <div className="absolute inset-[-4px] rounded-full border-2 border-amber-400" />
                    )}

                    {/* Main circle */}
                    <div
                      className={`
                        w-full h-full rounded-full flex items-center justify-center
                        ${state === 'locked'
                          ? 'bg-zinc-800'
                          : 'bg-amber-400'
                        }
                      `}
                    >
                      {state === 'locked' ? (
                        <Lock size={28} className="text-zinc-600" />
                      ) : state === 'completed' ? (
                        <span className="text-3xl">{nodeTypeEmojis[node.type]}</span>
                      ) : (
                        <span className="text-3xl">{nodeTypeEmojis[node.type]}</span>
                      )}
                    </div>

                    {/* Completion checkmark */}
                    {state === 'completed' && (
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-black"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      >
                        <CheckCircle2 size={16} className="text-white" />
                      </motion.div>
                    )}
                  </motion.button>

                  {/* Label */}
                  <div className="mt-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {state === 'current' && (
                        <Play size={12} className="text-white/70 fill-white/70" />
                      )}
                      <span className={`text-sm font-medium ${
                        state === 'locked' ? 'text-zinc-600' : 'text-white'
                      }`}>
                        {node.title}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

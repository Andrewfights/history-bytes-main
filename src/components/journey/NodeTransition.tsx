import { motion } from 'framer-motion';
import { ChevronRight, Flame, Target, Clock, Zap } from 'lucide-react';
import { JourneyNode, JourneyNodeType } from '@/types';

interface SessionStats {
  questionsCorrect: number;
  questionsTotal: number;
  xpEarned: number;
  startTime: number;
  currentStreak: number;
}

interface NodeTransitionProps {
  currentNodeIndex: number;
  totalNodes: number;
  nodes: JourneyNode[];
  completedNodeIds: string[];
  earnedXP: number;
  sessionStats: SessionStats;
  nextNode: JourneyNode | null;
  onContinue: () => void;
}

// Get icon for node type
function getNodeTypeIcon(type: JourneyNodeType): string {
  const icons: Record<JourneyNodeType, string> = {
    'video-lesson': '🎬',
    'image-explore': '🗺️',
    'two-truths': '🎮',
    'found-tape': '🎧',
    'headlines': '📰',
    'chrono-order': '⏳',
    'quiz-mix': '❓',
    'decision': '🎯',
    'boss': '👑',
  };
  return icons[type] || '📚';
}

// Format time in mm:ss
function formatTime(startTime: number): string {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function NodeTransition({
  currentNodeIndex,
  totalNodes,
  nodes,
  completedNodeIds,
  earnedXP,
  sessionStats,
  nextNode,
  onContinue,
}: NodeTransitionProps) {
  const accuracy = sessionStats.questionsTotal > 0
    ? Math.round((sessionStats.questionsCorrect / sessionStats.questionsTotal) * 100)
    : 100;

  // Get streak bonus preview
  const getStreakBonus = (streak: number) => {
    if (streak >= 10) return { current: 25, next: 25, message: 'Max bonus!' };
    if (streak >= 5) return { current: 10, next: 25, streakUntil: 10 - streak };
    if (streak >= 3) return { current: 5, next: 10, streakUntil: 5 - streak };
    return { current: 0, next: 5, streakUntil: 3 - streak };
  };

  const streakInfo = getStreakBonus(sessionStats.currentStreak);

  return (
    <div className="px-4 py-6 pb-28">
      {/* XP Celebration */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-xl">
          <Zap size={24} />
          <span>+{earnedXP} XP</span>
        </div>
      </motion.div>

      {/* Node Progress Trail */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              Chapter Progress
            </span>
            <span className="text-xs text-muted-foreground">
              {currentNodeIndex + 1} of {totalNodes}
            </span>
          </div>

          {/* Visual node trail */}
          <div className="flex items-center justify-center gap-1 flex-wrap">
            {nodes.map((node, index) => {
              const isCompleted = completedNodeIds.includes(node.id) || index <= currentNodeIndex;
              const isCurrent = index === currentNodeIndex;
              const isNext = index === currentNodeIndex + 1;

              return (
                <motion.div
                  key={node.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  className="flex items-center"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                      isCurrent
                        ? 'bg-success text-white scale-110 ring-2 ring-success/30'
                        : isCompleted
                        ? 'bg-success/20 text-success'
                        : isNext
                        ? 'bg-primary/20 text-primary ring-2 ring-primary/30'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {isCompleted && !isCurrent ? '✓' : getNodeTypeIcon(node.type)}
                  </div>
                  {index < nodes.length - 1 && (
                    <div
                      className={`w-2 h-0.5 ${
                        isCompleted ? 'bg-success/50' : 'bg-muted'
                      }`}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Session Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="grid grid-cols-3 gap-3">
          {/* Questions */}
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <Target size={16} className="mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">
              {sessionStats.questionsCorrect}/{sessionStats.questionsTotal}
            </div>
            <div className="text-xs text-muted-foreground">
              {accuracy}% correct
            </div>
          </div>

          {/* XP Earned */}
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <Zap size={16} className="mx-auto mb-1 text-gold-highlight" />
            <div className="text-lg font-bold text-gold-highlight">
              {sessionStats.xpEarned}
            </div>
            <div className="text-xs text-muted-foreground">XP earned</div>
          </div>

          {/* Time */}
          <div className="p-3 rounded-xl bg-card border border-border text-center">
            <Clock size={16} className="mx-auto mb-1 text-blue-400" />
            <div className="text-lg font-bold">
              {formatTime(sessionStats.startTime)}
            </div>
            <div className="text-xs text-muted-foreground">elapsed</div>
          </div>
        </div>
      </motion.div>

      {/* Streak Indicator */}
      {sessionStats.currentStreak > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <div className={`p-4 rounded-xl border ${
            sessionStats.currentStreak >= 3
              ? 'bg-orange-500/10 border-orange-500/30'
              : 'bg-card border-border'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Flame size={24} className={
                    sessionStats.currentStreak >= 5
                      ? 'text-orange-500'
                      : sessionStats.currentStreak >= 3
                      ? 'text-orange-400'
                      : 'text-muted-foreground'
                  } />
                </motion.div>
                <div>
                  <div className="font-bold">
                    {sessionStats.currentStreak} correct in a row!
                  </div>
                  {streakInfo.current > 0 && (
                    <div className="text-xs text-orange-400">
                      +{streakInfo.current} XP bonus active
                    </div>
                  )}
                </div>
              </div>
              {streakInfo.streakUntil && streakInfo.streakUntil > 0 && (
                <div className="text-xs text-muted-foreground text-right">
                  {streakInfo.streakUntil} more for<br />
                  +{streakInfo.next} XP bonus
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Next Node Preview */}
      {nextNode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6"
        >
          <div className="text-center text-sm text-muted-foreground mb-2">
            Up next
          </div>
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getNodeTypeIcon(nextNode.type)}</span>
              <div>
                <div className="font-bold">{nextNode.title}</div>
                <div className="text-xs text-muted-foreground">
                  +{nextNode.xpReward} XP possible
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <motion.button
          onClick={onContinue}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {nextNode ? (
            <>
              Next: {getNodeTypeIcon(nextNode.type)} {nextNode.title.split(' ').slice(0, 3).join(' ')}
              <ChevronRight size={20} />
            </>
          ) : (
            'Complete Chapter'
          )}
        </motion.button>
      </motion.div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import {
  ghostArmyStory,
  getNodeByIndex,
  getNodeCount,
  GhostArmyNode,
} from '@/data/ghostArmyStory';
import { FunnelExitDialog } from '../FunnelExitDialog';
import { WatchNode } from './WatchNode';
import { LearnNode } from './LearnNode';
import { WhoAmINode } from './WhoAmINode';
import { TacticalBossNode } from './TacticalBossNode';
import { ResolutionNode } from './ResolutionNode';
import { TriviaPlayer } from './TriviaPlayer';
import { loadAllTriviaSets, TriviaSet } from '@/lib/triviaStorage';

interface GhostArmyStoryPlayerProps {
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
  onExit: () => void;
}

interface NodeStats {
  xpEarned: number;
  correct: number;
  total: number;
}

export function GhostArmyStoryPlayer({ onComplete, onExit }: GhostArmyStoryPlayerProps) {
  const { funnelState, updateGhostArmyProgress, addXP } = useApp();

  // Get saved progress or start at 0
  const savedNodeIndex = funnelState.ww2.ghostArmyProgress.currentNodeIndex ?? 0;
  const [currentNodeIndex, setCurrentNodeIndex] = useState(savedNodeIndex);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Cumulative stats across all nodes
  const [cumulativeStats, setCumulativeStats] = useState<NodeStats>({
    xpEarned: funnelState.ww2.ghostArmyProgress.totalXP ?? 0,
    correct: funnelState.ww2.ghostArmyProgress.totalCorrect ?? 0,
    total: funnelState.ww2.ghostArmyProgress.totalQuestions ?? 0,
  });

  const totalNodes = getNodeCount();
  const currentNode = getNodeByIndex(currentNodeIndex);

  // Mark as started on mount
  useEffect(() => {
    if (!funnelState.ww2.ghostArmyProgress.started) {
      updateGhostArmyProgress({ started: true });
    }
  }, []);

  // Save progress when node changes
  useEffect(() => {
    updateGhostArmyProgress({
      currentNodeIndex,
      totalXP: cumulativeStats.xpEarned,
      totalCorrect: cumulativeStats.correct,
      totalQuestions: cumulativeStats.total,
    });
  }, [currentNodeIndex, cumulativeStats]);

  const handleNodeComplete = (nodeXP: number, nodeStats: { correct: number; total: number }) => {
    // Add XP immediately
    addXP(nodeXP);

    // Update cumulative stats
    setCumulativeStats(prev => ({
      xpEarned: prev.xpEarned + nodeXP,
      correct: prev.correct + nodeStats.correct,
      total: prev.total + nodeStats.total,
    }));

    // Mark current node as completed in progress
    const completedNodes = funnelState.ww2.ghostArmyProgress.nodesCompleted || [];
    if (currentNode && !completedNodes.includes(currentNode.id)) {
      updateGhostArmyProgress({
        nodesCompleted: [...completedNodes, currentNode.id],
      });
    }

    // Check if this was the last node
    if (currentNodeIndex >= totalNodes - 1) {
      // Story complete
      const finalStats = {
        xpEarned: cumulativeStats.xpEarned + nodeXP,
        correct: cumulativeStats.correct + nodeStats.correct,
        total: cumulativeStats.total + nodeStats.total,
      };
      onComplete(finalStats.xpEarned, { correct: finalStats.correct, total: finalStats.total });
    } else {
      // Transition to next node
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentNodeIndex(prev => prev + 1);
        setIsTransitioning(false);
      }, 500);
    }
  };

  const handleExitClick = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = () => {
    // Progress is auto-saved via useEffect
    onExit();
  };

  const progress = ((currentNodeIndex + 1) / totalNodes) * 100;

  if (!currentNode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading story...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleExitClick}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm">Exit</span>
          </button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{ghostArmyStory.era}</p>
            <p className="font-bold text-sm">{ghostArmyStory.title}</p>
          </div>
          <div className="w-16 text-right">
            <span className="text-xs text-muted-foreground">
              {currentNodeIndex + 1}/{totalNodes}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: `${((currentNodeIndex) / totalNodes) * 100}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Node Content */}
      <AnimatePresence mode="wait">
        {!isTransitioning && (
          <motion.div
            key={currentNode.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {renderNode(currentNode, handleNodeComplete)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit Dialog */}
      <FunnelExitDialog
        isOpen={showExitDialog}
        onContinue={() => setShowExitDialog(false)}
        onExit={handleConfirmExit}
      />
    </div>
  );
}

function renderNode(
  node: GhostArmyNode,
  onComplete: (xp: number, stats: { correct: number; total: number }) => void
) {
  switch (node.type) {
    case 'watch':
      return (
        <WatchNode
          content={node.content as any}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'learn':
      return (
        <LearnNode
          content={node.content as any}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'interactive':
      return (
        <WhoAmINode
          content={node.content as any}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'boss':
      return (
        <TacticalBossNode
          content={node.content as any}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'resolution':
      return (
        <ResolutionNode
          content={node.content as any}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'trivia':
      return (
        <TriviaNodeWrapper
          nodeId={node.id}
          triviaSetId={(node.content as any).triviaSetId}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    default:
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">Unknown node type: {node.type}</p>
        </div>
      );
  }
}

// Wrapper component to load trivia set and render TriviaPlayer
function TriviaNodeWrapper({
  nodeId,
  triviaSetId,
  xpReward,
  onComplete,
}: {
  nodeId: string;
  triviaSetId?: string;
  xpReward: number;
  onComplete: (xp: number, stats: { correct: number; total: number }) => void;
}) {
  const [triviaSet, setTriviaSet] = useState<TriviaSet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrivia = async () => {
      const sets = await loadAllTriviaSets();
      // Find by ID or use the first Ghost Army set
      const set = triviaSetId
        ? sets.find(s => s.id === triviaSetId)
        : sets.find(s => s.title.toLowerCase().includes('ghost')) || sets[0];

      setTriviaSet(set || null);
      setLoading(false);
    };
    loadTrivia();
  }, [triviaSetId]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <p className="text-muted-foreground">Loading trivia...</p>
      </div>
    );
  }

  if (!triviaSet) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-6">
        <p className="text-muted-foreground mb-4">No trivia set found.</p>
        <p className="text-sm text-muted-foreground mb-8">Create a trivia set in the admin panel first.</p>
        <button
          onClick={() => onComplete(xpReward * 0.5, { correct: 0, total: 0 })}
          className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold"
        >
          Skip for now
        </button>
      </div>
    );
  }

  return (
    <TriviaPlayer
      triviaSet={triviaSet}
      onComplete={(results) => {
        onComplete(results.xpEarned, { correct: results.correct, total: results.total });
      }}
    />
  );
}

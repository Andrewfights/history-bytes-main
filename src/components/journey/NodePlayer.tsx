import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, X, ChevronRight, BookOpen, Lightbulb } from 'lucide-react';
import { FirstTimeTooltip, useNodeTooltip } from '@/components/shared/FirstTimeTooltip';
import { NodeTransition } from './NodeTransition';
import { ChapterComplete } from './ChapterComplete';
import { getNodeById, getArcById, getChapterById } from '@/data/journeyData';
import { getHostById } from '@/data/hostsData';
import { useApp } from '@/context/AppContext';
import { TwoTruthsNode } from './nodes/TwoTruthsNode';
import { FoundTapeNode } from './nodes/FoundTapeNode';
import { HeadlinesNode } from './nodes/HeadlinesNode';
import { QuizMixNode } from './nodes/QuizMixNode';
import { DecisionNode } from './nodes/DecisionNode';
import { BossNode } from './nodes/BossNode';
import { VideoLessonNode } from './nodes/VideoLessonNode';
import { ImageExploreNode } from './nodes/ImageExploreNode';
import { ChronoOrderNode } from './nodes/ChronoOrderNode';
import { CelebrationOverlay } from './CelebrationOverlay';
import { HostBubble } from '@/components/host/HostBubble';
import { MilestoneCelebration } from '@/components/shared/MilestoneCelebration';
import { useMilestoneTracker } from '@/hooks/useMilestoneTracker';
import { useLiveGuide } from '@/hooks/useLiveData';
import {
  JourneyNode,
  TwoTruthsContent,
  FoundTapeContent,
  HeadlinesContent,
  QuizMixContent,
  DecisionContent,
  BossContent,
  VideoLessonContent,
  ImageExploreContent,
  ChronoOrderContent,
} from '@/types';

interface NodeResult {
  correct: number;
  total: number;
  percentage: number;
  xpEarned: number;
}

interface SessionStats {
  questionsCorrect: number;
  questionsTotal: number;
  xpEarned: number;
  startTime: number;
  currentStreak: number;
}

interface NodePlayerProps {
  arcId: string;
  chapterId: string;
  nodeId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function NodePlayer({ arcId, chapterId, nodeId, onBack, onComplete }: NodePlayerProps) {
  const { addXP, markJourneyNodeComplete, user, completedJourneyNodes, crownedCount, selectedGuideId } = useApp();
  const [phase, setPhase] = useState<'intro' | 'play' | 'results' | 'transition' | 'chapter-complete'>('intro');
  const [earnedXP, setEarnedXP] = useState(0);
  const [hostMessage, setHostMessage] = useState<string | null>(null);
  const [nodeResult, setNodeResult] = useState<NodeResult | null>(null);
  const [showMilestone, setShowMilestone] = useState(false);

  // Session stats for transition screen
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    questionsCorrect: 0,
    questionsTotal: 0,
    xpEarned: 0,
    startTime: Date.now(),
    currentStreak: 0,
  });

  // Get the selected spirit guide for the intro
  const spiritGuide = useLiveGuide(selectedGuideId || '');

  // Store pre-completion values for milestone checking
  const preCompletionRef = useRef({
    xp: user.xp,
    streak: user.streak,
    crownedCount: crownedCount,
    completedNodes: [...completedJourneyNodes],
  });

  const {
    pendingMilestone,
    checkAllMilestones,
    triggerMilestone,
    clearMilestone,
  } = useMilestoneTracker();

  const arc = getArcById(arcId);
  const chapter = getChapterById(arcId, chapterId);
  const node = getNodeById(arcId, chapterId, nodeId);
  const host = arc ? getHostById(arc.hostId) : null;

  // Get all chapter nodes for transition screen
  const chapterNodes = chapter?.nodes || [];
  const currentNodeIndex = chapterNodes.findIndex(n => n.id === nodeId);
  const isLastNode = currentNodeIndex === chapterNodes.length - 1;
  const nextNode = currentNodeIndex >= 0 && currentNodeIndex < chapterNodes.length - 1
    ? chapterNodes[currentNodeIndex + 1]
    : null;

  // Check if there's a next chapter
  const arcChapters = arc?.chapters || [];
  const currentChapterIndex = arcChapters.findIndex(c => c.id === chapterId);
  const hasNextChapter = currentChapterIndex >= 0 && currentChapterIndex < arcChapters.length - 1;

  if (!node || !arc) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Node not found</p>
      </div>
    );
  }

  // Get context for the intro screen
  const getNodeContext = () => {
    const content = node.content;
    switch (node.type) {
      case 'two-truths':
        return (content as TwoTruthsContent).context || `Let's test your knowledge with a game of Two Truths and a Lie!`;
      case 'found-tape':
        return (content as FoundTapeContent).context;
      case 'headlines':
        return `Read the headlines from ${(content as HeadlinesContent).publication}, ${(content as HeadlinesContent).date}`;
      case 'decision':
        return (content as DecisionContent).context;
      case 'boss':
        return (content as BossContent).hostIntro;
      case 'quiz-mix':
        return 'Test your knowledge with a mix of questions!';
      case 'video-lesson':
        return (content as VideoLessonContent).context;
      case 'image-explore':
        return (content as ImageExploreContent).context;
      case 'chrono-order':
        return (content as ChronoOrderContent).context;
      default:
        return null;
    }
  };

  const handleStartNode = () => {
    setPhase('play');
  };

  // Calculate streak bonus XP
  const getStreakBonus = (streak: number): number => {
    if (streak >= 10) return 25;
    if (streak >= 5) return 10;
    if (streak >= 3) return 5;
    return 0;
  };

  const handleNodeComplete = (xp: number, message?: string, scoreDetails?: { correct: number; total: number }) => {
    const result: NodeResult = {
      correct: scoreDetails?.correct ?? 0,
      total: scoreDetails?.total ?? 1,
      percentage: scoreDetails ? Math.round((scoreDetails.correct / scoreDetails.total) * 100) : 100,
      xpEarned: xp,
    };

    // Check if correct and calculate new streak
    const wasCorrect = result.percentage >= 80;
    const newStreak = wasCorrect ? sessionStats.currentStreak + 1 : 0;

    // Calculate streak bonus
    const streakBonus = wasCorrect ? getStreakBonus(newStreak) : 0;
    const totalXP = xp + streakBonus;

    setNodeResult({ ...result, xpEarned: totalXP });
    setEarnedXP(totalXP);
    if (message) setHostMessage(message);

    // Update session stats
    setSessionStats(prev => ({
      ...prev,
      questionsCorrect: prev.questionsCorrect + (scoreDetails?.correct ?? (wasCorrect ? 1 : 0)),
      questionsTotal: prev.questionsTotal + (scoreDetails?.total ?? 1),
      xpEarned: prev.xpEarned + totalXP,
      currentStreak: newStreak,
    }));

    // Get pre-completion values
    const prevXp = preCompletionRef.current.xp;
    const prevStreak = preCompletionRef.current.streak;
    const prevCrownedCount = preCompletionRef.current.crownedCount;
    const prevCompletedNodes = preCompletionRef.current.completedNodes;

    // Add XP (including streak bonus) and mark node complete
    addXP(totalXP);
    markJourneyNodeComplete(nodeId);

    // Create updated completed nodes list (including this node)
    const updatedCompletedNodes = [...prevCompletedNodes, nodeId];

    // Check for milestones
    const isPerfectScore = result.percentage === 100;
    const milestone = checkAllMilestones({
      completedNodeId: nodeId,
      chapterId,
      arcId,
      prevXp,
      newXp: prevXp + totalXP,
      prevStreak,
      newStreak: user.streak,
      prevCrownedCount,
      newCrownedCount: crownedCount,
      isPerfectScore,
      completedNodes: updatedCompletedNodes,
    });

    if (milestone) {
      triggerMilestone(milestone);
      setShowMilestone(true);
    }

    setPhase('results');
  };

  const handleContinue = () => {
    // If there's a pending milestone, show it first
    if (pendingMilestone && !showMilestone) {
      setShowMilestone(true);
      return;
    }
    // If this was the last node, show chapter complete
    if (isLastNode) {
      setPhase('chapter-complete');
    } else {
      // Show transition screen before completing
      setPhase('transition');
    }
  };

  const handleTransitionContinue = () => {
    onComplete();
  };

  const handleChapterCompleteHome = () => {
    onBack(); // Go back to journey map
  };

  const handleChapterCompleteNext = () => {
    onComplete(); // Will trigger navigation to next chapter
  };

  const handleMilestoneContinue = () => {
    setShowMilestone(false);
    clearMilestone();
    onComplete();
  };

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          <span className="text-sm font-medium">{node.title}</span>
          <button
            onClick={onBack}
            className="p-1 rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} className="text-muted-foreground" />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <NodeIntroScreen
              node={node}
              chapter={chapter}
              arc={arc}
              context={getNodeContext()}
              spiritGuide={spiritGuide}
              host={host}
              onStart={handleStartNode}
            />
          </motion.div>
        )}

        {phase === 'play' && (
          <motion.div
            key="play"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <NodeContent node={node} onComplete={handleNodeComplete} host={host} />
          </motion.div>
        )}

        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-4 py-8"
          >
            <ResultsScreen
              node={node}
              earnedXP={earnedXP}
              nodeResult={nodeResult}
              hostMessage={hostMessage}
              host={host}
              onContinue={handleContinue}
            />
          </motion.div>
        )}

        {phase === 'transition' && (
          <motion.div
            key="transition"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <NodeTransition
              currentNodeIndex={currentNodeIndex}
              totalNodes={chapterNodes.length}
              nodes={chapterNodes}
              completedNodeIds={completedJourneyNodes}
              earnedXP={earnedXP}
              sessionStats={sessionStats}
              nextNode={nextNode}
              onContinue={handleTransitionContinue}
            />
          </motion.div>
        )}

        {phase === 'chapter-complete' && (
          <motion.div
            key="chapter-complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <ChapterComplete
              chapterTitle={chapter?.title || ''}
              chapterNumber={currentChapterIndex + 1}
              stats={{
                totalXP: sessionStats.xpEarned,
                questionsCorrect: sessionStats.questionsCorrect,
                questionsTotal: sessionStats.questionsTotal,
                timeElapsed: Math.floor((Date.now() - sessionStats.startTime) / 1000),
                perfectNodes: chapterNodes.filter((_, i) => i <= currentNodeIndex).length, // Simplified: count completed
                totalNodes: chapterNodes.length,
              }}
              hasNextChapter={hasNextChapter}
              onHome={handleChapterCompleteHome}
              onNextChapter={handleChapterCompleteNext}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Celebration Modal */}
      <MilestoneCelebration
        isOpen={showMilestone && pendingMilestone !== null}
        milestone={pendingMilestone?.milestone ?? null}
        newRankIcon={pendingMilestone?.newRankIcon}
        onContinue={handleMilestoneContinue}
      />
    </div>
  );
}

// Render the appropriate node component based on type
interface NodeContentProps {
  node: JourneyNode;
  onComplete: (xp: number, message?: string) => void;
  host: ReturnType<typeof getHostById>;
}

function NodeContent({ node, onComplete, host }: NodeContentProps) {
  switch (node.type) {
    case 'two-truths':
      return (
        <TwoTruthsNode
          content={node.content as TwoTruthsContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'found-tape':
      return (
        <FoundTapeNode
          content={node.content as FoundTapeContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'headlines':
      return (
        <HeadlinesNode
          content={node.content as HeadlinesContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'quiz-mix':
      return (
        <QuizMixNode
          content={node.content as QuizMixContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'decision':
      return (
        <DecisionNode
          content={node.content as DecisionContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'boss':
      return (
        <BossNode
          content={node.content as BossContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'video-lesson':
      return (
        <VideoLessonNode
          content={node.content as VideoLessonContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'image-explore':
      return (
        <ImageExploreNode
          content={node.content as ImageExploreContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    case 'chrono-order':
      return (
        <ChronoOrderNode
          content={node.content as ChronoOrderContent}
          xpReward={node.xpReward}
          onComplete={onComplete}
        />
      );
    default:
      return <div>Unknown node type</div>;
  }
}

// Results Screen
interface ResultsScreenProps {
  node: JourneyNode;
  earnedXP: number;
  nodeResult: NodeResult | null;
  hostMessage: string | null;
  host: ReturnType<typeof getHostById>;
  onContinue: () => void;
}

function getGrade(percentage: number) {
  if (percentage >= 90) return { letter: 'A', message: 'Perfect!', color: 'text-green-400' };
  if (percentage >= 80) return { letter: 'B', message: 'Great job!', color: 'text-green-400' };
  if (percentage >= 70) return { letter: 'C', message: 'Good work!', color: 'text-gold-highlight' };
  if (percentage >= 60) return { letter: 'D', message: 'Keep practicing!', color: 'text-gold-primary' };
  return { letter: 'F', message: 'Try again!', color: 'text-red-400' };
}

function ResultsScreen({ node, earnedXP, nodeResult, hostMessage, host, onContinue }: ResultsScreenProps) {
  const grade = nodeResult ? getGrade(nodeResult.percentage) : null;
  const showCelebration = nodeResult && nodeResult.percentage >= 80;

  return (
    <div className="max-w-md mx-auto text-center">
      {/* Celebration Overlay for high scores */}
      {showCelebration && <CelebrationOverlay />}

      {/* Score Display - show for multi-question nodes */}
      {nodeResult && nodeResult.total > 1 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <div className={`text-5xl font-editorial font-bold ${grade?.color}`}>
            {nodeResult.correct}/{nodeResult.total}
          </div>
          <div className="text-lg text-muted-foreground mt-1">
            {nodeResult.percentage}% {grade?.message}
          </div>
        </motion.div>
      )}

      {/* Success Animation - show for single-question or perfect scores */}
      {(!nodeResult || nodeResult.total === 1) && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center"
        >
          <span className="text-4xl">{nodeResult && nodeResult.percentage === 100 ? '🎉' : '✓'}</span>
        </motion.div>
      )}

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-editorial text-2xl font-bold mb-2"
      >
        Node Complete!
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-muted-foreground mb-6"
      >
        {node.title}
      </motion.p>

      {/* XP Earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gold-primary/20 text-gold-highlight font-bold text-lg mb-6"
      >
        <span>+{earnedXP} XP</span>
      </motion.div>

      {/* Host Message */}
      {host && hostMessage && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <HostBubble host={host} message={hostMessage} />
        </motion.div>
      )}

      {/* Continue Button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={onContinue}
        className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors"
      >
        Continue
      </motion.button>
    </div>
  );
}

// Node Intro Screen - Shows learning context before the game
interface NodeIntroScreenProps {
  node: JourneyNode;
  chapter: ReturnType<typeof getChapterById>;
  arc: ReturnType<typeof getArcById>;
  context: string | null;
  spiritGuide: ReturnType<typeof useLiveGuide>;
  host: ReturnType<typeof getHostById>;
  onStart: () => void;
}

function NodeIntroScreen({ node, chapter, arc, context, spiritGuide, host, onStart }: NodeIntroScreenProps) {
  // Get node type display info
  const getNodeTypeInfo = () => {
    switch (node.type) {
      case 'two-truths':
        return { icon: '🤔', label: 'Two Truths & a Lie', color: 'text-purple-400' };
      case 'found-tape':
        return { icon: '🎙️', label: 'Found Tape', color: 'text-amber-400' };
      case 'headlines':
        return { icon: '📰', label: 'Headlines', color: 'text-blue-400' };
      case 'quiz-mix':
        return { icon: '📝', label: 'Quiz', color: 'text-green-400' };
      case 'decision':
        return { icon: '⚖️', label: 'Decision Point', color: 'text-orange-400' };
      case 'boss':
        return { icon: '👑', label: 'Boss Challenge', color: 'text-red-400' };
      case 'video-lesson':
        return { icon: '🎬', label: 'Video Lesson', color: 'text-cyan-400' };
      case 'image-explore':
        return { icon: '🗺️', label: 'Explore', color: 'text-emerald-400' };
      case 'chrono-order':
        return { icon: '⏳', label: 'Timeline', color: 'text-yellow-400' };
      default:
        return { icon: '📚', label: 'Challenge', color: 'text-primary' };
    }
  };

  const nodeTypeInfo = getNodeTypeInfo();

  // Get tooltip for this node type
  const tooltip = useNodeTooltip(node.type);

  // Get learning points for the intro (for two-truths, use statements as preview)
  const getLearningPoints = () => {
    const content = node.content;
    if (node.type === 'two-truths') {
      const ttContent = content as TwoTruthsContent;
      return ttContent.learningPoints || [
        'One of the following statements is false',
        'Can you spot the lie among the truths?',
        'Think critically about what you know',
      ];
    }
    return null;
  };

  const learningPoints = getLearningPoints();

  // Use spirit guide if available, otherwise fall back to arc host
  const displayGuide = spiritGuide || host;
  const guideAvatar = spiritGuide?.avatar || host?.avatar || '📚';
  const guideName = spiritGuide?.name || host?.name || 'Your Guide';

  // Get welcome message
  const getWelcomeMessage = () => {
    if (node.type === 'boss') {
      return (node.content as BossContent).hostIntro;
    }
    if (spiritGuide?.catchphrases?.length) {
      return spiritGuide.catchphrases[Math.floor(Math.random() * spiritGuide.catchphrases.length)];
    }
    if (host?.catchphrases?.length) {
      return host.catchphrases[Math.floor(Math.random() * host.catchphrases.length)];
    }
    return 'Let us explore this together!';
  };

  return (
    <div className="px-4 py-6 pb-28">
      {/* First-Time Tooltip */}
      {tooltip.shouldShow && (
        <FirstTimeTooltip
          tooltipId={tooltip.tooltipId}
          message={tooltip.message}
          icon={<span className="text-lg">{tooltip.icon}</span>}
          position="top"
          delay={800}
          autoHideDuration={6000}
        />
      )}

      {/* Chapter & Arc Context */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mb-1">
          <span>{arc?.icon}</span>
          <span>{arc?.title}</span>
          <span>•</span>
          <span>{chapter?.title}</span>
        </div>
      </motion.div>

      {/* Node Type Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-6"
      >
        <span className="text-5xl mb-3 block">{nodeTypeInfo.icon}</span>
        <span className={`text-xs font-bold uppercase tracking-wider ${nodeTypeInfo.color}`}>
          {nodeTypeInfo.label}
        </span>
      </motion.div>

      {/* Node Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-editorial text-2xl font-bold text-center mb-4"
      >
        {node.title}
      </motion.h1>

      {/* Context/Learning Area */}
      {context && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <BookOpen size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                {context}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Learning Points */}
      {learningPoints && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <div className="space-y-2">
            {learningPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-start gap-2"
              >
                <Lightbulb size={14} className="text-amber-400 shrink-0 mt-1" />
                <p className="text-sm text-muted-foreground">{point}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Guide Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl shrink-0">
            {guideAvatar}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-1">{guideName}</p>
            <p className="text-sm text-muted-foreground italic">
              "{getWelcomeMessage()}"
            </p>
          </div>
        </div>
      </motion.div>

      {/* XP Reward Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center mb-6"
      >
        <span className="text-xs text-muted-foreground">
          Complete to earn up to <span className="text-gold-highlight font-bold">+{node.xpReward} XP</span>
        </span>
      </motion.div>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <motion.button
          onClick={onStart}
          className="w-full py-4 rounded-xl bg-primary text-primary-foreground font-bold text-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Begin Challenge <ChevronRight size={20} />
        </motion.button>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { ChevronLeft, Lock, CheckCircle2, Circle, Play, Trophy, Clock } from 'lucide-react';
import { Arc, JourneyChapter, JourneyNode, JourneyNodeType } from '@/types';
import { getHostById } from '@/data/hostsData';

interface ArcOverviewProps {
  arc: Arc;
  onBack: () => void;
  onStartNode: (chapterId: string, nodeId: string) => void;
}

export function ArcOverview({ arc, onBack, onStartNode }: ArcOverviewProps) {
  const host = getHostById(arc.hostId);

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ChevronLeft size={16} />
            <span>Journey</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{arc.icon}</span>
            <div>
              <h1 className="font-editorial text-xl font-bold">{arc.title}</h1>
              <p className="text-sm text-muted-foreground">{arc.description}</p>
            </div>
          </div>
        </div>

        {/* Host Banner */}
        {host && (
          <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
            <div className="flex items-center gap-2">
              <span className="text-xl">{host.avatar}</span>
              <span className="text-sm">
                <span className="font-semibold">{host.name}</span>
                <span className="text-muted-foreground"> will guide you through this arc</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Chapters */}
      <div className="px-4 py-6 space-y-6">
        {arc.chapters.map((chapter, chapterIndex) => (
          <ChapterSection
            key={chapter.id}
            chapter={chapter}
            chapterIndex={chapterIndex}
            onStartNode={onStartNode}
          />
        ))}

        {/* Completion Badge Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 rounded-xl bg-card border border-border text-center"
        >
          <div className="text-4xl mb-2">{arc.badge}</div>
          <h3 className="font-editorial font-bold">Complete this Arc</h3>
          <p className="text-sm text-muted-foreground">
            Earn the {arc.title} badge and {arc.totalXP} XP
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// Chapter Section Component
interface ChapterSectionProps {
  chapter: JourneyChapter;
  chapterIndex: number;
  onStartNode: (chapterId: string, nodeId: string) => void;
}

function ChapterSection({ chapter, chapterIndex, onStartNode }: ChapterSectionProps) {
  const completedNodes = chapter.nodes.filter(n => n.isCompleted).length;
  const isLocked = chapter.isLocked;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: chapterIndex * 0.1 }}
      className={`relative ${isLocked ? 'opacity-60' : ''}`}
    >
      {/* Chapter Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isLocked ? 'bg-muted' : 'bg-primary/20'
        }`}>
          {isLocked ? (
            <Lock size={18} className="text-muted-foreground" />
          ) : completedNodes === chapter.nodes.length ? (
            <CheckCircle2 size={18} className="text-success" />
          ) : (
            <span className="font-bold text-primary">{chapterIndex + 1}</span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="font-editorial font-bold">{chapter.title}</h2>
          <p className="text-sm text-muted-foreground">{chapter.description}</p>
        </div>
        {!isLocked && (
          <span className="text-xs text-muted-foreground">
            {completedNodes}/{chapter.nodes.length}
          </span>
        )}
      </div>

      {/* Node Tree */}
      {!isLocked && (
        <div className="ml-5 pl-5 border-l-2 border-border space-y-2">
          {chapter.nodes.map((node, nodeIndex) => (
            <NodeItem
              key={node.id}
              node={node}
              nodeIndex={nodeIndex}
              isFirst={nodeIndex === 0}
              isLast={nodeIndex === chapter.nodes.length - 1}
              onStart={() => onStartNode(chapter.id, node.id)}
            />
          ))}
        </div>
      )}

      {isLocked && (
        <div className="ml-5 pl-5 border-l-2 border-border/50 py-4 text-sm text-muted-foreground">
          Complete previous chapter to unlock
        </div>
      )}
    </motion.div>
  );
}

// Node Item Component
interface NodeItemProps {
  node: JourneyNode;
  nodeIndex: number;
  isFirst: boolean;
  isLast: boolean;
  onStart: () => void;
}

function NodeItem({ node, nodeIndex, isFirst, isLast, onStart }: NodeItemProps) {
  const isCompleted = node.isCompleted;
  const isCurrent = !isCompleted && nodeIndex === 0; // First incomplete node

  return (
    <motion.button
      onClick={onStart}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
        isCompleted
          ? 'bg-success/10 border border-success/20'
          : isCurrent
          ? 'bg-primary/10 border border-primary/30 hover:bg-primary/20'
          : 'bg-card border border-border hover:border-primary/50'
      }`}
      whileHover={{ scale: 1.01, x: 4 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Node Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        isCompleted
          ? 'bg-success/20'
          : isCurrent
          ? 'bg-primary/20'
          : 'bg-muted'
      }`}>
        {isCompleted ? (
          <CheckCircle2 size={18} className="text-success" />
        ) : isCurrent ? (
          <Play size={16} className="text-primary ml-0.5" />
        ) : (
          <Circle size={16} className="text-muted-foreground" />
        )}
      </div>

      {/* Node Info */}
      <div className="flex-1 text-left min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getNodeTypeIcon(node.type)}</span>
          <span className={`font-medium truncate ${isCompleted ? 'text-success' : ''}`}>
            {node.title}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getNodeTypeLabel(node.type)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Trophy size={10} />
            {node.xpReward} XP
          </span>
          {node.type === 'boss' && (
            <>
              <span>•</span>
              <span className="flex items-center gap-1 text-orange-500">
                <Clock size={10} />
                Timed
              </span>
            </>
          )}
        </div>
      </div>

      {/* Boss indicator */}
      {node.type === 'boss' && !isCompleted && (
        <div className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-500 text-xs font-bold">
          BOSS
        </div>
      )}
    </motion.button>
  );
}

// Helper functions
function getNodeTypeIcon(type: JourneyNodeType): string {
  switch (type) {
    case 'two-truths': return '🤔';
    case 'found-tape': return '🎙️';
    case 'headlines': return '📰';
    case 'quiz-mix': return '❓';
    case 'decision': return '⚖️';
    case 'boss': return '👑';
    default: return '📚';
  }
}

function getNodeTypeLabel(type: JourneyNodeType): string {
  switch (type) {
    case 'two-truths': return 'Two Truths & a Lie';
    case 'found-tape': return 'Found Tape';
    case 'headlines': return 'Headlines';
    case 'quiz-mix': return 'Quiz';
    case 'decision': return 'Decision';
    case 'boss': return 'Boss Challenge';
    default: return 'Lesson';
  }
}

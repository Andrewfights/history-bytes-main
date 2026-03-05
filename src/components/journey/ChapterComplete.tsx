import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trophy, Target, Clock, Zap, ChevronDown, ChevronUp, Home, ChevronRight, BookOpen } from 'lucide-react';
import { JourneyNode } from '@/types';
import { useApp } from '@/context/AppContext';

interface ChapterStats {
  totalXP: number;
  questionsCorrect: number;
  questionsTotal: number;
  timeElapsed: number; // in seconds
  perfectNodes: number;
  totalNodes: number;
}

interface ChapterCompleteProps {
  chapterTitle: string;
  chapterNumber: number;
  stats: ChapterStats;
  hasNextChapter: boolean;
  onHome: () => void;
  onNextChapter: () => void;
}

// Get star rating based on accuracy
function getStarRating(accuracy: number): number {
  if (accuracy >= 90) return 3;
  if (accuracy >= 70) return 2;
  return 1;
}

// Format time in mm:ss
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function ChapterComplete({
  chapterTitle,
  chapterNumber,
  stats,
  hasNextChapter,
  onHome,
  onNextChapter,
}: ChapterCompleteProps) {
  const { studyNotes } = useApp();
  const [showMistakes, setShowMistakes] = useState(false);

  const accuracy = stats.questionsTotal > 0
    ? Math.round((stats.questionsCorrect / stats.questionsTotal) * 100)
    : 100;
  const stars = getStarRating(accuracy);

  // Get recent mistakes from study notes (from this session)
  const recentMistakes = studyNotes.slice(0, 5);

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-32">
      {/* Celebration Header */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="text-center mb-8"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="font-editorial text-3xl font-bold mb-2">Chapter Complete!</h1>
        <p className="text-muted-foreground">{chapterTitle}</p>
      </motion.div>

      {/* Star Rating */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex items-center justify-center gap-2 mb-8"
      >
        {[1, 2, 3].map((starNum) => (
          <motion.div
            key={starNum}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5 + starNum * 0.1, type: 'spring', stiffness: 200 }}
          >
            <Star
              size={40}
              className={starNum <= stars ? 'text-amber-400 fill-amber-400' : 'text-muted'}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        {/* XP Earned */}
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Zap size={20} className="mx-auto mb-2 text-gold-highlight" />
          <div className="text-2xl font-bold text-gold-highlight">{stats.totalXP}</div>
          <div className="text-xs text-muted-foreground">XP Earned</div>
        </div>

        {/* Accuracy */}
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Target size={20} className="mx-auto mb-2 text-primary" />
          <div className="text-2xl font-bold">{accuracy}%</div>
          <div className="text-xs text-muted-foreground">Accuracy</div>
        </div>

        {/* Time */}
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Clock size={20} className="mx-auto mb-2 text-blue-400" />
          <div className="text-2xl font-bold">{formatTime(stats.timeElapsed)}</div>
          <div className="text-xs text-muted-foreground">Time</div>
        </div>

        {/* Perfect Nodes */}
        <div className="p-4 rounded-xl bg-card border border-border text-center">
          <Trophy size={20} className="mx-auto mb-2 text-emerald-400" />
          <div className="text-2xl font-bold">{stats.perfectNodes}/{stats.totalNodes}</div>
          <div className="text-xs text-muted-foreground">Perfect</div>
        </div>
      </motion.div>

      {/* Summary Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6"
      >
        <p className="text-sm text-center">
          {stars === 3 && "Outstanding! You've mastered this chapter!"}
          {stars === 2 && "Great work! A solid understanding of the material."}
          {stars === 1 && "Good effort! Review the material to improve your score."}
        </p>
      </motion.div>

      {/* Review Mistakes Section */}
      {recentMistakes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6"
        >
          <button
            onClick={() => setShowMistakes(!showMistakes)}
            className="w-full flex items-center justify-between p-4 rounded-xl bg-card border border-border hover:bg-card/80 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-muted-foreground" />
              <span className="font-medium">Review Your Mistakes</span>
              <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
                {recentMistakes.length}
              </span>
            </div>
            {showMistakes ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          <AnimatePresence>
            {showMistakes && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2"
              >
                {recentMistakes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <p className="text-sm font-medium mb-1 line-clamp-2">{note.question}</p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-destructive">Your answer:</span> {note.userAnswer}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success">Correct:</span> {note.correctAnswer}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
      >
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={onHome}
            className="flex-1 py-4 rounded-xl bg-muted text-foreground font-bold flex items-center justify-center gap-2 hover:bg-muted/80 transition-colors"
          >
            <Home size={18} />
            Home
          </button>
          {hasNextChapter && (
            <button
              onClick={onNextChapter}
              className="flex-[2] py-4 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              Next Chapter
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

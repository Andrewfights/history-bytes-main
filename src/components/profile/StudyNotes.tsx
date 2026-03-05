import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Trash2, RotateCcw, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StudyNote } from '@/lib/storage';

interface StudyNoteCardProps {
  note: StudyNote;
  onDelete: () => void;
  onQuizAgain: () => void;
}

function StudyNoteCard({ note, onDelete, onQuizAgain }: StudyNoteCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleQuizAgain = () => {
    setQuizMode(true);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleSubmitAnswer = () => {
    setShowResult(true);
  };

  const isCorrect = selectedAnswer === note.correctAnswer;

  // Get node type emoji
  const getNodeTypeEmoji = (type: string): string => {
    const emojis: Record<string, string> = {
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
    return emojis[type] || '📚';
  };

  // Format timestamp
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Header - always visible */}
      <button
        onClick={() => !quizMode && setExpanded(!expanded)}
        className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
        disabled={quizMode}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg shrink-0">
            {getNodeTypeEmoji(note.nodeType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm line-clamp-2 mb-1">{note.question}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{note.nodeTitle}</span>
              <span>•</span>
              <span>{formatDate(note.timestamp)}</span>
            </div>
          </div>
          {!quizMode && (
            <div className="shrink-0">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          )}
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {(expanded || quizMode) && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-4">
              {!quizMode ? (
                <>
                  {/* Answer info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle size={14} className="text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Your answer</p>
                        <p className="text-sm">{note.userAnswer}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-success shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Correct answer</p>
                        <p className="text-sm font-medium">{note.correctAnswer}</p>
                      </div>
                    </div>
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-lg bg-muted/50 mb-4">
                    <p className="text-sm text-muted-foreground">{note.explanation}</p>
                  </div>

                  {/* Image if available */}
                  {note.imageUrl && (
                    <div className="mb-4 rounded-lg overflow-hidden">
                      <img src={note.imageUrl} alt="Explanation" className="w-full h-auto" />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleQuizAgain}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <RotateCcw size={14} />
                      Quiz Me Again
                    </button>
                    <button
                      onClick={onDelete}
                      className="p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Quiz mode */}
                  <div className="space-y-3 mb-4">
                    {/* Option: User's original wrong answer */}
                    <button
                      onClick={() => !showResult && setSelectedAnswer(note.userAnswer)}
                      disabled={showResult}
                      className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                        showResult
                          ? note.userAnswer === note.correctAnswer
                            ? 'bg-success/10 border-success'
                            : selectedAnswer === note.userAnswer
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-card border-border'
                          : selectedAnswer === note.userAnswer
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {note.userAnswer}
                    </button>

                    {/* Option: Correct answer */}
                    <button
                      onClick={() => !showResult && setSelectedAnswer(note.correctAnswer)}
                      disabled={showResult}
                      className={`w-full p-3 rounded-lg border text-left text-sm transition-all ${
                        showResult
                          ? 'bg-success/10 border-success'
                          : selectedAnswer === note.correctAnswer
                          ? 'bg-primary/10 border-primary'
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      {note.correctAnswer}
                    </button>
                  </div>

                  {showResult ? (
                    <div className={`p-3 rounded-lg mb-4 ${isCorrect ? 'bg-success/10' : 'bg-destructive/10'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        {isCorrect ? (
                          <CheckCircle2 size={16} className="text-success" />
                        ) : (
                          <XCircle size={16} className="text-destructive" />
                        )}
                        <span className="font-bold text-sm">
                          {isCorrect ? 'Correct!' : 'Still not quite!'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.explanation}</p>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    {!showResult ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={!selectedAnswer}
                        className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors ${
                          selectedAnswer
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                        }`}
                      >
                        Check Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setQuizMode(false);
                          setExpanded(true);
                        }}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                      >
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setQuizMode(false);
                        setExpanded(true);
                      }}
                      className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function StudyNotes() {
  const { studyNotes, removeStudyNote, clearStudyNotes } = useApp();

  if (studyNotes.length === 0) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <BookOpen size={24} className="text-muted-foreground" />
        </div>
        <h3 className="font-bold mb-2">No Study Notes Yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          When you get answers wrong, you can save them here to review later.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-bold text-lg">Study Notes</h2>
          <p className="text-sm text-muted-foreground">
            {studyNotes.length} {studyNotes.length === 1 ? 'note' : 'notes'} saved
          </p>
        </div>
        {studyNotes.length > 0 && (
          <button
            onClick={clearStudyNotes}
            className="text-xs text-destructive hover:text-destructive/80 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Notes list */}
      <div className="space-y-3">
        <AnimatePresence>
          {studyNotes.map((note) => (
            <StudyNoteCard
              key={note.id}
              note={note}
              onDelete={() => removeStudyNote(note.id)}
              onQuizAgain={() => {}}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

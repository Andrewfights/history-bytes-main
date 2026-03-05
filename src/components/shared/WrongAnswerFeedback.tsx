import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, BookmarkPlus, Check, Lightbulb, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Question } from '@/types';

interface WrongAnswerFeedbackProps {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  nodeTitle: string;
  nodeType: string;
  onContinue: () => void;
}

export function WrongAnswerFeedback({
  question,
  userAnswer,
  correctAnswer,
  nodeTitle,
  nodeType,
  onContinue,
}: WrongAnswerFeedbackProps) {
  const { addStudyNote } = useApp();
  const [saved, setSaved] = useState(false);

  const handleSaveToStudyNotes = () => {
    addStudyNote({
      question: question.prompt,
      correctAnswer,
      userAnswer,
      explanation: question.wrongAnswerExplanation || question.explanation,
      imageUrl: question.wrongAnswerImageUrl,
      nodeTitle,
      nodeType,
    });
    setSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-destructive/10 border border-destructive/30 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-destructive/20">
        <div className="flex items-center gap-2 mb-1">
          <XCircle size={18} className="text-destructive" />
          <span className="font-bold text-sm">Not quite!</span>
        </div>
        <p className="text-sm text-muted-foreground">
          The correct answer was: <span className="font-semibold text-foreground">{correctAnswer}</span>
        </p>
      </div>

      {/* Extended explanation */}
      <div className="p-4">
        {/* Why this matters */}
        <div className="flex items-start gap-2 mb-4">
          <Lightbulb size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-1">
              Why this matters
            </p>
            <p className="text-sm text-muted-foreground">
              {question.wrongAnswerExplanation || question.explanation}
            </p>
          </div>
        </div>

        {/* Image if available */}
        {question.wrongAnswerImageUrl && (
          <div className="mb-4 rounded-lg overflow-hidden border border-border">
            <img
              src={question.wrongAnswerImageUrl}
              alt="Explanation visual"
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Save to Study Notes */}
        <AnimatePresence mode="wait">
          {!saved ? (
            <motion.button
              key="save"
              onClick={handleSaveToStudyNotes}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-sm font-medium"
              whileTap={{ scale: 0.98 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <BookmarkPlus size={16} className="text-primary" />
              Save to Study Notes
            </motion.button>
          ) : (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20 text-sm font-medium text-success"
            >
              <Check size={16} />
              Saved to Study Notes
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Continue button */}
      <div className="p-4 pt-0">
        <motion.button
          onClick={onContinue}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          Continue
        </motion.button>
      </div>
    </motion.div>
  );
}

// Simpler inline version for quiz components
interface WrongAnswerBannerProps {
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  nodeTitle: string;
  nodeType: string;
  showSaveOption?: boolean;
}

export function WrongAnswerBanner({
  question,
  userAnswer,
  correctAnswer,
  nodeTitle,
  nodeType,
  showSaveOption = true,
}: WrongAnswerBannerProps) {
  const { addStudyNote } = useApp();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    addStudyNote({
      question: question.prompt,
      correctAnswer,
      userAnswer,
      explanation: question.wrongAnswerExplanation || question.explanation,
      imageUrl: question.wrongAnswerImageUrl,
      nodeTitle,
      nodeType,
    });
    setSaved(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="p-4 rounded-xl bg-muted"
    >
      <div className="flex items-center gap-2 mb-2">
        <XCircle size={16} className="text-destructive" />
        <p className="text-sm font-bold">Not quite!</p>
      </div>
      <p className="text-sm text-muted-foreground mb-3">
        {question.wrongAnswerExplanation || question.explanation}
      </p>

      {showSaveOption && !saved && (
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <BookmarkPlus size={14} />
          Save to Study Notes
        </button>
      )}

      {saved && (
        <div className="flex items-center gap-1.5 text-xs text-success">
          <Check size={14} />
          Saved!
        </div>
      )}
    </motion.div>
  );
}

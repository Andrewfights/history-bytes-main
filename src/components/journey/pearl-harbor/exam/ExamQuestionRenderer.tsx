/**
 * ExamQuestionRenderer - Routes exam questions to correct component
 * Supports both standard mode and game show mode
 */

import { motion, AnimatePresence } from 'framer-motion';
import type { ExamQuestion, ExamAnswer, HostMode } from './types';
import type { WW2Host } from '../../../../types';
import {
  MultipleChoiceExam,
  FillInTheBlank,
  BranchingReveal,
  DualAnswerSlider,
  DragTimeline,
  MultiSelectQuestion,
  PercentageComparison,
  TwoPartAnswer,
  SequenceOrder,
} from './questions';

interface ExamQuestionRendererProps {
  question: ExamQuestion;
  hostMode: HostMode;
  host: WW2Host;
  onAnswer: (answer: ExamAnswer) => void;
  questionNumber: number;
  // Game show mode props
  isGameShowMode?: boolean;
  onSelectionChange?: (hasSelection: boolean, value: unknown) => void;
  isLockedIn?: boolean;
  disabled?: boolean;
}

export function ExamQuestionRenderer({
  question,
  hostMode,
  host,
  onAnswer,
  questionNumber,
  isGameShowMode = false,
  onSelectionChange,
  isLockedIn = false,
  disabled = false,
}: ExamQuestionRendererProps) {
  // Common game show props to pass to question components
  const gameShowProps = {
    isGameShowMode,
    onSelectionChange,
    isLockedIn,
    disabled,
  };

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return <MultipleChoiceExam question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'fill-in-blank':
        return <FillInTheBlank question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'branching-reveal':
        return <BranchingReveal question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'dual-slider':
        return <DualAnswerSlider question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'drag-timeline':
        return <DragTimeline question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'multi-select':
        return <MultiSelectQuestion question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'percentage-compare':
        return <PercentageComparison question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'two-part':
        return <TwoPartAnswer question={question} onAnswer={onAnswer} {...gameShowProps} />;

      case 'sequence-order':
        return <SequenceOrder question={question} onAnswer={onAnswer} {...gameShowProps} />;

      default:
        return (
          <div className="text-white/50 text-center p-6">
            Unknown question type: {(question as ExamQuestion).type}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Host direction - hidden in game show mode (shown in wrapper for complex question types) */}
      {!isGameShowMode && question.hostDirection && (
        <div className="mb-4">
          {hostMode === 'pip' ? (
            <div className="flex gap-3 items-start">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-xl shrink-0"
                style={{ backgroundColor: host.primaryColor }}
              >
                {host.avatar}
              </div>
              <div className="flex-1 bg-white/5 rounded-xl rounded-tl-sm p-3 border border-white/10">
                <p className="text-white/50 text-[10px] mb-0.5">{host.name}</p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {question.hostDirection}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
              <p className="text-white/80 text-sm leading-relaxed italic">
                "{question.hostDirection}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Question content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {renderQuestion()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

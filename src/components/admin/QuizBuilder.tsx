/**
 * QuizBuilder - Visual quiz creation interface
 * Supports multiple choice, true/false, order events, and fill-in-blank questions
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertCircle,
  List,
  ToggleLeft,
  ArrowUpDown,
  Type,
  Save,
} from 'lucide-react';
import type { QuizQuestion, QuizMetadata } from '@/lib/database';

interface QuizBuilderProps {
  initialQuestions?: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onCancel: () => void;
}

type QuestionType = QuizQuestion['type'];

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ElementType }[] = [
  { value: 'multiple-choice', label: 'Multiple Choice', icon: List },
  { value: 'true-false', label: 'True / False', icon: ToggleLeft },
  { value: 'order-events', label: 'Order Events', icon: ArrowUpDown },
  { value: 'fill-blank', label: 'Fill in the Blank', icon: Type },
];

function generateId(): string {
  return `q-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createEmptyQuestion(type: QuestionType = 'multiple-choice'): QuizQuestion {
  const base = {
    id: generateId(),
    type,
    prompt: '',
    explanation: '',
  };

  switch (type) {
    case 'multiple-choice':
      return { ...base, type: 'multiple-choice', choices: ['', '', '', ''], correctAnswer: 0 };
    case 'true-false':
      return { ...base, type: 'true-false', choices: ['True', 'False'], correctAnswer: 0 };
    case 'order-events':
      return { ...base, type: 'order-events', choices: ['', '', '', ''], correctAnswer: '0,1,2,3' };
    case 'fill-blank':
      return { ...base, type: 'fill-blank', correctAnswer: '' };
    default:
      return { ...base, type: 'multiple-choice', choices: ['', '', '', ''], correctAnswer: 0 };
  }
}

export function QuizBuilder({ initialQuestions = [], onSave, onCancel }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuestions.length > 0 ? initialQuestions : [createEmptyQuestion()]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showQuestionList, setShowQuestionList] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currentQuestion = questions[currentIndex];

  const updateQuestion = useCallback((updates: Partial<QuizQuestion>) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIndex] = { ...updated[currentIndex], ...updates } as QuizQuestion;
      return updated;
    });
    // Clear errors for this question when updated
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[currentQuestion.id];
      return newErrors;
    });
  }, [currentIndex, currentQuestion?.id]);

  const addQuestion = useCallback((type: QuestionType = 'multiple-choice') => {
    const newQuestion = createEmptyQuestion(type);
    setQuestions(prev => [...prev, newQuestion]);
    setCurrentIndex(questions.length);
  }, [questions.length]);

  const deleteQuestion = useCallback((index: number) => {
    if (questions.length <= 1) return;

    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (currentIndex >= index && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex, questions.length]);

  const reorderQuestions = useCallback((newOrder: QuizQuestion[]) => {
    setQuestions(newOrder);
    // Update current index to follow the current question
    const newIndex = newOrder.findIndex(q => q.id === currentQuestion.id);
    if (newIndex !== -1) {
      setCurrentIndex(newIndex);
    }
  }, [currentQuestion?.id]);

  const changeQuestionType = useCallback((type: QuestionType) => {
    const newQuestion = createEmptyQuestion(type);
    newQuestion.id = currentQuestion.id; // Keep same ID
    newQuestion.prompt = currentQuestion.prompt; // Keep prompt
    newQuestion.explanation = currentQuestion.explanation || ''; // Keep explanation

    setQuestions(prev => {
      const updated = [...prev];
      updated[currentIndex] = newQuestion;
      return updated;
    });
  }, [currentIndex, currentQuestion]);

  const updateChoice = useCallback((index: number, value: string) => {
    if (!currentQuestion.choices) return;
    const newChoices = [...currentQuestion.choices];
    newChoices[index] = value;
    updateQuestion({ choices: newChoices });
  }, [currentQuestion?.choices, updateQuestion]);

  const addChoice = useCallback(() => {
    if (!currentQuestion.choices || currentQuestion.choices.length >= 6) return;
    updateQuestion({ choices: [...currentQuestion.choices, ''] });
  }, [currentQuestion?.choices, updateQuestion]);

  const removeChoice = useCallback((index: number) => {
    if (!currentQuestion.choices || currentQuestion.choices.length <= 2) return;
    const newChoices = currentQuestion.choices.filter((_, i) => i !== index);
    let newCorrectAnswer = currentQuestion.correctAnswer;

    // Adjust correct answer if needed
    if (typeof newCorrectAnswer === 'number') {
      if (newCorrectAnswer === index) {
        newCorrectAnswer = 0;
      } else if (newCorrectAnswer > index) {
        newCorrectAnswer = newCorrectAnswer - 1;
      }
    }

    updateQuestion({ choices: newChoices, correctAnswer: newCorrectAnswer });
  }, [currentQuestion?.choices, currentQuestion?.correctAnswer, updateQuestion]);

  const setCorrectAnswer = useCallback((value: number | string) => {
    updateQuestion({ correctAnswer: value });
  }, [updateQuestion]);

  const validateQuiz = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    questions.forEach((q, index) => {
      if (!q.prompt.trim()) {
        newErrors[q.id] = `Question ${index + 1}: Missing question text`;
        return;
      }

      if (q.type === 'fill-blank') {
        if (!q.correctAnswer || (typeof q.correctAnswer === 'string' && !q.correctAnswer.trim())) {
          newErrors[q.id] = `Question ${index + 1}: Missing correct answer`;
        }
      } else if (q.type === 'order-events') {
        if (!q.choices || q.choices.some(c => !c.trim())) {
          newErrors[q.id] = `Question ${index + 1}: All events must have text`;
        }
      } else {
        if (!q.choices || q.choices.some(c => !c.trim())) {
          newErrors[q.id] = `Question ${index + 1}: All choices must have text`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [questions]);

  const handleSave = useCallback(() => {
    if (validateQuiz()) {
      onSave(questions);
    }
  }, [questions, validateQuiz, onSave]);

  const goToQuestion = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowQuestionList(false);
  }, []);

  const hasError = (questionId: string) => !!errors[questionId];

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Quiz Editor</h2>
          <span className="text-sm text-muted-foreground">
            {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQuestionList(!showQuestionList)}
            className="px-3 py-1.5 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
          >
            {showQuestionList ? 'Hide List' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      <AnimatePresence>
        {Object.keys(errors).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 py-3 bg-destructive/10 border-b border-destructive/20"
          >
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">
                {Object.values(errors)[0]}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Question List Sidebar */}
        <AnimatePresence>
          {showQuestionList && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-r border-border overflow-hidden"
            >
              <div className="p-2 h-full overflow-y-auto">
                <Reorder.Group
                  axis="y"
                  values={questions}
                  onReorder={reorderQuestions}
                  className="space-y-1"
                >
                  {questions.map((q, index) => (
                    <Reorder.Item
                      key={q.id}
                      value={q}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer group ${
                        index === currentIndex
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-secondary/50'
                      } ${hasError(q.id) ? 'border border-destructive/50' : ''}`}
                      onClick={() => goToQuestion(index)}
                    >
                      <GripVertical size={14} className="text-muted-foreground cursor-grab" />
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                      <span className="text-xs text-muted-foreground truncate flex-1">
                        {q.prompt || 'Untitled question'}
                      </span>
                      {hasError(q.id) && (
                        <AlertCircle size={14} className="text-destructive flex-shrink-0" />
                      )}
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Editor */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Question Type Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Question Type</label>
                  <div className="flex flex-wrap gap-2">
                    {QUESTION_TYPES.map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => changeQuestionType(value)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentQuestion.type === value
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        <Icon size={16} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Question</label>
                  <textarea
                    value={currentQuestion.prompt}
                    onChange={e => updateQuestion({ prompt: e.target.value })}
                    placeholder="Enter your question..."
                    className="w-full h-24 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Choices / Answer Editor */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {currentQuestion.type === 'fill-blank' ? 'Correct Answer' :
                     currentQuestion.type === 'order-events' ? 'Events (in correct order)' :
                     'Answer Choices'}
                  </label>

                  {currentQuestion.type === 'fill-blank' ? (
                    <input
                      type="text"
                      value={currentQuestion.correctAnswer as string}
                      onChange={e => setCorrectAnswer(e.target.value)}
                      placeholder="Enter the correct answer..."
                      className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                    />
                  ) : currentQuestion.type === 'order-events' ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        Enter events in the correct chronological order. Users will need to arrange them.
                      </p>
                      {currentQuestion.choices?.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </span>
                          <input
                            type="text"
                            value={choice}
                            onChange={e => updateChoice(index, e.target.value)}
                            placeholder={`Event ${index + 1}...`}
                            className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                          />
                          {currentQuestion.choices && currentQuestion.choices.length > 2 && (
                            <button
                              onClick={() => removeChoice(index)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {currentQuestion.choices && currentQuestion.choices.length < 6 && (
                        <button
                          onClick={addChoice}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus size={16} />
                          Add Event
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentQuestion.type !== 'true-false' && (
                        <p className="text-xs text-muted-foreground">
                          Click the circle to mark the correct answer
                        </p>
                      )}
                      {currentQuestion.choices?.map((choice, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <button
                            onClick={() => setCorrectAnswer(index)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                              currentQuestion.correctAnswer === index
                                ? 'border-success bg-success'
                                : 'border-border hover:border-primary'
                            }`}
                          >
                            {currentQuestion.correctAnswer === index && (
                              <Check size={14} className="text-success-foreground" />
                            )}
                          </button>
                          {currentQuestion.type === 'true-false' ? (
                            <span className="flex-1 px-3 py-2">{choice}</span>
                          ) : (
                            <input
                              type="text"
                              value={choice}
                              onChange={e => updateChoice(index, e.target.value)}
                              placeholder={`Option ${index + 1}...`}
                              className={`flex-1 px-3 py-2 rounded-lg border focus:outline-none transition-colors ${
                                currentQuestion.correctAnswer === index
                                  ? 'bg-success/10 border-success/30 focus:border-success'
                                  : 'bg-secondary border-border focus:border-primary'
                              }`}
                            />
                          )}
                          {currentQuestion.type !== 'true-false' && currentQuestion.choices && currentQuestion.choices.length > 2 && (
                            <button
                              onClick={() => removeChoice(index)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {currentQuestion.type === 'multiple-choice' && currentQuestion.choices && currentQuestion.choices.length < 6 && (
                        <button
                          onClick={addChoice}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Plus size={16} />
                          Add Option
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Explanation (shown after answering)
                  </label>
                  <textarea
                    value={currentQuestion.explanation || ''}
                    onChange={e => updateQuestion({ explanation: e.target.value })}
                    placeholder="Explain why this is the correct answer..."
                    className="w-full h-20 px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none resize-none"
                  />
                </div>

                {/* Delete Question */}
                {questions.length > 1 && (
                  <button
                    onClick={() => deleteQuestion(currentIndex)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Question
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Question Dots */}
            <div className="flex items-center gap-1 px-2">
              {questions.map((q, index) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentIndex
                      ? 'bg-primary'
                      : hasError(q.id)
                      ? 'bg-destructive'
                      : 'bg-border hover:bg-muted-foreground'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="p-2 rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} />
            </button>

            <span className="text-sm text-muted-foreground ml-2">
              {currentIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => addQuestion()}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Plus size={16} />
              Add Question
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-lg hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Save size={16} />
              Save Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export a standalone modal version
export function QuizBuilderModal({
  isOpen,
  initialQuestions,
  onSave,
  onClose,
}: {
  isOpen: boolean;
  initialQuestions?: QuizQuestion[];
  onSave: (questions: QuizQuestion[]) => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        <QuizBuilder
          initialQuestions={initialQuestions}
          onSave={questions => {
            onSave(questions);
            onClose();
          }}
          onCancel={onClose}
        />
      </motion.div>
    </div>
  );
}

export default QuizBuilder;

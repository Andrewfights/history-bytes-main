import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Save,
  ChevronDown,
  ChevronUp,
  Video,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  Play,
  Clock,
  Upload,
  FileVideo,
  Eye,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import {
  TriviaSet,
  TriviaQuestion,
  TriviaAnswer,
  loadTriviaConfigAsync,
  saveTriviaSetAsync,
  deleteTriviaSetAsync,
  createEmptyTriviaSet,
  createEmptyQuestion,
  getTriviaSetsForStory,
  initTriviaCache,
  fileToDataUrl,
  subscribeToTriviaUpdates,
} from '@/lib/triviaStorage';
import { TriviaPlayer } from '@/components/journey/ghost-army/TriviaPlayer';
import { isFirebaseConfigured } from '@/lib/firebase';

interface QuestionEditorProps {
  question: TriviaQuestion;
  questionIndex: number;
  onUpdate: (question: TriviaQuestion) => void;
  onDelete: () => void;
  isExpanded: boolean;
  onToggle: () => void;
}

function QuestionEditor({
  question,
  questionIndex,
  onUpdate,
  onDelete,
  isExpanded,
  onToggle,
}: QuestionEditorProps) {
  const questionVideoRef = useRef<HTMLInputElement>(null);
  const correctVideoRef = useRef<HTMLInputElement>(null);
  const wrongVideoRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);

  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'questionVideoUrl' | 'correctVideoUrl' | 'wrongVideoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 50) {
      alert('File too large. Max 50MB.');
      return;
    }

    setIsUploading(field);
    try {
      const dataUrl = await fileToDataUrl(file);
      onUpdate({ ...question, [field]: dataUrl });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(null);
    }
  };

  const handleAnswerUpdate = (answerId: string, updates: Partial<TriviaAnswer>) => {
    const updatedAnswers = question.answers.map(a =>
      a.id === answerId ? { ...a, ...updates } : a
    );
    onUpdate({ ...question, answers: updatedAnswers });
  };

  const setCorrectAnswer = (answerId: string) => {
    const updatedAnswers = question.answers.map(a => ({
      ...a,
      isCorrect: a.id === answerId,
    }));
    onUpdate({ ...question, answers: updatedAnswers });
  };

  const hasQuestionVideo = !!question.questionVideoUrl;
  const hasCorrectVideo = !!question.correctVideoUrl;
  const hasWrongVideo = !!question.wrongVideoUrl;

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GripVertical size={16} className="text-muted-foreground" />
          <span className="font-bold">Question {questionIndex + 1}</span>
          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
            {question.questionText || '(No question text)'}
          </span>
          {hasQuestionVideo && (
            <span className="flex items-center gap-1 text-xs text-blue-400">
              <Video size={12} />
              Q
            </span>
          )}
          {hasCorrectVideo && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <Video size={12} />
              ✓
            </span>
          )}
          {hasWrongVideo && (
            <span className="flex items-center gap-1 text-xs text-red-400">
              <Video size={12} />
              ✗
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 size={16} />
          </button>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border space-y-6">
          {/* Question Video */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Video size={16} className="text-blue-400" />
              Question Video
            </label>
            <p className="text-xs text-muted-foreground mb-2">
              Host asks the trivia question in this video
            </p>
            <input
              ref={questionVideoRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleVideoUpload(e, 'questionVideoUrl')}
              className="hidden"
            />
            {question.questionVideoUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden max-w-md">
                  <video
                    src={question.questionVideoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => questionVideoRef.current?.click()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm hover:bg-primary/20 transition-colors"
                  >
                    <Upload size={14} />
                    Replace
                  </button>
                  <button
                    onClick={() => onUpdate({ ...question, questionVideoUrl: undefined })}
                    className="px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => questionVideoRef.current?.click()}
                disabled={isUploading === 'questionVideoUrl'}
                className="flex flex-col items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed border-border hover:border-blue-400/50 hover:bg-blue-400/5 transition-all w-full max-w-md"
              >
                {isUploading === 'questionVideoUrl' ? (
                  <div className="animate-spin w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <FileVideo size={24} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Upload question video</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Answer Trigger */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock size={16} />
              Show Answers
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`trigger-${question.id}`}
                  checked={question.answerTrigger === 'end'}
                  onChange={() => onUpdate({ ...question, answerTrigger: 'end' })}
                  className="accent-primary"
                />
                <span className="text-sm">When video ends</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`trigger-${question.id}`}
                  checked={typeof question.answerTrigger === 'number'}
                  onChange={() => onUpdate({ ...question, answerTrigger: 5 })}
                  className="accent-primary"
                />
                <span className="text-sm">After</span>
                {typeof question.answerTrigger === 'number' && (
                  <input
                    type="number"
                    value={question.answerTrigger}
                    onChange={(e) => onUpdate({ ...question, answerTrigger: parseInt(e.target.value) || 0 })}
                    className="w-16 px-2 py-1 rounded bg-muted border border-border text-sm"
                    min={0}
                  />
                )}
                <span className="text-sm">seconds</span>
              </label>
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="text-sm font-medium mb-2 block">Question Text</label>
            <textarea
              value={question.questionText}
              onChange={(e) => onUpdate({ ...question, questionText: e.target.value })}
              placeholder="Enter the trivia question..."
              className="w-full p-3 rounded-lg bg-muted border border-border resize-none h-20"
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="text-sm font-medium mb-2 block">Answer Options</label>
            <p className="text-xs text-muted-foreground mb-3">
              Click the circle to mark the correct answer
            </p>
            <div className="space-y-2">
              {question.answers.map((answer, index) => (
                <div key={answer.id} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectAnswer(answer.id)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      answer.isCorrect
                        ? 'bg-success text-white'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {String.fromCharCode(65 + index)}
                  </button>
                  <input
                    type="text"
                    value={answer.text}
                    onChange={(e) => handleAnswerUpdate(answer.id, { text: e.target.value })}
                    placeholder={`Answer ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border"
                  />
                  {answer.isCorrect && (
                    <CheckCircle2 size={20} className="text-success" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Correct Response */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Video size={16} className="text-emerald-400" />
                Correct Answer Video
              </label>
              <input
                ref={correctVideoRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoUpload(e, 'correctVideoUrl')}
                className="hidden"
              />
              {question.correctVideoUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={question.correctVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => correctVideoRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                    >
                      <Upload size={12} />
                      Replace
                    </button>
                    <button
                      onClick={() => onUpdate({ ...question, correctVideoUrl: undefined })}
                      className="px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => correctVideoRef.current?.click()}
                  disabled={isUploading === 'correctVideoUrl'}
                  className="flex flex-col items-center justify-center gap-1 p-4 rounded-lg border-2 border-dashed border-border hover:border-emerald-400/50 hover:bg-emerald-400/5 transition-all w-full"
                >
                  {isUploading === 'correctVideoUrl' ? (
                    <div className="animate-spin w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <FileVideo size={20} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload video</span>
                    </>
                  )}
                </button>
              )}
              <input
                type="text"
                value={question.correctMessage}
                onChange={(e) => onUpdate({ ...question, correctMessage: e.target.value })}
                placeholder="Correct! Great job!"
                className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Video size={16} className="text-red-400" />
                Wrong Answer Video
              </label>
              <input
                ref={wrongVideoRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleVideoUpload(e, 'wrongVideoUrl')}
                className="hidden"
              />
              {question.wrongVideoUrl ? (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={question.wrongVideoUrl}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => wrongVideoRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg bg-primary/10 text-primary text-xs hover:bg-primary/20 transition-colors"
                    >
                      <Upload size={12} />
                      Replace
                    </button>
                    <button
                      onClick={() => onUpdate({ ...question, wrongVideoUrl: undefined })}
                      className="px-2 py-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => wrongVideoRef.current?.click()}
                  disabled={isUploading === 'wrongVideoUrl'}
                  className="flex flex-col items-center justify-center gap-1 p-4 rounded-lg border-2 border-dashed border-border hover:border-red-400/50 hover:bg-red-400/5 transition-all w-full"
                >
                  {isUploading === 'wrongVideoUrl' ? (
                    <div className="animate-spin w-5 h-5 border-2 border-red-400 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <FileVideo size={20} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Upload video</span>
                    </>
                  )}
                </button>
              )}
              <input
                type="text"
                value={question.wrongMessage}
                onChange={(e) => onUpdate({ ...question, wrongMessage: e.target.value })}
                placeholder="Not quite! Here's why..."
                className="w-full mt-2 px-3 py-2 rounded-lg bg-muted border border-border text-sm"
              />
            </div>
          </div>

          {/* XP Reward */}
          <div>
            <label className="text-sm font-medium mb-2 block">XP Reward</label>
            <input
              type="number"
              value={question.xpReward}
              onChange={(e) => onUpdate({ ...question, xpReward: parseInt(e.target.value) || 0 })}
              className="w-24 px-3 py-2 rounded-lg bg-muted border border-border"
              min={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function TriviaEditor() {
  const [triviaSets, setTriviaSets] = useState<TriviaSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);

  const selectedSet = triviaSets.find(s => s.id === selectedSetId) || null;

  // Load trivia sets and subscribe to Firebase updates
  useEffect(() => {
    const init = async () => {
      const firebaseConfigured = isFirebaseConfigured();
      setIsSyncedToCloud(firebaseConfigured);

      await initTriviaCache();
      const sets = getTriviaSetsForStory('ghost-army');
      setTriviaSets(sets);
      if (sets.length > 0) {
        setSelectedSetId(sets[0].id);
      }
      setIsLoading(false);
    };
    init();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTriviaUpdates((sets) => {
      const ghostArmySets = sets.filter(s => s.storyId === 'ghost-army');
      setTriviaSets(ghostArmySets);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateSet = async () => {
    const newSet = createEmptyTriviaSet('ghost-army');
    setTriviaSets(prev => [...prev, newSet]);
    setSelectedSetId(newSet.id);
    await saveTriviaSetAsync(newSet);
  };

  const handleUpdateSet = (updates: Partial<TriviaSet>) => {
    if (!selectedSet) return;

    const updatedSet: TriviaSet = {
      ...selectedSet,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setTriviaSets(prev => prev.map(s => s.id === selectedSetId ? updatedSet : s));
  };

  const handleSaveSet = async () => {
    if (!selectedSet) return;

    setSaveStatus('saving');
    try {
      const success = await saveTriviaSetAsync(selectedSet);
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Failed to save trivia set:', err);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDeleteSet = async () => {
    if (!selectedSetId || !confirm('Delete this trivia set?')) return;

    try {
      await deleteTriviaSetAsync(selectedSetId);
      setTriviaSets(prev => prev.filter(s => s.id !== selectedSetId));
      setSelectedSetId(triviaSets[0]?.id || null);
    } catch (err) {
      console.error('Failed to delete trivia set:', err);
    }
  };

  const handleAddQuestion = () => {
    if (!selectedSet) return;

    const newQuestion = createEmptyQuestion();
    handleUpdateSet({
      questions: [...selectedSet.questions, newQuestion],
    });
    setExpandedQuestions(prev => new Set([...prev, newQuestion.id]));
  };

  const handleUpdateQuestion = (questionId: string, question: TriviaQuestion) => {
    if (!selectedSet) return;

    handleUpdateSet({
      questions: selectedSet.questions.map(q =>
        q.id === questionId ? question : q
      ),
    });
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedSet || !confirm('Delete this question?')) return;

    handleUpdateSet({
      questions: selectedSet.questions.filter(q => q.id !== questionId),
    });
  };

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Preview mode
  if (previewMode && selectedSet) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-2 flex items-center justify-between">
          <span className="font-bold">Preview: {selectedSet.title}</span>
          <button
            onClick={() => setPreviewMode(false)}
            className="px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
          >
            Exit Preview
          </button>
        </div>
        <TriviaPlayer
          triviaSet={selectedSet}
          onComplete={(results) => {
            console.log('Preview complete:', results);
          }}
          onExit={() => setPreviewMode(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-editorial text-3xl font-bold">Trivia Editor</h1>
                {/* Cloud sync indicator */}
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                  isSyncedToCloud
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  {isSyncedToCloud ? <Cloud size={12} /> : <CloudOff size={12} />}
                  {isSyncedToCloud ? 'Cloud Sync' : 'No Cloud'}
                </div>
              </div>
              <p className="text-muted-foreground">
                Create video-driven trivia for Ghost Army
              </p>
            </div>

            {/* Save Status */}
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm"
                >
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                  Saving...
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div
                  key="saved"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm"
                >
                  <CheckCircle2 size={16} />
                  Saved
                </motion.div>
              )}
              {saveStatus === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive text-sm"
                >
                  <AlertCircle size={16} />
                  Save Failed
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Trivia Set Selector */}
          <div className="flex items-center gap-3">
            <select
              value={selectedSetId || ''}
              onChange={(e) => setSelectedSetId(e.target.value || null)}
              className="flex-1 px-4 py-2 rounded-lg bg-card border border-border"
            >
              <option value="">Select a trivia set...</option>
              {triviaSets.map(set => (
                <option key={set.id} value={set.id}>
                  {set.title} ({set.questions.length} questions)
                </option>
              ))}
            </select>
            <button
              onClick={handleCreateSet}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={18} />
              New Set
            </button>
          </div>
        </div>

        {/* Selected Set Editor */}
        {selectedSet ? (
          <div className="space-y-6">
            {/* Set Info */}
            <div className="p-4 rounded-xl bg-card border border-border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title</label>
                  <input
                    type="text"
                    value={selectedSet.title}
                    onChange={(e) => handleUpdateSet({ title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border"
                    placeholder="Trivia Set Title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description</label>
                  <input
                    type="text"
                    value={selectedSet.description}
                    onChange={(e) => handleUpdateSet({ description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border"
                    placeholder="Brief description..."
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMode(true)}
                    disabled={selectedSet.questions.length === 0}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 font-medium hover:bg-blue-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Eye size={16} />
                    Preview
                  </button>
                  <button
                    onClick={handleDeleteSet}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Set
                  </button>
                </div>
                <button
                  onClick={handleSaveSet}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors"
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </div>

            {/* Questions */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">Questions ({selectedSet.questions.length})</h2>
                <button
                  onClick={handleAddQuestion}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-sm font-medium hover:bg-muted/80 transition-colors"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              </div>

              <div className="space-y-3">
                {selectedSet.questions.map((question, index) => (
                  <QuestionEditor
                    key={question.id}
                    question={question}
                    questionIndex={index}
                    onUpdate={(q) => handleUpdateQuestion(question.id, q)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                    isExpanded={expandedQuestions.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                ))}

                {selectedSet.questions.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No questions yet.</p>
                    <button
                      onClick={handleAddQuestion}
                      className="mt-2 text-primary hover:underline"
                    >
                      Add your first question
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Help */}
            <div className="p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
              <h3 className="font-bold mb-2">How it works:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Upload a <strong>Question Video</strong> where the host asks the trivia question</li>
                <li>Set when answers appear (at video end or after X seconds)</li>
                <li>Add the question text and 4 answer options</li>
                <li>Upload <strong>Correct</strong> and <strong>Wrong</strong> response videos</li>
                <li>Click <strong>Preview</strong> to test the flow</li>
              </ol>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No trivia set selected.</p>
            <button
              onClick={handleCreateSet}
              className="mt-2 text-primary hover:underline"
            >
              Create your first trivia set
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

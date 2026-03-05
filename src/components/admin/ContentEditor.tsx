/**
 * ContentEditor - Lesson content management with drag-and-drop
 * Supports text cards, images, videos (with autoplay controls), and quizzes
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  GripVertical,
  FileText,
  Image,
  Video,
  HelpCircle,
  Edit2,
  Save,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Eye,
  Upload,
  Wand2,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { LessonContent, QuizQuestion, QuizMetadata } from '@/lib/database';
import {
  saveLessonContent,
  deleteLessonContent,
  reorderLessonContent,
} from '@/lib/database';
import { MediaPicker } from './MediaPicker';
import { QuizBuilderModal } from './QuizBuilder';
import type { MediaFile } from '@/lib/supabase';
import { generateImage, base64ToDataUrl, isGeminiConfigured } from '@/lib/gemini';

interface ContentEditorProps {
  lessonId: string;
  initialContent?: LessonContent[];
  onContentChange?: (content: LessonContent[]) => void;
}

type ContentType = LessonContent['contentType'];

const CONTENT_TYPES: { value: ContentType; label: string; icon: React.ElementType }[] = [
  { value: 'card', label: 'Text Card', icon: FileText },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'video', label: 'Video', icon: Video },
  { value: 'quiz', label: 'Quiz', icon: HelpCircle },
];

function generateId(): string {
  return `content-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function createEmptyContent(type: ContentType, lessonId: string, order: number): LessonContent {
  const base: LessonContent = {
    id: generateId(),
    lessonId,
    contentType: type,
    displayOrder: order,
  };

  switch (type) {
    case 'card':
      return { ...base, title: '', body: '' };
    case 'image':
      return { ...base, title: '', mediaUrl: '' };
    case 'video':
      return { ...base, title: '', mediaUrl: '', mediaAutoplay: false, mediaLoop: false, mediaMuted: false };
    case 'quiz':
      return { ...base, title: 'Quiz', metadata: { questions: [] } as QuizMetadata };
    default:
      return base;
  }
}

export function ContentEditor({ lessonId, initialContent = [], onContentChange }: ContentEditorProps) {
  const [content, setContent] = useState<LessonContent[]>(initialContent);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<{ itemId: string; type: 'image' | 'video' } | null>(null);
  const [showQuizBuilder, setShowQuizBuilder] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Notify parent of changes
  useEffect(() => {
    onContentChange?.(content);
  }, [content, onContentChange]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const addContent = useCallback((type: ContentType) => {
    const newContent = createEmptyContent(type, lessonId, content.length);
    setContent(prev => [...prev, newContent]);
    setExpandedItems(prev => new Set(prev).add(newContent.id));
    setEditingItem(newContent.id);
    setShowAddMenu(false);
  }, [lessonId, content.length]);

  const updateContent = useCallback((id: string, updates: Partial<LessonContent>) => {
    setContent(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);

  const removeContent = useCallback(async (id: string) => {
    const item = content.find(c => c.id === id);
    if (!item) return;

    if (confirm('Are you sure you want to delete this content?')) {
      await deleteLessonContent(id);
      setContent(prev => prev.filter(c => c.id !== id));
      setExpandedItems(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      toast.success('Content deleted');
    }
  }, [content]);

  const handleReorder = useCallback(async (newOrder: LessonContent[]) => {
    // Update display orders
    const reordered = newOrder.map((item, index) => ({
      ...item,
      displayOrder: index,
    }));
    setContent(reordered);

    // Save to database
    const ids = reordered.map(item => item.id);
    await reorderLessonContent(lessonId, ids);
  }, [lessonId]);

  const saveItem = useCallback(async (id: string) => {
    const item = content.find(c => c.id === id);
    if (!item) return;

    setSaving(id);
    const success = await saveLessonContent(item);
    setSaving(null);

    if (success) {
      toast.success('Content saved');
      setEditingItem(null);
    } else {
      toast.error('Failed to save content');
    }
  }, [content]);

  const handleMediaSelect = useCallback((file: MediaFile) => {
    if (!showMediaPicker) return;
    updateContent(showMediaPicker.itemId, { mediaUrl: file.url });
    setShowMediaPicker(null);
  }, [showMediaPicker, updateContent]);

  const handleQuizSave = useCallback((questions: QuizQuestion[]) => {
    if (!showQuizBuilder) return;
    updateContent(showQuizBuilder, {
      metadata: { questions } as QuizMetadata,
    });
    setShowQuizBuilder(null);
  }, [showQuizBuilder, updateContent]);

  const getContentIcon = (type: ContentType) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    return found?.icon || FileText;
  };

  const getContentLabel = (type: ContentType) => {
    const found = CONTENT_TYPES.find(t => t.value === type);
    return found?.label || 'Content';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Lesson Content</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus size={16} />
            Add Content
            <ChevronDown size={14} className={`transition-transform ${showAddMenu ? 'rotate-180' : ''}`} />
          </button>
          <AnimatePresence>
            {showAddMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10"
              >
                {CONTENT_TYPES.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => addContent(value)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-secondary transition-colors"
                  >
                    <Icon size={18} className="text-muted-foreground" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content List */}
      {content.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <FileText size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No content yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add cards, images, videos, or quizzes to build your lesson
          </p>
        </div>
      ) : (
        <Reorder.Group axis="y" values={content} onReorder={handleReorder} className="space-y-2">
          {content.map((item) => {
            const Icon = getContentIcon(item.contentType);
            const isExpanded = expandedItems.has(item.id);
            const isEditing = editingItem === item.id;
            const isSaving = saving === item.id;

            return (
              <Reorder.Item
                key={item.id}
                value={item}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Item Header */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/50 transition-colors"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <GripVertical size={18} className="text-muted-foreground cursor-grab flex-shrink-0" />
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {item.title || getContentLabel(item.contentType)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.contentType === 'quiz' && item.metadata
                        ? `${(item.metadata as QuizMetadata).questions?.length || 0} questions`
                        : getContentLabel(item.contentType)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeContent(item.id);
                      }}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Content Editor */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border"
                    >
                      <div className="p-4 space-y-4">
                        {/* Title (for all types) */}
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={item.title || ''}
                            onChange={(e) => updateContent(item.id, { title: e.target.value })}
                            placeholder="Enter title..."
                            className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none"
                          />
                        </div>

                        {/* Content-specific fields */}
                        {item.contentType === 'card' && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Body Text</label>
                            <textarea
                              value={item.body || ''}
                              onChange={(e) => updateContent(item.id, { body: e.target.value })}
                              placeholder="Enter card content..."
                              rows={4}
                              className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary focus:outline-none resize-none"
                            />
                          </div>
                        )}

                        {item.contentType === 'image' && (
                          <ImageContentEditor
                            item={item}
                            onUpdate={(updates) => updateContent(item.id, updates)}
                            onOpenMediaPicker={() => setShowMediaPicker({ itemId: item.id, type: 'image' })}
                          />
                        )}

                        {item.contentType === 'video' && (
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-muted-foreground">Video</label>
                              {item.mediaUrl ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden bg-secondary">
                                  <video
                                    src={item.mediaUrl}
                                    className="w-full h-full object-cover"
                                    controls
                                  />
                                  <button
                                    onClick={() => setShowMediaPicker({ itemId: item.id, type: 'video' })}
                                    className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/50 text-white text-sm hover:bg-black/70 transition-colors"
                                  >
                                    Change Video
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setShowMediaPicker({ itemId: item.id, type: 'video' })}
                                  className="w-full aspect-video rounded-lg border-2 border-dashed border-border hover:border-primary flex flex-col items-center justify-center gap-2 transition-colors"
                                >
                                  <Video size={32} className="text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">Click to select video</span>
                                </button>
                              )}
                            </div>

                            {/* Playback Options */}
                            <div className="space-y-3">
                              <label className="text-sm font-medium text-muted-foreground">Playback Options</label>
                              <div className="flex flex-wrap gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.mediaAutoplay || false}
                                    onChange={(e) => updateContent(item.id, { mediaAutoplay: e.target.checked })}
                                    className="w-4 h-4 rounded border-border accent-primary"
                                  />
                                  <Play size={16} className="text-muted-foreground" />
                                  <span className="text-sm">Autoplay</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.mediaLoop || false}
                                    onChange={(e) => updateContent(item.id, { mediaLoop: e.target.checked })}
                                    className="w-4 h-4 rounded border-border accent-primary"
                                  />
                                  <RotateCcw size={16} className="text-muted-foreground" />
                                  <span className="text-sm">Loop</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={item.mediaMuted || false}
                                    onChange={(e) => updateContent(item.id, { mediaMuted: e.target.checked })}
                                    className="w-4 h-4 rounded border-border accent-primary"
                                  />
                                  <VolumeX size={16} className="text-muted-foreground" />
                                  <span className="text-sm">Start Muted</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        )}

                        {item.contentType === 'quiz' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <label className="text-sm font-medium text-muted-foreground">Quiz Questions</label>
                              <span className="text-xs text-muted-foreground">
                                {(item.metadata as QuizMetadata)?.questions?.length || 0} questions
                              </span>
                            </div>

                            {/* Question Preview */}
                            {(item.metadata as QuizMetadata)?.questions?.length > 0 && (
                              <div className="space-y-2">
                                {(item.metadata as QuizMetadata).questions.slice(0, 3).map((q, idx) => (
                                  <div key={q.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium">
                                      {idx + 1}
                                    </span>
                                    <span className="text-sm truncate flex-1">{q.prompt || 'Untitled question'}</span>
                                  </div>
                                ))}
                                {(item.metadata as QuizMetadata).questions.length > 3 && (
                                  <p className="text-xs text-muted-foreground text-center">
                                    +{(item.metadata as QuizMetadata).questions.length - 3} more questions
                                  </p>
                                )}
                              </div>
                            )}

                            <button
                              onClick={() => setShowQuizBuilder(item.id)}
                              className="flex items-center gap-2 w-full px-4 py-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors"
                            >
                              <Edit2 size={16} className="text-primary" />
                              <span className="text-sm">
                                {(item.metadata as QuizMetadata)?.questions?.length > 0
                                  ? 'Edit Quiz Questions'
                                  : 'Add Quiz Questions'}
                              </span>
                            </button>
                          </div>
                        )}

                        {/* Save Button */}
                        <div className="flex justify-end pt-2 border-t border-border">
                          <button
                            onClick={() => saveItem(item.id)}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                          >
                            {isSaving ? (
                              <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            ) : (
                              <Save size={16} />
                            )}
                            {isSaving ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={!!showMediaPicker}
        onClose={() => setShowMediaPicker(null)}
        onSelect={handleMediaSelect}
        allowedTypes={showMediaPicker?.type ? [showMediaPicker.type] : ['image', 'video']}
        title={showMediaPicker?.type === 'video' ? 'Select Video' : 'Select Image'}
      />

      {/* Quiz Builder Modal */}
      <QuizBuilderModal
        isOpen={!!showQuizBuilder}
        initialQuestions={
          showQuizBuilder
            ? (content.find(c => c.id === showQuizBuilder)?.metadata as QuizMetadata)?.questions
            : undefined
        }
        onSave={handleQuizSave}
        onClose={() => setShowQuizBuilder(null)}
      />
    </div>
  );
}

// Image Content Editor with Upload and Generate
function ImageContentEditor({
  item,
  onUpdate,
  onOpenMediaPicker,
}: {
  item: LessonContent;
  onUpdate: (updates: Partial<LessonContent>) => void;
  onOpenMediaPicker: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onUpdate({ mediaUrl: dataUrl });
      toast.success('Image uploaded');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async () => {
    if (!isGeminiConfigured()) {
      toast.error('Gemini API not configured');
      return;
    }

    setIsGenerating(true);
    toast.info('Generating image...', { description: 'This may take a moment' });

    try {
      const prompt = item.title
        ? `Educational illustration: ${item.title}. Clean, professional style suitable for an online learning platform.`
        : 'Educational historical illustration, clean professional style';

      const result = await generateImage({
        prompt,
        aspectRatio: '16:9',
        style: 'illustration'
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);
        onUpdate({ mediaUrl: dataUrl });
        toast.success('Image generated!');
      } else {
        toast.error('Failed to generate image');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground">Image</label>

      {/* Preview */}
      <div className="aspect-video rounded-lg overflow-hidden bg-secondary border-2 border-dashed border-border relative">
        {item.mediaUrl ? (
          <>
            <img
              src={item.mediaUrl}
              alt={item.title || 'Image'}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() => onUpdate({ mediaUrl: '' })}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
            <Image size={32} className="mb-2 opacity-50" />
            <p className="text-sm">No image set</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
        >
          <Upload size={14} />
          Upload
        </button>
        <button
          type="button"
          onClick={onOpenMediaPicker}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
        >
          <Image size={14} />
          Library
        </button>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !isGeminiConfigured()}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          Generate
        </button>
      </div>

      {/* URL Input */}
      <input
        type="text"
        value={item.mediaUrl || ''}
        onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
        className="w-full px-3 py-2 rounded-lg bg-secondary border border-border focus:border-primary outline-none text-xs"
        placeholder="Or paste image URL..."
      />
    </div>
  );
}

export default ContentEditor;

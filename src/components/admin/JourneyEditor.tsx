import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Map, Layers, FileText, ArrowLeft, Save, Plus, Trash2, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { arcs as defaultArcs, getArcById, getChapterById, getNodeById } from '@/data/journeyData';
import { Arc, JourneyChapter, JourneyNode, JourneyNodeType, JourneyNodeContent, TwoTruthsContent, QuizMixContent, DecisionContent, BossContent, Question } from '@/types';
import { saveJourneyArcs, loadStoredJourneyArcs } from '@/lib/adminStorage';
import { generateImage, base64ToDataUrl, isGeminiConfigured } from '@/lib/gemini';
import { uploadFile } from '@/lib/supabase';

type ViewMode = 'arcs' | 'chapters' | 'nodes' | 'edit';

const nodeTypeLabels: Record<JourneyNodeType, string> = {
  'two-truths': 'Two Truths & a Lie',
  'found-tape': 'Found Tape',
  'headlines': 'Headlines',
  'quiz-mix': 'Quiz Mix',
  'decision': 'Decision Point',
  'boss': 'Boss Challenge',
};

const nodeTypeColors: Record<JourneyNodeType, string> = {
  'two-truths': 'bg-purple-500/20 text-purple-400',
  'found-tape': 'bg-amber-500/20 text-amber-400',
  'headlines': 'bg-blue-500/20 text-blue-400',
  'quiz-mix': 'bg-green-500/20 text-green-400',
  'decision': 'bg-orange-500/20 text-orange-400',
  'boss': 'bg-red-500/20 text-red-400',
};

const JOURNEY_THUMBNAILS_KEY = 'hb_journey_thumbnails';

function loadJourneyThumbnails(): Record<string, string> {
  try {
    const stored = localStorage.getItem(JOURNEY_THUMBNAILS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveJourneyThumbnails(thumbnails: Record<string, string>) {
  localStorage.setItem(JOURNEY_THUMBNAILS_KEY, JSON.stringify(thumbnails));
  // Dispatch custom event so same-tab components can update (storage event only fires cross-tab)
  window.dispatchEvent(new CustomEvent('journey-thumbnails-updated', { detail: thumbnails }));
}

export default function JourneyEditor() {
  const [view, setView] = useState<ViewMode>('arcs');
  const [selectedArcId, setSelectedArcId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Load arcs from localStorage or use defaults
  const [arcsData, setArcsData] = useState<Arc[]>(() => {
    const stored = loadStoredJourneyArcs();
    return (stored as Arc[]) || [...defaultArcs];
  });

  // Thumbnail state
  const [thumbnails, setThumbnails] = useState<Record<string, string>>(() => loadJourneyThumbnails());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  // Auto-save to localStorage when data changes
  useEffect(() => {
    saveJourneyArcs(arcsData);
  }, [arcsData]);

  // Save thumbnails when they change
  useEffect(() => {
    saveJourneyThumbnails(thumbnails);
  }, [thumbnails]);

  // Check if a thumbnail URL is valid
  const isValidThumbnail = (url: string | undefined): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:');
  };

  // Generate thumbnails for all arcs and chapters
  const handleGenerateAllThumbnails = async () => {
    if (!isGeminiConfigured()) {
      toast.error('Gemini API not configured');
      return;
    }

    // Collect all items needing thumbnails (arcs + chapters)
    const itemsToGenerate: { id: string; title: string; description: string; type: 'arc' | 'chapter' }[] = [];

    arcsData.forEach(arc => {
      if (!isValidThumbnail(thumbnails[arc.id])) {
        itemsToGenerate.push({
          id: arc.id,
          title: arc.title,
          description: `Historical journey arc about ${arc.title}`,
          type: 'arc'
        });
      }
      arc.chapters.forEach(chapter => {
        if (!isValidThumbnail(thumbnails[chapter.id])) {
          itemsToGenerate.push({
            id: chapter.id,
            title: chapter.title,
            description: `Chapter in ${arc.title} journey`,
            type: 'chapter'
          });
        }
      });
    });

    if (itemsToGenerate.length === 0) {
      toast.info('All journey items already have thumbnails');
      return;
    }

    setIsGeneratingAll(true);
    setGenerationProgress({ current: 0, total: itemsToGenerate.length });

    const newThumbnails = { ...thumbnails };

    for (let i = 0; i < itemsToGenerate.length; i++) {
      const item = itemsToGenerate[i];
      setGenerationProgress({ current: i + 1, total: itemsToGenerate.length });

      try {
        toast.loading(`Generating art for "${item.title}"...`, { id: `gen-${item.id}` });

        const prompt = item.type === 'arc'
          ? `Epic historical journey banner for "${item.title}". Cinematic, dramatic lighting, educational history theme, suitable for a learning app. High quality digital art, widescreen format.`
          : `Historical chapter thumbnail for "${item.title}". Educational, engaging, detailed illustration. Suitable for mobile learning app.`;

        const result = await generateImage({
          prompt,
          aspectRatio: item.type === 'arc' ? '16:9' : '1:1',
          style: 'cinematic'
        });

        if (result) {
          const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const fileName = `journey-${item.id}-${Date.now()}.${result.mimeType.split('/')[1] || 'png'}`;
          const file = new File([blob], fileName, { type: result.mimeType });

          const uploadResult = await uploadFile(file);

          if (uploadResult) {
            newThumbnails[item.id] = uploadResult.url;
            toast.success(`Generated art for "${item.title}"`, { id: `gen-${item.id}` });
          } else {
            toast.error(`Failed to upload art for "${item.title}"`, { id: `gen-${item.id}` });
          }
        } else {
          toast.error(`Failed to generate art for "${item.title}"`, { id: `gen-${item.id}` });
        }
      } catch (error) {
        console.error(`Error generating art for ${item.title}:`, error);
        toast.error(`Error generating art for "${item.title}"`, { id: `gen-${item.id}` });
      }

      if (i < itemsToGenerate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    setThumbnails(newThumbnails);
    setIsGeneratingAll(false);
    setGenerationProgress({ current: 0, total: 0 });
    toast.success('Journey art generation complete!');
  };

  // Helper functions for arc navigation
  const getArcByIdLocal = (arcId: string) => arcsData.find(a => a.id === arcId);
  const getChapterByIdLocal = (arcId: string, chapterId: string) => {
    const arc = getArcByIdLocal(arcId);
    return arc?.chapters.find(c => c.id === chapterId);
  };
  const getNodeByIdLocal = (arcId: string, chapterId: string, nodeId: string) => {
    const chapter = getChapterByIdLocal(arcId, chapterId);
    return chapter?.nodes.find(n => n.id === nodeId);
  };

  const selectedArc = selectedArcId ? getArcByIdLocal(selectedArcId) : null;
  const selectedChapter = selectedArcId && selectedChapterId
    ? getChapterByIdLocal(selectedArcId, selectedChapterId)
    : null;
  const selectedNode = selectedArcId && selectedChapterId && selectedNodeId
    ? getNodeByIdLocal(selectedArcId, selectedChapterId, selectedNodeId)
    : null;

  const handleSelectArc = (arcId: string) => {
    setSelectedArcId(arcId);
    setSelectedChapterId(null);
    setSelectedNodeId(null);
    setView('chapters');
  };

  const handleSelectChapter = (chapterId: string) => {
    setSelectedChapterId(chapterId);
    setSelectedNodeId(null);
    setView('nodes');
  };

  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    setView('edit');
  };

  const handleBack = () => {
    if (view === 'edit') {
      setSelectedNodeId(null);
      setView('nodes');
    } else if (view === 'nodes') {
      setSelectedChapterId(null);
      setView('chapters');
    } else if (view === 'chapters') {
      setSelectedArcId(null);
      setView('arcs');
    }
  };

  const handleSave = useCallback(() => {
    saveJourneyArcs(arcsData);
    toast.success('Changes saved', {
      description: 'Data persisted to local storage.',
    });
  }, [arcsData]);

  const updateNode = useCallback((updates: Partial<JourneyNode>) => {
    if (!selectedArcId || !selectedChapterId || !selectedNodeId) return;

    setArcsData(prev => prev.map(arc => {
      if (arc.id !== selectedArcId) return arc;
      return {
        ...arc,
        chapters: arc.chapters.map(chapter => {
          if (chapter.id !== selectedChapterId) return chapter;
          return {
            ...chapter,
            nodes: chapter.nodes.map(node => {
              if (node.id !== selectedNodeId) return node;
              return { ...node, ...updates };
            }),
          };
        }),
      };
    }));
  }, [selectedArcId, selectedChapterId, selectedNodeId]);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        {view !== 'arcs' && (
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="font-editorial text-3xl font-bold text-foreground">Journey Editor</h1>
          <Breadcrumbs
            arc={selectedArc}
            chapter={selectedChapter}
            node={selectedNode}
            onSelectArc={() => { setSelectedChapterId(null); setSelectedNodeId(null); setView('chapters'); }}
            onSelectChapter={() => { setSelectedNodeId(null); setView('nodes'); }}
          />
        </div>
        {view === 'arcs' && (
          <button
            onClick={handleGenerateAllThumbnails}
            disabled={isGeneratingAll || !isGeminiConfigured()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {generationProgress.current}/{generationProgress.total}
              </>
            ) : (
              <>
                <Wand2 size={18} />
                Generate All Art
              </>
            )}
          </button>
        )}
      </div>

      {/* Arc List */}
      {view === 'arcs' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {arcsData.map((arc) => (
            <ArcCard key={arc.id} arc={arc} thumbnailUrl={thumbnails[arc.id]} onClick={() => handleSelectArc(arc.id)} />
          ))}
        </motion.div>
      )}

      {/* Chapter List */}
      {view === 'chapters' && selectedArc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {selectedArc.chapters.map((chapter) => (
            <ChapterCard key={chapter.id} chapter={chapter} thumbnailUrl={thumbnails[chapter.id]} onClick={() => handleSelectChapter(chapter.id)} />
          ))}
        </motion.div>
      )}

      {/* Node List */}
      {view === 'nodes' && selectedChapter && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-3"
        >
          {selectedChapter.nodes.map((node) => (
            <NodeCard key={node.id} node={node} onClick={() => handleSelectNode(node.id)} />
          ))}
        </motion.div>
      )}

      {/* Node Editor */}
      {view === 'edit' && selectedNode && (
        <NodeEditor node={selectedNode} onSave={handleSave} onUpdate={updateNode} />
      )}
    </div>
  );
}

// Breadcrumbs Component
function Breadcrumbs({
  arc,
  chapter,
  node,
  onSelectArc,
  onSelectChapter,
}: {
  arc: Arc | null;
  chapter: JourneyChapter | null;
  node: JourneyNode | null;
  onSelectArc: () => void;
  onSelectChapter: () => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
      <span className="hover:text-foreground cursor-default">Arcs</span>
      {arc && (
        <>
          <ChevronRight size={14} />
          <button onClick={onSelectArc} className="hover:text-foreground">
            {arc.title}
          </button>
        </>
      )}
      {chapter && (
        <>
          <ChevronRight size={14} />
          <button onClick={onSelectChapter} className="hover:text-foreground">
            {chapter.title}
          </button>
        </>
      )}
      {node && (
        <>
          <ChevronRight size={14} />
          <span className="text-foreground">{node.title}</span>
        </>
      )}
    </div>
  );
}

// Arc Card Component
function ArcCard({ arc, thumbnailUrl, onClick }: { arc: Arc; thumbnailUrl?: string; onClick: () => void }) {
  const hasValidThumbnail = thumbnailUrl && (
    thumbnailUrl.startsWith('http://') ||
    thumbnailUrl.startsWith('https://') ||
    thumbnailUrl.startsWith('data:')
  );

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
            {hasValidThumbnail ? (
              <img src={thumbnailUrl} alt={arc.title} className="w-full h-full object-cover" />
            ) : (
              <Map size={24} className="text-primary/50" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {arc.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {arc.chapters.length} chapters | {arc.totalXP} XP
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <ChevronRight size={18} className="group-hover:text-primary transition-colors" />
        </div>
      </div>
    </button>
  );
}

// Chapter Card Component
function ChapterCard({ chapter, thumbnailUrl, onClick }: { chapter: JourneyChapter; thumbnailUrl?: string; onClick: () => void }) {
  const hasValidThumbnail = thumbnailUrl && (
    thumbnailUrl.startsWith('http://') ||
    thumbnailUrl.startsWith('https://') ||
    thumbnailUrl.startsWith('data:')
  );

  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
            {hasValidThumbnail ? (
              <img src={thumbnailUrl} alt={chapter.title} className="w-full h-full object-cover" />
            ) : (
              <Layers size={18} className="text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {chapter.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {chapter.nodes.length} nodes | Order: {chapter.order}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}

// Node Card Component
function NodeCard({ node, onClick }: { node: JourneyNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-card border border-border rounded-xl p-4 hover:border-primary/50 transition-colors text-left group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <FileText size={18} className="text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {node.title}
              </h3>
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium ${nodeTypeColors[node.type]}`}>
                {nodeTypeLabels[node.type]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {node.xpReward} XP | Order: {node.order}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}

// Node Editor Component
function NodeEditor({
  node,
  onSave,
  onUpdate,
}: {
  node: JourneyNode;
  onSave: () => void;
  onUpdate: (updates: Partial<JourneyNode>) => void;
}) {
  const [title, setTitle] = useState(node.title);
  const [xpReward, setXpReward] = useState(node.xpReward);
  const [content, setContent] = useState(node.content);

  // Update parent state when local state changes
  useEffect(() => {
    onUpdate({ title, xpReward, content });
  }, [title, xpReward, content]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full font-medium ${nodeTypeColors[node.type]}`}>
            {nodeTypeLabels[node.type]}
          </span>
          <span className="text-sm text-muted-foreground">ID: {node.id}</span>
        </div>
        <button
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">XP Reward</label>
            <input
              type="number"
              value={xpReward}
              onChange={(e) => setXpReward(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Order</label>
            <input
              type="number"
              value={node.order}
              readOnly
              className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-muted-foreground cursor-not-allowed"
            />
          </div>
        </div>

        {/* Content Editor - Visual Forms */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Content Configuration</h3>
          <NodeContentEditor
            type={node.type}
            content={content}
            onChange={setContent}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Visual content editor based on node type
function NodeContentEditor({
  type,
  content,
  onChange,
}: {
  type: JourneyNodeType;
  content: JourneyNodeContent;
  onChange: (content: JourneyNodeContent) => void;
}) {
  switch (type) {
    case 'two-truths':
      return <TwoTruthsEditor content={content as TwoTruthsContent} onChange={onChange} />;
    case 'quiz-mix':
      return <QuizMixEditor content={content as QuizMixContent} onChange={onChange} />;
    case 'decision':
      return <DecisionEditor content={content as DecisionContent} onChange={onChange} />;
    case 'boss':
      return <BossEditor content={content as BossContent} onChange={onChange} />;
    default:
      return <GenericContentEditor content={content} onChange={onChange} />;
  }
}

// Two Truths Editor
function TwoTruthsEditor({
  content,
  onChange,
}: {
  content: TwoTruthsContent;
  onChange: (content: JourneyNodeContent) => void;
}) {
  const statements = content.statements || ['', '', ''];
  const lieIndex = content.lieIndex ?? 2;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Context (optional)</label>
        <textarea
          value={content.context || ''}
          onChange={(e) => onChange({ ...content, context: e.target.value })}
          placeholder="Background context shown before the game..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-3 block">
          Statements <span className="text-muted-foreground">(select which one is the lie)</span>
        </label>
        <div className="space-y-3">
          {statements.map((statement, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="lieIndex"
                checked={lieIndex === index}
                onChange={() => onChange({ ...content, lieIndex: index })}
                className="accent-red-500 w-4 h-4"
              />
              <input
                type="text"
                value={statement}
                onChange={(e) => {
                  const newStatements = [...statements];
                  newStatements[index] = e.target.value;
                  onChange({ ...content, statements: newStatements });
                }}
                placeholder={`Statement ${index + 1}`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
              />
              <span className={`text-xs font-medium px-2 py-1 rounded ${lieIndex === index ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                {lieIndex === index ? 'LIE' : 'TRUTH'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Explanation</label>
        <textarea
          value={content.explanation || ''}
          onChange={(e) => onChange({ ...content, explanation: e.target.value })}
          placeholder="Explain why the lie is false..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Host Reaction</label>
        <input
          type="text"
          value={content.hostReaction || ''}
          onChange={(e) => onChange({ ...content, hostReaction: e.target.value })}
          placeholder="What the host says after the answer..."
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
        />
      </div>
    </div>
  );
}

// Quiz Mix Editor (Multiple Questions)
function QuizMixEditor({
  content,
  onChange,
}: {
  content: QuizMixContent;
  onChange: (content: JourneyNodeContent) => void;
}) {
  const questions = content.questions || [];

  const addQuestion = () => {
    onChange({
      ...content,
      questions: [
        ...questions,
        {
          id: `q-${Date.now()}`,
          sessionId: '',
          type: 'multiple-choice',
          prompt: '',
          choices: ['', '', '', ''],
          answer: 0,
          explanation: '',
        },
      ],
    });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onChange({ ...content, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    onChange({ ...content, questions: questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Questions ({questions.length})
        </label>
        <button
          onClick={addQuestion}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <Plus size={14} />
          Add Question
        </button>
      </div>

      {questions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No questions yet. Click "Add Question" to get started.</p>
      ) : (
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <div key={qIndex} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Question {qIndex + 1}</span>
                <button
                  onClick={() => removeQuestion(qIndex)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <input
                type="text"
                value={question.prompt}
                onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
                placeholder="Question prompt"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
              />

              <div className="grid grid-cols-2 gap-2">
                {(question.choices || []).map((choice, cIndex) => (
                  <div key={cIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`answer-${qIndex}`}
                      checked={question.answer === cIndex}
                      onChange={() => updateQuestion(qIndex, { answer: cIndex })}
                      className="accent-primary"
                    />
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...(question.choices || [])];
                        newChoices[cIndex] = e.target.value;
                        updateQuestion(qIndex, { choices: newChoices });
                      }}
                      placeholder={`Option ${cIndex + 1}`}
                      className="flex-1 px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                    />
                  </div>
                ))}
              </div>

              <input
                type="text"
                value={question.explanation || ''}
                onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                placeholder="Explanation (shown after answer)"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Decision Editor
function DecisionEditor({
  content,
  onChange,
}: {
  content: DecisionContent;
  onChange: (content: JourneyNodeContent) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Scenario</label>
        <textarea
          value={content.scenario || ''}
          onChange={(e) => onChange({ ...content, scenario: e.target.value })}
          placeholder="Set the scene for the decision..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Context</label>
        <textarea
          value={content.context || ''}
          onChange={(e) => onChange({ ...content, context: e.target.value })}
          placeholder="Historical background..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3 p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Option A</span>
            {content.optionA?.isHistorical && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Historical</span>
            )}
          </div>
          <input
            type="text"
            value={content.optionA?.label || ''}
            onChange={(e) => onChange({ ...content, optionA: { ...content.optionA, label: e.target.value } })}
            placeholder="Choice label"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
          <textarea
            value={content.optionA?.outcome || ''}
            onChange={(e) => onChange({ ...content, optionA: { ...content.optionA, outcome: e.target.value } })}
            placeholder="What happens if chosen..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={content.optionA?.isHistorical || false}
              onChange={(e) => onChange({ ...content, optionA: { ...content.optionA, isHistorical: e.target.checked } })}
              className="accent-green-500"
            />
            Historical choice
          </label>
        </div>

        <div className="space-y-3 p-4 border border-border rounded-xl">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">Option B</span>
            {content.optionB?.isHistorical && (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Historical</span>
            )}
          </div>
          <input
            type="text"
            value={content.optionB?.label || ''}
            onChange={(e) => onChange({ ...content, optionB: { ...content.optionB, label: e.target.value } })}
            placeholder="Choice label"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
          <textarea
            value={content.optionB?.outcome || ''}
            onChange={(e) => onChange({ ...content, optionB: { ...content.optionB, outcome: e.target.value } })}
            placeholder="What happens if chosen..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={content.optionB?.isHistorical || false}
              onChange={(e) => onChange({ ...content, optionB: { ...content.optionB, isHistorical: e.target.checked } })}
              className="accent-green-500"
            />
            Historical choice
          </label>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Historical Outcome</label>
        <textarea
          value={content.historicalOutcome || ''}
          onChange={(e) => onChange({ ...content, historicalOutcome: e.target.value })}
          placeholder="What actually happened in history..."
          rows={2}
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Host Reaction</label>
        <input
          type="text"
          value={content.hostReaction || ''}
          onChange={(e) => onChange({ ...content, hostReaction: e.target.value })}
          placeholder="What the host says..."
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
        />
      </div>
    </div>
  );
}

// Boss Challenge Editor
function BossEditor({
  content,
  onChange,
}: {
  content: BossContent;
  onChange: (content: JourneyNodeContent) => void;
}) {
  const questions = content.questions || [];

  const addQuestion = () => {
    onChange({
      ...content,
      questions: [
        ...questions,
        {
          id: `q-${Date.now()}`,
          sessionId: '',
          type: 'multiple-choice',
          prompt: '',
          choices: ['', '', '', ''],
          answer: 0,
          explanation: '',
        },
      ],
    });
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onChange({ ...content, questions: newQuestions });
  };

  const removeQuestion = (index: number) => {
    onChange({ ...content, questions: questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Time Limit (seconds)</label>
          <input
            type="number"
            value={content.timeLimit || 60}
            onChange={(e) => onChange({ ...content, timeLimit: parseInt(e.target.value) || 60 })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">XP Multiplier</label>
          <input
            type="number"
            step="0.1"
            value={content.xpMultiplier || 1.5}
            onChange={(e) => onChange({ ...content, xpMultiplier: parseFloat(e.target.value) || 1.5 })}
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Host Intro</label>
        <input
          type="text"
          value={content.hostIntro || ''}
          onChange={(e) => onChange({ ...content, hostIntro: e.target.value })}
          placeholder="What the host says before the challenge..."
          className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Victory Message</label>
          <input
            type="text"
            value={content.hostVictory || ''}
            onChange={(e) => onChange({ ...content, hostVictory: e.target.value })}
            placeholder="Message on success..."
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Defeat Message</label>
          <input
            type="text"
            value={content.hostDefeat || ''}
            onChange={(e) => onChange({ ...content, hostDefeat: e.target.value })}
            placeholder="Message on failure..."
            className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-foreground">
            Questions ({questions.length})
          </label>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            <Plus size={14} />
            Add Question
          </button>
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No questions yet.</p>
        ) : (
          <div className="space-y-3">
            {questions.map((question, qIndex) => (
              <div key={qIndex} className="border border-border rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Q{qIndex + 1}</span>
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="p-1 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <input
                  type="text"
                  value={question.prompt}
                  onChange={(e) => updateQuestion(qIndex, { prompt: e.target.value })}
                  placeholder="Question"
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
                />

                <div className="grid grid-cols-2 gap-2">
                  {(question.choices || []).map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`boss-answer-${qIndex}`}
                        checked={question.answer === cIndex}
                        onChange={() => updateQuestion(qIndex, { answer: cIndex })}
                        className="accent-primary"
                      />
                      <input
                        type="text"
                        value={choice}
                        onChange={(e) => {
                          const newChoices = [...(question.choices || [])];
                          newChoices[cIndex] = e.target.value;
                          updateQuestion(qIndex, { choices: newChoices });
                        }}
                        placeholder={`Option ${cIndex + 1}`}
                        className="flex-1 px-2 py-1 rounded border border-border focus:border-primary outline-none text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Generic fallback editor for other node types
function GenericContentEditor({
  content,
  onChange,
}: {
  content: JourneyNodeContent;
  onChange: (content: JourneyNodeContent) => void;
}) {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(content, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    try {
      const parsed = JSON.parse(value);
      onChange(parsed);
      setError(null);
    } catch (e) {
      setError('Invalid JSON');
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Visual editor not available for this node type. Edit JSON directly:
      </p>
      <textarea
        value={jsonValue}
        onChange={(e) => handleJsonChange(e.target.value)}
        rows={12}
        className={`w-full px-4 py-3 rounded-xl bg-background border font-mono text-sm outline-none transition-colors resize-none ${
          error ? 'border-red-500' : 'border-border focus:border-primary'
        }`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Map, Layers, FileText, ArrowLeft, Save, Plus, Trash2, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { arcs as defaultArcs, getArcById, getChapterById, getNodeById } from '@/data/journeyData';
import { Arc, JourneyChapter, JourneyNode, JourneyNodeType } from '@/types';
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

  // Update parent state when local state changes
  useEffect(() => {
    onUpdate({ title, xpReward });
  }, [title, xpReward]);

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

      <div className="space-y-4">
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

        {/* Content Preview */}
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Content (JSON)</label>
          <pre className="w-full p-4 rounded-xl bg-muted border border-border text-xs text-muted-foreground overflow-auto max-h-64 font-mono">
            {JSON.stringify(node.content, null, 2)}
          </pre>
        </div>
      </div>
    </motion.div>
  );
}

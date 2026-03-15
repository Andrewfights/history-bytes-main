/**
 * BeatListView - View and manage beats within a journey
 * Supports drag-and-drop reordering, adding new beats, and editing
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Edit,
  Trash2,
  MoreVertical,
  Copy,
  Layers,
  Zap,
  Clock,
  Loader2,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { FirestoreJourney, FirestoreJourneyBeat } from '@/lib/firestore';
import { useJourneyBeats, useModuleTemplates } from '@/hooks/useJourneys';
import { ModuleTemplateSelector } from './ModuleTemplateSelector';
import { BeatEditorModal } from './BeatEditorModal';

interface BeatListViewProps {
  journey: FirestoreJourney;
  onBack: () => void;
  onJourneyUpdate: (journey: FirestoreJourney) => Promise<void>;
}

export function BeatListView({ journey, onBack, onJourneyUpdate }: BeatListViewProps) {
  const { beats, loading, createBeat, updateBeat, removeBeat, reorderBeats } = useJourneyBeats(journey.id);
  const { getTemplateById } = useModuleTemplates();

  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [editingBeat, setEditingBeat] = useState<FirestoreJourneyBeat | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Sort beats by number
  const sortedBeats = [...beats].sort((a, b) => a.number - b.number);

  const handleAddBeat = () => {
    setSelectedTemplateId(null);
    setShowTemplateSelector(true);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateSelector(false);
    // Create a new beat with this template
    setEditingBeat({
      id: `beat-${Date.now()}`,
      journeyId: journey.id,
      number: sortedBeats.length + 1,
      title: '',
      subtitle: '',
      templateId,
      icon: getTemplateById(templateId)?.icon || '📝',
      xpReward: 50,
      description: '',
      estimatedDuration: '5 min',
      config: getTemplateById(templateId)?.defaultConfig || {},
      mediaAssets: {},
      hostConfig: { mode: 'pip' },
    } as FirestoreJourneyBeat);
  };

  const handleSaveBeat = useCallback(async (beat: FirestoreJourneyBeat) => {
    const isNew = !beats.find(b => b.id === beat.id);

    if (isNew) {
      const success = await createBeat(beat);
      if (success) {
        // Update journey's beatIds
        await onJourneyUpdate({
          ...journey,
          beatIds: [...journey.beatIds, beat.id],
          totalXP: journey.totalXP + beat.xpReward,
        });
        toast.success('Beat created', { description: beat.title });
      } else {
        toast.error('Failed to create beat');
        return;
      }
    } else {
      const success = await updateBeat(beat);
      if (success) {
        toast.success('Beat updated', { description: beat.title });
      } else {
        toast.error('Failed to update beat');
        return;
      }
    }

    setEditingBeat(null);
    setSelectedTemplateId(null);
  }, [beats, createBeat, updateBeat, journey, onJourneyUpdate]);

  const handleDeleteBeat = useCallback(async (beatId: string) => {
    const beat = beats.find(b => b.id === beatId);
    if (!beat) return;

    if (!confirm(`Are you sure you want to delete "${beat.title}"?`)) return;

    const success = await removeBeat(beatId);
    if (success) {
      // Update journey's beatIds and XP
      await onJourneyUpdate({
        ...journey,
        beatIds: journey.beatIds.filter(id => id !== beatId),
        totalXP: Math.max(0, journey.totalXP - beat.xpReward),
      });
      toast.success('Beat deleted', { description: beat.title });
      setOpenMenuId(null);
    } else {
      toast.error('Failed to delete beat');
    }
  }, [beats, removeBeat, journey, onJourneyUpdate]);

  const handleDuplicateBeat = useCallback(async (beat: FirestoreJourneyBeat) => {
    const newBeat: FirestoreJourneyBeat = {
      ...beat,
      id: `${beat.id}-copy-${Date.now()}`,
      title: `${beat.title} (Copy)`,
      number: sortedBeats.length + 1,
    };

    const success = await createBeat(newBeat);
    if (success) {
      await onJourneyUpdate({
        ...journey,
        beatIds: [...journey.beatIds, newBeat.id],
        totalXP: journey.totalXP + newBeat.xpReward,
      });
      toast.success('Beat duplicated', { description: newBeat.title });
      setOpenMenuId(null);
    } else {
      toast.error('Failed to duplicate beat');
    }
  }, [sortedBeats, createBeat, journey, onJourneyUpdate]);

  const handleReorder = useCallback(async (newOrder: FirestoreJourneyBeat[]) => {
    setIsReordering(true);
    const beatIds = newOrder.map(b => b.id);
    const success = await reorderBeats(beatIds);

    if (success) {
      // Update journey's beatIds order
      await onJourneyUpdate({
        ...journey,
        beatIds,
      });
    }
    setIsReordering(false);
  }, [reorderBeats, journey, onJourneyUpdate]);

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft size={20} className="text-muted-foreground" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{journey.icon}</span>
            <h1 className="font-editorial text-2xl font-bold text-foreground">{journey.title}</h1>
          </div>
          <p className="text-muted-foreground mt-1">{journey.subtitle}</p>
        </div>
        <button
          onClick={handleAddBeat}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          Add Beat
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 mb-6 p-4 bg-card border border-border rounded-xl">
        <div className="flex items-center gap-2">
          <Layers size={18} className="text-muted-foreground" />
          <span className="text-foreground font-medium">{sortedBeats.length} beats</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-amber-400" />
          <span className="text-foreground font-medium">{journey.totalXP} XP total</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={18} className="text-muted-foreground" />
          <span className="text-foreground font-medium">{journey.estimatedDuration}</span>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedBeats.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Layers size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No beats yet</h3>
          <p className="text-muted-foreground mb-6">
            Add your first beat to start building this journey
          </p>
          <button
            onClick={handleAddBeat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
          >
            <Plus size={18} />
            Add First Beat
          </button>
        </div>
      )}

      {/* Beat List */}
      {!loading && sortedBeats.length > 0 && (
        <Reorder.Group
          axis="y"
          values={sortedBeats}
          onReorder={handleReorder}
          className="space-y-3"
        >
          <AnimatePresence mode="popLayout">
            {sortedBeats.map((beat) => (
              <BeatCard
                key={beat.id}
                beat={beat}
                template={getTemplateById(beat.templateId)}
                isMenuOpen={openMenuId === beat.id}
                isReordering={isReordering}
                onMenuToggle={() => setOpenMenuId(openMenuId === beat.id ? null : beat.id)}
                onEdit={() => {
                  setEditingBeat(beat);
                  setOpenMenuId(null);
                }}
                onDuplicate={() => handleDuplicateBeat(beat)}
                onDelete={() => handleDeleteBeat(beat.id)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <ModuleTemplateSelector
          onSelect={handleTemplateSelect}
          onClose={() => setShowTemplateSelector(false)}
        />
      )}

      {/* Beat Editor Modal */}
      {editingBeat && (
        <BeatEditorModal
          beat={editingBeat}
          template={getTemplateById(editingBeat.templateId)}
          onSave={handleSaveBeat}
          onClose={() => {
            setEditingBeat(null);
            setSelectedTemplateId(null);
          }}
          onChangeTemplate={() => {
            setShowTemplateSelector(true);
          }}
        />
      )}
    </div>
  );
}

// Beat Card Component
interface BeatCardProps {
  beat: FirestoreJourneyBeat;
  template?: { name: string; icon: string; category: string } | undefined;
  isMenuOpen: boolean;
  isReordering: boolean;
  onMenuToggle: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function BeatCard({
  beat,
  template,
  isMenuOpen,
  isReordering,
  onMenuToggle,
  onEdit,
  onDuplicate,
  onDelete,
}: BeatCardProps) {
  return (
    <Reorder.Item
      value={beat}
      className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-4">
        {/* Drag Handle */}
        <div className="text-muted-foreground">
          <GripVertical size={20} />
        </div>

        {/* Beat Number */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
          {beat.number}
        </div>

        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl shrink-0">
          {beat.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-semibold text-foreground truncate">
              {beat.title || 'Untitled Beat'}
            </h3>
            {template && (
              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium bg-primary/10 text-primary">
                {template.name}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">{beat.subtitle}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Zap size={12} />
              {beat.xpReward} XP
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {beat.estimatedDuration}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            disabled={isReordering}
          >
            <MoreVertical size={18} className="text-muted-foreground" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-40 bg-popover border border-border rounded-xl shadow-lg z-10 overflow-hidden"
              >
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={onDuplicate}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Copy size={16} />
                  Duplicate
                </button>
                <hr className="border-border" />
                <button
                  onClick={onDelete}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reorder.Item>
  );
}

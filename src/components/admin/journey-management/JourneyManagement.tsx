/**
 * JourneyManagement - Main admin page for managing all journeys
 * Lists all journeys with CRUD operations
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Eye,
  Archive,
  Loader2,
  Map,
  Layers,
  Clock,
  Zap,
  ChevronRight,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useJourneys } from '@/hooks/useJourneys';
import { FirestoreJourney, JourneyStatus } from '@/lib/firestore';
import { runAllMigrations } from '@/lib/journeyMigration';
import { JourneyEditorModal } from './JourneyEditorModal';
import { BeatListView } from './BeatListView';

// Status badge colors
const statusColors: Record<JourneyStatus, string> = {
  draft: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  published: 'bg-green-500/20 text-green-400 border-green-500/30',
  archived: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
};

const statusLabels: Record<JourneyStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
};

export default function JourneyManagement() {
  const { journeys, loading, error, createJourney, updateJourney, removeJourney, refresh } = useJourneys();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<JourneyStatus | 'all'>('all');
  const [showNewJourneyModal, setShowNewJourneyModal] = useState(false);
  const [editingJourney, setEditingJourney] = useState<FirestoreJourney | null>(null);
  const [selectedJourney, setSelectedJourney] = useState<FirestoreJourney | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);

  // Handle seed data migration
  const handleSeedData = useCallback(async () => {
    setIsMigrating(true);
    try {
      const success = await runAllMigrations();
      if (success) {
        toast.success('Sample journeys imported', {
          description: 'Pearl Harbor and Ghost Army journeys added with all beats',
        });
        // Force a page reload to pick up localStorage changes
        window.location.reload();
      } else {
        toast.error('Migration failed', {
          description: 'Check console for details',
        });
      }
    } catch (err) {
      console.error('Migration error:', err);
      toast.error('Migration failed');
    } finally {
      setIsMigrating(false);
    }
  }, []);

  // Filter journeys based on search and status
  const filteredJourneys = journeys.filter((journey) => {
    const matchesSearch =
      journey.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      journey.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || journey.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateJourney = useCallback(
    async (journey: Omit<FirestoreJourney, 'createdAt' | 'updatedAt'>) => {
      const success = await createJourney(journey);
      if (success) {
        toast.success('Journey created', { description: journey.title });
        setShowNewJourneyModal(false);
      } else {
        toast.error('Failed to create journey');
      }
    },
    [createJourney]
  );

  const handleUpdateJourney = useCallback(
    async (journey: FirestoreJourney) => {
      const success = await updateJourney(journey);
      if (success) {
        toast.success('Journey updated', { description: journey.title });
        setEditingJourney(null);
      } else {
        toast.error('Failed to update journey');
      }
    },
    [updateJourney]
  );

  const handleDeleteJourney = useCallback(
    async (journeyId: string) => {
      const journey = journeys.find((j) => j.id === journeyId);
      if (!journey) return;

      if (!confirm(`Are you sure you want to delete "${journey.title}"? This cannot be undone.`)) {
        return;
      }

      const success = await removeJourney(journeyId);
      if (success) {
        toast.success('Journey deleted', { description: journey.title });
        setOpenMenuId(null);
      } else {
        toast.error('Failed to delete journey');
      }
    },
    [journeys, removeJourney]
  );

  const handleDuplicateJourney = useCallback(
    async (journey: FirestoreJourney) => {
      const newJourney: Omit<FirestoreJourney, 'createdAt' | 'updatedAt'> = {
        ...journey,
        id: `${journey.id}-copy-${Date.now()}`,
        title: `${journey.title} (Copy)`,
        status: 'draft',
        beatIds: [], // Don't copy beats - user will add them
      };

      const success = await createJourney(newJourney);
      if (success) {
        toast.success('Journey duplicated', { description: newJourney.title });
        setOpenMenuId(null);
      } else {
        toast.error('Failed to duplicate journey');
      }
    },
    [createJourney]
  );

  const handleArchiveJourney = useCallback(
    async (journey: FirestoreJourney) => {
      const newStatus: JourneyStatus = journey.status === 'archived' ? 'draft' : 'archived';
      const success = await updateJourney({ ...journey, status: newStatus });
      if (success) {
        toast.success(newStatus === 'archived' ? 'Journey archived' : 'Journey restored', {
          description: journey.title,
        });
        setOpenMenuId(null);
      } else {
        toast.error('Failed to update journey status');
      }
    },
    [updateJourney]
  );

  // If a journey is selected, show the beat list view
  if (selectedJourney) {
    return (
      <BeatListView
        journey={selectedJourney}
        onBack={() => setSelectedJourney(null)}
        onJourneyUpdate={handleUpdateJourney}
      />
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-foreground">Journey Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage learning journeys like Pearl Harbor and Ghost Army
          </p>
        </div>
        <button
          onClick={() => setShowNewJourneyModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={18} />
          New Journey
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search journeys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {status === 'all' ? 'All' : statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredJourneys.length === 0 && (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Map size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No journeys found</h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first journey or import sample data'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setShowNewJourneyModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                <Plus size={18} />
                Create Journey
              </button>
              <button
                onClick={handleSeedData}
                disabled={isMigrating}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors disabled:opacity-50"
              >
                {isMigrating ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Download size={18} />
                )}
                Import Sample Data
              </button>
            </div>
          )}
        </div>
      )}

      {/* Journey List */}
      {!loading && !error && filteredJourneys.length > 0 && (
        <motion.div layout className="grid gap-4">
          <AnimatePresence mode="popLayout">
            {filteredJourneys.map((journey) => (
              <JourneyCard
                key={journey.id}
                journey={journey}
                isMenuOpen={openMenuId === journey.id}
                onMenuToggle={() => setOpenMenuId(openMenuId === journey.id ? null : journey.id)}
                onSelect={() => setSelectedJourney(journey)}
                onEdit={() => {
                  setEditingJourney(journey);
                  setOpenMenuId(null);
                }}
                onDuplicate={() => handleDuplicateJourney(journey)}
                onArchive={() => handleArchiveJourney(journey)}
                onDelete={() => handleDeleteJourney(journey.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* New Journey Modal */}
      {showNewJourneyModal && (
        <JourneyEditorModal
          onSave={handleCreateJourney}
          onClose={() => setShowNewJourneyModal(false)}
        />
      )}

      {/* Edit Journey Modal */}
      {editingJourney && (
        <JourneyEditorModal
          journey={editingJourney}
          onSave={handleUpdateJourney}
          onClose={() => setEditingJourney(null)}
        />
      )}
    </div>
  );
}

// Journey Card Component
interface JourneyCardProps {
  journey: FirestoreJourney;
  isMenuOpen: boolean;
  onMenuToggle: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function JourneyCard({
  journey,
  isMenuOpen,
  onMenuToggle,
  onSelect,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: JourneyCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors group"
    >
      <div className="flex items-start justify-between">
        <button onClick={onSelect} className="flex-1 text-left flex items-start gap-4">
          {/* Icon */}
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
            {journey.icon || '🎯'}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors truncate">
                {journey.title}
              </h3>
              <span
                className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium border ${statusColors[journey.status]}`}
              >
                {statusLabels[journey.status]}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{journey.description}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Layers size={14} />
                {journey.beatIds.length} beats
              </span>
              <span className="flex items-center gap-1">
                <Zap size={14} />
                {journey.totalXP} XP
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {journey.estimatedDuration}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <ChevronRight
            size={20}
            className="text-muted-foreground group-hover:text-primary transition-colors mt-2"
          />
        </button>

        {/* Actions Menu */}
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle();
            }}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <MoreVertical size={18} className="text-muted-foreground" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-xl shadow-lg z-10 overflow-hidden"
              >
                <button
                  onClick={onEdit}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Edit size={16} />
                  Edit Details
                </button>
                <button
                  onClick={onSelect}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Eye size={16} />
                  Manage Beats
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
                  onClick={onArchive}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Archive size={16} />
                  {journey.status === 'archived' ? 'Restore' : 'Archive'}
                </button>
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
    </motion.div>
  );
}

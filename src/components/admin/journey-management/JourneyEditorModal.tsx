/**
 * JourneyEditorModal - Modal for creating/editing journey metadata
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { FirestoreJourney, JourneyStatus } from '@/lib/firestore';

interface JourneyEditorModalProps {
  journey?: FirestoreJourney;
  onSave: (journey: FirestoreJourney | Omit<FirestoreJourney, 'createdAt' | 'updatedAt'>) => Promise<void>;
  onClose: () => void;
}

const statusOptions: { value: JourneyStatus; label: string; description: string }[] = [
  { value: 'draft', label: 'Draft', description: 'Not visible to users' },
  { value: 'published', label: 'Published', description: 'Visible to all users' },
  { value: 'archived', label: 'Archived', description: 'Hidden but preserved' },
];

// Common emojis for journey icons
const iconOptions = ['🎯', '⚔️', '🏛️', '🗺️', '👻', '⚓', '🚀', '🏰', '⭐', '🎖️', '📜', '🔥'];

export function JourneyEditorModal({ journey, onSave, onClose }: JourneyEditorModalProps) {
  const isEditing = !!journey;
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    id: journey?.id || '',
    title: journey?.title || '',
    subtitle: journey?.subtitle || '',
    description: journey?.description || '',
    icon: journey?.icon || '🎯',
    coverImage: journey?.coverImage || '',
    totalXP: journey?.totalXP || 0,
    estimatedDuration: journey?.estimatedDuration || '30 min',
    status: journey?.status || ('draft' as JourneyStatus),
    beatIds: journey?.beatIds || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.id.trim()) {
      newErrors.id = 'ID is required';
    } else if (!/^[a-z0-9-]+$/.test(formData.id)) {
      newErrors.id = 'ID must be lowercase letters, numbers, and hyphens only';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof typeof formData>(field: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when field is edited
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-generate ID from title for new journeys
  const handleTitleChange = (title: string) => {
    updateField('title', title);
    if (!isEditing && !formData.id) {
      const generatedId = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      updateField('id', generatedId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-editorial text-xl font-bold text-foreground">
            {isEditing ? 'Edit Journey' : 'New Journey'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Icon Selection */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Icon</label>
            <div className="flex flex-wrap gap-2">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => updateField('icon', icon)}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                    formData.icon === icon
                      ? 'bg-primary/20 ring-2 ring-primary'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* ID and Title */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Journey ID
                {!isEditing && <span className="text-muted-foreground"> (auto-generated)</span>}
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => updateField('id', e.target.value.toLowerCase())}
                disabled={isEditing}
                placeholder="pearl-harbor"
                className={`w-full px-4 py-3 rounded-xl bg-background border outline-none transition-colors ${
                  errors.id
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                } ${isEditing ? 'cursor-not-allowed opacity-60' : ''}`}
              />
              {errors.id && <p className="text-red-400 text-sm mt-1">{errors.id}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Pearl Harbor"
                className={`w-full px-4 py-3 rounded-xl bg-background border outline-none transition-colors ${
                  errors.title
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                }`}
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="December 7, 1941"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe what users will learn in this journey..."
              rows={3}
              className={`w-full px-4 py-3 rounded-xl bg-background border outline-none transition-colors resize-none ${
                errors.description
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
              }`}
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Cover Image */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">
              Cover Image URL <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              type="url"
              value={formData.coverImage}
              onChange={(e) => updateField('coverImage', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
            {formData.coverImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-border">
                <img
                  src={formData.coverImage}
                  alt="Cover preview"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Duration and XP */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Estimated Duration
              </label>
              <input
                type="text"
                value={formData.estimatedDuration}
                onChange={(e) => updateField('estimatedDuration', e.target.value)}
                placeholder="45 min"
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Total XP</label>
              <input
                type="number"
                value={formData.totalXP}
                onChange={(e) => updateField('totalXP', parseInt(e.target.value) || 0)}
                placeholder="500"
                min={0}
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Status</label>
            <div className="grid grid-cols-3 gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateField('status', option.value)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    formData.status === option.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <div className="font-medium text-foreground">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{option.description}</div>
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {isEditing ? 'Save Changes' : 'Create Journey'}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

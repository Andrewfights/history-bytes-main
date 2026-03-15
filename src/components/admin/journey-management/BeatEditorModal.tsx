/**
 * BeatEditorModal - Modal for editing beat metadata and configuration
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Save, Loader2, Settings, Image, Users, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { FirestoreJourneyBeat, FirestoreModuleTemplate, HostMode } from '@/lib/firestore';
import { TemplateConfigForm } from './forms/TemplateConfigForm';

interface BeatEditorModalProps {
  beat: FirestoreJourneyBeat;
  template?: FirestoreModuleTemplate;
  onSave: (beat: FirestoreJourneyBeat) => Promise<void>;
  onClose: () => void;
  onChangeTemplate: () => void;
}

// Common emojis for beat icons
const iconOptions = ['📜', '🎯', '⚔️', '🗺️', '📻', '🎖️', '⚓', '✈️', '🚢', '💣', '🏛️', '🎬'];

const hostModeOptions: { value: HostMode; label: string; description: string }[] = [
  { value: 'pip', label: 'Picture-in-Picture', description: 'Small avatar in corner' },
  { value: 'voice-only', label: 'Voice Only', description: 'Audio without visual' },
  { value: 'none', label: 'None', description: 'No host presence' },
];

export function BeatEditorModal({
  beat,
  template,
  onSave,
  onClose,
  onChangeTemplate,
}: BeatEditorModalProps) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'config' | 'media' | 'host'>('basic');

  // Form state
  const [formData, setFormData] = useState<FirestoreJourneyBeat>({ ...beat });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Collapsed sections
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    config: true,
    media: false,
    host: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const updateField = <K extends keyof FirestoreJourneyBeat>(
    field: K,
    value: FirestoreJourneyBeat[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const updateConfig = (config: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, config }));
  };

  const updateMediaAssets = (updates: Partial<FirestoreJourneyBeat['mediaAssets']>) => {
    setFormData((prev) => ({
      ...prev,
      mediaAssets: { ...prev.mediaAssets, ...updates },
    }));
  };

  const updateHostConfig = (updates: Partial<FirestoreJourneyBeat['hostConfig']>) => {
    setFormData((prev) => ({
      ...prev,
      hostConfig: { ...prev.hostConfig, ...updates },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{formData.icon}</span>
            <div>
              <h2 className="font-editorial text-xl font-bold text-foreground">
                {formData.title || 'New Beat'}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground">
                  Template: <span className="text-primary">{template?.name || 'Unknown'}</span>
                </span>
                <button
                  onClick={onChangeTemplate}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <RefreshCw size={12} />
                  Change
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Basic Info Section */}
          <Section
            title="Basic Info"
            icon={<Settings size={18} />}
            expanded={expandedSections.basic}
            onToggle={() => toggleSection('basic')}
          >
            {/* Icon Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-2 block">Icon</label>
              <div className="flex flex-wrap gap-2">
                {iconOptions.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => updateField('icon', icon)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all ${
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

            {/* Title and Subtitle */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Beat title"
                  className={`w-full px-4 py-2.5 rounded-xl bg-background border outline-none transition-colors ${
                    errors.title
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
                  }`}
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Subtitle</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => updateField('subtitle', e.target.value)}
                  placeholder="Short description"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="What will users learn in this beat?"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors resize-none"
              />
            </div>

            {/* XP and Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  XP Reward
                </label>
                <input
                  type="number"
                  value={formData.xpReward}
                  onChange={(e) => updateField('xpReward', parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Estimated Duration
                </label>
                <input
                  type="text"
                  value={formData.estimatedDuration}
                  onChange={(e) => updateField('estimatedDuration', e.target.value)}
                  placeholder="5 min"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>
          </Section>

          {/* Template Configuration Section */}
          <Section
            title="Template Configuration"
            icon={<Settings size={18} />}
            expanded={expandedSections.config}
            onToggle={() => toggleSection('config')}
          >
            {template ? (
              <TemplateConfigForm
                templateId={template.id}
                config={formData.config}
                schema={template.configSchema}
                onChange={updateConfig}
              />
            ) : (
              <p className="text-muted-foreground">No template selected</p>
            )}
          </Section>

          {/* Media Assets Section */}
          <Section
            title="Media Assets"
            icon={<Image size={18} />}
            expanded={expandedSections.media}
            onToggle={() => toggleSection('media')}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Background Image URL
                </label>
                <input
                  type="url"
                  value={formData.mediaAssets.backgroundImage || ''}
                  onChange={(e) => updateMediaAssets({ backgroundImage: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Video URL
                </label>
                <input
                  type="url"
                  value={formData.mediaAssets.videoUrl || ''}
                  onChange={(e) => updateMediaAssets({ videoUrl: e.target.value })}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Audio URL
                </label>
                <input
                  type="url"
                  value={formData.mediaAssets.audioUrl || ''}
                  onChange={(e) => updateMediaAssets({ audioUrl: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>
          </Section>

          {/* Host Configuration Section */}
          <Section
            title="Host Configuration"
            icon={<Users size={18} />}
            expanded={expandedSections.host}
            onToggle={() => toggleSection('host')}
          >
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Host Display Mode
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {hostModeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateHostConfig({ mode: option.value })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.hostConfig.mode === option.value
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className="font-medium text-sm text-foreground">{option.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {option.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Host ID (optional)
                </label>
                <input
                  type="text"
                  value={formData.hostConfig.hostId || ''}
                  onChange={(e) => updateHostConfig({ hostId: e.target.value })}
                  placeholder="e.g., rosie-riveter"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                />
              </div>
            </div>
          </Section>
        </div>

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
                Save Beat
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Collapsible Section Component
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon, expanded, onToggle, children }: SectionProps) {
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/50 hover:bg-muted transition-colors"
      >
        <div className="flex items-center gap-2 text-foreground font-medium">
          {icon}
          {title}
        </div>
        {expanded ? (
          <ChevronUp size={18} className="text-muted-foreground" />
        ) : (
          <ChevronDown size={18} className="text-muted-foreground" />
        )}
      </button>
      {expanded && <div className="p-4 border-t border-border">{children}</div>}
    </div>
  );
}

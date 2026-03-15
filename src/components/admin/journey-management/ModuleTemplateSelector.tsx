/**
 * ModuleTemplateSelector - Modal for selecting a module template when creating a beat
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronRight } from 'lucide-react';
import { useModuleTemplates } from '@/hooks/useJourneys';
import { ModuleCategory, FirestoreModuleTemplate } from '@/lib/firestore';

interface ModuleTemplateSelectorProps {
  onSelect: (templateId: string) => void;
  onClose: () => void;
}

const categoryLabels: Record<ModuleCategory, string> = {
  quiz: 'Quiz',
  interactive: 'Interactive',
  narrative: 'Narrative',
  challenge: 'Challenge',
  assessment: 'Assessment',
};

const categoryColors: Record<ModuleCategory, string> = {
  quiz: 'bg-green-500/20 text-green-400 border-green-500/30',
  interactive: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  narrative: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  challenge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  assessment: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export function ModuleTemplateSelector({ onSelect, onClose }: ModuleTemplateSelectorProps) {
  const { templates } = useModuleTemplates();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Group templates by category
  const groupedTemplates = filteredTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<ModuleCategory, FirestoreModuleTemplate[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-editorial text-xl font-bold text-foreground">
              Choose Module Template
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Select the type of interactive content for this beat
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-4 border-b border-border space-y-3">
          {/* Search */}
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {(Object.keys(categoryLabels) as ModuleCategory[]).map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          ) : selectedCategory === 'all' ? (
            // Show grouped by category
            <div className="space-y-8">
              {(Object.keys(groupedTemplates) as ModuleCategory[]).map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs ${categoryColors[category]}`}>
                      {categoryLabels[category]}
                    </span>
                    <span className="text-muted-foreground/50">
                      {groupedTemplates[category].length} templates
                    </span>
                  </h3>
                  <div className="grid gap-3">
                    {groupedTemplates[category].map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => onSelect(template.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Show flat list for single category
            <div className="grid gap-3">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={() => onSelect(template.id)}
                />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: FirestoreModuleTemplate;
  onSelect: () => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full bg-background border border-border rounded-xl p-4 hover:border-primary/50 transition-all text-left group"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
          {template.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {template.name}
            </h4>
            <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-medium border ${categoryColors[template.category]}`}>
              {categoryLabels[template.category]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{template.description}</p>
        </div>

        {/* Arrow */}
        <ChevronRight
          size={20}
          className="text-muted-foreground group-hover:text-primary transition-colors shrink-0"
        />
      </div>
    </button>
  );
}

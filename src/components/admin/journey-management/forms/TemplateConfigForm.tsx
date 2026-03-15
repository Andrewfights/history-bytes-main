/**
 * TemplateConfigForm - Dynamic form renderer for template-specific configuration
 * Renders appropriate form fields based on the template schema
 */

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

interface TemplateConfigFormProps {
  templateId: string;
  config: Record<string, unknown>;
  schema: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

export function TemplateConfigForm({
  templateId,
  config,
  schema,
  onChange,
}: TemplateConfigFormProps) {
  // Route to specific form based on template
  switch (templateId) {
    case 'timed-challenge':
      return <TimedChallengeForm config={config} onChange={onChange} />;
    case 'fact-or-myth':
      return <FactOrMythForm config={config} onChange={onChange} />;
    case 'drag-drop-order':
      return <DragDropOrderForm config={config} onChange={onChange} />;
    case 'drag-drop-categorize':
      return <DragDropCategorizeForm config={config} onChange={onChange} />;
    case 'interactive-map':
      return <InteractiveMapForm config={config} onChange={onChange} />;
    case 'branching-decision':
      return <BranchingDecisionForm config={config} onChange={onChange} />;
    case 'primary-source':
      return <PrimarySourceForm config={config} onChange={onChange} />;
    case 'tiered-exam':
      return <TieredExamForm config={config} onChange={onChange} />;
    case 'watch-narration':
      return <WatchNarrationForm config={config} onChange={onChange} />;
    case 'timeline-learn':
      return <TimelineLearnForm config={config} onChange={onChange} />;
    case 'artifact-detective':
      return <ArtifactDetectiveForm config={config} onChange={onChange} />;
    case 'tactical-boss':
      return <TacticalBossForm config={config} onChange={onChange} />;
    case 'video-trivia':
      return <VideoTriviaForm config={config} onChange={onChange} />;
    case 'resolution':
      return <ResolutionForm config={config} onChange={onChange} />;
    default:
      return <GenericConfigForm config={config} schema={schema} onChange={onChange} />;
  }
}

// ============ Shared Components ============

interface ArrayFieldProps<T> {
  label: string;
  items: T[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onReorder: (items: T[]) => void;
  renderItem: (item: T, index: number, onChange: (item: T) => void) => React.ReactNode;
  emptyText?: string;
}

function ArrayField<T>({
  label,
  items,
  onAdd,
  onRemove,
  onReorder,
  renderItem,
  emptyText = 'No items added yet',
}: ArrayFieldProps<T>) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <span className="font-medium text-foreground">
          {label} <span className="text-muted-foreground">({items.length})</span>
        </span>
        {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {expanded && (
        <div className="p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{emptyText}</p>
          ) : (
            <Reorder.Group
              axis="y"
              values={items}
              onReorder={onReorder}
              className="space-y-3"
            >
              {items.map((item, index) => (
                <Reorder.Item
                  key={index}
                  value={item}
                  className="bg-background border border-border rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <div className="mt-1 cursor-grab text-muted-foreground hover:text-foreground">
                      <GripVertical size={16} />
                    </div>
                    <div className="flex-1">
                      {renderItem(item, index, (updated) => {
                        const newItems = [...items];
                        newItems[index] = updated;
                        onReorder(newItems);
                      })}
                    </div>
                    <button
                      onClick={() => onRemove(index)}
                      className="p-1.5 rounded hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}

          <button
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      )}
    </div>
  );
}

// ============ Template-Specific Forms ============

// Timed Challenge Form
function TimedChallengeForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  const questions = (config.questions as Question[]) || [];
  const timeLimit = (config.timeLimit as number) || 30;
  const streakBonus = (config.streakBonus as number) || 10;

  interface Question {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
  }

  const addQuestion = () => {
    onChange({
      ...config,
      questions: [...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }],
    });
  };

  const updateQuestion = (index: number, question: Question) => {
    const updated = [...questions];
    updated[index] = question;
    onChange({ ...config, questions: updated });
  };

  const removeQuestion = (index: number) => {
    onChange({ ...config, questions: questions.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Time Limit (seconds)
          </label>
          <input
            type="number"
            value={timeLimit}
            onChange={(e) => onChange({ ...config, timeLimit: parseInt(e.target.value) || 30 })}
            min={5}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            Streak Bonus XP
          </label>
          <input
            type="number"
            value={streakBonus}
            onChange={(e) => onChange({ ...config, streakBonus: parseInt(e.target.value) || 10 })}
            min={0}
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      <ArrayField
        label="Questions"
        items={questions}
        onAdd={addQuestion}
        onRemove={removeQuestion}
        onReorder={(items) => onChange({ ...config, questions: items })}
        renderItem={(item, index, onItemChange) => (
          <div className="space-y-3">
            <input
              type="text"
              value={item.question}
              onChange={(e) => onItemChange({ ...item, question: e.target.value })}
              placeholder="Question text"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              {item.options.map((opt: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={item.correctIndex === optIndex}
                    onChange={() => onItemChange({ ...item, correctIndex: optIndex })}
                    className="accent-primary"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...item.options];
                      newOptions[optIndex] = e.target.value;
                      onItemChange({ ...item, options: newOptions });
                    }}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1 px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  );
}

// Fact or Myth Form
function FactOrMythForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  interface Statement {
    text: string;
    isTrue: boolean;
    explanation: string;
  }

  const statements = (config.statements as Statement[]) || [];

  return (
    <ArrayField
      label="Statements"
      items={statements}
      onAdd={() =>
        onChange({
          ...config,
          statements: [...statements, { text: '', isTrue: true, explanation: '' }],
        })
      }
      onRemove={(index) =>
        onChange({ ...config, statements: statements.filter((_, i) => i !== index) })
      }
      onReorder={(items) => onChange({ ...config, statements: items })}
      renderItem={(item, index, onItemChange) => (
        <div className="space-y-2">
          <input
            type="text"
            value={item.text}
            onChange={(e) => onItemChange({ ...item, text: e.target.value })}
            placeholder="Statement text"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`truth-${index}`}
                checked={item.isTrue}
                onChange={() => onItemChange({ ...item, isTrue: true })}
                className="accent-green-500"
              />
              <span className="text-green-400">Fact</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={`truth-${index}`}
                checked={!item.isTrue}
                onChange={() => onItemChange({ ...item, isTrue: false })}
                className="accent-red-500"
              />
              <span className="text-red-400">Myth</span>
            </label>
          </div>
          <input
            type="text"
            value={item.explanation}
            onChange={(e) => onItemChange({ ...item, explanation: e.target.value })}
            placeholder="Explanation (shown after answer)"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
        </div>
      )}
    />
  );
}

// Drag & Drop Order Form
function DragDropOrderForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  interface OrderItem {
    id: string;
    text: string;
    description?: string;
  }

  const items = (config.items as OrderItem[]) || [];
  const instructions = (config.instructions as string) || '';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Instructions</label>
        <input
          type="text"
          value={instructions}
          onChange={(e) => onChange({ ...config, instructions: e.target.value })}
          placeholder="e.g., Arrange these events in chronological order"
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
        />
      </div>

      <ArrayField
        label="Items (in correct order)"
        items={items}
        onAdd={() =>
          onChange({
            ...config,
            items: [...items, { id: `item-${Date.now()}`, text: '', description: '' }],
          })
        }
        onRemove={(index) =>
          onChange({ ...config, items: items.filter((_, i) => i !== index) })
        }
        onReorder={(newItems) => onChange({ ...config, items: newItems })}
        renderItem={(item, index, onItemChange) => (
          <div className="space-y-2">
            <input
              type="text"
              value={item.text}
              onChange={(e) => onItemChange({ ...item, text: e.target.value })}
              placeholder="Item text"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
            <input
              type="text"
              value={item.description || ''}
              onChange={(e) => onItemChange({ ...item, description: e.target.value })}
              placeholder="Description (optional)"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        )}
        emptyText="Add items in the correct order. They will be shuffled for the user."
      />
    </div>
  );
}

// Drag & Drop Categorize Form
function DragDropCategorizeForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  interface Category {
    id: string;
    name: string;
    items: string[];
  }

  const categories = (config.categories as Category[]) || [];

  return (
    <ArrayField
      label="Categories"
      items={categories}
      onAdd={() =>
        onChange({
          ...config,
          categories: [...categories, { id: `cat-${Date.now()}`, name: '', items: [] }],
        })
      }
      onRemove={(index) =>
        onChange({ ...config, categories: categories.filter((_, i) => i !== index) })
      }
      onReorder={(items) => onChange({ ...config, categories: items })}
      renderItem={(item, index, onItemChange) => (
        <div className="space-y-2">
          <input
            type="text"
            value={item.name}
            onChange={(e) => onItemChange({ ...item, name: e.target.value })}
            placeholder="Category name"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm font-medium"
          />
          <div className="pl-4 space-y-1">
            {item.items.map((text: string, itemIndex: number) => (
              <div key={itemIndex} className="flex items-center gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => {
                    const newItems = [...item.items];
                    newItems[itemIndex] = e.target.value;
                    onItemChange({ ...item, items: newItems });
                  }}
                  placeholder={`Item ${itemIndex + 1}`}
                  className="flex-1 px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                />
                <button
                  onClick={() => {
                    onItemChange({
                      ...item,
                      items: item.items.filter((_: string, i: number) => i !== itemIndex),
                    });
                  }}
                  className="p-1 text-muted-foreground hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => onItemChange({ ...item, items: [...item.items, ''] })}
              className="text-sm text-primary hover:underline"
            >
              + Add item to category
            </button>
          </div>
        </div>
      )}
    />
  );
}

// Interactive Map Form
function InteractiveMapForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  interface Hotspot {
    id: string;
    label: string;
    x: number;
    y: number;
    content: string;
  }

  const mapImage = (config.mapImage as string) || '';
  const hotspots = (config.hotspots as Hotspot[]) || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Map Image URL</label>
        <input
          type="url"
          value={mapImage}
          onChange={(e) => onChange({ ...config, mapImage: e.target.value })}
          placeholder="https://example.com/map.jpg"
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
        />
      </div>

      <ArrayField
        label="Hotspots"
        items={hotspots}
        onAdd={() =>
          onChange({
            ...config,
            hotspots: [
              ...hotspots,
              { id: `hotspot-${Date.now()}`, label: '', x: 50, y: 50, content: '' },
            ],
          })
        }
        onRemove={(index) =>
          onChange({ ...config, hotspots: hotspots.filter((_, i) => i !== index) })
        }
        onReorder={(items) => onChange({ ...config, hotspots: items })}
        renderItem={(item, index, onItemChange) => (
          <div className="space-y-2">
            <input
              type="text"
              value={item.label}
              onChange={(e) => onItemChange({ ...item, label: e.target.value })}
              placeholder="Hotspot label"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">X Position (%)</label>
                <input
                  type="number"
                  value={item.x}
                  onChange={(e) => onItemChange({ ...item, x: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Y Position (%)</label>
                <input
                  type="number"
                  value={item.y}
                  onChange={(e) => onItemChange({ ...item, y: parseInt(e.target.value) || 0 })}
                  min={0}
                  max={100}
                  className="w-full px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                />
              </div>
            </div>
            <textarea
              value={item.content}
              onChange={(e) => onItemChange({ ...item, content: e.target.value })}
              placeholder="Content shown when hotspot is clicked"
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
            />
          </div>
        )}
      />
    </div>
  );
}

// Branching Decision Form
function BranchingDecisionForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  interface Decision {
    id: string;
    prompt: string;
    choices: { text: string; outcome: string; isHistorical?: boolean }[];
  }

  const decisions = (config.decisions as Decision[]) || [];
  const scenario = (config.scenario as string) || '';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Scenario Context</label>
        <textarea
          value={scenario}
          onChange={(e) => onChange({ ...config, scenario: e.target.value })}
          placeholder="Set the scene for the decision..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <ArrayField
        label="Decision Points"
        items={decisions}
        onAdd={() =>
          onChange({
            ...config,
            decisions: [
              ...decisions,
              { id: `decision-${Date.now()}`, prompt: '', choices: [{ text: '', outcome: '' }] },
            ],
          })
        }
        onRemove={(index) =>
          onChange({ ...config, decisions: decisions.filter((_, i) => i !== index) })
        }
        onReorder={(items) => onChange({ ...config, decisions: items })}
        renderItem={(item, index, onItemChange) => (
          <div className="space-y-2">
            <input
              type="text"
              value={item.prompt}
              onChange={(e) => onItemChange({ ...item, prompt: e.target.value })}
              placeholder="Decision prompt"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
            <div className="pl-4 space-y-2">
              {item.choices.map((choice, choiceIndex) => (
                <div key={choiceIndex} className="p-2 rounded border border-border space-y-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => {
                        const newChoices = [...item.choices];
                        newChoices[choiceIndex] = { ...choice, text: e.target.value };
                        onItemChange({ ...item, choices: newChoices });
                      }}
                      placeholder="Choice text"
                      className="flex-1 px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                    />
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={choice.isHistorical}
                        onChange={(e) => {
                          const newChoices = [...item.choices];
                          newChoices[choiceIndex] = { ...choice, isHistorical: e.target.checked };
                          onItemChange({ ...item, choices: newChoices });
                        }}
                        className="accent-primary"
                      />
                      Historical
                    </label>
                    <button
                      onClick={() => {
                        onItemChange({
                          ...item,
                          choices: item.choices.filter((_, i) => i !== choiceIndex),
                        });
                      }}
                      className="p-1 text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={choice.outcome}
                    onChange={(e) => {
                      const newChoices = [...item.choices];
                      newChoices[choiceIndex] = { ...choice, outcome: e.target.value };
                      onItemChange({ ...item, choices: newChoices });
                    }}
                    placeholder="Outcome text"
                    className="w-full px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-xs"
                  />
                </div>
              ))}
              <button
                onClick={() =>
                  onItemChange({ ...item, choices: [...item.choices, { text: '', outcome: '' }] })
                }
                className="text-sm text-primary hover:underline"
              >
                + Add choice
              </button>
            </div>
          </div>
        )}
      />
    </div>
  );
}

// Primary Source Form
function PrimarySourceForm({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}) {
  interface Question {
    question: string;
    options: string[];
    correctIndex: number;
  }

  const sourceText = (config.sourceText as string) || '';
  const sourceTitle = (config.sourceTitle as string) || '';
  const sourceAuthor = (config.sourceAuthor as string) || '';
  const sourceDate = (config.sourceDate as string) || '';
  const context = (config.context as string) || '';
  const questions = (config.questions as Question[]) || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Source Title</label>
          <input
            type="text"
            value={sourceTitle}
            onChange={(e) => onChange({ ...config, sourceTitle: e.target.value })}
            placeholder="e.g., Day of Infamy Speech"
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-1.5 block">Author</label>
          <input
            type="text"
            value={sourceAuthor}
            onChange={(e) => onChange({ ...config, sourceAuthor: e.target.value })}
            placeholder="e.g., Franklin D. Roosevelt"
            className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Date</label>
        <input
          type="text"
          value={sourceDate}
          onChange={(e) => onChange({ ...config, sourceDate: e.target.value })}
          placeholder="e.g., December 8, 1941"
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">Source Text</label>
        <textarea
          value={sourceText}
          onChange={(e) => onChange({ ...config, sourceText: e.target.value })}
          placeholder="The primary source text..."
          rows={4}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none font-serif"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-1.5 block">
          Historical Context
        </label>
        <textarea
          value={context}
          onChange={(e) => onChange({ ...config, context: e.target.value })}
          placeholder="Background information..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-xl bg-background border border-border focus:border-primary outline-none resize-none"
        />
      </div>

      <ArrayField
        label="Analysis Questions"
        items={questions}
        onAdd={() =>
          onChange({
            ...config,
            questions: [...questions, { question: '', options: ['', '', '', ''], correctIndex: 0 }],
          })
        }
        onRemove={(index) =>
          onChange({ ...config, questions: questions.filter((_, i) => i !== index) })
        }
        onReorder={(items) => onChange({ ...config, questions: items })}
        renderItem={(item, index, onItemChange) => (
          <div className="space-y-2">
            <input
              type="text"
              value={item.question}
              onChange={(e) => onItemChange({ ...item, question: e.target.value })}
              placeholder="Question"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
            <div className="grid grid-cols-2 gap-2">
              {item.options.map((opt: string, optIndex: number) => (
                <div key={optIndex} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${index}`}
                    checked={item.correctIndex === optIndex}
                    onChange={() => onItemChange({ ...item, correctIndex: optIndex })}
                    className="accent-primary"
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...item.options];
                      newOptions[optIndex] = e.target.value;
                      onItemChange({ ...item, options: newOptions });
                    }}
                    placeholder={`Option ${optIndex + 1}`}
                    className="flex-1 px-2 py-1.5 rounded border border-border focus:border-primary outline-none text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      />
    </div>
  );
}

// Simplified forms for remaining templates

function TieredExamForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Tiered exam configuration - add questions across difficulty tiers" />;
}

function WatchNarrationForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Watch & narration configuration - add narration segments and quotes" />;
}

function TimelineLearnForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Timeline configuration - add events to arrange chronologically" />;
}

function ArtifactDetectiveForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Artifact detective configuration - add artifacts with clues" />;
}

function TacticalBossForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Tactical boss configuration - set up strategy game elements" />;
}

function VideoTriviaForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Video trivia configuration - add video URLs and timed questions" />;
}

function ResolutionForm({ config, onChange }: { config: Record<string, unknown>; onChange: (config: Record<string, unknown>) => void }) {
  return <GenericConfigForm config={config} schema={{}} onChange={onChange} placeholder="Resolution configuration - add concluding narration and stats" />;
}

// Generic fallback form
function GenericConfigForm({
  config,
  schema,
  onChange,
  placeholder,
}: {
  config: Record<string, unknown>;
  schema: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  placeholder?: string;
}) {
  const [jsonValue, setJsonValue] = useState(JSON.stringify(config, null, 2));
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
      {placeholder && (
        <p className="text-sm text-muted-foreground mb-3">{placeholder}</p>
      )}
      <label className="text-sm font-medium text-foreground mb-1.5 block">
        Configuration (JSON)
      </label>
      <textarea
        value={jsonValue}
        onChange={(e) => handleJsonChange(e.target.value)}
        rows={10}
        className={`w-full px-4 py-3 rounded-xl bg-background border font-mono text-sm outline-none transition-colors resize-none ${
          error ? 'border-red-500' : 'border-border focus:border-primary'
        }`}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}

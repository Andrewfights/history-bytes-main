/**
 * FeaturedSectionEditor - Admin component for managing the Featured Section on Home page
 * Allows configuring what content to display: era cards, carousels, videos, promos, news
 */

import { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import {
  Plus, Trash2, GripVertical, Image, Video, Megaphone, Newspaper,
  Map, Layers, Save, Loader2, Cloud, CloudOff, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getJourneyUIAssets,
  saveJourneyUIAssets,
  subscribeToJourneyUIAssets,
  type FirestoreJourneyUIAssets,
  type FeaturedSectionItem,
} from '@/lib/firestore';
import { MediaPicker } from './MediaPicker';
import { HISTORICAL_ERAS } from '@/data/historicalEras';

const CONTENT_TYPES = [
  { id: 'era', label: 'Era Journey', icon: Map, description: 'Feature a historical era journey' },
  { id: 'carousel', label: 'Carousel', icon: Layers, description: 'Multiple items in a carousel' },
  { id: 'video', label: 'Video', icon: Video, description: 'Featured video content' },
  { id: 'promo', label: 'Promotion', icon: Megaphone, description: 'Promotional banner' },
  { id: 'news', label: 'News', icon: Newspaper, description: 'News or announcement' },
] as const;

function generateId() {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export default function FeaturedSectionEditor() {
  const [assets, setAssets] = useState<FirestoreJourneyUIAssets | null>(null);
  const [items, setItems] = useState<FeaturedSectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState<string | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const isSyncedToCloud = isFirebaseConfigured();

  // Load from Firebase
  useEffect(() => {
    if (!isFirebaseConfigured()) {
      // Default items for local mode
      setItems([
        {
          id: 'default-ww2',
          type: 'era',
          eraId: 'ww2',
          title: 'World War II',
          subtitle: 'The conflict that shaped the modern world',
          imageUrl: '/assets/ww2-battles/d-day.png',
          isActive: true,
          order: 0,
        }
      ]);
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToJourneyUIAssets((data) => {
      setAssets(data);
      if (data?.featuredSection?.items) {
        setItems(data.featuredSection.items.sort((a, b) => a.order - b.order));
      } else {
        // Default WW2 item
        setItems([
          {
            id: 'default-ww2',
            type: 'era',
            eraId: 'ww2',
            title: 'World War II',
            subtitle: 'The conflict that shaped the modern world',
            imageUrl: '/assets/ww2-battles/d-day.png',
            isActive: true,
            order: 0,
          }
        ]);
      }
      setIsLoading(false);
      setHasChanges(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!isFirebaseConfigured()) {
      toast.error('Firebase not configured');
      return;
    }

    setIsSaving(true);
    try {
      // Update order based on array position
      const orderedItems = items.map((item, index) => ({
        ...item,
        order: index,
      }));

      await saveJourneyUIAssets({
        ...assets,
        featuredSection: {
          items: orderedItems,
        },
      });
      toast.success('Featured section saved!');
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (type: FeaturedSectionItem['type']) => {
    const newItem: FeaturedSectionItem = {
      id: generateId(),
      type,
      title: type === 'era' ? 'New Era Feature' : `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      subtitle: 'Add a description',
      isActive: false,
      order: items.length,
    };

    if (type === 'era') {
      newItem.eraId = 'ww2';
    }

    setItems([...items, newItem]);
    setExpandedItem(newItem.id);
    setHasChanges(true);
  };

  const updateItem = (id: string, updates: Partial<FeaturedSectionItem>) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
    setHasChanges(true);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    setHasChanges(true);
  };

  const handleReorder = (newOrder: FeaturedSectionItem[]) => {
    setItems(newOrder);
    setHasChanges(true);
  };

  const handleMediaSelect = (itemId: string, url: string) => {
    updateItem(itemId, { imageUrl: url });
    setMediaPickerOpen(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Featured Section</h2>
          <p className="text-sm text-muted-foreground">
            Manage the featured content on the Home page
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isSyncedToCloud ? (
            <span className="flex items-center gap-1.5 text-xs text-green-500">
              <Cloud size={14} /> Synced to Cloud
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs text-amber-500">
              <CloudOff size={14} /> Local Only
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>
      </div>

      {/* Add New Item */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-sm font-medium text-foreground mb-3">Add New Item</h3>
        <div className="flex flex-wrap gap-2">
          {CONTENT_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => addItem(type.id as FeaturedSectionItem['type'])}
              className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
            >
              <type.icon size={16} />
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-foreground">Featured Items ({items.length})</h3>

        {items.length === 0 ? (
          <div className="bg-card rounded-xl border border-dashed border-border p-8 text-center">
            <p className="text-muted-foreground">No items yet. Add one above.</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={items}
            onReorder={handleReorder}
            className="space-y-2"
          >
            {items.map((item) => (
              <Reorder.Item
                key={item.id}
                value={item}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Drag Handle */}
                  <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                    <GripVertical size={20} />
                  </div>

                  {/* Preview Image */}
                  <div className="w-16 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Image size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 bg-muted rounded-full capitalize">
                        {item.type}
                      </span>
                      {item.eraId && (
                        <span className="text-xs text-muted-foreground">
                          {HISTORICAL_ERAS.find(e => e.id === item.eraId)?.name}
                        </span>
                      )}
                    </div>
                    <h4 className="font-medium text-foreground truncate">{item.title}</h4>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateItem(item.id, { isActive: !item.isActive })}
                      className={`p-2 rounded-lg transition-colors ${
                        item.isActive
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-muted text-muted-foreground hover:text-foreground'
                      }`}
                      title={item.isActive ? 'Active' : 'Inactive'}
                    >
                      {item.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                      className="p-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Panel */}
                {expandedItem === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border p-4 bg-muted/30"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* Title */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={item.title || ''}
                          onChange={(e) => updateItem(item.id, { title: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Enter title"
                        />
                      </div>

                      {/* Subtitle */}
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={item.subtitle || ''}
                          onChange={(e) => updateItem(item.id, { subtitle: e.target.value })}
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          placeholder="Enter subtitle"
                        />
                      </div>

                      {/* Era Selector (for era type) */}
                      {item.type === 'era' && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Era
                          </label>
                          <select
                            value={item.eraId || ''}
                            onChange={(e) => {
                              const era = HISTORICAL_ERAS.find(e2 => e2.id === e.target.value);
                              updateItem(item.id, {
                                eraId: e.target.value,
                                title: era?.name,
                                subtitle: era?.subtitle,
                              });
                            }}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                          >
                            {HISTORICAL_ERAS.map((era) => (
                              <option key={era.id} value={era.id}>
                                {era.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Video URL (for video type) */}
                      {item.type === 'video' && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Video URL
                          </label>
                          <input
                            type="text"
                            value={item.videoUrl || ''}
                            onChange={(e) => updateItem(item.id, { videoUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      )}

                      {/* Link URL (for promo/news type) */}
                      {(item.type === 'promo' || item.type === 'news') && (
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Link URL
                          </label>
                          <input
                            type="text"
                            value={item.linkUrl || ''}
                            onChange={(e) => updateItem(item.id, { linkUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm"
                            placeholder="https://..."
                          />
                        </div>
                      )}

                      {/* Image */}
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          Background Image
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Image size={24} />
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setMediaPickerOpen(item.id)}
                            className="px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
                          >
                            Choose Image
                          </button>
                          {item.imageUrl && (
                            <button
                              onClick={() => updateItem(item.id, { imageUrl: undefined })}
                              className="px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPicker
          isOpen={true}
          onClose={() => setMediaPickerOpen(null)}
          onSelect={(url) => handleMediaSelect(mediaPickerOpen, url)}
          title="Select Background Image"
        />
      )}
    </div>
  );
}

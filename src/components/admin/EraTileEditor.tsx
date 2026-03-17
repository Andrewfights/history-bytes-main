/**
 * EraTileEditor - Admin component for managing era tile images and ordering
 * Allows uploading custom images, reordering eras, or resetting to defaults
 */

import { useState, useRef, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Image, Upload, RotateCcw, Loader2, CloudOff, Cloud, GripVertical, Save, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateImage, base64ToDataUrl, isGeminiConfigured, buildHistoricalPrompt } from '@/lib/gemini';
import {
  getAllEras,
  getEraImageUrl,
  saveEraTileOverride,
  resetEraTileToDefault,
  getEraTileOverrides,
  getEraTileOverridesAsync,
  initEraTileOverridesCache,
  HistoricalEra,
  getStoredEraOrder,
  saveStoredEraOrder,
} from '@/data/historicalEras';
import { uploadFile, listFiles } from '@/lib/supabase';
import { uploadToFirebaseStorage } from '@/lib/firebaseStorage';
import { MediaPicker } from './MediaPicker';
import type { MediaFile } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase';

type EditableEra = HistoricalEra & { displayOrder: number };

export default function EraTileEditor() {
  const [eras, setEras] = useState<EditableEra[]>([]);
  const [selectedEraId, setSelectedEraId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState(getEraTileOverrides());
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);
  const [hasOrderChanges, setHasOrderChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize cache from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await initEraTileOverridesCache();
        const freshOverrides = await getEraTileOverridesAsync();
        setOverrides(freshOverrides);
        setIsSyncedToCloud(isFirebaseConfigured());

        // Load eras with stored order
        const storedOrder = await getStoredEraOrder();
        const allEras = getAllEras();

        let orderedEras: EditableEra[];
        if (storedOrder && storedOrder.length > 0) {
          // Sort eras by stored order
          const orderMap = new Map(storedOrder.map((id, idx) => [id, idx]));
          orderedEras = allEras
            .map(era => ({
              ...era,
              displayOrder: orderMap.has(era.id) ? orderMap.get(era.id)! : 999,
            }))
            .sort((a, b) => a.displayOrder - b.displayOrder);
        } else {
          // Use default order
          orderedEras = allEras.map((era, idx) => ({
            ...era,
            displayOrder: idx,
          }));
        }
        setEras(orderedEras);
      } catch (error) {
        console.error('Failed to load era data:', error);
        // Fall back to default eras
        setEras(getAllEras().map((era, idx) => ({ ...era, displayOrder: idx })));
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const selectedEra = eras.find(e => e.id === selectedEraId);

  const handleReorder = (newOrder: EditableEra[]) => {
    setEras(newOrder.map((era, idx) => ({ ...era, displayOrder: idx })));
    setHasOrderChanges(true);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const order = eras.map(e => e.id);
      await saveStoredEraOrder(order);
      setHasOrderChanges(false);
      toast.success('Era order saved', {
        description: isSyncedToCloud ? 'Order synced to cloud' : 'Order saved locally',
      });
    } catch (error) {
      console.error('Failed to save era order:', error);
      toast.error('Failed to save order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEraId) return;

    setIsUploading(true);
    toast.loading('Uploading image...', { id: 'upload' });

    try {
      let uploadUrl: string | null = null;

      // Try Firebase Storage first (for cloud sync)
      if (isFirebaseConfigured()) {
        try {
          uploadUrl = await uploadToFirebaseStorage(file, 'images');
          console.log('[EraTileEditor] Uploaded to Firebase Storage:', uploadUrl);
        } catch (firebaseError) {
          console.warn('[EraTileEditor] Firebase Storage failed:', firebaseError);
        }
      }

      // Fall back to the general uploadFile (which may use localStorage)
      if (!uploadUrl) {
        const uploadResult = await uploadFile(file);
        uploadUrl = uploadResult?.url || null;
      }

      if (uploadUrl) {
        saveEraTileOverride(selectedEraId, uploadUrl);
        setOverrides(getEraTileOverrides());
        toast.success('Image uploaded and saved', {
          id: 'upload',
          description: uploadUrl.startsWith('http') ? 'Saved to cloud' : 'Saved locally'
        });
      } else {
        // Last resort: data URL (won't be in media library but will work for this era)
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          saveEraTileOverride(selectedEraId, dataUrl);
          setOverrides(getEraTileOverrides());
          toast.success('Image saved locally', {
            id: 'upload',
            description: 'Note: This image won\'t appear in the media library'
          });
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image', { id: 'upload' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleMediaSelect = (file: MediaFile) => {
    if (!selectedEraId) return;
    saveEraTileOverride(selectedEraId, file.url);
    setOverrides(getEraTileOverrides());
    setMediaPickerOpen(false);
    toast.success('Era tile image updated');
  };

  const handleReset = (eraId: string) => {
    resetEraTileToDefault(eraId);
    setOverrides(getEraTileOverrides());
    toast.success('Reset to default image');
  };

  const handleGenerateImage = async () => {
    if (!selectedEraId) return;
    const era = eras.find(e => e.id === selectedEraId);
    if (!era) return;

    setIsGenerating(true);
    toast.info('Generating era tile image...', { description: 'This may take a moment' });

    try {
      // Build a historical prompt for the era
      const prompt = buildHistoricalPrompt(
        era.name,
        `${era.dateRange} - ${era.subtitle}`,
        `Key events and scenes from ${era.name}. Show iconic imagery representing this historical period.`
      );

      const result = await generateImage({
        prompt,
        aspectRatio: '3:4', // Era tiles are portrait orientation
        style: 'cinematic'
      });

      if (result) {
        const dataUrl = base64ToDataUrl(result.base64Data, result.mimeType);

        // Try to upload to cloud storage
        try {
          // Convert base64 to blob for upload
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], `era-${selectedEraId}-ai.png`, { type: result.mimeType });

          const uploadResult = await uploadFile(file);

          if (uploadResult?.url) {
            saveEraTileOverride(selectedEraId, uploadResult.url);
            setOverrides(getEraTileOverrides());
            toast.success('AI image generated and uploaded!');
          } else {
            // Fall back to data URL
            saveEraTileOverride(selectedEraId, dataUrl);
            setOverrides(getEraTileOverrides());
            toast.success('AI image generated!', { description: 'Saved locally' });
          }
        } catch (uploadError) {
          console.error('Upload error, using data URL:', uploadError);
          saveEraTileOverride(selectedEraId, dataUrl);
          setOverrides(getEraTileOverrides());
          toast.success('AI image generated!', { description: 'Saved locally' });
        }
      } else {
        toast.error('Failed to generate image', { description: 'Check your Gemini API key in settings' });
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const hasCustomImage = (eraId: string) => {
    return !!overrides[eraId]?.imageUrl;
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl flex items-center justify-center py-12">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span className="text-muted-foreground">Loading eras...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-foreground">Era Tile Editor</h1>
            {/* Cloud sync status */}
            <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              isSyncedToCloud
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {isSyncedToCloud ? <Cloud size={12} /> : <CloudOff size={12} />}
              {isSyncedToCloud ? 'Cloud Sync' : 'Local Only'}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Drag to reorder, click to edit images
          </p>
        </div>
        {hasOrderChanges && (
          <button
            onClick={handleSaveOrder}
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Order
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-foreground mb-2">How to use</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>1. <strong>Drag</strong> era tiles to reorder them (use the grip handle)</li>
          <li>2. <strong>Click</strong> on an era tile to select and edit its image</li>
          <li>3. Upload a new image or select from the media library</li>
          <li>4. Use the reset button to restore the default image</li>
        </ul>
      </div>

      {/* Era Grid - Reorderable */}
      <Reorder.Group
        axis="x"
        values={eras}
        onReorder={handleReorder}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8"
      >
        {eras.map((era, index) => {
          const imageUrl = getEraImageUrl(era.id);
          const isSelected = selectedEraId === era.id;
          const hasCustom = hasCustomImage(era.id);

          return (
            <Reorder.Item
              key={era.id}
              value={era}
              className="relative"
            >
              <div
                onClick={() => setSelectedEraId(era.id)}
                className={`
                  relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer
                  ${isSelected
                    ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                    : 'border-border hover:border-primary/50'
                  }
                `}
              >
                {/* Drag handle */}
                <div className="absolute top-2 left-2 z-10 p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing">
                  <GripVertical size={14} className="text-white" />
                </div>

                {/* Order number */}
                <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{index + 1}</span>
                </div>

                {/* Image or gradient fallback */}
                <EraImage src={imageUrl} alt={era.name} accentColor={era.accentColor} />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Custom badge */}
                {hasCustom && (
                  <div className="absolute top-9 right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    Custom
                  </div>
                )}

                {/* Availability badge */}
                {!era.isAvailable && (
                  <div className="absolute top-9 left-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
                    Coming Soon
                  </div>
                )}

                {/* Era name */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="font-semibold text-white text-sm leading-tight">
                    {era.name}
                  </h3>
                  <p className="text-white/60 text-[10px] mt-0.5">{era.dateRange}</p>
                </div>

                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute inset-0 border-4 border-primary rounded-xl pointer-events-none" />
                )}
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

      {/* Editor Panel */}
      {selectedEra && (
        <motion.div
          key={selectedEra.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedEra.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedEra.dateRange}</p>
            </div>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: selectedEra.accentColor }}
            />
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Preview */}
              <div>
                <label className="text-sm font-medium text-foreground mb-3 block">
                  Current Image
                </label>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted">
                  <EraImage
                    src={getEraImageUrl(selectedEra.id)}
                    alt={selectedEra.name}
                    accentColor={selectedEra.accentColor}
                  />
                </div>
                {hasCustomImage(selectedEra.id) && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Using custom image. Default: {selectedEra.defaultImageUrl}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-3 block">
                    Update Image
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="space-y-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                    >
                      {isUploading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Upload size={18} />
                      )}
                      Upload from Computer
                    </button>

                    <button
                      onClick={() => setMediaPickerOpen(true)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Image size={18} />
                      Select from Media Library
                    </button>

                    <button
                      onClick={handleGenerateImage}
                      disabled={isGenerating || !isGeminiConfigured()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Wand2 size={18} />
                      )}
                      {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>

                    {hasCustomImage(selectedEra.id) && (
                      <button
                        onClick={() => handleReset(selectedEra.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border hover:bg-muted transition-colors"
                      >
                        <RotateCcw size={18} />
                        Reset to Default
                      </button>
                    )}
                  </div>
                </div>

                {/* Era Info */}
                <div className="pt-4 border-t border-border">
                  <h4 className="text-sm font-medium text-foreground mb-2">Era Details</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className={selectedEra.isAvailable ? 'text-green-500' : 'text-amber-500'}>
                        {selectedEra.isAvailable ? 'Available' : 'Coming Soon'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Subtitle</dt>
                      <dd className="text-foreground text-right max-w-[200px] truncate">
                        {selectedEra.subtitle}
                      </dd>
                    </div>
                    {selectedEra.lessonCount && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Lessons</dt>
                        <dd className="text-foreground">{selectedEra.lessonCount}</dd>
                      </div>
                    )}
                    {selectedEra.xpReward && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">XP Reward</dt>
                        <dd className="text-amber-400">{selectedEra.xpReward} XP</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {!selectedEra && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Image size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Select an era tile to edit its image</p>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        allowedTypes={['image']}
        title="Select Era Tile Image"
      />
    </div>
  );
}

// Era Image component with fallback
function EraImage({
  src,
  alt,
  accentColor,
}: {
  src: string;
  alt: string;
  accentColor: string;
}) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div
        className="w-full h-full"
        style={{
          background: `linear-gradient(135deg, ${accentColor}60 0%, ${accentColor}20 100%)`,
        }}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setError(true)}
    />
  );
}

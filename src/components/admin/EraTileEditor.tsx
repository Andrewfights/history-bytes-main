/**
 * EraTileEditor - Admin component for managing era tile images
 * Allows uploading custom images or resetting to defaults
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image, Upload, RotateCcw, Check, Loader2, CloudOff, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllEras,
  getEraImageUrl,
  saveEraTileOverride,
  resetEraTileToDefault,
  getEraTileOverrides,
  getEraTileOverridesAsync,
  initEraTileOverridesCache,
  HistoricalEra,
} from '@/data/historicalEras';
import { uploadFile } from '@/lib/supabase';
import { MediaPicker } from './MediaPicker';
import type { MediaFile } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase';

export default function EraTileEditor() {
  const [eras] = useState<HistoricalEra[]>(getAllEras());
  const [selectedEraId, setSelectedEraId] = useState<string | null>(null);
  const [overrides, setOverrides] = useState(getEraTileOverrides());
  const [isUploading, setIsUploading] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize cache from Firestore on mount
  useEffect(() => {
    const loadOverrides = async () => {
      try {
        await initEraTileOverridesCache();
        const freshOverrides = await getEraTileOverridesAsync();
        setOverrides(freshOverrides);
        setIsSyncedToCloud(isFirebaseConfigured());
      } catch (error) {
        console.error('Failed to load era overrides:', error);
      }
    };
    loadOverrides();
  }, []);

  const selectedEra = eras.find(e => e.id === selectedEraId);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEraId) return;

    setIsUploading(true);
    toast.loading('Uploading image...', { id: 'upload' });

    try {
      const uploadResult = await uploadFile(file);

      if (uploadResult?.url) {
        saveEraTileOverride(selectedEraId, uploadResult.url);
        setOverrides(getEraTileOverrides());
        toast.success('Image uploaded and saved', { id: 'upload' });
      } else {
        // Fall back to data URL for local storage
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target?.result as string;
          saveEraTileOverride(selectedEraId, dataUrl);
          setOverrides(getEraTileOverrides());
          toast.success('Image saved locally', { id: 'upload' });
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

  const hasCustomImage = (eraId: string) => {
    return !!overrides[eraId]?.imageUrl;
  };

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-foreground">Era Tile Editor</h1>
          <p className="text-muted-foreground mt-1">
            Customize the images displayed for each historical era on the home page
          </p>
        </div>
        {/* Cloud sync status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
          isSyncedToCloud
            ? 'bg-green-500/10 text-green-500'
            : 'bg-amber-500/10 text-amber-500'
        }`}>
          {isSyncedToCloud ? (
            <>
              <Cloud size={14} />
              Synced to Cloud
            </>
          ) : (
            <>
              <CloudOff size={14} />
              Local Only
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6">
        <h3 className="font-medium text-foreground mb-2">How to use</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>1. Click on an era tile to select it</li>
          <li>2. Upload a new image or select from the media library</li>
          <li>3. Use the reset button to restore the default image</li>
          <li>4. Changes are saved automatically</li>
        </ul>
      </div>

      {/* Era Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
        {eras.map((era) => {
          const imageUrl = getEraImageUrl(era.id);
          const isSelected = selectedEraId === era.id;
          const hasCustom = hasCustomImage(era.id);

          return (
            <motion.button
              key={era.id}
              onClick={() => setSelectedEraId(era.id)}
              className={`
                relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all
                ${isSelected
                  ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                  : 'border-border hover:border-primary/50'
                }
              `}
              whileHover={{ scale: isSelected ? 1.02 : 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Image or gradient fallback */}
              <EraImage src={imageUrl} alt={era.name} accentColor={era.accentColor} />

              {/* Dark gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

              {/* Custom badge */}
              {hasCustom && (
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  Custom
                </div>
              )}

              {/* Availability badge */}
              {!era.isAvailable && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px]">
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
            </motion.button>
          );
        })}
      </div>

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

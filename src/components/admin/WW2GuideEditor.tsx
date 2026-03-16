import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Shield, Save, Upload, Loader2, ImageIcon, GripVertical, Video, Play, Trash2, Plus, X, Cloud, CloudOff } from 'lucide-react';
import { toast } from 'sonner';
import { WW2_HOSTS } from '@/data/ww2Hosts';
import { MediaPicker } from './MediaPicker';
import { uploadFile, type MediaFile, isFirebaseConfigured } from '@/lib/supabase';
import { saveAllWW2Hosts, getWW2Hosts, type FirestoreWW2Host } from '@/lib/firestore';
import type { WW2Host } from '@/types';

type EditableWW2Host = WW2Host & { localImageUrl?: string; displayOrder?: number };

const STORAGE_KEY = 'hb-ww2-hosts';

// Load hosts from Firestore or localStorage or fall back to defaults
async function loadStoredHostsAsync(): Promise<EditableWW2Host[]> {
  // Try Firestore first
  if (isFirebaseConfigured()) {
    try {
      const firestoreHosts = await getWW2Hosts();
      if (firestoreHosts && firestoreHosts.length > 0) {
        console.log('[WW2GuideEditor] Loaded from Firestore:', firestoreHosts.length);
        return firestoreHosts.map((h, i) => ({
          id: h.id as WW2Host['id'],
          name: h.name,
          title: h.title,
          era: h.era,
          specialty: h.specialty,
          imageUrl: h.imageUrl,
          introVideoUrl: h.introVideoUrl,
          welcomeVideoUrl: h.welcomeVideoUrl,
          primaryColor: h.primaryColor,
          avatar: h.avatar,
          voiceStyle: h.voiceStyle,
          description: h.description,
          displayOrder: h.displayOrder ?? i,
        }));
      }
    } catch (e) {
      console.error('[WW2GuideEditor] Error loading from Firestore:', e);
    }
  }

  // Fall back to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading stored WW2 hosts:', e);
  }
  // Fall back to default hosts with display order
  return WW2_HOSTS.map((host, i) => ({ ...host, displayOrder: i }));
}

// Save hosts to localStorage (always) and Firestore (if configured)
async function saveStoredHostsAsync(hosts: EditableWW2Host[]): Promise<boolean> {
  // Always save to localStorage as backup
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hosts));
    console.log('[WW2GuideEditor] Saved to localStorage');
  } catch (e) {
    console.error('Error saving WW2 hosts to localStorage:', e);
  }

  // Save to Firestore if configured
  if (isFirebaseConfigured()) {
    console.log('[WW2GuideEditor] Firebase configured, attempting Firestore save...');
    try {
      const firestoreHosts: FirestoreWW2Host[] = hosts.map((h, i) => ({
        id: h.id,
        name: h.name,
        title: h.title,
        era: h.era,
        specialty: h.specialty,
        imageUrl: h.imageUrl,
        introVideoUrl: h.introVideoUrl,
        welcomeVideoUrl: h.welcomeVideoUrl,
        primaryColor: h.primaryColor,
        avatar: h.avatar,
        voiceStyle: h.voiceStyle,
        description: h.description,
        displayOrder: i,
      }));
      console.log('[WW2GuideEditor] Saving hosts:', firestoreHosts.map(h => ({ id: h.id, hasIntroVideo: !!h.introVideoUrl, hasWelcomeVideo: !!h.welcomeVideoUrl })));
      const success = await saveAllWW2Hosts(firestoreHosts);
      if (success) {
        console.log('[WW2GuideEditor] ✅ Saved to Firestore successfully!');
        return true;
      } else {
        console.error('[WW2GuideEditor] ❌ Firestore save returned false');
      }
    } catch (e) {
      console.error('[WW2GuideEditor] ❌ Error saving to Firestore:', e);
    }
  } else {
    console.log('[WW2GuideEditor] Firebase NOT configured');
  }

  return false;
}

export default function WW2GuideEditor() {
  const [hosts, setHosts] = useState<EditableWW2Host[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerType, setMediaPickerType] = useState<'introVideo' | 'welcomeVideo' | 'image'>('introVideo');
  const [previewingVideo, setPreviewingVideo] = useState<string | null>(null);
  const [isFirebaseEnabled] = useState(isFirebaseConfigured());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedHost = hosts.find(h => h.id === selectedId);

  // Load hosts on mount
  useEffect(() => {
    const loadHosts = async () => {
      setIsLoading(true);
      const loadedHosts = await loadStoredHostsAsync();
      setHosts(loadedHosts);
      setIsLoading(false);
    };
    loadHosts();
  }, []);

  const openMediaPicker = (type: 'introVideo' | 'welcomeVideo' | 'image') => {
    setMediaPickerType(type);
    setMediaPickerOpen(true);
  };

  const handleMediaSelect = (file: MediaFile) => {
    if (!selectedId) return;
    const field = mediaPickerType === 'introVideo' ? 'introVideoUrl'
      : mediaPickerType === 'welcomeVideo' ? 'welcomeVideoUrl'
      : 'imageUrl';
    handleUpdateHost(field as keyof EditableWW2Host, file.url);
    toast.success(`${mediaPickerType === 'image' ? 'Image' : mediaPickerType.replace('Video', ' video')} set`);
  };

  const clearMedia = (type: 'introVideo' | 'welcomeVideo' | 'image') => {
    const field = type === 'introVideo' ? 'introVideoUrl'
      : type === 'welcomeVideo' ? 'welcomeVideoUrl'
      : 'imageUrl';
    handleUpdateHost(field as keyof EditableWW2Host, undefined);
  };

  const handleSelectHost = (id: string) => {
    setSelectedId(id);
  };

  const handleUpdateHost = <K extends keyof EditableWW2Host>(field: K, value: EditableWW2Host[K]) => {
    if (!selectedId) return;
    setHosts(prev => prev.map(h =>
      h.id === selectedId ? { ...h, [field]: value } : h
    ));
  };

  const handleReorder = (newOrder: EditableWW2Host[]) => {
    setHosts(newOrder.map((h, i) => ({ ...h, displayOrder: i })));
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setHosts(prev => prev.map(h =>
        h.id === selectedId ? { ...h, localImageUrl: dataUrl } : h
      ));
      setImageError(prev => ({ ...prev, [selectedId]: false }));
    };
    reader.readAsDataURL(file);

    // Upload to storage
    toast.loading('Uploading image...', { id: 'upload' });
    const uploadResult = await uploadFile(file);

    if (uploadResult?.url) {
      setHosts(prev => prev.map(h =>
        h.id === selectedId ? { ...h, imageUrl: uploadResult.url } : h
      ));
      toast.success('Image uploaded successfully', { id: 'upload' });
    } else {
      // Fall back to data URL
      const fallbackReader = new FileReader();
      fallbackReader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setHosts(prev => prev.map(h =>
          h.id === selectedId ? { ...h, imageUrl: dataUrl } : h
        ));
      };
      fallbackReader.readAsDataURL(file);
      toast.warning('Saved locally (cloud upload unavailable)', { id: 'upload' });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const savedToCloud = await saveStoredHostsAsync(hosts);
      toast.success('WW2 guides saved', {
        description: savedToCloud ? 'Synced to cloud.' : 'Saved locally (cloud not configured).',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving guides');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const savedToCloud = await saveStoredHostsAsync(hosts);
      toast.success('All WW2 guides saved', {
        description: savedToCloud ? 'Synced to cloud - will deploy with app.' : 'Saved locally (cloud not configured).',
      });
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Error saving guides');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl">
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span className="text-muted-foreground">Loading guides...</span>
        </div>
      )}

      {!isLoading && (
        <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-3xl font-bold text-foreground">WW2 Guide Editor</h1>
            {isFirebaseEnabled ? (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                <Cloud size={12} />
                Cloud Sync
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400">
                <CloudOff size={12} />
                Local Only
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Manage WW2 era guides - drag to reorder, upload images and videos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save All
          </button>
        </div>
      </div>

      {/* Reorderable Host Grid */}
      <Reorder.Group
        axis="x"
        values={hosts}
        onReorder={handleReorder}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
      >
        {hosts.map((host, index) => (
          <Reorder.Item
            key={host.id}
            value={host}
            className="relative"
          >
            <HostCard
              host={host}
              index={index + 1}
              isSelected={host.id === selectedId}
              onSelect={() => handleSelectHost(host.id)}
              hasError={imageError[host.id]}
              onImageError={() => setImageError(prev => ({ ...prev, [host.id]: true }))}
            />
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Editor Panel */}
      <AnimatePresence mode="wait">
        {selectedHost && (
          <motion.div
            key={selectedHost.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card border border-border rounded-xl"
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selectedHost.avatar}</span>
                <div>
                  <h2 className="text-lg font-semibold">{selectedHost.name}</h2>
                  <p className="text-sm text-muted-foreground">{selectedHost.title}</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Guide
              </button>
            </div>

            <div className="p-6">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Image Section */}
                <div className="space-y-4">
                  <label className="text-sm font-medium text-foreground block">Portrait Image</label>
                  <div className="aspect-square rounded-xl bg-muted border-2 border-dashed border-border overflow-hidden relative">
                    {(selectedHost.localImageUrl || selectedHost.imageUrl) && !imageError[selectedHost.id] ? (
                      <img
                        src={selectedHost.localImageUrl || selectedHost.imageUrl}
                        alt={selectedHost.name}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(prev => ({ ...prev, [selectedHost.id]: true }))}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        <span className="text-6xl mb-2">{selectedHost.avatar}</span>
                        <p className="text-sm">No image set</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                    >
                      <Upload size={16} />
                      Upload
                    </button>
                    <button
                      onClick={() => openMediaPicker('image')}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors text-sm"
                    >
                      <ImageIcon size={16} />
                      Library
                    </button>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Avatar Emoji</label>
                    <input
                      type="text"
                      value={selectedHost.avatar}
                      onChange={(e) => handleUpdateHost('avatar', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-2xl text-center"
                    />
                  </div>

                  {/* Video Uploads Section */}
                  <div className="pt-4 border-t border-border">
                    <label className="text-sm font-medium text-foreground mb-3 block flex items-center gap-2">
                      <Video size={16} className="text-primary" />
                      Guide Videos
                    </label>

                    {/* Intro Video */}
                    <div className="mb-3">
                      <label className="text-xs text-muted-foreground mb-1.5 block">Intro Video (30s preview)</label>
                      {selectedHost.introVideoUrl ? (
                        <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                          <video
                            src={selectedHost.introVideoUrl}
                            className="w-full h-full object-cover"
                            muted
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              onClick={() => setPreviewingVideo(selectedHost.introVideoUrl!)}
                              className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-white"
                            >
                              <Play size={12} />
                            </button>
                            <button
                              onClick={() => clearMedia('introVideo')}
                              className="p-1.5 rounded bg-black/60 hover:bg-red-600 text-white"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openMediaPicker('introVideo')}
                          className="w-full py-3 rounded-lg border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground text-xs transition-colors"
                        >
                          + Add intro video
                        </button>
                      )}
                    </div>

                    {/* Welcome Video */}
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Welcome Video (after selection)</label>
                      {selectedHost.welcomeVideoUrl ? (
                        <div className="relative rounded-lg overflow-hidden bg-muted aspect-video">
                          <video
                            src={selectedHost.welcomeVideoUrl}
                            className="w-full h-full object-cover"
                            muted
                            onMouseEnter={(e) => e.currentTarget.play()}
                            onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                          />
                          <div className="absolute top-1 right-1 flex gap-1">
                            <button
                              onClick={() => setPreviewingVideo(selectedHost.welcomeVideoUrl!)}
                              className="p-1.5 rounded bg-black/60 hover:bg-black/80 text-white"
                            >
                              <Play size={12} />
                            </button>
                            <button
                              onClick={() => clearMedia('welcomeVideo')}
                              className="p-1.5 rounded bg-black/60 hover:bg-red-600 text-white"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openMediaPicker('welcomeVideo')}
                          className="w-full py-3 rounded-lg border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground text-xs transition-colors"
                        >
                          + Add welcome video
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Name</label>
                    <input
                      type="text"
                      value={selectedHost.name}
                      onChange={(e) => handleUpdateHost('name', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Title</label>
                    <input
                      type="text"
                      value={selectedHost.title}
                      onChange={(e) => handleUpdateHost('title', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Era</label>
                    <input
                      type="text"
                      value={selectedHost.era}
                      onChange={(e) => handleUpdateHost('era', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Specialty</label>
                    <input
                      type="text"
                      value={selectedHost.specialty}
                      onChange={(e) => handleUpdateHost('specialty', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Voice Style</label>
                    <input
                      type="text"
                      value={selectedHost.voiceStyle}
                      onChange={(e) => handleUpdateHost('voiceStyle', e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Primary Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedHost.primaryColor}
                        onChange={(e) => handleUpdateHost('primaryColor', e.target.value)}
                        className="w-12 h-10 rounded-lg border border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedHost.primaryColor}
                        onChange={(e) => handleUpdateHost('primaryColor', e.target.value)}
                        className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Description</label>
                    <textarea
                      value={selectedHost.description}
                      onChange={(e) => handleUpdateHost('description', e.target.value)}
                      rows={8}
                      className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none resize-none"
                    />
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Shield size={16} className="text-primary" />
                      Host ID
                    </h4>
                    <p className="text-sm text-muted-foreground font-mono">{selectedHost.id}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      This ID is used to reference this host in the app. Do not change it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedHost && (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Shield size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <p className="text-muted-foreground">Drag guides to reorder. Select a guide to edit.</p>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        allowedTypes={mediaPickerType === 'image' ? ['image'] : ['video']}
        title={
          mediaPickerType === 'introVideo' ? 'Select Intro Video'
          : mediaPickerType === 'welcomeVideo' ? 'Select Welcome Video'
          : 'Select Image'
        }
      />

      {/* Video Preview Modal */}
      <AnimatePresence>
        {previewingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewingVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={previewingVideo}
                className="w-full rounded-xl"
                controls
                autoPlay
              />
              <button
                onClick={() => setPreviewingVideo(null)}
                className="absolute -top-10 right-0 p-2 text-white hover:text-white/80"
              >
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}

// Host Card Component
function HostCard({
  host,
  index,
  isSelected,
  onSelect,
  hasError,
  onImageError
}: {
  host: EditableWW2Host;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  hasError: boolean;
  onImageError: () => void;
}) {
  const imageUrl = host.localImageUrl || host.imageUrl;

  return (
    <div
      onClick={onSelect}
      className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
          : 'border-border hover:border-primary/50'
      }`}
    >
      {/* Drag handle */}
      <div className="absolute top-2 left-2 z-10 p-1 rounded bg-black/50 cursor-grab active:cursor-grabbing">
        <GripVertical size={14} className="text-white" />
      </div>

      {/* Order number */}
      <div className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
        <span className="text-white text-xs font-bold">{index}</span>
      </div>

      {imageUrl && !hasError ? (
        <img src={imageUrl} alt={host.name} className="w-full h-full object-cover" onError={onImageError} />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: host.primaryColor }}
        >
          <span className="text-6xl">{host.avatar}</span>
        </div>
      )}

      {/* Name overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <p className="text-white text-base font-medium truncate">{host.name}</p>
        <p className="text-white/70 text-sm truncate">{host.title}</p>
        <p className="text-white/50 text-xs mt-1 truncate">{host.specialty}</p>
      </div>

      {/* Video indicators */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {host.introVideoUrl && (
          <div className="w-5 h-5 rounded-full bg-green-500/80 flex items-center justify-center" title="Intro video set">
            <Video size={10} className="text-white" />
          </div>
        )}
        {host.welcomeVideoUrl && (
          <div className="w-5 h-5 rounded-full bg-blue-500/80 flex items-center justify-center" title="Welcome video set">
            <Video size={10} className="text-white" />
          </div>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && <div className="absolute inset-0 border-4 border-primary rounded-xl pointer-events-none" />}
    </div>
  );
}

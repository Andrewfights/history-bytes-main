import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Shield, Save, Upload, Loader2, ImageIcon, GripVertical, Video, Play, Trash2, Plus, X, Cloud, CloudOff, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { WW2_HOSTS } from '@/data/ww2Hosts';
import { MediaPicker } from './MediaPicker';
import { uploadFile, type MediaFile, isFirebaseConfigured } from '@/lib/supabase';
import { saveAllWW2Hosts, getWW2Hosts, type FirestoreWW2Host } from '@/lib/firestore';
import { loadWW2HostsAsync, saveWW2HostsAsync, type WW2HostData } from '@/lib/adminStorage';
import type { WW2Host } from '@/types';

type EditableWW2Host = WW2Host & { localImageUrl?: string; displayOrder?: number };

// Load hosts from IndexedDB first (guaranteed), then Firestore for latest data
async function loadStoredHostsAsync(): Promise<EditableWW2Host[]> {
  // First, load from IndexedDB (this is the guaranteed persistence layer)
  const indexedDBData = await loadWW2HostsAsync();
  let hosts: EditableWW2Host[] = [];

  if (indexedDBData.hosts && indexedDBData.hosts.length > 0) {
    console.log('[WW2GuideEditor] Loaded from IndexedDB:', indexedDBData.hosts.length, 'hosts');
    hosts = indexedDBData.hosts.map((h, i) => ({
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

  // If Firebase is configured, try to get latest from Firestore (for cross-device sync)
  if (isFirebaseConfigured()) {
    try {
      const firestoreHosts = await getWW2Hosts();
      if (firestoreHosts && firestoreHosts.length > 0) {
        console.log('[WW2GuideEditor] Loaded from Firestore:', firestoreHosts.length, '- merging with IndexedDB');
        hosts = firestoreHosts.map((h, i) => ({
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
        // Update IndexedDB cache with Firestore data
        await saveWW2HostsAsync({
          hosts: hosts.map(h => ({
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
            displayOrder: h.displayOrder,
          })),
          lastUpdated: new Date().toISOString(),
        });
        console.log('[WW2GuideEditor] IndexedDB cache updated from Firestore');
      }
    } catch (e) {
      console.error('[WW2GuideEditor] Error loading from Firestore (using IndexedDB data):', e);
      // Continue with IndexedDB data - we have a fallback
    }
  }

  // If we have hosts from either source, return them
  if (hosts.length > 0) {
    return hosts;
  }

  // Fall back to default hosts with display order
  console.log('[WW2GuideEditor] No stored data found - using defaults');
  return WW2_HOSTS.map((host, i) => ({ ...host, displayOrder: i }));
}

// Check if a URL is a local data URL (won't work in production)
function isLocalDataUrl(url?: string): boolean {
  return !!url && (url.startsWith('data:') || url.startsWith('blob:'));
}

// Save hosts to IndexedDB first (guaranteed), then Firestore (for cross-device sync)
async function saveStoredHostsAsync(hosts: EditableWW2Host[]): Promise<{ success: boolean; error?: string; savedLocally?: boolean }> {
  // Block saving if any URLs are local data URLs (they won't work for other users)
  const localUrlIssues: string[] = [];
  for (const host of hosts) {
    if (isLocalDataUrl(host.imageUrl)) localUrlIssues.push(`${host.name}: portrait image is local`);
    if (isLocalDataUrl(host.introVideoUrl)) localUrlIssues.push(`${host.name}: intro video is local`);
    if (isLocalDataUrl(host.welcomeVideoUrl)) localUrlIssues.push(`${host.name}: welcome video is local`);
  }

  if (localUrlIssues.length > 0) {
    console.error('[WW2GuideEditor] ❌ Cannot save - local URLs detected:', localUrlIssues);
    return { success: false, error: `Local files detected: ${localUrlIssues[0]}. Upload to Firebase Storage first.` };
  }

  // Step 1: Save to IndexedDB first (guaranteed persistence)
  console.log('[WW2GuideEditor] Saving to IndexedDB...');
  const indexedDBHosts: WW2HostData[] = hosts.map((h, i) => ({
    id: h.id,
    name: h.name,
    title: h.title,
    era: h.era,
    specialty: h.specialty,
    primaryColor: h.primaryColor,
    avatar: h.avatar,
    voiceStyle: h.voiceStyle,
    description: h.description,
    displayOrder: i,
    imageUrl: h.imageUrl,
    introVideoUrl: h.introVideoUrl,
    welcomeVideoUrl: h.welcomeVideoUrl,
  }));

  const indexedDBSuccess = await saveWW2HostsAsync({
    hosts: indexedDBHosts,
    lastUpdated: new Date().toISOString(),
  });

  if (!indexedDBSuccess) {
    console.error('[WW2GuideEditor] ❌ Failed to save to IndexedDB');
    return { success: false, error: 'Failed to save locally. Check browser storage.' };
  }
  console.log('[WW2GuideEditor] ✅ Saved to IndexedDB');

  // Step 2: If Firebase is configured, sync to Firestore (for cross-device sync)
  if (!isFirebaseConfigured()) {
    console.log('[WW2GuideEditor] Firebase not configured - saved locally only');
    return { success: true, savedLocally: true };
  }

  console.log('[WW2GuideEditor] Syncing to Firestore...');
  try {
    // Build hosts with only defined values (Firestore doesn't accept undefined)
    const firestoreHosts: FirestoreWW2Host[] = hosts.map((h, i) => {
      const host: FirestoreWW2Host = {
        id: h.id,
        name: h.name,
        title: h.title,
        era: h.era,
        specialty: h.specialty,
        primaryColor: h.primaryColor,
        avatar: h.avatar,
        voiceStyle: h.voiceStyle,
        description: h.description,
        displayOrder: i,
      };
      // Only add optional fields if they have values
      if (h.imageUrl) host.imageUrl = h.imageUrl;
      if (h.introVideoUrl) host.introVideoUrl = h.introVideoUrl;
      if (h.welcomeVideoUrl) host.welcomeVideoUrl = h.welcomeVideoUrl;
      return host;
    });

    const firestoreSuccess = await saveAllWW2Hosts(firestoreHosts);
    if (firestoreSuccess) {
      console.log('[WW2GuideEditor] ✅ Synced to Firestore successfully!');
      return { success: true };
    } else {
      console.warn('[WW2GuideEditor] ⚠️ Firestore sync failed - data saved locally');
      return { success: true, savedLocally: true, error: 'Cloud sync failed, but saved locally' };
    }
  } catch (e) {
    const error = e as Error;
    console.error('[WW2GuideEditor] ❌ Firestore sync error:', error);
    return { success: true, savedLocally: true, error: `Cloud sync failed: ${error.message}` };
  }
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check Firebase config on each render (not stale state)
  const isFirebaseEnabled = isFirebaseConfigured();

  const selectedHost = hosts.find(h => h.id === selectedId);

  // Load hosts on mount
  useEffect(() => {
    // Debug: log Firebase configuration status
    console.log('[WW2GuideEditor] Firebase configured:', isFirebaseConfigured());
    console.log('[WW2GuideEditor] API Key present:', !!import.meta.env.VITE_FIREBASE_API_KEY);
    console.log('[WW2GuideEditor] Project ID present:', !!import.meta.env.VITE_FIREBASE_PROJECT_ID);

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

  // Auto-save function that saves directly without waiting for state
  const autoSaveHosts = async (updatedHosts: EditableWW2Host[]) => {
    console.log('[WW2GuideEditor] Auto-saving...');
    try {
      const result = await saveStoredHostsAsync(updatedHosts);
      if (result.success) {
        if (result.savedLocally) {
          toast.success('Saved locally', {
            description: result.error || 'Cloud sync unavailable',
            duration: 3000,
            icon: <HardDrive size={16} />,
          });
        } else {
          toast.success('Saved to cloud', { duration: 2000 });
        }
      } else {
        toast.error('Auto-save failed', {
          description: result.error || 'Unknown error.',
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('[WW2GuideEditor] Auto-save error:', error);
      toast.error('Auto-save error', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  const handleMediaSelect = async (file: MediaFile) => {
    if (!selectedId) return;
    const field = mediaPickerType === 'introVideo' ? 'introVideoUrl'
      : mediaPickerType === 'welcomeVideo' ? 'welcomeVideoUrl'
      : 'imageUrl';

    // Update hosts and auto-save
    const updatedHosts = hosts.map(h =>
      h.id === selectedId ? { ...h, [field]: file.url } : h
    );
    setHosts(updatedHosts);

    // Auto-save immediately
    toast.loading('Saving...', { id: 'autosave' });
    await autoSaveHosts(updatedHosts);
    toast.dismiss('autosave');
  };

  const clearMedia = async (type: 'introVideo' | 'welcomeVideo' | 'image') => {
    if (!selectedId) return;
    const field = type === 'introVideo' ? 'introVideoUrl'
      : type === 'welcomeVideo' ? 'welcomeVideoUrl'
      : 'imageUrl';

    // Update hosts and auto-save
    const updatedHosts = hosts.map(h =>
      h.id === selectedId ? { ...h, [field]: undefined } : h
    );
    setHosts(updatedHosts);

    // Auto-save immediately
    toast.loading('Saving...', { id: 'autosave' });
    await autoSaveHosts(updatedHosts);
    toast.dismiss('autosave');
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

  const handleReorder = async (newOrder: EditableWW2Host[]) => {
    const updatedHosts = newOrder.map((h, i) => ({ ...h, displayOrder: i }));
    setHosts(updatedHosts);
    // Auto-save after reorder
    await autoSaveHosts(updatedHosts);
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedId) return;

    // Show preview immediately (local preview only, not saved)
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setHosts(prev => prev.map(h =>
        h.id === selectedId ? { ...h, localImageUrl: dataUrl } : h
      ));
      setImageError(prev => ({ ...prev, [selectedId]: false }));
    };
    reader.readAsDataURL(file);

    // Upload to Firebase Storage (required - no fallback)
    toast.loading('Uploading to Firebase Storage...', { id: 'upload' });
    const uploadResult = await uploadFile(file);

    if (uploadResult?.url) {
      // Update hosts with the cloud URL
      const updatedHosts = hosts.map(h =>
        h.id === selectedId ? { ...h, imageUrl: uploadResult.url, localImageUrl: undefined } : h
      );
      setHosts(updatedHosts);
      toast.success('Uploaded! Saving...', { id: 'upload' });

      // Auto-save to Firestore
      await autoSaveHosts(updatedHosts);
    } else {
      // Clear the local preview since we can't save it
      setHosts(prev => prev.map(h =>
        h.id === selectedId ? { ...h, localImageUrl: undefined } : h
      ));
      toast.error('Upload failed - check Firebase Storage configuration', { id: 'upload', duration: 5000 });
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [selectedId, hosts]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await saveStoredHostsAsync(hosts);
      if (result.success) {
        if (result.savedLocally) {
          toast.success('Saved locally', {
            description: result.error || 'Data persisted - cloud sync unavailable.',
            icon: <HardDrive size={16} />,
          });
        } else {
          toast.success('WW2 guides saved', {
            description: 'Synced to Firebase - visible to all users.',
          });
        }
      } else {
        toast.error('Save failed', {
          description: result.error || 'Unknown error.',
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error saving guides', {
        description: errorMessage,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const result = await saveStoredHostsAsync(hosts);
      if (result.success) {
        if (result.savedLocally) {
          toast.success('Saved locally', {
            description: result.error || 'Data persisted - cloud sync unavailable.',
            icon: <HardDrive size={16} />,
          });
        } else {
          toast.success('All WW2 guides saved', {
            description: 'Synced to Firebase - visible to all users.',
          });
        }
      } else {
        toast.error('Save failed', {
          description: result.error || 'Unknown error.',
          duration: 8000,
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Error saving guides', {
        description: errorMessage,
      });
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-foreground">WW2 Guide Editor</h1>
            {isFirebaseEnabled ? (
              <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                <Cloud size={12} />
                Firebase Connected
              </span>
            ) : (
              <span
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400 cursor-help"
                title={`Firebase required for admin. Missing: ${
                  [
                    !import.meta.env.VITE_FIREBASE_API_KEY && 'API_KEY',
                    !import.meta.env.VITE_FIREBASE_PROJECT_ID && 'PROJECT_ID',
                    !import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID && 'SENDER_ID',
                    !import.meta.env.VITE_FIREBASE_APP_ID && 'APP_ID',
                  ].filter(Boolean).join(', ') || 'unknown'
                }. Add .env file and restart dev server.`}
              >
                <CloudOff size={12} />
                Firebase Required
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage WW2 era guides - tap to select, upload images and videos
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save All
        </button>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
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
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 w-full sm:w-auto"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Guide
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Video indicators - yellow/orange = local (won't work for users), green/blue = cloud */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        {host.introVideoUrl && (
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              host.introVideoUrl.startsWith('data:') || host.introVideoUrl.startsWith('blob:')
                ? 'bg-orange-500/80'
                : 'bg-green-500/80'
            }`}
            title={
              host.introVideoUrl.startsWith('data:') || host.introVideoUrl.startsWith('blob:')
                ? 'Intro video (LOCAL - re-upload needed)'
                : 'Intro video (cloud)'
            }
          >
            <Video size={10} className="text-white" />
          </div>
        )}
        {host.welcomeVideoUrl && (
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center ${
              host.welcomeVideoUrl.startsWith('data:') || host.welcomeVideoUrl.startsWith('blob:')
                ? 'bg-orange-500/80'
                : 'bg-blue-500/80'
            }`}
            title={
              host.welcomeVideoUrl.startsWith('data:') || host.welcomeVideoUrl.startsWith('blob:')
                ? 'Welcome video (LOCAL - re-upload needed)'
                : 'Welcome video (cloud)'
            }
          >
            <Video size={10} className="text-white" />
          </div>
        )}
      </div>

      {/* Selected indicator */}
      {isSelected && <div className="absolute inset-0 border-4 border-primary rounded-xl pointer-events-none" />}
    </div>
  );
}

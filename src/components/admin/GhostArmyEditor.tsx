import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Video,
  Image,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Play,
  Eye,
  ChevronDown,
  ChevronUp,
  FileVideo,
  FileImage,
  RefreshCw,
  HardDrive,
  Cloud,
  CloudOff,
} from 'lucide-react';
import {
  loadGhostArmyMedia,
  loadGhostArmyMediaAsync,
  updateGhostArmyNodeMedia,
  saveGhostArmyMedia,
  fileToDataUrl,
  GhostArmyNodeMedia,
  GhostArmyMediaConfig,
  getStorageInfo,
  getIndexedDBStorageInfo,
  initGhostArmyMediaCache,
} from '@/lib/adminStorage';
import { ghostArmyStory, GhostArmyNode } from '@/data/ghostArmyStory';
import { uploadFile } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase';
import { saveGhostArmyMediaData, loadGhostArmyMediaData } from '@/lib/database';

interface NodeEditorProps {
  node: GhostArmyNode;
  media: GhostArmyNodeMedia | null;
  onUpdate: (nodeId: string, media: Partial<GhostArmyNodeMedia>) => boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function NodeEditor({ node, media, onUpdate, isExpanded, onToggle }: NodeEditorProps) {
  const videoInputRef = useRef<HTMLInputElement>(null);
  const video2InputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState<'video' | 'video2' | 'image' | 'thumbnail' | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'video' | 'video2' | 'image' | 'thumbnail'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size - limit based on whether using Firebase or local
    const fileSizeMB = file.size / (1024 * 1024);
    const maxSize = isFirebaseConfigured() ? 100 : 50;
    if (fileSizeMB > maxSize) {
      setUploadError(`File too large (${fileSizeMB.toFixed(1)}MB). Max ${maxSize}MB per file. Try compressing the video.`);
      setTimeout(() => setUploadError(null), 5000);
      return;
    }

    setIsUploading(true);
    setUploadType(type);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      let mediaUrl: string;

      // Try Firebase Storage first if configured
      if (isFirebaseConfigured()) {
        try {
          const uploadResult = await uploadFile(file);
          if (uploadResult?.url) {
            mediaUrl = uploadResult.url;
            console.log('[GhostArmyEditor] Uploaded to Firebase Storage:', type);
          } else {
            mediaUrl = await fileToDataUrl(file);
          }
        } catch (uploadError) {
          console.error('[GhostArmyEditor] Firebase upload failed, using local:', uploadError);
          mediaUrl = await fileToDataUrl(file);
        }
      } else {
        mediaUrl = await fileToDataUrl(file);
      }

      let success = false;
      if (type === 'video') {
        success = onUpdate(node.id, { videoUrl: mediaUrl });
      } else if (type === 'video2') {
        success = onUpdate(node.id, { videoUrl2: mediaUrl });
      } else if (type === 'image') {
        success = onUpdate(node.id, { backgroundImage: mediaUrl });
      } else if (type === 'thumbnail') {
        success = onUpdate(node.id, { videoThumbnail: mediaUrl });
      }

      if (success) {
        const typeLabel = type === 'video2' ? 'Narration video' : type.charAt(0).toUpperCase() + type.slice(1);
        const location = mediaUrl.startsWith('http') ? 'to cloud' : 'locally';
        setUploadSuccess(`${typeLabel} saved ${location}!`);
        setTimeout(() => setUploadSuccess(null), 3000);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        setUploadError('Storage quota exceeded. Try removing other media or use smaller files.');
      } else {
        setUploadError('Upload failed. Please try again.');
      }
      setTimeout(() => setUploadError(null), 5000);
    } finally {
      setIsUploading(false);
      setUploadType(null);
    }
  };

  const handleRemoveMedia = (type: 'video' | 'video2' | 'image' | 'thumbnail') => {
    if (type === 'video') {
      onUpdate(node.id, { videoUrl: undefined });
    } else if (type === 'video2') {
      onUpdate(node.id, { videoUrl2: undefined });
    } else if (type === 'image') {
      onUpdate(node.id, { backgroundImage: undefined });
    } else if (type === 'thumbnail') {
      onUpdate(node.id, { videoThumbnail: undefined });
    }
  };

  const getNodeTypeLabel = () => {
    switch (node.type) {
      case 'watch':
        return 'Watch Node';
      case 'learn':
        return 'Learn Node';
      case 'interactive':
        return 'Interactive Node';
      case 'boss':
        return 'Boss Battle';
      case 'resolution':
        return 'Resolution';
      default:
        return 'Node';
    }
  };

  const getNodeTypeColor = () => {
    switch (node.type) {
      case 'watch':
        return 'bg-blue-500/20 text-blue-400';
      case 'learn':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'interactive':
        return 'bg-purple-500/20 text-purple-400';
      case 'boss':
        return 'bg-amber-500/20 text-amber-400';
      case 'resolution':
        return 'bg-gold-primary/20 text-gold-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 rounded text-xs font-bold ${getNodeTypeColor()}`}>
            {getNodeTypeLabel()}
          </span>
          <span className="font-bold">{node.title}</span>
          {media?.videoUrl && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 size={12} />
              {node.type === 'watch' ? 'Intro' : 'Video'}
            </span>
          )}
          {media?.videoUrl2 && node.type === 'watch' && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 size={12} />
              Narration
            </span>
          )}
          {media?.backgroundImage && (
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <CheckCircle2 size={12} />
              Image
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border space-y-6">
          {/* Upload Status Messages */}
          <AnimatePresence>
            {uploadError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
              >
                <AlertCircle size={16} />
                {uploadError}
              </motion.div>
            )}
            {uploadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm"
              >
                <CheckCircle2 size={16} />
                {uploadSuccess}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Video Upload - Intro Video for Watch nodes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Video size={16} />
              {node.type === 'watch' ? 'Intro Video' : 'Video'}
            </label>
            {node.type === 'watch' && (
              <p className="text-xs text-muted-foreground mb-2">
                Plays on the opening screen before clicking "Begin"
              </p>
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'video')}
              className="hidden"
            />

            {media?.videoUrl ? (
              <div className="space-y-2">
                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    src={media.videoUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => videoInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Upload size={16} />
                    Replace Video
                  </button>
                  <button
                    onClick={() => handleRemoveMedia('video')}
                    className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => videoInputRef.current?.click()}
                disabled={isUploading && uploadType === 'video'}
                className="w-full flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {isUploading && uploadType === 'video' ? (
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <>
                    <FileVideo size={32} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload {node.type === 'watch' ? 'intro video' : 'video'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      MP4, WebM, MOV
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Narration Video Upload - Only for Watch nodes */}
          {node.type === 'watch' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-medium mb-2">
                <Video size={16} />
                Narration Video
              </label>
              <p className="text-xs text-muted-foreground mb-2">
                Plays during the narration phase after clicking "Begin"
              </p>
              <input
                ref={video2InputRef}
                type="file"
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'video2')}
                className="hidden"
              />

              {media?.videoUrl2 ? (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={media.videoUrl2}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => video2InputRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                    >
                      <Upload size={16} />
                      Replace Video
                    </button>
                    <button
                      onClick={() => handleRemoveMedia('video2')}
                      className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => video2InputRef.current?.click()}
                  disabled={isUploading && uploadType === 'video2'}
                  className="w-full flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                  {isUploading && uploadType === 'video2' ? (
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <FileVideo size={32} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload narration video
                      </span>
                      <span className="text-xs text-muted-foreground">
                        MP4, WebM, MOV
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Background Image Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Image size={16} />
              Background Image
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'image')}
              className="hidden"
            />

            {media?.backgroundImage ? (
              <div className="space-y-2">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={media.backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Upload size={16} />
                    Replace Image
                  </button>
                  <button
                    onClick={() => handleRemoveMedia('image')}
                    className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => imageInputRef.current?.click()}
                disabled={isUploading && uploadType === 'image'}
                className="w-full flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all"
              >
                {isUploading && uploadType === 'image' ? (
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <>
                    <FileImage size={32} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Click to upload image
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, WebP
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Video Thumbnail Upload */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Eye size={16} />
              Video Thumbnail (optional)
            </label>
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'thumbnail')}
              className="hidden"
            />

            {media?.videoThumbnail ? (
              <div className="space-y-2">
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden max-w-xs">
                  <img
                    src={media.videoThumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Upload size={16} />
                    Replace
                  </button>
                  <button
                    onClick={() => handleRemoveMedia('thumbnail')}
                    className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => thumbnailInputRef.current?.click()}
                disabled={isUploading && uploadType === 'thumbnail'}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-sm text-muted-foreground"
              >
                {isUploading && uploadType === 'thumbnail' ? (
                  <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Upload size={16} />
                    Add thumbnail
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function GhostArmyEditor() {
  const [mediaConfig, setMediaConfig] = useState<GhostArmyMediaConfig | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [storageInfo, setStorageInfo] = useState({ used: '0 MB', available: 'Loading...' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);

  // Load media config from Firestore (primary) or IndexedDB (fallback) on mount
  useEffect(() => {
    const init = async () => {
      await initGhostArmyMediaCache();

      // Try loading from Firestore first if configured
      if (isFirebaseConfigured()) {
        try {
          const firestoreMedia = await loadGhostArmyMediaData();
          const localConfig = await loadGhostArmyMediaAsync();
          const mergedConfig: GhostArmyMediaConfig = {
            nodes: { ...localConfig.nodes },
            lastUpdated: new Date().toISOString(),
          };

          // Firestore data takes priority (cloud URLs)
          Object.entries(firestoreMedia).forEach(([nodeId, media]) => {
            mergedConfig.nodes[nodeId] = {
              ...(mergedConfig.nodes[nodeId] || {}),
              ...media,
            } as GhostArmyNodeMedia;
          });

          setMediaConfig(mergedConfig);
          setIsSyncedToCloud(true);
          console.log('[GhostArmyEditor] Loaded from Firestore:', Object.keys(firestoreMedia).length, 'nodes');
        } catch (error) {
          console.error('[GhostArmyEditor] Firestore load failed:', error);
          const config = await loadGhostArmyMediaAsync();
          setMediaConfig(config);
        }
      } else {
        const config = await loadGhostArmyMediaAsync();
        setMediaConfig(config);
      }

      const info = await getIndexedDBStorageInfo();
      setStorageInfo(info);
      setIsLoading(false);
    };
    init();
  }, []);

  // Update storage info after saves
  useEffect(() => {
    if (saveStatus === 'saved') {
      getIndexedDBStorageInfo().then(setStorageInfo);
    }
  }, [saveStatus]);

  const handleNodeUpdate = (nodeId: string, media: Partial<GhostArmyNodeMedia>): boolean => {
    setSaveStatus('saving');

    try {
      // Save to local IndexedDB first
      const success = updateGhostArmyNodeMedia(nodeId, media);

      if (success) {
        // Reload config
        const config = loadGhostArmyMedia();
        setMediaConfig(config);

        // Also sync to Firestore if configured (only for cloud URLs)
        if (isFirebaseConfigured()) {
          const cloudMedia: Partial<GhostArmyNodeMedia> = {};
          if (media.videoUrl && media.videoUrl.startsWith('http')) {
            cloudMedia.videoUrl = media.videoUrl;
          }
          if (media.videoUrl2 && media.videoUrl2.startsWith('http')) {
            cloudMedia.videoUrl2 = media.videoUrl2;
          }
          if (media.backgroundImage && media.backgroundImage.startsWith('http')) {
            cloudMedia.backgroundImage = media.backgroundImage;
          }
          if (media.videoThumbnail && media.videoThumbnail.startsWith('http')) {
            cloudMedia.videoThumbnail = media.videoThumbnail;
          }

          if (Object.keys(cloudMedia).length > 0) {
            saveGhostArmyMediaData(nodeId, cloudMedia).then(firestoreSuccess => {
              if (firestoreSuccess) {
                console.log('[GhostArmyEditor] Synced to Firestore:', nodeId);
                setIsSyncedToCloud(true);
              }
            });
          }
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return true;
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 5000);
        return false;
      }
    } catch (error) {
      console.error('Save failed:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 5000);
      return false;
    }
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedNodes(new Set(ghostArmyStory.nodes.map(n => n.id)));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  const getUploadedCount = () => {
    if (!mediaConfig) return 0;
    return Object.values(mediaConfig.nodes).filter(
      n => n.videoUrl || n.backgroundImage
    ).length;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-editorial text-3xl font-bold">Ghost Army Editor</h1>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium ${
                  isSyncedToCloud
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}>
                  {isSyncedToCloud ? (
                    <>
                      <Cloud size={12} />
                      Cloud Enabled
                    </>
                  ) : (
                    <>
                      <CloudOff size={12} />
                      Local Only
                    </>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">
                Upload videos and images for the Ghost Army story experience
              </p>
            </div>

            {/* Save Status + Actions */}
            <div className="flex items-center gap-4">
              {/* Storage Info */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <HardDrive size={14} />
                <span>{storageInfo.used} / {storageInfo.available}</span>
              </div>

              {/* Refresh Button */}
              <button
                onClick={async () => {
                  setIsLoading(true);
                  await initGhostArmyMediaCache();
                  const config = await loadGhostArmyMediaAsync();
                  setMediaConfig(config);
                  const info = await getIndexedDBStorageInfo();
                  setStorageInfo(info);
                  setIsLoading(false);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
              >
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                Refresh
              </button>

              {/* Save Status */}
              <AnimatePresence mode="wait">
                {saveStatus === 'saving' && (
                  <motion.div
                    key="saving"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary text-sm font-medium"
                  >
                    <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                    Saving...
                  </motion.div>
                )}
                {saveStatus === 'saved' && (
                  <motion.div
                    key="saved"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium"
                  >
                    <CheckCircle2 size={16} />
                    {isSyncedToCloud ? 'Saved to Cloud' : 'Saved to Browser'}
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium"
                  >
                    <AlertCircle size={16} />
                    Save Failed - Storage Full?
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 p-4 rounded-xl bg-card border border-border">
            <div>
              <p className="text-2xl font-bold">{ghostArmyStory.nodes.length}</p>
              <p className="text-xs text-muted-foreground">Total Nodes</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold text-emerald-400">{getUploadedCount()}</p>
              <p className="text-xs text-muted-foreground">With Media</p>
            </div>
            <div className="h-10 w-px bg-border" />
            <div>
              <p className="text-2xl font-bold">{ghostArmyStory.totalXP}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
            <div className="flex-1" />
            <div className="flex gap-2">
              <button
                onClick={expandAll}
                className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80 transition-colors"
              >
                Collapse All
              </button>
            </div>
          </div>
        </div>

        {/* Story Info */}
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
          <h2 className="font-bold mb-2">{ghostArmyStory.title}</h2>
          <p className="text-sm text-muted-foreground mb-2">{ghostArmyStory.description}</p>
          <p className="text-xs text-primary">
            Learning Arc: {ghostArmyStory.learningArc}
          </p>
        </div>

        {/* Node Editors */}
        <div className="space-y-4">
          {ghostArmyStory.nodes.map((node, index) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NodeEditor
                node={node}
                media={mediaConfig?.nodes[node.id] || null}
                onUpdate={handleNodeUpdate}
                isExpanded={expandedNodes.has(node.id)}
                onToggle={() => toggleNode(node.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* Help text */}
        <div className="mt-8 p-4 rounded-xl bg-muted/50 text-sm text-muted-foreground">
          <h3 className="font-bold mb-2">Tips:</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Videos are stored locally in your browser using IndexedDB (supports large files)</li>
            <li>Max file size: 50MB per video/image</li>
            <li>Supported formats: MP4, WebM, MOV for video; PNG, JPG, WebP for images</li>
            <li>Media is auto-saved immediately when uploaded</li>
            <li>Clearing browser data will remove uploaded media</li>
            <li>For best performance, compress videos to under 20MB when possible</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

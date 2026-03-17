import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Music, Search, Upload, Check, AlertCircle, Play, Pause, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  isSupabaseConfigured,
  listFiles,
  uploadFile,
  MediaFile
} from '@/lib/supabase';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: MediaFile) => void;
  allowedTypes?: ('image' | 'video' | 'audio')[];
  title?: string;
}

// Cache for video thumbnails
const thumbnailCache = new Map<string, string>();

// Generate thumbnail from video - tries multiple approaches for CORS issues
function generateVideoThumbnail(videoUrl: string): Promise<string> {
  // Return cached thumbnail if available
  if (thumbnailCache.has(videoUrl)) {
    return Promise.resolve(thumbnailCache.get(videoUrl)!);
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.preload = 'auto';

    // Try without crossOrigin first (works for same-origin and data URLs)
    // If that fails due to tainted canvas, we'll just show the video icon

    let hasResolved = false;
    const resolveOnce = (value: string) => {
      if (!hasResolved) {
        hasResolved = true;
        resolve(value);
      }
    };

    // Timeout after 5 seconds
    const timeout = setTimeout(() => {
      console.log('[Thumbnail] Timeout for:', videoUrl.substring(0, 50));
      resolveOnce('');
      video.remove();
    }, 5000);

    video.onloadeddata = () => {
      // Seek to 0.5 seconds or start for short videos
      video.currentTime = Math.min(0.5, video.duration * 0.1);
    };

    video.onseeked = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
          thumbnailCache.set(videoUrl, thumbnail);
          resolveOnce(thumbnail);
        } else {
          resolveOnce('');
        }
      } catch (err) {
        // Canvas tainted by cross-origin data - can't generate thumbnail
        console.log('[Thumbnail] Canvas tainted, using fallback');
        resolveOnce('');
      }
      video.remove();
    };

    video.onerror = () => {
      clearTimeout(timeout);
      console.log('[Thumbnail] Video error for:', videoUrl.substring(0, 50));
      resolveOnce('');
      video.remove();
    };

    video.src = videoUrl;
    video.load();
  });
}

export function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['image', 'video', 'audio'],
  title = 'Select Media',
}: MediaPickerProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const loadFiles = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const mediaFiles = await listFiles();
    // Filter by allowed types
    const filtered = mediaFiles.filter(f => allowedTypes.includes(f.type));
    setFiles(filtered);
    setLoading(false);
  }, [isConfigured, allowedTypes]);

  useEffect(() => {
    if (isOpen) {
      loadFiles();
      setSelectedFile(null);
      setSearchQuery('');
    }
  }, [isOpen, loadFiles]);

  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !isConfigured) return;
    const file = e.target.files[0];

    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);

    if (result) {
      setFiles(prev => [result, ...prev]);
      setSelectedFile(result);
      toast.success('File uploaded');
    } else {
      toast.error('Upload failed');
    }
  };

  const handleConfirm = () => {
    if (selectedFile) {
      onSelect(selectedFile);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold text-lg text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>

          {!isConfigured ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Firebase Not Configured</h3>
                <p className="text-muted-foreground text-sm">
                  Configure Firebase to enable media uploads
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="flex items-center gap-4 p-4 border-b border-border">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                  />
                </div>
                <button
                  onClick={() => loadFiles()}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                  title="Refresh file list"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                </button>
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                  <Upload size={18} />
                  {uploading ? 'Uploading...' : 'Upload'}
                  <input
                    type="file"
                    accept={allowedTypes.map(t => `${t}/*`).join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Content Area - Grid + Preview */}
              <div className="flex-1 overflow-hidden flex">
                {/* File Grid */}
                <div className={`flex-1 overflow-auto p-4 ${selectedFile?.type === 'video' ? 'lg:w-1/2' : ''}`}>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                    </div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12">
                      <Image size={48} className="mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground font-medium">No files found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {searchQuery ? 'Try a different search term' : 'Upload files using the button above'}
                      </p>
                      <button
                        onClick={() => loadFiles()}
                        className="mt-4 text-sm text-primary hover:underline"
                      >
                        Refresh list
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredFiles.map((file) => (
                        <PickerMediaCard
                          key={file.id}
                          file={file}
                          isSelected={selectedFile?.id === file.id}
                          onClick={() => setSelectedFile(file)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Preview Panel */}
                {selectedFile?.type === 'video' && (
                  <div className="hidden lg:flex w-1/2 border-l border-border flex-col">
                    <VideoPreviewPanel file={selectedFile} />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-3 p-4 border-t border-border bg-muted/30">
                {/* Mobile Video Preview */}
                {selectedFile?.type === 'video' && (
                  <div className="lg:hidden">
                    <MobileVideoPreview file={selectedFile} />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground truncate flex-1 mr-4">
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Select a file'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!selectedFile}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Select
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Mobile Video Preview Component
function MobileVideoPreview({ file }: { file: MediaFile }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
      <video
        ref={videoRef}
        src={file.url}
        className="w-full h-full object-contain"
        playsInline
        onEnded={() => setIsPlaying(false)}
        onPause={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
      />
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
      >
        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
          {isPlaying ? (
            <Pause size={20} className="text-gray-900" />
          ) : (
            <Play size={20} className="text-gray-900 ml-0.5" />
          )}
        </div>
      </button>
    </div>
  );
}

// Video Preview Panel Component
function VideoPreviewPanel({ file }: { file: MediaFile }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Reset when file changes
  useEffect(() => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  }, [file.id]);

  return (
    <div className="flex flex-col h-full p-4">
      <h3 className="font-medium text-sm mb-3">Preview</h3>
      <div className="relative flex-1 bg-black rounded-xl overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          src={file.url}
          className="max-w-full max-h-full object-contain"
          onEnded={() => setIsPlaying(false)}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
        >
          <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white flex items-center justify-center shadow-lg">
            {isPlaying ? (
              <Pause size={28} className="text-gray-900" />
            ) : (
              <Play size={28} className="text-gray-900 ml-1" />
            )}
          </div>
        </button>
      </div>
      <div className="mt-3">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">Click to preview before selecting</p>
      </div>
    </div>
  );
}

// Video Frame Thumbnail - renders video and shows a specific frame
function VideoFrameThumbnail({ src, onReady }: { src: string; onReady?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleCanPlay = () => {
      // Seek to 0.5 seconds for a better frame
      video.currentTime = 0.5;
    };

    const handleSeeked = () => {
      setReady(true);
      onReady?.();
    };

    const handleError = () => {
      // Even on error, mark as ready to hide loading state
      setReady(true);
    };

    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };
  }, [onReady]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      playsInline
      preload="auto"
      className={`w-full h-full object-cover transition-opacity duration-300 ${ready ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

// Picker Media Card Component with Video Thumbnail
function PickerMediaCard({
  file,
  isSelected,
  onClick,
}: {
  file: MediaFile;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [showInlinePreview, setShowInlinePreview] = useState(false);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const Icon = file.type === 'image' ? Image : file.type === 'video' ? Video : Music;

  // Generate thumbnail for videos using canvas approach
  useEffect(() => {
    if (file.type === 'video') {
      setIsLoading(true);
      setUseFallback(false);

      generateVideoThumbnail(file.url)
        .then((thumb) => {
          if (thumb) {
            setThumbnail(thumb);
            setIsLoading(false);
          } else {
            // Canvas failed (CORS), use video element fallback
            setUseFallback(true);
          }
        })
        .catch(() => {
          // Error, use video element fallback
          setUseFallback(true);
        });
    } else {
      setIsLoading(false);
    }
  }, [file.url, file.type]);

  // Handle video fallback ready
  const handleFallbackReady = () => {
    setIsLoading(false);
  };

  // Handle inline preview toggle (for mobile/touch)
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInlinePreview(true);
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`relative w-full aspect-video rounded-xl overflow-hidden bg-gray-900 border-2 transition-all ${
          isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground'
        }`}
      >
        {file.type === 'image' ? (
          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
        ) : file.type === 'video' ? (
          <>
            {/* Show canvas-generated thumbnail OR video element fallback */}
            {thumbnail ? (
              <img src={thumbnail} alt={file.name} className="w-full h-full object-cover" />
            ) : useFallback ? (
              <VideoFrameThumbnail src={file.url} onReady={handleFallbackReady} />
            ) : null}

            {/* Loading overlay */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 gap-2">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white/30 border-t-white" />
                <span className="text-[10px] text-white/60">Loading preview...</span>
              </div>
            )}

            {/* Video badge */}
            <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px]">
              <Play size={10} className="fill-white" />
              <span>Video</span>
            </div>

            {/* Play button overlay to preview */}
            {!isLoading && (
              <div
                className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                onClick={handlePlayClick}
              >
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                  <Play size={20} className="text-white ml-1" />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={24} className="text-muted-foreground" />
          </div>
        )}

        {/* Selected overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
              <Check size={20} className="text-primary-foreground" />
            </div>
          </div>
        )}

        {/* File name */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2">
          <p className="text-[11px] text-white truncate font-medium">{file.name}</p>
        </div>
      </button>

      {/* Inline video preview overlay (for touch/click to preview) */}
      {showInlinePreview && file.type === 'video' && (
        <div className="absolute inset-0 z-10 rounded-xl overflow-hidden bg-black">
          <video
            ref={previewVideoRef}
            src={file.url}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInlinePreview(false);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default MediaPicker;

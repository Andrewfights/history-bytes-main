import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Image, Video, Music, Search, Filter, Grid, List,
  Trash2, Copy, X, Play, Pause, ExternalLink, AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import {
  isSupabaseConfigured,
  listFiles,
  deleteFile,
  uploadFile,
  formatFileSize,
  MediaFile
} from '@/lib/supabase';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'image' | 'video' | 'audio';

export default function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const isConfigured = isSupabaseConfigured();

  const loadFiles = useCallback(async () => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const mediaFiles = await listFiles();
    setFiles(mediaFiles);
    setLoading(false);
  }, [isConfigured]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = files.filter(file => {
    const matchesFilter = filter === 'all' || file.type === filter;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!isConfigured) {
      toast.error('Supabase not configured');
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    await handleUpload(droppedFiles);
  }, [isConfigured]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    await handleUpload(selectedFiles);
  };

  const handleUpload = async (filesToUpload: File[]) => {
    if (!isConfigured) {
      toast.error('Supabase not configured');
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (const file of filesToUpload) {
      const result = await uploadFile(file);
      if (result) {
        successCount++;
        setFiles(prev => [result, ...prev]);
      }
    }

    setUploading(false);

    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} file${successCount > 1 ? 's' : ''}`);
    }
  };

  const handleDelete = async (file: MediaFile) => {
    const success = await deleteFile(file.id);
    if (success) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      setSelectedFile(null);
      toast.success('File deleted');
    } else {
      toast.error('Failed to delete file');
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  if (!isConfigured) {
    return (
      <div className="max-w-5xl">
        <div className="mb-8">
          <h1 className="font-editorial text-3xl font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-1">Upload and manage images, videos, and audio files</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6 text-center"
        >
          <AlertCircle size={48} className="mx-auto mb-4 text-amber-400" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Supabase Not Configured</h2>
          <p className="text-muted-foreground mb-4">
            To use the Media Library, you need to set up Supabase storage.
          </p>
          <div className="bg-card border border-border rounded-lg p-4 text-left max-w-md mx-auto">
            <p className="text-sm font-medium text-foreground mb-2">Add to your .env file:</p>
            <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto font-mono">
{`VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key`}
            </pre>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-3xl font-bold text-foreground">Media Library</h1>
          <p className="text-muted-foreground mt-1">
            {files.length} file{files.length !== 1 ? 's' : ''} uploaded
          </p>
        </div>
        <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors cursor-pointer">
          <Upload size={18} />
          Upload Files
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-card border border-border focus:border-primary outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-1">
          {(['all', 'image', 'video', 'audio'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid size={18} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-muted-foreground'
        }`}
      >
        <Upload size={32} className={`mx-auto mb-3 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-foreground font-medium">
          {uploading ? 'Uploading...' : 'Drop files here to upload'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Supports images, videos, and audio files
        </p>
      </div>

      {/* File Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No files found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredFiles.map((file) => (
            <MediaCard
              key={file.id}
              file={file}
              onClick={() => setSelectedFile(file)}
              isSelected={selectedFile?.id === file.id}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredFiles.map((file) => (
            <MediaRow
              key={file.id}
              file={file}
              onClick={() => setSelectedFile(file)}
              onCopy={() => handleCopyUrl(file.url)}
              onDelete={() => handleDelete(file)}
            />
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <AnimatePresence>
        {selectedFile && (
          <FilePreviewModal
            file={selectedFile}
            onClose={() => setSelectedFile(null)}
            onCopy={() => handleCopyUrl(selectedFile.url)}
            onDelete={() => handleDelete(selectedFile)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Media Card Component
function MediaCard({
  file,
  onClick,
  isSelected,
}: {
  file: MediaFile;
  onClick: () => void;
  isSelected: boolean;
}) {
  const Icon = file.type === 'image' ? Image : file.type === 'video' ? Video : Music;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={`relative aspect-square rounded-xl overflow-hidden bg-card border transition-all group ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'
      }`}
    >
      {file.type === 'image' ? (
        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <Icon size={32} className="text-muted-foreground" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-xs text-white truncate">{file.name}</p>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle size={20} className="text-primary" />
        </div>
      )}
    </motion.button>
  );
}

// Media Row Component
function MediaRow({
  file,
  onClick,
  onCopy,
  onDelete,
}: {
  file: MediaFile;
  onClick: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const Icon = file.type === 'image' ? Image : file.type === 'video' ? Video : Music;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 bg-card border border-border rounded-xl p-3 hover:border-primary/50 transition-colors"
    >
      <button onClick={onClick} className="flex-1 flex items-center gap-4 text-left">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {file.type === 'image' ? (
            <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
          ) : (
            <Icon size={20} className="text-muted-foreground" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.type} | {formatFileSize(file.size)}
          </p>
        </div>
      </button>
      <div className="flex items-center gap-2">
        <button
          onClick={onCopy}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <Copy size={16} />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
}

// File Preview Modal
function FilePreviewModal({
  file,
  onClose,
  onCopy,
  onDelete,
}: {
  file: MediaFile;
  onClose: () => void;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Preview Area */}
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {file.type === 'image' && (
            <img src={file.url} alt={file.name} className="max-w-full max-h-full object-contain" />
          )}
          {file.type === 'video' && (
            <video
              src={file.url}
              controls
              className="max-w-full max-h-full"
            />
          )}
          {file.type === 'audio' && (
            <div className="text-center p-8">
              <Music size={64} className="mx-auto mb-4 text-muted-foreground" />
              <audio src={file.url} controls className="w-full max-w-md" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Info Area */}
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-1">{file.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {file.type} | {formatFileSize(file.size)} | {new Date(file.createdAt).toLocaleDateString()}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onCopy}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Copy size={16} />
              Copy URL
            </button>
            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted text-foreground font-medium hover:bg-muted/80 transition-colors"
            >
              <ExternalLink size={16} />
              Open
            </a>
            <button
              onClick={onDelete}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive font-medium hover:bg-destructive/20 transition-colors ml-auto"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

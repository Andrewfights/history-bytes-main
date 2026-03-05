import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image, Video, Music, Search, Upload, Check, AlertCircle } from 'lucide-react';
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

              {/* File Grid */}
              <div className="flex-1 overflow-auto p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No files found</p>
                    <p className="text-sm text-muted-foreground mt-1">Upload files to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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

              {/* Footer */}
              <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
                <p className="text-sm text-muted-foreground">
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
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Picker Media Card Component
function PickerMediaCard({
  file,
  isSelected,
  onClick,
}: {
  file: MediaFile;
  isSelected: boolean;
  onClick: () => void;
}) {
  const Icon = file.type === 'image' ? Image : file.type === 'video' ? Video : Music;

  return (
    <button
      onClick={onClick}
      className={`relative aspect-square rounded-xl overflow-hidden bg-muted border-2 transition-all ${
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground'
      }`}
    >
      {file.type === 'image' ? (
        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Icon size={24} className="text-muted-foreground" />
        </div>
      )}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Check size={18} className="text-primary-foreground" />
          </div>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
        <p className="text-[10px] text-white truncate">{file.name}</p>
      </div>
    </button>
  );
}

export default MediaPicker;

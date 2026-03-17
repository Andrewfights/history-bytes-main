/**
 * MapEditor - Admin component for creating/editing interactive maps
 * Allows uploading images, placing hotspots at exact positions,
 * and configuring click actions for each hotspot
 *
 * Uses Firebase Firestore for cloud persistence
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Save,
  Trash2,
  Image as ImageIcon,
  MousePointer2,
  Move,
  Square,
  Circle,
  Eye,
  EyeOff,
  Copy,
  Settings,
  ChevronRight,
  Upload,
  X,
  MapPin,
  Crosshair,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Cloud,
  CloudOff,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  InteractiveMap,
  MapHotspot,
  HotspotActionType,
  createHotspot,
  DEFAULT_HOTSPOT_STYLE,
} from '@/data/interactiveMaps';
import { MediaPicker } from './MediaPicker';
import type { MediaFile } from '@/lib/supabase';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  getInteractiveMaps,
  getInteractiveMap,
  saveInteractiveMap,
  deleteInteractiveMap,
  subscribeToInteractiveMaps,
  type FirestoreInteractiveMap,
} from '@/lib/firestore';

// Editor modes
type EditorMode = 'select' | 'place' | 'move';

// Convert Firestore map to local InteractiveMap type
function firestoreToLocal(fsMap: FirestoreInteractiveMap): InteractiveMap {
  return {
    ...fsMap,
    createdAt: fsMap.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: fsMap.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
}

// Convert local InteractiveMap to Firestore type
function localToFirestore(map: InteractiveMap): FirestoreInteractiveMap {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { createdAt, updatedAt, ...rest } = map;
  return rest as FirestoreInteractiveMap;
}

export default function MapEditor() {
  // Map state
  const [maps, setMaps] = useState<InteractiveMap[]>([]);
  const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
  const [editingMap, setEditingMap] = useState<InteractiveMap | null>(null);

  // Hotspot state
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('select');

  // UI state
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [showNewMapModal, setShowNewMapModal] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [zoom, setZoom] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncedToCloud, setIsSyncedToCloud] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load maps from Firebase on mount and subscribe to real-time updates
  useEffect(() => {
    setIsLoading(true);
    const firebaseConfigured = isFirebaseConfigured();
    setIsSyncedToCloud(firebaseConfigured);

    if (firebaseConfigured) {
      // Initial load
      getInteractiveMaps().then((fsMaps) => {
        setMaps(fsMaps.map(firestoreToLocal));
        setIsLoading(false);
      }).catch((err) => {
        console.error('Failed to load maps from Firebase:', err);
        setIsLoading(false);
      });

      // Subscribe to real-time updates
      const unsubscribe = subscribeToInteractiveMaps((fsMaps) => {
        setMaps(fsMaps.map(firestoreToLocal));
      });

      return () => unsubscribe();
    } else {
      // No Firebase - show warning
      setIsLoading(false);
      toast.error('Firebase not configured. Maps will not be saved.');
    }
  }, []);

  // Load selected map
  useEffect(() => {
    if (selectedMapId) {
      const map = maps.find(m => m.id === selectedMapId);
      if (map) {
        setEditingMap({ ...map });
        setSelectedHotspotId(null);
      }
    } else {
      setEditingMap(null);
    }
  }, [selectedMapId, maps]);

  const selectedHotspot = editingMap?.hotspots.find(h => h.id === selectedHotspotId);

  // Handle canvas click for placing hotspots
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!editingMap || !canvasRef.current || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (editorMode === 'place') {
      // Create new hotspot at click position
      const newHotspot = createHotspot(x, y);
      setEditingMap({
        ...editingMap,
        hotspots: [...editingMap.hotspots, newHotspot],
      });
      setSelectedHotspotId(newHotspot.id);
      setEditorMode('select');
      toast.success('Hotspot placed! Configure it in the panel.');
    } else if (editorMode === 'select') {
      // Check if clicked on a hotspot
      const clickedHotspot = editingMap.hotspots.find(h => {
        const hLeft = h.x - h.width / 2;
        const hRight = h.x + h.width / 2;
        const hTop = h.y - h.height / 2;
        const hBottom = h.y + h.height / 2;
        return x >= hLeft && x <= hRight && y >= hTop && y <= hBottom;
      });

      if (clickedHotspot) {
        setSelectedHotspotId(clickedHotspot.id);
      } else {
        setSelectedHotspotId(null);
      }
    }
  }, [editingMap, editorMode]);

  // Handle hotspot drag
  const handleHotspotDrag = useCallback((
    hotspotId: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!editingMap || !imageRef.current || editorMode !== 'move') return;

    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    const hotspot = editingMap.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;

    const startHotspotX = hotspot.x;
    const startHotspotY = hotspot.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const rect = imageRef.current!.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100, startHotspotX + deltaX));
      const newY = Math.max(0, Math.min(100, startHotspotY + deltaY));

      setEditingMap(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          hotspots: prev.hotspots.map(h =>
            h.id === hotspotId ? { ...h, x: newX, y: newY } : h
          ),
        };
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [editingMap, editorMode]);

  // Update hotspot property
  const updateHotspot = useCallback((hotspotId: string, updates: Partial<MapHotspot>) => {
    if (!editingMap) return;

    setEditingMap({
      ...editingMap,
      hotspots: editingMap.hotspots.map(h =>
        h.id === hotspotId ? { ...h, ...updates } : h
      ),
    });
  }, [editingMap]);

  // Delete hotspot
  const deleteHotspot = useCallback((hotspotId: string) => {
    if (!editingMap) return;

    setEditingMap({
      ...editingMap,
      hotspots: editingMap.hotspots.filter(h => h.id !== hotspotId),
    });
    setSelectedHotspotId(null);
    toast.success('Hotspot deleted');
  }, [editingMap]);

  // Duplicate hotspot
  const duplicateHotspot = useCallback((hotspotId: string) => {
    if (!editingMap) return;

    const hotspot = editingMap.hotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;

    const newHotspot: MapHotspot = {
      ...hotspot,
      id: `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      x: hotspot.x + 5,
      y: hotspot.y + 5,
      label: `${hotspot.label} (Copy)`,
    };

    setEditingMap({
      ...editingMap,
      hotspots: [...editingMap.hotspots, newHotspot],
    });
    setSelectedHotspotId(newHotspot.id);
    toast.success('Hotspot duplicated');
  }, [editingMap]);

  // Save map to Firebase
  const handleSave = useCallback(async () => {
    if (!editingMap) return;

    setIsSaving(true);
    try {
      const fsMap = localToFirestore(editingMap);
      const success = await saveInteractiveMap(fsMap);
      if (success) {
        toast.success('Map saved to cloud');
      } else {
        throw new Error('Save failed');
      }
    } catch (err) {
      console.error('Failed to save map:', err);
      toast.error('Failed to save map');
    } finally {
      setIsSaving(false);
    }
  }, [editingMap]);

  // Create new map in Firebase
  const handleCreateMap = useCallback(async (imageUrl: string, width: number, height: number) => {
    const newMap: InteractiveMap = {
      id: `map-${Date.now()}`,
      name: newMapName || 'Untitled Map',
      imageUrl,
      imageWidth: width,
      imageHeight: height,
      hotspots: [],
      showAllHotspots: true,
      enableZoom: false,
      enablePan: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const fsMap = localToFirestore(newMap);
      const success = await saveInteractiveMap(fsMap);
      if (success) {
        setSelectedMapId(newMap.id);
        setShowNewMapModal(false);
        setNewMapName('');
        toast.success('Map created');
      } else {
        throw new Error('Create failed');
      }
    } catch (err) {
      console.error('Failed to create map:', err);
      toast.error('Failed to create map');
    }
  }, [newMapName]);

  // Handle image selection for new map
  const handleImageSelect = useCallback((file: MediaFile) => {
    setShowMediaPicker(false);

    // Get image dimensions
    const img = new Image();
    img.onload = () => {
      handleCreateMap(file.url, img.width, img.height);
    };
    img.src = file.url;
  }, [handleCreateMap]);

  // Delete map from Firebase
  const handleDeleteMap = useCallback(async (mapId: string) => {
    if (!confirm('Are you sure you want to delete this map?')) return;

    try {
      const success = await deleteInteractiveMap(mapId);
      if (success) {
        if (selectedMapId === mapId) {
          setSelectedMapId(null);
          setEditingMap(null);
        }
        toast.success('Map deleted');
      } else {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.error('Failed to delete map:', err);
      toast.error('Failed to delete map');
    }
  }, [selectedMapId]);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-editorial text-2xl font-bold text-foreground">
              Interactive Map Editor
            </h1>
            {/* Cloud sync indicator */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
              isSyncedToCloud
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}>
              {isSyncedToCloud ? <Cloud size={12} /> : <CloudOff size={12} />}
              {isSyncedToCloud ? 'Cloud Sync' : 'No Cloud'}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Create clickable hotspots on images for games and journeys
          </p>
        </div>

        <div className="flex items-center gap-2">
          {editingMap && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Map'}
            </button>
          )}
          <button
            onClick={() => setShowNewMapModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={18} />
            New Map
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map List Sidebar */}
        <aside className="w-64 border-r border-border bg-card overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Your Maps
            </h3>
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-muted-foreground" size={24} />
              </div>
            ) : maps.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No maps yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-1">
                {maps.map(map => (
                  <button
                    key={map.id}
                    onClick={() => setSelectedMapId(map.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors group ${
                      selectedMapId === map.id
                        ? 'bg-primary/10 border border-primary/30'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        <img
                          src={map.imageUrl}
                          alt={map.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{map.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {map.hotspots.length} hotspot{map.hotspots.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteMap(map.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-red-400 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Editor Area */}
        {editingMap ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 flex flex-col overflow-hidden bg-zinc-900">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-2 border-b border-border bg-card">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditorMode('select')}
                    className={`p-2 rounded-lg transition-colors ${
                      editorMode === 'select'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title="Select (V)"
                  >
                    <MousePointer2 size={18} />
                  </button>
                  <button
                    onClick={() => setEditorMode('place')}
                    className={`p-2 rounded-lg transition-colors ${
                      editorMode === 'place'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title="Place Hotspot (P)"
                  >
                    <Crosshair size={18} />
                  </button>
                  <button
                    onClick={() => setEditorMode('move')}
                    className={`p-2 rounded-lg transition-colors ${
                      editorMode === 'move'
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                    title="Move Hotspot (M)"
                  >
                    <Move size={18} />
                  </button>

                  <div className="w-px h-6 bg-border mx-2" />

                  <button
                    onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <span className="text-xs text-muted-foreground w-12 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                    title="Reset Zoom"
                  >
                    <RotateCcw size={18} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {editorMode === 'place' && 'Click on the image to place a hotspot'}
                    {editorMode === 'select' && 'Click a hotspot to select it'}
                    {editorMode === 'move' && 'Drag a hotspot to move it'}
                  </span>
                </div>
              </div>

              {/* Canvas */}
              <div className="flex-1 overflow-auto p-4">
                <div
                  ref={canvasRef}
                  className="relative inline-block mx-auto"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
                >
                  <img
                    ref={imageRef}
                    src={editingMap.imageUrl}
                    alt={editingMap.name}
                    className={`max-w-none ${editorMode === 'place' ? 'cursor-crosshair' : 'cursor-default'}`}
                    onClick={handleCanvasClick}
                    draggable={false}
                  />

                  {/* Hotspots Overlay */}
                  {editingMap.hotspots.map(hotspot => (
                    <div
                      key={hotspot.id}
                      className={`absolute border-2 transition-all ${
                        selectedHotspotId === hotspot.id
                          ? 'border-primary ring-2 ring-primary/50'
                          : 'border-blue-400 hover:border-blue-300'
                      } ${editorMode === 'move' ? 'cursor-move' : 'cursor-pointer'} ${
                        hotspot.shape === 'circle' ? 'rounded-full' : 'rounded'
                      }`}
                      style={{
                        left: `${hotspot.x - hotspot.width / 2}%`,
                        top: `${hotspot.y - hotspot.height / 2}%`,
                        width: `${hotspot.width}%`,
                        height: `${hotspot.height}%`,
                        backgroundColor: selectedHotspotId === hotspot.id
                          ? 'rgba(59, 130, 246, 0.4)'
                          : 'rgba(59, 130, 246, 0.2)',
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedHotspotId(hotspot.id);
                      }}
                      onMouseDown={(e) => {
                        if (editorMode === 'move') {
                          handleHotspotDrag(hotspot.id, e);
                        }
                      }}
                    >
                      {/* Label */}
                      {hotspot.showLabel && (
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-black/70 text-white text-xs">
                            {hotspot.iconEmoji && `${hotspot.iconEmoji} `}
                            {hotspot.label}
                          </span>
                        </div>
                      )}

                      {/* Resize handles (when selected) */}
                      {selectedHotspotId === hotspot.id && (
                        <>
                          <div className="absolute -right-1 -bottom-1 w-3 h-3 bg-primary rounded-full cursor-se-resize" />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <aside className="w-80 border-l border-border bg-card overflow-y-auto">
              {selectedHotspot ? (
                <HotspotEditor
                  hotspot={selectedHotspot}
                  onUpdate={(updates) => updateHotspot(selectedHotspot.id, updates)}
                  onDelete={() => deleteHotspot(selectedHotspot.id)}
                  onDuplicate={() => duplicateHotspot(selectedHotspot.id)}
                />
              ) : (
                <MapSettings
                  map={editingMap}
                  onUpdate={(updates) => setEditingMap({ ...editingMap, ...updates })}
                />
              )}
            </aside>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <ImageIcon size={48} className="mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">
                Select a map from the sidebar or create a new one
              </p>
              <button
                onClick={() => setShowNewMapModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
              >
                <Plus size={18} />
                Create New Map
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Map Modal */}
      <AnimatePresence>
        {showNewMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
            onClick={() => setShowNewMapModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-card rounded-xl p-6 max-w-md w-full"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold mb-4">Create New Map</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Map Name</label>
                  <input
                    type="text"
                    value={newMapName}
                    onChange={(e) => setNewMapName(e.target.value)}
                    placeholder="e.g., Pearl Harbor Attack Map"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Background Image</label>
                  <button
                    onClick={() => setShowMediaPicker(true)}
                    className="w-full py-8 rounded-xl border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload size={24} className="mx-auto mb-2" />
                    <span className="text-sm">Select from Media Library</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowNewMapModal(false)}
                  className="px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Picker */}
      <MediaPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={handleImageSelect}
        allowedTypes={['image']}
        title="Select Map Image"
      />
    </div>
  );
}

// Hotspot Editor Panel
function HotspotEditor({
  hotspot,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  hotspot: MapHotspot;
  onUpdate: (updates: Partial<MapHotspot>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}) {
  const actionTypes: { value: HotspotActionType; label: string }[] = [
    { value: 'info', label: 'Show Info' },
    { value: 'modal', label: 'Open Modal' },
    { value: 'navigate', label: 'Navigate' },
    { value: 'lesson', label: 'Start Lesson' },
    { value: 'quiz', label: 'Start Quiz' },
    { value: 'audio', label: 'Play Audio' },
    { value: 'video', label: 'Play Video' },
    { value: 'link', label: 'External Link' },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Hotspot Properties</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onDuplicate}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded hover:bg-red-500/20 text-red-400"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Label</label>
          <input
            type="text"
            value={hotspot.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Icon Emoji</label>
          <input
            type="text"
            value={hotspot.iconEmoji || ''}
            onChange={(e) => onUpdate({ iconEmoji: e.target.value })}
            placeholder="e.g., 📍"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Tooltip Text</label>
          <input
            type="text"
            value={hotspot.tooltipText || ''}
            onChange={(e) => onUpdate({ tooltipText: e.target.value })}
            placeholder="Text shown on hover"
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          />
        </div>
      </div>

      {/* Position */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Position & Size</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">X Position (%)</label>
            <input
              type="number"
              value={Math.round(hotspot.x * 10) / 10}
              onChange={(e) => onUpdate({ x: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Y Position (%)</label>
            <input
              type="number"
              value={Math.round(hotspot.y * 10) / 10}
              onChange={(e) => onUpdate({ y: parseFloat(e.target.value) || 0 })}
              min={0}
              max={100}
              step={0.1}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Width (%)</label>
            <input
              type="number"
              value={Math.round(hotspot.width * 10) / 10}
              onChange={(e) => onUpdate({ width: parseFloat(e.target.value) || 5 })}
              min={1}
              max={100}
              step={0.5}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Height (%)</label>
            <input
              type="number"
              value={Math.round(hotspot.height * 10) / 10}
              onChange={(e) => onUpdate({ height: parseFloat(e.target.value) || 5 })}
              min={1}
              max={100}
              step={0.5}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Shape</label>
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ shape: 'rect' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                hotspot.shape === 'rect'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Square size={16} />
              <span className="text-xs">Rectangle</span>
            </button>
            <button
              onClick={() => onUpdate({ shape: 'circle' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border transition-colors ${
                hotspot.shape === 'circle'
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-muted-foreground'
              }`}
            >
              <Circle size={16} />
              <span className="text-xs">Circle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Visibility */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Visibility</h4>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hotspot.isVisible}
            onChange={(e) => onUpdate({ isVisible: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">Visible</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hotspot.showLabel}
            onChange={(e) => onUpdate({ showLabel: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">Show Label</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={hotspot.showOnHover}
            onChange={(e) => onUpdate({ showOnHover: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">Show on Hover Only</span>
        </label>
      </div>

      {/* Action */}
      <div className="space-y-3 pt-3 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Click Action</h4>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Action Type</label>
          <select
            value={hotspot.action.type}
            onChange={(e) => onUpdate({
              action: { ...hotspot.action, type: e.target.value as HotspotActionType }
            })}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
          >
            {actionTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Action-specific fields */}
        {hotspot.action.type === 'info' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Info Text</label>
            <textarea
              value={hotspot.action.infoText || ''}
              onChange={(e) => onUpdate({
                action: { ...hotspot.action, infoText: e.target.value }
              })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
            />
          </div>
        )}

        {hotspot.action.type === 'modal' && (
          <>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Modal Title</label>
              <input
                type="text"
                value={hotspot.action.modalTitle || ''}
                onChange={(e) => onUpdate({
                  action: { ...hotspot.action, modalTitle: e.target.value }
                })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Modal Content</label>
              <textarea
                value={hotspot.action.modalContent || ''}
                onChange={(e) => onUpdate({
                  action: { ...hotspot.action, modalContent: e.target.value }
                })}
                rows={4}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
              />
            </div>
          </>
        )}

        {hotspot.action.type === 'navigate' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Route Path</label>
            <input
              type="text"
              value={hotspot.action.route || ''}
              onChange={(e) => onUpdate({
                action: { ...hotspot.action, route: e.target.value }
              })}
              placeholder="/journey/pearl-harbor"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        )}

        {hotspot.action.type === 'link' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">URL</label>
            <input
              type="url"
              value={hotspot.action.linkUrl || ''}
              onChange={(e) => onUpdate({
                action: { ...hotspot.action, linkUrl: e.target.value }
              })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        )}

        {(hotspot.action.type === 'audio' || hotspot.action.type === 'video') && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Media URL</label>
            <input
              type="url"
              value={hotspot.action.mediaUrl || ''}
              onChange={(e) => onUpdate({
                action: { ...hotspot.action, mediaUrl: e.target.value }
              })}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        )}

        {hotspot.action.type === 'lesson' && (
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Lesson ID</label>
            <input
              type="text"
              value={hotspot.action.lessonId || ''}
              onChange={(e) => onUpdate({
                action: { ...hotspot.action, lessonId: e.target.value }
              })}
              placeholder="ph-lesson-1"
              className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Map Settings Panel
function MapSettings({
  map,
  onUpdate,
}: {
  map: InteractiveMap;
  onUpdate: (updates: Partial<InteractiveMap>) => void;
}) {
  return (
    <div className="p-4 space-y-4">
      <h3 className="font-semibold">Map Settings</h3>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Map Name</label>
        <input
          type="text"
          value={map.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
        <textarea
          value={map.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm resize-none"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
        <input
          type="text"
          value={map.category || ''}
          onChange={(e) => onUpdate({ category: e.target.value })}
          placeholder="e.g., ww2, geography"
          className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:border-primary outline-none text-sm"
        />
      </div>

      <div className="space-y-3 pt-3 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase">Options</h4>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={map.showAllHotspots}
            onChange={(e) => onUpdate({ showAllHotspots: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">Show All Hotspots</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={map.enableZoom}
            onChange={(e) => onUpdate({ enableZoom: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">Enable Zoom</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={map.enablePan}
            onChange={(e) => onUpdate({ enablePan: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm">Enable Pan</span>
        </label>
      </div>

      <div className="pt-3 border-t border-border">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Image Info</h4>
        <p className="text-xs text-muted-foreground">
          Dimensions: {map.imageWidth} x {map.imageHeight}px
        </p>
        <p className="text-xs text-muted-foreground">
          Hotspots: {map.hotspots.length}
        </p>
      </div>
    </div>
  );
}

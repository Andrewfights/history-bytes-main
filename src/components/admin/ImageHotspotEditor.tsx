/**
 * ImageHotspotEditor - Reusable component for placing hotspots on images
 * Used in WW2ModuleEditor and other admin tools for questions/modules
 * that require location-based interactions
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  MousePointer2,
  Move,
  Save,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Edit3,
  GripVertical,
  Upload,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { MediaPicker } from './MediaPicker';
import type { MediaFile } from '@/lib/supabase';
import type { ModuleHotspot } from '@/types/moduleTypes';

type EditorMode = 'select' | 'place' | 'move';

interface ImageHotspotEditorProps {
  imageUrl?: string;
  hotspots: ModuleHotspot[];
  onImageChange: (url: string) => void;
  onHotspotsChange: (hotspots: ModuleHotspot[]) => Promise<void> | void;
  onClose: () => void;
  title?: string;
  instructions?: string;
}

export function ImageHotspotEditor({
  imageUrl,
  hotspots,
  onImageChange,
  onHotspotsChange,
  onClose,
  title = 'Edit Hotspots',
  instructions,
}: ImageHotspotEditorProps) {
  const [localHotspots, setLocalHotspots] = useState<ModuleHotspot[]>(hotspots);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('select');
  const [zoom, setZoom] = useState(1);
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [editingHotspot, setEditingHotspot] = useState<ModuleHotspot | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Sync local hotspots when prop changes
  useEffect(() => {
    setLocalHotspots(hotspots);
  }, [hotspots]);

  const selectedHotspot = localHotspots.find(h => h.id === selectedHotspotId);

  // Generate unique ID
  const generateId = () => `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Handle canvas click for placing hotspots
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (editorMode === 'place') {
      // Create new hotspot at click position
      const newHotspot: ModuleHotspot = {
        id: generateId(),
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        label: `Hotspot ${localHotspots.length + 1}`,
        description: '',
      };
      setLocalHotspots(prev => [...prev, newHotspot]);
      setSelectedHotspotId(newHotspot.id);
      setEditingHotspot(newHotspot);
      setEditorMode('select');
    } else if (editorMode === 'select') {
      // Check if clicked on a hotspot (within 3% radius)
      const clickedHotspot = localHotspots.find(h => {
        const dx = Math.abs(h.x - x);
        const dy = Math.abs(h.y - y);
        return dx < 3 && dy < 3;
      });

      if (clickedHotspot) {
        setSelectedHotspotId(clickedHotspot.id);
      } else {
        setSelectedHotspotId(null);
      }
    }
  }, [localHotspots, editorMode]);

  // Handle hotspot drag
  const handleHotspotMouseDown = useCallback((
    hotspotId: string,
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    if (!imageRef.current || editorMode !== 'move') return;

    e.stopPropagation();
    e.preventDefault();

    const hotspot = localHotspots.find(h => h.id === hotspotId);
    if (!hotspot) return;

    setSelectedHotspotId(hotspotId);

    const startX = e.clientX;
    const startY = e.clientY;
    const startHotspotX = hotspot.x;
    const startHotspotY = hotspot.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!imageRef.current) return;

      const rect = imageRef.current.getBoundingClientRect();
      const deltaX = ((moveEvent.clientX - startX) / rect.width) * 100;
      const deltaY = ((moveEvent.clientY - startY) / rect.height) * 100;

      const newX = Math.max(0, Math.min(100, startHotspotX + deltaX));
      const newY = Math.max(0, Math.min(100, startHotspotY + deltaY));

      setLocalHotspots(prev =>
        prev.map(h =>
          h.id === hotspotId
            ? { ...h, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 }
            : h
        )
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [localHotspots, editorMode]);

  // Delete hotspot
  const handleDeleteHotspot = (id: string) => {
    setLocalHotspots(prev => prev.filter(h => h.id !== id));
    if (selectedHotspotId === id) {
      setSelectedHotspotId(null);
    }
  };

  // Update hotspot
  const handleUpdateHotspot = (id: string, updates: Partial<ModuleHotspot>) => {
    setLocalHotspots(prev =>
      prev.map(h => (h.id === id ? { ...h, ...updates } : h))
    );
    if (editingHotspot?.id === id) {
      setEditingHotspot(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  // Save and close
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onHotspotsChange(localHotspots);
      onClose();
    } catch (error) {
      console.error('Error saving hotspots:', error);
      setIsSaving(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (media: MediaFile) => {
    onImageChange(media.url);
    setShowMediaPicker(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-6xl h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">{title}</h2>
            {instructions && (
              <p className="text-sm text-slate-400 mt-1">{instructions}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-green-500 hover:bg-green-400 disabled:bg-green-500/50 text-black font-bold rounded-lg flex items-center gap-2 transition-colors"
            >
              {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {isSaving ? 'Saving...' : 'Save Hotspots'}
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Tools */}
          <div className="w-64 border-r border-slate-700 p-4 flex flex-col gap-4 overflow-y-auto">
            {/* Mode Selection */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Mode</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditorMode('select')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    editorMode === 'select'
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <MousePointer2 size={16} />
                  Select
                </button>
                <button
                  onClick={() => setEditorMode('place')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    editorMode === 'place'
                      ? 'bg-green-500 text-black'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Plus size={16} />
                  Place
                </button>
                <button
                  onClick={() => setEditorMode('move')}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                    editorMode === 'move'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  <Move size={16} />
                  Move
                </button>
              </div>
            </div>

            {/* Zoom Controls */}
            <div>
              <h3 className="text-sm font-medium text-white mb-2">Zoom</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <ZoomOut size={16} />
                </button>
                <span className="flex-1 text-center text-sm text-slate-400">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                  title="Reset Zoom"
                >
                  <RotateCcw size={16} />
                </button>
              </div>
            </div>

            {/* Hotspot List */}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white">
                  Hotspots ({localHotspots.length})
                </h3>
              </div>
              <div className="space-y-2">
                {localHotspots.map((hotspot, index) => (
                  <div
                    key={hotspot.id}
                    onClick={() => setSelectedHotspotId(hotspot.id)}
                    className={`p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedHotspotId === hotspot.id
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'bg-slate-800 hover:bg-slate-700 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <GripVertical size={14} className="text-slate-500" />
                      <MapPin size={14} className="text-amber-400" />
                      <span className="flex-1 text-sm text-white truncate">
                        {hotspot.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingHotspot(hotspot);
                        }}
                        className="p-1 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteHotspot(hotspot.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <div className="text-xs text-slate-500 mt-1 ml-6">
                      ({hotspot.x.toFixed(1)}%, {hotspot.y.toFixed(1)}%)
                    </div>
                  </div>
                ))}
                {localHotspots.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    Click "Place" then click on the image to add hotspots
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Canvas Area */}
          <div className="flex-1 p-4 overflow-auto bg-slate-950">
            {imageUrl ? (
              <div
                ref={canvasRef}
                className="relative inline-block cursor-crosshair"
                onClick={handleCanvasClick}
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
              >
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Hotspot editor"
                  className="max-w-none select-none"
                  draggable={false}
                  style={{ maxHeight: '70vh' }}
                />

                {/* Hotspot Markers */}
                {localHotspots.map((hotspot) => (
                  <div
                    key={hotspot.id}
                    onMouseDown={(e) => handleHotspotMouseDown(hotspot.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspotId(hotspot.id);
                    }}
                    className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                      selectedHotspotId === hotspot.id
                        ? 'bg-amber-500 ring-4 ring-amber-500/30 scale-125'
                        : 'bg-amber-500/80 hover:bg-amber-500 hover:scale-110'
                    } ${editorMode === 'move' ? 'cursor-move' : ''}`}
                    style={{
                      left: `${hotspot.x}%`,
                      top: `${hotspot.y}%`,
                    }}
                  >
                    <MapPin size={14} className="text-black" />
                  </div>
                ))}

                {/* Mode indicator overlay */}
                {editorMode === 'place' && (
                  <div className="absolute inset-0 bg-green-500/10 pointer-events-none border-2 border-dashed border-green-500/50 flex items-center justify-center">
                    <span className="bg-green-500 text-black px-3 py-1.5 rounded-full text-sm font-medium">
                      Click to place hotspot
                    </span>
                  </div>
                )}
                {editorMode === 'move' && (
                  <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                    Drag hotspots to move
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center">
                  <ImageIcon size={40} className="text-slate-600" />
                </div>
                <p className="text-slate-400">No image selected</p>
                <button
                  onClick={() => setShowMediaPicker(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Upload size={18} />
                  Upload Image
                </button>
              </div>
            )}
          </div>

          {/* Right Panel - Hotspot Editor */}
          <AnimatePresence>
            {editingHotspot && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                className="w-80 border-l border-slate-700 p-4 overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-white">Edit Hotspot</h3>
                  <button
                    onClick={() => setEditingHotspot(null)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Label */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Label</label>
                    <input
                      type="text"
                      value={editingHotspot.label}
                      onChange={(e) =>
                        handleUpdateHotspot(editingHotspot.id, { label: e.target.value })
                      }
                      className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none"
                      placeholder="Enter label..."
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Description</label>
                    <textarea
                      value={editingHotspot.description || ''}
                      onChange={(e) =>
                        handleUpdateHotspot(editingHotspot.id, { description: e.target.value })
                      }
                      rows={3}
                      className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none resize-none"
                      placeholder="Enter description..."
                    />
                  </div>

                  {/* Reveal Fact */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">
                      Reveal Fact (shown when tapped)
                    </label>
                    <textarea
                      value={editingHotspot.revealFact || ''}
                      onChange={(e) =>
                        handleUpdateHotspot(editingHotspot.id, { revealFact: e.target.value })
                      }
                      rows={2}
                      className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none resize-none"
                      placeholder="Additional fact to reveal..."
                    />
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">X (%)</label>
                        <input
                          type="number"
                          value={editingHotspot.x}
                          onChange={(e) =>
                            handleUpdateHotspot(editingHotspot.id, {
                              x: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                            })
                          }
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 mb-0.5">Y (%)</label>
                        <input
                          type="number"
                          value={editingHotspot.y}
                          onChange={(e) =>
                            handleUpdateHotspot(editingHotspot.id, {
                              y: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                            })
                          }
                          step="0.1"
                          min="0"
                          max="100"
                          className="w-full bg-slate-800 text-white text-sm rounded-lg px-3 py-2 border border-slate-700 focus:border-amber-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Is Correct (for quiz hotspots) */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isCorrect"
                      checked={editingHotspot.isCorrect || false}
                      onChange={(e) =>
                        handleUpdateHotspot(editingHotspot.id, { isCorrect: e.target.checked })
                      }
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-amber-500 focus:ring-amber-500"
                    />
                    <label htmlFor="isCorrect" className="text-sm text-slate-300">
                      Mark as correct answer
                    </label>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      handleDeleteHotspot(editingHotspot.id);
                      setEditingHotspot(null);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Hotspot
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Change Image Button (floating) */}
        {imageUrl && (
          <button
            onClick={() => setShowMediaPicker(true)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload size={16} />
            Change Image
          </button>
        )}
      </motion.div>

      {/* Media Picker Modal */}
      <MediaPicker
        isOpen={showMediaPicker}
        onSelect={handleImageSelect}
        onClose={() => setShowMediaPicker(false)}
        allowedTypes={['image']}
        title="Select Image for Hotspots"
      />
    </motion.div>
  );
}

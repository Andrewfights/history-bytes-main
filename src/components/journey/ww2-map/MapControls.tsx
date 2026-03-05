/**
 * MapControls - Zoom/pan/filter controls for the map
 */

import { ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface MapControlsProps {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFitToScreen?: () => void;
}

export function MapControls({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onReset,
  onFitToScreen,
}: MapControlsProps) {
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return (
    <div className="flex flex-col gap-1 p-1 bg-card/90 backdrop-blur-sm rounded-xl border border-border shadow-lg">
      {/* Zoom In */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`p-2.5 rounded-lg transition-colors ${
          canZoomIn
            ? 'hover:bg-muted text-foreground'
            : 'text-muted-foreground/50 cursor-not-allowed'
        }`}
        aria-label="Zoom in"
      >
        <ZoomIn size={18} />
      </motion.button>

      {/* Zoom level indicator */}
      <div className="px-2 py-1 text-center">
        <span className="text-xs font-mono text-muted-foreground">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Zoom Out */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`p-2.5 rounded-lg transition-colors ${
          canZoomOut
            ? 'hover:bg-muted text-foreground'
            : 'text-muted-foreground/50 cursor-not-allowed'
        }`}
        aria-label="Zoom out"
      >
        <ZoomOut size={18} />
      </motion.button>

      {/* Divider */}
      <div className="h-px bg-border mx-2" />

      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Reset view"
      >
        <RotateCcw size={18} />
      </motion.button>

      {/* Fit to screen (optional) */}
      {onFitToScreen && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onFitToScreen}
          className="p-2.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fit to screen"
        >
          <Maximize2 size={18} />
        </motion.button>
      )}
    </div>
  );
}

// Horizontal version for bottom placement
export function MapControlsHorizontal({
  zoom,
  minZoom,
  maxZoom,
  onZoomIn,
  onZoomOut,
  onReset,
}: MapControlsProps) {
  const canZoomIn = zoom < maxZoom;
  const canZoomOut = zoom > minZoom;

  return (
    <div className="flex items-center gap-1 p-1 bg-card/90 backdrop-blur-sm rounded-xl border border-border shadow-lg">
      {/* Zoom Out */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onZoomOut}
        disabled={!canZoomOut}
        className={`p-2 rounded-lg transition-colors ${
          canZoomOut
            ? 'hover:bg-muted text-foreground'
            : 'text-muted-foreground/50 cursor-not-allowed'
        }`}
        aria-label="Zoom out"
      >
        <ZoomOut size={16} />
      </motion.button>

      {/* Zoom level */}
      <span className="px-2 text-xs font-mono text-muted-foreground min-w-[40px] text-center">
        {Math.round(zoom * 100)}%
      </span>

      {/* Zoom In */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onZoomIn}
        disabled={!canZoomIn}
        className={`p-2 rounded-lg transition-colors ${
          canZoomIn
            ? 'hover:bg-muted text-foreground'
            : 'text-muted-foreground/50 cursor-not-allowed'
        }`}
        aria-label="Zoom in"
      >
        <ZoomIn size={16} />
      </motion.button>

      {/* Divider */}
      <div className="w-px h-6 bg-border" />

      {/* Reset */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Reset view"
      >
        <RotateCcw size={16} />
      </motion.button>
    </div>
  );
}

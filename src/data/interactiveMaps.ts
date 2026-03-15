/**
 * Interactive Maps - Data types and storage for map modules
 * Used in games and journey experiences
 */

// Hotspot shape types
export type HotspotShape = 'rect' | 'circle' | 'polygon';

// Action types for hotspots
export type HotspotActionType =
  | 'navigate'      // Navigate to a route/screen
  | 'modal'         // Show a modal with content
  | 'audio'         // Play audio file
  | 'video'         // Play video
  | 'link'          // Open external link
  | 'lesson'        // Start a lesson
  | 'quiz'          // Start a quiz
  | 'info'          // Show info tooltip/popup
  | 'custom';       // Custom callback

// Action configuration
export interface HotspotAction {
  type: HotspotActionType;
  // Navigate action
  route?: string;
  // Modal action
  modalTitle?: string;
  modalContent?: string;
  modalImageUrl?: string;
  // Media actions
  mediaUrl?: string;
  // Link action
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
  // Lesson/Quiz action
  lessonId?: string;
  quizId?: string;
  // Info action
  infoText?: string;
  // Custom action
  customData?: Record<string, unknown>;
}

// Visual styling for hotspots
export interface HotspotStyle {
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  opacity?: number;
  hoverBackgroundColor?: string;
  hoverBorderColor?: string;
  hoverScale?: number;
  pulseAnimation?: boolean;
  glowEffect?: boolean;
}

// Individual hotspot definition
export interface MapHotspot {
  id: string;
  // Position (as percentage of image dimensions for responsiveness)
  x: number;        // 0-100 percentage from left
  y: number;        // 0-100 percentage from top
  width: number;    // percentage of image width
  height: number;   // percentage of image height
  // Shape
  shape: HotspotShape;
  // For polygon shapes, array of [x, y] percentage points
  polygonPoints?: Array<[number, number]>;
  // Display
  label: string;
  tooltipText?: string;
  iconEmoji?: string;
  // Visibility
  isVisible: boolean;
  showLabel: boolean;
  showOnHover: boolean;  // Only show hotspot on hover
  // Action
  action: HotspotAction;
  // Styling
  style?: HotspotStyle;
  // State tracking
  isCompleted?: boolean;  // For progress tracking
  isLocked?: boolean;     // Requires unlock condition
  unlockCondition?: string;
  // Order for sequential content
  order?: number;
}

// Complete map module
export interface InteractiveMap {
  id: string;
  name: string;
  description?: string;
  // Image
  imageUrl: string;
  imageWidth: number;   // Original image width
  imageHeight: number;  // Original image height
  // Hotspots
  hotspots: MapHotspot[];
  // Settings
  showAllHotspots: boolean;  // Show all at once or progressively
  enableZoom: boolean;
  enablePan: boolean;
  // Metadata
  category?: string;    // e.g., 'ww2', 'geography', 'anatomy'
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// Storage key
const MAPS_STORAGE_KEY = 'hb-interactive-maps';

/**
 * Get all interactive maps
 */
export function getAllMaps(): InteractiveMap[] {
  try {
    const json = localStorage.getItem(MAPS_STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

/**
 * Get a map by ID
 */
export function getMapById(id: string): InteractiveMap | undefined {
  const maps = getAllMaps();
  return maps.find(m => m.id === id);
}

/**
 * Save a map (create or update)
 */
export function saveMap(map: InteractiveMap): void {
  const maps = getAllMaps();
  const index = maps.findIndex(m => m.id === map.id);

  const updatedMap = {
    ...map,
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    maps[index] = updatedMap;
  } else {
    maps.push({
      ...updatedMap,
      createdAt: new Date().toISOString(),
    });
  }

  localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(maps));
}

/**
 * Delete a map
 */
export function deleteMap(id: string): void {
  const maps = getAllMaps();
  const filtered = maps.filter(m => m.id !== id);
  localStorage.setItem(MAPS_STORAGE_KEY, JSON.stringify(filtered));
}

/**
 * Create a new empty map
 */
export function createNewMap(name: string, imageUrl: string, width: number, height: number): InteractiveMap {
  return {
    id: `map-${Date.now()}`,
    name,
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
}

/**
 * Create a new hotspot at position
 */
export function createHotspot(
  x: number,
  y: number,
  width: number = 10,
  height: number = 10
): MapHotspot {
  return {
    id: `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    x,
    y,
    width,
    height,
    shape: 'rect',
    label: 'New Hotspot',
    isVisible: true,
    showLabel: true,
    showOnHover: false,
    action: {
      type: 'info',
      infoText: 'Click to learn more',
    },
  };
}

/**
 * Default hotspot styles
 */
export const DEFAULT_HOTSPOT_STYLE: HotspotStyle = {
  backgroundColor: 'rgba(59, 130, 246, 0.3)',
  borderColor: 'rgba(59, 130, 246, 0.8)',
  borderWidth: 2,
  opacity: 0.8,
  hoverBackgroundColor: 'rgba(59, 130, 246, 0.5)',
  hoverBorderColor: 'rgba(59, 130, 246, 1)',
  hoverScale: 1.05,
  pulseAnimation: false,
  glowEffect: false,
};

/**
 * Get maps by category
 */
export function getMapsByCategory(category: string): InteractiveMap[] {
  return getAllMaps().filter(m => m.category === category);
}

/**
 * Duplicate a map
 */
export function duplicateMap(id: string): InteractiveMap | null {
  const original = getMapById(id);
  if (!original) return null;

  const duplicate: InteractiveMap = {
    ...original,
    id: `map-${Date.now()}`,
    name: `${original.name} (Copy)`,
    hotspots: original.hotspots.map(h => ({
      ...h,
      id: `hotspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveMap(duplicate);
  return duplicate;
}

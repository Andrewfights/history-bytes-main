/**
 * Historical Eras - Data definitions for all historical time periods
 * Images are hard-coded defaults but can be overridden via admin settings
 */

export interface HistoricalEra {
  id: string;
  name: string;
  subtitle: string;
  dateRange: string;
  defaultImageUrl: string;  // Hard-coded default image
  accentColor: string;
  isAvailable: boolean;     // true = playable, false = "Coming Soon"
  lessonCount?: number;
  xpReward?: number;
  order: number;            // Display order
}

// localStorage key for admin overrides
export const ERA_TILES_STORAGE_KEY = 'hb-era-tiles';

export interface EraTileOverrides {
  [eraId: string]: {
    imageUrl: string;
    updatedAt: string;
  };
}

export const HISTORICAL_ERAS: HistoricalEra[] = [
  {
    id: 'ww2',
    name: 'World War II',
    subtitle: 'The conflict that shaped the modern world',
    dateRange: '1939-1945',
    // Iwo Jima flag raising - Joe Rosenthal (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Raising_the_Flag_on_Iwo_Jima%2C_larger_-_edit1.jpg/800px-Raising_the_Flag_on_Iwo_Jima%2C_larger_-_edit1.jpg',
    accentColor: '#d97706', // amber
    isAvailable: true,
    lessonCount: 7,
    xpReward: 280,
    order: 1,
  },
  {
    id: 'american-revolution',
    name: 'American Revolution',
    subtitle: 'The birth of a nation',
    dateRange: '1765-1783',
    // Washington Crossing the Delaware - Emanuel Leutze (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg/800px-Washington_Crossing_the_Delaware_by_Emanuel_Leutze%2C_MMA-NYC%2C_1851.jpg',
    accentColor: '#1e40af', // blue
    isAvailable: false,
    order: 2,
  },
  {
    id: 'ancient-rome',
    name: 'Ancient Rome',
    subtitle: 'From Republic to Empire',
    dateRange: '753 BC - 476 AD',
    // Julius Caesar bust - Tusculum portrait (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Bust_of_Julius_Caesar_from_History_of_the_World_%281902%29.png/800px-Bust_of_Julius_Caesar_from_History_of_the_World_%281902%29.png',
    accentColor: '#991b1b', // dark red
    isAvailable: false,
    order: 3,
  },
  {
    id: 'civil-war',
    name: 'American Civil War',
    subtitle: 'A nation divided',
    dateRange: '1861-1865',
    // Battle of Gettysburg - Thure de Thulstrup (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Thure_de_Thulstrup_-_L._Prang_and_Co._-_Battle_of_Gettysburg_-_Restoration_by_Adam_Cuerden.jpg/800px-Thure_de_Thulstrup_-_L._Prang_and_Co._-_Battle_of_Gettysburg_-_Restoration_by_Adam_Cuerden.jpg',
    accentColor: '#1e3a5f', // navy blue
    isAvailable: false,
    order: 4,
  },
  {
    id: 'ancient-egypt',
    name: 'Ancient Egypt',
    subtitle: 'Land of the Pharaohs',
    dateRange: '3100 BC - 30 BC',
    // Nefertiti bust (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Nofretete_Neues_Museum.jpg/800px-Nofretete_Neues_Museum.jpg',
    accentColor: '#b45309', // golden amber
    isAvailable: false,
    order: 5,
  },
  {
    id: 'ancient-greece',
    name: 'Ancient Greece',
    subtitle: 'Birthplace of democracy',
    dateRange: '800 BC - 31 BC',
    // Spartan helmet (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Helmet_sparta_bm.JPG/800px-Helmet_sparta_bm.JPG',
    accentColor: '#0369a1', // greek blue
    isAvailable: false,
    order: 6,
  },
  {
    id: 'medieval',
    name: 'Medieval Europe',
    subtitle: 'Knights, castles, and crusades',
    dateRange: '500 - 1500 AD',
    // Medieval knight tournament (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Tournament_between_Henry_II_and_Lorraine.jpg/800px-Tournament_between_Henry_II_and_Lorraine.jpg',
    accentColor: '#4d3319', // medieval brown
    isAvailable: false,
    order: 7,
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    subtitle: 'The rebirth of art and science',
    dateRange: '1400-1600',
    // Vitruvian Man - Leonardo da Vinci (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Da_Vinci_Vitruve_Luc_Viatour.jpg/800px-Da_Vinci_Vitruve_Luc_Viatour.jpg',
    accentColor: '#7c3aed', // purple
    isAvailable: false,
    order: 8,
  },
  {
    id: 'french-revolution',
    name: 'French Revolution',
    subtitle: 'Liberty, equality, fraternity',
    dateRange: '1789-1799',
    // Liberty Leading the People - Eugène Delacroix (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg/800px-Eug%C3%A8ne_Delacroix_-_Le_28_Juillet._La_Libert%C3%A9_guidant_le_peuple.jpg',
    accentColor: '#dc2626', // revolutionary red
    isAvailable: false,
    order: 9,
  },
  {
    id: 'industrial-revolution',
    name: 'Industrial Revolution',
    subtitle: 'The age of machines',
    dateRange: '1760-1840',
    // Coalbrookdale by Night - Philip James de Loutherbourg (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Philipp_Jakob_Loutherbourg_d._J._002.jpg/800px-Philipp_Jakob_Loutherbourg_d._J._002.jpg',
    accentColor: '#374151', // industrial gray
    isAvailable: false,
    order: 10,
  },
  {
    id: 'exploration',
    name: 'Age of Exploration',
    subtitle: 'Mapping the unknown world',
    dateRange: '1400-1600',
    // Old world map - Waldseemüller map (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Waldseemuller_map_2.jpg/800px-Waldseemuller_map_2.jpg',
    accentColor: '#047857', // sea green
    isAvailable: false,
    order: 11,
  },
  {
    id: 'vikings',
    name: 'Vikings',
    subtitle: 'Raiders, traders, and explorers',
    dateRange: '793-1066 AD',
    // Viking longship (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Gokstadskipet1.jpg/800px-Gokstadskipet1.jpg',
    accentColor: '#1f2937', // dark viking gray
    isAvailable: false,
    order: 12,
  },
  {
    id: 'ww1',
    name: 'World War I',
    subtitle: 'The war to end all wars',
    dateRange: '1914-1918',
    // Soldiers in trenches (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Australian_infantry_small_box_respirators_Ypres_1917.jpg/800px-Australian_infantry_small_box_respirators_Ypres_1917.jpg',
    accentColor: '#78350f', // trench brown
    isAvailable: false,
    order: 13,
  },
  {
    id: 'cold-war',
    name: 'Cold War',
    subtitle: 'A battle of ideologies',
    dateRange: '1947-1991',
    // Yalta Conference (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Yalta_summit_1945_with_Churchill%2C_Roosevelt%2C_Stalin.jpg/800px-Yalta_summit_1945_with_Churchill%2C_Roosevelt%2C_Stalin.jpg',
    accentColor: '#be123c', // soviet red
    isAvailable: false,
    order: 14,
  },
  {
    id: 'mesopotamia',
    name: 'Ancient Mesopotamia',
    subtitle: 'Cradle of civilization',
    dateRange: '3500 BC - 500 BC',
    // Assyrian relief - Lion hunt (public domain)
    defaultImageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Dying_Lion%2C_Assyrian%2C_North_Palace_of_Ashurbanipal%2C_Nineveh_%28Mosul%2C_Iraq%29%2C_c._645_BC%2C_gypsum_alabaster_-_Brooklyn_Museum_-_Brooklyn%2C_NY_-_DSC08492.JPG/800px-Dying_Lion%2C_Assyrian%2C_North_Palace_of_Ashurbanipal%2C_Nineveh_%28Mosul%2C_Iraq%29%2C_c._645_BC%2C_gypsum_alabaster_-_Brooklyn_Museum_-_Brooklyn%2C_NY_-_DSC08492.JPG',
    accentColor: '#92400e', // clay brown
    isAvailable: false,
    order: 15,
  },
];

/**
 * Get an era by its ID
 */
export function getEraById(id: string): HistoricalEra | undefined {
  return HISTORICAL_ERAS.find(era => era.id === id);
}

/**
 * Get all available (playable) eras
 */
export function getAvailableEras(): HistoricalEra[] {
  return HISTORICAL_ERAS.filter(era => era.isAvailable).sort((a, b) => a.order - b.order);
}

/**
 * Get all coming soon eras
 */
export function getComingSoonEras(): HistoricalEra[] {
  return HISTORICAL_ERAS.filter(era => !era.isAvailable).sort((a, b) => a.order - b.order);
}

/**
 * Get all eras sorted by order
 */
export function getAllEras(): HistoricalEra[] {
  return [...HISTORICAL_ERAS].sort((a, b) => a.order - b.order);
}

/**
 * Get the effective image URL for an era (checks for admin overrides)
 */
export function getEraImageUrl(eraId: string): string {
  const era = getEraById(eraId);
  if (!era) return '';

  // Check for admin override in localStorage
  try {
    const overridesJson = localStorage.getItem(ERA_TILES_STORAGE_KEY);
    if (overridesJson) {
      const overrides: EraTileOverrides = JSON.parse(overridesJson);
      if (overrides[eraId]?.imageUrl) {
        return overrides[eraId].imageUrl;
      }
    }
  } catch {
    // Fall back to default if localStorage parsing fails
  }

  return era.defaultImageUrl;
}

/**
 * Save an era tile image override (admin function)
 */
export function saveEraTileOverride(eraId: string, imageUrl: string): void {
  try {
    const overridesJson = localStorage.getItem(ERA_TILES_STORAGE_KEY);
    const overrides: EraTileOverrides = overridesJson ? JSON.parse(overridesJson) : {};

    overrides[eraId] = {
      imageUrl,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(ERA_TILES_STORAGE_KEY, JSON.stringify(overrides));
  } catch (error) {
    console.error('Failed to save era tile override:', error);
  }
}

/**
 * Reset an era tile to its default image
 */
export function resetEraTileToDefault(eraId: string): void {
  try {
    const overridesJson = localStorage.getItem(ERA_TILES_STORAGE_KEY);
    if (overridesJson) {
      const overrides: EraTileOverrides = JSON.parse(overridesJson);
      delete overrides[eraId];
      localStorage.setItem(ERA_TILES_STORAGE_KEY, JSON.stringify(overrides));
    }
  } catch (error) {
    console.error('Failed to reset era tile:', error);
  }
}

/**
 * Get all era tile overrides
 */
export function getEraTileOverrides(): EraTileOverrides {
  try {
    const overridesJson = localStorage.getItem(ERA_TILES_STORAGE_KEY);
    return overridesJson ? JSON.parse(overridesJson) : {};
  } catch {
    return {};
  }
}

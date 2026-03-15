/**
 * Journey Hooks
 * Provides real-time access to journey data with Firestore synchronization
 */

import { useState, useEffect, useCallback } from 'react';
import { isFirebaseConfigured } from '@/lib/firebase';
import {
  subscribeToJourneys,
  subscribeToJourneyBeats,
  subscribeToModuleTemplates,
  getJourneys,
  getJourneyBeats,
  saveJourney,
  saveJourneyBeat,
  deleteJourney,
  deleteJourneyBeat,
  type FirestoreJourney,
  type FirestoreJourneyBeat,
  type FirestoreModuleTemplate,
} from '@/lib/firestore';
import { MODULE_TEMPLATES } from '@/lib/moduleTemplates';

// Storage keys for localStorage fallback
const STORAGE_KEYS = {
  JOURNEYS: 'hb_admin_journeys',
  JOURNEY_BEATS: 'hb_admin_journey_beats',
};

// ============ Local Storage Helpers ============

function loadStoredJourneys(): FirestoreJourney[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredJourneys(journeys: FirestoreJourney[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(journeys));
  } catch (err) {
    console.error('[useJourneys] Error saving to localStorage:', err);
  }
}

function loadStoredBeats(): FirestoreJourneyBeat[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.JOURNEY_BEATS);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredBeats(beats: FirestoreJourneyBeat[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.JOURNEY_BEATS, JSON.stringify(beats));
  } catch (err) {
    console.error('[useJourneys] Error saving beats to localStorage:', err);
  }
}

// ============ useJourneys Hook ============

interface UseJourneysResult {
  journeys: FirestoreJourney[];
  loading: boolean;
  error: string | null;
  createJourney: (journey: Omit<FirestoreJourney, 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateJourney: (journey: FirestoreJourney) => Promise<boolean>;
  removeJourney: (journeyId: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useJourneys(): UseJourneysResult {
  const [journeys, setJourneys] = useState<FirestoreJourney[]>(() => loadStoredJourneys());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and subscribe
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        if (isFirebaseConfigured()) {
          // First, get initial data
          const initialData = await getJourneys();
          setJourneys(initialData);
          saveStoredJourneys(initialData);

          // Then subscribe for real-time updates
          unsubscribe = subscribeToJourneys((updated) => {
            setJourneys(updated);
            saveStoredJourneys(updated);
          });
        } else {
          // Use localStorage fallback
          const stored = loadStoredJourneys();
          setJourneys(stored);
        }
      } catch (err) {
        console.error('[useJourneys] Error:', err);
        setError('Failed to load journeys');
        // Fall back to localStorage
        setJourneys(loadStoredJourneys());
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const createJourney = useCallback(async (journey: Omit<FirestoreJourney, 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const success = await saveJourney(journey as FirestoreJourney);
      if (!success && !isFirebaseConfigured()) {
        // Local-only mode
        const updated = [...journeys, journey as FirestoreJourney];
        setJourneys(updated);
        saveStoredJourneys(updated);
        return true;
      }
      return success;
    } catch (err) {
      console.error('[useJourneys] Create error:', err);
      return false;
    }
  }, [journeys]);

  const updateJourney = useCallback(async (journey: FirestoreJourney): Promise<boolean> => {
    try {
      const success = await saveJourney(journey);
      if (!success && !isFirebaseConfigured()) {
        // Local-only mode
        const updated = journeys.map(j => j.id === journey.id ? journey : j);
        setJourneys(updated);
        saveStoredJourneys(updated);
        return true;
      }
      return success;
    } catch (err) {
      console.error('[useJourneys] Update error:', err);
      return false;
    }
  }, [journeys]);

  const removeJourney = useCallback(async (journeyId: string): Promise<boolean> => {
    try {
      const success = await deleteJourney(journeyId);
      if (!success && !isFirebaseConfigured()) {
        // Local-only mode
        const updated = journeys.filter(j => j.id !== journeyId);
        setJourneys(updated);
        saveStoredJourneys(updated);
        return true;
      }
      return success;
    } catch (err) {
      console.error('[useJourneys] Delete error:', err);
      return false;
    }
  }, [journeys]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJourneys();
      setJourneys(data);
      saveStoredJourneys(data);
    } catch (err) {
      console.error('[useJourneys] Refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    journeys,
    loading,
    error,
    createJourney,
    updateJourney,
    removeJourney,
    refresh,
  };
}

// ============ useJourneyBeats Hook ============

interface UseJourneyBeatsResult {
  beats: FirestoreJourneyBeat[];
  loading: boolean;
  error: string | null;
  createBeat: (beat: Omit<FirestoreJourneyBeat, 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateBeat: (beat: FirestoreJourneyBeat) => Promise<boolean>;
  removeBeat: (beatId: string) => Promise<boolean>;
  reorderBeats: (beatIds: string[]) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useJourneyBeats(journeyId: string): UseJourneyBeatsResult {
  const [beats, setBeats] = useState<FirestoreJourneyBeat[]>(() => {
    const stored = loadStoredBeats();
    return stored.filter(b => b.journeyId === journeyId);
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch and subscribe
  useEffect(() => {
    if (!journeyId) {
      setBeats([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | null = null;

    async function init() {
      setLoading(true);
      setError(null);

      try {
        if (isFirebaseConfigured()) {
          // First, get initial data
          const initialData = await getJourneyBeats(journeyId);
          setBeats(initialData);

          // Then subscribe for real-time updates
          unsubscribe = subscribeToJourneyBeats(journeyId, (updated) => {
            setBeats(updated);
          });
        } else {
          // Use localStorage fallback
          const stored = loadStoredBeats();
          setBeats(stored.filter(b => b.journeyId === journeyId));
        }
      } catch (err) {
        console.error('[useJourneyBeats] Error:', err);
        setError('Failed to load beats');
      } finally {
        setLoading(false);
      }
    }

    init();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [journeyId]);

  const createBeat = useCallback(async (beat: Omit<FirestoreJourneyBeat, 'createdAt' | 'updatedAt'>): Promise<boolean> => {
    try {
      const success = await saveJourneyBeat(beat as FirestoreJourneyBeat);
      if (!success && !isFirebaseConfigured()) {
        // Local-only mode
        const allBeats = loadStoredBeats();
        const updated = [...allBeats, beat as FirestoreJourneyBeat];
        saveStoredBeats(updated);
        setBeats(updated.filter(b => b.journeyId === journeyId));
        return true;
      }
      return success;
    } catch (err) {
      console.error('[useJourneyBeats] Create error:', err);
      return false;
    }
  }, [journeyId]);

  const updateBeat = useCallback(async (beat: FirestoreJourneyBeat): Promise<boolean> => {
    try {
      const success = await saveJourneyBeat(beat);
      if (!success && !isFirebaseConfigured()) {
        // Local-only mode
        const allBeats = loadStoredBeats();
        const updated = allBeats.map(b => b.id === beat.id ? beat : b);
        saveStoredBeats(updated);
        setBeats(updated.filter(b => b.journeyId === journeyId));
        return true;
      }
      return success;
    } catch (err) {
      console.error('[useJourneyBeats] Update error:', err);
      return false;
    }
  }, [journeyId]);

  const removeBeat = useCallback(async (beatId: string): Promise<boolean> => {
    try {
      const success = await deleteJourneyBeat(beatId);
      if (!success && !isFirebaseConfigured()) {
        // Local-only mode
        const allBeats = loadStoredBeats();
        const updated = allBeats.filter(b => b.id !== beatId);
        saveStoredBeats(updated);
        setBeats(updated.filter(b => b.journeyId === journeyId));
        return true;
      }
      return success;
    } catch (err) {
      console.error('[useJourneyBeats] Delete error:', err);
      return false;
    }
  }, [journeyId]);

  const reorderBeats = useCallback(async (beatIds: string[]): Promise<boolean> => {
    try {
      // Update beat numbers based on new order
      const reorderedBeats = beatIds.map((id, index) => {
        const beat = beats.find(b => b.id === id);
        if (!beat) return null;
        return { ...beat, number: index + 1 };
      }).filter((b): b is FirestoreJourneyBeat => b !== null);

      // Save all beats with new numbers
      const promises = reorderedBeats.map(beat => saveJourneyBeat(beat));
      const results = await Promise.all(promises);

      if (results.every(Boolean)) {
        setBeats(reorderedBeats);
        return true;
      }

      if (!isFirebaseConfigured()) {
        // Local-only mode
        const allBeats = loadStoredBeats();
        const otherBeats = allBeats.filter(b => b.journeyId !== journeyId);
        saveStoredBeats([...otherBeats, ...reorderedBeats]);
        setBeats(reorderedBeats);
        return true;
      }

      return false;
    } catch (err) {
      console.error('[useJourneyBeats] Reorder error:', err);
      return false;
    }
  }, [beats, journeyId]);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getJourneyBeats(journeyId);
      setBeats(data);
    } catch (err) {
      console.error('[useJourneyBeats] Refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, [journeyId]);

  return {
    beats,
    loading,
    error,
    createBeat,
    updateBeat,
    removeBeat,
    reorderBeats,
    refresh,
  };
}

// ============ useModuleTemplates Hook ============

interface UseModuleTemplatesResult {
  templates: FirestoreModuleTemplate[];
  loading: boolean;
  getTemplateById: (id: string) => FirestoreModuleTemplate | undefined;
}

export function useModuleTemplates(): UseModuleTemplatesResult {
  // For now, use the static templates. In the future, this could load from Firestore
  const [templates] = useState<FirestoreModuleTemplate[]>(MODULE_TEMPLATES);
  const [loading] = useState(false);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  return {
    templates,
    loading,
    getTemplateById,
  };
}

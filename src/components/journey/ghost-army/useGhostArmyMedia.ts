import { useState, useEffect } from 'react';
import {
  loadGhostArmyMedia,
  loadGhostArmyMediaAsync,
  getGhostArmyNodeMedia,
  initGhostArmyMediaCache,
  GhostArmyNodeMedia,
  GhostArmyMediaConfig,
} from '@/lib/adminStorage';

/**
 * Hook to get media for a specific Ghost Army node
 */
export function useGhostArmyNodeMedia(nodeId: string): GhostArmyNodeMedia | null {
  const [media, setMedia] = useState<GhostArmyNodeMedia | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Initialize cache from IndexedDB, then load media
    const init = async () => {
      await initGhostArmyMediaCache();
      const nodeMedia = getGhostArmyNodeMedia(nodeId);
      setMedia(nodeMedia);
      setInitialized(true);
    };
    init();

    // Listen for storage updates
    const handleStorageUpdate = (e: CustomEvent) => {
      if (e.detail?.key?.includes('ghost_army')) {
        const updated = getGhostArmyNodeMedia(nodeId);
        setMedia(updated);
      }
    };

    window.addEventListener('adminStorageUpdate', handleStorageUpdate as EventListener);
    return () => {
      window.removeEventListener('adminStorageUpdate', handleStorageUpdate as EventListener);
    };
  }, [nodeId]);

  return media;
}

/**
 * Hook to get all Ghost Army media config
 */
export function useGhostArmyMedia(): GhostArmyMediaConfig & { isLoading: boolean } {
  const [config, setConfig] = useState<GhostArmyMediaConfig>({ nodes: {}, lastUpdated: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from IndexedDB
    const init = async () => {
      const loaded = await loadGhostArmyMediaAsync();
      setConfig(loaded);
      setIsLoading(false);
    };
    init();

    const handleStorageUpdate = (e: CustomEvent) => {
      if (e.detail?.key?.includes('ghost_army')) {
        setConfig(loadGhostArmyMedia());
      }
    };

    window.addEventListener('adminStorageUpdate', handleStorageUpdate as EventListener);
    return () => {
      window.removeEventListener('adminStorageUpdate', handleStorageUpdate as EventListener);
    };
  }, []);

  return { ...config, isLoading };
}

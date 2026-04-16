/**
 * useWW2ModuleAssets - Hook to subscribe to uploaded WW2 module assets from Firestore
 *
 * This hook provides real-time access to media assets (images, audio, video)
 * that have been uploaded through the admin WW2 Module Editor.
 * Also provides access to custom questions and statements with hidden filtering.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  subscribeToWW2ModuleAssets,
  type FirestoreWW2ModuleAssets,
  type WW2BeatQuestion,
  type WW2BeatStatement,
} from '@/lib/firestore';
import { isFirebaseConfigured } from '@/lib/firebase';

export function useWW2ModuleAssets() {
  const [assets, setAssets] = useState<FirestoreWW2ModuleAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return;
    }

    const unsubscribe = subscribeToWW2ModuleAssets((data) => {
      setAssets(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Get uploaded media URL for a specific beat and media key
   * @param beatId - The beat ID (e.g., 'ph-beat-4')
   * @param mediaKey - The media key (e.g., 'donald-stratton-portrait')
   * @returns The uploaded URL or null if not found
   */
  const getMediaUrl = useCallback((beatId: string, mediaKey: string): string | null => {
    return assets?.beatMedia?.[beatId]?.[mediaKey] || null;
  }, [assets]);

  /**
   * Get all uploaded media for a specific beat
   * @param beatId - The beat ID
   * @returns Record of mediaKey -> URL
   */
  const getBeatMedia = useCallback((beatId: string): Record<string, string> => {
    return assets?.beatMedia?.[beatId] || {};
  }, [assets]);

  /**
   * Get uploaded media URL for exam/arena assets
   * @param assetType - 'final-exam' or 'arena'
   * @param assetKey - The asset key (e.g., 'exam-q3-fdr-speech')
   * @returns The uploaded URL or null if not found
   */
  const getExamAssetUrl = useCallback((assetType: 'final-exam' | 'arena', assetKey: string): string | null => {
    return assets?.beatMedia?.[assetType]?.[assetKey] || null;
  }, [assets]);

  /**
   * Get custom questions for a beat, filtered to exclude hidden questions
   * @param beatId - The beat ID
   * @param defaultQuestions - Default questions to use if no custom questions exist
   * @returns Array of visible questions (hidden questions excluded)
   */
  const getVisibleQuestions = useCallback((
    beatId: string,
    defaultQuestions: WW2BeatQuestion[]
  ): WW2BeatQuestion[] => {
    const customQuestions = assets?.customQuestions?.[beatId];
    const questions = customQuestions && customQuestions.length > 0 ? customQuestions : defaultQuestions;
    // Filter out hidden questions
    return questions.filter(q => !q.hidden);
  }, [assets]);

  /**
   * Get custom statements for a beat, filtered to exclude hidden statements
   * @param beatId - The beat ID
   * @param defaultStatements - Default statements to use if no custom statements exist
   * @returns Array of visible statements (hidden statements excluded)
   */
  const getVisibleStatements = useCallback((
    beatId: string,
    defaultStatements: WW2BeatStatement[]
  ): WW2BeatStatement[] => {
    const customStatements = assets?.customStatements?.[beatId];
    const statements = customStatements && customStatements.length > 0 ? customStatements : defaultStatements;
    // Filter out hidden statements (if hidden field is added to statements later)
    return statements.filter(s => !(s as WW2BeatStatement & { hidden?: boolean }).hidden);
  }, [assets]);

  return {
    assets,
    isLoading,
    getMediaUrl,
    getBeatMedia,
    getExamAssetUrl,
    getVisibleQuestions,
    getVisibleStatements,
  };
}

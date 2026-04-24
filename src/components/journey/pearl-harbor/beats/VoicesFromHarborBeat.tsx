/**
 * Beat 4: Voices from the Harbor
 * Format: Video-only module
 * XP: 50
 *
 * Simple video module - plays pre-module video then shows XP completion
 */

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { WW2Host } from '@/types';
import { PreModuleVideoScreen, XPCompletionScreen } from '../shared';
import { subscribeToWW2ModuleAssets, type PreModuleVideoConfig } from '@/lib/firestore';
import { usePearlHarborProgress } from '../hooks/usePearlHarborProgress';

type Screen = 'video' | 'completion';

const LESSON_DATA = {
  id: 'ph-beat-4',
  xpReward: 50,
};

interface VoicesFromHarborBeatProps {
  host: WW2Host;
  onComplete: (xp: number) => void;
  onSkip: () => void;
  onBack: () => void;
  isPreview?: boolean;
}

export function VoicesFromHarborBeat({ host, onComplete, onSkip, onBack, isPreview = false }: VoicesFromHarborBeatProps) {
  const [screen, setScreen] = useState<Screen>('video');
  const [skipped, setSkipped] = useState(false);
  const [preModuleVideoConfig, setPreModuleVideoConfig] = useState<PreModuleVideoConfig | null>(null);
  const [hasLoadedConfig, setHasLoadedConfig] = useState(false);

  const { clearCheckpoint } = usePearlHarborProgress();

  // Subscribe to Firestore for pre-module video config
  useEffect(() => {
    const unsubscribe = subscribeToWW2ModuleAssets((assets) => {
      const preModuleVideo = assets?.preModuleVideos?.[LESSON_DATA.id];
      if (preModuleVideo?.enabled && preModuleVideo?.videoUrl) {
        setPreModuleVideoConfig(preModuleVideo);
      } else {
        setPreModuleVideoConfig(null);
      }
      setHasLoadedConfig(true);
    });
    return () => unsubscribe();
  }, []);

  // If no video is configured, skip straight to completion
  useEffect(() => {
    if (hasLoadedConfig && !preModuleVideoConfig) {
      setScreen('completion');
    }
  }, [hasLoadedConfig, preModuleVideoConfig]);

  const handleVideoComplete = useCallback(() => {
    setScreen('completion');
  }, []);

  const handleComplete = useCallback(() => {
    clearCheckpoint();
    onComplete(skipped ? 0 : LESSON_DATA.xpReward);
  }, [skipped, clearCheckpoint, onComplete]);

  // Show loading state while config loads
  if (!hasLoadedConfig) {
    return (
      <div className="fixed inset-0 z-[60] pt-safe bg-void flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* VIDEO SCREEN */}
      {screen === 'video' && preModuleVideoConfig && (
        <PreModuleVideoScreen
          key="video"
          config={preModuleVideoConfig}
          beatTitle="Voices from the Harbor"
          onComplete={handleVideoComplete}
        />
      )}

      {/* COMPLETION */}
      {screen === 'completion' && (
        <XPCompletionScreen
          key="completion"
          beatNumber={4}
          beatTitle="Voices from the Harbor"
          xpEarned={skipped ? 0 : LESSON_DATA.xpReward}
          host={host}
          onContinue={handleComplete}
          nextBeatPreview="Breaking News - How America heard the news"
        />
      )}
    </AnimatePresence>
  );
}

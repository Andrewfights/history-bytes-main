/**
 * AudioContext - Global audio state and coordination for the app
 * Manages background music and coordinates with video playback
 */

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { moduleAudioManager } from '@/lib/moduleAudioManager';

interface AudioContextType {
  // Music state
  isMusicMuted: boolean;
  musicVolume: number;
  currentMusicModuleId: string | null;
  isMusicPlaying: boolean;

  // Actions
  toggleMusicMute: () => void;
  setMusicVolume: (volume: number) => void;
  playModuleMusic: (moduleId: string, musicUrl: string, volume?: number) => void;
  stopModuleMusic: () => void;
  preloadModuleMusic: (moduleId: string, musicUrl: string) => void;

  // Video coordination - components call these when videos play/end
  notifyVideoStart: () => void;
  notifyVideoEnd: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [isMusicMuted, setIsMusicMuted] = useState(() => moduleAudioManager.getMuted());
  const [musicVolume, setMusicVolumeState] = useState(() => moduleAudioManager.getVolume());
  const [currentMusicModuleId, setCurrentMusicModuleId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Sync state with audio manager periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setIsMusicPlaying(moduleAudioManager.isPlaying());
      setCurrentMusicModuleId(moduleAudioManager.getCurrentModuleId());
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      moduleAudioManager.dispose();
    };
  }, []);

  const toggleMusicMute = useCallback(() => {
    const newMuted = moduleAudioManager.toggleMute();
    setIsMusicMuted(newMuted);
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    moduleAudioManager.setVolume(volume);
    setMusicVolumeState(volume);
  }, []);

  const playModuleMusic = useCallback((moduleId: string, musicUrl: string, volume?: number) => {
    moduleAudioManager.play({
      moduleId,
      musicUrl,
      volume: volume ?? musicVolume,
    });
    setCurrentMusicModuleId(moduleId);
    setIsMusicPlaying(true);
  }, [musicVolume]);

  const stopModuleMusic = useCallback(() => {
    moduleAudioManager.stop();
    setCurrentMusicModuleId(null);
    setIsMusicPlaying(false);
  }, []);

  const preloadModuleMusic = useCallback((moduleId: string, musicUrl: string) => {
    moduleAudioManager.preload(moduleId, musicUrl);
  }, []);

  const notifyVideoStart = useCallback(() => {
    moduleAudioManager.onVideoStart();
  }, []);

  const notifyVideoEnd = useCallback(() => {
    moduleAudioManager.onVideoEnd();
  }, []);

  const value: AudioContextType = {
    isMusicMuted,
    musicVolume,
    currentMusicModuleId,
    isMusicPlaying,
    toggleMusicMute,
    setMusicVolume,
    playModuleMusic,
    stopModuleMusic,
    preloadModuleMusic,
    notifyVideoStart,
    notifyVideoEnd,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

/**
 * Hook to access audio context
 */
export function useAudioContext(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudioContext must be used within an AudioProvider');
  }
  return context;
}

/**
 * Safe hook that returns null if outside AudioProvider (for optional usage)
 */
export function useAudioContextSafe(): AudioContextType | null {
  return useContext(AudioContext);
}

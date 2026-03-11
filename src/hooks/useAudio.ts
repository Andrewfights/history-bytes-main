/**
 * useAudio - Hook for playing sound effects and managing audio state
 * Provides a simple interface for playing sounds throughout the app
 */

import { useCallback, useEffect, useRef, useState } from 'react';

// Sound effect paths - will be loaded from public/assets/audio/sfx/
export const SOUNDS = {
  // Radar sounds
  radarPing: '/assets/audio/sfx/radar-ping.mp3',
  radarSweep: '/assets/audio/sfx/radar-sweep.mp3',
  blipDetect: '/assets/audio/sfx/blip-detect.mp3',
  alert: '/assets/audio/sfx/alert.mp3',

  // UI feedback sounds
  correct: '/assets/audio/sfx/correct.mp3',
  incorrect: '/assets/audio/sfx/incorrect.mp3',
  select: '/assets/audio/sfx/select.mp3',
  confirm: '/assets/audio/sfx/confirm.mp3',

  // Game sounds
  tick: '/assets/audio/sfx/tick.mp3',
  timerWarning: '/assets/audio/sfx/timer-warning.mp3',
  complete: '/assets/audio/sfx/complete.mp3',
  levelUp: '/assets/audio/sfx/level-up.mp3',

  // Ambient
  tensionLoop: '/assets/audio/sfx/tension-loop.mp3',
} as const;

export type SoundName = keyof typeof SOUNDS;

// Global mute state stored in localStorage
const MUTE_KEY = 'hb_audio_muted';

function getGlobalMute(): boolean {
  try {
    return localStorage.getItem(MUTE_KEY) === 'true';
  } catch {
    return false;
  }
}

function setGlobalMute(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_KEY, muted ? 'true' : 'false');
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Hook for playing individual sound effects
 */
export function useSound(soundName: SoundName, options?: { volume?: number; loop?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(getGlobalMute);

  useEffect(() => {
    // Create audio element
    const audio = new Audio(SOUNDS[soundName]);
    audio.volume = options?.volume ?? 0.5;
    audio.loop = options?.loop ?? false;

    audio.addEventListener('ended', () => setIsPlaying(false));
    audio.addEventListener('error', (e) => {
      console.warn(`[Audio] Failed to load sound: ${soundName}`, e);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [soundName, options?.volume, options?.loop]);

  const play = useCallback(() => {
    if (audioRef.current && !isMuted) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((e) => {
        // Autoplay may be blocked - this is normal
        console.debug('[Audio] Play blocked:', e.message);
      });
      setIsPlaying(true);
    }
  }, [isMuted]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  const setVolume = useCallback((volume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setGlobalMute(newMuted);
    if (newMuted && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isMuted]);

  return { play, stop, toggle, isPlaying, isMuted, toggleMute, setVolume };
}

/**
 * Hook for playing multiple sound effects
 * Useful for components that need to play various sounds
 */
export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState(getGlobalMute);
  const audioCache = useRef<Map<SoundName, HTMLAudioElement>>(new Map());

  // Preload common sounds
  useEffect(() => {
    const soundsToPreload: SoundName[] = ['correct', 'incorrect', 'select', 'confirm'];

    soundsToPreload.forEach((name) => {
      if (!audioCache.current.has(name)) {
        const audio = new Audio(SOUNDS[name]);
        audio.preload = 'auto';
        audioCache.current.set(name, audio);
      }
    });
  }, []);

  const play = useCallback((soundName: SoundName, volume = 0.5) => {
    if (isMuted) return;

    let audio = audioCache.current.get(soundName);

    if (!audio) {
      audio = new Audio(SOUNDS[soundName]);
      audioCache.current.set(soundName, audio);
    }

    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch((e) => {
      console.debug('[Audio] Play blocked:', e.message);
    });
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setGlobalMute(newMuted);

    // Stop all playing sounds when muting
    if (newMuted) {
      audioCache.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    }
  }, [isMuted]);

  return { play, isMuted, toggleMute };
}

/**
 * Hook for playing ambient/background sounds
 * Handles looping and fade in/out
 */
export function useAmbientSound(soundName: SoundName, options?: { volume?: number; fadeTime?: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(getGlobalMute);

  const targetVolume = options?.volume ?? 0.3;
  const fadeTime = options?.fadeTime ?? 1000;

  useEffect(() => {
    const audio = new Audio(SOUNDS[soundName]);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      audio.pause();
      audio.src = '';
    };
  }, [soundName]);

  const fadeIn = useCallback(() => {
    if (!audioRef.current || isMuted) return;

    const audio = audioRef.current;
    audio.volume = 0;
    audio.play().catch(() => {});
    setIsPlaying(true);

    const steps = 20;
    const stepTime = fadeTime / steps;
    const volumeStep = targetVolume / steps;
    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.min(volumeStep * currentStep, targetVolume);

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;
      }
    }, stepTime);
  }, [isMuted, fadeTime, targetVolume]);

  const fadeOut = useCallback(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const steps = 20;
    const stepTime = fadeTime / steps;
    const volumeStep = startVolume / steps;
    let currentStep = 0;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(startVolume - volumeStep * currentStep, 0);

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current!);
        fadeIntervalRef.current = null;
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false);
      }
    }, stepTime);
  }, [fadeTime]);

  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    setGlobalMute(newMuted);

    if (newMuted && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [isMuted]);

  return { fadeIn, fadeOut, isPlaying, isMuted, toggleMute };
}

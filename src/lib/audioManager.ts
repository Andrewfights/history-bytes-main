/**
 * Audio Manager for Final Exam Game Show
 * Handles all sound effects with preloading, volume control, and mute toggle
 */

// Audio file paths - stored in Firebase Storage or public folder
const AUDIO_PATHS = {
  tick: '/audio/exam/tick.mp3',
  tickUrgent: '/audio/exam/tick-urgent.mp3',
  lockIn: '/audio/exam/lockin.mp3',
  buzzer: '/audio/exam/buzzer.mp3',
  tensionLoop: '/audio/exam/tension-loop.mp3',
  whoosh: '/audio/exam/whoosh.mp3',
  fanfare: '/audio/exam/fanfare.mp3',
  correct: '/audio/exam/correct.mp3',
  incorrect: '/audio/exam/incorrect.mp3',
} as const;

export type AudioClip = keyof typeof AUDIO_PATHS;

// Singleton audio manager
class ExamAudioManager {
  private audioCache: Map<AudioClip, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private isPreloaded: boolean = false;
  private currentLoop: HTMLAudioElement | null = null;

  constructor() {
    // Load preferences from localStorage
    this.isMuted = localStorage.getItem('examAudioMuted') === 'true';
    const savedVolume = localStorage.getItem('examAudioVolume');
    if (savedVolume) {
      this.volume = parseFloat(savedVolume);
    }
  }

  // Preload all audio files
  async preload(): Promise<void> {
    if (this.isPreloaded) return;

    const loadPromises = Object.entries(AUDIO_PATHS).map(([key, path]) => {
      return new Promise<void>((resolve) => {
        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        audio.volume = this.volume;

        audio.addEventListener('canplaythrough', () => {
          this.audioCache.set(key as AudioClip, audio);
          resolve();
        }, { once: true });

        audio.addEventListener('error', () => {
          console.warn(`[AudioManager] Failed to load: ${path}`);
          resolve(); // Don't fail the whole preload
        }, { once: true });

        // Start loading
        audio.load();
      });
    });

    await Promise.all(loadPromises);
    this.isPreloaded = true;
    console.log('[AudioManager] Audio files preloaded');
  }

  // Play a sound effect
  play(clip: AudioClip): void {
    if (this.isMuted) return;

    const audio = this.audioCache.get(clip);
    if (audio) {
      // Clone the audio element for overlapping sounds
      const clone = audio.cloneNode(true) as HTMLAudioElement;
      clone.volume = this.volume;
      clone.play().catch(() => {
        // Silently fail - user may not have interacted yet
      });
    } else {
      // Fallback: try to play directly if not preloaded
      this.playDirect(clip);
    }
  }

  // Play a sound directly without cache
  private playDirect(clip: AudioClip): void {
    if (this.isMuted) return;

    const path = AUDIO_PATHS[clip];
    const audio = new Audio(path);
    audio.volume = this.volume;
    audio.play().catch(() => {
      // Silently fail
    });
  }

  // Play a looping sound (like tension music)
  playLoop(clip: AudioClip): void {
    if (this.isMuted) return;

    this.stopLoop(); // Stop any existing loop

    const audio = this.audioCache.get(clip);
    if (audio) {
      this.currentLoop = audio.cloneNode(true) as HTMLAudioElement;
      this.currentLoop.loop = true;
      this.currentLoop.volume = this.volume * 0.5; // Quieter for background
      this.currentLoop.play().catch(() => {});
    }
  }

  // Stop the current loop
  stopLoop(): void {
    if (this.currentLoop) {
      this.currentLoop.pause();
      this.currentLoop.currentTime = 0;
      this.currentLoop = null;
    }
  }

  // Fade out the current loop
  fadeOutLoop(durationMs: number = 500): void {
    if (!this.currentLoop) return;

    const loop = this.currentLoop;
    const startVolume = loop.volume;
    const steps = 20;
    const stepDuration = durationMs / steps;
    const volumeStep = startVolume / steps;

    let step = 0;
    const fadeInterval = setInterval(() => {
      step++;
      loop.volume = Math.max(0, startVolume - volumeStep * step);

      if (step >= steps) {
        clearInterval(fadeInterval);
        this.stopLoop();
      }
    }, stepDuration);
  }

  // Play timer tick based on time remaining
  playTimerTick(secondsRemaining: number): void {
    if (this.isMuted) return;

    if (secondsRemaining <= 3 && secondsRemaining > 0) {
      this.play('tickUrgent');
    } else if (secondsRemaining > 3) {
      this.play('tick');
    } else if (secondsRemaining === 0) {
      this.play('buzzer');
    }
  }

  // Toggle mute state
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('examAudioMuted', String(this.isMuted));

    if (this.isMuted) {
      this.stopLoop();
    }

    return this.isMuted;
  }

  // Get mute state
  getMuted(): boolean {
    return this.isMuted;
  }

  // Set mute state
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem('examAudioMuted', String(this.isMuted));

    if (this.isMuted) {
      this.stopLoop();
    }
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('examAudioVolume', String(this.volume));

    // Update cached audio volumes
    this.audioCache.forEach((audio) => {
      audio.volume = this.volume;
    });

    if (this.currentLoop) {
      this.currentLoop.volume = this.volume * 0.5;
    }
  }

  // Get current volume
  getVolume(): number {
    return this.volume;
  }

  // Clean up
  dispose(): void {
    this.stopLoop();
    this.audioCache.clear();
    this.isPreloaded = false;
  }
}

// Export singleton instance
export const examAudioManager = new ExamAudioManager();

// React hook for audio manager
export function useExamAudio() {
  return {
    preload: () => examAudioManager.preload(),
    play: (clip: AudioClip) => examAudioManager.play(clip),
    playLoop: (clip: AudioClip) => examAudioManager.playLoop(clip),
    stopLoop: () => examAudioManager.stopLoop(),
    fadeOutLoop: (duration?: number) => examAudioManager.fadeOutLoop(duration),
    playTimerTick: (seconds: number) => examAudioManager.playTimerTick(seconds),
    toggleMute: () => examAudioManager.toggleMute(),
    getMuted: () => examAudioManager.getMuted(),
    setMuted: (muted: boolean) => examAudioManager.setMuted(muted),
    setVolume: (volume: number) => examAudioManager.setVolume(volume),
    getVolume: () => examAudioManager.getVolume(),
    dispose: () => examAudioManager.dispose(),
  };
}

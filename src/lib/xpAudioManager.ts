/**
 * XP Audio Manager
 * Handles sound effects for XP awards and celebrations
 */

// Audio file paths - stored in public folder
const AUDIO_PATHS = {
  xpEarned: '/audio/xp-earned.mp3',        // Short celebratory chime for XP award
  xpCelebrate: '/audio/xp-celebrate.mp3',  // Longer celebration for milestones
} as const;

export type XPAudioClip = keyof typeof AUDIO_PATHS;

// Singleton XP audio manager
class XPAudioManager {
  private audioCache: Map<XPAudioClip, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.7;
  private isPreloaded: boolean = false;

  constructor() {
    // Load preferences from localStorage (share with exam audio)
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
          this.audioCache.set(key as XPAudioClip, audio);
          resolve();
        }, { once: true });

        audio.addEventListener('error', () => {
          console.warn(`[XPAudioManager] Failed to load: ${path}`);
          resolve(); // Don't fail the whole preload
        }, { once: true });

        // Start loading
        audio.load();
      });
    });

    await Promise.all(loadPromises);
    this.isPreloaded = true;
    console.log('[XPAudioManager] Audio files preloaded');
  }

  // Play a sound effect
  play(clip: XPAudioClip): void {
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
  private playDirect(clip: XPAudioClip): void {
    if (this.isMuted) return;

    const path = AUDIO_PATHS[clip];
    const audio = new Audio(path);
    audio.volume = this.volume;
    audio.play().catch(() => {
      // Silently fail
    });
  }

  // Play XP earned sound (shorthand)
  playXPEarned(): void {
    this.play('xpEarned');
  }

  // Play celebration sound (shorthand)
  playCelebration(): void {
    this.play('xpCelebrate');
  }

  // Get mute state
  getMuted(): boolean {
    return this.isMuted;
  }

  // Set mute state
  setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  // Set volume (0-1)
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update cached audio volumes
    this.audioCache.forEach((audio) => {
      audio.volume = this.volume;
    });
  }

  // Get current volume
  getVolume(): number {
    return this.volume;
  }

  // Clean up
  dispose(): void {
    this.audioCache.clear();
    this.isPreloaded = false;
  }
}

// Export singleton instance
export const xpAudioManager = new XPAudioManager();

// Simple function to play XP sound (for easy import)
export function playXPSound(): void {
  xpAudioManager.playXPEarned();
}

// Simple function to play celebration sound
export function playCelebrationSound(): void {
  xpAudioManager.playCelebration();
}

// React hook for XP audio
export function useXPAudio() {
  return {
    preload: () => xpAudioManager.preload(),
    play: (clip: XPAudioClip) => xpAudioManager.play(clip),
    playXPEarned: () => xpAudioManager.playXPEarned(),
    playCelebration: () => xpAudioManager.playCelebration(),
    getMuted: () => xpAudioManager.getMuted(),
    setMuted: (muted: boolean) => xpAudioManager.setMuted(muted),
    setVolume: (volume: number) => xpAudioManager.setVolume(volume),
    getVolume: () => xpAudioManager.getVolume(),
    dispose: () => xpAudioManager.dispose(),
  };
}

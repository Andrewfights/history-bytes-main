/**
 * Module Audio Manager - Background music for modules/theaters
 * Handles looping playback with video-aware fade in/out
 */

const STORAGE_KEYS = {
  muted: 'hb_music_muted',
  volume: 'hb_music_volume',
};

interface PlayConfig {
  moduleId: string;
  musicUrl: string;
  volume?: number;
  fadeInMs?: number;
}

class ModuleAudioManager {
  private currentAudio: HTMLAudioElement | null = null;
  private preloadCache: Map<string, HTMLAudioElement> = new Map();
  private isMuted: boolean = false;
  private volume: number = 0.3;
  private currentModuleId: string | null = null;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private videoPlayingCount: number = 0;
  private targetVolume: number = 0.3;
  private wasPlayingBeforeVideo: boolean = false;

  constructor() {
    // Load preferences from localStorage
    this.isMuted = localStorage.getItem(STORAGE_KEYS.muted) === 'true';
    const savedVolume = localStorage.getItem(STORAGE_KEYS.volume);
    if (savedVolume) {
      this.volume = parseFloat(savedVolume);
      this.targetVolume = this.volume;
    }
  }

  /**
   * Preload music for a module (for seamless transitions)
   */
  async preload(moduleId: string, musicUrl: string): Promise<void> {
    if (this.preloadCache.has(moduleId)) return;

    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = musicUrl;
      audio.preload = 'auto';
      audio.loop = true;

      audio.addEventListener('canplaythrough', () => {
        this.preloadCache.set(moduleId, audio);
        resolve();
      }, { once: true });

      audio.addEventListener('error', () => {
        console.warn(`[ModuleAudio] Failed to preload: ${musicUrl}`);
        resolve();
      }, { once: true });

      audio.load();
    });
  }

  /**
   * Start playing background music for a module
   */
  play(config: PlayConfig): void {
    const { moduleId, musicUrl, volume = this.volume, fadeInMs = 1000 } = config;

    // If already playing this module, don't restart
    if (this.currentModuleId === moduleId && this.currentAudio) {
      return;
    }

    // Stop any current music with fade
    if (this.currentAudio) {
      this.stop();
    }

    this.currentModuleId = moduleId;
    this.targetVolume = volume;

    // Use preloaded audio if available
    let audio = this.preloadCache.get(moduleId);
    if (!audio) {
      audio = new Audio(musicUrl);
      audio.loop = true;
    }

    this.currentAudio = audio;
    audio.volume = 0;

    if (this.isMuted) {
      audio.muted = true;
    }

    // Start playing and fade in
    audio.play().then(() => {
      if (!this.isMuted) {
        this.fadeIn(fadeInMs);
      }
    }).catch((err) => {
      console.warn('[ModuleAudio] Autoplay blocked:', err);
      // Store for later resume after user interaction
    });
  }

  /**
   * Stop music with optional fade out
   */
  stop(fadeOutMs: number = 500): void {
    if (!this.currentAudio) return;

    const audio = this.currentAudio;

    if (fadeOutMs > 0) {
      this.fadeOut(fadeOutMs).then(() => {
        audio.pause();
        audio.currentTime = 0;
      });
    } else {
      audio.pause();
      audio.currentTime = 0;
    }

    this.currentAudio = null;
    this.currentModuleId = null;
  }

  /**
   * Pause music (for video playback)
   */
  pause(): void {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.wasPlayingBeforeVideo = true;
      this.fadeOut(300);
    }
  }

  /**
   * Resume music after video
   */
  resume(): void {
    if (this.currentAudio && this.wasPlayingBeforeVideo) {
      this.wasPlayingBeforeVideo = false;
      if (this.currentAudio.paused) {
        this.currentAudio.play().catch(() => {});
      }
      this.fadeIn(500);
    }
  }

  /**
   * Fade out the current audio
   */
  fadeOut(durationMs: number = 500): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentAudio || this.isMuted) {
        resolve();
        return;
      }

      this.clearFade();

      const audio = this.currentAudio;
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = durationMs / steps;
      const volumeStep = startVolume / steps;

      let step = 0;
      this.fadeInterval = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVolume - volumeStep * step);

        if (step >= steps) {
          this.clearFade();
          audio.volume = 0;
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Fade in the current audio
   */
  fadeIn(durationMs: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentAudio || this.isMuted) {
        resolve();
        return;
      }

      this.clearFade();

      const audio = this.currentAudio;
      const targetVol = this.targetVolume;
      const startVolume = audio.volume;
      const steps = 20;
      const stepDuration = durationMs / steps;
      const volumeStep = (targetVol - startVolume) / steps;

      let step = 0;
      this.fadeInterval = setInterval(() => {
        step++;
        audio.volume = Math.min(targetVol, startVolume + volumeStep * step);

        if (step >= steps) {
          this.clearFade();
          audio.volume = targetVol;
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Clear any active fade interval
   */
  private clearFade(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  /**
   * Called when a video starts playing - fades out music
   */
  onVideoStart(): void {
    this.videoPlayingCount++;
    if (this.videoPlayingCount === 1 && this.currentAudio) {
      this.wasPlayingBeforeVideo = !this.currentAudio.paused;
      this.fadeOut(300);
    }
  }

  /**
   * Called when a video ends - fades music back in
   */
  onVideoEnd(): void {
    this.videoPlayingCount = Math.max(0, this.videoPlayingCount - 1);
    if (this.videoPlayingCount === 0 && this.wasPlayingBeforeVideo) {
      this.fadeIn(500);
      this.wasPlayingBeforeVideo = false;
    }
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem(STORAGE_KEYS.muted, String(this.isMuted));

    if (this.currentAudio) {
      this.currentAudio.muted = this.isMuted;
      if (!this.isMuted && this.currentAudio.volume === 0) {
        this.fadeIn(300);
      }
    }

    return this.isMuted;
  }

  /**
   * Get mute state
   */
  getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Set mute state
   */
  setMuted(muted: boolean): void {
    this.isMuted = muted;
    localStorage.setItem(STORAGE_KEYS.muted, String(muted));

    if (this.currentAudio) {
      this.currentAudio.muted = muted;
    }
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    this.targetVolume = this.volume;
    localStorage.setItem(STORAGE_KEYS.volume, String(this.volume));

    if (this.currentAudio && !this.isMuted) {
      this.currentAudio.volume = this.volume;
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Check if music is currently playing
   */
  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }

  /**
   * Get current module ID
   */
  getCurrentModuleId(): string | null {
    return this.currentModuleId;
  }

  /**
   * Clean up all resources
   */
  dispose(): void {
    this.clearFade();
    this.stop(0);
    this.preloadCache.forEach((audio) => {
      audio.pause();
      audio.src = '';
    });
    this.preloadCache.clear();
    this.videoPlayingCount = 0;
    this.wasPlayingBeforeVideo = false;
  }
}

// Export singleton instance
export const moduleAudioManager = new ModuleAudioManager();

/**
 * React hook for module audio
 */
export function useModuleAudio() {
  return {
    preload: (moduleId: string, musicUrl: string) => moduleAudioManager.preload(moduleId, musicUrl),
    play: (config: PlayConfig) => moduleAudioManager.play(config),
    stop: (fadeOutMs?: number) => moduleAudioManager.stop(fadeOutMs),
    pause: () => moduleAudioManager.pause(),
    resume: () => moduleAudioManager.resume(),
    fadeOut: (durationMs?: number) => moduleAudioManager.fadeOut(durationMs),
    fadeIn: (durationMs?: number) => moduleAudioManager.fadeIn(durationMs),
    onVideoStart: () => moduleAudioManager.onVideoStart(),
    onVideoEnd: () => moduleAudioManager.onVideoEnd(),
    toggleMute: () => moduleAudioManager.toggleMute(),
    getMuted: () => moduleAudioManager.getMuted(),
    setMuted: (muted: boolean) => moduleAudioManager.setMuted(muted),
    setVolume: (volume: number) => moduleAudioManager.setVolume(volume),
    getVolume: () => moduleAudioManager.getVolume(),
    isPlaying: () => moduleAudioManager.isPlaying(),
    getCurrentModuleId: () => moduleAudioManager.getCurrentModuleId(),
    dispose: () => moduleAudioManager.dispose(),
  };
}

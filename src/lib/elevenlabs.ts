// ElevenLabs API Client for AI Voice Generation
// Uses env variable for API key, with localStorage override option

const ENV_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const STORAGE_KEY = 'history-bytes:elevenlabs-api-key';
const VOICE_SETTINGS_KEY = 'history-bytes:voice-settings';

// Voice configuration interface
export interface VoiceConfig {
  id: string;
  name: string;
  elevenLabsVoiceId: string | null;
  stability: number;
  similarityBoost: number;
  style: number;
  speakerBoost: boolean;
  previewAudioUrl?: string;
}

// Voice assignment interface
export interface VoiceAssignment {
  entityType: 'spirit-guide' | 'host' | 'narrator';
  entityId: string;
  voiceConfigId: string;
}

// ElevenLabs voice from API
export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url?: string;
}

// Text-to-speech options
export interface TTSOptions {
  voiceId: string;
  text: string;
  stability?: number;
  similarityBoost?: number;
  style?: number;
  speakerBoost?: boolean;
}

// API key management - env variable takes priority, localStorage as override
export function getApiKey(): string | null {
  // First check localStorage for user override
  try {
    const storedKey = localStorage.getItem(STORAGE_KEY);
    if (storedKey) return storedKey;
  } catch {
    // localStorage not available
  }

  // Fall back to env variable
  if (ENV_API_KEY) return ENV_API_KEY;

  return null;
}

export function setApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch (err) {
    console.error('Failed to save API key:', err);
  }
}

export function clearApiKey(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear API key:', err);
  }
}

export function isApiKeySet(): boolean {
  return Boolean(getApiKey());
}

// Voice settings management (localStorage)
export function getVoiceSettings(): VoiceConfig[] {
  try {
    const stored = localStorage.getItem(VOICE_SETTINGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveVoiceSettings(settings: VoiceConfig[]): void {
  try {
    localStorage.setItem(VOICE_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save voice settings:', err);
  }
}

// Fetch available voices from ElevenLabs API
export async function fetchVoices(): Promise<ElevenLabsVoice[]> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('ElevenLabs API key not set');
    return [];
  }

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (err) {
    console.error('Failed to fetch voices:', err);
    return [];
  }
}

// Generate speech from text (returns audio blob URL)
export async function generateSpeech(options: TTSOptions): Promise<string | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[ElevenLabs] API key not set');
    return null;
  }

  console.log('[ElevenLabs] Generating speech for voice:', options.voiceId);
  console.log('[ElevenLabs] Text:', options.text.substring(0, 50) + '...');

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${options.voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: options.text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: options.stability ?? 0.5,
            similarity_boost: options.similarityBoost ?? 0.75,
            style: options.style ?? 0,
            use_speaker_boost: options.speakerBoost ?? true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ElevenLabs] API error:', response.status, errorText);
      throw new Error(`API error: ${response.status}`);
    }

    console.log('[ElevenLabs] Speech generated successfully');
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (err) {
    console.error('[ElevenLabs] Failed to generate speech:', err);
    return null;
  }
}

// Default voice configurations for Spirit Guides
// Voice IDs matched from ElevenLabs library to character personalities
export const defaultVoiceConfigs: VoiceConfig[] = [
  {
    id: 'socrates',
    name: 'Socrates',
    elevenLabsVoiceId: 'pqHfZKP75CvOlQylNhV4', // Bill - Wise, Mature, Balanced (old)
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0.3,
    speakerBoost: true,
  },
  {
    id: 'lincoln',
    name: 'Abraham Lincoln',
    elevenLabsVoiceId: 'nPczCjzI2devNBz1zQrb', // Brian - Deep, Resonant and Comforting
    stability: 0.65,
    similarityBoost: 0.8,
    style: 0.2,
    speakerBoost: true,
  },
  {
    id: 'cleopatra',
    name: 'Cleopatra',
    elevenLabsVoiceId: 'pFZP5JQG7iQjIQuC4Bku', // Lily - Velvety Actress, confident
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0.5,
    speakerBoost: true,
  },
  {
    id: 'davinci',
    name: 'Leonardo da Vinci',
    elevenLabsVoiceId: 'JBFqnCBsd6RMkjVDRZzb', // George - Warm, Captivating Storyteller
    stability: 0.55,
    similarityBoost: 0.7,
    style: 0.4,
    speakerBoost: true,
  },
  {
    id: 'suntzu',
    name: 'Sun Tzu',
    elevenLabsVoiceId: 'SAz9YHcvj6GT2YYXdXww', // River - Relaxed, Neutral, Informative, calm
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.2,
    speakerBoost: true,
  },
  {
    id: 'curie',
    name: 'Marie Curie',
    elevenLabsVoiceId: 'Xb7hH8MSUJpSbSDYk0k2', // Alice - Clear, Engaging Educator
    stability: 0.6,
    similarityBoost: 0.75,
    style: 0.3,
    speakerBoost: true,
  },
  {
    id: 'tubman',
    name: 'Harriet Tubman',
    elevenLabsVoiceId: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Mature, Reassuring, Confident
    stability: 0.6,
    similarityBoost: 0.8,
    style: 0.4,
    speakerBoost: true,
  },
  {
    id: 'elizabeth',
    name: 'Queen Elizabeth I',
    elevenLabsVoiceId: 'XrExE9yKIg1WjnnlVkGX', // Matilda - Knowledgeable, Professional
    stability: 0.55,
    similarityBoost: 0.75,
    style: 0.5,
    speakerBoost: true,
  },
  {
    id: 'narrator',
    name: 'Narrator',
    elevenLabsVoiceId: 'onwK4e9ZLuTAKqWW03F9', // Daniel - Steady Broadcaster, formal British
    stability: 0.7,
    similarityBoost: 0.8,
    style: 0.1,
    speakerBoost: true,
  },
];

// Get voice config by ID - merges saved settings with defaults to ensure voice IDs are present
export function getVoiceConfigById(id: string): VoiceConfig | undefined {
  const defaultConfig = defaultVoiceConfigs.find(v => v.id === id);
  const savedSettings = getVoiceSettings();
  const saved = savedSettings.find(v => v.id === id);

  // If we have saved settings, merge with defaults (defaults provide voice ID if missing)
  if (saved && defaultConfig) {
    return {
      ...defaultConfig,
      ...saved,
      // Always use default voice ID if saved one is null/undefined
      elevenLabsVoiceId: saved.elevenLabsVoiceId || defaultConfig.elevenLabsVoiceId,
    };
  }

  return saved || defaultConfig;
}

// Initialize voice settings with defaults if not set
export function initializeVoiceSettings(): VoiceConfig[] {
  const existing = getVoiceSettings();
  if (existing.length === 0) {
    saveVoiceSettings(defaultVoiceConfigs);
    return defaultVoiceConfigs;
  }
  return existing;
}

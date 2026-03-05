/**
 * Suno AI Music Generator Client
 * Generates AI music using the Suno API
 */

const SUNO_API_KEY = import.meta.env.VITE_SUNO_API_KEY;

// Suno API base URL (use official or third-party provider)
const SUNO_API_BASE = import.meta.env.VITE_SUNO_API_URL || 'https://api.suno.ai/v1';

export interface MusicGenerationOptions {
  prompt: string;                 // Description of the music
  style?: string;                 // Genre/style (e.g., "orchestral", "epic", "ambient")
  duration?: number;              // Duration in seconds (30-240)
  instrumental?: boolean;         // Whether to generate instrumental only
  mood?: string;                  // Mood (e.g., "triumphant", "mysterious", "melancholic")
  era?: string;                   // Historical era for theming
}

export interface GeneratedMusic {
  id: string;
  audioUrl: string;
  title: string;
  prompt: string;
  duration: number;
  mimeType: string;
  createdAt: Date;
}

export interface MusicGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  audioUrl?: string;
  error?: string;
}

/**
 * Check if Suno API is configured
 */
export function isSunoConfigured(): boolean {
  const configured = !!SUNO_API_KEY;
  console.log('[Suno] API configured:', configured);
  return configured;
}

/**
 * Build an enhanced music prompt with historical theming
 */
export function buildMusicPrompt(options: MusicGenerationOptions): string {
  const parts: string[] = [];

  // Add era context
  if (options.era) {
    parts.push(`Music inspired by ${options.era}`);
  }

  // Add mood
  if (options.mood) {
    parts.push(`${options.mood} mood`);
  }

  // Add style
  if (options.style) {
    parts.push(`${options.style} style`);
  }

  // Add main prompt
  parts.push(options.prompt);

  // Add instrumental flag
  if (options.instrumental) {
    parts.push('instrumental, no vocals');
  }

  return parts.join(', ');
}

// Style presets for historical eras
export const ERA_MUSIC_STYLES: Record<string, { style: string; mood: string }> = {
  'Ancient Greece': { style: 'ancient Greek lyre, aulos flute, Mediterranean', mood: 'philosophical' },
  'Ancient Rome': { style: 'brass fanfare, Roman military drums, ancient Mediterranean', mood: 'triumphant' },
  'Ancient Egypt': { style: 'ancient Egyptian harp, sistrum, desert winds', mood: 'mystical' },
  'Medieval Europe': { style: 'medieval lute, recorder, court music', mood: 'noble' },
  'Renaissance': { style: 'Renaissance madrigal, harpsichord, chamber music', mood: 'elegant' },
  'French Revolution': { style: 'revolutionary march, drums, orchestral', mood: 'dramatic' },
  'Industrial Revolution': { style: 'Victorian brass band, steam age', mood: 'progressive' },
  'World War II': { style: '1940s big band, wartime orchestral', mood: 'patriotic' },
  'Civil Rights Era': { style: 'gospel, soul, protest folk', mood: 'hopeful' },
};

// Genre presets for games and modules
export const GAME_MUSIC_GENRES = [
  { id: 'epic-orchestral', label: 'Epic Orchestral', prompt: 'epic orchestral soundtrack, cinematic, sweeping strings, brass section, timpani drums' },
  { id: 'ambient-historical', label: 'Ambient Historical', prompt: 'ambient atmospheric music, historical setting, gentle and immersive, perfect for learning' },
  { id: 'mystery', label: 'Mystery/Discovery', prompt: 'mysterious discovery music, subtle tension, curious exploration, adventure' },
  { id: 'triumph', label: 'Triumphant/Victory', prompt: 'triumphant victory fanfare, celebratory, achievement unlocked, uplifting brass' },
  { id: 'contemplative', label: 'Contemplative', prompt: 'contemplative piano, reflective, thoughtful, quiet moments' },
  { id: 'adventure', label: 'Adventure', prompt: 'adventure exploration music, exciting journey, discovery, world map theme' },
  { id: 'tension', label: 'Tension/Suspense', prompt: 'suspenseful tension music, building anticipation, dramatic reveal incoming' },
  { id: 'educational', label: 'Educational/Neutral', prompt: 'calm educational background music, neutral, non-distracting, study music' },
];

/**
 * Generate music using Suno API
 */
export async function generateMusic(options: MusicGenerationOptions): Promise<GeneratedMusic | null> {
  if (!SUNO_API_KEY) {
    console.error('[Suno] API key not configured');
    return null;
  }

  const enhancedPrompt = buildMusicPrompt(options);
  const duration = Math.min(Math.max(options.duration || 60, 30), 240);

  console.log('[Suno] Generating music with prompt:', enhancedPrompt);

  try {
    // Start generation
    const response = await fetch(`${SUNO_API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        duration: duration,
        make_instrumental: options.instrumental ?? true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Suno] API error:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    console.log('[Suno] Generation started:', data);

    // If immediate result
    if (data.audio_url) {
      return {
        id: data.id || Date.now().toString(),
        audioUrl: data.audio_url,
        title: data.title || options.prompt.slice(0, 50),
        prompt: enhancedPrompt,
        duration: data.duration || duration,
        mimeType: 'audio/mpeg',
        createdAt: new Date(),
      };
    }

    // If async, poll for result
    if (data.id || data.task_id) {
      const taskId = data.id || data.task_id;
      return await pollMusicGeneration(taskId, enhancedPrompt, duration);
    }

    console.error('[Suno] Unexpected response format');
    return null;
  } catch (error) {
    console.error('[Suno] Error generating music:', error);
    return null;
  }
}

/**
 * Poll for music generation completion
 */
async function pollMusicGeneration(
  taskId: string,
  prompt: string,
  duration: number,
  maxAttempts: number = 60
): Promise<GeneratedMusic | null> {
  console.log('[Suno] Polling for task:', taskId);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Wait between polls
      await new Promise(resolve => setTimeout(resolve, 3000));

      const response = await fetch(`${SUNO_API_BASE}/status/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`,
        },
      });

      if (!response.ok) {
        console.error('[Suno] Poll error:', response.status);
        continue;
      }

      const data = await response.json();
      console.log('[Suno] Poll attempt', attempt + 1, '- status:', data.status);

      if (data.status === 'completed' || data.status === 'complete') {
        if (data.audio_url) {
          return {
            id: taskId,
            audioUrl: data.audio_url,
            title: data.title || prompt.slice(0, 50),
            prompt: prompt,
            duration: data.duration || duration,
            mimeType: 'audio/mpeg',
            createdAt: new Date(),
          };
        }
      }

      if (data.status === 'failed' || data.status === 'error') {
        console.error('[Suno] Generation failed:', data.error);
        return null;
      }
    } catch (error) {
      console.error('[Suno] Poll error:', error);
    }
  }

  console.error('[Suno] Timeout waiting for music generation');
  return null;
}

/**
 * Convert audio file to base64
 */
export async function audioToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Create a data URL from base64 audio
 */
export function base64ToAudioUrl(base64: string, mimeType: string = 'audio/mpeg'): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Download audio file
 */
export function downloadAudio(audioUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = audioUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get audio duration from a file
 */
export function getAudioDuration(audioUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
    };
    audio.onerror = () => {
      resolve(0);
    };
    audio.src = audioUrl;
  });
}

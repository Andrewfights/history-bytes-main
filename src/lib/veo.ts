/**
 * Veo 2 API Client for Video Generation
 * Uses Google's Veo 2 model via the Gemini API for AI video generation
 */

// Use Gemini API key - Veo 2 is part of the Gemini model family
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Veo 2 model for video generation
const VEO_MODEL = 'veo-2.0-generate-001';

export interface VideoGenerationOptions {
  imageUrl?: string;          // Source image URL
  imageBase64?: string;       // Source image as base64
  prompt: string;             // Motion/action description
  duration?: number;          // Duration in seconds (5-8 recommended)
  aspectRatio?: '16:9' | '9:16' | '1:1';
}

export interface GeneratedVideo {
  videoUrl: string;
  mimeType: string;
  duration: number;
  operationId?: string;       // For async polling
}

export interface VideoGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  videoUrl?: string;
  error?: string;
}

/**
 * Check if Veo API is configured (uses Gemini API key)
 */
export function isVeoConfigured(): boolean {
  console.log('[Veo] API key configured:', !!API_KEY);
  return !!API_KEY;
}

// Master cinematic style for video generation
const VIDEO_CINEMATIC_STYLE = `
Cinematic video quality, smooth camera movement, professional cinematography,
natural motion blur, film grain texture, atmospheric lighting,
historically accurate period details, professional color grading,
movie-quality production values
`.trim().replace(/\n/g, ' ');

/**
 * Generate a video using Veo 2 model
 * Supports both text-to-video and image-to-video generation
 */
export async function generateVideo(options: VideoGenerationOptions): Promise<GeneratedVideo | null> {
  if (!API_KEY) {
    console.error('[Veo] API key not configured');
    return null;
  }

  const { prompt, imageBase64, duration = 5, aspectRatio = '16:9' } = options;

  // Build enhanced prompt with cinematic styling
  const enhancedPrompt = `${VIDEO_CINEMATIC_STYLE}. ${prompt}`;
  console.log('[Veo] Generating video with prompt:', enhancedPrompt.substring(0, 100) + '...');

  try {
    // Veo 2 uses the predict endpoint for video generation
    const requestBody: Record<string, unknown> = {
      instances: [
        {
          prompt: enhancedPrompt,
          ...(imageBase64 ? { image: { bytesBase64Encoded: imageBase64 } } : {}),
        }
      ],
      parameters: {
        aspectRatio: aspectRatio,
        personGeneration: 'allow_adult',
        durationSeconds: Math.min(Math.max(duration, 5), 8), // Veo 2 supports 5-8 seconds
        numberOfVideos: 1,
      }
    };

    console.log('[Veo] Calling Veo 2 API...');
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VEO_MODEL}:predictLongRunning?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Veo] API error:', response.status, errorData);

      // Try the generateContent endpoint as fallback
      return await generateVideoFallback(enhancedPrompt, imageBase64, duration, aspectRatio);
    }

    const data = await response.json();
    console.log('[Veo] Initial response:', JSON.stringify(data).substring(0, 200));

    // Veo 2 returns a long-running operation
    if (data.name) {
      console.log('[Veo] Operation started:', data.name);

      // Poll for completion
      const result = await pollVideoOperation(data.name);
      return result;
    }

    // Check for immediate video response
    if (data.predictions && data.predictions[0]?.video) {
      const video = data.predictions[0].video;
      if (video.bytesBase64Encoded) {
        const blob = base64ToBlob(video.bytesBase64Encoded, 'video/mp4');
        const videoUrl = URL.createObjectURL(blob);
        console.log('[Veo] Video generated successfully');
        return {
          videoUrl,
          mimeType: 'video/mp4',
          duration,
        };
      }
    }

    console.error('[Veo] Unexpected response format:', data);
    return null;
  } catch (error) {
    console.error('[Veo] Error generating video:', error);
    return null;
  }
}

/**
 * Fallback video generation using generateContent endpoint
 */
async function generateVideoFallback(
  prompt: string,
  imageBase64?: string,
  duration: number = 5,
  aspectRatio: string = '16:9'
): Promise<GeneratedVideo | null> {
  console.log('[Veo] Trying generateContent fallback...');

  try {
    const parts: Record<string, unknown>[] = [];

    // Add image if provided
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: imageBase64,
        }
      });
    }

    parts.push({ text: `Create a ${duration} second cinematic video: ${prompt}` });

    const requestBody = {
      contents: [{ parts }],
      generationConfig: {
        responseModalities: ['VIDEO'],
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VEO_MODEL}:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Veo] Fallback also failed:', response.status, errorData);
      return null;
    }

    const data = await response.json();

    // Extract video from response
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.mimeType?.startsWith('video/')) {
          const blob = base64ToBlob(part.inlineData.data, part.inlineData.mimeType);
          const videoUrl = URL.createObjectURL(blob);
          console.log('[Veo] Fallback video generated successfully');
          return {
            videoUrl,
            mimeType: part.inlineData.mimeType,
            duration,
          };
        }
      }
    }

    // Check for operation
    if (data.name) {
      return await pollVideoOperation(data.name);
    }

    console.error('[Veo] No video in fallback response');
    return null;
  } catch (error) {
    console.error('[Veo] Fallback error:', error);
    return null;
  }
}

/**
 * Poll a long-running video generation operation
 */
async function pollVideoOperation(operationName: string, maxAttempts: number = 60): Promise<GeneratedVideo | null> {
  console.log('[Veo] Polling operation:', operationName);

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Wait between polls (start at 2s, max 5s)
      const waitTime = Math.min(2000 + attempt * 500, 5000);
      await new Promise(resolve => setTimeout(resolve, waitTime));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/${operationName}?key=${API_KEY}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        console.error('[Veo] Poll error:', response.status);
        continue;
      }

      const data = await response.json();
      console.log('[Veo] Poll attempt', attempt + 1, '- done:', data.done);

      if (data.done) {
        if (data.error) {
          console.error('[Veo] Operation failed:', data.error);
          return null;
        }

        // Extract video from response
        if (data.response?.generatedVideos?.[0]) {
          const video = data.response.generatedVideos[0];

          if (video.video?.bytesBase64Encoded) {
            const blob = base64ToBlob(video.video.bytesBase64Encoded, 'video/mp4');
            const videoUrl = URL.createObjectURL(blob);
            console.log('[Veo] Video ready from operation');
            return {
              videoUrl,
              mimeType: 'video/mp4',
              duration: 5,
              operationId: operationName,
            };
          }

          if (video.video?.uri) {
            console.log('[Veo] Video URI from operation:', video.video.uri);
            return {
              videoUrl: video.video.uri,
              mimeType: 'video/mp4',
              duration: 5,
              operationId: operationName,
            };
          }
        }

        console.error('[Veo] Operation done but no video found');
        return null;
      }

      // Show progress if available
      if (data.metadata?.progressPercent) {
        console.log('[Veo] Progress:', data.metadata.progressPercent + '%');
      }
    } catch (error) {
      console.error('[Veo] Poll error:', error);
    }
  }

  console.error('[Veo] Timeout waiting for video generation');
  return null;
}

/**
 * Start async video generation (for longer videos)
 * Returns operation ID for polling
 */
export async function startVideoGeneration(options: VideoGenerationOptions): Promise<string | null> {
  if (!API_KEY) {
    console.error('[Veo] API key not configured');
    return null;
  }

  const { prompt, imageBase64, duration = 5, aspectRatio = '16:9' } = options;

  try {
    const enhancedPrompt = `${VIDEO_CINEMATIC_STYLE}. ${prompt}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${VEO_MODEL}:predictLongRunning?key=${API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: enhancedPrompt,
            ...(imageBase64 ? { image: { bytesBase64Encoded: imageBase64 } } : {}),
          }],
          parameters: {
            aspectRatio: aspectRatio,
            durationSeconds: Math.min(Math.max(duration, 5), 8),
            numberOfVideos: 1,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[Veo] API error:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('[Veo] Operation started:', data.name);
    return data.name || data.operationId || null;
  } catch (error) {
    console.error('[Veo] Error starting video generation:', error);
    return null;
  }
}

/**
 * Check status of async video generation
 */
export async function checkVideoStatus(operationId: string): Promise<VideoGenerationStatus> {
  if (!API_KEY) {
    return { status: 'failed', error: 'API key not configured' };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationId}?key=${API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return { status: 'failed', error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.done) {
      if (data.error) {
        return { status: 'failed', error: data.error.message };
      }

      // Check for video in response
      if (data.response?.generatedVideos?.[0]) {
        const video = data.response.generatedVideos[0];
        let videoUrl = '';

        if (video.video?.bytesBase64Encoded) {
          const blob = base64ToBlob(video.video.bytesBase64Encoded, 'video/mp4');
          videoUrl = URL.createObjectURL(blob);
        } else if (video.video?.uri) {
          videoUrl = video.video.uri;
        }

        if (videoUrl) {
          return {
            status: 'completed',
            videoUrl,
          };
        }
      }

      return { status: 'failed', error: 'No video in completed response' };
    }

    return {
      status: 'processing',
      progress: data.metadata?.progressPercent || 0,
    };
  } catch (error) {
    console.error('[Veo] Error checking video status:', error);
    return { status: 'failed', error: 'Network error' };
  }
}

/**
 * Convert base64 to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Convert video blob to base64
 */
export async function videoToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Download video from URL
 */
export function downloadVideo(videoUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = videoUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Build a video prompt with character reference
 */
export function buildVideoPrompt(
  action: string,
  character?: { name: string; stylePrompt?: string },
  setting?: string
): string {
  const parts: string[] = [];

  if (character) {
    if (character.stylePrompt) {
      parts.push(`${character.stylePrompt}`);
    }
    parts.push(`${character.name} ${action}`);
  } else {
    parts.push(action);
  }

  if (setting) {
    parts.push(`in ${setting}`);
  }

  parts.push('smooth motion, cinematic quality, historical accuracy');

  return parts.join(', ');
}

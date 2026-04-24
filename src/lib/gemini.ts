/**
 * Gemini API Client for AI Image Generation
 * Uses Gemini 2.5 Flash Image for high-quality, cinematic historical imagery
 */

import { getApiKey } from './apiKeys';

// Get API key from user storage or env var
const getGeminiApiKey = () => getApiKey('gemini');

// Supported aspect ratios per documentation
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '4:5' | '5:4' | '9:16' | '16:9' | '21:9';

export interface GenerateImageOptions {
  prompt: string;
  aspectRatio?: AspectRatio;
  style?: 'cinematic' | 'portrait' | 'illustration' | 'documentary';
  numberOfImages?: number;
}

export interface GeneratedImage {
  base64Data: string;
  mimeType: string;
}

// Master cinematic style prefix - applied to ALL generated images
const CINEMATIC_MASTER_STYLE = `
Photorealistic cinematic still, shot on ARRI Alexa 65mm,
anamorphic lens flare, natural film grain texture,
professional color grading with rich shadows and highlights,
atmospheric depth with volumetric lighting,
historically authentic period-accurate details,
composition following rule of thirds,
shallow depth of field with bokeh background,
golden hour lighting warmth mixed with practical light sources,
museum-quality historical accuracy in costumes and settings
`.trim().replace(/\n/g, ' ');

/**
 * Generate an image using Google's Imagen 3 API
 */
export async function generateImage(options: GenerateImageOptions): Promise<GeneratedImage | null> {
  const apiKey = getGeminiApiKey();
  console.log('[Imagen] generateImage called, apiKey exists:', !!apiKey);

  if (!apiKey) {
    console.error('[Imagen] API key not configured. Add your key in Profile Settings.');
    return null;
  }

  const { prompt, aspectRatio = '16:9', style = 'cinematic' } = options;

  // Build the enhanced prompt with cinematic styling
  const enhancedPrompt = buildEnhancedPrompt(prompt, style, aspectRatio);
  console.log('[Imagen] Generating with prompt:', enhancedPrompt.substring(0, 200) + '...');

  try {
    // Use Imagen 3 API endpoint
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [{
            prompt: enhancedPrompt
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatio,
            // personGeneration is required, set to allow for historical figures
            personGeneration: 'allow_adult',
            // Safety settings
            safetySetting: 'block_some',
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Imagen] API error:', response.status, errorData);

      // Log helpful debug info
      if (response.status === 404) {
        console.error('[Imagen] Model not found. Imagen 3 may not be available for your API key.');
      } else if (response.status === 403) {
        console.error('[Imagen] Access forbidden. Check API key permissions or enable Imagen in Google AI Studio.');
      } else if (response.status === 400) {
        console.error('[Imagen] Bad request. Check prompt or parameters:', errorData);
      }

      return null;
    }

    const data = await response.json();
    console.log('[Imagen] Response received:', Object.keys(data));

    // Extract image from Imagen response format
    if (data.predictions && data.predictions[0]?.bytesBase64Encoded) {
      console.log('[Imagen] Image generated successfully');
      return {
        base64Data: data.predictions[0].bytesBase64Encoded,
        mimeType: data.predictions[0].mimeType || 'image/png',
      };
    }

    console.error('[Imagen] No image found in response:', data);
    return null;
  } catch (error) {
    console.error('[Imagen] Error generating image:', error);
    return null;
  }
}

/**
 * Build an enhanced prompt with cinematic styling
 * All images get the master cinematic treatment plus style-specific enhancements
 */
function buildEnhancedPrompt(basePrompt: string, style: string, aspectRatio: AspectRatio): string {
  // Style-specific cinematography techniques
  const styleModifiers: Record<string, string> = {
    cinematic: `
      Epic establishing shot, sweeping camera movement implied,
      dramatic chiaroscuro lighting reminiscent of Roger Deakins,
      rich color palette with desaturated earth tones and warm highlights,
      environmental storytelling with period-accurate background details,
      dust particles and atmospheric haze for depth,
      lens breathing effect for organic feel
    `,
    portrait: `
      Intimate close-up shot, Rembrandt lighting setup,
      catchlights in eyes, subtle rim light on hair,
      85mm portrait lens compression, f/1.4 shallow depth,
      skin texture visible but flattering,
      neutral expression with emotional depth,
      historically accurate facial features and attire
    `,
    illustration: `
      Highly detailed digital matte painting style,
      painterly brush strokes with photorealistic elements,
      dramatic composition with strong focal point,
      rich saturated colors with cinematic color grading,
      atmospheric perspective for depth,
      concept art quality for historical documentation
    `,
    documentary: `
      Authentic documentary photography style,
      natural available light with minimal manipulation,
      candid moment captured in time,
      35mm film grain texture,
      journalistic composition,
      raw emotional authenticity,
      period-accurate environmental context
    `,
  };

  // Aspect ratio specific composition guidance
  const aspectComposition: Record<string, string> = {
    '16:9': 'wide cinematic frame, establishing shot composition, environmental context visible, letterbox format',
    '21:9': 'ultra-wide anamorphic composition, epic panoramic scope, immersive cinematic experience',
    '3:2': 'classic 35mm film format, balanced composition, timeless photographic framing',
    '4:3': 'classic academy ratio, intimate framing, focused subject matter',
    '1:1': 'square format medium format feel, centered subject, symmetrical composition possible',
    '2:3': 'vertical portrait orientation, full body or environmental portrait, magazine cover quality',
    '3:4': 'vertical composition, portrait with context, editorial photography style',
    '4:5': 'instagram portrait ratio, modern editorial feel, social media optimized',
    '5:4': 'large format photography feel, deliberate composition, fine art quality',
    '9:16': 'vertical cinematic, mobile-first composition, dramatic vertical scale',
  };

  const modifier = styleModifiers[style] || styleModifiers.cinematic;
  const composition = aspectComposition[aspectRatio] || aspectComposition['16:9'];

  // Combine all elements for maximum cinematic impact
  const fullPrompt = `
    ${CINEMATIC_MASTER_STYLE}

    SCENE: ${basePrompt}

    CINEMATOGRAPHY: ${modifier.trim().replace(/\n/g, ' ')}

    COMPOSITION: ${composition}

    QUALITY: 8K resolution detail, award-winning cinematography,
    historically accurate with museum-quality attention to period details,
    photorealistic with cinematic color science,
    no text or watermarks in the image
  `.trim().replace(/\s+/g, ' ');

  return fullPrompt;
}

/**
 * Build a prompt for historical scene images
 * Creates epic, cinematic historical moments
 */
export function buildHistoricalPrompt(title: string, era: string, description?: string): string {
  const context = description ? `: ${description}` : '';

  return `
    A pivotal moment in history - ${title}${context}.
    Set during ${era}, capturing the essence of the time period.
    Show authentic period architecture, clothing, and environmental details.
    Dramatic moment frozen in time, like a frame from an Oscar-winning historical epic.
    Natural lighting of the era (candlelight, gaslight, or natural sunlight as appropriate).
    Human subjects with authentic ethnic features for the region and time period.
    Background crowds and environmental details add scale and context.
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Build a prompt for character portrait images
 * Creates dignified, historically accurate portraits
 */
export function buildCharacterPrompt(name: string, era: string, title: string, details?: string): string {
  const additionalDetails = details ? ` ${details}` : '';

  return `
    Cinematic portrait of ${name}, ${title} from ${era}.${additionalDetails}
    Dignified pose conveying wisdom and authority of the historical figure.
    Period-accurate clothing, jewelry, and accessories meticulously rendered.
    Authentic ethnic features and skin tones for the region and time.
    Intelligent, knowing eyes that convey their historical significance.
    Background subtly suggests their achievements or era.
    Painted portrait quality with photorealistic detail.
    Museum-worthy historical portrait that captures their legacy.
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Build a prompt for course thumbnail images
 * Creates engaging educational visuals
 */
export function buildCourseThumbnailPrompt(title: string, description?: string): string {
  const desc = description ? ` exploring ${description}` : '';

  return `
    Educational course cover art for "${title}"${desc}.
    Cinematic wide shot capturing the essence of the historical subject.
    Visually striking composition that draws the viewer in.
    Rich, warm color palette with dramatic lighting.
    Multiple visual elements suggesting the breadth of content.
    Professional quality suitable for premium educational platform.
    Evokes curiosity and the excitement of historical discovery.
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Build a prompt for game/arcade images
 * Creates engaging historical game visuals
 */
export function buildGameImagePrompt(event: string, location: string, era: string, year?: string): string {
  const yearContext = year ? ` circa ${year}` : '';

  return `
    Historical scene: ${event} in ${location}${yearContext}, during ${era}.
    Authentic period recreation with cinematic quality.
    Wide establishing shot showing the full context of the scene.
    Historically accurate architecture, vehicles, clothing, and technology.
    Atmospheric conditions appropriate to the event (weather, time of day).
    Human activity and period-appropriate crowds add life to the scene.
    Documentary photograph feel with cinematic color grading.
    Educational yet visually engaging, like a frame from a historical film.
  `.trim().replace(/\s+/g, ' ');
}

/**
 * Convert base64 image data to a data URL
 */
export function base64ToDataUrl(base64: string, mimeType: string = 'image/png'): string {
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Download and save a base64 image (for admin use)
 */
export function downloadBase64Image(base64: string, filename: string, mimeType: string = 'image/png'): void {
  const link = document.createElement('a');
  link.href = base64ToDataUrl(base64, mimeType);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Check if the Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return !!getGeminiApiKey();
}

/**
 * Thumbnail URL resolution utilities
 * Handles Firebase Storage URLs, IndexedDB references, and fallbacks
 */

import { useState, useEffect } from 'react';
import { getCourseThumbnail } from '@/lib/adminStorage';

// Placeholder SVG as data URL for missing images
export const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120">
  <rect fill="#1a1a2e" width="200" height="120"/>
  <rect fill="#16213e" x="10" y="10" width="180" height="100" rx="8"/>
  <circle fill="#0f3460" cx="60" cy="50" r="20"/>
  <polygon fill="#e94560" points="150,30 180,70 120,70"/>
  <rect fill="#533483" x="30" y="80" width="140" height="8" rx="4"/>
</svg>
`);

/**
 * Hook to resolve thumbnail URLs
 * Handles IndexedDB references, Firebase Storage URLs, and local paths
 */
export function useThumbnailUrl(thumbnailUrl: string | undefined, courseId: string): string {
  const [resolvedUrl, setResolvedUrl] = useState<string>(PLACEHOLDER_IMAGE);

  useEffect(() => {
    if (!thumbnailUrl) {
      setResolvedUrl(PLACEHOLDER_IMAGE);
      return;
    }

    if (thumbnailUrl.startsWith('idb:course:')) {
      // Load from IndexedDB
      const storedThumb = getCourseThumbnail(courseId);
      if (storedThumb) {
        setResolvedUrl(storedThumb);
      } else {
        setResolvedUrl(PLACEHOLDER_IMAGE);
      }
    } else if (thumbnailUrl.startsWith('http://') || thumbnailUrl.startsWith('https://') || thumbnailUrl.startsWith('data:')) {
      // Valid URL or data URL (Firebase Storage, external URLs, base64)
      setResolvedUrl(thumbnailUrl);
    } else {
      // Local path that might not exist - use placeholder
      setResolvedUrl(PLACEHOLDER_IMAGE);
    }
  }, [thumbnailUrl, courseId]);

  return resolvedUrl;
}

/**
 * Check if a URL is a valid displayable image URL
 */
export function isValidImageUrl(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:')
  );
}

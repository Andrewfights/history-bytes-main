/**
 * Migration Utility
 * Migrates existing localStorage/IndexedDB data to Firebase (Firestore + Storage)
 * Run this once to move all local admin data to the cloud
 */

import { isFirebaseConfigured } from './firebase';
import {
  saveEraTileOverride,
  saveGameThumbnailUrl,
  savePearlHarborMediaData,
  saveGhostArmyMediaData,
} from './database';
import { getEraTileOverrides, ERA_TILES_STORAGE_KEY } from '@/data/historicalEras';
import { loadGameThumbnails, GAME_THUMBNAILS_KEY } from '@/data/arcadeGames';
import {
  loadPearlHarborMediaAsync,
  loadGhostArmyMediaAsync,
} from './adminStorage';
import { uploadFile } from './supabase';

export interface MigrationResult {
  success: boolean;
  migratedItems: {
    eraTileOverrides: number;
    gameThumbnails: number;
    pearlHarborMedia: number;
    ghostArmyMedia: number;
  };
  errors: string[];
  skippedDataUrls: number;
}

/**
 * Check if a URL is a data: URL (local blob)
 */
function isDataUrl(url?: string): boolean {
  return !!url && url.startsWith('data:');
}

/**
 * Upload a data URL to Firebase Storage if it's a data URL
 * Returns the cloud URL or the original URL if already a cloud URL
 */
async function uploadIfDataUrl(dataUrl: string, filename: string): Promise<string | null> {
  if (!isDataUrl(dataUrl)) {
    return dataUrl; // Already a cloud URL
  }

  try {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });

    const result = await uploadFile(file);
    return result?.url || null;
  } catch (error) {
    console.error('[migration] Failed to upload file:', filename, error);
    return null;
  }
}

/**
 * Migrate era tile overrides from localStorage to Firestore
 */
async function migrateEraTileOverrides(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const overrides = getEraTileOverrides();
    for (const [eraId, override] of Object.entries(overrides)) {
      if (override.imageUrl) {
        // Era tiles should already be cloud URLs (Wikimedia, etc)
        // If they're data URLs, skip them (too large)
        if (isDataUrl(override.imageUrl)) {
          errors.push(`Era ${eraId}: Skipped data URL (too large for cloud storage without upload)`);
          continue;
        }

        const success = await saveEraTileOverride({
          id: eraId,
          imageUrl: override.imageUrl,
          isActive: true,
        });

        if (success) {
          count++;
          console.log('[migration] Migrated era tile:', eraId);
        } else {
          errors.push(`Era ${eraId}: Failed to save to Firestore`);
        }
      }
    }
  } catch (error) {
    errors.push(`Era tiles: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { count, errors };
}

/**
 * Migrate game thumbnails from localStorage to Firestore
 */
async function migrateGameThumbnails(): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let count = 0;

  try {
    const thumbnails = loadGameThumbnails();
    for (const [gameType, imageUrl] of Object.entries(thumbnails)) {
      if (imageUrl) {
        // Skip data URLs
        if (isDataUrl(imageUrl)) {
          errors.push(`Game ${gameType}: Skipped data URL`);
          continue;
        }

        const success = await saveGameThumbnailUrl(gameType, imageUrl);
        if (success) {
          count++;
          console.log('[migration] Migrated game thumbnail:', gameType);
        } else {
          errors.push(`Game ${gameType}: Failed to save to Firestore`);
        }
      }
    }
  } catch (error) {
    errors.push(`Game thumbnails: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { count, errors };
}

/**
 * Migrate Pearl Harbor media from IndexedDB to Firebase
 */
async function migratePearlHarborMedia(): Promise<{ count: number; errors: string[]; skippedDataUrls: number }> {
  const errors: string[] = [];
  let count = 0;
  let skippedDataUrls = 0;

  try {
    const config = await loadPearlHarborMediaAsync();
    for (const [nodeId, media] of Object.entries(config.nodes)) {
      const cloudMedia: Partial<typeof media> = {};
      let hasCloudUrls = false;

      // Only migrate cloud URLs, skip data URLs (too large)
      if (media.videoUrl && !isDataUrl(media.videoUrl)) {
        cloudMedia.videoUrl = media.videoUrl;
        hasCloudUrls = true;
      } else if (media.videoUrl && isDataUrl(media.videoUrl)) {
        skippedDataUrls++;
      }

      if (media.videoUrl2 && !isDataUrl(media.videoUrl2)) {
        cloudMedia.videoUrl2 = media.videoUrl2;
        hasCloudUrls = true;
      } else if (media.videoUrl2 && isDataUrl(media.videoUrl2)) {
        skippedDataUrls++;
      }

      if (media.backgroundImage && !isDataUrl(media.backgroundImage)) {
        cloudMedia.backgroundImage = media.backgroundImage;
        hasCloudUrls = true;
      } else if (media.backgroundImage && isDataUrl(media.backgroundImage)) {
        skippedDataUrls++;
      }

      if (media.videoThumbnail && !isDataUrl(media.videoThumbnail)) {
        cloudMedia.videoThumbnail = media.videoThumbnail;
        hasCloudUrls = true;
      } else if (media.videoThumbnail && isDataUrl(media.videoThumbnail)) {
        skippedDataUrls++;
      }

      if (hasCloudUrls) {
        const success = await savePearlHarborMediaData(nodeId, cloudMedia);
        if (success) {
          count++;
          console.log('[migration] Migrated Pearl Harbor node:', nodeId);
        } else {
          errors.push(`Pearl Harbor ${nodeId}: Failed to save to Firestore`);
        }
      }
    }
  } catch (error) {
    errors.push(`Pearl Harbor: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { count, errors, skippedDataUrls };
}

/**
 * Migrate Ghost Army media from IndexedDB to Firebase
 */
async function migrateGhostArmyMedia(): Promise<{ count: number; errors: string[]; skippedDataUrls: number }> {
  const errors: string[] = [];
  let count = 0;
  let skippedDataUrls = 0;

  try {
    const config = await loadGhostArmyMediaAsync();
    for (const [nodeId, media] of Object.entries(config.nodes)) {
      const cloudMedia: Partial<typeof media> = {};
      let hasCloudUrls = false;

      if (media.videoUrl && !isDataUrl(media.videoUrl)) {
        cloudMedia.videoUrl = media.videoUrl;
        hasCloudUrls = true;
      } else if (media.videoUrl && isDataUrl(media.videoUrl)) {
        skippedDataUrls++;
      }

      if (media.videoUrl2 && !isDataUrl(media.videoUrl2)) {
        cloudMedia.videoUrl2 = media.videoUrl2;
        hasCloudUrls = true;
      } else if (media.videoUrl2 && isDataUrl(media.videoUrl2)) {
        skippedDataUrls++;
      }

      if (media.backgroundImage && !isDataUrl(media.backgroundImage)) {
        cloudMedia.backgroundImage = media.backgroundImage;
        hasCloudUrls = true;
      } else if (media.backgroundImage && isDataUrl(media.backgroundImage)) {
        skippedDataUrls++;
      }

      if (media.videoThumbnail && !isDataUrl(media.videoThumbnail)) {
        cloudMedia.videoThumbnail = media.videoThumbnail;
        hasCloudUrls = true;
      } else if (media.videoThumbnail && isDataUrl(media.videoThumbnail)) {
        skippedDataUrls++;
      }

      if (hasCloudUrls) {
        const success = await saveGhostArmyMediaData(nodeId, cloudMedia);
        if (success) {
          count++;
          console.log('[migration] Migrated Ghost Army node:', nodeId);
        } else {
          errors.push(`Ghost Army ${nodeId}: Failed to save to Firestore`);
        }
      }
    }
  } catch (error) {
    errors.push(`Ghost Army: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { count, errors, skippedDataUrls };
}

/**
 * Run the full migration of local data to Firebase
 */
export async function migrateAllToFirebase(): Promise<MigrationResult> {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      migratedItems: {
        eraTileOverrides: 0,
        gameThumbnails: 0,
        pearlHarborMedia: 0,
        ghostArmyMedia: 0,
      },
      errors: ['Firebase is not configured. Please set up Firebase environment variables.'],
      skippedDataUrls: 0,
    };
  }

  console.log('[migration] Starting migration to Firebase...');

  const allErrors: string[] = [];
  let totalSkippedDataUrls = 0;

  // Migrate era tiles
  const eraTileResult = await migrateEraTileOverrides();
  allErrors.push(...eraTileResult.errors);

  // Migrate game thumbnails
  const gameThumbnailResult = await migrateGameThumbnails();
  allErrors.push(...gameThumbnailResult.errors);

  // Migrate Pearl Harbor media
  const phResult = await migratePearlHarborMedia();
  allErrors.push(...phResult.errors);
  totalSkippedDataUrls += phResult.skippedDataUrls;

  // Migrate Ghost Army media
  const gaResult = await migrateGhostArmyMedia();
  allErrors.push(...gaResult.errors);
  totalSkippedDataUrls += gaResult.skippedDataUrls;

  const result: MigrationResult = {
    success: allErrors.length === 0,
    migratedItems: {
      eraTileOverrides: eraTileResult.count,
      gameThumbnails: gameThumbnailResult.count,
      pearlHarborMedia: phResult.count,
      ghostArmyMedia: gaResult.count,
    },
    errors: allErrors,
    skippedDataUrls: totalSkippedDataUrls,
  };

  console.log('[migration] Migration complete:', result);

  return result;
}

/**
 * Check if there is local data that can be migrated
 */
export function checkLocalDataForMigration(): {
  hasEraTileOverrides: boolean;
  hasGameThumbnails: boolean;
  hasPearlHarborMedia: boolean;
  hasGhostArmyMedia: boolean;
} {
  const eraTileOverrides = getEraTileOverrides();
  const gameThumbnails = loadGameThumbnails();

  return {
    hasEraTileOverrides: Object.keys(eraTileOverrides).length > 0,
    hasGameThumbnails: Object.keys(gameThumbnails).length > 0,
    hasPearlHarborMedia: false, // Would need async check
    hasGhostArmyMedia: false,   // Would need async check
  };
}

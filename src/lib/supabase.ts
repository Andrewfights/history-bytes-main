/**
 * Firebase Storage utilities
 * Re-exports from firebaseStorage for backward compatibility
 *
 * Note: This file previously contained Supabase utilities.
 * The project has migrated to Firebase.
 */

import { isFirebaseConfigured } from './firebase';

// Re-export all Firebase Storage utilities
export {
  uploadFile,
  listFiles,
  deleteFile,
  getFileUrl,
  formatFileSize,
  getMediaType,
  getMediaFolder,
  isFirebaseConfigured,
} from './firebaseStorage';

export type {
  MediaFile,
  UploadProgress,
} from './firebaseStorage';

// Legacy alias for backward compatibility
export const isSupabaseConfigured = isFirebaseConfigured;

// Legacy bucket name constant (no longer used, kept for compatibility)
export const MEDIA_BUCKET = 'history-bytes-media';

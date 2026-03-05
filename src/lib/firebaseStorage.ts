/**
 * Firebase Storage Utilities
 * Handles media file uploads, downloads, and management
 */

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  UploadTask,
} from 'firebase/storage';
import { storage, isFirebaseConfigured } from './firebase';

// ============ Types ============

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  createdAt: string;
  folder: string;
}

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
  state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

// ============ Helpers ============

export function getMediaType(mimeType: string): 'image' | 'video' | 'audio' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  return 'image'; // Default to image
}

export function getMediaFolder(type: 'image' | 'video' | 'audio'): string {
  switch (type) {
    case 'image': return 'images';
    case 'video': return 'videos';
    case 'audio': return 'audio';
  }
}

function generateFilePath(folder: string, fileName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  // Sanitize filename: remove special chars, limit length
  const safeName = fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 50);
  return `${folder}/${timestamp}-${random}-${safeName}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ============ localStorage Fallback ============

const LOCAL_MEDIA_KEY = 'hb_local_media';

interface LocalMediaItem {
  id: string;
  name: string;
  dataUrl: string;
  type: 'image' | 'video' | 'audio';
  size: number;
  createdAt: string;
  folder: string;
}

function getLocalMedia(): LocalMediaItem[] {
  try {
    const stored = localStorage.getItem(LOCAL_MEDIA_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveLocalMedia(items: LocalMediaItem[]): void {
  try {
    // Limit to 20 items to prevent localStorage overflow
    const limited = items.slice(0, 20);
    localStorage.setItem(LOCAL_MEDIA_KEY, JSON.stringify(limited));
  } catch (err) {
    console.error('[Storage] localStorage save failed:', err);
  }
}

async function uploadToLocalStorage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<MediaFile | null> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = (event.loaded / event.total) * 100;
        onProgress?.(progress);
      }
    };

    reader.onload = () => {
      const dataUrl = reader.result as string;
      const mediaType = getMediaType(file.type);
      const folder = getMediaFolder(mediaType);
      const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const localItem: LocalMediaItem = {
        id,
        name: file.name,
        dataUrl,
        type: mediaType,
        size: file.size,
        createdAt: new Date().toISOString(),
        folder,
      };

      // Save to localStorage
      const existing = getLocalMedia();
      saveLocalMedia([localItem, ...existing]);

      const mediaFile: MediaFile = {
        id,
        name: file.name,
        url: dataUrl,
        type: mediaType,
        size: file.size,
        createdAt: localItem.createdAt,
        folder,
      };

      onProgress?.(100);
      resolve(mediaFile);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

function getLocalMediaFiles(folder?: string): MediaFile[] {
  const items = getLocalMedia();
  const filtered = folder
    ? items.filter(item => item.folder === folder)
    : items;

  return filtered.map(item => ({
    id: item.id,
    name: item.name,
    url: item.dataUrl,
    type: item.type,
    size: item.size,
    createdAt: item.createdAt,
    folder: item.folder,
  }));
}

function deleteLocalMediaFile(fileId: string): boolean {
  const items = getLocalMedia();
  const filtered = items.filter(item => item.id !== fileId);
  if (filtered.length !== items.length) {
    saveLocalMedia(filtered);
    return true;
  }
  return false;
}

// ============ Firebase Storage Operations ============

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<MediaFile | null> {
  // Fall back to localStorage if Firebase not configured
  if (!isFirebaseConfigured()) {
    console.log('[Storage] Firebase not configured, using localStorage');
    return uploadToLocalStorage(file, onProgress);
  }

  const mediaType = getMediaType(file.type);
  const folder = getMediaFolder(mediaType);
  const filePath = generateFilePath(folder, file.name);

  try {
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('[Storage] Upload error:', error);
          // Fall back to localStorage on error
          uploadToLocalStorage(file, onProgress)
            .then(resolve)
            .catch(reject);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            const metadata = await getMetadata(uploadTask.snapshot.ref);

            const mediaFile: MediaFile = {
              id: filePath,
              name: file.name,
              url: downloadURL,
              type: mediaType,
              size: metadata.size || file.size,
              createdAt: metadata.timeCreated || new Date().toISOString(),
              folder,
            };

            console.log('[Storage] Upload successful:', filePath);
            resolve(mediaFile);
          } catch (err) {
            console.error('[Storage] Error getting download URL:', err);
            reject(err);
          }
        }
      );
    });
  } catch (err) {
    console.error('[Storage] Upload failed, falling back to localStorage:', err);
    return uploadToLocalStorage(file, onProgress);
  }
}

/**
 * List all files in storage (optionally filtered by folder)
 */
export async function listFiles(folder?: string): Promise<MediaFile[]> {
  const allFiles: MediaFile[] = [];

  // Always include local files
  const localFiles = getLocalMediaFiles(folder);
  allFiles.push(...localFiles);

  // If Firebase is not configured, return only local files
  if (!isFirebaseConfigured()) {
    return allFiles;
  }

  // List Firebase Storage files
  const foldersToList = folder ? [folder] : ['images', 'videos', 'audio'];

  for (const f of foldersToList) {
    try {
      const folderRef = ref(storage, f);
      const result = await listAll(folderRef);

      for (const item of result.items) {
        try {
          const url = await getDownloadURL(item);
          const metadata = await getMetadata(item);
          const mediaType = f === 'images' ? 'image' : f === 'videos' ? 'video' : 'audio';

          allFiles.push({
            id: item.fullPath,
            name: item.name,
            url,
            type: mediaType as 'image' | 'video' | 'audio',
            size: metadata.size || 0,
            createdAt: metadata.timeCreated || new Date().toISOString(),
            folder: f,
          });
        } catch (err) {
          console.error(`[Storage] Error getting file ${item.name}:`, err);
        }
      }
    } catch (err) {
      console.error(`[Storage] Error listing ${f}:`, err);
    }
  }

  // Sort by creation date (newest first)
  allFiles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return allFiles;
}

/**
 * Delete a file from storage
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  // Handle local files
  if (fileId.startsWith('local-')) {
    return deleteLocalMediaFile(fileId);
  }

  // Handle Firebase files
  if (!isFirebaseConfigured()) {
    return false;
  }

  try {
    const fileRef = ref(storage, fileId);
    await deleteObject(fileRef);
    console.log('[Storage] Deleted file:', fileId);
    return true;
  } catch (err) {
    console.error('[Storage] Failed to delete file:', err);
    return false;
  }
}

/**
 * Get download URL for a file path
 */
export async function getFileUrl(filePath: string): Promise<string | null> {
  // Handle local files
  if (filePath.startsWith('local-')) {
    const items = getLocalMedia();
    const item = items.find(i => i.id === filePath);
    return item?.dataUrl || null;
  }

  // Handle Firebase files
  if (!isFirebaseConfigured()) {
    return null;
  }

  try {
    const fileRef = ref(storage, filePath);
    return await getDownloadURL(fileRef);
  } catch (err) {
    console.error('[Storage] Failed to get URL:', err);
    return null;
  }
}

// Re-export isFirebaseConfigured for compatibility
export { isFirebaseConfigured } from './firebase';

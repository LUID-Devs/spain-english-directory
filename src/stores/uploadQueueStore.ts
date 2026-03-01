import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type UploadStatus = 'pending' | 'uploading' | 'completed' | 'failed' | 'retrying' | 'cancelled';
export type UploadType = 'attachment' | 'comment-image' | 'description-image' | 'avatar';

export interface UploadItem {
  id: string;
  file: File;
  type: UploadType;
  status: UploadStatus;
  progress: number;
  error?: string;
  retryCount: number;
  maxRetries: number;
  metadata?: Record<string, unknown>;
  result?: unknown;
  xhr?: XMLHttpRequest;
  createdAt: number;
  updatedAt: number;
}

interface UploadQueueState {
  uploads: UploadItem[];
  maxConcurrent: number;
  
  // Actions
  addUpload: (upload: Omit<UploadItem, 'id' | 'createdAt' | 'updatedAt' | 'retryCount'>) => string;
  removeUpload: (id: string) => void;
  updateUpload: (id: string, updates: Partial<UploadItem>) => void;
  setUploadProgress: (id: string, progress: number) => void;
  setUploadStatus: (id: string, status: UploadStatus, error?: string) => void;
  retryUpload: (id: string) => void;
  cancelUpload: (id: string) => void;
  clearCompleted: () => void;
  clearAll: () => void;
  getPendingUploads: () => UploadItem[];
  getActiveUploads: () => UploadItem[];
  getUploadById: (id: string) => UploadItem | undefined;
}

// Generate unique upload ID
const generateUploadId = (): string => {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useUploadQueueStore = create<UploadQueueState>()(
  immer(
    subscribeWithSelector((set, get) => ({
      // Initial state
      uploads: [],
      maxConcurrent: 3,

      // Add a new upload to the queue
      addUpload: (upload) => {
        const id = generateUploadId();
        const now = Date.now();
        
        set((state) => {
          state.uploads.push({
            ...upload,
            id,
            retryCount: 0,
            createdAt: now,
            updatedAt: now,
          });
        });
        
        return id;
      },

      // Remove an upload from the queue
      removeUpload: (id) => {
        set((state) => {
          const upload = state.uploads.find(u => u.id === id);
          if (upload?.xhr) {
            try {
              upload.xhr.abort();
            } catch {
              // Ignore abort errors
            }
          }
          state.uploads = state.uploads.filter(u => u.id !== id);
        });
      },

      // Update upload properties
      updateUpload: (id, updates) => {
        set((state) => {
          const upload = state.uploads.find(u => u.id === id);
          if (upload) {
            Object.assign(upload, updates, { updatedAt: Date.now() });
          }
        });
      },

      // Set upload progress
      setUploadProgress: (id, progress) => {
        set((state) => {
          const upload = state.uploads.find(u => u.id === id);
          if (upload) {
            upload.progress = Math.min(100, Math.max(0, progress));
            upload.updatedAt = Date.now();
          }
        });
      },

      // Set upload status with optional error
      setUploadStatus: (id, status, error) => {
        set((state) => {
          const upload = state.uploads.find(u => u.id === id);
          if (upload) {
            upload.status = status;
            if (error !== undefined) {
              upload.error = error;
            }
            upload.updatedAt = Date.now();
          }
        });
      },

      // Retry a failed upload
      retryUpload: (id) => {
        set((state) => {
          const upload = state.uploads.find(u => u.id === id);
          if (upload && upload.retryCount < upload.maxRetries) {
            upload.status = 'retrying';
            upload.retryCount += 1;
            upload.progress = 0;
            upload.error = undefined;
            upload.updatedAt = Date.now();
          }
        });
      },

      // Cancel an active upload
      cancelUpload: (id) => {
        set((state) => {
          const upload = state.uploads.find(u => u.id === id);
          if (upload) {
            if (upload.xhr) {
              try {
                upload.xhr.abort();
              } catch {
                // Ignore abort errors
              }
            }
            upload.status = 'cancelled';
            upload.updatedAt = Date.now();
          }
        });
      },

      // Clear all completed uploads
      clearCompleted: () => {
        set((state) => {
          state.uploads = state.uploads.filter(u => u.status !== 'completed');
        });
      },

      // Clear all uploads
      clearAll: () => {
        set((state) => {
          // Cancel any active uploads
          state.uploads.forEach(upload => {
            if (upload.xhr) {
              try {
                upload.xhr.abort();
              } catch {
                // Ignore abort errors
              }
            }
          });
          state.uploads = [];
        });
      },

      // Get pending uploads
      getPendingUploads: () => {
        return get().uploads.filter(u => u.status === 'pending');
      },

      // Get active (uploading) uploads
      getActiveUploads: () => {
        return get().uploads.filter(u => u.status === 'uploading' || u.status === 'retrying');
      },

      // Get upload by ID
      getUploadById: (id) => {
        return get().uploads.find(u => u.id === id);
      },
    }))
  )
);

// Selector hooks for common use cases
export const useUploadCount = () => 
  useUploadQueueStore((state) => state.uploads.length);

export const useActiveUploadCount = () => 
  useUploadQueueStore((state) => 
    state.uploads.filter(u => u.status === 'uploading' || u.status === 'pending' || u.status === 'retrying').length
  );

export const useCompletedUploadCount = () => 
  useUploadQueueStore((state) => 
    state.uploads.filter(u => u.status === 'completed').length
  );

export const useFailedUploadCount = () => 
  useUploadQueueStore((state) => 
    state.uploads.filter(u => u.status === 'failed').length
  );

export const useHasActiveUploads = () => 
  useUploadQueueStore((state) => 
    state.uploads.some(u => u.status === 'uploading' || u.status === 'pending')
  );

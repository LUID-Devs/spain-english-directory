import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '@/app/authProvider';
import { apiService } from '@/services/apiService';
import { 
  useUploadQueueStore, 
  UploadType, 
  UploadItem,
  UploadStatus 
} from '@/stores/uploadQueueStore';
import { toast } from 'sonner';

// Configuration for different upload types
interface UploadConfig {
  endpoint: string | ((metadata: Record<string, unknown>) => string);
  buildFormData: (file: File, metadata: Record<string, unknown>) => FormData;
  processResponse?: (response: unknown) => unknown;
}

const UPLOAD_CONFIGS: Record<UploadType, UploadConfig> = {
  'attachment': {
    endpoint: (metadata) => `/tasks/${metadata.taskId}/attachments`,
    buildFormData: (file, metadata) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadedById', String(metadata.uploadedById));
      return formData;
    },
  },
  'comment-image': {
    endpoint: '/uploads/comments/image',
    buildFormData: (file) => {
      const formData = new FormData();
      formData.append('image', file);
      return formData;
    },
    processResponse: (response) => (response as { imageUrl: string }).imageUrl,
  },
  'description-image': {
    endpoint: '/uploads/description/image',
    buildFormData: (file) => {
      const formData = new FormData();
      formData.append('image', file);
      return formData;
    },
    processResponse: (response) => (response as { imageUrl: string }).imageUrl,
  },
  'avatar': {
    endpoint: '/uploads/avatar',
    buildFormData: (file, metadata) => {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', String(metadata.userId));
      return formData;
    },
  },
};

interface UploadCallbacks {
  onSuccess?: (result: unknown, upload: UploadItem) => void;
  onError?: (error: Error, upload: UploadItem) => void;
  onProgress?: (progress: number, upload: UploadItem) => void;
}

interface QueueUploadOptions extends UploadCallbacks {
  metadata?: Record<string, unknown>;
  maxRetries?: number;
}

export function useBackgroundUpload() {
  const auth = useAuth();
  const addUpload = useUploadQueueStore((state) => state.addUpload);
  const removeUpload = useUploadQueueStore((state) => state.removeUpload);
  const updateUpload = useUploadQueueStore((state) => state.updateUpload);
  const setUploadProgress = useUploadQueueStore((state) => state.setUploadProgress);
  const setUploadStatus = useUploadQueueStore((state) => state.setUploadStatus);
  const uploads = useUploadQueueStore((state) => state.uploads);
  const maxConcurrent = useUploadQueueStore((state) => state.maxConcurrent);
  
  // Track callbacks for each upload
  const callbacksRef = useRef<Map<string, UploadCallbacks>>(new Map());
  
  // Track processed uploads to avoid duplicate processing
  const processedRef = useRef<Set<string>>(new Set());

  // Execute a single upload
  const executeUpload = useCallback(async (upload: UploadItem) => {
    const config = UPLOAD_CONFIGS[upload.type];
    const callbacks = callbacksRef.current.get(upload.id);
    
    try {
      // Update status to uploading
      setUploadStatus(upload.id, 'uploading');
      
      // Build form data
      const formData = config.buildFormData(upload.file, upload.metadata || {});
      
      // Resolve endpoint
      const endpoint = typeof config.endpoint === 'function' 
        ? config.endpoint(upload.metadata || {})
        : config.endpoint;
      
      // Get auth headers
      const authHeaders = await apiService.getAuthHeaders();
      
      // Build full URL
      const resolvedEndpoint = apiService.resolveEndpoint(endpoint);
      const baseUrl = apiService.getBaseUrl?.() || '';
      const url = /^https?:\/\//i.test(resolvedEndpoint)
        ? resolvedEndpoint
        : `${baseUrl}${resolvedEndpoint}`;
      
      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Store XHR reference for cancellation
      updateUpload(upload.id, { xhr });
      
      // Set up progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(upload.id, progress);
          callbacks?.onProgress?.(progress, upload);
        }
      });
      
      // Wait for upload to complete
      const response = await new Promise<unknown>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              resolve(data);
            } catch {
              resolve(xhr.responseText);
            }
          } else if (xhr.status === 401) {
            reject(new Error('Authentication required'));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText || 'Unknown error'}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed due to network error'));
        });
        
        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });
        
        xhr.open('POST', url);
        
        // Set auth headers
        Object.entries(authHeaders).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
        xhr.withCredentials = true;
        
        xhr.send(formData);
      });
      
      // Process response if needed
      const result = config.processResponse ? config.processResponse(response) : response;
      
      // Mark as completed
      setUploadStatus(upload.id, 'completed');
      updateUpload(upload.id, { result, xhr: undefined });
      
      // Call success callback
      callbacks?.onSuccess?.(result, upload);
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      
      // Check if upload was cancelled
      if (errorMessage.includes('cancelled')) {
        setUploadStatus(upload.id, 'cancelled', errorMessage);
      } else if (upload.retryCount < upload.maxRetries) {
        // Retry the upload
        setUploadStatus(upload.id, 'retrying', errorMessage);
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * (upload.retryCount + 1)));
        
        // Increment retry count and try again
        updateUpload(upload.id, { 
          retryCount: upload.retryCount + 1,
          progress: 0 
        });
        
        return executeUpload({ ...upload, retryCount: upload.retryCount + 1 });
      } else {
        // Max retries reached
        setUploadStatus(upload.id, 'failed', errorMessage);
        updateUpload(upload.id, { xhr: undefined });
        
        // Call error callback
        callbacks?.onError?.(error instanceof Error ? error : new Error(errorMessage), upload);
      }
      
      throw error;
    }
  }, [setUploadStatus, setUploadProgress, updateUpload]);

  // Process upload queue
  useEffect(() => {
    const processQueue = async () => {
      const pendingUploads = uploads.filter(u => 
        u.status === 'pending' || u.status === 'retrying'
      );
      
      const activeUploads = uploads.filter(u => 
        u.status === 'uploading'
      );
      
      // Only start new uploads if we have capacity
      if (activeUploads.length >= maxConcurrent || pendingUploads.length === 0) {
        return;
      }
      
      // Get next upload to process
      const nextUpload = pendingUploads[0];
      
      // Mark as processed to avoid duplicate processing
      if (processedRef.current.has(nextUpload.id)) {
        return;
      }
      processedRef.current.add(nextUpload.id);
      
      try {
        await executeUpload(nextUpload);
      } catch {
        // Error is handled in executeUpload
      } finally {
        // Remove from processed set after a delay
        setTimeout(() => {
          processedRef.current.delete(nextUpload.id);
        }, 100);
      }
    };
    
    processQueue();
  }, [uploads, maxConcurrent, executeUpload]);

  // Queue a single file upload
  const queueUpload = useCallback((
    file: File,
    type: UploadType,
    options: QueueUploadOptions = {}
  ): string => {
    const { metadata = {}, maxRetries = 3, ...callbacks } = options;
    
    const id = addUpload({
      file,
      type,
      status: 'pending',
      progress: 0,
      maxRetries,
      metadata,
    });
    
    // Store callbacks
    callbacksRef.current.set(id, callbacks);
    
    return id;
  }, [addUpload]);

  // Queue multiple file uploads
  const queueMultipleUploads = useCallback((
    files: File[],
    type: UploadType,
    options: QueueUploadOptions = {}
  ): string[] => {
    return files.map(file => queueUpload(file, type, options));
  }, [queueUpload]);

  // Cancel a specific upload
  const cancelUpload = useCallback((id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (upload?.xhr) {
      try {
        upload.xhr.abort();
      } catch {
        // Ignore abort errors
      }
    }
    removeUpload(id);
    callbacksRef.current.delete(id);
  }, [uploads, removeUpload]);

  // Retry a failed upload
  const retryUpload = useCallback((id: string) => {
    const upload = uploads.find(u => u.id === id);
    if (!upload || upload.status !== 'failed') return;
    
    setUploadStatus(id, 'pending');
    updateUpload(id, { 
      retryCount: 0, 
      progress: 0, 
      error: undefined 
    });
  }, [uploads, setUploadStatus, updateUpload]);

  // Get upload status
  const getUploadStatus = useCallback((id: string): UploadStatus | null => {
    const upload = uploads.find(u => u.id === id);
    return upload?.status || null;
  }, [uploads]);

  // Check if uploads are in progress
  const isUploading = uploads.some(u => 
    u.status === 'uploading' || u.status === 'pending' || u.status === 'retrying'
  );

  return {
    queueUpload,
    queueMultipleUploads,
    cancelUpload,
    retryUpload,
    getUploadStatus,
    isUploading,
  };
}

// Hook for tracking specific upload(s)
export function useUploadTracker(uploadId: string | string[]) {
  const uploads = useUploadQueueStore((state) => state.uploads);
  const ids = Array.isArray(uploadId) ? uploadId : [uploadId];
  
  const trackedUploads = uploads.filter(u => ids.includes(u.id));
  
  const isComplete = trackedUploads.length > 0 && trackedUploads.every(u => 
    u.status === 'completed' || u.status === 'failed' || u.status === 'cancelled'
  );
  
  const isSuccessful = trackedUploads.length > 0 && trackedUploads.every(u => 
    u.status === 'completed'
  );
  
  const hasFailed = trackedUploads.some(u => 
    u.status === 'failed'
  );
  
  const progress = trackedUploads.length > 0
    ? Math.round(trackedUploads.reduce((sum, u) => sum + u.progress, 0) / trackedUploads.length)
    : 0;
  
  return {
    uploads: trackedUploads,
    isComplete,
    isSuccessful,
    hasFailed,
    progress,
  };
}

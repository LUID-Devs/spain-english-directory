import { create } from 'zustand';

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

interface RequestManagerState {
  pendingRequests: Map<string, PendingRequest>;
  
  // Actions
  getOrCreateRequest: <T>(key: string, requestFn: () => Promise<T>) => Promise<T>;
  clearRequest: (key: string) => void;
  clearExpiredRequests: () => void;
}

// Cache for 5 seconds to prevent duplicate requests
const REQUEST_CACHE_TIME = 5000;

export const useRequestManager = create<RequestManagerState>((set, get) => ({
  pendingRequests: new Map(),
  
  getOrCreateRequest: async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
    const state = get();
    const existing = state.pendingRequests.get(key);
    
    // Return existing request if it's still fresh
    if (existing && Date.now() - existing.timestamp < REQUEST_CACHE_TIME) {
      console.log('Returning cached request for:', key);
      return existing.promise;
    }
    
    // Create new request
    console.log('Creating new request for:', key);
    const promise = requestFn().finally(() => {
      // Clean up completed request after a delay
      setTimeout(() => {
        set((state) => {
          const newPendingRequests = new Map(state.pendingRequests);
          newPendingRequests.delete(key);
          return { pendingRequests: newPendingRequests };
        });
      }, REQUEST_CACHE_TIME);
    });
    
    // Store the request
    set((state) => ({
      pendingRequests: new Map(state.pendingRequests).set(key, {
        promise,
        timestamp: Date.now()
      })
    }));
    
    return promise;
  },
  
  clearRequest: (key: string) => {
    set((state) => {
      const newPendingRequests = new Map(state.pendingRequests);
      newPendingRequests.delete(key);
      return { pendingRequests: newPendingRequests };
    });
  },
  
  clearExpiredRequests: () => {
    const now = Date.now();
    set((state) => {
      const newPendingRequests = new Map();
      state.pendingRequests.forEach((request, key) => {
        if (now - request.timestamp < REQUEST_CACHE_TIME) {
          newPendingRequests.set(key, request);
        }
      });
      return { pendingRequests: newPendingRequests };
    });
  },
}));
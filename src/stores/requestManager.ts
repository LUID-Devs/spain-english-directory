import { create } from 'zustand';

interface RequestManagerState {
  // Actions - no caching, just direct execution
  getOrCreateRequest: <T>(key: string, requestFn: () => Promise<T>) => Promise<T>;
  clearRequest: (key: string) => void;
  clearExpiredRequests: () => void;
}

export const useRequestManager = create<RequestManagerState>((set, get) => ({
  // No caching - always execute the request function directly
  getOrCreateRequest: async <T>(key: string, requestFn: () => Promise<T>): Promise<T> => {
    console.log('Executing request for:', key);
    return requestFn();
  },
  
  // These methods do nothing now since we removed caching
  clearRequest: (key: string) => {
    // No-op since we don't cache anymore
  },
  
  clearExpiredRequests: () => {
    // No-op since we don't cache anymore
  },
}));
import { create } from 'zustand';

interface RequestManagerState {
  getOrCreateRequest: <T>(key: string, requestFn: () => Promise<T>, ttlMs?: number) => Promise<T>;
  clearRequest: (key: string) => void;
  clearExpiredRequests: () => void;
}

const inFlightRequests = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, { value: unknown; expiresAt: number }>();
const DEFAULT_CACHE_TTL_MS = 2000;

export const useRequestManager = create<RequestManagerState>((set, get) => ({
  getOrCreateRequest: async <T>(
    key: string,
    requestFn: () => Promise<T>,
    ttlMs: number = DEFAULT_CACHE_TTL_MS
  ): Promise<T> => {
    const now = Date.now();
    const cached = responseCache.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }

    const existing = inFlightRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const requestPromise = requestFn()
      .then((result) => {
        responseCache.set(key, {
          value: result,
          expiresAt: Date.now() + ttlMs,
        });
        return result;
      })
      .finally(() => {
        inFlightRequests.delete(key);
      });

    inFlightRequests.set(key, requestPromise);
    return requestPromise;
  },

  clearRequest: (key: string) => {
    inFlightRequests.delete(key);
    responseCache.delete(key);
  },

  clearExpiredRequests: () => {
    const now = Date.now();
    for (const [key, cached] of responseCache.entries()) {
      if (cached.expiresAt <= now) {
        responseCache.delete(key);
      }
    }
  },
}));

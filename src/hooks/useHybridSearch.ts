/**
 * useHybridSearch Hook
 * TASK-781: Hybrid Semantic Search - React hook for AI + keyword search
 * 
 * Combines vector embeddings for semantic similarity with traditional keyword matching
 * for superior search results.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { apiService, Task } from '@/services/apiService';
import { SearchCache, debounce, MIN_SEMANTIC_QUERY_LENGTH } from '@/lib/hybridSearch';

export interface HybridSearchResult {
  task: Task;
  semanticScore: number;
  keywordScore: number;
  hybridScore: number;
  matches: {
    title?: { score: number; matched: boolean };
    description?: { score: number; matched: boolean };
    tags?: { score: number; matched: boolean };
  };
  matchReason: 'semantic' | 'keyword' | 'hybrid';
}

export interface UseHybridSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
  semanticThreshold?: number;
  semanticWeight?: number;
  projectId?: number;
  status?: string;
  priority?: string;
  assigneeId?: number;
  authorId?: number;
  includeArchived?: boolean;
}

export interface UseHybridSearchReturn {
  // State
  query: string;
  results: HybridSearchResult[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  
  // Metadata
  totalCount: number;
  usedSemanticSearch: boolean;
  embeddingTimeMs: number;
  searchTimeMs: number;
  fromCache: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  search: (query: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
  loadMore: () => Promise<void>;
}

// Global search cache instance
const globalSearchCache = new SearchCache();

/**
 * React hook for hybrid semantic search
 */
export function useHybridSearch(options: UseHybridSearchOptions = {}): UseHybridSearchReturn {
  const {
    debounceMs = 150,
    minQueryLength = MIN_SEMANTIC_QUERY_LENGTH,
    limit: defaultLimit = 20,
    semanticThreshold = 0.7,
    semanticWeight = 0.6,
    projectId,
    status,
    priority,
    assigneeId,
    authorId,
    includeArchived = false,
  } = options;

  // State
  const [query, setQueryState] = useState('');
  const [results, setResults] = useState<HybridSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [usedSemanticSearch, setUsedSemanticSearch] = useState(false);
  const [embeddingTimeMs, setEmbeddingTimeMs] = useState(0);
  const [searchTimeMs, setSearchTimeMs] = useState(0);
  const [fromCache, setFromCache] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(defaultLimit);

  // Refs
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSearchRef = useRef<string>('');
  const performSearchRef = useRef<(searchQuery: string, searchLimit: number) => Promise<void>>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Perform hybrid search
   */
  const performSearch = useCallback(async (searchQuery: string, searchLimit: number = defaultLimit) => {
    // Validate query
    if (!searchQuery.trim() || searchQuery.trim().length < minQueryLength) {
      setResults([]);
      setTotalCount(0);
      setError(null);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    lastSearchRef.current = searchQuery;

    try {
      // Check cache first
      const cacheKey = `${searchQuery}:${projectId}:${status}:${priority}:${assigneeId}:${authorId}:${searchLimit}`;
      const cached = globalSearchCache.get(cacheKey);
      
      if (cached) {
        setResults(cached.results as HybridSearchResult[]);
        setTotalCount(cached.totalCount);
        setUsedSemanticSearch(cached.usedSemanticSearch);
        setEmbeddingTimeMs(cached.embeddingTimeMs);
        setSearchTimeMs(cached.searchTimeMs);
        setFromCache(true);
        setIsLoading(false);
        return;
      }

      // Perform API search
      const response = await apiService.hybridSemanticSearch({
        query: searchQuery,
        projectId,
        status,
        priority,
        assigneeId,
        authorId,
        limit: searchLimit,
        semanticThreshold,
        semanticWeight,
        includeArchived,
      });

      setResults(response.results);
      setTotalCount(response.totalCount);
      setUsedSemanticSearch(response.usedSemanticSearch);
      setEmbeddingTimeMs(response.embeddingTimeMs);
      setSearchTimeMs(response.searchTimeMs);
      setFromCache(false);

      // Cache the result
      globalSearchCache.set(cacheKey, response);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, ignore error
      }
      
      console.error('Hybrid search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [
    minQueryLength,
    defaultLimit,
    projectId,
    status,
    priority,
    assigneeId,
    authorId,
    semanticThreshold,
    semanticWeight,
    includeArchived,
  ]);

  // Update the ref whenever performSearch changes
  useEffect(() => {
    performSearchRef.current = performSearch;
  }, [performSearch]);

  /**
   * Debounced search function - uses ref to avoid stale closure
   */
  const debouncedSearchRef = useRef(
    debounce((searchQuery: string, limit: number) => {
      // Use the ref to always call the latest version of performSearch
      performSearchRef.current?.(searchQuery, limit);
    }, debounceMs)
  );

  // Update debounce timing if debounceMs changes
  useEffect(() => {
    debouncedSearchRef.current = debounce((searchQuery: string, limit: number) => {
      performSearchRef.current?.(searchQuery, limit);
    }, debounceMs);
  }, [debounceMs]);

  /**
   * Set query with debounced search
   */
  const setQuery = useCallback((newQuery: string) => {
    setQueryState(newQuery);
    setCurrentLimit(defaultLimit);
    
    if (newQuery.trim().length >= minQueryLength) {
      debouncedSearchRef.current(newQuery, defaultLimit);
    } else {
      setResults([]);
      setTotalCount(0);
      setError(null);
    }
  }, [minQueryLength, defaultLimit]);

  /**
   * Immediate search (for explicit search button)
   */
  const search = useCallback(async (searchQuery: string) => {
    setQueryState(searchQuery);
    setCurrentLimit(defaultLimit);
    await performSearch(searchQuery, defaultLimit);
  }, [performSearch, defaultLimit]);

  /**
   * Refresh current search
   */
  const refresh = useCallback(async () => {
    if (query.trim().length >= minQueryLength) {
      // Invalidate cache for this query
      const cacheKey = `${query}:${projectId}:${status}:${priority}:${assigneeId}:${authorId}:${currentLimit}`;
      globalSearchCache.invalidate(new RegExp(cacheKey.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')));
      await performSearch(query, currentLimit);
    }
  }, [query, performSearch, minQueryLength, currentLimit, projectId, status, priority, assigneeId, authorId]);

  /**
   * Clear search
   */
  const clear = useCallback(() => {
    setQueryState('');
    setResults([]);
    setTotalCount(0);
    setError(null);
    setCurrentLimit(defaultLimit);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [defaultLimit]);

  /**
   * Load more results
   */
  const loadMore = useCallback(async () => {
    if (isLoading || results.length >= totalCount) return;
    
    const newLimit = currentLimit + defaultLimit;
    setCurrentLimit(newLimit);
    await performSearch(query, newLimit);
  }, [isLoading, results.length, totalCount, currentLimit, defaultLimit, query, performSearch]);

  return {
    // State
    query,
    results,
    isLoading,
    error,
    hasMore: results.length < totalCount,
    
    // Metadata
    totalCount,
    usedSemanticSearch,
    embeddingTimeMs,
    searchTimeMs,
    fromCache,
    
    // Actions
    setQuery,
    search,
    refresh,
    clear,
    loadMore,
  };
}

export default useHybridSearch;

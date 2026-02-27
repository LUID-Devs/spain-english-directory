import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useApiStore } from '@/stores/apiStore';
import { useRequestManager } from '@/stores/requestManager';
import {
  apiService,
  AdvancedTaskFilter,
  ApplyAdvancedFilterRequest,
  ApplyAdvancedFilterResponse,
  FilterMetadata,
  FieldCondition,
  ConditionGroup,
  Task,
} from '@/services/apiService';

// Type guards
export const isFieldCondition = (
  condition: FieldCondition | ConditionGroup | null | undefined
): condition is FieldCondition => {
  return condition != null && typeof condition === 'object' && 'field' in condition;
};

export const isConditionGroup = (
  condition: FieldCondition | ConditionGroup | null | undefined
): condition is ConditionGroup => {
  return condition != null && typeof condition === 'object' && 'conditions' in condition && !('field' in condition);
};

// Hook return type
export interface UseAdvancedFilterReturn {
  // Data
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  metadata: FilterMetadata | null;

  // Loading states
  isLoading: boolean;
  isLoadingMetadata: boolean;
  isValidating: boolean;

  // Errors
  error: string | null;
  validationError: string | null;

  // Actions
  applyFilter: (filter: AdvancedTaskFilter, options?: ApplyAdvancedFilterRequest['options']) => Promise<void>;
  validateFilter: (filter: AdvancedTaskFilter) => Promise<boolean>;
  clearFilters: () => void;
  refetch: () => void;
  goToPage: (page: number) => void;
  setLimit: (limit: number) => void;

  // Filter builder helpers
  createFieldCondition: (
    field: FieldCondition['field'],
    operator: FieldCondition['operator'],
    value?: FieldCondition['value']
  ) => FieldCondition;
  createConditionGroup: (
    operator: 'AND' | 'OR',
    conditions: (FieldCondition | ConditionGroup)[]
  ) => ConditionGroup;
  createAdvancedFilter: (
    operator: 'AND' | 'OR',
    conditions: (FieldCondition | ConditionGroup)[]
  ) => AdvancedTaskFilter;
}

// Default pagination
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 25;

/**
 * Hook for using the Advanced Filter System with AND/OR logic
 * 
 * @example
 * ```tsx
 * const { 
 *   tasks, 
 *   applyFilter, 
 *   isLoading,
 *   createFieldCondition,
 *   createAdvancedFilter 
 * } = useAdvancedFilter();
 * 
 * // Apply a simple filter
 * await applyFilter({
 *   operator: 'AND',
 *   conditions: [
 *     { field: 'status', operator: 'equals', value: 'In Progress' },
 *     { field: 'priority', operator: 'equals', value: 'P1' }
 *   ]
 * });
 * 
 * // Apply a complex filter with nested groups
 * const filter = createAdvancedFilter('AND', [
 *   createFieldCondition('status', 'equals', 'In Progress'),
 *   createConditionGroup('OR', [
 *     createFieldCondition('priority', 'equals', 'P0'),
 *     createFieldCondition('priority', 'equals', 'P1')
 *   ])
 * ]);
 * await applyFilter(filter);
 * ```
 */
export const useAdvancedFilter = (): UseAdvancedFilterReturn => {
  const { getOrCreateRequest } = useRequestManager();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<FilterMetadata | null>(null);

  // Current filter state
  const currentFilterRef = useRef<AdvancedTaskFilter | null>(null);
  const currentOptionsRef = useRef<ApplyAdvancedFilterRequest['options']>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    sortBy: 'updatedAt',
    sortOrder: 'desc',
  });

  // Results state (using refs to avoid re-renders during pagination)
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<UseAdvancedFilterReturn['pagination']>(null);

  // Track active organization for cache invalidation
  const [activeOrgId, setActiveOrgId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null
  );

  // Listen for organization changes
  useEffect(() => {
    const handleStorageChange = () => {
      const newOrgId = localStorage.getItem('activeOrganizationId');
      if (newOrgId !== activeOrgId) {
        setActiveOrgId(newOrgId);
        // Clear results when org changes
        setTasks([]);
        setPagination(null);
        currentFilterRef.current = null;
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeOrgId]);

  // Load filter metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      try {
        const response = await getOrCreateRequest(
          `filter-metadata:${activeOrgId ?? 'none'}`,
          () => apiService.getFilterMetadata(),
          300000 // Cache for 5 minutes
        );
        setMetadata(response.metadata);
      } catch (err) {
        console.error('Failed to load filter metadata:', err);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, [activeOrgId, getOrCreateRequest]);

  /**
   * Apply an advanced filter to get matching tasks
   */
  const applyFilter = useCallback(
    async (filter: AdvancedTaskFilter, options?: ApplyAdvancedFilterRequest['options']) => {
      setIsLoading(true);
      setError(null);

      try {
        // Merge options with defaults
        const mergedOptions = {
          ...currentOptionsRef.current,
          ...options,
        };
        currentOptionsRef.current = mergedOptions;
        currentFilterRef.current = filter;

        const requestKey = `advanced-filter:${activeOrgId ?? 'none'}:${JSON.stringify({
          filter,
          options: mergedOptions,
        })}`;

        const response = await getOrCreateRequest(
          requestKey,
          () =>
            apiService.applyAdvancedFilter({
              filter,
              options: mergedOptions,
            }),
          5000 // 5 second cache for filter results
        );

        setTasks(response.tasks);
        setPagination(response.pagination);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to apply filter';
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [activeOrgId, getOrCreateRequest]
  );

  /**
   * Validate a filter structure without executing it
   */
  const validateFilter = useCallback(
    async (filter: AdvancedTaskFilter): Promise<boolean> => {
      setIsValidating(true);
      setValidationError(null);

      try {
        const response = await apiService.validateAdvancedFilter(filter);
        if (!response.valid) {
          setValidationError(response.error || 'Invalid filter structure');
        }
        return response.valid;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Validation failed';
        setValidationError(message);
        return false;
      } finally {
        setIsValidating(false);
      }
    },
    []
  );

  /**
   * Clear all filters and reset state
   */
  const clearFilters = useCallback(() => {
    currentFilterRef.current = null;
    setTasks([]);
    setPagination(null);
    setError(null);
    setValidationError(null);
  }, []);

  /**
   * Refetch with current filter
   */
  const refetch = useCallback(() => {
    if (currentFilterRef.current) {
      applyFilter(currentFilterRef.current, currentOptionsRef.current);
    }
  }, [applyFilter]);

  /**
   * Go to a specific page
   */
  const goToPage = useCallback(
    (page: number) => {
      if (currentFilterRef.current) {
        applyFilter(currentFilterRef.current, {
          ...currentOptionsRef.current,
          page,
        });
      }
    },
    [applyFilter]
  );

  /**
   * Change the page limit
   */
  const setLimit = useCallback(
    (limit: number) => {
      if (currentFilterRef.current) {
        applyFilter(currentFilterRef.current, {
          ...currentOptionsRef.current,
          limit,
          page: 1, // Reset to first page when changing limit
        });
      }
    },
    [applyFilter]
  );

  // Helper functions for building filters

  const createFieldCondition = useCallback(
    (
      field: FieldCondition['field'],
      operator: FieldCondition['operator'],
      value?: FieldCondition['value']
    ): FieldCondition => ({
      field,
      operator,
      value,
    }),
    []
  );

  const createConditionGroup = useCallback(
    (operator: 'AND' | 'OR', conditions: (FieldCondition | ConditionGroup)[]): ConditionGroup => ({
      operator,
      conditions,
    }),
    []
  );

  const createAdvancedFilter = useCallback(
    (operator: 'AND' | 'OR', conditions: (FieldCondition | ConditionGroup)[]): AdvancedTaskFilter => ({
      operator,
      conditions,
    }),
    []
  );

  return {
    // Data
    tasks,
    pagination,
    metadata,

    // Loading states
    isLoading,
    isLoadingMetadata,
    isValidating,

    // Errors
    error,
    validationError,

    // Actions
    applyFilter,
    validateFilter,
    clearFilters,
    refetch,
    goToPage,
    setLimit,

    // Filter builder helpers
    createFieldCondition,
    createConditionGroup,
    createAdvancedFilter,
  };
};

export default useAdvancedFilter;

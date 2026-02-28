import { useState, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  applyAdvancedFilter,
  validateAdvancedFilter,
  getFilterMetadata,
  applySavedView,
  convertCriteriaToAdvancedFilter,
  buildComplexFilter,
  createSimpleFilter,
  createOrFilter,
  createAndFilter,
  type AdvancedTaskFilter,
  type FieldCondition,
  type ConditionGroup,
  type FilterOperator,
  type TaskFilterField,
  type FilterPaginationOptions,
  type FilterMetadata,
  type FilterTasksResponse,
} from "@/services/advancedFilterApi";
import type { Task } from "@/hooks/useApi";

export interface UseAdvancedFiltersOptions {
  initialFilters?: AdvancedTaskFilter;
  pageSize?: number;
  onError?: (error: Error) => void;
}

export interface UseAdvancedFiltersReturn {
  // State
  filter: AdvancedTaskFilter;
  tasks: Task[];
  isLoading: boolean;
  error: Error | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  metadata: FilterMetadata | null;
  
  // Actions
  setFilter: (filter: AdvancedTaskFilter) => void;
  addCondition: (condition: FieldCondition, groupIndex?: number) => void;
  removeCondition: (index: number, groupIndex?: number) => void;
  updateCondition: (index: number, updates: Partial<FieldCondition>, groupIndex?: number) => void;
  setOperator: (operator: "AND" | "OR") => void;
  addGroup: (group: ConditionGroup) => void;
  removeGroup: (index: number) => void;
  clearFilters: () => void;
  applyFilters: (options?: FilterPaginationOptions) => Promise<void>;
  validate: () => Promise<{ valid: boolean; error?: string }>;
  
  // Pagination
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
  
  // Metadata
  fetchMetadata: () => Promise<void>;
  
  // Saved views
  applyView: (viewId: number, options?: FilterPaginationOptions) => Promise<void>;
  
  // Builders
  buildComplexFilter: typeof buildComplexFilter;
  createSimpleFilter: typeof createSimpleFilter;
  createOrFilter: typeof createOrFilter;
  createAndFilter: typeof createAndFilter;
}

const defaultFilter: AdvancedTaskFilter = {
  operator: "AND",
  conditions: [],
};

const defaultPagination = {
  page: 1,
  limit: 25,
  totalCount: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

/**
 * React hook for managing advanced task filters with AND/OR logic
 * 
 * @example
 * ```tsx
 * const {
 *   filter,
 *   tasks,
 *   isLoading,
 *   applyFilters,
 *   addCondition,
 *   setOperator,
 * } = useAdvancedFilters({ pageSize: 50 });
 * 
 * // Add a condition
 * addCondition({ field: "status", operator: "equals", value: "In Progress" });
 * 
 * // Apply filters
 * await applyFilters();
 * ```
 */
export function useAdvancedFilters(options: UseAdvancedFiltersOptions = {}): UseAdvancedFiltersReturn {
  const { initialFilters, pageSize = 25, onError } = options;
  const { toast } = useToast();
  
  // State
  const [filter, setFilter] = useState<AdvancedTaskFilter>(initialFilters || defaultFilter);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<UseAdvancedFiltersReturn["pagination"]>(null);
  const [metadata, setMetadata] = useState<FilterMetadata | null>(null);
  const [currentOptions, setCurrentOptions] = useState<FilterPaginationOptions>({
    page: 1,
    limit: pageSize,
    sortBy: "updatedAt",
    sortOrder: "desc",
  });

  /**
   * Validate the current filter
   */
  const validate = useCallback(async (): Promise<{ valid: boolean; error?: string }> => {
    return await validateAdvancedFilter(filter);
  }, [filter]);

  /**
   * Apply the current filter and fetch matching tasks
   */
  const applyFilters = useCallback(async (options?: FilterPaginationOptions) => {
    const opts = { ...currentOptions, ...options };
    
    // Validate before applying
    const validation = await validate();
    if (!validation.valid) {
      toast({
        title: "Invalid Filter",
        description: validation.error || "Please check your filter configuration",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await applyAdvancedFilter(filter, opts);
      
      if (response.success) {
        setTasks(response.tasks as unknown as Task[]);
        setPagination(response.pagination);
        setCurrentOptions(opts);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to apply filters");
      setError(error);
      onError?.(error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [filter, currentOptions, validate, toast, onError]);

  /**
   * Add a condition to the filter
   */
  const addCondition = useCallback((condition: FieldCondition, groupIndex?: number) => {
    setFilter((prev) => {
      if (groupIndex !== undefined && groupIndex >= 0) {
        // Add to a specific group - immutable update
        const conditions = prev.conditions.map((c, i) => {
          if (i === groupIndex && "conditions" in c) {
            return { ...c, conditions: [...c.conditions, condition] };
          }
          return c;
        });
        return { ...prev, conditions };
      }
      
      // Add to root conditions
      return {
        ...prev,
        conditions: [...prev.conditions, condition],
      };
    });
  }, []);

  /**
   * Remove a condition from the filter
   */
  const removeCondition = useCallback((index: number, groupIndex?: number) => {
    setFilter((prev) => {
      if (groupIndex !== undefined && groupIndex >= 0) {
        // Remove from a specific group - immutable update
        const conditions = prev.conditions.map((c, i) => {
          if (i === groupIndex && "conditions" in c) {
            return { ...c, conditions: c.conditions.filter((_, ci) => ci !== index) };
          }
          return c;
        });
        return { ...prev, conditions };
      }
      
      // Remove from root conditions
      return {
        ...prev,
        conditions: prev.conditions.filter((_, i) => i !== index),
      };
    });
  }, []);

  /**
   * Update a condition in the filter
   */
  const updateCondition = useCallback((index: number, updates: Partial<FieldCondition>, groupIndex?: number) => {
    setFilter((prev) => {
      if (groupIndex !== undefined && groupIndex >= 0) {
        // Update in a specific group - immutable update
        const conditions = prev.conditions.map((c, i) => {
          if (i === groupIndex && "conditions" in c) {
            return {
              ...c,
              conditions: c.conditions.map((cc, ci) =>
                ci === index ? { ...cc, ...updates } : cc
              ),
            };
          }
          return c;
        });
        return { ...prev, conditions };
      }
      
      // Update in root conditions
      const conditions = prev.conditions.map((c, i) =>
        i === index ? { ...c, ...updates } : c
      );
      return { ...prev, conditions };
    });
  }, []);

  /**
   * Set the root operator (AND/OR)
   */
  const setOperator = useCallback((operator: "AND" | "OR") => {
    setFilter((prev) => ({ ...prev, operator }));
  }, []);

  /**
   * Add a condition group
   */
  const addGroup = useCallback((group: ConditionGroup) => {
    setFilter((prev) => ({
      ...prev,
      conditions: [...prev.conditions, group],
    }));
  }, []);

  /**
   * Remove a condition group
   */
  const removeGroup = useCallback((index: number) => {
    setFilter((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilter(defaultFilter);
    setTasks([]);
    setPagination(null);
  }, []);

  /**
   * Go to a specific page
   */
  const goToPage = useCallback(async (page: number) => {
    if (pagination && page >= 1 && page <= pagination.totalPages) {
      await applyFilters({ ...currentOptions, page });
    }
  }, [applyFilters, currentOptions, pagination]);

  /**
   * Go to next page
   */
  const nextPage = useCallback(async () => {
    if (pagination?.hasNextPage) {
      await goToPage(pagination.page + 1);
    }
  }, [goToPage, pagination]);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(async () => {
    if (pagination?.hasPrevPage) {
      await goToPage(pagination.page - 1);
    }
  }, [goToPage, pagination]);

  /**
   * Fetch filter metadata
   */
  const fetchMetadata = useCallback(async () => {
    try {
      const response = await getFilterMetadata();
      if (response.success) {
        setMetadata(response.metadata);
      }
    } catch (err) {
      console.error("Failed to fetch filter metadata:", err);
    }
  }, []);

  /**
   * Apply a saved view
   */
  const applyView = useCallback(async (viewId: number, options?: FilterPaginationOptions) => {
    const opts = { ...currentOptions, ...options };
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await applySavedView(viewId, opts);
      
      if (response.success) {
        setTasks(response.tasks as unknown as Task[]);
        setPagination(response.pagination);
        setCurrentOptions(opts);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to apply saved view");
      setError(error);
      onError?.(error);
      
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentOptions, toast, onError]);

  return useMemo(
    () => ({
      // State
      filter,
      tasks,
      isLoading,
      error,
      pagination,
      metadata,
      
      // Actions
      setFilter,
      addCondition,
      removeCondition,
      updateCondition,
      setOperator,
      addGroup,
      removeGroup,
      clearFilters,
      applyFilters,
      validate,
      
      // Pagination
      goToPage,
      nextPage,
      prevPage,
      
      // Metadata
      fetchMetadata,
      
      // Saved views
      applyView,
      
      // Builders
      buildComplexFilter,
      createSimpleFilter,
      createOrFilter,
      createAndFilter,
    }),
    [
      filter,
      tasks,
      isLoading,
      error,
      pagination,
      metadata,
      addCondition,
      removeCondition,
      updateCondition,
      setOperator,
      addGroup,
      removeGroup,
      clearFilters,
      applyFilters,
      validate,
      goToPage,
      nextPage,
      prevPage,
      fetchMetadata,
      applyView,
    ]
  );
}

export default useAdvancedFilters;

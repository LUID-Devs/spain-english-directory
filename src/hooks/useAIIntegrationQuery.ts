import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';
import { useAIModelStore } from '@/stores/aiModelStore';
import { UnifiedSearchResult, ExternalTaskSource } from '@/services/unifiedSearchService';

export interface AIIntegrationQueryResult {
  id: string;
  source: ExternalTaskSource;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  dueDate?: string;
  url: string;
  assignee?: {
    name: string;
    email?: string;
    avatarUrl?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  externalId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIIntegrationQueryResponse {
  results: AIIntegrationQueryResult[];
  interpretedQuery: string;
  totalCount: number;
  sourceCounts: {
    asana: number;
    linear: number;
    jira: number;
  };
  suggestedFilters?: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    project?: string[];
    dueDateRange?: {
      from: string;
      to: string;
    };
  };
}

export interface UseAIIntegrationQueryReturn {
  // State
  results: AIIntegrationQueryResult[];
  interpretedQuery: string | null;
  totalCount: number;
  sourceCounts: {
    asana: number;
    linear: number;
    jira: number;
  };
  suggestedFilters: AIIntegrationQueryResponse['suggestedFilters'] | null;
  isLoading: boolean;
  error: string | null;
  creditsUsed: number | null;
  remainingCredits: number | null;

  // Actions
  query: (naturalLanguageQuery: string, options?: {
    sources?: ExternalTaskSource[];
    model?: string;
  }) => Promise<void>;
  clearResults: () => void;
}

/**
 * Hook for AI-powered natural language querying across integrated platforms
 * 
 * Example queries:
 * - "Show me overdue tasks grouped by assignee"
 * - "Find high priority issues from last week"
 * - "What tasks are assigned to John that are in progress?"
 * - "List all blocked tasks across all tools"
 */
export function useAIIntegrationQuery(): UseAIIntegrationQueryReturn {
  const [results, setResults] = useState<AIIntegrationQueryResult[]>([]);
  const [interpretedQuery, setInterpretedQuery] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [sourceCounts, setSourceCounts] = useState({
    asana: 0,
    linear: 0,
    jira: 0,
  });
  const [suggestedFilters, setSuggestedFilters] = useState<AIIntegrationQueryResponse['suggestedFilters'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  const { defaultModel } = useAIModelStore();

  const query = useCallback(async (
    naturalLanguageQuery: string,
    options?: {
      sources?: ExternalTaskSource[];
      model?: string;
    }
  ): Promise<void> => {
    if (!naturalLanguageQuery || naturalLanguageQuery.trim().length === 0) {
      setError('Please enter a query');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCreditsUsed(null);
    setRemainingCredits(null);

    try {
      const response = await apiService.request<{
        success: boolean;
        data: AIIntegrationQueryResponse;
        creditsUsed?: number;
        remainingCredits?: number;
        error?: { message: string };
      }>('/integrations/ai-query', {
        method: 'POST',
        body: JSON.stringify({
          query: naturalLanguageQuery.trim(),
          sources: options?.sources || ['asana', 'linear', 'jira'],
          model: options?.model || defaultModel,
        }),
      });

      if (response.success && response.data) {
        setResults(response.data.results);
        setInterpretedQuery(response.data.interpretedQuery);
        setTotalCount(response.data.totalCount);
        setSourceCounts(response.data.sourceCounts);
        setSuggestedFilters(response.data.suggestedFilters || null);
        setCreditsUsed(response.creditsUsed ?? null);
        setRemainingCredits(response.remainingCredits ?? null);
      } else {
        setError(response.error?.message || 'Failed to process query');
        setResults([]);
        setInterpretedQuery(null);
        setTotalCount(0);
        setSourceCounts({ asana: 0, linear: 0, jira: 0 });
        setSuggestedFilters(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to process query. Please try again.';
      setError(errorMessage);
      setResults([]);
      setInterpretedQuery(null);
      setTotalCount(0);
      setSourceCounts({ asana: 0, linear: 0, jira: 0 });
      setSuggestedFilters(null);
    } finally {
      setIsLoading(false);
    }
  }, [defaultModel]);

  const clearResults = useCallback(() => {
    setResults([]);
    setInterpretedQuery(null);
    setTotalCount(0);
    setSourceCounts({ asana: 0, linear: 0, jira: 0 });
    setSuggestedFilters(null);
    setError(null);
    setCreditsUsed(null);
    setRemainingCredits(null);
  }, []);

  return {
    results,
    interpretedQuery,
    totalCount,
    sourceCounts,
    suggestedFilters,
    isLoading,
    error,
    creditsUsed,
    remainingCredits,
    query,
    clearResults,
  };
}

export default useAIIntegrationQuery;

import { useState, useCallback } from 'react';
import { apiService } from '@/services/apiService';

export interface ParsedSearchFilter {
  query: string;
  filters: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    author?: string[];
    project?: string[];
    label?: string[];
    due?: string;
    created?: string;
    updated?: string;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  confidence: {
    overall: number;
    status: number;
    priority: number;
    assignee: number;
    date: number;
  };
}

export interface UseAIParseSearchFilterResult {
  parseSearchFilter: (text: string, context?: {
    availableProjects?: string[];
    availableLabels?: string[];
    teamMembers?: string[];
  }) => Promise<ParsedSearchFilter | null>;
  isLoading: boolean;
  error: string | null;
  creditsUsed: number | null;
  remainingCredits: number | null;
}

export function useAIParseSearchFilter(): UseAIParseSearchFilterResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditsUsed, setCreditsUsed] = useState<number | null>(null);
  const [remainingCredits, setRemainingCredits] = useState<number | null>(null);

  const parseSearchFilter = useCallback(async (
    text: string,
    context?: {
      availableProjects?: string[];
      availableLabels?: string[];
      teamMembers?: string[];
    }
  ): Promise<ParsedSearchFilter | null> => {
    if (!text || text.trim().length === 0) {
      return null;
    }

    setIsLoading(true);
    setError(null);
    setCreditsUsed(null);
    setRemainingCredits(null);

    try {
      const response = await apiService.request<{
        success: boolean;
        data: ParsedSearchFilter;
        creditsUsed?: number;
        remainingCredits?: number;
        error?: { message: string };
      }>('/api/ai/parse-search-filter', {
        method: 'POST',
        body: JSON.stringify({
          text: text.trim(),
          availableProjects: context?.availableProjects,
          availableLabels: context?.availableLabels,
          teamMembers: context?.teamMembers,
        }),
      });

      if (response.success) {
        setCreditsUsed(response.creditsUsed ?? null);
        setRemainingCredits(response.remainingCredits ?? null);
        return response.data;
      } else {
        setError(response.error?.message || 'Failed to parse search query');
        return null;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to parse search query';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    parseSearchFilter,
    isLoading,
    error,
    creditsUsed,
    remainingCredits,
  };
}

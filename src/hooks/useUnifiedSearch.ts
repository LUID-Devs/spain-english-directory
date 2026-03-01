import { useState, useCallback, useEffect } from 'react';
import {
  UnifiedSearchResult,
  UnifiedSearchFilters,
  ConnectedIntegrations,
  unifiedSearch,
  getUnifiedSearchSuggestions,
  getConnectedIntegrations,
  getRecentExternalTasks,
  getMyExternalTasks,
  linkExternalTask,
  getTaskExternalLinks,
  deleteExternalLink,
  syncExternalLink,
  ExternalTaskSource,
} from '@/services/unifiedSearchService';
import { toast } from 'sonner';

export interface UseUnifiedSearchReturn {
  // Status
  isLoading: boolean;
  error: string | null;
  connectedIntegrations: ConnectedIntegrations;
  hasConnectedIntegrations: boolean;
  
  // Data
  results: UnifiedSearchResult[];
  suggestions: UnifiedSearchResult[];
  recentTasks: UnifiedSearchResult[];
  myTasks: UnifiedSearchResult[];
  taskExternalLinks: {
    id: number;
    source: ExternalTaskSource;
    externalId: string;
    title: string;
    url: string;
    syncEnabled: boolean;
    lastSyncedAt?: string;
    createdAt: string;
  }[];
  
  // Loading states
  isLoadingResults: boolean;
  isLoadingSuggestions: boolean;
  isLoadingRecent: boolean;
  isLoadingMyTasks: boolean;
  isLoadingLinks: boolean;
  isLoadingAction: boolean;
  
  // Actions
  search: (filters: UnifiedSearchFilters) => Promise<void>;
  fetchSuggestions: (query: string, limit?: number) => Promise<void>;
  fetchConnectedIntegrations: () => Promise<void>;
  fetchRecentTasks: (limit?: number) => Promise<void>;
  fetchMyTasks: (limit?: number) => Promise<void>;
  fetchTaskExternalLinks: (taskId: number) => Promise<void>;
  linkTask: (
    taskluidTaskId: number,
    source: ExternalTaskSource,
    externalTaskId: string,
    config?: {
      syncEnabled?: boolean;
      syncDirection?: 'to_external' | 'from_external' | 'bidirectional';
    }
  ) => Promise<boolean>;
  unlinkTask: (linkId: number) => Promise<boolean>;
  syncLink: (linkId: number, direction: 'to_external' | 'from_external') => Promise<boolean>;
}

export function useUnifiedSearch(): UseUnifiedSearchReturn {
  const [connectedIntegrations, setConnectedIntegrations] = useState<ConnectedIntegrations>({
    asana: false,
    linear: false,
    jira: false,
  });
  
  const [results, setResults] = useState<UnifiedSearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<UnifiedSearchResult[]>([]);
  const [recentTasks, setRecentTasks] = useState<UnifiedSearchResult[]>([]);
  const [myTasks, setMyTasks] = useState<UnifiedSearchResult[]>([]);
  const [taskExternalLinks, setTaskExternalLinks] = useState<{
    id: number;
    source: ExternalTaskSource;
    externalId: string;
    title: string;
    url: string;
    syncEnabled: boolean;
    lastSyncedAt?: string;
    createdAt: string;
  }[]>([]);
  
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [isLoadingConnected, setIsLoadingConnected] = useState(false);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [isLoadingMyTasks, setIsLoadingMyTasks] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const [errorResults, setErrorResults] = useState<string | null>(null);
  const [errorSuggestions, setErrorSuggestions] = useState<string | null>(null);
  const [errorConnected, setErrorConnected] = useState<string | null>(null);
  const [errorRecent, setErrorRecent] = useState<string | null>(null);
  const [errorMyTasks, setErrorMyTasks] = useState<string | null>(null);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);

  const isLoading = isLoadingResults || isLoadingSuggestions || isLoadingConnected || 
                    isLoadingRecent || isLoadingMyTasks || isLoadingLinks || isLoadingAction;
  
  const error = errorResults || errorSuggestions || errorConnected || errorRecent || 
                errorMyTasks || errorLinks || errorAction;

  const hasConnectedIntegrations = connectedIntegrations.asana || 
                                   connectedIntegrations.linear || 
                                   connectedIntegrations.jira;

  const fetchConnectedIntegrations = useCallback(async () => {
    setIsLoadingConnected(true);
    setErrorConnected(null);
    try {
      const result = await getConnectedIntegrations();
      if (result.error) {
        setErrorConnected(result.error);
      } else if (result.data) {
        setConnectedIntegrations(result.data);
      }
    } finally {
      setIsLoadingConnected(false);
    }
  }, []);

  const search = useCallback(async (filters: UnifiedSearchFilters) => {
    setIsLoadingResults(true);
    setErrorResults(null);
    try {
      const result = await unifiedSearch(filters);
      if (result.error) {
        setErrorResults(result.error);
        toast.error(result.error);
      } else if (result.data) {
        setResults(result.data.results);
      }
    } finally {
      setIsLoadingResults(false);
    }
  }, []);

  const fetchSuggestions = useCallback(async (query: string, limit: number = 5) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    setIsLoadingSuggestions(true);
    setErrorSuggestions(null);
    try {
      const result = await getUnifiedSearchSuggestions(query, limit);
      if (result.error) {
        setErrorSuggestions(result.error);
      } else {
        setSuggestions(result.data || []);
      }
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const fetchRecentTasks = useCallback(async (limit: number = 10) => {
    setIsLoadingRecent(true);
    setErrorRecent(null);
    try {
      const result = await getRecentExternalTasks(limit);
      if (result.error) {
        setErrorRecent(result.error);
      } else {
        setRecentTasks(result.data || []);
      }
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  const fetchMyTasks = useCallback(async (limit: number = 10) => {
    setIsLoadingMyTasks(true);
    setErrorMyTasks(null);
    try {
      const result = await getMyExternalTasks(limit);
      if (result.error) {
        setErrorMyTasks(result.error);
      } else {
        setMyTasks(result.data || []);
      }
    } finally {
      setIsLoadingMyTasks(false);
    }
  }, []);

  const fetchTaskExternalLinks = useCallback(async (taskId: number) => {
    setIsLoadingLinks(true);
    setErrorLinks(null);
    try {
      const result = await getTaskExternalLinks(taskId);
      if (result.error) {
        setErrorLinks(result.error);
        toast.error(result.error);
      } else {
        setTaskExternalLinks(result.data || []);
      }
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  const linkTask = useCallback(async (
    taskluidTaskId: number,
    source: ExternalTaskSource,
    externalTaskId: string,
    config?: {
      syncEnabled?: boolean;
      syncDirection?: 'to_external' | 'from_external' | 'bidirectional';
    }
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await linkExternalTask(taskluidTaskId, source, externalTaskId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('External task linked successfully');
      await fetchTaskExternalLinks(taskluidTaskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskExternalLinks]);

  const unlinkTask = useCallback(async (linkId: number): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await deleteExternalLink(linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('External link removed');
      setTaskExternalLinks(prev => prev.filter(link => link.id !== linkId));
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncLink = useCallback(async (
    linkId: number,
    direction: 'to_external' | 'from_external'
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncExternalLink(linkId, direction);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      if (result.data?.success) {
        toast.success(direction === 'to_external' 
          ? 'Synced to external tool successfully' 
          : 'Synced from external tool successfully');
      } else if (result.data?.message) {
        toast.info(result.data.message);
      }
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  // Check connected integrations on mount
  useEffect(() => {
    fetchConnectedIntegrations();
  }, [fetchConnectedIntegrations]);

  return {
    isLoading,
    error,
    connectedIntegrations,
    hasConnectedIntegrations,
    results,
    suggestions,
    recentTasks,
    myTasks,
    taskExternalLinks,
    isLoadingResults,
    isLoadingSuggestions,
    isLoadingRecent,
    isLoadingMyTasks,
    isLoadingLinks,
    isLoadingAction,
    search,
    fetchSuggestions,
    fetchConnectedIntegrations,
    fetchRecentTasks,
    fetchMyTasks,
    fetchTaskExternalLinks,
    linkTask,
    unlinkTask,
    syncLink,
  };
}

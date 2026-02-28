import { useState, useCallback, useEffect } from 'react';
import {
  LinearTeam,
  LinearProject,
  LinearCycle,
  LinearState,
  LinearUser,
  LinearLabel,
  LinearIssue,
  LinearLink,
  LinearSyncConfig,
  LinearSyncResult,
  getLinearTeams,
  getLinearProjects,
  getLinearCycles,
  getLinearStates,
  getLinearUsers,
  getLinearLabels,
  searchLinearIssues,
  getTaskLinearLinks,
  linkLinearIssue,
  createAndLinkLinearIssue,
  updateLinearLink,
  deleteLinearLink,
  syncToLinear,
  syncFromLinear,
  getLinearIntegrationStatus,
} from '@/services/linearService';
import { toast } from 'sonner';

export interface UseLinearIntegrationReturn {
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  teams: LinearTeam[];
  projects: LinearProject[];
  cycles: LinearCycle[];
  states: LinearState[];
  users: LinearUser[];
  labels: LinearLabel[];
  searchResults: LinearIssue[];
  taskLinks: LinearLink[];
  
  // Loading states for specific operations
  isLoadingTeams: boolean;
  isLoadingProjects: boolean;
  isLoadingCycles: boolean;
  isLoadingStates: boolean;
  isLoadingUsers: boolean;
  isLoadingLabels: boolean;
  isLoadingSearch: boolean;
  isLoadingLinks: boolean;
  
  // Actions
  refetchStatus: () => Promise<void>;
  fetchTeams: () => Promise<void>;
  fetchProjects: (teamId: string) => Promise<void>;
  fetchCycles: (teamId: string) => Promise<void>;
  fetchStates: (teamId: string) => Promise<void>;
  fetchUsers: (teamId: string) => Promise<void>;
  fetchLabels: (teamId: string) => Promise<void>;
  searchIssues: (teamId: string, query: string) => Promise<void>;
  fetchTaskLinks: (taskId: number) => Promise<void>;
  linkTask: (taskId: number, linearIssueId: string, config?: Partial<LinearSyncConfig>) => Promise<boolean>;
  createAndLink: (taskId: number, config: LinearSyncConfig) => Promise<boolean>;
  updateLink: (linkId: number, updates: Partial<LinearSyncConfig> & { syncEnabled?: boolean }) => Promise<boolean>;
  unlink: (linkId: number) => Promise<boolean>;
  syncToLinear: (taskId: number, linkId?: number) => Promise<LinearSyncResult | null>;
  syncFromLinear: (taskId: number, linkId?: number) => Promise<LinearSyncResult | null>;
}

export function useLinearIntegration(): UseLinearIntegrationReturn {
  const [isConnected, setIsConnected] = useState(false);
  
  // Separate loading and error states per operation to prevent race conditions
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingCycles, setIsLoadingCycles] = useState(false);
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingLabels, setIsLoadingLabels] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorTeams, setErrorTeams] = useState<string | null>(null);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [errorCycles, setErrorCycles] = useState<string | null>(null);
  const [errorStates, setErrorStates] = useState<string | null>(null);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorLabels, setErrorLabels] = useState<string | null>(null);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [projects, setProjects] = useState<LinearProject[]>([]);
  const [cycles, setCycles] = useState<LinearCycle[]>([]);
  const [states, setStates] = useState<LinearState[]>([]);
  const [users, setUsers] = useState<LinearUser[]>([]);
  const [labels, setLabels] = useState<LinearLabel[]>([]);
  const [searchResults, setSearchResults] = useState<LinearIssue[]>([]);
  const [taskLinks, setTaskLinks] = useState<LinearLink[]>([]);

  // Combined loading state for backward compatibility
  const isLoading = isLoadingStatus || isLoadingTeams || isLoadingProjects || 
                    isLoadingCycles || isLoadingStates || isLoadingUsers || 
                    isLoadingLabels || isLoadingSearch || isLoadingLinks || isLoadingAction;
  
  // Combined error state - returns the most recent error from any operation
  const error = errorStatus || errorTeams || errorProjects || errorCycles || 
                errorStates || errorUsers || errorLabels || errorSearch || errorLinks || errorAction;

  const refetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setErrorStatus(null);
    try {
      const result = await getLinearIntegrationStatus();
      if (result.error) {
        setErrorStatus(result.error);
        setIsConnected(false);
      } else {
        setIsConnected(result.data?.connected || false);
      }
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  const fetchTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    setErrorTeams(null);
    try {
      const result = await getLinearTeams();
      if (result.error) {
        setErrorTeams(result.error);
        toast.error(result.error);
      } else {
        setTeams(result.data || []);
      }
    } finally {
      setIsLoadingTeams(false);
    }
  }, []);

  const fetchProjects = useCallback(async (teamId: string) => {
    setIsLoadingProjects(true);
    setErrorProjects(null);
    try {
      const result = await getLinearProjects(teamId);
      if (result.error) {
        setErrorProjects(result.error);
        toast.error(result.error);
      } else {
        setProjects(result.data || []);
      }
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  const fetchCycles = useCallback(async (teamId: string) => {
    setIsLoadingCycles(true);
    setErrorCycles(null);
    try {
      const result = await getLinearCycles(teamId);
      if (result.error) {
        setErrorCycles(result.error);
        toast.error(result.error);
      } else {
        setCycles(result.data || []);
      }
    } finally {
      setIsLoadingCycles(false);
    }
  }, []);

  const fetchStates = useCallback(async (teamId: string) => {
    setIsLoadingStates(true);
    setErrorStates(null);
    try {
      const result = await getLinearStates(teamId);
      if (result.error) {
        setErrorStates(result.error);
        toast.error(result.error);
      } else {
        setStates(result.data || []);
      }
    } finally {
      setIsLoadingStates(false);
    }
  }, []);

  const fetchUsers = useCallback(async (teamId: string) => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const result = await getLinearUsers(teamId);
      if (result.error) {
        setErrorUsers(result.error);
        toast.error(result.error);
      } else {
        setUsers(result.data || []);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  const fetchLabels = useCallback(async (teamId: string) => {
    setIsLoadingLabels(true);
    setErrorLabels(null);
    try {
      const result = await getLinearLabels(teamId);
      if (result.error) {
        setErrorLabels(result.error);
        toast.error(result.error);
      } else {
        setLabels(result.data || []);
      }
    } finally {
      setIsLoadingLabels(false);
    }
  }, []);

  const searchIssues = useCallback(async (teamId: string, query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    setErrorSearch(null);
    try {
      const result = await searchLinearIssues(teamId, query);
      if (result.error) {
        setErrorSearch(result.error);
      } else {
        setSearchResults(result.data || []);
      }
    } finally {
      setIsLoadingSearch(false);
    }
  }, []);

  const fetchTaskLinks = useCallback(async (taskId: number) => {
    setIsLoadingLinks(true);
    setErrorLinks(null);
    try {
      const result = await getTaskLinearLinks(taskId);
      if (result.error) {
        setErrorLinks(result.error);
        toast.error(result.error);
      } else {
        setTaskLinks(result.data || []);
      }
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  const linkTask = useCallback(async (
    taskId: number,
    linearIssueId: string,
    config?: Partial<LinearSyncConfig>
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await linkLinearIssue(taskId, linearIssueId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Linear issue linked successfully');
      await fetchTaskLinks(taskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskLinks]);

  const createAndLink = useCallback(async (
    taskId: number,
    config: LinearSyncConfig
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await createAndLinkLinearIssue(taskId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Linear issue created and linked successfully');
      await fetchTaskLinks(taskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskLinks]);

  const updateLink = useCallback(async (
    linkId: number,
    updates: Partial<LinearSyncConfig> & { syncEnabled?: boolean }
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await updateLinearLink(linkId, updates);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Linear link updated successfully');
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const unlink = useCallback(async (linkId: number): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await deleteLinearLink(linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Linear link removed');
      setTaskLinks(prev => prev.filter(link => link.id !== linkId));
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncToLinearFn = useCallback(async (taskId: number, linkId?: number): Promise<LinearSyncResult | null> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncToLinear(taskId, linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return null;
      }
      if (result.data?.success) {
        toast.success('Synced to Linear successfully');
      } else if (result.data?.message) {
        toast.info(result.data.message);
      }
      return result.data || null;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncFromLinearFn = useCallback(async (taskId: number, linkId?: number): Promise<LinearSyncResult | null> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncFromLinear(taskId, linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return null;
      }
      if (result.data?.success) {
        toast.success('Synced from Linear successfully');
      } else if (result.data?.message) {
        toast.info(result.data.message);
      }
      return result.data || null;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    refetchStatus();
  }, [refetchStatus]);

  return {
    isConnected,
    isLoading,
    error,
    teams,
    projects,
    cycles,
    states,
    users,
    labels,
    searchResults,
    taskLinks,
    isLoadingTeams,
    isLoadingProjects,
    isLoadingCycles,
    isLoadingStates,
    isLoadingUsers,
    isLoadingLabels,
    isLoadingSearch,
    isLoadingLinks,
    refetchStatus,
    fetchTeams,
    fetchProjects,
    fetchCycles,
    fetchStates,
    fetchUsers,
    fetchLabels,
    searchIssues,
    fetchTaskLinks,
    linkTask,
    createAndLink,
    updateLink,
    unlink,
    syncToLinear: syncToLinearFn,
    syncFromLinear: syncFromLinearFn,
  };
}

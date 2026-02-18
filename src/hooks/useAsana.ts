import { useState, useCallback, useEffect } from 'react';
import {
  AsanaWorkspace,
  AsanaProject,
  AsanaSection,
  AsanaUser,
  AsanaTask,
  AsanaLink,
  AsanaSyncConfig,
  AsanaSyncResult,
  getAsanaWorkspaces,
  getAsanaProjects,
  getAsanaSections,
  getAsanaUsers,
  searchAsanaTasks,
  getTaskAsanaLinks,
  linkAsanaTask,
  createAndLinkAsanaTask,
  updateAsanaLink,
  deleteAsanaLink,
  syncToAsana,
  syncFromAsana,
  getAsanaIntegrationStatus,
} from '@/services/asanaService';
import { toast } from 'sonner';

export interface UseAsanaIntegrationReturn {
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  workspaces: AsanaWorkspace[];
  projects: AsanaProject[];
  sections: AsanaSection[];
  users: AsanaUser[];
  searchResults: AsanaTask[];
  taskLinks: AsanaLink[];
  
  // Loading states for specific operations
  isLoadingWorkspaces: boolean;
  isLoadingProjects: boolean;
  isLoadingSections: boolean;
  isLoadingUsers: boolean;
  isLoadingSearch: boolean;
  isLoadingLinks: boolean;
  
  // Actions
  refetchStatus: () => Promise<void>;
  fetchWorkspaces: () => Promise<void>;
  fetchProjects: (workspaceId: string) => Promise<void>;
  fetchSections: (projectId: string) => Promise<void>;
  fetchUsers: (workspaceId: string) => Promise<void>;
  searchTasks: (workspaceId: string, query: string) => Promise<void>;
  fetchTaskLinks: (taskId: number) => Promise<void>;
  linkTask: (taskId: number, asanaTaskId: string, config?: Partial<AsanaSyncConfig>) => Promise<boolean>;
  createAndLink: (taskId: number, config: AsanaSyncConfig) => Promise<boolean>;
  updateLink: (linkId: number, updates: Partial<AsanaSyncConfig> & { syncEnabled?: boolean }) => Promise<boolean>;
  unlink: (linkId: number) => Promise<boolean>;
  syncToAsana: (taskId: number, linkId?: number) => Promise<AsanaSyncResult | null>;
  syncFromAsana: (taskId: number, linkId?: number) => Promise<AsanaSyncResult | null>;
}

export function useAsanaIntegration(): UseAsanaIntegrationReturn {
  const [isConnected, setIsConnected] = useState(false);
  
  // Separate loading and error states per operation to prevent race conditions
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorWorkspaces, setErrorWorkspaces] = useState<string | null>(null);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [errorSections, setErrorSections] = useState<string | null>(null);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  
  const [workspaces, setWorkspaces] = useState<AsanaWorkspace[]>([]);
  const [projects, setProjects] = useState<AsanaProject[]>([]);
  const [sections, setSections] = useState<AsanaSection[]>([]);
  const [users, setUsers] = useState<AsanaUser[]>([]);
  const [searchResults, setSearchResults] = useState<AsanaTask[]>([]);
  const [taskLinks, setTaskLinks] = useState<AsanaLink[]>([]);

  // Combined loading state for backward compatibility
  const isLoading = isLoadingStatus || isLoadingWorkspaces || isLoadingProjects || 
                    isLoadingSections || isLoadingUsers || isLoadingSearch || 
                    isLoadingLinks || isLoadingAction;
  
  // Combined error state - returns the most recent error from any operation
  const error = errorStatus || errorWorkspaces || errorProjects || errorSections || 
                errorUsers || errorSearch || errorLinks || errorAction;

  const refetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setErrorStatus(null);
    try {
      const result = await getAsanaIntegrationStatus();
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

  const fetchWorkspaces = useCallback(async () => {
    setIsLoadingWorkspaces(true);
    setErrorWorkspaces(null);
    try {
      const result = await getAsanaWorkspaces();
      if (result.error) {
        setErrorWorkspaces(result.error);
        toast.error(result.error);
      } else {
        setWorkspaces(result.data || []);
      }
    } finally {
      setIsLoadingWorkspaces(false);
    }
  }, []);

  const fetchProjects = useCallback(async (workspaceId: string) => {
    setIsLoadingProjects(true);
    setErrorProjects(null);
    try {
      const result = await getAsanaProjects(workspaceId);
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

  const fetchSections = useCallback(async (projectId: string) => {
    setIsLoadingSections(true);
    setErrorSections(null);
    try {
      const result = await getAsanaSections(projectId);
      if (result.error) {
        setErrorSections(result.error);
        toast.error(result.error);
      } else {
        setSections(result.data || []);
      }
    } finally {
      setIsLoadingSections(false);
    }
  }, []);

  const fetchUsers = useCallback(async (workspaceId: string) => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const result = await getAsanaUsers(workspaceId);
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

  const searchTasks = useCallback(async (workspaceId: string, query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    setErrorSearch(null);
    try {
      const result = await searchAsanaTasks(workspaceId, query);
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
      const result = await getTaskAsanaLinks(taskId);
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
    asanaTaskId: string,
    config?: Partial<AsanaSyncConfig>
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await linkAsanaTask(taskId, asanaTaskId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Asana task linked successfully');
      await fetchTaskLinks(taskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskLinks]);

  const createAndLink = useCallback(async (
    taskId: number,
    config: AsanaSyncConfig
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await createAndLinkAsanaTask(taskId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Asana task created and linked successfully');
      await fetchTaskLinks(taskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskLinks]);

  const updateLink = useCallback(async (
    linkId: number,
    updates: Partial<AsanaSyncConfig> & { syncEnabled?: boolean }
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await updateAsanaLink(linkId, updates);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Asana link updated successfully');
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const unlink = useCallback(async (linkId: number): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await deleteAsanaLink(linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Asana link removed');
      setTaskLinks(prev => prev.filter(link => link.id !== linkId));
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncToAsanaFn = useCallback(async (taskId: number, linkId?: number): Promise<AsanaSyncResult | null> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncToAsana(taskId, linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return null;
      }
      if (result.data?.success) {
        toast.success('Synced to Asana successfully');
      } else if (result.data?.message) {
        toast.info(result.data.message);
      }
      return result.data || null;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncFromAsanaFn = useCallback(async (taskId: number, linkId?: number): Promise<AsanaSyncResult | null> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncFromAsana(taskId, linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return null;
      }
      if (result.data?.success) {
        toast.success('Synced from Asana successfully');
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
    workspaces,
    projects,
    sections,
    users,
    searchResults,
    taskLinks,
    isLoadingWorkspaces,
    isLoadingProjects,
    isLoadingSections,
    isLoadingUsers,
    isLoadingSearch,
    isLoadingLinks,
    refetchStatus,
    fetchWorkspaces,
    fetchProjects,
    fetchSections,
    fetchUsers,
    searchTasks,
    fetchTaskLinks,
    linkTask,
    createAndLink,
    updateLink,
    unlink,
    syncToAsana: syncToAsanaFn,
    syncFromAsana: syncFromAsanaFn,
  };
}

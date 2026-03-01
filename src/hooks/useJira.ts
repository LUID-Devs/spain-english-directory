import { useState, useCallback, useEffect } from 'react';
import {
  JiraSite,
  JiraProject,
  JiraIssueType,
  JiraStatus,
  JiraPriority,
  JiraUser,
  JiraIssue,
  JiraLink,
  JiraSyncConfig,
  JiraSyncResult,
  JiraSprint,
  getJiraSites,
  getJiraProjects,
  getJiraIssueTypes,
  getJiraStatuses,
  getJiraPriorities,
  getJiraUsers,
  searchJiraIssues,
  getTaskJiraLinks,
  linkJiraIssue,
  createAndLinkJiraIssue,
  updateJiraLink,
  deleteJiraLink,
  syncToJira,
  syncFromJira,
  getJiraIntegrationStatus,
  getJiraSprints,
  getJiraComponents,
} from '@/services/jiraService';
import { toast } from 'sonner';

export interface UseJiraIntegrationReturn {
  // Status
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Data
  sites: JiraSite[];
  projects: JiraProject[];
  issueTypes: JiraIssueType[];
  statuses: JiraStatus[];
  priorities: JiraPriority[];
  users: JiraUser[];
  sprints: JiraSprint[];
  components: { id: string; name: string; description?: string }[];
  searchResults: JiraIssue[];
  taskLinks: JiraLink[];
  
  // Loading states for specific operations
  isLoadingSites: boolean;
  isLoadingProjects: boolean;
  isLoadingIssueTypes: boolean;
  isLoadingStatuses: boolean;
  isLoadingPriorities: boolean;
  isLoadingUsers: boolean;
  isLoadingSprints: boolean;
  isLoadingComponents: boolean;
  isLoadingSearch: boolean;
  isLoadingLinks: boolean;
  
  // Actions
  refetchStatus: () => Promise<void>;
  fetchSites: () => Promise<void>;
  fetchProjects: (siteId: string) => Promise<void>;
  fetchIssueTypes: (projectId: string) => Promise<void>;
  fetchStatuses: (projectId: string) => Promise<void>;
  fetchPriorities: (siteId: string) => Promise<void>;
  fetchUsers: (siteId: string) => Promise<void>;
  fetchSprints: (projectId: string) => Promise<void>;
  fetchComponents: (projectId: string) => Promise<void>;
  searchIssues: (siteId: string, query: string) => Promise<void>;
  fetchTaskLinks: (taskId: number) => Promise<void>;
  linkTask: (taskId: number, jiraIssueId: string, config?: Partial<JiraSyncConfig>) => Promise<boolean>;
  createAndLink: (taskId: number, config: JiraSyncConfig) => Promise<boolean>;
  updateLink: (linkId: number, updates: Partial<JiraSyncConfig> & { syncEnabled?: boolean }) => Promise<boolean>;
  unlink: (linkId: number) => Promise<boolean>;
  syncToJira: (taskId: number, linkId?: number) => Promise<JiraSyncResult | null>;
  syncFromJira: (taskId: number, linkId?: number) => Promise<JiraSyncResult | null>;
}

export function useJiraIntegration(): UseJiraIntegrationReturn {
  const [isConnected, setIsConnected] = useState(false);
  
  // Separate loading and error states per operation
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isLoadingSites, setIsLoadingSites] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isLoadingIssueTypes, setIsLoadingIssueTypes] = useState(false);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);
  const [isLoadingPriorities, setIsLoadingPriorities] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingSprints, setIsLoadingSprints] = useState(false);
  const [isLoadingComponents, setIsLoadingComponents] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [errorSites, setErrorSites] = useState<string | null>(null);
  const [errorProjects, setErrorProjects] = useState<string | null>(null);
  const [errorIssueTypes, setErrorIssueTypes] = useState<string | null>(null);
  const [errorStatuses, setErrorStatuses] = useState<string | null>(null);
  const [errorPriorities, setErrorPriorities] = useState<string | null>(null);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [errorSprints, setErrorSprints] = useState<string | null>(null);
  const [errorComponents, setErrorComponents] = useState<string | null>(null);
  const [errorSearch, setErrorSearch] = useState<string | null>(null);
  const [errorLinks, setErrorLinks] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<string | null>(null);
  
  const [sites, setSites] = useState<JiraSite[]>([]);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [statuses, setStatuses] = useState<JiraStatus[]>([]);
  const [priorities, setPriorities] = useState<JiraPriority[]>([]);
  const [users, setUsers] = useState<JiraUser[]>([]);
  const [sprints, setSprints] = useState<JiraSprint[]>([]);
  const [components, setComponents] = useState<{ id: string; name: string; description?: string }[]>([]);
  const [searchResults, setSearchResults] = useState<JiraIssue[]>([]);
  const [taskLinks, setTaskLinks] = useState<JiraLink[]>([]);

  // Combined loading state
  const isLoading = isLoadingStatus || isLoadingSites || isLoadingProjects || 
                    isLoadingIssueTypes || isLoadingStatuses || isLoadingPriorities || 
                    isLoadingUsers || isLoadingSprints || isLoadingComponents || 
                    isLoadingSearch || isLoadingLinks || isLoadingAction;
  
  // Combined error state
  const error = errorStatus || errorSites || errorProjects || errorIssueTypes || 
                errorStatuses || errorPriorities || errorUsers || errorSprints || 
                errorComponents || errorSearch || errorLinks || errorAction;

  const refetchStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setErrorStatus(null);
    try {
      const result = await getJiraIntegrationStatus();
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

  const fetchSites = useCallback(async () => {
    setIsLoadingSites(true);
    setErrorSites(null);
    try {
      const result = await getJiraSites();
      if (result.error) {
        setErrorSites(result.error);
        toast.error(result.error);
      } else {
        setSites(result.data || []);
      }
    } finally {
      setIsLoadingSites(false);
    }
  }, []);

  const fetchProjects = useCallback(async (siteId: string) => {
    setIsLoadingProjects(true);
    setErrorProjects(null);
    try {
      const result = await getJiraProjects(siteId);
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

  const fetchIssueTypes = useCallback(async (projectId: string) => {
    setIsLoadingIssueTypes(true);
    setErrorIssueTypes(null);
    try {
      const result = await getJiraIssueTypes(projectId);
      if (result.error) {
        setErrorIssueTypes(result.error);
        toast.error(result.error);
      } else {
        setIssueTypes(result.data || []);
      }
    } finally {
      setIsLoadingIssueTypes(false);
    }
  }, []);

  const fetchStatuses = useCallback(async (projectId: string) => {
    setIsLoadingStatuses(true);
    setErrorStatuses(null);
    try {
      const result = await getJiraStatuses(projectId);
      if (result.error) {
        setErrorStatuses(result.error);
        toast.error(result.error);
      } else {
        setStatuses(result.data || []);
      }
    } finally {
      setIsLoadingStatuses(false);
    }
  }, []);

  const fetchPriorities = useCallback(async (siteId: string) => {
    setIsLoadingPriorities(true);
    setErrorPriorities(null);
    try {
      const result = await getJiraPriorities(siteId);
      if (result.error) {
        setErrorPriorities(result.error);
        toast.error(result.error);
      } else {
        setPriorities(result.data || []);
      }
    } finally {
      setIsLoadingPriorities(false);
    }
  }, []);

  const fetchUsers = useCallback(async (siteId: string) => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const result = await getJiraUsers(siteId);
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

  const fetchSprints = useCallback(async (projectId: string) => {
    setIsLoadingSprints(true);
    setErrorSprints(null);
    try {
      const result = await getJiraSprints(projectId);
      if (result.error) {
        setErrorSprints(result.error);
        toast.error(result.error);
      } else {
        setSprints(result.data || []);
      }
    } finally {
      setIsLoadingSprints(false);
    }
  }, []);

  const fetchComponents = useCallback(async (projectId: string) => {
    setIsLoadingComponents(true);
    setErrorComponents(null);
    try {
      const result = await getJiraComponents(projectId);
      if (result.error) {
        setErrorComponents(result.error);
        toast.error(result.error);
      } else {
        setComponents(result.data || []);
      }
    } finally {
      setIsLoadingComponents(false);
    }
  }, []);

  const searchIssues = useCallback(async (siteId: string, query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsLoadingSearch(true);
    setErrorSearch(null);
    try {
      const result = await searchJiraIssues(siteId, query);
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
      const result = await getTaskJiraLinks(taskId);
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
    jiraIssueId: string,
    config?: Partial<JiraSyncConfig>
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await linkJiraIssue(taskId, jiraIssueId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Jira issue linked successfully');
      await fetchTaskLinks(taskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskLinks]);

  const createAndLink = useCallback(async (
    taskId: number,
    config: JiraSyncConfig
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await createAndLinkJiraIssue(taskId, config);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Jira issue created and linked successfully');
      await fetchTaskLinks(taskId);
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, [fetchTaskLinks]);

  const updateLink = useCallback(async (
    linkId: number,
    updates: Partial<JiraSyncConfig> & { syncEnabled?: boolean }
  ): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await updateJiraLink(linkId, updates);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Jira link updated successfully');
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const unlink = useCallback(async (linkId: number): Promise<boolean> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await deleteJiraLink(linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return false;
      }
      toast.success('Jira link removed');
      setTaskLinks(prev => prev.filter(link => link.id !== linkId));
      return true;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncToJiraFn = useCallback(async (taskId: number, linkId?: number): Promise<JiraSyncResult | null> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncToJira(taskId, linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return null;
      }
      if (result.data?.success) {
        toast.success('Synced to Jira successfully');
      } else if (result.data?.message) {
        toast.info(result.data.message);
      }
      return result.data || null;
    } finally {
      setIsLoadingAction(false);
    }
  }, []);

  const syncFromJiraFn = useCallback(async (taskId: number, linkId?: number): Promise<JiraSyncResult | null> => {
    setIsLoadingAction(true);
    setErrorAction(null);
    try {
      const result = await syncFromJira(taskId, linkId);
      if (result.error) {
        setErrorAction(result.error);
        toast.error(result.error);
        return null;
      }
      if (result.data?.success) {
        toast.success('Synced from Jira successfully');
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
    sites,
    projects,
    issueTypes,
    statuses,
    priorities,
    users,
    sprints,
    components,
    searchResults,
    taskLinks,
    isLoadingSites,
    isLoadingProjects,
    isLoadingIssueTypes,
    isLoadingStatuses,
    isLoadingPriorities,
    isLoadingUsers,
    isLoadingSprints,
    isLoadingComponents,
    isLoadingSearch,
    isLoadingLinks,
    refetchStatus,
    fetchSites,
    fetchProjects,
    fetchIssueTypes,
    fetchStatuses,
    fetchPriorities,
    fetchUsers,
    fetchSprints,
    fetchComponents,
    searchIssues,
    fetchTaskLinks,
    linkTask,
    createAndLink,
    updateLink,
    unlink,
    syncToJira: syncToJiraFn,
    syncFromJira: syncFromJiraFn,
  };
}
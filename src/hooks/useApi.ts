import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import { toast } from 'sonner';
import { useApiStore } from '@/stores/apiStore';
import { useUserStore } from '@/stores/userStore';
import { useRequestManager } from '@/stores/requestManager';
import { apiService, Status, Priority, Task, Project, User, Comment, Attachment, UserWithStats, SavedView } from '@/services/apiService';

// Utility function to create RTK Query-like mutation results
const createMutationResult = <T>(promise: Promise<T>) => {
  (promise as any).unwrap = () => promise;
  return promise;
};

// Hook to replace useGetAuthUserQuery
export const useGetAuthUserQuery = (userIdentifier: string, options: { skip?: boolean } = {}) => {
  const { currentUser, isLoading, error, setCurrentUser, setLoading, setError, setUserIdentifier } = useUserStore();
  const hasFetchedRef = useRef(false);
  const userIdentifierRef = useRef(userIdentifier);
  const skipRef = useRef(options.skip);
  
  const fetchUser = useCallback(async () => {
    if (skipRef.current || !userIdentifierRef.current) return;
    
    // Safety check: ensure getAuthUser is available
    if (typeof apiService.getAuthUser !== 'function') {
      console.error('apiService.getAuthUser is not a function');
      setError('API service not properly initialized');
      return;
    }
    
    try {
      setLoading(true);
      const user = await apiService.getAuthUser(userIdentifierRef.current);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [setCurrentUser, setLoading, setError]);

  useEffect(() => {
    // Update refs
    userIdentifierRef.current = userIdentifier;
    skipRef.current = options.skip;
    setUserIdentifier(userIdentifier);
    
    // Only fetch once on mount unless userIdentifier or skip changes
    if (!hasFetchedRef.current && !options.skip && userIdentifier) {
      hasFetchedRef.current = true;
      fetchUser();
    }
  }, [userIdentifier, options.skip, setUserIdentifier, fetchUser]);

  return {
    data: currentUser,
    isLoading,
    error: error ? new Error(error) : null,
    refetch: fetchUser,
  };
};

// Hook to replace useGetProjectsQuery
export const useGetProjectsQuery = (filters: any = {}, options: { skip?: boolean } = {}) => {
  const { projects, setProjects, setLoading, setError } = useApiStore();
  const { getOrCreateRequest } = useRequestManager();
  const lastFetchKeyRef = useRef<string | null>(null);
  const normalizedFiltersKey = useMemo(() => {
    const sanitized = typeof filters === 'object' && filters !== null
      ? Object.fromEntries(Object.entries(filters).filter(([key]) => key !== 'skip'))
      : {};
    return JSON.stringify(sanitized);
  }, [filters]);
  const normalizedFilters = useMemo(() => JSON.parse(normalizedFiltersKey), [normalizedFiltersKey]);
  const inferredSkip = options.skip ?? (
    typeof filters === 'object' &&
    filters !== null &&
    'skip' in filters &&
    Boolean((filters as Record<string, unknown>).skip)
  );

  // Track organization ID for cache invalidation when workspace changes
  const [activeOrgId, setActiveOrgId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null
  );

  const fetchProjects = useCallback(async (filtersToUse = normalizedFilters) => {
    if (inferredSkip) return;

    try {
      setLoading('projects', true);
      const requestKey = `projects:${activeOrgId ?? 'none'}:${JSON.stringify(filtersToUse || {})}`;
      const projectsData = await getOrCreateRequest(
        requestKey,
        () => apiService.getProjects(filtersToUse || {}),
        2500
      );
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('projects', error instanceof Error ? error.message : 'Failed to fetch projects');
      return undefined;
    } finally {
      setLoading('projects', false);
    }
  }, [activeOrgId, normalizedFiltersKey, inferredSkip, setProjects, setLoading, setError, getOrCreateRequest]);

  // Listen for storage changes (workspace switches)
  useEffect(() => {
    const handleStorageChange = () => {
      const newOrgId = localStorage.getItem('activeOrganizationId');
      if (newOrgId !== activeOrgId) {
        setActiveOrgId(newOrgId);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeOrgId]);

  // Fetch when filters or organization changes
  useEffect(() => {
    if (inferredSkip) {
      lastFetchKeyRef.current = null;
      return;
    }
    const fetchKey = `projects:${activeOrgId ?? 'none'}:${normalizedFiltersKey}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;
    fetchProjects(normalizedFilters);
  }, [normalizedFiltersKey, inferredSkip, activeOrgId, fetchProjects, normalizedFilters]);

  // Listen for project deletion events to force refetch
  useEffect(() => {
    const handleProjectDeleted = () => {
      if (!inferredSkip) {
        lastFetchKeyRef.current = null;
        fetchProjects(normalizedFilters);
      }
    };

    window.addEventListener('projectDeleted', handleProjectDeleted);
    return () => window.removeEventListener('projectDeleted', handleProjectDeleted);
  }, [normalizedFiltersKey, inferredSkip, fetchProjects]);

  return {
    data: projects.data,
    isLoading: projects.isLoading,
    isError: !!projects.error,
    error: projects.error ? new Error(projects.error) : null,
    refetch: () => {
      lastFetchKeyRef.current = null;
      return fetchProjects(normalizedFilters);
    },
  };
};

// Hook to replace useGetTasksByUserQuery
export const useGetTasksByUserQuery = (userId: number | null, options: { skip?: boolean } = {}) => {
  const { tasks, setTasks, setLoading, setError } = useApiStore();
  const { getOrCreateRequest } = useRequestManager();
  const userIdRef = useRef(userId);
  const skipRef = useRef(options.skip);
  // Track organization ID for cache invalidation when workspace changes
  const [activeOrgId, setActiveOrgId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null
  );

  const fetchTasks = useCallback(async () => {
    if (skipRef.current || userIdRef.current === null || userIdRef.current === undefined) {
      return;
    }

    // Validate userId is a valid number
    if (isNaN(userIdRef.current) || userIdRef.current <= 0) {
      console.error('Invalid userId for task fetch:', userIdRef.current);
      setError('tasks', 'Invalid user ID');
      return;
    }

    try {
      setLoading('tasks', true);
      const requestKey = `tasksByUser:${activeOrgId ?? 'none'}:${userIdRef.current}`;
      const tasksData = await getOrCreateRequest(
        requestKey,
        () => apiService.getTasksByUser(userIdRef.current as number),
        2000
      );
      setTasks(tasksData);
      return tasksData;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('tasks', error instanceof Error ? error.message : 'Failed to fetch tasks');
      return undefined;
    } finally {
      setLoading('tasks', false);
    }
  }, [activeOrgId, setTasks, setLoading, setError, getOrCreateRequest]);

  // Listen for storage changes (workspace switches)
  useEffect(() => {
    const handleStorageChange = () => {
      const newOrgId = localStorage.getItem('activeOrganizationId');
      if (newOrgId !== activeOrgId) {
        setActiveOrgId(newOrgId);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [activeOrgId]);

  useEffect(() => {
    // Update refs
    userIdRef.current = userId;
    skipRef.current = options.skip;

    // Fetch when userId, skip, or organization changes
    if (!options.skip && userId !== null && userId !== undefined) {
      fetchTasks();
    }
  }, [userId, options.skip, fetchTasks, activeOrgId]);

  return {
    data: tasks.data,
    isLoading: tasks.isLoading,
    isError: !!tasks.error,
    error: tasks.error ? new Error(tasks.error) : null,
    refetch: fetchTasks,
  };
};

// Hook to replace useGetUsersQuery
export const useGetUsersQuery = (params: any = undefined, options: { skip?: boolean } = {}) => {
  const { users, setUsers, setLoading, setError } = useApiStore();
  const { getOrCreateRequest } = useRequestManager();
  const inferredSkip = options.skip ?? (
    typeof params === 'object' &&
    params !== null &&
    'skip' in params &&
    Boolean((params as Record<string, unknown>).skip)
  );
  const hasFetchedRef = useRef(false);
  const skipRef = useRef(inferredSkip);
  
  const fetchUsers = useCallback(async () => {
    if (skipRef.current) return;
    
    try {
      setLoading('users', true);
      const usersData = await getOrCreateRequest(
        'users:global',
        () => apiService.getUsers(),
        2500
      );
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('users', error instanceof Error ? error.message : 'Failed to fetch users');
      return undefined;
    } finally {
      setLoading('users', false);
    }
  }, [setUsers, setLoading, setError, getOrCreateRequest]);

  useEffect(() => {
    // Update refs
    skipRef.current = inferredSkip;
    
    // Only fetch once on mount unless skip changes
    if (!hasFetchedRef.current && !inferredSkip) {
      hasFetchedRef.current = true;
      fetchUsers();
    }
  }, [inferredSkip, fetchUsers]);

  return {
    data: users.data,
    isLoading: users.isLoading,
    isError: !!users.error,
    error: users.error ? new Error(users.error) : null,
    refetch: fetchUsers,
  };
};

// Hook to get agents
export const useGetAgentsQuery = (options: { skip?: boolean } = {}) => {
  const { agents, setAgents, setLoading, setError } = useApiStore();
  const hasFetchedRef = useRef(false);
  const skipRef = useRef(options.skip);
  
  const fetchAgents = useCallback(async () => {
    if (skipRef.current) return;
    
    try {
      setLoading('agents', true);
      const agentsData = await apiService.getAgents();
      setAgents(agentsData);
      return agentsData;
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      setError('agents', error instanceof Error ? error.message : 'Failed to fetch agents');
      throw error;
    } finally {
      setLoading('agents', false);
    }
  }, [setAgents, setLoading, setError]);

  useEffect(() => {
    // Update refs
    skipRef.current = options.skip;
    
    // Only fetch once on mount unless skip changes
    if (!hasFetchedRef.current && !options.skip) {
      hasFetchedRef.current = true;
      fetchAgents();
    }
  }, [options.skip, fetchAgents]);

  return {
    data: agents.data,
    isLoading: agents.isLoading,
    isError: !!agents.error,
    error: agents.error ? new Error(agents.error) : null,
    refetch: fetchAgents,
  };
};

// Hook to replace useGetTaskCommentsQuery
export const useGetTaskCommentsQuery = (taskId: number) => {
  const { taskComments, setTaskComments } = useApiStore();
  const comments = taskComments[taskId.toString()] || { data: null, isLoading: false, error: null };
  const hasFetchedRef = useRef(false);
  const taskIdRef = useRef(taskId);
  
  const fetchComments = useCallback(async () => {
    if (!taskIdRef.current) {
      // Silently return if no taskId provided - this is expected behavior
      return;
    }
    
    // Validate taskId is a valid number
    if (isNaN(taskIdRef.current) || taskIdRef.current <= 0) {
      console.error('[useGetTaskCommentsQuery] Invalid taskId:', taskIdRef.current);
      setTaskComments(taskIdRef.current.toString(), [], false, 'Invalid task ID');
      return;
    }
    
    try {
      setTaskComments(taskIdRef.current.toString(), [], true);
      const commentsData = await apiService.getTaskComments(taskIdRef.current);
      setTaskComments(taskIdRef.current.toString(), commentsData);
    } catch (error) {
      console.error('[useGetTaskCommentsQuery] Failed to fetch comments:', error);
      let errorMessage = 'Failed to load comments. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }
      
      // Provide more user-friendly error messages
      if (errorMessage.includes('Authentication required') || errorMessage.includes('401')) {
        errorMessage = 'Please sign in to view comments';
      } else if (errorMessage.includes('Network Error') || errorMessage.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (errorMessage.includes('404')) {
        errorMessage = 'Task not found. It may have been deleted.';
      }
      
      setTaskComments(taskIdRef.current.toString(), [], false, errorMessage);
    }
  }, [setTaskComments]);

  useEffect(() => {
    // Reset fetch flag when taskId changes
    if (taskIdRef.current !== taskId) {
      hasFetchedRef.current = false;
    }
    
    // Update refs
    taskIdRef.current = taskId;
    
    // Only fetch once on mount unless taskId changes
    if (!hasFetchedRef.current && taskId) {
      hasFetchedRef.current = true;
      fetchComments();
    }
  }, [taskId, fetchComments]);

  return {
    data: comments.data,
    isLoading: comments.isLoading,
    error: comments.error ? new Error(comments.error) : null,
    refetch: fetchComments,
  };
};

// Mutation hooks
export const useCreateTaskMutation = () => {
  const { tasks, setTasks } = useApiStore();
  
  const createTask = useCallback(async (taskData: any) => {
    const newTask = await apiService.createTask(taskData);
    
    // Optimistically add new task to the list
    if (tasks.data) {
      setTasks([...tasks.data, newTask]);
    }
    
    return newTask;
  }, [tasks.data, setTasks]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => createTask(args)
  }), [createTask]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useCreateProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  
  const createProject = useCallback(async (projectData: any) => {
    const loadingToast = toast.loading('Creating project...');
    
    try {
      const newProject = await apiService.createProject(projectData);
      
      // Optimistically add new project to the list
      if (projects.data) {
        setProjects([...projects.data, newProject]);
      }
      
      toast.success('Project created successfully!', { id: loadingToast });
      return newProject;
    } catch (error) {
      toast.error('Failed to create project', { id: loadingToast });
      throw error;
    }
  }, [projects.data, setProjects]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => createProject(args)
  }), [createProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUpdateTaskMutation = () => {
  const { setTasks } = useApiStore();

  const updateTask = useCallback(async ({ taskId, task: taskUpdates, ...directUpdates }: { taskId: number; task?: any; [key: string]: any }) => {
    // Handle both { taskId, task: {...} } and { taskId, ...updates } formats
    const updates = taskUpdates || directUpdates;

    // Get fresh state to avoid stale closure issues
    const currentTasks = useApiStore.getState().tasks.data;

    // Store original task for rollback
    const originalTask = currentTasks?.find(t => t.id === taskId);

    // Optimistic update - immediately update the UI
    if (currentTasks) {
      const optimisticTasks = currentTasks.map(t =>
        t.id === taskId ? { ...t, ...updates } : t
      );
      setTasks(optimisticTasks);
    }

    try {
      const updatedTask = await apiService.updateTask(taskId, updates);

      // Get fresh state again for server response update
      const latestTasks = useApiStore.getState().tasks.data;
      if (latestTasks) {
        const updatedTasks = latestTasks.map(t =>
          t.id === taskId ? { ...t, ...updatedTask } : t
        );
        setTasks(updatedTasks);
      }

      // Dispatch event to notify other components (e.g., Mission Control TaskBoard)
      window.dispatchEvent(new CustomEvent('taskUpdated', { detail: { taskId, updates: updatedTask } }));

      return updatedTask;
    } catch (error) {
      // Rollback on error - get fresh state for rollback
      const rollbackTasks = useApiStore.getState().tasks.data;
      if (rollbackTasks && originalTask) {
        const revertedTasks = rollbackTasks.map(t =>
          t.id === taskId ? originalTask : t
        );
        setTasks(revertedTasks);
      }
      throw error;
    }
  }, [setTasks]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { taskId: number; task?: any; [key: string]: any }) => ({
    unwrap: () => updateTask(args)
  }), [updateTask]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useCreateTaskShareMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const createShare = useCallback(async ({ taskId, data }: { taskId: number; data?: {
    expiresInDays?: number | null;
    allowComments?: boolean;
    requirePassword?: boolean;
    password?: string;
  } }) => {
    setIsLoading(true);
    try {
      return await apiService.createTaskShare(taskId, data || {});
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutationWrapper = useCallback((args: { taskId: number; data?: {
    expiresInDays?: number | null;
    allowComments?: boolean;
    requirePassword?: boolean;
    password?: string;
  } }) => ({
    unwrap: () => createShare(args)
  }), [createShare]);

  return [mutationWrapper, { isLoading }] as const;
};

export const useGetTaskShareMutation = () => {
  const [isLoading, setIsLoading] = useState(false);
  const getShare = useCallback(async ({ taskId }: { taskId: number }) => {
    setIsLoading(true);
    try {
      return await apiService.getTaskShare(taskId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutationWrapper = useCallback((args: { taskId: number }) => ({
    unwrap: () => getShare(args)
  }), [getShare]);

  return [mutationWrapper, { isLoading }] as const;
};
export const useReorderTasksMutation = () => {
  const { setTasks } = useApiStore();

  const reorderTasks = useCallback(async (taskOrders: { taskId: number; order: number }[]) => {
    // Get fresh state
    const currentTasks = useApiStore.getState().tasks.data;
    const originalTasks = currentTasks ? [...currentTasks] : null;

    // Optimistic update - immediately reorder in UI
    if (currentTasks) {
      const reorderedTasks = currentTasks.map(t => {
        const orderUpdate = taskOrders.find(o => o.taskId === t.id);
        return orderUpdate ? { ...t, order: orderUpdate.order } : t;
      });
      setTasks(reorderedTasks);
    }

    try {
      const result = await apiService.reorderTasks(taskOrders);
      return result;
    } catch (error) {
      // Rollback on error
      if (originalTasks) {
        setTasks(originalTasks);
      }
      throw error;
    }
  }, [setTasks]);

  const mutationWrapper = useCallback((args: { taskOrders: { taskId: number; order: number }[] }) => ({
    unwrap: () => reorderTasks(args.taskOrders)
  }), [reorderTasks]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUploadTaskDescriptionImageMutation = () => {
  const uploadImage = useCallback(({ formData }: { formData: FormData }) => {
    const promise = apiService.uploadTaskDescriptionImage(formData);
    return {
      unwrap: () => promise,
    };
  }, []);

  return [uploadImage, { isLoading: false }] as const;
};

export const useUpdateProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  const { currentUser } = useUserStore();
  
  const updateProject = useCallback(async ({ id, project }: { id: string | number; project: any }) => {
    const projectId = String(id);
    const loadingToast = toast.loading('Updating project...');
    
    // Store original project data before optimistic update
    const originalProject = projects.data?.find(p => String(p.id) === String(projectId));
  
    // Optimistic update - immediately update UI
    if (projects.data) {
      const optimisticProjects = projects.data.map(p => 
        String(p.id) === String(projectId) ? { ...p, ...project } : p
      );
      setProjects(optimisticProjects);
    }
    
    try {
      const result = await apiService.updateProject(projectId, project);
      
      // Update with server response data while preserving existing fields
      setTimeout(async () => {
        try {
          // Include userId in the request for proper favorite status
          const refreshedProject = await apiService.getProject(projectId, currentUser?.userId);
       
          if (projects.data) {
            const updatedProjects = projects.data.map(p => 
              String(p.id) === String(projectId) ? { 
                ...p, 
                // Only update the fields that were actually edited
                name: refreshedProject.name,
                description: refreshedProject.description,
                startDate: refreshedProject.startDate,
                endDate: refreshedProject.endDate,
                // Keep existing favorite status and other fields
                isFavorited: p.isFavorited
              } : p
            );
            setProjects(updatedProjects);
          }
        } catch (error) {
          console.error('Failed to refresh project:', error);
        }
      }, 200);
      
      toast.success('Project updated successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      console.error('Server update failed:', error);
      // Revert optimistic update on error using stored original data
      if (projects.data && originalProject) {
        const revertedProjects = projects.data.map(p => 
          String(p.id) === String(projectId) ? originalProject : p
        );
        setProjects(revertedProjects);
      }
      toast.error('Failed to update project', { id: loadingToast });
      throw error;
    }
  }, [projects.data, setProjects, currentUser]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string | number; project: any }) => ({
    unwrap: () => updateProject(args)
  }), [updateProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

//Hook for teams query
export const useGetTeamsQuery = (params: any = undefined, options: { skip?: boolean } = {}) => {
  const { teams, setTeams, setLoading, setError } = useApiStore();
  const { getOrCreateRequest } = useRequestManager();
  const inferredSkip = options.skip ?? (
    typeof params === 'object' &&
    params !== null &&
    'skip' in params &&
    Boolean((params as Record<string, unknown>).skip)
  );
  const hasFetchedRef = useRef(false);
  const skipRef = useRef(inferredSkip);
  
  const fetchTeams = useCallback(async () => {
    if (skipRef.current) return;
    
    try {
      setLoading('teams', true);
      const teamsData = await getOrCreateRequest(
        'teams:global',
        () => (typeof apiService.getTeams === 'function'
          ? apiService.getTeams()
          : apiService.request('/teams')),
        2500
      );
      setTeams(teamsData as any[]);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setError('teams', error instanceof Error ? error.message : 'Failed to fetch teams');
      return undefined;
    } finally {
      setLoading('teams', false);
    }
  }, [setTeams, setLoading, setError, getOrCreateRequest]);

  useEffect(() => {
    // Update refs
    skipRef.current = inferredSkip;
    
    // Only fetch once on mount unless skip changes
    if (!hasFetchedRef.current && !inferredSkip) {
      hasFetchedRef.current = true;
      fetchTeams();
    }
  }, [inferredSkip, fetchTeams]);

  return {
    data: teams.data,
    isLoading: teams.isLoading,
    isError: !!teams.error,
    error: teams.error ? new Error(teams.error) : null,
    refetch: fetchTeams,
  };
};

// Hook for tasks query by project
export const useGetTasksQuery = (params: { projectId: number; archived?: boolean }, options: { skip?: boolean } = {}) => {
  const { tasks, setTasks, setLoading, setError } = useApiStore();
  const prevProjectIdRef = useRef(params.projectId);
  const projectIdRef = useRef(params.projectId);
  const archivedRef = useRef(params.archived);
  const skipRef = useRef(options.skip);

  const fetchTasks = useCallback(async () => {
    if (skipRef.current || !projectIdRef.current) return;

    try {
      setLoading('tasks', true);
      const tasksData = await apiService.getTasks(projectIdRef.current, { archived: archivedRef.current });
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('tasks', error instanceof Error ? error.message : 'Failed to fetch tasks');
    } finally {
      setLoading('tasks', false);
    }
  }, [setTasks, setLoading, setError]);

  useEffect(() => {
    // Update refs
    const projectIdChanged = prevProjectIdRef.current !== params.projectId;
    projectIdRef.current = params.projectId;
    archivedRef.current = params.archived;
    skipRef.current = options.skip;

    // Fetch on mount or when projectId or archived changes
    if (!options.skip && params.projectId && (projectIdChanged || prevProjectIdRef.current === params.projectId)) {
      prevProjectIdRef.current = params.projectId;
      fetchTasks();
    }
  }, [params.projectId, params.archived, options.skip, fetchTasks]);

  return {
    data: tasks.data,
    isLoading: tasks.isLoading,
    isError: !!tasks.error,
    error: tasks.error ? new Error(tasks.error) : null,
    refetch: fetchTasks,
  };
};

// Hook for single task query
export const useGetTaskQuery = (taskId: number, options: { skip?: boolean } = {}) => {
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setTaskError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const lastTaskIdRef = useRef<number | null>(null);
  
  const fetchTask = useCallback(async (id: number = taskId) => {
    if (options.skip || !id) return;
    
    try {
      setIsLoading(true);
      setTaskError(null);
      const taskData = await apiService.getTask(id);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      setTaskError(error instanceof Error ? error.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, options.skip]);

  useEffect(() => {
    // Reset fetch flag when taskId changes
    if (lastTaskIdRef.current !== taskId) {
      hasFetchedRef.current = false;
      lastTaskIdRef.current = taskId;
    }
    
    // Only fetch once on mount unless taskId or skip changes
    if (!hasFetchedRef.current && !options.skip && taskId) {
      hasFetchedRef.current = true;
      fetchTask(taskId);
    }
  }, [taskId, options.skip, fetchTask]);

  return {
    data: task,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: () => fetchTask(taskId),
  };
};

// More mutation hooks
export const useDeleteTaskMutation = () => {
  const { tasks, setTasks } = useApiStore();
  
  const deleteTask = useCallback(async (taskId: number) => {
    // Store original tasks for rollback
    const originalTasks = tasks.data;
    
    // Optimistically remove task from UI
    if (tasks.data) {
      const updatedTasks = tasks.data.filter(task => task.id !== taskId);
      setTasks(updatedTasks);
    }
    
    try {
      const result = await apiService.deleteTask(taskId);
      return result;
    } catch (error) {
      // Rollback on error
      if (originalTasks) {
        setTasks(originalTasks);
      }
      throw error;
    }
  }, [tasks.data, setTasks]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((taskId: number) => ({
    unwrap: () => deleteTask(taskId)
  }), [deleteTask]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useArchiveTaskMutation = () => {
  const { tasks, setTasks } = useApiStore();

  const archiveTask = useCallback(async (taskId: number) => {
    const loadingToast = toast.loading('Archiving task...');

    // Store original task for rollback
    const originalTask = tasks.data?.find(task => task.id === taskId);

    // Optimistically update task as archived
    if (tasks.data) {
      const updatedTasks = tasks.data.map(task =>
        task.id === taskId ? { ...task, archivedAt: new Date().toISOString() } : task
      );
      setTasks(updatedTasks);
    }

    try {
      const result = await apiService.archiveTask(taskId);
      toast.success('Task archived successfully!', { id: loadingToast });
      return result;
    } catch (error) {
      // Rollback on error
      if (tasks.data && originalTask) {
        const revertedTasks = tasks.data.map(task =>
          task.id === taskId ? originalTask : task
        );
        setTasks(revertedTasks);
      }
      toast.error('Failed to archive task', { id: loadingToast });
      throw error;
    }
  }, [tasks.data, setTasks]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((taskId: number) => ({
    unwrap: () => archiveTask(taskId)
  }), [archiveTask]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUnarchiveTaskMutation = () => {
  const { tasks, setTasks } = useApiStore();

  const unarchiveTask = useCallback(async (taskId: number) => {
    const loadingToast = toast.loading('Unarchiving task...');

    // Store original task for rollback
    const originalTask = tasks.data?.find(task => task.id === taskId);

    // Optimistically update task as unarchived
    if (tasks.data) {
      const updatedTasks = tasks.data.map(task =>
        task.id === taskId ? { ...task, archivedAt: undefined } : task
      );
      setTasks(updatedTasks);
    }

    try {
      const result = await apiService.unarchiveTask(taskId);
      toast.success('Task unarchived successfully!', { id: loadingToast });
      return result;
    } catch (error) {
      // Rollback on error
      if (tasks.data && originalTask) {
        const revertedTasks = tasks.data.map(task =>
          task.id === taskId ? originalTask : task
        );
        setTasks(revertedTasks);
      }
      toast.error('Failed to unarchive task', { id: loadingToast });
      throw error;
    }
  }, [tasks.data, setTasks]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((taskId: number) => ({
    unwrap: () => unarchiveTask(taskId)
  }), [unarchiveTask]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUpdateTaskStatusMutation = () => {
  const { tasks, setTasks } = useApiStore();

  const updateTaskStatus = useCallback(async ({ taskId, status }: { taskId: number; status: string }) => {
    // Store original task for rollback
    const originalTask = tasks.data?.find(t => t.id === taskId);
    const originalStatus = originalTask?.status;

    // Optimistic update - immediately move the card
    if (tasks.data) {
      const optimisticTasks = tasks.data.map(t =>
        t.id === taskId ? { ...t, status } : t
      );
      setTasks(optimisticTasks);
    }

    try {
      const updatedTask = await apiService.updateTaskStatus(taskId, status);

      // Update with real data from server
      if (tasks.data) {
        const updatedTasks = tasks.data.map(t =>
          t.id === taskId ? { ...t, ...updatedTask } : t
        );
        setTasks(updatedTasks);
      }

      return updatedTask;
    } catch (error) {
      // Rollback on error - move card back to original column
      if (tasks.data && originalStatus) {
        const revertedTasks = tasks.data.map(t =>
          t.id === taskId ? { ...t, status: originalStatus } : t
        );
        setTasks(revertedTasks);
      }
      throw error;
    }
  }, [tasks.data, setTasks]);

  const mutationWrapper = useCallback((args: { taskId: number; status: string }) => ({
    unwrap: () => updateTaskStatus(args)
  }), [updateTaskStatus]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useCreateCommentMutation = () => {
  const { taskComments, setTaskComments } = useApiStore();
  const { currentUser } = useUserStore();

  const createComment = useCallback(async ({ taskId, text, userId, imageUrl }: { taskId: number; text: string; userId: number; imageUrl?: string }) => {
    const taskIdStr = taskId.toString();
    const currentComments = taskComments[taskIdStr]?.data || [];

    // Create optimistic comment with temporary ID
    const optimisticComment = {
      id: Date.now(), // Temporary ID
      text,
      imageUrl,
      taskId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        userId: currentUser?.userId || userId,
        username: currentUser?.username || 'You',
        email: currentUser?.email || '',
        profilePictureUrl: currentUser?.profilePictureUrl,
      },
    };

    // Optimistically add comment to the list
    setTaskComments(taskIdStr, [...currentComments, optimisticComment]);

    try {
      const newComment = await apiService.createComment(taskId, text, userId, imageUrl);

      // Replace optimistic comment with real comment from server
      const updatedComments = currentComments.filter(c => c.id !== optimisticComment.id);
      setTaskComments(taskIdStr, [...updatedComments, newComment]);

      return newComment;
    } catch (error) {
      // Rollback on error
      setTaskComments(taskIdStr, currentComments);
      throw error;
    }
  }, [taskComments, setTaskComments, currentUser]);

  const mutationWrapper = useCallback((args: { taskId: number; text: string; userId: number; imageUrl?: string }) => ({
    unwrap: () => createComment(args)
  }), [createComment]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUploadCommentImageMutation = () => {
  const uploadCommentImage = useCallback(({ formData }: { formData: FormData }) => {
    const promise = apiService.uploadCommentImage(formData);
    return {
      unwrap: () => promise,
    };
  }, []);

  return [uploadCommentImage, { isLoading: false }] as const;
};

export const useDeleteProjectMutation = () => {
  const { projects, setProjects, clearData } = useApiStore();
  
  const deleteProject = useCallback(async (projectId: string) => {
    const loadingToast = toast.loading('Deleting project...');
    
    // Store original projects for rollback
    const originalProjects = projects.data;
    
    // Optimistically remove project from UI - this ensures immediate feedback
    if (projects.data) {
      const updatedProjects = projects.data.filter(project => project.id !== projectId);
      setProjects(updatedProjects);
    }
    
    try {
      const result = await apiService.deleteProject(projectId);
      
      // Clear project data to ensure fresh fetch from server
      // This will force all useGetProjectsQuery hooks to refetch with their current filters
      clearData('projects');
      
      // Force a complete page refresh of projects data by triggering window event
      // This ensures all views (including archived) get fresh data
      window.dispatchEvent(new CustomEvent('projectDeleted', { detail: { projectId } }));
      
      toast.success('Project deleted successfully!', { id: loadingToast });
      return result;
    } catch (error) {
      // Rollback on error
      if (originalProjects) {
        setProjects(originalProjects);
      }
      toast.error('Failed to delete project', { id: loadingToast });
      throw error;
    }
  }, [projects.data, setProjects, clearData]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((projectId: string) => ({
    unwrap: () => deleteProject(projectId)
  }), [deleteProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useFavoriteProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  const { currentUser } = useUserStore();
  
  const favoriteProject = useCallback(async ({ id, userId }: { id: string; userId: number }) => {
    // Optimistic update - immediately update UI
    if (projects.data) {
      const optimisticProjects = projects.data.map(project => 
        project.id === id ? { ...project, isFavorited: true } : project
      );
      setProjects(optimisticProjects);
    }
    
    try {
      const result = await apiService.favoriteProject(id, userId);
      // Update only the favorite status without overriding other fields
      setTimeout(async () => {
        try {
          const refreshedProject = await apiService.getProject(id, currentUser?.userId);
          if (projects.data) {
            const updatedProjects = projects.data.map(project => 
              project.id === id ? { ...project, isFavorited: refreshedProject.isFavorited } : project
            );
            setProjects(updatedProjects);
          }
        } catch (error) {
          console.error('Failed to refresh project favorite status:', error);
        }
      }, 1000);
      toast.success('Project favorited!');
      return result;
    } catch (error: any) {
      // Handle "already favorited" error - this means optimistic update was correct
      if (error?.message === 'Project already favorited') {
        // Keep the optimistic update
        toast.success('Project favorited!');
        return { message: 'Already favorited, state synced' };
      }
      
      // For other errors, revert optimistic update
      if (projects.data) {
        const revertedProjects = projects.data.map(project => 
          project.id === id ? { ...project, isFavorited: false } : project
        );
        setProjects(revertedProjects);
      }
      toast.error('Failed to favorite project');
      throw error;
    }
  }, [projects.data, setProjects, currentUser]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string; userId: number }) => ({
    unwrap: () => favoriteProject(args)
  }), [favoriteProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUnfavoriteProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  const { currentUser } = useUserStore();
  
  const unfavoriteProject = useCallback(async ({ id, userId }: { id: string; userId: number }) => {
    // Optimistic update - immediately update UI
    if (projects.data) {
      const optimisticProjects = projects.data.map(project => 
        project.id === id ? { ...project, isFavorited: false } : project
      );
      setProjects(optimisticProjects);
    }
    
    try {
      const result = await apiService.unfavoriteProject(id, userId);
      // Update only the favorite status without overriding other fields
      setTimeout(async () => {
        try {
          const refreshedProject = await apiService.getProject(id, currentUser?.userId);
          if (projects.data) {
            const updatedProjects = projects.data.map(project => 
              project.id === id ? { ...project, isFavorited: refreshedProject.isFavorited } : project
            );
            setProjects(updatedProjects);
          }
        } catch (error) {
          console.error('Failed to refresh project favorite status:', error);
        }
      }, 1000);
      toast.success('Project removed from favorites!');
      return result;
    } catch (error: any) {
      // Handle "favorite not found" error - this means optimistic update was correct
      if (error?.message === 'Favorite not found') {
        // Keep the optimistic update
        toast.success('Project removed from favorites!');
        return { message: 'Not favorited, state synced' };
      }
      
      // For other errors, revert optimistic update
      if (projects.data) {
        const revertedProjects = projects.data.map(project => 
          project.id === id ? { ...project, isFavorited: true } : project
        );
        setProjects(revertedProjects);
      }
      toast.error('Failed to remove from favorites');
      throw error;
    }
  }, [projects.data, setProjects, currentUser]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string; userId: number }) => ({
    unwrap: () => unfavoriteProject(args)
  }), [unfavoriteProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useArchiveProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  
  const archiveProject = useCallback(async (projectId: string) => {
    const loadingToast = toast.loading('Archiving project...');
    
    // Store original project for rollback
    const originalProject = projects.data?.find(project => project.id === projectId);
    
    // Optimistically update project as archived
    if (projects.data) {
      const updatedProjects = projects.data.map(project => 
        project.id === projectId ? { ...project, archived: true, archivedAt: new Date().toISOString() } : project
      );
      setProjects(updatedProjects);
    }
    
    try {
      const result = await apiService.archiveProject(projectId);
      
      // Refresh with server data
      setTimeout(async () => {
        try {
          const refreshedProject = await apiService.getProject(projectId);
          if (projects.data) {
            const updatedProjects = projects.data.map(project => 
              project.id === projectId ? refreshedProject : project
            );
            setProjects(updatedProjects);
          }
        } catch (error) {
          console.error('Failed to refresh archived project:', error);
        }
      }, 500);
      
      toast.success('Project archived successfully!', { id: loadingToast });
      return result;
    } catch (error) {
      // Rollback on error
      if (projects.data && originalProject) {
        const revertedProjects = projects.data.map(project => 
          project.id === projectId ? originalProject : project
        );
        setProjects(revertedProjects);
      }
      toast.error('Failed to archive project', { id: loadingToast });
      throw error;
    }
  }, [projects.data, setProjects]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((projectId: string) => ({
    unwrap: () => archiveProject(projectId)
  }), [archiveProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUnarchiveProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  
  const unarchiveProject = useCallback(async (projectId: string) => {
    const loadingToast = toast.loading('Unarchiving project...');
    
    // Store original project for rollback
    const originalProject = projects.data?.find(project => project.id === projectId);
    
    // Optimistically update project as unarchived
    if (projects.data) {
      const updatedProjects = projects.data.map(project => 
        project.id === projectId ? { ...project, archived: false, archivedAt: null } : project
      );
      setProjects(updatedProjects);
    }
    
    try {
      const result = await apiService.unarchiveProject(projectId);
      
      // Refresh with server data
      setTimeout(async () => {
        try {
          const refreshedProject = await apiService.getProject(projectId);
          if (projects.data) {
            const updatedProjects = projects.data.map(project => 
              project.id === projectId ? refreshedProject : project
            );
            setProjects(updatedProjects);
          }
        } catch (error) {
          console.error('Failed to refresh unarchived project:', error);
        }
      }, 500);
      
      toast.success('Project unarchived successfully!', { id: loadingToast });
      return result;
    } catch (error) {
      // Rollback on error
      if (projects.data && originalProject) {
        const revertedProjects = projects.data.map(project => 
          project.id === projectId ? originalProject : project
        );
        setProjects(revertedProjects);
      }
      toast.error('Failed to unarchive project', { id: loadingToast });
      throw error;
    }
  }, [projects.data, setProjects]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((projectId: string) => ({
    unwrap: () => unarchiveProject(projectId)
  }), [unarchiveProject]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// Hook for users with stats
export const useGetUsersWithStatsQuery = (params: any = undefined, options: { skip?: boolean } = {}) => {
  const [usersWithStats, setUsersWithStats] = useState<UserWithStats[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const skipRef = useRef(options.skip);
  
  const fetchUsersWithStats = useCallback(async () => {
    if (skipRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiService.getUsersWithStats();
      setUsersWithStats(data);
    } catch (error) {
      console.error('Failed to fetch users with stats:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users with stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for user role update events to update local state
  useEffect(() => {
    const handleUserRoleUpdate = (event: CustomEvent) => {
      const { userId, newRole, optimistic, rollback } = event.detail;
      
      if (usersWithStats) {
        const updatedUsers = usersWithStats.map(user => 
          user.userId === userId ? { ...user, role: newRole } : user
        );
        setUsersWithStats(updatedUsers);
      }
    };

    window.addEventListener('userRoleUpdated', handleUserRoleUpdate as EventListener);
    return () => window.removeEventListener('userRoleUpdated', handleUserRoleUpdate as EventListener);
  }, [usersWithStats]);

  useEffect(() => {
    // Update refs
    skipRef.current = options.skip;
    
    // Only fetch once on mount unless skip changes
    if (!hasFetchedRef.current && !options.skip) {
      hasFetchedRef.current = true;
      fetchUsersWithStats();
    }
  }, [options.skip, fetchUsersWithStats]);

  return {
    data: usersWithStats,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: fetchUsersWithStats,
    updateUser: setUsersWithStats, // Expose update function for optimistic updates
  };
};

// More mutation hooks
export const useInviteUserMutation = () => {
  const inviteUser = useCallback(async ({ email, teamId, role }: { email: string; teamId: number; role: string }) => {
    const loadingToast = toast.loading('Sending invitation...');
    
    try {
      const result = await apiService.inviteUser(email, teamId, role);
      toast.success('Invitation sent successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error('Failed to send invitation', { id: loadingToast });
      throw error;
    }
  }, []);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { email: string; teamId: number; role: string }) => ({
    unwrap: () => inviteUser(args)
  }), [inviteUser]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUpdateUserRoleMutation = () => {
  const [usersWithStats, setUsersWithStats] = useState<UserWithStats[] | null>(null);
  
  // Get users from the users with stats query state if available
  const { data: currentUsersData } = useGetUsersWithStatsQuery({}, { skip: true });
  
  const updateUserRole = useCallback(async (data: { userId: number; role: string }) => {
    const loadingToast = toast.loading('Updating user role...');
    
    // Store original user data for rollback - use either local state or current data
    const userData = usersWithStats || currentUsersData;
    const originalUser = userData?.find(user => user.userId === data.userId);
    
    // Optimistic update - immediately update the user role in local state
    if (userData) {
      const optimisticUsers = userData.map(user => 
        user.userId === data.userId ? { ...user, role: data.role } : user
      );
      
      // Update local state if we have it
      if (usersWithStats) {
        setUsersWithStats(optimisticUsers);
      }
      
      // Dispatch custom event to notify components of the optimistic update
      window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
        detail: { userId: data.userId, newRole: data.role, optimistic: true } 
      }));
    }
    
    try {
      const result = await apiService.updateUserRole(data.userId, data.role);
      
      // Dispatch success event for final UI update
      window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
        detail: { userId: data.userId, newRole: data.role, optimistic: false, user: result.user } 
      }));
      
      toast.success('User role updated successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      // Rollback optimistic update on error
      if (userData && originalUser) {
        const revertedUsers = userData.map(user => 
          user.userId === data.userId ? originalUser : user
        );
        
        if (usersWithStats) {
          setUsersWithStats(revertedUsers);
        }
        
        // Dispatch rollback event
        window.dispatchEvent(new CustomEvent('userRoleUpdated', { 
          detail: { userId: data.userId, newRole: originalUser.role, optimistic: false, rollback: true } 
        }));
      }
      
      toast.error('Failed to update user role', { id: loadingToast });
      throw error;
    }
  }, [usersWithStats, currentUsersData]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { userId: number; role: string }) => ({
    unwrap: () => updateUserRole(args)
  }), [updateUserRole]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useGetMemberTasksQuery = (organizationId: number | null, userId: number | null) => {
  const [data, setData] = useState<{
    totalCount: number;
    activeCycleTasks: any[];
    upcomingCycleTasks: any[];
    noCycleTasks: any[];
    otherTasks: any[];
    allTasks: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberTasks = useCallback(async () => {
    if (!organizationId || !userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const result = await apiService.getMemberTasks(organizationId, userId);
      setData(result);
      return result;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch member tasks');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, userId]);

  useEffect(() => {
    if (organizationId && userId) {
      fetchMemberTasks();
    }
  }, [organizationId, userId, fetchMemberTasks]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchMemberTasks,
  };
};

export const useRemoveOrganizationMemberMutation = () => {
  const removeOrganizationMember = useCallback(async (data: { organizationId: number; userId: number; unassignTasks?: boolean }) => {
    const loadingToast = toast.loading(data.unassignTasks ? 'Removing member and unassigning tasks...' : 'Removing member...');
    
    try {
      const result = await apiService.removeOrganizationMember(data.organizationId, data.userId, data.unassignTasks);
      toast.success('Member removed successfully!', { id: loadingToast });
      
      // Dispatch event to trigger refetch of users list
      window.dispatchEvent(new CustomEvent('organizationMemberRemoved', { 
        detail: { userId: data.userId, organizationId: data.organizationId } 
      }));
      
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove member', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { organizationId: number; userId: number; unassignTasks?: boolean }) => ({
    unwrap: () => removeOrganizationMember(args)
  }), [removeOrganizationMember]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// Search hooks
export const useSearchQuery = (query: string, options: { skip?: boolean; debounceMs?: number } = {}) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { debounceMs = 300 } = options;
  
  const search = useCallback(async (searchQuery?: string) => {
    const queryToUse = searchQuery || query;
    if (!queryToUse.trim() || options.skip) {
      setSearchResults(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiService.search(queryToUse);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search:', error);
      setError(error instanceof Error ? error.message : 'Failed to search');
    } finally {
      setIsLoading(false);
    }
  }, [query, options.skip]);

  useEffect(() => {
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // Search whenever query changes (if not skipped and query is valid)
    if (!options.skip && query.trim() && query.length >= 3) {
      debounceRef.current = setTimeout(() => {
        search();
      }, debounceMs);
    } else if (options.skip || !query.trim()) {
      setSearchResults(null);
      setError(null);
    }

    // Cleanup debounce on unmount or query change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, options.skip, debounceMs, search]);

  return {
    data: searchResults,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
  };
};

export const useAdvancedSearchQuery = (params: any, options: { skip?: boolean; debounceMs?: number } = {}) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  const skipRef = useRef(options.skip);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { debounceMs = 300 } = options;
  
  const search = useCallback(async () => {
    if (skipRef.current || !paramsRef.current) {
      setSearchResults(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiService.advancedSearch(paramsRef.current);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to advanced search:', error);
      setError(error instanceof Error ? error.message : 'Failed to advanced search');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Update refs
    paramsRef.current = params;
    skipRef.current = options.skip;
    
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Search whenever params change (if not skipped and params are valid)
    if (!options.skip && params && Object.keys(params).length > 0) {
      debounceRef.current = setTimeout(() => {
        search();
      }, debounceMs);
    } else if (options.skip || !params || Object.keys(params).length === 0) {
      setSearchResults(null);
      setError(null);
    }

    // Cleanup debounce on unmount or params change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [JSON.stringify(params), options.skip, debounceMs, search]);

  return {
    data: searchResults,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
  };
};

export const useGetSearchSuggestionsQuery = (params: { query: string; type?: string }, options: { skip?: boolean; refetchOnMountOrArgChange?: boolean; debounceMs?: number } = {}) => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  const skipRef = useRef(options.skip);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { debounceMs = 150 } = options; // Shorter debounce for suggestions (more responsive)
  
  const fetchSuggestions = useCallback(async () => {
    if (!paramsRef.current.query.trim() || skipRef.current) {
      setSuggestions(null);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiService.getSearchSuggestions(paramsRef.current.query, paramsRef.current.type);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Update refs
    paramsRef.current = params;
    skipRef.current = options.skip;
    
    // Clear any pending debounced fetch
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Fetch whenever params change (if not skipped and query is valid)
    if (!options.skip && params.query.trim()) {
      debounceRef.current = setTimeout(() => {
        fetchSuggestions();
      }, debounceMs);
    } else if (options.skip || !params.query.trim()) {
      setSuggestions(null);
      setError(null);
    }

    // Cleanup debounce on unmount or params change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [params.query, params.type, options.skip, debounceMs, fetchSuggestions]);

  return {
    data: suggestions,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: fetchSuggestions,
  };
};

// ==================== HYBRID SEMANTIC SEARCH HOOK ====================

const searchCache = new SearchCache();

export interface UseHybridSearchOptions {
  skip?: boolean;
  debounceMs?: number;
  /** Fallback to client-side search if server fails */
  enableClientFallback?: boolean;
  /** Tasks for client-side fallback */
  fallbackTasks?: Task[];
  /** Enable real-time index updates */
  enableRealtimeUpdates?: boolean;
}

/**
 * Hook for hybrid semantic search combining AI embeddings with keyword matching
 * 
 * Features:
 * - Semantic similarity matching using vector embeddings
 * - Keyword relevance scoring for exact matches
 * - Combined hybrid ranking for best results
 * - Client-side fallback when server is unavailable
 * - Real-time index updates via WebSocket
 * - Intelligent caching for performance
 * 
 * @example
 * ```tsx
 * const { data, isLoading } = useHybridSearchQuery(
 *   { query: 'login bug', limit: 10 },
 *   { enableClientFallback: true, fallbackTasks: allTasks }
 * );
 * ```
 */
export const useHybridSearchQuery = (
  params: HybridSearchParams,
  options: UseHybridSearchOptions = {}
) => {
  const [searchResults, setSearchResults] = useState<HybridSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  const skipRef = useRef(options.skip);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  
  const { 
    debounceMs = 200, // Faster for semantic search
    enableClientFallback = true,
    fallbackTasks = [],
    enableRealtimeUpdates = false
  } = options;
  
  // Generate cache key from params
  const cacheKey = useMemo(() => {
    return `hybrid:${JSON.stringify(params)}`;
  }, [params]);

  const search = useCallback(async () => {
    if (skipRef.current || !paramsRef.current.query.trim()) {
      setSearchResults(null);
      return;
    }

    // Check cache first
    const cached = searchCache.get(cacheKey);
    if (cached) {
      setSearchResults(cached);
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const startTime = performance.now();
      const results = await apiService.hybridSemanticSearch(paramsRef.current);
      const searchTimeMs = performance.now() - startTime;
      
      // Enhance results with timing
      const enhancedResults: HybridSearchResponse = {
        ...results,
        searchTimeMs: results.searchTimeMs || searchTimeMs,
        fromCache: false,
      };
      
      // Cache results
      searchCache.set(cacheKey, enhancedResults);
      
      setSearchResults(enhancedResults);
    } catch (err) {
      console.error('Hybrid semantic search failed:', err);
      
      // Client-side fallback
      if (enableClientFallback && fallbackTasks.length > 0) {
        const startTime = performance.now();
        const clientResults = performClientHybridSearch(
          paramsRef.current.query,
          fallbackTasks,
          {
            semanticWeight: paramsRef.current.semanticWeight,
            semanticThreshold: paramsRef.current.semanticThreshold,
            limit: paramsRef.current.limit,
          }
        );
        
        const fallbackResponse: HybridSearchResponse = {
          results: clientResults,
          totalCount: clientResults.length,
          usedSemanticSearch: false,
          embeddingTimeMs: 0,
          searchTimeMs: performance.now() - startTime,
          fromCache: false,
        };
        
        setSearchResults(fallbackResponse);
      } else {
        setError(err instanceof Error ? err.message : 'Search failed');
        setSearchResults(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [cacheKey, enableClientFallback, fallbackTasks]);

  // Handle real-time index updates
  useEffect(() => {
    if (!enableRealtimeUpdates) return;
    
    // Subscribe to index updates
    unsubscribeRef.current = apiService.subscribeToIndexUpdates((event: IndexUpdateEvent) => {
      // Invalidate relevant cache entries
      if (event.entityType === 'task') {
        searchCache.invalidate(/task/);
      }
    });
    
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [enableRealtimeUpdates]);

  useEffect(() => {
    // Update refs
    paramsRef.current = params;
    skipRef.current = options.skip;
    
    // Clear any pending debounced search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    
    // Search whenever params change (if not skipped and query is valid)
    if (!options.skip && params.query.trim() && params.query.length >= 3) {
      debounceRef.current = setTimeout(() => {
        search();
      }, debounceMs);
    } else if (options.skip || !params.query.trim()) {
      setSearchResults(null);
      setError(null);
    }

    // Cleanup debounce on unmount or params change
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [
    params.query,
    params.limit,
    params.semanticThreshold,
    params.semanticWeight,
    params.projectId,
    params.status,
    params.priority,
    options.skip,
    debounceMs,
    search
  ]);

  // Extract tasks from results for convenience
  const tasks = useMemo(() => {
    return searchResults?.results.map(r => r.task) || [];
  }, [searchResults]);

  // Calculate if semantic search was actually used
  const usedSemantic = useMemo(() => {
    return searchResults?.usedSemanticSearch || false;
  }, [searchResults]);

  // Get performance metrics
  const performanceMetrics = useMemo(() => {
    return {
      embeddingTimeMs: searchResults?.embeddingTimeMs || 0,
      searchTimeMs: searchResults?.searchTimeMs || 0,
      fromCache: searchResults?.fromCache || false,
      totalTimeMs: (searchResults?.embeddingTimeMs || 0) + (searchResults?.searchTimeMs || 0),
    };
  }, [searchResults]);

  return {
    data: searchResults,
    tasks,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
    usedSemantic,
    performanceMetrics,
    suggestions: searchResults?.suggestions,
  };
};

// Attachments hooks
export const useGetTaskAttachmentsQuery = (taskId: number) => {
  const { taskAttachments, setTaskAttachments } = useApiStore();
  const attachments = taskAttachments[taskId.toString()] || { data: null, isLoading: false, error: null };
  const hasFetchedRef = useRef(false);
  const taskIdRef = useRef(taskId);
  
  const fetchAttachments = useCallback(async () => {
    if (!taskIdRef.current) return;
    
    try {
      setTaskAttachments(taskIdRef.current.toString(), [], true);
      const attachmentsData = await apiService.getTaskAttachments(taskIdRef.current);
      setTaskAttachments(taskIdRef.current.toString(), attachmentsData);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      setTaskAttachments(taskIdRef.current.toString(), [], false, error instanceof Error ? error.message : 'Failed to fetch attachments');
    }
  }, [setTaskAttachments]);

  useEffect(() => {
    // Reset fetch flag when taskId changes
    if (taskIdRef.current !== taskId) {
      hasFetchedRef.current = false;
    }
    
    // Update refs
    taskIdRef.current = taskId;
    
    // Only fetch once on mount unless taskId changes
    if (!hasFetchedRef.current && taskId) {
      hasFetchedRef.current = true;
      fetchAttachments();
    }
  }, [taskId, fetchAttachments]);

  return {
    data: attachments.data,
    isLoading: attachments.isLoading,
    error: attachments.error ? new Error(attachments.error) : null,
    refetch: fetchAttachments,
  };
};

export const useUploadAttachmentMutation = () => {
  const { taskAttachments, setTaskAttachments } = useApiStore();
  const { currentUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const uploadAttachment = useCallback(async (
    { taskId, formData }: { taskId: number; formData: FormData },
    onProgress?: (progress: number) => void
  ) => {
    const taskIdStr = taskId.toString();
    const currentAttachments = taskAttachments[taskIdStr]?.data || [];

    // Get file info from FormData for optimistic update
    const file = formData.get('file') as File;
    const optimisticAttachment = {
      id: Date.now(), // Temporary ID
      fileURL: '', // Will be updated from server
      fileName: file?.name || 'Uploading...',
      taskId,
      uploadedById: currentUser?.userId || 0,
      uploadedBy: {
        userId: currentUser?.userId || 0,
        username: currentUser?.username || 'You',
        email: currentUser?.email || '',
      },
      _isOptimistic: true, // Flag for UI styling
    };

    // Optimistically add attachment to the list
    setTaskAttachments(taskIdStr, [...currentAttachments, optimisticAttachment]);
    setIsLoading(true);

    try {
      let newAttachment: Attachment;

      if (onProgress) {
        // Use XMLHttpRequest for progress tracking
        newAttachment = await apiService.uploadAttachmentWithProgress(
          taskId,
          formData,
          onProgress
        );
      } else {
        // Use regular fetch (no progress)
        newAttachment = await apiService.uploadAttachment(taskId, formData);
      }

      // Replace optimistic attachment with real attachment from server
      const updatedAttachments = currentAttachments.filter(a => a.id !== optimisticAttachment.id);
      setTaskAttachments(taskIdStr, [...updatedAttachments, newAttachment]);

      return newAttachment;
    } catch (error) {
      // Rollback on error
      setTaskAttachments(taskIdStr, currentAttachments);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [taskAttachments, setTaskAttachments, currentUser]);

  const mutationWrapper = useCallback((args: { taskId: number; formData: FormData }, onProgress?: (progress: number) => void): { unwrap: () => Promise<Attachment>; abort?: () => void } => ({
    unwrap: () => uploadAttachment(args, onProgress)
  }), [uploadAttachment]);

  return [mutationWrapper, { isLoading }] as const;
};

export const useDeleteAttachmentMutation = () => {
  const { taskAttachments, setTaskAttachments } = useApiStore();

  const deleteAttachment = useCallback(async ({ attachmentId, userId, taskId }: { attachmentId: number; userId: number; taskId: number }) => {
    const taskIdStr = taskId.toString();
    const currentAttachments = taskAttachments[taskIdStr]?.data || [];

    // Optimistically remove the attachment
    const optimisticAttachments = currentAttachments.filter(a => a.id !== attachmentId);
    setTaskAttachments(taskIdStr, optimisticAttachments);

    try {
      const result = await apiService.deleteAttachment(attachmentId, userId);
      return result;
    } catch (error) {
      // Rollback on error
      setTaskAttachments(taskIdStr, currentAttachments);
      throw error;
    }
  }, [taskAttachments, setTaskAttachments]);

  const mutationWrapper = useCallback((args: { attachmentId: number; userId: number; taskId: number }): { unwrap: () => Promise<{ message: string }> } => ({
    unwrap: () => deleteAttachment(args)
  }), [deleteAttachment]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// Comment mutations
export const useUpdateCommentMutation = () => {
  const { taskComments, setTaskComments } = useApiStore();

  const updateComment = useCallback(async ({ commentId, text, userId, taskId }: { commentId: number; text: string; userId: number; taskId: number }) => {
    const taskIdStr = taskId.toString();
    const currentComments = taskComments[taskIdStr]?.data || [];
    const originalComment = currentComments.find(c => c.id === commentId);

    // Optimistically update the comment
    const optimisticComments = currentComments.map(c =>
      c.id === commentId ? { ...c, text, updatedAt: new Date().toISOString() } : c
    );
    setTaskComments(taskIdStr, optimisticComments);

    try {
      const updatedComment = await apiService.updateComment(commentId, text, userId);

      // Update with real comment from server
      const finalComments = currentComments.map(c =>
        c.id === commentId ? updatedComment : c
      );
      setTaskComments(taskIdStr, finalComments);

      return updatedComment;
    } catch (error) {
      // Rollback on error
      if (originalComment) {
        setTaskComments(taskIdStr, currentComments);
      }
      throw error;
    }
  }, [taskComments, setTaskComments]);

  const mutationWrapper = useCallback((args: { commentId: number; text: string; userId: number; taskId: number }) => ({
    unwrap: () => updateComment(args)
  }), [updateComment]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useDeleteCommentMutation = () => {
  const { taskComments, setTaskComments } = useApiStore();

  const deleteComment = useCallback(async ({ commentId, userId, taskId }: { commentId: number; userId: number; taskId: number }) => {
    const taskIdStr = taskId.toString();
    const currentComments = taskComments[taskIdStr]?.data || [];

    // Optimistically remove the comment
    const optimisticComments = currentComments.filter(c => c.id !== commentId);
    setTaskComments(taskIdStr, optimisticComments);

    try {
      const result = await apiService.deleteComment(commentId, userId);
      return result;
    } catch (error) {
      // Rollback on error
      setTaskComments(taskIdStr, currentComments);
      throw error;
    }
  }, [taskComments, setTaskComments]);

  const mutationWrapper = useCallback((args: { commentId: number; userId: number; taskId: number }) => ({
    unwrap: () => deleteComment(args)
  }), [deleteComment]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// Task Status hooks
export const useGetProjectStatusesQuery = (projectId: number, options: { skip?: boolean } = {}) => {
  const [statuses, setStatuses] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setStatusError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false);
  const projectIdRef = useRef(projectId);
  const skipRef = useRef(options.skip);

  const fetchStatuses = useCallback(async () => {
    if (skipRef.current || !projectIdRef.current) return;

    try {
      setIsLoading(true);
      setStatusError(null);
      const statusesData = await apiService.getProjectStatuses(projectIdRef.current);
      setStatuses(statusesData);
      return statusesData;
    } catch (error) {
      console.error('Failed to fetch statuses:', error);
      setStatusError(error instanceof Error ? error.message : 'Failed to fetch statuses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    projectIdRef.current = projectId;
    skipRef.current = options.skip;

    if (!options.skip && projectId) {
      hasFetchedRef.current = true;
      fetchStatuses();
    }
  }, [projectId, options.skip, fetchStatuses]);

  return {
    data: statuses,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: fetchStatuses,
  };
};

export const useCreateStatusMutation = () => {
  const createStatus = useCallback(async ({ projectId, name, color }: { projectId: number; name: string; color?: string }) => {
    const loadingToast = toast.loading('Creating status...');

    try {
      const result = await apiService.createStatus(projectId, { name, color });
      toast.success('Status created successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create status', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { projectId: number; name: string; color?: string }) => ({
    unwrap: () => createStatus(args)
  }), [createStatus]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUpdateStatusMutation = () => {
  const updateStatus = useCallback(async ({ projectId, statusId, name, color }: { projectId: number; statusId: number; name?: string; color?: string }) => {
    const loadingToast = toast.loading('Updating status...');

    try {
      const result = await apiService.updateStatus(projectId, statusId, { name, color });
      toast.success('Status updated successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { projectId: number; statusId: number; name?: string; color?: string }) => ({
    unwrap: () => updateStatus(args)
  }), [updateStatus]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useDeleteStatusMutation = () => {
  const deleteStatus = useCallback(async ({ projectId, statusId, moveTasksTo }: { projectId: number; statusId: number; moveTasksTo?: string }) => {
    const loadingToast = toast.loading('Deleting status...');

    try {
      const result = await apiService.deleteStatus(projectId, statusId, moveTasksTo);
      toast.success(`Status deleted! ${result.tasksMovedCount > 0 ? `${result.tasksMovedCount} tasks moved.` : ''}`, { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete status', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { projectId: number; statusId: number; moveTasksTo?: string }) => ({
    unwrap: () => deleteStatus(args)
  }), [deleteStatus]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useReorderStatusesMutation = () => {
  const reorderStatuses = useCallback(async ({ projectId, statusIds }: { projectId: number; statusIds: number[] }) => {
    const loadingToast = toast.loading('Reordering statuses...');

    try {
      const result = await apiService.reorderStatuses(projectId, statusIds);
      toast.success('Statuses reordered successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Failed to reorder statuses', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { projectId: number; statusIds: number[] }) => ({
    unwrap: () => reorderStatuses(args)
  }), [reorderStatuses]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// ==================== SAVED VIEWS HOOKS ====================

export const useGetProjectViewsQuery = (projectId: number | undefined, options: { skip?: boolean } = {}) => {
  const [views, setViews] = useState<SavedView[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchViews = useCallback(async () => {
    if (!projectId || options.skip) return;

    try {
      setIsLoading(true);
      const data = await apiService.getProjectViews(projectId);
      setViews(data);
      setError(null);
    } catch (err) {
      // During auth/session hydration, this endpoint can briefly return 401.
      // Treat it as empty state and avoid noisy console errors/user disruption.
      if (err instanceof Error && err.message === 'Authentication required') {
        setViews([]);
        setError(null);
        return;
      }
      console.error('Failed to fetch saved views:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch saved views'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId, options.skip]);

  useEffect(() => {
    fetchViews();
  }, [fetchViews]);

  return {
    data: views,
    isLoading,
    error,
    refetch: fetchViews,
  };
};

export const useCreateViewMutation = () => {
  const createView = useCallback(async ({ projectId, name, filters, isDefault, isShared }: {
    projectId: number;
    name: string;
    filters: SavedView['filters'];
    isDefault?: boolean;
    isShared?: boolean;
  }) => {
    return apiService.createView(projectId, { name, filters, isDefault, isShared });
  }, []);

  return [createView, { isLoading: false }] as const;
};

export const useUpdateViewMutation = () => {
  const updateView = useCallback(async ({ viewId, data }: {
    viewId: number;
    data: Partial<{
      name: string;
      filters: SavedView['filters'];
      isDefault: boolean;
      isShared: boolean;
    }>;
  }) => {
    return apiService.updateView(viewId, data);
  }, []);

  return [updateView, { isLoading: false }] as const;
};

export const useDeleteViewMutation = () => {
  const deleteView = useCallback(async (viewId: number) => {
    return apiService.deleteView(viewId);
  }, []);

  return [deleteView, { isLoading: false }] as const;
};

export const useSetDefaultViewMutation = () => {
  const setDefaultView = useCallback(async (viewId: number) => {
    return apiService.setDefaultView(viewId);
  }, []);

  return [setDefaultView, { isLoading: false }] as const;
};

// ==================== GOAL HOOKS ====================

export const useGetGoalsQuery = (
  params: { organizationId: number; projectId?: number; status?: string } | undefined,
  options: { skip?: boolean } = {}
) => {
  const [goals, setGoals] = useState<import('@/services/apiService').Goal[]>([]);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.skip || !params?.organizationId) {
      setIsLoading(false);
      return;
    }

    const fetchGoals = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getGoals(params.organizationId, {
          projectId: params.projectId,
          status: params.status,
        });
        setGoals(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch goals'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [params?.organizationId, params?.projectId, params?.status, options.skip]);

  return { data: goals, isLoading, error };
};

export const useGetGoalTemplatesQuery = (
  params: { organizationId?: number; category?: string } | undefined,
  options: { skip?: boolean } = {}
) => {
  const [templates, setTemplates] = useState<import('@/services/apiService').GoalTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (options.skip) {
      setIsLoading(false);
      return;
    }

    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await apiService.getGoalTemplates(params?.organizationId, params?.category);
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch templates'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, [params?.organizationId, params?.category, options.skip]);

  return { data: templates, isLoading, error };
};

export const useCreateGoalFromTemplateMutation = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createGoalFromTemplate = useCallback(async ({
    templateId,
    data,
  }: {
    templateId: number;
    data: {
      title?: string;
      organizationId: number;
      projectId?: number;
      customDescription?: string;
      customTargetDate?: string;
    };
  }) => {
    setIsLoading(true);
    try {
      const result = await apiService.createGoalFromTemplate(templateId, data);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => createGoalFromTemplate(args),
  }), [createGoalFromTemplate]);

  return [mutationWrapper, { isLoading }] as const;
};

export const useCreateGoalMutation = () => {
  const createGoal = useCallback(async (goal: Partial<import('@/services/apiService').Goal>) => {
    return apiService.createGoal(goal);
  }, []);

  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => createGoal(args),
  }), [createGoal]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUpdateGoalMutation = () => {
  const updateGoal = useCallback(async ({
    goalId,
    data,
  }: {
    goalId: number;
    data: Partial<import('@/services/apiService').Goal>;
  }) => {
    return apiService.updateGoal(goalId, data);
  }, []);

  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => updateGoal(args),
  }), [updateGoal]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useDeleteGoalMutation = () => {
  const deleteGoal = useCallback(async (goalId: number) => {
    return apiService.deleteGoal(goalId);
  }, []);

  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => deleteGoal(args),
  }), [deleteGoal]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// ==================== GIT LINKS HOOKS ====================

export const useGetTaskGitLinksQuery = (taskId: number | undefined, options: { skip?: boolean } = {}) => {
  const [gitLinks, setGitLinks] = useState<import('@/services/apiService').GitLink[]>([]);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchGitLinks = useCallback(async () => {
    if (!taskId || options.skip) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const result = await apiService.getTaskGitLinks(taskId);
      setGitLinks(result.data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch Git links'));
    } finally {
      setIsLoading(false);
    }
  }, [taskId, options.skip]);

  useEffect(() => {
    fetchGitLinks();
  }, [fetchGitLinks]);

  return {
    data: gitLinks,
    isLoading,
    error,
    refetch: fetchGitLinks,
  };
};

// ==================== TIME TRACKING HOOKS ====================

export const useGetActiveTimerQuery = (options: { skip?: boolean } = {}) => {
  const [activeTimer, setActiveTimer] = useState<import('@/services/apiService').ActiveTimer | null>(null);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchActiveTimer = useCallback(async () => {
    if (options.skip) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiService.getActiveTimer();
      setActiveTimer(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch active timer'));
    } finally {
      setIsLoading(false);
    }
  }, [options.skip]);

  useEffect(() => {
    fetchActiveTimer();
    
    // Poll every 30 seconds to check for running timer
    const interval = setInterval(fetchActiveTimer, 30000);
    return () => clearInterval(interval);
  }, [fetchActiveTimer]);

  return {
    data: activeTimer,
    isLoading,
    error,
    refetch: fetchActiveTimer,
  };
};

export const useGetTimeLogsQuery = (taskId: number | undefined, options: { skip?: boolean } = {}) => {
  const [timeLogs, setTimeLogs] = useState<import('@/services/apiService').TimeLogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeLogs = useCallback(async () => {
    if (!taskId || options.skip) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiService.getTimeLogs(taskId);
      setTimeLogs(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch time logs'));
    } finally {
      setIsLoading(false);
    }
  }, [taskId, options.skip]);

  useEffect(() => {
    fetchTimeLogs();
  }, [fetchTimeLogs]);

  return {
    data: timeLogs,
    isLoading,
    error,
    refetch: fetchTimeLogs,
  };
};

export const useGetTimeEstimateQuery = (taskId: number | undefined, options: { skip?: boolean } = {}) => {
  const [timeEstimate, setTimeEstimate] = useState<import('@/services/apiService').TimeEstimate | null>(null);
  const [isLoading, setIsLoading] = useState(!options.skip);
  const [error, setError] = useState<Error | null>(null);

  const fetchTimeEstimate = useCallback(async () => {
    if (!taskId || options.skip) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await apiService.getTimeEstimate(taskId);
      setTimeEstimate(data.estimate);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch time estimate'));
    } finally {
      setIsLoading(false);
    }
  }, [taskId, options.skip]);

  useEffect(() => {
    fetchTimeEstimate();
  }, [fetchTimeEstimate]);

  return {
    data: timeEstimate,
    isLoading,
    error,
    refetch: fetchTimeEstimate,
  };
};

export const useStartTimerMutation = () => {
  const startTimer = useCallback(async ({ taskId, description }: { taskId: number; description?: string }) => {
    const loadingToast = toast.loading('Starting timer...');
    
    try {
      const result = await apiService.startTimer(taskId, description);
      toast.success('Timer started!', { id: loadingToast });
      return result;
    } catch (error: any) {
      if (error.message?.includes('already have a running timer')) {
        toast.error('You already have a timer running on another task', { id: loadingToast });
      } else {
        toast.error('Failed to start timer', { id: loadingToast });
      }
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { taskId: number; description?: string }) => ({
    unwrap: () => startTimer(args),
  }), [startTimer]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useStopTimerMutation = () => {
  const stopTimer = useCallback(async (logId: number) => {
    const loadingToast = toast.loading('Stopping timer...');
    
    try {
      const result = await apiService.stopTimer(logId);
      toast.success(`Timer stopped! Logged ${result.timeLog.durationFormatted}`, { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error('Failed to stop timer', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((logId: number) => ({
    unwrap: () => stopTimer(logId),
  }), [stopTimer]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useSetTimeEstimateMutation = () => {
  const setEstimate = useCallback(async ({ taskId, estimate }: { taskId: number; estimate: string }) => {
    const loadingToast = toast.loading('Setting time estimate...');
    
    try {
      const result = await apiService.setTimeEstimate(taskId, estimate);
      toast.success(`Time estimate set to ${result.estimate.estimatedFormatted}`, { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error('Failed to set time estimate', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { taskId: number; estimate: string }) => ({
    unwrap: () => setEstimate(args),
  }), [setEstimate]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useUpdateTimeLogMutation = () => {
  const updateTimeLog = useCallback(async ({ logId, description, durationMinutes }: { logId: number; description?: string; durationMinutes?: number }) => {
    const loadingToast = toast.loading('Updating time log...');
    
    try {
      const result = await apiService.updateTimeLog(logId, { description, durationMinutes });
      toast.success('Time log updated', { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error('Failed to update time log', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { logId: number; description?: string; durationMinutes?: number }) => ({
    unwrap: () => updateTimeLog(args),
  }), [updateTimeLog]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// Bulk Task Operations
export const useBulkUpdateTasksMutation = () => {
  const bulkUpdate = useCallback(async ({ taskIds, updates }: { taskIds: number[]; updates: Partial<Task> }) => {
    const loadingToast = toast.loading(`Updating ${taskIds.length} tasks...`);
    
    try {
      const result = await apiService.bulkUpdateTasks(taskIds, updates);
      toast.success(`${taskIds.length} tasks updated successfully`, { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error('Failed to update tasks', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { taskIds: number[]; updates: Partial<Task> }) => ({
    unwrap: () => bulkUpdate(args),
  }), [bulkUpdate]);

  return [mutationWrapper, { isLoading: false }] as const;
};

export const useBulkDeleteTasksMutation = () => {
  const bulkDelete = useCallback(async ({ taskIds }: { taskIds: number[] }) => {
    const loadingToast = toast.loading(`Deleting ${taskIds.length} tasks...`);
    
    try {
      const result = await apiService.bulkDeleteTasks(taskIds);
      toast.success(`${taskIds.length} tasks deleted successfully`, { id: loadingToast });
      return result;
    } catch (error: any) {
      toast.error('Failed to delete tasks', { id: loadingToast });
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: { taskIds: number[] }) => ({
    unwrap: () => bulkDelete(args),
  }), [bulkDelete]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// Duplicate Detection Hook
export const useCheckDuplicatesMutation = () => {
  const checkDuplicates = useCallback(async ({
    title,
    description,
    projectId,
    threshold,
    limit,
    checkDescription,
  }: {
    title: string;
    description?: string;
    projectId: number;
    threshold?: number;
    limit?: number;
    checkDescription?: boolean;
  }) => {
    try {
      const result = await apiService.checkDuplicates({
        title,
        description,
        projectId,
        threshold,
        limit,
        checkDescription,
      });
      return result;
    } catch (error: any) {
      toast.error('Failed to check for duplicates');
      throw error;
    }
  }, []);

  const mutationWrapper = useCallback((args: {
    title: string;
    description?: string;
    projectId: number;
    threshold?: number;
    limit?: number;
    checkDescription?: boolean;
  }) => ({
    unwrap: () => checkDuplicates(args),
  }), [checkDuplicates]);

  return [mutationWrapper, { isLoading: false }] as const;
};

// ==================== ADVANCED FILTER HOOKS ====================

import type { AdvancedTaskFilter, ApplyAdvancedFilterResponse, FilterMetadata } from '@/services/apiService';
import type { FilterPaginationOptions } from '@/services/advancedFilterApi';

export const useApplyAdvancedFilter = () => {
  const [data, setData] = useState<ApplyAdvancedFilterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const applyFilter = useCallback(async (filter: AdvancedTaskFilter, options?: FilterPaginationOptions) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.applyAdvancedFilter({ filter, options });
      setData(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to apply filter');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { applyFilter, data, isLoading, error };
};

export const useValidateAdvancedFilter = () => {
  const [data, setData] = useState<{ valid: boolean; error?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const validateFilter = useCallback(async (filter: AdvancedTaskFilter) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.validateAdvancedFilter(filter);
      setData(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to validate filter');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { validateFilter, data, isLoading, error };
};

export const useGetFilterMetadata = (options: { skip?: boolean } = {}) => {
  const [data, setData] = useState<{ success: boolean; metadata: FilterMetadata } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchMetadata = useCallback(async () => {
    if (options.skip) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.getFilterMetadata();
      setData(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch metadata');
      setError(errorObj);
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, [options.skip]);

  useEffect(() => {
    if (!hasFetchedRef.current && !options.skip) {
      hasFetchedRef.current = true;
      fetchMetadata();
    }
  }, [fetchMetadata, options.skip]);

  return { data, isLoading, error, refetch: fetchMetadata };
};

// ==================== VIEW SUBSCRIPTION HOOKS ====================

export const useSubscribeToView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const subscribe = useCallback(async (viewId: number, config?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.subscribeToView(viewId, config);
      toast.success('Subscribed to view successfully');
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to subscribe');
      setError(errorObj);
      toast.error('Failed to subscribe to view');
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { subscribe, isLoading, error };
};

export const useUnsubscribeFromView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const unsubscribe = useCallback(async (viewId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.unsubscribeFromView(viewId);
      toast.success('Unsubscribed from view successfully');
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to unsubscribe');
      setError(errorObj);
      toast.error('Failed to unsubscribe from view');
      throw errorObj;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { unsubscribe, isLoading, error };
};

export const useGetMySubscriptions = (options: { skip?: boolean } = {}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    if (options.skip) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.getMySubscriptions();
      setData(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch subscriptions');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [options.skip]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { data, isLoading, error, refetch: fetchSubscriptions };
};

export const useGetSubscriptionStatus = (viewId: number, options: { skip?: boolean } = {}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (options.skip || !viewId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await apiService.getSubscriptionStatus(viewId);
      setData(result);
      return result;
    } catch (err: any) {
      const errorObj = err instanceof Error ? err : new Error(err?.message || 'Failed to fetch subscription status');
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }, [viewId, options.skip]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { data, isLoading, error, refetch: fetchStatus };
};

// Export types and enums
export { Status, Priority, TaskType } from '@/services/apiService';
export type { Task, Project, User, Comment, Attachment, UserWithStats, TaskStatus, SavedView, Goal, GoalTemplate, SearchSuggestion, GitLink, AsanaLink, TimeLog, TimeEstimate, ActiveTimer, TimeLogsResponse, ProjectTimeReport, AdvancedTaskFilter } from '@/services/apiService';
export type { FilterPaginationOptions } from '@/services/advancedFilterApi';
export type { FilterMetadata as FilterMetadataResponse } from '@/services/apiService';

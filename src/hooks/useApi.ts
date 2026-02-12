import { useEffect, useCallback, useState, useRef } from 'react';
import { toast } from 'sonner';
import { useApiStore } from '@/stores/apiStore';
import { useUserStore } from '@/stores/userStore';
import { useRequestManager } from '@/stores/requestManager';
import { apiService, Status, Priority, Task, Project, User, Comment, Attachment } from '@/services/apiService';

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
  // Track organization ID for cache invalidation when workspace changes
  const [activeOrgId, setActiveOrgId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null
  );

  const fetchProjects = useCallback(async (filtersToUse = filters) => {
    if (options.skip) return;

    try {
      setLoading('projects', true);
      const projectsData = await apiService.getProjects(filtersToUse);
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('projects', error instanceof Error ? error.message : 'Failed to fetch projects');
      throw error;
    } finally {
      setLoading('projects', false);
    }
  }, [options.skip, setProjects, setLoading, setError]);

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
    if (!options.skip) {
      fetchProjects(filters);
    }
  }, [JSON.stringify(filters), options.skip, activeOrgId]);

  // Listen for project deletion events to force refetch
  useEffect(() => {
    const handleProjectDeleted = () => {
      if (!options.skip) {
        fetchProjects(filters);
      }
    };

    window.addEventListener('projectDeleted', handleProjectDeleted);
    return () => window.removeEventListener('projectDeleted', handleProjectDeleted);
  }, [filters, options.skip]);

  return {
    data: projects.data,
    isLoading: projects.isLoading,
    isError: !!projects.error,
    error: projects.error ? new Error(projects.error) : null,
    refetch: () => fetchProjects(filters),
  };
};

// Hook to replace useGetTasksByUserQuery
export const useGetTasksByUserQuery = (userId: number | null, options: { skip?: boolean } = {}) => {
  const { tasks, setTasks, setLoading, setError } = useApiStore();
  const userIdRef = useRef(userId);
  const skipRef = useRef(options.skip);
  // Track organization ID for cache invalidation when workspace changes
  const [activeOrgId, setActiveOrgId] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('activeOrganizationId') : null
  );

  const fetchTasks = useCallback(async () => {
    if (skipRef.current || userIdRef.current === null || userIdRef.current === undefined) {
      console.log('Skipping task fetch:', { skip: skipRef.current, userId: userIdRef.current });
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
      console.log('Fetching tasks for userId:', userIdRef.current);
      const tasksData = await apiService.getTasksByUser(userIdRef.current);
      setTasks(tasksData);
      return tasksData;
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('tasks', error instanceof Error ? error.message : 'Failed to fetch tasks');
      throw error;
    } finally {
      setLoading('tasks', false);
    }
  }, [setTasks, setLoading, setError]);

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
  const hasFetchedRef = useRef(false);
  const skipRef = useRef(options.skip);
  
  const fetchUsers = useCallback(async () => {
    if (skipRef.current) return;
    
    try {
      setLoading('users', true);
      const usersData = await apiService.getUsers();
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('users', error instanceof Error ? error.message : 'Failed to fetch users');
      throw error;
    } finally {
      setLoading('users', false);
    }
  }, [setUsers, setLoading, setError]);

  useEffect(() => {
    // Update refs
    skipRef.current = options.skip;
    
    // Only fetch once on mount unless skip changes
    if (!hasFetchedRef.current && !options.skip) {
      hasFetchedRef.current = true;
      fetchUsers();
    }
  }, [options.skip, fetchUsers]);

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
    if (!taskIdRef.current) return;
    
    try {
      setTaskComments(taskIdRef.current.toString(), [], true);
      const commentsData = await apiService.getTaskComments(taskIdRef.current);
      setTaskComments(taskIdRef.current.toString(), commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setTaskComments(taskIdRef.current.toString(), [], false, error instanceof Error ? error.message : 'Failed to fetch comments');
    }
  }, [setTaskComments]);

  useEffect(() => {
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
    try {
      const newTask = await apiService.createTask(taskData);
      
      // Optimistically add new task to the list
      if (tasks.data) {
        setTasks([...tasks.data, newTask]);
      }
      
      return newTask;
    } catch (error) {
      // No rollback needed since we didn't do optimistic update on error
      throw error;
    }
  }, [tasks.data, setTasks]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: any) => ({
    unwrap: () => createTask(args)
  }), [createTask]);

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
};

export const useUploadTaskDescriptionImageMutation = () => {
  const uploadImage = useCallback(({ formData }: { formData: FormData }) => {
    const promise = apiService.uploadTaskDescriptionImage(formData);
    return {
      unwrap: () => promise,
    };
  }, []);

  return [uploadImage, { isLoading: false }];
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
      console.log('⚡ Applying optimistic update');
      setProjects(optimisticProjects);
    }
    
    try {
      const result = await apiService.updateProject(projectId, project);
      console.log('✅ Server update successful:', result);
      
      // Update with server response data while preserving existing fields
      setTimeout(async () => {
        try {
          console.log('🔄 Fetching refreshed project data...');
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
            console.log('🔄 Updating projects list with refreshed data (preserving status)');
            setProjects(updatedProjects);
          }
        } catch (error) {
          console.error('❌ Failed to refresh project:', error);
        }
      }, 200);
      
      toast.success('Project updated successfully!', { id: loadingToast });
      return result;
    } catch (error: any) {
      console.error('❌ Server update failed:', error);
      // Revert optimistic update on error using stored original data
      if (projects.data && originalProject) {
        const revertedProjects = projects.data.map(p => 
          String(p.id) === String(projectId) ? originalProject : p
        );
        console.log('↩️ Reverting optimistic update');
        setProjects(revertedProjects);
      }
      toast.error('Failed to update project', { id: loadingToast });
      throw error;
    }
  }, [projects.data, setProjects, currentUser?.userId]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string | number; project: any }) => ({
    unwrap: () => updateProject(args)
  }), [updateProject]);

  return [mutationWrapper, { isLoading: false }];
};

//Hook for teams query
export const useGetTeamsQuery = (params: any = undefined, options: { skip?: boolean } = {}) => {
  const { teams, setTeams, setLoading, setError } = useApiStore();
  const hasFetchedRef = useRef(false);
  const skipRef = useRef(options.skip);
  
  const fetchTeams = useCallback(async () => {
    if (skipRef.current) return;
    
    try {
      setLoading('teams', true);
      const teamsData = await apiService.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setError('teams', error instanceof Error ? error.message : 'Failed to fetch teams');
    }
  }, [setTeams, setLoading, setError]);

  useEffect(() => {
    // Update refs
    skipRef.current = options.skip;
    
    // Only fetch once on mount unless skip changes
    if (!hasFetchedRef.current && !options.skip) {
      hasFetchedRef.current = true;
      fetchTeams();
    }
  }, [options.skip, fetchTeams]);

  return {
    data: teams.data,
    isLoading: teams.isLoading,
    isError: !!teams.error,
    error: teams.error ? new Error(teams.error) : null,
    refetch: fetchTeams,
  };
};

// Hook for tasks query by project
export const useGetTasksQuery = (params: { projectId: number }, options: { skip?: boolean } = {}) => {
  const { tasks, setTasks, setLoading, setError } = useApiStore();
  const prevProjectIdRef = useRef(params.projectId);
  const projectIdRef = useRef(params.projectId);
  const skipRef = useRef(options.skip);
  
  const fetchTasks = useCallback(async () => {
    if (skipRef.current || !projectIdRef.current) return;
    
    try {
      setLoading('tasks', true);
      console.log('🔄 Fetching tasks for projectId:', projectIdRef.current);
      const tasksData = await apiService.getTasks(projectIdRef.current);
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
    skipRef.current = options.skip;
    
    // Fetch on mount or when projectId changes
    if (!options.skip && params.projectId && (projectIdChanged || prevProjectIdRef.current === params.projectId)) {
      console.log('🚀 Project ID changed from', prevProjectIdRef.current, 'to', params.projectId, '- fetching tasks');
      prevProjectIdRef.current = params.projectId;
      fetchTasks();
    }
  }, [params.projectId, options.skip, fetchTasks]);

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
  const taskIdRef = useRef(taskId);
  const skipRef = useRef(options.skip);
  
  const fetchTask = useCallback(async () => {
    if (skipRef.current || !taskIdRef.current) return;
    
    try {
      setIsLoading(true);
      setTaskError(null);
      const taskData = await apiService.getTask(taskIdRef.current);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      setTaskError(error instanceof Error ? error.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Update refs
    taskIdRef.current = taskId;
    skipRef.current = options.skip;
    
    // Only fetch once on mount unless taskId or skip changes
    if (!hasFetchedRef.current && !options.skip && taskId) {
      hasFetchedRef.current = true;
      fetchTask();
    }
  }, [taskId, options.skip, fetchTask]);

  return {
    data: task,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: fetchTask,
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
};

export const useUploadCommentImageMutation = () => {
  const uploadCommentImage = useCallback(({ formData }: { formData: FormData }) => {
    const promise = apiService.uploadCommentImage(formData);
    return {
      unwrap: () => promise,
    };
  }, []);

  return [uploadCommentImage, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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
  }, [projects.data, setProjects, currentUser?.userId]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string; userId: number }) => ({
    unwrap: () => favoriteProject(args)
  }), [favoriteProject]);

  return [mutationWrapper, { isLoading: false }];
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
  }, [projects.data, setProjects, currentUser?.userId]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string; userId: number }) => ({
    unwrap: () => unfavoriteProject(args)
  }), [unfavoriteProject]);

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
};

export const useRemoveOrganizationMemberMutation = () => {
  const removeOrganizationMember = useCallback(async (data: { organizationId: number; userId: number }) => {
    const loadingToast = toast.loading('Removing member...');
    
    try {
      const result = await apiService.removeOrganizationMember(data.organizationId, data.userId);
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

  const mutationWrapper = useCallback((args: { organizationId: number; userId: number }) => ({
    unwrap: () => removeOrganizationMember(args)
  }), [removeOrganizationMember]);

  return [mutationWrapper, { isLoading: false }];
};

// Search hooks
export const useSearchQuery = (query: string, options: { skip?: boolean } = {}) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    // Search whenever query changes (if not skipped and query is valid)
    if (!options.skip && query.trim() && query.length >= 3) {
      search();
    } else if (options.skip || !query.trim()) {
      setSearchResults(null);
      setError(null);
    }
  }, [query, options.skip, search]);

  return {
    data: searchResults,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
  };
};

export const useAdvancedSearchQuery = (params: any, options: { skip?: boolean } = {}) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  const skipRef = useRef(options.skip);
  
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
    
    // Search whenever params change (if not skipped and params are valid)
    if (!options.skip && params && Object.keys(params).length > 0) {
      search();
    } else if (options.skip || !params || Object.keys(params).length === 0) {
      setSearchResults(null);
      setError(null);
    }
  }, [JSON.stringify(params), options.skip, search]);

  return {
    data: searchResults,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
  };
};

export const useGetSearchSuggestionsQuery = (params: { query: string; type?: string }, options: { skip?: boolean; refetchOnMountOrArgChange?: boolean } = {}) => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsRef = useRef(params);
  const skipRef = useRef(options.skip);
  
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
    
    // Fetch whenever params change (if not skipped and query is valid)
    if (!options.skip && params.query.trim()) {
      fetchSuggestions();
    } else if (options.skip || !params.query.trim()) {
      setSuggestions(null);
      setError(null);
    }
  }, [params.query, params.type, options.skip, fetchSuggestions]);

  return {
    data: suggestions,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: fetchSuggestions,
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

  const uploadAttachment = useCallback(async ({ taskId, formData }: { taskId: number; formData: FormData }) => {
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

    try {
      const newAttachment = await apiService.uploadAttachment(taskId, formData);

      // Replace optimistic attachment with real attachment from server
      const updatedAttachments = currentAttachments.filter(a => a.id !== optimisticAttachment.id);
      setTaskAttachments(taskIdStr, [...updatedAttachments, newAttachment]);

      return newAttachment;
    } catch (error) {
      // Rollback on error
      setTaskAttachments(taskIdStr, currentAttachments);
      throw error;
    }
  }, [taskAttachments, setTaskAttachments, currentUser]);

  const mutationWrapper = useCallback((args: { taskId: number; formData: FormData }) => ({
    unwrap: () => uploadAttachment(args)
  }), [uploadAttachment]);

  return [mutationWrapper, { isLoading: false }];
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

  const mutationWrapper = useCallback((args: { attachmentId: number; userId: number; taskId: number }) => ({
    unwrap: () => deleteAttachment(args)
  }), [deleteAttachment]);

  return [deleteAttachment, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
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

  return [mutationWrapper, { isLoading: false }];
};

// Export types and enums
export { Status, Priority, TaskType } from '@/services/apiService';
export type { Task, Project, User, Comment, Attachment, UserWithStats, TaskStatus } from '@/services/apiService';


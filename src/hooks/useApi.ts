import { useEffect, useCallback, useState } from 'react';
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
  
  const fetchUser = useCallback(async () => {
    if (options.skip || !userIdentifier) return;
    
    try {
      setLoading(true);
      const user = await apiService.getAuthUser(userIdentifier);
      setCurrentUser(user);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, [userIdentifier, options.skip, setCurrentUser, setLoading, setError]);

  useEffect(() => {
    setUserIdentifier(userIdentifier);
    fetchUser();
  }, [userIdentifier, fetchUser, setUserIdentifier]);

  return {
    data: currentUser,
    isLoading,
    error: error ? new Error(error) : null,
    refetch: fetchUser,
  };
};

// Hook to replace useGetProjectsQuery
export const useGetProjectsQuery = (filters: any = {}, options: { skip?: boolean } = {}) => {
  const { projects, setProjects, setLoading, setError, shouldRefetch, markFetched } = useApiStore();
  const { getOrCreateRequest } = useRequestManager();
  
  // Create a stable cache key based on filters
  const cacheKey = `projects_${JSON.stringify(filters)}`;
  
  const fetchProjects = useCallback(async () => {
    if (options.skip) return;
    
    // Check if we need to fetch based on cache
    if (!shouldRefetch(cacheKey)) {
      console.log('Using cached projects data');
      return projects.data;
    }
    
    // Use request manager to deduplicate calls
    return getOrCreateRequest(cacheKey, async () => {
      try {
        setLoading('projects', true);
        const projectsData = await apiService.getProjects(filters);
        setProjects(projectsData);
        markFetched(cacheKey);
        return projectsData;
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        setError('projects', error instanceof Error ? error.message : 'Failed to fetch projects');
        throw error;
      } finally {
        setLoading('projects', false);
      }
    });
  }, [cacheKey, filters, options.skip, shouldRefetch, getOrCreateRequest, setProjects, setLoading, setError, markFetched, projects.data]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    data: projects.data,
    isLoading: projects.isLoading,
    isError: !!projects.error,
    error: projects.error ? new Error(projects.error) : null,
    refetch: fetchProjects,
  };
};

// Hook to replace useGetTasksByUserQuery
export const useGetTasksByUserQuery = (userId: number | null, options: { skip?: boolean } = {}) => {
  const { tasks, setTasks, setLoading, setError } = useApiStore();
  const { getOrCreateRequest } = useRequestManager();
  
  const cacheKey = `tasks_user_${userId || 'none'}`;
  
  const fetchTasks = useCallback(async () => {
    if (options.skip || userId === null || userId === undefined) {
      console.log('Skipping task fetch:', { skip: options.skip, userId });
      return;
    }
    
    // Validate userId is a valid number
    if (isNaN(userId) || userId <= 0) {
      console.error('Invalid userId for task fetch:', userId);
      setError('tasks', 'Invalid user ID');
      return;
    }
    
    return getOrCreateRequest(cacheKey, async () => {
      try {
        setLoading('tasks', true);
        console.log('Fetching tasks for userId:', userId);
        const tasksData = await apiService.getTasksByUser(userId);
        setTasks(tasksData);
        return tasksData;
      } catch (error) {
        console.error('Failed to fetch tasks:', error);
        setError('tasks', error instanceof Error ? error.message : 'Failed to fetch tasks');
        throw error;
      } finally {
        setLoading('tasks', false);
      }
    });
  }, [cacheKey, userId, options.skip, getOrCreateRequest, setTasks, setLoading, setError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
  
  const cacheKey = 'users';
  
  const fetchUsers = useCallback(async () => {
    if (options.skip) return;
    
    return getOrCreateRequest(cacheKey, async () => {
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
    });
  }, [cacheKey, options.skip, getOrCreateRequest, setUsers, setLoading, setError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    data: users.data,
    isLoading: users.isLoading,
    isError: !!users.error,
    error: users.error ? new Error(users.error) : null,
    refetch: fetchUsers,
  };
};

// Hook to replace useGetTaskCommentsQuery
export const useGetTaskCommentsQuery = (taskId: number) => {
  const { taskComments, setTaskComments } = useApiStore();
  const comments = taskComments[taskId.toString()] || { data: null, isLoading: false, error: null };
  
  const fetchComments = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setTaskComments(taskId.toString(), [], true);
      const commentsData = await apiService.getTaskComments(taskId);
      setTaskComments(taskId.toString(), commentsData);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setTaskComments(taskId.toString(), [], false, error instanceof Error ? error.message : 'Failed to fetch comments');
    }
  }, [taskId, setTaskComments]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    data: comments.data,
    isLoading: comments.isLoading,
    error: comments.error ? new Error(comments.error) : null,
    refetch: fetchComments,
  };
};

// Mutation hooks
export const useCreateTaskMutation = () => {
  const createTask = useCallback((taskData: any) => {
    return createMutationResult(apiService.createTask(taskData));
  }, []);

  return [createTask, { isLoading: false }];
};

export const useCreateProjectMutation = () => {
  const createProject = useCallback((projectData: any) => {
    return createMutationResult(apiService.createProject(projectData));
  }, []);

  return [createProject, { isLoading: false }];
};

export const useUpdateTaskMutation = () => {
  const updateTask = useCallback(({ taskId, ...updates }: { taskId: number; [key: string]: any }) => {
    return createMutationResult(apiService.updateTask(taskId, updates));
  }, []);

  return [updateTask, { isLoading: false }];
};

export const useUpdateProjectMutation = () => {
  const updateProject = useCallback(({ projectId, ...updates }: { projectId: number; [key: string]: any }) => {
    return createMutationResult(apiService.updateProject(projectId, updates));
  }, []);

  return [updateProject, { isLoading: false }];
};

//Hook for teams query
export const useGetTeamsQuery = (params: any = undefined, options: { skip?: boolean } = {}) => {
  const { teams, setTeams, setLoading, setError } = useApiStore();
  
  const fetchTeams = useCallback(async () => {
    if (options.skip) return;
    
    try {
      setLoading('teams', true);
      const teamsData = await apiService.getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      setError('teams', error instanceof Error ? error.message : 'Failed to fetch teams');
    }
  }, [options.skip, setTeams, setLoading, setError]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

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
  
  const fetchTasks = useCallback(async () => {
    if (options.skip || !params.projectId) return;
    
    try {
      setLoading('tasks', true);
      const tasksData = await apiService.getTasks(params.projectId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setError('tasks', error instanceof Error ? error.message : 'Failed to fetch tasks');
    }
  }, [params.projectId, options.skip, setTasks, setLoading, setError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
  const { setLoading, setError } = useApiStore();
  const [task, setTask] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setTaskError] = useState<string | null>(null);
  
  const fetchTask = useCallback(async () => {
    if (options.skip || !taskId) return;
    
    try {
      setIsLoading(true);
      setTaskError(null);
      const taskData = await apiService.getTask(taskId);
      setTask(taskData);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      setTaskError(error instanceof Error ? error.message : 'Failed to fetch task');
    } finally {
      setIsLoading(false);
    }
  }, [taskId, options.skip]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

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
  const deleteTask = useCallback(async (taskId: number) => {
    try {
      const result = await apiService.deleteTask(taskId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [deleteTask, { isLoading: false }];
};

export const useUpdateTaskStatusMutation = () => {
  const updateTaskStatus = useCallback(async ({ taskId, status }: { taskId: number; status: string }) => {
    try {
      const result = await apiService.updateTaskStatus(taskId, status);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [updateTaskStatus, { isLoading: false }];
};

export const useCreateCommentMutation = () => {
  const createComment = useCallback(async ({ taskId, text, userId }: { taskId: number; text: string; userId: number }) => {
    try {
      const result = await apiService.createComment(taskId, text, userId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [createComment, { isLoading: false }];
};

export const useDeleteProjectMutation = () => {
  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const result = await apiService.deleteProject(projectId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [deleteProject, { isLoading: false }];
};

export const useFavoriteProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  
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
      // Don't invalidate cache - optimistic update is sufficient
      return result;
    } catch (error: any) {
      // Handle "already favorited" error - this means optimistic update was correct
      if (error?.message === 'Project already favorited') {
        // Keep the optimistic update, no need to invalidate cache
        return { message: 'Already favorited, state synced' };
      }
      
      // For other errors, revert optimistic update
      if (projects.data) {
        const revertedProjects = projects.data.map(project => 
          project.id === id ? { ...project, isFavorited: false } : project
        );
        setProjects(revertedProjects);
      }
      throw error;
    }
  }, [projects.data, setProjects]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string; userId: number }) => ({
    unwrap: () => favoriteProject(args)
  }), [favoriteProject]);

  return [mutationWrapper, { isLoading: false }];
};

export const useUnfavoriteProjectMutation = () => {
  const { projects, setProjects } = useApiStore();
  
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
      // Don't invalidate cache - optimistic update is sufficient
      return result;
    } catch (error: any) {
      // Handle "favorite not found" error - this means optimistic update was correct
      if (error?.message === 'Favorite not found') {
        // Keep the optimistic update, no need to invalidate cache
        return { message: 'Not favorited, state synced' };
      }
      
      // For other errors, revert optimistic update
      if (projects.data) {
        const revertedProjects = projects.data.map(project => 
          project.id === id ? { ...project, isFavorited: true } : project
        );
        setProjects(revertedProjects);
      }
      throw error;
    }
  }, [projects.data, setProjects]);

  // Return the function that returns a mutation object with unwrap method
  const mutationWrapper = useCallback((args: { id: string; userId: number }) => ({
    unwrap: () => unfavoriteProject(args)
  }), [unfavoriteProject]);

  return [mutationWrapper, { isLoading: false }];
};

export const useArchiveProjectMutation = () => {
  const archiveProject = useCallback(async (projectId: string) => {
    try {
      const result = await apiService.archiveProject(projectId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [archiveProject, { isLoading: false }];
};

export const useUnarchiveProjectMutation = () => {
  const unarchiveProject = useCallback(async (projectId: string) => {
    try {
      const result = await apiService.unarchiveProject(projectId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [unarchiveProject, { isLoading: false }];
};

// Hook for users with stats
export const useGetUsersWithStatsQuery = (params: any = undefined, options: { skip?: boolean } = {}) => {
  const [usersWithStats, setUsersWithStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsersWithStats = useCallback(async () => {
    if (options.skip) return;
    
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
  }, [options.skip]);

  useEffect(() => {
    fetchUsersWithStats();
  }, [fetchUsersWithStats]);

  return {
    data: usersWithStats,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: fetchUsersWithStats,
  };
};

// More mutation hooks
export const useInviteUserMutation = () => {
  const inviteUser = useCallback(({ email, teamId, role }: { email: string; teamId: number; role: string }) => {
    return createMutationResult(apiService.inviteUser(email, teamId, role));
  }, []);

  return [inviteUser, { isLoading: false }];
};

export const useUpdateUserRoleMutation = () => {
  const updateUserRole = useCallback((data: { userId: number; role: string }) => {
    return createMutationResult(apiService.updateUserRole(data.userId, data.role));
  }, []);

  return [updateUserRole, { isLoading: false }];
};

// Search hooks
export const useSearchQuery = (query: string) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const search = useCallback(async () => {
    if (!query.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiService.search(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search:', error);
      setError(error instanceof Error ? error.message : 'Failed to search');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    search();
  }, [search]);

  return {
    data: searchResults,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
  };
};

export const useAdvancedSearchQuery = (params: any) => {
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const search = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiService.advancedSearch(params);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to advanced search:', error);
      setError(error instanceof Error ? error.message : 'Failed to advanced search');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    search();
  }, [search]);

  return {
    data: searchResults,
    isLoading,
    isError: !!error,
    error: error ? new Error(error) : null,
    refetch: search,
  };
};

export const useGetSearchSuggestionsQuery = (params: { query: string; type?: string }) => {
  const [suggestions, setSuggestions] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSuggestions = useCallback(async () => {
    if (!params.query.trim()) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const results = await apiService.getSearchSuggestions(params.query, params.type);
      setSuggestions(results);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [params.query, params.type]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

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
  
  const fetchAttachments = useCallback(async () => {
    if (!taskId) return;
    
    try {
      setTaskAttachments(taskId.toString(), [], true);
      const attachmentsData = await apiService.getTaskAttachments(taskId);
      setTaskAttachments(taskId.toString(), attachmentsData);
    } catch (error) {
      console.error('Failed to fetch attachments:', error);
      setTaskAttachments(taskId.toString(), [], false, error instanceof Error ? error.message : 'Failed to fetch attachments');
    }
  }, [taskId, setTaskAttachments]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  return {
    data: attachments.data,
    isLoading: attachments.isLoading,
    error: attachments.error ? new Error(attachments.error) : null,
    refetch: fetchAttachments,
  };
};

export const useUploadAttachmentMutation = () => {
  const uploadAttachment = useCallback(async ({ taskId, formData }: { taskId: number; formData: FormData }) => {
    try {
      const result = await apiService.uploadAttachment(taskId, formData);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [uploadAttachment, { isLoading: false }];
};

export const useDeleteAttachmentMutation = () => {
  const deleteAttachment = useCallback(async ({ attachmentId, userId }: { attachmentId: number; userId: number }) => {
    try {
      const result = await apiService.deleteAttachment(attachmentId, userId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [deleteAttachment, { isLoading: false }];
};

// Comment mutations
export const useUpdateCommentMutation = () => {
  const updateComment = useCallback(async ({ commentId, text, userId }: { commentId: number; text: string; userId: number }) => {
    try {
      const result = await apiService.updateComment(commentId, text, userId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [updateComment, { isLoading: false }];
};

export const useDeleteCommentMutation = () => {
  const deleteComment = useCallback(async ({ commentId, userId }: { commentId: number; userId: number }) => {
    try {
      const result = await apiService.deleteComment(commentId, userId);
      return { unwrap: () => Promise.resolve(result) };
    } catch (error) {
      return { unwrap: () => Promise.reject(error) };
    }
  }, []);

  return [deleteComment, { isLoading: false }];
};

// Export types and enums
export { Status, Priority } from '@/services/apiService';
export type { Task, Project, User, Comment, Attachment };

